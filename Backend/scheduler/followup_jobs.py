from datetime import datetime, timedelta

from models.appointment import Appointment
from services.notification_service import NotificationService


def send_followup_reminders():
    """
    Sends follow-up emails one day after completed appointments.
    """

    yesterday = datetime.now().date() - timedelta(days=1)

    appointments = Appointment.query.filter(
        Appointment.appointment_date == yesterday,
        Appointment.status == "Completed"
    ).all()

    for appointment in appointments:
        notification_data = {
            "patient_id": appointment.patient_id,
            "title": "Follow-up Reminder",
            "message": (
                "We hope you're feeling better. "
                "Please schedule a follow-up visit if needed."
            ),
            "notification_type": "Email"
        }

        notification, error = NotificationService.create_notification(
            notification_data
        )

        if notification:
            NotificationService.send_notification(notification.id)

    print("Follow-up reminder job completed.")