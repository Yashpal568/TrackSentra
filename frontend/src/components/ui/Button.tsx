import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', isLoading, className = '', children, ...props }) => {
  const baseStyle = 'inline-flex items-center justify-center gap-2 px-4 py-2 rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-emerald-600 text-[#F0FDF4] hover:bg-emerald-500 focus:ring-emerald-500 border-0',
    secondary: 'bg-[#101713] text-[#F0FDF4] hover:bg-[#1D2B22] focus:ring-emerald-500 border border-[#1D2B22]',
    danger: 'bg-red-600 text-[#F0FDF4] hover:bg-red-500 focus:ring-red-500 border-0',
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} disabled={isLoading || props.disabled} {...props}>
      {isLoading ? 'Loading...' : children}
    </button>
  );
};
