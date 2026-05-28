import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function VideoPreview({ videoUrl, onDownload, onClose }) {
    const [isLoading, setIsLoading] = useState(true);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="video-preview-overlay"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                backdropFilter: 'blur(8px)'
            }}
        >
            <div className="video-container" style={{
                position: 'relative',
                width: '100%',
                maxWidth: '450px',
                aspectRatio: '3/4',
                backgroundColor: '#1a1a1a',
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
                {isLoading && (
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        background: 'linear-gradient(45deg, #1a1a1a, #2a2a2a)'
                    }}>
                        <div className="spinner" style={{ marginBottom: '1rem', borderTopColor: 'var(--gold)' }}></div>
                        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', opacity: 0.8 }}>
                            Optimizing playback...
                        </p>
                    </div>
                )}

                <video
                    src={videoUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    onLoadedData={() => setIsLoading(false)}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: isLoading ? 'none' : 'block'
                    }}
                />

                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'rgba(255, 255, 255, 0.2)',
                        border: 'none',
                        color: 'white',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backdropFilter: 'blur(4px)'
                    }}
                >
                    ×
                </button>
            </div>

            <div className="video-actions" style={{
                marginTop: '2rem',
                display: 'flex',
                gap: '1rem'
            }}>
                <button
                    className="btn btn-primary"
                    onClick={onDownload}
                    style={{
                        padding: '1rem 2rem',
                        background: 'var(--gold)',
                        color: 'white',
                        fontWeight: 600,
                        borderRadius: '12px'
                    }}
                >
                    Download Catchy Clip
                </button>
                <button
                    className="btn"
                    onClick={onClose}
                    style={{
                        padding: '1rem 2rem',
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                >
                    Close
                </button>
            </div>

            <p style={{
                marginTop: '1.5rem',
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: '0.8rem',
                fontFamily: 'var(--font-body)',
                textAlign: 'center'
            }}>
                Generated with Veo 3.1 • 4K Fashion AI
            </p>
        </motion.div>
    );
}
