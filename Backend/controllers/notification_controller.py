from flask import request
from flask_jwt_extended import get_jwt, get_jwt_identity

from services.notification_service import NotificationService
from utils.response import error_response, success_response


class NotificationController:

    @staticmethod
    def _actor():
        return get_jwt().get("role"), get_jwt_identity()

    @staticmethod
    def create_notification():
        notification, error = NotificationService.create_notification(request.get_json(silent=True) or {})
        if error:
            return error_response(error, 400 if error != "User not found" else 404)
        return success_response("Notification created successfully", notification.to_dict(), 201)

    @staticmethod
    def get_notifications():
        role, user_id = NotificationController._actor()
        return success_response("Notifications fetched successfully", NotificationService.get_notifications(role, user_id))

    @staticmethod
    def get_notification(notification_id):
        role, user_id = NotificationController._actor()
        notification, error = NotificationService.get_notification_by_id(notification_id, role, user_id)
        if error:
            return error_response(error, 404 if error == "Notification not found" else 403)
        return success_response("Notification fetched successfully", notification.to_dict())

    @staticmethod
    def update_notification(notification_id):
        role, user_id = NotificationController._actor()
        notification, error = NotificationService.update_notification(notification_id, request.get_json(silent=True) or {}, role, user_id)
        if error:
            return error_response(error, 404 if error == "Notification not found" else 403 if error == "Access denied" else 400)
        return success_response("Notification updated successfully", notification.to_dict())

    @staticmethod
    def delete_notification(notification_id):
        role, user_id = NotificationController._actor()
        error = NotificationService.delete_notification(notification_id, role, user_id)
        if error:
            return error_response(error, 404 if error == "Notification not found" else 403 if error == "Access denied" else 400)
        return success_response("Notification deleted successfully")

    @staticmethod
    def mark_notification_read(notification_id):
        role, user_id = NotificationController._actor()
        notification, error = NotificationService.mark_notification_read(notification_id, role, user_id)
        if error:
            return error_response(error, 404 if error == "Notification not found" else 403 if error == "Access denied" else 400)
        return success_response("Notification marked as read", notification.to_dict())
