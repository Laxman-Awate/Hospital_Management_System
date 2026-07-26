from models import db
from models.doctor import Doctor
from models.user import User
from flask_bcrypt import Bcrypt
from models.doctor import Doctor
from models.user import User

bcrypt = Bcrypt()


def get_doctors(role="Admin"):
    doctors = Doctor.query.all()

    if role == "Patient":
        return [
            {
                "id": doctor.id,
                "full_name": doctor.user.full_name,
                "specialization": doctor.specialization,
                "qualification": doctor.qualification,
                "experience": doctor.experience,
                "available_days": doctor.available_days,
                "available_time": doctor.available_time,
            }
            for doctor in doctors if doctor.status
        ]

    return [
        {
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
        for doctor in doctors
    ]


def create_doctor(data):
    try:
        existing_user = User.query.filter_by(
            email=data["email"]
        ).first()

        if existing_user:
            return None, "Email already exists"

        user = User(
            full_name=data["full_name"],
            email=data["email"],
            password=bcrypt.generate_password_hash(
                data["password"]
            ).decode("utf-8"),
            role="Doctor"
        )

        db.session.add(user)
        db.session.flush()

        doctor = Doctor(
            user_id=user.id,
            specialization=data["specialization"],
            qualification=data.get("qualification"),
            experience=data.get("experience"),
            consultation_fee=data.get("consultation_fee"),
            department=data.get("department"),
            phone=data.get("phone"),
            available_days=data.get("available_days"),
            available_time=data.get("available_time"),
            status=True
        )

        db.session.add(doctor)
        db.session.commit()

        return doctor, None

    except Exception as e:
        db.session.rollback()
        return None, str(e)


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

    # Update User table
    doctor.user.full_name = data.get(
        "full_name",
        doctor.user.full_name
    )

    new_email = data.get(
        "email",
        doctor.user.email
    )

    if new_email != doctor.user.email:
        existing = User.query.filter(
            User.email == new_email,
            User.id != doctor.user.id
        ).first()

        if existing:
            return None, "Email already exists"

        doctor.user.email = new_email

    if data.get("password"):
        doctor.user.password = bcrypt.generate_password_hash(
            data["password"]
        ).decode("utf-8")

    # Update Doctor table
    doctor.specialization = data.get(
        "specialization",
        doctor.specialization
    )

    doctor.qualification = data.get(
        "qualification",
        doctor.qualification
    )

    doctor.experience = data.get(
        "experience",
        doctor.experience
    )

    doctor.consultation_fee = data.get(
        "consultation_fee",
        doctor.consultation_fee
    )

    doctor.department = data.get(
        "department",
        doctor.department
    )

    doctor.phone = data.get(
        "phone",
        doctor.phone
    )

    doctor.available_days = data.get(
        "available_days",
        doctor.available_days
    )

    doctor.available_time = data.get(
        "available_time",
        doctor.available_time
    )

    doctor.status = data.get(
        "status",
        doctor.status
    )

    db.session.commit()

    return doctor, None


def delete_doctor(doctor_id):
    doctor = Doctor.query.get(doctor_id)

    if not doctor:
        return "Doctor not found"

    user = doctor.user

    db.session.delete(doctor)

    if user:
        db.session.delete(user)

    db.session.commit()

    return None




def get_doctors_by_department(department):
    """
    Return all active doctors for a department.
    """

    doctors = (
        Doctor.query
        .filter_by(
            department=department,
            status=True
        )
        .all()
    )

    result = []

    for doctor in doctors:
        user = User.query.get(doctor.user_id)

        result.append({
            "id": doctor.id,
            "full_name": user.full_name,
            "department": doctor.department,
            "specialization": doctor.specialization,
            "available_days": doctor.available_days,
            "available_time": doctor.available_time
        })

    return result


def get_doctor_by_user_id(user_id):
    doctor = Doctor.query.filter_by(user_id=int(user_id)).first()

    if not doctor:
        return None

    return {
        "id": doctor.id,
        "user_id": doctor.user_id,
        "full_name": doctor.user.full_name,
        "email": doctor.user.email,
        "specialization": doctor.specialization
    }

