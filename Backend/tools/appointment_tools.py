"""
Appointment Tools

Business logic layer for appointment operations.
Handles validation, doctor recommendation, data transformation,
and service calls.
"""

from typing import Optional

from services.appointment_service import (
    create_appointment,
    delete_appointment,
    update_appointment_status,
    get_all_appointments,
    get_doctor_by_name
)

from services.doctor_service import get_doctors_by_department

from utils.date_time_parser import (
    normalize_date,
    normalize_time
)

from utils.symptom_mapper import get_department


class AppointmentTools:
    """
    Business logic for appointment operations.
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
        Book an appointment.
        """

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

        doctor = get_doctor_by_name(doctor_name)

        if doctor is None:
            return f"❌ Doctor '{doctor_name}' not found."

        try:
            normalized_date = normalize_date(appointment_date)
            normalized_time = normalize_time(appointment_time)

        except ValueError as e:
            return f"❌ {str(e)}"

        except Exception as e:
            return f"❌ Error processing date/time: {str(e)}"

        appointment_data = {
            "patient_id": patient_id,
            "doctor_id": doctor.id,
            "appointment_date": normalized_date,
            "appointment_time": normalized_time,
            "reason": reason
        }

        try:
            appointment, error = create_appointment(appointment_data)

            if error:
                return f"❌ {error}"

            return (
                f"✅ Appointment booked successfully!\n\n"
                f"Appointment ID : {appointment.id}\n"
                f"Doctor         : {doctor_name}\n"
                f"Date           : {appointment_date}\n"
                f"Time           : {appointment_time}"
            )

        except Exception as e:
            return f"❌ Error while booking appointment: {str(e)}"

    @staticmethod
    def cancel(appointment_id: int) -> str:
        """
        Cancel an appointment.
        """

        if not appointment_id:
            return "❌ Appointment ID is required."

        try:
            error = delete_appointment(appointment_id)

            if error:
                return f"❌ {error}"

            return f"✅ Appointment {appointment_id} cancelled successfully."

        except Exception as e:
            return f"❌ {str(e)}"

    @staticmethod
    def reschedule(
        appointment_id: int,
        new_date: str,
        new_time: str
    ) -> str:
        """
        Reschedule an appointment.
        """

        if not appointment_id:
            return "❌ Appointment ID is required."

        if not new_date:
            return "❌ New appointment date is required."

        if not new_time:
            return "❌ New appointment time is required."

        try:
            normalized_date = normalize_date(new_date)
            normalized_time = normalize_time(new_time)

            error = update_appointment_status(
                appointment_id,
                {
                    "appointment_date": normalized_date,
                    "appointment_time": normalized_time
                }
            )

            if error:
                return f"❌ {error}"

            return (
                f"✅ Appointment rescheduled successfully.\n"
                f"New Date : {new_date}\n"
                f"New Time : {new_time}"
            )

        except Exception as e:
            return f"❌ {str(e)}"

    @staticmethod
    def list_appointments(patient_id: Optional[int] = None) -> str:
        """
        List appointments.
        """

        try:
            appointments = get_all_appointments()

            if patient_id:
                appointments = [
                    appointment
                    for appointment in appointments
                    if appointment.get("patient_id") == patient_id
                ]

            if not appointments:
                return "No appointments found."

            result = "Appointments\n\n"

            for appointment in appointments:

                result += (
                    f"ID : {appointment.get('id')}\n"
                    f"Date : {appointment.get('appointment_date')}\n"
                    f"Time : {appointment.get('appointment_time')}\n"
                    f"Status : {appointment.get('status')}\n\n"
                )

            return result

        except Exception as e:
            return f"❌ {str(e)}"

    @staticmethod
    def get_available_doctors(symptoms: str):
        """
        Recommend doctors based on patient symptoms.
        """

        department = get_department(symptoms)

        doctors = get_doctors_by_department(department)

        if not doctors:
            return {
                "success": False,
                "department": department,
                "message": f"No doctors available in {department} department."
            }

        return {
            "success": True,
            "department": department,
            "doctors": doctors
        }

    @staticmethod
    def recommend_doctors(symptoms: str) -> str:
        """
        Recommend doctors based on symptoms.
        """

        department = get_department(symptoms)

        doctors = get_doctors_by_department(department)

        if not doctors:
            return (
                f"🏥 Recommended Department: {department}\n\n"
                "❌ No doctors are currently available."
            )

        response = f"🏥 Recommended Department: {department}\n\n"
        response += "Available Doctors:\n\n"

        for index, doctor in enumerate(doctors, start=1):
            response += (
                f"{index}. {doctor['full_name']}\n"
                f"   Specialization: {doctor['specialization']}\n"
                f"   Available: {doctor['available_days']} | {doctor['available_time']}\n\n"
            )

        response += "Please enter the doctor's name."

        return response