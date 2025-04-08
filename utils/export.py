import pandas as pd
import numpy as np
import plotly.io as pio
import io
import base64
import json
from datetime import datetime
import re
import os

# Function to generate a PDF report
def generate_pdf_report(report_structure, data_sources):
    """
    Generate a PDF report based on the report structure.
    
    Parameters:
    -----------
    report_structure : dict
        Dictionary containing report configuration and components
    data_sources : dict
        Dictionary of data sources
        
    Returns:
    --------
    bytes
        PDF file content as bytes
    """
    try:
        # Note: In a real environment, a PDF generation library like ReportLab,
        # weasyprint, or xhtml2pdf would be used here.
        # For this implementation, we'll create a simple report using HTML
        # and then convert it to PDF with a placeholder function.
        
        # Get report details
        report_name = report_structure.get("name", "Report")
        report_description = report_structure.get("description", "")
        components = report_structure.get("components", [])
        export_options = report_structure.get("export_options", {})
        
        # Generate HTML for the report
        html_content = generate_report_html(report_name, report_description, components, data_sources, export_options)
        
        # Convert HTML to PDF (placeholder - in a real implementation this would use a PDF library)
        pdf_content = html_to_pdf(html_content, export_options)
        
        return pdf_content
    
    except Exception as e:
        raise Exception(f"Error generating PDF report: {str(e)}")

def generate_csv_report(report_structure, data_sources):
    """
    Generate a CSV report based on the report structure.
    
    Parameters:
    -----------
    report_structure : dict
        Dictionary containing report configuration and components
    data_sources : dict
        Dictionary of data sources
        
    Returns:
    --------
    bytes
        CSV file content as bytes
    """
    try:
        # Get report details
        components = report_structure.get("components", [])
        export_options = report_structure.get("export_options", {})
        
        # Extract tables from components
        tables_data = []
        
        for component in components:
            if component["type"] == "table" and "data_source" in component:
                # Get the data
                data_source = component["data_source"]
                if data_source in data_sources:
                    df = data_sources[data_source]["data"]
                    
                    # Filter columns if specified
                    if "columns" in component:
                        df = df[component["columns"]]
                    
                    # Add a header row with component title
                    title = component.get("title", f"Table - {data_source}")
                    title_df = pd.DataFrame([[title] + [""] * (len(df.columns) - 1)], columns=df.columns)
                    
                    # Combine and add to tables
                    combined_df = pd.concat([title_df, df])
                    tables_data.append(combined_df)
            
            elif component["type"] == "chart" and "data_source" in component:
                # For charts, we'll include the underlying data
                data_source = component["data_source"]
                if data_source in data_sources:
                    df = data_sources[data_source]["data"]
                    chart_config = component["chart_config"]
                    
                    # Filter to just the columns used in the chart
                    columns_to_include = []
                    for key, value in chart_config.items():
                        if isinstance(value, str) and value in df.columns:
                            columns_to_include.append(value)
                    
                    if columns_to_include:
                        df = df[columns_to_include]
                    
                    # Add a header row with component title
                    title = component.get("title", f"Chart - {data_source}")
                    title_df = pd.DataFrame([[title] + [""] * (len(df.columns) - 1)], columns=df.columns)
                    
                    # Combine and add to tables
                    combined_df = pd.concat([title_df, df])
                    tables_data.append(combined_df)
        
        # Combine all tables into one CSV
        if tables_data:
            # Add spacing between tables
            for i in range(1, len(tables_data)):
                # Add an empty row between tables
                empty_row = pd.DataFrame([[""] * len(tables_data[i].columns)], columns=tables_data[i].columns)
                tables_data[i] = pd.concat([empty_row, tables_data[i]])
            
            combined_df = pd.concat(tables_data)
            
            # Get CSV export options
            include_headers = export_options.get("include_headers", True)
            delimiter = export_options.get("delimiter", ",")
            encoding = export_options.get("encoding", "utf-8")
            
            # Convert to CSV
            csv_buffer = io.StringIO()
            combined_df.to_csv(
                csv_buffer, 
                index=False,
                header=include_headers,
                sep=delimiter
            )
            
            return csv_buffer.getvalue().encode(encoding)
        else:
            # If no tables, return an empty CSV
            return "No data available for CSV export".encode("utf-8")
    
    except Exception as e:
        raise Exception(f"Error generating CSV report: {str(e)}")

