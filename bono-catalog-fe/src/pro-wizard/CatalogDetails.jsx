import React from 'react'

export default function CatalogDetails({
    catalogName,
    setCatalogName,
    catalogNumber,
    setCatalogNumber,
    language,
    setLanguage,
    onNext,
    onPrev,
    canProceed
}) {
    return (
        <div className="wizard-step">
            <div className="step-header">
                <h2>📚 Catalog Details</h2>
                <p>Enter the details for this catalog</p>
            </div>

            <div className="form-group">
                <label>Catalog Name *</label>
                <input
                    type="text"
                    className="form-input"
                    value={catalogName}
                    onChange={(e) => setCatalogName(e.target.value)}
                    placeholder="e.g., Summer Collection 2026"
                />
            </div>

            <div className="form-group">
                <label>Catalog Number (Optional)</label>
                <input
                    type="text"
                    className="form-input"
                    value={catalogNumber}
                    onChange={(e) => setCatalogNumber(e.target.value)}
                    placeholder="e.g., CAT-2026-001"
                />
            </div>

            <div className="form-group">
                <label>Marketing Text Language</label>
                <select
                    className="form-select"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                >
                    <option value="english">English</option>
                    <option value="hinglish">Hinglish (Hindi + English)</option>
                </select>
            </div>

            <div className="step-navigation">
                <button className="btn-prev" onClick={onPrev}>
                    ← Back
                </button>
                <button
                    className="btn-next"
                    onClick={onNext}
                    disabled={!canProceed}
                >
                    Continue →
                </button>
            </div>
        </div>
    )
}
