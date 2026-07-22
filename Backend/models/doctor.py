from models import db
from datetime import datetime


class Doctor(db.Model):
    __tablename__ = "doctors"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        unique=True,
        nullable=False
    )
    appointments = db.relationship(
        "Appointment",
        backref="doctor",
        lazy=True,
        cascade="all, delete"
    )

    specialization = db.Column(db.String(100), nullable=False)

    qualification = db.Column(db.String(150), nullable=False)

    experience = db.Column(db.Integer, nullable=False)

    consultation_fee = db.Column(db.Float, nullable=False)

    phone = db.Column(db.String(15), nullable=False)

    department = db.Column(db.String(100), nullable=False)

    available_days = db.Column(db.String(100), nullable=True)

    available_time = db.Column(db.String(100), nullable=True)

    status = db.Column(db.Boolean, default=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)