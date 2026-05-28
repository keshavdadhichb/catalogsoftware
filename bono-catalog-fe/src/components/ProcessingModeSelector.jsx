import React from 'react'

const PROCESSING_MODES = [
    {
        value: "instant",
        label: "Instant",
        desc: "Ready in ~5 min",
        icon: "⚡",
        price: "Full price"
    },
    {
        value: "batch",
        label: "Batch (50% off)",
        desc: "Ready in 1-24h",
        icon: "💰",
        price: "Half price"
    }
]

const styles = {
    container: {
        display: 'flex',
        gap: '1rem',
        marginBottom: '1rem'
    },
    option: (isSelected) => ({
        flex: 1,
        padding: '1rem',
        borderRadius: '12px',
        border: isSelected ? '2px solid var(--accent-primary)' : '2px solid var(--border-color)',
        background: isSelected ? 'var(--bg-secondary)' : 'var(--bg-tertiary)',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        textAlign: 'center',
        transform: isSelected ? 'scale(1.02)' : 'scale(1)',
        boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.08)' : 'none'
    }),
    icon: {
        fontSize: '1.5rem',
        marginBottom: '0.4rem'
    },
    label: {
        fontSize: '1rem',
        fontWeight: 700,
        color: 'var(--text-primary)'
    },
    desc: {
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        marginTop: '0.25rem'
    },
    price: {
        fontSize: '0.7rem',
        color: 'var(--accent-primary)',
        marginTop: '0.25rem',
        fontWeight: 600
    },
    batchBadge: {
        display: 'inline-block',
        background: 'linear-gradient(135deg, #10b981, #059669)',
        color: 'white',
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '0.65rem',
        fontWeight: 700,
        marginTop: '0.5rem'
    }
}

export default function ProcessingModeSelector({ selected, onSelect }) {
    return (
        <div style={styles.container}>
            {PROCESSING_MODES.map(opt => (
                <div
                    key={opt.value}
                    onClick={() => onSelect(opt.value)}
                    style={styles.option(selected === opt.value)}
                    onMouseEnter={(e) => {
                        if (selected !== opt.value) {
                            e.currentTarget.style.borderColor = 'var(--text-muted)'
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (selected !== opt.value) {
                            e.currentTarget.style.borderColor = 'var(--border-color)'
                        }
                    }}
                >
                    <div style={styles.icon}>{opt.icon}</div>
                    <div style={styles.label}>{opt.label}</div>
                    <div style={styles.desc}>{opt.desc}</div>
                    <div style={styles.price}>{opt.price}</div>
                    {opt.value === 'batch' && (
                        <div style={styles.batchBadge}>SAVE 50%</div>
                    )}
                </div>
            ))}
        </div>
    )
}
