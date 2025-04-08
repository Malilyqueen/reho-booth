import pandas as pd
import numpy as np
import streamlit as st
from datetime import datetime, timedelta
import re

def preview_dataframe(df, rows=10):
    """
    Display a preview of a dataframe with additional formatting.
    
    Parameters:
    -----------
    df : DataFrame
        Pandas DataFrame to preview
    rows : int
        Number of rows to display
    """
    # Display the dataframe
    st.dataframe(
        df.head(rows), 
        use_container_width=True,
        hide_index=False
    )
    
    # Show row and column counts
    st.caption(f"Showing {min(rows, len(df))} of {len(df)} rows and {len(df.columns)} columns")

def get_data_summary(df):
    """
    Generate a summary of a dataframe including data types, missing values, etc.
    
    Parameters:
    -----------
    df : DataFrame
        Pandas DataFrame to summarize
        
    Returns:
    --------
    dict
        Dictionary containing summary information
    """
    # Get basic info
    summary = {
        "rows": len(df),
        "columns": len(df.columns),
        "missing_values": int(df.isna().sum().sum()),
        "memory_usage": str(round(df.memory_usage(deep=True).sum() / (1024 * 1024), 2)) + " MB",
        "column_info": []
    }
    
    # Get column information
    for col in df.columns:
        col_type = str(df[col].dtype)
        
        # Check if date column
        is_date = False
        if col_type == 'object':
            try:
                pd.to_datetime(df[col])
                is_date = True
                col_type = "datetime"
            except:
                pass
        
        # Get unique values info
        unique_count = df[col].nunique()
        
        # Get min, max, mean for numeric columns
        stats = {}
        if np.issubdtype(df[col].dtype, np.number):
            stats = {
                "min": float(df[col].min()) if not pd.isna(df[col].min()) else None,
                "max": float(df[col].max()) if not pd.isna(df[col].max()) else None,
                "mean": float(df[col].mean()) if not pd.isna(df[col].mean()) else None,
                "median": float(df[col].median()) if not pd.isna(df[col].median()) else None
            }
        elif is_date:
            # For date columns, get min and max dates
            dates = pd.to_datetime(df[col])
            stats = {
                "min_date": dates.min().strftime("%Y-%m-%d") if not pd.isna(dates.min()) else None,
                "max_date": dates.max().strftime("%Y-%m-%d") if not pd.isna(dates.max()) else None,
                "range_days": (dates.max() - dates.min()).days if not pd.isna(dates.min()) and not pd.isna(dates.max()) else None
            }
        
        # Get sample values for categorical columns
        sample_values = []
        if col_type in ['object', 'category'] and not is_date:
            sample_values = df[col].dropna().unique()[:5].tolist()
            # Convert to strings for JSON serialization
            sample_values = [str(val) for val in sample_values]
        
        # Compile column information
        col_info = {
            "name": col,
            "type": col_type,
            "missing": int(df[col].isna().sum()),
            "unique_values": int(unique_count),
            "stats": stats
        }
        
        if sample_values:
            col_info["sample_values"] = sample_values
        
        summary["column_info"].append(col_info)
    
    return summary

def filter_dataframe(df, filters):
    """
    Apply filters to a dataframe.
    
    Parameters:
    -----------
    df : DataFrame
        Pandas DataFrame to filter
    filters : list
        List of filter dictionaries with column, operation, and value
        
    Returns:
    --------
    DataFrame
        Filtered DataFrame
    """
    filtered_df = df.copy()
    
    for filter_dict in filters:
        column = filter_dict.get("column")
        operation = filter_dict.get("operation")
        value = filter_dict.get("value")
        
        if column is None or operation is None or value is None:
            continue
        
        # Apply filter based on operation
        if operation == "equals":
            filtered_df = filtered_df[filtered_df[column] == value]
        elif operation == "not_equals":
            filtered_df = filtered_df[filtered_df[column] != value]
        elif operation == "greater_than":
            filtered_df = filtered_df[filtered_df[column] > value]
        elif operation == "less_than":
            filtered_df = filtered_df[filtered_df[column] < value]
        elif operation == "contains":
            if filtered_df[column].dtype == 'object':
                filtered_df = filtered_df[filtered_df[column].str.contains(value, na=False)]
        elif operation == "starts_with":
            if filtered_df[column].dtype == 'object':
                filtered_df = filtered_df[filtered_df[column].str.startswith(value, na=False)]
        elif operation == "ends_with":
            if filtered_df[column].dtype == 'object':
                filtered_df = filtered_df[filtered_df[column].str.endswith(value, na=False)]
        elif operation == "in_list":
            filtered_df = filtered_df[filtered_df[column].isin(value)]
        elif operation == "not_in_list":
            filtered_df = filtered_df[~filtered_df[column].isin(value)]
        elif operation == "between":
            min_val, max_val = value
            filtered_df = filtered_df[(filtered_df[column] >= min_val) & (filtered_df[column] <= max_val)]
        elif operation == "date_range":
            start_date, end_date = value
            # Convert to datetime if needed
            if filtered_df[column].dtype != 'datetime64[ns]':
                filtered_df[column] = pd.to_datetime(filtered_df[column])
            filtered_df = filtered_df[(filtered_df[column] >= start_date) & (filtered_df[column] <= end_date)]
    
    return filtered_df

