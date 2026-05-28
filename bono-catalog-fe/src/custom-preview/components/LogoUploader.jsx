import React, { useRef } from 'react'

export default function LogoUploader({
    logo,
    onLogoUpload,
    onLogoRemove,
    logoScale,
    onLogoScaleChange
}) {
    const fileInputRef = useRef(null)

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file && file.type.startsWith('image/')) {
            onLogoUpload(file)
        }
    }

    const handleDrop = (e) => {
        e.preventDefault()
        const file = e.dataTransfer.files[0]
        if (file && file.type.startsWith('image/')) {
            onLogoUpload(file)
        }
    }

    const handleDragOver = (e) => {
        e.preventDefault()
    }

    return (
        <div className="control-group">
            <label>Upload Logo</label>
            <div className="logo-uploader">
                <div
                    className={`logo-upload-area ${logo ? 'has-logo' : ''}`}
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                >
                    {logo ? (
                        <img src={logo} alt="Uploaded logo" />
                    ) : (
                        <span>Click or drag to upload logo</span>
                    )}
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                />
                {logo && (
                    <div className="logo-controls">
                        <span style={{ fontSize: '0.8rem', color: '#86868b' }}>Size:</span>
                        <input
                            type="range"
                            min={0.5}
                            max={2}
                            step={0.1}
                            value={logoScale}
                            onChange={(e) => onLogoScaleChange(Number(e.target.value))}
                        />
                        <button onClick={onLogoRemove}>Remove</button>
                    </div>
                )}
            </div>
        </div>
    )
}
