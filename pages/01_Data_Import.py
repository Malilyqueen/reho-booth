import streamlit as st
import pandas as pd
import numpy as np
import io
import json
import requests
from datetime import datetime
import os
import sys

# Add utils to path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from utils.data_connectors import connect_to_api, connect_to_database, test_connection
from utils.data_processing import preview_dataframe, get_data_summary

st.set_page_config(
    page_title="Data Import | PM Data Tool",
    page_icon="📊",
    layout="wide"
)

st.title("Data Import")
st.markdown("Connect to various data sources and import data for your dashboards.")

# Tabs for different import methods
data_import_tabs = st.tabs(["File Upload", "Database Connection", "API Connection", "Sample Data", "Manage Data Sources"])

# File Upload Tab
with data_import_tabs[0]:
    st.header("Import Data from Files")
    
    uploaded_file = st.file_uploader("Choose a file", type=["csv", "xlsx", "json"])
    file_name = st.text_input("Data Source Name", "New Data Source")
    
    if uploaded_file is not None:
        try:
            if uploaded_file.name.endswith('.csv'):
                df = pd.read_csv(uploaded_file)
            elif uploaded_file.name.endswith('.xlsx'):
                df = pd.read_excel(uploaded_file)
            elif uploaded_file.name.endswith('.json'):
                df = pd.read_json(uploaded_file)
            
            st.success(f"Successfully loaded file: {uploaded_file.name}")
            
            if st.button("Save Data Source"):
                if file_name in st.session_state.data_sources:
                    if not st.warning(f"A data source with name '{file_name}' already exists. Overwrite?"):
                        st.stop()
                
                # Save to session state
                st.session_state.data_sources[file_name] = {
                    "data": df,
                    "source_type": "file",
                    "original_file": uploaded_file.name,
                    "imported_at": datetime.now(),
                    "columns": list(df.columns),
                    "rows": len(df)
                }
                
                st.success(f"Data source '{file_name}' saved successfully!")
            
            # Preview the dataframe
            st.subheader("Data Preview")
            preview_dataframe(df)
            
            # Show summary statistics
            st.subheader("Data Summary")
            summary = get_data_summary(df)
            st.json(summary)
            
        except Exception as e:
            st.error(f"Error loading file: {str(e)}")

# Database Connection Tab
with data_import_tabs[1]:
    st.header("Connect to Database")
    
    db_type = st.selectbox("Database Type", ["PostgreSQL", "MySQL", "SQL Server", "SQLite"])
    db_name = st.text_input("Data Source Name (Database)", f"New {db_type} Connection")
    
    with st.form("database_connection_form"):
        db_host = st.text_input("Host", "localhost")
        db_port = st.text_input("Port", "5432")
        db_user = st.text_input("Username")
        db_password = st.text_input("Password", type="password")
        db_database = st.text_input("Database Name")
        db_query = st.text_area("SQL Query", "SELECT * FROM table LIMIT 100")
        
        test_conn_button = st.form_submit_button("Test Connection")
        if test_conn_button:
            try:
                connection_successful = test_connection(
                    db_type, db_host, db_port, db_user, db_password, db_database
                )
                if connection_successful:
                    st.success("Connection successful!")
                else:
                    st.error("Failed to connect to database")
            except Exception as e:
                st.error(f"Connection error: {str(e)}")
        
        import_button = st.form_submit_button("Import Data")
        if import_button:
            try:
                df = connect_to_database(
                    db_type, db_host, db_port, db_user, db_password, db_database, db_query
                )
                
                if df is not None:
                    # Save to session state
                    st.session_state.data_sources[db_name] = {
                        "data": df,
                        "source_type": "database",
                        "db_type": db_type,
                        "imported_at": datetime.now(),
                        "columns": list(df.columns),
                        "rows": len(df),
                        "query": db_query
                    }
                    
                    st.success(f"Data source '{db_name}' imported successfully!")
                    
                    # Preview the dataframe
                    st.subheader("Data Preview")
                    preview_dataframe(df)
                    
                    # Show summary statistics
                    st.subheader("Data Summary")
                    summary = get_data_summary(df)
                    st.json(summary)
            except Exception as e:
                st.error(f"Import error: {str(e)}")

