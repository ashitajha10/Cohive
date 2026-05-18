import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useFriendStore from '../store/friendStore';
import { getAvatarUrl } from '../utils/avatar';
import socket from '../services/socket';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';

const FriendList = ({ searchQuery = "" }) => {
  const { friends, onlineStatus, removeFriend } = useFriendStore();
  const [confirmDelete, setConfirmDelete] = useState(null);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleRemoveFriend = async (friendId) => {
    const res = await removeFriend(friendId);
    if (res.success) {
      showToast('Friend removed', "success");
      setConfirmDelete(null);
    } else {
      showToast(res.error, 'error');
    }
  };

  const handleInviteToRoom = (friendId, friendName) => {
    const match = window.location.pathname.match(/\/room\/([a-zA-Z0-9]+)/);
    if (match) {
      const roomId = match[1];
      socket.emit('send_room_invite', { friendId, roomId, roomName: 'Current Session' });
      showToast(`Invite sent to ${friendName}`, "success");
    } else {
      showToast('Join a room first to invite friends!', 'info');
    }
  };

  const filteredFriends = friends.filter(f => 
    (f.displayName || f.name).toLowerCase().includes(searchQuery.toLowerCase()) ||
    (f.username || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (friends.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="py-24 text-center bg-white rounded-[3rem] border border-dashed border-gray-200"
      >
        <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-purple-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Friends Yet</h3>
        <p className="text-gray-400 text-sm font-medium">Use the Find Users tab to start connecting.</p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AnimatePresence mode="popLayout">
        {filteredFriends.map((friend) => {
          const isOnline = onlineStatus[friend._id] === 'online';
          return (
            <motion.div
              key={friend._id}
              layout
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              whileHover={{ y: -4 }}
              className="group relative bg-white p-6 border border-gray-100 rounded-[2.5rem] shadow-sm hover:shadow-md hover:border-purple-100 transition-all duration-300"
            >
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div className={`w-24 h-24 rounded-full border-4 p-1 transition-all duration-300 ${isOnline ? 'border-green-100' : 'border-gray-50'}`}>
                    <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 flex items-center justify-center font-bold text-3xl text-gray-400">
                      {friend.avatar ? (
                        <img src={getAvatarUrl(friend.avatar)} alt="" className="w-full h-full object-cover" />
                      ) : (
                        (friend.displayName || friend.name)?.charAt(0).toUpperCase()
                      )}
                    </div>
                  </div>
                  {isOnline && (
                    <div className="absolute bottom-1 right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center border-2 border-white">
                      <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-1 truncate w-full">
                  {friend.nickname || friend.displayName || friend.name}
                </h3>
                {friend.nickname && (
                  <p className="text-xs font-bold text-gray-400 mb-1 truncate w-full">
                    {friend.displayName || friend.name}
                  </p>
                )}
                <p className={`text-[10px] font-bold uppercase tracking-widest mb-6 ${isOnline ? 'text-green-500' : 'text-gray-400'}`}>
                  {isOnline ? 'Online' : 'Offline'}
                </p>

                <div className="flex items-center gap-3 w-full">
                  <button 
                    className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${isOnline ? 'bg-[#8b5cf6] text-white hover:bg-[#7c3aed] shadow-sm' : 'bg-gray-50 text-gray-600 border border-gray-100 hover:bg-gray-100'}`}
                    onClick={() => handleInviteToRoom(friend._id, friend.displayName || friend.name)}
                  >
                    Invite
                  </button>
                  <button 
                    onClick={() => setConfirmDelete(friend._id)}
                    className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-all active:scale-95"
                    title="Remove Friend"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>

              {/* Confirm Delete Overlay */}
              <AnimatePresence>
                {confirmDelete === friend._id && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-white/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-6 text-center rounded-[2.5rem]"
                  >
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-500 mb-4">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 mb-2">Remove Friend?</h4>
                    <p className="text-xs text-gray-500 mb-6">Are you sure you want to remove {friend.name}?</p>
                    <div className="flex gap-3 w-full">
                      <button className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-200 transition-all" onClick={() => setConfirmDelete(null)}>Cancel</button>
                      <button className="flex-1 py-2 bg-red-600 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-red-700 transition-all" onClick={() => handleRemoveFriend(friend._id)}>Confirm</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default FriendList;
