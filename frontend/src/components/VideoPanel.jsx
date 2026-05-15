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

    <div className="w-full h-full flex flex-col relative bg-transparent overflow-hidden">
      {mediaError && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-8 left-1/2 -translate-x-1/2 z-50 bg-red-500/10 border border-red-500/20 backdrop-blur-xl px-6 py-3 rounded-2xl flex items-center gap-3"
        >
          <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-xs">!</div>
          <div>
            <p className="text-xs font-semibold text-white uppercase tracking-wider">Signal Error</p>
            <p className="text-[10px] text-red-400 font-medium">{mediaError}</p>
          </div>
        </motion.div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row h-full min-h-0 gap-4 p-4">
        {/* Focused Video Area */}
        {focusedId && focusedParticipant && (
          <motion.div 
            layoutId={focusedParticipant.id}
            className="flex-1 relative h-full rounded-2xl overflow-hidden bg-black"
          >
            {!focusedParticipant.isCameraOff && focusedParticipant.stream ? (
              <VideoElement stream={focusedParticipant.stream} muted={focusedParticipant.isLocal} />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#0d1117]">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyber-cyan/20 to-blue-600/20 border border-white/5 flex items-center justify-center text-white font-bold text-4xl">
                  {focusedParticipant.avatar ? (
                    <img src={getAvatarUrl(focusedParticipant.avatar)} alt="" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <span>{(focusedParticipant.displayName || focusedParticipant.name)?.charAt(0).toUpperCase()}</span>
                  )}
                </div>
              </div>
            )}
            
            <div className="absolute top-4 left-4 flex items-center gap-2 z-30">
              <div className="px-4 py-2 bg-black/50 backdrop-blur-md rounded-lg flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs font-semibold text-white">
                  {focusedParticipant.name} {focusedParticipant.isLocal && '(You)'}
                </span>
                {focusedParticipant.isLocal && <span className="ml-1 text-[10px] bg-cyber-cyan/20 text-cyber-cyan px-1.5 py-0.5 rounded">Host</span>}
              </div>
            </div>

            {focusedParticipant.isMuted && (
              <div className="absolute top-4 right-4 p-2 bg-red-500/80 backdrop-blur-md rounded-full text-white z-30">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4l16 16" /></svg>
              </div>
            )}

            {focusedParticipant.isScreenSharing && (
              <div className="absolute bottom-4 left-4 px-4 py-1.5 bg-cyber-cyan text-black rounded-lg font-bold text-xs uppercase tracking-wide">
                Presenting
              </div>
            )}
          </motion.div>
        )}

        {/* Participant List (Side or Grid) */}
        <div className={`overflow-y-auto custom-scrollbar ${focusedId ? 'w-48 lg:w-56' : 'w-full h-full'}`}>
          <div className={`grid ${focusedId ? 'grid-cols-1 gap-3' : gridClass + ' gap-4 content-center h-full'}`}>
            <AnimatePresence mode="popLayout">
              {gridParticipants.map((p) => (
                <motion.div
                  key={p.id}
                  layoutId={p.id}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className={`relative rounded-xl overflow-hidden bg-[#0d1117] transition-all duration-300 cursor-pointer ${
                    focusedId ? 'aspect-video' : 'aspect-video w-full max-w-4xl mx-auto'
                  } ${
                    p.isActiveSpeaker ? 'ring-2 ring-cyber-cyan' : 'border border-white/5 hover:border-white/20'
                  }`}
                  onClick={() => setFocusedId(p.id)}
                >
                  {!p.isCameraOff && p.stream ? (
                    <VideoElement stream={p.stream} muted={p.isLocal} />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#0d1117]">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyber-cyan/20 to-blue-600/20 border border-white/5 flex items-center justify-center text-white font-bold text-lg">
                        {p.avatar ? (
                          <img src={getAvatarUrl(p.avatar)} alt="" className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <span>{(p.displayName || p.name)?.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                  
                  <div className="absolute bottom-2 left-2 flex items-center gap-2 z-30 w-[calc(100%-1rem)]">
                    <div className="flex-1 min-w-0">
                      <span className="text-[11px] font-medium text-white truncate block">
                        {p.name}
                      </span>
                    </div>
                    {p.isMuted && (
                      <div className="w-5 h-5 rounded-full bg-red-500/80 flex items-center justify-center text-white flex-shrink-0">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4l16 16" /></svg>
                      </div>
                    )}
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
