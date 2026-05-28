/**
 * Friendly error message utility
 * Converts technical API errors into user-friendly text
 * Ported from fit-check project
 */

/**
 * Convert raw error to friendly user message
 * @param {Error|string|unknown} error - The error to process
 * @param {string} context - Context description (e.g., "Failed to generate image")
 * @returns {string} User-friendly error message
 */
export function getFriendlyErrorMessage(error, context) {
    let rawMessage = 'An unknown error occurred.';

    if (error instanceof Error) {
        rawMessage = error.message;
    } else if (typeof error === 'string') {
        rawMessage = error;
    } else if (error) {
        rawMessage = String(error);
    }

    // Check for specific error patterns and provide friendly messages

    // File type errors
    if (rawMessage.includes('Unsupported MIME type') || rawMessage.includes('unsupported')) {
        return 'Unsupported file format. Please upload PNG, JPEG, or WEBP images.';
    }

    // Network errors
    if (rawMessage.includes('fetch') || rawMessage.includes('network') || rawMessage.includes('ECONNREFUSED')) {
        return 'Unable to connect to the server. Please check your internet connection and try again.';
    }

    // Timeout errors
    if (rawMessage.includes('timeout') || rawMessage.includes('Timeout')) {
        return 'The request took too long. Please try again with a smaller image or fewer products.';
    }

    // Server errors
    if (rawMessage.includes('500') || rawMessage.includes('Internal Server Error')) {
        return 'Something went wrong on our end. Please try again in a moment.';
    }

    // API rate limiting
    if (rawMessage.includes('429') || rawMessage.includes('rate limit') || rawMessage.includes('quota')) {
        return 'Too many requests. Please wait a moment and try again.';
    }

    // Safety/content filtering
    if (rawMessage.includes('blocked') || rawMessage.includes('safety') || rawMessage.includes('filter')) {
        return 'The image could not be processed due to content restrictions. Please try a different image.';
    }

    // File too large
    if (rawMessage.includes('too large') || rawMessage.includes('size limit') || rawMessage.includes('413')) {
        return 'The image is too large. Please use a smaller file (under 10MB).';
    }

    // Generic fallback - include context
    return `${context}. ${rawMessage}`;
}

/**
 * Get contextual loading message based on step
 * @param {string} step - Current generation step
 * @param {object} options - Additional context (product number, etc.)
 * @returns {string} Loading message to display
 */
export function getLoadingMessage(step, options = {}) {
    const { productNum, totalProducts, productName } = options;

    const messages = {
        'uploading': 'Preparing your images...',
        'processing': 'Processing garment details...',
        'generating_front': productNum
            ? `Generating front view (${productNum}/${totalProducts})...`
            : 'Generating front view...',
        'generating_back': productNum
            ? `Generating back view (${productNum}/${totalProducts})...`
            : 'Generating back view...',
        'generating_poster': 'Creating marketing poster...',
        'upscaling': 'Enhancing image quality...',
        'creating_zip': 'Packaging your files...',
        'finalizing': 'Finalizing your catalog...',
        'default': 'Generating your images...'
    };

    return messages[step] || messages.default;
}
