import React, { useEffect } from 'react';
import socket from '../services/socket';
import useAuthStore from '../store/authStore';
import useFriendStore from '../store/friendStore';
import useNotificationStore from '../store/notificationStore';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';

const SocketManager = () => {
  const { token, user } = useAuthStore();
  const { 
    addIncomingRequest, 
    updateOnlineStatus, 
    fetchFriends, 
    fetchFriendRequests 
  } = useFriendStore();
  const { fetchNotifications } = useNotificationStore();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (token && !socket.connected) {
      socket.auth = { token };
      socket.connect();
      
      // Fetch initial data
      fetchFriends();
      fetchFriendRequests();
      fetchNotifications();
    }

    if (!token && socket.connected) {
      socket.disconnect();
    }

    // Global Listeners
    const handleNewFriendRequest = (data) => {
      addIncomingRequest(data);
      showToast(`New friend request from ${data.sender.displayName || data.sender.name}!`, 'info');
    };

    const handleFriendRequestUpdate = (data) => {
      if (data.status === 'accepted') {
        showToast(`Friend request accepted!`, 'success');
        fetchFriends();
      }
    };

    const handleStatusChange = (data) => {
      updateOnlineStatus(data.userId, data.status);
    };

    const handleRoomInvite = (data) => {
      showToast(
        <div className="flex flex-col gap-2">
          <p><span className="font-bold text-gray-900">{data.sender.displayName || data.sender.name}</span> invited you to join <span className="font-bold text-[#8b5cf6]">{data.roomName}</span></p>
          <button 
            onClick={() => navigate(`/room/${data.roomId}`)}
            className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white text-xs font-bold uppercase tracking-widest py-3 rounded-xl transition-all shadow-sm"
          >
            Join Room
          </button>
        </div>,
        'info',
        8000
      );
    };

    const handleRefreshFriends = () => {
      fetchFriends();
    };

    const handleNewNotification = () => {
      fetchNotifications();
    };

    socket.on('new_friend_request', handleNewFriendRequest);
    socket.on('friend_request_update', handleFriendRequestUpdate);
    socket.on('friend_status_change', handleStatusChange);
    socket.on('room_invite', handleRoomInvite);
    socket.on('refresh_friends', handleRefreshFriends);
    socket.on('new_notification', handleNewNotification);

    return () => {
      socket.off('new_friend_request', handleNewFriendRequest);
      socket.off('friend_request_update', handleFriendRequestUpdate);
      socket.off('friend_status_change', handleStatusChange);
      socket.off('room_invite', handleRoomInvite);
      socket.off('refresh_friends', handleRefreshFriends);
      socket.off('new_notification', handleNewNotification);
    };
  }, [token, addIncomingRequest, updateOnlineStatus, fetchFriends, fetchFriendRequests, fetchNotifications, showToast, navigate]);

  return null; // This component doesn't render anything
};

export default SocketManager;
