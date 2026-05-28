import React from 'react'

// Wizard step configuration
const STEPS = {
    photo: [
        { id: 'mode', label: 'Mode', icon: '🎯' },
        { id: 'category', label: 'Category', icon: '👤' },
        { id: 'brand', label: 'Brand', icon: '🏷️' },
        { id: 'model', label: 'Model', icon: '🧑' },
        { id: 'direction', label: 'Direction', icon: '🎨' },
        { id: 'products', label: 'Products', icon: '📦' }
    ],
    poster: [
        { id: 'mode', label: 'Mode', icon: '🎯' },
        { id: 'category', label: 'Category', icon: '👤' },
        { id: 'brand', label: 'Brand', icon: '🏷️' },
        { id: 'style', label: 'Style', icon: '✨' },
        { id: 'layout', label: 'Layout', icon: '📐' },
        { id: 'products', label: 'Products', icon: '📦' }
    ],
    catalog: [
        { id: 'mode', label: 'Mode', icon: '🎯' },
        { id: 'collection', label: 'Collection', icon: '📚' },
        { id: 'theme', label: 'Theme', icon: '🎨' },
        { id: 'products', label: 'Products', icon: '📦' },
        { id: 'details', label: 'Details', icon: '📝' }
    ]
}

const styles = {
    container: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.25rem',
        padding: '1.5rem 0',
        marginBottom: '1rem'
    },
    stepWrapper: {
        display: 'flex',
        alignItems: 'center'
    },
    step: (status) => ({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.4rem',
        cursor: status !== 'upcoming' ? 'pointer' : 'default',
        opacity: status === 'upcoming' ? 0.4 : 1,
        transition: 'all 0.3s ease'
    }),
    circle: (status) => ({
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1rem',
        fontWeight: 600,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        background: status === 'active'
            ? 'linear-gradient(135deg, var(--accent), #7c3aed)'
            : status === 'completed'
                ? 'var(--accent)'
                : 'var(--bg-tertiary)',
        color: status === 'active' || status === 'completed' ? 'white' : 'var(--text-muted)',
        boxShadow: status === 'active'
            ? '0 4px 16px rgba(74, 158, 255, 0.4)'
            : 'none',
        transform: status === 'active' ? 'scale(1.1)' : 'scale(1)'
    }),
    label: (status) => ({
        fontSize: '0.65rem',
        fontWeight: status === 'active' ? 600 : 400,
        color: status === 'active' ? 'var(--text-primary)' : 'var(--text-muted)',
        textAlign: 'center',
        maxWidth: '60px',
        transition: 'all 0.3s ease'
    }),
    connector: (isCompleted) => ({
        width: '24px',
        height: '2px',
        background: isCompleted
            ? 'linear-gradient(90deg, var(--accent), var(--accent))'
            : 'var(--bg-tertiary)',
        margin: '0 0.25rem',
        marginBottom: '1.25rem',
        transition: 'all 0.3s ease',
        borderRadius: '1px'
    }),
    navigation: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '2rem',
        gap: '1rem'
    },
    navButton: (isPrimary, isDisabled) => ({
        padding: '0.75rem 2rem',
        borderRadius: '12px',
        border: isPrimary ? 'none' : '2px solid var(--border-color)',
        background: isDisabled
            ? 'var(--bg-tertiary)'
            : isPrimary
                ? 'linear-gradient(135deg, var(--accent), #7c3aed)'
                : 'transparent',
        color: isDisabled
            ? 'var(--text-muted)'
            : isPrimary
                ? 'white'
                : 'var(--text-primary)',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        fontSize: '0.9rem',
        fontWeight: 600,
        transition: 'all 0.3s ease',
        flex: isPrimary ? 2 : 1
    })
}

export default function WizardProgress({
    mode = 'poster',
    currentStep,
    onStepClick,
    onBack,
    onNext,
    canProceed = true,
    isLastStep = false,
    isGenerating = false
}) {
    const steps = STEPS[mode] || STEPS.poster
    const currentIndex = steps.findIndex(s => s.id === currentStep)

    const getStepStatus = (index) => {
        if (index < currentIndex) return 'completed'
        if (index === currentIndex) return 'active'
        return 'upcoming'
    }

    return (
        <>
            {/* Progress Indicator */}
            <div style={styles.container}>
                {steps.map((step, index) => (
                    <div key={step.id} style={styles.stepWrapper}>
                        {/* Step Circle */}
                        <div
                            style={styles.step(getStepStatus(index))}
                            onClick={() => {
                                if (index <= currentIndex && onStepClick) {
                                    onStepClick(step.id)
                                }
                            }}
                        >
                            <div style={styles.circle(getStepStatus(index))}>
                                {getStepStatus(index) === 'completed' ? '✓' : step.icon}
                            </div>
                            <span style={styles.label(getStepStatus(index))}>
                                {step.label}
                            </span>
                        </div>

                        {/* Connector line */}
                        {index < steps.length - 1 && (
                            <div style={styles.connector(index < currentIndex)} />
                        )}
                    </div>
                ))}
            </div>

            {/* Navigation Buttons */}
            <div style={styles.navigation}>
                <button
                    style={styles.navButton(false, currentIndex === 0)}
                    onClick={onBack}
                    disabled={currentIndex === 0}
                >
                    ← Back
                </button>
                <button
                    style={styles.navButton(true, !canProceed || isGenerating)}
                    onClick={onNext}
                    disabled={!canProceed || isGenerating}
                >
                    {isGenerating ? (
                        <>
                            <span className="spinner" style={{ marginRight: '0.5rem' }}></span>
                            Generating...
                        </>
                    ) : isLastStep ? (
                        '🚀 Generate'
                    ) : (
                        'Next →'
                    )}
                </button>
            </div>
        </>
    )
}

export { STEPS }
