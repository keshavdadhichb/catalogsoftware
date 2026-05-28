import React from 'react';

export default function NeoSection({ bg = 'cream', texture = 'none', divider = false, className = '', children, ...props }) {
  const backgrounds = {
    cream: 'bg-neo-bg',
    secondary: 'bg-neo-secondary',
    muted: 'bg-neo-muted',
    ink: 'bg-neo-ink',
    accent: 'bg-neo-accent',
  };

  const textures = {
    none: '',
    halftone: 'bg-halftone',
    grid: 'bg-grid',
    noise: 'bg-noise',
  };

  return (
    <section 
      className={`${backgrounds[bg]} ${textures[texture]} ${divider ? 'border-t-8 border-black' : ''} ${className}`}
      {...props}
    >
      <div className="py-20 md:py-28 container mx-auto max-w-7xl px-6">
        {children}
      </div>
    </section>
  );
}
