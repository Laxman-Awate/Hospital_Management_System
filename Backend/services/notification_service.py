"""Business logic for user-scoped in-app notifications."""

from models import db
from models.notification import Notification
from models.patient import Patient
from models.user import User


class NotificationService:
    VALID_TYPES = {
        "Appointment Booked", "Appointment Cancelled", "Appointment Reminder",
        "Prescription Created", "Bill Generated", "Follow-up Reminder",
        "General Notification",
    }

    @staticmethod
    def _resolve_user(data):
        """Resolve a user, accepting legacy patient_id for existing scheduler jobs."""
        user_id = data.get("user_id")
        patient_id = data.get("patient_id")

        if user_id:
            user = User.query.get(user_id)
            if not user:
                return None, None, "User not found"
            return user, Patient.query.filter_by(user_id=user.id).first(), None

        if patient_id:
            patient = Patient.query.get(patient_id)
            if not patient or not patient.user:
                return None, None, "User not found"
            return patient.user, patient, None

        return None, None, "user_id is required"

    @staticmethod
    def create_notification(data):
        data = data or {}
        user, patient, error = NotificationService._resolve_user(data)
        if error:
            return None, error

        title = data.get("title")
        message = data.get("message")
        notification_type = data.get("type") or data.get("notification_type") or "General Notification"
        if not isinstance(title, str) or not title.strip():
            return None, "title is required"
        if not isinstance(message, str) or not message.strip():
            return None, "message is required"
        if notification_type not in NotificationService.VALID_TYPES:
            return None, "Invalid notification type"

        notification = Notification(
            user_id=user.id,
            patient_id=patient.id if patient else None,
            title=title.strip(),
            message=message.strip(),
            type=notification_type,
        )
        try:
            db.session.add(notification)
            db.session.commit()
            return notification, None
        except Exception:
            db.session.rollback()
            return None, "Unable to create notification"

    @staticmethod
    def get_notifications(role, user_id):
        query = Notification.query.order_by(Notification.created_at.desc())
        if role != "Admin":
            query = query.filter_by(user_id=int(user_id))
        return [notification.to_dict() for notification in query.all()]

    @staticmethod
    def get_notification_by_id(notification_id, role, user_id):
        notification = Notification.query.get(notification_id)
        if not notification:
            return None, "Notification not found"
        if role != "Admin" and notification.user_id != int(user_id):
            return None, "Access denied"
        return notification, None

    @staticmethod
    def update_notification(notification_id, data, role, user_id):
        if role != "Admin":
            return None, "Access denied"
        notification, error = NotificationService.get_notification_by_id(notification_id, role, user_id)
        if error:
            return None, error

        for field in ("title", "message"):
            if field in data:
                if not isinstance(data[field], str) or not data[field].strip():
                    return None, f"{field} cannot be empty"
                setattr(notification, field, data[field].strip())
        if "type" in data:
            if data["type"] not in NotificationService.VALID_TYPES:
                return None, "Invalid notification type"
            notification.type = data["type"]
        if "is_read" in data:
            if not isinstance(data["is_read"], bool):
                return None, "is_read must be a boolean"
            notification.is_read = data["is_read"]

        try:
            db.session.commit()
            return notification, None
        except Exception:
            db.session.rollback()
            return None, "Unable to update notification"

    @staticmethod
    def delete_notification(notification_id, role, user_id):
        notification, error = NotificationService.get_notification_by_id(notification_id, role, user_id)
        if error:
            return error
        try:
            db.session.delete(notification)
            db.session.commit()
            return None
        except Exception:
            db.session.rollback()
            return "Unable to delete notification"

    @staticmethod
    def mark_notification_read(notification_id, role, user_id):
        notification, error = NotificationService.get_notification_by_id(notification_id, role, user_id)
        if error:
            return None, error
        notification.is_read = True
        try:
            db.session.commit()
            return notification, None
        except Exception:
            db.session.rollback()
            return None, "Unable to mark notification as read"

    @staticmethod
    def get_all_notifications():
        """Compatibility alias for internal admin tools."""
        return NotificationService.get_notifications("Admin", None)

    @staticmethod
    def send_notification(notification_id):
        """Compatibility no-op for the existing scheduler's in-app notifications."""
        notification = Notification.query.get(notification_id)
        if not notification:
            return None, "Notification not found"
        return notification, None
