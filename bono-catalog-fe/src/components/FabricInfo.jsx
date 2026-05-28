const fabricFeatures = [
    { id: 'breathable', label: 'Breathable', icon: '💨' },
    { id: 'stretchable', label: 'Stretchable', icon: '↔️' },
    { id: 'soft', label: 'Soft Touch', icon: '🪶' },
    { id: 'durable', label: 'Durable', icon: '💪' },
    { id: 'moisture_wicking', label: 'Moisture Wicking', icon: '💧' },
    { id: 'eco_friendly', label: 'Eco-Friendly', icon: '🌿' },
]

const fabricTypes = [
    { value: '100% Cotton', label: '100% Cotton' },
    { value: 'Cotton Blend', label: 'Cotton Blend' },
    { value: 'Polyester', label: 'Polyester' },
    { value: 'Cotton Lycra', label: 'Cotton Lycra' },
    { value: 'Organic Cotton', label: 'Organic Cotton' },
]

function FabricInfo({
    fabricType,
    selectedFeatures,
    onFabricTypeChange,
    onFeatureToggle
}) {
    return (
        <div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginBottom: '1rem' }}>
                Add fabric information for feature callout pages
            </p>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label>Fabric Composition</label>
                <select value={fabricType} onChange={(e) => onFabricTypeChange(e.target.value)}>
                    {fabricTypes.map(f => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                </select>
            </div>

            <div>
                <label style={{ display: 'block', marginBottom: '0.75rem' }}>Fabric Features</label>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '0.5rem'
                }}>
                    {fabricFeatures.map(f => (
                        <button
                            key={f.id}
                            type="button"
                            onClick={() => onFeatureToggle(f.id)}
                            style={{
                                padding: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                background: selectedFeatures.includes(f.id)
                                    ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%)'
                                    : 'var(--bg-tertiary)',
                                border: selectedFeatures.includes(f.id)
                                    ? '2px solid var(--accent-primary)'
                                    : '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-md)',
                                cursor: 'pointer',
                                color: 'var(--text-primary)',
                                fontSize: '0.875rem',
                                justifyContent: 'center'
                            }}
                        >
                            <span>{f.icon}</span>
                            <span>{f.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default FabricInfo
