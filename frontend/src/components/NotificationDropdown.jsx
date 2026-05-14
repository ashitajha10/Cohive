import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useNotificationStore from '../store/notificationStore';
import { formatDistanceToNow } from 'date-fns';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotificationStore();

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification._id);
    }
    setIsOpen(false);
    
    // Intelligent Navigation
    if (notification.type === 'friend_request') {
      navigate('/friends');
    } else if (notification.link) {
      navigate(notification.link);
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`p-3 rounded-2xl border transition-all relative z-10 ${
          isOpen 
            ? 'bg-primary-600 border-primary-500 text-white shadow-glow-purple' 
            : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/20'
        }`}
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-pink-500 rounded-full text-[10px] font-black text-white flex items-center justify-center border-2 border-[#0b0a24] animate-bounce shadow-glow-pink">
            {unreadCount}
          </span>
        )}
      </motion.button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 20, scale: 0.95, filter: "blur(10px)" }}
              className="absolute right-0 mt-4 w-[450px] glass-panel rounded-[2.5rem] border-white/10 shadow-holographic overflow-hidden z-50 origin-top-right"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                <div>
                  <h3 className="text-sm font-black text-white  uppercase  tracking-widest">Notifications</h3>
                  <p className="text-[10px] font-black text-primary-500 uppercase tracking-[0.3em] mt-1 ">Recent Activity</p>
                </div>
                <button 
                  onClick={markAllAsRead}
                  className="text-[9px] font-black text-primary-400 hover:text-primary-300 uppercase tracking-widest transition-colors  "
                >
                  Mark all as read
                </button>
              </div>

              <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-12 text-center opacity-30">
                    <img src="/space_mascot_astronaut_1778492786001.png" className="w-24 h-24 mx-auto mb-6 opacity-20 animate-float" alt="" />
                    <p className="text-xs font-black text-gray-500 uppercase tracking-widest  ">No notifications yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {notifications.map((n) => (
                      <motion.div 
                        key={n._id}
                        initial={{ backgroundColor: 'transparent' }}
                        whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                        className={`p-6 cursor-pointer transition-all relative ${!n.read ? 'bg-primary-600/5' : ''}`}
                        onClick={() => handleNotificationClick(n)}
                      >
                        {!n.read && (
                          <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-primary-600 rounded-full shadow-glow-purple"></div>
                        )}
                        
                        <div className="flex gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center border ${
                            n.type === 'friend_request' ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' :
                            n.type === 'room_invite' ? 'bg-primary-500/10 border-primary-500/30 text-primary-400' :
                            'bg-space-neon/10 border-space-neon/30 text-space-neon'
                          }`}>
                            {n.type === 'friend_request' && <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                            {n.type === 'room_invite' && <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>}
                            {(n.type === 'mention' || n.type === 'room_join') && <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-black tracking-tight  ${n.read ? 'text-gray-400' : 'text-white'}`}>
                              {n.title}
                            </p>
                            <p className="text-xs text-gray-500 truncate mt-1 font-medium">{n.message}</p>
                            <div className="flex items-center gap-3 mt-3">
                              <span className="text-[9px] font-black text-primary-500 uppercase tracking-widest  ">
                                {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                              </span>
                              {!n.read && (
                                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse"></span>
                              )}
                            </div>
                          </div>
                          
                          <button 
                            onClick={(e) => { e.stopPropagation(); deleteNotification(n._id); }}
                            className="p-2 text-gray-600 hover:text-pink-500 transition-colors self-start"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="p-4 bg-white/5 border-t border-white/5">
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 10, repeat: Infinity }}
                    className="h-full bg-gradient-to-r from-primary-600 via-space-neon to-pink-500"
                  />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;
