import { create } from 'zustand';
import api from '../services/api';
import socket from '../services/socket';

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const res = await api.get('/notifications');
      const unreadCount = res.data.filter(n => !n.read).length;
      set({ notifications: res.data, unreadCount, loading: false });
    } catch (err) {
      console.error('Fetch notifications failed:', err);
      set({ loading: false });
    }
  },

  markAsRead: async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      set(state => {
        const notifications = state.notifications.map(n => 
          n._id === id ? { ...n, read: true } : n
        );
        const unreadCount = notifications.filter(n => !n.read).length;
        return { notifications, unreadCount };
      });
    } catch (err) {
      console.error('Mark as read failed:', err);
    }
  },

  markAllAsRead: async () => {
    try {
      await api.patch('/notifications/read-all');
      set(state => ({
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0
      }));
    } catch (err) {
      console.error('Mark all as read failed:', err);
    }
  },

  clearAllNotifications: async () => {
    try {
      await api.delete('/notifications/clear-all');
      set({ notifications: [], unreadCount: 0 });
    } catch (err) {
      console.error('Clear all notifications failed:', err);
    }
  },

  deleteNotification: async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      set(state => {
        const notifications = state.notifications.filter(n => n._id !== id);
        const unreadCount = notifications.filter(n => !n.read).length;
        return { notifications, unreadCount };
      });
    } catch (err) {
      console.error('Delete notification failed:', err);
    }
  },

  addNotification: (notification) => {
    // If it's just a trigger to refresh, we can fetch
    get().fetchNotifications();
  }
}));

export default useNotificationStore;
