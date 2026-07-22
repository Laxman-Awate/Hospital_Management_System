"""
Appointment State

Dataclass for maintaining conversation state during appointment booking.
Designed for clean state management and future session-based memory integration.
"""

from dataclasses import dataclass, field
from typing import Optional


@dataclass
class AppointmentState:
    """
    State container for appointment booking conversation.
    
    This dataclass tracks all information collected during a conversation
    and maintains the flow state for multi-turn interactions.
    
    Attributes:
        intent: The user's intent (e.g., "book", "cancel", "reschedule")
        patient_id: The patient's ID number
        doctor_name: Name of the doctor
        appointment_date: Date for the appointment (string before normalization)
        appointment_time: Time for the appointment (string before normalization)
        reason: Reason for the appointment
        completed: Whether the appointment booking is complete
        waiting_for: Which field the agent is currently waiting for
    """
    intent: str = ""
    patient_id: Optional[int] = None
    doctor_name: str = ""
    appointment_date: str = ""
    appointment_time: str = ""
    reason: str = ""
    completed: bool = False
    waiting_for: str = ""

    def is_complete(self) -> bool:
        """
        Check if all required fields are populated.
        
        Returns:
            True if all required fields have values
        """
        return all([
            self.patient_id is not None,
            self.doctor_name,
            self.appointment_date,
            self.appointment_time,
            self.reason
        ])

    def reset(self) -> None:
        """
        Reset the state to initial values.
        """
        self.intent = ""
        self.patient_id = None
        self.doctor_name = ""
        self.appointment_date = ""
        self.appointment_time = ""
        self.reason = ""
        self.completed = False
        self.waiting_for = ""

    def to_dict(self) -> dict:
        """
        Convert state to dictionary for serialization.
        
        Returns:
            Dictionary representation of the state
        """
        return {
            "intent": self.intent,
            "patient_id": self.patient_id,
            "doctor_name": self.doctor_name,
            "appointment_date": self.appointment_date,
            "appointment_time": self.appointment_time,
            "reason": self.reason,
            "completed": self.completed,
            "waiting_for": self.waiting_for
        }
