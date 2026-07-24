"""Service layer for prescription validation, authorization, and persistence."""

from datetime import datetime

from models import db
from models.appointment import Appointment
from models.doctor import Doctor
from models.patient import Patient
from models.prescription import Prescription


class PrescriptionService:

    @staticmethod
    def _parse_next_visit(value):
        if value in (None, ""):
            return None, None
        if not isinstance(value, str):
            return None, "next_visit must be a date in YYYY-MM-DD format"
        try:
            return datetime.strptime(value, "%Y-%m-%d").date(), None
        except ValueError:
            return None, "next_visit must be a date in YYYY-MM-DD format"

    @staticmethod
    def _appointment_entities(appointment_id):
        appointment = Appointment.query.get(appointment_id)
        if not appointment:
            return None, None, None, "Appointment not found"

        # These explicit checks keep the business rule clear even when a
        # legacy database has an incomplete foreign-key relationship.
        doctor = Doctor.query.get(appointment.doctor_id)
        if not doctor:
            return None, None, None, "Doctor not found"
        patient = Patient.query.get(appointment.patient_id)
        if not patient:
            return None, None, None, "Patient not found"
        return appointment, doctor, patient, None

    @staticmethod
    def _is_doctor_owner(doctor, user_id):
        return doctor and doctor.user_id == int(user_id)

    @staticmethod
    def create_prescription(data, role, user_id):
        appointment_id = data.get("appointment_id")
        if not appointment_id:
            return None, "appointment_id is required"

        for field in ("diagnosis", "medicines", "instructions"):
            if not isinstance(data.get(field), str) or not data[field].strip():
                return None, f"{field} is required"

        appointment, doctor, patient, error = PrescriptionService._appointment_entities(appointment_id)
        if error:
            return None, error

        if role == "Doctor" and not PrescriptionService._is_doctor_owner(doctor, user_id):
            return None, "You can only create prescriptions for your own appointments"

        for field, expected in (("doctor_id", doctor.id), ("patient_id", patient.id)):
            if data.get(field) not in (None, ""):
                try:
                    if int(data[field]) != expected:
                        return None, f"{field} must match the appointment"
                except (TypeError, ValueError):
                    return None, f"{field} must be a valid integer"

        if Prescription.query.filter_by(appointment_id=appointment.id).first():
            return None, "A prescription already exists for this appointment"

        next_visit, error = PrescriptionService._parse_next_visit(data.get("next_visit"))
        if error:
            return None, error

        prescription = Prescription(
            appointment_id=appointment.id,
            doctor_id=doctor.id,
            patient_id=patient.id,
            diagnosis=data["diagnosis"].strip(),
            medicines=data["medicines"].strip(),
            instructions=data["instructions"].strip(),
            next_visit=next_visit,
        )
        db.session.add(prescription)
        db.session.commit()
        return prescription, None

    @staticmethod
    def get_all_prescriptions(role, user_id):
        query = Prescription.query.order_by(Prescription.created_at.desc())
        if role == "Admin":
            return [prescription.to_dict() for prescription in query.all()]
        if role == "Doctor":
            doctor = Doctor.query.filter_by(user_id=int(user_id)).first()
            return [] if not doctor else [item.to_dict() for item in query.filter_by(doctor_id=doctor.id).all()]
        patient = Patient.query.filter_by(user_id=int(user_id)).first()
        return [] if not patient else [item.to_dict() for item in query.filter_by(patient_id=patient.id).all()]

    @staticmethod
    def get_prescription_by_id(prescription_id, role, user_id):
        prescription = Prescription.query.get(prescription_id)
        if not prescription:
            return None, "Prescription not found"
        if role == "Admin":
            return prescription, None
        if role == "Doctor" and PrescriptionService._is_doctor_owner(prescription.doctor, user_id):
            return prescription, None
        if role == "Patient" and prescription.patient and prescription.patient.user_id == int(user_id):
            return prescription, None
        return None, "Access denied"

    @staticmethod
    def update_prescription(prescription_id, data, role, user_id):
        prescription, error = PrescriptionService.get_prescription_by_id(prescription_id, role, user_id)
        if error:
            return None, error

        for field in ("diagnosis", "medicines", "instructions"):
            if field in data:
                if not isinstance(data[field], str) or not data[field].strip():
                    return None, f"{field} cannot be empty"
                setattr(prescription, field, data[field].strip())

        if "next_visit" in data:
            next_visit, error = PrescriptionService._parse_next_visit(data.get("next_visit"))
            if error:
                return None, error
            prescription.next_visit = next_visit

        db.session.commit()
        return prescription, None

    @staticmethod
    def delete_prescription(prescription_id, role, user_id):
        prescription, error = PrescriptionService.get_prescription_by_id(prescription_id, role, user_id)
        if error:
            return error
        db.session.delete(prescription)
        db.session.commit()
        return None
