"""Automated tests for AI-Assisted Consultation Documentation & Security Enforcement."""

import io
import uuid
import unittest
from datetime import date, time, datetime
from app import app
from extensions import db, bcrypt
from models import User, Patient, Doctor, Appointment, Bill, Prescription, Notification, MedicalRecord, ConsultationDocumentation


class ConsultationTestCase(unittest.TestCase):

    def setUp(self):
        self.app = app
        self.app.config["TESTING"] = True
        self.client = self.app.test_client()

        self.app_context = self.app.app_context()
        self.app_context.push()

        uid = uuid.uuid4().hex[:6]

        # Create Doctor 1 User & Model
        self.doc1_user = User(
            full_name=f"Doctor One {uid}",
            email=f"doc1_{uid}@hospital.com",
            password=bcrypt.generate_password_hash("password123").decode("utf-8"),
            role="Doctor"
        )
        db.session.add(self.doc1_user)
        db.session.flush()

        self.doctor1 = Doctor(
            user_id=self.doc1_user.id,
            specialization="Cardiology",
            qualification="MBBS, MD",
            experience=10,
            consultation_fee=100.0,
            phone="1234567890",
            department="Cardiology"
        )
        db.session.add(self.doctor1)

        # Create Doctor 2 User & Model
        self.doc2_user = User(
            full_name=f"Doctor Two {uid}",
            email=f"doc2_{uid}@hospital.com",
            password=bcrypt.generate_password_hash("password123").decode("utf-8"),
            role="Doctor"
        )
        db.session.add(self.doc2_user)
        db.session.flush()

        self.doctor2 = Doctor(
            user_id=self.doc2_user.id,
            specialization="Neurology",
            qualification="MBBS, DM",
            experience=8,
            consultation_fee=150.0,
            phone="0987654321",
            department="Neurology"
        )
        db.session.add(self.doctor2)

        # Create Patient 1 User & Model
        self.pat1_user = User(
            full_name=f"Patient One {uid}",
            email=f"pat1_{uid}@hospital.com",
            password=bcrypt.generate_password_hash("password123").decode("utf-8"),
            role="Patient"
        )
        db.session.add(self.pat1_user)
        db.session.flush()

        self.patient1 = Patient(
            user_id=self.pat1_user.id,
            age=30,
            gender="Male",
            phone="1234567890"
        )
        db.session.add(self.patient1)

        # Create Patient 2 User & Model
        self.pat2_user = User(
            full_name=f"Patient Two {uid}",
            email=f"pat2_{uid}@hospital.com",
            password=bcrypt.generate_password_hash("password123").decode("utf-8"),
            role="Patient"
        )
        db.session.add(self.pat2_user)
        db.session.flush()

        self.patient2 = Patient(
            user_id=self.pat2_user.id,
            age=25,
            gender="Female",
            phone="0987654321"
        )
        db.session.add(self.patient2)
        db.session.commit()

        # Create Appointment for Doctor 1 & Patient 1
        self.appointment1 = Appointment(
            patient_id=self.patient1.id,
            doctor_id=self.doctor1.id,
            appointment_date=date(2026, 10, 15),
            appointment_time=time(10, 0),
            reason="Chest Pain",
            status="Scheduled"
        )
        db.session.add(self.appointment1)
        db.session.commit()

        # Authenticate users & store JWT headers
        self.doc1_headers = self._get_auth_headers(f"doc1_{uid}@hospital.com", "password123")
        self.doc2_headers = self._get_auth_headers(f"doc2_{uid}@hospital.com", "password123")
        self.pat1_headers = self._get_auth_headers(f"pat1_{uid}@hospital.com", "password123")
        self.pat2_headers = self._get_auth_headers(f"pat2_{uid}@hospital.com", "password123")

    def tearDown(self):
        try:
            Notification.query.filter(Notification.user_id.in_([self.pat1_user.id, self.pat2_user.id])).delete()
            MedicalRecord.query.filter_by(appointment_id=self.appointment1.id).delete()
            ConsultationDocumentation.query.filter_by(appointment_id=self.appointment1.id).delete()
            Prescription.query.filter_by(appointment_id=self.appointment1.id).delete()
            Appointment.query.filter_by(id=self.appointment1.id).delete()
            Doctor.query.filter(Doctor.id.in_([self.doctor1.id, self.doctor2.id])).delete()
            Patient.query.filter(Patient.id.in_([self.patient1.id, self.patient2.id])).delete()
            User.query.filter(User.id.in_([self.doc1_user.id, self.doc2_user.id, self.pat1_user.id, self.pat2_user.id])).delete()
            db.session.commit()
        except Exception:
            db.session.rollback()
        db.session.remove()
        self.app_context.pop()

    def _get_auth_headers(self, email, password):
        res = self.client.post("/api/auth/login", json={"email": email, "password": password})
        data = res.get_json()
        token = data["access_token"]
        return {"Authorization": f"Bearer {token}"}

    def test_1_consent_required_before_recording(self):
        """Test that consent is mandatory before transcription/recording."""
        # Try transcribe without setting consent
        data = {"audio": (io.BytesIO(b"fake audio data"), "test.webm")}
        res = self.client.post(
            f"/api/consultations/{self.appointment1.id}/transcribe",
            data=data,
            content_type="multipart/form-data",
            headers=self.doc1_headers
        )
        self.assertEqual(res.status_code, 400)
        self.assertIn("consent is mandatory", res.get_json()["message"])

        # Set consent
        res = self.client.post(
            f"/api/consultations/{self.appointment1.id}/consent",
            json={"consent_obtained": True},
            headers=self.doc1_headers
        )
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.get_json()["data"]["consent_obtained"])

    def test_2_doctor_authorization(self):
        """Doctor 2 cannot access or transcribe Doctor 1's appointment."""
        res = self.client.post(
            f"/api/consultations/{self.appointment1.id}/consent",
            json={"consent_obtained": True},
            headers=self.doc2_headers
        )
        self.assertEqual(res.status_code, 403)

    def test_3_patient_cannot_record_or_approve(self):
        """Patient cannot start recording, transcribe, generate draft, or approve records."""
        # Consent
        res = self.client.post(
            f"/api/consultations/{self.appointment1.id}/consent",
            json={"consent_obtained": True},
            headers=self.pat1_headers
        )
        self.assertEqual(res.status_code, 403)

        # Transcribe
        data = {"audio": (io.BytesIO(b"fake audio data"), "test.webm")}
        res = self.client.post(
            f"/api/consultations/{self.appointment1.id}/transcribe",
            data=data,
            content_type="multipart/form-data",
            headers=self.pat1_headers
        )
        self.assertEqual(res.status_code, 403)

        # Approve
        res = self.client.post(
            f"/api/consultations/{self.appointment1.id}/approve",
            json={"chief_complaint": "Chest pain"},
            headers=self.pat1_headers
        )
        self.assertEqual(res.status_code, 403)

    def test_4_draft_not_automatically_official_medical_record(self):
        """AI draft generation must NOT auto-create official MedicalRecord."""
        # Set consent
        self.client.post(
            f"/api/consultations/{self.appointment1.id}/consent",
            json={"consent_obtained": True},
            headers=self.doc1_headers
        )

        # Update draft text
        res = self.client.put(
            f"/api/consultations/{self.appointment1.id}/draft",
            json={
                "transcript": "Doctor: Any chest pain? Patient: Yes for two days.",
                "ai_draft": {
                    "chief_complaint": "Chest pain for 2 days",
                    "diagnosis": "Angina pectoris"
                }
            },
            headers=self.doc1_headers
        )
        self.assertEqual(res.status_code, 200)

        # Verify MedicalRecord table is STILL EMPTY
        record = MedicalRecord.query.filter_by(appointment_id=self.appointment1.id).first()
        self.assertIsNone(record)

    def test_5_doctor_approval_creates_official_medical_record_and_notifies_patient(self):
        """Doctor explicit approval creates official MedicalRecord and notifies patient."""
        # Consent
        self.client.post(
            f"/api/consultations/{self.appointment1.id}/consent",
            json={"consent_obtained": True},
            headers=self.doc1_headers
        )

        # Doctor Approves Draft
        approval_payload = {
            "chief_complaint": "Mild chest pain",
            "symptoms": "Chest pressure on exertion",
            "diagnosis": "Mild Angina",
            "clinical_notes": "ECG ordered. Patient advised rest.",
            "recommended_tests": "ECG, Lipid Profile",
            "treatment_notes": "Prescribed nitrates",
            "follow_up_date": "2026-10-25",
            "remarks": "Return if symptoms worsen"
        }

        res = self.client.post(
            f"/api/consultations/{self.appointment1.id}/approve",
            json=approval_payload,
            headers=self.doc1_headers
        )
        self.assertEqual(res.status_code, 201)

        # Check MedicalRecord created
        record = MedicalRecord.query.filter_by(appointment_id=self.appointment1.id).first()
        self.assertIsNotNone(record)
        self.assertEqual(record.diagnosis, "Mild Angina")
        self.assertEqual(record.patient_id, self.patient1.id)

        # Check Notification created for Patient 1
        notif = Notification.query.filter_by(user_id=self.pat1_user.id).first()
        self.assertIsNotNone(notif)
        self.assertEqual(notif.title, "Medical Record Updated")
        self.assertIn("added to your medical records", notif.message)

    def test_6_patient_can_view_own_approved_medical_record(self):
        """Patient 1 can view their approved medical record, but Patient 2 cannot."""
        # Create approved record
        med_rec = MedicalRecord(
            appointment_id=self.appointment1.id,
            patient_id=self.patient1.id,
            doctor_id=self.doctor1.id,
            chief_complaint="Chest pain",
            diagnosis="Angina"
        )
        db.session.add(med_rec)
        db.session.commit()

        # Patient 1 views records
        res = self.client.get("/api/medical-records", headers=self.pat1_headers)
        self.assertEqual(res.status_code, 200)
        records = res.get_json()["data"]
        self.assertEqual(len(records), 1)
        self.assertEqual(records[0]["diagnosis"], "Angina")

        # Patient 2 views records (should be empty)
        res = self.client.get("/api/medical-records", headers=self.pat2_headers)
        self.assertEqual(res.status_code, 200)
        records = res.get_json()["data"]
        self.assertEqual(len(records), 0)

        # Patient 2 tries accessing Patient 1's specific record
        res = self.client.get(f"/api/medical-records/{med_rec.id}", headers=self.pat2_headers)
        self.assertEqual(res.status_code, 403)

    def test_7_manual_medical_record_creation_fallback(self):
        """Doctor can manually enter clinical notes and approve even without AI draft."""
        approval_payload = {
            "chief_complaint": "Headache",
            "symptoms": "Throbbing pain for 1 day",
            "diagnosis": "Tension Headache",
            "clinical_notes": "Manual entry without AI",
            "remarks": "Rest and hydration"
        }

        res = self.client.post(
            f"/api/consultations/{self.appointment1.id}/approve",
            json=approval_payload,
            headers=self.doc1_headers
        )
        self.assertEqual(res.status_code, 201)
        record = MedicalRecord.query.filter_by(appointment_id=self.appointment1.id).first()
        self.assertIsNotNone(record)
        self.assertEqual(record.diagnosis, "Tension Headache")

    def test_8_existing_prescriptions_and_appointments_work(self):
        """Existing appointment listing and prescription creation continue working."""
        # Get appointments
        res = self.client.get("/api/appointment", headers=self.doc1_headers)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.get_json()["data"]), 1)

        # Create Prescription for appointment
        presc_payload = {
            "appointment_id": self.appointment1.id,
            "diagnosis": "Mild Angina",
            "medicines": "Aspirin 75mg daily",
            "instructions": "Take after food"
        }
        res = self.client.post("/api/prescriptions", json=presc_payload, headers=self.doc1_headers)
        self.assertEqual(res.status_code, 201)


if __name__ == "__main__":
    unittest.main()
