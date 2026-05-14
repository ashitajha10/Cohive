import { create } from 'zustand';
import userService from '../services/userService';
import socket from '../services/socket';

const useFriendStore = create((set, get) => ({
  friends: [],
  friendRequests: [],
  onlineStatus: {}, // userId -> 'online' | 'offline'
  loading: false,

  fetchFriends: async () => {
    set({ loading: true });
    try {
      const res = await userService.getFriends();
      set({ friends: res.data, loading: false });
      
      // Initial check for online status
      const friendIds = res.data.map(f => f._id);
      if (friendIds.length > 0) {
        socket.emit('check_online_status', friendIds, (statusMap) => {
          set({ onlineStatus: statusMap });
        });
      }
    } catch (err) {
      console.error('Fetch friends failed:', err);
      set({ loading: false });
    }
  },

  fetchFriendRequests: async () => {
    try {
      const res = await userService.getFriendRequests();
      set({ friendRequests: res.data });
    } catch (err) {
      console.error('Fetch requests failed:', err);
    }
  },

  updateOnlineStatus: (userId, status) => {
    set((state) => ({
      onlineStatus: { ...state.onlineStatus, [userId]: status }
    }));
  },

  sendRequest: async (receiverId) => {
    try {
      await userService.sendFriendRequest(receiverId);
      socket.emit('send_friend_request', { receiverId });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Request failed' };
    }
  },

  respondToRequest: async (requestId, status, senderId) => {
    try {
      await userService.respondToFriendRequest(requestId, status);
      socket.emit('friend_request_responded', { senderId, status });
      
      // Remove from pending list
      set((state) => ({
        friendRequests: state.friendRequests.filter(r => r._id !== requestId)
      }));

      if (status === 'accepted') {
        get().fetchFriends();
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Response failed' };
    }
  },

  removeFriend: async (friendId) => {
    try {
      await userService.removeFriend(friendId);
      set((state) => ({
        friends: state.friends.filter(f => f._id !== friendId)
      }));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to remove friend' };
    }
  },

  cancelRequest: async (receiverId) => {
    try {
      await userService.cancelFriendRequest(receiverId);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to cancel request' };
    }
  },

  addIncomingRequest: (request) => {
    set((state) => ({
      friendRequests: [request, ...state.friendRequests]
    }));
  }
}));

export default useFriendStore;
