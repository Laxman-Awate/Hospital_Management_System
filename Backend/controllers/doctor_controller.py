from flask import jsonify
from utils.role_required import role_required


@role_required("Doctor")
def doctor_dashboard():

    return jsonify({
        "message": "Welcome Doctor"
    }), 200