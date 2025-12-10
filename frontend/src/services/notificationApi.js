import axiosClient from './api';

export const notificationApi = {
  getNotifications: (kitchenId, userRole) => axiosClient.get(`/notifications?kitchenId=${kitchenId}&userRole=${userRole || 'ADMIN'}`),
  getUnreadCount: (kitchenId, userRole) => axiosClient.get(`/notifications/unread-count?kitchenId=${kitchenId}&userRole=${userRole || 'ADMIN'}`),
  markAllAsRead: (kitchenId, userRole) => axiosClient.post(`/notifications/mark-read?kitchenId=${kitchenId}&userRole=${userRole || 'ADMIN'}`),
  deleteNotification: (id) => axiosClient.delete(`/notifications/${id}`)
};