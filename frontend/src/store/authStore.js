import { create } from 'zustand';
import api from '../services/api';
import socket from '../services/socket';

const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  loading: !!localStorage.getItem('token'),

  setAuth: (token) => {
    localStorage.setItem('token', token);
    set({ token });
  },

  setUser: (user) => set({ user, loading: false }),

  fetchUser: async () => {
    const { token } = get();
    if (!token) {
      set({ loading: false });
      return;
    }
    try {
      const res = await api.get('/user/me');
      set({ user: res.data, loading: false });
    } catch (err) {
      console.error('Fetch user failed:', err);
      localStorage.removeItem('token');
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
      localStorage.setItem('token', res.data.token);
      set({ token: res.data.token, user: res.data.user });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Login failed' };
    }
  },

  register: async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      localStorage.setItem('token', res.data.token);
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
      localStorage.setItem('token', res.data.token);
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
    localStorage.removeItem('token');
    set({ user: null, token: null });
    window.location.href = '/';
  },
}));

export default useAuthStore;