import React from "react";
import { motion } from "framer-motion";

const Logo = ({ variant = "purple", size = "md", showText = false, className = "" }) => {
  // Setup sizing config for dynamic responsive rendering
  const sizeConfig = {
    sm: {
      container: "h-8",
      logoSize: 32,
      textSize: "text-lg",
      gap: "gap-2"
    },
    md: {
      container: "h-10",
      logoSize: 40,
      textSize: "text-2xl",
      gap: "gap-3"
    },
    lg: {
      container: "h-16",
      logoSize: 64,
      textSize: "text-4xl",
      gap: "gap-4"
    }
  };

  const config = sizeConfig[size] || sizeConfig.md;

  // Render SVG Gradients & Glows based on the selected variant
  const isCosmic = variant === "cosmic";

  const topFaceGradient = isCosmic
    ? "url(#cosmicTopGradient)"
    : "url(#purpleTopGradient)";
  
  const leftFaceGradient = isCosmic
    ? "url(#cosmicLeftGradient)"
    : "url(#purpleLeftGradient)";

  const coreGradient = isCosmic
    ? "url(#cosmicCoreGradient)"
    : "url(#purpleCoreGradient)";

  const shadowColor = isCosmic
    ? "rgba(0, 243, 255, 0.4)"
    : "rgba(139, 92, 246, 0.3)";

  return (
    <motion.div
      whileHover="hover"
      className={`inline-flex items-center ${config.gap} ${className}`}
    >
      {/* Brand Icon SVG Wrapper */}
      <div 
        className="relative flex items-center justify-center flex-shrink-0"
        style={{ width: config.logoSize, height: config.logoSize }}
      >
        {/* Under-glow for Cosmic Cyberpunk depth */}
        {isCosmic && (
          <div 
            className="absolute inset-0 bg-cyber-cyan/20 rounded-full blur-md opacity-60 pointer-events-none"
            style={{ transform: "scale(0.85)" }}
          />
        )}

        <svg
          viewBox="0 0 100 100"
          className="w-full h-full overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* --- Purple Brand Gradients --- */}
            <linearGradient id="purpleTopGradient" x1="50" y1="15" x2="50" y2="50" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
            <linearGradient id="purpleLeftGradient" x1="20" y1="32.5" x2="50" y2="85" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
            <linearGradient id="purpleCoreGradient" x1="56.34" y1="48" x2="73.66" y2="68" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#d946ef" />
            </linearGradient>

            {/* --- Cosmic/Cyber Gradients --- */}
            <linearGradient id="cosmicTopGradient" x1="50" y1="15" x2="50" y2="50" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#00f3ff" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <linearGradient id="cosmicLeftGradient" x1="20" y1="32.5" x2="50" y2="85" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>
            <linearGradient id="cosmicCoreGradient" x1="56.34" y1="48" x2="73.66" y2="68" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ff00c8" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>

            {/* Drop Shadows */}
            <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor={shadowColor} floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Isometric "C" - Top & Left faces of the cube (Grouped for floating animation) */}
          <motion.g
            variants={{
              hover: { y: -2, scale: 1.03 }
            }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            animate={{
              y: [0, -3, 0]
            }}
            style={{ originX: "50px", originY: "50px" }}
            transition={{
              y: {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
            filter="url(#glowFilter)"
          >
            {/* Top Face */}
            <path
              d="M50 15 L80 32.5 L50 50 L20 32.5 Z"
              fill={topFaceGradient}
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            {/* Left Face */}
            <path
              d="M20 32.5 L50 50 L50 85 L20 67.5 Z"
              fill={leftFaceGradient}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </motion.g>

          {/* Central Active Nucleus - Hive hexagon (Floating inside the "C" hollow right area) */}
          <motion.path
            d="M 65 48 L 73.66 53 L 73.66 63 L 65 68 L 56.34 63 L 56.34 53 Z"
            fill={coreGradient}
            stroke="rgba(255, 255, 255, 0.25)"
            strokeWidth="1"
            strokeLinejoin="round"
            animate={{
              scale: [0.93, 1.07, 0.93],
              opacity: [0.85, 1, 0.85]
            }}
            variants={{
              hover: { scale: 1.15, filter: "brightness(1.2)" }
            }}
            style={{ transformOrigin: "65px 58px" }}
            transition={{
              scale: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              },
              opacity: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              },
              hover: {
                type: "spring",
                stiffness: 400,
                damping: 10
              }
            }}
          />
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <span 
          className={`font-black tracking-tight select-none uppercase ${config.textSize} ${
            isCosmic 
              ? "text-transparent bg-clip-text bg-gradient-to-r from-cyber-cyan via-white to-cyber-pink drop-shadow-[0_0_12px_rgba(0,243,255,0.35)]" 
              : "text-gray-900"
          }`}
        >
          Cohive
        </span>
      )}
    </motion.div>
  );
};

export default Logo;
