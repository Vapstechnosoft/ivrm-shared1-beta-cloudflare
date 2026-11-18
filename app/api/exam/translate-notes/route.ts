import { standardizeNoteMarkdown } from '@/lib/notemaker-cleaner';
import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const AZURE_TRANSLATOR_KEY = process.env.AZURE_TRANSLATOR_KEY || 'ae1549ade3594811b31d5b7eedf42758';
const AZURE_TRANSLATOR_ENDPOINT = (process.env.AZURE_TRANSLATOR_ENDPOINT || 'https://api.cognitive.microsofttranslator.com').replace(
    /\/+$/,
    ''
);
const AZURE_TRANSLATOR_REGION = process.env.AZURE_TRANSLATOR_REGION || 'centralindia';

// Map language display names and codes to Azure Translator BCP-47 codes
const LANGUAGE_CODE_MAP: Record<string, string> = {
    english: 'en',
    en: 'en',
    hindi: 'hi',
    hi: 'hi',
    kannada: 'kn',
    kn: 'kn',
    tamil: 'ta',
    ta: 'ta',
    telugu: 'te',
    te: 'te',
    malayalam: 'ml',
    ml: 'ml',
    marathi: 'mr',
    mr: 'mr',
    gujarati: 'gu',
    gu: 'gu',
    bengali: 'bn',
    bn: 'bn',
    punjabi: 'pa',
    pa: 'pa',
    spanish: 'es',
    es: 'es',
    french: 'fr',
    fr: 'fr',
    german: 'de',
    de: 'de',
    arabic: 'ar',
    ar: 'ar',
    urdu: 'ur',
    ur: 'ur',
    sanskrit: 'sa',
    sa: 'sa',
    odia: 'or',
    or: 'or',
    assamese: 'as',
    as: 'as'
};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { summary, notes, targetLanguage } = body;

        if (!targetLanguage || targetLanguage === 'English') {
            return NextResponse.json({ summary, notes });
        }

        const toLang = LANGUAGE_CODE_MAP[String(targetLanguage).toLowerCase().trim()] || 'en';

        if (toLang === 'en') {
            return NextResponse.json({ summary, notes, language: targetLanguage });
        }

        if (!summary && !notes) {
            return NextResponse.json({ error: 'No content provided for translation' }, { status: 400 });
        }

        // Prepare translation payload
        const itemsToTranslate: { Text: string }[] = [];
        let summaryIndex = -1;
        let notesIndex = -1;

        if (summary?.trim()) {
            summaryIndex = itemsToTranslate.length;
            itemsToTranslate.push({ Text: summary.trim() });
        }

        if (notes?.trim()) {
            notesIndex = itemsToTranslate.length;
            itemsToTranslate.push({ Text: notes.trim() });
        }

        const url = `${AZURE_TRANSLATOR_ENDPOINT}/translate?api-version=3.0&to=${encodeURIComponent(toLang)}&textType=plain`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Ocp-Apim-Subscription-Key': AZURE_TRANSLATOR_KEY,
                'Ocp-Apim-Subscription-Region': AZURE_TRANSLATOR_REGION,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(itemsToTranslate)
        });

        if (!response.ok) {
            const errBody = await response.text();
            console.error('Azure Translation Error Response:', errBody);
            return NextResponse.json({ error: 'Translation service error' }, { status: response.status });
        }

        const results = await response.json();
        let translatedSummary = summary;
        let translatedNotes = notes;

        if (summaryIndex !== -1 && results[summaryIndex]?.translations?.[0]?.text) {
            translatedSummary = standardizeNoteMarkdown(results[summaryIndex].translations[0].text);
        }

        if (notesIndex !== -1 && results[notesIndex]?.translations?.[0]?.text) {
            translatedNotes = standardizeNoteMarkdown(results[notesIndex].translations[0].text);
        }

        return NextResponse.json({
            summary: translatedSummary,
            notes: translatedNotes,
            language: targetLanguage
        });
    } catch (error: any) {
        console.error('Azure Translation Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to translate notes with Azure Translator' }, { status: 500 });
    }
}
