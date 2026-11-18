'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    AlertCircle,
    BookOpen,
    Check,
    Clipboard,
    Download,
    FileText,
    Languages,
    Layout,
    Loader2,
    Printer,
    StickyNote,
    Upload
} from 'lucide-react';
import type React from 'react';
import { useRef, useState } from 'react';

import { NoteContentRenderer } from '@/components/ai-notemaker/note-content-renderer';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { formatAiErrorMessage } from '@/lib/ai-error-handler';
import { standardizeNoteMarkdown } from '@/lib/notemaker-cleaner';
import { exportNoteMakerPdf, printNoteMakerContent } from '@/lib/notemaker-pdf-export';
import { toast } from 'sonner';

const LANGUAGES = [
    { code: 'English', label: 'English (Original)' },
    { code: 'Hindi', label: 'Hindi (हिंदी)' },
    { code: 'Kannada', label: 'Kannada (ಕನ್ನಡ)' },
    { code: 'Tamil', label: 'Tamil (தமிழ்)' },
    { code: 'Telugu', label: 'Telugu (తెలుగు)' },
    { code: 'Malayalam', label: 'Malayalam (മലയാളം)' },
    { code: 'Marathi', label: 'Marathi (मራठी)' },
    { code: 'Gujarati', label: 'Gujarati (ગુજરાતી)' },
    { code: 'Bengali', label: 'Bengali (বাংলা)' },
    { code: 'Punjabi', label: 'Punjabi (ਪੰਜਾਬੀ)' },
    { code: 'Spanish', label: 'Spanish (Español)' },
    { code: 'French', label: 'French (Français)' },
    { code: 'German', label: 'German (Deutsch)' },
    { code: 'Arabic', label: 'Arabic (العربية)' }
];

