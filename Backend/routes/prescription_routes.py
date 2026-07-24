from functools import wraps

from flask import Blueprint, jsonify
from flask_jwt_extended import get_jwt, jwt_required

from controllers.prescription_controller import PrescriptionController


prescription_bp = Blueprint(
    "prescription", __name__, url_prefix="/api/prescriptions"
)


def prescription_writer_required(fn):
    """Allow Admin and Doctor without changing the existing auth helpers."""
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        if get_jwt().get("role") not in {"Admin", "Doctor"}:
            return jsonify({"success": False, "message": "Access Denied"}), 403
        return fn(*args, **kwargs)
    return wrapper


@prescription_bp.route("", methods=["POST"])
@prescription_writer_required
def create_prescription():
    return PrescriptionController.create_prescription()


@prescription_bp.route("", methods=["GET"])
@jwt_required()
def get_all_prescriptions():
    return PrescriptionController.get_all_prescriptions()


@prescription_bp.route("/<int:prescription_id>", methods=["GET"])
@jwt_required()
def get_prescription(prescription_id):
    return PrescriptionController.get_prescription(prescription_id)


@prescription_bp.route("/<int:prescription_id>", methods=["PUT"])
@prescription_writer_required
def update_prescription(prescription_id):
    return PrescriptionController.update_prescription(prescription_id)


@prescription_bp.route("/<int:prescription_id>", methods=["DELETE"])
@prescription_writer_required
def delete_prescription(prescription_id):
    return PrescriptionController.delete_prescription(prescription_id)
