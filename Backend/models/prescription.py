from datetime import datetime

from models import db


class Prescription(db.Model):
    """A doctor's treatment plan for a single appointment."""

    __tablename__ = "prescriptions"

    id = db.Column(db.Integer, primary_key=True)
    appointment_id = db.Column(
        db.Integer,
        db.ForeignKey("appointments.id"),
        nullable=False,
        unique=True
    )
    doctor_id = db.Column(db.Integer, db.ForeignKey("doctors.id"), nullable=False)
    patient_id = db.Column(db.Integer, db.ForeignKey("patients.id"), nullable=False)
    diagnosis = db.Column(db.Text, nullable=False)
    medicines = db.Column(db.Text, nullable=False)
    instructions = db.Column(db.Text, nullable=False)
    next_visit = db.Column(db.Date, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    appointment = db.relationship("Appointment", backref=db.backref("prescription", uselist=False))
    doctor = db.relationship("Doctor", backref="prescriptions")
    patient = db.relationship("Patient", backref="prescriptions")

    def to_dict(self):
        return {
            "id": self.id,
            "appointment_id": self.appointment_id,
            "doctor_id": self.doctor_id,
            "doctor_name": self.doctor.user.full_name if self.doctor and self.doctor.user else None,
            "patient_id": self.patient_id,
            "patient_name": self.patient.user.full_name if self.patient and self.patient.user else None,
            "diagnosis": self.diagnosis,
            "medicines": self.medicines,
            "instructions": self.instructions,
            "next_visit": self.next_visit.isoformat() if self.next_visit else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
