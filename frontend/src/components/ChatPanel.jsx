import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatPanel = ({ 
  messages, 
  user, 
  message, 
  setMessage, 
  sendMessage, 
  typingUser, 
  isUploading, 
  handleFileUpload, 
  messagesEndRef,
  roomId 
}) => {
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

  return (
    <div className="room-chat-panel flex-1 bg-gradient-to-br from-purple-50 via-fuchsia-50/20 to-violet-100/40 rounded-[2.5rem] border border-purple-100/40 shadow-sm flex flex-col min-h-0 overflow-hidden relative">
      {/* Header */}
      <div className="p-8 border-b border-purple-100/20 bg-transparent flex items-center justify-between shrink-0">
        <h3 className="text-xl font-bold text-gray-900 uppercase tracking-tight">Room Chat</h3>
        <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Live</span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-transparent flex flex-col min-h-0">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 my-auto">
            <div className="w-16 h-16 rounded-3xl bg-purple-50 flex items-center justify-center mb-4 text-[#8b5cf6] border border-purple-100 shadow-sm shadow-purple-50">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h4 className="text-sm font-black text-gray-900 uppercase tracking-wider">No Messages Yet</h4>
            <p className="text-[10px] font-semibold text-gray-400 mt-1 max-w-[200px] leading-relaxed">Send a chat message or share a file to start collaborating with your team!</p>
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
                      <div className="h-[1px] bg-purple-100/30 flex-1"></div>
                      <span className="px-4 py-1.5 bg-white/50 backdrop-blur-sm border border-purple-100/20 rounded-full text-[9px] font-black text-purple-600 uppercase tracking-widest mx-4 select-none">
                        {formatMessageDate(msg.createdAt)}
                      </span>
                      <div className="h-[1px] bg-purple-100/30 flex-1"></div>
                    </div>
                  )}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} w-full`}
                  >
                    {!isMe && (
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-2">
                        {msg.sender?.displayName || msg.sender?.name || 'User'} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                    {isMe && (
                      <span className="text-[10px] font-bold text-[#8b5cf6] uppercase tracking-widest mb-1.5 mr-2">
                        YOU • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                    
                    <div className={`max-w-[85%] px-6 py-4 rounded-3xl text-sm font-medium shadow-sm leading-relaxed ${
                      isMe 
                        ? 'bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] text-white rounded-tr-none' 
                        : 'bg-white border border-purple-100/20 text-gray-800 rounded-tl-none'
                    }`}>
                      {msg.type === 'file' ? (
                        <a href={msg.file} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:underline">
                          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                          <span className="truncate max-w-[200px]">{msg.file.split('/').pop()}</span>
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

      {/* Typing Indicator */}
      {typingUser && (
        <div className="px-8 py-2 text-[10px] font-bold text-[#8b5cf6] uppercase tracking-widest bg-white/20 backdrop-blur-sm animate-pulse">
          {typingUser} is typing...
        </div>
      )}

      {/* Input Area */}
      <form onSubmit={sendMessage} className="p-6 bg-transparent border-t border-purple-100/20 flex items-center gap-4">
        <div className="relative flex-1 group">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="w-full bg-white/90 border border-purple-100/20 rounded-2xl px-6 py-4 text-sm font-medium text-gray-800 focus:outline-none focus:border-purple-200 focus:bg-white transition-all placeholder:text-gray-400"
          />
          <label className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-purple-500 cursor-pointer">
            <input type="file" onChange={handleFileUpload} className="hidden" />
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
          </label>
        </div>
        <button
          type="submit"
          className="p-4 bg-[#8b5cf6] text-white rounded-2xl hover:bg-[#7c3aed] transition-all shadow-lg shadow-purple-100 flex items-center justify-center shrink-0"
        >
          <svg className="w-5 h-5 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
        </button>
      </form>
    </div>
  );
};

export default ChatPanel;