# API Connection Tab
with data_import_tabs[2]:
    st.header("Connect to API")
    
    api_name = st.text_input("Data Source Name (API)", "New API Connection")
    
    with st.form("api_connection_form"):
        api_url = st.text_input("API URL", "https://api.example.com/data")
        api_method = st.selectbox("Method", ["GET", "POST"])
        api_params = st.text_area("Parameters (JSON)", "{}")
        api_headers = st.text_area("Headers (JSON)", '{"Content-Type": "application/json"}')
        api_auth = st.checkbox("Authentication Required")
        
        api_auth_type = None
        api_auth_username = None
        api_auth_password = None
        api_auth_token = None
        
        if api_auth:
            api_auth_type = st.selectbox("Authentication Type", ["Basic", "Bearer Token"])
            
            if api_auth_type == "Basic":
                api_auth_username = st.text_input("Username")
                api_auth_password = st.text_input("Password", type="password")
            else:
                api_auth_token = st.text_input("Token")
        
        test_api_button = st.form_submit_button("Test API Connection")
        if test_api_button:
            try:
                # Parse parameters and headers
                params = json.loads(api_params) if api_params else {}
                headers = json.loads(api_headers) if api_headers else {}
                
                # Create auth
                auth = None
                if api_auth:
                    if api_auth_type == "Basic" and api_auth_username and api_auth_password:
                        auth = (api_auth_username, api_auth_password)
                    elif api_auth_type == "Bearer Token" and api_auth_token:
                        headers["Authorization"] = f"Bearer {api_auth_token}"
                
                # Test API connection
                response = requests.request(
                    method=api_method,
                    url=api_url,
                    params=params if api_method == "GET" else None,
                    json=params if api_method == "POST" else None,
                    headers=headers,
                    auth=auth
                )
                
                if response.status_code in [200, 201]:
                    st.success(f"API connection successful! Status code: {response.status_code}")
                else:
                    st.error(f"API connection failed. Status code: {response.status_code}")
            except Exception as e:
                st.error(f"API connection error: {str(e)}")
        
        import_api_button = st.form_submit_button("Import API Data")
        if import_api_button:
            try:
                # Connect to API
                df = connect_to_api(
                    api_url,
                    api_method,
                    api_params,
                    api_headers,
                    api_auth,
                    api_auth_type,
                    api_auth_username,
                    api_auth_password,
                    api_auth_token
                )
                
                if df is not None:
                    # Save to session state
                    st.session_state.data_sources[api_name] = {
                        "data": df,
                        "source_type": "api",
                        "api_url": api_url,
                        "imported_at": datetime.now(),
                        "columns": list(df.columns),
                        "rows": len(df)
                    }
                    
                    st.success(f"Data source '{api_name}' imported successfully!")
                    
                    # Preview the dataframe
                    st.subheader("Data Preview")
                    preview_dataframe(df)
                    
                    # Show summary statistics
                    st.subheader("Data Summary")
                    summary = get_data_summary(df)
                    st.json(summary)
            except Exception as e:
                st.error(f"Import error: {str(e)}")

