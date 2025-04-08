import streamlit as st
import pandas as pd
import base64
import io
from datetime import datetime
import os
import sys
import json

# Add utils to path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from utils.export import generate_pdf_report, generate_csv_report, generate_excel_report

st.set_page_config(
    page_title="Export Options | PM Data Tool",
    page_icon="📊",
    layout="wide"
)

st.title("Export Options")
st.markdown("Export your dashboards, reports, and data in various formats.")

# Function to generate a download link
def get_download_link(file_content, file_name, file_type):
    b64 = base64.b64encode(file_content).decode()
    href = f'<a href="data:{file_type};base64,{b64}" download="{file_name}">Download {file_name}</a>'
    return href

# Main export options
export_type = st.selectbox(
    "What would you like to export?",
    ["Dashboard", "Report", "Raw Data", "Transformation Recipe"]
)

if export_type == "Dashboard":
    st.header("Export Dashboard")
    
    if not st.session_state.dashboards:
        st.info("No dashboards available. Create a dashboard first.")
    else:
        dashboard_to_export = st.selectbox(
            "Select Dashboard to Export",
            list(st.session_state.dashboards.keys())
        )
        
        export_format = st.selectbox(
            "Export Format",
            ["PDF", "Image Set", "JSON (for import)"]
        )
        
        if export_format == "PDF":
            page_size = st.selectbox("Page Size", ["Letter", "A4", "Legal"])
            orientation = st.selectbox("Orientation", ["Portrait", "Landscape"])
            include_filters = st.checkbox("Include Filters", value=True)
            include_timestamp = st.checkbox("Include Timestamp", value=True)
            
            if st.button("Generate PDF"):
                try:
                    # Create a report-like structure from the dashboard
                    dashboard = st.session_state.dashboards[dashboard_to_export]
                    report_structure = {
                        "name": dashboard["name"],
                        "description": dashboard.get("description", ""),
                        "components": dashboard["components"],
                        "export_options": {
                            "format": "pdf",
                            "page_size": page_size,
                            "orientation": orientation,
                            "include_timestamp": include_timestamp
                        }
                    }
                    
                    # Generate PDF
                    pdf_content = generate_pdf_report(report_structure, st.session_state.data_sources)
                    
                    # Create download link
                    file_name = f"{dashboard_to_export.replace(' ', '_').lower()}_{datetime.now().strftime('%Y%m%d')}.pdf"
                    st.markdown(get_download_link(pdf_content, file_name, "application/pdf"), unsafe_allow_html=True)
                    
                    st.success("PDF generated successfully!")
                except Exception as e:
                    st.error(f"Error generating PDF: {str(e)}")
        
        elif export_format == "Image Set":
            image_format = st.selectbox("Image Format", ["PNG", "SVG"])
            image_quality = st.slider("Image Quality", 70, 100, 90)
            include_title = st.checkbox("Include Dashboard Title", value=True)
            
            if st.button("Generate Images"):
                st.warning("Image export functionality is limited in this environment. We recommend using PDF export for complete dashboards.")
                st.info("For offline use, you can take screenshots of individual visualizations.")
        
        elif export_format == "JSON":
            if st.button("Export Dashboard JSON"):
                try:
                    # Create a copy of the dashboard without the data
                    dashboard = st.session_state.dashboards[dashboard_to_export].copy()
                    
                    # Prepare export-friendly version
                    export_dashboard = {
                        "name": dashboard["name"],
                        "description": dashboard.get("description", ""),
                        "layout": dashboard.get("layout", "2 Columns"),
                        "components": dashboard["components"],
                        "exported_at": datetime.now().isoformat()
                    }
                    
                    # Convert to JSON
                    json_data = json.dumps(export_dashboard, default=str, indent=2)
                    
                    # Create download link
                    file_name = f"{dashboard_to_export.replace(' ', '_').lower()}_{datetime.now().strftime('%Y%m%d')}.json"
                    b64 = base64.b64encode(json_data.encode()).decode()
                    href = f'<a href="data:application/json;base64,{b64}" download="{file_name}">Download {file_name}</a>'
                    st.markdown(href, unsafe_allow_html=True)
                    
                    st.success("Dashboard JSON exported successfully!")
                    
                    # Show import instructions
                    st.info("To import this dashboard in another instance, use the Import feature in the Dashboard Builder.")
                except Exception as e:
                    st.error(f"Error exporting dashboard: {str(e)}")

