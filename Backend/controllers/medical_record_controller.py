from flask import request
from flask_jwt_extended import get_jwt, get_jwt_identity

from services.medical_record_service import MedicalRecordService
from utils.response import error_response, success_response


class MedicalRecordController:

    @staticmethod
    def _actor():
        return get_jwt().get("role"), get_jwt_identity()

    @staticmethod
    def get_all_records():
        role, user_id = MedicalRecordController._actor()
        records = MedicalRecordService.get_all_medical_records(role, user_id)
        return success_response("Medical records fetched successfully", records)

    @staticmethod
    def get_record(record_id):
        role, user_id = MedicalRecordController._actor()
        record, error = MedicalRecordService.get_medical_record_by_id(record_id, role, user_id)
        if error:
            return error_response(error, 404 if "not found" in error else 403)
        return success_response("Medical record fetched successfully", record.to_dict())

    @staticmethod
    def get_patient_records(patient_id):
        role, user_id = MedicalRecordController._actor()
        records, error = MedicalRecordService.get_patient_medical_records(patient_id, role, user_id)
        if error:
            return error_response(error, 404 if "not found" in error else 403)
        return success_response("Patient medical records fetched successfully", records)
