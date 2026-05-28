import React from 'react';
import Marquee from 'react-fast-marquee';

export default function NeoMarquee({ speed = 50, direction = 'left', bg = 'secondary', items = [], className = '' }) {
  const backgrounds = {
    accent: 'bg-neo-accent',
    secondary: 'bg-neo-secondary',
    ink: 'bg-neo-ink text-white',
  };

  // If array of items is not provided, use children
  return (
    <div className={`py-3 border-b-4 border-black ${backgrounds[bg]} ${className}`}>
      <Marquee speed={speed} direction={direction} autoFill={true}>
        {items.map((item, index) => (
          <div key={index} className="mx-4 font-black uppercase text-lg flex items-center gap-8">
            <span>{item}</span>
            <span className={bg === 'ink' ? 'text-neo-accent text-2xl' : 'text-black text-xl'}>★</span>
          </div>
        ))}
      </Marquee>
    </div>
  );
}
