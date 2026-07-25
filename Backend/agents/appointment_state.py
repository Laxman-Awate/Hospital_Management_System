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
    """

    intent: str = ""

    patient_id: Optional[int] = None

    # Patient symptoms
    symptoms: str = ""

    # Recommended department
    department: str = ""

    # Selected doctor
    doctor_name: str = ""

    # Department recommended by AI
    recommended_department: str = ""

    # Available doctors for selected department
    doctor_list: list = field(default_factory=list)

    appointment_date: str = ""

    appointment_time: str = ""

    completed: bool = False

    waiting_for: str = ""

    def is_complete(self) -> bool:
        """
        Check whether all required booking information is available.
        """

        return all([
            self.patient_id is not None,
            self.symptoms,
            self.doctor_name,
            self.appointment_date,
            self.appointment_time
        ])

    def reset(self):
        """
        Reset conversation state.
        """

        self.intent = ""
        self.patient_id = None
        self.symptoms = ""
        self.department = ""
        self.doctor_name = ""
        self.recommended_department = ""
        self.doctor_list = []
        self.appointment_date = ""
        self.appointment_time = ""
        self.completed = False
        self.waiting_for = ""

    def to_dict(self):
        """
        Convert state to dictionary.
        """

        return {
            "intent": self.intent,
            "patient_id": self.patient_id,
            "symptoms": self.symptoms,
            "department": self.department,
            "doctor_name": self.doctor_name,
            "recommended_department": self.recommended_department,
            "doctor_list": self.doctor_list,
            "appointment_date": self.appointment_date,
            "appointment_time": self.appointment_time,
            "completed": self.completed,
            "waiting_for": self.waiting_for
        }