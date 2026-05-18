import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useFriendStore from '../store/friendStore';
import { getAvatarUrl } from '../utils/avatar';
import { useToast } from '../context/ToastContext';

const FriendRequestList = () => {
  const { friendRequests, respondToRequest } = useFriendStore();
  const { showToast } = useToast();

  const handleResponse = async (requestId, status, senderId, senderName) => {
    const res = await respondToRequest(requestId, status, senderId);
    if (res.success) {
      showToast(status === 'accepted' ? `You are now friends with ${senderName}` : 'Request rejected', "success");
    } else {
      showToast(res.error, 'error');
    }
  };

  if (friendRequests.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="py-16 text-center bg-white rounded-[2.5rem] border border-dashed border-gray-200"
      >
        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">No pending requests</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="popLayout">
        {friendRequests.map((request) => (
          <motion.div 
            key={request._id} 
            layout
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 10, opacity: 0 }}
            className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-[2rem] shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-full bg-purple-50 flex items-center justify-center overflow-hidden border border-purple-100">
                {request.sender.avatar ? (
                  <img src={getAvatarUrl(request.sender.avatar)} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-bold text-[#8b5cf6]">
                    {(request.sender.displayName || request.sender.name)?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900 tracking-tight">{request.sender.displayName || request.sender.name}</h4>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Sent you a friend request</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                className="w-12 h-12 flex items-center justify-center bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-2xl transition-all"
                onClick={() => handleResponse(request._id, 'rejected', request.sender._id, request.sender.name)}
                title="Reject Request"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <button 
                className="w-12 h-12 flex items-center justify-center bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-2xl shadow-sm hover:shadow transition-all"
                onClick={() => handleResponse(request._id, 'accepted', request.sender._id, request.sender.name)}
                title="Accept Request"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default FriendRequestList;
