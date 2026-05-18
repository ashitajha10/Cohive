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
        <div className={`transition-all duration-300 overflow-hidden shrink-0 ${isNavbarCollapsed ? 'h-14 bg-white/80 backdrop-blur-md shadow-sm' : 'h-20 bg-white shadow-sm'}`}>
          <Navbar 
            onMenuClick={() => setIsSidebarOpen(true)} 
            isCollapsed={isNavbarCollapsed}
            onToggleCollapse={() => setIsNavbarCollapsed(!isNavbarCollapsed)}
            isCollapsible={isRoomRoute}
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
