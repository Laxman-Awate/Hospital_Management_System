import api from "./api";

export const getBills = async () => {
  const response = await api.get("/billing/");
  return response.data;
};

export const getBillById = async (id) => {
  const response = await api.get(`/billing/${id}`);
  return response.data;
};

export const createBill = async (data) => {
  const response = await api.post("/billing/", data);
  return response.data;
};

export const updateBill = async (id, data) => {
  const response = await api.put(`/billing/${id}`, data);
  return response.data;
};

export const deleteBill = async (id) => {
  const response = await api.delete(`/billing/${id}`);
  return response.data;
};

export const payBill = async (id) => {
  const response = await api.put(`/billing/pay/${id}`);
  return response.data;
};

export const getRevenue = async () => {
  const response = await api.get("/billing/revenue");
  return response.data;
};

export const getBillingDashboard = async () => {
  const response = await api.get("/billing/dashboard");
  return response.data;
};