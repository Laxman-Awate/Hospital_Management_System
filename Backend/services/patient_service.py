from models import db
from models.patient import Patient
from models.user import User
from extensions import bcrypt


def create_patient(data):
    try:
        user_id = data.get("user_id")

        if user_id:
            # Backward compatible path for an already registered patient.
            user = db.session.get(User, int(user_id))

            if not user:
                return None, "User not found"

            if (user.role or "").casefold() != "patient":
                return None, "Selected user is not a Patient"

            existing_patient = Patient.query.filter_by(user_id=user.id).first()

            if existing_patient:
                return None, "Patient profile already exists"
        else:
            if User.query.filter_by(email=data["email"]).first():
                return None, "Email already exists"

            user = User(
                full_name=data["full_name"],
                email=data["email"],
                password=bcrypt.generate_password_hash(data["password"]).decode("utf-8"),
                role="Patient"
            )
            db.session.add(user)
            db.session.flush()

        patient = Patient(
            user_id=user.id,
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
    except (TypeError, ValueError):
        db.session.rollback()
        return None, "User ID must be a valid number"
    except Exception as error:
        db.session.rollback()
        return None, str(error)




def get_all_patients(page=1, per_page=10, role="Admin", user_id=None):
    from models.appointment import Appointment
    from models.doctor import Doctor
    
    query = Patient.query
    
    if role == "Doctor":
        doctor = Doctor.query.filter_by(user_id=int(user_id)).first()
        if doctor:
            patient_ids = [app.patient_id for app in Appointment.query.filter_by(doctor_id=doctor.id).all()]
            query = query.filter(Patient.id.in_(patient_ids))
        else:
            query = query.filter(db.false())

    patients = query.paginate(
        page=page,
        per_page=per_page,
        error_out=False
    )

    result = []

    for patient in patients.items:

        result.append({
            "id": patient.id,
            "full_name": patient.user.full_name,
            "email": patient.user.email,
            "age": patient.age,
            "gender": patient.gender,
            "phone": patient.phone,
            "blood_group": patient.blood_group
        })

    return {
        "patients": result,
        "total": patients.total,
        "pages": patients.pages,
        "current_page": patients.page
    }

def get_patient_by_id(patient_id):

    patient = Patient.query.get(patient_id)

    if not patient:
        return None

    return {
        "id": patient.id,
        "user_id": patient.user_id,
        "full_name": patient.user.full_name,
        "email": patient.user.email,
        "age": patient.age,
        "gender": patient.gender,
        "phone": patient.phone,
        "blood_group": patient.blood_group,
        "date_of_birth": str(patient.date_of_birth) if patient.date_of_birth else None,
        "address": patient.address,
        "emergency_contact": patient.emergency_contact,
        "medical_history": patient.medical_history
    }

def update_patient(patient_id, data):

    patient = Patient.query.get(patient_id)

    if not patient:
        return None, "Patient not found"

    patient.age = data.get("age", patient.age)
    patient.gender = data.get("gender", patient.gender)
    patient.phone = data.get("phone", patient.phone)
    patient.blood_group = data.get("blood_group", patient.blood_group)
    patient.date_of_birth = data.get("date_of_birth", patient.date_of_birth)
    patient.address = data.get("address", patient.address)
    patient.emergency_contact = data.get(
        "emergency_contact",
        patient.emergency_contact
    )
    patient.medical_history = data.get(
        "medical_history",
        patient.medical_history
    )

    db.session.commit()

    return patient, None

def delete_patient(patient_id):

    patient = Patient.query.get(patient_id)

    if not patient:
        return "Patient not found"

    db.session.delete(patient)
    db.session.commit()

    return None
