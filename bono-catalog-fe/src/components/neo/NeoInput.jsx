import React from 'react';

export function NeoInput({ className = '', ...props }) {
  return (
    <input 
      className={`h-14 border-4 border-black bg-white rounded-none font-bold text-lg px-4 placeholder:text-black/40 focus-visible:bg-neo-secondary focus-visible:shadow-neo-sm focus-visible:outline-none transition-colors ${className}`}
      {...props}
    />
  );
}

export function NeoTextarea({ className = '', ...props }) {
  return (
    <textarea 
      className={`border-4 border-black bg-white rounded-none font-bold text-lg p-4 placeholder:text-black/40 focus-visible:bg-neo-secondary focus-visible:shadow-neo-sm focus-visible:outline-none transition-colors min-h-[120px] ${className}`}
      {...props}
    />
  );
}
