from datetime import datetime
from models import db


class MedicalRecord(db.Model):
    """Official doctor-approved medical consultation record."""

    __tablename__ = "medical_records"

    id = db.Column(db.Integer, primary_key=True)
    appointment_id = db.Column(
        db.Integer,
        db.ForeignKey("appointments.id"),
        nullable=False,
        unique=True
    )
    patient_id = db.Column(db.Integer, db.ForeignKey("patients.id"), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey("doctors.id"), nullable=False)

    chief_complaint = db.Column(db.Text, nullable=True)
    symptoms = db.Column(db.Text, nullable=True)
    diagnosis = db.Column(db.Text, nullable=True)
    clinical_notes = db.Column(db.Text, nullable=True)
    recommended_tests = db.Column(db.Text, nullable=True)
    treatment_notes = db.Column(db.Text, nullable=True)
    follow_up_date = db.Column(db.Date, nullable=True)
    remarks = db.Column(db.Text, nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    appointment = db.relationship("Appointment", backref=db.backref("medical_record", uselist=False))
    doctor = db.relationship("Doctor", backref="medical_records")
    patient = db.relationship("Patient", backref="medical_records")

    def to_dict(self):
        return {
            "id": self.id,
            "appointment_id": self.appointment_id,
            "patient_id": self.patient_id,
            "doctor_id": self.doctor_id,
            "patient_name": self.patient.user.full_name if self.patient and self.patient.user else None,
            "doctor_name": self.doctor.user.full_name if self.doctor and self.doctor.user else None,
            "chief_complaint": self.chief_complaint or "",
            "symptoms": self.symptoms or "",
            "diagnosis": self.diagnosis or "",
            "clinical_notes": self.clinical_notes or "",
            "recommended_tests": self.recommended_tests or "",
            "treatment_notes": self.treatment_notes or "",
            "follow_up_date": self.follow_up_date.isoformat() if self.follow_up_date else None,
            "remarks": self.remarks or "",
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
