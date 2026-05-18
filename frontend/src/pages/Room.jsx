import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import socket from "../services/socket";
import api from "../services/api";
import Layout from "../components/Layout";
import { useWebRTC } from "../hooks/useWebRTC";
import Button from "../components/Button";
import Loader from "../components/Loader";
import useAuthStore from "../store/authStore";
import useFriendStore from "../store/friendStore";
import { useToast } from "../context/ToastContext";
import { getAvatarUrl } from "../utils/avatar";

import ChatPanel from "../components/ChatPanel";
import VideoPanel from "../components/VideoPanel";
import ResourcesPanel from "../components/ResourcesPanel";
import WhiteboardPanel from "../components/WhiteboardPanel";
import ParticipantsPanel from "../components/ParticipantsPanel";

function Room() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { showToast } = useToast();

  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState("video");
  const [isUploading, setIsUploading] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [roomUsers, setRoomUsers] = useState([]);
  const [isRoomJoined, setIsRoomJoined] = useState(false);
  
  const { friends, fetchFriends, onlineStatus } = useFriendStore();
  
  const { 
    participants, 
    localStream, 
    mediaError, 
    isScreenSharing, 
    toggleMute, 
    toggleCamera, 
    shareScreen, 
    stopScreenShare,
    screenStream
  } = useWebRTC(id, user, isRoomJoined);

  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);

  const panelRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!panelRef.current) return;
    
    if (!document.fullscreenElement) {
      panelRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error("Error entering fullscreen:", err);
      });
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      socket.emit("send_message", { roomId: id, message: message.trim() });
      setMessage("");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await api.post("/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
      socket.emit("send_message", { roomId: id, file: res.data.url, type: "file" });
    } catch (err) {
      console.error(err);
      showToast("Upload failed", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleToggleMute = () => {
    const newState = toggleMute();
    setMuted(newState);
  };

  const handleToggleCamera = () => {
    const newState = toggleCamera();
    setCameraOff(newState);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomRes, msgRes] = await Promise.all([ api.get(`/rooms/${id}`), api.get(`/messages/${id}/messages`) ]);
        setRoom(roomRes.data);
        setMessages(msgRes.data);
      } catch (err) { 
        console.error(err);
        setError(true); 
      } finally { 
        setLoading(false); 
      }
    };
    if (id) {
      fetchData();
      fetchFriends();
    }
  }, [id, fetchFriends]);

  useEffect(() => {
    if (!id) return;
    
    socket.emit("join_room", { roomId: id });
    
    socket.on("room_users", (users) => {
      setRoomUsers(users);
      setIsRoomJoined(true);
    });
    
    socket.on("receive_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    socket.on("user_typing", (userName) => {
      setTypingUser(userName);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setTypingUser(null), 3000);
    });
    return () => {
      socket.emit("leave_room", id);
      socket.off("room_users");
      socket.off("receive_message");
      socket.off("user_typing");
      setIsRoomJoined(false);
    };
  }, [id]);

  if (loading) return <Layout><div className="flex items-center justify-center h-full"><Loader size="xl" /></div></Layout>;
  if (error) return <Layout><div className="flex flex-col items-center justify-center h-full gap-4"><h2 className="text-2xl font-bold">Room not found</h2><Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button></div></Layout>;

  return (
    <Layout>
      <div className="flex flex-col h-full gap-8 animate-fade-in">
        
        {/* Room Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate("/dashboard")}
              className="p-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:bg-gray-50 transition-all"
            >
              <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Collaboration Room</h1>
              <p className="text-sm font-bold text-[#8b5cf6] uppercase tracking-widest mt-1">Room ID: {room?.code || id}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="px-6 py-3 bg-purple-50 text-[#8b5cf6] rounded-2xl font-bold text-sm hover:bg-purple-100 transition-all flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              Start Meeting
            </button>
            <button 
              onClick={() => setShowInviteModal(true)}
              className="px-8 py-3 bg-[#8b5cf6] text-white rounded-2xl font-bold text-sm hover:bg-[#7c3aed] transition-all flex items-center gap-2 shadow-lg shadow-purple-200"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
              Invite
            </button>
          </div>
        </header>

        {/* Main Content Matrix */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0">
          
          {/* Main Area (Video / Tools) */}
          <div 
            ref={panelRef}
            id="room-main-area"
            className="lg:col-span-8 flex flex-col gap-8 min-h-0 relative"
          >
            
            {/* Tabs and Controllers Panel */}
            <div className="flex items-center justify-between gap-4 flex-wrap w-full">
              <div className="flex items-center gap-1 p-1 bg-gray-100/50 rounded-2xl w-fit">
                {[
                  { id: 'video', label: 'Video Call', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
                  { id: 'participants', label: 'Participants', icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8M23 21v-2a4 4 0 00-3-3.87m-4-5.13a4 4 0 110-8' },
                  { id: 'resources', label: 'Resources', icon: 'M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
                  { id: 'whiteboard', label: 'Board', icon: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={tab.icon} /></svg>
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Cinema Immersive Fullscreen Button */}
              <button
                onClick={toggleFullscreen}
                className="px-5 py-2.5 bg-white hover:bg-gray-50 active:scale-95 text-gray-700 hover:text-gray-900 border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2 font-bold text-sm"
              >
                {isFullscreen ? (
                  <>
                    <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 9L4 4m0 0l3.5 0M4 4v3.5M15 9l5-5m0 0h-3.5M20 4v3.5M9 15l-5 5m0 0h3.5M4 20v-3.5M15 15l5 5m0 0h-3.5M20 20v-3.5" />
                    </svg>
                    <span>Exit Fullscreen</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                    <span>Fullscreen</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex-1 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden relative">
              {activeTab === 'video' ? (
                <div className="w-full h-full flex flex-col">
                  {localStream || mediaError ? (
                    <VideoPanel 
                      participants={participants} 
                      localStream={localStream} 
                      mediaError={mediaError}
                      user={user} 
                      isMuted={muted}
                      isCameraOff={cameraOff}
                      isScreenSharing={isScreenSharing}
                      createdBy={room?.createdBy}
                      screenStream={screenStream}
                    />
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                      <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                        <svg className="w-10 h-10 text-[#8b5cf6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h2 className="text-xl font-bold text-gray-900 mb-2">Join the video call to see your team.</h2>
                      <p className="text-gray-400 text-sm max-w-xs">Connecting to team audio and video... Please wait or enable media access.</p>
                    </div>
                  )}

                  {/* Room Controls Overlay */}
                  <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6 px-8 py-4 bg-gray-950/90 backdrop-blur-xl rounded-[2rem] border border-white/10 z-20 call-control-panel">
                    <button 
                      onClick={handleToggleMute}
                      className={`p-4 rounded-full transition-all ${muted ? 'bg-red-500 text-white shadow-lg shadow-red-200' : 'bg-white text-gray-900 hover:bg-gray-50'}`}
                      title="Mute/Unmute Mic"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={muted ? "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z M4 4l16 16" : "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"} />
                      </svg>
                    </button>
                    <button 
                      onClick={handleToggleCamera}
                      className={`p-4 rounded-full transition-all ${cameraOff ? 'bg-gray-800 text-white shadow-lg shadow-gray-200' : 'bg-white text-gray-900 hover:bg-gray-50'}`}
                      title="Camera On/Off"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={cameraOff ? "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z M4 4l16 16" : "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"} />
                      </svg>
                    </button>
                    <button 
                      onClick={isScreenSharing ? stopScreenShare : shareScreen}
                      className={`p-4 rounded-full transition-all ${isScreenSharing ? 'bg-[#8b5cf6] text-white shadow-lg shadow-purple-200' : 'bg-white text-gray-900 hover:bg-gray-50'}`}
                      title="Share Screen"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => navigate("/dashboard")}
                      className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30 transition-all hover:scale-105 active:scale-95"
                      title="Leave Room"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : activeTab === 'participants' ? (
                <ParticipantsPanel 
                  roomUsers={roomUsers} 
                  room={room} 
                  user={user} 
                  friends={friends} 
                  onlineStatus={onlineStatus} 
                  showToast={showToast} 
                />
              ) : activeTab === 'resources' ? (
                <ResourcesPanel roomId={id} user={user} room={room} />
              ) : (
                <WhiteboardPanel roomId={id} user={user} room={room} />
              )}
            </div>
          </div>

          {/* Right Area (Chat Only) */}
          <div className="lg:col-span-4 flex flex-col min-h-0">
            <ChatPanel 
              messages={messages} user={user} message={message} setMessage={setMessage} 
              sendMessage={sendMessage} typingUser={typingUser} isUploading={isUploading} 
              handleFileUpload={handleFileUpload} messagesEndRef={messagesEndRef} roomId={id}
            />
          </div>
        </div>
      </div>

      {/* Invite Friends Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] shadow-xl overflow-hidden flex flex-col"
            >
              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Invite Friends</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Room Code: <span className="text-[#8b5cf6]">{room?.roomCode}</span></p>
                </div>
                <button 
                  onClick={() => setShowInviteModal(false)}
                  className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 shadow-sm transition-all"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="p-6 max-h-[400px] overflow-y-auto custom-scrollbar">
                {friends.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-sm font-bold text-gray-400">You don't have any friends yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {friends.map(friend => {
                      const isOnline = onlineStatus[friend._id] === 'online';
                      return (
                        <div key={friend._id} className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl hover:border-purple-100 transition-all">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center overflow-hidden border border-purple-100">
                                {friend.avatar ? (
                                  <img src={getAvatarUrl(friend.avatar)} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <span className="font-bold text-[#8b5cf6] text-sm">{(friend.displayName || friend.name)?.charAt(0).toUpperCase()}</span>
                                )}
                              </div>
                              {isOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">{friend.displayName || friend.name}</p>
                              <p className={`text-[10px] font-bold uppercase tracking-widest ${isOnline ? 'text-green-500' : 'text-gray-400'}`}>
                                {isOnline ? 'Online' : 'Offline'}
                              </p>
                            </div>
                          </div>
                          <button 
                            onClick={() => {
                              socket.emit('send_room_invite', { friendId: friend._id, roomId: id, roomName: room?.name });
                              showToast(`Invite sent to ${friend.displayName || friend.name}`, 'success');
                            }}
                            className="px-4 py-2 bg-purple-50 text-[#8b5cf6] text-xs font-bold rounded-xl hover:bg-[#8b5cf6] hover:text-white transition-all"
                          >
                            Invite
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(room?.roomCode);
                    showToast('Room Code copied to clipboard', 'success');
                  }}
                  className="w-full py-4 bg-white border border-gray-200 text-gray-700 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-all shadow-sm"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  Copy Invite Code
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
}

export default Room;