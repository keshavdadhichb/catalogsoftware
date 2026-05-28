import { useEffect, useState } from 'react'

function GenerationProgress({ jobId, onStatusUpdate }) {
    const [status, setStatus] = useState(null)

    useEffect(() => {
        if (!jobId) return

        const pollStatus = async () => {
            try {
                const response = await fetch(`/api/status/${jobId}`)
                const data = await response.json()
                setStatus(data)
                onStatusUpdate(data)

                // Keep polling if not complete
                if (data.status !== 'completed' && data.status !== 'failed') {
                    setTimeout(pollStatus, 2000)
                }
            } catch (error) {
                console.error('Error polling status:', error)
                setTimeout(pollStatus, 3000)
            }
        }

        pollStatus()
    }, [jobId, onStatusUpdate])

    if (!status) {
        return (
            <div className="progress-section">
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <div className="spinner" style={{ margin: '0 auto' }}></div>
                    <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
                        Starting generation...
                    </p>
                </div>
            </div>
        )
    }

    const statusMessages = {
        pending: 'Job queued...',
        processing: 'Preprocessing images...',
        generating_models: 'Generating model images with AI...',
        generating_catalog: 'Creating catalog pages...',
        creating_pdf: 'Assembling PDF...',
        completed: 'Complete!',
        failed: 'Failed'
    }

    return (
        <div className="progress-section">
            <div className="progress-header">
                <h3>Generation Progress</h3>
                <span style={{
                    color: status.status === 'completed' ? 'var(--success)' : 'var(--text-secondary)'
                }}>
                    {status.progress}%
                </span>
            </div>

            <div className="progress-bar">
                <div
                    className="progress-fill"
                    style={{ width: `${status.progress}%` }}
                />
            </div>

            <p className="progress-status">
                {status.status === 'completed' ? (
                    <span style={{ color: 'var(--success)' }}>✓ {statusMessages[status.status]}</span>
                ) : status.status === 'failed' ? (
                    <span style={{ color: 'var(--error)' }}>✕ {status.message}</span>
                ) : (
                    <>
                        <span className="loading">{statusMessages[status.status] || status.message}</span>
                    </>
                )}
            </p>

            {/* Preview generated images as they come in */}
            {status.preview_images && status.preview_images.length > 0 && (
                <div className="preview-grid">
                    {status.preview_images.map((img, idx) => (
                        <div key={idx} className="preview-item">
                            <img src={img} alt={`Generated ${idx + 1}`} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default GenerationProgress
