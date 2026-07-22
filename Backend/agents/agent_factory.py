"""
Agent Factory

Factory for creating and managing agent instances per session.
Ensures session safety by maintaining separate agent instances per user/session.
"""

from typing import Dict
from agents.appointment_agent import AppointmentAgent


class AgentFactory:
    """
    Factory for creating and managing agent instances.
    
    This factory ensures:
    - Each session gets its own agent instance
    - No shared state between users
    - Proper cleanup of old sessions
    """

    _agents: Dict[str, AppointmentAgent] = {}

    @classmethod
    def get_agent(cls, session_id: str) -> AppointmentAgent:
        """
        Get or create an agent instance for the given session.
        
        Args:
            session_id: Unique identifier for the user/session
            
        Returns:
            AppointmentAgent instance for the session
        """
        if session_id in cls._agents:
            return cls._agents[session_id]

        # Create new agent instance
        agent = AppointmentAgent(session_id=session_id)
        cls._agents[session_id] = agent
        return agent

    @classmethod
    def remove_agent(cls, session_id: str) -> None:
        """
        Remove agent instance for a session.
        
        Call this when a session ends to free memory.
        
        Args:
            session_id: Session identifier to remove
        """
        if session_id in cls._agents:
            del cls._agents[session_id]

    @classmethod
    def reset_agent(cls, session_id: str) -> None:
        """
        Reset the state of an agent without removing it.
        
        Args:
            session_id: Session identifier to reset
        """
        if session_id in cls._agents:
            cls._agents[session_id].reset_state()

    @classmethod
    def get_all_sessions(cls) -> list:
        """
        Get list of all active session IDs.
        
        Returns:
            List of session identifiers
        """
        return list(cls._agents.keys())

    @classmethod
    def clear_all(cls) -> None:
        """
        Clear all agent instances.
        
        Useful for testing or server shutdown.
        """
        cls._agents.clear()
