import React from 'react';
import NavBar from './components/sections/NavBar';
import Hero from './components/sections/Hero';
import BeforeAfterShowcase from './components/sections/BeforeAfterShowcase';
import VibeGallery from './components/sections/VibeGallery';
import Comparison from './components/sections/Comparison';
import ContactUs from './components/sections/ContactUs';
import Footer from './components/sections/Footer';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-neo-bg flex flex-col selection:bg-neo-accent selection:text-black">
            <NavBar />
            
            <main className="flex-1">
                {/* Scroll 1 */}
                <Hero />
                
                {/* Scroll 2 */}
                <BeforeAfterShowcase />
                
                {/* Scroll 3 */}
                <VibeGallery />
                
                {/* Scroll 4 */}
                <Comparison />
                
                {/* Scroll 5 */}
                <ContactUs />
            </main>

            {/* Scroll 6 */}
            <Footer />
        </div>
    )
}
