"""Idempotent demo data seed for local Hospital Management System demos.

Run from Backend: ``python seed_demo_data.py``. It never deletes non-demo data.
"""
import os
import sys
from datetime import date, datetime, time, timedelta

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from flask_bcrypt import Bcrypt
from app import app
from extensions import db
from models import Appointment, Bill, Doctor, MedicalRecord, Notification, Patient, Prescription, User

DEMO_PASSWORD = "Demo@123"
DEMO_DOMAIN = "@demo.medicare.local"
bcrypt = Bcrypt()


def user_for(email, name, role):
    user = User.query.filter_by(email=email).first()
    if user:
        return user, False
    user = User(full_name=name, email=email, password=bcrypt.generate_password_hash(DEMO_PASSWORD).decode("utf-8"), role=role)
    db.session.add(user)
    db.session.flush()
    return user, True


def profiles():
    admin, admin_new = user_for("admin" + DEMO_DOMAIN, "Alex Morgan", "Admin")
    specs = [("Anika Sharma", "Cardiology", "MBBS, MD"), ("Daniel Brooks", "Pediatrics", "MBBS, DCH"), ("Maya Patel", "Orthopedics", "MBBS, MS"), ("Ethan Wilson", "Dermatology", "MBBS, DDVL")]
    doctors = []
    doctor_new = 0
    for index, (name, specialty, qualification) in enumerate(specs):
        user, _ = user_for(f"doctor{index + 1}{DEMO_DOMAIN}", f"Dr. {name}", "Doctor")
        doctor = Doctor.query.filter_by(user_id=user.id).first()
        if not doctor:
            doctor = Doctor(user_id=user.id, specialization=specialty, qualification=qualification, experience=6 + index, consultation_fee=650 + index * 100, phone=f"90000000{10 + index}", department=specialty, available_days="Monday, Wednesday, Friday", available_time="09:00-17:00", status=True)
            db.session.add(doctor)
            db.session.flush()
            doctor_new += 1
        doctors.append(doctor)
    patient_specs = [("Jordan Lee", 29, "Male", "Migraine history"), ("Sofia Martinez", 41, "Female", "Seasonal allergies"), ("Noah Williams", 8, "Male", "Asthma monitoring"), ("Priya Nair", 35, "Female", "No known conditions"), ("Oliver Chen", 57, "Male", "Hypertension follow-up"), ("Emma Johnson", 24, "Female", "No known conditions"), ("Lucas Martin", 46, "Male", "Lower back pain"), ("Ava Thompson", 17, "Female", "Eczema history"), ("Mason Clark", 63, "Male", "Diabetes monitoring"), ("Isabella Rossi", 32, "Female", "No known conditions")]
    patients = []
    patient_new = 0
    for index, (name, age, gender, history) in enumerate(patient_specs):
        user, _ = user_for(f"patient{index + 1}{DEMO_DOMAIN}", name, "Patient")
        patient = Patient.query.filter_by(user_id=user.id).first()
        if not patient:
            patient = Patient(user_id=user.id, age=age, gender=gender, phone=f"91000000{10 + index}", address="Demo Avenue, Care City", medical_history=history, date_of_birth=date.today() - timedelta(days=age * 365))
            db.session.add(patient)
            db.session.flush()
            patient_new += 1
        patients.append(patient)
    return admin, doctors, patients, admin_new, doctor_new, patient_new


def appointments_for(doctors, patients):
    existing = Appointment.query.join(Patient).join(User).filter(User.email.like("%" + DEMO_DOMAIN)).order_by(Appointment.id).all()
    if existing:
        return existing, 0
    today = date.today()
    rows = [(0, 0, -35, "Completed", "Recurring headaches"), (1, 0, -21, "Completed", "Annual cardiac review"), (2, 0, -14, "Completed", "Knee discomfort"), (3, 1, -10, "Completed", "Skin irritation"), (4, 1, -7, "Completed", "Blood pressure follow-up"), (5, 1, -3, "Completed", "Seasonal allergies"), (6, 2, -28, "Completed", "Lower back pain"), (7, 2, -18, "Completed", "Eczema review"), (8, 3, -5, "Completed", "Diabetes review"), (9, 3, -2, "Completed", "General wellness visit"), (0, 0, 2, "Scheduled", "Follow-up consultation"), (1, 0, 4, "Confirmed", "Cardiology consultation"), (2, 1, 6, "Scheduled", "Child wellness check"), (3, 1, 8, "Confirmed", "Orthopedic review"), (4, 2, 11, "Scheduled", "Blood pressure review"), (5, 2, 15, "Scheduled", "Allergy consultation"), (6, 3, -12, "Cancelled", "Back pain consultation"), (7, 3, -8, "No-Show", "Dermatology follow-up")]
    result = []
    for index, (patient_index, doctor_index, offset, status, reason) in enumerate(rows):
        result.append(Appointment(patient_id=patients[patient_index].id, doctor_id=doctors[doctor_index].id, appointment_date=today + timedelta(days=offset), appointment_time=time(9 + index % 6, 30), reason=reason, status=status))
    db.session.add_all(result)
    db.session.flush()
    return result, len(result)


