const categories = [
    { id: 'men', label: 'Men' },
    { id: 'women', label: 'Women' },
    { id: 'teen_boy', label: 'Teen Boy' },
    { id: 'teen_girl', label: 'Teen Girl' },
    { id: 'infant_boy', label: 'Boy' },
    { id: 'infant_girl', label: 'Girl' },
]

function CategorySelector({ value, onChange }) {
    return (
        <div className="category-grid">
            {categories.map(cat => (
                <div
                    key={cat.id}
                    className={`category-card ${value === cat.id ? 'selected' : ''}`}
                    onClick={() => onChange(cat.id)}
                >
                    <span>{cat.label}</span>
                </div>
            ))}
        </div>
    )
}

export default CategorySelector
