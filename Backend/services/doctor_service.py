from models import db
from models.doctor import Doctor
from models.user import User


def create_doctor(data):

    # Check if user exists
    user = User.query.get(data["user_id"])

    if not user:
        return None, "User not found"

    # Check role
    if user.role != "Doctor":
        return None, "Selected user is not a Doctor"

    # Check duplicate profile
    existing = Doctor.query.filter_by(user_id=data["user_id"]).first()

    if existing:
        return None, "Doctor profile already exists"

    doctor = Doctor(
        user_id=data["user_id"],
        specialization=data["specialization"],
        qualification=data["qualification"],
        experience=data["experience"],
        consultation_fee=data["consultation_fee"],
        phone=data["phone"],
        department=data["department"],
        available_days=data.get("available_days"),
        available_time=data.get("available_time"),
        status=data.get("status", True)
    )

    db.session.add(doctor)
    db.session.commit()

    return doctor, None

def get_doctor_by_id(doctor_id):

    doctor = Doctor.query.get(doctor_id)

    if not doctor:
        return None

    return {
        "id": doctor.id,
        "user_id": doctor.user_id,
        "full_name": doctor.user.full_name,
        "email": doctor.user.email,
        "specialization": doctor.specialization,
        "qualification": doctor.qualification,
        "experience": doctor.experience,
        "consultation_fee": doctor.consultation_fee,
        "department": doctor.department,
        "phone": doctor.phone,
        "available_days": doctor.available_days,
        "available_time": doctor.available_time,
        "status": doctor.status
    }

def update_doctor(doctor_id, data):

    doctor = Doctor.query.get(doctor_id)

    if not doctor:
        return None, "Doctor not found"

    doctor.specialization = data.get("specialization", doctor.specialization)
    doctor.qualification = data.get("qualification", doctor.qualification)
    doctor.experience = data.get("experience", doctor.experience)
    doctor.consultation_fee = data.get("consultation_fee", doctor.consultation_fee)
    doctor.phone = data.get("phone", doctor.phone)
    doctor.department = data.get("department", doctor.department)
    doctor.available_days = data.get("available_days", doctor.available_days)
    doctor.available_time = data.get("available_time", doctor.available_time)
    doctor.status = data.get("status", doctor.status)

    db.session.commit()

    return doctor, None

def delete_doctor(doctor_id):

    doctor = Doctor.query.get(doctor_id)

    if not doctor:
        return "Doctor not found"

    db.session.delete(doctor)
    db.session.commit()

    return None