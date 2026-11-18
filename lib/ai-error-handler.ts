/**
 * Centralized error handler and sanitizer for Groq AI interactions across the application.
 * Detects rate limits (HTTP 429, TPM, RPM limits) and masks internal model names / infrastructure
 * details to present friendly, professional messages to end users.
 */

export const AI_HIGH_TRAFFIC_MESSAGE = 'The traffic is high right now, please try after some time.';

export function isAiRateLimitError(error: any): boolean {
    if (!error) return false;

    // Check direct status codes
    if (error.status === 429 || error.statusCode === 429 || error.status === 413 || error.statusCode === 413) return true;
    if (
        error.response?.status === 429 ||
        error.response?.statusCode === 429 ||
        error.response?.status === 413 ||
        error.response?.statusCode === 413
    )
        return true;

    // Check error codes
    const code = error.code || error.error?.code;
    if (code === 'rate_limit_exceeded' || code === 429 || code === '429' || code === 413 || code === '413') return true;

    // Extract error string from various structures
    const message =
        typeof error === 'string'
            ? error
            : error.message || error.error?.message || (typeof error.error === 'string' ? error.error : '') || error.toString?.() || '';

    const lower = message.toLowerCase();

    return (
        lower.includes('rate limit') ||
        lower.includes('rate_limit') ||
        lower.includes('429') ||
        lower.includes('413') ||
        lower.includes('too many requests') ||
        lower.includes('request too large') ||
        lower.includes('tokens per minute') ||
        lower.includes('requests per minute') ||
        lower.includes('tpm') ||
        lower.includes('rpm') ||
        lower.includes('quota exceeded') ||
        lower.includes('overloaded') ||
        lower.includes('capacity') ||
        (lower.includes('groq') && (lower.includes('limit') || lower.includes('error') || lower.includes('failed')))
    );
}

export function formatAiErrorMessage(error: any, defaultFallback = 'Failed to process request. Please try again.'): string {
    if (!error) return defaultFallback;

    if (isAiRateLimitError(error)) {
        return AI_HIGH_TRAFFIC_MESSAGE;
    }

    const message =
        typeof error === 'string'
            ? error
            : error.message || error.error?.message || (typeof error.error === 'string' ? error.error : '') || '';

    if (!message) return defaultFallback;

    const lower = message.toLowerCase();

    // Mask any internal model names or API keys if they leak in error strings
    if (
        lower.includes('openai/gpt-oss') ||
        lower.includes('gpt-oss-120b') ||
        lower.includes('llama-3') ||
        lower.includes('groq') ||
        lower.includes('gsk_')
    ) {
        return AI_HIGH_TRAFFIC_MESSAGE;
    }

    return message;
}
