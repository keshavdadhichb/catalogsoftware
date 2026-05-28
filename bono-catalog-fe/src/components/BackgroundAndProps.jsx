const backgroundStyles = [
    { value: 'navy_blue', label: 'Navy Blue', color: '#1a2744' },
    { value: 'studio_white', label: 'Studio White', color: '#ffffff' },
    { value: 'soft_gray', label: 'Soft Gray', color: '#e5e5e5' },
    { value: 'lifestyle_gym', label: 'Gym/Lockers', color: '#2d3748' },
    { value: 'lifestyle_street', label: 'Street', color: '#4a5568' },
]

const props = [
    { value: 'none', label: 'No Prop' },
    { value: 'basketball', label: '🏀 Basketball' },
    { value: 'chair', label: '🪑 Chair' },
    { value: 'skateboard', label: '🛹 Skateboard' },
]

const fitTypes = [
    { value: 'Relaxed', label: 'Relaxed Fit' },
    { value: 'Regular', label: 'Regular Fit' },
    { value: 'Slim', label: 'Slim Fit' },
    { value: 'Oversized', label: 'Oversized' },
]

function BackgroundAndProps({
    backgroundStyle,
    prop,
    fitType,
    onBackgroundChange,
    onPropChange,
    onFitTypeChange
}) {
    return (
        <div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginBottom: '1rem' }}>
                Choose background style, props, and fit description
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Background Style</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {backgroundStyles.map(bg => (
                        <button
                            key={bg.value}
                            type="button"
                            onClick={() => onBackgroundChange(bg.value)}
                            style={{
                                padding: '0.5rem 1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                background: backgroundStyle === bg.value
                                    ? 'var(--accent-primary)'
                                    : 'var(--bg-tertiary)',
                                border: backgroundStyle === bg.value
                                    ? '2px solid var(--accent-primary)'
                                    : '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-md)',
                                cursor: 'pointer',
                                color: backgroundStyle === bg.value ? 'white' : 'var(--text-primary)',
                                fontSize: '0.875rem'
                            }}
                        >
                            <span
                                style={{
                                    width: '16px',
                                    height: '16px',
                                    borderRadius: '4px',
                                    background: bg.color,
                                    border: '1px solid rgba(255,255,255,0.3)'
                                }}
                            />
                            {bg.label}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                    <label>Props</label>
                    <select value={prop} onChange={(e) => onPropChange(e.target.value)}>
                        {props.map(p => (
                            <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Fit Type</label>
                    <select value={fitType} onChange={(e) => onFitTypeChange(e.target.value)}>
                        {fitTypes.map(f => (
                            <option key={f.value} value={f.value}>{f.label}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    )
}

export default BackgroundAndProps
