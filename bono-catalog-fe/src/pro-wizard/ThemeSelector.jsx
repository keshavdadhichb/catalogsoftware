import React from 'react'

// 16 Themes with design language configurations
export const THEMES = [
    {
        id: 'clean_white',
        name: 'Clean White',
        icon: '⬜',
        number: 1,
        colors: { primary: '#ffffff', secondary: '#f5f5f5', accent: '#333333' },
        fonts: { heading: 'Montserrat', body: 'Inter' },
        description: 'Pure minimal gallery style'
    },
    {
        id: 'soft_neutral',
        name: 'Soft Neutral',
        icon: '🍦',
        number: 2,
        colors: { primary: '#faf8f5', secondary: '#ebe6de', accent: '#8b7355' },
        fonts: { heading: 'Lora', body: 'Open Sans' },
        description: 'Warm cream tones, airy feel'
    },
    {
        id: 'dark_luxe',
        name: 'Dark Luxe',
        icon: '🖤',
        number: 3,
        colors: { primary: '#1a1a1a', secondary: '#2d2d2d', accent: '#d4af37' },
        fonts: { heading: 'Playfair Display', body: 'Inter' },
        description: 'Black with gold accents'
    },
    {
        id: 'summer_vibes',
        name: 'Summer Vibes',
        icon: '☀️',
        number: 4,
        colors: { primary: '#fff9e6', secondary: '#ffe066', accent: '#ff6b6b' },
        fonts: { heading: 'Poppins', body: 'Source Sans Pro' },
        description: 'Bright yellows and corals'
    },
    {
        id: 'winter_frost',
        name: 'Winter Frost',
        icon: '❄️',
        number: 5,
        colors: { primary: '#f0f8ff', secondary: '#e6f2ff', accent: '#4a90d9' },
        fonts: { heading: 'Montserrat', body: 'Roboto' },
        description: 'Cool blues and silvers'
    },
    {
        id: 'autumn_warm',
        name: 'Autumn Warm',
        icon: '🍂',
        number: 6,
        colors: { primary: '#fdf5e6', secondary: '#d2691e', accent: '#8b0000' },
        fonts: { heading: 'Lora', body: 'Open Sans' },
        description: 'Burnt orange and maroon'
    },
    {
        id: 'spring_bloom',
        name: 'Spring Bloom',
        icon: '🌸',
        number: 7,
        colors: { primary: '#fff0f5', secondary: '#e8f5e9', accent: '#81c784' },
        fonts: { heading: 'Poppins', body: 'Inter' },
        description: 'Pastels and fresh greens'
    },
    {
        id: 'urban_street',
        name: 'Urban Street',
        icon: '🏙️',
        number: 8,
        colors: { primary: '#e0e0e0', secondary: '#9e9e9e', accent: '#ff5722' },
        fonts: { heading: 'Oswald', body: 'Roboto' },
        description: 'Graffiti textures, concrete'
    },
    {
        id: 'retro_90s',
        name: 'Retro 90s',
        icon: '📼',
        number: 9,
        colors: { primary: '#ffeb3b', secondary: '#e91e63', accent: '#00bcd4' },
        fonts: { heading: 'Poppins', body: 'Source Sans Pro' },
        description: 'Vibrant nostalgic colors'
    },
    {
        id: 'premium_editorial',
        name: 'Premium Editorial',
        icon: '📰',
        number: 10,
        colors: { primary: '#fafafa', secondary: '#212121', accent: '#757575' },
        fonts: { heading: 'Playfair Display', body: 'Source Sans Pro' },
        description: 'High-end magazine style'
    },
    {
        id: 'playful_kids',
        name: 'Playful Kids',
        icon: '🧸',
        number: 11,
        colors: { primary: '#fff8e1', secondary: '#81d4fa', accent: '#ff7043' },
        fonts: { heading: 'Poppins', body: 'Roboto' },
        description: 'Bright, fun, rounded'
    },
    {
        id: 'ethnic_festive',
        name: 'Ethnic Festive',
        icon: '🪔',
        number: 12,
        colors: { primary: '#fdf5e6', secondary: '#c62828', accent: '#ffd700' },
        fonts: { heading: 'Lora', body: 'Open Sans' },
        description: 'Rich jewel tones, celebration'
    },
    {
        id: 'neon_night',
        name: 'Neon Night',
        icon: '🌃',
        number: 13,
        colors: { primary: '#0d0d0d', secondary: '#1a1a2e', accent: '#ff00ff' },
        fonts: { heading: 'Oswald', body: 'Inter' },
        description: 'Dark with neon pink/blue'
    },
    {
        id: 'bohemian',
        name: 'Bohemian',
        icon: '🏕️',
        number: 14,
        colors: { primary: '#f5ebe0', secondary: '#a98467', accent: '#6b4423' },
        fonts: { heading: 'Lora', body: 'Open Sans' },
        description: 'Earthy, mandala patterns'
    },
    {
        id: 'varsity_sports',
        name: 'Varsity Sports',
        icon: '🏀',
        number: 15,
        colors: { primary: '#ffffff', secondary: '#1565c0', accent: '#f44336' },
        fonts: { heading: 'Oswald', body: 'Roboto' },
        description: 'Athletic, dynamic angles'
    },
    {
        id: 'maximalist_glam',
        name: 'Maximalist Glam',
        icon: '✨',
        number: 16,
        colors: { primary: '#1a1a1a', secondary: '#8e24aa', accent: '#ffd700' },
        fonts: { heading: 'Playfair Display', body: 'Inter' },
        description: 'Glitter, baroque, over-the-top'
    }
]

export default function ThemeSelector({
    selectedTheme,
    setSelectedTheme,
    onNext,
    onPrev,
    canProceed
}) {
    return (
        <div className="wizard-step">
            <div className="step-header">
                <h2>🎨 Design Theme</h2>
                <p>Choose the visual language for your catalog</p>
            </div>

            <div className="preview-grid">
                {THEMES.map(theme => (
                    <div
                        key={theme.id}
                        className={`preview-card ${selectedTheme?.id === theme.id ? 'selected' : ''}`}
                        onClick={() => setSelectedTheme(theme)}
                    >
                        <div
                            className="preview-image"
                            style={{
                                background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%)`,
                                color: theme.colors.accent
                            }}
                        >
                            <span style={{ fontSize: '2.5rem' }}>{theme.icon}</span>
                        </div>
                        <div className="preview-info">
                            <div className="preview-name">{theme.name}</div>
                            <div className="preview-number">#{theme.number}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Selected Theme Details */}
            {selectedTheme && (
                <div style={{
                    marginTop: '1.5rem',
                    padding: '1rem',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    <span style={{ fontSize: '2rem' }}>{selectedTheme.icon}</span>
                    <div>
                        <div style={{ fontWeight: 600, color: 'white' }}>{selectedTheme.name}</div>
                        <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
                            {selectedTheme.description} • Fonts: {selectedTheme.fonts.heading}, {selectedTheme.fonts.body}
                        </div>
                    </div>
                </div>
            )}

            <div className="step-navigation">
                <button className="btn-prev" onClick={onPrev}>
                    ← Back
                </button>
                <button
                    className="btn-next"
                    onClick={onNext}
                    disabled={!canProceed}
                >
                    Continue →
                </button>
            </div>
        </div>
    )
}
