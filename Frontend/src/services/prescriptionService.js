import api from "./api";

export const getPrescriptions = async () => {
  const response = await api.get("/prescriptions");
  return response.data;
};

export const getPrescriptionById = async (id) => {
  const response = await api.get(`/prescriptions/${id}`);
  return response.data;
};

export const createPrescription = async (data) => {
  const response = await api.post("/prescriptions", data);
  return response.data;
};

export const updatePrescription = async (id, data) => {
  const response = await api.put(`/prescriptions/${id}`, data);
  return response.data;
};

export const deletePrescription = async (id) => {
  const response = await api.delete(`/prescriptions/${id}`);
  return response.data;
};
