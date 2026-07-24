"""Aggregate queries used by the admin analytics dashboard."""

from datetime import date

from sqlalchemy import func

from models.appointment import Appointment
from models.bill import Bill
from models.doctor import Doctor
from models.notification import Notification
from models.patient import Patient
from models.prescription import Prescription


class DashboardService:

    @staticmethod
    def get_summary():
        today = date.today()
        paid_bills = Bill.query.filter(Bill.payment_status == "Paid")

        return {
            "total_doctors": Doctor.query.count(),
            "total_patients": Patient.query.count(),
            "total_appointments": Appointment.query.count(),
            "today_appointments": Appointment.query.filter_by(appointment_date=today).count(),
            "completed_appointments": Appointment.query.filter_by(status="Completed").count(),
            "cancelled_appointments": Appointment.query.filter_by(status="Cancelled").count(),
            "pending_appointments": Appointment.query.filter(Appointment.status.in_(["Scheduled", "Pending"])).count(),
            "total_bills": Bill.query.count(),
            "total_revenue": float(paid_bills.with_entities(func.coalesce(func.sum(Bill.total_amount), 0)).scalar() or 0),
            "today_revenue": float(paid_bills.filter(func.date(Bill.payment_date) == today).with_entities(func.coalesce(func.sum(Bill.total_amount), 0)).scalar() or 0),
        }

    @staticmethod
    def _monthly_data(model, date_column, value_column, label):
        rows = (
            model.query
            .with_entities(func.date_format(date_column, "%Y-%m").label("period"), func.coalesce(func.sum(value_column), 0).label("value"))
            .filter(date_column.isnot(None))
            .group_by("period")
            .order_by("period")
            .all()
        )
        return [{"month": period, label: float(value) if label == "revenue" else int(value)} for period, value in rows]

    @staticmethod
    def get_monthly_revenue():
        return DashboardService._monthly_data(
            Bill, Bill.payment_date, Bill.total_amount, "revenue"
        )

    @staticmethod
    def get_monthly_appointments():
        rows = (
            Appointment.query
            .with_entities(func.date_format(Appointment.appointment_date, "%Y-%m").label("period"), func.count(Appointment.id).label("count"))
            .group_by("period").order_by("period").all()
        )
        return [{"month": period, "appointments": int(count)} for period, count in rows]

    @staticmethod
    def get_patient_growth():
        rows = (
            Patient.query
            .with_entities(func.date_format(Patient.created_at, "%Y-%m").label("period"), func.count(Patient.id).label("count"))
            .group_by("period").order_by("period").all()
        )
        return [{"month": period, "patients": int(count)} for period, count in rows]

    @staticmethod
    def get_recent_appointments():
        appointments = Appointment.query.order_by(Appointment.created_at.desc()).limit(5).all()
        return [{
            "id": appointment.id,
            "patient": appointment.patient.user.full_name,
            "doctor": appointment.doctor.user.full_name,
            "date": str(appointment.appointment_date),
            "time": str(appointment.appointment_time),
            "status": appointment.status,
        } for appointment in appointments]

    @staticmethod
    def get_recent_notifications():
        notifications = Notification.query.order_by(Notification.created_at.desc()).limit(5).all()
        return [notification.to_dict() for notification in notifications]

    @staticmethod
    def get_recent_prescriptions():
        prescriptions = Prescription.query.order_by(Prescription.created_at.desc()).limit(5).all()
        return [prescription.to_dict() for prescription in prescriptions]
