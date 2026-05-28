import React, { useState } from 'react'

// 7 Page Types
export const PAGE_TYPES = [
    { id: 'front_only', name: 'Front Only', icon: '👤', desc: 'Model front view' },
    { id: 'back_only', name: 'Back Only', icon: '🔙', desc: 'Model back view' },
    { id: 'front_back_collage', name: 'Front + Back Collage', icon: '👥', desc: 'Split layout' },
    { id: 'aesthetic_product', name: 'Aesthetic Product', icon: '✨', desc: 'Garment only, no model' },
    { id: 'hero_closeup', name: 'Hero / Print Close-up', icon: '🔍', desc: 'Print detail shot' },
    { id: 'fabric_closeup', name: 'Fabric Close-up', icon: '🧵', desc: 'Texture detail' },
    { id: 'mega_collage', name: 'Mega Collage', icon: '🖼️', desc: '4-in-1 composite' }
]

// All 21 poses organized by category
export const POSE_CATEGORIES = {
    standing: {
        name: '🧍 Standing',
        poses: [
            { id: 'catalog_standard', name: 'Standing Standard' },
            { id: 'hands_on_hips', name: 'Hands on Hips' },
            { id: 'hands_in_pockets', name: 'Hands in Pockets' },
            { id: 'arms_crossed', name: 'Arms Crossed' },
            { id: 'leaning_wall', name: 'Leaning on Wall' }
        ]
    },
    walking: {
        name: '🚶 Walking',
        poses: [
            { id: 'walking_towards', name: 'Walking Towards' },
            { id: 'walking_away', name: 'Walking Away' },
            { id: 'mid_step', name: 'Mid-Step Candid' }
        ]
    },
    sitting: {
        name: '🪑 Sitting',
        poses: [
            { id: 'sitting_chair', name: 'Sitting on Chair' },
            { id: 'sitting_floor', name: 'Sitting on Floor' },
            { id: 'sitting_steps', name: 'Sitting on Steps' }
        ]
    },
    active: {
        name: '⚡ Active / Props',
        poses: [
            { id: 'playing_guitar', name: '🎸 Playing Guitar' },
            { id: 'headphones', name: '🎧 Listening to Music' },
            { id: 'coffee', name: '☕ Holding Coffee' },
            { id: 'jumping', name: '⬆️ Jumping' },
            { id: 'skateboard', name: '🛹 Skateboard Stance' },
            { id: 'basketball', name: '🏀 Playing Basketball' },
            { id: 'dancing', name: '💃 Dancing' },
            { id: 'selfie', name: '🤳 Taking Selfie' },
            { id: 'backpack', name: '🎒 With Backpack' },
            { id: 'reading', name: '📖 Reading' }
        ]
    }
}

// Flatten all poses for select dropdown
const ALL_POSES = Object.entries(POSE_CATEGORIES).flatMap(([catKey, cat]) =>
    cat.poses.map(pose => ({ ...pose, category: cat.name }))
)

// Logo options
const LOGO_OPTIONS = [
    { id: 'none', name: 'No Logo', desc: 'Logo only on cover' },
    { id: 'watermark', name: 'Subtle Watermark', desc: 'Semi-transparent corner' },
    { id: 'corner_badge', name: 'Corner Badge', desc: 'Solid logo, bottom right' },
    { id: 'integrated', name: 'Integrated', desc: 'Part of layout design' }
]

