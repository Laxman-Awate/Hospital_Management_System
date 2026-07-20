from flask import jsonify
from utils.role_required import role_required


@role_required("Doctor")
def doctor_dashboard():

    return jsonify({
        "message": "Welcome Doctor"
    }), 200

from flask import request
from services.doctor_service import create_doctor,get_doctor_by_id,update_doctor,delete_doctor
from utils.response import success_response, error_response
from utils.role_required import role_required


@role_required("Admin")
def add_doctor():

    data = request.get_json()

    doctor, error = create_doctor(data)

    if error:
        return error_response(error, 400)

    return success_response("Doctor created successfully")

@role_required("Admin")
def get_doctor(doctor_id):

    doctor = get_doctor_by_id(doctor_id)

    if not doctor:
        return error_response("Doctor not found",404)

    return success_response(
        "Doctor fetched successfully",
        doctor
    )

@role_required("Admin")
def edit_doctor(doctor_id):

    data=request.get_json()

    doctor,error=update_doctor(doctor_id,data)

    if error:
        return error_response(error,404)

    return success_response("Doctor updated successfully")

@role_required("Admin")
def remove_doctor(doctor_id):

    error=delete_doctor(doctor_id)

    if error:
        return error_response(error,404)

    return success_response("Doctor deleted successfully")