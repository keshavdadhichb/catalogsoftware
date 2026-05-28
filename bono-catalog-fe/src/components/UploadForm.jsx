import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'

// Optimize image: resize if too large, compress to JPEG
async function optimizeImage(file, maxWidth = 2048, quality = 0.85) {
    return new Promise((resolve) => {
        // If file is small enough, return as-is
        if (file.size < 500 * 1024) { // Less than 500KB
            resolve(file)
            return
        }

        const img = new Image()
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        img.onload = () => {
            let { width, height } = img

            // Only resize if larger than maxWidth
            if (width > maxWidth) {
                height = (height * maxWidth) / width
                width = maxWidth
            }

            canvas.width = width
            canvas.height = height
            ctx.drawImage(img, 0, 0, width, height)

            canvas.toBlob(
                (blob) => {
                    const optimizedFile = new File([blob], file.name, {
                        type: 'image/jpeg',
                        lastModified: Date.now()
                    })
                    console.log(`Optimized: ${(file.size / 1024).toFixed(0)}KB → ${(optimizedFile.size / 1024).toFixed(0)}KB`)
                    resolve(optimizedFile)
                },
                'image/jpeg',
                quality
            )
        }

        img.src = URL.createObjectURL(file)
    })
}

function UploadForm({ products, onAddProduct, onRemoveProduct, singleImage = false }) {
    const [isOptimizing, setIsOptimizing] = useState(false)

    const onDropFront = useCallback(async (acceptedFiles) => {
        if (!acceptedFiles[0]) return
        setIsOptimizing(true)
        try {
            const optimized = await optimizeImage(acceptedFiles[0])
            if (singleImage) {
                onAddProduct(optimized, null)
            } else {
                window.tempFrontImage = optimized
            }
        } finally {
            setIsOptimizing(false)
        }
    }, [singleImage, onAddProduct])

    const onDropBack = useCallback(async (acceptedFiles) => {
        if (!window.tempFrontImage || !acceptedFiles[0]) return
        setIsOptimizing(true)
        try {
            const optimized = await optimizeImage(acceptedFiles[0])
            onAddProduct(window.tempFrontImage, optimized)
            window.tempFrontImage = null
        } finally {
            setIsOptimizing(false)
        }
    }, [onAddProduct])

    const { getRootProps: getFrontProps, getInputProps: getFrontInputProps, isDragActive: isFrontDrag } = useDropzone({
        onDrop: onDropFront,
        accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.heic'] },
        maxFiles: 1
    })

    const { getRootProps: getBackProps, getInputProps: getBackInputProps, isDragActive: isBackDrag } = useDropzone({
        onDrop: onDropBack,
        accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.heic'] },
        maxFiles: 1
    })

    return (
        <div>
            {isOptimizing && (
                <div style={{
                    textAlign: 'center',
                    padding: '0.5rem',
                    background: 'var(--bg-tertiary)',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    color: 'var(--text-muted)'
                }}>
                    ⚡ Optimizing image...
                </div>
            )}

            {singleImage ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div
                        {...getFrontProps()}
                        className={`dropzone ${isFrontDrag ? 'active' : ''}`}
                        style={{ padding: '2rem 1rem' }}
                    >
                        <input {...getFrontInputProps()} />
                        <div className="dropzone-icon">📸</div>
                        <p>Upload Flat Lay / Product Image</p>
                        <span>Drop or click to select front flat lay</span>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div
                        {...getFrontProps()}
                        className={`dropzone ${isFrontDrag ? 'active' : ''} ${window.tempFrontImage ? 'ready' : ''}`}
                    >
                        <input {...getFrontInputProps()} />
                        <div className="dropzone-icon">{window.tempFrontImage ? '✓' : '1'}</div>
                        <p>Front View</p>
                        <span>{window.tempFrontImage ? 'Ready! Now add back' : 'Drop or click'}</span>
                    </div>

                    <div
                        {...getBackProps()}
                        className={`dropzone ${isBackDrag ? 'active' : ''}`}
                    >
                        <input {...getBackInputProps()} />
                        <div className="dropzone-icon">2</div>
                        <p>Back View</p>
                        <span>Drop or click</span>
                    </div>
                </div>
            )}

            {products.length > 0 && (
                <div className="product-grid">
                    {products.map(product => (
                        <div key={product.id} className="product-card">
                            <img src={product.frontPreview} alt="Front" />
                            <button
                                className="remove-btn"
                                onClick={() => onRemoveProduct(product.id)}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default UploadForm
