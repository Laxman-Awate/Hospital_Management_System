import api from "./api";

export const getDoctor = async (id) => {
  const response = await api.get(`/doctor/${id}`);
  return response.data;
};

export const createDoctor = async (data) => {
  const response = await api.post("/doctor", data);
  return response.data;
};

export const updateDoctor = async (id, data) => {
  const response = await api.put(`/doctor/${id}`, data);
  return response.data;
};

export const deleteDoctor = async (id) => {
  const response = await api.delete(`/doctor/${id}`);
  return response.data;
};

export const getDoctorDashboard = async () => {
  const response = await api.get("/doctor/dashboard");
  return response.data;
};