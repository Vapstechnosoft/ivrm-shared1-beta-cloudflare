// Use node:stream for better compatibility with modern Node environments in Next.js 15
import { Readable } from 'node:stream';
import { formatAiErrorMessage, isAiRateLimitError } from '@/lib/ai-error-handler';
import { standardizeNoteMarkdown } from '@/lib/notemaker-cleaner';
import Groq from 'groq-sdk';
import { type NextRequest, NextResponse } from 'next/server';

// Next.js 15 Route Handler Configuration
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

// Initialize Groq client
const groq = new Groq({
    apiKey: process.env.note_Groq_api_key || ''
});
// Helper utility to extract chapter content (Identical to Question Paper Generator logic)
function extractChapterContent(fullText: string, chapters: string[]): string {
    let combinedContent = '';

    // 1. Identify all potential chapter boundaries in the document
    const chapterMatches: { number: string; index: number }[] = [];

    // Regex from Question Paper Generator
    const regex = /(?:^|\n)\s*(?:chapter|unit|lesson|module)\s+([0-9]+(?:\.[0-9]+)*)|(?:^|\n)\s*([0-9]+(?:\.[0-9]+)*)\.\s+[A-Za-z]/gi;

    // biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
    let match;
    // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
    while ((match = regex.exec(fullText)) !== null) {
        const num = match[1] || match[2];
        if (num) {
            chapterMatches.push({
                number: num.toLowerCase(),
                index: match.index
            });
        }
    }

    // Sort by index to ensure order
    chapterMatches.sort((a, b) => a.index - b.index);

    // 2. Extract content for requested chapters
    for (const chapter of chapters) {
        const targetNum = chapter.trim().toLowerCase();

        // Find the start match
        const startMatchIndex = chapterMatches.findIndex((m) => m.number === targetNum);

        if (startMatchIndex === -1) {
            continue;
        }

        const startMatch = chapterMatches[startMatchIndex];

        // Find the end: It's the start of the NEXT chapter section
        let endIndex = fullText.length;
        if (startMatchIndex + 1 < chapterMatches.length) {
            endIndex = chapterMatches[startMatchIndex + 1].index;
        }

        // Limit huge chunks for better AI performance
        if (startMatchIndex === chapterMatches.length - 1) {
            endIndex = Math.min(startMatch.index + 40000, fullText.length);
        }

        const extractedText = fullText.slice(startMatch.index, endIndex);
        combinedContent += `\n\n--- CONTENT FOR CHAPTER ${targetNum} ---\n\n`;
        combinedContent += extractedText;
    }

    // Fallback: simple string search if regex fails
    if (!combinedContent && chapters.length > 0) {
        const normalized = fullText.toLowerCase();
        for (const chapter of chapters) {
            const target = chapter.trim().toLowerCase();
            const patterns = [`chapter ${target}`, `unit ${target}`, `module ${target}`];

            for (const p of patterns) {
                const idx = normalized.indexOf(p);
                if (idx !== -1) {
                    combinedContent += `\n\n--- FALLBACK CONTENT FOR ${target.toUpperCase()} ---\n\n`;
                    combinedContent += fullText.slice(idx, idx + 30000);
                    break;
                }
            }
        }
    }

    return combinedContent || fullText.slice(0, 40000);
}

