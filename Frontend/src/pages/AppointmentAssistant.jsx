import { useEffect, useState, useRef } from "react";
import MainLayout from "../layouts/MainLayout";
import { chatWithAssistant, resetAssistantSession, endAssistantSession } from "../services/aiService";
import { toast } from "react-toastify";
import { Send, RotateCcw, Bot, User, Sparkles } from "lucide-react";

function AppointmentAssistant() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! I'm your AI Appointment Assistant. I can help you book, cancel, or reschedule appointments. How can I assist you today?" }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);
    return () => {
      if (newSessionId) endAssistantSession(newSessionId).catch(console.error);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
      setTimeout(() => inputRef.current?.focus(), 100);
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
      <div className="flex flex-col" style={{ height: "calc(100vh - 9rem)" }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">AI Assistant</h1>
              <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse inline-block"></span>
                Online · Ready to help
              </p>
            </div>
          </div>
          <button
            onClick={handleResetSession}
            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 border border-slate-200 bg-white rounded-xl hover:bg-slate-50 transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
        </div>

        {/* Chat Window */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
            {messages.map((message, index) => (
              <div key={index} className={`flex items-end gap-3 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                  message.role === "user"
                    ? "bg-blue-600"
                    : "bg-gradient-to-br from-teal-400 to-blue-500"
                }`}>
                  {message.role === "user"
                    ? <User className="w-4 h-4 text-white" />
                    : <Bot className="w-4 h-4 text-white" />
                  }
                </div>

                {/* Bubble */}
                <div className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                  message.role === "user"
                    ? "bg-blue-600 text-white rounded-br-sm"
                    : "bg-slate-50 text-slate-800 border border-slate-100 rounded-bl-sm"
                }`}>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {loading && (
              <div className="flex items-end gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center shadow-sm">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-bl-sm px-5 py-4 shadow-sm">
                  <div className="flex space-x-1.5">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-3">
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                disabled={loading}
                className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-60 transition-colors"
              />
              <button
                type="submit"
                disabled={loading || !inputMessage.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white w-10 h-10 rounded-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm shadow-blue-200 shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="mt-3 bg-blue-50 border border-blue-100 rounded-2xl p-4 shrink-0">
          <p className="text-xs font-semibold text-blue-700 mb-2">💡 Quick Tips</p>
          <div className="flex flex-wrap gap-x-6 gap-y-1">
            {[
              "Say \"I want to book an appointment\"",
              "Provide your Patient ID when asked",
              "Say \"cancel appointment [ID]\" to cancel",
              "Say \"reschedule appointment [ID] to [date]\"",
            ].map((tip, i) => (
              <span key={i} className="text-xs text-blue-600">· {tip}</span>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default AppointmentAssistant;