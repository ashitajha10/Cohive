import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useFriendStore from '../store/friendStore';
import { getAvatarUrl } from '../utils/avatar';
import Button from './Button';
import { useToast } from '../context/ToastContext';

const FriendRequestList = () => {
  const { friendRequests, respondToRequest } = useFriendStore();
  const { showToast } = useToast();

  const handleResponse = async (requestId, status, senderId, senderName) => {
    const res = await respondToRequest(requestId, status, senderId);
    if (res.success) {
      showToast(status === 'accepted' ? `Neural link established with ${senderName}` : 'Transmission rejected', "success");
    } else {
      showToast(res.error, 'error');
    }
  };

  if (friendRequests.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="py-16 text-center glass-panel border-dashed border-white/10 rounded-[2.5rem]"
      >
        <p className="text-gray-600 font-black uppercase tracking-[0.4em] text-[10px] italic">No incoming transmissions detected.</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatePresence mode="popLayout">
        {friendRequests.map((request) => (
          <motion.div 
            key={request._id} 
            layout
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 20, opacity: 0 }}
            className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-[2.5rem] hover:border-primary-500/30 transition-all group backdrop-blur-3xl relative overflow-hidden shadow-holographic"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-primary-600"></div>
            
            <div className="flex items-center gap-6 relative z-10">
              <div className="relative">
                <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-all">
                  {request.sender.avatar ? (
                    <img src={getAvatarUrl(request.sender.avatar)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-black text-indigo-400 font-orbitron italic">
                      {(request.sender.displayName || request.sender.name)?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 rounded-full border-2 border-[#0b0a24] animate-pulse shadow-glow-purple"></div>
              </div>
              <div>
                <h4 className="text-xl font-black text-white font-orbitron uppercase italic tracking-tight">{request.sender.displayName || request.sender.name}</h4>
                <p className="text-[9px] font-black text-primary-500 uppercase tracking-[0.3em] mt-1 italic">Incoming Neural Link Request</p>
              </div>
            </div>

            <div className="flex gap-3 relative z-10">
              <button 
                className="p-4 bg-pink-500/10 hover:bg-pink-500 text-pink-500 hover:text-white rounded-2xl border border-pink-500/20 transition-all active:scale-90"
                onClick={() => handleResponse(request._id, 'rejected', request.sender._id, request.sender.name)}
                title="Reject Link"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <button 
                className="p-4 bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white rounded-2xl border border-green-500/20 transition-all shadow-glow-cyan active:scale-90"
                onClick={() => handleResponse(request._id, 'accepted', request.sender._id, request.sender.name)}
                title="Establish Link"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default FriendRequestList;
