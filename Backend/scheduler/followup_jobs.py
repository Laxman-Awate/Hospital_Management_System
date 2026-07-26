from datetime import datetime, timedelta

from models import db
from models.appointment import Appointment
from services.notification_service import NotificationService


def send_followup_reminders():
    """
    Sends follow-up emails one day after completed appointments.
    """

    yesterday = datetime.now().date() - timedelta(days=1)

    appointments = Appointment.query.filter(
        Appointment.appointment_date == yesterday,
        Appointment.status == "Completed",
        Appointment.followup_sent == False
    ).all()

    for appointment in appointments:
        notification_data = {
            "patient_id": appointment.patient_id,
            "title": "Follow-up Reminder",
            "message": (
                "We hope you're feeling better. "
                "Please schedule a follow-up visit if needed."
            ),
            "notification_type": "Follow-up Reminder"
        }

        notification, error = NotificationService.create_notification(
            notification_data
        )

        if notification:
            NotificationService.send_notification(notification.id)
            appointment.followup_sent = True
            db.session.commit()

    print("Follow-up reminder job completed.")