export default function AINotemaker() {
    // State
    const [file, setFile] = useState<File | null>(null);
    const [activeTab, setActiveTab] = useState('upload');
    const [chapter, setChapter] = useState<string>('1');
    const [generateSummary, setGenerateSummary] = useState<boolean>(true);
    const [generateNotes, setGenerateNotes] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<{ summary?: string; notes?: string; chapter?: string } | null>(null);
    const [originalResult, setOriginalResult] = useState<{ summary?: string; notes?: string; chapter?: string } | null>(null);
    const [selectedLanguage, setSelectedLanguage] = useState<string>('English');
    const [isTranslating, setIsTranslating] = useState<boolean>(false);
    const [_errorLog, setErrorLog] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
    const previewContainerRef = useRef<HTMLDivElement>(null);

    // Handlers
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const selectedFile = e.target.files[0];
            const ext = selectedFile.name.split('.').pop()?.toLowerCase();
            if (ext !== 'pdf' && ext !== 'txt') {
                toast.error('Currently only PDF and TXT files are supported');
                return;
            }
            setFile(selectedFile);
            toast.success('File uploaded successfully');
        }
    };

    const handleGenerate = async () => {
        if (!file) {
            toast.error('Please upload a file first');
            return;
        }

        setIsLoading(true);
        setResult(null);
        setOriginalResult(null);
        setSelectedLanguage('English');
        setErrorLog(null);
        setErrorMessage(null);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('chapter', chapter);

            let mode = 'both';
            if (generateSummary && !generateNotes) mode = 'summary';
            if (!generateSummary && generateNotes) mode = 'notes';

            formData.append('mode', mode);

            const response = await fetch('/api/exam/create-notemaker', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(formatAiErrorMessage(errorData.error || 'Failed to generate notes'));
            }

            const data = await response.json();
            setResult(data);
            setOriginalResult(data);
            setActiveTab('preview');
            toast.success('Notes generated successfully');
        } catch (error: any) {
            console.error('Notemaker Error:', error);
            const displayMessage = formatAiErrorMessage(error, 'Error generating notes. Please try again.');
            setErrorMessage(displayMessage);
            toast.error(displayMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTranslate = async (targetLang: string) => {
        setSelectedLanguage(targetLang);
        if (targetLang === 'English') {
            if (originalResult) {
                setResult(originalResult);
                toast.success('Restored original English notes');
            }
            return;
        }

        if (!originalResult) return;

        setIsTranslating(true);
        toast.loading(`Translating notes to ${targetLang}...`, { id: 'translate-notemaker' });

        try {
            const response = await fetch('/api/exam/translate-notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    summary: originalResult.summary,
                    notes: originalResult.notes,
                    targetLanguage: targetLang
                })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(formatAiErrorMessage(errData.error || 'Translation failed'));
            }

            const translatedData = await response.json();
            setResult((prev) => ({
                ...prev,
                summary: translatedData.summary || prev?.summary,
                notes: translatedData.notes || prev?.notes
            }));
            toast.success(`Notes translated to ${targetLang}`, { id: 'translate-notemaker' });
        } catch (err: any) {
            console.error('Translation Error:', err);
            toast.error(formatAiErrorMessage(err, 'Failed to translate notes'), { id: 'translate-notemaker' });
        } finally {
            setIsTranslating(false);
        }
    };

    const handleCopyContent = (text: string) => {
        navigator.clipboard.writeText(standardizeNoteMarkdown(text));
        toast.success('Copied to clipboard');
    };

    const handleDownloadPDF = async () => {
        if (!result) return;
        setIsDownloadingPdf(true);
        toast.loading('Generating PDF...', { id: 'notemaker-pdf' });
        try {
            await exportNoteMakerPdf({
                chapter: result.chapter,
                summary: result.summary,
                notes: result.notes,
                language: selectedLanguage,
                previewElement: previewContainerRef.current
            });
            toast.success('PDF Downloaded successfully', { id: 'notemaker-pdf' });
        } catch (err: any) {
            console.error('PDF export failed:', err);
            toast.error('Failed to generate PDF. Please try again.', { id: 'notemaker-pdf' });
        } finally {
            setIsDownloadingPdf(false);
        }
    };

    const handlePrintNotes = () => {
        if (!result) return;
        printNoteMakerContent({
            chapter: result.chapter,
            summary: result.summary,
            notes: result.notes,
            language: selectedLanguage
        });
    };

    const _renderWithBold = (text: string) => {
        if (!text) return null;
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return (
                    <strong key={index} className='font-bold text-primary'>
                        {part.slice(2, -2)}
                    </strong>
                );
            }
            return part;
        });
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-6 p-4 md:p-6'>
                {errorMessage && (
                    <Alert variant='destructive' className='mb-6'>
                        <AlertCircle className='h-4 w-4' />
                        <AlertTitle>Operation Failed</AlertTitle>
                        <AlertDescription className='mt-2 font-medium text-sm'>{errorMessage}</AlertDescription>
                    </Alert>
                )}

                <Tabs value={activeTab} onValueChange={setActiveTab} className='space-y-6'>
                    <TabsList className='bg-muted/50 p-1'>
                        <TabsTrigger value='upload' className='px-8 font-bold'>
                            Configuration
                        </TabsTrigger>
                        <TabsTrigger value='preview' disabled={!result} className='px-8 font-bold'>
                            Preview Notes
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value='upload' className='space-y-6'>
                        <div className='grid grid-cols-1 gap-6 md:grid-cols-12'>
                            {/* Left: Source */}
                            <div className='col-span-12 md:col-span-5'>
                                <Card>
                                    <CardHeader>
                                        <CardTitle className='flex items-center gap-2'>
                                            <Upload className='h-5 w-5 text-primary' />
                                            Source Material
                                        </CardTitle>
                                        <CardDescription>Upload textbooks (PDF/TXT) to analyze.</CardDescription>
                                    </CardHeader>
                                    <CardContent className='space-y-4'>
                                        <div className='grid w-full items-center gap-1.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider'>
                                            <Label htmlFor='file-upload'>Document (PDF/TXT)</Label>
                                            {file ? (
                                                <div className='flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 p-3'>
                                                    <div className='flex items-center gap-3'>
                                                        <FileText className='h-5 w-5 text-primary' />
                                                        <div className='flex flex-col'>
                                                            <span className='line-clamp-1 font-bold text-slate-900 text-sm'>
                                                                {file.name}
                                                            </span>
                                                            <span className='text-[10px] text-muted-foreground'>
                                                                {(file.size / 1024 / 1024).toFixed(2)} MB
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant='ghost'
                                                        size='sm'
                                                        onClick={() => setFile(null)}
                                                        className='h-8 text-destructive hover:bg-destructive/10 hover:text-destructive'>
                                                        Change
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Input
                                                    id='file-upload'
                                                    type='file'
                                                    accept='.pdf,.txt'
                                                    onChange={handleFileChange}
                                                    className='cursor-pointer file:font-semibold file:text-primary'
                                                />
                                            )}
                                        </div>

                                        <div className='grid w-full items-center gap-1.5 pt-2 font-semibold text-muted-foreground text-xs uppercase tracking-wider'>
                                            <Label htmlFor='chapter'>Specific Chapter (Optional)</Label>
                                            <Input
                                                id='chapter'
                                                type='number'
                                                placeholder='e.g. 1'
                                                value={chapter}
                                                onChange={(e) => setChapter(e.target.value)}
                                                className='h-10'
                                                min='1'
                                            />
                                            <p className='font-normal text-[10px] text-muted-foreground normal-case'>
                                                Please enter chapter numbers only
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right: Settings */}
                            <div className='col-span-12 md:col-span-7'>
                                <Card className='flex h-full flex-col'>
                                    <CardHeader>
                                        <CardTitle className='flex items-center gap-2'>
                                            <Layout className='h-5 w-5 text-primary' />
                                            Notemaker Settings
                                        </CardTitle>
                                        <CardDescription>Define how you want your notes to be structured.</CardDescription>
                                    </CardHeader>
                                    <CardContent className='flex-1 space-y-4 pt-4'>
                                        <div className='space-y-4'>
                                            <div
                                                className={`flex cursor-pointer items-start space-x-4 rounded-xl border p-5 transition-all ${generateSummary ? 'border-primary/20 bg-muted/30' : 'bg-background opacity-60'}`}
                                                onClick={() => setGenerateSummary(!generateSummary)}>
                                                <Checkbox
                                                    id='gen-summary'
                                                    checked={generateSummary}
                                                    onCheckedChange={(checked) => setGenerateSummary(!!checked)}
                                                    className='mt-1'
                                                />
                                                <div className='grid gap-1.5 leading-none'>
                                                    {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
                                                    <label className='flex items-center gap-2 font-bold text-sm'>
                                                        <StickyNote className='h-4 w-4' />
                                                        Generate Summary
                                                    </label>
                                                    <p className='text-muted-foreground text-xs leading-relaxed'>
                                                        Creates a high-level academic overview capturing the core message and primary
                                                        concepts.
                                                    </p>
                                                </div>
                                            </div>

                                            <div
                                                className={`flex cursor-pointer items-start space-x-4 rounded-xl border p-5 transition-all ${generateNotes ? 'border-primary/20 bg-muted/30' : 'bg-background opacity-60'}`}
                                                onClick={() => setGenerateNotes(!generateNotes)}>
                                                <Checkbox
                                                    id='gen-notes'
                                                    checked={generateNotes}
                                                    onCheckedChange={(checked) => setGenerateNotes(!!checked)}
                                                    className='mt-1'
                                                />
                                                <div className='grid gap-1.5 leading-none'>
                                                    {/* biome-ignore lint/nursery/useSortedClasses: <explanation> */}
                                                    {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
                                                    <label className='text-sm font-bold flex items-center gap-2'>
                                                        <BookOpen className='h-4 w-4' />
                                                        Generate Exhaustive Notes
                                                    </label>
                                                    <p className='text-muted-foreground text-xs leading-relaxed'>
                                                        Creates deep-dive study material with exhaustive explanations and examples.
                                                    </p>
                                                </div>
                                            </div>

                                            {!generateSummary && !generateNotes && (
                                                <Alert variant='destructive' className='rounded-xl px-4 py-3'>
                                                    <AlertCircle className='h-4 w-4' />
                                                    <AlertDescription className='text-sm'>
                                                        Please select at least one option to proceed.
                                                    </AlertDescription>
                                                </Alert>
                                            )}
                                        </div>
                                    </CardContent>
                                    <CardFooter className='flex items-center justify-between border-t bg-muted/10 p-4'>
                                        <div />
                                        <Button
                                            size='lg'
                                            onClick={handleGenerate}
                                            disabled={isLoading || !file || (!generateSummary && !generateNotes)}
                                            className='min-w-[150px]'>
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <Check className='mr-2 h-4 w-4' /> Generate
                                                </>
                                            )}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value='preview' className='space-y-6'>
                        {result && (
                            <div className='mb-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-3 shadow-sm'>
                                <div className='flex items-center gap-3'>
                                    <div className='flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-1.5'>
                                        <Languages className='h-4 w-4 text-primary' />
                                        <span className='font-semibold text-muted-foreground text-xs uppercase tracking-wider'>
                                            Translate Notes:
                                        </span>
                                        <select
                                            value={selectedLanguage}
                                            onChange={(e) => handleTranslate(e.target.value)}
                                            disabled={isTranslating}
                                            className='cursor-pointer rounded-md bg-transparent font-medium text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50'>
                                            {LANGUAGES.map((lang) => (
                                                <option key={lang.code} value={lang.code}>
                                                    {lang.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {isTranslating && (
                                        <span className='flex items-center gap-1.5 font-medium text-primary text-xs'>
                                            <Loader2 className='h-3.5 w-3.5 animate-spin' /> Translating...
                                        </span>
                                    )}
                                </div>
                                <div className='flex items-center gap-2'>
                                    <Button onClick={handlePrintNotes} variant='outline' className='font-medium'>
                                        <Printer className='mr-2 h-4 w-4' /> Print / Save PDF
                                    </Button>
                                    <Button onClick={handleDownloadPDF} disabled={isDownloadingPdf} className='font-medium'>
                                        {isDownloadingPdf ? (
                                            <>
                                                <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Generating...
                                            </>
                                        ) : (
                                            <>
                                                <Download className='mr-2 h-4 w-4' /> Download PDF
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {result ? (
                            <div ref={previewContainerRef} className='fade-in mx-auto max-w-5xl animate-in space-y-8 duration-500'>
                                {/* Summary Card */}
                                {result.summary && (
                                    <Card className='overflow-hidden'>
                                        <CardHeader className='flex flex-row items-center justify-between border-b bg-muted/30'>
                                            <div>
                                                <CardTitle className='text-xl'>Summary</CardTitle>
                                                <CardDescription>Overview of the material.</CardDescription>
                                            </div>
                                            <Button
                                                variant='ghost'
                                                size='icon'
                                                onClick={() => handleCopyContent(result.summary || '')}
                                                className='h-8 w-8 text-muted-foreground hover:text-primary'>
                                                <Clipboard className='h-4 w-4' />
                                            </Button>
                                        </CardHeader>
                                        <CardContent className='p-6 md:p-8'>
                                            <NoteContentRenderer content={result.summary} variant='summary' />
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Notes Card */}
                                {result.notes && (
                                    <Card className='overflow-hidden'>
                                        <CardHeader className='flex flex-row items-center justify-between border-b bg-muted/30'>
                                            <div>
                                                <CardTitle className='flex items-center gap-2 text-xl'>
                                                    <StickyNote className='h-5 w-5 text-primary' />
                                                    Structured Topic-wise Notes
                                                </CardTitle>
                                                <CardDescription>Detailed breakdown and key points.</CardDescription>
                                            </div>
                                            <Button
                                                variant='ghost'
                                                size='icon'
                                                onClick={() => handleCopyContent(result.notes || '')}
                                                className='h-8 w-8 text-muted-foreground hover:bg-muted hover:text-primary'>
                                                <Clipboard className='h-4 w-4' />
                                            </Button>
                                        </CardHeader>
                                        <CardContent className='bg-white p-6 md:p-8'>
                                            <NoteContentRenderer content={result.notes} variant='notes' />
                                        </CardContent>
                                        <CardFooter className='justify-center border-t bg-muted/30 py-4'>
                                            <p className='text-muted-foreground text-xs'>Generated by AI Notemaker • Optimized for Exams</p>
                                        </CardFooter>
                                    </Card>
                                )}
                            </div>
                        ) : (
                            <div className='flex h-[500px] flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-muted/5'>
                                <FileText className='mb-4 h-16 w-16 text-muted-foreground/20' />
                                <p className='text-muted-foreground'>Ready to process your content...</p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
