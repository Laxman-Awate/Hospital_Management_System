from flask import Blueprint
from controllers.patient_controller import add_patient,get_patients,get_patient

patient_bp = Blueprint("patient", __name__)

patient_bp.route("", methods=["POST"])(add_patient)
patient_bp.route("", methods=["GET"])(get_patients)
patient_bp.route("/<int:patient_id>", methods=["GET"])(get_patient)