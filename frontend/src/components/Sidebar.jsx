import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuthStore from '../store/authStore';
import { getAvatarUrl } from "../utils/avatar";
import useFriendStore from '../store/friendStore';
import { APP_NAME, DEFAULT_AVATAR } from '../utils/constants';

const Sidebar = ({ onClose }) => {
  const location = useLocation();
  const { user } = useAuthStore();
  const { friendRequests } = useFriendStore();
  const navigate = useNavigate();

  const navItems = [
    { 
      name: 'My Rooms', 
      path: '/dashboard', 
      icon: (active) => (
        <svg className={`w-5 h-5 ${active ? 'text-cyber-cyan' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    { 
      name: 'Friends', 
      path: '/friends', 
      icon: (active) => (
        <svg className={`w-5 h-5 ${active ? 'text-cyber-cyan' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      badge: friendRequests.length > 0 ? friendRequests.length : null
    },
    { 
      name: 'Notifications', 
      path: '/notifications', 
      icon: (active) => (
        <svg className={`w-5 h-5 ${active ? 'text-cyber-cyan' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      )
    },
    { 
      name: 'Settings', 
      path: '/profile', 
      icon: (active) => (
        <svg className={`w-5 h-5 ${active ? 'text-cyber-cyan' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )

    },
  ];

  return (
    <motion.div 
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-72 h-[calc(100vh-3rem)] m-6 p-6 flex flex-col gap-8 relative z-20 glass-panel rounded-[3rem] shadow-holographic border-white/10 shrink-0 overflow-hidden"
    >
      {/* Decorative Lights */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1">
        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse delay-75"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse delay-150"></div>
      </div>

      <div className="flex items-center justify-between px-2 mt-4">
        <div className="flex items-center gap-3">
          <motion.div 
            whileHover={{ rotate: 10, scale: 1.1 }}
            className="w-10 h-10 bg-gradient-to-br from-cyber-cyan/80 to-cyber-grey-900 rounded-2xl flex items-center justify-center shadow-glow-cyan border border-white/10"
          >
            <span className="text-xl font-black text-white">{APP_NAME.charAt(0)}</span>
          </motion.div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white glow-text-cyan">{APP_NAME}</h1>
            <p className="text-[8px] font-black uppercase tracking-[0.3em] text-cyber-cyan/60">Workspace Active</p>
          </div>
        </div>
        <button onClick={onClose} className="lg:hidden p-2 text-gray-500 hover:text-white transition-all">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <nav className="flex-1 space-y-3 mt-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className="block group"
            >
              <motion.div
                whileHover={{ x: 10, backgroundColor: 'rgba(0, 243, 255, 0.08)', boxShadow: 'inset 0 0 20px rgba(0, 243, 255, 0.1)' }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 relative ${
                  isActive 
                    ? 'bg-gradient-to-r from-cyber-cyan/20 to-cyber-cyan/5 border border-cyber-cyan/40 shadow-[0_0_25px_-5px_rgba(0,243,255,0.4)] overflow-hidden' 
                    : 'text-gray-500 border border-transparent hover:border-cyber-cyan/10'
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeNav"
                    className="absolute inset-0 bg-gradient-to-r from-cyber-cyan/5 to-transparent"
                  />
                )}
                
                {item.icon(isActive)}
                <span className={`font-black text-xs uppercase tracking-widest relative z-10 ${isActive ? 'text-white' : 'group-hover:text-gray-300'}`}>
                  {item.name}
                </span>
                
                {item.badge && (
                  <span className="absolute right-4 w-5 h-5 bg-cyber-pink rounded-full text-[9px] font-black text-white flex items-center justify-center border-2 border-cyber-grey-900 animate-bounce shadow-glow-pink">
                    {item.badge}
                  </span>
                )}
                
                {isActive && (
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: 4 }}
                    className="ml-auto h-4 rounded-full bg-cyber-cyan shadow-glow-cyan"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-6">


        {user && (
          <motion.div 
            whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(0,243,255,0.15)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/profile')}
            className="flex items-center justify-between bg-gradient-to-br from-white/10 to-white/5 p-4 rounded-[2rem] border border-white/10 backdrop-blur-md transition-all duration-300 hover:bg-cyber-cyan/10 hover:border-cyber-cyan/30 group cursor-pointer shadow-[0_8px_30px_rgb(0,0,0,0.4)] hover:-translate-y-1"
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="p-0.5 rounded-xl bg-gradient-to-br from-cyber-cyan to-cyber-pink shadow-glow-cyan">
                  <img
                    className="h-10 w-10 rounded-[10px] object-cover border border-white/20"
                    src={getAvatarUrl(user.avatar) || DEFAULT_AVATAR}
                    alt={user.name}
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-cyber-black rounded-full flex items-center justify-center border border-white/10">
                  <div className="w-2 h-2 bg-cyber-cyan rounded-full animate-pulse shadow-glow-cyan"></div>
                </div>
              </div>
              <div className="text-left">
                <p className="text-xs font-black text-white tracking-tight uppercase truncate max-w-[120px]">
                  {user.nickname || user.displayName || user.name}
                </p>
                <p className="text-[8px] font-black text-cyber-cyan/60 uppercase tracking-widest">
                  {user.nickname ? user.displayName || user.name : `USER ID: #${user.username?.slice(0, 4) || 'USER'}`}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Sidebar;
