import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const isRoomRoute = location.pathname.startsWith('/room/');

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(isRoomRoute);
  const [isNavbarHovered, setIsNavbarHovered] = useState(false);

  useEffect(() => {
    const roomMode = location.pathname.startsWith('/room/');
    setIsSidebarCollapsed(roomMode);
    setIsNavbarHovered(false);
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans relative">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${isSidebarCollapsed ? 'lg:relative lg:translate-x-0 lg:w-20' : 'lg:relative lg:translate-x-0 lg:w-64'} transition-all duration-300 ease-in-out z-50 lg:z-20 overflow-hidden shrink-0 bg-white border-r border-gray-100`}>
        <Sidebar 
          onClose={() => setIsSidebarOpen(false)} 
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isCollapsible={isRoomRoute}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0 relative w-full overflow-hidden">
        {isRoomRoute ? (
          <div 
            className={`absolute top-0 left-0 right-0 z-[60] transition-all duration-300 ease-in-out ${isNavbarHovered ? 'translate-y-0 shadow-2xl' : '-translate-y-[calc(100%-12px)] opacity-30 hover:opacity-100 shadow-none'}`}
            onMouseEnter={() => setIsNavbarHovered(true)}
            onMouseLeave={() => setIsNavbarHovered(false)}
          >
            <div className="h-20 bg-white border-b border-gray-200/80 shadow-lg">
              <Navbar 
                onMenuClick={() => setIsSidebarOpen(true)} 
                isCollapsed={false}
                isCollapsible={false}
              />
            </div>
            {/* Subtle hover prompt bar at the bottom edge */}
            {!isNavbarHovered && (
              <div className="h-3 bg-purple-600/30 backdrop-blur-md flex items-center justify-center cursor-pointer hover:bg-purple-600/50 transition-colors">
                <div className="w-12 h-1 bg-white/90 rounded-full shadow-sm" />
              </div>
            )}
          </div>
        ) : (
          <div className="relative z-10 shrink-0 h-20 bg-white border-b border-gray-100 shadow-sm">
            <Navbar 
              onMenuClick={() => setIsSidebarOpen(true)} 
              isCollapsed={false}
              isCollapsible={false}
            />
          </div>
        )}
        <main className={`flex-1 overflow-x-hidden overflow-y-auto ${isRoomRoute ? (isNavbarHovered ? '!pt-28' : '!pt-10') : ''} p-6 md:p-8 lg:p-10 transition-all duration-300 custom-scrollbar relative`}>
          <div className="max-w-[1600px] mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
