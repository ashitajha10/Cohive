import React from 'react';

const Loader = ({ size = 'md', color = 'purple' }) => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const colors = {
    purple: 'border-[#8b5cf6]',
    gray: 'border-gray-300',
    white: 'border-white'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={`${sizes[size]} border-4 border-t-transparent ${colors[color]} rounded-full animate-spin`} />
      {size === 'xl' && (
        <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em] animate-pulse">Initializing Interface...</p>
      )}
    </div>
  );
};

export default Loader;
