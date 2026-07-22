"""
Date and Time Parser

Utility functions for normalizing natural language dates and times
into Python datetime objects for database storage.
"""

from datetime import datetime, timedelta, date, time
from typing import Union


def normalize_date(date_text: str) -> date:
    """
    Convert natural language date string to Python date object.
    
    Supports:
    - "today"
    - "tomorrow"
    - "day after tomorrow"
    - "YYYY-MM-DD" format
    
    Args:
        date_text: Date string in natural language or ISO format
        
    Returns:
        Python date object
        
    Raises:
        ValueError: If date_text is empty or invalid format
    """
    if not date_text:
        raise ValueError("Date is empty")

    text = date_text.strip().lower()
    today = datetime.today()

    # Handle natural language dates
    if text == "today":
        return today.date()

    if text == "tomorrow":
        return (today + timedelta(days=1)).date()

    if text == "day after tomorrow":
        return (today + timedelta(days=2)).date()

    # Handle ISO format (YYYY-MM-DD)
    try:
        return datetime.strptime(text, "%Y-%m-%d").date()
    except ValueError:
        raise ValueError(
            f"Invalid date format: '{date_text}'. "
            "Use 'today', 'tomorrow', 'day after tomorrow', or YYYY-MM-DD format."
        )


def normalize_time(time_text: str) -> time:
    """
    Convert time string to Python time object.
    
    Supports multiple formats:
    - "10:30 AM" (12-hour with AM/PM)
    - "10:30" (24-hour)
    - "2 PM" (hour only with AM/PM)
    - "14:00" (24-hour)
    
    Args:
        time_text: Time string in various formats
        
    Returns:
        Python time object
        
    Raises:
        ValueError: If time_text is empty or no valid format matches
    """
    if not time_text:
        raise ValueError("Time is empty")

    text = time_text.strip()

    # List of supported time formats
    formats = [
        "%I:%M %p",  # 10:30 AM
        "%I:%M%p",   # 10:30AM
        "%H:%M",     # 14:00
        "%I %p",     # 2 PM
        "%I%p",      # 2PM
        "%I:%M",     # 10:30 (assumes 24-hour)
    ]

    for fmt in formats:
        try:
            return datetime.strptime(text, fmt).time()
        except ValueError:
            continue

    raise ValueError(
        f"Invalid time format: '{time_text}'. "
        "Use formats like '10:30 AM', '2 PM', '14:00', or '10:30'."
    )


def format_date_for_display(date_obj: date) -> str:
    """
    Format date object for user-friendly display.
    
    Args:
        date_obj: Python date object
        
    Returns:
        Formatted date string (e.g., "July 23, 2024")
    """
    return date_obj.strftime("%B %d, %Y")


def format_time_for_display(time_obj: time) -> str:
    """
    Format time object for user-friendly display.
    
    Args:
        time_obj: Python time object
        
    Returns:
        Formatted time string (e.g., "10:30 AM")
    """
    return time_obj.strftime("%I:%M %p")
