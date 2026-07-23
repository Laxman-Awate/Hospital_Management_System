import { useEffect, useState, useRef } from "react";
import MainLayout from "../layouts/MainLayout";
import { chatWithAssistant, resetAssistantSession, endAssistantSession } from "../services/aiService";
import { toast } from "react-toastify";

function AppointmentAssistant() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! I'm your AI Appointment Assistant. I can help you book, cancel, or reschedule appointments. How can I assist you today?" }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);

    return () => {
      if (newSessionId) {
        endAssistantSession(newSessionId).catch(console.error);
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");

    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const response = await chatWithAssistant(userMessage, sessionId);
      setMessages(prev => [...prev, { role: "assistant", content: response.response }]);
    } catch (error) {
      console.error(error);
      toast.error("Failed to get response from assistant.");
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetSession = async () => {
    try {
      await resetAssistantSession(sessionId);
      setMessages([{ role: "assistant", content: "Conversation reset. How can I help you today?" }]);
      toast.success("Conversation reset successfully.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to reset conversation.");
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col h-[calc(100vh-100px)]">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">AI Appointment Assistant</h1>
          <button
            onClick={handleResetSession}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Reset Conversation
          </button>
        </div>

        <div className="flex-1 bg-white rounded-xl shadow-lg overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-3 ${
                    message.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-4 py-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-4 border-t bg-gray-50">
            <div className="flex gap-4">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message here..."
                disabled={loading}
                className="flex-1 border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading || !inputMessage.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Send
              </button>
            </div>
          </form>
        </div>

        <div className="mt-4 bg-blue-50 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Quick Tips:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Say "I want to book an appointment" to start booking</li>
            <li>• Provide your Patient ID when asked</li>
            <li>• Mention doctor name, date, and time for appointments</li>
            <li>• Say "cancel appointment [ID]" to cancel an appointment</li>
            <li>• Say "reschedule appointment [ID] to [date] at [time]" to reschedule</li>
          </ul>
        </div>
      </div>
    </MainLayout>
  );
}

export default AppointmentAssistant;