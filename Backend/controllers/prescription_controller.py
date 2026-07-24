from flask import request
from flask_jwt_extended import get_jwt, get_jwt_identity

from services.prescription_service import PrescriptionService
from utils.response import error_response, success_response


class PrescriptionController:

    @staticmethod
    def _actor():
        return get_jwt().get("role"), get_jwt_identity()

    @staticmethod
    def create_prescription():
        data = request.get_json(silent=True) or {}
        role, user_id = PrescriptionController._actor()
        prescription, error = PrescriptionService.create_prescription(data, role, user_id)
        if error:
            return error_response(error, 400)
        return success_response("Prescription created successfully", prescription.to_dict(), 201)

    @staticmethod
    def get_all_prescriptions():
        role, user_id = PrescriptionController._actor()
        prescriptions = PrescriptionService.get_all_prescriptions(role, user_id)
        return success_response("Prescriptions fetched successfully", prescriptions)

    @staticmethod
    def get_prescription(prescription_id):
        role, user_id = PrescriptionController._actor()
        prescription, error = PrescriptionService.get_prescription_by_id(prescription_id, role, user_id)
        if error:
            return error_response(error, 404 if error == "Prescription not found" else 403)
        return success_response("Prescription fetched successfully", prescription.to_dict())

    @staticmethod
    def update_prescription(prescription_id):
        data = request.get_json(silent=True) or {}
        role, user_id = PrescriptionController._actor()
        prescription, error = PrescriptionService.update_prescription(prescription_id, data, role, user_id)
        if error:
            return error_response(error, 404 if error == "Prescription not found" else 403 if error == "Access denied" else 400)
        return success_response("Prescription updated successfully", prescription.to_dict())

    @staticmethod
    def delete_prescription(prescription_id):
        role, user_id = PrescriptionController._actor()
        error = PrescriptionService.delete_prescription(prescription_id, role, user_id)
        if error:
            return error_response(error, 404 if error == "Prescription not found" else 403)
        return success_response("Prescription deleted successfully")
