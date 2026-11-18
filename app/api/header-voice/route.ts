import { exec } from 'child_process';
import os from 'os';
import path from 'path';
import { promisify } from 'util';
import fs from 'fs/promises';
import type { NextRequest } from 'next/server';

const execAsync = promisify(exec);

// Force JSON response even for global errors
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    let tempFilePath = '';
    try {
        const formData = await req.formData();
        const file = formData.get('audio') as File | null;

        if (!file) {
            return Response.json({ error: 'No audio file provided' }, { status: 400 });
        }

        console.log('[Header Voice] Forwarding audio to external STT API: https://stt-mobile.onrender.com/transcribe');

        // --- PRIMARY: CALL EXTERNAL RENDER STT API ---
        try {
            const apiFormData = new FormData();
            apiFormData.append('audio', file);

            const externalRes = await fetch('https://stt-mobile.onrender.com/transcribe', {
                method: 'POST',
                body: apiFormData
            });

            if (externalRes.ok) {
                const resData = await externalRes.json();
                console.log('[Header Voice] External STT response:', resData);

                // Extremely robust parsing for common transcription API return formats
                let transcribedText = '';
                if (resData) {
                    if (typeof resData === 'string') {
                        transcribedText = resData;
                    } else {
                        transcribedText =
                            resData.text ||
                            resData.transcript ||
                            resData.transcription ||
                            resData.transcribedText ||
                            resData.data?.text ||
                            resData.data?.transcript ||
                            resData.data?.transcription ||
                            '';
                    }
                }

                if (transcribedText?.trim()) {
                    console.log('[Header Voice] Successfully transcribed via external API:', transcribedText);
                    return Response.json({
                        success: true,
                        text: transcribedText.trim(),
                        provider: 'external'
                    });
                }
            } else {
                console.warn(`[Header Voice] External API failed with status ${externalRes.status}. Falling back to local processor.`);
            }
        } catch (apiError: any) {
            console.error('[Header Voice] Failed calling external STT API:', apiError);
            // Safe fallback to local python processing below
        }

        // --- FALLBACK: LOCAL PYTHON SPEECH PROCESSOR ---
        console.log('[Header Voice] Executing local Python speech processor fallback...');
        const buffer = Buffer.from(await file.arrayBuffer());
        tempFilePath = path.join(os.tmpdir(), `header_voice_${Date.now()}.wav`);
        await fs.writeFile(tempFilePath, buffer);

        const scriptPath = path.join(process.cwd(), 'server', 'voice_processor.py');

        try {
            const { stdout } = await execAsync(`python "${scriptPath}" "${tempFilePath}"`);

            const match = stdout.match(/RESULTJSON:(.*?):ENDJSON/);
            if (!match) {
                console.error('[Header Voice] Could not find JSON in Python output. Output was:', stdout);
                return Response.json({ error: 'Invalid output from speech processor' }, { status: 500 });
            }

            const result = JSON.parse(match[1]);

            // Clean up
            if (tempFilePath) await fs.unlink(tempFilePath).catch(() => {});

            if (!result.success) {
                return Response.json({ error: result.error }, { status: 500 });
            }

            return Response.json({
                success: true,
                text: result.text,
                original: result.original_text,
                language: result.detected_lang,
                provider: 'local'
            });
        } catch (execError: any) {
            console.error('[Header Voice] Execution error:', execError);
            const errorOutput = execError.stdout || execError.message || 'Python execution failed';
            return Response.json(
                {
                    error: 'Python processing failed',
                    details: errorOutput
                },
                { status: 500 }
            );
        }
    } catch (error: unknown) {
        console.error('Header Voice API error:', error);
        if (tempFilePath) await fs.unlink(tempFilePath).catch(() => {});
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return Response.json({ error: 'Server error', details: errorMessage }, { status: 500 });
    }
}
