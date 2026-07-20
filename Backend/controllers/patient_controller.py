from flask import request
from services.patient_service import create_patient
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