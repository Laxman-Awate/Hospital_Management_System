from flask import Blueprint
from controllers.agent_controller import chat, reset_session, end_session

agent_bp = Blueprint(
    "agent",
    __name__,
    url_prefix="/api/agent"
)

agent_bp.route("/chat", methods=["POST"])(chat)
agent_bp.route("/reset", methods=["POST"])(reset_session)
agent_bp.route("/end", methods=["POST"])(end_session)
