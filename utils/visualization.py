import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime, timedelta

# Dictionary of chart descriptions for the dashboard builder
CHART_DESCRIPTIONS = {
    "bar": "Bar charts are good for comparing values across categories.",
    "line": "Line charts show trends over time or continuous data.",
    "pie": "Pie charts show the composition of a whole by displaying the proportion of each category.",
    "scatter": "Scatter plots show the relationship between two numeric variables.",
    "heatmap": "Heatmaps visualize data through variations in coloring.",
    "area": "Area charts are similar to line charts but with the area below the line filled in.",
    "histogram": "Histograms show the distribution of a single numerical variable.",
    "box": "Box plots show the distribution of numerical data through quartiles."
}

def get_chart_types():
    """
    Returns a list of available chart types.
    
    Returns:
    --------
    list
        List of chart type names
    """
    return ["bar", "line", "pie", "scatter", "heatmap", "area", "histogram", "box"]

def create_chart(df, chart_config):
    """
    Create a chart based on the configuration.
    
    Parameters:
    -----------
    df : DataFrame
        Pandas DataFrame containing the data
    chart_config : dict
        Dictionary with chart configuration
        
    Returns:
    --------
    plotly.graph_objects.Figure
        Plotly figure object with the chart
    """
    chart_type = chart_config.get("type")
    
    try:
        if chart_type == "bar":
            x_axis = chart_config.get("x_axis")
            y_axis = chart_config.get("y_axis")
            color = chart_config.get("color")
            orientation = chart_config.get("orientation", "vertical")
            
            if orientation == "horizontal":
                fig = px.bar(
                    df, 
                    y=x_axis,  # Reversed for horizontal orientation
                    x=y_axis, 
                    color=color,
                    orientation='h',
                    labels={x_axis: x_axis, y_axis: y_axis},
                    title=f"{y_axis} by {x_axis}"
                )
            else:
                fig = px.bar(
                    df, 
                    x=x_axis, 
                    y=y_axis,
                    color=color,
                    labels={x_axis: x_axis, y_axis: y_axis},
                    title=f"{y_axis} by {x_axis}"
                )
        
        elif chart_type == "line":
            x_axis = chart_config.get("x_axis")
            y_axis = chart_config.get("y_axis")
            color = chart_config.get("color")
            
            # Convert datetime-like columns to datetime
            if x_axis in df.columns and df[x_axis].dtype == 'object':
                try:
                    df[x_axis] = pd.to_datetime(df[x_axis])
                except:
                    pass
            
            fig = px.line(
                df, 
                x=x_axis, 
                y=y_axis,
                color=color,
                labels={x_axis: x_axis, y_axis: y_axis},
                title=f"{y_axis} over {x_axis}"
            )
        
        elif chart_type == "pie":
            names = chart_config.get("names")
            values = chart_config.get("values")
            
            fig = px.pie(
                df, 
                names=names, 
                values=values,
                title=f"Distribution of {values} by {names}"
            )
        
        elif chart_type == "scatter":
            x_axis = chart_config.get("x_axis")
            y_axis = chart_config.get("y_axis")
            color = chart_config.get("color")
            size = chart_config.get("size")
            
            fig = px.scatter(
                df, 
                x=x_axis, 
                y=y_axis,
                color=color,
                size=size,
                labels={x_axis: x_axis, y_axis: y_axis},
                title=f"Relationship between {x_axis} and {y_axis}"
            )
        
        elif chart_type == "heatmap":
            x_axis = chart_config.get("x_axis")
            y_axis = chart_config.get("y_axis")
            values = chart_config.get("values")
            
            # Pivot the dataframe for heatmap
            pivot_table = df.pivot_table(
                values=values,
                index=y_axis,
                columns=x_axis,
                aggfunc='mean'
            )
            
            fig = px.imshow(
                pivot_table,
                labels=dict(color=values),
                x=pivot_table.columns,
                y=pivot_table.index,
                title=f"Heatmap of {values} by {x_axis} and {y_axis}"
            )
        
        elif chart_type == "area":
            x_axis = chart_config.get("x_axis")
            y_axis = chart_config.get("y_axis")
            color = chart_config.get("color")
            
            # Convert datetime-like columns to datetime
            if x_axis in df.columns and df[x_axis].dtype == 'object':
                try:
                    df[x_axis] = pd.to_datetime(df[x_axis])
                except:
                    pass
            
            fig = px.area(
                df, 
                x=x_axis, 
                y=y_axis,
                color=color,
                labels={x_axis: x_axis, y_axis: y_axis},
                title=f"{y_axis} over {x_axis}"
            )
        
        elif chart_type == "histogram":
            x_axis = chart_config.get("x_axis")
            nbins = chart_config.get("nbins", 20)
            
            fig = px.histogram(
                df, 
                x=x_axis,
                nbins=nbins,
                title=f"Distribution of {x_axis}"
            )
        
        elif chart_type == "box":
            x_axis = chart_config.get("x_axis")
            y_axis = chart_config.get("y_axis")
            
            fig = px.box(
                df, 
                x=x_axis, 
                y=y_axis,
                title=f"Distribution of {y_axis}" + (f" by {x_axis}" if x_axis else "")
            )
        
        else:
            # Default to a simple bar chart if the chart type is not supported
            fig = px.bar(
                df, 
                x=df.columns[0], 
                y=df.columns[1] if len(df.columns) > 1 else df.columns[0],
                title="Chart (Unsupported type)"
            )
        
        # Update layout for better appearance
        fig.update_layout(
            margin=dict(l=20, r=20, t=40, b=20),
            legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
            plot_bgcolor="white",
            height=400
        )
        
        # Make the chart responsive
        fig.update_layout(autosize=True)
        
        return fig
    
    except Exception as e:
        # If there's an error, return a simple error chart
        fig = go.Figure()
        fig.add_annotation(
            text=f"Error creating chart: {str(e)}",
            xref="paper", yref="paper",
            x=0.5, y=0.5, showarrow=False
        )
        return fig

