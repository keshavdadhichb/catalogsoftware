import React from 'react'

// 16 Settings (Background/Environment)
export const SETTINGS = [
    {
        id: 'white_studio',
        name: 'White Studio',
        icon: '⬜',
        number: 1,
        prompt: 'Clean infinite white seamless paper backdrop, professional soft diffused lighting, no shadows, commercial photography style, pure white background',
        recommended: ['clean_white', 'soft_neutral', 'premium_editorial']
    },
    {
        id: 'gray_concrete',
        name: 'Gray Concrete',
        icon: '🪨',
        number: 2,
        prompt: 'Industrial concrete floor and wall, soft natural window light, modern minimalist studio, gray textured background, architectural feel',
        recommended: ['urban_street', 'dark_luxe', 'premium_editorial']
    },
    {
        id: 'colored_gel',
        name: 'Colored Gel Studio',
        icon: '🔮',
        number: 3,
        prompt: 'Studio with colored lighting gels, creative fashion editorial setup, dramatic colored lighting matching theme palette, professional studio',
        recommended: ['neon_night', 'retro_90s', 'maximalist_glam']
    },
    {
        id: 'beach_golden',
        name: 'Beach Golden Hour',
        icon: '🏖️',
        number: 4,
        prompt: 'Sandy beach at sunset, warm golden hour light, gentle ocean waves visible in background, natural wind effect on hair and clothes, tropical paradise vibe',
        recommended: ['summer_vibes', 'soft_neutral', 'bohemian']
    },
    {
        id: 'mountain_trail',
        name: 'Mountain Trail',
        icon: '🏔️',
        number: 5,
        prompt: 'Rocky mountain trail, lush pine trees, morning mist in background, adventure outdoor setting, crisp mountain air feel, hiking trail atmosphere',
        recommended: ['winter_frost', 'autumn_warm', 'varsity_sports']
    },
    {
        id: 'city_rooftop',
        name: 'City Rooftop',
        icon: '🌆',
        number: 6,
        prompt: 'Urban rooftop at dusk, city skyline in background, warm fairy lights, metropolitan vibe, modern city atmosphere, twilight sky',
        recommended: ['urban_street', 'neon_night', 'dark_luxe']
    },
    {
        id: 'graffiti_alley',
        name: 'Graffiti Alley',
        icon: '🎨',
        number: 7,
        prompt: 'Street art covered brick walls, vibrant graffiti murals, urban gritty texture, street photography aesthetic, colorful wall art background',
        recommended: ['urban_street', 'retro_90s', 'varsity_sports']
    },
    {
        id: 'cafe_terrace',
        name: 'Cafe Terrace',
        icon: '☕',
        number: 8,
        prompt: 'Outdoor European-style cafe seating, potted plants, natural daylight, rustic wooden furniture, cozy romantic atmosphere, sidewalk cafe',
        recommended: ['soft_neutral', 'spring_bloom', 'bohemian']
    },
    {
        id: 'park_bench',
        name: 'Park Bench',
        icon: '🌳',
        number: 9,
        prompt: 'Public park setting, wooden bench, large trees with green leaves, dappled sunlight through foliage, natural relaxed atmosphere, urban park',
        recommended: ['spring_bloom', 'summer_vibes', 'playful_kids']
    },
    {
        id: 'college_campus',
        name: 'College Campus',
        icon: '🎓',
        number: 10,
        prompt: 'University corridor with brick walls, library interior, youthful academic environment, collegiate architecture, studious atmosphere',
        recommended: ['clean_white', 'varsity_sports', 'premium_editorial']
    },
    {
        id: 'gym_sports',
        name: 'Gym / Sports',
        icon: '🏋️',
        number: 11,
        prompt: 'Modern gym interior with equipment, or outdoor basketball court, athletic training environment, sports facility, energetic atmosphere',
        recommended: ['varsity_sports', 'urban_street', 'neon_night']
    },
    {
        id: 'living_room',
        name: 'Living Room',
        icon: '🛋️',
        number: 12,
        prompt: 'Cozy home interior with neutral furniture, soft natural light from windows, lifestyle at-home photoshoot, comfortable domestic setting',
        recommended: ['soft_neutral', 'clean_white', 'bohemian']
    },
    {
        id: 'luxury_hotel',
        name: 'Luxury Hotel',
        icon: '🏨',
        number: 13,
        prompt: 'Premium hotel lobby with marble floors, crystal chandeliers, elegant high-end interior, luxury fashion setting, five-star ambiance',
        recommended: ['dark_luxe', 'maximalist_glam', 'premium_editorial']
    },
    {
        id: 'art_gallery',
        name: 'Art Gallery',
        icon: '🖼️',
        number: 14,
        prompt: 'White gallery walls with contemporary art pieces, sophisticated cultural setting, museum-like atmosphere, clean gallery lighting',
        recommended: ['clean_white', 'premium_editorial', 'soft_neutral']
    },
    {
        id: 'night_market',
        name: 'Night Market',
        icon: '🎪',
        number: 15,
        prompt: 'Street food stalls with colorful string lights, lively crowd background blur, festival atmosphere, evening market, bustling night scene',
        recommended: ['ethnic_festive', 'neon_night', 'retro_90s']
    },
    {
        id: 'garden_greenhouse',
        name: 'Garden / Greenhouse',
        icon: '🌿',
        number: 16,
        prompt: 'Lush tropical plants, natural greenhouse with glass roof, botanical garden vibes, greenery everywhere, organic natural setting',
        recommended: ['spring_bloom', 'bohemian', 'soft_neutral']
    }
]

