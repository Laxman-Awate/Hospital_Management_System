from flask import request

from services.notification_service import NotificationService
from utils.response import success_response, error_response


class NotificationController:

    @staticmethod
    def create_notification():

        data = request.get_json()

        notification, error = NotificationService.create_notification(data)

        if error:
            return error_response(error, 400)

        return success_response(
            "Notification created successfully",
            notification.to_dict(),
            201
        )

    @staticmethod
    def get_all_notifications():

        notifications = NotificationService.get_all_notifications()

        return success_response(
            "Notifications fetched successfully",
            notifications
        )

    @staticmethod
    def get_notification(notification_id):

        notification = NotificationService.get_notification(notification_id)

        if not notification:
            return error_response(
                "Notification not found",
                404
            )

        return success_response(
            "Notification fetched successfully",
            notification
        )

    @staticmethod
    def get_patient_notifications(patient_id):

        notifications = NotificationService.get_patient_notifications(
            patient_id
        )

        return success_response(
            "Patient notifications fetched successfully",
            notifications
        )

    @staticmethod
    def send_notification(notification_id):

        notification, error = NotificationService.send_notification(
            notification_id
        )

        if error:
            return error_response(error, 400)

        return success_response(
            "Notification sent successfully",
            notification.to_dict()
        )

    @staticmethod
    def delete_notification(notification_id):

        deleted = NotificationService.delete_notification(notification_id)

        if not deleted:
            return error_response(
                "Notification not found",
                404
            )

        return success_response(
            "Notification deleted successfully"
        )