def create_time_series_chart(df, date_column, value_column, group_column=None, chart_type="line", title=None):
    """
    Create a time series chart.
    
    Parameters:
    -----------
    df : DataFrame
        Pandas DataFrame containing the data
    date_column : str
        Name of the column containing dates
    value_column : str
        Name of the column containing values to plot
    group_column : str, optional
        Name of the column to group by
    chart_type : str
        Type of chart ('line' or 'bar')
    title : str, optional
        Chart title
        
    Returns:
    --------
    plotly.graph_objects.Figure
        Plotly figure object with the time series chart
    """
    # Convert date column to datetime if needed
    if df[date_column].dtype != 'datetime64[ns]':
        df[date_column] = pd.to_datetime(df[date_column])
    
    # Create title if not provided
    if title is None:
        title = f"{value_column} over time"
        if group_column:
            title += f" by {group_column}"
    
    # Create chart based on type
    if chart_type == "line":
        if group_column:
            fig = px.line(
                df, 
                x=date_column, 
                y=value_column,
                color=group_column,
                title=title
            )
        else:
            fig = px.line(
                df, 
                x=date_column, 
                y=value_column,
                title=title
            )
    elif chart_type == "bar":
        if group_column:
            fig = px.bar(
                df, 
                x=date_column, 
                y=value_column,
                color=group_column,
                title=title
            )
        else:
            fig = px.bar(
                df, 
                x=date_column, 
                y=value_column,
                title=title
            )
    else:
        # Default to line chart
        if group_column:
            fig = px.line(
                df, 
                x=date_column, 
                y=value_column,
                color=group_column,
                title=title
            )
        else:
            fig = px.line(
                df, 
                x=date_column, 
                y=value_column,
                title=title
            )
    
    # Update layout for better appearance
    fig.update_layout(
        margin=dict(l=20, r=20, t=40, b=20),
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
        plot_bgcolor="white",
        height=400
    )
    
    # Make the chart responsive
    fig.update_layout(autosize=True)
    
    return fig

