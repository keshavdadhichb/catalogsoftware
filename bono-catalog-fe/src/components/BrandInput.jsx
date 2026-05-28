import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

function BrandInput({ brandName, onBrandNameChange, logo, onLogoChange }) {
    const onDrop = useCallback((acceptedFiles) => {
        const file = acceptedFiles[0]
        if (file) {
            onLogoChange(file)
        }
    }, [onLogoChange])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.svg', '.jpg', '.jpeg']
        },
        maxFiles: 1
    })

    const logoPreview = logo ? URL.createObjectURL(logo) : null

    return (
        <div>
            <div className="form-group">
                <label>Brand Name *</label>
                <input
                    type="text"
                    value={brandName}
                    onChange={(e) => onBrandNameChange(e.target.value)}
                    placeholder="Enter your brand name"
                />
            </div>

            <div className="form-group">
                <label>Brand Logo (Optional)</label>
                <div
                    {...getRootProps()}
                    className={`dropzone ${isDragActive ? 'active' : ''}`}
                    style={{
                        padding: '1.5rem',
                        marginTop: '0.5rem'
                    }}
                >
                    <input {...getInputProps()} />
                    {logoPreview ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <img
                                src={logoPreview}
                                alt="Logo"
                                style={{
                                    maxHeight: '60px',
                                    maxWidth: '150px',
                                    borderRadius: '8px',
                                    background: 'white',
                                    padding: '8px'
                                }}
                            />
                            <div>
                                <p style={{ margin: 0, color: 'var(--text-primary)' }}>{logo.name}</p>
                                <span style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
                                    Click to replace
                                </span>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="dropzone-icon">🖼️</div>
                            <p>Drop logo here (PNG/SVG preferred)</p>
                            <span>Transparent background recommended</span>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default BrandInput
