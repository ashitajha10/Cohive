import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from './Card';
import { getAvatarUrl } from "../utils/avatar";
import useFriendStore from '../store/friendStore';
import socket from '../services/socket';
import { useToast } from '../context/ToastContext';

const ParticipantSidebar = ({ room, onlineUsers, user }) => {
  const { friends, onlineStatus, fetchFriends } = useFriendStore();
  const { showToast } = useToast();

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  const handleInviteToRoom = (friendId, friendName) => {
    socket.emit('send_room_invite', { friendId, roomId: room._id, roomName: room.name });
    showToast(`Transmission sent to ${friendName}`, "success");
  };

  const onlineFriends = friends.filter(f => onlineStatus[f._id] === 'online');

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, x: 20 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <div className="flex-[1.2] flex flex-col min-h-0 glass-panel rounded-[2.5rem] border-white/10 relative overflow-hidden bg-[#050608]/40 shadow-2xl">
      {/* Sidebar Header */}
      <div className="px-8 py-5 border-b border-white/5 bg-white/[0.02] backdrop-blur-xl">
        <h3 className="text-[10px] font-black text-cyber-cyan uppercase tracking-[0.4em] flex items-center gap-2.5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          Crew Manifest.02
        </h3>
        <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mt-1">Synchronization Registry</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
        {/* Active Members */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Active Members</span>
            <span className="text-[9px] font-black text-cyber-cyan bg-cyber-cyan/10 px-2 py-0.5 rounded-md border border-cyber-cyan/20">
              {room.members?.length || 0} SECURED
            </span>
          </div>
          
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {room.members?.map((member, index) => {
              if (!member) return null;
              const isMemberObject = typeof member !== 'string';
              const memberName = isMemberObject ? (member.nickname || member.displayName || member.name) : member;
              const memberId = isMemberObject ? member._id : member;
              const memberAvatar = isMemberObject ? member.avatar : null;
              const isOnline = onlineUsers.some(u => u.userId?.toString() === memberId?.toString());
              const adminId = room?.createdBy?._id || room?.createdBy;
              const isAdmin = adminId?.toString() === memberId?.toString();

              return (
                <motion.div 
                  key={memberId || index}
                  variants={item}
                  className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-300 relative overflow-hidden group ${
                    isOnline ? 'bg-white/[0.03] border border-white/5 hover:border-cyber-cyan/20' : 'opacity-40 grayscale-[0.5]'
                  }`}
                >
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="relative">
                      <div className={`w-11 h-11 rounded-2xl overflow-hidden border flex items-center justify-center transition-all ${
                        isOnline ? "border-cyber-cyan shadow-glow-cyan" : "border-white/10"
                      }`}>
                        {memberAvatar ? (
                          <img src={getAvatarUrl(memberAvatar)} alt={memberName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-[#0a0b0d] flex items-center justify-center text-white font-black text-lg">
                            {memberName?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      {isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-cyber-cyan rounded-full border-2 border-[#050608] animate-pulse shadow-glow-cyan" />
                      )}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <p className={`text-xs font-black tracking-tight uppercase ${isOnline ? "text-white" : "text-gray-500"}`}>{memberName}</p>
                        {isAdmin && (
                          <span className="px-1.5 py-0.5 bg-cyber-cyan/5 text-cyber-cyan text-[7px] font-black uppercase rounded-md border border-cyber-cyan/20 tracking-tighter">HOST</span>
                        )}
                      </div>
                      <p className={`text-[8px] font-black uppercase tracking-widest mt-0.5 ${isOnline ? "text-cyber-cyan" : "text-gray-700"}`}>
                        {isOnline ? "CONNECTED" : "OFFLINE"}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Available Friends */}
        {onlineFriends.length > 0 && (
          <div className="space-y-6 pt-6 border-t border-white/5">
            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest px-2">Available for Sync</span>
            <div className="space-y-4">
              {onlineFriends.map(friend => {
                const isAlreadyInRoom = room.members?.some(m => {
                  const mId = typeof m === 'string' ? m : m._id;
                  return mId?.toString() === friend._id?.toString();
                });

                if (isAlreadyInRoom) return null;

                return (
                  <motion.div 
                    key={friend._id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ x: 5 }}
                    className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 group hover:border-cyber-cyan/30 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-cyber-cyan/30 shadow-glow-cyan flex items-center justify-center font-black">
                          {friend.avatar ? (
                            <img src={getAvatarUrl(friend.avatar)} alt={friend.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-[#0a0b0d] flex items-center justify-center text-white">
                              {(friend.nickname || friend.displayName || friend.name)?.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-cyber-cyan rounded-full border-2 border-[#050608] animate-pulse" />
                      </div>
                      
                      <div>
                        <p className="text-[11px] font-black text-white uppercase tracking-tight">{friend.nickname || friend.displayName || friend.name}</p>
                        <p className="text-[7px] font-black text-cyber-cyan uppercase tracking-[0.2em] mt-0.5">SIGNAL ACTIVE</p>
                      </div>
                    </div>
                    
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleInviteToRoom(friend._id, friend.nickname || friend.displayName || friend.name)}
                      className="p-2.5 bg-cyber-cyan text-black rounded-xl transition-all shadow-glow-cyan hover:bg-white"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                    </motion.button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Decorative Bottom */}
      <div className="px-8 py-6 bg-white/[0.02] border-t border-white/5 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-1 h-1 rounded-full bg-gray-700" />
          <div className="w-1 h-1 rounded-full bg-gray-700" />
          <div className="w-1 h-1 rounded-full bg-gray-700" />
        </div>
      </div>
    </div>
  );
};

export default ParticipantSidebar;
