import streamlit as st
import pandas as pd
import numpy as np
import os
import json
from datetime import datetime

# Set page config
st.set_page_config(
    page_title="PM Data Dashboard Tool",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Initialize session state variables if they don't exist
if "data_sources" not in st.session_state:
    st.session_state.data_sources = {}

if "dashboards" not in st.session_state:
    st.session_state.dashboards = {}

if "reports" not in st.session_state:
    st.session_state.reports = {}

if "shared_links" not in st.session_state:
    st.session_state.shared_links = {}

if "transformations" not in st.session_state:
    st.session_state.transformations = {}

# Main page content
st.title("Product Manager's Data Tool")

# Dashboard overview
st.header("Dashboard Overview")

col1, col2, col3 = st.columns(3)

with col1:
    st.metric(
        label="Data Sources", 
        value=len(st.session_state.data_sources),
        delta=None
    )

with col2:
    st.metric(
        label="Dashboards Created", 
        value=len(st.session_state.dashboards),
        delta=None
    )

with col3:
    st.metric(
        label="Reports Generated", 
        value=len(st.session_state.reports),
        delta=None
    )

# Quick actions
st.header("Quick Actions")

quick_action_col1, quick_action_col2, quick_action_col3 = st.columns(3)

with quick_action_col1:
    if st.button("Create New Dashboard", use_container_width=True):
        st.switch_page("pages/02_Dashboard_Builder.py")

with quick_action_col2:
    if st.button("Import Data", use_container_width=True):
        st.switch_page("pages/01_Data_Import.py")

with quick_action_col3:
    if st.button("Generate Report", use_container_width=True):
        st.switch_page("pages/03_Report_Generation.py")

# Recent activity
st.header("Recent Activity")

if not st.session_state.dashboards and not st.session_state.reports and not st.session_state.data_sources:
    st.info("No recent activity. Get started by importing data or creating a dashboard.")
else:
    # Create a list of recent activities
    activities = []
    
    # Add dashboard creations
    for name, dashboard in st.session_state.dashboards.items():
        activities.append({
            "type": "Dashboard",
            "name": name,
            "timestamp": dashboard.get("created_at", datetime.now()),
            "action": "Created"
        })
    
    # Add report generations
    for name, report in st.session_state.reports.items():
        activities.append({
            "type": "Report",
            "name": name,
            "timestamp": report.get("created_at", datetime.now()),
            "action": "Generated"
        })
    
    # Add data source imports
    for name, source in st.session_state.data_sources.items():
        activities.append({
            "type": "Data Source",
            "name": name,
            "timestamp": source.get("imported_at", datetime.now()),
            "action": "Imported"
        })
    
    # Sort activities by timestamp (most recent first)
    activities.sort(key=lambda x: x["timestamp"], reverse=True)
    
    # Display activities
    activity_df = pd.DataFrame(activities[:5])
    if not activity_df.empty:
        activity_df["timestamp"] = activity_df["timestamp"].apply(lambda x: x.strftime("%Y-%m-%d %H:%M"))
        st.dataframe(
            activity_df[["timestamp", "action", "type", "name"]],
            use_container_width=True,
            hide_index=True
        )

# Footer with information
st.markdown("---")
st.markdown("""
### About this tool
This data tool helps product managers create custom dashboards and reports. 
You can import data from various sources, build interactive dashboards, 
generate reports, and share insights with your team.

Navigate using the sidebar to access different features.
""")