def create_comparison_chart(df, category_column, value_columns, chart_type="bar", title=None):
    """
    Create a comparison chart for multiple values across categories.
    
    Parameters:
    -----------
    df : DataFrame
        Pandas DataFrame containing the data
    category_column : str
        Name of the column containing categories
    value_columns : list
        List of column names containing values to compare
    chart_type : str
        Type of chart ('bar' or 'radar')
    title : str, optional
        Chart title
        
    Returns:
    --------
    plotly.graph_objects.Figure
        Plotly figure object with the comparison chart
    """
    # Create title if not provided
    if title is None:
        title = f"Comparison of {', '.join(value_columns)} by {category_column}"
    
    # Create chart based on type
    if chart_type == "bar":
        # Melt the dataframe for grouped bar chart
        melted_df = pd.melt(
            df, 
            id_vars=[category_column], 
            value_vars=value_columns,
            var_name='Metric', 
            value_name='Value'
        )
        
        fig = px.bar(
            melted_df, 
            x=category_column, 
            y='Value',
            color='Metric',
            barmode='group',
            title=title
        )
    
    elif chart_type == "radar":
        # Prepare data for radar chart
        fig = go.Figure()
        
        for value_col in value_columns:
            fig.add_trace(go.Scatterpolar(
                r=df[value_col],
                theta=df[category_column],
                fill='toself',
                name=value_col
            ))
        
        fig.update_layout(
            polar=dict(
                radialaxis=dict(
                    visible=True,
                )
            ),
            title=title
        )
    
    else:
        # Default to bar chart
        melted_df = pd.melt(
            df, 
            id_vars=[category_column], 
            value_vars=value_columns,
            var_name='Metric', 
            value_name='Value'
        )
        
        fig = px.bar(
            melted_df, 
            x=category_column, 
            y='Value',
            color='Metric',
            barmode='group',
            title=title
        )
    
    # Update layout for better appearance
    fig.update_layout(
        margin=dict(l=20, r=20, t=40, b=20),
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
        plot_bgcolor="white",
        height=400
    )
    
    # Make the chart responsive
    fig.update_layout(autosize=True)
    
    return fig

def create_distribution_chart(df, column, chart_type="histogram", bin_size=None, title=None):
    """
    Create a distribution chart for a single variable.
    
    Parameters:
    -----------
    df : DataFrame
        Pandas DataFrame containing the data
    column : str
        Name of the column to plot distribution for
    chart_type : str
        Type of chart ('histogram', 'box', or 'violin')
    bin_size : int, optional
        Number of bins for histogram
    title : str, optional
        Chart title
        
    Returns:
    --------
    plotly.graph_objects.Figure
        Plotly figure object with the distribution chart
    """
    # Create title if not provided
    if title is None:
        title = f"Distribution of {column}"
    
    # Create chart based on type
    if chart_type == "histogram":
        fig = px.histogram(
            df, 
            x=column,
            nbins=bin_size,
            title=title
        )
    
    elif chart_type == "box":
        fig = px.box(
            df, 
            y=column,
            title=title
        )
    
    elif chart_type == "violin":
        fig = px.violin(
            df, 
            y=column,
            box=True,  # Include box plot inside the violin
            points='all',  # Show all points
            title=title
        )
    
    else:
        # Default to histogram
        fig = px.histogram(
            df, 
            x=column,
            nbins=bin_size,
            title=title
        )
    
    # Update layout for better appearance
    fig.update_layout(
        margin=dict(l=20, r=20, t=40, b=20),
        plot_bgcolor="white",
        height=400
    )
    
    # Make the chart responsive
    fig.update_layout(autosize=True)
    
    return fig
