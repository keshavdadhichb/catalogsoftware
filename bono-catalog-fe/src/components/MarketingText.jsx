function MarketingText({
    headline,
    subheadline,
    featureTagline,
    onHeadlineChange,
    onSubheadlineChange,
    onFeatureTaglineChange
}) {
    return (
        <div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginBottom: '1rem' }}>
                Add marketing text that will appear on catalog pages
            </p>

            <div style={{ display: 'grid', gap: '1rem' }}>
                <div className="form-group">
                    <label>Headline</label>
                    <input
                        type="text"
                        value={headline}
                        onChange={(e) => onHeadlineChange(e.target.value)}
                        placeholder="e.g., Elevate your"
                    />
                </div>

                <div className="form-group">
                    <label>Subheadline</label>
                    <input
                        type="text"
                        value={subheadline}
                        onChange={(e) => onSubheadlineChange(e.target.value)}
                        placeholder="e.g., everyday wardrobe with"
                    />
                </div>

                <div className="form-group">
                    <label>Feature Tagline</label>
                    <input
                        type="text"
                        value={featureTagline}
                        onChange={(e) => onFeatureTaglineChange(e.target.value)}
                        placeholder="e.g., Relaxed Fit. Sharp Style"
                    />
                </div>
            </div>
        </div>
    )
}

export default MarketingText
