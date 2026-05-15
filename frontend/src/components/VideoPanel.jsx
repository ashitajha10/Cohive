import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAvatarUrl } from "../utils/avatar";

const VideoPanel = ({ localStream, participants, mediaError, user, isMuted, isCameraOff, isScreenSharing }) => {
  const [focusedId, setFocusedId] = React.useState(null);

  const allParticipants = [
    { 
      id: 'local', 
      stream: localStream, 
      name: 'YOU', 
      isLocal: true, 
      isMuted, 
      isCameraOff, 
      isScreenSharing,
      avatar: user?.avatar,
      displayName: user?.displayName || user?.name
    },
    ...participants
  ];

  const focusedParticipant = allParticipants.find(p => p.id === focusedId) || (allParticipants.length === 1 ? allParticipants[0] : null);

  const gridParticipants = focusedId 
    ? allParticipants.filter(p => p.id !== focusedId) 
    : allParticipants;

  const gridClass = gridParticipants.length === 0 ? '' :
                   gridParticipants.length === 1 ? 'grid-cols-1 max-w-4xl mx-auto' : 
                   gridParticipants.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 
                   gridParticipants.length <= 4 ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-3';

  return (
    <div className="w-full h-full flex flex-col relative bg-[#050608]/40 overflow-hidden">
      {mediaError && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-8 left-1/2 -translate-x-1/2 z-50 bg-cyber-pink/10 border border-cyber-pink/20 backdrop-blur-xl px-6 py-3 rounded-2xl flex items-center gap-3 shadow-glow-pink"
        >
          <div className="w-6 h-6 rounded-full bg-cyber-pink flex items-center justify-center text-white font-black text-xs">!</div>
          <div>
            <p className="text-[10px] font-black text-white uppercase tracking-widest">Signal Error</p>
            <p className="text-[8px] text-cyber-pink font-bold uppercase tracking-widest">{mediaError}</p>
          </div>
        </motion.div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row h-full min-h-0">
        {/* Focused Video Area */}
        {focusedId && focusedParticipant && (
          <motion.div 
            layoutId={focusedParticipant.id}
            className="flex-[3] relative p-4 h-full"
          >
            <div className="w-full h-full rounded-[4rem] overflow-hidden bg-[#050608] border-2 border-cyber-cyan/40 shadow-[0_0_50px_-10px_rgba(0,243,255,0.3)] relative group transition-all duration-700">
              <div className="absolute inset-0 bg-gradient-to-br from-cyber-cyan/10 to-transparent pointer-events-none z-10" />
              {!focusedParticipant.isCameraOff && focusedParticipant.stream ? (
                <VideoElement stream={focusedParticipant.stream} muted={focusedParticipant.isLocal} />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0a0b0d] to-[#050608]">
                  <div className="w-32 h-32 rounded-[3rem] bg-[#0a0b0d] border border-white/10 flex items-center justify-center text-white font-black text-4xl shadow-2xl">
                    {focusedParticipant.avatar ? (
                      <img src={getAvatarUrl(focusedParticipant.avatar)} alt="" className="w-full h-full object-cover rounded-[2.9rem]" />
                    ) : (
                      <span className="glow-text-cyan">{(focusedParticipant.displayName || focusedParticipant.name)?.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                </div>
              )}
              
              <div className="absolute top-8 left-8 flex items-center gap-3">
                <div className="px-5 py-2.5 bg-black/60 backdrop-blur-2xl rounded-2xl border border-white/10 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-cyber-cyan animate-pulse shadow-glow-cyan" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">
                    {focusedParticipant.name} {focusedParticipant.isLocal && '(YOU)'}
                  </span>
                </div>
                <button 
                  onClick={() => setFocusedId(null)}
                  className="px-5 py-2.5 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-cyber-cyan transition-colors shadow-2xl"
                >
                  Exit Focus
                </button>
              </div>

              {focusedParticipant.isScreenSharing && (
                <div className="absolute bottom-8 left-8 px-5 py-2 bg-cyber-cyan text-black rounded-xl font-black text-[10px] uppercase tracking-widest shadow-glow-cyan">
                  Presenting Mode
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Participant List (Side or Grid) */}
        <div className={`flex-1 p-6 overflow-y-auto custom-scrollbar ${focusedId ? 'lg:max-w-xs' : 'w-full h-full'}`}>
          <div className={`grid ${focusedId ? 'grid-cols-1 gap-4' : gridClass + ' gap-6 content-center'}`}>
            <AnimatePresence mode="popLayout">
              {gridParticipants.map((p) => (
                <motion.div
                  key={p.id}
                  layoutId={p.id}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className={`relative rounded-[3rem] overflow-hidden bg-gradient-to-br from-[#0a0b0d] to-[#050608] border-2 transition-all duration-500 shadow-[0_8px_30px_rgb(0,0,0,0.5)] group aspect-video cursor-pointer hover:-translate-y-1 ${
                    p.isActiveSpeaker ? 'border-cyber-cyan shadow-[0_0_30px_-5px_rgba(0,243,255,0.5)] z-10' : 'border-white/5 hover:border-cyber-cyan/40 hover:shadow-[0_0_20px_-5px_rgba(0,243,255,0.3)]'
                  }`}
                  onClick={() => setFocusedId(p.id)}
                >
                  {!p.isCameraOff && p.stream ? (
                    <VideoElement stream={p.stream} muted={p.isLocal} />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#0a0b0d] to-[#050608]">
                      <div className="w-16 h-16 rounded-2xl bg-[#0a0b0d] border border-white/10 flex items-center justify-center text-white font-black text-xl shadow-2xl">
                        {p.avatar ? (
                          <img src={getAvatarUrl(p.avatar)} alt="" className="w-full h-full object-cover rounded-2xl" />
                        ) : (
                          <span className="glow-text-cyan">{(p.displayName || p.name)?.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                  
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <div className="px-3 py-1 bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 flex items-center gap-2">
                      <div className={`w-1 h-1 rounded-full ${p.isActiveSpeaker ? 'bg-cyber-cyan animate-pulse shadow-glow-cyan' : 'bg-gray-600'}`} />
                      <span className="text-[8px] font-black text-white uppercase tracking-widest">{p.name}</span>
                    </div>
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
                    <div className="px-5 py-2 bg-white text-black rounded-xl text-[9px] font-black uppercase tracking-widest shadow-2xl transform translate-y-2 group-hover:translate-y-0 transition-transform">Focus ID</div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};



const VideoElement = ({ stream, muted }) => {
  const videoRef = React.useRef();
  
  React.useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={muted}
      className="w-full h-full object-cover scale-x-[-1]"
    />
  );
};

export default VideoPanel;