def related(appointments):
    completed = [item for item in appointments if item.status == "Completed"]
    diagnoses = ["Migraine", "Stable cardiac health", "Patellofemoral pain", "Contact dermatitis", "Essential hypertension", "Seasonal allergic rhinitis", "Lumbar strain", "Atopic dermatitis", "Type 2 diabetes - controlled", "Good general health"]
    records = prescriptions = bills = notifications = 0
    for index, item in enumerate(completed):
        if not MedicalRecord.query.filter_by(appointment_id=item.id).first():
            db.session.add(MedicalRecord(appointment_id=item.id, patient_id=item.patient_id, doctor_id=item.doctor_id, chief_complaint=item.reason, symptoms="Symptoms discussed during the consultation.", diagnosis=diagnoses[index], clinical_notes="Fictional demonstration record reviewed by the assigned doctor.", recommended_tests="Routine follow-up tests as clinically appropriate.", treatment_notes="Rest, hydration, and follow the documented care plan.", follow_up_date=date.today() + timedelta(days=30 + index), remarks="Demo data for application presentation."))
            records += 1
        if index < 6 and not Prescription.query.filter_by(appointment_id=item.id).first():
            db.session.add(Prescription(appointment_id=item.id, doctor_id=item.doctor_id, patient_id=item.patient_id, diagnosis=diagnoses[index], medicines="Demo medication - follow doctor instructions", instructions="Take only as directed by the doctor.", next_visit=date.today() + timedelta(days=30)))
            prescriptions += 1
    for index, item in enumerate(appointments[:14]):
        if not Bill.query.filter_by(appointment_id=item.id).first():
            consultation = 650 + index % 4 * 100
            medicine = 150 if index % 2 == 0 else 0
            lab = 300 if index % 3 == 0 else 0
            paid = index % 3 != 1
            db.session.add(Bill(invoice_number=f"DEMO-{item.id:06d}", appointment_id=item.id, consultation_fee=consultation, medicine_charge=medicine, lab_charge=lab, total_amount=consultation + medicine + lab, payment_status="Paid" if paid else "Pending", payment_method="Demo Card" if paid else None, payment_date=datetime.utcnow() if paid else None))
            bills += 1
    for patient in {item.patient for item in appointments[:6]}:
        for title, message, kind in [("Appointment Confirmed", "Your demo appointment has been confirmed.", "Appointment Booked"), ("Medical Record Updated", "Your consultation record is available in medical records.", "Medical Record Updated")]:
            if not Notification.query.filter_by(user_id=patient.user_id, title=title).first():
                db.session.add(Notification(user_id=patient.user_id, patient_id=patient.id, title=title, message=message, type=kind))
                notifications += 1
    return records, prescriptions, bills, notifications


with app.app_context():
    admin, doctors, patients, admin_new, doctor_new, patient_new = profiles()
    appointments, appointments_new = appointments_for(doctors, patients)
    records, prescriptions, bills, notifications = related(appointments)
    db.session.commit()
    print("Demo seed complete; existing non-demo data was preserved.")
    print(f"Users created: {admin_new + doctor_new + patient_new}")
    print(f"Doctors available: {len(doctors)} | Patients available: {len(patients)}")
    print(f"Appointments created: {appointments_new}\nMedical records created: {records}\nPrescriptions created: {prescriptions}\nBills created: {bills}\nNotifications created: {notifications}")
    print("All demo accounts use password: Demo@123")
