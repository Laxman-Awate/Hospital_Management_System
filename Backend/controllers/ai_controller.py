from flask import jsonify, request

from services.ai_service import AIService


class AIController:

    @staticmethod
    def chat():
        data = request.get_json(silent=True) or {}
        message = data.get("message")
        if not isinstance(message, str) or not message.strip():
            return jsonify({"message": "message is required"}), 400
        if len(message) > 2000:
            return jsonify({"message": "message must not exceed 2000 characters"}), 400

        reply, error = AIService.get_chat_reply(message.strip())
        if error:
            return jsonify({"message": error}), 503
        return jsonify({"reply": reply}), 200
