import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuthStore from '../store/authStore';
import Logo from './Logo';

const Sidebar = ({ onClose, isCollapsed, onToggleCollapse, isCollapsible }) => {
  const location = useLocation();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const menuItems = [
    { 
      name: 'Dashboard', 
      path: '/dashboard', 
      icon: (active) => (
        <svg className={`w-5 h-5 ${active ? 'text-[#8b5cf6]' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    { 
      name: 'My Rooms', 
      path: '/my-rooms', 
      icon: (active) => (
        <svg className={`w-5 h-5 ${active ? 'text-[#8b5cf6]' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    { 
      name: 'Friends', 
      path: '/friends', 
      icon: (active) => (
        <svg className={`w-5 h-5 ${active ? 'text-[#8b5cf6]' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    { 
      name: 'Profile', 
      path: '/profile', 
      icon: (active) => (
        <svg className={`w-5 h-5 ${active ? 'text-[#8b5cf6]' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    }
  ];

  return (
    <div className={`h-full bg-white flex flex-col ${isCollapsed ? 'p-4 items-center' : 'p-6'} overflow-y-auto custom-scrollbar shrink-0 w-full`}>
      {/* Logo and Collapse Button */}
      <div className={`mb-12 flex items-center ${isCollapsed ? 'justify-center flex-col gap-4' : 'justify-between'} w-full`}>
        <Logo variant="purple" size={isCollapsed ? "sm" : "md"} showText={!isCollapsed} />
        {isCollapsible && (
          <button 
            onClick={onToggleCollapse} 
            className="p-2 text-gray-400 hover:text-[#8b5cf6] hover:bg-purple-50 rounded-xl transition-all shadow-sm flex items-center justify-center shrink-0"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={isCollapsed ? "M13 5l7 7-7 7M5 5l7 7-7 7" : "M11 19l-7-7 7-7m8 14l-7-7 7-7"} />
            </svg>
          </button>
        )}
      </div>

      {/* Menu Label */}
      {!isCollapsed && <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 px-2">Main Menu</p>}

      {/* Navigation */}
      <nav className="flex-1 space-y-2 w-full">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.name} to={item.path} onClick={onClose} title={isCollapsed ? item.name : undefined} className={`sidebar-item ${isActive ? 'active' : ''} ${isCollapsed ? 'justify-center p-3' : ''}`}>
              {item.icon(isActive)}
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Card */}
      {user && (
        <div className="mt-auto pt-6 border-t border-gray-100 w-full">
          <div 
            onClick={() => { navigate('/profile'); if(onClose) onClose(); }}
            className={`flex items-center ${isCollapsed ? 'justify-center p-2' : 'gap-3 p-3'} rounded-2xl hover:bg-purple-50 hover:shadow-sm hover:shadow-purple-100/50 transition-all cursor-pointer border border-transparent hover:border-purple-100`}
            title={isCollapsed ? `${user.displayName || user.name} (@${user.username})` : undefined}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 border border-purple-200 flex items-center justify-center overflow-hidden flex-shrink-0">
              {user.avatar ? (
                <img src={user.avatar} alt={user.displayName || user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="font-bold text-sm text-[#8b5cf6] uppercase">
                  {(user.displayName?.charAt(0) || user.name?.charAt(0) || 'U')}
                </span>
              )}
            </div>
            {!isCollapsed && (
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm font-bold text-gray-900 truncate">
                  {user.displayName || user.name}
                </span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">
                  @{user.username}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
