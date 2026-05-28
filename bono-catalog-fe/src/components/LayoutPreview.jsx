import React, { useState, useMemo } from 'react'

// Layout categories for filtering
const CATEGORIES = {
    all: { name: "All", icon: "✨" },
    minimal: { name: "Minimal", icon: "◻️" },
    bold: { name: "Bold", icon: "🔥" },
    elegant: { name: "Elegant", icon: "👑" },
    streetwear: { name: "Street", icon: "🛹" },
    bono: { name: "BONO", icon: "🅱️" }
}

// Layout configurations with categories - 21 layouts
const LAYOUTS = {
    // MINIMAL CATEGORY
    hero_bottom: {
        name: "Hero Bottom",
        category: "minimal",
        description: "Large headline at bottom",
        textFields: ["headline", "subtext"],
        diagram: (
            <svg viewBox="0 0 90 160" style={{ width: '100%', height: '100%' }}>
                <rect x="0" y="0" width="90" height="160" fill="#1a1a1a" rx="4" />
                <rect x="5" y="5" width="80" height="100" fill="#2a2a2a" rx="2" />
                <circle cx="45" cy="45" r="18" fill="#444" />
                <rect x="28" y="68" width="34" height="35" fill="#444" rx="2" />
                <rect x="10" y="115" width="70" height="14" fill="#4a9eff" rx="2" />
                <rect x="20" y="135" width="50" height="8" fill="#666" rx="1" />
            </svg>
        )
    },
    minimal_corner: {
        name: "Minimal Corner",
        category: "minimal",
        description: "Small text in corner",
        textFields: ["brand", "tagline"],
        diagram: (
            <svg viewBox="0 0 90 160" style={{ width: '100%', height: '100%' }}>
                <rect x="0" y="0" width="90" height="160" fill="#2a2a2a" rx="4" />
                <circle cx="45" cy="65" r="28" fill="#444" />
                <rect x="22" y="98" width="46" height="55" fill="#444" rx="2" />
                <rect x="8" y="10" width="22" height="8" fill="#4a9eff" rx="1" />
                <rect x="8" y="22" width="16" height="4" fill="#666" rx="1" />
            </svg>
        )
    },
    centered_minimal: {
        name: "Centered Minimal",
        category: "minimal",
        description: "Model centered, balanced",
        textFields: ["brand", "headline"],
        diagram: (
            <svg viewBox="0 0 90 160" style={{ width: '100%', height: '100%' }}>
                <rect x="0" y="0" width="90" height="160" fill="#1a1a1a" rx="4" />
                <rect x="25" y="10" width="40" height="10" fill="#4a9eff" rx="1" />
                <rect x="10" y="30" width="70" height="100" fill="#2a2a2a" rx="2" />
                <circle cx="45" cy="65" r="22" fill="#444" />
                <rect x="28" y="92" width="34" height="35" fill="#444" rx="2" />
                <rect x="20" y="138" width="50" height="10" fill="#666" rx="1" />
            </svg>
        )
    },
    minimalist_editorial: {
        name: "Editorial",
        category: "minimal",
        description: "Magazine white space",
        textFields: ["headline", "subtext"],
        diagram: (
            <svg viewBox="0 0 90 160" style={{ width: '100%', height: '100%' }}>
                <rect x="0" y="0" width="90" height="160" fill="#F8F6F3" rx="4" />
                <rect x="5" y="20" width="35" height="8" fill="#333" rx="1" />
                <rect x="5" y="32" width="30" height="4" fill="#888" rx="1" />
                <rect x="44" y="10" width="1" height="130" fill="#333" />
                <circle cx="68" cy="55" r="18" fill="#ddd" />
                <rect x="53" y="78" width="30" height="40" fill="#ddd" rx="2" />
            </svg>
        )
    },
    product_focus: {
        name: "Product Focus",
        category: "minimal",
        description: "Clean catalog style",
        textFields: ["headline", "price", "sizes"],
        diagram: (
            <svg viewBox="0 0 90 160" style={{ width: '100%', height: '100%' }}>
                <rect x="0" y="0" width="90" height="160" fill="#f5f5f5" rx="4" />
                <rect x="20" y="8" width="50" height="10" fill="#333" rx="1" />
                <rect x="10" y="25" width="70" height="95" fill="#e5e5e5" rx="2" />
                <circle cx="45" cy="60" r="18" fill="#ccc" />
                <rect x="30" y="82" width="30" height="35" fill="#ccc" rx="2" />
                <rect x="35" y="128" width="20" height="10" fill="#4a9" rx="1" />
            </svg>
        )
    },

    // BOLD CATEGORY
    bold_typography: {
        name: "Bold Type",
        category: "bold",
        description: "Huge impactful text",
        textFields: ["headline"],
        diagram: (
            <svg viewBox="0 0 90 160" style={{ width: '100%', height: '100%' }}>
                <rect x="0" y="0" width="90" height="160" fill="#1a1a1a" rx="4" />
                <rect x="5" y="10" width="80" height="80" fill="#4a9eff" rx="2" />
                <text x="45" y="45" textAnchor="middle" fill="#fff" fontSize="16" fontWeight="bold">BIG</text>
                <text x="45" y="70" textAnchor="middle" fill="#fff" fontSize="16" fontWeight="bold">TEXT</text>
                <circle cx="45" cy="115" r="12" fill="#444" />
                <rect x="35" y="130" width="20" height="22" fill="#444" rx="1" />
            </svg>
        )
    },
    diagonal_split: {
        name: "Diagonal Split",
        category: "bold",
        description: "Dynamic diagonal divide",
        textFields: ["headline", "subtext"],
        diagram: (
            <svg viewBox="0 0 90 160" style={{ width: '100%', height: '100%' }}>
                <rect x="0" y="0" width="90" height="160" fill="#1a1a1a" rx="4" />
                <polygon points="0,0 90,0 90,100 0,160" fill="#2a2a2a" />
                <circle cx="50" cy="55" r="20" fill="#444" />
                <rect x="35" y="78" width="30" height="35" fill="#444" rx="2" />
                <rect x="8" y="125" width="50" height="12" fill="#4a9eff" rx="2" />
            </svg>
        )
    },
    dynamic_typography: {
        name: "Dynamic Type",
        category: "bold",
        description: "Text as visual element",
        textFields: ["headline", "subtext"],
        diagram: (
            <svg viewBox="0 0 90 160" style={{ width: '100%', height: '100%' }}>
                <rect x="0" y="0" width="90" height="160" fill="#fff" rx="4" />
                <text x="20" y="30" fill="#ddd" fontSize="28" fontWeight="bold" transform="rotate(90 20 30)">TEXT</text>
                <rect x="5" y="10" width="40" height="15" fill="#333" rx="1" />
                <circle cx="60" cy="70" r="20" fill="#bbb" />
                <rect x="45" y="93" width="30" height="40" fill="#bbb" rx="2" />
                <circle cx="12" cy="145" r="6" fill="#E67E22" />
            </svg>
        )
    },
    urban_brutalist: {
        name: "Urban Brutalist",
        category: "bold",
        description: "Edgy streetwear concrete",
        textFields: ["headline", "subtext"],
        diagram: (
            <svg viewBox="0 0 90 160" style={{ width: '100%', height: '100%' }}>
                <rect x="0" y="0" width="90" height="160" fill="#A0A0A0" rx="4" />
                <text x="45" y="35" textAnchor="middle" fill="#333" fontSize="14" fontWeight="bold" opacity="0.3">URBAN</text>
                <line x1="10" y1="50" x2="80" y2="50" stroke="#333" strokeWidth="0.5" />
                <line x1="30" y1="30" x2="30" y2="130" stroke="#333" strokeWidth="0.5" />
                <circle cx="45" cy="70" r="18" fill="#ddd" />
                <rect x="30" y="90" width="30" height="35" fill="#ddd" rx="2" />
                <rect x="15" y="140" width="60" height="12" fill="#333" rx="1" />
            </svg>
        )
    },

    // ELEGANT CATEGORY
    magazine_cover: {
        name: "Magazine Cover",
        category: "elegant",
        description: "Title at top, classic style",
        textFields: ["brand", "headline", "subtext"],
        diagram: (
            <svg viewBox="0 0 90 160" style={{ width: '100%', height: '100%' }}>
                <rect x="0" y="0" width="90" height="160" fill="#1a1a1a" rx="4" />
                <rect x="20" y="8" width="50" height="12" fill="#ff4a4a" rx="2" />
                <rect x="5" y="28" width="80" height="95" fill="#2a2a2a" rx="2" />
                <circle cx="45" cy="62" r="20" fill="#444" />
                <rect x="28" y="86" width="34" height="35" fill="#444" rx="2" />
                <rect x="12" y="130" width="66" height="10" fill="#4a9eff" rx="1" />
            </svg>
        )
    },
    overlay_gradient: {
        name: "Gradient Overlay",
        category: "elegant",
        description: "Gradient with text on image",
        textFields: ["headline", "subtext", "cta"],
        diagram: (
            <svg viewBox="0 0 90 160" style={{ width: '100%', height: '100%' }}>
                <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="40%" stopColor="#2a2a2a" />
                        <stop offset="100%" stopColor="#000" />
                    </linearGradient>
                </defs>
                <rect x="0" y="0" width="90" height="160" fill="url(#grad1)" rx="4" />
                <circle cx="45" cy="55" r="22" fill="#444" />
                <rect x="25" y="80" width="40" height="40" fill="#444" rx="2" />
                <rect x="12" y="125" width="66" height="12" fill="#4a9eff" rx="2" />
            </svg>
        )
    },
    framed_border: {
        name: "Framed Border",
        category: "elegant",
        description: "White border frame",
        textFields: ["headline", "subtext"],
        diagram: (
            <svg viewBox="0 0 90 160" style={{ width: '100%', height: '100%' }}>
                <rect x="0" y="0" width="90" height="160" fill="#1a1a1a" rx="4" />
                <rect x="8" y="8" width="74" height="105" fill="#fff" rx="2" />
                <rect x="12" y="12" width="66" height="97" fill="#2a2a2a" rx="2" />
                <circle cx="45" cy="48" r="16" fill="#444" />
                <rect x="30" y="68" width="30" height="38" fill="#444" rx="2" />
                <rect x="15" y="122" width="60" height="12" fill="#4a9eff" rx="2" />
            </svg>
        )
    },
    dark_luxury: {
        name: "Dark Luxury",
        category: "elegant",
        description: "Premium dark with gold",
        textFields: ["headline", "subtext"],
        diagram: (
            <svg viewBox="0 0 90 160" style={{ width: '100%', height: '100%' }}>
                <rect x="0" y="0" width="90" height="160" fill="#2C2C2C" rx="4" />
                <rect x="3" y="3" width="84" height="154" fill="none" stroke="#D4AF37" strokeWidth="1" rx="2" />
                <rect x="20" y="15" width="50" height="10" fill="#D4AF37" rx="1" />
                <circle cx="45" cy="70" r="22" fill="#c0c0c0" />
                <rect x="28" y="95" width="34" height="40" fill="#c0c0c0" rx="2" />
                <rect x="15" y="140" width="60" height="1" fill="#D4AF37" />
            </svg>
        )
    },
    pink_elegant: {
        name: "Pink Elegant",
        category: "elegant",
        description: "Soft pink runway style",
        textFields: ["headline", "subtext", "brand"],
        diagram: (
            <svg viewBox="0 0 90 160" style={{ width: '100%', height: '100%' }}>
                <rect x="0" y="0" width="90" height="160" fill="#FADBD8" rx="4" />
                <rect x="15" y="10" width="60" height="12" fill="#E67E22" rx="1" />
                <circle cx="45" cy="85" r="25" fill="#eee" />
                <rect x="28" y="112" width="34" height="40" fill="#eee" rx="2" />
                <rect x="8" y="50" width="6" height="45" fill="#E67E22" rx="1" />
                <rect x="76" y="50" width="6" height="45" fill="#E67E22" rx="1" />
            </svg>
        )
    },
    warm_earth: {
        name: "Warm Earth",
        category: "elegant",
        description: "Organic natural tones",
        textFields: ["headline", "subtext", "tagline"],
        diagram: (
            <svg viewBox="0 0 90 160" style={{ width: '100%', height: '100%' }}>
                <rect x="0" y="0" width="90" height="160" fill="#D4C4B0" rx="4" />
                <ellipse cx="20" cy="30" rx="25" ry="20" fill="#C68B77" opacity="0.6" />
                <ellipse cx="70" cy="50" rx="20" ry="25" fill="#9CAF88" opacity="0.5" />
                <circle cx="35" cy="70" r="20" fill="#eee" />
                <rect x="20" y="92" width="30" height="40" fill="#eee" rx="2" />
                <rect x="55" y="65" width="30" height="8" fill="#5D4E37" rx="1" />
            </svg>
        )
    },

    // STREETWEAR CATEGORY
    split_vertical: {
        name: "Split Vertical",
        category: "streetwear",
        description: "Image left, text right",
        textFields: ["headline", "subtext", "price"],
        diagram: (
            <svg viewBox="0 0 90 160" style={{ width: '100%', height: '100%' }}>
                <rect x="0" y="0" width="90" height="160" fill="#1a1a1a" rx="4" />
                <rect x="5" y="5" width="38" height="150" fill="#2a2a2a" rx="2" />
                <circle cx="24" cy="55" r="14" fill="#444" />
                <rect x="12" y="72" width="24" height="35" fill="#444" rx="2" />
                <rect x="48" y="5" width="37" height="150" fill="#222" rx="2" />
                <rect x="53" y="50" width="27" height="10" fill="#4a9eff" rx="1" />
            </svg>
        )
    },
    story_card: {
        name: "Story Card",
        category: "streetwear",
        description: "Instagram story style",
        textFields: ["headline", "cta"],
        diagram: (
            <svg viewBox="0 0 90 160" style={{ width: '100%', height: '100%' }}>
                <rect x="0" y="0" width="90" height="160" fill="#2a2a2a" rx="4" />
                <circle cx="45" cy="60" r="28" fill="#444" />
                <rect x="20" y="92" width="50" height="50" fill="#444" rx="2" />
                <rect x="10" y="8" width="20" height="20" fill="#ff4a9e" rx="10" />
                <rect x="15" y="145" width="60" height="10" fill="#4a9eff" rx="2" />
            </svg>
        )
    },
    lookbook_spread: {
        name: "Lookbook",
        category: "streetwear",
        description: "Editorial lookbook style",
        textFields: ["brand", "headline", "subtext", "price"],
        diagram: (
            <svg viewBox="0 0 90 160" style={{ width: '100%', height: '100%' }}>
                <rect x="0" y="0" width="90" height="160" fill="#1a1a1a" rx="4" />
                <rect x="5" y="5" width="80" height="70" fill="#2a2a2a" rx="2" />
                <circle cx="45" cy="35" r="18" fill="#444" />
                <rect x="32" y="55" width="26" height="18" fill="#444" rx="1" />
                <rect x="5" y="80" width="40" height="8" fill="#ff4a4a" rx="1" />
                <rect x="5" y="92" width="80" height="12" fill="#4a9eff" rx="1" />
                <rect x="5" y="130" width="25" height="20" fill="#4a9" rx="2" />
            </svg>
        )
    },

    // BONO CATEGORY
    orange_diagonal: {
        name: "Orange Diagonal",
        category: "bono",
        description: "Split with diagonal banner",
        textFields: ["brand", "headline", "subtext", "tagline"],
        diagram: (
            <svg viewBox="0 0 90 160" style={{ width: '100%', height: '100%' }}>
                <rect x="0" y="0" width="90" height="80" fill="#fff" rx="4 4 0 0" />
                <rect x="0" y="80" width="90" height="80" fill="#E67E22" rx="0 0 4 4" />
                <circle cx="45" cy="55" r="18" fill="#ddd" />
                <rect x="30" y="75" width="30" height="35" fill="#ddd" rx="2" />
                <polygon points="0,100 90,70 90,90 0,120" fill="#D35400" />
                <rect x="25" y="10" width="40" height="10" fill="#E67E22" rx="1" />
            </svg>
        )
    },
    yellow_vibrant: {
        name: "Yellow Vibrant",
        category: "bono",
        description: "Bright yellow, purple accents",
        textFields: ["headline", "subtext", "brand"],
        diagram: (
            <svg viewBox="0 0 90 160" style={{ width: '100%', height: '100%' }}>
                <rect x="0" y="0" width="90" height="160" fill="#F1C40F" rx="4" />
                <rect x="5" y="10" width="70" height="15" stroke="#8E44AD" fill="none" strokeWidth="2" rx="1" />
                <circle cx="45" cy="70" r="22" fill="#ddd" />
                <rect x="28" y="95" width="34" height="40" fill="#ddd" rx="2" />
                <circle cx="75" cy="50" r="3" fill="#8E44AD" />
                <rect x="75" y="100" width="2" height="50" fill="#8E44AD" />
            </svg>
        )
    },
    orange_framed: {
        name: "Orange Framed",
        category: "bono",
        description: "Deep orange, white frame",
        textFields: ["headline", "tagline", "brand"],
        diagram: (
            <svg viewBox="0 0 90 160" style={{ width: '100%', height: '100%' }}>
                <rect x="0" y="0" width="90" height="160" fill="#D35400" rx="4" />
                <rect x="8" y="8" width="74" height="144" fill="none" stroke="#fff" strokeWidth="2" rx="2" />
                <rect x="6" y="6" width="4" height="4" fill="#fff" />
                <rect x="80" y="6" width="4" height="4" fill="#fff" />
                <circle cx="45" cy="85" r="22" fill="#c0c0c0" />
                <rect x="28" y="110" width="34" height="35" fill="#c0c0c0" rx="2" />
            </svg>
        )
    },

    // NEW ARTISTIC LAYOUTS
    polaroid_pip: {
        name: "Polaroid PiP",
        category: "elegant",
        description: "Floating Polaroid inset",
        textFields: ["brand", "headline", "subtext"],
        diagram: (
            <svg viewBox="0 0 90 160" style={{ width: '100%', height: '100%' }}>
                {/* Background - zoomed fabric texture */}
                <rect x="0" y="0" width="90" height="160" fill="#3a3a3a" rx="4" />
                <rect x="5" y="20" width="80" height="120" fill="#4a4a4a" rx="2" />
                {/* Polaroid card floating in corner */}
                <rect x="50" y="10" width="35" height="50" fill="#fff" rx="2" />
                <rect x="53" y="13" width="29" height="36" fill="#2a2a2a" rx="1" />
                <circle cx="68" cy="26" r="8" fill="#666" />
                <rect x="60" y="36" width="16" height="12" fill="#666" rx="1" />
                <rect x="53" y="52" width="29" height="5" fill="#ddd" rx="1" />
            </svg>
        )
    },
    vertical_diptych: {
        name: "50/50 Diptych",
        category: "minimal",
        description: "Clean front/back split",
        textFields: ["brand", "headline"],
        diagram: (
            <svg viewBox="0 0 90 160" style={{ width: '100%', height: '100%' }}>
                <rect x="0" y="0" width="90" height="160" fill="#1a1a1a" rx="4" />
                {/* Left pane - front */}
                <rect x="3" y="3" width="40" height="154" fill="#2a2a2a" rx="2" />
                <circle cx="23" cy="50" r="14" fill="#444" />
                <rect x="12" y="68" width="22" height="30" fill="#444" rx="2" />
                {/* Right pane - back */}
                <rect x="47" y="3" width="40" height="154" fill="#2a2a2a" rx="2" />
                <circle cx="67" cy="50" r="14" fill="#555" />
                <rect x="56" y="68" width="22" height="30" fill="#555" rx="2" />
                {/* Center gutter line */}
                <rect x="44" y="3" width="2" height="154" fill="#fff" />
                {/* Bottom text spanning both */}
                <rect x="15" y="140" width="60" height="12" fill="#4a9eff" rx="2" />
            </svg>
        )
    },
    hero_sidebar_strip: {
        name: "Hero + Strip",
        category: "bold",
        description: "75% hero + detail thumbnails",
        textFields: ["headline", "subtext", "tagline"],
        diagram: (
            <svg viewBox="0 0 90 160" style={{ width: '100%', height: '100%' }}>
                <rect x="0" y="0" width="90" height="160" fill="#1a1a1a" rx="4" />
                {/* Main hero area 75% */}
                <rect x="3" y="3" width="62" height="154" fill="#2a2a2a" rx="2" />
                <circle cx="35" cy="55" r="20" fill="#444" />
                <rect x="20" y="80" width="30" height="45" fill="#444" rx="2" />
                <rect x="10" y="130" width="48" height="10" fill="#4a9eff" rx="1" />
                {/* Sidebar strip with thumbnails */}
                <rect x="68" y="3" width="19" height="154" fill="#222" rx="2" />
                <rect x="70" y="8" width="15" height="15" fill="#555" rx="1" />
                <rect x="70" y="28" width="15" height="15" fill="#555" rx="1" />
                <rect x="70" y="48" width="15" height="15" fill="#555" rx="1" />
                <rect x="70" y="68" width="15" height="15" fill="#555" rx="1" />
            </svg>
        )
    },
    scrapbook_stack: {
        name: "Scrapbook Stack",
        category: "streetwear",
        description: "Overlapping photos",
        textFields: ["headline", "brand"],
        diagram: (
            <svg viewBox="0 0 90 160" style={{ width: '100%', height: '100%' }}>
                <rect x="0" y="0" width="90" height="160" fill="#f5f5f5" rx="4" />
                {/* Bottom photo - faded/tilted */}
                <g transform="rotate(-8 30 90)">
                    <rect x="10" y="50" width="50" height="70" fill="#ccc" rx="2" />
                    <rect x="13" y="53" width="44" height="58" fill="#888" rx="1" />
                </g>
                {/* Top photo - full color with shadow */}
                <g transform="rotate(6 60 80)">
                    <rect x="28" y="35" width="50" height="70" fill="#333" rx="2" />
                    <rect x="30" y="40" width="46" height="60" fill="#2a2a2a" rx="1" />
                    <circle cx="53" cy="62" r="12" fill="#666" />
                    <rect x="44" y="76" width="18" height="20" fill="#666" rx="1" />
                </g>
                {/* Loose typography */}
                <rect x="5" y="135" width="50" height="12" fill="#333" rx="1" />
            </svg>
        )
    },
    ghost_double_exposure: {
        name: "Ghost Exposure",
        category: "elegant",
        description: "B&W blend, 3D depth",
        textFields: ["headline", "subtext"],
        diagram: (
            <svg viewBox="0 0 90 160" style={{ width: '100%', height: '100%' }}>
                <rect x="0" y="0" width="90" height="160" fill="#1a1a1a" rx="4" />
                {/* Ghost background - faded face/back print */}
                <circle cx="45" cy="60" r="35" fill="#2a2a2a" opacity="0.5" />
                <ellipse cx="45" cy="45" rx="15" ry="18" fill="#333" opacity="0.4" />
                {/* Text layer - sandwiched */}
                <rect x="10" y="75" width="70" height="18" fill="#4a9eff" opacity="0.7" rx="2" />
                {/* Sharp foreground cutout */}
                <circle cx="55" cy="95" r="18" fill="#888" />
                <rect x="42" y="115" width="26" height="38" fill="#888" rx="2" />
            </svg>
        )
    },
    typographic_gutter: {
        name: "Typo Gutter",
        category: "bold",
        description: "Text band divides images",
        textFields: ["brand", "headline"],
        diagram: (
            <svg viewBox="0 0 90 160" style={{ width: '100%', height: '100%' }}>
                <rect x="0" y="0" width="90" height="160" fill="#1a1a1a" rx="4" />
                {/* Top image */}
                <rect x="5" y="5" width="80" height="55" fill="#2a2a2a" rx="2" />
                <circle cx="45" cy="28" r="15" fill="#444" />
                <rect x="35" y="45" width="20" height="12" fill="#444" rx="1" />
                {/* Bold text gutter band */}
                <rect x="0" y="65" width="90" height="30" fill="#4a9eff" />
                <text x="45" y="85" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">BRAND</text>
                {/* Bottom image */}
                <rect x="5" y="100" width="80" height="55" fill="#2a2a2a" rx="2" />
                <circle cx="45" cy="122" r="15" fill="#555" />
                <rect x="35" y="140" width="20" height="12" fill="#555" rx="1" />
            </svg>
        )
    }
}

