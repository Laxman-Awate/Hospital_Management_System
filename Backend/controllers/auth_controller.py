from flask import request, jsonify
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt

from models import db
from models.user import User
from services.patient_service import create_patient

bcrypt = Bcrypt()


def register():

    data = request.get_json()

    full_name = data.get("full_name")
    email = data.get("email")
    password = data.get("password")
    # The database and authorization checks use title-cased role values
    # ("Admin", "Doctor", "Patient").  The registration form previously
    # posted lowercase values, which produced accounts that could not be used
    # to create a patient profile.
    role = (data.get("role") or "").strip().capitalize()

    if not all([full_name, email, password, role]):
        return jsonify({
            "message": "All fields are required"
        }), 400

    if role not in {"Admin", "Doctor", "Patient"}:
        return jsonify({
            "message": "Role must be Admin, Doctor, or Patient"
        }), 400

    existing_user = User.query.filter_by(email=email).first()

    if existing_user:
        return jsonify({
            "message": "Email already registered"
        }), 409

    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")

    try:
        new_user = User(
            full_name=full_name,
            email=email,
            password=hashed_password,
            role=role
        )

        db.session.add(new_user)
        db.session.commit()
        print("Registered user id:", new_user.id)

        patient_created = False
        if role == "Patient":
            patient, error = create_patient({
                "user_id": new_user.id,
                "age": 0,
                "gender": "Male",
                "phone": "0000000000"
            })
            if error:
                print("Registration rollback:", error)
                return jsonify({
                    "message": error
                }), 500
            patient_created = True
            print("Patient row created:", patient_created, "patient_id:", patient.id, "patient.user_id:", patient.user_id)
        else:
            print("Patient row created:", patient_created)
    except Exception as error:
        db.session.rollback()
        print("Registration rollback:", str(error))
        return jsonify({
            "message": "Unable to register user"
        }), 500

    return jsonify({
        "message": "User registered successfully"
    }), 201

def login():

    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({
            "message": "Email and Password are required"
        }), 400

    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({
            "message": "Invalid Email or Password"
        }), 401

    if not bcrypt.check_password_hash(user.password, password):
        return jsonify({
            "message": "Invalid Email or Password"
        }), 401

    access_token = create_access_token(
        identity=str(user.id),
        additional_claims={
            "role": user.role,
            "email": user.email
        }
    )

    return jsonify({
        "message": "Login Successful",
        "access_token": access_token,
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role
        }
    }), 200

@jwt_required()
def get_profile():

    user_id = get_jwt_identity()

    user = User.query.get(user_id)

    if not user:
        return jsonify({
            "message": "User not found"
        }), 404

    return jsonify({
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "role": user.role
    }), 200
