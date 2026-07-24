from flask import request
from services.appointment_service import create_appointment,delete_appointment,get_all_appointments,get_appointment_by_id,update_appointment_status

from flask_jwt_extended import get_jwt, get_jwt_identity
from utils.response import success_response,error_response
from utils.role_required import role_required


@role_required(["Admin", "Patient", "Doctor"])
def add_appointment():

    data=request.get_json()

    appointment,error=create_appointment(data)

    if error:
        return error_response(error,400)

    return success_response(
        "Appointment booked successfully"
    )

@role_required(["Admin", "Patient", "Doctor"])
def get_appointments():
    role = get_jwt().get("role")
    user_id = get_jwt_identity()
    return success_response(
        "Appointments fetched successfully",
        get_all_appointments(role, user_id)
    )


@role_required(["Admin", "Patient", "Doctor"])
def get_appointment(appointment_id):
    role = get_jwt().get("role")
    user_id = get_jwt_identity()
    appointment = get_appointment_by_id(appointment_id, role, user_id)

    if not appointment:
        return error_response("Appointment not found",404)

    return success_response(
        "Appointment fetched successfully",
        appointment
    )


@role_required(["Admin", "Doctor", "Patient"])
def edit_appointment(appointment_id):

    data = request.get_json()
    role = get_jwt().get("role")
    user_id = get_jwt_identity()

    error = update_appointment_status(
        appointment_id,
        data["status"],
        role,
        user_id
    )

    if error:
        return error_response(error,404)

    return success_response(
        "Appointment updated successfully"
    )


@role_required(["Admin", "Patient", "Doctor"])
def remove_appointment(appointment_id):
    role = get_jwt().get("role")
    user_id = get_jwt_identity()
    error = delete_appointment(appointment_id, role, user_id)

    if error:
        return error_response(error,404)

    return success_response(
        "Appointment cancelled successfully"
    )