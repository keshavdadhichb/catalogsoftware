import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import LandingPage from './LandingPage'
import PasswordProtect from './PasswordProtect'
import ProPasswordProtect from './ProPasswordProtect'
import ProWizard from './ProWizard'
import BatchDashboard from './BatchDashboard'
import CustomPreviewApp from './custom-preview/CustomPreviewApp'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/app" element={
                    <PasswordProtect>
                        <App />
                    </PasswordProtect>
                } />
                <Route path="/pro" element={
                    <ProPasswordProtect>
                        <ProWizard />
                    </ProPasswordProtect>
                } />
                <Route path="/pro/dashboard" element={
                    <ProPasswordProtect>
                        <BatchDashboard />
                    </ProPasswordProtect>
                } />
                <Route path="/custom-preview" element={<CustomPreviewApp />} />
            </Routes>
        </BrowserRouter>
    </React.StrictMode>,
)
