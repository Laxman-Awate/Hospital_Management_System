from flask import jsonify
from utils.role_required import role_required


@role_required("Admin")
def admin_dashboard():

    return jsonify({
        "message": "Welcome Admin"
    }), 200