"""
Agent Controller

Controller for agent-related API endpoints.
Handles session management and agent interaction.
"""

from flask import request, jsonify
from agents.agent_factory import AgentFactory


def chat():
    """
    Handle chat requests from the frontend.
    
    Expects JSON body with:
    - message: User's message
    - session_id: Unique session identifier (required for multi-user support)
    
    Returns:
        JSON response with agent's reply
    """
    data = request.get_json()

    message = data.get("message")
    session_id = data.get("session_id")

    if not message:
        return jsonify({
            "success": False,
            "message": "Message is required"
        }), 400

    if not session_id:
        return jsonify({
            "success": False,
            "message": "Session ID is required"
        }), 400

    # Get or create agent for this session
    agent = AgentFactory.get_agent(session_id)

    # Process message
    response = agent.chat(message)

    return jsonify({
        "success": True,
        "response": response,
        "session_id": session_id
    })


def reset_session():
    """
    Reset the conversation state for a session.
    
    Expects JSON body with:
    - session_id: Session identifier to reset
    
    Returns:
        JSON response indicating success
    """
    data = request.get_json()
    session_id = data.get("session_id")

    if not session_id:
        return jsonify({
            "success": False,
            "message": "Session ID is required"
        }), 400

    AgentFactory.reset_agent(session_id)

    return jsonify({
        "success": True,
        "message": "Session reset successfully"
    })


def end_session():
    """
    End a session and clean up agent instance.
    
    Expects JSON body with:
    - session_id: Session identifier to end
    
    Returns:
        JSON response indicating success
    """
    data = request.get_json()
    session_id = data.get("session_id")

    if not session_id:
        return jsonify({
            "success": False,
            "message": "Session ID is required"
        }), 400

    AgentFactory.remove_agent(session_id)

    return jsonify({
        "success": True,
        "message": "Session ended successfully"
    })