# Sample Data Tab
with data_import_tabs[3]:
    st.header("Use Sample Data")
    
    sample_data_type = st.selectbox(
        "Sample Data Type",
        ["Product Metrics", "User Engagement", "Sales Data", "Customer Feedback"]
    )
    
    sample_name = st.text_input("Data Source Name (Sample)", f"{sample_data_type} Sample")
    
    if st.button("Generate Sample Data"):
        # Create sample data based on selected type
        if sample_data_type == "Product Metrics":
            # Generate product metrics sample data
            dates = pd.date_range(end=pd.Timestamp.now(), periods=30, freq='D')
            products = ['Product A', 'Product B', 'Product C']
            
            data = []
            for product in products:
                for date in dates:
                    data.append({
                        'date': date,
                        'product': product,
                        'active_users': np.random.randint(100, 1000),
                        'new_users': np.random.randint(10, 100),
                        'session_duration': np.round(np.random.uniform(2, 15), 2),
                        'conversion_rate': np.round(np.random.uniform(0.01, 0.15), 4),
                        'revenue': np.round(np.random.uniform(1000, 10000), 2)
                    })
            
            df = pd.DataFrame(data)
            
        elif sample_data_type == "User Engagement":
            # Generate user engagement sample data
            dates = pd.date_range(end=pd.Timestamp.now(), periods=30, freq='D')
            features = ['Login', 'Search', 'Profile', 'Messaging', 'Settings']
            
            data = []
            for feature in features:
                for date in dates:
                    data.append({
                        'date': date,
                        'feature': feature,
                        'visits': np.random.randint(100, 5000),
                        'users': np.random.randint(50, 2000),
                        'avg_time_spent': np.round(np.random.uniform(0.5, 10), 2),
                        'bounce_rate': np.round(np.random.uniform(0.05, 0.4), 4)
                    })
            
            df = pd.DataFrame(data)
            
        elif sample_data_type == "Sales Data":
            # Generate sales sample data
            dates = pd.date_range(end=pd.Timestamp.now(), periods=90, freq='D')
            regions = ['North', 'South', 'East', 'West']
            channels = ['Online', 'Store', 'Partner']
            
            data = []
            for date in dates:
                for region in regions:
                    for channel in channels:
                        data.append({
                            'date': date,
                            'region': region,
                            'channel': channel,
                            'sales': np.round(np.random.uniform(1000, 25000), 2),
                            'units': np.random.randint(50, 500),
                            'customers': np.random.randint(10, 200),
                            'avg_order_value': np.round(np.random.uniform(50, 250), 2)
                        })
            
            df = pd.DataFrame(data)
            
        elif sample_data_type == "Customer Feedback":
            # Generate customer feedback sample data
            dates = pd.date_range(end=pd.Timestamp.now(), periods=60, freq='D')
            categories = ['UI/UX', 'Performance', 'Features', 'Support', 'Pricing']
            sentiments = ['Positive', 'Neutral', 'Negative']
            
            data = []
            for date in dates:
                for category in categories:
                    for sentiment in sentiments:
                        count = np.random.randint(0, 30)
                        if count > 0:  # Only add non-zero counts
                            data.append({
                                'date': date,
                                'category': category,
                                'sentiment': sentiment,
                                'count': count,
                                'avg_rating': np.round(
                                    np.random.uniform(1, 5) if sentiment == 'Negative' else
                                    np.random.uniform(2.5, 3.5) if sentiment == 'Neutral' else
                                    np.random.uniform(4, 5), 1
                                )
                            })
            
            df = pd.DataFrame(data)
        
        # Save to session state
        st.session_state.data_sources[sample_name] = {
            "data": df,
            "source_type": "sample",
            "sample_type": sample_data_type,
            "imported_at": datetime.now(),
            "columns": list(df.columns),
            "rows": len(df)
        }
        
        st.success(f"Sample data '{sample_name}' created successfully!")
        
        # Preview the dataframe
        st.subheader("Data Preview")
        preview_dataframe(df)
        
        # Show summary statistics
        st.subheader("Data Summary")
        summary = get_data_summary(df)
        st.json(summary)

# Manage Data Sources Tab
with data_import_tabs[4]:
    st.header("Manage Data Sources")
    
    if not st.session_state.data_sources:
        st.info("No data sources available. Import data using the other tabs.")
    else:
        data_source_list = list(st.session_state.data_sources.keys())
        selected_source = st.selectbox("Select Data Source", data_source_list)
        
        source = st.session_state.data_sources[selected_source]
        
        st.write(f"**Source Type:** {source['source_type'].capitalize()}")
        st.write(f"**Imported At:** {source['imported_at'].strftime('%Y-%m-%d %H:%M:%S')}")
        st.write(f"**Rows:** {source['rows']}")
        st.write(f"**Columns:** {', '.join(source['columns'])}")
        
        col1, col2 = st.columns(2)
        
        with col1:
            if st.button("View Data", use_container_width=True):
                st.subheader(f"Data for '{selected_source}'")
                preview_dataframe(source["data"])
        
        with col2:
            if st.button("Delete Data Source", use_container_width=True):
                del st.session_state.data_sources[selected_source]
                st.success(f"Data source '{selected_source}' deleted successfully!")
                st.rerun()
