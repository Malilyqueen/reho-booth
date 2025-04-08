import pandas as pd
import numpy as np
import sqlite3
import requests
import json
import os
from datetime import datetime

# Function to test database connection
def test_connection(db_type, host, port, user, password, database):
    """
    Test connection to a database.
    
    Parameters:
    -----------
    db_type : str
        Type of database (PostgreSQL, MySQL, SQL Server, SQLite)
    host : str
        Database host
    port : str
        Database port
    user : str
        Database username
    password : str
        Database password
    database : str
        Database name
    
    Returns:
    --------
    bool
        True if connection is successful, False otherwise
    """
    try:
        if db_type == "PostgreSQL":
            import psycopg2
            
            conn = psycopg2.connect(
                host=host,
                port=port,
                user=user,
                password=password,
                dbname=database
            )
            conn.close()
            return True
        
        elif db_type == "MySQL":
            import mysql.connector
            
            conn = mysql.connector.connect(
                host=host,
                port=int(port),
                user=user,
                password=password,
                database=database
            )
            conn.close()
            return True
        
        elif db_type == "SQL Server":
            import pyodbc
            
            conn_str = (
                f"DRIVER={{ODBC Driver 17 for SQL Server}};"
                f"SERVER={host},{port};"
                f"DATABASE={database};"
                f"UID={user};"
                f"PWD={password}"
            )
            conn = pyodbc.connect(conn_str)
            conn.close()
            return True
        
        elif db_type == "SQLite":
            conn = sqlite3.connect(database)
            conn.close()
            return True
            
        else:
            return False
    
    except Exception as e:
        print(f"Connection error: {str(e)}")
        return False

# Function to connect to database and execute query
def connect_to_database(db_type, host, port, user, password, database, query):
    """
    Connect to a database and execute a query.
    
    Parameters:
    -----------
    db_type : str
        Type of database (PostgreSQL, MySQL, SQL Server, SQLite)
    host : str
        Database host
    port : str
        Database port
    user : str
        Database username
    password : str
        Database password
    database : str
        Database name
    query : str
        SQL query to execute
    
    Returns:
    --------
    DataFrame
        Pandas DataFrame with query results
    """
    try:
        if db_type == "PostgreSQL":
            import psycopg2
            
            conn = psycopg2.connect(
                host=host,
                port=port,
                user=user,
                password=password,
                dbname=database
            )
            
            df = pd.read_sql_query(query, conn)
            conn.close()
            return df
        
        elif db_type == "MySQL":
            import mysql.connector
            
            conn = mysql.connector.connect(
                host=host,
                port=int(port),
                user=user,
                password=password,
                database=database
            )
            
            df = pd.read_sql_query(query, conn)
            conn.close()
            return df
        
        elif db_type == "SQL Server":
            import pyodbc
            
            conn_str = (
                f"DRIVER={{ODBC Driver 17 for SQL Server}};"
                f"SERVER={host},{port};"
                f"DATABASE={database};"
                f"UID={user};"
                f"PWD={password}"
            )
            conn = pyodbc.connect(conn_str)
            
            df = pd.read_sql_query(query, conn)
            conn.close()
            return df
        
        elif db_type == "SQLite":
            conn = sqlite3.connect(database)
            
            df = pd.read_sql_query(query, conn)
            conn.close()
            return df
            
        else:
            raise ValueError(f"Unsupported database type: {db_type}")
    
    except Exception as e:
        print(f"Database connection/query error: {str(e)}")
        raise

# Function to connect to API and get data
def connect_to_api(url, method, params_str, headers_str, auth_required=False, 
                   auth_type=None, auth_username=None, auth_password=None, auth_token=None):
    """
    Connect to an API and get data.
    
    Parameters:
    -----------
    url : str
        API URL
    method : str
        HTTP method (GET, POST)
    params_str : str
        JSON string of parameters
    headers_str : str
        JSON string of headers
    auth_required : bool
        Whether authentication is required
    auth_type : str
        Authentication type (Basic, Bearer Token)
    auth_username : str
        Username for Basic authentication
    auth_password : str
        Password for Basic authentication
    auth_token : str
        Token for Bearer Token authentication
    
    Returns:
    --------
    DataFrame
        Pandas DataFrame with API response data
    """
    try:
        # Parse parameters and headers
        params = json.loads(params_str) if params_str else {}
        headers = json.loads(headers_str) if headers_str else {}
        
        # Set up authentication
        auth = None
        if auth_required:
            if auth_type == "Basic" and auth_username and auth_password:
                auth = (auth_username, auth_password)
            elif auth_type == "Bearer Token" and auth_token:
                headers["Authorization"] = f"Bearer {auth_token}"
        
        # Make the request
        if method == "GET":
            response = requests.get(url, params=params, headers=headers, auth=auth)
        elif method == "POST":
            response = requests.post(url, json=params, headers=headers, auth=auth)
        else:
            raise ValueError(f"Unsupported HTTP method: {method}")
        
        # Check if the request was successful
        response.raise_for_status()
        
        # Parse the response
        response_data = response.json()
        
        # Handle different response structures
        if isinstance(response_data, list):
            # Response is a list of objects
            df = pd.DataFrame(response_data)
        elif isinstance(response_data, dict):
            # Response is a dictionary
            # Try to find the data array in common API response formats
            if "data" in response_data:
                df = pd.DataFrame(response_data["data"])
            elif "results" in response_data:
                df = pd.DataFrame(response_data["results"])
            elif "items" in response_data:
                df = pd.DataFrame(response_data["items"])
            else:
                # If no standard data field is found, use the dict itself
                df = pd.DataFrame([response_data])
        else:
            raise ValueError("Unsupported API response format")
        
        return df
    
    except requests.exceptions.RequestException as e:
        print(f"API request error: {str(e)}")
        raise
    except json.JSONDecodeError as e:
        print(f"JSON parsing error: {str(e)}")
        raise
    except Exception as e:
        print(f"API connection error: {str(e)}")
        raise

