import React from 'react'

const CATEGORIES = [
    { id: 'men', name: 'Men', icon: '👨', ageDefault: [25, 35] },
    { id: 'women', name: 'Women', icon: '👩', ageDefault: [25, 35] },
    { id: 'teen_boy', name: 'Teen Boy', icon: '🧑', ageDefault: [13, 17] },
    { id: 'teen_girl', name: 'Teen Girl', icon: '👧', ageDefault: [13, 17] },
    { id: 'boy', name: 'Boy', icon: '👦', ageDefault: [6, 12] },
    { id: 'girl', name: 'Girl', icon: '👧', ageDefault: [6, 12] },
    { id: 'infant_boy', name: 'Infant Boy', icon: '👶', ageDefault: [0, 3] },
    { id: 'infant_girl', name: 'Infant Girl', icon: '👶', ageDefault: [0, 3] }
]

export default function CategorySelector({
    category,
    setCategory,
    ageRange,
    setAgeRange,
    onNext,
    onPrev,
    canProceed
}) {
    const handleCategorySelect = (cat) => {
        setCategory(cat.id)
        setAgeRange(cat.ageDefault)
    }

    const selectedCat = CATEGORIES.find(c => c.id === category)

    // Get min/max age based on category
    const getAgeConstraints = () => {
        if (category?.includes('infant')) return { min: 0, max: 5 }
        if (category?.includes('boy') || category?.includes('girl')) return { min: 3, max: 14 }
        if (category?.includes('teen')) return { min: 11, max: 19 }
        return { min: 18, max: 60 }
    }

    const ageConstraints = getAgeConstraints()

    return (
        <div className="wizard-step">
            <div className="step-header">
                <h2>👔 Target Category</h2>
                <p>Select who will wear these garments</p>
            </div>

            {/* Category Selection */}
            <div className="selection-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                {CATEGORIES.map(cat => (
                    <div
                        key={cat.id}
                        className={`selection-card ${category === cat.id ? 'selected' : ''}`}
                        onClick={() => handleCategorySelect(cat)}
                    >
                        <div className="card-icon">{cat.icon}</div>
                        <div className="card-title">{cat.name}</div>
                    </div>
                ))}
            </div>

            {/* Age Range Slider */}
            {category && (
                <div className="form-group" style={{ marginTop: '2rem' }}>
                    <label>Age Range: {ageRange[0]} - {ageRange[1]} years</label>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.5rem' }}>
                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
                            {ageConstraints.min}
                        </span>
                        <input
                            type="range"
                            min={ageConstraints.min}
                            max={ageConstraints.max}
                            value={ageRange[0]}
                            onChange={(e) => setAgeRange([parseInt(e.target.value), Math.max(parseInt(e.target.value), ageRange[1])])}
                            style={{ flex: 1 }}
                        />
                        <input
                            type="range"
                            min={ageConstraints.min}
                            max={ageConstraints.max}
                            value={ageRange[1]}
                            onChange={(e) => setAgeRange([Math.min(ageRange[0], parseInt(e.target.value)), parseInt(e.target.value)])}
                            style={{ flex: 1 }}
                        />
                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
                            {ageConstraints.max}
                        </span>
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
                    Continue →
                </button>
            </div>
        </div>
    )
}
