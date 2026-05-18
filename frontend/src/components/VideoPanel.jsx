import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAvatarUrl } from "../utils/avatar";

const VideoPanel = ({ localStream, participants, mediaError, user, isMuted, isCameraOff, isScreenSharing, createdBy, screenStream }) => {
  const [focusedId, setFocusedId] = React.useState(null);

  const creatorId = createdBy?._id || createdBy;

  const allParticipants = [
    { 
      id: 'local', 
      stream: localStream, 
      screenStream: screenStream,
      name: 'YOU', 
      isLocal: true, 
      isMuted, 
      isCameraOff, 
      isScreenSharing,
      avatar: user?.avatar,
      displayName: user?.displayName || user?.name,
      userId: user?._id
    },
    ...participants.map(p => ({
      id: p.socketId,
      stream: p.stream,
      screenStream: p.screenStream,
      name: p.user?.displayName || p.user?.name || 'Explorer',
      isLocal: false,
      isMuted: p.isMuted,
      isCameraOff: p.isCameraOff,
      isScreenSharing: p.isScreenSharing,
      avatar: p.user?.avatar,
      displayName: p.user?.displayName || p.user?.name || 'Explorer',
      userId: p.user?._id || p.userId,
      isActiveSpeaker: p.isActiveSpeaker
    }))
  ];

  const screenSharer = allParticipants.find(p => p.isScreenSharing);
  const effectiveFocusedParticipant = allParticipants.find(p => p.id === focusedId) || screenSharer || (allParticipants.length === 1 ? allParticipants[0] : null);
  const isFocusedMode = !!focusedId || !!screenSharer;

  const gridParticipants = isFocusedMode 
    ? allParticipants.filter(p => {
        if (p.id === effectiveFocusedParticipant.id && p.isScreenSharing) {
          return true;
        }
        return p.id !== effectiveFocusedParticipant.id;
      })
    : allParticipants;

  const gridClass = gridParticipants.length === 0 ? '' :
                   gridParticipants.length === 1 ? 'grid-cols-1 max-w-4xl mx-auto' : 
                   gridParticipants.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 
                   gridParticipants.length <= 4 ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-3';

  const cardMaxHeightClass = isFocusedMode 
    ? 'max-h-[18vh]' 
    : (gridParticipants.length === 1 ? 'max-h-[62vh] max-w-5xl' :
       gridParticipants.length === 2 ? 'max-h-[58vh]' :
       gridParticipants.length <= 4 ? 'max-h-[36vh]' : 'max-h-[26vh]');

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

      <div className={`flex-1 flex h-full min-h-0 ${isFocusedMode ? 'flex-row' : 'flex-col lg:flex-row'}`}>
        {isFocusedMode && effectiveFocusedParticipant && (
          <motion.div 
            layoutId={effectiveFocusedParticipant.id}
            className="flex-[3] relative p-4 h-full min-w-0"
          >
            <div className="w-full h-full rounded-[4rem] overflow-hidden bg-[#050608] border-2 border-cyber-cyan/40 shadow-[0_0_50px_-10px_rgba(0,243,255,0.3)] relative group transition-all duration-700">
              <div className="absolute inset-0 bg-gradient-to-br from-cyber-cyan/10 to-transparent pointer-events-none z-10" />
              {(effectiveFocusedParticipant.isScreenSharing && effectiveFocusedParticipant.screenStream) || 
               (!effectiveFocusedParticipant.isCameraOff && effectiveFocusedParticipant.stream) ? (
                <VideoElement 
                  stream={effectiveFocusedParticipant.isScreenSharing && effectiveFocusedParticipant.screenStream 
                    ? effectiveFocusedParticipant.screenStream 
                    : effectiveFocusedParticipant.stream} 
                  muted={effectiveFocusedParticipant.isLocal} 
                  mirror={effectiveFocusedParticipant.isLocal && !effectiveFocusedParticipant.isScreenSharing}
                  contain={effectiveFocusedParticipant.isScreenSharing}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0a0b0d] to-[#050608]">
                  <div className="w-32 h-32 rounded-[3rem] bg-[#0a0b0d] border border-white/10 flex items-center justify-center text-white font-black text-4xl shadow-2xl">
                    {effectiveFocusedParticipant.avatar ? (
                      <img src={getAvatarUrl(effectiveFocusedParticipant.avatar)} alt="" className="w-full h-full object-cover rounded-[2.9rem]" />
                    ) : (
                      <span className="glow-text-cyan">{(effectiveFocusedParticipant.displayName || effectiveFocusedParticipant.name)?.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                </div>
              )}
              
              <div className="absolute top-8 left-8 flex items-center gap-3">
                <div className="px-5 py-2.5 bg-black/60 backdrop-blur-2xl rounded-2xl border border-white/10 flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${effectiveFocusedParticipant.isMuted ? 'bg-red-500 shadow-glow-red animate-pulse' : 'bg-cyber-cyan animate-pulse shadow-glow-cyan'}`} />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                    {effectiveFocusedParticipant.name} {effectiveFocusedParticipant.isLocal && '(YOU)'}
                    {effectiveFocusedParticipant.isMuted && (
                      <span className="text-red-500 flex items-center shadow-[0_0_5px_rgba(239,68,68,0.4)]">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4l16 16" />
                        </svg>
                      </span>
                    )}
                  </span>
                  
                  {effectiveFocusedParticipant.userId && creatorId && (
                    effectiveFocusedParticipant.userId.toString() === creatorId.toString() ? (
                      <span className="px-2.5 py-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[8px] font-extrabold uppercase tracking-widest rounded-lg shadow-[0_0_10px_rgba(139,92,246,0.5)]">
                        Host
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 bg-white/10 text-white/70 text-[8px] font-extrabold uppercase tracking-widest rounded-lg border border-white/5">
                        Participant
                      </span>
                    )
                  )}
                </div>
                {focusedId && (
                  <button 
                    onClick={() => setFocusedId(null)}
                    className="px-5 py-2.5 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-cyber-cyan transition-colors shadow-2xl"
                  >
                    Exit Focus
                  </button>
                )}
              </div>

              {effectiveFocusedParticipant.isScreenSharing && (
                <div className="absolute bottom-8 left-8 px-5 py-2 bg-cyber-cyan text-black rounded-xl font-black text-[10px] uppercase tracking-widest shadow-glow-cyan">
                  Presenting Mode
                </div>
              )}
            </div>
          </motion.div>
        )}

        <div className={`flex-1 p-6 pb-32 overflow-y-auto custom-scrollbar ${isFocusedMode ? 'max-w-[180px] sm:max-w-[220px] md:max-w-[260px] h-full w-full' : 'w-full h-full flex flex-col justify-center'}`}>
          <div className={`grid ${isFocusedMode ? 'grid-cols-1 gap-4' : gridClass + ' gap-6 content-center justify-items-center w-full'}`}>
            <AnimatePresence mode="popLayout">
              {gridParticipants.map((p) => (
                <motion.div
                  key={p.id}
                  layoutId={p.id}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className={`relative rounded-[3rem] overflow-hidden bg-gradient-to-br from-[#0a0b0d] to-[#050608] border-2 transition-all duration-500 shadow-[0_8px_30px_rgb(0,0,0,0.5)] group aspect-video cursor-pointer hover:-translate-y-1 w-full ${cardMaxHeightClass} ${
                    p.isActiveSpeaker ? 'border-cyber-cyan shadow-[0_0_30px_-5px_rgba(0,243,255,0.5)] z-10' : 'border-white/5 hover:border-cyber-cyan/40 hover:shadow-[0_0_20px_-5px_rgba(0,243,255,0.3)]'
                  }`}
                  onClick={() => setFocusedId(p.id)}
                >
                  {!p.isCameraOff && p.stream ? (
                    <VideoElement 
                      stream={p.stream} 
                      muted={p.isLocal} 
                      mirror={p.isLocal && !p.isScreenSharing}
                      contain={p.isScreenSharing}
                    />
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
                      <div className={`w-1 h-1 rounded-full ${p.isMuted ? 'bg-red-500 shadow-glow-red animate-pulse' : p.isActiveSpeaker ? 'bg-cyber-cyan animate-pulse shadow-glow-cyan' : 'bg-gray-600'}`} />
                      <span className="text-[8px] font-black text-white uppercase tracking-widest flex items-center gap-1.5">
                        {p.name}
                        {p.isMuted && (
                          <span className="text-red-500 flex items-center shadow-[0_0_5px_rgba(239,68,68,0.4)]">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4l16 16" />
                            </svg>
                          </span>
                        )}
                      </span>
                      
                      {p.userId && creatorId && (
                        p.userId.toString() === creatorId.toString() ? (
                          <span className="px-1.5 py-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[6px] font-black uppercase tracking-wider rounded shadow-[0_0_5px_rgba(139,92,246,0.5)]">
                            Host
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 bg-white/10 text-white/60 text-[6px] font-black uppercase tracking-wider rounded border border-white/5">
                            Participant
                          </span>
                        )
                      )}
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



const VideoElement = ({ stream, muted, mirror, contain }) => {
  const videoRef = React.useRef();
  
  React.useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      // Force play to bypass browser autoplay blocks in separate tabs
      videoRef.current.play().catch(err => {
        console.warn("Video playback was suspended by autoplay policy:", err);
      });
    }
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={muted}
      className={`absolute inset-0 w-full h-full ${contain ? 'object-contain bg-black' : 'object-cover bg-[#050608]'} ${mirror ? 'scale-x-[-1]' : ''}`}
    />
  );
};

export default VideoPanel;
