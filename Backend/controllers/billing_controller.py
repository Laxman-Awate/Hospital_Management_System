from flask import request
from services.billing_service import BillingService
from utils.response import success_response, error_response


class BillingController:

    @staticmethod
    def create_bill():

        data = request.get_json()

        bill, error = BillingService.create_bill(data)

        if error:
            return error_response(error, 400)

        return success_response(
            "Bill created successfully",
            bill.to_dict(),
            201
        )

    @staticmethod
    def get_all_bills():

        bills = BillingService.get_all_bills()

        return success_response(
            "Bills fetched successfully",
            bills
        )

    @staticmethod
    def get_bill(bill_id):

        bill = BillingService.get_bill_by_id(bill_id)

        if not bill:
            return error_response(
                "Bill not found",
                404
            )

        return success_response(
            "Bill fetched successfully",
            bill
        )

    @staticmethod
    def update_bill(bill_id):

        data = request.get_json()

        bill, error = BillingService.update_bill(
            bill_id,
            data
        )

        if error:
            return error_response(
                error,
                404
            )

        return success_response(
            "Bill updated successfully",
            bill.to_dict()
        )

    @staticmethod
    def delete_bill(bill_id):

        deleted = BillingService.delete_bill(
            bill_id
        )

        if not deleted:
            return error_response(
                "Bill not found",
                404
            )

        return success_response(
            "Bill deleted successfully"
        )

    @staticmethod
    def mark_bill_paid(bill_id):

        data = request.get_json()

        payment_method = data.get(
            "payment_method"
        )

        bill, error = BillingService.mark_bill_as_paid(
            bill_id,
            payment_method
        )

        if error:
            return error_response(
                error,
                400
            )

        return success_response(
            "Payment updated successfully",
            bill.to_dict()
        )

    @staticmethod
    def revenue():

        revenue = BillingService.get_total_revenue()

        pending = BillingService.get_pending_revenue()

        return success_response(
            "Revenue fetched successfully",
            {
                **revenue,
                **pending
            }
        )

    @staticmethod
    def dashboard():

        dashboard = BillingService.get_dashboard_statistics()

        return success_response(
            "Dashboard statistics fetched successfully",
            dashboard
        )