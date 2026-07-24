from flask import request
from services.patient_service import (
    create_patient,
    get_all_patients,
    get_patient_by_id,
    update_patient,
    delete_patient
)
from utils.response import success_response, error_response
from utils.role_required import role_required


@role_required("Admin")
def add_patient():
    data = request.get_json(silent=True) or {}

    required_fields = [
        "age",
        "gender",
        "phone"
    ]

    for field in required_fields:
        if not data.get(field):
            return error_response(f"{field} is required", 400)

    # An administrator can now create the patient's account and profile in a
    # single action.  Keep user_id support for any existing integrations that
    # intentionally attach a profile to an already registered patient.
    if not data.get("user_id"):
        for field in ["full_name", "email", "password"]:
            if not data.get(field):
                return error_response(f"{field} is required", 400)

    patient, error = create_patient(data)

    if error:
        return error_response(error, 400)

    patient_data = {
        "id": patient.id,
        "user_id": patient.user_id,
        "full_name": patient.user.full_name,
        "email": patient.user.email,
        "age": patient.age,
        "gender": patient.gender,
        "phone": patient.phone
    }

    return success_response(
        "Patient created successfully",
        patient_data,
        201
    )


@role_required(["Admin", "Doctor"])
def get_patients():
    from flask_jwt_extended import get_jwt, get_jwt_identity
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)

    role = get_jwt().get("role") if get_jwt() else "Admin"
    user_id = get_jwt_identity()

    data = get_all_patients(page, per_page, role, user_id)

    return success_response(
        "Patients fetched successfully",
        data
    )


@role_required("Admin")
def get_patient(patient_id):
    patient = get_patient_by_id(patient_id)

    if not patient:
        return error_response("Patient not found", 404)

    return success_response(
        "Patient fetched successfully",
        patient
    )


@role_required("Admin")
def edit_patient(patient_id):
    data = request.get_json()

    patient, error = update_patient(patient_id, data)

    if error:
        return error_response(error, 404)

    return success_response(
        "Patient updated successfully"
    )


@role_required("Admin")
def remove_patient(patient_id):
    error = delete_patient(patient_id)

    if error:
        return error_response(error, 404)

    return success_response("Patient deleted successfully")
