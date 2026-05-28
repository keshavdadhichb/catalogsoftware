import React, { useState } from 'react';
import NeoButton from '../neo/NeoButton';
import { Menu, X } from 'lucide-react';

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = ['FEATURES', 'GALLERY', 'COMPARISON', 'VIDEO'];

  return (
    <>
      <nav className="sticky top-0 z-50 bg-neo-bg border-b-4 border-black h-20">
        <div className="container mx-auto h-full px-6 flex items-center justify-between">
          
          {/* Logo */}
          <div className="bg-neo-ink text-neo-bg border-4 border-black px-4 py-2 font-black uppercase -rotate-2 shadow-neo-sm">
            SNAPCATALOG
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a 
                key={link} 
                href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
                className="font-bold uppercase border-4 border-transparent px-3 py-1 transition-all duration-100 hover:border-black hover:bg-neo-accent hover:shadow-neo-sm"
              >
                {link}
              </a>
            ))}
          </div>

          {/* Right Action */}
          <div className="hidden md:block">
            <a href="#contact"><NeoButton variant="accent">START CREATING →</NeoButton></a>
          </div>

          {/* Mobile Hamburger Dropdown */}
          <button 
            className="md:hidden bg-neo-secondary border-4 border-black shadow-neo-sm p-2 active:translate-y-1 active:translate-x-1 active:shadow-none transition-all"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Menu"
          >
            {isOpen ? <X strokeWidth={3} /> : <Menu strokeWidth={3} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      {isOpen && (
        <div className="md:hidden bg-neo-bg border-b-4 border-black p-6 flex flex-col gap-4 absolute w-full z-40">
          {navLinks.map((link) => (
             <a 
               key={link} 
               href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
               className="font-bold uppercase text-xl border-4 border-black px-4 py-3 bg-white text-center shadow-neo-sm active:translate-y-1 active:translate-x-1 active:shadow-none transition-all"
               onClick={() => setIsOpen(false)}
             >
               {link}
             </a>
          ))}
          <a href="#contact" onClick={() => setIsOpen(false)}><NeoButton variant="accent" size="lg" className="w-full mt-4">START CREATING →</NeoButton></a>
        </div>
      )}
    </>
  );
}
