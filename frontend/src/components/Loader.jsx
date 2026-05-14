import React from 'react';
import { motion } from 'framer-motion';

const Loader = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 40, md: 64, lg: 96, xl: 120 };
  const px = sizes[size];

  return (
    <div className={`flex flex-col items-center justify-center gap-6 ${className}`}>
      <div className="relative" style={{ width: px, height: px }}>
        {/* Outer glow pulse */}
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.1, 0.25, 0.1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-full bg-cyber-cyan/20 blur-xl"
        />
        {/* Outer ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full"
          style={{
            border: '3px solid transparent',
            borderTopColor: '#00f3ff',
            borderRightColor: 'rgba(0,243,255,0.3)',
            boxShadow: '0 0 15px rgba(0,243,255,0.4)',
          }}
        />
        {/* Middle ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="absolute rounded-full"
          style={{
            inset: px * 0.15,
            border: '2px solid transparent',
            borderTopColor: '#ff00c8',
            borderLeftColor: 'rgba(255,0,200,0.3)',
            boxShadow: '0 0 10px rgba(255,0,200,0.3)',
          }}
        />
        {/* Inner dot */}
        <motion.div
          animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute rounded-full bg-cyber-cyan"
          style={{ inset: px * 0.38, boxShadow: '0 0 12px rgba(0,243,255,0.8)' }}
        />
      </div>

      <div className="flex items-center gap-2">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
            className="w-1.5 h-1.5 rounded-full bg-cyber-cyan"
          />
        ))}
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-cyber-cyan ml-2">Loading</span>
      </div>
    </div>
  );
};

export const FullPageLoader = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="fixed inset-0 bg-[#050608]/95 backdrop-blur-xl z-[100] flex items-center justify-center"
  >
    <Loader size="lg" />
  </motion.div>
);

export default Loader;