// Styles
const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
    },
    filterTabs: {
        display: 'flex',
        gap: '0.5rem',
        flexWrap: 'wrap',
        marginBottom: '0.5rem'
    },
    filterTab: (isActive) => ({
        padding: '0.5rem 1rem',
        borderRadius: '20px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '0.75rem',
        fontWeight: 600,
        transition: 'all 0.3s ease',
        background: isActive ? 'var(--accent)' : 'var(--bg-tertiary)',
        color: isActive ? 'white' : 'var(--text-secondary)',
        transform: isActive ? 'scale(1.05)' : 'scale(1)',
        boxShadow: isActive ? '0 4px 12px rgba(74, 158, 255, 0.3)' : 'none'
    }),
    layoutGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '0.6rem'
    },
    layoutCard: (isSelected) => ({
        cursor: 'pointer',
        padding: '0.5rem',
        borderRadius: '12px',
        border: isSelected ? '2px solid var(--accent)' : '2px solid transparent',
        background: isSelected ? 'var(--bg-secondary)' : 'var(--bg-tertiary)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isSelected ? 'scale(1.03)' : 'scale(1)',
        boxShadow: isSelected ? '0 8px 24px rgba(74, 158, 255, 0.2)' : '0 2px 8px rgba(0,0,0,0.1)',
        animation: 'fadeIn 0.3s ease'
    }),
    layoutDiagram: {
        height: '70px',
        marginBottom: '0.4rem',
        borderRadius: '6px',
        overflow: 'hidden'
    },
    layoutName: {
        fontSize: '0.65rem',
        fontWeight: 600,
        textAlign: 'center',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    },
    countBadge: {
        fontSize: '0.65rem',
        background: 'var(--bg-secondary)',
        padding: '0.15rem 0.4rem',
        borderRadius: '10px',
        marginLeft: '0.3rem'
    }
}

