import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div className={`bg-[#0B110E] rounded-lg shadow-md p-6 ${className}`} {...props}>
      {children}
    </div>
  );
};
