import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useFriendStore from '../store/friendStore';
import { getAvatarUrl } from '../utils/avatar';
import Button from './Button';
import Card from './Card';
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
      socket.emit('send_room_invite', { friendId, roomId, roomName: 'Current Mission' });
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
        className="py-24 text-center glass-panel rounded-[4rem] border-dashed border-white/10"
      >
        <img src="/space_mascot_astronaut_1778492786001.png" className="w-40 h-40 mx-auto mb-10 opacity-20 animate-float" alt="empty" />
        <h3 className="text-3xl font-black text-white mb-4  uppercase  glow-text-pink">No Friends Yet</h3>
        <p className="text-cyber-cyan/50 font-black uppercase tracking-[0.3em] text-[10px] ">Your friend list is currently empty.</p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
      <AnimatePresence mode="popLayout">
        {filteredFriends.map((friend) => {
          const isOnline = onlineStatus[friend._id] === 'online';
          return (
            <motion.div
              key={friend._id}
              layout
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              whileHover={{ y: -10 }}
              className="group relative"
            >
              <Card className="p-8 border-white/5 bg-cyber-grey-800/60 backdrop-blur-3xl hover:border-cyber-cyan/40 hover:shadow-glow-cyan transition-all duration-500 rounded-[3.5rem] relative overflow-hidden h-full">
                {/* Glow Effect */}
                <div className={`absolute -top-16 -right-16 w-48 h-48 blur-[80px] opacity-10 transition-all duration-700 ${isOnline ? 'bg-cyber-cyan group-hover:opacity-20' : 'bg-gray-500 group-hover:opacity-15'}`}></div>
                
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-8">
                    <motion.div 
                      animate={isOnline ? { 
                        boxShadow: ["0 0 20px rgba(34, 197, 94, 0.2)", "0 0 40px rgba(34, 197, 94, 0.4)", "0 0 20px rgba(34, 197, 94, 0.2)"] 
                      } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                      className={`w-28 h-28 rounded-[2.5rem] border-4 p-1.5 transition-all duration-500 ${isOnline ? 'border-green-500 shadow-glow-cyan' : 'border-white/10 grayscale'}`}
                    >
                      <div className="w-full h-full rounded-[2rem] overflow-hidden bg-cyber-grey-900 flex items-center justify-center  font-black text-4xl  text-white border border-white/10">
                        {friend.avatar ? (
                          <img src={getAvatarUrl(friend.avatar)} alt="" className="w-full h-full object-cover" />
                        ) : (
                          (friend.displayName || friend.name)?.charAt(0).toUpperCase()
                        )}
                      </div>
                    </motion.div>
                    {isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#0b0a24] rounded-full flex items-center justify-center border border-white/10">
                        <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse shadow-glow-cyan"></div>
                      </div>
                    )}
                  </div>

                  <h3 className="text-2xl font-black text-white mb-2  uppercase  tracking-tighter group-hover:text-cyber-cyan transition-colors">
                    {friend.nickname || friend.displayName || friend.name}
                  </h3>
                  {friend.nickname && (
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                      {friend.displayName || friend.name}
                    </p>
                  )}
                  <p className={`text-[10px] font-black uppercase tracking-[0.4em] mb-10  ${isOnline ? 'text-cyber-cyan' : 'text-gray-500'}`}>
                    {isOnline ? 'Online' : 'Offline'}
                  </p>

                  <div className="flex items-center gap-4 w-full">
                    <Button 
                      variant={isOnline ? "primary" : "outline"}
                      className="flex-1 py-4 text-[10px] font-black  "
                      onClick={() => handleInviteToRoom(friend._id, friend.displayName || friend.name)}
                    >
                      Invite
                    </Button>
                    <button 
                      onClick={() => setConfirmDelete(friend._id)}
                      className="p-4 bg-white/5 border border-white/10 rounded-2xl text-gray-500 hover:text-cyber-pink hover:border-cyber-pink/30 hover:bg-cyber-pink/10 transition-all active:scale-90"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>

                {/* Confirm Delete Overlay */}
                <AnimatePresence>
                  {confirmDelete === friend._id && (
                    <motion.div 
                      initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                      animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
                      exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                      className="absolute inset-0 bg-cyber-grey-900/90 z-20 flex flex-col items-center justify-center p-8 text-center"
                    >
                      <div className="w-16 h-16 rounded-full bg-cyber-pink/20 flex items-center justify-center text-cyber-pink mb-6 border border-cyber-pink/30 shadow-glow-pink">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      </div>
                      <h4 className="text-xl font-black text-white  uppercase  mb-4">Remove Friend?</h4>
                      <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-8">This action will remove your connection with {friend.name}.</p>
                      <div className="flex gap-4 w-full">
                        <Button variant="outline" className="flex-1 py-3" onClick={() => setConfirmDelete(null)}>Cancel</Button>
                        <Button variant="danger" className="flex-1 py-3" onClick={() => handleRemoveFriend(friend._id)}>Confirm</Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default FriendList;
