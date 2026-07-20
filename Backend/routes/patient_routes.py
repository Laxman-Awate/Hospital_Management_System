from flask import Blueprint
from controllers.patient_controller import add_patient

patient_bp = Blueprint("patient", __name__)

patient_bp.route("", methods=["POST"])(add_patient)