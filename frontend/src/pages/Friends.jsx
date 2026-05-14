import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/Layout';
import useFriendStore from '../store/friendStore';
import FriendList from '../components/FriendList';
import FriendRequestList from '../components/FriendRequestList';
import UserSearch from '../components/UserSearch';
import Loader from '../components/Loader';
import Card from '../components/Card';

const Friends = () => {
  const { fetchFriends, fetchFriendRequests, loading, friendRequests } = useFriendStore();
  const [activeTab, setActiveTab] = useState('crew');
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

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <Layout>
      <div className="flex flex-col h-full space-y-10 pb-20 max-w-7xl mx-auto px-4 md:px-0">
        {/* Cinematic Header */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 glass-panel p-10 rounded-[3.5rem] border-white/10 shadow-holographic relative overflow-hidden group"
        >
          <div className="relative z-10">
            <h1 className="text-5xl font-black text-white tracking-tighter glow-text-cyan  ">Friends Hub</h1>
            <p className="text-cyber-cyan mt-3 font-black uppercase tracking-[0.4em] text-[10px] flex items-center gap-2 ">
              <span className="w-2.5 h-2.5 rounded-full bg-cyber-cyan animate-pulse shadow-glow-cyan"></span>
              Your network of connections
            </p>
          </div>

          <div className="flex bg-white/5 p-2 rounded-3xl border border-white/10 backdrop-blur-xl relative z-10">
            {['crew', 'requests', 'scan'].map((tab) => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)} 
                className={`px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500   relative ${
                  activeTab === tab 
                    ? 'bg-cyber-cyan text-black shadow-glow-cyan scale-105' 
                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab === 'crew' ? 'Friends' : tab === 'requests' ? 'Friend Requests' : 'Search Users'}
                {tab === 'requests' && friendRequests.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-6 h-6 bg-cyber-pink rounded-full text-[10px] flex items-center justify-center border-2 border-cyber-black animate-pulse shadow-glow-pink text-white">
                    {friendRequests.length}
                  </span>
                )}
              </button>
            ))}
          </div>
          
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-cyber-cyan/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-cyber-cyan/20 transition-all duration-700"></div>
        </motion.div>

        {/* Content Area */}
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="flex-1 min-h-0"
        >
          <AnimatePresence mode="wait">
            {loading && activeTab === 'crew' ? (
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
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-10"
              >
                {activeTab === 'crew' && (
                  <div className="space-y-8">
                    <div className="relative max-w-xl group">
                      <svg className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-cyber-cyan transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input 
                        type="text" 
                        placeholder="SEARCH FRIENDS..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-16 pr-8 py-5 bg-white/5 border border-white/10 rounded-[2rem] text-sm font-black text-white placeholder:text-gray-700 focus:border-cyber-cyan/50 focus:shadow-glow-cyan transition-all backdrop-blur-xl tracking-[0.2em]"
                      />
                    </div>
                    <FriendList searchQuery={searchQuery} />
                  </div>
                )}
                
                {activeTab === 'requests' && (
                  <div className="max-w-4xl">
                    <FriendRequestList />
                  </div>
                )}
                
                {activeTab === 'scan' && (
                  <div className="max-w-3xl">
                    <Card className="p-10 glass-panel rounded-[3.5rem] border-white/10 shadow-holographic">
                      <div className="mb-10">
                        <h2 className="text-2xl font-black text-white uppercase glow-text-cyan tracking-tight">Find People</h2>
                        <p className="text-[10px] font-black text-cyber-cyan uppercase tracking-[0.3em] mt-1">Search for other users</p>
                      </div>
                      <UserSearch />
                    </Card>
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
