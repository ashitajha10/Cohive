import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Button from "../components/Button";
import useAuthStore from "../store/authStore";
import { useToast } from "../context/ToastContext";

function CreateRoom() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { showToast } = useToast();

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await api.post("/rooms", { name: name.trim() });
      showToast(`Workspace initialized: ${res.data.name}`, "success");
      navigate(`/room/${res.data._id}`);
    } catch (err) {
      showToast(err.response?.data?.message || "Uplink failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="relative z-10 max-w-4xl mx-auto py-24 px-6 md:px-0">
        {/* Animated Orbs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[20%] left-[10%] w-[30%] h-[30%] bg-cyber-cyan/5 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-[20%] right-[10%] w-[30%] h-[30%] bg-cyber-pink/5 rounded-full blur-[100px] animate-pulse delay-700" />
        </div>

        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-20 text-center"
        >
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 90 }}
            className="inline-flex items-center justify-center w-28 h-28 bg-[#0a0b0d] rounded-[3rem] border border-white/10 shadow-[0_0_50px_-10px_rgba(0,243,255,0.3)] mb-12"
          >
            <svg className="w-10 h-10 text-cyber-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
          </motion.div>
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter uppercase leading-none mb-6">
            Initialize<br/>
            <span className="text-cyber-cyan">Workspace.</span>
          </h1>
          <p className="text-gray-500 font-black uppercase tracking-[0.5em] text-[10px]">Neural Sync Protocol 4.0</p>
        </motion.div>

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="p-16 bg-[#0a0b0d]/60 border border-white/10 backdrop-blur-3xl shadow-[0_64px_128px_-16px_rgba(0,0,0,0.8)] rounded-[4rem] relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-cyber-cyan to-transparent opacity-50" />
            
            <form onSubmit={handleCreate} className="space-y-16 relative z-10">
              <div className="space-y-6">
                <label htmlFor="roomName" className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.5em] ml-2">
                  Callsign Allocation
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="roomName"
                    className="block w-full px-12 py-8 bg-white/[0.03] border border-white/5 rounded-[2.5rem] focus:border-cyber-cyan/40 transition-all duration-500 outline-none text-white font-black text-3xl placeholder-gray-900 tracking-tight"
                    placeholder="ENTER WORKSPACE NAME..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoFocus
                  />
                  <div className="absolute top-1/2 -translate-y-1/2 right-10 text-[9px] font-black text-cyber-cyan/20 uppercase tracking-[0.3em]">Neural_ID_Pending</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={!name.trim() || loading}
                  className="flex-[2] py-6 rounded-[2.5rem] bg-white text-black font-black text-xs uppercase tracking-[0.4em] shadow-glow-cyan hover:bg-cyber-cyan transition-all disabled:opacity-50"
                >
                  {loading ? "INITIALIZING..." : "INITIATE UPLINK"}
                </motion.button>
                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="flex-1 py-6 rounded-[2.5rem] bg-white/[0.03] border border-white/5 text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] hover:text-white hover:bg-white/[0.06] transition-all"
                >
                  ABORT
                </button>
              </div>
            </form>
          </div>
        </motion.div>

        {/* Security Manifest */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 bg-white/[0.02] border border-white/5 rounded-[3rem] p-10 flex gap-8 items-center backdrop-blur-xl relative overflow-hidden"
        >
          <div className="w-16 h-16 bg-white/[0.03] rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/5">
            <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="text-white font-black text-[10px] uppercase tracking-[0.3em] mb-2">Protocol Note</h4>
            <p className="text-gray-600 text-[11px] leading-relaxed font-black uppercase tracking-widest">
              All workspaces are encrypted and private. Share your <span className="text-cyber-cyan">Neural Code</span> only with authorized collaborators.
            </p>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}


export default CreateRoom;