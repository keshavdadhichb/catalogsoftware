import React from 'react';
import NeoMarquee from '../neo/NeoMarquee';
import { Mail, Link, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-neo-accent border-t-8 border-black flex flex-col">
      {/* Huge Marquee */}
      <NeoMarquee 
        items={['AI-POWERED FASHION CATALOGS', 'NO STUDIO REQUIRED', 'INSTANT TURNAROUND', 'MADE IN INDIA']} 
        speed={40} 
        bg="accent"
        className="py-6 sm:py-10 border-b-8 border-black !text-4xl sm:!text-6xl !font-black !tracking-tighter"
      />
      
      <div className="container mx-auto px-6 py-12 max-w-7xl flex flex-col md:flex-row justify-between items-center gap-8">
        
        {/* Socials */}
        <div className="flex gap-6 z-10">
          <a href="#" className="bg-white border-8 border-black p-4 shadow-neo hover:shadow-neo-lg hover:-translate-y-2 hover:-rotate-3 transition-all">
            <Mail size={32} strokeWidth={3} />
          </a>
          <a href="#" className="bg-white border-8 border-black p-4 shadow-neo hover:shadow-neo-lg hover:-translate-y-2 hover:rotate-3 transition-all">
            <Link size={32} strokeWidth={3} />
          </a>
          <a href="#" className="bg-white border-8 border-black p-4 shadow-neo hover:shadow-neo-lg hover:-translate-y-2 hover:-rotate-3 transition-all">
            <ExternalLink size={32} strokeWidth={3} />
          </a>
        </div>

        {/* Contact Block */}
        <div className="bg-neo-bg border-8 border-black px-8 py-6 shadow-neo-sm transform md:rotate-2 text-center md:text-right">
          <h4 className="font-black text-2xl uppercase mb-2">DIRECT LINE</h4>
          <a href="mailto:keshavdadhichb7@gmail.com" className="font-bold text-xl block hover:text-neo-accent transition-colors underline decoration-4 underline-offset-4">
            keshavdadhichb7@gmail.com
          </a>
        </div>

      </div>

      {/* Copyright Bar */}
      <div className="bg-black text-white text-center py-4 font-black uppercase tracking-widest">
        © {new Date().getFullYear()} SNAPCATALOG. ALL RIGHTS RESERVED.
      </div>
    </footer>
  );
}
