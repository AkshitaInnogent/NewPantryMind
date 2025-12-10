import axiosClient from './api';

export const notificationApi = {
  getNotifications: (kitchenId, userRole, userId) => axiosClient.get(`/notifications?kitchenId=${kitchenId}&userRole=${userRole || 'ADMIN'}&userId=${userId}`),
  getUnreadCount: (kitchenId, userRole, userId) => axiosClient.get(`/notifications/unread-count?kitchenId=${kitchenId}&userRole=${userRole || 'ADMIN'}&userId=${userId}`),
  markAllAsRead: (kitchenId, userRole, userId) => axiosClient.post(`/notifications/mark-read?kitchenId=${kitchenId}&userRole=${userRole || 'ADMIN'}&userId=${userId}`),
  deleteNotification: (id, userId) => axiosClient.delete(`/notifications/${id}?userId=${userId}`)
};