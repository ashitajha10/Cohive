import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import Layout from "../components/Layout";
import useAuthStore from "../store/authStore";
import Loader from "../components/Loader";
import Card from "../components/Card";
import { DEFAULT_AVATAR } from "../utils/constants";

function JoinRoom() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const joinRoom = async () => {
      try {
        const res = await api.post("/rooms/join", { code });
        navigate(`/room/${res.data._id}`);
      } catch (err) {
        console.error("Failed to join room:", err);
        setError(err.response?.data?.message || "Invalid invite code or room not found.");
      } finally {
        setLoading(false);
      }
    };
    if (code) joinRoom();
    else {
      setError("No invite code provided.");
      setLoading(false);
    }
  }, [code, navigate]);

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-full gap-6 page-transition">
          <div className="relative">
            <Loader size="xl" />
            <img src={DEFAULT_AVATAR} className="w-12 h-12 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" alt="astronaut" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tighter glow-text-cyan">Joining Room...</h2>
          <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px]">Connecting to room with code {code}</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full page-transition">
          <Card className="text-center py-12 px-10 max-w-md w-full border-white/5 bg-cyber-black/50 backdrop-blur-3xl shadow-glow-cyan rounded-[3rem]">
            <div className="w-24 h-24 bg-cyber-pink/10 text-cyber-pink rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-cyber-pink/20 shadow-lg">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight mb-3">Failed to Join Room</h2>
            <p className="text-gray-400 font-bold text-sm mb-10 leading-relaxed uppercase tracking-wider">{error}</p>
            <button 
              className="w-full bg-cyber-cyan hover:bg-cyber-cyan/90 py-4 rounded-2xl text-xs font-black text-black uppercase tracking-[0.2em] shadow-glow-cyan transition-all hover:scale-105 active:scale-95  "
              onClick={() => navigate("/dashboard")}
            >
              Back to Dashboard
            </button>
          </Card>
        </div>
      </Layout>
    );
  }

  return null;
}

export default JoinRoom;
