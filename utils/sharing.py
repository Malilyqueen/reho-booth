import streamlit as st
import pandas as pd
import uuid
import random
import string
from datetime import datetime, timedelta
import json

def generate_share_link(share_info):
    """
    Generate a shareable link for a dashboard.
    
    Parameters:
    -----------
    share_info : dict
        Dictionary containing dashboard and sharing configuration
        
    Returns:
    --------
    str
        Shareable link
    """
    # Generate a unique ID for the share
    share_id = str(uuid.uuid4())
    
    # Generate a secure token
    token = ''.join(random.choices(string.ascii_letters + string.digits, k=16))
    
    # Add token to share info
    share_info["token"] = token
    
    # Initialize shared_links in session state if it doesn't exist
    if "shared_links" not in st.session_state:
        st.session_state.shared_links = {}
    
    # Store share info in session state
    st.session_state.shared_links[share_id] = share_info
    
    # Create the share link
    # In a real environment, this would be the actual domain
    base_url = "https://your-domain.com/shared-dashboards"
    share_link = f"{base_url}?share_id={share_id}&token={token}"
    
    return share_link

def validate_share_token(share_id, token):
    """
    Validate a share token.
    
    Parameters:
    -----------
    share_id : str
        ID of the shared dashboard
    token : str
        Token to validate
        
    Returns:
    --------
    bool
        True if valid, False otherwise
    """
    # Check if shared_links exists in session state
    if "shared_links" not in st.session_state:
        return False
    
    # Check if share_id exists
    if share_id not in st.session_state.shared_links:
        return False
    
    # Get the share info
    share_info = st.session_state.shared_links[share_id]
    
    # Check if token matches
    if share_info.get("token") != token:
        return False
    
    # Check if share has expired
    expires_at = share_info.get("expires_at")
    if expires_at is not None and expires_at < datetime.now():
        return False
    
    return True

def get_dashboard_by_share_id(share_id):
    """
    Get a shared dashboard by ID.
    
    Parameters:
    -----------
    share_id : str
        ID of the shared dashboard
        
    Returns:
    --------
    dict
        Dictionary containing the shared dashboard info, or None if not found
    """
    # Check if shared_links exists in session state
    if "shared_links" not in st.session_state:
        return None
    
    # Check if share_id exists
    if share_id not in st.session_state.shared_links:
        return None
    
    # Return the share info
    return st.session_state.shared_links[share_id]

def revoke_share(share_id):
    """
    Revoke a shared dashboard.
    
    Parameters:
    -----------
    share_id : str
        ID of the shared dashboard
        
    Returns:
    --------
    bool
        True if revoked, False otherwise
    """
    # Check if shared_links exists in session state
    if "shared_links" not in st.session_state:
        return False
    
    # Check if share_id exists
    if share_id not in st.session_state.shared_links:
        return False
    
    # Remove the share
    del st.session_state.shared_links[share_id]
    
    return True

def extend_share_expiration(share_id, days=30):
    """
    Extend the expiration of a shared dashboard.
    
    Parameters:
    -----------
    share_id : str
        ID of the shared dashboard
    days : int
        Number of days to extend
        
    Returns:
    --------
    bool
        True if extended, False otherwise
    """
    # Check if shared_links exists in session state
    if "shared_links" not in st.session_state:
        return False
    
    # Check if share_id exists
    if share_id not in st.session_state.shared_links:
        return False
    
    # Get the share info
    share_info = st.session_state.shared_links[share_id]
    
    # Check if share has expiration
    if "expires_at" not in share_info or share_info["expires_at"] is None:
        # No expiration, nothing to extend
        return True
    
    # Extend the expiration
    current_expiration = share_info["expires_at"]
    if current_expiration < datetime.now():
        # If already expired, set from now
        share_info["expires_at"] = datetime.now() + timedelta(days=days)
    else:
        # If not expired, add days
        share_info["expires_at"] = current_expiration + timedelta(days=days)
    
    return True

def regenerate_share_token(share_id):
    """
    Regenerate the token for a shared dashboard.
    
    Parameters:
    -----------
    share_id : str
        ID of the shared dashboard
        
    Returns:
    --------
    str
        New token, or None if error
    """
    # Check if shared_links exists in session state
    if "shared_links" not in st.session_state:
        return None
    
    # Check if share_id exists
    if share_id not in st.session_state.shared_links:
        return None
    
    # Generate a new token
    token = ''.join(random.choices(string.ascii_letters + string.digits, k=16))
    
    # Update the share info
    st.session_state.shared_links[share_id]["token"] = token
    
    return token

def get_all_shares():
    """
    Get all shared dashboards.
    
    Returns:
    --------
    dict
        Dictionary of all shared dashboards
    """
    # Return empty dict if no shares
    if "shared_links" not in st.session_state:
        return {}
    
    return st.session_state.shared_links

def clean_expired_shares():
    """
    Remove all expired shared dashboards.
    
    Returns:
    --------
    int
        Number of shares removed
    """
    # Check if shared_links exists in session state
    if "shared_links" not in st.session_state:
        return 0
    
    # Get current time
    now = datetime.now()
    
    # Find expired shares
    expired_shares = []
    for share_id, share_info in st.session_state.shared_links.items():
        expires_at = share_info.get("expires_at")
        if expires_at is not None and expires_at < now:
            expired_shares.append(share_id)
    
    # Remove expired shares
    for share_id in expired_shares:
        del st.session_state.shared_links[share_id]
    
    return len(expired_shares)