elif export_type == "Report":
    st.header("Export Report")
    
    if not st.session_state.reports:
        st.info("No reports available. Create a report first.")
    else:
        report_to_export = st.selectbox(
            "Select Report to Export",
            list(st.session_state.reports.keys())
        )
        
        export_format = st.selectbox(
            "Export Format",
            ["PDF", "CSV", "Excel"]
        )
        
        if export_format == "PDF":
            page_size = st.selectbox("Page Size", ["Letter", "A4", "Legal"])
            orientation = st.selectbox("Orientation", ["Portrait", "Landscape"])
            include_timestamp = st.checkbox("Include Timestamp", value=True)
            
            # Update export options
            report = st.session_state.reports[report_to_export].copy()
            report["export_options"] = {
                "format": "pdf",
                "page_size": page_size,
                "orientation": orientation,
                "include_timestamp": include_timestamp
            }
            
            if st.button("Generate PDF"):
                try:
                    # Generate PDF
                    pdf_content = generate_pdf_report(report, st.session_state.data_sources)
                    
                    # Create download link
                    file_name = f"{report_to_export.replace(' ', '_').lower()}_{datetime.now().strftime('%Y%m%d')}.pdf"
                    st.markdown(get_download_link(pdf_content, file_name, "application/pdf"), unsafe_allow_html=True)
                    
                    st.success("PDF generated successfully!")
                except Exception as e:
                    st.error(f"Error generating PDF: {str(e)}")
        
        elif export_format == "CSV":
            include_headers = st.checkbox("Include Headers", value=True)
            delimiter = st.selectbox("Delimiter", [",", ";", "Tab"], format_func=lambda x: "Tab" if x == "Tab" else x)
            encoding = st.selectbox("Encoding", ["UTF-8", "ISO-8859-1", "ASCII"])
            
            # Update export options
            report = st.session_state.reports[report_to_export].copy()
            report["export_options"] = {
                "format": "csv",
                "include_headers": include_headers,
                "delimiter": delimiter if delimiter != "Tab" else "\t",
                "encoding": encoding
            }
            
            if st.button("Generate CSV"):
                try:
                    # Generate CSV
                    csv_content = generate_csv_report(report, st.session_state.data_sources)
                    
                    # Create download link
                    file_name = f"{report_to_export.replace(' ', '_').lower()}_{datetime.now().strftime('%Y%m%d')}.csv"
                    st.markdown(get_download_link(csv_content, file_name, "text/csv"), unsafe_allow_html=True)
                    
                    st.success("CSV generated successfully!")
                except Exception as e:
                    st.error(f"Error generating CSV: {str(e)}")
        
        elif export_format == "Excel":
            include_charts = st.checkbox("Include Charts", value=True)
            include_filters = st.checkbox("Include Filters", value=True)
            
            # Update export options
            report = st.session_state.reports[report_to_export].copy()
            report["export_options"] = {
                "format": "excel",
                "include_charts": include_charts,
                "include_filters": include_filters
            }
            
            if st.button("Generate Excel"):
                try:
                    # Generate Excel
                    excel_content = generate_excel_report(report, st.session_state.data_sources)
                    
                    # Create download link
                    file_name = f"{report_to_export.replace(' ', '_').lower()}_{datetime.now().strftime('%Y%m%d')}.xlsx"
                    st.markdown(get_download_link(excel_content, file_name, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"), unsafe_allow_html=True)
                    
                    st.success("Excel file generated successfully!")
                except Exception as e:
                    st.error(f"Error generating Excel file: {str(e)}")

elif export_type == "Raw Data":
    st.header("Export Raw Data")
    
    if not st.session_state.data_sources:
        st.info("No data sources available. Import data first.")
    else:
        data_source = st.selectbox(
            "Select Data Source",
            list(st.session_state.data_sources.keys())
        )
        
        export_format = st.selectbox(
            "Export Format",
            ["CSV", "Excel", "JSON"]
        )
        
        # Get the data
        df = st.session_state.data_sources[data_source]["data"]
        
        # Apply filters if needed
        with st.expander("Filter Data Before Export"):
            include_all_columns = st.checkbox("Include All Columns", value=True)
            
            if not include_all_columns:
                selected_columns = st.multiselect(
                    "Select Columns to Include",
                    df.columns.tolist(),
                    default=df.columns.tolist()[:5] if len(df.columns) > 5 else df.columns.tolist()
                )
                df = df[selected_columns]
            
            # Simple row filtering
            row_limit = st.number_input("Row Limit (0 for all rows)", 0, len(df), 1000)
            if row_limit > 0:
                df = df.head(row_limit)
        
        # Show preview
        st.subheader("Data Preview")
        st.dataframe(df.head(10), use_container_width=True)
        
        if st.button(f"Export to {export_format}"):
            try:
                if export_format == "CSV":
                    # Generate CSV
                    csv_buffer = io.StringIO()
                    df.to_csv(csv_buffer, index=False)
                    csv_content = csv_buffer.getvalue().encode()
                    
                    # Create download link
                    file_name = f"{data_source.replace(' ', '_').lower()}_{datetime.now().strftime('%Y%m%d')}.csv"
                    st.markdown(get_download_link(csv_content, file_name, "text/csv"), unsafe_allow_html=True)
                
                elif export_format == "Excel":
                    # Generate Excel
                    excel_buffer = io.BytesIO()
                    df.to_excel(excel_buffer, index=False)
                    excel_content = excel_buffer.getvalue()
                    
                    # Create download link
                    file_name = f"{data_source.replace(' ', '_').lower()}_{datetime.now().strftime('%Y%m%d')}.xlsx"
                    st.markdown(get_download_link(excel_content, file_name, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"), unsafe_allow_html=True)
                
                elif export_format == "JSON":
                    # Generate JSON
                    json_content = df.to_json(orient="records", date_format="iso").encode()
                    
                    # Create download link
                    file_name = f"{data_source.replace(' ', '_').lower()}_{datetime.now().strftime('%Y%m%d')}.json"
                    st.markdown(get_download_link(json_content, file_name, "application/json"), unsafe_allow_html=True)
                
                st.success(f"Data exported to {export_format} successfully!")
            except Exception as e:
                st.error(f"Error exporting data: {str(e)}")

elif export_type == "Transformation Recipe":
    st.header("Export Transformation Recipe")
    
    if not st.session_state.transformations:
        st.info("No transformations available. Create a transformation first.")
    else:
        # Select data source with transformations
        data_sources_with_transformations = [ds for ds in st.session_state.transformations.keys()]
        
        if not data_sources_with_transformations:
            st.info("No data sources with transformations found.")
        else:
            data_source = st.selectbox(
                "Select Data Source",
                data_sources_with_transformations
            )
            
            # Select transformation
            transformation_list = list(st.session_state.transformations[data_source].keys())
            
            if not transformation_list:
                st.info(f"No transformations found for {data_source}.")
            else:
                transformation_name = st.selectbox(
                    "Select Transformation",
                    transformation_list
                )
                
                # Get transformation details
                transformation = st.session_state.transformations[data_source][transformation_name]
                
                # Display transformation details
                st.subheader("Transformation Details")
                st.write(f"**Name:** {transformation_name}")
                st.write(f"**Created At:** {transformation['created_at'].strftime('%Y-%m-%d %H:%M:%S')}")
                st.write(f"**Steps:** {len(transformation['steps'])}")
                
                # Show steps
                with st.expander("View Transformation Steps"):
                    for i, step in enumerate(transformation['steps']):
                        st.write(f"**Step {i+1}:** {step['operation'].replace('_', ' ').title()}")
                        st.json(step['params'])
                
                if st.button("Export Transformation Recipe"):
                    try:
                        # Prepare the transformation recipe
                        recipe = {
                            "name": transformation_name,
                            "data_source": data_source,
                            "created_at": transformation['created_at'].isoformat(),
                            "steps": transformation['steps']
                        }
                        
                        # Convert to JSON
                        json_content = json.dumps(recipe, default=str, indent=2).encode()
                        
                        # Create download link
                        file_name = f"{transformation_name.replace(' ', '_').lower()}_{datetime.now().strftime('%Y%m%d')}.json"
                        st.markdown(get_download_link(json_content, file_name, "application/json"), unsafe_allow_html=True)
                        
                        st.success("Transformation recipe exported successfully!")
                    except Exception as e:
                        st.error(f"Error exporting transformation recipe: {str(e)}")

# Footer
st.markdown("---")
st.markdown("""
### Export Tips

- **PDF exports** are best for sharing visualizations and insights with stakeholders
- **CSV/Excel exports** are useful for further analysis in other tools
- **JSON exports** can be used to transfer configurations between instances
- For large datasets, consider filtering or limiting rows before export
""")
