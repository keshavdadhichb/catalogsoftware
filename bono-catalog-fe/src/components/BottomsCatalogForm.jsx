import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * BottomsCatalogForm - Form for generating baby bottoms/joggers catalogs
 * Features:
 * - Brand logo upload
 * - Collection name
 * - Multiple product entries with article #, name, sizes
 * - Cover style selection
 * - Detail pages toggle
 */

const COVER_STYLES = [
    { id: 'minimal_elegant', name: 'Minimal Elegant', desc: 'Soft gradient, elegant typography' },
    { id: 'playful_pastel', name: 'Playful Pastel', desc: 'Soft baby colors, friendly fonts' },
    { id: 'clean_white', name: 'Clean White', desc: 'Pure white, modern minimalist' }
]

export default function BottomsCatalogForm({ onSubmit, isGenerating }) {
    const [brandName, setBrandName] = useState('')
    const [collectionName, setCollectionName] = useState('')
    const [logo, setLogo] = useState(null)
    const [logoPreview, setLogoPreview] = useState(null)
    const [coverStyle, setCoverStyle] = useState('minimal_elegant')
    const [includeDetailPages, setIncludeDetailPages] = useState(true)
    const [season, setSeason] = useState('2026')

    const [products, setProducts] = useState([
        {
            article: '',
            name: '',
            sizes: '0-6M, 6-12M, 12-18M, 18-24M',
            image: null,
            imagePreview: null,
            views: { front: true, back: false, print: false, fabric: false }
        }
    ])

    const handleLogoChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setLogo(file)
            setLogoPreview(URL.createObjectURL(file))
        }
    }

    const handleProductChange = (index, field, value) => {
        const updated = [...products]
        updated[index][field] = value
        setProducts(updated)
    }

    const handleViewToggle = (index, viewType) => {
        const updated = [...products]
        updated[index].views = {
            ...updated[index].views,
            [viewType]: !updated[index].views[viewType]
        }
        setProducts(updated)
    }

    const handleProductImageChange = (index, e) => {
        const file = e.target.files[0]
        if (file) {
            const updated = [...products]
            updated[index].image = file
            updated[index].imagePreview = URL.createObjectURL(file)
            setProducts(updated)
        }
    }

    const addProduct = () => {
        setProducts([
            ...products,
            {
                article: '',
                name: '',
                sizes: '0-6M, 6-12M, 12-18M, 18-24M',
                image: null,
                imagePreview: null,
                views: { front: true, back: false, print: false, fabric: false }
            }
        ])
    }

    const removeProduct = (index) => {
        if (products.length > 1) {
            setProducts(products.filter((_, i) => i !== index))
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        // Validate
        if (!brandName.trim()) {
            alert('Please enter a brand name')
            return
        }
        if (!collectionName.trim()) {
            alert('Please enter a collection name')
            return
        }

        const validProducts = products.filter(p => p.image && p.name.trim())
        if (validProducts.length === 0) {
            alert('Please add at least one product with an image and name')
            return
        }

        // Validate view selection logic - warn if no views selected for a product?
        // Actually, let backend handle empty selection (maybe skip product?) or alert here.
        // Let's ensure at least one view is selected for each valid product.
        const invalidViewSelection = validProducts.some(p => !Object.values(p.views).some(v => v))
        if (invalidViewSelection) {
            alert('Please select at least one view (Front, Back, etc.) for each product.')
            return
        }

        // Build form data
        const formData = new FormData()
        formData.append('brand_name', brandName)
        formData.append('collection_name', collectionName)
        formData.append('cover_style', coverStyle)
        formData.append('season', season)

        if (logo) {
            formData.append('logo', logo)
        }

        // Add products JSON
        const productsData = validProducts.map((p, idx) => ({
            article: p.article || `ART-${idx + 1}`,
            name: p.name,
            sizes: p.sizes,
            image_index: idx,
            views: p.views // Pass views selection to backend
        }))
        formData.append('products', JSON.stringify(productsData))

        // Add product images
        validProducts.forEach(p => {
            formData.append('product_images', p.image)
        })

        onSubmit(formData)
    }

    const isFormValid = brandName.trim() && collectionName.trim() &&
        products.some(p => p.image && p.name.trim())

    return (
        <form onSubmit={handleSubmit} className="bottoms-catalog-form">
            <div className="form-header">
                <h2>👶 Baby Bottoms Catalog</h2>
                <p>Create professional catalogs for baby joggers & pants</p>
            </div>

            {/* Brand Info Section */}
            <section className="form-section">
                <h3>Brand Information</h3>

                <div className="form-row">
                    <div className="form-group">
                        <label>Brand Name *</label>
                        <input
                            type="text"
                            value={brandName}
                            onChange={(e) => setBrandName(e.target.value)}
                            placeholder="e.g., BabyComfort"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Collection Name *</label>
                        <input
                            type="text"
                            value={collectionName}
                            onChange={(e) => setCollectionName(e.target.value)}
                            placeholder="e.g., Winter Wonderland 2026"
                            required
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Brand Logo (Optional)</label>
                        <div className="logo-upload">
                            {logoPreview ? (
                                <div className="logo-preview">
                                    <img src={logoPreview} alt="Logo preview" />
                                    <button type="button" onClick={() => { setLogo(null); setLogoPreview(null) }}>
                                        ✕
                                    </button>
                                </div>
                            ) : (
                                <label className="upload-zone">
                                    <input type="file" accept="image/*" onChange={handleLogoChange} hidden />
                                    <span>📤 Upload Logo</span>
                                </label>
                            )}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Season/Year</label>
                        <input
                            type="text"
                            value={season}
                            onChange={(e) => setSeason(e.target.value)}
                            placeholder="2026"
                        />
                    </div>
                </div>
            </section>

            {/* Cover Style Section */}
            <section className="form-section">
                <h3>Cover Page Style</h3>
                <div className="style-options">
                    {COVER_STYLES.map(style => (
                        <label
                            key={style.id}
                            className={`style-option ${coverStyle === style.id ? 'selected' : ''}`}
                        >
                            <input
                                type="radio"
                                name="coverStyle"
                                value={style.id}
                                checked={coverStyle === style.id}
                                onChange={(e) => setCoverStyle(e.target.value)}
                            />
                            <span className="style-name">{style.name}</span>
                            <span className="style-desc">{style.desc}</span>
                        </label>
                    ))}
                </div>
            </section>

            {/* Products Section */}
            <section className="form-section">
                <div className="section-header">
                    <h3>Products ({products.length})</h3>
                    <button type="button" onClick={addProduct} className="add-btn">
                        + Add Product
                    </button>
                </div>

                <AnimatePresence>
                    {products.map((product, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="product-card"
                        >
                            <div className="product-header">
                                <span>Product {index + 1}</span>
                                {products.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeProduct(index)}
                                        className="remove-btn"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>

                            <div className="product-content">
                                {/* Image Upload */}
                                <div className="product-image-upload">
                                    {product.imagePreview ? (
                                        <div className="image-preview">
                                            <img src={product.imagePreview} alt={`Product ${index + 1}`} />
                                            <button
                                                type="button"
                                                onClick={() => handleProductChange(index, 'image', null) || handleProductChange(index, 'imagePreview', null)}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="upload-zone product-upload">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleProductImageChange(index, e)}
                                                hidden
                                            />
                                            <span>📷</span>
                                            <span>Upload Jogger Image</span>
                                        </label>
                                    )}
                                </div>

                                {/* Product Details */}
                                <div className="product-details">
                                    <div className="form-group">
                                        <label>Article Number</label>
                                        <input
                                            type="text"
                                            value={product.article}
                                            onChange={(e) => handleProductChange(index, 'article', e.target.value)}
                                            placeholder="e.g., JOG-001"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Product Name *</label>
                                        <input
                                            type="text"
                                            value={product.name}
                                            onChange={(e) => handleProductChange(index, 'name', e.target.value)}
                                            placeholder="e.g., Blue Teddy Jogger"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Available Sizes</label>
                                        <input
                                            type="text"
                                            value={product.sizes}
                                            onChange={(e) => handleProductChange(index, 'sizes', e.target.value)}
                                            placeholder="0-6M, 6-12M, 12-18M, 18-24M"
                                        />
                                    </div>

                                    {/* View Selection */}
                                    <div className="views-selection">
                                        <label className="view-label">Select Views to Generate:</label>
                                        <div className="view-toggles">
                                            <label className={`view-chip ${product.views.front ? 'active' : ''}`}>
                                                <input
                                                    type="checkbox"
                                                    checked={product.views.front}
                                                    onChange={() => handleViewToggle(index, 'front')}
                                                />
                                                Front View
                                            </label>
                                            <label className={`view-chip ${product.views.back ? 'active' : ''}`}>
                                                <input
                                                    type="checkbox"
                                                    checked={product.views.back}
                                                    onChange={() => handleViewToggle(index, 'back')}
                                                />
                                                Back View
                                            </label>
                                            <label className={`view-chip ${product.views.print ? 'active' : ''}`}>
                                                <input
                                                    type="checkbox"
                                                    checked={product.views.print}
                                                    onChange={() => handleViewToggle(index, 'print')}
                                                />
                                                Print Detail
                                            </label>
                                            <label className={`view-chip ${product.views.fabric ? 'active' : ''}`}>
                                                <input
                                                    type="checkbox"
                                                    checked={product.views.fabric}
                                                    onChange={() => handleViewToggle(index, 'fabric')}
                                                />
                                                Fabric Shot
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </section>

            {/* Use to have options section here - removed global detail toggle */}

            {/* Submit Button */}
            <button
                type="submit"
                className="submit-btn"
                disabled={!isFormValid || isGenerating}
            >
                {isGenerating ? (
                    <>🎨 Generating Catalog...</>
                ) : (
                    <>✨ Generate Baby Bottoms Catalog</>
                )}
            </button>
        </form>
    )
}
