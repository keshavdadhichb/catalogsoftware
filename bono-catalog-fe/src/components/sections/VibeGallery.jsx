import React, { useState } from 'react';
import NeoSection from '../neo/NeoSection';
import NeoCard from '../neo/NeoCard';
import NeoBadge from '../neo/NeoBadge';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function VibeGallery() {
  const images = [
    { img: 'product_1_poster 11.png', label: 'EDITORIAL 1', variant: 'accent' },
    { img: 'product_1_poster 12.png', label: 'STREET STYLE', variant: 'ink' },
    { img: 'product_1_poster 13.png', label: 'URBAN COOL', variant: 'secondary' },
    { img: 'product_1_poster 15.png', label: 'PREMIUM LOOK', variant: 'muted' },
    { img: '03_combo_product_5.png', label: 'PRODUCT COMBO', variant: 'accent' },
    { img: '06_callout_product_2_front.png', label: 'DETAIL CALLOUT', variant: 'secondary' }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const nextImage = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 800 : -800,
      opacity: 0,
      rotate: direction > 0 ? 15 : -15,
      scale: 0.8
    }),
    center: {
      zIndex: 10,
      x: 0,
      opacity: 1,
      rotate: (currentIndex % 2 === 0) ? -2 : 3,
      scale: 1,
      transition: { type: "spring", stiffness: 200, damping: 20 }
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 800 : -800,
      opacity: 0,
      rotate: direction < 0 ? 15 : -15,
      scale: 0.5,
      transition: { duration: 0.3 }
    })
  };

  return (
    <NeoSection bg="secondary" texture="grid" id="gallery" className="min-h-screen flex flex-col justify-center overflow-hidden">
      <div className="text-center mb-10">
        <h2 className="text-5xl md:text-7xl font-black uppercase mb-4">The Output.</h2>
        <p className="text-xl font-bold bg-white text-black border-4 border-black px-4 py-2 inline-block shadow-neo-sm">
          Flick through the generated catalogs.
        </p>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 relative">
        
        {/* Left Arrow */}
        <button 
          onClick={prevImage}
          className="z-50 bg-white border-4 border-black p-4 md:p-6 shadow-neo-sm hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none hover:bg-neo-accent active:bg-neo-ink active:text-white transition-all transform -rotate-3"
          aria-label="Previous"
        >
          <ArrowLeft size={48} strokeWidth={4} />
        </button>

        {/* Polaroid Stack */}
        <div className="relative w-full max-w-2xl h-[600px] md:h-[800px] flex items-center justify-center">
          <AnimatePresence custom={direction} mode="popLayout">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute w-full h-full"
            >
              <NeoCard className="p-4 bg-white w-full h-full relative border-8 border-black shadow-neo-lg" lift={false} tilt={0}>
                <div className="w-full h-full border-4 border-black bg-white overflow-hidden relative flex items-center justify-center">
                  <img 
                    src={`/assets/${images[currentIndex].img}`} 
                    alt="Generated Look" 
                    className="w-full h-full object-contain select-none pointer-events-none"
                  />
                  <div className="absolute inset-0 shadow-[inset_0_0_50px_rgba(0,0,0,0.1)] pointer-events-none"></div>
                </div>
                <NeoBadge 
                  variant={images[currentIndex].variant} 
                  className="absolute -bottom-6 -right-6 scale-125 z-20 shadow-neo"
                  rotate={-5}
                >
                  {images[currentIndex].label}
                </NeoBadge>
              </NeoCard>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Arrow */}
        <button 
          onClick={nextImage}
          className="z-50 bg-white border-4 border-black p-4 md:p-6 shadow-neo-sm hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none hover:bg-neo-accent active:bg-neo-ink active:text-white transition-all transform rotate-3"
          aria-label="Next"
        >
          <ArrowRight size={48} strokeWidth={4} />
        </button>

      </div>
    </NeoSection>
  );
}
