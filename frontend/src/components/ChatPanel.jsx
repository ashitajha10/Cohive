import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAvatarUrl } from "../utils/avatar";

const ChatPanel = ({ messages, user, message, setMessage, sendMessage, typingUser, isUploading, handleFileUpload, messagesEndRef, roomId }) => {
  return (
    <div className="flex-1 flex flex-col min-h-0 glass-panel rounded-[2.5rem] border-white/10 relative overflow-hidden bg-[#050608]/40 shadow-2xl">
      {/* Chat Header */}
      <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02] backdrop-blur-xl">
        <div>
          <h3 className="text-[10px] font-black text-cyber-cyan uppercase tracking-[0.4em] flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-cyber-cyan shadow-glow-cyan animate-pulse" />
            Neural Link.01
          </h3>
          <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mt-1">Encrypted Channel // active</p>
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
                      <div className="w-full h-full bg-[#0a0b0d] rounded-[15px] overflow-hidden">
                        <img src={getAvatarUrl(msg.user?.avatar)} className="w-full h-full object-cover" alt="" />
                      </div>
                    </div>
                  </div>
                  
                  <div className={`flex flex-col gap-1.5 ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-3 px-1">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{msg.user?.displayName || msg.user?.name}</span>
                      <span className="text-[7px] font-black text-gray-700 uppercase tracking-widest">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    
                    <div className={`px-6 py-4 rounded-[1.5rem] relative group ${
                      isMe 
                        ? 'bg-cyber-cyan text-black rounded-tr-none shadow-glow-cyan' 
                        : 'bg-white/[0.03] border border-white/10 text-gray-200 rounded-tl-none'
                    }`}>
                      {msg.type === 'file' ? (
                        <a href={msg.file} target="_blank" rel="noreferrer" className="flex items-center gap-4 group/file">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${isMe ? 'bg-black/10' : 'bg-white/5'}`}>
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                          </div>
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-widest block">Data Packet</span>
                            <span className={`text-[8px] font-black uppercase opacity-60`}>Download Link</span>
                          </div>
                        </a>
                      ) : (
                        <p className={`text-sm leading-relaxed ${isMe ? 'font-black' : 'font-medium'}`}>{msg.message}</p>
                      )}
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
      <div className="p-8 bg-white/[0.02] backdrop-blur-2xl border-t border-white/5">
        <div className="flex items-center gap-4">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => document.getElementById('chat-file-upload').click()}
            disabled={isUploading}
            className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-gray-500 hover:text-cyber-cyan hover:border-cyber-cyan/40 transition-all flex-shrink-0"
          >
            {isUploading ? (
              <div className="w-5 h-5 border-2 border-cyber-cyan border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
            )}
          </motion.button>
          
          <input 
            type="file" 
            id="chat-file-upload" 
            className="hidden" 
            onChange={handleFileUpload} 
          />
          
          <div className="flex-1 relative group">
            <input 
              type="text" 
              placeholder="ENCODE MESSAGE..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-8 py-5 text-sm font-black text-white placeholder:text-gray-800 focus:outline-none focus:border-cyber-cyan/40 transition-all tracking-[0.1em]"
            />
            <motion.button 
              whileHover={{ scale: 1.1, x: -5 }}
              whileTap={{ scale: 0.9 }}
              onClick={sendMessage}
              disabled={!message.trim()}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center shadow-2xl disabled:opacity-20 hover:bg-cyber-cyan transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};


export default ChatPanel;
