import React, { useState, useEffect, useCallback } from 'react';
import userService from '../services/userService';
import useFriendStore from '../store/friendStore';
import { getAvatarUrl } from '../utils/avatar';
import Loader from './Loader';
import { useToast } from '../context/ToastContext';

const UserSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { sendRequest, cancelRequest } = useFriendStore();
  const { showToast } = useToast();

  const handleSearch = useCallback(async (q) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await userService.searchUsers(q);
      setResults(res.data);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(query);
    }, 500);
    return () => clearTimeout(timer);
  }, [query, handleSearch]);

  const handleSendRequest = async (userId) => {
    const res = await sendRequest(userId);
    if (res.success) {
      showToast('Friend request sent!', 'success');
      // Update local state to show 'Request Sent'
      setResults(results.map(u => u._id === userId ? { ...u, friendStatus: 'request_sent' } : u));
    } else {
      showToast(res.error, 'error');
    }
  };

  const handleCancelRequest = async (userId) => {
    const res = await cancelRequest(userId);
    if (res.success) {
      showToast('Friend request cancelled');
      setResults(results.map(u => u._id === userId ? { ...u, friendStatus: 'none' } : u));
    } else {
      showToast(res.error, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative group">
        <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#8b5cf6] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input 
          type="text" 
          placeholder="Search for people..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:border-[#8b5cf6]/30 focus:bg-white focus:shadow-sm transition-all outline-none"
        />
        {loading && (
          <div className="absolute right-5 top-1/2 -translate-y-1/2">
            <Loader size="sm" />
          </div>
        )}
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {results.length > 0 ? (
          results.map((user) => (
            <div key={user._id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:border-purple-100 hover:shadow-sm transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center overflow-hidden">
                  {user.avatar ? (
                    <img src={getAvatarUrl(user.avatar)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg font-bold text-[#8b5cf6]">{user.displayName?.charAt(0) || user.name.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <h4 className="text-gray-900 font-bold text-sm">{user.displayName || user.name}</h4>
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">@{user.username || 'user'}</p>
                </div>
              </div>

              <div>
                {user.friendStatus === 'none' && (
                  <button 
                    className="py-2 px-5 bg-purple-50 hover:bg-[#8b5cf6] text-[#8b5cf6] hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"
                    onClick={() => handleSendRequest(user._id)}
                  >
                    Add Friend
                  </button>
                )}
                {user.friendStatus === 'request_sent' && (
                  <button 
                    className="py-2 px-5 border border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-500 hover:border-red-100 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"
                    onClick={() => handleCancelRequest(user._id)}
                  >
                    Cancel
                  </button>
                )}
                {user.friendStatus === 'request_received' && (
                  <span className="text-[10px] font-bold text-[#8b5cf6] uppercase tracking-widest px-4 bg-purple-50 py-2 rounded-xl">Pending</span>
                )}
                {user.friendStatus === 'friends' && (
                  <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest px-4 bg-green-50 py-2 rounded-xl flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                    Friends
                  </span>
                )}
              </div>
            </div>
          ))
        ) : query && !loading ? (
          <p className="text-center text-gray-400 py-10 font-bold uppercase tracking-widest text-[10px]">No users found.</p>
        ) : null}
      </div>
    </div>
  );
};

export default UserSearch;
