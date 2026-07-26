from flask import Blueprint
from flask_jwt_extended import jwt_required

from controllers.doctor_controller import DoctorController

doctor_bp = Blueprint(
    "doctor",
    __name__,
    url_prefix="/api/doctor"
)


@doctor_bp.route("/dashboard", methods=["GET"])
@jwt_required()
def doctor_dashboard():
    return DoctorController.doctor_dashboard()


@doctor_bp.route("", methods=["GET"])
@jwt_required()
def get_doctors():
    return DoctorController.get_doctors()


@doctor_bp.route("", methods=["POST"])
@jwt_required()
def create_doctor():
    return DoctorController.create_doctor()


@doctor_bp.route("/<int:doctor_id>", methods=["GET"])
@jwt_required()
def get_doctor(doctor_id):
    return DoctorController.get_doctor(doctor_id)


@doctor_bp.route("/<int:doctor_id>", methods=["PUT"])
@jwt_required()
def update_doctor(doctor_id):
    return DoctorController.update_doctor(doctor_id)


@doctor_bp.route("/<int:doctor_id>", methods=["DELETE"])
@jwt_required()
def delete_doctor(doctor_id):
    return DoctorController.delete_doctor(doctor_id)


@doctor_bp.route("/by-user/<int:user_id>", methods=["GET"])
@jwt_required()
def get_doctor_by_user_id(user_id):
    return DoctorController.get_doctor_by_user_id(user_id)