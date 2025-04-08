import streamlit as st
import pandas as pd
import numpy as np
from datetime import datetime
import os
import sys
import json

# Add utils to path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from utils.data_processing import preview_dataframe, get_data_summary, apply_transformation, save_transformation

st.set_page_config(
    page_title="Data Transformation | PM Data Tool",
    page_icon="📊",
    layout="wide"
)

st.title("Data Transformation")
st.markdown("Transform your data with various operations to prepare it for analysis.")

# Main layout
data_source_col, transformation_col = st.columns([1, 2])

with data_source_col:
    st.header("Select Data Source")
    
    if not st.session_state.data_sources:
        st.info("No data sources available. Import data first.")
    else:
        data_source = st.selectbox(
            "Data Source",
            list(st.session_state.data_sources.keys())
        )
        
        # Get the original data
        original_df = st.session_state.data_sources[data_source]["data"]
        
        # Display the data source info
        st.subheader("Data Source Info")
        st.write(f"**Source Type:** {st.session_state.data_sources[data_source]['source_type'].capitalize()}")
        st.write(f"**Imported At:** {st.session_state.data_sources[data_source]['imported_at'].strftime('%Y-%m-%d %H:%M:%S')}")
        st.write(f"**Rows:** {st.session_state.data_sources[data_source]['rows']}")
        st.write(f"**Columns:** {len(st.session_state.data_sources[data_source]['columns'])}")
        
        # Display data preview
        st.subheader("Data Preview")
        preview_dataframe(original_df)
        
        # Show data summary
        with st.expander("Data Summary", expanded=False):
            summary = get_data_summary(original_df)
            st.json(summary)
        
        # Load saved transformations
        st.subheader("Saved Transformations")
        
        if data_source in st.session_state.transformations:
            transformation_list = list(st.session_state.transformations[data_source].keys())
            
            if transformation_list:
                selected_transformation = st.selectbox(
                    "Select Saved Transformation",
                    ["None"] + transformation_list
                )
                
                if selected_transformation != "None":
                    transformation_details = st.session_state.transformations[data_source][selected_transformation]
                    
                    st.write(f"**Created At:** {transformation_details['created_at'].strftime('%Y-%m-%d %H:%M:%S')}")
                    st.write(f"**Steps:** {len(transformation_details['steps'])}")
                    
                    if st.button("Apply Saved Transformation"):
                        # Create a copy of the original DataFrame
                        df = original_df.copy()
                        
                        # Apply each transformation step
                        for step in transformation_details["steps"]:
                            df = apply_transformation(df, step["operation"], step["params"])
                        
                        # Display the transformed data
                        st.subheader("Transformed Data Preview")
                        preview_dataframe(df)
                        
                        # Option to save as new data source
                        new_source_name = st.text_input("New Data Source Name", f"{data_source}_transformed")
                        
                        if st.button("Save as New Data Source"):
                            if new_source_name in st.session_state.data_sources:
                                st.warning(f"Data source '{new_source_name}' already exists. Please choose a different name.")
                            else:
                                # Save the transformed data as a new data source
                                st.session_state.data_sources[new_source_name] = {
                                    "data": df,
                                    "source_type": "transformed",
                                    "original_source": data_source,
                                    "transformation": selected_transformation,
                                    "imported_at": datetime.now(),
                                    "columns": list(df.columns),
                                    "rows": len(df)
                                }
                                
                                st.success(f"Transformed data saved as new data source: '{new_source_name}'")
            else:
                st.info("No saved transformations for this data source.")
        else:
            st.info("No saved transformations for this data source.")

