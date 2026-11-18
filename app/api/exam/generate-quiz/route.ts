import { Readable } from 'node:stream';
import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const BASE_URL = 'https://examquiz-6b6c.onrender.com';

export async function POST(req: NextRequest) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const busboy = require('busboy');

        const bb = busboy({ headers: { 'content-type': req.headers.get('content-type') || '' } });

        let fileBuffer: Buffer | null = null;
        let fileName = '';
        const formFields: Record<string, string> = {};

        await new Promise((resolve, reject) => {
            bb.on('file', (_name: string, file: any, info: any) => {
                const { filename } = info;
                fileName = filename;
                const chunks: any[] = [];
                file.on('data', (data: any) => chunks.push(data));
                file.on('end', () => {
                    fileBuffer = Buffer.concat(chunks);
                });
            });

            bb.on('field', (name: string, val: string) => {
                formFields[name] = val;
            });

            bb.on('close', resolve);
            bb.on('error', reject);

            const nodeStream = Readable.fromWeb(req.body as any);
            nodeStream.pipe(bb);
        });

        if (!fileBuffer) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const lowerFileName = (fileName || '').toLowerCase();
        const validExtensions = ['.pdf', '.doc', '.docx'];
        const isImage = /\.(png|jpe?g|webp|bmp|gif|svg|tiff)$/i.test(lowerFileName);
        const isValid = validExtensions.some((ext) => lowerFileName.endsWith(ext));

        if (isImage || !isValid) {
            return NextResponse.json(
                {
                    error: isImage
                        ? 'Image files (PNG, JPG) are not accepted. Only PDF and Word documents (.pdf, .doc, .docx) are supported.'
                        : 'Invalid file format. Only PDF and Word documents (.pdf, .doc, .docx) are supported.'
                },
                { status: 400 }
            );
        }

        const { questionCount, difficulty, topic } = formFields;

        // --- STEP 1: Upload File to get Extracted Text ---
        console.info('Step 1: Uploading Document to Render...');
        const formData = new FormData();
        const mimeType = lowerFileName.endsWith('.docx')
            ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            : lowerFileName.endsWith('.doc')
              ? 'application/msword'
              : 'application/pdf';
        const blob = new Blob([fileBuffer], { type: mimeType });
        formData.append('file', blob, fileName);

        const uploadRes = await fetch(`${BASE_URL}/upload-pdf`, {
            method: 'POST',
            headers: {
                Accept: 'application/json'
            },
            body: formData
        });

        const uploadContentType = uploadRes.headers.get('content-type');
        if (!uploadRes.ok || !uploadContentType?.includes('application/json')) {
            const errText = await uploadRes.text();
            console.error('PDF Upload Error Response:', errText);
            throw new Error('AI Server (Upload) is currently unavailable or returning HTML. Please try again in 30 seconds.');
        }

        const uploadData = await uploadRes.json();
        const extractedText = uploadData.extracted_text;
        console.info('PDF Uploaded. Text length:', extractedText?.length);

        // --- STEP 2: Generate Questions using Extracted Text ---
        console.info('Step 2: Generating questions...');
        const genRes = await fetch(`${BASE_URL}/generate-questions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            body: JSON.stringify({
                extracted_text: extractedText,
                topics: topic ? [topic] : ['General Knowledge'],
                question_count: Number.parseInt(questionCount) || 5,
                difficulty: difficulty.toLowerCase()
            }),
            signal: AbortSignal.timeout(60000)
        });

        const genContentType = genRes.headers.get('content-type');
        if (!genRes.ok || !genContentType?.includes('application/json')) {
            const errText = await genRes.text();
            console.error('Generation Error Response:', errText);
            throw new Error('AI Server (Generation) returned an invalid response. The content might be too large.');
        }

        const genData = await genRes.json();
        console.info('Questions generated:', genData.questions?.length);

        // --- STEP 3: Map Response to Frontend Structure ---
        const mappedQuestions = genData.questions.map((q: any, idx: number) => ({
            id: idx + 1,
            text: q.question,
            options: q.options,
            answer: q.answer,
            explanation: `Correct answer is ${q.answer}.` // Fallback explanation
        }));

        // Derive a topic/title from content or filename
        const derivedTitle =
            extractedText
                ?.split('\n')
                .filter((l: string) => l.trim().length > 5)[0]
                ?.substring(0, 40) || fileName.replace('.pdf', '');

        return NextResponse.json({
            title: derivedTitle || 'General Assessment',
            questions: mappedQuestions
        });
    } catch (error: any) {
        console.error('Quiz Generation CRITICAL Error:', error);
        return NextResponse.json({ error: error.message || 'Generation failed' }, { status: 500 });
    }
}
