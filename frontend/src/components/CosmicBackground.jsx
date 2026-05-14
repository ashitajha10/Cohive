import React from 'react';
import { motion } from 'framer-motion';

const CosmicBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1] bg-[#050608]">
      {/* Space Grid */}
      <div className="space-grid" />
      
      {/* Stars Overlay (CSS Animation) */}
      <div className="stars-overlay" />
      
      {/* Nebula Clouds (Framer Motion Animation) */}
      <motion.div 
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-[-25%] left-[-25%] w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,rgba(0,243,255,0.05)_0%,transparent_70%)] blur-[100px]"
      />
      
      <motion.div 
        animate={{
          scale: [1.2, 1, 1.2],
          rotate: [0, -45, 0],
          opacity: [0.15, 0.3, 0.15],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute bottom-[-25%] right-[-25%] w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,rgba(255,0,200,0.05)_0%,transparent_70%)] blur-[100px]"
      />

      {/* Floating Particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: Math.random() * window.innerWidth, 
            y: Math.random() * window.innerHeight,
            opacity: Math.random() * 0.5 + 0.1
          }}
          animate={{
            y: [null, Math.random() * -100 - 50],
            opacity: [null, 0]
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute w-1 h-1 bg-white rounded-full blur-[1px]"
        />
      ))}
    </div>
  );
};

export default CosmicBackground;
