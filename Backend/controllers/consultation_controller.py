from flask import request
from flask_jwt_extended import get_jwt, get_jwt_identity

from services.consultation_service import ConsultationService
from utils.response import error_response, success_response


class ConsultationController:

    @staticmethod
    def _actor():
        return get_jwt().get("role"), get_jwt_identity()

    @staticmethod
    def get_consultation(appointment_id):
        role, user_id = ConsultationController._actor()
        doc, error = ConsultationService.get_consultation(appointment_id, role, user_id)
        if error:
            return error_response(error, 403 if "Access denied" in error else 404)
        return success_response("Consultation details fetched", doc)

    @staticmethod
    def record_consent(appointment_id):
        role, user_id = ConsultationController._actor()
        data = request.get_json(silent=True) or {}
        consent = data.get("consent_obtained", False)
        doc, error = ConsultationService.set_patient_consent(appointment_id, consent, role, user_id)
        if error:
            return error_response(error, 403 if "Access denied" in error else 400)
        return success_response("Patient consent recorded successfully", doc)

    @staticmethod
    def transcribe(appointment_id):
        role, user_id = ConsultationController._actor()
        audio_file = request.files.get("audio") or request.files.get("file")
        if not audio_file:
            return error_response("Audio file is required in multipart form data", 400)

        doc, error = ConsultationService.transcribe_audio_file(appointment_id, audio_file, role, user_id)
        if error:
            status_code = 400
            if "Access denied" in error:
                status_code = 403
            elif "not found" in error:
                status_code = 404
            elif "exceeds" in error:
                status_code = 413
            elif "API key" in error or "HTTP error" in error or "transcription failed" in error:
                status_code = 500
            return error_response(error, status_code)

        return success_response("Audio transcribed successfully", doc, 201)

    @staticmethod
    def generate_draft(appointment_id):
        role, user_id = ConsultationController._actor()
        data = request.get_json(silent=True) or {}
        manual_transcript = data.get("transcript")
        doc, error = ConsultationService.generate_clinical_draft(appointment_id, role, user_id, manual_transcript)
        if error:
            status_code = 400
            if "Access denied" in error:
                status_code = 403
            elif "not found" in error:
                status_code = 404
            elif "API key" in error or "HTTP error" in error:
                status_code = 500
            return error_response(error, status_code)

        return success_response("AI clinical draft generated successfully", doc)

    @staticmethod
    def update_draft(appointment_id):
        role, user_id = ConsultationController._actor()
        data = request.get_json(silent=True) or {}
        doc, error = ConsultationService.update_draft(appointment_id, data, role, user_id)
        if error:
            return error_response(error, 403 if "Access denied" in error else 400)
        return success_response("Consultation draft updated successfully", doc)

    @staticmethod
    def approve(appointment_id):
        role, user_id = ConsultationController._actor()
        data = request.get_json(silent=True) or {}
        result, error = ConsultationService.approve_consultation(appointment_id, data, role, user_id)
        if error:
            return error_response(error, 403 if "Access denied" in error else 400)
        return success_response("Medical record approved and saved successfully", result, 201)
