import React, { useState } from 'react'

export default function PasswordProtection({ onSuccess }) {
    const [password, setPassword] = useState('')
    const [error, setError] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = (e) => {
        e.preventDefault()
        setIsLoading(true)
        setError(false)

        // Simulate a tiny network latency for premium feel
        setTimeout(() => {
            const correctPassword = import.meta.env.VITE_APP_PASSWORD || 'bono2026'
            if (password === correctPassword) {
                localStorage.setItem('bono_app_auth', 'true')
                onSuccess()
            } else {
                setError(true)
                setIsLoading(false)
            }
        }, 600)
    }

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            width: '100vw',
            background: 'radial-gradient(circle at center, #1a1a2e 0%, #0d0d13 100%)',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            color: '#ffffff',
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 99999,
            overflow: 'hidden'
        }}>
            {/* Animated Aura Background */}
            <div style={{
                position: 'absolute',
                width: '600px',
                height: '600px',
                background: 'radial-gradient(circle, rgba(212,175,55,0.08) 0%, rgba(0,0,0,0) 70%)',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
                zIndex: 1
            }} />

            <div className="glass-card" style={{
                position: 'relative',
                zIndex: 2,
                width: '100%',
                maxWidth: '420px',
                padding: '3rem 2.5rem',
                borderRadius: '24px',
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
                textAlign: 'center',
                boxSizing: 'border-box',
                animation: 'fadeIn 0.6s ease-out'
            }}>
                {/* Logo / Header */}
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '64px',
                    height: '64px',
                    borderRadius: '18px',
                    background: 'linear-gradient(135deg, #d4af37 0%, #aa7c11 100%)',
                    fontSize: '1.75rem',
                    fontWeight: 'bold',
                    color: '#ffffff',
                    marginBottom: '1.5rem',
                    boxShadow: '0 8px 20px rgba(212, 175, 55, 0.25)'
                }}>
                    B
                </div>

                <h1 style={{
                    fontSize: '2rem',
                    fontWeight: 700,
                    margin: '0 0 0.5rem 0',
                    letterSpacing: '-0.025em',
                    background: 'linear-gradient(to right, #ffffff, #a3a3a3)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    Bono Catalog
                </h1>
                <p style={{
                    fontSize: '0.95rem',
                    color: '#8e8e93',
                    margin: '0 0 2.5rem 0',
                    lineHeight: '1.5'
                }}>
                    AI-powered virtual try-on & catalog designer. Enter access code to unlock.
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="password"
                            placeholder="Access Code"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value)
                                if (error) setError(false)
                            }}
                            disabled={isLoading}
                            style={{
                                width: '100%',
                                padding: '1rem 1.25rem',
                                borderRadius: '12px',
                                border: error ? '1.5px solid #ff453a' : '1px solid rgba(255, 255, 255, 0.15)',
                                background: 'rgba(0, 0, 0, 0.2)',
                                color: '#ffffff',
                                fontSize: '1rem',
                                outline: 'none',
                                transition: 'all 0.25s ease',
                                textAlign: 'center',
                                letterSpacing: password ? '0.25em' : 'normal',
                                boxSizing: 'border-box'
                            }}
                            autoFocus
                        />
                    </div>

                    {error && (
                        <div style={{
                            color: '#ff453a',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            animation: 'shake 0.3s ease-in-out',
                            marginTop: '-0.25rem'
                        }}>
                            Incorrect access code. Please try again.
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading || !password}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            borderRadius: '12px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)',
                            color: '#ffffff',
                            fontSize: '1rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            opacity: (!password || isLoading) ? 0.6 : 1,
                            boxShadow: '0 4px 15px rgba(212, 175, 55, 0.2)'
                        }}
                    >
                        {isLoading ? 'Unlocking...' : 'Unlock Catalog'}
                    </button>
                </form>
            </div>

            {/* Dynamic CSS Styles */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-6px); }
                    75% { transform: translateX(6px); }
                }
                .glass-card:hover {
                    border-color: rgba(255, 255, 255, 0.12) !important;
                }
                input:focus {
                    border-color: #d4af37 !important;
                    box-shadow: 0 0 10px rgba(212, 175, 55, 0.15);
                    background: rgba(0, 0, 0, 0.3) !important;
                }
            `}</style>
        </div>
    )
}
