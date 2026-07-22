"""
Appointment AI Service

Handles all LLM interactions for appointment-related tasks.
Separates AI logic from business logic for better modularity and testing.
"""

import json
from typing import Dict, Any, Optional

from ai_services.llm import llm


class AppointmentAIService:
    """
    Service class for AI-powered appointment information extraction.
    
    This service encapsulates all LLM interactions, making it easier to:
    - Test AI logic independently
    - Swap LLM providers
    - Monitor token usage
    - Cache responses
    """

    @staticmethod
    def extract_intent(user_message: str) -> Dict[str, Any]:
        """
        Extract appointment intent and information from user message using LLM.
        
        Args:
            user_message: The user's natural language input
            
        Returns:
            Dictionary containing extracted fields:
            - intent: The user's intent (e.g., "book", "cancel", "reschedule")
            - patient_id: Patient ID if mentioned
            - doctor_name: Doctor name if mentioned
            - appointment_date: Date if mentioned
            - appointment_time: Time if mentioned
            - reason: Reason for appointment if mentioned
            
        Raises:
            ValueError: If LLM response cannot be parsed as JSON
        """
        prompt = f"""
You are an appointment information extractor for a hospital management system.

Extract the following fields from the user's message:
- intent: What the user wants to do (book, cancel, reschedule, check)
- patient_id: Patient ID number if mentioned
- doctor_name: Doctor's name if mentioned
- appointment_date: Date for appointment if mentioned
- appointment_time: Time for appointment if mentioned
- reason: Reason for appointment if mentioned

Return ONLY valid JSON. Use null for missing values.

Example output:
{{
    "intent": "book",
    "patient_id": null,
    "doctor_name": "Dr. Smith",
    "appointment_date": "tomorrow",
    "appointment_time": "10:30 AM",
    "reason": "chest pain"
}}

User message:
{user_message}
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

    @staticmethod
    def generate_confirmation_message(
        appointment_data: Dict[str, Any]
    ) -> str:
        """
        Generate a natural language confirmation message using LLM.
        
        Args:
            appointment_data: Dictionary containing appointment details
            
        Returns:
            Natural language confirmation message
        """
        prompt = f"""
Generate a friendly confirmation message for the following appointment booking:

Patient ID: {appointment_data.get('patient_id')}
Doctor: {appointment_data.get('doctor_name')}
Date: {appointment_data.get('appointment_date')}
Time: {appointment_data.get('appointment_time')}
Reason: {appointment_data.get('reason')}

Make it professional and welcoming.
"""

        try:
            response = llm.invoke(prompt)
            return response.content.strip()
        except Exception:
            # Fallback to simple message if LLM fails
            return (
                f"Your appointment has been booked successfully with "
                f"{appointment_data.get('doctor_name')} on "
                f"{appointment_data.get('appointment_date')} at "
                f"{appointment_data.get('appointment_time')}."
            )
