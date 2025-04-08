import streamlit as st
import pandas as pd
import base64
import io
from datetime import datetime
import os
import sys
import json
import uuid
import random
import string

# Add utils to path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from utils.sharing import generate_share_link, get_dashboard_by_share_id, validate_share_token
from utils.visualization import create_chart

st.set_page_config(
    page_title="Shared Dashboards | PM Data Tool",
    page_icon="📊",
    layout="wide"
)

# Initialize session state for viewing shared dashboards
if "viewing_shared" not in st.session_state:
    st.session_state.viewing_shared = False

if "current_shared_dashboard" not in st.session_state:
    st.session_state.current_shared_dashboard = None

# Check if viewing a shared dashboard via URL parameter
query_params = st.experimental_get_query_params()
if "share_id" in query_params and "token" in query_params:
    share_id = query_params["share_id"][0]
    token = query_params["token"][0]
    
    # Validate the token and retrieve the dashboard
    if validate_share_token(share_id, token):
        shared_dashboard = get_dashboard_by_share_id(share_id)
        if shared_dashboard:
            st.session_state.viewing_shared = True
            st.session_state.current_shared_dashboard = shared_dashboard
    else:
        st.session_state.viewing_shared = False
        st.error("Invalid or expired share link. Please request a new link from the dashboard owner.")

