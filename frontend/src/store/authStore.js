import { create } from 'zustand';
import api from '../services/api';
import socket from '../services/socket';

const useAuthStore = create((set, get) => ({
  user: null,
  token: sessionStorage.getItem('token') || null,
  loading: !!sessionStorage.getItem('token'),

  setAuth: (token) => {
    sessionStorage.setItem('token', token);
    set({ token, loading: true });
  },

  setUser: (user) => set({ user, loading: false }),

  fetchUser: async () => {
    const { token } = get();
    if (!token) {
      set({ loading: false });
      return;
    }
    set({ loading: true });
    try {
      const res = await api.get('/user/me');
      set({ user: res.data, loading: false });
    } catch (err) {
      console.error('Fetch user failed:', err);
      sessionStorage.removeItem('token');
      set({ user: null, token: null, loading: false });
    }
  },

  updateProfile: async (profileData) => {
    try {
      const res = await api.put('/user/profile', profileData);
      set({ user: res.data });
      
      // Emit socket event for realtime updates
      socket.emit('update_profile', {
        displayName: res.data.displayName,
        avatar: res.data.avatar
      });

      return { success: true, user: res.data };
    } catch (err) {
      console.error('Update profile failed:', err);
      return { success: false, error: err.response?.data?.message || 'Update failed' };
    }
  },

  login: async (credentials) => {
    try {
      const res = await api.post('/auth/login', credentials);
      sessionStorage.setItem('token', res.data.token);
      set({ token: res.data.token, user: res.data.user });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Login failed' };
    }
  },

  register: async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      sessionStorage.setItem('token', res.data.token);
      set({ token: res.data.token, user: res.data.user });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Registration failed' };
    }
  },

  forgotPassword: async (email) => {
    try {
      const res = await api.post('/auth/forgot-password', { email });
      return { success: true, message: res.data.message, resetToken: res.data.resetToken };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to process request' };
    }
  },

  resetPassword: async (token, password) => {
    try {
      const res = await api.post('/auth/reset-password', { token, password });
      sessionStorage.setItem('token', res.data.token);
      set({ token: res.data.token, user: res.data.user });
      return { success: true, message: res.data.message };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Password reset failed' };
    }
  },

  logout: () => {
    // Clear socket connection on logout
    if (socket.connected) {
      socket.disconnect();
    }
    sessionStorage.removeItem('token');
    set({ user: null, token: null });
    window.location.href = '/';
  },

  changePassword: async (currentPassword, newPassword) => {
    try {
      const res = await api.put('/user/change-password', { currentPassword, newPassword });
      return { success: true, message: res.data.message };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Password change failed' };
    }
  },

  deleteAccount: async () => {
    try {
      const res = await api.delete('/user/delete-account');
      get().logout();
      return { success: true, message: res.data.message };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Account deletion failed' };
    }
  },
}));

export default useAuthStore;