export default function ProductConfigurator({
    products,
    setProducts,
    category,
    onNext,
    onPrev,
    canProceed
}) {
    const [currentProductIndex, setCurrentProductIndex] = useState(0)

    const currentProduct = products[currentProductIndex]

    const updateProduct = (updates) => {
        setProducts(products.map((p, i) =>
            i === currentProductIndex ? { ...p, ...updates } : p
        ))
    }

    const togglePageType = (typeId) => {
        const current = currentProduct.pageTypes || []
        if (current.includes(typeId)) {
            updateProduct({ pageTypes: current.filter(t => t !== typeId) })
        } else {
            updateProduct({ pageTypes: [...current, typeId] })
        }
    }

    const applyToAll = (field) => {
        const value = currentProduct[field]
        setProducts(products.map(p => ({ ...p, [field]: value })))
    }

    const needsPoseSelection = currentProduct?.pageTypes?.some(t =>
        ['front_only', 'back_only', 'front_back_collage', 'mega_collage'].includes(t)
    )

    if (!currentProduct) return null

    return (
        <div className="wizard-step">
            <div className="step-header">
                <h2>⚙️ Configure Products</h2>
                <p>Set page types, poses, and options for each product</p>
            </div>

            {/* Product Navigation */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.5rem',
                padding: '1rem',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '10px'
            }}>
                <button
                    onClick={() => setCurrentProductIndex(Math.max(0, currentProductIndex - 1))}
                    disabled={currentProductIndex === 0}
                    style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: 'none',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        cursor: currentProductIndex === 0 ? 'not-allowed' : 'pointer',
                        opacity: currentProductIndex === 0 ? 0.5 : 1
                    }}
                >
                    ← Prev
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img
                        src={currentProduct.frontImage}
                        alt="Product"
                        style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 6 }}
                    />
                    <span style={{ color: 'white', fontWeight: 600 }}>
                        Product {currentProductIndex + 1} of {products.length}
                    </span>
                </div>

                <button
                    onClick={() => setCurrentProductIndex(Math.min(products.length - 1, currentProductIndex + 1))}
                    disabled={currentProductIndex === products.length - 1}
                    style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: 'none',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        cursor: currentProductIndex === products.length - 1 ? 'not-allowed' : 'pointer',
                        opacity: currentProductIndex === products.length - 1 ? 0.5 : 1
                    }}
                >
                    Next →
                </button>
            </div>

            {/* Page Types Selection */}
            <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label>Page Types (select multiple)</label>
                    <button
                        onClick={() => applyToAll('pageTypes')}
                        style={{
                            fontSize: '0.75rem',
                            background: 'rgba(243,156,18,0.2)',
                            border: '1px solid rgba(243,156,18,0.5)',
                            color: '#f39c12',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '6px',
                            cursor: 'pointer'
                        }}
                    >
                        Apply to All
                    </button>
                </div>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                    gap: '0.5rem',
                    marginTop: '0.75rem'
                }}>
                    {PAGE_TYPES.map(type => (
                        <button
                            key={type.id}
                            onClick={() => togglePageType(type.id)}
                            style={{
                                background: currentProduct.pageTypes?.includes(type.id)
                                    ? 'rgba(46, 204, 113, 0.2)'
                                    : 'rgba(255,255,255,0.05)',
                                border: currentProduct.pageTypes?.includes(type.id)
                                    ? '2px solid #2ecc71'
                                    : '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                padding: '0.75rem',
                                color: 'white',
                                cursor: 'pointer',
                                textAlign: 'left'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontSize: '1.25rem' }}>{type.icon}</span>
                                <div>
                                    <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>{type.name}</div>
                                    <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>{type.desc}</div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Pose Selection (if needed) */}
            {needsPoseSelection && (
                <div style={{
                    marginTop: '1.5rem',
                    padding: '1rem',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <label style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1rem'
                    }}>
                        <span>Model Poses</span>
                        <button
                            onClick={() => {
                                applyToAll('frontPose')
                                applyToAll('backPose')
                            }}
                            style={{
                                fontSize: '0.75rem',
                                background: 'rgba(243,156,18,0.2)',
                                border: '1px solid rgba(243,156,18,0.5)',
                                color: '#f39c12',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '6px',
                                cursor: 'pointer'
                            }}
                        >
                            Apply to All
                        </button>
                    </label>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        {/* Front Pose */}
                        <div>
                            <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem', display: 'block' }}>
                                Front Pose
                            </label>
                            <select
                                value={currentProduct.frontPose || 'catalog_standard'}
                                onChange={(e) => updateProduct({ frontPose: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    background: 'rgba(255,255,255,0.1)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '8px',
                                    color: 'white',
                                    fontSize: '0.9rem'
                                }}
                            >
                                {Object.entries(POSE_CATEGORIES).map(([catKey, cat]) => (
                                    <optgroup key={catKey} label={cat.name}>
                                        {cat.poses.map(pose => (
                                            <option key={pose.id} value={pose.id}>
                                                {pose.name}
                                            </option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                        </div>

                        {/* Back Pose */}
                        <div>
                            <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem', display: 'block' }}>
                                Back Pose
                            </label>
                            <select
                                value={currentProduct.backPose || 'catalog_standard'}
                                onChange={(e) => updateProduct({ backPose: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    background: 'rgba(255,255,255,0.1)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '8px',
                                    color: 'white',
                                    fontSize: '0.9rem'
                                }}
                            >
                                {Object.entries(POSE_CATEGORIES).map(([catKey, cat]) => (
                                    <optgroup key={catKey} label={cat.name}>
                                        {cat.poses.map(pose => (
                                            <option key={pose.id} value={pose.id}>
                                                {pose.name}
                                            </option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Pose Quick Reference */}
                    <div style={{
                        marginTop: '1rem',
                        fontSize: '0.75rem',
                        color: 'rgba(255,255,255,0.5)',
                        textAlign: 'center'
                    }}>
                        21 poses available • Grouped by: Standing, Walking, Sitting, Active
                    </div>
                </div>
            )}

            {/* Marketing Keywords */}
            <div className="form-group" style={{ marginTop: '1.5rem' }}>
                <label>Marketing Keywords (optional, comma-separated)</label>
                <input
                    type="text"
                    value={currentProduct.keywords || ''}
                    onChange={(e) => updateProduct({ keywords: e.target.value })}
                    placeholder="e.g., summer, casual, premium, streetwear"
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        color: 'white',
                        marginTop: '0.5rem'
                    }}
                />
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.25rem' }}>
                    Leave empty for AI to generate contextual text
                </div>
            </div>

            {/* Price (optional) */}
            <div className="form-group" style={{ marginTop: '1rem' }}>
                <label>Price (optional)</label>
                <input
                    type="text"
                    value={currentProduct.price || ''}
                    onChange={(e) => updateProduct({ price: e.target.value })}
                    placeholder="e.g., ₹1,299"
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        color: 'white',
                        marginTop: '0.5rem'
                    }}
                />
            </div>

            {/* Logo Option */}
            <div className="form-group" style={{ marginTop: '1rem' }}>
                <label>Logo on Pages</label>
                <select
                    value={currentProduct.logoOption || 'none'}
                    onChange={(e) => updateProduct({ logoOption: e.target.value })}
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        color: 'white',
                        marginTop: '0.5rem'
                    }}
                >
                    {LOGO_OPTIONS.map(opt => (
                        <option key={opt.id} value={opt.id}>
                            {opt.name} - {opt.desc}
                        </option>
                    ))}
                </select>
            </div>

            <div className="step-navigation">
                <button className="btn-prev" onClick={onPrev}>
                    ← Back
                </button>
                <button
                    className="btn-next"
                    onClick={onNext}
                    disabled={!canProceed}
                >
                    Continue →
                </button>
            </div>
        </div>
    )
}
