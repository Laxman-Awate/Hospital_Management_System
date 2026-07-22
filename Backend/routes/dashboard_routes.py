from flask import Blueprint

from controllers.dashboard_controller import (
    stats,
    recent,
    doctor_stats
)

dashboard_bp = Blueprint(
    "dashboard",
    __name__,
    url_prefix="/api/dashboard"
)

dashboard_bp.route(
    "/stats",
    methods=["GET"]
)(stats)

dashboard_bp.route(
    "/recent-appointments",
    methods=["GET"]
)(recent)

dashboard_bp.route(
    "/doctor-summary",
    methods=["GET"]
)(doctor_stats)