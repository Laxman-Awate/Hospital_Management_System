"""
Intent Extractor

Hybrid information extractor that combines rule-based extraction
with LLM-powered extraction for complex inputs.
Minimizes LLM calls by using Python regex for simple patterns.
"""

import json
import re
from typing import Dict, Any

from ai_services.llm import llm


def extract_information(user_message: str) -> Dict[str, Any]:
    """
    Extract appointment information from user message.
    
    Uses a hybrid approach:
    1. Rule-based extraction for simple inputs (numbers, times, dates, doctors)
    2. LLM extraction for complex natural language
    
    This significantly reduces token usage by avoiding LLM calls for
    straightforward inputs.
    
    Args:
        user_message: The user's natural language input
        
    Returns:
        Dictionary containing extracted fields:
        - intent: User's intent (empty string for simple inputs)
        - patient_id: Patient ID if mentioned (int or None)
        - doctor_name: Doctor name if mentioned
        - appointment_date: Date if mentioned
        - appointment_time: Time if mentioned
        - reason: Reason if mentioned
        
    Raises:
        ValueError: If LLM response cannot be parsed as JSON
    """
    text = user_message.strip()

    # ---------- Patient ID ----------
    # Simple numeric input - no LLM needed
    if text.isdigit():
        return {
            "intent": "",
            "patient_id": int(text),
            "doctor_name": "",
            "appointment_date": "",
            "appointment_time": "",
            "symptoms": ""
        }

    # ---------- Time ----------
    # Time pattern: HH:MM with optional AM/PM
    time_pattern = r"^\d{1,2}:\d{2}\s?(AM|PM|am|pm)?$"
    
    if re.match(time_pattern, text):
        return {
            "intent": "",
            "patient_id": None,
            "doctor_name": "",
            "appointment_date": "",
            "appointment_time": text,
            "symptoms": ""
        }

    # ---------- Date ----------
    # Natural language dates - no LLM needed
    natural_dates = ["today", "tomorrow", "day after tomorrow"]
    
    if text.lower() in natural_dates:
        return {
            "intent": "",
            "patient_id": None,
            "doctor_name": "",
            "appointment_date": text,
            "appointment_time": "",
            "symptoms": ""
        }

    # ---------- Doctor ----------
    # Doctor name starting with "Dr" - no LLM needed
    if text.lower().startswith("dr"):
        return {
            "intent": "",
            "patient_id": None,
            "doctor_name": text,
            "appointment_date": "",
            "appointment_time": "",
            "symptoms": ""
        }

    # ---------- Complex Request ----------
    # For complex sentences, use LLM to extract information
    return _extract_with_llm(text)


def _extract_with_llm(text: str) -> Dict[str, Any]:
    """
    Use LLM to extract information from complex natural language.
    
    This is only called when rule-based extraction fails,
    minimizing token usage and cost.
    
    Args:
        text: The user's message text
        
    Returns:
        Dictionary with extracted fields
        
    Raises:
        ValueError: If LLM response cannot be parsed as JSON
    """
    prompt = f"""
You are an appointment information extractor.

Extract the following fields from the user's message:

- intent
- patient_id
- symptoms
- doctor_name
- appointment_date
- appointment_time

Return ONLY valid JSON.

Example:

{{
    "intent":"book",
    "patient_id":null,
    "symptoms":"chest pain",
    "doctor_name":"",
    "appointment_date":"tomorrow",
    "appointment_time":"10:30 AM"
}}



User message:
{text}
"""

    try:
        response = llm.invoke(prompt)
        content = response.content.strip()
        
        # Clean up markdown code blocks if present
        if content.startswith("```"):
            content = content.replace("```json", "")
            content = content.replace("```", "")
            content = content.strip()
        
        return json.loads(content)
        
    except json.JSONDecodeError as e:
        raise ValueError(f"Failed to parse LLM response as JSON: {e}")
    except Exception as e:
        raise ValueError(f"Error during LLM inference: {e}")
