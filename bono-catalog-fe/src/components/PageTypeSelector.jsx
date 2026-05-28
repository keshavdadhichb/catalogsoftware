const pageTypes = [
    {
        id: 'hero_model',
        label: 'Hero Model Page',
        desc: 'Styled background with marketing text',
        icon: '🌟'
    },
    {
        id: 'flatlay',
        label: 'Product Flat-Lay',
        desc: 'Multiple products arranged artistically',
        icon: '📦'
    },
    {
        id: 'feature_callout',
        label: 'Feature Callout',
        desc: 'Model with props & feature arrows',
        icon: '👆'
    },
    {
        id: 'fabric_detail',
        label: 'Fabric Detail',
        desc: 'Split layout with closeup + model',
        icon: '🧵'
    },
]

function PageTypeSelector({ selectedTypes, onToggle }) {
    return (
        <div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginBottom: '1rem' }}>
                Select which page types to generate for your catalog
            </p>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.75rem'
            }}>
                {pageTypes.map(pt => (
                    <button
                        key={pt.id}
                        type="button"
                        onClick={() => onToggle(pt.id)}
                        style={{
                            padding: '1rem',
                            background: selectedTypes.includes(pt.id)
                                ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%)'
                                : 'var(--bg-tertiary)',
                            border: selectedTypes.includes(pt.id)
                                ? '2px solid var(--accent-primary)'
                                : '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.2s ease',
                            color: 'var(--text-primary)',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.75rem'
                        }}
                    >
                        <span style={{ fontSize: '1.5rem' }}>{pt.icon}</span>
                        <div>
                            <div style={{ fontWeight: 500, marginBottom: '4px' }}>{pt.label}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{pt.desc}</div>
                        </div>
                        {selectedTypes.includes(pt.id) && (
                            <span style={{ marginLeft: 'auto', color: 'var(--accent-primary)' }}>✓</span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    )
}

export default PageTypeSelector
