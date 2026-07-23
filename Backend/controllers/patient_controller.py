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
    data = request.get_json()

    required_fields = [
        "user_id",
        "age",
        "gender",
        "phone"
    ]

    for field in required_fields:
        if field not in data:
            return error_response(f"{field} is required", 400)

    patient, error = create_patient(data)

    if error:
        return error_response(error, 400)

    patient_data = {
        "id": patient.id,
        "user_id": patient.user_id,
        "age": patient.age,
        "gender": patient.gender,
        "phone": patient.phone
    }

    return success_response(
        "Patient created successfully",
        patient_data,
        201
    )


@role_required("Admin")
def get_patients():
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)

    data = get_all_patients(page, per_page)

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