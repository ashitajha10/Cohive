import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import CosmicBackground from "./CosmicBackground";

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const isProfilePage = location.pathname === '/profile';

  return (
    <div className="flex h-screen bg-[#050608] relative overflow-hidden font-sans">
      {/* Cinematic Effects */}
      <div className="scanline" />
      <CosmicBackground />
      <div className="space-grid opacity-40" />
      <div className="stars-overlay" />
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}


      {/* Sidebar Container */}
      <div className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition-all duration-500 ease-[0.16, 1, 0.3, 1] z-50 lg:z-20`}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>


      <div className="flex-1 flex flex-col min-w-0 relative z-10 w-full">
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 md:p-10 custom-scrollbar relative">
          <div className="max-w-[1440px] mx-auto h-full flex flex-col relative">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};


export default Layout;
