import React, { useState, useEffect } from 'react'
import './BatchDashboard.css'

export default function BatchDashboard() {
    const [jobs, setJobs] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

    const fetchJobs = async () => {
        try {
            const response = await fetch(`${API_URL}/api/pro/jobs?limit=10`)
            if (response.ok) {
                const data = await response.json()
                setJobs(data.jobs || [])
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchJobs()
        // Poll every 30 seconds
        const interval = setInterval(fetchJobs, 30000)
        return () => clearInterval(interval)
    }, [])

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return '#2ecc71'
            case 'processing': return '#f39c12'
            case 'pending': return '#3498db'
            case 'failed': return '#e74c3c'
            default: return '#888'
        }
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return '✅'
            case 'processing': return '⏳'
            case 'pending': return '🕐'
            case 'failed': return '❌'
            default: return '❓'
        }
    }

    return (
        <div className="batch-dashboard">
            <header className="dashboard-header">
                <div className="header-left">
                    <a href="/pro" className="back-link">← Back to Studio</a>
                </div>
                <div className="header-center">
                    <span className="badge">PRO</span>
                    <h1>Batch Dashboard</h1>
                </div>
                <div className="header-right">
                    <button onClick={fetchJobs} className="btn-refresh">
                        🔄 Refresh
                    </button>
                </div>
            </header>

            <main className="dashboard-content">
                {loading && (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading jobs...</p>
                    </div>
                )}

                {error && (
                    <div className="error-state">
                        <p>❌ {error}</p>
                        <button onClick={fetchJobs}>Retry</button>
                    </div>
                )}

                {!loading && !error && jobs.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-icon">📦</div>
                        <h2>No batch jobs yet</h2>
                        <p>Submit a catalog from the Pro Studio to see it here.</p>
                        <a href="/pro" className="btn-primary">Go to Studio</a>
                    </div>
                )}

                {!loading && jobs.length > 0 && (
                    <div className="jobs-list">
                        {jobs.map(job => (
                            <div key={job.job_id} className="job-card">
                                <div className="job-header">
                                    <div className="job-status" style={{ color: getStatusColor(job.status) }}>
                                        <span className="status-icon">{getStatusIcon(job.status)}</span>
                                        <span className="status-text">{job.status}</span>
                                    </div>
                                    <div className="job-id">#{job.job_id}</div>
                                </div>

                                <div className="job-body">
                                    <h3 className="job-title">{job.catalog_name}</h3>
                                    <p className="job-client">{job.client_name}</p>

                                    <div className="job-meta">
                                        <span>📄 {job.total_pages} pages</span>
                                        <span>🎨 {job.theme}</span>
                                        <span>📐 {job.quality}</span>
                                    </div>

                                    {job.status === 'processing' && (
                                        <div className="progress-bar">
                                            <div
                                                className="progress-fill"
                                                style={{
                                                    width: `${(job.completed_pages / job.total_pages) * 100}%`
                                                }}
                                            ></div>
                                            <span className="progress-text">
                                                {job.completed_pages} / {job.total_pages}
                                            </span>
                                        </div>
                                    )}

                                    {job.status === 'failed' && job.error && (
                                        <div className="job-error">
                                            {job.error}
                                        </div>
                                    )}
                                </div>

                                <div className="job-footer">
                                    <span className="job-time">
                                        {new Date(job.created_at).toLocaleString()}
                                    </span>

                                    {job.status === 'completed' && job.download_link && (
                                        <a
                                            href={job.download_link}
                                            className="btn-download"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            📥 Download
                                        </a>
                                    )}

                                    {job.status === 'failed' && (
                                        <button className="btn-retry">
                                            🔄 Retry
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
