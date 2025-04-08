import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import base64
import io
from datetime import datetime
import os
import sys
import json

# Add utils to path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from utils.visualization import create_chart
from utils.export import generate_pdf_report, generate_csv_report, generate_excel_report
from utils.data_processing import preview_dataframe

st.set_page_config(
    page_title="Report Generation | PM Data Tool",
    page_icon="📊",
    layout="wide"
)

st.title("Report Generation")
st.markdown("Create customizable reports from your dashboards and data sources.")

# Initialize report session state
if "current_report" not in st.session_state:
    st.session_state.current_report = {
        "name": "",
        "description": "",
        "components": [],
        "template": "standard"
    }

if "report_edit_mode" not in st.session_state:
    st.session_state.report_edit_mode = False

# Function to load dashboard components into report
def load_dashboard_components(dashboard_name):
    if dashboard_name in st.session_state.dashboards:
        dashboard = st.session_state.dashboards[dashboard_name]
        return dashboard["components"]
    return []

# Function to generate a download link
def get_download_link(file_content, file_name, file_type):
    b64 = base64.b64encode(file_content).decode()
    href = f'<a href="data:{file_type};base64,{b64}" download="{file_name}">Download {file_name}</a>'
    return href

# Sidebar for report options
with st.sidebar:
    st.header("Report Options")
    
    # Report actions
    report_action = st.radio(
        "Action",
        ["Create New Report", "Edit Existing Report", "Delete Report"]
    )
    
    if report_action == "Create New Report":
        st.session_state.report_edit_mode = False
        st.session_state.current_report = {
            "name": "",
            "description": "",
            "components": [],
            "template": "standard"
        }
    
    elif report_action == "Edit Existing Report":
        if st.session_state.reports:
            report_to_edit = st.selectbox(
                "Select Report to Edit",
                list(st.session_state.reports.keys())
            )
            
            if st.button("Load Report"):
                if report_to_edit in st.session_state.reports:
                    st.session_state.current_report = st.session_state.reports[report_to_edit].copy()
                    st.session_state.report_edit_mode = True
                    st.success(f"Loaded report '{report_to_edit}' for editing")
                else:
                    st.error("Failed to load report")
        else:
            st.info("No reports available to edit. Create a new report first.")
    
    elif report_action == "Delete Report":
        if st.session_state.reports:
            report_to_delete = st.selectbox(
                "Select Report to Delete",
                list(st.session_state.reports.keys())
            )
            
            if st.button("Delete Report"):
                if report_to_delete in st.session_state.reports:
                    del st.session_state.reports[report_to_delete]
                    st.success(f"Report '{report_to_delete}' deleted successfully")
                    
                    # Reset current report if the deleted one was being edited
                    if st.session_state.report_edit_mode and st.session_state.current_report["name"] == report_to_delete:
                        st.session_state.report_edit_mode = False
                        st.session_state.current_report = {
                            "name": "",
                            "description": "",
                            "components": [],
                            "template": "standard"
                        }
                    
                    st.rerun()
                else:
                    st.error("Failed to delete report")
        else:
            st.info("No reports available to delete.")
    
    # Export options
    st.header("Export Options")
    
    export_format = st.selectbox(
        "Export Format",
        ["PDF", "CSV", "Excel"]
    )
    
    if export_format == "PDF":
        page_size = st.selectbox("Page Size", ["Letter", "A4", "Legal"])
        orientation = st.selectbox("Orientation", ["Portrait", "Landscape"])
        include_timestamp = st.checkbox("Include Timestamp", value=True)
        
        st.session_state.current_report["export_options"] = {
            "format": "pdf",
            "page_size": page_size,
            "orientation": orientation,
            "include_timestamp": include_timestamp
        }
    
    elif export_format == "CSV":
        include_headers = st.checkbox("Include Headers", value=True)
        delimiter = st.selectbox("Delimiter", [",", ";", "Tab"], format_func=lambda x: "Tab" if x == "Tab" else x)
        encoding = st.selectbox("Encoding", ["UTF-8", "ISO-8859-1", "ASCII"])
        
        st.session_state.current_report["export_options"] = {
            "format": "csv",
            "include_headers": include_headers,
            "delimiter": delimiter if delimiter != "Tab" else "\t",
            "encoding": encoding
        }
    
    elif export_format == "Excel":
        include_charts = st.checkbox("Include Charts", value=True)
        include_filters = st.checkbox("Include Filters", value=True)
        
        st.session_state.current_report["export_options"] = {
            "format": "excel",
            "include_charts": include_charts,
            "include_filters": include_filters
        }
    
    # Report template
    st.header("Report Template")
    
    template = st.selectbox(
        "Template Style",
        ["Standard", "Executive", "Minimal", "Detailed"],
        index=0,
        format_func=lambda x: x.title()
    )
    
    st.session_state.current_report["template"] = template.lower()
    
    # Load components from dashboard
    st.header("Import from Dashboard")
    
    if st.session_state.dashboards:
        dashboard_source = st.selectbox(
            "Select Dashboard",
            list(st.session_state.dashboards.keys())
        )
        
        if st.button("Import Components"):
            components = load_dashboard_components(dashboard_source)
            if components:
                # Append or replace components based on user preference
                if st.session_state.current_report["components"]:
                    replace = st.radio("Replace existing components?", ["No, append", "Yes, replace"])
                    
                    if replace == "Yes, replace":
                        st.session_state.current_report["components"] = components
                    else:
                        st.session_state.current_report["components"].extend(components)
                else:
                    st.session_state.current_report["components"] = components
                
                st.success(f"Imported {len(components)} components from dashboard '{dashboard_source}'")
    else:
        st.info("No dashboards available. Create a dashboard first to import components.")

