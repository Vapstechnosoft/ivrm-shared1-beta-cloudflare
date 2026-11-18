'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { evaluateOmr } from '@/server/omr-evaluation';
import { ClipboardCheck, Download, Eye, FileText, PlayCircle, Trash2, Upload } from 'lucide-react';
import Script from 'next/script';
import { useState } from 'react';
import { toast } from 'sonner';

// Helper to convert images and PDFs to JPEG for backend OCR compatibility
const convertToJpeg = async (file: File): Promise<{ file: File; width: number; height: number }> => {
    // 1. Handle PDF Conversion
    if (file.type === 'application/pdf') {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const typedarray = new Uint8Array(e.target?.result as ArrayBuffer);
                    const pdfjsLib = (window as any).pdfjsLib;
                    if (!pdfjsLib) return reject('PDF rendering library not loaded. Please wait a moment.');

                    const pdf = await pdfjsLib.getDocument(typedarray).promise;
                    const page = await pdf.getPage(1);
                    const viewport = page.getViewport({ scale: 2.0 }); // High scale for better OCR accuracy

                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    if (!context) return reject('Canvas context failed');

                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    await page.render({ canvasContext: context, viewport: viewport }).promise;

                    canvas.toBlob(
                        (blob) => {
                            if (blob) {
                                const newName = `${file.name.replace(/\.[^/.]+$/, '')}.jpg`;
                                resolve({
                                    file: new File([blob], newName, { type: 'image/jpeg' }),
                                    width: viewport.width,
                                    height: viewport.height
                                });
                            } else reject('PDF to Image conversion failed');
                        },
                        'image/jpeg',
                        0.95
                    );
                } catch (err) {
                    reject(`Failed to process PDF: ${err}`);
                }
            };
            reader.readAsArrayBuffer(file);
        });
    }

    // 2. Handle Image Conversion (ensure JPEG)
    if (file.type.startsWith('image/')) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) return reject('Canvas context failed');
                    ctx.drawImage(img, 0, 0);
                    canvas.toBlob(
                        (blob) => {
                            if (blob) {
                                const newName = `${file.name.replace(/\.[^/.]+$/, '')}.jpg`;
                                resolve({
                                    file: new File([blob], newName, { type: 'image/jpeg' }),
                                    width: img.width,
                                    height: img.height
                                });
                            } else reject('Image to JPEG conversion failed');
                        },
                        'image/jpeg',
                        0.95
                    );
                };
                img.onerror = () => reject('Image load failed');
                img.src = e.target?.result as string;
            };
            reader.onerror = () => reject('File read failed');
            reader.readAsDataURL(file);
        });
    }

    return { file, width: 0, height: 0 };
};

