from flask import Blueprint
from flask_jwt_extended import jwt_required

from controllers.ai_controller import AIController


ai_bp = Blueprint("ai", __name__, url_prefix="/api/ai")


@ai_bp.route("/chat", methods=["POST"])
@jwt_required()
def chat():
    return AIController.chat()
