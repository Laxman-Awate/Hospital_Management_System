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


def get_all_appointments(role, user_id):
    query = Appointment.query
    
    if role == "Doctor":
        doctor = Doctor.query.filter_by(user_id=int(user_id)).first()
        if not doctor:
            return []
        query = query.filter_by(doctor_id=doctor.id)
    elif role == "Patient":
        patient = Patient.query.filter_by(user_id=int(user_id)).first()
        if not patient:
            return []
        query = query.filter_by(patient_id=patient.id)

    appointments = query.all()
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


def get_appointment_by_id(appointment_id, role, user_id):
    appointment = Appointment.query.get(appointment_id)

    if not appointment:
        return None

    if role == "Doctor":
        doctor = Doctor.query.filter_by(user_id=int(user_id)).first()
        if not doctor or appointment.doctor_id != doctor.id:
            return None
    elif role == "Patient":
        patient = Patient.query.filter_by(user_id=int(user_id)).first()
        if not patient or appointment.patient_id != patient.id:
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


def update_appointment_status(appointment_id, status, role, user_id):
    appointment = Appointment.query.get(appointment_id)

    if not appointment:
        return "Appointment not found"

    if role == "Doctor":
        doctor = Doctor.query.filter_by(user_id=int(user_id)).first()
        if not doctor or appointment.doctor_id != doctor.id:
            return "Access denied"
    elif role == "Patient":
        patient = Patient.query.filter_by(user_id=int(user_id)).first()
        if not patient or appointment.patient_id != patient.id:
            return "Access denied"

    appointment.status = status
    db.session.commit()

    return None


def delete_appointment(appointment_id, role, user_id):
    appointment = Appointment.query.get(appointment_id)

    if not appointment:
        return "Appointment not found"

    if role == "Doctor":
        doctor = Doctor.query.filter_by(user_id=int(user_id)).first()
        if not doctor or appointment.doctor_id != doctor.id:
            return "Access denied"
    elif role == "Patient":
        patient = Patient.query.filter_by(user_id=int(user_id)).first()
        if not patient or appointment.patient_id != patient.id:
            return "Access denied"

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
