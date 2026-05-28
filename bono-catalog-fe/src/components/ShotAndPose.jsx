const shotAngles = [
    { value: 'front_facing', label: 'Front' },
    { value: 'three_quarter', label: '3/4 View' },
    { value: 'side_profile', label: 'Side' },
    { value: 'dynamic', label: 'Dynamic' },
    { value: 'casual', label: 'Casual' },
]

const poseTypes = [
    { value: 'catalog_standard', label: 'Standard' },
    { value: 'hands_on_hips', label: 'Hands on Hips' },
    { value: 'arms_crossed', label: 'Arms Crossed' },
    { value: 'walking', label: 'Walking' },
    { value: 'dynamic', label: 'Dynamic' },
]

const fitTypes = [
    { value: 'slim', label: 'Slim Fit' },
    { value: 'regular', label: 'Regular' },
    { value: 'boxy', label: 'Boxy Fit' },
    { value: 'oversized', label: 'Oversized' },
    { value: 'loose', label: 'Loose' },
]

function ShotAndPose({ shotAngle, poseType, fitType, onShotAngleChange, onPoseTypeChange, onFitTypeChange }) {
    return (
        <div>
            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                    Angle
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {shotAngles.map(sa => (
                        <button
                            key={sa.value}
                            type="button"
                            onClick={() => onShotAngleChange(sa.value)}
                            className={`btn ${shotAngle === sa.value ? 'btn-primary' : ''}`}
                            style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem' }}
                        >
                            {sa.label}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                    Pose
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {poseTypes.map(pt => (
                        <button
                            key={pt.value}
                            type="button"
                            onClick={() => onPoseTypeChange(pt.value)}
                            className={`btn ${poseType === pt.value ? 'btn-primary' : ''}`}
                            style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem' }}
                        >
                            {pt.label}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                    Fit Style
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {fitTypes.map(ft => (
                        <button
                            key={ft.value}
                            type="button"
                            onClick={() => onFitTypeChange(ft.value)}
                            className={`btn ${fitType === ft.value ? 'btn-primary' : ''}`}
                            style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem' }}
                        >
                            {ft.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default ShotAndPose
