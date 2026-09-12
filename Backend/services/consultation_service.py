"""Consultation Service for managing Doctor Consultation recordings, transcripts, AI drafts, and approvals."""

from datetime import datetime
import os
import uuid
from werkzeug.utils import secure_filename

from models import db
from models.appointment import Appointment
from models.doctor import Doctor
from models.patient import Patient
from models.consultation_documentation import ConsultationDocumentation
from services.speech_to_text_service import SpeechToTextService
from services.clinical_ai_service import ClinicalAIService
from services.medical_record_service import MedicalRecordService

TEMP_UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "scratch", "temp_audio")
os.makedirs(TEMP_UPLOAD_DIR, exist_ok=True)

ALLOWED_AUDIO_EXTENSIONS = {".webm", ".wav", ".mp3", ".ogg", ".oga", ".m4a", ".mp4"}


class ConsultationService:

    @staticmethod
    def _verify_doctor_access(appointment_id, user_id):
        appointment = Appointment.query.get(appointment_id)
        if not appointment:
            return None, None, None, "Appointment not found"

        doctor = Doctor.query.get(appointment.doctor_id)
        patient = Patient.query.get(appointment.patient_id)

        if not doctor or not patient:
            return None, None, None, "Doctor or Patient record not found"

        if doctor.user_id != int(user_id):
            return None, None, None, "Access denied: You are not the assigned doctor for this appointment"

        return appointment, doctor, patient, None

    @staticmethod
    def get_consultation(appointment_id, role, user_id):
        appointment = Appointment.query.get(appointment_id)
        if not appointment:
            return None, "Appointment not found"

        if role == "Doctor":
            doctor = Doctor.query.filter_by(user_id=int(user_id)).first()
            if not doctor or appointment.doctor_id != doctor.id:
                return None, "Access denied"
        elif role == "Patient":
            patient = Patient.query.filter_by(user_id=int(user_id)).first()
            if not patient or appointment.patient_id != patient.id:
                return None, "Access denied"

        doc = ConsultationDocumentation.query.filter_by(appointment_id=appointment.id).first()
        if not doc:
            # Create initial blank consultation record if doctor accesses it
            if role == "Doctor":
                doc = ConsultationDocumentation(
                    appointment_id=appointment.id,
                    patient_id=appointment.patient_id,
                    doctor_id=appointment.doctor_id,
                    consent_obtained=False,
                    status="DRAFT"
                )
                db.session.add(doc)
                db.session.commit()
            else:
                return None, "Consultation document not started"

        return doc.to_dict(), None

    @staticmethod
    def set_patient_consent(appointment_id, consent_obtained, role, user_id):
        if role != "Doctor":
            return None, "Only doctors can update consultation consent"

        appointment, doctor, patient, error = ConsultationService._verify_doctor_access(appointment_id, user_id)
        if error:
            return None, error

        doc = ConsultationDocumentation.query.filter_by(appointment_id=appointment.id).first()
        if not doc:
            doc = ConsultationDocumentation(
                appointment_id=appointment.id,
                patient_id=patient.id,
                doctor_id=doctor.id,
                consent_obtained=bool(consent_obtained),
                status="DRAFT"
            )
            db.session.add(doc)
        else:
            doc.consent_obtained = bool(consent_obtained)

        db.session.commit()
        return doc.to_dict(), None

    @staticmethod
    def transcribe_audio_file(appointment_id, audio_file, role, user_id):
        if role != "Doctor":
            return None, "Only doctors can record and transcribe consultation audio"

        appointment, doctor, patient, error = ConsultationService._verify_doctor_access(appointment_id, user_id)
        if error:
            return None, error

        doc = ConsultationDocumentation.query.filter_by(appointment_id=appointment.id).first()
        if not doc or not doc.consent_obtained:
            return None, "Patient consent is mandatory before starting recording or transcription"

        if not audio_file or not audio_file.filename:
            return None, "No audio file uploaded"

        filename = secure_filename(audio_file.filename)
        ext = os.path.splitext(filename)[1].lower()
        if not ext:
            ext = ".webm"
        if ext not in ALLOWED_AUDIO_EXTENSIONS:
            return None, f"Unsupported audio file format '{ext}'. Allowed formats: {', '.join(ALLOWED_AUDIO_EXTENSIONS)}"

        temp_filename = f"consultation_{appointment.id}_{uuid.uuid4().hex}{ext}"
        temp_filepath = os.path.join(TEMP_UPLOAD_DIR, temp_filename)

        try:
            audio_file.save(temp_filepath)

            # Perform speech-to-text transcription
            res, stt_error = SpeechToTextService.transcribe(temp_filepath)
            if stt_error:
                return None, stt_error

            doc.transcript = res["transcript"]
            doc.audio_duration = res.get("duration", 0)
            doc.status = "DRAFT"
            db.session.commit()

            return doc.to_dict(), None

        finally:
            # Privacy requirement 18: Purge temporary audio immediately after transcription
            if os.path.exists(temp_filepath):
                try:
                    os.remove(temp_filepath)
                except Exception:
                    pass

    @staticmethod
    def generate_clinical_draft(appointment_id, role, user_id, manual_transcript=None):
        if role != "Doctor":
            return None, "Only doctors can generate AI clinical drafts"

        appointment, doctor, patient, error = ConsultationService._verify_doctor_access(appointment_id, user_id)
        if error:
            return None, error

        doc = ConsultationDocumentation.query.filter_by(appointment_id=appointment.id).first()
        if not doc:
            return None, "Consultation record not initialized"

        transcript_text = manual_transcript if (manual_transcript and manual_transcript.strip()) else doc.transcript
        if not transcript_text or not transcript_text.strip():
            return None, "No transcript available to generate draft"

        if manual_transcript and manual_transcript.strip():
            doc.transcript = manual_transcript.strip()

        patient_info = {
            "name": patient.user.full_name,
            "age": patient.age,
            "gender": patient.gender
        }

        ai_draft, ai_error = ClinicalAIService.generate_draft(doc.transcript, patient_info)
        if ai_error:
            return None, ai_error

        doc.set_ai_draft_dict(ai_draft)
        doc.status = "REVIEWED"
        db.session.commit()

        return doc.to_dict(), None

    @staticmethod
    def update_draft(appointment_id, draft_data, role, user_id):
        if role != "Doctor":
            return None, "Only doctors can edit consultation drafts"

        appointment, doctor, patient, error = ConsultationService._verify_doctor_access(appointment_id, user_id)
        if error:
            return None, error

        doc = ConsultationDocumentation.query.filter_by(appointment_id=appointment.id).first()
        if not doc:
            return None, "Consultation record not initialized"

        if "transcript" in draft_data and isinstance(draft_data["transcript"], str):
            doc.transcript = draft_data["transcript"].strip()

        if "ai_draft" in draft_data and isinstance(draft_data["ai_draft"], dict):
            current_draft = doc.get_ai_draft_dict()
            current_draft.update(draft_data["ai_draft"])
            doc.set_ai_draft_dict(current_draft)

        doc.status = "REVIEWED"
        db.session.commit()
        return doc.to_dict(), None

    @staticmethod
    def approve_consultation(appointment_id, final_data, role, user_id):
        """
        Explicit Doctor Approval (Requirement 9):
        Only the doctor can approve & save official MedicalRecord.
        """
        if role != "Doctor":
            return None, "Only doctors can approve consultation records"

        appointment, doctor, patient, error = ConsultationService._verify_doctor_access(appointment_id, user_id)
        if error:
            return None, error

        doc = ConsultationDocumentation.query.filter_by(appointment_id=appointment.id).first()
        if not doc:
            doc = ConsultationDocumentation(
                appointment_id=appointment.id,
                patient_id=patient.id,
                doctor_id=doctor.id,
                consent_obtained=True,
                status="DRAFT"
            )
            db.session.add(doc)

        final_data["appointment_id"] = appointment.id

        # Save to official MedicalRecord table
        medical_record, record_error = MedicalRecordService.create_or_update_medical_record(final_data, role, user_id)
        if record_error:
            return None, record_error

        doc.status = "APPROVED"
        doc.approved_at = datetime.utcnow()
        db.session.commit()

        return {
            "consultation": doc.to_dict(),
            "medical_record": medical_record.to_dict()
        }, None
