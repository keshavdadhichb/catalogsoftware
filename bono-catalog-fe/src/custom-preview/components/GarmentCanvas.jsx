import React, { useRef, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react'
import { Application, Container, Sprite, Text, TextStyle, DisplacementFilter, Assets } from 'pixi.js'
import './GarmentCanvas.css'

const GarmentCanvas = forwardRef(({
    backgroundImage,
    displacementMap,
    text,
    fontSize,
    fontFamily,
    textColor,
    position,
    logo,
    logoScale,
    isDarkGarment,
    onTextPositionChange,
    onCanvasReady
}, ref) => {
    const containerRef = useRef(null)
    const appRef = useRef(null)
    const textSpriteRef = useRef(null)
    const logoSpriteRef = useRef(null)
    const displacementFilterRef = useRef(null)
    const containerSpriteRef = useRef(null)
    const isInitializedRef = useRef(false)

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
        getApp: () => appRef.current,
        getTextPosition: () => {
            if (textSpriteRef.current) {
                return { x: textSpriteRef.current.x, y: textSpriteRef.current.y }
            }
            return null
        },
        exportCanvas: async () => {
            if (appRef.current) {
                return await appRef.current.renderer.extract.base64(appRef.current.stage)
            }
            return null
        }
    }))

    // Initialize PixiJS Application
    useEffect(() => {
        if (!containerRef.current || isInitializedRef.current) return

        const initPixi = async () => {
            try {
                const app = new Application()
                await app.init({
                    width: 550,
                    height: 650,
                    backgroundAlpha: 0,
                    antialias: true,
                    resolution: 2,
                    autoDensity: true
                })

                containerRef.current.innerHTML = ''
                containerRef.current.appendChild(app.canvas)
                appRef.current = app
                isInitializedRef.current = true

                if (onCanvasReady) onCanvasReady()
            } catch (err) {
                console.error('Failed to initialize PixiJS:', err)
            }
        }

        initPixi()

        return () => {
            if (appRef.current) {
                appRef.current.destroy(true, { children: true })
                appRef.current = null
                isInitializedRef.current = false
            }
        }
    }, [])

    // Load background and displacement map
    useEffect(() => {
        const loadBackground = async () => {
            const app = appRef.current
            if (!app || !backgroundImage) return

            try {
                // Clear previous content
                app.stage.removeChildren()

                const container = new Container()
                app.stage.addChild(container)
                containerSpriteRef.current = container

                // Load background
                const bgTexture = await Assets.load(backgroundImage)
                const bgSprite = new Sprite(bgTexture)

                const scale = Math.min(
                    app.screen.width / bgSprite.width,
                    app.screen.height / bgSprite.height
                ) * 0.95

                bgSprite.scale.set(scale)
                bgSprite.x = (app.screen.width - bgSprite.width) / 2
                bgSprite.y = (app.screen.height - bgSprite.height) / 2
                container.addChild(bgSprite)

                // Load displacement map
                if (displacementMap) {
                    try {
                        const dispTexture = await Assets.load(displacementMap)
                        const dispSprite = new Sprite(dispTexture)
                        dispSprite.scale.set(scale)
                        dispSprite.x = bgSprite.x
                        dispSprite.y = bgSprite.y

                        const displacementFilter = new DisplacementFilter({
                            sprite: dispSprite,
                            scale: { x: 6, y: 6 }
                        })
                        displacementFilterRef.current = displacementFilter
                        dispSprite.alpha = 0
                        container.addChild(dispSprite)
                    } catch (e) {
                        console.warn('Displacement map not found')
                    }
                }

                // Create text and logo after background loads
                await createTextSprite()
                await createLogoSprite()
            } catch (err) {
                console.error('Failed to load background:', err)
            }
        }

        if (isInitializedRef.current) {
            loadBackground()
        } else {
            const interval = setInterval(() => {
                if (isInitializedRef.current) {
                    clearInterval(interval)
                    loadBackground()
                }
            }, 100)
            return () => clearInterval(interval)
        }
    }, [backgroundImage, displacementMap])

    // Create text sprite
    const createTextSprite = useCallback(async () => {
        const app = appRef.current
        const container = containerSpriteRef.current
        if (!app || !container) return

        // Remove old text
        if (textSpriteRef.current) {
            container.removeChild(textSpriteRef.current)
            textSpriteRef.current.destroy()
            textSpriteRef.current = null
        }

        if (!text) return

        const style = new TextStyle({
            fontFamily: fontFamily,
            fontSize: fontSize,
            fontWeight: 'bold',
            fill: textColor,
            letterSpacing: 2,
            align: 'center'
        })

        const textSprite = new Text({ text: text.toUpperCase(), style })
        textSprite.anchor.set(0.5)

        // Position
        const positions = {
            'front_center': { x: 0.5, y: 0.42 },
            'front_left': { x: 0.35, y: 0.28 },
            'back_center': { x: 0.5, y: 0.38 },
            'left_sleeve': { x: 0.2, y: 0.32 }
        }
        const pos = positions[position?.id] || positions['front_center']

        if (position?.customX !== undefined && position?.customY !== undefined) {
            textSprite.x = position.customX
            textSprite.y = position.customY
        } else {
            textSprite.x = app.screen.width * pos.x
            textSprite.y = app.screen.height * pos.y
        }

        // Apply effects
        if (displacementFilterRef.current) {
            textSprite.filters = [displacementFilterRef.current]
        }
        textSprite.blendMode = isDarkGarment ? 'add' : 'multiply'

        // Make draggable
        textSprite.eventMode = 'static'
        textSprite.cursor = 'grab'

        let isDragging = false
        let dragOffset = { x: 0, y: 0 }

        textSprite.on('pointerdown', (event) => {
            isDragging = true
            textSprite.cursor = 'grabbing'
            const pos = event.global
            dragOffset.x = textSprite.x - pos.x
            dragOffset.y = textSprite.y - pos.y
            textSprite.alpha = 0.8
        })

        const endDrag = () => {
            if (isDragging) {
                isDragging = false
                textSprite.cursor = 'grab'
                textSprite.alpha = 1
                if (onTextPositionChange) {
                    onTextPositionChange({ customX: textSprite.x, customY: textSprite.y })
                }
            }
        }

        textSprite.on('pointerup', endDrag)
        textSprite.on('pointerupoutside', endDrag)

        textSprite.on('pointermove', (event) => {
            if (isDragging) {
                const pos = event.global
                textSprite.x = pos.x + dragOffset.x
                textSprite.y = pos.y + dragOffset.y
            }
        })

        container.addChild(textSprite)
        textSpriteRef.current = textSprite
    }, [text, fontSize, fontFamily, textColor, position, isDarkGarment, onTextPositionChange])

    // Create logo sprite
    const createLogoSprite = useCallback(async () => {
        const app = appRef.current
        const container = containerSpriteRef.current
        if (!app || !container) return

        // Remove old logo
        if (logoSpriteRef.current) {
            container.removeChild(logoSpriteRef.current)
            logoSpriteRef.current.destroy()
            logoSpriteRef.current = null
        }

        if (!logo) return

        try {
            const logoTexture = await Assets.load(logo)
            const logoSprite = new Sprite(logoTexture)
            logoSprite.anchor.set(0.5)

            // Scale
            const baseSize = 80 * (logoScale || 1)
            const scale = baseSize / Math.max(logoSprite.width, logoSprite.height)
            logoSprite.scale.set(scale)

            // Position below text
            const textY = textSpriteRef.current?.y || app.screen.height * 0.42
            logoSprite.x = app.screen.width * 0.5
            logoSprite.y = textY + 80

            // Apply effects
            if (displacementFilterRef.current) {
                logoSprite.filters = [displacementFilterRef.current]
            }
            logoSprite.blendMode = isDarkGarment ? 'add' : 'multiply'

            // Make draggable
            logoSprite.eventMode = 'static'
            logoSprite.cursor = 'grab'

            let isDragging = false
            let dragOffset = { x: 0, y: 0 }

            logoSprite.on('pointerdown', (event) => {
                isDragging = true
                logoSprite.cursor = 'grabbing'
                const pos = event.global
                dragOffset.x = logoSprite.x - pos.x
                dragOffset.y = logoSprite.y - pos.y
                logoSprite.alpha = 0.8
            })

            const endDrag = () => {
                if (isDragging) {
                    isDragging = false
                    logoSprite.cursor = 'grab'
                    logoSprite.alpha = 1
                }
            }

            logoSprite.on('pointerup', endDrag)
            logoSprite.on('pointerupoutside', endDrag)

            logoSprite.on('pointermove', (event) => {
                if (isDragging) {
                    const pos = event.global
                    logoSprite.x = pos.x + dragOffset.x
                    logoSprite.y = pos.y + dragOffset.y
                }
            })

            container.addChild(logoSprite)
            logoSpriteRef.current = logoSprite
        } catch (e) {
            console.warn('Failed to load logo:', e)
        }
    }, [logo, logoScale, isDarkGarment])

    // Update text when props change
    useEffect(() => {
        if (containerSpriteRef.current) {
            createTextSprite()
        }
    }, [text, fontSize, fontFamily, textColor, position, isDarkGarment])

    // Update logo when props change
    useEffect(() => {
        if (containerSpriteRef.current) {
            createLogoSprite()
        }
    }, [logo, logoScale, isDarkGarment])

    return (
        <div className="garment-mockup-wrapper">
            <div
                ref={containerRef}
                className="garment-pixi-container"
            />
            <p className="drag-hint">Drag text or logo to reposition</p>
        </div>
    )
})

GarmentCanvas.displayName = 'GarmentCanvas'

export default GarmentCanvas
