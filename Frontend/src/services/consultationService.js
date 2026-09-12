import api from "./api";

export const getConsultation = async (appointmentId) => {
  const response = await api.get(`/consultations/${appointmentId}`);
  return response.data;
};

export const setPatientConsent = async (appointmentId, consentObtained) => {
  const response = await api.post(`/consultations/${appointmentId}/consent`, {
    consent_obtained: consentObtained,
  });
  return response.data;
};

export const uploadAndTranscribeAudio = async (appointmentId, audioBlob) => {
  const formData = new FormData();
  formData.append("audio", audioBlob, `recording_${appointmentId}.webm`);

  const response = await api.post(`/consultations/${appointmentId}/transcribe`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const generateAIDraft = async (appointmentId, transcriptText = null) => {
  const response = await api.post(`/consultations/${appointmentId}/generate-draft`, {
    transcript: transcriptText,
  });
  return response.data;
};

export const updateConsultationDraft = async (appointmentId, draftData) => {
  const response = await api.put(`/consultations/${appointmentId}/draft`, draftData);
  return response.data;
};

export const approveConsultation = async (appointmentId, finalMedicalData) => {
  const response = await api.post(`/consultations/${appointmentId}/approve`, finalMedicalData);
  return response.data;
};
