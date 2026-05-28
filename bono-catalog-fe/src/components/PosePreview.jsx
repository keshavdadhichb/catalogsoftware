import React from 'react'

// Pose configurations with stick figure SVGs
const POSES = {
    catalog_standard: {
        name: "Catalog Standard",
        description: "Classic standing pose",
        figure: (
            <svg viewBox="0 0 40 60" style={{ width: '100%', height: '100%' }}>
                <circle cx="20" cy="8" r="6" fill="currentColor" />
                <line x1="20" y1="14" x2="20" y2="35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="20" y1="20" x2="10" y2="30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="20" y1="20" x2="30" y2="30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="20" y1="35" x2="14" y2="55" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="20" y1="35" x2="26" y2="55" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
        )
    },
    hands_on_hips: {
        name: "Hands on Hips",
        description: "Confident stance",
        figure: (
            <svg viewBox="0 0 40 60" style={{ width: '100%', height: '100%' }}>
                <circle cx="20" cy="8" r="6" fill="currentColor" />
                <line x1="20" y1="14" x2="20" y2="35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M20 20 L12 28 L14 35" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
                <path d="M20 20 L28 28 L26 35" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
                <line x1="20" y1="35" x2="14" y2="55" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="20" y1="35" x2="26" y2="55" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
        )
    },
    hands_in_pockets: {
        name: "Hands in Pockets",
        description: "Casual relaxed",
        figure: (
            <svg viewBox="0 0 40 60" style={{ width: '100%', height: '100%' }}>
                <circle cx="20" cy="8" r="6" fill="currentColor" />
                <line x1="20" y1="14" x2="20" y2="35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="20" y1="20" x2="14" y2="35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="20" y1="20" x2="26" y2="35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="20" y1="35" x2="14" y2="55" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="20" y1="35" x2="26" y2="55" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
        )
    },
    arms_crossed: {
        name: "Arms Crossed",
        description: "Strong presence",
        figure: (
            <svg viewBox="0 0 40 60" style={{ width: '100%', height: '100%' }}>
                <circle cx="20" cy="8" r="6" fill="currentColor" />
                <line x1="20" y1="14" x2="20" y2="35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="12" y1="25" x2="28" y2="25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="12" y1="28" x2="28" y2="28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="20" y1="35" x2="14" y2="55" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="20" y1="35" x2="26" y2="55" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
        )
    },
    walking: {
        name: "Walking",
        description: "Dynamic motion",
        figure: (
            <svg viewBox="0 0 40 60" style={{ width: '100%', height: '100%' }}>
                <circle cx="22" cy="8" r="6" fill="currentColor" />
                <line x1="22" y1="14" x2="20" y2="35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="20" y1="20" x2="12" y2="28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="20" y1="20" x2="30" y2="26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="20" y1="35" x2="10" y2="55" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="20" y1="35" x2="30" y2="55" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
        )
    },
    sitting_chair: {
        name: "Sitting",
        description: "Seated on chair",
        figure: (
            <svg viewBox="0 0 40 60" style={{ width: '100%', height: '100%' }}>
                <circle cx="20" cy="8" r="6" fill="currentColor" />
                <line x1="20" y1="14" x2="20" y2="30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="20" y1="20" x2="10" y2="28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="20" y1="20" x2="30" y2="28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="20" y1="30" x2="10" y2="35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="20" y1="30" x2="30" y2="35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="10" y1="35" x2="10" y2="55" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="30" y1="35" x2="30" y2="55" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <rect x="5" y="30" width="30" height="4" fill="none" stroke="currentColor" strokeWidth="1" />
            </svg>
        )
    },
    leaning_wall: {
        name: "Leaning",
        description: "Against wall",
        figure: (
            <svg viewBox="0 0 40 60" style={{ width: '100%', height: '100%' }}>
                <line x1="35" y1="0" x2="35" y2="60" stroke="currentColor" strokeWidth="1" opacity="0.3" />
                <circle cx="22" cy="10" r="6" fill="currentColor" />
                <line x1="22" y1="16" x2="24" y2="35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="23" y1="22" x2="32" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="23" y1="22" x2="12" y2="30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="24" y1="35" x2="18" y2="55" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="24" y1="35" x2="32" y2="55" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
        )
    },
    crouching: {
        name: "Crouching",
        description: "Low dynamic pose",
        figure: (
            <svg viewBox="0 0 40 60" style={{ width: '100%', height: '100%' }}>
                <circle cx="20" cy="22" r="6" fill="currentColor" />
                <line x1="20" y1="28" x2="20" y2="40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="20" y1="32" x2="10" y2="38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="20" y1="32" x2="30" y2="38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M20 40 L12 48 L8 55" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
                <path d="M20 40 L28 48 L32 55" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
            </svg>
        )
    },
    editorial_dramatic: {
        name: "Editorial",
        description: "High fashion pose",
        figure: (
            <svg viewBox="0 0 40 60" style={{ width: '100%', height: '100%' }}>
                <circle cx="18" cy="8" r="6" fill="currentColor" />
                <line x1="18" y1="14" x2="22" y2="35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="20" y1="20" x2="8" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="20" y1="20" x2="35" y2="25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="22" y1="35" x2="12" y2="55" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="22" y1="35" x2="32" y2="50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
        )
    }
}

export default function PosePreview({ selected, onSelect }) {
    return (
        <div className="pose-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.5rem'
        }}>
            {Object.entries(POSES).map(([key, pose]) => (
                <div
                    key={key}
                    onClick={() => onSelect(key)}
                    style={{
                        cursor: 'pointer',
                        padding: '0.5rem',
                        borderRadius: '8px',
                        border: selected === key ? '2px solid var(--accent)' : '2px solid transparent',
                        background: selected === key ? 'var(--bg-secondary)' : 'var(--bg-tertiary)',
                        transition: 'all 0.2s ease',
                        color: selected === key ? 'var(--accent)' : 'var(--text-muted)'
                    }}
                >
                    <div style={{ height: '40px', marginBottom: '0.3rem' }}>
                        {pose.figure}
                    </div>
                    <div style={{
                        fontSize: '0.6rem',
                        fontWeight: 600,
                        textAlign: 'center',
                        color: selected === key ? 'var(--text-primary)' : 'var(--text-secondary)'
                    }}>
                        {pose.name}
                    </div>
                </div>
            ))}
        </div>
    )
}

export { POSES }
