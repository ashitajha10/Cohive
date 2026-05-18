import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import { useToast } from '../context/ToastContext';
import Layout from '../components/Layout';
import Loader from '../components/Loader';

const MyRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joinCode, setJoinCode] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  
  const { user } = useAuthStore();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const fetchRooms = async () => {
    try {
      const res = await api.get('/rooms');
      setRooms(res.data);
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
      showToast('Failed to load rooms', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    setIsCreating(true);
    try {
      const res = await api.post('/rooms', { name: newRoomName.trim() });
      showToast(`Room created successfully!`, 'success');
      navigate(`/room/${res.data._id}`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create room', 'error');
    } finally {
      setIsCreating(false);
      setNewRoomName('');
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setIsJoining(true);
    try {
      const res = await api.post('/rooms/join', { code: joinCode.trim() });
      showToast(`Joined room successfully!`, 'success');
      navigate(`/room/${res.data._id}`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Invalid room code', 'error');
    } finally {
      setIsJoining(false);
      setJoinCode('');
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm("Are you sure you want to delete this room? This action cannot be undone.")) return;
    try {
      await api.delete(`/rooms/${roomId}`);
      showToast('Room deleted', 'success');
      setRooms(rooms.filter(r => r._id !== roomId));
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete room', 'error');
    }
  };

  const handleLeaveRoom = async (roomId) => {
    if (!window.confirm("Are you sure you want to leave this room?")) return;
    try {
      await api.post(`/rooms/${roomId}/leave`);
      showToast('Left room successfully', 'success');
      setRooms(rooms.filter(r => r._id !== roomId));
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to leave room', 'error');
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-10 animate-fade-in pb-20">
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-2">My Rooms</h1>
            <p className="text-gray-400 text-sm font-medium">Create, join, and manage your collaborative spaces.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar Actions */}
          <div className="lg:col-span-4 space-y-8">
            {/* Create Room */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Create Room</h2>
              <form onSubmit={handleCreateRoom} className="space-y-4">
                <input
                  type="text"
                  placeholder="Room Name"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:border-[#8b5cf6]/30 focus:bg-white focus:shadow-sm transition-all outline-none"
                  required
                />
                <button
                  type="submit"
                  disabled={isCreating || !newRoomName.trim()}
                  className="w-full py-4 bg-[#8b5cf6] text-white rounded-2xl font-bold text-sm uppercase tracking-widest shadow-sm hover:bg-[#7c3aed] transition-all disabled:opacity-50"
                >
                  {isCreating ? "Creating..." : "Create Room"}
                </button>
              </form>
            </div>

            {/* Join Room */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Join via Code</h2>
              <form onSubmit={handleJoinRoom} className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter Room Code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:border-[#8b5cf6]/30 focus:bg-white focus:shadow-sm transition-all outline-none uppercase"
                  required
                />
                <button
                  type="submit"
                  disabled={isJoining || !joinCode.trim()}
                  className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-sm uppercase tracking-widest shadow-sm hover:bg-gray-800 transition-all disabled:opacity-50"
                >
                  {isJoining ? "Joining..." : "Join Room"}
                </button>
              </form>
            </div>
          </div>

          {/* Rooms Grid */}
          <div className="lg:col-span-8">
            <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm min-h-[500px]">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-8">Active Workspaces</h2>
              
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader size="xl" />
                </div>
              ) : rooms.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-gray-100 rounded-[2rem]">
                  <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-purple-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Rooms Found</h3>
                  <p className="text-gray-400 text-sm font-medium">Create a new room or join one using a code.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <AnimatePresence>
                    {rooms.map((room) => {
                      const isOwner = room.createdBy === user?._id;
                      return (
                        <motion.div
                          key={room._id}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="group relative bg-gray-50 border border-gray-100 p-6 rounded-[2rem] hover:border-purple-200 hover:shadow-sm transition-all"
                        >
                          <div className="mb-4">
                            <h3 className="text-xl font-bold text-gray-900 truncate mb-1">{room.name}</h3>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-200/50 px-2 py-1 rounded-lg inline-block">
                                Code: <span className="text-gray-700">{room.roomCode}</span>
                              </span>
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                {room.members.length}
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <button
                              onClick={() => navigate(`/room/${room._id}`)}
                              className="flex-1 py-3 bg-[#8b5cf6] text-white rounded-xl text-xs font-bold hover:bg-[#7c3aed] transition-all shadow-sm"
                            >
                              Enter Room
                            </button>
                            {isOwner ? (
                              <button
                                onClick={() => handleDeleteRoom(room._id)}
                                className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-all"
                                title="Delete Room"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleLeaveRoom(room._id)}
                                className="p-3 bg-orange-50 text-orange-500 rounded-xl hover:bg-orange-100 transition-all"
                                title="Leave Room"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                              </button>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MyRooms;
