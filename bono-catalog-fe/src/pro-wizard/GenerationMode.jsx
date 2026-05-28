import React from 'react'

export default function GenerationMode({
    generationMode,
    setGenerationMode,
    onNext,
    onPrev
}) {
    return (
        <div className="wizard-step">
            <div className="step-header">
                <h2>🚀 Generation Mode</h2>
                <p>Choose how to generate your catalog</p>
            </div>

            <div className="selection-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                {/* TRUE Batch Mode - 50% off with Gemini Batch API */}
                <div
                    className={`selection-card ${generationMode === 'true_batch' ? 'selected' : ''}`}
                    onClick={() => setGenerationMode('true_batch')}
                    style={{ padding: '1.5rem', textAlign: 'left' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '2rem' }}>🎯</span>
                        <div>
                            <div className="card-title" style={{ fontSize: '1.1rem' }}>Batch API</div>
                            <div style={{
                                background: 'linear-gradient(90deg, #2ecc71, #27ae60)',
                                color: 'white',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.65rem',
                                fontWeight: 600,
                                display: 'inline-block',
                                marginTop: '0.25rem'
                            }}>
                                50% DISCOUNT ✨
                            </div>
                        </div>
                    </div>

                    <ul style={{
                        listStyle: 'none',
                        padding: 0,
                        margin: 0,
                        fontSize: '0.8rem',
                        color: 'rgba(255,255,255,0.7)'
                    }}>
                        <li style={{ marginBottom: '0.35rem' }}>✓ True Gemini Batch API</li>
                        <li style={{ marginBottom: '0.35rem' }}>✓ 50% cost reduction</li>
                        <li style={{ marginBottom: '0.35rem' }}>✓ Up to 24h processing</li>
                        <li>✓ Email when ready</li>
                    </ul>

                    <div style={{
                        marginTop: '0.75rem',
                        padding: '0.5rem',
                        background: 'rgba(46, 204, 113, 0.1)',
                        borderRadius: '6px',
                        fontSize: '0.7rem',
                        color: '#2ecc71'
                    }}>
                        💰 Best for cost savings
                    </div>
                </div>

                {/* Standard Batch Mode - Background processing */}
                <div
                    className={`selection-card ${generationMode === 'batch' ? 'selected' : ''}`}
                    onClick={() => setGenerationMode('batch')}
                    style={{ padding: '1.5rem', textAlign: 'left' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '2rem' }}>📦</span>
                        <div>
                            <div className="card-title" style={{ fontSize: '1.1rem' }}>Background</div>
                            <div style={{
                                background: '#3498db',
                                color: 'white',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.65rem',
                                fontWeight: 600,
                                display: 'inline-block',
                                marginTop: '0.25rem'
                            }}>
                                STANDARD
                            </div>
                        </div>
                    </div>

                    <ul style={{
                        listStyle: 'none',
                        padding: 0,
                        margin: 0,
                        fontSize: '0.8rem',
                        color: 'rgba(255,255,255,0.7)'
                    }}>
                        <li style={{ marginBottom: '0.35rem' }}>✓ Queue and close browser</li>
                        <li style={{ marginBottom: '0.35rem' }}>✓ Usually 1-4 hours</li>
                        <li style={{ marginBottom: '0.35rem' }}>✓ Email notification</li>
                        <li>✓ Track in dashboard</li>
                    </ul>

                    <div style={{
                        marginTop: '0.75rem',
                        padding: '0.5rem',
                        background: 'rgba(52, 152, 219, 0.1)',
                        borderRadius: '6px',
                        fontSize: '0.7rem',
                        color: '#3498db'
                    }}>
                        ⏰ Regular processing
                    </div>
                </div>

                {/* Instant Mode */}
                <div
                    className={`selection-card ${generationMode === 'instant' ? 'selected' : ''}`}
                    onClick={() => setGenerationMode('instant')}
                    style={{ padding: '1.5rem', textAlign: 'left' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '2rem' }}>⚡</span>
                        <div>
                            <div className="card-title" style={{ fontSize: '1.1rem' }}>Instant</div>
                            <div style={{
                                background: '#f39c12',
                                color: 'black',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.65rem',
                                fontWeight: 600,
                                display: 'inline-block',
                                marginTop: '0.25rem'
                            }}>
                                RUSH
                            </div>
                        </div>
                    </div>

                    <ul style={{
                        listStyle: 'none',
                        padding: 0,
                        margin: 0,
                        fontSize: '0.8rem',
                        color: 'rgba(255,255,255,0.7)'
                    }}>
                        <li style={{ marginBottom: '0.35rem' }}>✓ Generate now</li>
                        <li style={{ marginBottom: '0.35rem' }}>✓ ~30-60 sec/image</li>
                        <li style={{ marginBottom: '0.35rem' }}>✓ Download direct</li>
                        <li>✓ Stay on page</li>
                    </ul>

                    <div style={{
                        marginTop: '0.75rem',
                        padding: '0.5rem',
                        background: 'rgba(243, 156, 18, 0.1)',
                        borderRadius: '6px',
                        fontSize: '0.7rem',
                        color: '#f39c12'
                    }}>
                        ⏱️ Urgent orders only
                    </div>
                </div>
            </div>

            {/* Mode comparison table */}
            <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                fontSize: '0.8rem'
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', color: 'rgba(255,255,255,0.8)' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <th style={{ textAlign: 'left', padding: '0.5rem' }}></th>
                            <th style={{ textAlign: 'center', padding: '0.5rem', color: '#2ecc71' }}>🎯 Batch API</th>
                            <th style={{ textAlign: 'center', padding: '0.5rem', color: '#3498db' }}>📦 Background</th>
                            <th style={{ textAlign: 'center', padding: '0.5rem', color: '#f39c12' }}>⚡ Instant</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={{ padding: '0.5rem' }}>Cost per 2K image</td>
                            <td style={{ textAlign: 'center', padding: '0.5rem', color: '#2ecc71', fontWeight: 600 }}>$0.07</td>
                            <td style={{ textAlign: 'center', padding: '0.5rem' }}>$0.13</td>
                            <td style={{ textAlign: 'center', padding: '0.5rem' }}>$0.13</td>
                        </tr>
                        <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                            <td style={{ padding: '0.5rem' }}>Processing time</td>
                            <td style={{ textAlign: 'center', padding: '0.5rem' }}>Up to 24h</td>
                            <td style={{ textAlign: 'center', padding: '0.5rem' }}>1-4 hours</td>
                            <td style={{ textAlign: 'center', padding: '0.5rem', color: '#f39c12' }}>30-60 sec</td>
                        </tr>
                        <tr>
                            <td style={{ padding: '0.5rem' }}>Best for</td>
                            <td style={{ textAlign: 'center', padding: '0.5rem' }}>Large catalogs</td>
                            <td style={{ textAlign: 'center', padding: '0.5rem' }}>Regular work</td>
                            <td style={{ textAlign: 'center', padding: '0.5rem' }}>Demos</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="step-navigation">
                <button className="btn-prev" onClick={onPrev}>
                    ← Back
                </button>
                <button className="btn-next" onClick={onNext}>
                    Review Summary →
                </button>
            </div>
        </div>
    )
}
