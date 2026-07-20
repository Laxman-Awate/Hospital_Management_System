from models import db
from models.patient import Patient
from models.user import User


def create_patient(data):

    # Check if user exists
    user = User.query.get(data["user_id"])

    if not user:
        return None, "User not found"

    # Check user role
    if user.role != "Patient":
        return None, "Selected user is not a Patient"

    # Check duplicate patient profile
    existing_patient = Patient.query.filter_by(
        user_id=data["user_id"]
    ).first()

    if existing_patient:
        return None, "Patient profile already exists"

    patient = Patient(
        user_id=data["user_id"],
        age=data["age"],
        gender=data["gender"],
        phone=data["phone"],
        blood_group=data.get("blood_group"),
        date_of_birth=data.get("date_of_birth"),
        address=data.get("address"),
        emergency_contact=data.get("emergency_contact"),
        medical_history=data.get("medical_history")
    )

    db.session.add(patient)
    db.session.commit()

    return patient, None