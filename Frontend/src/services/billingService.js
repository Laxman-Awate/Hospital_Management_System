import api from "./api";

export const getBills = async () => {
  const response = await api.get("/billing");
  return response.data;
};

export const generateBill = async (data) => {
  const response = await api.post("/billing", data);
  return response.data;
};