import React from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { getAvatarUrl } from "../utils/avatar";
import NotificationDropdown from "./NotificationDropdown";

const Navbar = ({ onMenuClick, isCollapsed, onToggleCollapse, isCollapsible }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="h-full w-full bg-white flex items-center justify-between px-8 shrink-0 relative z-10">
      <div className="flex items-center gap-4 lg:hidden">
        <button onClick={onMenuClick} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <div className="flex-1 hidden lg:block">
        {/* Can put breadcrumbs or search here if needed */}
      </div>

      <div className="flex items-center gap-6">
        {isCollapsible && (
          <button 
            onClick={onToggleCollapse} 
            className="px-3 py-1.5 text-gray-500 hover:text-[#8b5cf6] hover:bg-purple-50 rounded-xl transition-all shadow-sm flex items-center gap-2 text-xs font-bold border border-gray-100 bg-gray-50"
            title={isCollapsed ? "Expand Header" : "Collapse Header"}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={isCollapsed ? "M19 13l-7 7-7-7m14-8l-7 7-7-7" : "M5 11l7-7 7 7M5 19l7-7 7 7"} />
            </svg>
            <span className="hidden sm:inline">{isCollapsed ? "Expand Header" : "Collapse Header"}</span>
          </button>
        )}
        {user && (
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-900 leading-tight">{user.displayName || user.name}</p>
              <p className="text-[11px] text-gray-400 font-medium">{user.email}</p>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-purple-100 p-0.5 overflow-hidden">
              <img 
                src={getAvatarUrl(user.avatar)} 
                alt="Profile" 
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          </div>
        )}
        
        <NotificationDropdown />
        <div className="h-6 w-px bg-gray-100" />
        
        <button 
          onClick={handleLogout}
          className="px-5 py-2 bg-gray-50 text-gray-600 rounded-xl text-xs font-bold hover:bg-red-50 hover:text-red-600 transition-all"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
