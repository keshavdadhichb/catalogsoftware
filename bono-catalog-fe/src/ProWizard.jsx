import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './ProWizard.css'

// Wizard Step Components
import ClientSelector from './pro-wizard/ClientSelector'
import CatalogDetails from './pro-wizard/CatalogDetails'
import CategorySelector from './pro-wizard/CategorySelector'
import ThemeSelector from './pro-wizard/ThemeSelector'
import SettingSelector from './pro-wizard/SettingSelector'
import ProductUploader from './pro-wizard/ProductUploader'
import ProductConfigurator from './pro-wizard/ProductConfigurator'
import ExtrasSelector from './pro-wizard/ExtrasSelector'
import OutputSettings from './pro-wizard/OutputSettings'
import GenerationMode from './pro-wizard/GenerationMode'
import ReviewSummary from './pro-wizard/ReviewSummary'

// Wizard steps configuration
const WIZARD_STEPS = [
    { id: 'client', title: 'Client', icon: '👤' },
    { id: 'catalog', title: 'Catalog', icon: '📚' },
    { id: 'category', title: 'Category', icon: '👔' },
    { id: 'theme', title: 'Theme', icon: '🎨' },
    { id: 'setting', title: 'Setting', icon: '📍' },
    { id: 'upload', title: 'Upload', icon: '📤' },
    { id: 'configure', title: 'Configure', icon: '⚙️' },
    { id: 'extras', title: 'Extras', icon: '✨' },
    { id: 'output', title: 'Output', icon: '📦' },
    { id: 'mode', title: 'Mode', icon: '🚀' },
    { id: 'review', title: 'Review', icon: '✅' }
]