def generate_excel_report(report_structure, data_sources):
    """
    Generate an Excel report based on the report structure.
    
    Parameters:
    -----------
    report_structure : dict
        Dictionary containing report configuration and components
    data_sources : dict
        Dictionary of data sources
        
    Returns:
    --------
    bytes
        Excel file content as bytes
    """
    try:
        import io
        
        # Get report details
        report_name = report_structure.get("name", "Report")
        components = report_structure.get("components", [])
        export_options = report_structure.get("export_options", {})
        
        # Create Excel file
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
            # Create a summary sheet
            summary_data = {
                "Component": [],
                "Type": [],
                "Data Source": []
            }
            
            for component in components:
                summary_data["Component"].append(component.get("title", f"Component {component.get('id', '')}"))
                summary_data["Type"].append(component["type"].capitalize())
                summary_data["Data Source"].append(component.get("data_source", "N/A"))
            
            summary_df = pd.DataFrame(summary_data)
            summary_df.to_excel(writer, sheet_name='Summary', index=False)
            
            # Process each component
            for i, component in enumerate(components):
                if component["type"] == "table" and "data_source" in component:
                    # Get the data
                    data_source = component["data_source"]
                    if data_source in data_sources:
                        df = data_sources[data_source]["data"]
                        
                        # Filter columns if specified
                        if "columns" in component:
                            df = df[component["columns"]]
                        
                        # Write to Excel
                        sheet_name = f"Table_{i+1}"
                        df.to_excel(writer, sheet_name=sheet_name, index=False)
                        
                        # Auto-adjust column widths
                        worksheet = writer.sheets[sheet_name]
                        for j, col in enumerate(df.columns):
                            max_width = max(df[col].astype(str).map(len).max(), len(col))
                            worksheet.set_column(j, j, max_width + 2)
                
                elif component["type"] == "chart" and "data_source" in component:
                    # Get the data
                    data_source = component["data_source"]
                    if data_source in data_sources and export_options.get("include_charts", True):
                        df = data_sources[data_source]["data"]
                        
                        # Write the data to Excel
                        sheet_name = f"Chart_{i+1}_Data"
                        df.to_excel(writer, sheet_name=sheet_name, index=False)
                        
                        # Auto-adjust column widths
                        worksheet = writer.sheets[sheet_name]
                        for j, col in enumerate(df.columns):
                            max_width = max(df[col].astype(str).map(len).max(), len(col))
                            worksheet.set_column(j, j, max_width + 2)
                        
                        # Note: In a full implementation, actual charts would be created in Excel
                        # Using the xlsxwriter chart objects
        
        # Get the Excel file content
        output.seek(0)
        excel_content = output.getvalue()
        
        return excel_content
    
    except Exception as e:
        raise Exception(f"Error generating Excel report: {str(e)}")

def html_to_pdf(html_content, options=None):
    """
    Convert HTML to PDF.
    
    This is a placeholder function. In a real implementation, a library like
    weasyprint, xhtml2pdf, or wkhtmltopdf would be used here.
    
    Parameters:
    -----------
    html_content : str
        HTML content to convert
    options : dict
        PDF generation options
        
    Returns:
    --------
    bytes
        PDF file content as bytes
    """
    # In a real implementation, we would use a PDF library here
    # For now, we'll just encode the HTML and pretend it's a PDF
    
    # Add a message to explain this is a placeholder
    html_content += """
    <div style="margin-top: 50px; border-top: 1px solid #ccc; padding-top: 20px;">
        <h3>PDF Generation Note</h3>
        <p>In a production environment, this would be a properly formatted PDF document. 
        For this demonstration, the HTML content is returned instead.</p>
    </div>
    """
    
    # Add PDF-like headers based on options
    if options:
        page_size = options.get("page_size", "Letter")
        orientation = options.get("orientation", "Portrait")
        include_timestamp = options.get("include_timestamp", True)
        
        timestamp_html = ""
        if include_timestamp:
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            timestamp_html = f"""
            <div style="position: fixed; bottom: 10px; right: 10px; font-size: 8pt; color: #999;">
                Generated on {timestamp}
            </div>
            """
        
        html_content = f"""
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Report</title>
            <style>
                @page {{
                    size: {page_size} {orientation.lower()};
                    margin: 2cm;
                }}
                body {{
                    font-family: Arial, sans-serif;
                    font-size: 10pt;
                }}
                h1 {{
                    font-size: 18pt;
                    color: #333;
                }}
                h2 {{
                    font-size: 14pt;
                    color: #555;
                }}
                table {{
                    border-collapse: collapse;
                    width: 100%;
                    margin-bottom: 20px;
                }}
                th, td {{
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: left;
                }}
                th {{
                    background-color: #f2f2f2;
                }}
            </style>
        </head>
        <body>
            {html_content}
            {timestamp_html}
        </body>
        </html>
        """
    
    # Return the HTML content as bytes
    return html_content.encode("utf-8")

