import React from 'react'

const FONTS = [
    { id: 'Montserrat', name: 'Montserrat' },
    { id: 'Arial', name: 'Arial' },
    { id: 'Impact', name: 'Impact' },
    { id: 'Georgia', name: 'Georgia' },
    { id: 'Courier New', name: 'Courier' },
    { id: 'Comic Sans MS', name: 'Comic Sans' },
    { id: 'Times New Roman', name: 'Times' }
]

export default function TextEditor({
    text,
    onTextChange,
    fontSize,
    onFontSizeChange,
    fontFamily,
    onFontFamilyChange,
    textColor,
    onTextColorChange
}) {
    return (
        <div className="control-group">
            <label>Your Name / Text</label>
            <input
                type="text"
                className="text-input"
                placeholder="Enter your name or text..."
                value={text}
                onChange={(e) => onTextChange(e.target.value)}
                maxLength={30}
            />
            <div className="text-controls">
                <select
                    value={fontFamily}
                    onChange={(e) => onFontFamilyChange(e.target.value)}
                >
                    {FONTS.map(font => (
                        <option key={font.id} value={font.id}>
                            {font.name}
                        </option>
                    ))}
                </select>
                <input
                    type="number"
                    value={fontSize}
                    onChange={(e) => onFontSizeChange(Number(e.target.value))}
                    min={12}
                    max={120}
                    title="Font Size"
                />
                <input
                    type="color"
                    value={textColor}
                    onChange={(e) => onTextColorChange(e.target.value)}
                    title="Text Color"
                />
            </div>
        </div>
    )
}
