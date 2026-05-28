import React, { useState, useCallback, useRef } from 'react'
import './CustomPreviewApp.css'
import GarmentCanvas from './components/GarmentCanvas'
import TextEditor from './components/TextEditor'
import ColorPicker from './components/ColorPicker'
import PositionPicker from './components/PositionPicker'
import LogoUploader from './components/LogoUploader'
import ModelPreview from './components/ModelPreview'

// Import all mockup images
import hoodieBlack from './assets/hoodie_black.png'
import hoodieWhite from './assets/hoodie_white.png'
import hoodieRed from './assets/hoodie_red.png'
import tshirtBlack from './assets/tshirt_black.png'
import tshirtWhite from './assets/tshirt_white.png'
import tshirtRed from './assets/tshirt_red.png'

// Import displacement maps
import hoodieMap from './assets/hoodie_map.png'
import tshirtMap from './assets/tshirt_map.png'

// Import model images
import modelMale from './assets/model_male.png'
import modelFemale from './assets/model_female.png'

// Define available garments and colors with specific images
const GARMENT_IMAGES = {
    hoodie: {
        black: hoodieBlack,
        white: hoodieWhite,
        red: hoodieRed
    },
    tshirt: {
        black: tshirtBlack,
        white: tshirtWhite,
        red: tshirtRed
    }
}

// Displacement maps per garment type
const DISPLACEMENT_MAPS = {
    hoodie: hoodieMap,
    tshirt: tshirtMap
}

// Model images
const MODEL_IMAGES = {
    male: modelMale,
    female: modelFemale
}

const POSITIONS = [
    { id: 'front_center', name: 'Front Center', x: 50, y: 40 },
    { id: 'front_left', name: 'Left Chest', x: 30, y: 25 },
    { id: 'back_center', name: 'Back Center', x: 50, y: 40 },
    { id: 'left_sleeve', name: 'Left Sleeve', x: 15, y: 35 }
]

