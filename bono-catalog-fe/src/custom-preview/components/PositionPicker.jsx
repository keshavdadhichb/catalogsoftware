import React from 'react'

export default function PositionPicker({ positions, selectedPosition, onPositionChange }) {
    return (
        <div className="control-group">
            <label>Print Position</label>
            <div className="position-picker">
                {positions.map(pos => (
                    <button
                        key={pos.id}
                        className={`position-btn ${selectedPosition === pos.id ? 'active' : ''}`}
                        onClick={() => onPositionChange(pos.id)}
                    >
                        {pos.name}
                    </button>
                ))}
            </div>
        </div>
    )
}
