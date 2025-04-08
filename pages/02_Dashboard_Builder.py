import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import uuid
from datetime import datetime
import random
import json
import os
import sys

# Add utils to path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from utils.visualization import create_chart, get_chart_types, CHART_DESCRIPTIONS
from utils.data_processing import filter_dataframe

st.set_page_config(
    page_title="Dashboard Builder | PM Data Tool",
    page_icon="📊",
    layout="wide"
)

st.title("Dashboard Builder")
st.markdown("Create custom dashboards with drag-and-drop components.")

# Initialize dashboard session state
if "current_dashboard" not in st.session_state:
    st.session_state.current_dashboard = {
        "name": "",
        "description": "",
        "components": []
    }

if "edit_mode" not in st.session_state:
    st.session_state.edit_mode = False

if "component_counter" not in st.session_state:
    st.session_state.component_counter = 1

# Function to generate a unique component ID
def generate_component_id():
    return f"component_{str(uuid.uuid4())[:8]}"

# Function to load dashboard for editing
def load_dashboard_for_editing(dashboard_name):
    if dashboard_name in st.session_state.dashboards:
        st.session_state.current_dashboard = st.session_state.dashboards[dashboard_name].copy()
        st.session_state.edit_mode = True
        return True
    return False

# Dashboard management sidebar
with st.sidebar:
    st.header("Dashboard Management")
    
    # Dashboard actions
    dashboard_action = st.radio(
        "Action",
        ["Create New Dashboard", "Edit Existing Dashboard", "Delete Dashboard"]
    )
    
    if dashboard_action == "Create New Dashboard":
        st.session_state.edit_mode = False
        st.session_state.current_dashboard = {
            "name": "",
            "description": "",
            "components": []
        }
    
    elif dashboard_action == "Edit Existing Dashboard":
        if st.session_state.dashboards:
            dashboard_to_edit = st.selectbox(
                "Select Dashboard to Edit",
                list(st.session_state.dashboards.keys())
            )
            
            if st.button("Load Dashboard"):
                if load_dashboard_for_editing(dashboard_to_edit):
                    st.success(f"Loaded dashboard '{dashboard_to_edit}' for editing")
                else:
                    st.error("Failed to load dashboard")
        else:
            st.info("No dashboards available to edit. Create a new dashboard first.")
    
    elif dashboard_action == "Delete Dashboard":
        if st.session_state.dashboards:
            dashboard_to_delete = st.selectbox(
                "Select Dashboard to Delete",
                list(st.session_state.dashboards.keys())
            )
            
            if st.button("Delete Dashboard"):
                if dashboard_to_delete in st.session_state.dashboards:
                    del st.session_state.dashboards[dashboard_to_delete]
                    st.success(f"Dashboard '{dashboard_to_delete}' deleted successfully")
                    
                    # Reset current dashboard if the deleted one was being edited
                    if st.session_state.edit_mode and st.session_state.current_dashboard["name"] == dashboard_to_delete:
                        st.session_state.edit_mode = False
                        st.session_state.current_dashboard = {
                            "name": "",
                            "description": "",
                            "components": []
                        }
                    
                    st.rerun()
                else:
                    st.error("Failed to delete dashboard")
        else:
            st.info("No dashboards available to delete.")
    
    # Component builder section
    st.header("Add Components")
    
    component_type = st.selectbox(
        "Component Type",
        ["Chart", "Metric", "Data Table", "Text Block", "Filter"]
    )
    
    if component_type == "Chart":
        chart_type = st.selectbox(
            "Chart Type",
            get_chart_types(),
            format_func=lambda x: x.replace("_", " ").title()
        )
        
        # Show description of the selected chart type
        if chart_type in CHART_DESCRIPTIONS:
            st.info(CHART_DESCRIPTIONS[chart_type])
        
        if st.session_state.data_sources:
            data_source = st.selectbox(
                "Data Source",
                list(st.session_state.data_sources.keys())
            )
            
            # Get the data
            df = st.session_state.data_sources[data_source]["data"]
            
            # Get columns based on data types
            numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
            categorical_cols = df.select_dtypes(include=['object', 'category']).columns.tolist()
            date_cols = df.select_dtypes(include=['datetime', 'datetime64']).columns.tolist()
            
            # Add date columns that might be stored as strings
            for col in df.columns:
                if col not in date_cols and col not in numeric_cols and col not in categorical_cols:
                    if "date" in col.lower() or "time" in col.lower() or "day" in col.lower():
                        try:
                            pd.to_datetime(df[col])
                            date_cols.append(col)
                        except:
                            pass
            
            # Chart configuration based on chart type
            if chart_type == "bar":
                x_axis = st.selectbox("X-Axis", categorical_cols + date_cols)
                y_axis = st.selectbox("Y-Axis", numeric_cols)
                color = st.selectbox("Color (Optional)", ["None"] + categorical_cols)
                orientation = st.selectbox("Orientation", ["Vertical", "Horizontal"])
                
                chart_config = {
                    "type": chart_type,
                    "x_axis": x_axis,
                    "y_axis": y_axis,
                    "color": color if color != "None" else None,
                    "orientation": orientation.lower()
                }
            
            elif chart_type == "line":
                x_axis = st.selectbox("X-Axis", date_cols + numeric_cols)
                y_axis = st.selectbox("Y-Axis", numeric_cols)
                color = st.selectbox("Group By (Optional)", ["None"] + categorical_cols)
                
                chart_config = {
                    "type": chart_type,
                    "x_axis": x_axis,
                    "y_axis": y_axis,
                    "color": color if color != "None" else None
                }
            
            elif chart_type == "pie":
                names = st.selectbox("Names", categorical_cols)
                values = st.selectbox("Values", numeric_cols)
                
                chart_config = {
                    "type": chart_type,
                    "names": names,
                    "values": values
                }
            
            elif chart_type == "scatter":
                x_axis = st.selectbox("X-Axis", numeric_cols)
                y_axis = st.selectbox("Y-Axis", numeric_cols)
                color = st.selectbox("Color (Optional)", ["None"] + categorical_cols)
                size = st.selectbox("Size (Optional)", ["None"] + numeric_cols)
                
                chart_config = {
                    "type": chart_type,
                    "x_axis": x_axis,
                    "y_axis": y_axis,
                    "color": color if color != "None" else None,
                    "size": size if size != "None" else None
                }
            
            elif chart_type == "heatmap":
                x_axis = st.selectbox("X-Axis", categorical_cols + date_cols)
                y_axis = st.selectbox("Y-Axis", categorical_cols)
                values = st.selectbox("Values", numeric_cols)
                
                chart_config = {
                    "type": chart_type,
                    "x_axis": x_axis,
                    "y_axis": y_axis,
                    "values": values
                }
            
            elif chart_type == "area":
                x_axis = st.selectbox("X-Axis", date_cols + numeric_cols)
                y_axis = st.selectbox("Y-Axis", numeric_cols)
                color = st.selectbox("Group By (Optional)", ["None"] + categorical_cols)
                
                chart_config = {
                    "type": chart_type,
                    "x_axis": x_axis,
                    "y_axis": y_axis,
                    "color": color if color != "None" else None
                }
            
            elif chart_type == "histogram":
                x_axis = st.selectbox("Value", numeric_cols)
                nbins = st.slider("Number of Bins", 5, 100, 20)
                
                chart_config = {
                    "type": chart_type,
                    "x_axis": x_axis,
                    "nbins": nbins
                }
            
            elif chart_type == "box":
                x_axis = st.selectbox("X-Axis (Category)", ["None"] + categorical_cols)
                y_axis = st.selectbox("Y-Axis (Values)", numeric_cols)
                
                chart_config = {
                    "type": chart_type,
                    "x_axis": x_axis if x_axis != "None" else None,
                    "y_axis": y_axis
                }
            
            component_title = st.text_input("Component Title", f"Chart {st.session_state.component_counter}")
            
            if st.button("Add Chart Component"):
                component_id = generate_component_id()
                new_component = {
                    "id": component_id,
                    "type": "chart",
                    "title": component_title,
                    "data_source": data_source,
                    "chart_config": chart_config
                }
                
                st.session_state.current_dashboard["components"].append(new_component)
                st.session_state.component_counter += 1
                st.success(f"Added chart component: {component_title}")
        else:
            st.warning("No data sources available. Please import data first.")
    
    elif component_type == "Metric":
        if st.session_state.data_sources:
            data_source = st.selectbox(
                "Data Source",
                list(st.session_state.data_sources.keys())
            )
            
            # Get the data
            df = st.session_state.data_sources[data_source]["data"]
            
            # Get columns based on data types
            numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
            
            metric_column = st.selectbox("Metric Column", numeric_cols)
            
            metric_type = st.selectbox(
                "Metric Type",
                ["Sum", "Average", "Minimum", "Maximum", "Count", "Median"]
            )
            
            # Optional filter
            add_filter = st.checkbox("Add Filter")
            filter_column = None
            filter_value = None
            
            if add_filter:
                filter_column = st.selectbox("Filter Column", df.columns.tolist())
                
                # Get unique values from the filter column
                unique_values = df[filter_column].unique().tolist()
                filter_value = st.selectbox("Filter Value", unique_values)
            
            # Metric formatting options
            format_options = st.selectbox(
                "Format",
                ["None", "Number", "Percentage", "Currency", "Custom"]
            )
            
            format_config = {}
            if format_options == "Number":
                format_config["type"] = "number"
                format_config["decimals"] = st.number_input("Decimal Places", 0, 10, 2)
            elif format_options == "Percentage":
                format_config["type"] = "percentage"
                format_config["decimals"] = st.number_input("Decimal Places", 0, 10, 2)
            elif format_options == "Currency":
                format_config["type"] = "currency"
                format_config["currency"] = st.selectbox("Currency", ["USD", "EUR", "GBP", "JPY", "CAD", "AUD"])
                format_config["decimals"] = st.number_input("Decimal Places", 0, 10, 2)
            elif format_options == "Custom":
                format_config["type"] = "custom"
                format_config["format_string"] = st.text_input("Format String", "{:.2f}")
            else:
                format_config["type"] = "none"
            
            # Compare with previous period
            add_delta = st.checkbox("Compare with Previous Period")
            
            delta_config = {}
            if add_delta:
                date_cols = df.select_dtypes(include=['datetime', 'datetime64']).columns.tolist()
                
                # Add date columns that might be stored as strings
                for col in df.columns:
                    if col not in date_cols:
                        if "date" in col.lower() or "time" in col.lower() or "day" in col.lower():
                            try:
                                pd.to_datetime(df[col])
                                date_cols.append(col)
                            except:
                                pass
                
                if date_cols:
                    delta_config["date_column"] = st.selectbox("Date Column", date_cols)
                    delta_config["period"] = st.selectbox("Comparison Period", ["Day", "Week", "Month", "Year"])
                else:
                    st.warning("No date columns available for delta calculation")
                    add_delta = False
            
            component_title = st.text_input("Metric Label", f"Metric {st.session_state.component_counter}")
            
            if st.button("Add Metric Component"):
                component_id = generate_component_id()
                new_component = {
                    "id": component_id,
                    "type": "metric",
                    "title": component_title,
                    "data_source": data_source,
                    "metric_column": metric_column,
                    "metric_type": metric_type,
                    "format": format_config,
                    "filter": {
                        "column": filter_column,
                        "value": filter_value
                    } if add_filter else None,
                    "delta": delta_config if add_delta else None
                }
                
                st.session_state.current_dashboard["components"].append(new_component)
                st.session_state.component_counter += 1
                st.success(f"Added metric component: {component_title}")
        else:
            st.warning("No data sources available. Please import data first.")
    
    elif component_type == "Data Table":
        if st.session_state.data_sources:
            data_source = st.selectbox(
                "Data Source",
                list(st.session_state.data_sources.keys())
            )
            
            # Get the data
            df = st.session_state.data_sources[data_source]["data"]
            
            # Select columns to display
            all_columns = df.columns.tolist()
            selected_columns = st.multiselect("Columns to Display", all_columns, default=all_columns[:5] if len(all_columns) > 5 else all_columns)
            
            # Table options
            show_index = st.checkbox("Show Row Index", value=False)
            page_size = st.number_input("Rows Per Page", 5, 100, 10)
            width = st.selectbox("Table Width", ["Auto", "Full Width"])
            
            component_title = st.text_input("Table Title", f"Data Table {st.session_state.component_counter}")
            
            if st.button("Add Table Component"):
                component_id = generate_component_id()
                new_component = {
                    "id": component_id,
                    "type": "table",
                    "title": component_title,
                    "data_source": data_source,
                    "columns": selected_columns,
                    "show_index": show_index,
                    "page_size": page_size,
                    "width": width
                }
                
                st.session_state.current_dashboard["components"].append(new_component)
                st.session_state.component_counter += 1
                st.success(f"Added table component: {component_title}")
        else:
            st.warning("No data sources available. Please import data first.")
    
    elif component_type == "Text Block":
        text_type = st.selectbox(
            "Text Type",
            ["Header", "Subheader", "Paragraph", "Info Box", "Warning Box", "Success Box", "Error Box"]
        )
        
        text_content = st.text_area("Text Content", "Enter your text here...")
        
        if st.button("Add Text Component"):
            component_id = generate_component_id()
            new_component = {
                "id": component_id,
                "type": "text",
                "text_type": text_type,
                "content": text_content
            }
            
            st.session_state.current_dashboard["components"].append(new_component)
            st.session_state.component_counter += 1
            st.success(f"Added {text_type} component")
    
    elif component_type == "Filter":
        if st.session_state.data_sources:
            data_source = st.selectbox(
                "Data Source",
                list(st.session_state.data_sources.keys())
            )
            
            # Get the data
            df = st.session_state.data_sources[data_source]["data"]
            
            filter_type = st.selectbox(
                "Filter Type",
                ["Select Box", "Multi-Select", "Slider", "Date Range"]
            )
            
            filter_column = None
            
            if filter_type in ["Select Box", "Multi-Select"]:
                categorical_cols = df.select_dtypes(include=['object', 'category']).columns.tolist()
                filter_column = st.selectbox("Filter Column", categorical_cols)
            
            elif filter_type == "Slider":
                numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
                filter_column = st.selectbox("Filter Column", numeric_cols)
            
            elif filter_type == "Date Range":
                date_cols = df.select_dtypes(include=['datetime', 'datetime64']).columns.tolist()
                
                # Add date columns that might be stored as strings
                for col in df.columns:
                    if col not in date_cols:
                        if "date" in col.lower() or "time" in col.lower() or "day" in col.lower():
                            try:
                                pd.to_datetime(df[col])
                                date_cols.append(col)
                            except:
                                pass
                
                if date_cols:
                    filter_column = st.selectbox("Filter Column", date_cols)
                else:
                    st.warning("No date columns available for date range filter")
            
            component_title = st.text_input("Filter Label", f"Filter {st.session_state.component_counter}")
            
            if st.button("Add Filter Component"):
                component_id = generate_component_id()
                new_component = {
                    "id": component_id,
                    "type": "filter",
                    "title": component_title,
                    "data_source": data_source,
                    "filter_type": filter_type,
                    "filter_column": filter_column
                }
                
                st.session_state.current_dashboard["components"].append(new_component)
                st.session_state.component_counter += 1
                st.success(f"Added filter component: {component_title}")
        else:
            st.warning("No data sources available. Please import data first.")