export default function StaffOmrSheetEvaluatorPage() {
    const [studentFile, setStudentFile] = useState<File | null>(null);
    const [answerKeyFile, setAnswerKeyFile] = useState<File | null>(null);
    const [questionCount, _setQuestionCount] = useState('150');
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);

    const handleEvaluation = async () => {
        if (!studentFile || !answerKeyFile) {
            toast.error('Please upload both Student Sheet and Answer Key');
            return;
        }

        // Quality Check: Prevent highly compressed/low-quality images (<100KB)
        if (studentFile.size < 100 * 1024 || answerKeyFile.size < 100 * 1024) {
            toast.error('The image quality is too low (less than 100KB). Please upload a higher-quality scan for accurate OMR evaluation.');
            return;
        }

        // Cropped Image Check: Prevent processed/cropped images that lack markers
        const isCroppedFilename = (file: File) => file.name.toLowerCase().includes('cropped');
        if (isCroppedFilename(studentFile) || isCroppedFilename(answerKeyFile)) {
            toast.error('Cropped images detected. Please upload the original, full OMR sheets (uncropped) for accurate evaluation.');
            return;
        }

        setIsEvaluating(true);

        try {
            // Ensure both files are JPEG for the backend API and get metadata for validation
            const studentInfo = await convertToJpeg(studentFile);
            const answerKeyInfo = await convertToJpeg(answerKeyFile);

            // Aspect Ratio Check: Detect extreme cropping (Normal A4 ratio is ~0.7 or ~1.4)
            const checkRatio = (info: { width: number; height: number }) => {
                const ratio = info.width / info.height;
                return ratio > 2.5 || ratio < 0.3; // Very wide or very narrow images are likely cropped
            };

            if (checkRatio(studentInfo) || checkRatio(answerKeyInfo)) {
                toast.error('The uploaded images appear to be cropped or have an invalid aspect ratio. Please upload full OMR sheets.');
                setIsEvaluating(false);
                return;
            }

            // Robust validation: Check if they are the same image content
            // (Same dimensions and same base filename even if format differs)
            const base1 = studentFile.name.replace(/\.[^/.]+$/, '');
            const base2 = answerKeyFile.name.replace(/\.[^/.]+$/, '');

            if (
                (studentInfo.width === answerKeyInfo.width && studentInfo.height === answerKeyInfo.height && base1 === base2) ||
                (studentFile.name === answerKeyFile.name && studentFile.size === answerKeyFile.size)
            ) {
                toast.error('The Student Sheet and Answer Key appear to be the same image. Please provide different sheets.');
                setIsEvaluating(false);
                return;
            }

            toast.info('Processing OMR evaluation... this may take a moment.');

            const formData = new FormData();
            formData.append('student_file', studentInfo.file);
            formData.append('answer_key_file', answerKeyInfo.file);
            formData.append('question_count', questionCount);
            formData.append('options', '["A","B","C","D"]');

            const result = await evaluateOmr(formData);

            if (!result.success || !result.data) {
                throw new Error(result.message || 'Error occurred during server-side evaluation.');
            }

            // Convert base64 back to Blob
            const binaryString = window.atob(result.data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            const blob = new Blob([bytes], { type: result.contentType });
            const url = URL.createObjectURL(blob);
            setPdfUrl(url);
            toast.success('Evaluation completed! You can now preview the result.');
        } catch (error: any) {
            console.error('OMR Error:', error);
            toast.error(error.message || 'Error occurred during processing.');
        } finally {
            setIsEvaluating(false);
        }
    };

    const clearFiles = () => {
        setStudentFile(null);
        setAnswerKeyFile(null);
        setPdfUrl(null);
        toast.info('Cleared uploads and results');
    };

    const downloadPdf = () => {
        if (pdfUrl) {
            const link = document.createElement('a');
            link.href = pdfUrl;
            link.download = 'omr_evaluation_result.pdf';
            link.click();
        }
    };

    return (
        <div className='min-h-screen bg-[#f8fafc] p-4 lg:p-8'>
            <Script
                src='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
                strategy='lazyOnload'
                onLoad={() => {
                    if ((window as any).pdfjsLib) {
                        (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc =
                            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                    }
                }}
            />
            <div className='mx-auto max-w-7xl space-y-6'>
                {/* Header */}
                <div className='flex flex-col justify-between gap-4 md:flex-row md:items-center'>
                    <div>
                        <h1 className='font-bold font-outfit text-3xl text-slate-900 tracking-tight'>OMR AI Evaluator</h1>
                        <p className='mt-1 text-slate-500'>Industrial-grade OMR evaluation for Staff Portal.</p>
                    </div>
                    <div className='flex items-center gap-3'>
                        <Button variant='outline' onClick={clearFiles} disabled={isEvaluating} className='rounded-xl border-slate-200'>
                            <Trash2 className='mr-2 h-4 w-4 text-slate-400' />
                            Clear All
                        </Button>
                        <Button
                            className='rounded-xl bg-indigo-600 px-8 text-white shadow-indigo-200 shadow-lg transition-all hover:bg-indigo-700 active:scale-95'
                            onClick={handleEvaluation}
                            disabled={!studentFile || !answerKeyFile || isEvaluating}>
                            {isEvaluating ? (
                                <>
                                    <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white' />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <PlayCircle className='mr-2 h-4 w-4' />
                                    Generate Result
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                <div className='grid grid-cols-1 gap-6 lg:grid-cols-12'>
                    {/* Input Controls */}
                    <div className='space-y-6 lg:col-span-4'>
                        <Card className='overflow-hidden rounded-3xl border-none bg-white/80 shadow-xl backdrop-blur-sm'>
                            <div className='h-1.5 bg-indigo-600' />
                            <CardHeader>
                                <CardTitle className='flex items-center text-lg'>
                                    <Upload className='mr-2 h-5 w-5 text-indigo-600' />
                                    Source Sheets
                                </CardTitle>
                                <CardDescription>Provide the scanned OMR images for processing.</CardDescription>
                            </CardHeader>
                            <CardContent className='space-y-6'>
                                {/* Student File */}
                                <div className='space-y-2'>
                                    <Label className='px-1 font-semibold text-slate-700'>Student Answer Sheet</Label>
                                    <div
                                        className={`group relative rounded-2xl border-2 border-dashed p-4 transition-all ${studentFile ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50 hover:border-indigo-300'}`}>
                                        <input
                                            type='file'
                                            className='absolute inset-0 h-full w-full cursor-pointer opacity-0'
                                            onChange={(e) => setStudentFile(e.target.files?.[0] || null)}
                                            accept='image/*,application/pdf'
                                        />
                                        <div className='flex items-center gap-3'>
                                            <div
                                                className={`rounded-xl p-2.5 ${studentFile ? 'bg-emerald-500 text-white' : 'bg-white text-indigo-600 shadow-sm group-hover:scale-110'}`}>
                                                <FileText className='h-5 w-5' />
                                            </div>
                                            <div className='min-w-0 flex-1'>
                                                <p className='truncate font-bold text-slate-800 text-sm'>
                                                    {studentFile ? studentFile.name : 'Choose Student Sheet'}
                                                </p>
                                                <p className='text-[11px] text-slate-500'>
                                                    {studentFile ? `${(studentFile.size / 1024).toFixed(1)} KB` : 'Max size 20MB'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Answer Key File */}
                                <div className='space-y-2'>
                                    <Label className='px-1 font-semibold text-slate-700'>Official Answer Key</Label>
                                    <div
                                        className={`group relative rounded-2xl border-2 border-dashed p-4 transition-all ${answerKeyFile ? 'border-indigo-200 bg-indigo-50' : 'border-slate-200 bg-slate-50 hover:border-indigo-300'}`}>
                                        <input
                                            type='file'
                                            className='absolute inset-0 h-full w-full cursor-pointer opacity-0'
                                            onChange={(e) => setAnswerKeyFile(e.target.files?.[0] || null)}
                                            accept='image/*,application/pdf'
                                        />
                                        <div className='flex items-center gap-3'>
                                            <div
                                                className={`rounded-xl p-2.5 ${answerKeyFile ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600 shadow-sm group-hover:scale-110'}`}>
                                                <ClipboardCheck className='h-5 w-5' />
                                            </div>
                                            <div className='min-w-0 flex-1'>
                                                <p className='truncate font-bold text-slate-800 text-sm'>
                                                    {answerKeyFile ? answerKeyFile.name : 'Choose Answer Key'}
                                                </p>
                                                <p className='text-[11px] text-slate-500'>
                                                    {answerKeyFile ? `${(answerKeyFile.size / 1024).toFixed(1)} KB` : 'Reference Key'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Result Preview Panel */}
                    <div className='flex h-full min-h-[600px] flex-col lg:col-span-8'>
                        <Card className='flex flex-1 flex-col overflow-hidden rounded-[2.5rem] border-none bg-slate-900 shadow-2xl'>
                            <CardHeader className='flex flex-row items-center justify-between border-slate-700/50 border-b bg-slate-800/50 px-8 py-5'>
                                <div className='space-y-0.5'>
                                    <CardTitle className='flex items-center text-lg text-white'>
                                        <Eye className='mr-2 h-5 w-5 text-indigo-400' />
                                        Evaluation Preview
                                    </CardTitle>
                                    <CardDescription className='text-slate-400'>Real-time PDF rendering of results.</CardDescription>
                                </div>
                                {pdfUrl && (
                                    <div className='flex gap-2'>
                                        <Button
                                            onClick={() => window.open(pdfUrl, '_blank')}
                                            variant='outline'
                                            className='rounded-xl border-slate-700 bg-slate-800 text-white transition-all hover:bg-slate-700'>
                                            <Eye className='mr-2 h-4 w-4' />
                                            Present
                                        </Button>
                                        <Button
                                            onClick={downloadPdf}
                                            className='rounded-xl border-none bg-indigo-600 text-white shadow-indigo-900/40 shadow-xl transition-all hover:bg-indigo-700 active:scale-95'>
                                            <Download className='mr-2 h-4 w-4' />
                                            Download PDF
                                        </Button>
                                    </div>
                                )}
                            </CardHeader>
                            <CardContent className='relative flex-1 p-0'>
                                {pdfUrl ? (
                                    <iframe
                                        src={`${pdfUrl}`}
                                        className='h-full w-full rounded-b-[2rem] border-none'
                                        title='Evaluation Result'
                                        allowFullScreen
                                        allow='fullscreen'
                                    />
                                ) : (
                                    <div className='flex h-full flex-col items-center justify-center p-12 text-center'>
                                        <div className='mb-6 flex h-24 w-24 animate-pulse items-center justify-center rounded-[2rem] bg-slate-800'>
                                            <FileText className='h-10 w-10 text-slate-600' />
                                        </div>
                                        <h3 className='font-bold text-slate-300 text-xl'>Ready for Evaluation</h3>
                                        <p className='mt-2 max-w-sm text-slate-500 text-sm'>
                                            Upload your sheets on the left and click "Generate Result" to view the evaluated PDF here.
                                        </p>
                                    </div>
                                )}

                                {isEvaluating && (
                                    <div className='absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/80 p-8 backdrop-blur-sm'>
                                        <div className='relative mb-6 h-20 w-20'>
                                            <div className='absolute inset-0 rounded-full border-4 border-indigo-500/20' />
                                            <div className='absolute inset-0 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent' />
                                            <FileText className='absolute inset-0 m-auto h-8 w-8 text-indigo-400' />
                                        </div>
                                        <h3 className='mb-2 font-bold text-white text-xl'>Analyzing OMR Bubbles...</h3>
                                        <div className='h-1.5 w-64 overflow-hidden rounded-full bg-slate-700'>
                                            <div className='h-full animate-[loading_2s_ease-in-out_infinite] bg-indigo-500' />
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes loading {
                    0% { width: 0; transform: translateX(-100%); }
                    50% { width: 100%; transform: translateX(0); }
                    100% { width: 0; transform: translateX(100%); }
                }

                /* Add outfit font if not loaded */
                .font-outfit { font-family: var(--font-outfit, sans-serif); }
            `}</style>
        </div>
    );
}
