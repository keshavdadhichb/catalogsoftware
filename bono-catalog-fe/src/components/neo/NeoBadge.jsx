import React from 'react';

export default function NeoBadge({ variant = 'ink', shape = 'square', rotate = 0, className = '', children, ...props }) {
  const base = 'border-4 border-black font-black uppercase tracking-widest text-xs px-3 py-1 shadow-neo-sm inline-block';
  
  const variants = {
    accent: 'bg-neo-accent text-black',
    secondary: 'bg-neo-secondary text-black',
    muted: 'bg-neo-muted text-black',
    ink: 'bg-neo-ink text-white',
  };

  const shapes = {
    pill: 'rounded-full',
    square: 'rounded-none',
  };

  const style = rotate ? { transform: `rotate(${rotate}deg)` } : {};

  return (
    <span 
      className={`${base} ${variants[variant]} ${shapes[shape]} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </span>
  );
}
