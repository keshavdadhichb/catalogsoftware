import React from 'react';

export default function StickerStack({ children, className = '' }) {
  return (
    <div className={`relative w-full h-full min-h-[400px] flex items-center justify-center ${className}`}>
      {React.Children.map(children, (child) => {
        return (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            {child}
          </div>
        );
      })}
    </div>
  );
}