export default function LayoutPreview({ selected, onSelect }) {
    const [activeCategory, setActiveCategory] = useState('all')

    // Filter layouts based on category
    const filteredLayouts = useMemo(() => {
        if (activeCategory === 'all') {
            return Object.entries(LAYOUTS)
        }
        return Object.entries(LAYOUTS).filter(([, layout]) => layout.category === activeCategory)
    }, [activeCategory])

    // Count layouts per category
    const categoryCounts = useMemo(() => {
        const counts = { all: Object.keys(LAYOUTS).length }
        Object.values(LAYOUTS).forEach(layout => {
            counts[layout.category] = (counts[layout.category] || 0) + 1
        })
        return counts
    }, [])

    return (
        <div style={styles.container}>
            {/* Category Filter Tabs */}
            <div style={styles.filterTabs}>
                {Object.entries(CATEGORIES).map(([key, cat]) => (
                    <button
                        key={key}
                        onClick={() => setActiveCategory(key)}
                        style={styles.filterTab(activeCategory === key)}
                    >
                        {cat.icon} {cat.name}
                        <span style={styles.countBadge}>{categoryCounts[key] || 0}</span>
                    </button>
                ))}
            </div>

            {/* Layout Grid */}
            <div style={styles.layoutGrid}>
                {filteredLayouts.map(([key, layout]) => (
                    <div
                        key={key}
                        onClick={() => onSelect(key)}
                        style={styles.layoutCard(selected === key)}
                        onMouseEnter={(e) => {
                            if (selected !== key) {
                                e.currentTarget.style.transform = 'scale(1.02)'
                                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.15)'
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (selected !== key) {
                                e.currentTarget.style.transform = 'scale(1)'
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
                            }
                        }}
                    >
                        <div style={styles.layoutDiagram}>
                            {layout.diagram}
                        </div>
                        <div style={styles.layoutName}>
                            {layout.name}
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty state */}
            {filteredLayouts.length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No layouts in this category
                </div>
            )}
        </div>
    )
}

// Export layout config for text field filtering
export { LAYOUTS }
