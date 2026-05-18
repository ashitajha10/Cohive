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
  const baseStyles = 'inline-flex items-center justify-center px-8 py-4 text-xs font-bold uppercase tracking-widest rounded-2xl transition-all duration-300 focus:outline-none disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 border-2';
  
  const variants = {
    primary: 'text-white bg-[#8b5cf6] border-[#8b5cf6] hover:bg-[#7c3aed] hover:shadow-lg hover:shadow-purple-200',
    secondary: 'text-[#8b5cf6] bg-purple-50 border-purple-100 hover:bg-purple-100',
    outline: 'text-gray-600 bg-white border-gray-100 hover:border-purple-200 hover:text-[#8b5cf6]',
    ghost: 'text-gray-400 border-transparent hover:text-gray-600 hover:bg-gray-50',
    danger: 'text-white bg-red-500 border-red-500 hover:bg-red-600 hover:shadow-lg hover:shadow-red-200',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {isLoading ? (
        <div className="flex items-center gap-3">
          <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </div>
      ) : children}
    </button>
  );
};

export default Button;
