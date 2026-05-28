import React from 'react'

export default function ExtrasSelector({
    includeIndex,
    setIncludeIndex,
    includePriceList,
    setIncludePriceList,
    includeThankYou,
    setIncludeThankYou,
    onNext,
    onPrev
}) {
    return (
        <div className="wizard-step">
            <div className="step-header">
                <h2>✨ Optional Pages</h2>
                <p>Add extra pages to your catalog</p>
            </div>

            {/* Cover Page - Always included */}
            <div className="toggle-option" style={{ opacity: 0.6 }}>
                <div>
                    <div className="toggle-label">📕 Cover Page</div>
                    <div className="toggle-desc">Logo + Catalog Name + Number (always included)</div>
                </div>
                <div className="toggle-switch active" style={{ cursor: 'not-allowed' }}></div>
            </div>

            {/* Index Page */}
            <div className="toggle-option">
                <div>
                    <div className="toggle-label">📑 Index Page</div>
                    <div className="toggle-desc">Product thumbnails with page numbers</div>
                </div>
                <div
                    className={`toggle-switch ${includeIndex ? 'active' : ''}`}
                    onClick={() => setIncludeIndex(!includeIndex)}
                ></div>
            </div>

            {/* Price List */}
            <div className="toggle-option">
                <div>
                    <div className="toggle-label">💰 Price List Page</div>
                    <div className="toggle-desc">Products with prices in a list format</div>
                </div>
                <div
                    className={`toggle-switch ${includePriceList ? 'active' : ''}`}
                    onClick={() => setIncludePriceList(!includePriceList)}
                ></div>
            </div>

            {/* Thank You Page */}
            <div className="toggle-option">
                <div>
                    <div className="toggle-label">🙏 Thank You / Closing Page</div>
                    <div className="toggle-desc">Aesthetic closing page matching theme</div>
                </div>
                <div
                    className={`toggle-switch ${includeThankYou ? 'active' : ''}`}
                    onClick={() => setIncludeThankYou(!includeThankYou)}
                ></div>
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
