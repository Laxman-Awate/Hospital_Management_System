import json
from datetime import datetime
from models import db


class ConsultationDocumentation(db.Model):
    """Tracks recording metadata, consent, transcript, AI draft, and approval lifecycle for doctor consultations."""

    __tablename__ = "consultation_documentations"

    id = db.Column(db.Integer, primary_key=True)
    appointment_id = db.Column(
        db.Integer,
        db.ForeignKey("appointments.id"),
        nullable=False,
        unique=True
    )
    patient_id = db.Column(db.Integer, db.ForeignKey("patients.id"), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey("doctors.id"), nullable=False)

    consent_obtained = db.Column(db.Boolean, default=False, nullable=False)
    audio_duration = db.Column(db.Integer, nullable=True)
    transcript = db.Column(db.Text, nullable=True)
    ai_draft = db.Column(db.Text, nullable=True)  # JSON-encoded string
    status = db.Column(db.String(20), default="DRAFT", nullable=False)  # DRAFT, REVIEWED, APPROVED
    approved_at = db.Column(db.DateTime, nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    appointment = db.relationship("Appointment", backref=db.backref("consultation_documentation", uselist=False))
    doctor = db.relationship("Doctor", backref="consultation_documentations")
    patient = db.relationship("Patient", backref="consultation_documentations")

    def get_ai_draft_dict(self):
        if not self.ai_draft:
            return {
                "chief_complaint": "",
                "symptoms": "",
                "clinical_notes": "",
                "diagnosis": "",
                "recommended_tests": "",
                "treatment_notes": "",
                "follow_up_date": "",
                "remarks": ""
            }
        try:
            return json.loads(self.ai_draft)
        except Exception:
            return {}

    def set_ai_draft_dict(self, draft_dict):
        self.ai_draft = json.dumps(draft_dict)

    def to_dict(self):
        return {
            "id": self.id,
            "appointment_id": self.appointment_id,
            "patient_id": self.patient_id,
            "doctor_id": self.doctor_id,
            "consent_obtained": self.consent_obtained,
            "audio_duration": self.audio_duration,
            "transcript": self.transcript or "",
            "ai_draft": self.get_ai_draft_dict(),
            "status": self.status,
            "approved_at": self.approved_at.isoformat() if self.approved_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
