import api from "./api";

export const getAppointments = async () => {
  const response = await api.get("/appointments");
  return response.data;
};

export const bookAppointment = async (data) => {
  const response = await api.post("/appointments", data);
  return response.data;
};

export const updateAppointment = async (id, data) => {
  const response = await api.put(`/appointments/${id}`, data);
  return response.data;
};

export const cancelAppointment = async (id) => {
  const response = await api.delete(`/appointments/${id}`);
  return response.data;
};