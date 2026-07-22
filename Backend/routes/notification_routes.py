from flask import Blueprint
from flask_jwt_extended import jwt_required

from controllers.notification_controller import NotificationController
from utils.role_required import role_required

notification_bp = Blueprint(
    "notification",
    __name__,
    url_prefix="/api/notifications"
)


@notification_bp.route("/", methods=["POST"])
@jwt_required()
@role_required("Admin")
def create_notification():
    return NotificationController.create_notification()


@notification_bp.route("/", methods=["GET"])
@jwt_required()
@role_required("Admin")
def get_all_notifications():
    return NotificationController.get_all_notifications()


@notification_bp.route("/<int:notification_id>", methods=["GET"])
@jwt_required()
def get_notification(notification_id):
    return NotificationController.get_notification(notification_id)


@notification_bp.route("/patient/<int:patient_id>", methods=["GET"])
@jwt_required()
def get_patient_notifications(patient_id):
    return NotificationController.get_patient_notifications(patient_id)


@notification_bp.route("/send/<int:notification_id>", methods=["POST"])
@jwt_required()
@role_required("Admin")
def send_notification(notification_id):
    return NotificationController.send_notification(notification_id)


@notification_bp.route("/<int:notification_id>", methods=["DELETE"])
@jwt_required()
@role_required("Admin")
def delete_notification(notification_id):
    return NotificationController.delete_notification(notification_id)