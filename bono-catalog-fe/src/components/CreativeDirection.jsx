function CreativeDirection({ value, onChange }) {
    return (
        <div className="form-group">
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Describe the style, mood, or specific requirements..."
                rows={3}
            />
        </div>
    )
}

export default CreativeDirection
