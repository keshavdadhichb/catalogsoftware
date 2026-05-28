import { useState } from 'react'
import './PasswordProtect.css'

const PasswordProtect = ({ children }) => {
    const [password, setPassword] = useState('')
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [error, setError] = useState('')

    // Check sessionStorage for existing auth
    const checkAuth = () => {
        return sessionStorage.getItem('app_authenticated') === 'true'
    }

    if (checkAuth()) {
        return children
    }

    if (isAuthenticated) {
        return children
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        // Get password from environment variable
        const correctPassword = import.meta.env.VITE_APP_PASSWORD

        if (!correctPassword) {
            setError('Password not configured. Please contact admin.')
            return
        }

        if (password === correctPassword) {
            setIsAuthenticated(true)
            sessionStorage.setItem('app_authenticated', 'true')
            setError('')
        } else {
            setError('Incorrect password. Please try again.')
            setPassword('')
        }
    }

    return (
        <div className="password-protect">
            <div className="password-container">
                <div className="password-logo">
                    <img src="/assets/logo.png" alt="SnapCatalog" />
                    <h1>SnapCatalog</h1>
                </div>

                <h2>Access Required</h2>
                <p>This application is password protected.</p>

                <form onSubmit={handleSubmit}>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        autoFocus
                    />
                    <button type="submit">Access App</button>
                </form>

                {error && <p className="error-message">{error}</p>}
            </div>
        </div>
    )
}

export default PasswordProtect
