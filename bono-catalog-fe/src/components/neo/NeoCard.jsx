import React from 'react';

export default function NeoCard({ as: Component = 'div', tilt = 0, lift = false, className = '', children, ...props }) {
  const base = 'bg-white border-4 border-black rounded-none shadow-neo transition-all duration-200';
  const liftStyles = lift ? 'hover:-translate-y-2 hover:shadow-neo-lg' : '';
  
  const style = tilt ? { transform: `rotate(${tilt}deg)` } : {};

  return (
    <Component 
      className={`${base} ${liftStyles} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </Component>
  );
}
