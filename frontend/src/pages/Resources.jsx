import React from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';

const Resources = () => {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-black text-white  uppercase  tracking-tighter glow-text-cyan">Resources</h1>
          <p className="text-[10px] font-black text-cyber-cyan uppercase tracking-[0.4em] mt-3  text-left">Shared Files & Project Assets</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              whileHover={{ y: -10 }}
              className="glass-panel p-8 rounded-[2.5rem] border-white/5 group relative overflow-hidden h-64 flex flex-col justify-end"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                 <svg className="w-32 h-32 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                 </svg>
              </div>
              <h3 className="text-xl font-black text-white uppercase  ">Project Folder #{i}</h3>
              <p className="text-cyber-cyan/50 text-xs font-black uppercase tracking-widest mt-2">File Storage Online</p>
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Resources;
