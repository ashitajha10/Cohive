import React from 'react';

const Card = ({ children, className = '', padding = 'p-6', ...props }) => {
  return (
    <div 
      className={`cosmic-card ${padding} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
