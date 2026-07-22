from flask import Blueprint
from controllers.appointment_controller import add_appointment, get_appointments, get_appointment, edit_appointment, remove_appointment

appointment_bp=Blueprint(
    "appointment",
    __name__,
    url_prefix="/api/appointment"
)

appointment_bp.route(
    "",
    methods=["POST"]
)(add_appointment)  

appointment_bp.route("", methods=["GET"])(get_appointments)

appointment_bp.route("/<int:appointment_id>", methods=["GET"])(get_appointment)

appointment_bp.route("/<int:appointment_id>", methods=["PUT"])(edit_appointment)

appointment_bp.route("/<int:appointment_id>", methods=["DELETE"])(remove_appointment)