def generate_report_html(report_name, report_description, components, data_sources, export_options=None):
    """
    Generate HTML for a report.
    
    Parameters:
    -----------
    report_name : str
        Name of the report
    report_description : str
        Report description
    components : list
        List of report components
    data_sources : dict
        Dictionary of data sources
    export_options : dict
        Export options
        
    Returns:
    --------
    str
        HTML content of the report
    """
    html_parts = []
    
    # Add header
    html_parts.append(f"<h1>{report_name}</h1>")
    
    if report_description:
        html_parts.append(f"<p>{report_description}</p>")
    
    # Add components
    for component in components:
        if component["type"] == "chart" and "data_source" in component:
            title = component.get("title", "Chart")
            html_parts.append(f"<h2>{title}</h2>")
            
            # Note: In a real implementation, chart images would be generated and embedded
            html_parts.append("<p>[Chart visualization - In a real implementation, an image would be here]</p>")
            
            # Include data table for the chart
            data_source = component["data_source"]
            if data_source in data_sources:
                df = data_sources[data_source]["data"]
                
                # Limit to a few rows to keep the report manageable
                html_parts.append("<h3>Chart Data Preview</h3>")
                html_parts.append(dataframe_to_html_table(df.head(10)))
        
        elif component["type"] == "table" and "data_source" in component:
            title = component.get("title", "Data Table")
            html_parts.append(f"<h2>{title}</h2>")
            
            data_source = component["data_source"]
            if data_source in data_sources:
                df = data_sources[data_source]["data"]
                
                # Filter columns if specified
                if "columns" in component:
                    df = df[component["columns"]]
                
                # Convert to HTML table
                html_parts.append(dataframe_to_html_table(df))
        
        elif component["type"] == "metric" and "data_source" in component:
            title = component.get("title", "Metric")
            html_parts.append(f"<h2>{title}</h2>")
            
            data_source = component["data_source"]
            if data_source in data_sources:
                df = data_sources[data_source]["data"]
                
                # Calculate metric value (similar logic to dashboard display)
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
                
                # Add to HTML
                html_parts.append(f"""
                <div style="text-align: center; margin: 20px 0;">
                    <div style="font-size: 24pt; font-weight: bold;">{formatted_value}</div>
                </div>
                """)
        
        elif component["type"] == "text":
            text_type = component["text_type"]
            content = component["content"]
            
            if text_type == "Header":
                html_parts.append(f"<h1>{content}</h1>")
            elif text_type == "Subheader":
                html_parts.append(f"<h2>{content}</h2>")
            elif text_type == "Paragraph":
                html_parts.append(f"<p>{content}</p>")
            elif text_type in ["Info Box", "Warning Box", "Success Box", "Error Box"]:
                color = {
                    "Info Box": "#e3f2fd",
                    "Warning Box": "#fff3e0",
                    "Success Box": "#e8f5e9",
                    "Error Box": "#ffebee"
                }[text_type]
                
                html_parts.append(f"""
                <div style="background-color: {color}; padding: 15px; border-radius: 5px; margin: 10px 0;">
                    {content}
                </div>
                """)
    
    # Combine all HTML parts
    return "\n".join(html_parts)

def dataframe_to_html_table(df, max_rows=100):
    """
    Convert a dataframe to an HTML table.
    
    Parameters:
    -----------
    df : DataFrame
        Pandas DataFrame to convert
    max_rows : int
        Maximum number of rows to include
        
    Returns:
    --------
    str
        HTML table representation of the dataframe
    """
    # Limit the number of rows
    if len(df) > max_rows:
        df = df.head(max_rows)
        truncated = True
    else:
        truncated = False
    
    # Convert dataframe to HTML table
    html_table = df.to_html(index=False, classes="dataframe")
    
    # Add a message if the table was truncated
    if truncated:
        html_table += f"<p><em>Table truncated to {max_rows} rows.</em></p>"
    
    return html_table
