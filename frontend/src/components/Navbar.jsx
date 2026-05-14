import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuthStore from '../store/authStore';
import { getAvatarUrl } from "../utils/avatar";
import NotificationDropdown from "./NotificationDropdown";

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="h-20 px-8 flex items-center justify-between relative z-30"
    >
      <div className="flex items-center gap-6">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-3 rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all shadow-holographic"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <div className="hidden lg:flex items-center gap-3 px-6 py-2 bg-gradient-to-r from-white/10 to-white/5 border border-white/10 rounded-full backdrop-blur-2xl shadow-[0_0_15px_rgba(255,255,255,0.05)]">
          <div className="w-2 h-2 rounded-full bg-cyber-cyan animate-pulse shadow-[0_0_10px_rgba(0,243,255,0.8)]"></div>
          <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] font-orbitron italic">System Nominal • Sector 7G</span>
        </div>
      </div>
 
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <NotificationDropdown />
          
          <div className="w-px h-8 bg-white/10 mx-2"></div>
          
          <motion.button 
            whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(255,0,85,0.5)" }}
            whileTap={{ scale: 0.95 }}
            onClick={logout}
            className="group px-6 py-3 bg-gradient-to-r from-cyber-pink/10 to-transparent border border-cyber-pink/30 text-cyber-pink rounded-2xl hover:bg-cyber-pink hover:text-white transition-all duration-300 flex items-center gap-3 shadow-[0_0_15px_-5px_rgba(255,0,85,0.4)] font-orbitron italic text-[10px] font-black uppercase tracking-widest"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Disconnect
          </motion.button>
        </div>
      </div>
      
      {/* Cinematic Glass Background */}
      <div className="absolute inset-x-8 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-cyber-cyan/20 to-transparent"></div>
    </motion.header>
  );
};

export default Navbar;
