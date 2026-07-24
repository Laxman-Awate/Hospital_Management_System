import api from "./api";

export const getNotifications = async () => (await api.get("/notifications")).data;
export const getNotificationById = async (id) => (await api.get(`/notifications/${id}`)).data;
export const createNotification = async (data) => (await api.post("/notifications", data)).data;
export const updateNotification = async (id, data) => (await api.put(`/notifications/${id}`, data)).data;
export const deleteNotification = async (id) => (await api.delete(`/notifications/${id}`)).data;
export const markNotificationRead = async (id) => (await api.put(`/notifications/${id}/read`)).data;
