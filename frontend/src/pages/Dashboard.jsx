import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";
import useAuthStore from "../store/authStore";
import Layout from "../components/Layout";
import Loader from "../components/Loader";
import { useToast } from "../context/ToastContext";
import { getAvatarUrl } from "../utils/avatar";

function Dashboard() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("Recent Activity");
  
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { showToast } = useToast();

  useEffect(() => {
    const mainEl = document.querySelector("main");
    if (mainEl) {
      mainEl.scrollTop = 0;
    }

    const fetchData = async () => {
      try {
        const res = await api.get("/rooms");
        setRooms(res.data);
      } catch (err) {
        console.error("Failed to fetch rooms:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const sortedRooms = [...rooms]
    .filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "Workspace Name") {
        return a.name.localeCompare(b.name);
      } else if (sortBy === "Member Density") {
        return (b.members?.length || 0) - (a.members?.length || 0);
      } else {
        // Default: Recent Activity (by updatedAt or createdAt descending)
        const dateA = new Date(a.updatedAt || a.createdAt);
        const dateB = new Date(b.updatedAt || b.createdAt);
        return dateB - dateA;
      }
    });

  if (loading) return <Layout><div className="flex items-center justify-center h-full"><Loader size="xl" /></div></Layout>;

  return (
    <Layout>
      <div className="space-y-10 animate-fade-in">
        
        {/* Welcome Header Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-purple-50/50 via-indigo-50/20 to-transparent p-10 rounded-[3rem] border border-purple-100/30">
          <div className="relative z-10">
            <span className="text-[10px] font-black text-[#8b5cf6] uppercase tracking-[0.3em]">Workspace Central</span>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mt-2 mb-3">
              Welcome back, {user?.displayName || user?.name || "Collaborator"}! 👋
            </h1>
            <p className="text-gray-500 text-sm font-medium max-w-xl leading-relaxed">
              Your real-time collaboration hub is active. Browse your crew's workspaces below, or navigate to "My Rooms" to create or join a room.
            </p>
          </div>
          
          {/* Subtle Decorative Backdrop Blur */}
          <div className="absolute right-10 top-1/2 -translate-y-1/2 w-48 h-48 bg-purple-200/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
        </div>

        {/* Recent Activity Section Header */}
        <div className="pt-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Recent Activity</h2>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mt-1">Active collaboration spaces</p>
            </div>
          </div>
        </div>

        {/* Global Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-6 border-y border-gray-100">
          <div className="relative flex-1 max-w-xl group">
            <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-[#8b5cf6] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="Search active workspaces..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-medium text-gray-800 placeholder:text-gray-300 focus:border-purple-200 outline-none transition-all"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sort By:</span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-600 uppercase tracking-widest py-2 pl-4 pr-10 outline-none cursor-pointer hover:bg-gray-50 transition-all"
            >
              <option>Recent Activity</option>
              <option>Workspace Name</option>
              <option>Member Density</option>
            </select>
          </div>
        </div>

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
          <AnimatePresence mode="popLayout">
            {sortedRooms.map((room) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={room._id}
                onClick={() => navigate(`/room/${room._id}`)}
                whileHover={{ y: -6, scale: 1.01 }}
                className="group bg-white p-8 rounded-[2.5rem] border border-gray-100 hover:border-purple-200 hover:shadow-[0_20px_40px_rgba(139,92,246,0.04)] transition-all duration-300 cursor-pointer flex flex-col gap-8 relative overflow-hidden"
              >
                <div className="flex items-start justify-between relative z-10">
                  <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center text-[#8b5cf6] font-bold text-2xl border border-purple-100 group-hover:bg-[#8b5cf6] group-hover:text-white transition-all duration-300">
                    {room.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex -space-x-3">
                    {room.members?.slice(0, 3).map((member, i) => (
                      <div key={i} className="w-9 h-9 rounded-xl bg-gray-100 border-2 border-white overflow-hidden shadow-sm">
                        <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-gray-400 bg-gray-50">
                          {typeof member === 'object' ? (member.displayName || member.name).charAt(0).toUpperCase() : "U"}
                        </div>
                      </div>
                    ))}
                    {(room.members?.length || 0) > 3 && (
                      <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#8b5cf6] text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-sm">
                        +{(room.members?.length || 0) - 3}
                      </div>
                    )}
                  </div>
                </div>

                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#8b5cf6] transition-colors">{room.name}</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-full border border-gray-100">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{room.members?.length || 0} Members</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active</span>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-8 right-8 p-3 bg-purple-50 rounded-full opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-4 transition-all duration-300">
                  <svg className="w-5 h-5 text-[#8b5cf6]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {sortedRooms.length === 0 && (
            <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border border-dashed border-gray-200">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Active Workspaces</h3>
              <p className="text-gray-400 text-sm">Please navigate to the "My Rooms" section to create or join a space.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;