import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import JSZip from 'jszip'
import UploadForm from './components/UploadForm'
import CategorySelector from './components/CategorySelector'
import ModelDescription from './components/ModelDescription'
import ShotAndPose from './components/ShotAndPose'
import CreativeDirection from './components/CreativeDirection'
import MarketingOptions from './components/MarketingOptions'
import CatalogForm from './components/CatalogForm'
import GenerationProgress from './components/GenerationProgress'
import QualitySelector from './components/QualitySelector'
import ProcessingModeSelector from './components/ProcessingModeSelector'
import PoseSelector from './components/PoseSelector'
import VideoPreview from './components/VideoPreview'
import BottomsCatalogForm from './components/BottomsCatalogForm'
import './components/BottomsCatalogForm.css'
import PasswordProtection from './components/PasswordProtection'
import { getFriendlyErrorMessage, getLoadingMessage } from './utils/errorMessages'

// Animation variants for form sections
const sectionVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
};

const sectionTransition = {
    duration: 0.3,
    ease: 'easeOut'
};

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return localStorage.getItem('bono_app_auth') === 'true';
    });

    // Generation mode: "photo", "poster", "catalog", or "bottoms-catalog"
    const [generationMode, setGenerationMode] = useState('photo')

    // Form state
    const [category, setCategory] = useState('teen_boy')
    const [brandName, setBrandName] = useState('')
    const [fabricDescription, setFabricDescription] = useState('')
    const [creativeDirection, setCreativeDirection] = useState('')
    const [products, setProducts] = useState([])

    // Model description
    const [skinTone, setSkinTone] = useState('fair')
    const [hairType, setHairType] = useState('short black hair')
    const [bodyType, setBodyType] = useState('')

    // Shot and pose (shared between modes)
    const [shotAngle, setShotAngle] = useState('front_facing')
    const [poseType, setPoseType] = useState('catalog_standard')
    const [fitType, setFitType] = useState('regular')

    // Marketing options (poster mode)
    const [marketingTheme, setMarketingTheme] = useState('studio_minimal')
    const [prop, setProp] = useState('none')
    const [layoutStyle, setLayoutStyle] = useState('hero_bottom')

    // Text fields for poster (all optional, shown based on layout)
    const [headline, setHeadline] = useState('')
    const [subtext, setSubtext] = useState('')
    const [brand, setBrand] = useState('')
    const [price, setPrice] = useState('')
    const [cta, setCta] = useState('')
    const [tagline, setTagline] = useState('')
    const [logo, setLogo] = useState(null)

    // Catalog mode state
    const [collectionName, setCollectionName] = useState('')
    const [collectionNumber, setCollectionNumber] = useState('')
    const [catalogTheme, setCatalogTheme] = useState('studio_minimal')
    const [catalogTextFields, setCatalogTextFields] = useState({})

    // Quality selection
    const [imageQuality, setImageQuality] = useState('4K')

    // Processing mode: "instant" or "batch"
    const [processingMode, setProcessingMode] = useState('instant')
    const [batchJobId, setBatchJobId] = useState(null)

    // Generation state
    const [jobId, setJobId] = useState(null)
    const [jobStatus, setJobStatus] = useState(null)
    const [isGenerating, setIsGenerating] = useState(false)
    const [loadingStep, setLoadingStep] = useState('') // For contextual loading messages

    // Mobile panel state
    const [isMobileCollapsed, setIsMobileCollapsed] = useState(false)

    // Pose variation state
    const [currentPose, setCurrentPose] = useState('catalog_standard')
    const [isRegenerating, setIsRegenerating] = useState(false)
    const [lastGeneratedImage, setLastGeneratedImage] = useState(null)
    const [lastGeneratedBlob, setLastGeneratedBlob] = useState(null)

    // Video generation state
    const [isVideoGenerating, setIsVideoGenerating] = useState(false)
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState(null)
    const [videoError, setVideoError] = useState(null)

    const handleAddProduct = useCallback((frontImage, backImage) => {
        setProducts(prev => [...prev, {
            id: Date.now(),
            frontImage,
            backImage,
            frontPreview: URL.createObjectURL(frontImage),
            backPreview: URL.createObjectURL(backImage),
            views: { front: true, back: true, detail: false } // Default views
        }])
    }, [])

    const handleUpdateProduct = useCallback((id, updates) => {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
    }, [])

    const handleRemoveProduct = useCallback((id) => {
        setProducts(prev => prev.filter(p => p.id !== id))
    }, [])

    const handleLogoUpload = (e) => {
        const file = e.target.files?.[0]
        if (file) {
            setLogo(file)
        }
    }

    const handleSubmit = async () => {
        // Validate based on mode
        if (generationMode === 'catalog') {
            if (!collectionName || products.length === 0) {
                alert('Please enter collection name and add at least one product')
                return
            }
        } else {
            if (!brandName || products.length === 0) {
                alert('Please enter brand name and add at least one product')
                return
            }
        }

        setIsGenerating(true)
        setLoadingStep('uploading')
        const pageCount = generationMode === 'catalog' ? (2 + products.length * 2) : products.length * 2

        // Different message for batch mode
        if (processingMode === 'batch' && generationMode === 'catalog') {
            setJobStatus({ status: 'generating', message: getLoadingMessage('uploading') })
        } else {
            const steps = ['uploading', 'processing', 'generating_front', 'generating_back', 'upscaling', 'creating_zip']
            const nextStep = steps[0]
            setJobStatus({ status: 'generating', message: getLoadingMessage(nextStep, { productNum: 1, totalProducts: products.length }) })
        }

        // Simulate progress steps for better UX
        const progressInterval = setInterval(() => {
            setLoadingStep(prev => {
                const steps = ['uploading', 'processing', 'generating_front', 'generating_back', 'upscaling', 'creating_zip']
                const currentIndex = steps.indexOf(prev)
                const nextIndex = (currentIndex + 1) % steps.length
                const nextStep = steps[nextIndex]
                setJobStatus({
                    status: 'generating',
                    message: getLoadingMessage(nextStep, { productNum: 1, totalProducts: products.length })
                })
                return nextStep
            })
        }, 8000) // Every 8 seconds, advance to next step

        try {
            const formData = new FormData()

            // Common fields for all modes
            formData.append('category', category)
            formData.append('skin_tone', skinTone)
            formData.append('body_type', bodyType)
            formData.append('image_quality', imageQuality)
            formData.append('fit_type', fitType)

            // Add products
            products.forEach(p => {
                formData.append('front_images', p.frontImage)
                if (p.backImage) {
                    formData.append('back_images', p.backImage)
                }
            })

            // Add products metadata (for view selection, theme, layout)
            const productsMetadata = products.map((p, idx) => ({
                index: idx,
                id: p.id,
                views: p.views || { front: true, back: !p.backImage ? false : true, detail: false },
                theme: p.theme || 'default',
                layout: p.layout || 'smart_auto'
            }))
            formData.append('products_metadata', JSON.stringify(productsMetadata))

            let endpoint = '/api/generate'

            if (generationMode === 'catalog') {
                // Check if batch mode
                if (processingMode === 'batch') {
                    endpoint = '/api/batch/submit-catalog'
                } else {
                    endpoint = '/api/generate-catalog'
                }
                formData.append('collection_name', collectionName)
                formData.append('collection_number', collectionNumber)
                formData.append('theme', catalogTheme)
                // Text fields
                formData.append('text_tagline', catalogTextFields.tagline || '')
                formData.append('text_season', catalogTextFields.season || '')
                formData.append('text_year', catalogTextFields.year || '')
                formData.append('text_price_range', catalogTextFields.price_range || '')
                formData.append('text_fabric', catalogTextFields.fabric || '')
                formData.append('text_brand_message', catalogTextFields.brand_message || '')
                formData.append('text_custom_1', catalogTextFields.custom_1 || '')
                formData.append('text_custom_2', catalogTextFields.custom_2 || '')
                formData.append('text_custom_3', catalogTextFields.custom_3 || '')
                formData.append('text_custom_4', catalogTextFields.custom_4 || '')
                if (logo) {
                    formData.append('logo', logo)
                }
            } else {
                // Photo, Poster, and Close-up modes
                formData.append('brand_name', brandName)
                formData.append('generation_mode', generationMode)

                if (generationMode === 'photo') {
                    formData.append('hair_type', hairType)
                    formData.append('shot_angle', shotAngle)
                    formData.append('pose_type', poseType)
                    formData.append('creative_direction', creativeDirection)
                } else if (generationMode === 'fabric-close-up' || generationMode === 'hero-close-up') {
                    formData.append('marketing_theme', marketingTheme)
                    if (generationMode === 'fabric-close-up') {
                        formData.append('fabric_description', fabricDescription)
                    }
                } else {
                    formData.append('hair_type', hairType)
                    formData.append('shot_angle', shotAngle)
                    formData.append('pose_type', poseType)
                    formData.append('marketing_theme', marketingTheme)
                    formData.append('prop', prop)
                    formData.append('layout_style', layoutStyle)
                    formData.append('headline', headline)
                    formData.append('subtext', subtext)
                    formData.append('brand_text', brand || brandName)
                    formData.append('price', price)
                    formData.append('cta', cta)
                    formData.append('tagline', tagline)
                    if (logo) {
                        formData.append('logo', logo)
                    }
                }
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                body: formData
            })

            // Debug: log response info
            const contentType = response.headers.get('content-type')
            console.log('Response status:', response.status)
            console.log('Content-Type:', contentType)
            console.log('Content-Length:', response.headers.get('content-length'))

            if (!response.ok) {
                // Try to get error message
                let errorMsg = 'Generation failed'
                try {
                    const text = await response.text()
                    console.log('Error response:', text.substring(0, 500))
                    try {
                        const err = JSON.parse(text)
                        errorMsg = err.detail || errorMsg
                    } catch {
                        errorMsg = text.substring(0, 200) || `Server error: ${response.status}`
                    }
                } catch {
                    errorMsg = `Server error: ${response.status}`
                }
                throw new Error(errorMsg)
            }

            // Handle batch mode response differently
            if (processingMode === 'batch' && generationMode === 'catalog') {
                // Batch mode returns JSON with job ID
                const result = await response.json()
                console.log('Batch job submitted:', result)

                setBatchJobId(result.job_id)
                setJobStatus({
                    status: 'batch_submitted',
                    message: `Batch job submitted! Job ID: ${result.job_id}\n\n${result.message}\n\nEstimated time: ${result.estimated_time}\n\nCheck status at: /api/batch/status/${result.job_id}`
                })
                setIsGenerating(false)
                return
            }

            // Check if response is actually a ZIP (instant mode)
            if (!contentType || !contentType.includes('application/zip')) {
                // Response is not a ZIP - it might be an error page
                const text = await response.text()
                console.error('Expected ZIP but got:', contentType)
                console.error('Response body:', text.substring(0, 500))
                throw new Error(`Server returned ${contentType || 'unknown'} instead of ZIP. Check console for details.`)
            }

            // Response is a ZIP file blob
            const blob = await response.blob()
            console.log('Blob size:', blob.size, 'type:', blob.type)

            // Create download link
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = generationMode === 'catalog'
                ? `${collectionName}_catalog.zip`
                : `${brandName}_${
                    generationMode === 'poster' ? 'posters' :
                    generationMode === 'fabric-close-up' ? 'fabric_closeups' :
                    generationMode === 'hero-close-up' ? 'hero_closeups' : 'photos'
                  }.zip`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            // DON'T revoke yet so we can use it for display/video extraction
            // window.URL.revokeObjectURL(url)

            setJobStatus({ status: 'completed', message: 'Download complete!' })
            setIsGenerating(false)
            setLoadingStep('')
            clearInterval(progressInterval)
            // Store last generated for pose variations and video (blob URL for display)
            setLastGeneratedImage(url)
            setLastGeneratedBlob(blob)

        } catch (error) {
            console.error('Generation error:', error)
            const friendlyMessage = getFriendlyErrorMessage(error, 'Generation failed')
            setJobStatus({ status: 'failed', message: friendlyMessage })
            setIsGenerating(false)
            setLoadingStep('')
            clearInterval(progressInterval)
        }
    }

    const handleReset = useCallback(() => {
        if (lastGeneratedImage) {
            window.URL.revokeObjectURL(lastGeneratedImage)
        }
        if (generatedVideoUrl) {
            window.URL.revokeObjectURL(generatedVideoUrl)
        }
        setJobId(null)
        setJobStatus(null)
        setIsGenerating(false)
        setProducts([])
        setBrandName('')
        setCollectionName('')
        setLastGeneratedImage(null)
        setLastGeneratedBlob(null)
        setGeneratedVideoUrl(null)
        setVideoError(null)
    }, [lastGeneratedImage, generatedVideoUrl])

    const handleGenerateVideo = async (effect = 'snap') => {
        if (!lastGeneratedBlob) return;

        setIsVideoGenerating(true);
        setVideoError(null);

        try {
            // Step 1: Extract first image from ZIP
            const zip = new JSZip();
            const contents = await zip.loadAsync(lastGeneratedBlob);

            // Find first PNG/JPG file
            const firstFileName = Object.keys(contents.files).find(name =>
                name.toLowerCase().endsWith('.png') || name.toLowerCase().endsWith('.jpg')
            );

            if (!firstFileName) throw new Error("Could not find any images in the generated package");

            const imageBlob = await contents.files[firstFileName].async('blob');

            // Step 2: Send to backend
            const formData = new FormData();
            formData.append('image', imageBlob);
            formData.append('product_desc', brandName || collectionName || "New collection piece");
            formData.append('effect', effect);
            formData.append('model_type', 'fast'); // Default to fast for better UX

            const response = await fetch('/api/generate-video', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Video generation failed');
            }

            const videoBlob = await response.blob();
            const videoUrl = window.URL.createObjectURL(videoBlob);
            setGeneratedVideoUrl(videoUrl);

        } catch (err) {
            console.error('Video generation error:', err);
            setVideoError(err.message);
        } finally {
            setIsVideoGenerating(false);
        }
    };
    const isFormValid = generationMode === 'catalog'
        ? (collectionName && products.length > 0)
        : (brandName && products.length > 0)

    if (!isAuthenticated) {
        return <PasswordProtection onSuccess={() => setIsAuthenticated(true)} />
    }

    return (
        <div className="app">
            <header className="header">
                <div className="header-content">
                    <div className="logo">
                        <div className="logo-icon">B</div>
                        <span className="logo-text">Bono</span>
                    </div>
                    <div style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                        Catalog Generator
                    </div>
                </div>
            </header>

            <main className="main-content">
                <div className="hero">
                    <h1>
                        {generationMode === 'catalog'
                            ? 'Master Catalog'
                            : generationMode === 'poster'
                                ? 'Marketing Poster'
                                : generationMode === 'bottoms-catalog'
                                    ? '👶 Baby Bottoms Catalog'
                                    : 'Model Photo'} Generation
                    </h1>
                    <p>
                        {generationMode === 'catalog'
                            ? 'Generate a complete product catalog with cover, product pages, and thank you page.'
                            : generationMode === 'poster'
                                ? 'Create complete marketing posters with themes, props, and typography.'
                                : generationMode === 'bottoms-catalog'
                                    ? 'Create professional catalogs for baby joggers & pants with toddler models.'
                                    : 'Generate professional virtual try-on photos for your products.'}
                    </p>
                </div>

                <div className="form-container">
                    {/* Mode Toggle */}
                    <section className="form-section">
                        <h2><span className="step">1</span>Mode</h2>
                        <div className="mode-toggle" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                            <button
                                type="button"
                                className={`mode-btn ${generationMode === 'photo' ? 'active' : ''}`}
                                onClick={() => setGenerationMode('photo')}
                            >
                                Simple Photo
                            </button>
                            <button
                                type="button"
                                className={`mode-btn ${generationMode === 'poster' ? 'active' : ''}`}
                                onClick={() => setGenerationMode('poster')}
                            >
                                Marketing Poster
                            </button>
                            <button
                                type="button"
                                className={`mode-btn ${generationMode === 'catalog' ? 'active' : ''}`}
                                onClick={() => setGenerationMode('catalog')}
                            >
                                Master Catalog
                            </button>
                            <button
                                type="button"
                                className={`mode-btn ${generationMode === 'bottoms-catalog' ? 'active' : ''}`}
                                onClick={() => setGenerationMode('bottoms-catalog')}
                                style={{ background: generationMode === 'bottoms-catalog' ? 'linear-gradient(135deg, #6EC1E4 0%, #A78BFA 100%)' : undefined }}
                            >
                                👶 Bottoms Catalog
                            </button>
                            <button
                                type="button"
                                className={`mode-btn ${generationMode === 'fabric-close-up' ? 'active' : ''}`}
                                onClick={() => setGenerationMode('fabric-close-up')}
                            >
                                🔎 Fabric Close-up
                            </button>
                            <button
                                type="button"
                                className={`mode-btn ${generationMode === 'hero-close-up' ? 'active' : ''}`}
                                onClick={() => setGenerationMode('hero-close-up')}
                            >
                                ⭐ Hero Close-up
                            </button>
                        </div>
                    </section>
                    {/* Catalog Mode - Full CatalogForm */}
                    {generationMode === 'catalog' ? (
                        <CatalogForm
                            category={category}
                            setCategory={setCategory}
                            collectionName={collectionName}
                            setCollectionName={setCollectionName}
                            collectionNumber={collectionNumber}
                            setCollectionNumber={setCollectionNumber}
                            theme={catalogTheme}
                            setTheme={setCatalogTheme}
                            skinTone={skinTone}
                            setSkinTone={setSkinTone}
                            bodyType={bodyType}
                            setBodyType={setBodyType}
                            textFields={catalogTextFields}
                            setTextFields={setCatalogTextFields}
                            products={products}
                            setProducts={setProducts}
                            logo={logo}
                            setLogo={setLogo}
                            onAddProduct={handleAddProduct}
                            onRemoveProduct={handleRemoveProduct}
                            onUpdateProduct={handleUpdateProduct}
                        />
                    ) : generationMode === 'bottoms-catalog' ? (
                        <BottomsCatalogForm
                            onSubmit={async (formData) => {
                                setIsGenerating(true);
                                setJobStatus({ status: 'generating', message: '👶 Creating baby catalog...' });
                                try {
                                    const response = await fetch('/api/generate-bottoms-catalog', {
                                        method: 'POST',
                                        body: formData
                                    });
                                    if (!response.ok) {
                                        const error = await response.json();
                                        throw new Error(error.detail || 'Generation failed');
                                    }
                                    const blob = await response.blob();
                                    const url = window.URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = 'bottoms_catalog.zip';
                                    a.click();
                                    window.URL.revokeObjectURL(url);
                                    setJobStatus({ status: 'completed', message: '✅ Catalog downloaded!' });
                                } catch (err) {
                                    console.error(err);
                                    setJobStatus({ status: 'failed', message: err.message });
                                } finally {
                                    setIsGenerating(false);
                                }
                            }}
                            isGenerating={isGenerating}
                        />
                    ) : (
                        <>
                            {/* Category */}
                            <section className="form-section">
                                <h2><span className="step">2</span>Category</h2>
                                <CategorySelector value={category} onChange={setCategory} />
                            </section>

                            {/* Brand Name */}
                            <section className="form-section">
                                <h2><span className="step">3</span>Brand</h2>
                                <div className="form-group">
                                    <input
                                        type="text"
                                        value={brandName}
                                        onChange={(e) => setBrandName(e.target.value)}
                                        placeholder="Brand name"
                                    />
                                </div>
                            </section>

                            {/* Model Appearance (Only show if not in a closeup mode) */}
                            {!(generationMode === 'fabric-close-up' || generationMode === 'hero-close-up') && (
                                <section className="form-section">
                                    <h2><span className="step">4</span>Model</h2>
                                    <ModelDescription
                                        skinTone={skinTone}
                                        hairType={hairType}
                                        bodyType={bodyType}
                                        onSkinToneChange={setSkinTone}
                                        onHairTypeChange={setHairType}
                                        onBodyTypeChange={setBodyType}
                                    />
                                </section>
                            )}

                            {/* Fabric Details (Only show for fabric closeup mode) */}
                            {generationMode === 'fabric-close-up' && (
                                <section className="form-section">
                                    <h2><span className="step">4</span>Fabric Details</h2>
                                    <div className="form-group">
                                        <label htmlFor="fabric-desc-input" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                                            Fabric Texture Description (Optional)
                                        </label>
                                        <textarea
                                            id="fabric-desc-input"
                                            value={fabricDescription}
                                            onChange={(e) => setFabricDescription(e.target.value)}
                                            placeholder="e.g. Heavyweight 240 GSM organic cotton with a visible slub weave, ribbed waffle knit texture..."
                                            rows={3}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                borderRadius: '8px',
                                                border: '1px solid var(--border-color)',
                                                background: 'var(--bg-secondary)',
                                                color: 'var(--text-primary)',
                                                resize: 'vertical'
                                            }}
                                        />
                                    </div>
                                </section>
                            )}

                            {/* Conditional: Photo, Closeup or Poster Options */}
                            {generationMode === 'photo' ? (
                                <>
                                    {/* Shot & Pose */}
                                    <section className="form-section">
                                        <h2><span className="step">5</span>Pose & Fit</h2>
                                        <ShotAndPose
                                            shotAngle={shotAngle}
                                            poseType={poseType}
                                            fitType={fitType}
                                            onShotAngleChange={setShotAngle}
                                            onPoseTypeChange={setPoseType}
                                            onFitTypeChange={setFitType}
                                        />
                                    </section>

                                    {/* Creative Direction */}
                                    <section className="form-section">
                                        <h2><span className="step">6</span>Direction (Optional)</h2>
                                        <CreativeDirection
                                            value={creativeDirection}
                                            onChange={setCreativeDirection}
                                        />
                                    </section>
                                </>
                            ) : (generationMode === 'fabric-close-up' || generationMode === 'hero-close-up') ? (
                                <>
                                    {/* Setting / Backdrop */}
                                    <section className="form-section">
                                        <h2><span className="step">5</span>Setting / Backdrop</h2>
                                        <div className="form-group">
                                            <select
                                                value={marketingTheme}
                                                onChange={(e) => setMarketingTheme(e.target.value)}
                                                style={{
                                                    width: '100%',
                                                    padding: '0.75rem',
                                                    borderRadius: '8px',
                                                    border: '1px solid var(--border-color)',
                                                    background: 'var(--bg-secondary)',
                                                    color: 'var(--text-primary)'
                                                }}
                                            >
                                                <option value="studio_minimal">Minimal Studio (Plaster/travertine)</option>
                                                <option value="streetwear_urban">Urban / Concrete Backdrop</option>
                                                <option value="desert_warmth">Warm Desert Sandstone</option>
                                                <option value="beach_light">Bright Beach / Linen Backdrop</option>
                                                <option value="high_fashion_editorial">High Fashion Editorial</option>
                                                <option value="retro_grunge">Retro Grunge / Industrial</option>
                                            </select>
                                        </div>
                                    </section>
                                </>
                            ) : (
                                <>
                                    {/* Marketing Options */}
                                    <section className="form-section">
                                        <h2><span className="step">5</span>Poster Options</h2>
                                        <MarketingOptions
                                            theme={marketingTheme}
                                            setTheme={setMarketingTheme}
                                            prop={prop}
                                            setProp={setProp}
                                            pose={poseType}
                                            setPose={setPoseType}
                                            fit={fitType}
                                            setFit={setFitType}
                                            layoutStyle={layoutStyle}
                                            setLayoutStyle={setLayoutStyle}
                                            headline={headline}
                                            setHeadline={setHeadline}
                                            subtext={subtext}
                                            setSubtext={setSubtext}
                                            brand={brand}
                                            setBrand={setBrand}
                                            price={price}
                                            setPrice={setPrice}
                                            cta={cta}
                                            setCta={setCta}
                                            tagline={tagline}
                                            setTagline={setTagline}
                                        />
                                    </section>

                                    {/* Logo Upload */}
                                    <section className="form-section">
                                        <h2><span className="step">6</span>Logo (Optional)</h2>
                                        <div className="form-group">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleLogoUpload}
                                                style={{ padding: '0.75rem' }}
                                            />
                                            {logo && (
                                                <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                                    Logo: {logo.name}
                                                </p>
                                            )}
                                        </div>
                                    </section>
                                </>
                            )}

                            {/* Upload Products */}
                            <section className="form-section">
                                <h2><span className="step">7</span>Products ({products.length}/10)</h2>
                                <UploadForm
                                    products={products}
                                    onAddProduct={handleAddProduct}
                                    onRemoveProduct={handleRemoveProduct}
                                    onUpdateProduct={handleUpdateProduct}
                                    singleImage={generationMode === 'fabric-close-up' || generationMode === 'hero-close-up'}
                                />
                            </section>
                        </>
                    )}

                    {/* Quality Selection */}
                    <section className="form-section">
                        <h2><span className="step">8</span>Image Quality</h2>
                        <QualitySelector
                            selected={imageQuality}
                            onSelect={setImageQuality}
                        />
                    </section>

                    {/* Processing Mode Selection (Catalog mode only) */}
                    {generationMode === 'catalog' && (
                        <section className="form-section">
                            <h2><span className="step">9</span>Processing Mode</h2>
                            <ProcessingModeSelector
                                selected={processingMode}
                                onSelect={setProcessingMode}
                            />
                            <p style={{
                                fontSize: '0.8rem',
                                color: 'var(--text-muted)',
                                marginTop: '0.5rem'
                            }}>
                                {processingMode === 'batch'
                                    ? '💰 Batch: 50% cheaper! Results ready in 1-24 hours.'
                                    : '⚡ Instant: Generate now, results in ~5 minutes.'}
                            </p>
                        </section>
                    )}

                    {/* Submit Button */}
                    <button
                        className="btn btn-primary btn-large"
                        onClick={handleSubmit}
                        disabled={!isFormValid || isGenerating}
                    >
                        {isGenerating ? (
                            <>
                                <span className="spinner"></span>
                                Processing
                            </>
                        ) : (
                            generationMode === 'catalog'
                                ? `Generate Catalog (${2 + products.length * 2} pages)`
                                : generationMode === 'poster'
                                    ? 'Generate Posters'
                                    : generationMode === 'fabric-close-up'
                                        ? 'Generate Fabric Close-ups'
                                        : generationMode === 'hero-close-up'
                                            ? 'Generate Hero Close-ups'
                                            : 'Generate Photos'
                        )}
                    </button>

                    {/* Status Message */}
                    {jobStatus && (
                        <div className={`status-message ${jobStatus.status}`} style={{
                            marginTop: '1rem',
                            padding: '1rem',
                            borderRadius: 'var(--radius-md)',
                            textAlign: 'center',
                            background: jobStatus.status === 'completed' ? '#e8f5e9' :
                                jobStatus.status === 'failed' ? '#ffebee' : 'var(--bg-secondary)',
                            color: jobStatus.status === 'completed' ? '#2e7d32' :
                                jobStatus.status === 'failed' ? '#c62828' : 'var(--text-secondary)'
                        }}>
                            {jobStatus.status === 'generating' && (
                                <span className="spinner" style={{ marginRight: '0.5rem' }}></span>
                            )}
                            {jobStatus.message}
                            {jobStatus.status === 'completed' && (
                                <>
                                    <button className="btn" onClick={handleReset} style={{ marginLeft: '1rem' }}>
                                        New Generation
                                    </button>

                                    {/* Video Generation Button */}
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => handleGenerateVideo('snap')}
                                        disabled={isVideoGenerating}
                                        style={{
                                            marginLeft: '1rem',
                                            background: 'var(--gold)',
                                            color: 'white',
                                            border: 'none',
                                            padding: '0.5rem 1rem'
                                        }}
                                    >
                                        {isVideoGenerating ? '🎬 Creating Clip...' : '📹 Generate Catchy Clip'}
                                    </button>
                                    {/* Pose Variation Selector - only for photo mode */}
                                    {generationMode === 'photo' && (
                                        <div style={{ marginTop: '1rem' }}>
                                            <PoseSelector
                                                currentPose={currentPose}
                                                onPoseChange={(pose) => setCurrentPose(pose)}
                                                isLoading={isRegenerating}
                                                disabled={isRegenerating}
                                            />
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                                Pose variations coming soon! Select a pose for your next generation.
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}
                            {jobStatus.status === 'failed' && (
                                <button className="btn" onClick={handleReset} style={{ marginLeft: '1rem' }}>
                                    Try Again
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* Video Preview Modal */}
            <AnimatePresence>
                {generatedVideoUrl && (
                    <VideoPreview
                        videoUrl={generatedVideoUrl}
                        onDownload={() => {
                            const a = document.createElement('a');
                            a.href = generatedVideoUrl;
                            a.download = 'bono_fashion_clip.mp4';
                            a.click();
                        }}
                        onClose={() => setGeneratedVideoUrl(null)}
                    />
                )}
            </AnimatePresence>

            {/* Video Error Message */}
            {videoError && (
                <div className="status-message failed" style={{
                    position: 'fixed',
                    bottom: '2rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 2000,
                    width: 'auto',
                    maxWidth: '90%'
                }}>
                    ❌ {videoError}
                    <button onClick={() => setVideoError(null)} style={{ marginLeft: '1rem', background: 'transparent', border: 'none', cursor: 'pointer' }}>×</button>
                </div>
            )}
        </div>
    )
}

export default App
