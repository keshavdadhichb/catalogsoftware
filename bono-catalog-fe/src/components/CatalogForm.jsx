import React, { useState, useRef, useEffect } from 'react'
import ThemePreview, { THEMES } from './ThemePreview'

// Available layouts for catalog pages
const CATALOG_LAYOUTS = {
    smart_auto: { name: "✨ Smart Auto", icon: "🤖" },
    collage: { name: "Collage (Front + Back)", icon: "🍱" },
    single_front: { name: "Single - Front View", icon: "👤" },
    single_back: { name: "Single - Back View", icon: "🔙" },
    editorial_print: { name: "Editorial Print (No Model)", icon: "🎨" },
    fabric_detail: { name: "Fabric / Detail Shot", icon: "🔍" },
    hero_bottom: { name: "Hero Bottom", icon: "⬇️" },
    magazine_cover: { name: "Magazine Cover", icon: "📰" },
    split_vertical: { name: "Split Vertical", icon: "✂️" }
}

export default function CatalogForm({
    category, setCategory,
    collectionName, setCollectionName,
    collectionNumber, setCollectionNumber,
    theme, setTheme,
    skinTone, setSkinTone,
    bodyType, setBodyType,
    // Text fields
    textFields, setTextFields,
    // Images
    products, setProducts,
    logo, setLogo,
    onAddProduct, onRemoveProduct,
    onUpdateProduct
}) {

    const handleTextChange = (field, value) => {
        setTextFields(prev => ({ ...prev, [field]: value }))
    }

    const handleProductSettingChange = (productId, setting, value) => {
        const product = products.find(p => p.id === productId)
        if (!product) return

        onUpdateProduct(productId, {
            [setting]: value
        })
    }

    const handleViewToggle = (productId, view) => {
        const product = products.find(p => p.id === productId)
        if (!product) return

        const currentViews = product.views || { front: true, back: true, detail: false }
        onUpdateProduct(productId, {
            views: { ...currentViews, [view]: !currentViews[view] }
        })
    }

    const [frontFile, setFrontFile] = useState(null)
    const [backFile, setBackFile] = useState(null)
    const [frontPreview, setFrontPreview] = useState(null)
    const [backPreview, setBackPreview] = useState(null)
    const [dragOverFront, setDragOverFront] = useState(false)
    const [dragOverBack, setDragOverBack] = useState(false)
    const frontDropRef = useRef(null)
    const backDropRef = useRef(null)

    // Generate previews when files change
    useEffect(() => {
        if (frontFile) {
            const url = URL.createObjectURL(frontFile)
            setFrontPreview(url)
            return () => URL.revokeObjectURL(url)
        } else {
            setFrontPreview(null)
        }
    }, [frontFile])

    useEffect(() => {
        if (backFile) {
            const url = URL.createObjectURL(backFile)
            setBackPreview(url)
            return () => URL.revokeObjectURL(url)
        } else {
            setBackPreview(null)
        }
    }, [backFile])

    // Handle drag and drop for front image
    const handleDragOver = (e, type) => {
        e.preventDefault()
        e.stopPropagation()
        if (type === 'front') setDragOverFront(true)
        else setDragOverBack(true)
    }

    const handleDragLeave = (e, type) => {
        e.preventDefault()
        e.stopPropagation()
        if (type === 'front') setDragOverFront(false)
        else setDragOverBack(false)
    }

    const handleDrop = (e, type) => {
        e.preventDefault()
        e.stopPropagation()
        if (type === 'front') setDragOverFront(false)
        else setDragOverBack(false)

        const files = e.dataTransfer.files
        if (files && files.length > 0) {
            const file = files[0]
            if (file.type.startsWith('image/')) {
                if (type === 'front') setFrontFile(file)
                else setBackFile(file)
            }
        }
    }

    // Handle paste (Cmd+V / Ctrl+V)
    useEffect(() => {
        const handlePaste = (e) => {
            const items = e.clipboardData?.items
            if (!items) return

            for (let item of items) {
                if (item.type.startsWith('image/')) {
                    const file = item.getAsFile()
                    if (file) {
                        // Paste to front if empty, otherwise back
                        if (!frontFile) {
                            setFrontFile(file)
                        } else if (!backFile) {
                            setBackFile(file)
                        }
                    }
                    break
                }
            }
        }

        document.addEventListener('paste', handlePaste)
        return () => document.removeEventListener('paste', handlePaste)
    }, [frontFile, backFile])

    const handleAddPiece = () => {
        if (frontFile && backFile) {
            onAddProduct(frontFile, backFile)
            setFrontFile(null)
            setBackFile(null)
            setFrontPreview(null)
            setBackPreview(null)
            // Reset file inputs
            document.getElementById('catalog-front-input').value = ''
            document.getElementById('catalog-back-input').value = ''
        }
    }

    return (
        <div className="catalog-form">
            {/* Header Info */}
            <div className="info-banner" style={{
                background: 'linear-gradient(135deg, var(--accent) 0%, #7c3aed 100%)',
                color: 'white',
                padding: '1rem',
                borderRadius: '12px',
                marginBottom: '1.5rem'
            }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Master Catalog</h3>
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', opacity: 0.9 }}>
                    Generate a complete catalog: Cover + {products.length} products (front & back) + Thank You page
                </p>
            </div>

            {/* Section 1: Collection Info */}
            <div className="form-section">
                <h2><span className="step">1</span>Collection Info</h2>

                <div className="form-group">
                    <label>Collection Name *</label>
                    <input
                        type="text"
                        value={collectionName}
                        onChange={(e) => setCollectionName(e.target.value)}
                        placeholder="Summer Essentials 2024"
                        required
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Collection Number</label>
                        <input
                            type="text"
                            value={collectionNumber}
                            onChange={(e) => setCollectionNumber(e.target.value)}
                            placeholder="Vol. 24"
                        />
                    </div>
                    <div className="form-group">
                        <label>Category *</label>
                        <select value={category} onChange={(e) => setCategory(e.target.value)}>
                            <option value="men">Men</option>
                            <option value="women">Women</option>
                            <option value="teen_boy">Teen Boy</option>
                            <option value="teen_girl">Teen Girl</option>
                            <option value="infant_boy">Infant Boy</option>
                            <option value="infant_girl">Infant Girl</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Section 2: Theme */}
            <div className="form-section">
                <h2><span className="step">2</span>Theme & Style</h2>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    This theme applies to cover, all product pages, and thank you page
                </p>
                <ThemePreview selected={theme} onSelect={setTheme} />

                <div className="form-row" style={{ marginTop: '1rem' }}>
                    <div className="form-group">
                        <label>Skin Tone</label>
                        <select value={skinTone} onChange={(e) => setSkinTone(e.target.value)}>
                            <option value="fair">Fair</option>
                            <option value="light">Light</option>
                            <option value="medium">Medium</option>
                            <option value="olive">Olive</option>
                            <option value="tan">Tan</option>
                            <option value="brown">Brown</option>
                            <option value="dark">Dark</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Body Type</label>
                        <input
                            type="text"
                            value={bodyType}
                            onChange={(e) => setBodyType(e.target.value)}
                            placeholder="Athletic, Slim, etc."
                        />
                    </div>
                </div>
            </div>

            {/* Section 3: Logo */}
            <div className="form-section">
                <h2><span className="step">3</span>Logo</h2>
                <div className="form-group">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setLogo(e.target.files[0])}
                        style={{ padding: '0.75rem' }}
                    />
                    {logo && (
                        <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            ✓ {logo.name}
                        </p>
                    )}
                </div>
            </div>

            {/* Section 4: Product Pieces */}
            <div className="form-section">
                <h2><span className="step">4</span>Product Pieces ({products.length})</h2>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    Add up to 20 products. Customize views, themes, and layouts for each.
                </p>

                {/* Current uploaded products */}
                {products.length > 0 && (
                    <div className="product-list" style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        marginBottom: '1rem'
                    }}>
                        {products.map((p, idx) => (
                            <div key={p.id} style={{
                                display: 'grid',
                                gridTemplateColumns: '80px 1fr auto',
                                gap: '1rem',
                                background: 'var(--bg-tertiary)',
                                padding: '1rem',
                                borderRadius: '8px',
                                border: '1px solid var(--border-color)',
                                alignItems: 'start'
                            }}>
                                {/* Thumbnails */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <img
                                        src={p.frontPreview}
                                        alt={`Product ${idx + 1}`}
                                        style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }}
                                    />
                                    <div style={{
                                        background: 'var(--accent)',
                                        color: 'white',
                                        padding: '2px',
                                        borderRadius: '4px',
                                        fontSize: '0.7rem',
                                        fontWeight: 600,
                                        textAlign: 'center'
                                    }}>
                                        #{idx + 1}
                                    </div>
                                </div>

                                {/* Controls */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

                                    {/* 1. View Selection */}
                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                                            Generate Views:
                                        </label>
                                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={p.views?.front ?? true}
                                                    onChange={() => handleViewToggle(p.id, 'front')}
                                                /> Front
                                            </label>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={p.views?.back ?? true}
                                                    onChange={() => handleViewToggle(p.id, 'back')}
                                                /> Back
                                            </label>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={p.views?.detail ?? false}
                                                    onChange={() => handleViewToggle(p.id, 'detail')}
                                                /> Fabric Detail
                                            </label>
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                        {/* 2. Theme Selection */}
                                        <div>
                                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                                                Theme:
                                            </label>
                                            <select
                                                value={p.theme || 'default'}
                                                onChange={(e) => handleProductSettingChange(p.id, 'theme', e.target.value)}
                                                style={{
                                                    width: '100%',
                                                    padding: '0.4rem',
                                                    fontSize: '0.8rem',
                                                    borderRadius: '4px',
                                                    border: '1px solid var(--border-color)',
                                                    background: 'var(--bg-primary)',
                                                    color: 'var(--text-primary)'
                                                }}
                                            >
                                                <option value="default">🌐 Collection Default</option>
                                                {Object.entries(THEMES).map(([key, t]) => (
                                                    <option key={key} value={key}>{t.icon} {t.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* 3. Layout Selection */}
                                        <div>
                                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                                                Layout:
                                            </label>
                                            <select
                                                value={p.layout || 'smart_auto'}
                                                onChange={(e) => handleProductSettingChange(p.id, 'layout', e.target.value)}
                                                style={{
                                                    width: '100%',
                                                    padding: '0.4rem',
                                                    fontSize: '0.8rem',
                                                    borderRadius: '4px',
                                                    border: '1px solid var(--border-color)',
                                                    background: 'var(--bg-primary)',
                                                    color: 'var(--text-primary)'
                                                }}
                                            >
                                                {Object.entries(CATALOG_LAYOUTS).map(([key, l]) => (
                                                    <option key={key} value={key}>{l.icon || ''} {l.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Remove Button */}
                                <button
                                    type="button"
                                    onClick={() => onRemoveProduct(p.id)}
                                    style={{
                                        background: '#fee2e2',
                                        color: '#ef4444',
                                        border: 'none',
                                        borderRadius: '4px',
                                        width: '28px',
                                        height: '28px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1rem',
                                        lineHeight: 1
                                    }}
                                    title="Remove Product"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add new product */}
                {products.length < 20 && (
                    <div className="add-product" style={{
                        background: 'var(--bg-secondary)',
                        padding: '1rem',
                        borderRadius: '8px',
                        border: '2px dashed var(--border-color)'
                    }}>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textAlign: 'center' }}>
                            📋 Tip: Press Cmd+V (Mac) or Ctrl+V (Win) to paste images, or drag & drop below
                        </p>
                        <div className="form-row" style={{ gap: '1rem' }}>
                            {/* Front Image Drop Zone */}
                            <div
                                className="form-group"
                                ref={frontDropRef}
                                onDragOver={(e) => handleDragOver(e, 'front')}
                                onDragLeave={(e) => handleDragLeave(e, 'front')}
                                onDrop={(e) => handleDrop(e, 'front')}
                                onClick={() => document.getElementById('catalog-front-input').click()}
                                style={{
                                    border: dragOverFront ? '2px solid var(--accent)' : '2px dashed var(--border-color)',
                                    borderRadius: '8px',
                                    padding: '1rem',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    background: dragOverFront ? 'rgba(139, 92, 246, 0.1)' : 'var(--bg-tertiary)',
                                    transition: 'all 0.2s ease',
                                    minHeight: '120px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <label style={{ fontWeight: 600, marginBottom: '0.5rem', pointerEvents: 'none' }}>Front Image</label>
                                {frontPreview ? (
                                    <img src={frontPreview} alt="Front Preview" style={{
                                        maxWidth: '100%',
                                        maxHeight: '80px',
                                        objectFit: 'contain',
                                        borderRadius: '4px'
                                    }} />
                                ) : (
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                        <span style={{ fontSize: '1.5rem' }}>📁</span><br />
                                        Drop or Click
                                    </div>
                                )}
                                <input
                                    id="catalog-front-input"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setFrontFile(e.target.files[0])}
                                    style={{ display: 'none' }}
                                />
                            </div>

                            {/* Back Image Drop Zone */}
                            <div
                                className="form-group"
                                ref={backDropRef}
                                onDragOver={(e) => handleDragOver(e, 'back')}
                                onDragLeave={(e) => handleDragLeave(e, 'back')}
                                onDrop={(e) => handleDrop(e, 'back')}
                                onClick={() => document.getElementById('catalog-back-input').click()}
                                style={{
                                    border: dragOverBack ? '2px solid var(--accent)' : '2px dashed var(--border-color)',
                                    borderRadius: '8px',
                                    padding: '1rem',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    background: dragOverBack ? 'rgba(139, 92, 246, 0.1)' : 'var(--bg-tertiary)',
                                    transition: 'all 0.2s ease',
                                    minHeight: '120px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <label style={{ fontWeight: 600, marginBottom: '0.5rem', pointerEvents: 'none' }}>Back Image</label>
                                {backPreview ? (
                                    <img src={backPreview} alt="Back Preview" style={{
                                        maxWidth: '100%',
                                        maxHeight: '80px',
                                        objectFit: 'contain',
                                        borderRadius: '4px'
                                    }} />
                                ) : (
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                        <span style={{ fontSize: '1.5rem' }}>📁</span><br />
                                        Drop or Click
                                    </div>
                                )}
                                <input
                                    id="catalog-back-input"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setBackFile(e.target.files[0])}
                                    style={{ display: 'none' }}
                                />
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleAddPiece}
                            disabled={!frontFile || !backFile}
                            style={{
                                marginTop: '0.75rem',
                                padding: '0.75rem 1rem',
                                background: frontFile && backFile ? 'var(--accent)' : 'var(--bg-tertiary)',
                                color: frontFile && backFile ? 'white' : 'var(--text-muted)',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: frontFile && backFile ? 'pointer' : 'width: 100%',
                                width: '100%',
                                fontWeight: 600,
                                fontSize: '0.9rem'
                            }}
                        >
                            ✓ Add Product #{products.length + 1}
                        </button>
                    </div>
                )}
            </div>

            {/* Section 5: Optional Text Fields */}
            <div className="form-section">
                <h2><span className="step">5</span>Text Fields (Optional)</h2>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    These will appear on cover and product pages as appropriate
                </p>

                <div className="form-row">
                    <div className="form-group">
                        <label>Tagline</label>
                        <input
                            type="text"
                            value={textFields.tagline || ''}
                            onChange={(e) => handleTextChange('tagline', e.target.value)}
                            placeholder="Premium Comfort Wear"
                        />
                    </div>
                    <div className="form-group">
                        <label>Season</label>
                        <input
                            type="text"
                            value={textFields.season || ''}
                            onChange={(e) => handleTextChange('season', e.target.value)}
                            placeholder="Summer 2024"
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Year</label>
                        <input
                            type="text"
                            value={textFields.year || ''}
                            onChange={(e) => handleTextChange('year', e.target.value)}
                            placeholder="2024"
                        />
                    </div>
                    <div className="form-group">
                        <label>Price Range</label>
                        <input
                            type="text"
                            value={textFields.price_range || ''}
                            onChange={(e) => handleTextChange('price_range', e.target.value)}
                            placeholder="₹499 - ₹1,299"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Fabric Info</label>
                    <input
                        type="text"
                        value={textFields.fabric || ''}
                        onChange={(e) => handleTextChange('fabric', e.target.value)}
                        placeholder="100% Premium Cotton"
                    />
                </div>

                <div className="form-group">
                    <label>Brand Message</label>
                    <input
                        type="text"
                        value={textFields.brand_message || ''}
                        onChange={(e) => handleTextChange('brand_message', e.target.value)}
                        placeholder="Made with Love in India"
                    />
                </div>

                <details style={{ marginTop: '0.5rem' }}>
                    <summary style={{ cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        + More Custom Fields
                    </summary>
                    <div style={{ marginTop: '0.75rem' }}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Custom 1</label>
                                <input
                                    type="text"
                                    value={textFields.custom_1 || ''}
                                    onChange={(e) => handleTextChange('custom_1', e.target.value)}
                                    placeholder="Custom text..."
                                />
                            </div>
                            <div className="form-group">
                                <label>Custom 2</label>
                                <input
                                    type="text"
                                    value={textFields.custom_2 || ''}
                                    onChange={(e) => handleTextChange('custom_2', e.target.value)}
                                    placeholder="Custom text..."
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Custom 3</label>
                                <input
                                    type="text"
                                    value={textFields.custom_3 || ''}
                                    onChange={(e) => handleTextChange('custom_3', e.target.value)}
                                    placeholder="Custom text..."
                                />
                            </div>
                            <div className="form-group">
                                <label>Custom 4</label>
                                <input
                                    type="text"
                                    value={textFields.custom_4 || ''}
                                    onChange={(e) => handleTextChange('custom_4', e.target.value)}
                                    placeholder="Custom text..."
                                />
                            </div>
                        </div>
                    </div>
                </details>
            </div>

            {/* Summary */}
            <div style={{
                background: 'var(--bg-secondary)',
                padding: '1rem',
                borderRadius: '8px',
                marginTop: '1rem'
            }}>
                <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem' }}>📋 Catalog Summary</h4>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <li>1 Cover Page</li>
                    <li>{products.length} Products</li>
                    <li>{products.reduce((acc, p) => acc + (p.views?.front ? 1 : 0) + (p.views?.back ? 1 : 0) + (p.views?.detail ? 1 : 0), 0)} Estimated Pages (will vary based on layout)</li>
                    <li>1 Thank You Page</li>
                </ul>
            </div>
        </div>
    )
}