export default function CustomPreviewApp() {
    const canvasRef = useRef(null)

    // State
    const [garmentType, setGarmentType] = useState('hoodie')
    const [color, setColor] = useState('black')
    const [customText, setCustomText] = useState('')
    const [fontSize, setFontSize] = useState(42)
    const [fontFamily, setFontFamily] = useState('Impact')
    const [textColor, setTextColor] = useState('#FFFFFF')
    const [position, setPosition] = useState({ id: 'front_center' })
    const [logo, setLogo] = useState(null)
    const [logoScale, setLogoScale] = useState(1)

    // Modal states
    const [showModelPreview, setShowModelPreview] = useState(false)
    const [selectedModel, setSelectedModel] = useState('male')

    // AI Poster generation states
    const [isGeneratingPoster, setIsGeneratingPoster] = useState(false)
    const [generatedPoster, setGeneratedPoster] = useState(null)
    const [posterError, setPosterError] = useState(null)
    const [posterTheme, setPosterTheme] = useState('streetwear')

    // Get current garment image based on type and color
    const getCurrentImage = useCallback(() => {
        return GARMENT_IMAGES[garmentType][color]
    }, [garmentType, color])

    // Get displacement map for current garment
    const getCurrentDisplacementMap = useCallback(() => {
        return DISPLACEMENT_MAPS[garmentType]
    }, [garmentType])

    // Handle logo upload
    const handleLogoUpload = (file) => {
        if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
                setLogo(e.target.result)
            }
            reader.readAsDataURL(file)
        }
    }

    // Handle position change from picker
    const handlePositionChange = (posId) => {
        const pos = POSITIONS.find(p => p.id === posId)
        setPosition({ id: posId, ...pos })
    }

    // Handle text drag position update
    const handleTextPositionChange = (newPos) => {
        setPosition(prev => ({
            ...prev,
            customX: newPos.customX,
            customY: newPos.customY
        }))
    }

    // Handle download preview
    const handleDownload = async () => {
        if (canvasRef.current) {
            try {
                const base64 = await canvasRef.current.exportCanvas()
                if (base64) {
                    // Create download link
                    const link = document.createElement('a')
                    link.download = `custom-design-${customText || 'preview'}.png`
                    link.href = base64
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                }
            } catch (error) {
                console.error('Download failed:', error)
                alert('Failed to download. Please try again.')
            }
        }
    }

    // Handle AI poster generation
    const handleGeneratePoster = async () => {
        if (!customText.trim() && !logo) {
            alert('Please add text or logo first')
            return
        }

        setIsGeneratingPoster(true)
        setPosterError(null)
        setGeneratedPoster(null)

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

            const response = await fetch(`${API_URL}/api/custom-preview/generate-poster`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    garment_type: garmentType,
                    color: color,
                    text: customText || 'STREETWEAR',
                    font_style: fontFamily.toLowerCase().includes('script') ? 'script' : 'bold',
                    text_color: textColor,
                    logo_base64: logo || null,
                    theme: posterTheme
                })
            })

            const data = await response.json()

            if (data.success && data.image_base64) {
                setGeneratedPoster(data.image_base64)
            } else {
                setPosterError(data.error || 'Failed to generate poster')
            }
        } catch (error) {
            console.error('Poster generation failed:', error)
            setPosterError(error.message || 'Network error')
        } finally {
            setIsGeneratingPoster(false)
        }
    }

    // Download generated poster
    const handleDownloadPoster = () => {
        if (generatedPoster) {
            const link = document.createElement('a')
            link.download = `ai-poster-${customText || 'design'}.png`
            link.href = generatedPoster
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        }
    }

    // Determine if garment is dark (for text blend mode)
    const isDarkGarment = color === 'black' || color === 'red'

    return (
        <div className="custom-preview-app">
            <header className="preview-header">
                <h1>Custom Design Preview</h1>
                <p>Real-time text-on-fabric visualization</p>
            </header>

            <div className="preview-container">
                {/* Left: Canvas Preview */}
                <div className="canvas-section">
                    <GarmentCanvas
                        ref={canvasRef}
                        backgroundImage={getCurrentImage()}
                        displacementMap={getCurrentDisplacementMap()}
                        text={customText}
                        fontSize={fontSize}
                        fontFamily={fontFamily}
                        textColor={textColor}
                        position={position}
                        logo={logo}
                        logoScale={logoScale}
                        isDarkGarment={isDarkGarment}
                        onTextPositionChange={handleTextPositionChange}
                    />
                </div>

                {/* Right: Controls */}
                <div className="controls-section">
                    {/* Garment Type */}
                    <div className="control-group">
                        <label>Garment Type</label>
                        <div className="garment-selector">
                            <button
                                className={garmentType === 'hoodie' ? 'active' : ''}
                                onClick={() => setGarmentType('hoodie')}
                            >
                                Hoodie
                            </button>
                            <button
                                className={garmentType === 'tshirt' ? 'active' : ''}
                                onClick={() => setGarmentType('tshirt')}
                            >
                                T-Shirt
                            </button>
                        </div>
                    </div>

                    {/* Color Picker */}
                    <ColorPicker
                        selectedColor={color}
                        onColorChange={setColor}
                    />

                    {/* Position Picker */}
                    <PositionPicker
                        positions={POSITIONS}
                        selectedPosition={position.id}
                        onPositionChange={handlePositionChange}
                    />

                    {/* Text Editor */}
                    <TextEditor
                        text={customText}
                        onTextChange={setCustomText}
                        fontSize={fontSize}
                        onFontSizeChange={setFontSize}
                        fontFamily={fontFamily}
                        onFontFamilyChange={setFontFamily}
                        textColor={textColor}
                        onTextColorChange={setTextColor}
                    />

                    {/* Logo Uploader */}
                    <LogoUploader
                        logo={logo}
                        onLogoUpload={handleLogoUpload}
                        onLogoRemove={() => setLogo(null)}
                        logoScale={logoScale}
                        onLogoScaleChange={setLogoScale}
                    />

                    {/* Poster Theme Selector */}
                    <div className="poster-theme-section">
                        <label>AI Poster Style</label>
                        <select
                            value={posterTheme}
                            onChange={(e) => setPosterTheme(e.target.value)}
                            className="theme-select"
                        >
                            <option value="streetwear">Streetwear</option>
                            <option value="minimal">Minimal</option>
                            <option value="luxury">Luxury</option>
                            <option value="urban">Urban Night</option>
                        </select>
                    </div>

                    {/* Action Buttons */}
                    <div className="action-buttons">
                        <button
                            className="btn-model"
                            onClick={() => setShowModelPreview(true)}
                            disabled={!customText.trim() && !logo}
                        >
                            See on Model
                        </button>
                        <button
                            className="btn-download"
                            onClick={handleDownload}
                            disabled={!customText.trim() && !logo}
                        >
                            Download Preview
                        </button>
                        <button
                            className="btn-ai-poster"
                            onClick={handleGeneratePoster}
                            disabled={(!customText.trim() && !logo) || isGeneratingPoster}
                        >
                            {isGeneratingPoster ? '🎨 Generating...' : '✨ Generate AI Poster'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Model Preview Modal */}
            {showModelPreview && (
                <ModelPreview
                    modelImage={MODEL_IMAGES[selectedModel]}
                    displacementMap={hoodieMap}
                    text={customText}
                    fontSize={fontSize}
                    fontFamily={fontFamily}
                    textColor={textColor}
                    position={position}
                    logo={logo}
                    logoScale={logoScale}
                    isDarkGarment={false}
                    selectedModel={selectedModel}
                    onModelChange={setSelectedModel}
                    onClose={() => setShowModelPreview(false)}
                    canvasWidth={550}
                    canvasHeight={650}
                />
            )}

            {/* AI Poster Modal */}
            {(generatedPoster || isGeneratingPoster || posterError) && (
                <div className="poster-modal-overlay" onClick={() => !isGeneratingPoster && setGeneratedPoster(null)}>
                    <div className="poster-modal" onClick={e => e.stopPropagation()}>
                        <button className="close-btn" onClick={() => {
                            setGeneratedPoster(null)
                            setPosterError(null)
                        }}>×</button>

                        <h2>✨ AI Generated Poster</h2>

                        {isGeneratingPoster && (
                            <div className="poster-loading">
                                <div className="spinner"></div>
                                <p>Creating your poster with AI magic...</p>
                                <p className="hint">This may take 30-60 seconds</p>
                            </div>
                        )}

                        {posterError && (
                            <div className="poster-error">
                                <p>❌ {posterError}</p>
                                <button onClick={handleGeneratePoster}>Try Again</button>
                            </div>
                        )}

                        {generatedPoster && (
                            <div className="poster-result">
                                <img src={generatedPoster} alt="AI Generated Poster" />
                                <div className="poster-actions">
                                    <button className="btn-download-poster" onClick={handleDownloadPoster}>
                                        📥 Download Poster
                                    </button>
                                    <button className="btn-regenerate" onClick={handleGeneratePoster}>
                                        🔄 Generate New
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