# Main report editor
st.header("Report Editor")

# Report settings
with st.expander("Report Settings", expanded=True):
    report_name = st.text_input(
        "Report Name",
        value=st.session_state.current_report["name"]
    )
    
    report_description = st.text_area(
        "Report Description",
        value=st.session_state.current_report["description"]
    )
    
    report_period = st.selectbox(
        "Reporting Period",
        ["Last 7 Days", "Last 30 Days", "Last Quarter", "Last Year", "Custom"],
        index=1
    )
    
    if report_period == "Custom":
        report_start_date, report_end_date = st.date_input(
            "Custom Date Range",
            value=(datetime.now().replace(day=1), datetime.now()),
            max_value=datetime.now()
        )

# Preview report components
st.subheader("Report Components")

if not st.session_state.current_report["components"]:
    st.info("No components added yet. Import components from a dashboard or add them directly.")
else:
    # Display components for the report
    for i, component in enumerate(st.session_state.current_report["components"]):
        with st.expander(f"{component.get('title', 'Component')} ({component['type'].capitalize()})", expanded=False):
            # Component preview
            if component["type"] == "chart" and "data_source" in component:
                try:
                    data_source = component["data_source"]
                    if data_source in st.session_state.data_sources:
                        df = st.session_state.data_sources[data_source]["data"]
                        
                        chart_fig = create_chart(df, component["chart_config"])
                        st.plotly_chart(chart_fig, use_container_width=True)
                    else:
                        st.warning(f"Data source '{data_source}' not found.")
                except Exception as e:
                    st.error(f"Error rendering chart: {str(e)}")
            
            elif component["type"] == "metric" and "data_source" in component:
                try:
                    data_source = component["data_source"]
                    if data_source in st.session_state.data_sources:
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
                        
                        # Display the metric
                        st.metric(
                            label=component["title"],
                            value=formatted_value,
                            delta=component.get("delta_value")
                        )
                    else:
                        st.warning(f"Data source '{data_source}' not found.")
                except Exception as e:
                    st.error(f"Error calculating metric: {str(e)}")
            
            elif component["type"] == "table" and "data_source" in component:
                try:
                    data_source = component["data_source"]
                    if data_source in st.session_state.data_sources:
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
                    else:
                        st.warning(f"Data source '{data_source}' not found.")
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
            
            # Component actions
            col1_actions, col2_actions = st.columns(2)
            
            with col1_actions:
                # Move component up/down
                if i > 0 and st.button("Move Up", key=f"report_up_{i}"):
                    st.session_state.current_report["components"][i], st.session_state.current_report["components"][i-1] = st.session_state.current_report["components"][i-1], st.session_state.current_report["components"][i]
                    st.rerun()
                
                if i < len(st.session_state.current_report["components"]) - 1 and st.button("Move Down", key=f"report_down_{i}"):
                    st.session_state.current_report["components"][i], st.session_state.current_report["components"][i+1] = st.session_state.current_report["components"][i+1], st.session_state.current_report["components"][i]
                    st.rerun()
            
            with col2_actions:
                if st.button("Remove from Report", key=f"report_remove_{i}"):
                    st.session_state.current_report["components"].pop(i)
                    st.rerun()

# Save report and export
st.markdown("---")
save_col1, save_col2 = st.columns(2)

with save_col1:
    save_button = st.button("Save Report", use_container_width=True)
    if save_button:
        if not report_name:
            st.error("Report name cannot be empty")
        else:
            # Update report properties
            st.session_state.current_report["name"] = report_name
            st.session_state.current_report["description"] = report_description
            st.session_state.current_report["period"] = report_period
            
            if report_period == "Custom":
                st.session_state.current_report["custom_period"] = {
                    "start_date": report_start_date,
                    "end_date": report_end_date
                }
            
            st.session_state.current_report["created_at"] = datetime.now()
            
            # Save to session state
            st.session_state.reports[report_name] = st.session_state.current_report.copy()
            
            st.success(f"Report '{report_name}' saved successfully!")

with save_col2:
    export_button = st.button("Generate & Export Report", use_container_width=True)
    if export_button:
        if not st.session_state.current_report["components"]:
            st.error("Cannot export an empty report. Add components first.")
        else:
            try:
                export_format = st.session_state.current_report.get("export_options", {}).get("format", "pdf")
                
                if export_format == "pdf":
                    report_content = generate_pdf_report(
                        st.session_state.current_report,
                        st.session_state.data_sources
                    )
                    
                    # Create download link
                    report_filename = f"{report_name.replace(' ', '_').lower()}_{datetime.now().strftime('%Y%m%d')}.pdf"
                    st.markdown(get_download_link(report_content, report_filename, "application/pdf"), unsafe_allow_html=True)
                
                elif export_format == "csv":
                    report_content = generate_csv_report(
                        st.session_state.current_report,
                        st.session_state.data_sources
                    )
                    
                    # Create download link
                    report_filename = f"{report_name.replace(' ', '_').lower()}_{datetime.now().strftime('%Y%m%d')}.csv"
                    st.markdown(get_download_link(report_content, report_filename, "text/csv"), unsafe_allow_html=True)
                
                elif export_format == "excel":
                    report_content = generate_excel_report(
                        st.session_state.current_report,
                        st.session_state.data_sources
                    )
                    
                    # Create download link
                    report_filename = f"{report_name.replace(' ', '_').lower()}_{datetime.now().strftime('%Y%m%d')}.xlsx"
                    st.markdown(get_download_link(report_content, report_filename, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"), unsafe_allow_html=True)
                
                st.success(f"Report exported successfully as {export_format.upper()}")
            except Exception as e:
                st.error(f"Error exporting report: {str(e)}")
