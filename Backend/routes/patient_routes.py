from flask import Blueprint
from controllers.patient_controller import add_patient,get_patients,get_patient,edit_patient,remove_patient

patient_bp = Blueprint("patient", __name__)

patient_bp.route("", methods=["POST"])(add_patient)
patient_bp.route("", methods=["GET"])(get_patients)
patient_bp.route("/<int:patient_id>", methods=["GET"])(get_patient)
patient_bp.route("/<int:patient_id>", methods=["PUT"])(edit_patient)
patient_bp.route("/<int:patient_id>", methods=["DELETE"])(remove_patient)