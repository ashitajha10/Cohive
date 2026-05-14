import React, { useState, useEffect, useCallback } from 'react';
import userService from '../services/userService';
import useFriendStore from '../store/friendStore';
import { getAvatarUrl } from '../utils/avatar';
import Button from './Button';
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
      showToast('Friend request sent!');
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
        <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-primary-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input 
          type="text" 
          placeholder="SEARCH NEW USERS..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-sm font-bold text-white placeholder:text-gray-600 focus:border-primary-500/50 focus:ring-0 transition-all backdrop-blur-md"
        />
        {loading && (
          <div className="absolute right-5 top-1/2 -translate-y-1/2">
            <Loader size="sm" />
          </div>
        )}
      </div>

      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {results.length > 0 ? (
          results.map((user) => (
            <div key={user._id} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-primary-500/30 transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-800 border border-white/10 flex items-center justify-center overflow-hidden">
                  {user.avatar ? (
                    <img src={getAvatarUrl(user.avatar)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg font-black text-primary-400">{user.displayName?.charAt(0) || user.name.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <h4 className="text-white font-black text-sm">{user.displayName || user.name}</h4>
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">@{user.username || 'user'}</p>
                </div>
              </div>

              <div>
                {user.friendStatus === 'none' && (
                  <Button 
                    variant="primary" 
                    className="py-2 px-4 text-[10px] uppercase tracking-widest shadow-glow-purple"
                    onClick={() => handleSendRequest(user._id)}
                  >
                    Add Friend
                  </Button>
                )}
                {user.friendStatus === 'request_sent' && (
                  <Button 
                    variant="outline" 
                    className="py-2 px-4 text-[10px] uppercase tracking-widest border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10"
                    onClick={() => handleCancelRequest(user._id)}
                  >
                    Cancel
                  </Button>
                )}
                {user.friendStatus === 'request_received' && (
                  <span className="text-[10px] font-black text-primary-400 uppercase tracking-widest px-4">Pending...</span>
                )}
                {user.friendStatus === 'friends' && (
                  <span className="text-[10px] font-black text-green-400 uppercase tracking-widest px-4 flex items-center gap-2">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                    Friend
                  </span>
                )}
              </div>
            </div>
          ))
        ) : query && !loading ? (
          <p className="text-center text-gray-500 py-10 font-bold uppercase tracking-widest text-[10px]">No users found.</p>
        ) : null}
      </div>
    </div>
  );
};

export default UserSearch;
