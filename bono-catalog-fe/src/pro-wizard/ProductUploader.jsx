import React, { useRef, useState } from 'react'

export default function ProductUploader({
    products,
    setProducts,
    onNext,
    onPrev,
    canProceed
}) {
    const frontInputRef = useRef(null)
    const backInputRef = useRef(null)
    const [selectedProductForBack, setSelectedProductForBack] = useState(null)

    const readFileAsDataURL = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader()
            reader.onload = (e) => resolve(e.target.result)
            reader.readAsDataURL(file)
        })
    }

    // Add new products from front images
    const handleFrontFiles = async (files) => {
        const fileArray = Array.from(files)
        const newProducts = []

        for (const file of fileArray) {
            const frontData = await readFileAsDataURL(file)
            newProducts.push({
                id: Date.now().toString() + Math.random(),
                name: file.name.replace(/\.[^/.]+$/, ''),
                frontImage: frontData,
                backImage: null,
                pageTypes: ['front_only'],
                frontPose: 'catalog_standard',
                backPose: 'catalog_standard',
                keywords: '',
                price: '',
                logoOption: 'none'
            })
        }

        setProducts([...products, ...newProducts])
    }

    // Add back image to a specific product
    const handleBackFile = async (productId, file) => {
        const backData = await readFileAsDataURL(file)
        setProducts(products.map(p =>
            p.id === productId
                ? {
                    ...p,
                    backImage: backData,
                    // Auto-upgrade to front+back collage if only front_only was selected
                    pageTypes: p.pageTypes.includes('front_only') && !p.pageTypes.includes('front_back_collage')
                        ? [...p.pageTypes, 'front_back_collage'].filter(t => t !== 'front_only')
                        : p.pageTypes
                }
                : p
        ))
        setSelectedProductForBack(null)
    }

    const removeProduct = (productId) => {
        setProducts(products.filter(p => p.id !== productId))
    }

    const removeBackImage = (productId) => {
        setProducts(products.map(p =>
            p.id === productId ? { ...p, backImage: null } : p
        ))
    }

    return (
        <div className="wizard-step">
            <div className="step-header">
                <h2>📤 Upload Products</h2>
                <p>Upload front images, then add back images for each product</p>
            </div>

            {/* Simple Upload Instructions */}
            <div style={{
                background: 'rgba(243, 156, 18, 0.1)',
                border: '1px solid rgba(243, 156, 18, 0.3)',
                borderRadius: '12px',
                padding: '1rem',
                marginBottom: '1.5rem'
            }}>
                <div style={{ fontWeight: 600, color: '#f39c12', marginBottom: '0.5rem' }}>
                    📌 How to upload:
                </div>
                <ol style={{ margin: 0, paddingLeft: '1.25rem', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                    <li>Click "Add Front Images" to upload your product photos</li>
                    <li>For each product, click the "Add Back" button to add its back view</li>
                    <li>Back images are optional - you can skip if not needed</li>
                </ol>
            </div>

            {/* Upload Buttons */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <button
                    onClick={() => frontInputRef.current?.click()}
                    style={{
                        flex: 1,
                        padding: '1.5rem',
                        background: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)',
                        border: 'none',
                        borderRadius: '12px',
                        color: 'white',
                        fontSize: '1rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <span style={{ fontSize: '2rem' }}>👕</span>
                    <span>Add Front Images</span>
                    <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Click to select files</span>
                </button>
            </div>

            <input
                ref={frontInputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={(e) => e.target.files && handleFrontFiles(e.target.files)}
            />
            <input
                ref={backInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                    if (e.target.files?.[0] && selectedProductForBack) {
                        handleBackFile(selectedProductForBack, e.target.files[0])
                    }
                }}
            />

            {/* Products Grid */}
            {products.length > 0 && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <label style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                            📦 {products.length} Product{products.length > 1 ? 's' : ''} Uploaded
                        </label>
                        <button
                            onClick={() => setProducts([])}
                            style={{
                                background: 'rgba(231,76,60,0.2)',
                                border: '1px solid rgba(231,76,60,0.5)',
                                color: '#e74c3c',
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '0.85rem'
                            }}
                        >
                            Clear All
                        </button>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '1rem'
                    }}>
                        {products.map((product, index) => (
                            <div
                                key={product.id}
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px',
                                    overflow: 'hidden'
                                }}
                            >
                                {/* Product Header */}
                                <div style={{
                                    background: 'rgba(0,0,0,0.3)',
                                    padding: '0.75rem 1rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <span style={{ color: 'white', fontWeight: 600 }}>
                                        Product #{index + 1}
                                    </span>
                                    <button
                                        onClick={() => removeProduct(product.id)}
                                        style={{
                                            background: 'rgba(231,76,60,0.2)',
                                            border: 'none',
                                            color: '#e74c3c',
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '0.75rem'
                                        }}
                                    >
                                        ✕ Remove
                                    </button>
                                </div>

                                {/* Image Grid */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '0.5rem',
                                    padding: '1rem'
                                }}>
                                    {/* Front Image */}
                                    <div>
                                        <div style={{
                                            fontSize: '0.7rem',
                                            color: 'rgba(255,255,255,0.5)',
                                            marginBottom: '0.25rem',
                                            textAlign: 'center'
                                        }}>
                                            FRONT
                                        </div>
                                        <div style={{
                                            aspectRatio: '3/4',
                                            borderRadius: '8px',
                                            overflow: 'hidden',
                                            border: '2px solid #2ecc71'
                                        }}>
                                            <img
                                                src={product.frontImage}
                                                alt="Front"
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover'
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Back Image */}
                                    <div>
                                        <div style={{
                                            fontSize: '0.7rem',
                                            color: 'rgba(255,255,255,0.5)',
                                            marginBottom: '0.25rem',
                                            textAlign: 'center'
                                        }}>
                                            BACK
                                        </div>
                                        {product.backImage ? (
                                            <div style={{
                                                aspectRatio: '3/4',
                                                borderRadius: '8px',
                                                overflow: 'hidden',
                                                border: '2px solid #3498db',
                                                position: 'relative'
                                            }}>
                                                <img
                                                    src={product.backImage}
                                                    alt="Back"
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover'
                                                    }}
                                                />
                                                <button
                                                    onClick={() => removeBackImage(product.id)}
                                                    style={{
                                                        position: 'absolute',
                                                        top: '4px',
                                                        right: '4px',
                                                        background: 'rgba(231,76,60,0.9)',
                                                        border: 'none',
                                                        color: 'white',
                                                        width: '20px',
                                                        height: '20px',
                                                        borderRadius: '50%',
                                                        cursor: 'pointer',
                                                        fontSize: '0.7rem',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    setSelectedProductForBack(product.id)
                                                    backInputRef.current?.click()
                                                }}
                                                style={{
                                                    aspectRatio: '3/4',
                                                    width: '100%',
                                                    background: 'rgba(255,255,255,0.05)',
                                                    border: '2px dashed rgba(255,255,255,0.2)',
                                                    borderRadius: '8px',
                                                    color: 'rgba(255,255,255,0.6)',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '0.5rem',
                                                    fontSize: '0.85rem'
                                                }}
                                            >
                                                <span style={{ fontSize: '1.5rem' }}>➕</span>
                                                <span>Add Back</span>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Status */}
                                <div style={{
                                    padding: '0.5rem 1rem',
                                    borderTop: '1px solid rgba(255,255,255,0.05)',
                                    display: 'flex',
                                    gap: '0.5rem',
                                    justifyContent: 'center'
                                }}>
                                    {product.backImage ? (
                                        <span style={{
                                            background: 'rgba(46, 204, 113, 0.2)',
                                            color: '#2ecc71',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '20px',
                                            fontSize: '0.75rem'
                                        }}>
                                            ✓ Front + Back
                                        </span>
                                    ) : (
                                        <span style={{
                                            background: 'rgba(243, 156, 18, 0.2)',
                                            color: '#f39c12',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '20px',
                                            fontSize: '0.75rem'
                                        }}>
                                            Front Only
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {products.length === 0 && (
                <div style={{
                    textAlign: 'center',
                    padding: '3rem',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '12px',
                    border: '1px dashed rgba(255,255,255,0.1)'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👕</div>
                    <div style={{ color: 'rgba(255,255,255,0.6)' }}>
                        No products yet. Click "Add Front Images" to start.
                    </div>
                </div>
            )}

            <div className="step-navigation">
                <button className="btn-prev" onClick={onPrev}>
                    ← Back
                </button>
                <button
                    className="btn-next"
                    onClick={onNext}
                    disabled={!canProceed}
                >
                    Continue ({products.length} product{products.length !== 1 ? 's' : ''}) →
                </button>
            </div>
        </div>
    )
}