export default function ProWizard() {
    // Current wizard step
    const [currentStep, setCurrentStep] = useState(0)

    // Client data
    const [selectedClient, setSelectedClient] = useState(null)
    const [clients, setClients] = useState(() => {
        const saved = localStorage.getItem('pro_clients')
        return saved ? JSON.parse(saved) : []
    })

    // Catalog details
    const [catalogName, setCatalogName] = useState('')
    const [catalogNumber, setCatalogNumber] = useState('')
    const [language, setLanguage] = useState('english')

    // Category & Demographics
    const [category, setCategory] = useState('men')
    const [ageRange, setAgeRange] = useState([25, 35])

    // Theme & Setting
    const [selectedTheme, setSelectedTheme] = useState(null)
    const [selectedSetting, setSelectedSetting] = useState(null)

    // Products
    const [products, setProducts] = useState([])

    // Per-product configuration stored in products array:
    // { id, frontImage, backImage, pageTypes: [], frontPose, backPose, keywords, price, logoOption }

    // Optional extras
    const [includeIndex, setIncludeIndex] = useState(false)
    const [includePriceList, setIncludePriceList] = useState(false)
    const [includeThankYou, setIncludeThankYou] = useState(true)

    // Output settings
    const [quality, setQuality] = useState('2K')
    const [aspectRatio, setAspectRatio] = useState('a4_portrait')
    const [outputFormat, setOutputFormat] = useState('both')
    const [outputStyle, setOutputStyle] = useState('simple')  // 'simple' or 'layout'

    // Generation mode - default to true_batch for 50% savings
    const [generationMode, setGenerationMode] = useState('true_batch')

    // Generation state
    const [isGenerating, setIsGenerating] = useState(false)
    const [generationProgress, setGenerationProgress] = useState(0)

    // Save clients to localStorage
    const saveClients = useCallback((newClients) => {
        setClients(newClients)
        localStorage.setItem('pro_clients', JSON.stringify(newClients))
    }, [])

    // Navigation
    const nextStep = () => {
        if (currentStep < WIZARD_STEPS.length - 1) {
            setCurrentStep(currentStep + 1)
        }
    }

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1)
        }
    }

    const goToStep = (stepIndex) => {
        if (stepIndex <= currentStep) {
            setCurrentStep(stepIndex)
        }
    }

    // Validate current step before proceeding
    const canProceed = () => {
        const step = WIZARD_STEPS[currentStep].id
        switch (step) {
            case 'client':
                return selectedClient !== null
            case 'catalog':
                return catalogName.trim() !== ''
            case 'category':
                return category !== ''
            case 'theme':
                return selectedTheme !== null
            case 'setting':
                return selectedSetting !== null
            case 'upload':
                return products.length > 0
            case 'configure':
                return products.every(p => p.pageTypes && p.pageTypes.length > 0)
            default:
                return true
        }
    }

    // Render current step
    const renderStep = () => {
        const stepId = WIZARD_STEPS[currentStep].id

        const stepProps = {
            onNext: nextStep,
            onPrev: prevStep,
            canProceed: canProceed()
        }

        switch (stepId) {
            case 'client':
                return (
                    <ClientSelector
                        {...stepProps}
                        clients={clients}
                        selectedClient={selectedClient}
                        onSelectClient={setSelectedClient}
                        onSaveClients={saveClients}
                    />
                )
            case 'catalog':
                return (
                    <CatalogDetails
                        {...stepProps}
                        catalogName={catalogName}
                        setCatalogName={setCatalogName}
                        catalogNumber={catalogNumber}
                        setCatalogNumber={setCatalogNumber}
                        language={language}
                        setLanguage={setLanguage}
                    />
                )
            case 'category':
                return (
                    <CategorySelector
                        {...stepProps}
                        category={category}
                        setCategory={setCategory}
                        ageRange={ageRange}
                        setAgeRange={setAgeRange}
                    />
                )
            case 'theme':
                return (
                    <ThemeSelector
                        {...stepProps}
                        selectedTheme={selectedTheme}
                        setSelectedTheme={setSelectedTheme}
                    />
                )
            case 'setting':
                return (
                    <SettingSelector
                        {...stepProps}
                        selectedSetting={selectedSetting}
                        setSelectedSetting={setSelectedSetting}
                        selectedTheme={selectedTheme}
                    />
                )
            case 'upload':
                return (
                    <ProductUploader
                        {...stepProps}
                        products={products}
                        setProducts={setProducts}
                    />
                )
            case 'configure':
                return (
                    <ProductConfigurator
                        {...stepProps}
                        products={products}
                        setProducts={setProducts}
                        category={category}
                    />
                )
            case 'extras':
                return (
                    <ExtrasSelector
                        {...stepProps}
                        includeIndex={includeIndex}
                        setIncludeIndex={setIncludeIndex}
                        includePriceList={includePriceList}
                        setIncludePriceList={setIncludePriceList}
                        includeThankYou={includeThankYou}
                        setIncludeThankYou={setIncludeThankYou}
                    />
                )
            case 'output':
                return (
                    <OutputSettings
                        {...stepProps}
                        quality={quality}
                        setQuality={setQuality}
                        aspectRatio={aspectRatio}
                        setAspectRatio={setAspectRatio}
                        outputFormat={outputFormat}
                        setOutputFormat={setOutputFormat}
                        outputStyle={outputStyle}
                        setOutputStyle={setOutputStyle}
                    />
                )
            case 'mode':
                return (
                    <GenerationMode
                        {...stepProps}
                        generationMode={generationMode}
                        setGenerationMode={setGenerationMode}
                    />
                )
            case 'review':
                return (
                    <ReviewSummary
                        client={selectedClient}
                        catalogName={catalogName}
                        catalogNumber={catalogNumber}
                        category={category}
                        ageRange={ageRange}
                        theme={selectedTheme}
                        setting={selectedSetting}
                        products={products}
                        extras={{ includeIndex, includePriceList, includeThankYou }}
                        output={{ quality, aspectRatio, outputFormat, outputStyle }}
                        generationMode={generationMode}
                        isGenerating={isGenerating}
                        setIsGenerating={setIsGenerating}
                        generationProgress={generationProgress}
                        setGenerationProgress={setGenerationProgress}
                        language={language}
                    />
                )
            default:
                return null
        }
    }

    return (
        <div className="pro-wizard">
            {/* Header */}
            <header className="pro-header">
                <div className="pro-logo">
                    <span className="badge">PRO</span>
                    <h1>SnapCatalog Studio</h1>
                </div>
                <div className="header-actions">
                    <button className="btn-dashboard" onClick={() => window.location.href = '/pro/dashboard'}>
                        📊 Dashboard
                    </button>
                </div>
            </header>

            {/* Progress Steps */}
            <nav className="wizard-progress">
                {WIZARD_STEPS.map((step, index) => (
                    <button
                        key={step.id}
                        className={`progress-step ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
                        onClick={() => goToStep(index)}
                        disabled={index > currentStep}
                    >
                        <span className="step-icon">{step.icon}</span>
                        <span className="step-title">{step.title}</span>
                        <span className="step-number">{index + 1}</span>
                    </button>
                ))}
            </nav>

            {/* Step Content */}
            <main className="wizard-content">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="step-container"
                    >
                        {renderStep()}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    )
}
