from flask import Blueprint
from controllers.patient_controller import add_patient, get_patients, get_patient, edit_patient, remove_patient, get_patient_by_user_id

patient_bp = Blueprint("patient", __name__, url_prefix="/api/patient")

patient_bp.route("", methods=["POST"])(add_patient)
patient_bp.route("", methods=["GET"])(get_patients)
patient_bp.route("/<int:patient_id>", methods=["GET"])(get_patient)
patient_bp.route("/<int:patient_id>", methods=["PUT"])(edit_patient)
patient_bp.route("/<int:patient_id>", methods=["DELETE"])(remove_patient)
patient_bp.route("/by-user/<int:user_id>", methods=["GET"])(get_patient_by_user_id)