import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/Layout';
import useAuthStore from '../store/authStore';
import useFriendStore from '../store/friendStore';
import socket from '../services/socket';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { getAvatarUrl } from '../utils/avatar';

const Messages = () => {
  const { user } = useAuthStore();
  const { friends, fetchFriends, onlineStatus } = useFriendStore();
  const { showToast } = useToast();

  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [unreadFriends, setUnreadFriends] = useState({}); // friendId -> boolean
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const messagesEndRef = useRef(null);

  const formatMessageDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch friends list on load
  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  // Load message history when selected friend changes
  useEffect(() => {
    if (!selectedFriend) return;

    const loadMessageHistory = async () => {
      setLoadingMessages(true);
      try {
        const res = await api.get(`/dm/${selectedFriend._id}`);
        setMessages(res.data);
        // Mark all as read
        await api.post(`/dm/read/${selectedFriend._id}`);
        // Clear unread indicator locally
        setUnreadFriends(prev => ({ ...prev, [selectedFriend._id]: false }));
      } catch (err) {
        console.error('Failed to load direct messages:', err);
        showToast('Error loading messages history', 'error');
      } finally {
        setLoadingMessages(false);
      }
    };

    loadMessageHistory();
  }, [selectedFriend, showToast]);

  // Real-time socket message synchronization
  useEffect(() => {
    const handleIncomingDM = (dm) => {
      const senderId = dm.sender._id || dm.sender;
      const receiverId = dm.receiver._id || dm.receiver;
      
      const isFromSelected = selectedFriend && senderId === selectedFriend._id;
      const isToSelected = selectedFriend && receiverId === selectedFriend._id;
      const isFromMe = senderId === user?._id;

      // Update message logs if this message belongs to the active friend conversation
      if (isFromSelected || (isFromMe && isToSelected)) {
        setMessages((prev) => [...prev, dm]);
        
        // If we are actively viewing this conversation, mark incoming message as read
        if (isFromSelected) {
          api.post(`/dm/read/${selectedFriend._id}`).catch(err => console.error(err));
        }
      } else if (!isFromMe) {
        // Increment unread status for the sender friend
        setUnreadFriends(prev => ({ ...prev, [senderId]: true }));
        showToast(`New message from ${dm.sender.displayName || dm.sender.name}!`, 'info');
      }
    };

    socket.on("receive_direct_message", handleIncomingDM);
    return () => {
      socket.off("receive_direct_message", handleIncomingDM);
    };
  }, [selectedFriend, user, showToast]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!selectedFriend || !messageText.trim()) return;

    // Emit direct message over sockets
    socket.emit("send_direct_message", {
      receiverId: selectedFriend._id,
      message: messageText.trim(),
      type: "text"
    });

    setMessageText("");
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedFriend) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await api.post("/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
      socket.emit("send_direct_message", { 
        receiverId: selectedFriend._id, 
        file: res.data.url, 
        type: "file" 
      });
    } catch (err) {
      console.error(err);
      showToast("File upload failed", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const filteredFriends = friends.filter(friend => {
    const name = (friend.displayName || friend.name || "").toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  return (
    <Layout>
      <div className="max-w-6xl mx-auto h-[calc(100vh-10rem)] flex flex-col gap-6">
        
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter glow-text-cyan">Direct Messages</h1>
            <p className="text-[10px] font-black text-cyber-cyan uppercase tracking-[0.3em] mt-1.5 text-left">Secure & Encrypted Workspace DMs</p>
          </div>
          {selectedFriend && (
            <button 
              onClick={() => setSelectedFriend(null)}
              className="md:hidden px-4 py-2 bg-white/5 border border-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-white/10"
            >
              Back to Friends
            </button>
          )}
        </div>

        {/* Workspace Grid */}
        <div className="flex-1 flex gap-6 min-h-0 overflow-hidden relative">
          
          {/* Left Column: Friends List */}
          <div className={`w-full md:w-80 flex flex-col gap-4 shrink-0 glass-panel rounded-[2rem] border-white/5 p-6 min-h-0 ${
            selectedFriend ? 'hidden md:flex' : 'flex'
          }`}>
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest shrink-0">Your Active Friends</h3>
            
            {/* Search Input */}
            <div className="relative shrink-0">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search friends..."
                className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-5 py-3 text-xs font-medium text-white placeholder-gray-500 focus:outline-none focus:border-cyber-cyan/40 focus:bg-white/[0.04] transition-all"
              />
              <svg className="w-4 h-4 text-gray-500 absolute right-4 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Scrollable Friends Scroll */}
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1">
              {filteredFriends.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">No friends found</p>
                </div>
              ) : (
                filteredFriends.map(friend => {
                  const isOnline = onlineStatus[friend._id] === 'online';
                  const isSelected = selectedFriend?._id === friend._id;
                  const hasUnread = unreadFriends[friend._id];

                  return (
                    <motion.div
                      key={friend._id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSelectedFriend(friend);
                        setUnreadFriends(prev => ({ ...prev, [friend._id]: false }));
                      }}
                      className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all duration-300 ${
                        isSelected 
                          ? 'bg-cyber-cyan/10 border-cyber-cyan/30 shadow-[0_0_15px_-3px_rgba(0,243,255,0.2)]'
                          : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden border ${
                            isSelected ? 'border-cyber-cyan/40 bg-cyber-cyan/10' : 'border-white/5 bg-white/[0.02]'
                          }`}>
                            {friend.avatar ? (
                              <img src={getAvatarUrl(friend.avatar)} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className={`font-black text-sm ${isSelected ? 'text-cyber-cyan' : 'text-gray-400'}`}>
                                {(friend.displayName || friend.name)?.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          {isOnline && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-[#090a0f] rounded-full shadow-glow-cyan"></div>
                          )}
                        </div>
                        <div>
                          <p className={`text-xs font-black truncate max-w-[120px] ${isSelected ? 'text-cyber-cyan glow-text-cyan' : 'text-white'}`}>
                            {friend.displayName || friend.name}
                          </p>
                          <p className={`text-[8px] font-bold uppercase tracking-wider mt-0.5 ${isOnline ? 'text-green-500 animate-pulse' : 'text-gray-500'}`}>
                            {isOnline ? 'Active' : 'Offline'}
                          </p>
                        </div>
                      </div>

                      {hasUnread && (
                        <span className="w-2.5 h-2.5 bg-cyber-cyan rounded-full shadow-glow-cyan animate-pulse shrink-0"></span>
                      )}
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Chat Box */}
          <div className={`flex-1 flex flex-col glass-panel rounded-[2rem] border-white/5 overflow-hidden min-h-0 ${
            selectedFriend ? 'flex' : 'hidden md:flex'
          }`}>
            
            {selectedFriend ? (
              <div className="flex-1 flex flex-col min-h-0">
                {/* Friend Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0 bg-white/[0.01]">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center overflow-hidden">
                        {selectedFriend.avatar ? (
                          <img src={getAvatarUrl(selectedFriend.avatar)} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-black text-cyber-cyan text-base glow-text-cyan">{(selectedFriend.displayName || selectedFriend.name)?.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      {onlineStatus[selectedFriend._id] === 'online' && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-[#090a0f] rounded-full shadow-glow-cyan"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white uppercase tracking-tight">{selectedFriend.displayName || selectedFriend.name}</h3>
                      <p className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${
                        onlineStatus[selectedFriend._id] === 'online' ? 'text-green-400' : 'text-gray-500'
                      }`}>
                        {onlineStatus[selectedFriend._id] === 'online' ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages Panel */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-white/[0.01] flex flex-col min-h-0">
                  {loadingMessages ? (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-cyber-cyan border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 my-auto">
                      <div className="w-16 h-16 rounded-3xl bg-cyber-cyan/10 border border-cyber-cyan/20 flex items-center justify-center mb-4 text-cyber-cyan shadow-glow-cyan shrink-0">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <h4 className="text-sm font-black text-white uppercase tracking-wider glow-text-cyan">No conversation yet</h4>
                      <p className="text-[10px] font-semibold text-gray-500 mt-1.5 max-w-[220px] leading-relaxed">Send a direct message or attach a secure file to start the conversation!</p>
                    </div>
                  ) : (
                    <AnimatePresence initial={false}>
                      {messages.map((msg, idx) => {
                        const isMe = msg.sender?._id === user?._id || msg.sender === user?._id;
                        const prevMsg = idx > 0 ? messages[idx - 1] : null;
                        const currentDateStr = new Date(msg.createdAt).toDateString();
                        const prevDateStr = prevMsg ? new Date(prevMsg.createdAt).toDateString() : null;
                        const showDivider = currentDateStr !== prevDateStr;

                        return (
                          <React.Fragment key={msg._id || idx}>
                            {showDivider && (
                              <div className="flex items-center justify-center my-6 shrink-0 w-full">
                                <div className="h-[1px] bg-white/5 flex-1"></div>
                                <span className="px-4 py-1.5 bg-white/5 border border-white/5 rounded-full text-[9px] font-black text-gray-400 uppercase tracking-widest mx-4 select-none">
                                  {formatMessageDate(msg.createdAt)}
                                </span>
                                <div className="h-[1px] bg-white/5 flex-1"></div>
                              </div>
                            )}
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} w-full`}
                            >
                              <span className={`text-[8px] font-black uppercase tracking-widest mb-1.5 ${
                                isMe ? 'text-cyber-cyan mr-2' : 'text-gray-500 ml-2'
                              }`}>
                                {isMe ? 'YOU' : (selectedFriend.displayName || selectedFriend.name)} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              
                              <div className={`max-w-[80%] px-5 py-3 rounded-2xl text-xs font-semibold shadow-sm leading-relaxed ${
                                isMe 
                                  ? 'bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] text-white rounded-tr-none shadow-[0_0_15px_-5px_rgba(139,92,246,0.3)]' 
                                  : 'bg-white/5 border border-white/5 text-white/90 rounded-tl-none'
                              }`}>
                                {msg.type === 'file' ? (
                                  <a href={msg.file} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:underline">
                                    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                                    <span className="truncate max-w-[180px]">{msg.file.split('/').pop()}</span>
                                  </a>
                                ) : (
                                  msg.text
                                )}
                              </div>
                            </motion.div>
                          </React.Fragment>
                        );
                      })}
                    </AnimatePresence>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Controls */}
                <form onSubmit={handleSendMessage} className="p-4 bg-white/[0.01] border-t border-white/5 flex items-center gap-3 shrink-0">
                  <div className="relative flex-1 group">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type your secure message..."
                      className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-5 py-4 text-xs font-medium text-white placeholder-gray-500 focus:outline-none focus:border-cyber-cyan/40 focus:bg-white/[0.04] transition-all"
                    />
                    <label className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-cyber-cyan cursor-pointer transition-colors">
                      <input type="file" onChange={handleFileUpload} className="hidden" disabled={isUploading} />
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                    </label>
                  </div>
                  <button
                    type="submit"
                    className="p-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-2xl hover:from-purple-600 hover:to-indigo-600 transition-all flex items-center justify-center shrink-0 shadow-lg shadow-purple-950/20"
                  >
                    <svg className="w-4 h-4 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center my-auto">
                <div className="w-24 h-24 bg-cyber-cyan/10 rounded-full flex items-center justify-center mb-6 shadow-glow-cyan border border-cyber-cyan/25 shrink-0">
                  <svg className="w-12 h-12 text-cyber-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight glow-text-cyan">Direct Messaging Workspace</h3>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-[9px] mt-2 max-w-sm leading-relaxed">
                  Select an active teammate or friend from the sidebar to establish a secure end-to-end direct chat session.
                </p>
              </div>
            )}

          </div>

        </div>

      </div>
    </Layout>
  );
};

export default Messages;
