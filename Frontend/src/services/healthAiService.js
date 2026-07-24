import api from "./api";

export const chatWithHealthAssistant = async (message) => {
  const response = await api.post("/ai/chat", { message });
  return response.data;
};
