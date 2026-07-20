from flask import Blueprint
from controllers.doctor_controller import doctor_dashboard,add_doctor

doctor_bp = Blueprint("doctor", __name__)

doctor_bp.route("/dashboard", methods=["GET"])(doctor_dashboard)



doctor_bp = Blueprint("doctor", __name__, url_prefix="/api/doctor")

doctor_bp.route("", methods=["POST"])(add_doctor)


doctor_bp.route("/<int:doctor_id>",methods=["GET"])(get_doctor)

doctor_bp.route("/<int:doctor_id>",methods=["PUT"])(edit_doctor)

doctor_bp.route("/<int:doctor_id>",methods=["DELETE"])(remove_doctor)