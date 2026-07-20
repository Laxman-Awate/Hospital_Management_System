from flask import Blueprint
from controllers.doctor_controller import doctor_dashboard

doctor_bp = Blueprint("doctor", __name__)

doctor_bp.route("/dashboard", methods=["GET"])(doctor_dashboard)