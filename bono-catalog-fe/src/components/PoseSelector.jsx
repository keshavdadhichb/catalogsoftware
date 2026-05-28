/**
 * PoseSelector Component
 * Allows users to cycle through and select different poses after generation
 */
import React, { useState, useEffect } from 'react';
import './PoseSelector.css';

// Available poses (synced with backend POSE_OPTIONS)
const POSE_OPTIONS = {
    catalog_standard: 'Classic Standing',
    hands_on_hips: 'Hands on Hips',
    arms_crossed: 'Arms Crossed',
    hands_in_pockets: 'Hands in Pockets',
    walking: 'Walking',
    walking_towards: 'Walking Towards Camera',
    sitting_chair: 'Sitting on Chair',
    sitting_stool: 'Sitting on Stool',
    leaning_wall: 'Leaning on Wall',
    crouching: 'Crouching',
    editorial_dramatic: 'Editorial Dramatic',
    editorial_relaxed: 'Editorial Relaxed'
};

const POSE_KEYS = Object.keys(POSE_OPTIONS);

export default function PoseSelector({
    currentPose = 'catalog_standard',
    onPoseChange,
    isLoading = false,
    disabled = false
}) {
    const [selectedPose, setSelectedPose] = useState(currentPose);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const currentIndex = POSE_KEYS.indexOf(selectedPose);

    const handlePrevPose = () => {
        if (isLoading || disabled) return;
        const newIndex = currentIndex <= 0 ? POSE_KEYS.length - 1 : currentIndex - 1;
        const newPose = POSE_KEYS[newIndex];
        setSelectedPose(newPose);
        onPoseChange?.(newPose);
    };

    const handleNextPose = () => {
        if (isLoading || disabled) return;
        const newIndex = currentIndex >= POSE_KEYS.length - 1 ? 0 : currentIndex + 1;
        const newPose = POSE_KEYS[newIndex];
        setSelectedPose(newPose);
        onPoseChange?.(newPose);
    };

    const handleSelectPose = (poseKey) => {
        if (isLoading || disabled) return;
        setSelectedPose(poseKey);
        setIsDropdownOpen(false);
        onPoseChange?.(poseKey);
    };

    return (
        <div className="pose-selector">
            <div className="pose-selector-header">
                <span className="pose-label">Pose Variation</span>
                {isLoading && <span className="pose-loading">Regenerating...</span>}
            </div>

            <div className="pose-controls">
                <button
                    className="pose-arrow pose-prev"
                    onClick={handlePrevPose}
                    disabled={isLoading || disabled}
                    title="Previous pose"
                >
                    ←
                </button>

                <button
                    className="pose-current"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    disabled={isLoading || disabled}
                >
                    <span className="pose-name">{POSE_OPTIONS[selectedPose]}</span>
                    <span className="pose-count">{currentIndex + 1} / {POSE_KEYS.length}</span>
                </button>

                <button
                    className="pose-arrow pose-next"
                    onClick={handleNextPose}
                    disabled={isLoading || disabled}
                    title="Next pose"
                >
                    →
                </button>
            </div>

            {isDropdownOpen && (
                <div className="pose-dropdown">
                    {POSE_KEYS.map((poseKey) => (
                        <button
                            key={poseKey}
                            className={`pose-option ${poseKey === selectedPose ? 'active' : ''}`}
                            onClick={() => handleSelectPose(poseKey)}
                        >
                            {POSE_OPTIONS[poseKey]}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// Export pose options for use in other components
export { POSE_OPTIONS, POSE_KEYS };
