"""
Appointment Service

Service layer for appointment-related database operations.
Handles CRUD operations and business logic for appointments.
"""

from models import db
from models.appointment import Appointment
from models.patient import Patient
from models.doctor import Doctor
from models.user import User


def create_appointment(data):
    """
    Create a new appointment.
    
    Args:
        data: Dictionary containing appointment details
        
    Returns:
        Tuple of (appointment, error) where error is None on success
    """
    existing = Appointment.query.filter_by(
        doctor_id=data["doctor_id"],
        appointment_date=data["appointment_date"],
        appointment_time=data["appointment_time"]
    ).first()

    if existing:
        return None, "Doctor already has an appointment at this time."

    patient = Patient.query.get(data["patient_id"])

    if not patient:
        return None, "Patient not found"

    doctor = Doctor.query.get(data["doctor_id"])

    if not doctor:
        return None, "Doctor not found"

    appointment = Appointment(
        patient_id=data["patient_id"],
        doctor_id=data["doctor_id"],
        appointment_date=data["appointment_date"],
        appointment_time=data["appointment_time"],
        reason=data.get("reason")
    )

    db.session.add(appointment)
    db.session.commit()

    return appointment, None


def get_all_appointments():
    """
    Get all appointments with related patient and doctor information.
    
    Returns:
        List of appointment dictionaries
    """
    appointments = Appointment.query.all()

    result = []

    for appointment in appointments:
        result.append({
            "id": appointment.id,
            "patient": appointment.patient.user.full_name,
            "doctor": appointment.doctor.user.full_name,
            "date": str(appointment.appointment_date),
            "time": str(appointment.appointment_time),
            "status": appointment.status,
            "reason": appointment.reason
        })

    return result


def get_appointment_by_id(appointment_id):
    """
    Get appointment by ID with related information.
    
    Args:
        appointment_id: The appointment ID
        
    Returns:
        Appointment dictionary or None if not found
    """
    appointment = Appointment.query.get(appointment_id)

    if not appointment:
        return None

    return {
        "id": appointment.id,
        "patient": appointment.patient.user.full_name,
        "doctor": appointment.doctor.user.full_name,
        "date": str(appointment.appointment_date),
        "time": str(appointment.appointment_time),
        "status": appointment.status,
        "reason": appointment.reason
    }


def update_appointment_status(appointment_id, status):
    """
    Update appointment status.
    
    Args:
        appointment_id: The appointment ID
        status: New status value
        
    Returns:
        Error message or None on success
    """
    appointment = Appointment.query.get(appointment_id)

    if not appointment:
        return "Appointment not found"

    appointment.status = status
    db.session.commit()

    return None


def delete_appointment(appointment_id):
    """
    Delete an appointment.
    
    Args:
        appointment_id: The appointment ID
        
    Returns:
        Error message or None on success
    """
    appointment = Appointment.query.get(appointment_id)

    if not appointment:
        return "Appointment not found"

    db.session.delete(appointment)
    db.session.commit()

    return None


def get_doctor_by_name(name):
    """
    Find doctor by full name.
    
    Args:
        name: Doctor's full name
        
    Returns:
        Doctor object or None if not found
    """
    doctor = (
        Doctor.query
        .join(User, Doctor.user_id == User.id)
        .filter(User.full_name == name)
        .first()
    )

    return doctor
