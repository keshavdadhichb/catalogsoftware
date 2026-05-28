import React, { useState } from 'react'

export default function ClientSelector({
    clients,
    selectedClient,
    onSelectClient,
    onSaveClients,
    onNext,
    canProceed
}) {
    const [isCreating, setIsCreating] = useState(false)
    const [newClientName, setNewClientName] = useState('')
    const [newClientLogo, setNewClientLogo] = useState(null)

    const handleCreateClient = () => {
        if (!newClientName.trim()) return

        const newClient = {
            id: Date.now().toString(),
            name: newClientName.trim(),
            logo: newClientLogo,
            createdAt: new Date().toISOString()
        }

        const updatedClients = [...clients, newClient]
        onSaveClients(updatedClients)
        onSelectClient(newClient)
        setIsCreating(false)
        setNewClientName('')
        setNewClientLogo(null)
    }

    const handleLogoUpload = (e) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (event) => {
                setNewClientLogo(event.target.result)
            }
            reader.readAsDataURL(file)
        }
    }

    return (
        <div className="wizard-step">
            <div className="step-header">
                <h2>👤 Select Client</h2>
                <p>Choose an existing client or create a new one</p>
            </div>

            {!isCreating ? (
                <>
                    {/* Existing Clients */}
                    {clients.length > 0 && (
                        <div className="clients-list">
                            <label className="form-label">Existing Clients</label>
                            <div className="selection-grid">
                                {clients.map(client => (
                                    <div
                                        key={client.id}
                                        className={`selection-card ${selectedClient?.id === client.id ? 'selected' : ''}`}
                                        onClick={() => onSelectClient(client)}
                                    >
                                        {client.logo ? (
                                            <img
                                                src={client.logo}
                                                alt={client.name}
                                                className="client-logo"
                                                style={{ width: 48, height: 48, objectFit: 'contain', marginBottom: 8 }}
                                            />
                                        ) : (
                                            <div className="card-icon">🏢</div>
                                        )}
                                        <div className="card-title">{client.name}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Create New Button */}
                    <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                        <button
                            className="btn-next"
                            onClick={() => setIsCreating(true)}
                            style={{ background: 'rgba(255,255,255,0.1)' }}
                        >
                            + Create New Client
                        </button>
                    </div>
                </>
            ) : (
                /* Create New Client Form */
                <div className="create-client-form">
                    <div className="form-group">
                        <label>Brand Name *</label>
                        <input
                            type="text"
                            className="form-input"
                            value={newClientName}
                            onChange={(e) => setNewClientName(e.target.value)}
                            placeholder="e.g., Urban Threads Co."
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label>Brand Logo (Optional)</label>
                        <div
                            className="upload-area"
                            style={{ padding: '1.5rem' }}
                            onClick={() => document.getElementById('logo-input').click()}
                        >
                            {newClientLogo ? (
                                <img
                                    src={newClientLogo}
                                    alt="Logo preview"
                                    style={{ maxHeight: 80, maxWidth: 200, objectFit: 'contain' }}
                                />
                            ) : (
                                <>
                                    <div className="upload-icon">🖼️</div>
                                    <div className="upload-text">Click to upload logo</div>
                                </>
                            )}
                        </div>
                        <input
                            id="logo-input"
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleLogoUpload}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                        <button
                            className="btn-prev"
                            onClick={() => {
                                setIsCreating(false)
                                setNewClientName('')
                                setNewClientLogo(null)
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            className="btn-next"
                            onClick={handleCreateClient}
                            disabled={!newClientName.trim()}
                            style={{ flex: 1 }}
                        >
                            Create Client
                        </button>
                    </div>
                </div>
            )}

            {/* Navigation */}
            {!isCreating && (
                <div className="step-navigation">
                    <div></div>
                    <button
                        className="btn-next"
                        onClick={onNext}
                        disabled={!canProceed}
                    >
                        Continue →
                    </button>
                </div>
            )}
        </div>
    )
}