export async function POST(req: NextRequest) {
    const logs: string[] = [];
    const log = (msg: string) => {
        const timestamp = new Date().toISOString();
        const entry = `[${timestamp}] ${msg}`;
        logs.push(entry);
    };

    try {
        log('Start processing request');

        // Dynamic imports for Node.js modules
        const busboyModule = await import('busboy');
        const busboy = busboyModule.default || busboyModule;
        // @ts-expect-error pdf-parse lacks proper TypeScript declarations for this subpath
        const pdfModule = await import('pdf-parse/lib/pdf-parse.js');

        const pdf = pdfModule.default || pdfModule;

        if (!req.body) {
            return NextResponse.json({ error: 'No request body' }, { status: 400 });
        }

        log('Streaming request body...');

        const bb = busboy({ headers: { 'content-type': req.headers.get('content-type') || '' } });

        let fileBuffer: Buffer | null = null;
        let fileName = '';
        const formFields: Record<string, string> = {};

        await new Promise((resolve, reject) => {
            bb.on('file', (_name: string, file: any, info: any) => {
                const { filename } = info;
                fileName = filename;
                const chunks: any[] = [];
                file.on('data', (chunk: any) => chunks.push(chunk));
                file.on('end', () => {
                    fileBuffer = Buffer.concat(chunks);
                });
            });

            bb.on('field', (name: string, val: string) => {
                formFields[name] = val;
            });

            bb.on('finish', () => resolve(null));
            bb.on('error', (err: any) => reject(err));

            const nodeStream = Readable.fromWeb(req.body as any);
            nodeStream.pipe(bb);
        });

        if (!fileBuffer) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = fileBuffer as Buffer;
        log(`File received: ${fileName}, Size: ${buffer.length}`);

        const chapter = formFields.chapter || '';
        const mode = formFields.mode || 'both'; // both, summary, notes

        let extractedText = '';

        if (fileName.toLowerCase().endsWith('.pdf')) {
            log('Parsing PDF...');
            const data = await pdf(buffer);
            extractedText = data.text;
        } else if (fileName.toLowerCase().endsWith('.txt')) {
            log('Parsing TXT...');
            extractedText = buffer.toString('utf-8');
        } else {
            extractedText = buffer.toString('utf-8');
        }

        if (!extractedText || extractedText.trim().length === 0) {
            throw new Error('No text content found in file.');
        }

        log(`Text extracted. Length: ${extractedText.length}`);

        // Filter by chapter if provided - Increased to 100k for MASSIVE detail
        const contextContent = chapter ? extractChapterContent(extractedText, [chapter]) : extractedText.slice(0, 100000);

        log(`Context prepared. Length: ${contextContent.length}`);

        let prompt = '';

        if (mode === 'summary') {
            prompt = `
                Text Content:
                ${contextContent}

                TASK:
                Create a high-level Academic Executive Summary ${chapter ? `for chapter ${chapter}` : 'for the provided document'}.
                
                **STRICT REQUIREMENT**: The summary MUST be presented in clear, concise bullet points for maximum readability.
                
                Identify the core message, primary concepts, and the significance of the topics discussed.
                Focus on what remains most important from an exam perspective.
            `;
        } else if (mode === 'notes') {
            prompt = `
                Text Content:
                ${contextContent}

                TASK:
                Create **Exhaustive, Ultra-Detailed Study Material** ${chapter ? `specifically for chapter ${chapter}` : 'for the provided material'}.

                **COMPULSORY REQUIREMENT: 1500+ WORDS MINIMUM**
                You are strictly forbidden from giving short answers. You must produce a MASSIVE, long-form academic document.

                **STRUCTURE FOR MASSIVE LENGTH**:
                1. **EXHAUSTIVE INTRODUCTION (200+ words)**: Detailed background of the chapter/topic, its importance in the subject, and real-world relevance.
                2. **CONCEPTUAL DEEP-DIVE (300+ words per topic)**: For EVERY sub-topic (like Balancing Equations, Mole Ratios), write at least 3-4 long paragraphs explaining the mechanism, technical constraints, logic, and significance.
                3. **DETAILED STEP-BY-STEP EXAMPLES**: Include every example, reaction, or case study from the text and explain it word-by-word.
                4. **CRITICAL ANALYSIS & EXAM PREP**: Discuss common mistakes, complex edge cases, and high-difficulty exam concepts.
                5. **EXTENSIVE DEFINITION LIST**: Provide 2-3 sentence definitions for every technical keyword.

                **STRICT INSTRUCTIONS**:
                - **FORMATTING REQUIREMENTS (STANDARD CLEAN MARKDOWN)**:
                  * Start the notes with the Chapter Title as a top-level header: '# CHAPTER <X> – <TITLE>'. DO NOT wrap chapter titles in asterisks ('**').
                  * Use '## 1. <SECTION TITLE>' for numbered major sections (e.g. '## 1. EXHAUSTIVE INTRODUCTION').
                  * Use '### <SUBTOPIC TITLE>' for sub-topic sections.
                  * Use standard bullet points ('- ') for lists.
                  * Use '**keyword**' strictly for highlighting key technical terms inline inside paragraphs or list items. Always close all asterisks properly.
                  * Never output unbalanced or stray asterisks like '*text**' or '**text*'. Never leave stray asterisks around headings or dividers.
                  * Use '---' on its own line between major sections.
                - Use professional, academic, and extremely descriptive language.
                - Capture EVERYTHING. Do not summarize. EXPAND on every sentence of the input.
            `;
        } else {
            prompt = `
                You are a Senior Academic Architect. You are given educational content.

                TASK:
                1. Provide an **Exam-Focused Executive Summary** (~300 words). 
                   **REQUIREMENT**: Use clear standard bullet points ('- ') for the summary.
                2. Provide **Exhaustive Study Material (COMPULSORY 1500+ WORDS)**.

                **STRICT REQUIREMENT FOR NOTES**:
                - **TARGET WORD COUNT: 1500-2500 WORDS**.
                - You must take the provided text and EXPAND it into a full standalone textbook chapter.
                - Every topic must be a full lesson with deep technical detail.
                - Capture EVERY sub-topic. If the text mentions it, you must write a detailed section on it.
                - **FORMATTING REQUIREMENTS (STANDARD CLEAN MARKDOWN)**:
                  * Start the notes with the Chapter Title as a top-level header: '# CHAPTER <X> – <TITLE>'. DO NOT wrap chapter titles in asterisks.
                  * Use '## 1. <SECTION TITLE>' for numbered major sections (e.g. '## 1. EXHAUSTIVE INTRODUCTION').
                  * Use '### <SUBTOPIC TITLE>' for sub-topics.
                  * Use standard bullet points ('- ') for lists.
                  * Use '**keyword**' strictly for highlighting key technical terms inline inside paragraphs or list items.
                  * Never output stray asterisks or unbalanced asterisks like '*text**' or '**text*'.
                  * Use '---' on its own line between major sections.
                - Use hierarchical, professional formatting.

                OUTPUT FORMAT:
                ---SUMMARY---
                <summary here>
                ---NOTES---
                <detailed notes here - MUST BE 1500+ WORDS>

                Text Source:
                ${contextContent}
            `;
        }

        log('Calling High-Reasoning AI (70B) for 1500+ Word Exhaustive Analysis...');
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content:
                        'You are an Elite Academic Architect. You produce MASSIVE, ultra-detailed, long-form study materials (minimum 1500-2000 words). You never summarize; you expand every single concept provided into a full, standalone lesson with deep descriptive paragraphs. You write pristine standard Markdown without stray or broken asterisks.'
                },
                { role: 'user', content: prompt }
            ],
            model: 'openai/gpt-oss-120b',
            temperature: 0.6, // Increased for wordier, more descriptive content
            max_tokens: 4096 // Full output capacity for maximum length
        });

        const content = chatCompletion.choices[0]?.message?.content || '';

        let summary = '';
        let notes = '';

        if (mode === 'both') {
            const parts = content.split(/---NOTES---/i);
            summary = standardizeNoteMarkdown(parts[0].replace(/---SUMMARY---/i, '').trim());
            notes = standardizeNoteMarkdown(parts[1]?.trim() || '');
        } else if (mode === 'summary') {
            summary = standardizeNoteMarkdown(content);
        } else {
            notes = standardizeNoteMarkdown(content);
        }

        return NextResponse.json({ summary, notes, chapter });
    } catch (error: any) {
        log(`Error: ${error.message}`);
        const isRateLimit = isAiRateLimitError(error);
        const userFacingMessage = formatAiErrorMessage(error, 'Failed to generate study notes');

        return NextResponse.json(
            {
                error: userFacingMessage,
                logs: isRateLimit ? undefined : logs
            },
            { status: isRateLimit ? 429 : 500 }
        );
    }
}
