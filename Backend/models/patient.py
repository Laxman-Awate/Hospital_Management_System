from datetime import datetime
from models import db


class Patient(db.Model):
    __tablename__ = "patients"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False,
        unique=True
    )
    appointments = db.relationship(
        "Appointment",
        backref="patient",
        lazy=True,
        cascade="all, delete"
    )
    notifications = db.relationship(
        "Notification",
        backref="patient",
        lazy=True,
        cascade="all, delete"
    )

    age = db.Column(db.Integer, nullable=False)

    gender = db.Column(db.String(20), nullable=False)

    phone = db.Column(db.String(15), nullable=False)

    blood_group = db.Column(db.String(5))

    date_of_birth = db.Column(db.Date)

    address = db.Column(db.Text)

    emergency_contact = db.Column(db.String(15))

    medical_history = db.Column(db.Text)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)