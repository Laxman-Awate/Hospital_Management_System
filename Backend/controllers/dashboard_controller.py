from utils.response import success_response
from utils.role_required import role_required

from services.dashboard_service import (
    dashboard_stats,
    recent_appointments,
    doctor_summary
)


@role_required("Admin")
def stats():
    return success_response(
        "Dashboard statistics",
        dashboard_stats()
    )


@role_required("Admin")
def recent():
    return success_response(
        "Recent appointments",
        recent_appointments()
    )


@role_required("Admin")
def doctor_stats():
    return success_response(
        "Doctor summary",
        doctor_summary()
    )