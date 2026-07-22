from datetime import datetime
from models import db


class Bill(db.Model):
    __tablename__ = "bills"

    id = db.Column(db.Integer, primary_key=True)

    invoice_number = db.Column(
        db.String(50),
        unique=True,
        nullable=False
    )

    appointment_id = db.Column(
        db.Integer,
        db.ForeignKey("appointments.id"),
        nullable=False
    )

    consultation_fee = db.Column(
        db.Float,
        default=0
    )

    medicine_charge = db.Column(
        db.Float,
        default=0
    )

    lab_charge = db.Column(
        db.Float,
        default=0
    )

    other_charge = db.Column(
        db.Float,
        default=0
    )

    total_amount = db.Column(
        db.Float,
        nullable=False
    )

    payment_status = db.Column(
        db.String(20),
        default="Pending"
    )

    payment_method = db.Column(
        db.String(30)
    )

    payment_date = db.Column(
        db.DateTime
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    def to_dict(self):
        return {
            "id": self.id,
            "invoice_number": self.invoice_number,
            "appointment_id": self.appointment_id,
            "consultation_fee": self.consultation_fee,
            "medicine_charge": self.medicine_charge,
            "lab_charge": self.lab_charge,
            "other_charge": self.other_charge,
            "total_amount": self.total_amount,
            "payment_status": self.payment_status,
            "payment_method": self.payment_method,
            "payment_date": self.payment_date.isoformat() if self.payment_date else None,
            "created_at": self.created_at.isoformat()
        }