# Main dashboard editor
st.header("Dashboard Editor")

# Dashboard settings
with st.expander("Dashboard Settings", expanded=True):
    dashboard_name = st.text_input(
        "Dashboard Name",
        value=st.session_state.current_dashboard["name"]
    )
    
    dashboard_description = st.text_area(
        "Dashboard Description",
        value=st.session_state.current_dashboard["description"]
    )
    
    dashboard_layout = st.selectbox(
        "Layout",
        ["1 Column", "2 Columns", "3 Columns"],
        index=1
    )

# Preview components and allow reordering/deletion
st.subheader("Dashboard Components")

if not st.session_state.current_dashboard["components"]:
    st.info("No components added yet. Use the sidebar to add components.")
else:
    # Display components based on layout
    if dashboard_layout == "1 Column":
        cols = [st.container()]
    elif dashboard_layout == "2 Columns":
        col1, col2 = st.columns(2)
        cols = [col1, col2]
    else:  # 3 Columns
        col1, col2, col3 = st.columns(3)
        cols = [col1, col2, col3]
    
    # Distribute components evenly across columns
    components = st.session_state.current_dashboard["components"]
    components_per_col = len(components) // len(cols) + (1 if len(components) % len(cols) > 0 else 0)
    
    component_indices_to_delete = []
    
    for i, component in enumerate(components):
        col_idx = min(i // components_per_col, len(cols) - 1)
        
        with cols[col_idx]:
            with st.expander(f"{component.get('title', 'Component')} (ID: {component['id']})", expanded=True):
                # Component preview
                if component["type"] == "chart" and "data_source" in component:
                    try:
                        data_source = component["data_source"]
                        df = st.session_state.data_sources[data_source]["data"]
                        
                        chart_fig = create_chart(df, component["chart_config"])
                        st.plotly_chart(chart_fig, use_container_width=True)
                    except Exception as e:
                        st.error(f"Error rendering chart: {str(e)}")
                
                elif component["type"] == "metric" and "data_source" in component:
                    try:
                        data_source = component["data_source"]
                        df = st.session_state.data_sources[data_source]["data"]
                        
                        # Apply filter if specified
                        if component.get("filter"):
                            filter_col = component["filter"]["column"]
                            filter_val = component["filter"]["value"]
                            if filter_col and filter_val is not None:
                                df = df[df[filter_col] == filter_val]
                        
                        # Calculate metric value
                        metric_col = component["metric_column"]
                        metric_type = component["metric_type"]
                        
                        if metric_type == "Sum":
                            value = df[metric_col].sum()
                        elif metric_type == "Average":
                            value = df[metric_col].mean()
                        elif metric_type == "Minimum":
                            value = df[metric_col].min()
                        elif metric_type == "Maximum":
                            value = df[metric_col].max()
                        elif metric_type == "Count":
                            value = df[metric_col].count()
                        elif metric_type == "Median":
                            value = df[metric_col].median()
                        
                        # Format the value
                        format_config = component.get("format", {"type": "none"})
                        
                        if format_config["type"] == "number":
                            formatted_value = f"{value:.{format_config.get('decimals', 2)}f}"
                        elif format_config["type"] == "percentage":
                            formatted_value = f"{value:.{format_config.get('decimals', 2)}f}%"
                        elif format_config["type"] == "currency":
                            currency_symbols = {
                                "USD": "$", "EUR": "€", "GBP": "£",
                                "JPY": "¥", "CAD": "C$", "AUD": "A$"
                            }
                            currency = format_config.get("currency", "USD")
                            symbol = currency_symbols.get(currency, "$")
                            formatted_value = f"{symbol}{value:.{format_config.get('decimals', 2)}f}"
                        elif format_config["type"] == "custom":
                            format_string = format_config.get("format_string", "{:.2f}")
                            formatted_value = format_string.format(value)
                        else:
                            formatted_value = str(value)
                        
                        # Calculate delta if specified
                        delta = None
                        delta_config = component.get("delta")
                        
                        if delta_config and "date_column" in delta_config:
                            date_col = delta_config["date_column"]
                            period = delta_config["period"].lower()
                            
                            # Convert to datetime if needed
                            if df[date_col].dtype != 'datetime64[ns]':
                                df[date_col] = pd.to_datetime(df[date_col])
                            
                            # Sort by date
                            df = df.sort_values(date_col)
                            
                            # Get the latest date
                            latest_date = df[date_col].max()
                            
                            # Calculate previous period range
                            if period == "day":
                                prev_end = latest_date - pd.Timedelta(days=1)
                                prev_start = prev_end - pd.Timedelta(days=1)
                            elif period == "week":
                                prev_end = latest_date - pd.Timedelta(weeks=1)
                                prev_start = prev_end - pd.Timedelta(weeks=1)
                            elif period == "month":
                                prev_end = latest_date - pd.Timedelta(days=30)
                                prev_start = prev_end - pd.Timedelta(days=30)
                            else:  # year
                                prev_end = latest_date - pd.Timedelta(days=365)
                                prev_start = prev_end - pd.Timedelta(days=365)
                            
                            # Filter current and previous period data
                            current_df = df[df[date_col] <= latest_date]
                            prev_df = df[(df[date_col] >= prev_start) & (df[date_col] <= prev_end)]
                            
                            # Calculate metric for previous period
                            if not prev_df.empty:
                                if metric_type == "Sum":
                                    prev_value = prev_df[metric_col].sum()
                                elif metric_type == "Average":
                                    prev_value = prev_df[metric_col].mean()
                                elif metric_type == "Minimum":
                                    prev_value = prev_df[metric_col].min()
                                elif metric_type == "Maximum":
                                    prev_value = prev_df[metric_col].max()
                                elif metric_type == "Count":
                                    prev_value = prev_df[metric_col].count()
                                elif metric_type == "Median":
                                    prev_value = prev_df[metric_col].median()
                                
                                # Calculate delta percentage
                                if prev_value != 0:
                                    delta = ((value - prev_value) / prev_value) * 100
                                    delta = f"{delta:.1f}%"
                                else:
                                    delta = "N/A"
                        
                        # Display the metric
                        st.metric(
                            label=component["title"],
                            value=formatted_value,
                            delta=delta
                        )
                    except Exception as e:
                        st.error(f"Error calculating metric: {str(e)}")
                
                elif component["type"] == "table" and "data_source" in component:
                    try:
                        data_source = component["data_source"]
                        df = st.session_state.data_sources[data_source]["data"]
                        
                        # Filter columns
                        if component.get("columns"):
                            df = df[component["columns"]]
                        
                        # Display table
                        st.dataframe(
                            df,
                            use_container_width=component.get("width") == "Full Width",
                            hide_index=not component.get("show_index", False)
                        )
                    except Exception as e:
                        st.error(f"Error displaying table: {str(e)}")
                
                elif component["type"] == "text":
                    text_type = component["text_type"]
                    content = component["content"]
                    
                    if text_type == "Header":
                        st.header(content)
                    elif text_type == "Subheader":
                        st.subheader(content)
                    elif text_type == "Paragraph":
                        st.write(content)
                    elif text_type == "Info Box":
                        st.info(content)
                    elif text_type == "Warning Box":
                        st.warning(content)
                    elif text_type == "Success Box":
                        st.success(content)
                    elif text_type == "Error Box":
                        st.error(content)
                
                elif component["type"] == "filter" and "data_source" in component:
                    try:
                        data_source = component["data_source"]
                        df = st.session_state.data_sources[data_source]["data"]
                        
                        filter_type = component["filter_type"]
                        filter_column = component["filter_column"]
                        
                        if filter_type == "Select Box":
                            options = ["All"] + sorted(df[filter_column].unique().tolist())
                            st.selectbox(component["title"], options, key=f"filter_{component['id']}")
                        
                        elif filter_type == "Multi-Select":
                            options = sorted(df[filter_column].unique().tolist())
                            st.multiselect(component["title"], options, key=f"filter_{component['id']}")
                        
                        elif filter_type == "Slider":
                            min_val = float(df[filter_column].min())
                            max_val = float(df[filter_column].max())
                            st.slider(component["title"], min_val, max_val, (min_val, max_val), key=f"filter_{component['id']}")
                        
                        elif filter_type == "Date Range":
                            # Convert to datetime if needed
                            if df[filter_column].dtype != 'datetime64[ns]':
                                df[filter_column] = pd.to_datetime(df[filter_column])
                            
                            min_date = df[filter_column].min().date()
                            max_date = df[filter_column].max().date()
                            st.date_input(component["title"], (min_date, max_date), key=f"filter_{component['id']}")
                    except Exception as e:
                        st.error(f"Error rendering filter: {str(e)}")
                
                # Component actions
                col1_actions, col2_actions = st.columns(2)
                
                with col1_actions:
                    # Move component up/down
                    if i > 0 and st.button("Move Up", key=f"up_{component['id']}"):
                        components[i], components[i-1] = components[i-1], components[i]
                        st.rerun()
                    
                    if i < len(components) - 1 and st.button("Move Down", key=f"down_{component['id']}"):
                        components[i], components[i+1] = components[i+1], components[i]
                        st.rerun()
                
                with col2_actions:
                    if st.button("Delete", key=f"delete_{component['id']}"):
                        component_indices_to_delete.append(i)
    
    # Delete components marked for deletion (in reverse order to avoid index issues)
    for idx in sorted(component_indices_to_delete, reverse=True):
        del st.session_state.current_dashboard["components"][idx]
    
    if component_indices_to_delete:
        st.rerun()

# Save dashboard button
st.markdown("---")
save_col1, save_col2 = st.columns([3, 1])

with save_col1:
    save_button = st.button("Save Dashboard", use_container_width=True)
    if save_button:
        if not dashboard_name:
            st.error("Dashboard name cannot be empty")
        else:
            # Update dashboard properties
            st.session_state.current_dashboard["name"] = dashboard_name
            st.session_state.current_dashboard["description"] = dashboard_description
            st.session_state.current_dashboard["layout"] = dashboard_layout
            st.session_state.current_dashboard["created_at"] = datetime.now()
            
            # Save to session state
            st.session_state.dashboards[dashboard_name] = st.session_state.current_dashboard.copy()
            
            st.success(f"Dashboard '{dashboard_name}' saved successfully!")

with save_col2:
    preview_button = st.button("Preview Dashboard", use_container_width=True)
    if preview_button:
        if not dashboard_name:
            st.error("Dashboard name cannot be empty")
        else:
            # Update dashboard properties
            st.session_state.current_dashboard["name"] = dashboard_name
            st.session_state.current_dashboard["description"] = dashboard_description
            st.session_state.current_dashboard["layout"] = dashboard_layout
            
            # Switch to preview mode (TODO: implement a dedicated preview page)
            st.success("Preview mode activated")
            st.rerun()
