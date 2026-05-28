import React from 'react'
import LayoutPreview, { LAYOUTS } from './LayoutPreview'
import ThemePreview from './ThemePreview'
import PosePreview from './PosePreview'

// Props with icons
const PROPS = [
    { value: 'none', label: 'None', icon: '−' },
    { value: 'cap', label: 'Cap', icon: '🧢' },
    { value: 'sunglasses', label: 'Sunglasses', icon: '🕶️' },
    { value: 'watch', label: 'Watch', icon: '⌚' },
    { value: 'headphones', label: 'Headphones', icon: '🎧' },
    { value: 'coffee', label: 'Coffee', icon: '☕' },
    { value: 'skateboard', label: 'Skateboard', icon: '🛹' },
    { value: 'basketball', label: 'Basketball', icon: '🏀' }
]

const fitTypes = [
    { value: 'slim', label: 'Slim Fit' },
    { value: 'regular', label: 'Regular Fit' },
    { value: 'boxy', label: 'Boxy Fit' },
    { value: 'oversized', label: 'Oversized' },
    { value: 'loose', label: 'Loose Fit' },
]

export default function MarketingOptions({
    theme, setTheme,
    prop, setProp,
    pose, setPose,
    fit, setFit,
    layoutStyle, setLayoutStyle,
    // Text fields
    headline, setHeadline,
    subtext, setSubtext,
    brand, setBrand,
    price, setPrice,
    cta, setCta,
    tagline, setTagline
}) {
    // Get text fields for selected layout
    const selectedLayout = LAYOUTS[layoutStyle] || LAYOUTS.hero_bottom
    const activeTextFields = selectedLayout.textFields || []

    return (
        <div className="marketing-options">
            {/* SECTION 1: Layout Selection */}
            <div className="option-section">
                <h3 className="section-title">
                    <span className="section-icon">📐</span>
                    Layout Style
                </h3>
                <p className="section-hint">Choose how your poster will be structured</p>
                <LayoutPreview selected={layoutStyle} onSelect={setLayoutStyle} />
                <div className="selected-info">
                    <strong>{selectedLayout.name}:</strong> {selectedLayout.description}
                </div>
            </div>

            {/* SECTION 2: Theme / Environment */}
            <div className="option-section">
                <h3 className="section-title">
                    <span className="section-icon">🌲</span>
                    Theme & Environment
                </h3>
                <p className="section-hint">Set the mood and background style</p>
                <ThemePreview selected={theme} onSelect={setTheme} />
            </div>

            {/* SECTION 3: Pose */}
            <div className="option-section">
                <h3 className="section-title">
                    <span className="section-icon">🧍</span>
                    Model Pose
                </h3>
                <p className="section-hint">How should the model stand?</p>
                <PosePreview selected={pose} onSelect={setPose} />
            </div>

            {/* SECTION 3.5: Fit */}
            <div className="option-section">
                <h3 className="section-title">
                    <span className="section-icon">👕</span>
                    Garment Fit
                </h3>
                <p className="section-hint">Choose how the garment fits on the model</p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {fitTypes.map(f => (
                        <button
                            key={f.value}
                            type="button"
                            onClick={() => setFit(f.value)}
                            className={`prop-btn ${fit === f.value ? 'selected' : ''}`}
                            style={{ padding: '0.5rem 1rem', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0.25rem', height: 'auto', border: fit === f.value ? '2px solid var(--accent)' : '2px solid transparent' }}
                        >
                            <span style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{f.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* SECTION 4: Props */}
            <div className="option-section">
                <h3 className="section-title">
                    <span className="section-icon">✨</span>
                    Props & Accessories
                </h3>
                <div className="props-grid">
                    {PROPS.map(p => (
                        <button
                            key={p.value}
                            type="button"
                            onClick={() => setProp(p.value)}
                            className={`prop-btn ${prop === p.value ? 'selected' : ''}`}
                        >
                            <span className="prop-icon">{p.icon}</span>
                            <span className="prop-label">{p.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* SECTION 5: Text Content */}
            <div className="option-section">
                <h3 className="section-title">
                    <span className="section-icon">📝</span>
                    Text Content
                </h3>
                <p className="section-hint">
                    These fields will appear in your <strong>{selectedLayout.name}</strong> layout
                </p>

                <div className="text-fields">
                    {/* Headline */}
                    {activeTextFields.includes('headline') && (
                        <div className="form-group">
                            <label>
                                <span className="field-icon">H1</span>
                                Headline
                            </label>
                            <input
                                type="text"
                                value={headline}
                                onChange={(e) => setHeadline(e.target.value.toUpperCase())}
                                placeholder="RELAXED FIT"
                                maxLength={30}
                            />
                        </div>
                    )}

                    {/* Subtext */}
                    {activeTextFields.includes('subtext') && (
                        <div className="form-group">
                            <label>
                                <span className="field-icon">H2</span>
                                Subtext
                            </label>
                            <input
                                type="text"
                                value={subtext}
                                onChange={(e) => setSubtext(e.target.value)}
                                placeholder="Premium Cotton Collection"
                                maxLength={50}
                            />
                        </div>
                    )}

                    {/* Brand */}
                    {activeTextFields.includes('brand') && (
                        <div className="form-group">
                            <label>
                                <span className="field-icon">®</span>
                                Brand Name
                            </label>
                            <input
                                type="text"
                                value={brand}
                                onChange={(e) => setBrand(e.target.value)}
                                placeholder="BONO"
                                maxLength={20}
                            />
                        </div>
                    )}

                    {/* Tagline */}
                    {activeTextFields.includes('tagline') && (
                        <div className="form-group">
                            <label>
                                <span className="field-icon">💬</span>
                                Tagline
                            </label>
                            <input
                                type="text"
                                value={tagline}
                                onChange={(e) => setTagline(e.target.value)}
                                placeholder="Made for Champions"
                                maxLength={40}
                            />
                        </div>
                    )}

                    {/* Price */}
                    {(activeTextFields.includes('price') || activeTextFields.includes('sizes')) && (
                        <div className="form-row">
                            {activeTextFields.includes('price') && (
                                <div className="form-group">
                                    <label>
                                        <span className="field-icon">₹</span>
                                        Price
                                    </label>
                                    <input
                                        type="text"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        placeholder="₹1,299"
                                        maxLength={15}
                                    />
                                </div>
                            )}

                            {activeTextFields.includes('sizes') && (
                                <div className="form-group">
                                    <label>
                                        <span className="field-icon">📏</span>
                                        Sizes
                                    </label>
                                    <input
                                        type="text"
                                        value={subtext}
                                        onChange={(e) => setSubtext(e.target.value)}
                                        placeholder="S M L XL XXL"
                                        maxLength={25}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* CTA */}
                    {activeTextFields.includes('cta') && (
                        <div className="form-group">
                            <label>
                                <span className="field-icon">👆</span>
                                Call to Action
                            </label>
                            <input
                                type="text"
                                value={cta}
                                onChange={(e) => setCta(e.target.value)}
                                placeholder="SHOP NOW"
                                maxLength={20}
                            />
                        </div>
                    )}

                    {activeTextFields.length === 0 && (
                        <p className="no-text-hint">
                            This layout focuses on the visual. No text fields needed.
                        </p>
                    )}
                </div>
            </div>

            <style>{`
        .marketing-options {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .option-section {
          padding: 1rem;
          background: var(--bg-secondary);
          border-radius: 12px;
          border: 1px solid var(--border-color);
        }
        
        .section-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1rem;
          font-weight: 600;
          margin: 0 0 0.25rem 0;
          color: var(--text-primary);
        }
        
        .section-icon {
          font-size: 1.1rem;
        }
        
        .section-hint {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin: 0 0 0.75rem 0;
        }
        
        .selected-info {
          margin-top: 0.75rem;
          padding: 0.5rem 0.75rem;
          background: var(--bg-tertiary);
          border-radius: 6px;
          font-size: 0.8rem;
          color: var(--text-secondary);
        }
        
        .props-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.5rem;
        }
        
        .prop-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          padding: 0.5rem;
          border: 2px solid transparent;
          background: var(--bg-tertiary);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .prop-btn:hover {
          background: var(--bg-secondary);
        }
        
        .prop-btn.selected {
          border-color: var(--accent);
          background: var(--bg-secondary);
        }
        
        .prop-icon {
          font-size: 1.25rem;
        }
        
        .prop-label {
          font-size: 0.6rem;
          font-weight: 500;
          color: var(--text-secondary);
        }
        
        .text-fields {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .text-fields .form-group label {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.8rem;
        }
        
        .field-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          background: var(--accent);
          color: white;
          border-radius: 4px;
          font-size: 0.65rem;
          font-weight: 700;
        }
        
        .no-text-hint {
          color: var(--text-muted);
          font-style: italic;
          font-size: 0.85rem;
          text-align: center;
          padding: 1rem;
        }
        
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }
      `}</style>
        </div>
    )
}
