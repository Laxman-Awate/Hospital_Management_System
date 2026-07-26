import api from "./api";

export const getPatients = async () => {
  const response = await api.get("/patient");
  return response.data;
};

export const getPatientById = async (id) => {
  const response = await api.get(`/patient/${id}`);
  return response.data;
};

export const getPatientByUserId = async (userId) => {
  const response = await api.get(`/patient/by-user/${userId}`);
  return response.data;
};

export const createPatient = async (data) => {
  const response = await api.post("/patient", data);
  return response.data;
};

export const updatePatient = async (id, data) => {
  const response = await api.put(`/patient/${id}`, data);
  return response.data;
};

export const deletePatient = async (id) => {
  const response = await api.delete(`/patient/${id}`);
  return response.data;
};