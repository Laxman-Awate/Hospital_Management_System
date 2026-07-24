from utils.response import success_response
from utils.role_required import role_required
from services.dashboard_service import DashboardService


@role_required("Admin")
def summary():
    return success_response("Dashboard summary fetched successfully", DashboardService.get_summary())


@role_required("Admin")
def monthly_revenue():
    return success_response("Monthly revenue fetched successfully", DashboardService.get_monthly_revenue())


@role_required("Admin")
def monthly_appointments():
    return success_response("Monthly appointments fetched successfully", DashboardService.get_monthly_appointments())


@role_required("Admin")
def patient_growth():
    return success_response("Patient growth fetched successfully", DashboardService.get_patient_growth())


@role_required("Admin")
def recent_appointments():
    return success_response("Recent appointments fetched successfully", DashboardService.get_recent_appointments())


@role_required("Admin")
def recent_notifications():
    return success_response("Recent notifications fetched successfully", DashboardService.get_recent_notifications())


@role_required("Admin")
def recent_prescriptions():
    return success_response("Recent prescriptions fetched successfully", DashboardService.get_recent_prescriptions())
