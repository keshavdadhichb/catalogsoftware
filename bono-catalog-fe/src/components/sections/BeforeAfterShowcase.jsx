import React, { useState, useRef } from 'react';
import NeoSection from '../neo/NeoSection';
import NeoBadge from '../neo/NeoBadge';

export default function BeforeAfterShowcase() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef(null);

  const handleMove = (clientPageX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientPageX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setSliderPosition(percent);
  };

  const handleMouseMove = (e) => handleMove(e.clientX);
  const handleTouchMove = (e) => handleMove(e.touches[0].clientX);

  return (
    <NeoSection bg="muted" divider id="before-after" className="min-h-screen flex flex-col justify-center">
      <div className="text-center mb-12">
        <h2 className="text-5xl md:text-7xl font-black uppercase mb-4">The Magic.</h2>
        <p className="text-xl font-bold bg-white text-black border-4 border-black px-4 py-2 inline-block shadow-neo-sm -rotate-1">
          Drag the bar. See the difference.
        </p>
      </div>

      <div className="max-w-5xl mx-auto w-full relative">
        <div 
          ref={containerRef}
          className="relative w-full aspect-[3/4] border-8 border-black bg-white shadow-neo-lg cursor-ew-resize overflow-hidden"
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
        >
          {/* AFTER (Model) - Background Image */}
          <div className="absolute inset-0 bg-neo-bg">
            <img 
              src="/assets/model.png" 
              alt="Generated Editorial" 
              className="w-full h-full object-cover select-none pointer-events-none"
            />
            <NeoBadge variant="accent" className="absolute top-4 right-4 md:top-8 md:right-8 scale-150 z-0 rotate-2">AFTER</NeoBadge>
          </div>

          {/* BEFORE (Flatlay) - Foreground Image (Clipped) */}
          <div 
            className="absolute inset-0 bg-gray-200"
            style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
          >
            <img 
              src="/assets/flatlay.png" 
              alt="Original Flatlay" 
              className="w-full h-full object-cover select-none pointer-events-none"
            />
            <NeoBadge variant="ink" className="absolute top-4 left-4 md:top-8 md:left-8 scale-150 z-0 -rotate-2">BEFORE</NeoBadge>
          </div>

          {/* The Draggable Bar */}
          <div 
            className="absolute top-0 bottom-0 w-2 bg-neo-accent border-x-4 border-black z-20 flex items-center justify-center transform -translate-x-1/2 cursor-ew-resize"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="w-12 h-24 bg-white border-4 border-black flex items-center justify-center shadow-neo">
               <span className="font-black text-2xl tracking-tighter">&lt;&gt;</span>
            </div>
          </div>
        </div>
      </div>
    </NeoSection>
  );
}
