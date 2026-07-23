import api from "./api";

export const chatWithAssistant = async (message, sessionId) => {
  const response = await api.post("/agent/chat", {
    message,
    session_id: sessionId,
  });

  return response.data;
};

export const resetAssistantSession = async (sessionId) => {
  const response = await api.post("/agent/reset", {
    session_id: sessionId,
  });

  return response.data;
};

export const endAssistantSession = async (sessionId) => {
  const response = await api.post("/agent/end", {
    session_id: sessionId,
  });

  return response.data;
};