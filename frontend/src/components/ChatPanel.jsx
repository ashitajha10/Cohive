import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAvatarUrl } from "../utils/avatar";

const ChatPanel = ({ messages, user, message, setMessage, sendMessage, typingUser, isUploading, handleFileUpload, messagesEndRef, roomId }) => {
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-transparent">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <h3 className="text-sm font-semibold text-gray-200">Room Chat</h3>
        </div>
        
        <AnimatePresence>

          {typingUser && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="flex items-center gap-3 px-3 py-1 bg-cyber-cyan/5 rounded-full border border-cyber-cyan/10"
            >
              <span className="text-[8px] font-black text-cyber-cyan uppercase tracking-widest">{typingUser} TYPING</span>
              <div className="flex gap-1">
                <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1 h-1 bg-cyber-cyan rounded-full" />
                <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1 h-1 bg-cyber-cyan rounded-full" />
                <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1 h-1 bg-cyber-cyan rounded-full" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar scroll-smooth">
        <AnimatePresence mode="popLayout">
          {messages.map((msg, index) => {
            const isMe = msg.user?._id === user?._id || msg.userId === user?._id;
            const isSystem = msg.type === 'system';
            
            if (isSystem) {
              return (
                <motion.div 
                  key={msg._id || index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-center"
                >
                  <div className="px-5 py-2 bg-white/[0.03] rounded-full border border-white/5 backdrop-blur-md">
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">{msg.message}</p>
                  </div>
                </motion.div>
              );
            }

            return (
              <motion.div
                key={msg._id || index}
                initial={{ opacity: 0, x: isMe ? 20 : -20, y: 10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div className={`flex gap-4 max-w-[90%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className="flex-shrink-0 relative group">
                    <div className={`w-9 h-9 rounded-2xl p-[1px] bg-gradient-to-br ${isMe ? 'from-cyber-cyan to-transparent' : 'from-gray-700 to-transparent'} group-hover:scale-105 transition-transform`}>
                  
                  <div className={`flex items-end gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {msg.user?.avatar ? (
                        <img 
                          src={getAvatarUrl(msg.user.avatar)} 
                          alt="" 
                          className="w-8 h-8 rounded-full object-cover shadow-md"
                        />
                      ) : (
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-md ${isMe ? 'bg-[#1e2430]' : 'bg-purple-600'}`}>
                          {(msg.user?.name || msg.user || '?').charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    
                    {/* Message Content */}
                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                      <div className="flex items-center gap-2 mb-1 px-1">
                        <span className="text-[11px] font-medium text-gray-300">{isMe ? 'You' : (msg.user?.name || msg.user)}</span>
                        {msg.user?._id === user?._id && <span className="text-[9px] bg-white/10 text-gray-300 px-1.5 py-0.5 rounded uppercase">Host</span>}
                        <span className="text-[9px] text-gray-500">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      
                      <div className={`px-4 py-3 ${
                        isMe 
                          ? 'bg-[#1e2430] text-gray-200 rounded-2xl rounded-tr-sm shadow-md' 
                          : 'bg-gradient-to-br from-purple-600/80 to-purple-800/80 text-white rounded-2xl rounded-tl-sm shadow-md'
                      }`}>
                        {msg.type === 'file' ? (
                          <a href={msg.file} target="_blank" rel="noreferrer" className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isMe ? 'bg-white/5' : 'bg-black/20'}`}>
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                            </div>
                            <div>
                              <span className="text-xs font-semibold block">Attachment</span>
                              <span className="text-[10px] opacity-70">Click to view</span>
                            </div>
                          </a>
                        ) : (
                          <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => document.getElementById('chat-file-upload').click()}
            disabled={isUploading}
            className="w-10 h-10 rounded-full bg-[#161b22] border border-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-all flex-shrink-0"
          >
            {isUploading ? (
              <div className="w-4 h-4 border-2 border-cyber-cyan border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
            )}
          </button>
          
          <input 
            type="file" 
            id="chat-file-upload" 
            className="hidden" 
            onChange={handleFileUpload} 
          />
          
          <div className="flex-1 relative">
            <input 
              type="text" 
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              className="w-full bg-[#161b22] border border-white/5 rounded-full pl-5 pr-12 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-cyber-cyan/30 transition-all"
            />
            <button 
              onClick={sendMessage}
              disabled={!message.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-cyber-cyan text-black flex items-center justify-center disabled:opacity-20 disabled:bg-gray-700 disabled:text-gray-500 hover:bg-white transition-all"
            >
              <svg className="w-4 h-4 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


export default ChatPanel;
