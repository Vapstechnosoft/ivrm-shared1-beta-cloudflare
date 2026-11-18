'use server';

export async function translateText(query: string) {
    if (!query || !query.trim()) return { text: '' };

    try {
        // 1. Normalize Unicode (NFC) to handle composite characters correctly
        const normalized = query.normalize('NFC').trim();

        // 2. Direct Suggestion: if it starts with an English alphabet character, bypass translation
        const firstChar = normalized.charAt(0);
        const isEnglishAlpha = /^[a-zA-Z]$/.test(firstChar);
        if (isEnglishAlpha) {
            console.log('[TRANSLATE-ACTION] Direct match (English), bypassing translation:', normalized);
            return { success: true, text: normalized };
        }

        // 3. Azure Cognitive Services Translator API Configuration
        const key = 'ae1549ade3594811b31d5b7eedf42758';
        const endpoint = 'https://api.cognitive.microsofttranslator.com';
        const location = 'centralindia';

        // Auto-detect the source language and translate to English ('to=en')
        const url = `${endpoint}/translate?api-version=3.0&to=en`;

        const body = [{ Text: normalized }];

        console.log('[TRANSLATE-ACTION] Sending translation request to Azure for:', normalized);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Ocp-Apim-Subscription-Key': key,
                'Ocp-Apim-Subscription-Region': location
            },
            body: JSON.stringify(body)
        });

        if (response.ok) {
            const jsonResponse = await response.json();
            const translatedText = jsonResponse?.[0]?.translations?.[0]?.text;

            if (translatedText) {
                console.log('[TRANSLATE-ACTION] Translated successfully, input:', query, 'output:', translatedText);
                return { success: true, text: translatedText };
            }
        } else {
            console.error(`[TRANSLATE-ACTION] Azure Translator failed: ${response.status} ${response.statusText}`);
            const errorText = await response.text();
            console.error('[TRANSLATE-ACTION] Error payload:', errorText);
        }

        // Fallback to the original text if translation failed
        return { success: false, text: normalized };
    } catch (error: any) {
        console.error('[TRANSLATE-ACTION] Translate Error:', error);
        return { success: false, text: query };
    }
}
