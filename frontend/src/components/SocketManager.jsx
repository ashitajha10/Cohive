import React, { useEffect } from 'react';
import socket from '../services/socket';
import useAuthStore from '../store/authStore';
import useFriendStore from '../store/friendStore';
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
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (token && !socket.connected) {
      socket.auth = { token };
      socket.connect();
      
      // Fetch initial data
      fetchFriends();
      fetchFriendRequests();
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
          <p><span className="font-bold text-primary-400">{data.sender.displayName || data.sender.name}</span> invited you to join <span className="font-bold text-indigo-400">{data.roomName}</span></p>
          <button 
            onClick={() => navigate(`/room/${data.roomId}`)}
            className="bg-primary-600 hover:bg-primary-500 text-[10px] font-black uppercase tracking-widest py-2 rounded-lg transition-all"
          >
            Accept Mission
          </button>
        </div>,
        'info',
        8000
      );
    };

    const handleRefreshFriends = () => {
      fetchFriends();
    };

    socket.on('new_friend_request', handleNewFriendRequest);
    socket.on('friend_request_update', handleFriendRequestUpdate);
    socket.on('friend_status_change', handleStatusChange);
    socket.on('room_invite', handleRoomInvite);
    socket.on('refresh_friends', handleRefreshFriends);

    return () => {
      socket.off('new_friend_request', handleNewFriendRequest);
      socket.off('friend_request_update', handleFriendRequestUpdate);
      socket.off('friend_status_change', handleStatusChange);
      socket.off('room_invite', handleRoomInvite);
      socket.off('refresh_friends', handleRefreshFriends);
    };
  }, [token, addIncomingRequest, updateOnlineStatus, fetchFriends, fetchFriendRequests, showToast, navigate]);

  return null; // This component doesn't render anything
};

export default SocketManager;
