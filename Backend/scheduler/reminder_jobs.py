from datetime import datetime, timedelta

from models import db
from models.appointment import Appointment
from services.notification_service import NotificationService


def send_appointment_reminders():
    """
    Send reminder emails for appointments scheduled for tomorrow.
    Only reminders that haven't been sent yet are processed.
    """

    tomorrow = datetime.now().date() + timedelta(days=1)

    appointments = Appointment.query.filter(
        Appointment.appointment_date == tomorrow,
        Appointment.status == "Scheduled",
        Appointment.reminder_sent == False
    ).all()

    for appointment in appointments:

        notification_data = {
            "patient_id": appointment.patient_id,
            "title": "Appointment Reminder",
            "message": (
                f"Dear Patient,\n\n"
                f"This is a reminder that you have an appointment "
                f"scheduled on {appointment.appointment_date} "
                f"at {appointment.appointment_time}.\n\n"
                f"Please arrive 10-15 minutes early.\n\n"
                f"Thank you,\n"
                f"Hospital Management System"
            ),
            "notification_type": "Appointment Reminder"
        }

        notification, error = NotificationService.create_notification(
            notification_data
        )

        if notification:
            NotificationService.send_notification(notification.id)

            appointment.reminder_sent = True
            db.session.commit()

    print(f"Appointment Reminder Job Completed - {len(appointments)} reminder(s) sent.")