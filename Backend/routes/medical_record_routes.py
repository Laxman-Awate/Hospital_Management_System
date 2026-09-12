from flask import Blueprint
from controllers.medical_record_controller import MedicalRecordController
from utils.role_required import role_required

medical_record_bp = Blueprint("medical_record", __name__, url_prefix="/api/medical-records")


@medical_record_bp.route("", methods=["GET"])
@role_required(["Admin", "Doctor", "Patient"])
def get_all_records():
    return MedicalRecordController.get_all_records()


@medical_record_bp.route("/<int:record_id>", methods=["GET"])
@role_required(["Admin", "Doctor", "Patient"])
def get_record(record_id):
    return MedicalRecordController.get_record(record_id)


@medical_record_bp.route("/patient/<int:patient_id>", methods=["GET"])
@role_required(["Admin", "Doctor", "Patient"])
def get_patient_records(patient_id):
    return MedicalRecordController.get_patient_records(patient_id)