def apply_transformation(df, operation, params):
    """
    Apply a transformation operation to a dataframe.
    
    Parameters:
    -----------
    df : DataFrame
        Pandas DataFrame to transform
    operation : str
        Transformation operation to apply
    params : dict
        Parameters for the transformation
        
    Returns:
    --------
    DataFrame
        Transformed DataFrame
    """
    # Make a copy of the dataframe to avoid modifying the original
    result_df = df.copy()
    
    if operation == "filter_rows":
        column = params.get("column")
        filter_type = params.get("type")
        
        if filter_type == "range":
            min_value = params.get("min_value")
            max_value = params.get("max_value")
            result_df = result_df[(result_df[column] >= min_value) & (result_df[column] <= max_value)]
        
        elif filter_type == "greater_than":
            value = params.get("value")
            result_df = result_df[result_df[column] > value]
        
        elif filter_type == "less_than":
            value = params.get("value")
            result_df = result_df[result_df[column] < value]
        
        elif filter_type == "equal_to":
            value = params.get("value")
            result_df = result_df[result_df[column] == value]
        
        elif filter_type == "in_list":
            values = params.get("values")
            result_df = result_df[result_df[column].isin(values)]
        
        elif filter_type == "contains":
            value = params.get("value")
            if result_df[column].dtype == 'object':
                result_df = result_df[result_df[column].str.contains(value, na=False)]
        
        elif filter_type == "starts_with":
            value = params.get("value")
            if result_df[column].dtype == 'object':
                result_df = result_df[result_df[column].str.startswith(value, na=False)]
        
        elif filter_type == "ends_with":
            value = params.get("value")
            if result_df[column].dtype == 'object':
                result_df = result_df[result_df[column].str.endswith(value, na=False)]
        
        elif filter_type == "date_range":
            start_date = params.get("start_date")
            end_date = params.get("end_date")
            # Convert to datetime if needed
            if result_df[column].dtype != 'datetime64[ns]':
                result_df[column] = pd.to_datetime(result_df[column])
            result_df = result_df[(result_df[column] >= start_date) & (result_df[column] <= end_date)]
    
    elif operation == "select_columns":
        columns = params.get("columns")
        result_df = result_df[columns]
    
    elif operation == "sort_data":
        column = params.get("column")
        ascending = params.get("ascending", True)
        result_df = result_df.sort_values(by=column, ascending=ascending)
    
    elif operation == "aggregate_data":
        group_columns = params.get("group_columns")
        aggregations = params.get("aggregations", {})
        
        # Convert to expected format for pandas agg
        agg_dict = {}
        for col, funcs in aggregations.items():
            agg_dict[col] = funcs
        
        result_df = result_df.groupby(group_columns).agg(agg_dict).reset_index()
    
    elif operation == "create_column":
        new_column = params.get("new_column")
        method = params.get("method")
        
        if method == "formula":
            formula_params = params.get("formula_params", {})
            formula_type = formula_params.get("type")
            
            if formula_type == "basic_arithmetic":
                col1 = formula_params.get("col1")
                operation = formula_params.get("operation")
                operand_type = formula_params.get("operand_type")
                
                if operand_type == "column":
                    col2 = formula_params.get("col2")
                    
                    if operation == "+":
                        result_df[new_column] = result_df[col1] + result_df[col2]
                    elif operation == "-":
                        result_df[new_column] = result_df[col1] - result_df[col2]
                    elif operation == "*":
                        result_df[new_column] = result_df[col1] * result_df[col2]
                    elif operation == "/":
                        # Avoid division by zero
                        result_df[new_column] = result_df[col1] / result_df[col2].replace(0, np.nan)
                    elif operation == "^":
                        result_df[new_column] = result_df[col1] ** result_df[col2]
                    elif operation == "%":
                        # Modulo operation
                        result_df[new_column] = result_df[col1] % result_df[col2].replace(0, np.nan)
                
                else:  # operand_type == "value"
                    value = formula_params.get("value")
                    
                    if operation == "+":
                        result_df[new_column] = result_df[col1] + value
                    elif operation == "-":
                        result_df[new_column] = result_df[col1] - value
                    elif operation == "*":
                        result_df[new_column] = result_df[col1] * value
                    elif operation == "/":
                        # Avoid division by zero
                        if value == 0:
                            result_df[new_column] = np.nan
                        else:
                            result_df[new_column] = result_df[col1] / value
                    elif operation == "^":
                        result_df[new_column] = result_df[col1] ** value
                    elif operation == "%":
                        # Modulo operation
                        if value == 0:
                            result_df[new_column] = np.nan
                        else:
                            result_df[new_column] = result_df[col1] % value
            
            elif formula_type == "custom_formula":
                formula = formula_params.get("formula")
                
                # Replace column names in curly braces with actual references
                for col in result_df.columns:
                    formula = formula.replace(f"{{{col}}}", f"result_df['{col}']")
                
                # Evaluate the formula (use eval carefully in production!)
                result_df[new_column] = eval(formula)
        
        elif method == "conditional":
            condition_params = params.get("condition_params", {})
            true_value = params.get("true_value")
            false_value = params.get("false_value")
            
            condition_type = condition_params.get("type")
            column = condition_params.get("column")
            
            mask = None
            
            if condition_type == "greater_than":
                threshold = condition_params.get("threshold")
                mask = result_df[column] > threshold
            
            elif condition_type == "less_than":
                threshold = condition_params.get("threshold")
                mask = result_df[column] < threshold
            
            elif condition_type == "equal_to":
                value = condition_params.get("value")
                mask = result_df[column] == value
            
            elif condition_type == "between":
                min_threshold = condition_params.get("min_threshold")
                max_threshold = condition_params.get("max_threshold")
                mask = (result_df[column] >= min_threshold) & (result_df[column] <= max_threshold)
            
            elif condition_type == "in_list":
                values = condition_params.get("values")
                mask = result_df[column].isin(values)
            
            elif condition_type == "contains":
                value = condition_params.get("value")
                if result_df[column].dtype == 'object':
                    mask = result_df[column].str.contains(value, na=False)
                else:
                    mask = np.zeros(len(result_df), dtype=bool)
            
            if mask is not None:
                result_df[new_column] = np.where(mask, true_value, false_value)
        
        elif method == "text_manipulation":
            text_params = params.get("text_params", {})
            manipulation_type = text_params.get("type")
            
            if manipulation_type == "extract_substring":
                column = text_params.get("column")
                start = text_params.get("start", 0)
                length = text_params.get("length")
                
                result_df[new_column] = result_df[column].astype(str).apply(
                    lambda x: x[start:start+length] if len(x) > start else ""
                )
            
            elif manipulation_type == "concatenate":
                if text_params.get("concat_with") == "column":
                    column1 = text_params.get("column1")
                    column2 = text_params.get("column2")
                    separator = text_params.get("separator", "")
                    
                    result_df[new_column] = result_df[column1].astype(str) + separator + result_df[column2].astype(str)
                
                else:  # concat_with == "text"
                    column = text_params.get("column")
                    text = text_params.get("text", "")
                    position = text_params.get("position", "after")
                    
                    if position == "before":
                        result_df[new_column] = text + result_df[column].astype(str)
                    else:
                        result_df[new_column] = result_df[column].astype(str) + text
            
            elif manipulation_type == "replace":
                column = text_params.get("column")
                find = text_params.get("find", "")
                replace = text_params.get("replace", "")
                
                result_df[new_column] = result_df[column].astype(str).str.replace(find, replace)
            
            elif manipulation_type == "change_case":
                column = text_params.get("column")
                case = text_params.get("case", "lower")
                
                if case == "upper":
                    result_df[new_column] = result_df[column].astype(str).str.upper()
                elif case == "lower":
                    result_df[new_column] = result_df[column].astype(str).str.lower()
                elif case == "title_case":
                    result_df[new_column] = result_df[column].astype(str).str.title()
        
        elif method == "date_extraction":
            date_column = params.get("date_column")
            component = params.get("component")
            
            # Convert to datetime if needed
            if result_df[date_column].dtype != 'datetime64[ns]':
                result_df[date_column] = pd.to_datetime(result_df[date_column], errors='coerce')
            
            if component == "year":
                result_df[new_column] = result_df[date_column].dt.year
            elif component == "month":
                result_df[new_column] = result_df[date_column].dt.month
            elif component == "day":
                result_df[new_column] = result_df[date_column].dt.day
            elif component == "quarter":
                result_df[new_column] = result_df[date_column].dt.quarter
            elif component == "week":
                result_df[new_column] = result_df[date_column].dt.isocalendar().week
            elif component == "day_of_week":
                result_df[new_column] = result_df[date_column].dt.dayofweek + 1  # 1-7 for Monday-Sunday
            elif component == "hour":
                result_df[new_column] = result_df[date_column].dt.hour
            elif component == "minute":
                result_df[new_column] = result_df[date_column].dt.minute
    
    elif operation == "rename_columns":
        rename_map = params.get("rename_map", {})
        result_df = result_df.rename(columns=rename_map)
    
    elif operation == "handle_missing":
        method = params.get("method")
        columns = params.get("columns", [])
        
        if method == "drop_rows":
            result_df = result_df.dropna(subset=columns)
        
        elif method == "fill_value":
            value = params.get("value")
            result_df[columns] = result_df[columns].fillna(value)
        
        elif method == "fill_stats":
            stat = params.get("stat", "mean")
            
            for col in columns:
                if stat == "mean" and pd.api.types.is_numeric_dtype(result_df[col]):
                    result_df[col] = result_df[col].fillna(result_df[col].mean())
                elif stat == "median" and pd.api.types.is_numeric_dtype(result_df[col]):
                    result_df[col] = result_df[col].fillna(result_df[col].median())
                elif stat == "mode":
                    result_df[col] = result_df[col].fillna(result_df[col].mode()[0] if not result_df[col].mode().empty else None)
                elif stat == "minimum" and pd.api.types.is_numeric_dtype(result_df[col]):
                    result_df[col] = result_df[col].fillna(result_df[col].min())
                elif stat == "maximum" and pd.api.types.is_numeric_dtype(result_df[col]):
                    result_df[col] = result_df[col].fillna(result_df[col].max())
        
        elif method == "interpolate":
            interp_method = params.get("interp_method", "linear")
            
            if interp_method == "linear":
                result_df[columns] = result_df[columns].interpolate(method='linear')
            elif interp_method == "forward_fill":
                result_df[columns] = result_df[columns].fillna(method='ffill')
            elif interp_method == "backward_fill":
                result_df[columns] = result_df[columns].fillna(method='bfill')
    
    elif operation == "change_type":
        column = params.get("column")
        new_type = params.get("new_type")
        
        if new_type == "string":
            result_df[column] = result_df[column].astype(str)
        
        elif new_type == "int":
            # First convert to float to handle NaN values, then to int
            result_df[column] = result_df[column].astype(float).fillna(0).astype(int)
        
        elif new_type == "float":
            result_df[column] = result_df[column].astype(float)
        
        elif new_type == "bool":
            result_df[column] = result_df[column].astype(bool)
        
        elif new_type == "datetime":
            date_format = params.get("date_format")
            if date_format:
                result_df[column] = pd.to_datetime(result_df[column], format=date_format)
            else:
                result_df[column] = pd.to_datetime(result_df[column])
        
        elif new_type == "category":
            result_df[column] = result_df[column].astype('category')
    
    elif operation == "apply_function":
        column = params.get("column")
        function_type = params.get("function_type")
        function = params.get("function")
        
        if function_type == "standard":
            if function == "abs":
                result_df[column] = result_df[column].abs()
            elif function == "log":
                result_df[column] = np.log(result_df[column])
            elif function == "exp":
                result_df[column] = np.exp(result_df[column])
            elif function == "sqrt":
                result_df[column] = np.sqrt(result_df[column])
            elif function == "round":
                result_df[column] = np.round(result_df[column])
            elif function == "floor":
                result_df[column] = np.floor(result_df[column])
            elif function == "ceil":
                result_df[column] = np.ceil(result_df[column])
        
        elif function_type == "custom":
            # Create a lambda function from the expression
            # 'x' is used as the placeholder for the column value
            try:
                lambda_func = eval(f"lambda x: {function}")
                result_df[column] = result_df[column].apply(lambda_func)
            except Exception as e:
                raise ValueError(f"Error in custom function: {str(e)}")
    
    return result_df

def save_transformation(data_source, transformation_name, steps):
    """
    Save a transformation recipe to session state.
    
    Parameters:
    -----------
    data_source : str
        Name of the data source
    transformation_name : str
        Name of the transformation
    steps : list
        List of transformation steps
    """
    # Initialize transformations for the data source if not exist
    if "transformations" not in st.session_state:
        st.session_state.transformations = {}
    
    if data_source not in st.session_state.transformations:
        st.session_state.transformations[data_source] = {}
    
    # Save the transformation
    st.session_state.transformations[data_source][transformation_name] = {
        "steps": steps,
        "created_at": datetime.now()
    }
