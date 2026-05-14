import React, { useRef, useEffect } from 'react';
import { useActiveSpeaker } from '../hooks/useActiveSpeaker';
import { getAvatarUrl } from "../utils/avatar";

const ParticipantVideo = ({ 
  stream, 
  user, 
  isLocal, 
  isMuted, 
  isCameraOff, 
  isScreenSharing 
}) => {
  const videoRef = useRef();
  const isSpeaking = useActiveSpeaker(stream, isLocal);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className={`relative rounded-[2rem] overflow-hidden bg-[#0b0a24] border-2 transition-all duration-300 ${
      isSpeaking ? 'border-primary-500 shadow-glow-purple scale-[1.02]' : 'border-white/5'
    } aspect-video`}>
      {/* Video element */}
      {!isCameraOff || isScreenSharing ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className={`w-full h-full object-cover ${isScreenSharing ? 'object-contain' : ''}`}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-space-panel to-[#0b0a24]">
          <div className="w-24 h-24 rounded-full border-4 border-primary-500/20 flex items-center justify-center relative overflow-hidden bg-white/5">
            {user?.avatar ? (
              <img src={getAvatarUrl(user.avatar)} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl font-black text-white">
                {(user?.displayName || user?.name || "S").charAt(0).toUpperCase()}
              </span>
            )}
            <div className="absolute inset-0 bg-primary-500/10 animate-pulse" />
          </div>
        </div>
      )}

      {/* Speaking Indicator */}
      {isSpeaking && (
        <div className="absolute top-4 right-4 flex gap-1">
          <div className="w-1.5 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-1.5 h-5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-1.5 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      )}

      {/* Label and Status */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
        <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2">
          <span className="text-[10px] font-black text-white uppercase tracking-wider truncate max-w-[120px]">
            {isLocal ? 'You' : (user?.displayName || user?.name || 'Explorer')}
          </span>
          {isMuted && (
            <div className="text-red-500">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4l16 16" />
              </svg>
            </div>
          )}
        </div>
        
        {isScreenSharing && (
          <div className="bg-cyan-500/20 backdrop-blur-md px-3 py-1.5 rounded-xl border border-cyan-500/30 flex items-center gap-2">
            <svg className="w-3 h-3 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="text-[8px] font-black text-cyan-400 uppercase tracking-widest">Screen Sharing</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantVideo;
