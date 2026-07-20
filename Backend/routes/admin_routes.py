from flask import Blueprint
from controllers.admin_controller import admin_dashboard

admin_bp = Blueprint("admin", __name__)

admin_bp.route("/dashboard", methods=["GET"])(admin_dashboard)