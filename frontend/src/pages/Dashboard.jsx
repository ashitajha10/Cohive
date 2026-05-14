import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";
import useAuthStore from "../store/authStore";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Button from "../components/Button";
import Loader from "../components/Loader";
import { useToast } from "../context/ToastContext";
import { getAvatarUrl } from "../utils/avatar";

import UserSearch from "../components/UserSearch";
import FriendRequestList from "../components/FriendRequestList";
import FriendList from "../components/FriendList";
import useFriendStore from "../store/friendStore";

function Dashboard({ view = "rooms" }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteCode, setInviteCode] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [friendTab, setFriendTab] = useState("friends");
  const [showSearch, setShowSearch] = useState(false);
  
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { friendRequests } = useFriendStore();
  const { showToast } = useToast();

  const handleJoinRoom = async () => {
    if (!inviteCode.trim()) return;
    setJoinLoading(true);
    try {
      const res = await api.post("/rooms/join", { code: inviteCode.trim().toUpperCase() });
      showToast(`Access granted: ${res.data.name}`, "success");
      navigate(`/room/${res.data._id}`);
    } catch (err) {
      showToast(err.response?.data?.message || "Invalid uplink code", "error");
    } finally {
      setJoinLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const res = await api.get("/rooms");
        if (isMounted) setRooms(res.data);
      } catch (err) {
        console.error("Failed to fetch rooms:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  if (loading) return <Layout><div className="flex items-center justify-center h-full"><Loader size="xl" /></div></Layout>;

  return (
    <Layout>
      <div className="relative z-10 space-y-12 pb-20 max-w-7xl mx-auto px-6 md:px-0">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyber-cyan/5 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyber-pink/5 rounded-full blur-[120px] animate-pulse delay-700" />
        </div>

        {/* Cinematic Header */}
        <motion.div 
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <div className="relative flex flex-col lg:flex-row lg:items-end justify-between gap-10">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyber-cyan animate-pulse shadow-glow-cyan" />
                  <div className="w-1.5 h-1.5 rounded-full bg-cyber-cyan/40 animate-pulse delay-75" />
                  <div className="w-1.5 h-1.5 rounded-full bg-cyber-cyan/10 animate-pulse delay-150" />
                </div>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Neural Link Status: Verified</span>
              </div>
              <h1 className="text-5xl sm:text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-gray-500 tracking-tighter uppercase leading-[0.9]">
                {view === "friends" ? "Contact" : "Control"}<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-cyan to-cyber-cyan/50 hover:to-cyber-pink transition-all duration-700">Center.</span>
              </h1>
              <p className="text-gray-400 text-xs font-black uppercase tracking-[0.3em] max-w-md mt-6 border-l-2 border-cyber-cyan/40 pl-4 py-1">
                {view === "friends" 
                  ? "Access the unified member manifest for global collaboration." 
                  : "Monitor and manage synchronized mission workspaces."}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-4 sm:gap-6 w-full lg:w-auto">
              {view === "rooms" && (
                <>
                  <div className="relative group/input flex flex-1 sm:flex-none items-center bg-[#0a0b0d]/50 border border-white/10 rounded-2xl sm:rounded-3xl overflow-hidden focus-within:border-cyber-cyan focus-within:shadow-[0_0_20px_rgba(0,243,255,0.2)] transition-all duration-500 backdrop-blur-xl">
                    <input 
                      type="text" 
                      placeholder="UPLINK CODE" 
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                      className="px-6 py-4 sm:px-8 sm:py-5 bg-transparent outline-none text-[11px] font-black text-white w-full sm:w-48 lg:w-64 placeholder:text-gray-600 tracking-[0.4em]"
                      maxLength={6}
                    />
                    <button 
                      onClick={handleJoinRoom}
                      disabled={!inviteCode.trim() || joinLoading}
                      className="h-full px-6 py-4 sm:px-8 sm:py-5 bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-cyber-cyan hover:shadow-glow-cyan transition-all duration-300 disabled:opacity-50 disabled:hover:bg-white disabled:hover:shadow-none border-l border-white/10 whitespace-nowrap"
                    >
                      {joinLoading ? "SYNC..." : "JOIN"}
                    </button>
                  </div>
                  
                  <motion.button 
                    whileHover={{ scale: 1.05, boxShadow: "0 0 30px -5px rgba(0,243,255,0.6)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/room/new-room')}
                    className="flex-1 sm:flex-none px-8 py-4 sm:px-10 sm:py-5 bg-gradient-to-r from-cyber-cyan to-cyber-cyan/80 text-black rounded-2xl sm:rounded-3xl text-[10px] font-black uppercase tracking-widest hover:text-white transition-all shadow-[0_0_20px_-5px_rgba(0,243,255,0.4)] whitespace-nowrap text-center"
                  >
                    Launch Workspace
                  </motion.button>
                </>
              )}
              {view === "friends" && (
                <button 
                  onClick={() => setShowSearch(!showSearch)}
                  className={`flex-1 sm:flex-none py-4 px-8 sm:py-5 sm:px-10 rounded-2xl sm:rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-4 border ${showSearch ? 'bg-white border-white text-black shadow-glow-cyan' : 'bg-white/[0.03] text-gray-500 border-white/5 hover:border-white/20'}`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  Search Registry
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Global Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pt-8 border-t border-white/5">
          {view === "friends" ? (
            <div className="flex bg-white/[0.02] p-1.5 rounded-[2rem] border border-white/5 backdrop-blur-3xl">
              {['friends', 'requests'].map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setFriendTab(tab)}
                  className={`px-10 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all relative ${friendTab === tab ? 'bg-white text-black shadow-glow-cyan' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  {tab === 'friends' ? 'Verified List' : 'Uplink Requests'}
                  {tab === 'requests' && friendRequests.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-6 h-6 bg-cyber-pink rounded-full text-[10px] flex items-center justify-center border-2 border-[#050608] shadow-glow-pink">
                      {friendRequests.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="relative flex-1 max-w-2xl group">
              <svg className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-700 group-focus-within:text-cyber-cyan transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                type="text" 
                placeholder="SCAN MISSION DATABASE..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-16 pr-8 py-5 bg-[#0a0b0d]/60 border border-white/10 rounded-3xl text-[11px] font-black text-white placeholder:text-gray-600 focus:border-cyber-cyan focus:shadow-[0_0_20px_rgba(0,243,255,0.15)] transition-all outline-none tracking-[0.3em] backdrop-blur-xl"
              />
            </div>
          )}
          
          <div className="flex items-center gap-6">
            <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">Protocol</span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white/[0.02] border border-white/5 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest py-4 pl-6 pr-12 focus:border-cyber-cyan/40 outline-none cursor-pointer hover:bg-white/[0.04] transition-all appearance-none backdrop-blur-xl"
            >
              <option value="recent">Recent Sync</option>
              <option value="name">Alpha Stream</option>
              {view === "rooms" && <option value="members">Density</option>}
            </select>
          </div>
        </div>

        {/* Content Matrix */}
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="min-h-[500px]"
        >
          {view === "friends" ? (
            friendTab === 'friends' ? <FriendList searchQuery={searchQuery} /> : <FriendRequestList />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {(() => {
                let filtered = rooms.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));
                if (sortBy === "name") filtered.sort((a, b) => a.name.localeCompare(b.name));
                else if (sortBy === "members") filtered.sort((a, b) => (b.members?.length || 0) - (a.members?.length || 0));
                else filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                if (filtered.length === 0) {
                  return (
                    <motion.div 
                      variants={item}
                      className="col-span-full py-48 text-center"
                    >
                      <div className="w-32 h-32 bg-white/[0.02] rounded-[3rem] flex items-center justify-center mx-auto mb-8 border border-white/5 shadow-2xl">
                        <svg className="w-12 h-12 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                      </div>
                      <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-3">Void Detected</h3>
                      <p className="text-gray-700 text-[10px] font-black uppercase tracking-[0.4em]">No synchronized workspaces found in registry.</p>
                    </motion.div>
                  );
                }

                return filtered.map((room) => (
                  <motion.div
                    key={room._id}
                    variants={item}
                    whileHover={{ y: -12, scale: 1.01 }}
                    className="group"
                    onClick={() => navigate(`/room/${room._id}`)}
                  >
                    <div className="relative h-full p-10 rounded-[3.5rem] bg-gradient-to-b from-white/[0.05] to-white/[0.01] border border-white/10 hover:border-cyber-cyan/50 hover:shadow-[0_0_40px_rgba(0,243,255,0.1)] transition-all duration-500 cursor-pointer overflow-hidden backdrop-blur-xl group/card">
                      {/* Interactive Glow */}
                      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-cyber-cyan/20 to-transparent blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-cyber-pink/10 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                      
                      <div className="flex items-start justify-between mb-10 relative z-10">
                        <div className="w-20 h-20 bg-[#0a0b0d] rounded-[2rem] flex items-center justify-center text-white font-black text-3xl border border-white/5 group-hover:border-cyber-cyan/30 group-hover:shadow-[0_0_30px_rgba(0,243,255,0.2)] transition-all duration-500">
                          {room.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex -space-x-3">
                          {room.members?.slice(0, 3).map((member, i) => {
                            const name = typeof member === 'object' ? (member.displayName || member.name) : "User";
                            const avatar = typeof member === 'object' ? member.avatar : null;
                            return (
                              <div key={i} className="w-10 h-10 rounded-2xl bg-cyber-grey-800 border-2 border-[#0a0b0d] overflow-hidden shadow-2xl">
                                {avatar ? <img src={getAvatarUrl(avatar)} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-white bg-gradient-to-br from-gray-800 to-gray-900">{name.charAt(0).toUpperCase()}</div>}
                              </div>
                            );
                          })}
                          {(room.members?.length || 0) > 3 && (
                            <div className="w-10 h-10 rounded-2xl bg-white text-black text-[10px] font-black flex items-center justify-center border-2 border-[#0a0b0d] shadow-2xl">
                              +{(room.members?.length || 0) - 3}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="relative z-10">
                        <h3 className="text-2xl font-black text-white group-hover:text-cyber-cyan transition-all duration-500 tracking-tighter uppercase mb-3 line-clamp-1">{room.name}</h3>
                        <div className="flex items-center gap-4">
                          <div className="px-3 py-1 bg-white/[0.05] rounded-lg border border-white/5">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{room.members?.length || 0} SEATS</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-cyber-cyan animate-pulse shadow-glow-cyan" />
                            <span className="text-[9px] font-black text-cyber-cyan uppercase tracking-[0.2em]">SYNCHRONIZED</span>
                          </div>
                        </div>
                      </div>

                      {/* Animated Portal Indicator */}
                      <div className="absolute bottom-10 right-10 flex items-center gap-3 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500">
                        <span className="text-[9px] font-black text-cyber-cyan uppercase tracking-[0.3em]">ENTER</span>
                        <div className="w-10 h-10 rounded-full bg-cyber-cyan/10 flex items-center justify-center border border-cyber-cyan/20">
                          <svg className="w-5 h-5 text-cyber-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                        </div>
                      </div>
                      
                      {/* Subtle Grid Overlay */}
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02] pointer-events-none" />
                    </div>
                  </motion.div>
                ));
              })()}
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}


export default Dashboard;