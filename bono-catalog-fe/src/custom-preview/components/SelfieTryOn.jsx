import React, { useRef, useEffect, useState, useCallback } from 'react'
import './SelfieTryOn.css'

export default function SelfieTryOn({
    text,
    fontSize,
    fontFamily,
    textColor,
    garmentType,
    garmentColor,
    onClose
}) {
    const videoRef = useRef(null)
    const canvasRef = useRef(null)
    const [stream, setStream] = useState(null)
    const [capturedImage, setCapturedImage] = useState(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const [processedImage, setProcessedImage] = useState(null)
    const [error, setError] = useState(null)
    const [cameraReady, setCameraReady] = useState(false)

    // Start camera on mount
    useEffect(() => {
        startCamera()
        return () => {
            stopCamera()
        }
    }, [])

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user',
                    width: { ideal: 720 },
                    height: { ideal: 960 }
                }
            })
            setStream(mediaStream)
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream
                videoRef.current.onloadedmetadata = () => {
                    setCameraReady(true)
                }
            }
        } catch (err) {
            console.error('Camera access denied:', err)
            setError('Camera access denied. Please allow camera permissions.')
        }
    }

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop())
            setStream(null)
        }
    }

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return

        const video = videoRef.current
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')

        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        // Flip horizontally for selfie (mirror effect)
        ctx.translate(canvas.width, 0)
        ctx.scale(-1, 1)
        ctx.drawImage(video, 0, 0)
        ctx.setTransform(1, 0, 0, 1, 0, 0)

        const imageData = canvas.toDataURL('image/jpeg', 0.9)
        setCapturedImage(imageData)
        stopCamera()
    }

    const retakePhoto = () => {
        setCapturedImage(null)
        setProcessedImage(null)
        startCamera()
    }

    const processTryOn = async () => {
        if (!capturedImage) return

        setIsProcessing(true)
        setError(null)

        try {
            const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

            const response = await fetch(`${API_BASE}/api/custom-preview/selfie-tryon`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    selfie_base64: capturedImage,
                    text: text,
                    font_style: fontFamily === 'Impact' ? 'bold' : 'minimalist',
                    text_color: textColor,
                    garment_type: garmentType,
                    garment_color: garmentColor
                })
            })

            const data = await response.json()

            if (data.success && data.image_base64) {
                setProcessedImage(data.image_base64)
            } else {
                // Check for model limitation error
                if (data.error && data.error.includes('response modalities')) {
                    setError('AI Try-On requires Gemini Imagen model. This feature is not yet available with your current API setup.')
                } else {
                    setError(data.error || 'Failed to process try-on')
                }
            }
        } catch (err) {
            console.error('Try-on error:', err)
            setError('Network error. Please try again.')
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <div className="selfie-tryon-overlay" onClick={onClose}>
            <div className="selfie-tryon-modal" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>×</button>
                <h2>Virtual Try-On</h2>
                <p className="tryon-subtitle">Take a selfie to see yourself wearing the design</p>

                {error && (
                    <div className="tryon-error">{error}</div>
                )}

                <div className="tryon-content">
                    {/* Camera / Captured / Processed View */}
                    <div className="tryon-preview">
                        {!capturedImage && (
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="camera-preview"
                            />
                        )}

                        {capturedImage && !processedImage && (
                            <img
                                src={capturedImage}
                                alt="Captured selfie"
                                className="captured-preview"
                            />
                        )}

                        {processedImage && (
                            <img
                                src={processedImage}
                                alt="Virtual try-on result"
                                className="result-preview"
                            />
                        )}
                    </div>

                    {/* Hidden canvas for capture */}
                    <canvas ref={canvasRef} style={{ display: 'none' }} />

                    {/* Action Buttons */}
                    <div className="tryon-actions">
                        {!capturedImage && (
                            <button
                                className="btn-capture"
                                onClick={capturePhoto}
                                disabled={!cameraReady}
                            >
                                {cameraReady ? 'Take Photo' : 'Starting camera...'}
                            </button>
                        )}

                        {capturedImage && !processedImage && (
                            <>
                                <button
                                    className="btn-process"
                                    onClick={processTryOn}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? 'Processing...' : 'Try On Design'}
                                </button>
                                <button
                                    className="btn-retake"
                                    onClick={retakePhoto}
                                    disabled={isProcessing}
                                >
                                    Retake
                                </button>
                            </>
                        )}

                        {processedImage && (
                            <>
                                <a
                                    href={processedImage}
                                    download={`tryon-${Date.now()}.png`}
                                    className="btn-download-tryon"
                                >
                                    Download
                                </a>
                                <button
                                    className="btn-retake"
                                    onClick={retakePhoto}
                                >
                                    Try Again
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <p className="tryon-note">
                    AI processing uses Gemini Vision (~₹2-3 per try-on)
                </p>
            </div>
        </div>
    )
}
