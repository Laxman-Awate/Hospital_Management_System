import api from "./api";

const get = async (path) => (await api.get(path)).data;

export const getDashboardSummary = () => get("/dashboard/summary");
export const getMonthlyRevenue = () => get("/dashboard/monthly-revenue");
export const getMonthlyAppointments = () => get("/dashboard/monthly-appointments");
export const getPatientGrowth = () => get("/dashboard/patient-growth");
export const getRecentAppointments = () => get("/dashboard/recent-appointments");
export const getRecentNotifications = () => get("/dashboard/recent-notifications");
export const getRecentPrescriptions = () => get("/dashboard/recent-prescriptions");
