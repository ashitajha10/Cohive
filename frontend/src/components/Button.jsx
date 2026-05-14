import React from 'react';

const Button = ({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  className = '', 
  disabled = false,
  isLoading = false
}) => {
  const baseStyles = 'inline-flex items-center justify-center px-8 py-4 text-[10px] uppercase tracking-[0.2em] rounded-2xl transition-all duration-300 focus:outline-none disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 border-2';
  
  const variants = {
    primary: 'text-black bg-cyber-cyan border-cyber-cyan/50 hover:bg-cyber-cyan/90 hover:shadow-glow-cyan font-black',
    secondary: 'text-cyber-cyan bg-cyber-cyan/10 border-cyber-cyan/30 hover:bg-cyber-cyan hover:text-black hover:shadow-glow-cyan',
    outline: 'text-gray-400 bg-white/5 border-white/10 hover:text-white hover:border-white/20 hover:bg-white/10',
    ghost: 'text-gray-500 border-transparent hover:text-white hover:bg-white/5',
    danger: 'text-cyber-pink bg-cyber-pink/10 border-cyber-pink/30 hover:bg-cyber-pink hover:text-white hover:shadow-glow-pink',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Syncing...
        </>
      ) : children}
    </button>
  );
};

export default Button;
