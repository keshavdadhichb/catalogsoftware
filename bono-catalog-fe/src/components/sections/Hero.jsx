import React from 'react';
import NeoBadge from '../neo/NeoBadge';
import NeoButton from '../neo/NeoButton';
import NeoCard from '../neo/NeoCard';
import NeoSection from '../neo/NeoSection';
import StickerStack from '../neo/StickerStack';
import { Star } from 'lucide-react';

export default function Hero() {
  return (
    <NeoSection bg="cream" texture="halftone" className="overflow-hidden min-h-[85vh] flex items-center">
      <div className="flex flex-col lg:flex-row gap-16 lg:gap-8 items-center w-full">
        
        {/* Left Column - 60% */}
        <div className="lg:w-[60%] flex flex-col items-start z-10 w-full">
          <NeoBadge variant="accent" rotate={-3} className="mb-6 lg:mb-8">
            ★ AI-POWERED EDITORIALS
          </NeoBadge>

          <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase leading-[0.85] tracking-tighter mb-6 lg:mb-8 flex flex-col items-start z-20">
            <span className="text-neo-ink">THE STUDIO</span>
            <span className="bg-neo-secondary border-4 border-black px-4 sm:px-6 inline-block -rotate-2 shadow-neo my-3">
              IS NOW
            </span>
            <span 
              className="text-transparent" 
              style={{ WebkitTextStroke: '3px black' }}
            >
              OBSOLETE.
            </span>
          </h1>

          <p className="text-lg md:text-2xl font-bold max-w-xl mb-8 lg:mb-10 bg-white p-4 sm:p-6 border-4 border-black shadow-neo-sm">
            Transform flat garment photos into stunning fashion catalogs with AI. 
            Professional catalogs generated in minutes, not weeks.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-4 lg:mb-0 w-full sm:w-auto">
            <a href="/app"><NeoButton variant="accent" size="lg">LAUNCH APP →</NeoButton></a>
            <a href="#gallery"><NeoButton variant="outline" size="lg">VIEW GALLERY</NeoButton></a>
          </div>
        </div>

        {/* Right Column - 40% */}
        <div className="w-full lg:w-[40%] relative mt-10 lg:mt-0 h-[400px] lg:h-[600px]">
          <Star 
             fill="#C4B5FD" 
             size={120} 
             strokeWidth={4} 
             color="#000"
             className="absolute md:-top-10 md:-right-10 top-0 right-0 animate-spin-slow z-0" 
          />
          <StickerStack>
            <NeoCard className="p-3 w-56 sm:w-72 bg-white z-10 translate-x-[-15px] translate-y-[-15px]" tilt={-6}>
              <div className="aspect-[3/4] bg-white border-4 border-black mb-3">
                 <img src="/assets/flatlay.png" alt="Original Flat Lay" className="w-full h-full object-cover" />
              </div>
              <NeoBadge variant="accent" className="absolute -top-3 -right-3" rotate={5}>UPLOAD (BEFORE)</NeoBadge>
            </NeoCard>
            
            <NeoCard className="p-3 w-56 sm:w-72 bg-neo-secondary z-20 translate-x-[20px] translate-y-[20px]" tilt={4} lift>
              <div className="aspect-[3/4] bg-white border-4 border-black mb-3">
                 <img src="/assets/model.png" alt="Generated Model" className="w-full h-full object-cover" />
              </div>
              <NeoBadge variant="ink" className="absolute -bottom-3 -left-3" rotate={-4}>GENERATED (AFTER)</NeoBadge>
            </NeoCard>
          </StickerStack>
        </div>

      </div>
    </NeoSection>
  );
}
