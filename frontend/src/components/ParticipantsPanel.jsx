import React from 'react';
import { motion } from 'framer-motion';
import socket from '../services/socket';
import { getAvatarUrl } from "../utils/avatar";

const ParticipantsPanel = ({ roomUsers, room, user, friends, onlineStatus, showToast }) => {
  const creatorId = room?.createdBy?._id || room?.createdBy;

  return (
    <div className="w-full h-full flex flex-col md:flex-row min-h-0 bg-gray-50/10 overflow-hidden divide-y md:divide-y-0 md:divide-x divide-gray-100">
      
      {/* Left Column: Active Members in Call */}
      <div className="flex-1 p-8 flex flex-col min-h-0 overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between mb-8 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-gray-900 uppercase tracking-tight">Active Collaborators</h3>
            <p className="text-xs font-semibold text-gray-400 mt-1">Users currently connected to this workspace</p>
          </div>
          <span className="px-4 py-1.5 bg-purple-50 text-[#8b5cf6] text-xs font-black rounded-full shadow-sm">
            {roomUsers.length > 0 ? roomUsers.length : 1} Connected
          </span>
        </div>

        <div className="space-y-4 flex-1">
          {roomUsers.length > 0 ? roomUsers.map((p, idx) => {
            const isMe = p.userId === user?._id;
            const isHost = p.userId === creatorId;
            
            return (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center justify-between p-5 rounded-[2rem] border transition-all ${
                  isMe 
                    ? 'bg-purple-50/30 border-purple-100 shadow-sm' 
                    : 'bg-white border-gray-100/80 hover:border-purple-100/50 hover:shadow-md hover:shadow-purple-50/10'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base shadow-sm relative overflow-hidden ${
                      isMe ? 'bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {p.avatar ? (
                        <img src={getAvatarUrl(p.avatar)} alt="" className="w-full h-full object-cover" />
                      ) : (
                        p.userName?.charAt(0).toUpperCase() || "U"
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-gray-900 flex items-center gap-2">
                      {p.userName}
                      {isMe && <span className="text-[10px] font-bold text-[#8b5cf6] bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">(YOU)</span>}
                    </h4>
                    <p className="text-[10px] font-semibold text-gray-400 mt-1 uppercase tracking-wider">Connected Live</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {isHost ? (
                    <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[9px] font-black uppercase tracking-widest rounded-xl shadow-md shadow-purple-200">
                      Host
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-gray-50 text-gray-500 border border-gray-100 text-[9px] font-black uppercase tracking-widest rounded-xl">
                      Participant
                    </span>
                  )}
                </div>
              </motion.div>
            );
          }) : (
            <div className="flex items-center justify-between p-5 rounded-[2rem] bg-purple-50/30 border border-purple-100 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] text-white flex items-center justify-center font-black text-base shadow-sm">
                    {user?.avatar ? (
                      <img src={getAvatarUrl(user.avatar)} alt="" className="w-full h-full object-cover rounded-2xl" />
                    ) : (
                      user?.name?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
                </div>
                <div>
                  <h4 className="text-sm font-black text-gray-900">{user?.displayName || user?.name} (You)</h4>
                  <p className="text-[10px] font-semibold text-gray-400 mt-1 uppercase tracking-wider">Connected Live</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[9px] font-black uppercase tracking-widest rounded-xl shadow-md shadow-purple-200">
                Host
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Invite Panel */}
      <div className="w-full md:w-80 p-8 flex flex-col min-h-0 bg-gray-50/20 overflow-y-auto custom-scrollbar">
        <div className="mb-8 shrink-0">
          <h3 className="text-xl font-bold text-gray-900 uppercase tracking-tight">Invite Coworkers</h3>
          <p className="text-xs font-semibold text-gray-400 mt-1">Bring your team members into the room</p>
        </div>

        {/* Room Code Showcase */}
        <div className="p-5 rounded-[2rem] bg-white border border-gray-100 shadow-sm flex flex-col gap-3 mb-6 shrink-0">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Share Invite Code</span>
          <div className="flex items-center justify-between gap-3 bg-gray-50 px-4 py-3 rounded-2xl border border-gray-100">
            <span className="font-extrabold text-sm text-[#8b5cf6] tracking-widest uppercase">{room?.roomCode}</span>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(room?.roomCode);
                showToast('Invite code copied to clipboard!', 'success');
              }}
              className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-purple-50 hover:text-[#8b5cf6] transition-all shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            </button>
          </div>
        </div>

        {/* Friends Invite List */}
        <div className="flex-1 flex flex-col min-h-0">
          <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 shrink-0">Your Friends List</h4>
          
          <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-1">
            {friends.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-xs font-bold text-gray-400">You don't have any friends yet.</p>
              </div>
            ) : (
              friends.map(friend => {
                const isOnline = onlineStatus[friend._id] === 'online';
                return (
                  <div key={friend._id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:border-purple-100/50 transition-all shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center overflow-hidden border border-purple-100">
                          {friend.avatar ? (
                            <img src={getAvatarUrl(friend.avatar)} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-bold text-[#8b5cf6] text-sm">{(friend.displayName || friend.name)?.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        {isOnline && <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>}
                      </div>
                      <div>
                        <p className="text-xs font-black text-gray-900 truncate max-w-[100px]">{friend.displayName || friend.name}</p>
                        <p className={`text-[8px] font-bold uppercase tracking-widest ${isOnline ? 'text-green-500' : 'text-gray-400'} mt-0.5`}>
                          {isOnline ? 'Online' : 'Offline'}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        socket.emit('send_room_invite', { friendId: friend._id, roomId: room?._id || room?.id, roomName: room?.name });
                        showToast(`Invite sent to ${friend.displayName || friend.name}`, 'success');
                      }}
                      className="px-3 py-2 bg-purple-50 hover:bg-[#8b5cf6] text-[#8b5cf6] hover:text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-sm shadow-purple-50"
                    >
                      Invite
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticipantsPanel;