with transformation_col:
    st.header("Apply Transformations")
    
    if not st.session_state.data_sources:
        st.info("No data sources available. Import data first.")
    else:
        # Create a copy of the DataFrame for transformations
        if "current_df" not in st.session_state:
            st.session_state.current_df = original_df.copy()
        
        # Initialize transformation steps if not exist
        if "transformation_steps" not in st.session_state:
            st.session_state.transformation_steps = []
        
        # Transformation operations
        transformation_type = st.selectbox(
            "Transformation Type",
            ["Filter Rows", "Select Columns", "Sort Data", "Aggregate Data", "Create New Column", 
             "Rename Columns", "Handle Missing Values", "Change Data Types", "Apply Function"]
        )
        
        # Different transformation options based on selected type
        if transformation_type == "Filter Rows":
            st.subheader("Filter Rows")
            
            # Get columns from the original dataframe
            columns = st.session_state.current_df.columns.tolist()
            
            filter_column = st.selectbox("Column to Filter", columns)
            
            # Determine column data type
            col_dtype = st.session_state.current_df[filter_column].dtype
            
            if np.issubdtype(col_dtype, np.number):
                # Numeric column
                min_val = float(st.session_state.current_df[filter_column].min())
                max_val = float(st.session_state.current_df[filter_column].max())
                
                filter_type = st.selectbox(
                    "Filter Type",
                    ["Range", "Greater Than", "Less Than", "Equal To"]
                )
                
                if filter_type == "Range":
                    filter_value = st.slider(
                        "Select Range",
                        min_val,
                        max_val,
                        (min_val, max_val)
                    )
                    
                    filter_params = {
                        "column": filter_column,
                        "type": "range",
                        "min_value": filter_value[0],
                        "max_value": filter_value[1]
                    }
                else:
                    filter_value = st.number_input(
                        "Filter Value",
                        value=float((min_val + max_val) / 2)
                    )
                    
                    filter_params = {
                        "column": filter_column,
                        "type": filter_type.lower().replace(" ", "_"),
                        "value": filter_value
                    }
            
            elif pd.api.types.is_datetime64_any_dtype(col_dtype) or str(col_dtype).startswith('datetime'):
                # Date/time column
                min_date = st.session_state.current_df[filter_column].min()
                max_date = st.session_state.current_df[filter_column].max()
                
                if isinstance(min_date, pd.Timestamp):
                    min_date = min_date.date()
                    max_date = max_date.date()
                
                filter_type = st.selectbox(
                    "Filter Type",
                    ["Date Range", "After Date", "Before Date", "Equal To Date"]
                )
                
                if filter_type == "Date Range":
                    filter_value = st.date_input(
                        "Select Date Range",
                        value=(min_date, max_date)
                    )
                    
                    filter_params = {
                        "column": filter_column,
                        "type": "date_range",
                        "start_date": filter_value[0].isoformat(),
                        "end_date": filter_value[1].isoformat()
                    }
                else:
                    filter_value = st.date_input(
                        "Select Date",
                        value=min_date
                    )
                    
                    filter_params = {
                        "column": filter_column,
                        "type": filter_type.lower().replace(" ", "_").replace("equal_to_date", "equal_to"),
                        "date": filter_value.isoformat()
                    }
            
            else:
                # String/categorical column
                unique_values = st.session_state.current_df[filter_column].unique().tolist()
                
                filter_type = st.selectbox(
                    "Filter Type",
                    ["Equal To", "Contains", "Starts With", "Ends With", "In List"]
                )
                
                if filter_type == "In List":
                    filter_value = st.multiselect(
                        "Select Values",
                        unique_values
                    )
                    
                    filter_params = {
                        "column": filter_column,
                        "type": "in_list",
                        "values": filter_value
                    }
                else:
                    filter_value = st.selectbox(
                        "Filter Value",
                        [""] + unique_values
                    )
                    
                    filter_params = {
                        "column": filter_column,
                        "type": filter_type.lower().replace(" ", "_"),
                        "value": filter_value
                    }
            
            if st.button("Apply Filter"):
                # Apply the filter
                operation = "filter_rows"
                
                try:
                    filtered_df = apply_transformation(st.session_state.current_df, operation, filter_params)
                    
                    # Update the current dataframe
                    st.session_state.current_df = filtered_df
                    
                    # Add step to transformation steps
                    st.session_state.transformation_steps.append({
                        "operation": operation,
                        "params": filter_params
                    })
                    
                    st.success(f"Filter applied. Rows remaining: {len(filtered_df)}")
                    st.rerun()
                except Exception as e:
                    st.error(f"Error applying filter: {str(e)}")
        
        elif transformation_type == "Select Columns":
            st.subheader("Select Columns")
            
            # Get columns from the current dataframe
            columns = st.session_state.current_df.columns.tolist()
            
            selected_columns = st.multiselect(
                "Select Columns to Keep",
                columns,
                default=columns
            )
            
            if st.button("Apply Column Selection"):
                operation = "select_columns"
                params = {"columns": selected_columns}
                
                try:
                    filtered_df = apply_transformation(st.session_state.current_df, operation, params)
                    
                    # Update the current dataframe
                    st.session_state.current_df = filtered_df
                    
                    # Add step to transformation steps
                    st.session_state.transformation_steps.append({
                        "operation": operation,
                        "params": params
                    })
                    
                    st.success(f"Selected {len(selected_columns)} columns")
                    st.rerun()
                except Exception as e:
                    st.error(f"Error selecting columns: {str(e)}")
        
        elif transformation_type == "Sort Data":
            st.subheader("Sort Data")
            
            # Get columns from the current dataframe
            columns = st.session_state.current_df.columns.tolist()
            
            sort_column = st.selectbox("Sort By Column", columns)
            sort_order = st.selectbox("Sort Order", ["Ascending", "Descending"])
            
            if st.button("Apply Sorting"):
                operation = "sort_data"
                params = {
                    "column": sort_column,
                    "ascending": sort_order == "Ascending"
                }
                
                try:
                    sorted_df = apply_transformation(st.session_state.current_df, operation, params)
                    
                    # Update the current dataframe
                    st.session_state.current_df = sorted_df
                    
                    # Add step to transformation steps
                    st.session_state.transformation_steps.append({
                        "operation": operation,
                        "params": params
                    })
                    
                    st.success(f"Data sorted by '{sort_column}' in {sort_order.lower()} order")
                    st.rerun()
                except Exception as e:
                    st.error(f"Error sorting data: {str(e)}")
        
        elif transformation_type == "Aggregate Data":
            st.subheader("Aggregate Data")
            
            # Get columns from the current dataframe
            columns = st.session_state.current_df.columns.tolist()
            
            # Get columns based on data types
            numeric_cols = st.session_state.current_df.select_dtypes(include=['number']).columns.tolist()
            categorical_cols = st.session_state.current_df.select_dtypes(include=['object', 'category']).columns.tolist()
            
            # Add date columns that might be stored as strings
            date_cols = []
            for col in st.session_state.current_df.columns:
                if "date" in col.lower() or "time" in col.lower() or "day" in col.lower():
                    try:
                        pd.to_datetime(st.session_state.current_df[col])
                        date_cols.append(col)
                    except:
                        pass
            
            # Group by columns
            group_columns = st.multiselect(
                "Group By Columns",
                categorical_cols + date_cols
            )
            
            if group_columns:
                # Aggregate columns and functions
                agg_functions = []
                
                agg_container = st.container()
                add_agg = st.button("Add Aggregation")
                
                if "agg_functions" not in st.session_state:
                    st.session_state.agg_functions = []
                
                if add_agg:
                    st.session_state.agg_functions.append({
                        "column": numeric_cols[0] if numeric_cols else None,
                        "function": "sum"
                    })
                
                with agg_container:
                    for i, agg in enumerate(st.session_state.agg_functions):
                        col1, col2, col3 = st.columns([2, 2, 1])
                        
                        with col1:
                            agg["column"] = st.selectbox(
                                f"Column {i+1}",
                                numeric_cols,
                                index=numeric_cols.index(agg["column"]) if agg["column"] in numeric_cols else 0
                            )
                        
                        with col2:
                            agg["function"] = st.selectbox(
                                f"Function {i+1}",
                                ["sum", "mean", "median", "min", "max", "count"],
                                index=["sum", "mean", "median", "min", "max", "count"].index(agg["function"])
                            )
                        
                        with col3:
                            if st.button("Remove", key=f"remove_agg_{i}"):
                                st.session_state.agg_functions.pop(i)
                                st.rerun()
                
                if st.button("Apply Aggregation"):
                    if not st.session_state.agg_functions:
                        st.warning("Please add at least one aggregation function")
                    else:
                        operation = "aggregate_data"
                        
                        # Convert aggregation functions to the format required by the transformation function
                        agg_dict = {}
                        for agg in st.session_state.agg_functions:
                            if agg["column"] not in agg_dict:
                                agg_dict[agg["column"]] = []
                            agg_dict[agg["column"]].append(agg["function"])
                        
                        params = {
                            "group_columns": group_columns,
                            "aggregations": agg_dict
                        }
                        
                        try:
                            aggregated_df = apply_transformation(st.session_state.current_df, operation, params)
                            
                            # Update the current dataframe
                            st.session_state.current_df = aggregated_df
                            
                            # Add step to transformation steps
                            st.session_state.transformation_steps.append({
                                "operation": operation,
                                "params": params
                            })
                            
                            st.success(f"Data aggregated by {', '.join(group_columns)}")
                            st.rerun()
                        except Exception as e:
                            st.error(f"Error aggregating data: {str(e)}")
            else:
                st.warning("Please select at least one column to group by")
        
        elif transformation_type == "Create New Column":
            st.subheader("Create New Column")
            
            # Get columns from the current dataframe
            columns = st.session_state.current_df.columns.tolist()
            
            # Get columns based on data types
            numeric_cols = st.session_state.current_df.select_dtypes(include=['number']).columns.tolist()
            
            new_column_name = st.text_input("New Column Name")
            
            creation_method = st.selectbox(
                "Creation Method",
                ["Formula", "Conditional", "Text Manipulation", "Date Extraction"]
            )
            
            if creation_method == "Formula":
                # Mathematical formula
                formula_type = st.selectbox(
                    "Formula Type",
                    ["Basic Arithmetic", "Custom Formula"]
                )
                
                if formula_type == "Basic Arithmetic":
                    col1 = st.selectbox("First Column", numeric_cols)
                    operation = st.selectbox("Operation", ["+", "-", "*", "/", "^", "%"])
                    
                    operand_type = st.selectbox("Second Operand Type", ["Column", "Value"])
                    
                    if operand_type == "Column":
                        col2 = st.selectbox("Second Column", numeric_cols)
                        formula_params = {
                            "type": "basic_arithmetic",
                            "col1": col1,
                            "operation": operation,
                            "operand_type": "column",
                            "col2": col2
                        }
                    else:
                        value = st.number_input("Value")
                        formula_params = {
                            "type": "basic_arithmetic",
                            "col1": col1,
                            "operation": operation,
                            "operand_type": "value",
                            "value": value
                        }
                else:
                    formula = st.text_area("Custom Formula", help="Use column names in curly braces, e.g., {col1} * {col2} + 10")
                    formula_params = {
                        "type": "custom_formula",
                        "formula": formula
                    }
                
                params = {
                    "new_column": new_column_name,
                    "method": "formula",
                    "formula_params": formula_params
                }
            
            elif creation_method == "Conditional":
                # Conditional logic
                condition_column = st.selectbox("Condition Column", columns)
                
                # Determine column data type
                col_dtype = st.session_state.current_df[condition_column].dtype
                
                if np.issubdtype(col_dtype, np.number):
                    # Numeric column
                    condition_type = st.selectbox(
                        "Condition Type",
                        ["Greater Than", "Less Than", "Equal To", "Between"]
                    )
                    
                    if condition_type == "Between":
                        min_val = float(st.session_state.current_df[condition_column].min())
                        max_val = float(st.session_state.current_df[condition_column].max())
                        
                        min_threshold = st.number_input("Minimum Threshold", value=min_val)
                        max_threshold = st.number_input("Maximum Threshold", value=max_val)
                        
                        condition_params = {
                            "type": "between",
                            "column": condition_column,
                            "min_threshold": min_threshold,
                            "max_threshold": max_threshold
                        }
                    else:
                        threshold = st.number_input("Threshold")
                        
                        condition_params = {
                            "type": condition_type.lower().replace(" ", "_"),
                            "column": condition_column,
                            "threshold": threshold
                        }
                else:
                    # String/categorical column
                    condition_type = st.selectbox(
                        "Condition Type",
                        ["Equal To", "Contains", "In List"]
                    )
                    
                    if condition_type == "In List":
                        unique_values = st.session_state.current_df[condition_column].unique().tolist()
                        values = st.multiselect("Values", unique_values)
                        
                        condition_params = {
                            "type": "in_list",
                            "column": condition_column,
                            "values": values
                        }
                    else:
                        value = st.text_input("Value")
                        
                        condition_params = {
                            "type": condition_type.lower().replace(" ", "_"),
                            "column": condition_column,
                            "value": value
                        }
                
                true_value = st.text_input("Value if Condition is True")
                false_value = st.text_input("Value if Condition is False")
                
                params = {
                    "new_column": new_column_name,
                    "method": "conditional",
                    "condition_params": condition_params,
                    "true_value": true_value,
                    "false_value": false_value
                }
            
            elif creation_method == "Text Manipulation":
                # Text manipulation
                text_column = st.selectbox("Text Column", columns)
                
                manipulation_type = st.selectbox(
                    "Manipulation Type",
                    ["Extract Substring", "Concatenate", "Replace", "Change Case"]
                )
                
                if manipulation_type == "Extract Substring":
                    start_pos = st.number_input("Start Position", value=0)
                    length = st.number_input("Length", value=5)
                    
                    text_params = {
                        "type": "extract_substring",
                        "column": text_column,
                        "start": start_pos,
                        "length": length
                    }
                
                elif manipulation_type == "Concatenate":
                    concat_with = st.selectbox("Concatenate With", ["Column", "Text"])
                    
                    if concat_with == "Column":
                        second_column = st.selectbox("Second Column", columns)
                        separator = st.text_input("Separator", value=" ")
                        
                        text_params = {
                            "type": "concatenate",
                            "column1": text_column,
                            "concat_with": "column",
                            "column2": second_column,
                            "separator": separator
                        }
                    else:
                        text_value = st.text_input("Text Value")
                        position = st.selectbox("Position", ["Before", "After"])
                        
                        text_params = {
                            "type": "concatenate",
                            "column": text_column,
                            "concat_with": "text",
                            "text": text_value,
                            "position": position.lower()
                        }
                
                elif manipulation_type == "Replace":
                    find_text = st.text_input("Find")
                    replace_with = st.text_input("Replace With")
                    
                    text_params = {
                        "type": "replace",
                        "column": text_column,
                        "find": find_text,
                        "replace": replace_with
                    }
                
                elif manipulation_type == "Change Case":
                    case_type = st.selectbox("Case", ["UPPER", "lower", "Title Case"])
                    
                    text_params = {
                        "type": "change_case",
                        "column": text_column,
                        "case": case_type.lower().replace(" ", "_")
                    }
                
                params = {
                    "new_column": new_column_name,
                    "method": "text_manipulation",
                    "text_params": text_params
                }
            
            elif creation_method == "Date Extraction":
                # Date component extraction
                date_column = st.selectbox("Date Column", columns)
                
                # Try to convert to datetime if needed
                if st.session_state.current_df[date_column].dtype != 'datetime64[ns]':
                    try:
                        pd.to_datetime(st.session_state.current_df[date_column])
                    except:
                        st.warning(f"Column '{date_column}' does not appear to contain valid dates")
                
                component = st.selectbox(
                    "Extract Component",
                    ["Year", "Month", "Day", "Quarter", "Week", "Day of Week", "Hour", "Minute"]
                )
                
                params = {
                    "new_column": new_column_name,
                    "method": "date_extraction",
                    "date_column": date_column,
                    "component": component.lower().replace(" ", "_")
                }
            
            if st.button("Create Column"):
                if not new_column_name:
                    st.warning("Please enter a name for the new column")
                else:
                    operation = "create_column"
                    
                    try:
                        modified_df = apply_transformation(st.session_state.current_df, operation, params)
                        
                        # Update the current dataframe
                        st.session_state.current_df = modified_df
                        
                        # Add step to transformation steps
                        st.session_state.transformation_steps.append({
                            "operation": operation,
                            "params": params
                        })
                        
                        st.success(f"Created new column: '{new_column_name}'")
                        st.rerun()
                    except Exception as e:
                        st.error(f"Error creating column: {str(e)}")
        
        elif transformation_type == "Rename Columns":
            st.subheader("Rename Columns")
            
            # Get columns from the current dataframe
            columns = st.session_state.current_df.columns.tolist()
            
            rename_map = {}
            
            for col in columns:
                new_name = st.text_input(f"Rename '{col}' to:", value=col)
                if new_name != col:
                    rename_map[col] = new_name
            
            if st.button("Apply Renaming"):
                if not rename_map:
                    st.warning("No columns selected for renaming")
                else:
                    operation = "rename_columns"
                    params = {"rename_map": rename_map}
                    
                    try:
                        renamed_df = apply_transformation(st.session_state.current_df, operation, params)
                        
                        # Update the current dataframe
                        st.session_state.current_df = renamed_df
                        
                        # Add step to transformation steps
                        st.session_state.transformation_steps.append({
                            "operation": operation,
                            "params": params
                        })
                        
                        st.success(f"Renamed {len(rename_map)} columns")
                        st.rerun()
                    except Exception as e:
                        st.error(f"Error renaming columns: {str(e)}")
        
        elif transformation_type == "Handle Missing Values":
            st.subheader("Handle Missing Values")
            
            # Get columns from the current dataframe
            columns = st.session_state.current_df.columns.tolist()
            
            # Count missing values in each column
            missing_counts = st.session_state.current_df.isnull().sum()
            missing_cols = [col for col in columns if missing_counts[col] > 0]
            
            if not missing_cols:
                st.info("No missing values found in the dataset")
            else:
                st.write("Columns with missing values:")
                for col in missing_cols:
                    st.write(f"- {col}: {missing_counts[col]} missing values")
                
                target_columns = st.multiselect(
                    "Select Columns to Handle",
                    missing_cols
                )
                
                if target_columns:
                    handling_method = st.selectbox(
                        "Handling Method",
                        ["Drop Rows", "Fill with Value", "Fill with Statistics", "Fill with Interpolation"]
                    )
                    
                    if handling_method == "Drop Rows":
                        params = {
                            "method": "drop_rows",
                            "columns": target_columns
                        }
                    
                    elif handling_method == "Fill with Value":
                        fill_value = st.text_input("Fill Value")
                        
                        params = {
                            "method": "fill_value",
                            "columns": target_columns,
                            "value": fill_value
                        }
                    
                    elif handling_method == "Fill with Statistics":
                        statistic = st.selectbox(
                            "Statistic",
                            ["Mean", "Median", "Mode", "Minimum", "Maximum"]
                        )
                        
                        params = {
                            "method": "fill_stats",
                            "columns": target_columns,
                            "stat": statistic.lower()
                        }
                    
                    elif handling_method == "Fill with Interpolation":
                        method = st.selectbox(
                            "Interpolation Method",
                            ["Linear", "Forward Fill", "Backward Fill"]
                        )
                        
                        params = {
                            "method": "interpolate",
                            "columns": target_columns,
                            "interp_method": method.lower().replace(" ", "_")
                        }
                    
                    if st.button("Handle Missing Values"):
                        operation = "handle_missing"
                        
                        try:
                            cleaned_df = apply_transformation(st.session_state.current_df, operation, params)
                            
                            # Update the current dataframe
                            st.session_state.current_df = cleaned_df
                            
                            # Add step to transformation steps
                            st.session_state.transformation_steps.append({
                                "operation": operation,
                                "params": params
                            })
                            
                            st.success("Missing values handled successfully")
                            st.rerun()
                        except Exception as e:
                            st.error(f"Error handling missing values: {str(e)}")
                else:
                    st.warning("Please select at least one column to handle missing values")
        
        elif transformation_type == "Change Data Types":
            st.subheader("Change Data Types")
            
            # Get columns from the current dataframe
            columns = st.session_state.current_df.columns.tolist()
            
            # Display current data types
            st.write("Current Data Types:")
            for col in columns:
                st.write(f"- {col}: {st.session_state.current_df[col].dtype}")
            
            target_column = st.selectbox("Select Column to Change", columns)
            
            new_type = st.selectbox(
                "New Data Type",
                ["string", "int", "float", "bool", "datetime", "category"]
            )
            
            date_format = None
            if new_type == "datetime":
                date_format = st.text_input("Date Format (e.g., '%Y-%m-%d')", "%Y-%m-%d")
            
            if st.button("Change Data Type"):
                operation = "change_type"
                params = {
                    "column": target_column,
                    "new_type": new_type,
                    "date_format": date_format
                }
                
                try:
                    modified_df = apply_transformation(st.session_state.current_df, operation, params)
                    
                    # Update the current dataframe
                    st.session_state.current_df = modified_df
                    
                    # Add step to transformation steps
                    st.session_state.transformation_steps.append({
                        "operation": operation,
                        "params": params
                    })
                    
                    st.success(f"Changed data type of '{target_column}' to {new_type}")
                    st.rerun()
                except Exception as e:
                    st.error(f"Error changing data type: {str(e)}")
        
        elif transformation_type == "Apply Function":
            st.subheader("Apply Function")
            
            # Get columns from the current dataframe
            columns = st.session_state.current_df.columns.tolist()
            
            target_column = st.selectbox("Select Column", columns)
            
            function_type = st.selectbox(
                "Function Type",
                ["Standard Function", "Custom Function"]
            )
            
            if function_type == "Standard Function":
                function_name = st.selectbox(
                    "Function",
                    ["abs", "log", "exp", "sqrt", "round", "floor", "ceil"]
                )
                
                params = {
                    "column": target_column,
                    "function_type": "standard",
                    "function": function_name
                }
            else:
                function_expr = st.text_area(
                    "Custom Function",
                    "x * 2",  # Example function
                    help="Use 'x' to represent the column value, e.g., 'x * 2' or 'x.lower()'"
                )
                
                params = {
                    "column": target_column,
                    "function_type": "custom",
                    "function": function_expr
                }
            
            if st.button("Apply Function"):
                operation = "apply_function"
                
                try:
                    transformed_df = apply_transformation(st.session_state.current_df, operation, params)
                    
                    # Update the current dataframe
                    st.session_state.current_df = transformed_df
                    
                    # Add step to transformation steps
                    st.session_state.transformation_steps.append({
                        "operation": operation,
                        "params": params
                    })
                    
                    st.success(f"Applied function to column '{target_column}'")
                    st.rerun()
                except Exception as e:
                    st.error(f"Error applying function: {str(e)}")
        
        # Display current transformation preview
        st.subheader("Transformation Preview")
        
        if st.session_state.transformation_steps:
            st.write(f"Applied {len(st.session_state.transformation_steps)} transformation steps")
            
            # Show the transformed data
            preview_dataframe(st.session_state.current_df)
            
            # Save transformation
            st.subheader("Save Transformation")
            
            transformation_name = st.text_input("Transformation Name", f"{data_source}_transform_{len(st.session_state.transformation_steps)}_steps")
            
            if st.button("Save Transformation"):
                save_transformation(data_source, transformation_name, st.session_state.transformation_steps)
                st.success(f"Transformation '{transformation_name}' saved successfully")
            
            # Save as new data source
            st.subheader("Save as New Data Source")
            
            new_source_name = st.text_input("New Data Source Name", f"{data_source}_transformed")
            
            if st.button("Save as New Data Source"):
                if new_source_name in st.session_state.data_sources:
                    st.warning(f"Data source '{new_source_name}' already exists. Please choose a different name.")
                else:
                    # Save the transformed data as a new data source
                    st.session_state.data_sources[new_source_name] = {
                        "data": st.session_state.current_df,
                        "source_type": "transformed",
                        "original_source": data_source,
                        "transformation_steps": st.session_state.transformation_steps,
                        "imported_at": datetime.now(),
                        "columns": list(st.session_state.current_df.columns),
                        "rows": len(st.session_state.current_df)
                    }
                    
                    st.success(f"Transformed data saved as new data source: '{new_source_name}'")
            
            # Reset transformation
            if st.button("Reset Transformation"):
                st.session_state.current_df = original_df.copy()
                st.session_state.transformation_steps = []
                st.session_state.agg_functions = []
                st.success("Transformation reset")
                st.rerun()
        else:
            st.info("No transformations applied yet. Apply transformations to see the preview.")
