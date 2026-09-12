import api from "./api";

export const getMedicalRecords = async () => {
  const response = await api.get("/medical-records");
  return response.data;
};

export const getMedicalRecordById = async (id) => {
  const response = await api.get(`/medical-records/${id}`);
  return response.data;
};

export const getPatientMedicalRecords = async (patientId) => {
  const response = await api.get(`/medical-records/patient/${patientId}`);
  return response.data;
};
