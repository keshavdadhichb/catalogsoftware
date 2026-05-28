const skinTones = [
    { value: 'fair', label: 'Fair' },
    { value: 'light', label: 'Light' },
    { value: 'medium', label: 'Medium' },
    { value: 'medium brown', label: 'Medium Brown' },
    { value: 'dark brown', label: 'Dark Brown' },
    { value: 'deep', label: 'Deep' },
]

const hairTypes = [
    { value: 'short black hair', label: 'Short Black' },
    { value: 'short brown hair', label: 'Short Brown' },
    { value: 'medium length black hair', label: 'Medium Black' },
    { value: 'long black hair', label: 'Long Black' },
    { value: 'long brown hair', label: 'Long Brown' },
    { value: 'curly black hair', label: 'Curly Black' },
    { value: 'wavy brown hair', label: 'Wavy Brown' },
    { value: 'buzz cut', label: 'Buzz Cut' },
]

const bodyTypes = [
    { value: '', label: 'Default' },
    { value: 'slim build', label: 'Slim' },
    { value: 'athletic build', label: 'Athletic' },
    { value: 'lean build', label: 'Lean' },
    { value: 'average build', label: 'Average' },
    { value: 'muscular build', label: 'Muscular' },
]

function ModelDescription({ skinTone, hairType, bodyType, onSkinToneChange, onHairTypeChange, onBodyTypeChange }) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
                <label>Skin Tone</label>
                <select value={skinTone} onChange={(e) => onSkinToneChange(e.target.value)}>
                    {skinTones.map(st => (
                        <option key={st.value} value={st.value}>{st.label}</option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label>Hair</label>
                <select value={hairType} onChange={(e) => onHairTypeChange(e.target.value)}>
                    {hairTypes.map(ht => (
                        <option key={ht.value} value={ht.value}>{ht.label}</option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label>Build</label>
                <select value={bodyType} onChange={(e) => onBodyTypeChange(e.target.value)}>
                    {bodyTypes.map(bt => (
                        <option key={bt.value} value={bt.value}>{bt.label}</option>
                    ))}
                </select>
            </div>
        </div>
    )
}

export default ModelDescription