# Function to connect to Google Sheets (placeholder for future implementation)
def connect_to_google_sheets(sheet_id, sheet_range, api_key=None):
    """
    Placeholder for Google Sheets connection.
    
    In a real implementation, this would use the Google Sheets API to fetch data.
    
    Parameters:
    -----------
    sheet_id : str
        Google Sheet ID
    sheet_range : str
        Range of cells to fetch
    api_key : str
        Google API key (optional, can also use OAuth)
    
    Returns:
    --------
    DataFrame
        Pandas DataFrame with sheet data
    """
    # This is just a placeholder
    print("Google Sheets integration not implemented in this version")
    
    # Return sample data
    sample_data = {
        "Column A": ["Value 1", "Value 2", "Value 3"],
        "Column B": [100, 200, 300],
        "Column C": [True, False, True]
    }
    
    return pd.DataFrame(sample_data)

# Function to generate sample data
def generate_sample_data(data_type, num_rows=100, start_date=None, num_days=30):
    """
    Generate sample data for demonstration purposes.
    
    Parameters:
    -----------
    data_type : str
        Type of sample data to generate
    num_rows : int
        Number of rows to generate
    start_date : str
        Start date for time series data (YYYY-MM-DD)
    num_days : int
        Number of days for time series data
    
    Returns:
    --------
    DataFrame
        Pandas DataFrame with sample data
    """
    if start_date is None:
        start_date = datetime.now().replace(day=1)
    elif isinstance(start_date, str):
        start_date = datetime.strptime(start_date, "%Y-%m-%d")
    
    if data_type == "sales":
        # Generate sample sales data
        dates = pd.date_range(start=start_date, periods=num_days)
        products = ["Product A", "Product B", "Product C"]
        regions = ["North", "South", "East", "West"]
        
        data = []
        for date in dates:
            for product in products:
                for region in regions:
                    data.append({
                        "date": date,
                        "product": product,
                        "region": region,
                        "sales": np.random.randint(100, 1000),
                        "units": np.random.randint(10, 100),
                        "revenue": np.round(np.random.uniform(1000, 10000), 2)
                    })
        
        return pd.DataFrame(data)
    
    elif data_type == "website_traffic":
        # Generate sample website traffic data
        dates = pd.date_range(start=start_date, periods=num_days)
        pages = ["Home", "Products", "About", "Contact", "Blog"]
        
        data = []
        for date in dates:
            for page in pages:
                data.append({
                    "date": date,
                    "page": page,
                    "visits": np.random.randint(100, 5000),
                    "unique_visitors": np.random.randint(50, 4000),
                    "bounce_rate": np.round(np.random.uniform(0.1, 0.9), 2),
                    "avg_time_on_page": np.round(np.random.uniform(10, 300), 2)
                })
        
        return pd.DataFrame(data)
    
    elif data_type == "customer_data":
        # Generate sample customer data
        countries = ["USA", "Canada", "UK", "Germany", "France", "Australia", "Japan"]
        status = ["Active", "Inactive", "Pending"]
        segments = ["Enterprise", "SMB", "Startup"]
        
        data = []
        for i in range(num_rows):
            signup_date = pd.Timestamp(start_date) + pd.Timedelta(days=np.random.randint(0, num_days))
            data.append({
                "customer_id": f"CUST-{i+1000}",
                "name": f"Customer {i+1}",
                "country": np.random.choice(countries),
                "status": np.random.choice(status, p=[0.7, 0.2, 0.1]),
                "segment": np.random.choice(segments),
                "signup_date": signup_date,
                "lifetime_value": np.round(np.random.uniform(100, 50000), 2),
                "num_purchases": np.random.randint(1, 50)
            })
        
        return pd.DataFrame(data)
    
    elif data_type == "social_media":
        # Generate sample social media metrics
        dates = pd.date_range(start=start_date, periods=num_days)
        platforms = ["Facebook", "Twitter", "Instagram", "LinkedIn", "TikTok"]
        
        data = []
        for date in dates:
            for platform in platforms:
                data.append({
                    "date": date,
                    "platform": platform,
                    "followers": np.random.randint(1000, 100000),
                    "posts": np.random.randint(1, 10),
                    "likes": np.random.randint(100, 5000),
                    "shares": np.random.randint(10, 1000),
                    "comments": np.random.randint(5, 500),
                    "engagement_rate": np.round(np.random.uniform(0.01, 0.1), 4)
                })
        
        return pd.DataFrame(data)
    
    else:
        # Default: generate generic data
        data = {
            "id": range(1, num_rows + 1),
            "value_a": np.random.randint(1, 100, num_rows),
            "value_b": np.random.randint(100, 1000, num_rows),
            "category": np.random.choice(["A", "B", "C"], num_rows),
            "metric": np.round(np.random.uniform(0, 1, num_rows), 2)
        }
        
        return pd.DataFrame(data)
