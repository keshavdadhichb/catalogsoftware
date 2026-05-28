function CatalogPreview({ jobStatus, onReset }) {
    const handleDownload = () => {
        if (jobStatus.catalog_url) {
            window.open(jobStatus.catalog_url, '_blank')
        }
    }

    return (
        <div className="download-section">
            <h3>🎉 Catalog Ready!</h3>
            <p>Your professional fashion catalog has been generated successfully.</p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={handleDownload}>
                    📥 Download PDF
                </button>
                <button
                    className="btn"
                    onClick={onReset}
                    style={{
                        background: 'transparent',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)'
                    }}
                >
                    Create Another
                </button>
            </div>

            {/* Preview Images */}
            {jobStatus.preview_images && jobStatus.preview_images.length > 0 && (
                <div style={{ marginTop: '2rem' }}>
                    <h4 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                        Generated Images
                    </h4>
                    <div className="preview-grid">
                        {jobStatus.preview_images.map((img, idx) => (
                            <div key={idx} className="preview-item">
                                <img src={img} alt={`Generated ${idx + 1}`} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default CatalogPreview
