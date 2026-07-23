import api from "./api";

export const chatWithAssistant = async (message) => {
  const response = await api.post("/agent/chat", {
    message,
  });

  return response.data;
};