export default function SettingSelector({
    selectedSetting,
    setSelectedSetting,
    selectedTheme,
    onNext,
    onPrev,
    canProceed
}) {
    // Sort to show recommended settings first if a theme is selected
    const sortedSettings = selectedTheme
        ? [...SETTINGS].sort((a, b) => {
            const aRec = a.recommended.includes(selectedTheme.id)
            const bRec = b.recommended.includes(selectedTheme.id)
            if (aRec && !bRec) return -1
            if (!aRec && bRec) return 1
            return 0
        })
        : SETTINGS

    return (
        <div className="wizard-step">
            <div className="step-header">
                <h2>📍 Shoot Setting</h2>
                <p>Choose the background environment for model photos</p>
            </div>

            {selectedTheme && (
                <div style={{
                    marginBottom: '1.5rem',
                    padding: '0.75rem 1rem',
                    background: 'rgba(243, 156, 18, 0.1)',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    color: '#f39c12'
                }}>
                    ⭐ Recommended settings for "{selectedTheme.name}" theme shown first
                </div>
            )}

            <div className="preview-grid">
                {sortedSettings.map(setting => {
                    const isRecommended = selectedTheme?.id && setting.recommended.includes(selectedTheme.id)
                    return (
                        <div
                            key={setting.id}
                            className={`preview-card ${selectedSetting?.id === setting.id ? 'selected' : ''}`}
                            onClick={() => setSelectedSetting(setting)}
                            style={isRecommended ? { borderColor: 'rgba(243, 156, 18, 0.5)' } : {}}
                        >
                            <div
                                className="preview-image"
                                style={{
                                    background: 'linear-gradient(135deg, #2c3e50, #3498db)'
                                }}
                            >
                                <span style={{ fontSize: '2.5rem' }}>{setting.icon}</span>
                                {isRecommended && (
                                    <span style={{
                                        position: 'absolute',
                                        top: 4,
                                        right: 4,
                                        background: '#f39c12',
                                        color: '#000',
                                        fontSize: '0.6rem',
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        fontWeight: 600
                                    }}>
                                        ★
                                    </span>
                                )}
                            </div>
                            <div className="preview-info">
                                <div className="preview-name">{setting.name}</div>
                                <div className="preview-number">#{setting.number}</div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Selected Setting Details */}
            {selectedSetting && (
                <div style={{
                    marginTop: '1.5rem',
                    padding: '1rem',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem'
                }}>
                    <span style={{ fontSize: '2rem' }}>{selectedSetting.icon}</span>
                    <div>
                        <div style={{ fontWeight: 600, color: 'white' }}>{selectedSetting.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.25rem' }}>
                            {selectedSetting.prompt}
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
