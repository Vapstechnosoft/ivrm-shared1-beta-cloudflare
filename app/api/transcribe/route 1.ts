import { blobToFile, enhanceAndConvertToWav } from '@/lib/audio-utils';
import Groq from 'groq-sdk';
import type { NextRequest } from 'next/server';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || process.env.chat_Groq_api_key || ''
});

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('audio') as File | null;

        if (!file) {
            return Response.json({ error: 'No audio file provided' }, { status: 400 });
        }

        if (file.size === 0) {
            return Response.json({ error: 'Audio file is empty' }, { status: 400 });
        }

        // Convert WebM → enhanced WAV (Groq supports wav)
        const webmBlob = new Blob([await file.arrayBuffer()], { type: file.type });
        const wavBlob = await enhanceAndConvertToWav(webmBlob);
        const wavFile = blobToFile(wavBlob, 'enhanced.wav');

        // Call Groq Whisper API
        const transcription = await groq.audio.transcriptions.create({
            file: wavFile,
            model: 'whisper-large-v3',
            response_format: 'json',
            temperature: 0.0
        });

        if (!transcription || !transcription.text) {
            return Response.json({ error: 'Transcription failed - no text returned' }, { status: 500 });
        }

        // Keep the same response format for compatibility with components
        return Response.json({
            success: true,
            text: transcription.text,
            language: (transcription as any).language
        });
    } catch (error: unknown) {
        console.error('Groq Transcription API error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return Response.json({ error: 'Server error', details: errorMessage }, { status: 500 });
    }
}
