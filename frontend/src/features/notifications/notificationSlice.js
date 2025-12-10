import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationApi } from '../../services/notificationApi';

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { getState }) => {
    const { auth, kitchen } = getState();
    const response = await notificationApi.getNotifications(kitchen.currentKitchen?.id, auth.user?.role);
    return response.data;
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async (_, { getState }) => {
    const { auth, kitchen } = getState();
    const response = await notificationApi.getUnreadCount(kitchen.currentKitchen?.id, auth.user?.role, auth.user?.id);
    return response.data;
  }
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { getState }) => {
    const { auth, kitchen } = getState();
    await notificationApi.markAllAsRead(kitchen.currentKitchen?.id, auth.user?.role, auth.user?.id);
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (payload, { getState }) => {
    const { auth } = getState();
    const id = typeof payload === 'object' ? payload.id : payload;
    const isMember = typeof payload === 'object' ? payload.isMember : false;
    
    if (isMember || auth.user?.role === 'MEMBER') {
      await notificationApi.deleteMemberNotification(id);
    } else {
      await notificationApi.deleteNotification(id);
    }
    return id;
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    notifications: [],
    unreadCount: 0,
    loading: false
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload;
        state.loading = false;
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.notifications = state.notifications.filter(n => n.id !== action.payload);
      });
  }
});

export default notificationSlice.reducer;