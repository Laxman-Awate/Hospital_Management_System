from flask import Blueprint

from controllers.dashboard_controller import (
    monthly_appointments,
    monthly_revenue,
    patient_growth,
    recent_appointments,
    recent_notifications,
    recent_prescriptions,
    summary,
)


dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/api/dashboard")

dashboard_bp.route("/summary", methods=["GET"])(summary)
dashboard_bp.route("/monthly-revenue", methods=["GET"])(monthly_revenue)
dashboard_bp.route("/monthly-appointments", methods=["GET"])(monthly_appointments)
dashboard_bp.route("/patient-growth", methods=["GET"])(patient_growth)
dashboard_bp.route("/recent-appointments", methods=["GET"])(recent_appointments)
dashboard_bp.route("/recent-notifications", methods=["GET"])(recent_notifications)
dashboard_bp.route("/recent-prescriptions", methods=["GET"])(recent_prescriptions)
