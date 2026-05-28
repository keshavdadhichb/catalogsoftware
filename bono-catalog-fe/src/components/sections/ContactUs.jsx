import React, { useState } from 'react';
import NeoSection from '../neo/NeoSection';
import NeoCard from '../neo/NeoCard';
import NeoBadge from '../neo/NeoBadge';

export default function ContactUs() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name && email && phone) setSubmitted(true);
  };

  const inputClass = "w-full bg-neo-bg border-8 border-black p-4 md:p-6 font-black text-xl md:text-3xl text-black placeholder:text-black/30 focus:outline-none focus:bg-neo-secondary focus:shadow-neo-sm transition-all text-center";

  return (
    <NeoSection bg="muted" texture="noise" divider className="min-h-screen flex flex-col justify-center items-center relative overflow-hidden" id="contact">
      
      {/* Decorative scattered elements */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
         <div className="absolute top-[10%] left-[10%] text-9xl font-black select-none">*</div>
         <div className="absolute bottom-[20%] right-[15%] text-9xl font-black select-none rotate-45">+</div>
      </div>

      <NeoCard className="bg-white border-8 border-black p-8 md:p-16 w-full max-w-3xl relative z-20 shadow-neo-lg" lift={false}>
        {!submitted ? (
          <>
            <h2 className="text-5xl md:text-7xl font-black uppercase mb-4 text-black text-center leading-none">
              READY TO <br/> <span className="bg-neo-accent px-2 mx-1 inline-block -rotate-2">GET STARTED?</span>
            </h2>
            <p className="font-bold text-xl text-center mb-12 uppercase tracking-wide">
              Fill in your details. Our team will contact you shortly!
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full relative">
              <input 
                type="text" 
                required
                placeholder="YOUR NAME"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
              />
              <input 
                type="email" 
                required
                placeholder="YOUR EMAIL"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
              <input 
                type="tel" 
                required
                placeholder="CONTACT NUMBER"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClass}
              />
              <button 
                type="submit"
                className="w-full bg-neo-ink text-white font-black text-3xl md:text-5xl uppercase p-6 border-8 border-black hover:bg-neo-accent hover:text-black transition-all active:translate-y-2 active:bg-black active:text-white"
              >
                SUBMIT
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 relative">
            <h2 className="text-6xl md:text-8xl font-black uppercase mb-6 text-black text-center z-20">
              RECEIVED.
            </h2>
            <p className="font-bold text-2xl text-center z-20 bg-white border-4 border-black px-6 py-3 shadow-neo-sm">
              Our team will contact you shortly!
            </p>
            
            {/* Overlapping confirmation stickers */}
            <NeoBadge variant="accent" className="absolute top-10 -left-10 md:left-0 scale-150 rotate-[-15deg] shadow-neo z-30 opacity-90 animate-[wiggle_1s_ease-in-out_infinite]">LOCKED IN</NeoBadge>
            <NeoBadge variant="secondary" className="absolute bottom-10 -right-10 md:right-10 scale-[2] rotate-[25deg] shadow-neo z-30 opacity-90">SUCCESS</NeoBadge>
            <NeoBadge variant="ink" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-[3] rotate-[-5deg] shadow-neo-lg z-10 opacity-20">WELCOME</NeoBadge>
          </div>
        )}
      </NeoCard>
    </NeoSection>
  );
}
