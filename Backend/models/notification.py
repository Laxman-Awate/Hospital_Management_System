from datetime import datetime

from models import db


class Notification(db.Model):
    """An in-app notification addressed to a single authenticated user."""

    __tablename__ = "notifications"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    # Kept nullable for compatibility with the existing reminder scheduler.
    # New callers should always use user_id.
    patient_id = db.Column(db.Integer, db.ForeignKey("patients.id"), nullable=True)
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(50), nullable=False, default="General Notification")
    is_read = db.Column(db.Boolean, nullable=False, default=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    user = db.relationship("User", backref="notifications")

    @property
    def notification_type(self):
        """Legacy alias used by the existing reminder scheduler."""
        return self.type

    @notification_type.setter
    def notification_type(self, value):
        self.type = value

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "title": self.title,
            "message": self.message,
            "type": self.type,
            "is_read": self.is_read,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
