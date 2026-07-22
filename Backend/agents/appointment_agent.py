"""
Appointment Agent

State-driven conversational agent for appointment booking.
Minimizes LLM calls by using rule-based extraction for simple inputs.
"""

from typing import Optional

from agents.appointment_state import AppointmentState
from agents.intent_extractor import extract_information
from tools.appointment_tools import AppointmentTools


class AppointmentAgent:
    """
    Conversational agent for appointment booking and management.
    
    This agent maintains conversation state and minimizes LLM calls by:
    1. Using rule-based extraction for simple inputs (numbers, times, dates)
    2. Only calling LLM for complex natural language
    3. Tracking which field is being collected (waiting_for)
    4. Directly storing responses when waiting for specific fields
    
    Session-based architecture ensures multi-user safety via AgentFactory.
    """

    def __init__(
        self,
        session_id: Optional[str] = None,
        state: Optional[AppointmentState] = None,
        tools: Optional[AppointmentTools] = None
    ):
        """
        Initialize the appointment agent with dependency injection.
        
        Args:
            session_id: Optional session identifier for multi-user support
            state: Optional AppointmentState instance (for testing)
            tools: Optional AppointmentTools instance (for testing)
        """
        self.state = state or AppointmentState()
        self.session_id = session_id
        self._tools = tools or AppointmentTools()

    def chat(self, user_message: str) -> str:
        """
        Process user message and return agent response.
        
        This is the main entry point for the conversational interface.
        
        Args:
            user_message: The user's natural language input
            
        Returns:
            Agent's response message
        """
        if not user_message or not user_message.strip():
            return "Please provide a valid message."

        user_message = user_message.strip()

        # If the agent is waiting for a specific field,
        # store it directly without calling the LLM.
        if self.state.waiting_for:
            response = self._handle_waiting_field(user_message)
        else:
            # First message or complex input - extract information
            extracted_data = extract_information(user_message)
            self._update_state_from_extraction(extracted_data)
            response = self._determine_next_step()

        return response

    def _handle_waiting_field(self, user_message: str) -> str:
        """
        Handle user input when agent is waiting for a specific field.
        
        This bypasses LLM calls for efficiency.
        
        Args:
            user_message: The user's input
            
        Returns:
            Agent's response
        """
        field = self.state.waiting_for

        try:
            if field == "patient_id":
                self.state.patient_id = int(user_message)
            elif field == "doctor_name":
                self.state.doctor_name = user_message
            elif field == "appointment_date":
                self.state.appointment_date = user_message
            elif field == "appointment_time":
                self.state.appointment_time = user_message
            elif field == "reason":
                self.state.reason = user_message
            else:
                # Unknown field - reset
                self.state.waiting_for = ""
                return "I'm not sure what information you're providing. Let's start over."

            # Clear waiting flag after successful capture
            self.state.waiting_for = ""
            
            return self._determine_next_step()
            
        except ValueError as e:
            return f"Invalid input for {field}. Please try again."

    def _update_state_from_extraction(self, data: dict) -> None:
        """
        Update agent state from extracted information.
        
        Args:
            data: Dictionary containing extracted fields
        """
        if data.get("intent"):
            self.state.intent = data["intent"]

        if data.get("patient_id") is not None:
            self.state.patient_id = data["patient_id"]

        if data.get("doctor_name"):
            self.state.doctor_name = data["doctor_name"]

        if data.get("appointment_date"):
            self.state.appointment_date = data["appointment_date"]

        if data.get("appointment_time"):
            self.state.appointment_time = data["appointment_time"]

        if data.get("reason"):
            self.state.reason = data["reason"]

    def _determine_next_step(self) -> str:
        """
        Determine the next question or action based on current state.
        
        Returns:
            Agent's response message
        """
        # Check reason first - it's the starting point
        if not self.state.reason:
            self.state.waiting_for = "reason"
            return "What is the reason for your appointment?"

        # Check patient ID
        if self.state.patient_id is None:
            self.state.waiting_for = "patient_id"
            return "Please provide your Patient ID."

        # Check doctor name
        if not self.state.doctor_name:
            self.state.waiting_for = "doctor_name"
            return "Which doctor would you like to consult?"

        # Check appointment date
        if not self.state.appointment_date:
            self.state.waiting_for = "appointment_date"
            return "What appointment date would you prefer? (e.g., today, tomorrow, or YYYY-MM-DD)"

        # Check appointment time
        if not self.state.appointment_time:
            self.state.waiting_for = "appointment_time"
            return "What appointment time would you prefer? (e.g., 10:30 AM or 14:00)"

        # All fields collected - book the appointment
        return self._book_appointment()

    def _book_appointment(self) -> str:
        """
        Book the appointment with collected information.
        
        Returns:
            Success or error message
        """
        try:
            result = self._tools.book(
                patient_id=self.state.patient_id,
                doctor_name=self.state.doctor_name,
                appointment_date=self.state.appointment_date,
                appointment_time=self.state.appointment_time,
                reason=self.state.reason
            )

            # Reset state after booking attempt
            self.state = AppointmentState()

            return result

        except Exception as e:
            # Reset state on error
            self.state = AppointmentState()
            return f"❌ An error occurred while booking: {str(e)}"

    def reset_state(self) -> None:
        """
        Reset the conversation state.
        
        Useful for starting a new conversation or handling errors.
        """
        self.state = AppointmentState()

    def get_current_state(self) -> dict:
        """
        Get the current conversation state.
        
        Returns:
            Dictionary representation of current state
        """
        return self.state.to_dict()
