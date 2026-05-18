import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const isRoomRoute = location.pathname.startsWith('/room/');

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(isRoomRoute);
  const [isNavbarCollapsed, setIsNavbarCollapsed] = useState(isRoomRoute);

  useEffect(() => {
    const roomMode = location.pathname.startsWith('/room/');
    setIsSidebarCollapsed(roomMode);
    setIsNavbarCollapsed(roomMode);
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans relative">
      
      {/* Floating Expand Controllers (Visible when collapsed in Room mode) */}
      {isRoomRoute && (isSidebarCollapsed || isNavbarCollapsed) && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-gray-950/90 backdrop-blur-2xl p-2 rounded-2xl border border-white/10 shadow-2xl animate-fade-in">
          {isSidebarCollapsed && (
            <button 
              onClick={() => setIsSidebarCollapsed(false)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all flex items-center gap-2 text-xs font-bold shadow-sm"
              title="Expand Sidebar"
            >
              <svg className="w-4 h-4 text-[#8b5cf6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span>Open Sidebar</span>
            </button>
          )}
          {isNavbarCollapsed && (
            <button 
              onClick={() => setIsNavbarCollapsed(false)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all flex items-center gap-2 text-xs font-bold shadow-sm"
              title="Expand Navbar"
            >
              <svg className="w-4 h-4 text-[#8b5cf6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
              </svg>
              <span>Open Navbar</span>
            </button>
          )}
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${isSidebarCollapsed ? 'lg:-translate-x-full lg:w-0' : 'lg:relative lg:translate-x-0 lg:w-64'} transition-all duration-300 ease-in-out z-50 lg:z-20 overflow-hidden shrink-0`}>
        <Sidebar 
          onClose={() => setIsSidebarOpen(false)} 
          onCollapse={() => setIsSidebarCollapsed(true)}
          isCollapsible={isRoomRoute && !isSidebarCollapsed}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0 relative w-full overflow-hidden">
        <div className={`transition-all duration-300 overflow-hidden shrink-0 ${isNavbarCollapsed ? 'h-0 opacity-0 pointer-events-none' : 'h-20 opacity-100'}`}>
          <Navbar 
            onMenuClick={() => setIsSidebarOpen(true)} 
            onCollapse={() => setIsNavbarCollapsed(true)}
            isCollapsible={isRoomRoute && !isNavbarCollapsed}
          />
        </div>
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 md:p-8 lg:p-10 custom-scrollbar relative">
          <div className="max-w-[1600px] mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
