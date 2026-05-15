import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import socket from "../services/socket";
import api from "../services/api";
import Layout from "../components/Layout";
import { useWebRTC } from "../hooks/useWebRTC";
import Card from "../components/Card";
import Button from "../components/Button";
import Loader from "../components/Loader";
import useAuthStore from "../store/authStore";

// Modular Components
import ChatPanel from "../components/ChatPanel";
import VideoPanel from "../components/VideoPanel";
import ParticipantSidebar from "../components/ParticipantSidebar";
import ResourcesPanel from "../components/ResourcesPanel";
import NotesPanel from "../components/NotesPanel";
import WhiteboardPanel from "../components/WhiteboardPanel";

import { useToast } from "../context/ToastContext";

function Room() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { showToast } = useToast();

  // Room State
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState('video');
  
  // Chat & Activity State
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUser, setTypingUser] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  
  // Media & WebRTC
  const { 
    participants, 
    localStream, 
    mediaError, 
    isScreenSharing, 
    toggleMute: toggleMuteRTC, 
    toggleCamera: toggleCameraRTC, 
    shareScreen, 
    stopScreenShare 
  } = useWebRTC(id, user);

  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);

  // UI State
  const [isDeleting, setIsDeleting] = useState(false);
  const [copySuccess, setCopySuccess] = useState("");
  const [theaterMode, setTheaterMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Refs
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const roomRef = useRef(null);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      roomRef.current.requestFullscreen().catch(err => {
        showToast(`Fullscreen failed: ${err.message}`, "error");
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(type);
      showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} copied to clipboard!`, "success");
      setTimeout(() => setCopySuccess(""), 3000);
    });
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    socket.emit("send_message", { roomId: id, message: message.trim(), type: "text" });
    setMessage("");
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    setIsUploading(true);
    try {
      const res = await api.post("/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
      socket.emit("send_message", { roomId: id, file: res.data.url, type: "file" });
    } catch (err) {
      showToast("Upload failed: Connection error", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const toggleMute = () => {
    const newState = toggleMuteRTC();
    setMuted(newState);
  };

  const toggleCamera = () => {
    const newState = toggleCameraRTC();
    setCameraOff(newState);
  };

  const handleToggleScreenShare = async () => {
    if (!isScreenSharing) {
      await shareScreen();
    } else {
      stopScreenShare();
    }
  };

  const handleLeaveRoom = async () => {
    try {
      await api.post(`/rooms/${id}/leave`);
      navigate("/dashboard");
    } catch (err) { showToast("Failed to leave room", "error"); }
  };

  const handleDeleteRoom = async () => {
    if (!window.confirm("Are you sure you want to delete this room?")) return;
    setIsDeleting(true);
    try {
      await api.delete(`/rooms/${id}`);
      navigate("/dashboard");
    } catch (err) { showToast("Failed to delete room", "error"); } finally { setIsDeleting(false); }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomRes, msgRes] = await Promise.all([ api.get(`/rooms/${id}`), api.get(`/messages/${id}/messages`) ]);
        setRoom(roomRes.data);
        setMessages(msgRes.data);
      } catch (err) { setError(true); } finally { setLoading(false); }
    };
    if (id) fetchData();
  }, [id]);

  useEffect(() => {
    if (!id || !user) return;
    socket.emit("join_room", { roomId: id });
    
    const handleMessage = (data) => setMessages((prev) => [...prev, data]);
    const handleUsers = (users) => setOnlineUsers(users);
    const handleTyping = (name) => {
      setTypingUser(name);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setTypingUser(""), 2000);
    };
    const handleSystemMessage = (data) => setMessages((prev) => [...prev, { ...data, _id: `sys-${Date.now()}`, createdAt: new Date() }]);

    socket.on("receive_message", handleMessage);
    socket.on("room_users", handleUsers);
    socket.on("user_typing", handleTyping);
    socket.on("system_message", handleSystemMessage);

    return () => {
      socket.off("receive_message", handleMessage);
      socket.off("room_users", handleUsers);
      socket.off("user_typing", handleTyping);
      socket.off("system_message", handleSystemMessage);
      socket.emit("leave_room", id);
    };
  }, [id, user]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  if (loading) return <Layout><div className="flex items-center justify-center h-full"><Loader size="xl" /></div></Layout>;
  if (!room || error) return <Layout><div className="max-w-md mx-auto mt-20 text-center glass-panel p-10 rounded-[3rem]"><h2 className="text-2xl font-black text-white  uppercase  mb-6">{error ? "Connection Lost" : "Room Not Found"}</h2><Button className="w-full" onClick={() => navigate("/dashboard")}>Back to Dashboard</Button></div></Layout>;

  return (
    <Layout>
      <div ref={roomRef} className={`flex flex-col gap-6 h-full relative ${isFullscreen ? 'p-8 bg-[#050608]' : ''}`}>
        {/* Cinematic Header Overlay */}
        {!isFullscreen && (
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyber-cyan/5 via-transparent to-cyber-pink/5 rounded-[3rem] blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6 glass-panel p-8 rounded-[3rem] border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] overflow-hidden">
              <div className="flex items-center gap-6 relative z-10">
                <motion.div 
                  whileHover={{ rotate: 180, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className="w-14 h-14 bg-gradient-to-br from-cyber-cyan to-[#0a0b0d] rounded-2xl flex items-center justify-center text-black font-black text-2xl shadow-glow-cyan border border-white/20"
                >
                  {room.name.charAt(0).toUpperCase()}
                </motion.div>
                <div>
                  <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-black text-white tracking-tighter uppercase glow-text-cyan">{room.name}</h1>
                    <div className="flex items-center gap-2.5 px-3 py-1 bg-cyber-cyan/10 rounded-full border border-cyber-cyan/20 backdrop-blur-xl">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute h-full w-full rounded-full bg-cyber-cyan opacity-75"></span>
                        <span className="relative rounded-full h-2 w-2 bg-cyber-cyan"></span>
                      </span>
                      <span className="text-[9px] font-black text-cyber-cyan uppercase tracking-widest">{onlineUsers.length} ONLINE</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-[0.4em]">ROOM ID: {room.roomCode}</span>
                    <div className="w-1 h-1 rounded-full bg-gray-800" />
                    <span className="text-[9px] font-black text-cyber-cyan uppercase tracking-[0.4em]">ENCRYPTED STATUS: ACTIVE</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 relative z-10">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => copyToClipboard(`${window.location.origin}/join/${room?.roomCode}`, 'link')}
                  className="px-5 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white font-black text-[9px] uppercase tracking-widest hover:bg-white/[0.06] hover:border-white/20 transition-all flex items-center gap-2"
                >
                  <svg className="w-4 h-4 text-cyber-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                  Invite
                </motion.button>

                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => copyToClipboard(room?.roomCode, 'code')}
                  className="px-5 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white font-black text-[9px] uppercase tracking-widest hover:bg-white/[0.06] hover:border-white/20 transition-all flex items-center gap-2"
                >
                  <svg className="w-4 h-4 text-cyber-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  CODE: {room.roomCode}
                </motion.button>
                
                <div className="w-px h-8 bg-white/10 mx-1 hidden lg:block"></div>

                {(room?.createdBy?._id || room?.createdBy) === user?._id && (
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDeleteRoom}
                    disabled={isDeleting}
                    className="px-5 py-3 rounded-xl bg-cyber-pink/5 border border-cyber-pink/10 text-cyber-pink font-black text-[9px] uppercase tracking-widest hover:bg-cyber-pink/10 transition-all flex items-center gap-2"
                  >
                    {isDeleting ? "DELETING..." : "DELETE ROOM"}
                  </motion.button>
                )}

                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/profile')}
                  className="px-5 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white font-black text-[9px] uppercase tracking-widest hover:bg-white/[0.06] hover:border-white/20 transition-all flex items-center gap-2"
                >
                  <svg className="w-4 h-4 text-cyber-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  </svg>
                  Settings
                </motion.button>

                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLeaveRoom}
                  className="px-5 py-3 rounded-xl bg-red-500/5 border border-red-500/10 text-red-400 font-black text-[9px] uppercase tracking-widest hover:bg-red-500/10 transition-all flex items-center gap-2"
                >
                  EXIT
                </motion.button>
              </div>

              
              <div className="absolute left-0 top-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyber-cyan/40 to-transparent"></div>
            </div>
          </motion.div>
        )}

        {/* Main Content Area */}
        <div className="flex flex-1 gap-8 min-h-0 relative">
          <div className="flex-[3] flex flex-col gap-6 min-w-0">
            {/* Holographic Tabs */}
            <div className="flex items-center justify-between">
              <div className="flex bg-white/[0.03] p-1.5 rounded-2xl border border-white/10 backdrop-blur-2xl">
                {['video', 'notes', 'resources', 'whiteboard'].map((tab) => (
                  <button 
                    key={tab} 
                    onClick={() => setActiveTab(tab)} 
                    className={`px-8 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2.5 relative ${
                      activeTab === tab 
                        ? 'bg-cyber-cyan text-black shadow-glow-cyan' 
                        : 'text-gray-500 hover:text-gray-200'
                    }`}
                  >
                    {tab === 'video' && <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>}
                    {tab === 'notes' && <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                    {tab === 'resources' && <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>}
                    {tab === 'whiteboard' && <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                    <span>{tab}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Panel View with Cinematic Transitions */}
            <div className="flex-1 min-h-0 flex flex-col relative rounded-[3rem] overflow-hidden glass-panel border-white/5 shadow-2xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="w-full h-full"
                >
                  {activeTab === 'video' ? (
                    <VideoPanel 
                      localStream={localStream} 
                      participants={participants} 
                      mediaError={mediaError} 
                      user={user} 
                      isMuted={muted}
                      isCameraOff={cameraOff}
                      isScreenSharing={isScreenSharing}
                    />
                  ) : activeTab === 'resources' ? (
                    <ResourcesPanel roomId={id} user={user} room={room} />
                  ) : activeTab === 'notes' ? (
                    <NotesPanel roomId={id} user={user} room={room} />
                  ) : (
                    <WhiteboardPanel roomId={id} user={user} room={room} />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Action Dock */}
            <div className="flex items-center justify-center gap-4 bg-white/[0.03] border border-white/10 backdrop-blur-xl p-2 rounded-2xl w-fit mx-auto shadow-2xl">
              <motion.button 
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleMute} 
                title="Toggle Mute"
                className={`group flex flex-col items-center justify-center gap-1 w-16 py-3 rounded-xl transition-all ${muted ? 'text-cyber-pink bg-cyber-pink/10 border border-cyber-pink/20' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}`}
              >
                {muted ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4l16 16" /></svg> : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>}
                <span className="text-[7px] font-black uppercase tracking-widest">Mute</span>
              </motion.button>
              
              <motion.button 
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleCamera} 
                title="Toggle Camera"
                className={`group flex flex-col items-center justify-center gap-1 w-16 py-3 rounded-xl transition-all ${cameraOff ? 'text-cyber-pink bg-cyber-pink/10 border border-cyber-pink/20' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}`}
              >
                {cameraOff ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4l16 16" /></svg> : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>}
                <span className="text-[7px] font-black uppercase tracking-widest">Cam</span>
              </motion.button>
              
              <motion.button 
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleToggleScreenShare} 
                title="Share Screen"
                className={`group flex flex-col items-center justify-center gap-1 w-16 py-3 rounded-xl transition-all ${isScreenSharing ? 'text-cyber-cyan bg-cyber-cyan/10 border border-cyber-cyan/20' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <span className="text-[7px] font-black uppercase tracking-widest">Cast</span>
              </motion.button>
              
              <div className="w-px h-8 bg-white/10 mx-1"></div>

              <motion.button 
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTheaterMode(!theaterMode)} 
                title="Theater Mode"
                className={`group flex flex-col items-center justify-center gap-1 w-16 py-3 rounded-xl transition-all ${theaterMode ? 'text-cyber-cyan bg-cyber-cyan/10 border border-cyber-cyan/20' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
                <span className="text-[7px] font-black uppercase tracking-widest">Theater</span>
              </motion.button>

              <motion.button 
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleFullscreen} 
                title="Fullscreen"
                className={`group flex flex-col items-center justify-center gap-1 w-16 py-3 rounded-xl transition-all ${isFullscreen ? 'text-cyber-cyan bg-cyber-cyan/10 border border-cyber-cyan/20' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}`}
              >
                {isFullscreen ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 9L4 4m0 0l5 0M4 4l0 5m11-5l5 5m0-5l-5 0m5 0l0 5m-5 11l5-5m0 5l-5 0m5 0l0-5m-11 5l-5-5m0 5l5 0m-5 0l0-5" /></svg> : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>}
                <span className="text-[7px] font-black uppercase tracking-widest">Full</span>
              </motion.button>
              
              <div className="w-px h-8 bg-white/10 mx-1"></div>
              
              <motion.button 
                whileHover={{ y: -2, backgroundColor: 'rgba(239, 68, 68, 0.2)' }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLeaveRoom} 
                className="group flex flex-col items-center justify-center gap-1 w-16 py-3 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                <span className="text-[7px] font-black uppercase tracking-widest">End</span>
              </motion.button>
            </div>
          </div>

          {/* Right Sidebar Area */}
          <AnimatePresence>
            {!theaterMode && (
              <motion.div 
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 450, opacity: 0 }}
                transition={{ duration: 0.5, ease: "anticipate" }}
                className="flex-1 hidden xl:flex flex-col gap-6 min-w-[400px] max-w-[450px]"
              >
                <ParticipantSidebar room={room} onlineUsers={onlineUsers} user={user} />
                <ChatPanel 
                  messages={messages} user={user} message={message} setMessage={setMessage} 
                  sendMessage={sendMessage} typingUser={typingUser} isUploading={isUploading} 
                  handleFileUpload={handleFileUpload} messagesEndRef={messagesEndRef} roomId={id}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}


export default Room;