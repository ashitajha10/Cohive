import React from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';

const Notifications = () => {
  const notifications = [
    { id: 1, title: 'Profile Synced', message: 'Your profile is now connected to the platform.', time: '2m ago', type: 'system' },
    { id: 2, title: 'New Room Member', message: 'A new user has joined your room.', time: '15m ago', type: 'friend' },
    { id: 3, title: 'Room Update', message: 'The whiteboard has been updated.', time: '1h ago', type: 'room' },
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-white  uppercase  tracking-tighter glow-text-cyan">Notifications</h1>
            <p className="text-[10px] font-black text-cyber-cyan uppercase tracking-[0.4em] mt-3  text-left">Recent Activity & Updates</p>
          </div>
        </div>

        <div className="space-y-4">
          {notifications.map((notif, idx) => (
            <motion.div
              key={notif.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="glass-panel p-6 rounded-3xl border-white/5 hover:border-cyber-cyan/30 transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-cyber-cyan shadow-glow-cyan opacity-50"></div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-black text-white uppercase   tracking-wide">{notif.title}</h3>
                  <p className="text-gray-400 mt-1 font-medium">{notif.message}</p>
                </div>
                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{notif.time}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Notifications;
