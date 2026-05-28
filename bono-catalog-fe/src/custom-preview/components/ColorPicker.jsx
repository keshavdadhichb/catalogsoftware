import React from 'react'

const COLORS = [
    { id: 'black', name: 'Black', hex: '#1a1a1a' },
    { id: 'white', name: 'White', hex: '#ffffff' },
    { id: 'red', name: 'Red', hex: '#dc2626' }
]

export default function ColorPicker({ selectedColor, onColorChange }) {
    return (
        <div className="control-group">
            <label>Color</label>
            <div className="color-picker">
                {COLORS.map(color => (
                    <button
                        key={color.id}
                        className={`color-swatch ${color.id} ${selectedColor === color.id ? 'active' : ''}`}
                        onClick={() => onColorChange(color.id)}
                        title={color.name}
                    />
                ))}
            </div>
        </div>
    )
}
