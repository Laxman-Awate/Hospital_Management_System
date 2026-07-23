import api from "./api";

export const getAppointments = async () => {
  const response = await api.get("/appointment");
  return response.data;
};

export const getAppointmentById = async (id) => {
  const response = await api.get(`/appointment/${id}`);
  return response.data;
};

export const createAppointment = async (data) => {
  const response = await api.post("/appointment", data);
  return response.data;
};

export const updateAppointment = async (id, data) => {
  const response = await api.put(`/appointment/${id}`, data);
  return response.data;
};

export const deleteAppointment = async (id) => {
  const response = await api.delete(`/appointment/${id}`);
  return response.data;
};