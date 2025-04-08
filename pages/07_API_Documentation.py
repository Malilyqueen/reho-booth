import streamlit as st
import pandas as pd
import json
import os
import sys
from datetime import datetime

# Add utils to path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

st.set_page_config(
    page_title="API Documentation | PM Data Tool",
    page_icon="📊",
    layout="wide"
)

st.title("API Documentation")
st.markdown("Technical documentation for integrating with the PM Data Tool")

# API overview
st.header("API Overview")
st.markdown("""
This API allows technical teams to programmatically interact with the PM Data Tool. Use these endpoints to:

- Fetch data from dashboards and reports
- Import data into the tool
- Query available data sources
- Subscribe to scheduled reports

The API follows REST principles and returns data in JSON format. All endpoints require authentication.
""")

# Authentication section
st.header("Authentication")
st.markdown("""
The API uses API keys for authentication. You can generate an API key in your account settings.

Include your API key in the header of all requests:

