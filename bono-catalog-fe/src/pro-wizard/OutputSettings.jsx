import React from 'react'

const QUALITY_OPTIONS = [
    { id: '1K', name: '1K', desc: 'Fast, economical', resolution: '1024px' },
    { id: '2K', name: '2K', desc: 'Balanced quality', resolution: '2048px' },
    { id: '4K', name: '4K', desc: 'High quality', resolution: '4096px' }
]

const ASPECT_OPTIONS = [
    { id: 'a4_portrait', name: 'A4 Portrait', ratio: '1:1.41', icon: '📄' },
    { id: 'square', name: 'Square', ratio: '1:1', icon: '⬛' },
    { id: 'story', name: 'Story (9:16)', ratio: '9:16', icon: '📱' },
    { id: 'landscape', name: 'Landscape (16:9)', ratio: '16:9', icon: '🖼️' }
]

const FORMAT_OPTIONS = [
    { id: 'images', name: 'PNG ZIP Only', desc: 'Individual images in ZIP', icon: '🖼️' },
    { id: 'pdf', name: 'PDF Only', desc: 'Single PDF document', icon: '📕' },
    { id: 'both', name: 'Both', desc: 'ZIP + PDF', icon: '📦' }
]

// NEW: Output Style options
const OUTPUT_STYLE_OPTIONS = [
    {
        id: 'simple',
        name: 'Simple Raw',
        icon: '📷',
        desc: 'Clean AI photos only',
        details: 'Just the generated model photos, no text or layouts'
    },
    {
        id: 'layout',
        name: 'Backend Overlay',
        icon: '📰',
        desc: 'Photos with poster layouts',
        details: 'Professional layouts with text, prices & branding'
    },
    {
        id: 'ai_native',
        name: 'AI Editorial',
        icon: '✨',
        desc: 'High-fashion poster generation',
        details: 'AI creates the entire poster design. 95% text accuracy.'
    }
]

export default function OutputSettings({
    quality,
    setQuality,
    aspectRatio,
    setAspectRatio,
    outputFormat,
    setOutputFormat,
    outputStyle,
    setOutputStyle,
    onNext,
    onPrev
}) {
    return (
        <div className="wizard-step">
            <div className="step-header">
                <h2>📦 Output Settings</h2>
                <p>Configure style, quality and format for your catalog</p>
            </div>

            {/* OUTPUT STYLE - NEW PRIMARY OPTION */}
            <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    ✨ Output Style
                    <span style={{
                        background: 'rgba(243, 156, 18, 0.2)',
                        color: '#f39c12',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 500
                    }}>
                        NEW
                    </span>
                </label>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1rem',
                    marginTop: '0.75rem'
                }}>
                    {OUTPUT_STYLE_OPTIONS.map(opt => (
                        <button
                            key={opt.id}
                            onClick={() => setOutputStyle(opt.id)}
                            style={{
                                background: outputStyle === opt.id
                                    ? 'linear-gradient(135deg, rgba(46, 204, 113, 0.2), rgba(46, 204, 113, 0.1))'
                                    : 'rgba(255,255,255,0.05)',
                                border: outputStyle === opt.id
                                    ? '2px solid #2ecc71'
                                    : '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                padding: '1.25rem',
                                cursor: 'pointer',
                                textAlign: 'left',
                                color: 'white',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{opt.icon}</div>
                            <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                                {opt.name}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#2ecc71', marginBottom: '0.5rem' }}>
                                {opt.desc}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
                                {opt.details}
                            </div>
                            {outputStyle === opt.id && (
                                <div style={{
                                    marginTop: '0.75rem',
                                    background: 'rgba(46, 204, 113, 0.3)',
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '4px',
                                    fontSize: '0.75rem',
                                    textAlign: 'center',
                                    color: '#2ecc71'
                                }}>
                                    ✓ Selected
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Layout mode info */}
                {outputStyle === 'layout' && (
                    <div style={{
                        marginTop: '1rem',
                        padding: '0.75rem 1rem',
                        background: 'rgba(52, 152, 219, 0.1)',
                        border: '1px solid rgba(52, 152, 219, 0.3)',
                        borderRadius: '8px'
                    }}>
                        <div style={{ fontSize: '0.85rem', color: '#3498db', fontWeight: 500, marginBottom: '0.25rem' }}>
                            📐 Catalog Layout includes:
                        </div>
                        <ul style={{
                            margin: 0,
                            paddingLeft: '1.25rem',
                            fontSize: '0.8rem',
                            color: 'rgba(255,255,255,0.7)',
                            lineHeight: 1.6
                        }}>
                            <li>Professional poster layouts</li>
                            <li>Product name & number</li>
                            <li>Price display (if provided)</li>
                            <li>Brand logo placement</li>
                            <li>Marketing text overlays</li>
                        </ul>
                    </div>
                )}

                {/* AI Editorial mode info */}
                {outputStyle === 'ai_native' && (
                    <div style={{
                        marginTop: '1rem',
                        padding: '0.75rem 1rem',
                        background: 'linear-gradient(to right, rgba(155, 89, 182, 0.1), rgba(142, 68, 173, 0.1))',
                        border: '1px solid rgba(155, 89, 182, 0.3)',
                        borderRadius: '8px'
                    }}>
                        <div style={{ fontSize: '0.85rem', color: '#9b59b6', fontWeight: 500, marginBottom: '0.25rem' }}>
                            ✨ AI Editorial Mode:
                        </div>
                        <ul style={{
                            margin: 0,
                            paddingLeft: '1.25rem',
                            fontSize: '0.8rem',
                            color: 'rgba(255,255,255,0.7)',
                            lineHeight: 1.6
                        }}>
                            <li><b>Creative Freedom:</b> AI designs the poster layout</li>
                            <li><b>Marketing Copy:</b> AI invents unique, theme-based headlines</li>
                            <li><b>Editorial Look:</b> High-fashion magazine aesthetic</li>
                            <li><b>Note:</b> Specific text accuracy is ~95%</li>
                        </ul>
                    </div>
                )}
            </div>

            {/* Quality Selection */}
            <div className="form-group" style={{ marginTop: '1.5rem' }}>
                <label>Image Quality</label>
                <div className="selection-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                    {QUALITY_OPTIONS.map(opt => (
                        <div
                            key={opt.id}
                            className={`selection-card ${quality === opt.id ? 'selected' : ''}`}
                            onClick={() => setQuality(opt.id)}
                        >
                            <div className="card-title" style={{ fontSize: '1.5rem' }}>{opt.name}</div>
                            <div className="card-desc">{opt.desc}</div>
                            <div className="card-desc" style={{ marginTop: '0.25rem' }}>{opt.resolution}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Aspect Ratio */}
            <div className="form-group" style={{ marginTop: '1.5rem' }}>
                <label>Page Aspect Ratio</label>
                <div className="selection-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                    {ASPECT_OPTIONS.map(opt => (
                        <div
                            key={opt.id}
                            className={`selection-card ${aspectRatio === opt.id ? 'selected' : ''}`}
                            onClick={() => setAspectRatio(opt.id)}
                            style={{ padding: '1rem' }}
                        >
                            <div className="card-icon">{opt.icon}</div>
                            <div className="card-title" style={{ fontSize: '0.85rem' }}>{opt.name}</div>
                            <div className="card-desc">{opt.ratio}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Output Format */}
            <div className="form-group" style={{ marginTop: '1.5rem' }}>
                <label>Output Format</label>
                <div className="selection-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                    {FORMAT_OPTIONS.map(opt => (
                        <div
                            key={opt.id}
                            className={`selection-card ${outputFormat === opt.id ? 'selected' : ''}`}
                            onClick={() => setOutputFormat(opt.id)}
                        >
                            <div className="card-icon">{opt.icon}</div>
                            <div className="card-title">{opt.name}</div>
                            <div className="card-desc">{opt.desc}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="step-navigation">
                <button className="btn-prev" onClick={onPrev}>
                    ← Back
                </button>
                <button className="btn-next" onClick={onNext}>
                    Continue →
                </button>
            </div>
        </div>
    )
}
