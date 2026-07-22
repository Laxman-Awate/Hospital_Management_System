from flask import Blueprint
from flask_jwt_extended import jwt_required

from controllers.billing_controller import BillingController
from utils.role_required import role_required

billing_bp = Blueprint("billing", __name__, url_prefix="/api/billing")


@billing_bp.route("/", methods=["POST"])
@jwt_required()
@role_required("Admin")
def create_bill():
    return BillingController.create_bill()


@billing_bp.route("/", methods=["GET"])
@jwt_required()
def get_all_bills():
    return BillingController.get_all_bills()


@billing_bp.route("/<int:bill_id>", methods=["GET"])
@jwt_required()
def get_bill(bill_id):
    return BillingController.get_bill(bill_id)


@billing_bp.route("/<int:bill_id>", methods=["PUT"])
@jwt_required()
@role_required("Admin")
def update_bill(bill_id):
    return BillingController.update_bill(bill_id)


@billing_bp.route("/<int:bill_id>", methods=["DELETE"])
@jwt_required()
@role_required("Admin")
def delete_bill(bill_id):
    return BillingController.delete_bill(bill_id)


@billing_bp.route("/pay/<int:bill_id>", methods=["PUT"])
@jwt_required()
@role_required("Admin")
def pay_bill(bill_id):
    return BillingController.mark_bill_paid(bill_id)


@billing_bp.route("/revenue", methods=["GET"])
@jwt_required()
@role_required("Admin")
def revenue():
    return BillingController.revenue()


@billing_bp.route("/dashboard", methods=["GET"])
@jwt_required()
@role_required("Admin")
def dashboard():
    return BillingController.dashboard()