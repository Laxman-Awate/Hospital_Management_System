from flask import Blueprint
from controllers.consultation_controller import ConsultationController
from utils.role_required import role_required

consultation_bp = Blueprint("consultation", __name__, url_prefix="/api/consultations")


@consultation_bp.route("/<int:appointment_id>", methods=["GET"])
@role_required(["Admin", "Doctor"])
def get_consultation(appointment_id):
    return ConsultationController.get_consultation(appointment_id)


@consultation_bp.route("/<int:appointment_id>/consent", methods=["POST"])
@role_required(["Doctor"])
def record_consent(appointment_id):
    return ConsultationController.record_consent(appointment_id)


@consultation_bp.route("/<int:appointment_id>/transcribe", methods=["POST"])
@role_required(["Doctor"])
def transcribe(appointment_id):
    return ConsultationController.transcribe(appointment_id)


@consultation_bp.route("/<int:appointment_id>/generate-draft", methods=["POST"])
@role_required(["Doctor"])
def generate_draft(appointment_id):
    return ConsultationController.generate_draft(appointment_id)


@consultation_bp.route("/<int:appointment_id>/draft", methods=["PUT"])
@role_required(["Doctor"])
def update_draft(appointment_id):
    return ConsultationController.update_draft(appointment_id)


@consultation_bp.route("/<int:appointment_id>/approve", methods=["POST"])
@role_required(["Doctor"])
def approve(appointment_id):
    return ConsultationController.approve(appointment_id)
