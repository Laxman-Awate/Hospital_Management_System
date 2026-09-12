"""Medical Record Service layer for creating, fetching, and updating official medical records."""

from datetime import datetime
from models import db
from models.appointment import Appointment
from models.doctor import Doctor
from models.patient import Patient
from models.medical_record import MedicalRecord
from services.notification_service import NotificationService


class MedicalRecordService:

    @staticmethod
    def create_or_update_medical_record(data, role, user_id):
        """
        Creates or updates an official MedicalRecord from doctor-approved clinical data.
        Enforces doctor ownership and triggers patient notification.
        """
        if role != "Doctor" and role != "Admin":
            return None, "Only doctors can approve and save medical records"

        appointment_id = data.get("appointment_id")
        if not appointment_id:
            return None, "appointment_id is required"

        appointment = Appointment.query.get(appointment_id)
        if not appointment:
            return None, "Appointment not found"

        doctor = Doctor.query.get(appointment.doctor_id)
        patient = Patient.query.get(appointment.patient_id)

        if not doctor or not patient:
            return None, "Doctor or Patient record not found"

        if role == "Doctor" and doctor.user_id != int(user_id):
            return None, "You can only approve medical records for your own appointments"

        follow_up_date = None
        if data.get("follow_up_date"):
            try:
                follow_up_date = datetime.strptime(str(data["follow_up_date"]).strip(), "%Y-%m-%d").date()
            except ValueError:
                pass

        existing_record = MedicalRecord.query.filter_by(appointment_id=appointment.id).first()

        if existing_record:
            existing_record.chief_complaint = (data.get("chief_complaint") or "").strip()
            existing_record.symptoms = (data.get("symptoms") or "").strip()
            existing_record.diagnosis = (data.get("diagnosis") or "").strip()
            existing_record.clinical_notes = (data.get("clinical_notes") or "").strip()
            existing_record.recommended_tests = (data.get("recommended_tests") or "").strip()
            existing_record.treatment_notes = (data.get("treatment_notes") or "").strip()
            existing_record.follow_up_date = follow_up_date
            existing_record.remarks = (data.get("remarks") or "").strip()
            existing_record.updated_at = datetime.utcnow()
            record = existing_record
        else:
            record = MedicalRecord(
                appointment_id=appointment.id,
                doctor_id=doctor.id,
                patient_id=patient.id,
                chief_complaint=(data.get("chief_complaint") or "").strip(),
                symptoms=(data.get("symptoms") or "").strip(),
                diagnosis=(data.get("diagnosis") or "").strip(),
                clinical_notes=(data.get("clinical_notes") or "").strip(),
                recommended_tests=(data.get("recommended_tests") or "").strip(),
                treatment_notes=(data.get("treatment_notes") or "").strip(),
                follow_up_date=follow_up_date,
                remarks=(data.get("remarks") or "").strip(),
            )
            db.session.add(record)

        # Update appointment status to Completed if not already
        if appointment.status != "Completed":
            appointment.status = "Completed"

        db.session.commit()

        # Send in-app notification to the patient (Requirement 13)
        NotificationService.create_notification({
            "patient_id": patient.id,
            "title": "Medical Record Updated",
            "message": "Your consultation record has been reviewed and added to your medical records.",
            "notification_type": "Medical Record Updated"
        })

        return record, None

    @staticmethod
    def get_all_medical_records(role, user_id):
        """Fetch medical records based on user role and permissions."""
        query = MedicalRecord.query.order_by(MedicalRecord.created_at.desc())

        if role == "Admin":
            records = query.all()
        elif role == "Doctor":
            doctor = Doctor.query.filter_by(user_id=int(user_id)).first()
            if not doctor:
                return []
            records = query.filter_by(doctor_id=doctor.id).all()
        elif role == "Patient":
            patient = Patient.query.filter_by(user_id=int(user_id)).first()
            if not patient:
                return []
            records = query.filter_by(patient_id=patient.id).all()
        else:
            return []

        return [rec.to_dict() for rec in records]

    @staticmethod
    def get_medical_record_by_id(record_id, role, user_id):
        record = MedicalRecord.query.get(record_id)
        if not record:
            return None, "Medical record not found"

        if role == "Admin":
            return record, None
        if role == "Doctor" and record.doctor and record.doctor.user_id == int(user_id):
            return record, None
        if role == "Patient" and record.patient and record.patient.user_id == int(user_id):
            return record, None

        return None, "Access denied"

    @staticmethod
    def get_patient_medical_records(patient_id, role, user_id):
        """Fetch all medical records for a specific patient (for doctor/patient history view)."""
        patient = Patient.query.get(patient_id)
        if not patient:
            return None, "Patient not found"

        if role == "Patient" and patient.user_id != int(user_id):
            return None, "Access denied to patient medical records"

        records = MedicalRecord.query.filter_by(patient_id=patient.id).order_by(MedicalRecord.created_at.desc()).all()
        return [rec.to_dict() for rec in records], None
