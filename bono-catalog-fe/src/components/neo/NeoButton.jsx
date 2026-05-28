import React from 'react';

export default function NeoButton({ variant = 'outline', size = 'md', className = '', ...props }) {
  const base = 'border-4 border-black font-bold uppercase tracking-wide rounded-none shadow-neo-sm transition-all duration-100 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none hover:shadow-neo flex items-center justify-center gap-2';
  
  const variants = {
    accent: 'bg-neo-accent text-black',
    secondary: 'bg-neo-secondary text-black',
    outline: 'bg-white text-black',
    ink: 'bg-neo-ink text-white',
  };

  const sizes = {
    md: 'h-12 px-6 text-sm',
    lg: 'h-14 px-8 text-base',
  };

  return (
    <button 
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}
