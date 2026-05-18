import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useNotificationStore from '../store/notificationStore';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '../context/ToastContext';

const getNotificationContent = (n) => {
  const senderName = n.sender?.displayName || n.sender?.name || 'Someone';
  
  switch (n.type) {
    case 'friend_request':
      return {
        title: 'Friend Request',
        message: `${senderName} sent you a friend request.`,
        actionLabel: 'Accept / Reject',
        link: '/friends'
      };
    case 'friend_accepted':
      return {
        title: 'Friend Request Accepted',
        message: `You and ${senderName} are now friends!`,
        actionLabel: 'View Friends',
        link: '/friends'
      };
    case 'room_invite':
      return {
        title: 'Room Invitation',
        message: `${senderName} invited you to join "${n.data?.roomName || 'a room'}".`,
        actionLabel: 'Join Room',
        code: n.data?.roomId,
        link: `/room/${n.data?.roomId}`
      };
    case 'mention':
      return {
        title: 'New Mention',
        message: `${senderName} mentioned you: "${n.data?.text || ''}"`,
        actionLabel: 'Go to Chat',
        link: `/room/${n.data?.roomId}`
      };
    case 'room_join':
      return {
        title: 'User Joined Room',
        message: `${senderName} joined room "${n.data?.roomName || 'your room'}".`,
        actionLabel: 'Open Room',
        link: `/room/${n.data?.roomId}`
      };
    default:
      return {
        title: 'Notification',
        message: n.data?.text || 'New activity in Cohive.',
        actionLabel: 'View',
        link: '/'
      };
  }
};

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearAllNotifications,
    deleteNotification 
  } = useNotificationStore();

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification._id);
    }
    setIsOpen(false);
    
    // Intelligent Navigation
    const content = getNotificationContent(notification);
    if (content.link) {
      navigate(content.link);
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`p-3 rounded-2xl border transition-all duration-300 relative z-10 ${
          isOpen 
            ? 'bg-[#8b5cf6] border-[#7c3aed] text-white shadow-[0_8px_20px_rgba(139,92,246,0.3)]' 
            : 'bg-gray-50/80 border-gray-100 text-gray-500 hover:text-[#8b5cf6] hover:bg-purple-50/50 hover:border-purple-200/50 shadow-sm'
        }`}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 rounded-full text-[9px] font-black text-white flex items-center justify-center border-2 border-white animate-pulse shadow-[0_0_10px_rgba(236,72,153,0.5)]">
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
              initial={{ opacity: 0, y: 15, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="absolute right-0 mt-4 w-[420px] bg-white rounded-[2.5rem] border border-purple-100/50 shadow-[0_20px_50px_rgba(139,92,246,0.12)] overflow-hidden z-50 origin-top-right"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/40">
                <div>
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Notifications</h3>
                  <p className="text-[9px] font-black text-[#8b5cf6] uppercase tracking-[0.25em] mt-0.5">Recent Activity</p>
                </div>
                <div className="flex items-center gap-3">
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllAsRead}
                      className="text-[10px] font-black text-gray-400 hover:text-[#8b5cf6] uppercase tracking-widest transition-colors duration-200"
                    >
                      Mark all as read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button 
                      onClick={clearAllNotifications}
                      className="text-[10px] font-black text-red-400 hover:text-red-600 uppercase tracking-widest transition-colors duration-200"
                    >
                      Clear all
                    </button>
                  )}
                </div>
              </div>

              <div className="max-h-[420px] overflow-y-auto custom-scrollbar bg-white">
                {notifications.length === 0 ? (
                  <div className="py-16 px-8 text-center flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-4 border border-purple-100/30">
                      <svg className="w-8 h-8 text-[#8b5cf6]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider">No notifications yet</p>
                    <p className="text-[10px] text-gray-400 mt-1">We'll alert you when something happens!</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100/60">
                    {notifications.map((n) => {
                      const content = getNotificationContent(n);
                      return (
                        <motion.div 
                          key={n._id}
                          initial={{ backgroundColor: 'transparent' }}
                          whileHover={{ backgroundColor: 'rgba(139, 92, 246, 0.02)' }}
                          className={`p-5.5 cursor-pointer transition-all relative ${!n.read ? 'bg-purple-50/20' : 'hover:bg-gray-50/30'}`}
                          onClick={() => handleNotificationClick(n)}
                        >
                          {!n.read && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-[#8b5cf6] rounded-r-full shadow-[0_0_8px_rgba(139,92,246,0.4)]"></div>
                          )}
                          
                          <div className="flex gap-4">
                            <div className={`w-11 h-11 rounded-2xl flex-shrink-0 flex items-center justify-center border transition-colors duration-200 ${
                              n.type === 'friend_request' ? 'bg-indigo-50 border-indigo-100/50 text-indigo-500' :
                              n.type === 'room_invite' ? 'bg-purple-50 border-purple-100/50 text-[#8b5cf6]' :
                              'bg-purple-50 border-purple-100/50 text-[#8b5cf6]'
                            }`}>
                              {n.type === 'friend_request' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                              {n.type === 'room_invite' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>}
                              {(n.type === 'mention' || n.type === 'room_join') && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                            </div>
                            
                            <div className="flex-1 min-w-0 text-left">
                              <p className={`text-sm tracking-tight ${n.read ? 'text-gray-500 font-semibold' : 'text-gray-900 font-bold'}`}>
                                {content.title}
                              </p>
                              <p className="text-xs text-gray-500 mt-1 font-medium leading-relaxed">{content.message}</p>
                              
                              {/* Direct Clipboard Copy & Instant Join Room CTA */}
                              {content.code && (
                                <div className="flex gap-2 mt-3 select-none" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(content.code);
                                      showToast("Room code copied!", "success");
                                    }}
                                    className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all duration-200 flex items-center gap-1 border border-gray-150 shadow-sm hover:border-gray-300"
                                  >
                                    <svg className="w-3.5 h-3.5 text-[#8b5cf6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                    </svg>
                                    Copy Code
                                  </button>
                                </div>
                              )}

                              <div className="flex items-center gap-3 mt-3">
                                <span className="text-[9px] font-bold text-[#8b5cf6] uppercase tracking-widest">
                                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                </span>
                                {!n.read && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6] animate-pulse"></span>
                                )}
                              </div>
                            </div>
                            
                            <button 
                              onClick={(e) => { e.stopPropagation(); deleteNotification(n._id); }}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 self-start"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.8" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
              
              <div className="p-4 bg-gray-50/50 border-t border-gray-150/50 flex items-center">
                <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 10, repeat: Infinity }}
                    className="h-full bg-gradient-to-r from-[#8b5cf6] via-purple-400 to-pink-500"
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
