import { Readable } from 'node:stream';
import { formatAiErrorMessage, isAiRateLimitError } from '@/lib/ai-error-handler';
import Groq from 'groq-sdk';
import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

// Initialize Groq client using note_Groq_api_key
const groq = new Groq({
    apiKey: process.env.note_Groq_api_key || ''
});

export async function POST(req: NextRequest) {
    const logs: string[] = [];
    const log = (msg: string) => {
        const timestamp = new Date().toISOString();
        const entry = `[${timestamp}] ${msg}`;
        logs.push(entry);
        console.log(entry);
    };

    try {
        log('Start processing Doubt Resolver request');

        // Dynamic imports for Node.js modules
        const busboyModule = await import('busboy');
        const busboy = busboyModule.default || busboyModule;
        // @ts-expect-error pdf-parse lacks proper TypeScript declarations
        const pdfModule = await import('pdf-parse/lib/pdf-parse.js');
        const pdf = pdfModule.default || pdfModule;

        if (!req.body) {
            return NextResponse.json({ error: 'No request body' }, { status: 400 });
        }

        const bb = busboy({ headers: { 'content-type': req.headers.get('content-type') || '' } });

        let fileBuffer: Buffer | null = null;
        let fileName = '';
        const formFields: Record<string, string> = {};

        await new Promise((resolve, reject) => {
            bb.on('file', (name: string, file: any, info: any) => {
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

        const doubt = formFields['doubt'] || '';
        const subject = formFields['subject'] || 'General';
        const level = formFields['level'] || 'High School';
        const historyJson = formFields['history'] || '[]';

        let history: { role: 'user' | 'assistant'; content: string }[] = [];
        try {
            history = JSON.parse(historyJson);
        } catch (e) {
            log('Error parsing history JSON, resetting to empty array');
            history = [];
        }

        if (!doubt.trim()) {
            return NextResponse.json({ error: 'Please provide a doubt or question.' }, { status: 400 });
        }

        let referenceText = '';
        if (fileBuffer) {
            const buffer = fileBuffer as Buffer;
            log(`File received for reference: ${fileName}, Size: ${buffer.length}`);
            if (fileName.toLowerCase().endsWith('.pdf')) {
                log('Parsing PDF...');
                const data = await pdf(buffer);
                referenceText = data.text;
            } else {
                referenceText = buffer.toString('utf-8');
            }
        }

        log(`Parameters: Subject: ${subject}, Level: ${level}, History Length: ${history.length}`);

        // Construct context and prompts
        let systemPrompt = `You are "AI Doubt Resolver", an elite academic tutor designed to resolve students' academic doubts.
Provide clear, comprehensive, step-by-step explanations.
Tailor your explanation to the academic level: "${level}" and the subject: "${subject}".

Structure your response into clear parts using headers:
1. **Direct Answer / Executive Summary**: Give a clear, direct answer to the question in 2-3 sentences.
2. **Step-by-Step Resolution**: Walk through the explanation or solution logic step-by-step. Break it down so a student can understand the transition from each step.
3. **Core Concepts & Key Formulas**: List any essential theorems, definitions, concepts, or formulas used.
4. **Practice Challenge**: Provide a similar practice question with a hint, allowing the student to test their understanding.

Ensure all math expressions are clear. Use bold text for key terms.`;

        // If history is empty, this is the initial question. Otherwise, it is a follow-up.
        const messages: any[] = [
            { role: 'system', content: systemPrompt }
        ];

        // Add history
        for (const msg of history) {
            messages.push({ role: msg.role, content: msg.content });
        }

        // Create the current prompt
        let userPrompt = '';
        if (referenceText) {
            userPrompt += `Reference Document Content:\n${referenceText.slice(0, 40000)}\n\n`;
        }
        userPrompt += `Academic Doubt / Question:\n${doubt}`;

        messages.push({ role: 'user', content: userPrompt });

        log('Requesting Groq chat completion...');
        const chatCompletion = await groq.chat.completions.create({
            messages,
            model: 'llama-3.3-70b-versatile',
            temperature: 0.5,
            max_tokens: 3000
        });

        const content = chatCompletion.choices[0]?.message?.content || 'No response generated.';

        return NextResponse.json({ solution: content, logs });
    } catch (error: any) {
        log(`Error in Doubt Resolver: ${error.message}`);
        const isRateLimit = isAiRateLimitError(error);
        const userFacingMessage = formatAiErrorMessage(error, 'Failed to resolve doubt. Please try again.');
        return NextResponse.json(
            {
                error: userFacingMessage,
                logs: isRateLimit ? undefined : logs
            },
            { status: isRateLimit ? 429 : 500 }
        );
    }
}
