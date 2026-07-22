from flask import request
from services.appointment_service import create_appointment,delete_appointment,get_all_appointments,get_appointment_by_id,update_appointment_status


from utils.response import success_response,error_response
from utils.role_required import role_required


@role_required("Admin")
def add_appointment():

    data=request.get_json()

    appointment,error=create_appointment(data)

    if error:
        return error_response(error,400)

    return success_response(
        "Appointment booked successfully"
    )
@role_required("Admin")
def get_appointments():
    return success_response(
        "Appointments fetched successfully",
        get_all_appointments()
    )


@role_required("Admin")
def get_appointment(appointment_id):

    appointment = get_appointment_by_id(appointment_id)

    if not appointment:
        return error_response("Appointment not found",404)

    return success_response(
        "Appointment fetched successfully",
        appointment
    )


@role_required("Admin")
def edit_appointment(appointment_id):

    data = request.get_json()

    error = update_appointment_status(
        appointment_id,
        data["status"]
    )

    if error:
        return error_response(error,404)

    return success_response(
        "Appointment updated successfully"
    )


@role_required("Admin")
def remove_appointment(appointment_id):

    error = delete_appointment(appointment_id)

    if error:
        return error_response(error,404)

    return success_response(
        "Appointment cancelled successfully"
    )