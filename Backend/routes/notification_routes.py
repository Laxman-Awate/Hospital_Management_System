from functools import wraps

from flask import Blueprint, jsonify
from flask_jwt_extended import get_jwt, jwt_required

from controllers.notification_controller import NotificationController


notification_bp = Blueprint("notification", __name__, url_prefix="/api/notifications")


def admin_required(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        if get_jwt().get("role") != "Admin":
            return jsonify({"success": False, "message": "Access Denied"}), 403
        return fn(*args, **kwargs)
    return wrapper


@notification_bp.route("", methods=["POST"])
@admin_required
def create_notification():
    return NotificationController.create_notification()


@notification_bp.route("", methods=["GET"])
@jwt_required()
def get_notifications():
    return NotificationController.get_notifications()


@notification_bp.route("/<int:notification_id>", methods=["GET"])
@jwt_required()
def get_notification(notification_id):
    return NotificationController.get_notification(notification_id)


@notification_bp.route("/<int:notification_id>", methods=["PUT"])
@admin_required
def update_notification(notification_id):
    return NotificationController.update_notification(notification_id)


@notification_bp.route("/<int:notification_id>", methods=["DELETE"])
@jwt_required()
def delete_notification(notification_id):
    return NotificationController.delete_notification(notification_id)


@notification_bp.route("/<int:notification_id>/read", methods=["PUT"])
@jwt_required()
def mark_notification_read(notification_id):
    return NotificationController.mark_notification_read(notification_id)
