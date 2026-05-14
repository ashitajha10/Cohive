import api from './api';

const userService = {
  searchUsers: (query) => api.get(`/user/search?q=${query}`),
  getFriends: () => api.get('/user/friends'),
  removeFriend: (friendId) => api.delete(`/user/friends/${friendId}`),
  sendFriendRequest: (receiverId) => api.post('/user/friend-request', { receiverId }),
  getFriendRequests: () => api.get('/user/friend-requests'),
  respondToFriendRequest: (requestId, status) => api.post('/user/friend-request/respond', { requestId, status }),
  cancelFriendRequest: (receiverId) => api.delete(`/user/friend-request/cancel/${receiverId}`),
};

export default userService;
