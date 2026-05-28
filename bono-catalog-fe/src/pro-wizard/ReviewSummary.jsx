import React, { useState } from 'react'
import { PAGE_TYPES } from './ProductConfigurator'

export default function ReviewSummary({
    client,
    catalogName,
    catalogNumber,
    category,
    ageRange,
    theme,
    setting,
    products,
    extras,
    output,
    generationMode,
    isGenerating,
    setIsGenerating,
    generationProgress,
    setGenerationProgress,
    language
}) {
    const [error, setError] = useState(null)
    const [jobId, setJobId] = useState(null)

    // Count total pages
    const totalPages = products.reduce((acc, p) => {
        return acc + (p.pageTypes?.length || 0)
    }, 0) + 1 + (extras.includeIndex ? 1 : 0) + (extras.includePriceList ? 1 : 0) + (extras.includeThankYou ? 1 : 0)

    const handleGenerate = async () => {
        setIsGenerating(true)
        setError(null)
        setGenerationProgress(0)

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

            const formData = new FormData()

            // Basic info
            formData.append('client_name', client?.name || '')
            formData.append('catalog_name', catalogName)
            formData.append('catalog_number', catalogNumber)
            formData.append('category', category)
            formData.append('age_range', JSON.stringify(ageRange))
            formData.append('theme', theme?.id || '')
            formData.append('setting', setting?.id || '')
            formData.append('language', language)

            // Extras
            formData.append('include_index', extras.includeIndex)
            formData.append('include_price_list', extras.includePriceList)
            formData.append('include_thank_you', extras.includeThankYou)

            // Output
            formData.append('quality', output.quality)
            formData.append('aspect_ratio', output.aspectRatio)
            formData.append('output_format', output.outputFormat)
            formData.append('output_style', output.outputStyle || 'simple')

            // Generation mode
            formData.append('generation_mode', generationMode)

            // Products metadata
            formData.append('products_metadata', JSON.stringify(products.map((p, i) => ({
                index: i,
                pageTypes: p.pageTypes,
                frontPose: p.frontPose,
                backPose: p.backPose,
                keywords: p.keywords,
                price: p.price,
                logoOption: p.logoOption
            }))))

            // Product images - convert base64 to blob
            for (let i = 0; i < products.length; i++) {
                const product = products[i]

                // Front image
                if (product.frontImage) {
                    const frontBlob = await fetch(product.frontImage).then(r => r.blob())
                    formData.append('front_images', frontBlob, `product_${i}_front.png`)
                }

                // Back image
                if (product.backImage) {
                    const backBlob = await fetch(product.backImage).then(r => r.blob())
                    formData.append('back_images', backBlob, `product_${i}_back.png`)
                } else {
                    // Send placeholder for missing back
                    formData.append('back_images', new Blob(), `product_${i}_back_placeholder.png`)
                }
            }

            // Logo
            if (client?.logo) {
                const logoBlob = await fetch(client.logo).then(r => r.blob())
                formData.append('logo', logoBlob, 'logo.png')
            }

            // Select endpoint based on mode
            let endpoint;
            if (generationMode === 'true_batch') {
                endpoint = `${API_URL}/api/pro/generate-true-batch`
            } else if (generationMode === 'batch') {
                endpoint = `${API_URL}/api/pro/generate-batch`
            } else {
                endpoint = `${API_URL}/api/pro/generate-instant`
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                body: formData
            })

            if (!response.ok) {
                throw new Error(`Generation failed: ${response.statusText}`)
            }

            if (generationMode === 'true_batch') {
                const data = await response.json()
                setJobId(data.job_id)
                alert(`🎯 TRUE BATCH Job Submitted!\n\n✅ Job ID: ${data.job_id}\n💰 50% Cost Savings Applied\n⏱️ Processing: Up to 24 hours\n📧 Email notification when ready\n\nYou can close this page - we'll email you!`)
            } else if (generationMode === 'batch') {
                const data = await response.json()
                setJobId(data.job_id)
                alert(`📦 Batch Job Submitted!\n\nJob ID: ${data.job_id}\n\nUsually completes in 1-4 hours.\nYou will receive an email when it's ready.`)
            } else {
                // Instant - download the result
                const blob = await response.blob()
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `${catalogName.replace(/\s+/g, '_')}_catalog.zip`
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                URL.revokeObjectURL(url)

                alert('🎉 Catalog generated successfully! Download started.')
            }

        } catch (err) {
            console.error('Generation error:', err)
            setError(err.message)
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <div className="wizard-step">
            <div className="step-header">
                <h2>✅ Review & Generate</h2>
                <p>Confirm your catalog settings before generating</p>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                {/* Client & Catalog */}
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem' }}>CLIENT & CATALOG</div>
                    <div style={{ color: 'white', fontWeight: 600 }}>{client?.name || 'No client'}</div>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>{catalogName}</div>
                    {catalogNumber && <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>#{catalogNumber}</div>}
                </div>

                {/* Category */}
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem' }}>TARGET</div>
                    <div style={{ color: 'white', fontWeight: 600, textTransform: 'capitalize' }}>{category?.replace('_', ' ')}</div>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>{ageRange?.[0]} - {ageRange?.[1]} years</div>
                </div>

                {/* Theme & Setting */}
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem' }}>THEME & SETTING</div>
                    <div style={{ color: 'white', fontWeight: 600 }}>{theme?.icon} {theme?.name}</div>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>{setting?.icon} {setting?.name}</div>
                </div>

                {/* Products */}
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem' }}>PRODUCTS</div>
                    <div style={{ color: 'white', fontWeight: 600 }}>{products.length} Products</div>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>{totalPages} Total Pages</div>
                </div>

                {/* Output */}
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem' }}>OUTPUT</div>
                    <div style={{ color: 'white', fontWeight: 600 }}>
                        {output.outputStyle === 'layout' ? '📰 Catalog Layout' : '📷 Simple Raw'}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                        {output.quality} • {output.aspectRatio.replace('_', ' ')} • {output.outputFormat.toUpperCase()}
                    </div>
                </div>

                {/* Mode */}
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem' }}>MODE</div>
                    <div style={{ color: 'white', fontWeight: 600 }}>
                        {generationMode === 'true_batch' ? '🎯 Batch API' :
                            generationMode === 'batch' ? '📦 Background' : '⚡ Instant'}
                    </div>
                    <div style={{
                        color: generationMode === 'true_batch' ? '#2ecc71' :
                            generationMode === 'batch' ? '#3498db' : '#f39c12',
                        fontSize: '0.9rem'
                    }}>
                        {generationMode === 'true_batch' ? '50% cost savings • Up to 24h' :
                            generationMode === 'batch' ? 'Standard processing' : 'Rush processing'}
                    </div>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    background: 'rgba(231, 76, 60, 0.2)',
                    border: '1px solid rgba(231, 76, 60, 0.5)',
                    borderRadius: '10px',
                    color: '#e74c3c'
                }}>
                    ❌ {error}
                </div>
            )}

            {/* Job Submitted */}
            {jobId && (
                <div style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    background: 'rgba(46, 204, 113, 0.2)',
                    border: '1px solid rgba(46, 204, 113, 0.5)',
                    borderRadius: '10px',
                    color: '#2ecc71'
                }}>
                    ✅ Job submitted! ID: {jobId}
                    <br />
                    <small>Check your email or the dashboard for updates.</small>
                </div>
            )}

            {/* Generate Button */}
            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                <button
                    className="btn-next"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    style={{
                        padding: '1.25rem 3rem',
                        fontSize: '1.1rem',
                        background: isGenerating
                            ? 'rgba(255,255,255,0.2)'
                            : 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)'
                    }}
                >
                    {isGenerating
                        ? '⏳ Generating...'
                        : generationMode === 'batch'
                            ? '📦 Submit Batch Job'
                            : '⚡ Generate Now'}
                </button>

                {isGenerating && (
                    <div style={{ marginTop: '1rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                        {generationMode === 'batch'
                            ? 'Submitting to queue...'
                            : 'This may take a few minutes...'}
                    </div>
                )}
            </div>
        </div>
    )
}
