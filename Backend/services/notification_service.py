from datetime import datetime

from models import db
from models.notification import Notification
from models.patient import Patient
from notifications.email import EmailService


class NotificationService:

    @staticmethod
    def create_notification(data):
        patient = Patient.query.get(data.get("patient_id"))

        if not patient:
            return None, "Patient not found"

        notification = Notification(
            patient_id=data.get("patient_id"),
            title=data.get("title"),
            message=data.get("message"),
            notification_type=data.get("notification_type")
        )

        db.session.add(notification)
        db.session.commit()

        return notification, None

    @staticmethod
    def get_all_notifications():
        notifications = Notification.query.order_by(
            Notification.created_at.desc()
        ).all()

        return [notification.to_dict() for notification in notifications]

    @staticmethod
    def get_notification(notification_id):
        notification = Notification.query.get(notification_id)

        if not notification:
            return None

        return notification.to_dict()

    @staticmethod
    def get_patient_notifications(patient_id):
        notifications = Notification.query.filter_by(
            patient_id=patient_id
        ).order_by(
            Notification.created_at.desc()
        ).all()

        return [notification.to_dict() for notification in notifications]

    @staticmethod
    def send_notification(notification_id):

        notification = Notification.query.get(notification_id)

        if not notification:
            return None, "Notification not found"

        patient = Patient.query.get(notification.patient_id)

        if not patient:
            return None, "Patient not found"

        if not patient.user:
            return None, "User not found"

        if not patient.user.email:
            return None, "User email not available"

        sent = EmailService.send_email(
            recipient=patient.user.email,
            subject=notification.title,
            body=notification.message
        )

        if not sent:
            return None, "Failed to send email"

        notification.status = "Sent"
        notification.sent_at = datetime.utcnow()

        db.session.commit()

        return notification, None

    @staticmethod
    def delete_notification(notification_id):

        notification = Notification.query.get(notification_id)

        if not notification:
            return False

        db.session.delete(notification)
        db.session.commit()

        return True