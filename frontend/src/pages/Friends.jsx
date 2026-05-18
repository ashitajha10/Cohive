import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/Layout';
import useFriendStore from '../store/friendStore';
import FriendList from '../components/FriendList';
import FriendRequestList from '../components/FriendRequestList';
import UserSearch from '../components/UserSearch';
import Loader from '../components/Loader';

const Friends = () => {
  const { fetchFriends, fetchFriendRequests, loading, friendRequests } = useFriendStore();
  const [activeTab, setActiveTab] = useState('friends');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchFriends();
    fetchFriendRequests();
  }, [fetchFriends, fetchFriendRequests]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-10 animate-fade-in pb-20">
        {/* Header */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-2">Friends Hub</h1>
            <p className="text-gray-400 text-sm font-medium">Connect and collaborate with your network.</p>
          </div>

          <div className="flex bg-gray-50 p-2 rounded-3xl border border-gray-100 relative z-10">
            {['friends', 'requests', 'search'].map((tab) => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)} 
                className={`px-8 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 relative ${
                  activeTab === tab 
                    ? 'bg-white text-[#8b5cf6] shadow-sm' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab === 'friends' ? 'My Friends' : tab === 'requests' ? 'Requests' : 'Find Users'}
                {tab === 'requests' && friendRequests.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] flex items-center justify-center border-2 border-white text-white font-bold shadow-sm">
                    {friendRequests.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </header>

        {/* Content Area */}
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="flex-1 min-h-0"
        >
          <AnimatePresence mode="wait">
            {loading && activeTab === 'friends' ? (
              <motion.div 
                key="loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center h-[400px]"
              >
                <Loader size="xl" />
              </motion.div>
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-10"
              >
                {activeTab === 'friends' && (
                  <div className="space-y-8">
                    <div className="relative max-w-xl group">
                      <svg className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#8b5cf6] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input 
                        type="text" 
                        placeholder="Search friends..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-14 pr-8 py-4 bg-white border border-gray-100 rounded-[2rem] text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:border-[#8b5cf6]/30 focus:shadow-sm focus:shadow-purple-100 transition-all outline-none"
                      />
                    </div>
                    <FriendList searchQuery={searchQuery} />
                  </div>
                )}
                
                {activeTab === 'requests' && (
                  <div className="max-w-3xl">
                    <FriendRequestList />
                  </div>
                )}
                
                {activeTab === 'search' && (
                  <div className="max-w-3xl bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Discover Users</h2>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Search for new connections</p>
                    </div>
                    <UserSearch />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Friends;
