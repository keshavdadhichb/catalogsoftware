import React from 'react'

const QUALITY_OPTIONS = [
    {
        value: "1K",
        label: "1K",
        desc: "Fast & Light"
    },
    {
        value: "2K",
        label: "2K Pure",
        desc: "Standard"
    },
    {
        value: "4K",
        label: "4K Pure",
        desc: "Premium"
    },
    {
        value: "2K_UPSCALE",
        label: "2K → 4K",
        desc: "Smart Upscale"
    },
    {
        value: "4K_UPSCALE",
        label: "4K → 8K",
        desc: "Ultra Upscale"
    }
]

const styles = {
    container: {
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '0.5rem',
        marginBottom: '0.5rem'
    },
    option: (isSelected) => ({
        padding: '0.75rem 0.5rem',
        borderRadius: '12px',
        border: isSelected ? '2px solid var(--accent-primary)' : '2px solid var(--border-color)',
        background: isSelected ? 'var(--bg-secondary)' : 'var(--bg-tertiary)',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        textAlign: 'center',
        transform: isSelected ? 'scale(1.02)' : 'scale(1)',
        boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.08)' : 'none'
    }),
    label: {
        fontSize: '0.85rem',
        fontWeight: 700,
        color: 'var(--text-primary)',
        whiteSpace: 'nowrap'
    },
    desc: {
        fontSize: '0.65rem',
        color: 'var(--text-muted)',
        marginTop: '0.3rem'
    }
}

export default function QualitySelector({ selected, onSelect }) {
    return (
        <div style={styles.container}>
            {QUALITY_OPTIONS.map(opt => (
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
                    <div style={styles.label}>{opt.label}</div>
                    <div style={styles.desc}>{opt.desc}</div>
                </div>
            ))}
        </div>
    )
}
