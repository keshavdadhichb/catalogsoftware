import { useState } from 'react'
import './ProPasswordProtect.css'

const ProPasswordProtect = ({ children }) => {
    const [password, setPassword] = useState('')
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [error, setError] = useState('')

    // Check sessionStorage for existing auth (separate from main app)
    const checkAuth = () => {
        return sessionStorage.getItem('pro_authenticated') === 'true'
    }

    if (checkAuth()) {
        return children
    }

    if (isAuthenticated) {
        return children
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        // Pro password - k@789
        const correctPassword = 'k@789'

        if (password === correctPassword) {
            setIsAuthenticated(true)
            sessionStorage.setItem('pro_authenticated', 'true')
            setError('')
        } else {
            setError('Incorrect password. Access denied.')
            setPassword('')
        }
    }

    return (
        <div className="pro-password-protect">
            <div className="pro-password-container">
                <div className="pro-logo">
                    <span className="pro-badge">PRO</span>
                    <h1>SnapCatalog Studio</h1>
                </div>

                <h2>B2B Access Required</h2>
                <p>This is the professional catalog generation studio.</p>

                <form onSubmit={handleSubmit}>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter studio password"
                        autoFocus
                    />
                    <button type="submit">Access Studio</button>
                </form>

                {error && <p className="error-message">{error}</p>}
            </div>
        </div>
    )
}

export default ProPasswordProtect
