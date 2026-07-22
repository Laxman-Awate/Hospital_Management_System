"""
Appointment Tools

Business logic layer for appointment operations.
Handles validation, data transformation, and service calls.
"""

from typing import Dict, Any, Tuple, Optional

from services.appointment_service import (
    create_appointment,
    delete_appointment,
    update_appointment_status,
    get_all_appointments,
    get_doctor_by_name
)
from utils.date_time_parser import (
    normalize_date,
    normalize_time
)


class AppointmentTools:
    """
    Tools for appointment business operations.
    
    This class handles:
    - Doctor validation
    - Date/time normalization
    - Appointment booking
    - Error handling and user-friendly messages
    
    Separated from AppointmentAgent to allow reuse across different interfaces.
    """

    @staticmethod
    def book(
        patient_id: int,
        doctor_name: str,
        appointment_date: str,
        appointment_time: str,
        reason: str
    ) -> str:
        """
        Book a new appointment.
        
        Args:
            patient_id: The patient's ID
            doctor_name: Name of the doctor (e.g., "Dr. Smith")
            appointment_date: Date string (e.g., "tomorrow", "2024-07-23")
            appointment_time: Time string (e.g., "10:30 AM", "14:00")
            reason: Reason for the appointment
            
        Returns:
            Success message with appointment ID or error message
        """
        # Validate inputs
        if not patient_id:
            return "❌ Patient ID is required."
        
        if not doctor_name:
            return "❌ Doctor name is required."
        
        if not appointment_date:
            return "❌ Appointment date is required."
        
        if not appointment_time:
            return "❌ Appointment time is required."
        
        if not reason:
            return "❌ Reason for appointment is required."

        # Find doctor
        doctor = get_doctor_by_name(doctor_name)
        
        if doctor is None:
            return f"❌ Doctor '{doctor_name}' not found. Please check the name and try again."

        # Normalize date and time
        try:
            normalized_date = normalize_date(appointment_date)
            normalized_time = normalize_time(appointment_time)
        except ValueError as e:
            return f"❌ Invalid date or time format: {str(e)}"
        except Exception as e:
            return f"❌ Error processing date/time: {str(e)}"

        # Prepare appointment data
        appointment_data = {
            "patient_id": patient_id,
            "doctor_id": doctor.id,
            "appointment_date": normalized_date,
            "appointment_time": normalized_time,
            "reason": reason
        }

        # Create appointment
        try:
            appointment, error = create_appointment(appointment_data)
            
            if error:
                return f"❌ {error}"
            
            return (
                f"✅ Appointment booked successfully!\n"
                f"Appointment ID: {appointment.id}\n"
                f"Doctor: {doctor_name}\n"
                f"Date: {appointment_date}\n"
                f"Time: {appointment_time}"
            )
            
        except Exception as e:
            return f"❌ An error occurred while booking: {str(e)}"

    @staticmethod
    def cancel(appointment_id: int) -> str:
        """
        Cancel an existing appointment.
        
        Args:
            appointment_id: The ID of the appointment to cancel
            
        Returns:
            Success or error message
        """
        if not appointment_id:
            return "❌ Appointment ID is required."
        
        try:
            error = delete_appointment(appointment_id)
            
            if error:
                return f"❌ {error}"
            
            return f"✅ Appointment {appointment_id} cancelled successfully."
            
        except Exception as e:
            return f"❌ Error cancelling appointment: {str(e)}"

    @staticmethod
    def reschedule(
        appointment_id: int,
        new_date: str,
        new_time: str
    ) -> str:
        """
        Reschedule an existing appointment.
        
        Args:
            appointment_id: The ID of the appointment to reschedule
            new_date: New date string
            new_time: New time string
            
        Returns:
            Success or error message
        """
        if not appointment_id:
            return "❌ Appointment ID is required."
        
        if not new_date:
            return "❌ New date is required."
        
        if not new_time:
            return "❌ New time is required."

        try:
            # Normalize date and time
            normalized_date = normalize_date(new_date)
            normalized_time = normalize_time(new_time)
            
            # Update appointment
            error = update_appointment_status(
                appointment_id,
                {"appointment_date": normalized_date, "appointment_time": normalized_time}
            )
            
            if error:
                return f"❌ {error}"
            
            return f"✅ Appointment rescheduled to {new_date} at {new_time}."
            
        except ValueError as e:
            return f"❌ Invalid date or time format: {str(e)}"
        except Exception as e:
            return f"❌ Error rescheduling appointment: {str(e)}"

    @staticmethod
    def list_appointments(patient_id: Optional[int] = None) -> str:
        """
        List appointments, optionally filtered by patient.
        
        Args:
            patient_id: Optional patient ID to filter appointments
            
        Returns:
            Formatted list of appointments or error message
        """
        try:
            appointments = get_all_appointments()
            
            if patient_id:
                appointments = [a for a in appointments if a.get('patient_id') == patient_id]
            
            if not appointments:
                return "No appointments found."
            
            # Format appointments
            result = "Appointments:\n"
            for apt in appointments:
                result += (
                    f"- ID: {apt.get('id')}, "
                    f"Date: {apt.get('appointment_date')}, "
                    f"Time: {apt.get('appointment_time')}, "
                    f"Status: {apt.get('status')}\n"
                )
            
            return result
            
        except Exception as e:
            return f"❌ Error retrieving appointments: {str(e)}"
