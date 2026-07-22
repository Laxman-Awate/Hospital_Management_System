from models.patient import Patient
from models.doctor import Doctor
from models.appointment import Appointment
from datetime import date


def dashboard_stats():

    total_patients = Patient.query.count()

    total_doctors = Doctor.query.count()

    total_appointments = Appointment.query.count()

    today_appointments = Appointment.query.filter(
        Appointment.appointment_date == date.today()
    ).count()

    return {
        "total_patients": total_patients,
        "total_doctors": total_doctors,
        "total_appointments": total_appointments,
        "today_appointments": today_appointments
    }
def recent_appointments():

    appointments = Appointment.query.order_by(
        Appointment.created_at.desc()
    ).limit(5).all()

    data = []

    for appointment in appointments:
        data.append({
            "patient": appointment.patient.user.full_name,
            "doctor": appointment.doctor.user.full_name,
            "date": str(appointment.appointment_date),
            "time": str(appointment.appointment_time),
            "status": appointment.status
        })

    return data

from models import db

def doctor_summary():

    doctors = Doctor.query.all()

    result = []

    for doctor in doctors:

        total = Appointment.query.filter_by(
            doctor_id=doctor.id
        ).count()

        result.append({
            "doctor": doctor.user.full_name,
            "specialization": doctor.specialization,
            "appointments": total
        })

    return result