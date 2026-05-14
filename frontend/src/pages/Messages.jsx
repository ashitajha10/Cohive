import React from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';

const Messages = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col gap-8">
        <div>
          <h1 className="text-4xl font-black text-white  uppercase  tracking-tighter glow-text-cyan">Messages</h1>
          <p className="text-[10px] font-black text-cyber-cyan uppercase tracking-[0.4em] mt-3  text-left">Private Direct Messages</p>
        </div>

        <div className="flex-1 glass-panel rounded-[3rem] border-white/5 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-white/[0.02] animate-pulse"></div>
          <div className="text-center relative z-10">
            <div className="w-24 h-24 bg-cyber-cyan/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow-cyan border border-cyber-cyan/20">
              <svg className="w-12 h-12 text-cyber-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-2xl font-black text-white uppercase   mb-2">Chat Unavailable</h3>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Direct messaging features are coming soon.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Messages;