# Function to render a dashboard
def render_dashboard(dashboard, data_sources):
    st.header(dashboard.get("name", "Shared Dashboard"))
    
    if "description" in dashboard and dashboard["description"]:
        st.markdown(dashboard["description"])
    
    # Determine layout
    layout = dashboard.get("layout", "2 Columns")
    
    if layout == "1 Column":
        cols = [st.container()]
    elif layout == "2 Columns":
        col1, col2 = st.columns(2)
        cols = [col1, col2]
    else:  # 3 Columns
        col1, col2, col3 = st.columns(3)
        cols = [col1, col2, col3]
    
    # Distribute components evenly across columns
    components = dashboard.get("components", [])
    components_per_col = len(components) // len(cols) + (1 if len(components) % len(cols) > 0 else 0)
    
    for i, component in enumerate(components):
        col_idx = min(i // components_per_col, len(cols) - 1)
        
        with cols[col_idx]:
            # Component rendering
            if component["type"] == "chart" and "data_source" in component:
                try:
                    data_source = component["data_source"]
                    if data_source in data_sources:
                        df = data_sources[data_source]["data"]
                        
                        chart_fig = create_chart(df, component["chart_config"])
                        st.subheader(component.get("title", "Chart"))
                        st.plotly_chart(chart_fig, use_container_width=True)
                    else:
                        st.warning(f"Data source '{data_source}' not available in shared view.")
                except Exception as e:
                    st.error(f"Error rendering chart: {str(e)}")
            
            elif component["type"] == "metric" and "data_source" in component:
                try:
                    data_source = component["data_source"]
                    if data_source in data_sources:
                        df = data_sources[data_source]["data"]
                        
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
                        if component.get("delta") and "value" in component["delta"]:
                            delta = component["delta"]["value"]
                        
                        # Display the metric
                        st.metric(
                            label=component["title"],
                            value=formatted_value,
                            delta=delta
                        )
                    else:
                        st.warning(f"Data source '{data_source}' not available in shared view.")
                except Exception as e:
                    st.error(f"Error calculating metric: {str(e)}")
            
            elif component["type"] == "table" and "data_source" in component:
                try:
                    data_source = component["data_source"]
                    if data_source in data_sources:
                        df = data_sources[data_source]["data"]
                        
                        # Filter columns
                        if component.get("columns"):
                            df = df[component["columns"]]
                        
                        # Display table
                        st.subheader(component.get("title", "Data Table"))
                        st.dataframe(
                            df,
                            use_container_width=component.get("width") == "Full Width",
                            hide_index=not component.get("show_index", False)
                        )
                    else:
                        st.warning(f"Data source '{data_source}' not available in shared view.")
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
                # Note: Filters in shared views are displayed but not functional
                st.info(f"Filter: {component.get('title', 'Filter')} (filters are view-only in shared dashboards)")

# If viewing a shared dashboard
if st.session_state.viewing_shared and st.session_state.current_shared_dashboard:
    # Render the shared dashboard
    dashboard = st.session_state.current_shared_dashboard["dashboard"]
    data_sources = st.session_state.current_shared_dashboard["data_sources"]
    
    # Share info
    st.sidebar.header("Shared Dashboard")
    st.sidebar.info(f"This dashboard was shared by {st.session_state.current_shared_dashboard.get('owner', 'a user')} on {st.session_state.current_shared_dashboard.get('shared_at').strftime('%Y-%m-%d')}")
    
    # View-only notice
    st.sidebar.warning("This is a view-only dashboard. Interactive features like filters may be limited.")
    
    # Download options if allowed
    if st.session_state.current_shared_dashboard.get("allow_download", False):
        st.sidebar.header("Download Options")
        download_format = st.sidebar.selectbox("Format", ["PDF", "Image"])
        
        if st.sidebar.button("Download"):
            st.sidebar.info("Download functionality is limited in this shared view. Please contact the dashboard owner for exports.")
    
    # Render the dashboard
    render_dashboard(dashboard, data_sources)

# If not viewing a shared dashboard, show sharing options
else:
    st.title("Share Dashboards")
    st.markdown("Share your dashboards with others via secure links.")
    
    # Two tabs for sharing and managing shares
    share_tab, manage_tab = st.tabs(["Share Dashboard", "Manage Shared Dashboards"])
    
    with share_tab:
        st.header("Create Shareable Link")
        
        if not st.session_state.dashboards:
            st.info("No dashboards available to share. Create a dashboard first.")
        else:
            dashboard_to_share = st.selectbox(
                "Select Dashboard to Share",
                list(st.session_state.dashboards.keys())
            )
            
            # Sharing options
            st.subheader("Sharing Options")
            
            expiration_options = {
                "1 day": 1,
                "7 days": 7,
                "30 days": 30,
                "Never expires": 0
            }
            
            expiration = st.selectbox(
                "Link Expiration",
                list(expiration_options.keys()),
                index=1  # Default to 7 days
            )
            
            # Advanced options
            with st.expander("Advanced Options"):
                allow_download = st.checkbox("Allow Downloads", value=True)
                include_filters = st.checkbox("Include Interactive Filters", value=False)
                
                # Data to include
                data_to_include = st.radio(
                    "Data to Include",
                    ["All Data Sources", "Only Required Data", "Selected Data Sources"]
                )
                
                selected_data_sources = None
                if data_to_include == "Selected Data Sources":
                    # Get all data sources used in the dashboard
                    dashboard = st.session_state.dashboards[dashboard_to_share]
                    used_data_sources = set()
                    
                    for component in dashboard.get("components", []):
                        if "data_source" in component:
                            used_data_sources.add(component["data_source"])
                    
                    selected_data_sources = st.multiselect(
                        "Select Data Sources to Include",
                        list(used_data_sources),
                        default=list(used_data_sources)
                    )
            
            if st.button("Generate Shareable Link"):
                try:
                    # Get the dashboard data
                    dashboard = st.session_state.dashboards[dashboard_to_share]
                    
                    # Determine which data sources to include
                    data_sources_to_include = {}
                    
                    if data_to_include == "All Data Sources":
                        data_sources_to_include = st.session_state.data_sources
                    else:
                        # Get only the required data sources for the dashboard
                        used_data_sources = set()
                        
                        for component in dashboard.get("components", []):
                            if "data_source" in component:
                                used_data_sources.add(component["data_source"])
                        
                        if data_to_include == "Only Required Data":
                            for ds in used_data_sources:
                                if ds in st.session_state.data_sources:
                                    data_sources_to_include[ds] = st.session_state.data_sources[ds]
                        else:  # Selected Data Sources
                            for ds in selected_data_sources:
                                if ds in st.session_state.data_sources:
                                    data_sources_to_include[ds] = st.session_state.data_sources[ds]
                    
                    # Generate the share link
                    days_valid = expiration_options[expiration]
                    share_info = {
                        "dashboard": dashboard,
                        "data_sources": data_sources_to_include,
                        "allow_download": allow_download,
                        "include_filters": include_filters,
                        "owner": "Current User",  # In a real app, this would be the logged-in user
                        "shared_at": datetime.now(),
                        "expires_at": datetime.now() + pd.Timedelta(days=days_valid) if days_valid > 0 else None
                    }
                    
                    share_link = generate_share_link(share_info)
                    
                    # Display the share link
                    st.success("Shareable link generated successfully!")
                    st.code(share_link)
                    
                    # Copy button (note: this doesn't actually copy to clipboard in Streamlit yet)
                    st.button("Copy Link", help="Click to copy link to clipboard (May not work in all browsers)")
                    
                    # Share info
                    st.info(f"""
                    **Sharing Details:**
                    - Dashboard: {dashboard_to_share}
                    - Expiration: {expiration}
                    - Data Sources: {len(data_sources_to_include)} included
                    """)
                    
                    # Usage instructions
                    st.markdown("""
                    ### How to use:
                    1. Copy the link above
                    2. Share it with your intended recipients
                    3. They can access the dashboard without needing to log in
                    
                    *Note: Anyone with this link can view the dashboard and included data*
                    """)
                except Exception as e:
                    st.error(f"Error generating share link: {str(e)}")
    
    with manage_tab:
        st.header("Manage Shared Dashboards")
        
        if "shared_links" not in st.session_state or not st.session_state.shared_links:
            st.info("No dashboards have been shared yet.")
        else:
            # Create a dataframe of shared links for display
            shared_data = []
            
            for share_id, share_info in st.session_state.shared_links.items():
                dashboard_name = share_info["dashboard"].get("name", "Unnamed Dashboard")
                created_at = share_info.get("shared_at", datetime.now())
                expires_at = share_info.get("expires_at", "Never")
                
                # Calculate status
                if expires_at != "Never" and expires_at < datetime.now():
                    status = "Expired"
                else:
                    status = "Active"
                
                shared_data.append({
                    "share_id": share_id,
                    "dashboard": dashboard_name,
                    "created_at": created_at,
                    "expires_at": expires_at if expires_at == "Never" else expires_at.strftime("%Y-%m-%d"),
                    "status": status
                })
            
            shared_df = pd.DataFrame(shared_data)
            
            # Display the shared links
            st.dataframe(
                shared_df[["dashboard", "created_at", "expires_at", "status", "share_id"]],
                use_container_width=True,
                hide_index=True
            )
            
            # Manage selected share
            if not shared_df.empty:
                selected_share_id = st.selectbox(
                    "Select Share to Manage",
                    shared_df["share_id"].tolist(),
                    format_func=lambda x: f"{shared_df[shared_df['share_id'] == x]['dashboard'].values[0]} ({x})"
                )
                
                selected_share = st.session_state.shared_links.get(selected_share_id)
                
                if selected_share:
                    st.subheader("Share Details")
                    
                    # Show current share link
                    base_url = "https://your-domain.com/shared-dashboards"  # Replace with actual base URL
                    share_link = f"{base_url}?share_id={selected_share_id}&token={selected_share.get('token', '')}"
                    
                    st.code(share_link)
                    
                    # Actions
                    col1, col2, col3 = st.columns(3)
                    
                    with col1:
                        if st.button("Revoke Access"):
                            # Remove the share
                            del st.session_state.shared_links[selected_share_id]
                            st.success("Share access revoked successfully!")
                            st.rerun()
                    
                    with col2:
                        if st.button("Extend Expiration"):
                            # Extend by 30 days
                            if selected_share.get("expires_at") != "Never":
                                if selected_share["expires_at"] < datetime.now():
                                    # If already expired, set from now
                                    selected_share["expires_at"] = datetime.now() + pd.Timedelta(days=30)
                                else:
                                    # If not expired, add 30 days
                                    selected_share["expires_at"] += pd.Timedelta(days=30)
                                
                                st.success("Expiration extended by 30 days!")
                                st.rerun()
                            else:
                                st.info("This share never expires.")
                    
                    with col3:
                        if st.button("Regenerate Link"):
                            # Generate a new token
                            token = ''.join(random.choices(string.ascii_letters + string.digits, k=16))
                            selected_share["token"] = token
                            
                            st.success("Share link regenerated!")
                            
                            # Show new link
                            new_share_link = f"{base_url}?share_id={selected_share_id}&token={token}"
                            st.code(new_share_link)

# Footer with information
st.markdown("---")
st.markdown("""
### About Shared Dashboards

Shared dashboards allow you to securely share insights with colleagues, stakeholders, or clients without requiring them to log in or have access to the full application.

**Tips:**
- Set appropriate expiration dates based on the sensitivity of your data
- Consider which data sources to include in shared dashboards
- For long-term sharing, consider creating dedicated user accounts instead
""")
