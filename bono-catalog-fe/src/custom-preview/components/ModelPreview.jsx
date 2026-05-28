import React, { useRef, useEffect } from 'react'
import { Application, Container, Sprite, Text, TextStyle, DisplacementFilter, Assets } from 'pixi.js'
import './ModelPreview.css'

export default function ModelPreview({
    modelImage,
    displacementMap,
    text,
    fontSize,
    fontFamily,
    textColor,
    position,
    logo,
    logoScale,
    isDarkGarment,
    selectedModel,
    onModelChange,
    onClose,
    canvasWidth = 550,
    canvasHeight = 650
}) {
    const containerRef = useRef(null)
    const appRef = useRef(null)

    // Model canvas dimensions
    const MODEL_WIDTH = 500
    const MODEL_HEIGHT = 600

    useEffect(() => {
        if (!containerRef.current) return

        const initPixi = async () => {
            const app = new Application()
            await app.init({
                width: MODEL_WIDTH,
                height: MODEL_HEIGHT,
                backgroundAlpha: 0,
                antialias: true,
                resolution: window.devicePixelRatio || 1,
                autoDensity: true
            })

            containerRef.current.innerHTML = ''
            containerRef.current.appendChild(app.canvas)
            appRef.current = app

            await loadScene(app)
        }

        initPixi()

        return () => {
            if (appRef.current) {
                appRef.current.destroy(true)
                appRef.current = null
            }
        }
    }, [modelImage])

    const loadScene = async (app) => {
        if (!modelImage) return

        app.stage.removeChildren()

        const container = new Container()
        app.stage.addChild(container)

        // Load model image
        const modelTexture = await Assets.load(modelImage)
        const modelSprite = new Sprite(modelTexture)

        const scale = Math.min(
            app.screen.width / modelSprite.width,
            app.screen.height / modelSprite.height
        )
        modelSprite.scale.set(scale * 0.95)
        modelSprite.x = (app.screen.width - modelSprite.width) / 2
        modelSprite.y = (app.screen.height - modelSprite.height) / 2
        container.addChild(modelSprite)

        // Load displacement map for hoodie on model
        let displacementFilter = null
        if (displacementMap) {
            try {
                const dispTexture = await Assets.load(displacementMap)
                const dispSprite = new Sprite(dispTexture)
                dispSprite.scale.set(scale * 0.6)
                dispSprite.x = app.screen.width * 0.2
                dispSprite.y = app.screen.height * 0.15

                displacementFilter = new DisplacementFilter({
                    sprite: dispSprite,
                    scale: { x: 6, y: 6 }
                })

                dispSprite.alpha = 0
                container.addChild(dispSprite)
            } catch (e) {
                console.warn('Displacement map not loaded:', e)
            }
        }

        // Calculate text position - scale from main canvas to model canvas
        // Model's chest area is roughly at y: 0.35-0.55 of the canvas
        let textX = app.screen.width * 0.5
        let textY = app.screen.height * 0.42

        if (position?.customX !== undefined && position?.customY !== undefined) {
            // Scale the position from main canvas to model canvas
            const scaleX = MODEL_WIDTH / canvasWidth
            const scaleY = MODEL_HEIGHT / canvasHeight

            // Offset to account for model's body position (chest area)
            textX = position.customX * scaleX
            textY = position.customY * scaleY
        }

        let textBottomY = textY

        // Add text on the model's hoodie
        if (text) {
            const style = new TextStyle({
                fontFamily: fontFamily,
                fontSize: fontSize * 0.85,
                fontWeight: 'bold',
                fill: textColor,
                letterSpacing: 2,
                align: 'center'
            })

            const textSprite = new Text({ text: text.toUpperCase(), style })
            textSprite.anchor.set(0.5)

            // Position text based on user's position
            textSprite.x = textX
            textSprite.y = textY

            if (displacementFilter) {
                textSprite.filters = [displacementFilter]
            }

            textSprite.blendMode = isDarkGarment ? 'add' : 'multiply'
            container.addChild(textSprite)

            textBottomY = textSprite.y + fontSize * 0.5
        }

        // Add logo below text
        if (logo) {
            try {
                const logoTexture = await Assets.load(logo)
                const logoSprite = new Sprite(logoTexture)
                logoSprite.anchor.set(0.5)

                // Scale the logo
                const baseSize = 70 * (logoScale || 1)
                const logoSpriteScale = baseSize / Math.max(logoSprite.width, logoSprite.height)
                logoSprite.scale.set(logoSpriteScale)

                // Position below text or at user's position
                logoSprite.x = textX
                logoSprite.y = textBottomY + 30

                if (displacementFilter) {
                    logoSprite.filters = [displacementFilter]
                }

                logoSprite.blendMode = isDarkGarment ? 'add' : 'multiply'
                container.addChild(logoSprite)
            } catch (e) {
                console.warn('Failed to load logo on model:', e)
            }
        }
    }

    // Reload when text/logo/position changes
    useEffect(() => {
        if (appRef.current) {
            loadScene(appRef.current)
        }
    }, [text, fontSize, fontFamily, textColor, position, logo, logoScale])

    return (
        <div className="model-preview-overlay" onClick={onClose}>
            <div className="model-preview-modal" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>×</button>
                <h2>See on Model</h2>

                {/* Model Selector */}
                <div className="model-selector">
                    <button
                        className={selectedModel === 'male' ? 'active' : ''}
                        onClick={() => onModelChange('male')}
                    >
                        Male
                    </button>
                    <button
                        className={selectedModel === 'female' ? 'active' : ''}
                        onClick={() => onModelChange('female')}
                    >
                        Female
                    </button>
                </div>

                {/* PixiJS Canvas */}
                <div ref={containerRef} className="model-canvas-container" />
            </div>
        </div>
    )
}
