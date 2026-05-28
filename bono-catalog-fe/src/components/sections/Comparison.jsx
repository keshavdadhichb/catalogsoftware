import React from 'react';
import NeoSection from '../neo/NeoSection';

export default function Comparison() {
  const comparisonData = [
    { trad: "₹50,000 - ₹2,00,000 PER CATALOG", snap: "FRACTIONAL PRICE" },
    { trad: "2-4 WEEKS TURNAROUND", snap: "10 MINUTES TOTAL" },
    { trad: "LIMITED AGENCY MODELS", snap: "UNLIMITED DIVERSITY" },
    { trad: "EXTRA $$$ REVISIONS", snap: "FREE REGENERATION" },
  ];

  return (
    <NeoSection bg="ink" texture="halftone" divider id="comparison" className="min-h-screen flex flex-col justify-center">
      <div className="text-center mb-16">
        <h2 className="text-5xl md:text-7xl font-black uppercase mb-4 text-white">The Math Is Brutal.</h2>
        <p className="text-xl font-bold bg-neo-accent border-4 border-black px-4 py-2 inline-block shadow-neo-sm transform rotate-1 text-black">
          Why traditional studios are entirely obsolete.
        </p>
      </div>

      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-2">
        
        {/* Left - Traditional Studio */}
        <div className="bg-white border-8 border-black p-8 md:p-12 relative overflow-hidden transform md:-rotate-1 z-10 md:translate-x-4 shadow-neo-lg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500 opacity-20 rotate-45 transform translate-x-16 -translate-y-16"></div>
          
          <h3 className="text-4xl font-black uppercase mb-12 text-black line-through decoration-red-500 decoration-8 opacity-70">
            TRADITIONAL STUDIO
          </h3>

          <ul className="flex flex-col gap-10">
            {comparisonData.map((item, idx) => (
              <li key={idx} className="relative">
                <span className="text-2xl md:text-3xl font-black text-gray-400 line-through decoration-red-500 decoration-4 block">
                  {item.trad}
                </span>
                <span className="absolute -left-6 top-1/2 -translate-y-1/2 text-red-500 font-black text-3xl opacity-50">✗</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right - SnapCatalog */}
        <div className="bg-neo-secondary border-8 border-black p-8 md:p-12 z-20 shadow-neo-inv transform md:rotate-2 md:-translate-y-4">
          <h3 className="text-4xl font-black uppercase mb-12 text-black underline decoration-black decoration-8 underline-offset-8">
            SNAPCATALOG AI
          </h3>

          <ul className="flex flex-col gap-10">
            {comparisonData.map((item, idx) => (
              <li key={idx} className="relative">
                <span className="text-2xl md:text-3xl font-black text-black block bg-white p-2 border-2 border-black inline-block shadow-neo-sm transform -rotate-1 hover:rotate-0 transition-transform">
                  {item.snap}
                </span>
                <span className="absolute -left-6 top-1/2 -translate-y-1/2 text-black font-black text-3xl">✓</span>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </NeoSection>
  );
}
