"""Create missing role profiles for existing users created before profile auto-creation.

Run from the Backend directory:
    python migrations/repair_missing_profiles.py
"""

import os
import sys

# Make the Backend package importable when this file is executed directly
# from Backend\migrations (for example: python migrations\repair_missing_profiles.py).
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app
from extensions import db
from models import User, Patient, Doctor


with app.app_context():
    created_patients = 0
    created_doctors = 0

    for user in User.query.all():
        if user.role == "Patient" and not Patient.query.filter_by(user_id=user.id).first():
            db.session.add(Patient(
                user_id=user.id,
                age=0,
                gender="Male",
                phone="0000000000",
            ))
            created_patients += 1
        elif user.role == "Doctor" and not Doctor.query.filter_by(user_id=user.id).first():
            db.session.add(Doctor(
                user_id=user.id,
                specialization="General Medicine",
                qualification="Not specified",
                experience=0,
                consultation_fee=0,
                phone="0000000000",
                department="General Medicine",
                status=True,
            ))
            created_doctors += 1

    db.session.commit()
    print(f"Created patient profiles: {created_patients}")
    print(f"Created doctor profiles: {created_doctors}")
