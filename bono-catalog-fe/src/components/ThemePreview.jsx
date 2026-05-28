import React from 'react'

// Theme configurations with colors and mood
const THEMES = {
    studio_minimal: {
        name: "Studio Minimal",
        colors: ["#f5f5f5", "#ffffff", "#e0e0e0"],
        mood: "Clean & Professional",
        icon: "◯"
    },
    varsity_locker: {
        name: "Varsity Locker",
        colors: ["#1a365d", "#c53030", "#2d3748"],
        mood: "Sporty & Bold",
        icon: "🏀"
    },
    studio_color: {
        name: "Studio Color",
        colors: ["#ed8936", "#4299e1", "#48bb78"],
        mood: "Vibrant & Fun",
        icon: "🎨"
    },
    urban_street: {
        name: "Urban Street",
        colors: ["#2d3748", "#4a5568", "#718096"],
        mood: "Gritty & Raw",
        icon: "🏙️"
    },
    abstract_color: {
        name: "Abstract Color",
        colors: ["#9f7aea", "#ed64a6", "#4fd1c5"],
        mood: "Artistic & Creative",
        icon: "✦"
    },
    industrial: {
        name: "Industrial",
        colors: ["#4a5568", "#2d3748", "#a0aec0"],
        mood: "Raw & Edgy",
        icon: "⚙️"
    },
    nature_outdoor: {
        name: "Nature Outdoor",
        colors: ["#48bb78", "#38a169", "#9ae6b4"],
        mood: "Fresh & Natural",
        icon: "🌿"
    },
    neon_night: {
        name: "Neon Night",
        colors: ["#0d0d0d", "#ff00ff", "#00ffff"],
        mood: "Electric & Bold",
        icon: "⚡"
    }
}

export default function ThemePreview({ selected, onSelect }) {
    return (
        <div className="theme-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0.6rem'
        }}>
            {Object.entries(THEMES).map(([key, theme]) => (
                <div
                    key={key}
                    onClick={() => onSelect(key)}
                    style={{
                        cursor: 'pointer',
                        padding: '0.6rem',
                        borderRadius: '8px',
                        border: selected === key ? '2px solid var(--accent)' : '2px solid transparent',
                        background: selected === key ? 'var(--bg-secondary)' : 'var(--bg-tertiary)',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem'
                    }}
                >
                    {/* Color swatches */}
                    <div style={{
                        display: 'flex',
                        gap: '2px',
                        borderRadius: '4px',
                        overflow: 'hidden'
                    }}>
                        {theme.colors.map((color, i) => (
                            <div
                                key={i}
                                style={{
                                    width: '16px',
                                    height: '32px',
                                    background: color
                                }}
                            />
                        ))}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                        }}>
                            <span>{theme.icon}</span>
                            <span style={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}>{theme.name}</span>
                        </div>
                        <div style={{
                            fontSize: '0.6rem',
                            color: 'var(--text-muted)',
                            marginTop: '2px'
                        }}>
                            {theme.mood}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

export { THEMES }
