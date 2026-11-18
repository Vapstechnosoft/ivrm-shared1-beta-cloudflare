'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import jsPDF from 'jspdf';
import { AlertCircle, Check, CheckCircle2, Download, FileText, Loader2, Plus, Trash2, Upload } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { formatAiErrorMessage, isAiRateLimitError } from '@/lib/ai-error-handler';
import { toast } from 'sonner';

interface Question {
    id: number;
    text: string;
    type: string;
    options?: string[];
    difficulty: 'Easy' | 'Medium' | 'Hard';
    topic: string;
}

interface Section {
    markValue: number;
    questions: Question[];
}

interface QuestionPaper {
    title: string;
    totalMarks: number;
    sections: Section[];
}

interface MarkConfig {
    markValue: number;
    count: number;
    isMCQ?: boolean;
}

export default function AIQuestionPaperGenerator() {
    // State
    const [file, setFile] = useState<File | null>(null);
    const [activeTab, setActiveTab] = useState('upload');
    const [chapters, setChapters] = useState<string>('1');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedPaper, setGeneratedPaper] = useState<QuestionPaper | null>(null);
    const [errorLog, setErrorLog] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Configuration State
    const [markConfigs, setMarkConfigs] = useState<MarkConfig[]>([
        { markValue: 1, count: 5, isMCQ: true },
        { markValue: 2, count: 5, isMCQ: false },
        { markValue: 5, count: 2, isMCQ: false }
    ]);

    const [difficulty, setDifficulty] = useState({
        easy: 30,
        medium: 40,
        hard: 30
    });

    const handleDifficultyChange = (type: 'easy' | 'medium' | 'hard', value: number) => {
        const others = type === 'easy' ? ['medium', 'hard'] : type === 'medium' ? ['easy', 'hard'] : ['easy', 'medium'];
        const newValue = Math.min(100, Math.max(0, value));
        const remaining = 100 - newValue;

        const other1Key = others[0] as 'easy' | 'medium' | 'hard';
        const other2Key = others[1] as 'easy' | 'medium' | 'hard';

        const other1Val = difficulty[other1Key];
        const other2Val = difficulty[other2Key];
        const currentOthersSum = other1Val + other2Val;

        let newOther1Val, newOther2Val;

        if (currentOthersSum === 0) {
            newOther1Val = Math.round(remaining / 2);
            newOther2Val = remaining - newOther1Val;
        } else {
            newOther1Val = Math.round((other1Val / currentOthersSum) * remaining);
            newOther2Val = remaining - newOther1Val;
        }

        setDifficulty({
            ...difficulty,
            [type]: newValue,
            [other1Key]: newOther1Val,
            [other2Key]: newOther2Val
        });
    };

    // Handlers
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.type !== 'application/pdf') {
                toast.error('Only PDF files are allowed');
                e.target.value = '';
                setFile(null);
                return;
            }
            setFile(selectedFile);
            toast.success('File uploaded successfully');
        }
    };

    const handleAddMarkConfig = () => {
        setMarkConfigs([...markConfigs, { markValue: 1, count: 1, isMCQ: true }]);
    };

    const handleRemoveMarkConfig = (index: number) => {
        const newConfigs = [...markConfigs];
        newConfigs.splice(index, 1);
        setMarkConfigs(newConfigs);
    };

    const updateMarkConfig = (index: number, field: keyof MarkConfig, value: any) => {
        const newConfigs = [...markConfigs];
        // @ts-ignore
        newConfigs[index] = { ...newConfigs[index], [field]: value };

        // Auto-set isMCQ to false if marks > 1, to keep UI clean, though not strictly required
        if (field === 'markValue' && value > 1) {
            newConfigs[index].isMCQ = false;
        }
        // Auto-set isMCQ to true if marks == 1 (optional, user might want short answer)
        // Let's leave it to user choice, but default new rows to true.

        setMarkConfigs(newConfigs);
    };

    const calculateTotalMarks = () => {
        return markConfigs.reduce((acc, curr) => acc + curr.markValue * curr.count, 0);
    };

    const handleGenerate = async () => {
        if (!file) {
            toast.error('Please upload a PDF file first');
            return;
        }

        if (!chapters) {
            toast.error('Please enter specific chapter names or numbers');
            return;
        }

        if (markConfigs.length === 0) {
            toast.error('At least you should add one section to generate question paper');
            return;
        }

        const hasInvalidMarkValue = markConfigs.some((c) => c.markValue <= 0);
        if (hasInvalidMarkValue) {
            toast.error('Mark value must be greater than zero');
            return;
        }

        const hasInvalidCount = markConfigs.some((c) => c.count <= 0);
        if (hasInvalidCount) {
            toast.error('Number of questions must be at least 1 for all sections');
            return;
        }

        setIsLoading(true);
        setGeneratedPaper(null);
        setErrorLog(null);
        setErrorMessage(null);

        try {
            // Prepare Form Data
            const formData = new FormData();
            formData.append('file', file);
            formData.append('chapters', chapters);

            // Send standard config objects for backward compatibility if needed,
            // but we will send the full array now.
            formData.append('markConfig', JSON.stringify(markConfigs));
            formData.append('difficultyConfig', JSON.stringify(difficulty));

            const response = await fetch('/api/exam/generate-questions', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                // biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
                let errorData: any;
                try {
                    errorData = JSON.parse(errorText);
                } catch (e) {
                    console.error('Non-JSON Error Response:', errorText);
                    throw new Error(formatAiErrorMessage(errorText, `Server Error (${response.status}): ${response.statusText}`));
                }

                const rawErrorMessage = errorData?.error || 'Failed to generate questions';
                const formattedMessage = formatAiErrorMessage(rawErrorMessage);
                const isRateLimit = response.status === 429 || isAiRateLimitError(rawErrorMessage) || isAiRateLimitError(errorData?.details);

                if (!isRateLimit && errorData?.details) {
                    setErrorLog(errorData.details);
                } else {
                    setErrorLog(null);
                }
                throw new Error(formattedMessage);
            }

            const data = await response.json();
            setGeneratedPaper(data);
            setActiveTab('preview');
            toast.success('Question paper generated successfully');
        } catch (error: any) {
            console.error('Generation Error:', error);
            const isRateLimit = isAiRateLimitError(error);
            const displayMessage = formatAiErrorMessage(error, 'Error generating question paper. Please try again.');

            setErrorMessage(displayMessage);
            if (isRateLimit) {
                setErrorLog(null);
            } else if (!errorLog && error.stack) {
                setErrorLog(error.stack);
            }

            toast.error(displayMessage, { duration: 5000 });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadPDF = () => {
        if (!generatedPaper) return;

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        const maxWidth = pageWidth - margin * 2;
        let yPos = 20;

        const addNewPage = () => {
            doc.addPage();
            yPos = 20;
        };

        // Header
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(generatedPaper.title.toUpperCase(), pageWidth / 2, yPos, { align: 'center' });
        yPos += 10;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Total Marks: ${generatedPaper.totalMarks}`, pageWidth / 2, yPos, { align: 'center' });
        if (chapters) {
            yPos += 7;
            doc.text(`Chapters: ${chapters}`, pageWidth / 2, yPos, { align: 'center' });
        }
        yPos += 10;
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 10;

        // Content
        generatedPaper.sections.forEach((section, sIdx) => {
            // Check for page break
            if (yPos > pageHeight - 30) addNewPage();

            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(`Section ${String.fromCharCode(65 + sIdx)}: ${section.markValue} Marks Questions`, margin, yPos);
            yPos += 10;

            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');

            section.questions.forEach((q, qIdx) => {
                // Split text to fit page width
                const questionText = `${qIdx + 1}. ${q.text}`;
                const splitQuestion = doc.splitTextToSize(questionText, maxWidth);

                const qHeight = splitQuestion.length * 6;
                if (yPos + qHeight > pageHeight - margin) addNewPage();

                doc.text(splitQuestion, margin, yPos);
                yPos += qHeight + 2;

                if (q.type === 'MCQ' && q.options) {
                    q.options.forEach((opt) => {
                        const cleanOpt = opt.replace('*', '').trim();
                        const splitOpt = doc.splitTextToSize(`   ${cleanOpt}`, maxWidth - 5);

                        const optHeight = splitOpt.length * 6;
                        if (yPos + optHeight > pageHeight - margin) addNewPage();

                        doc.text(splitOpt, margin + 5, yPos);
                        yPos += optHeight;
                    });
                    yPos += 2;
                }

                // Add spacing between questions
                yPos += 5;
            });

            yPos += 5; // Extra space after section
        });

        doc.save(`question-paper-${Date.now()}.pdf`);
        toast.success('PDF Downloaded');
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-6 p-4 md:p-6'>
                {errorLog && (
                    <Alert variant='destructive'>
                        <AlertCircle className='h-4 w-4' />
                        <AlertTitle>Generation Failed</AlertTitle>
                        <AlertDescription className='mt-2'>
                            <div className='mb-2 font-semibold'>{errorMessage}</div>
                            <details className='cursor-pointer'>
                                <summary className='font-medium text-sm underline'>View Technical Details</summary>
                                <pre className='mt-2 w-full overflow-x-auto whitespace-pre-wrap rounded bg-black/5 p-2 font-mono text-xs leading-tight'>
                                    {errorLog}
                                </pre>
                            </details>
                        </AlertDescription>
                    </Alert>
                )}

                <Tabs value={activeTab} onValueChange={setActiveTab} className='space-y-6'>
                    <TabsList className='bg-muted/50 p-1'>
                        <TabsTrigger value='upload' className='px-8 font-bold'>
                            Configuration
                        </TabsTrigger>
                        <TabsTrigger value='preview' disabled={!generatedPaper} className='px-8 font-bold'>
                            Preview Paper
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value='upload' className='space-y-6'>
                        <div className='grid grid-cols-1 gap-6 md:grid-cols-12'>
                            {/* Left Column: Upload & Chapters */}
                            <div className='col-span-12 space-y-6 md:col-span-4'>
                                <Card>
                                    <CardHeader>
                                        <CardTitle className='flex items-center gap-2'>
                                            <Upload className='h-5 w-5 text-primary' />
                                            Source Material
                                        </CardTitle>
                                        <CardDescription>Upload your textbook PDF and select chapters.</CardDescription>
                                    </CardHeader>
                                    <CardContent className='space-y-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider'>
                                        <div className='grid w-full items-center gap-1.5'>
                                            <Label htmlFor='pdf-upload' className="after:ml-0.5 after:text-red-500 after:content-['*']">
                                                Textbook (PDF)
                                            </Label>
                                            {file ? (
                                                <div className='fade-in slide-in-from-top-1 flex animate-in items-center justify-between rounded-lg border border-primary/20 bg-primary/5 p-3 duration-300'>
                                                    <div className='flex items-center gap-3'>
                                                        <div className='flex h-10 w-10 items-center justify-center rounded-full bg-primary/10'>
                                                            <FileText className='h-5 w-5 text-primary' />
                                                        </div>
                                                        <div className='flex max-w-[200px] flex-col'>
                                                            <span className='truncate font-bold text-slate-900 text-sm'>{file.name}</span>
                                                            <span className='font-bold text-[10px] text-muted-foreground uppercase tracking-tighter'>
                                                                {(file.size / 1024 / 1024).toFixed(2)} MB • PDF
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
                                                    id='pdf-upload'
                                                    type='file'
                                                    accept='.pdf'
                                                    onChange={handleFileChange}
                                                    className='cursor-pointer file:font-semibold file:text-primary'
                                                />
                                            )}
                                        </div>

                                        <div className='grid w-full items-center gap-1.5 pt-2'>
                                            <Label htmlFor='chapters' className="after:ml-0.5 after:text-red-500 after:content-['*']">
                                                Chapter Numbers
                                            </Label>
                                            <Input
                                                id='chapters'
                                                placeholder='e.g. 1, 2, 5'
                                                value={chapters}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    // Allow numbers, commas, and dots only
                                                    if (/^[0-9,.\s]*$/.test(val)) {
                                                        setChapters(val);
                                                    }
                                                }}
                                                className='h-10'
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className='flex items-center gap-2'>
                                            <AlertCircle className='h-5 w-5' />
                                            Difficulty Mix
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className='space-y-5'>
                                        <div className='space-y-2'>
                                            <div className='flex justify-between font-bold text-xs'>
                                                <span>Easy ({difficulty.easy}%)</span>
                                            </div>
                                            <Slider
                                                value={[difficulty.easy]}
                                                max={100}
                                                step={5}
                                                onValueChange={(val: number[]) => handleDifficultyChange('easy', val[0])}
                                                className='py-1'
                                            />
                                        </div>
                                        <div className='space-y-2'>
                                            <div className='flex justify-between font-bold text-xs'>
                                                <span>Medium ({difficulty.medium}%)</span>
                                            </div>
                                            <Slider
                                                value={[difficulty.medium]}
                                                max={100}
                                                step={5}
                                                onValueChange={(val: number[]) => handleDifficultyChange('medium', val[0])}
                                                className='py-1'
                                            />
                                        </div>
                                        <div className='space-y-2'>
                                            <div className='flex justify-between font-bold text-xs'>
                                                <span>Hard ({difficulty.hard}%)</span>
                                            </div>
                                            <Slider
                                                value={[difficulty.hard]}
                                                max={100}
                                                step={5}
                                                onValueChange={(val: number[]) => handleDifficultyChange('hard', val[0])}
                                                className='py-1'
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right Column: Schema Configuration */}
                            <div className='col-span-12 md:col-span-8'>
                                <Card className='flex h-full flex-col'>
                                    <CardHeader>
                                        <CardTitle className='flex items-center gap-2'>
                                            <CheckCircle2 className='h-5 w-5 text-primary' />
                                            Question Paper Schema
                                        </CardTitle>
                                        <CardDescription>Configure the distribution of marks and number of questions.</CardDescription>
                                    </CardHeader>
                                    <CardContent className='flex-1 space-y-4'>
                                        <div className='rounded-md border'>
                                            <div className='grid grid-cols-12 gap-4 border-b bg-muted/50 p-4 font-bold text-xs uppercase tracking-wider'>
                                                <div className='col-span-3'>Mark Value</div>
                                                <div className='col-span-3'>No. of Questions</div>
                                                <div className='col-span-3 text-center'>Type</div>
                                                <div className='col-span-2 text-right'>Subtotal</div>
                                                {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
                                                <div className='col-span-1'></div>
                                            </div>
                                            <div className='divide-y'>
                                                {markConfigs.map((config, index) => (
                                                    <div key={index} className='grid grid-cols-12 items-center gap-4 p-4'>
                                                        <div className='col-span-3'>
                                                            <Input
                                                                type='number'
                                                                min='1'
                                                                value={config.markValue}
                                                                onChange={(e) =>
                                                                    updateMarkConfig(
                                                                        index,
                                                                        'markValue',
                                                                        Number.parseInt(e.target.value) || 0
                                                                    )
                                                                }
                                                                className='h-9'
                                                            />
                                                        </div>
                                                        <div className='col-span-3'>
                                                            <Input
                                                                type='number'
                                                                min='0'
                                                                value={config.count}
                                                                onChange={(e) =>
                                                                    updateMarkConfig(index, 'count', Number.parseInt(e.target.value) || 0)
                                                                }
                                                                className='h-9'
                                                            />
                                                        </div>
                                                        <div className='col-span-3 flex items-center justify-center'>
                                                            {config.markValue === 1 ? (
                                                                <div className='flex items-center space-x-2'>
                                                                    <Checkbox
                                                                        id={`mcq-${index}`}
                                                                        checked={config.isMCQ}
                                                                        onCheckedChange={(checked) =>
                                                                            updateMarkConfig(index, 'isMCQ', checked === true)
                                                                        }
                                                                    />
                                                                    <label
                                                                        htmlFor={`mcq-${index}`}
                                                                        className='font-medium text-sm leading-none'>
                                                                        MCQ
                                                                    </label>
                                                                </div>
                                                            ) : (
                                                                <span className='text-muted-foreground text-xs'>-</span>
                                                            )}
                                                        </div>
                                                        <div className='col-span-2 text-right font-semibold text-primary'>
                                                            {config.markValue * config.count}
                                                        </div>
                                                        <div className='col-span-1 flex justify-end'>
                                                            <Button
                                                                variant='ghost'
                                                                size='icon'
                                                                onClick={() => handleRemoveMarkConfig(index)}
                                                                className='h-8 w-8 text-destructive hover:bg-destructive/10'>
                                                                <Trash2 className='h-4 w-4' />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <Button variant='outline' onClick={handleAddMarkConfig} className='w-full border-dashed'>
                                            <Plus className='mr-2 h-4 w-4' /> Add Section
                                        </Button>
                                    </CardContent>
                                    <CardFooter className='flex items-center justify-between border-t bg-muted/10 p-6'>
                                        <div className='flex flex-col'>
                                            <span className='font-bold text-muted-foreground text-xs uppercase tracking-wider'>
                                                Total Marks Estimate
                                            </span>
                                            <span className='font-bold text-3xl'>
                                                {calculateTotalMarks()}
                                                <span className='ml-1 font-normal text-muted-foreground text-sm'>pts</span>
                                            </span>
                                        </div>
                                        <Button size='lg' onClick={handleGenerate} disabled={isLoading} className='min-w-[200px]'>
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Generating...
                                                </>
                                            ) : (
                                                <>
                                                    <Check className='mr-2 h-4 w-4' /> Generate Paper
                                                </>
                                            )}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value='preview' className='space-y-6'>
                        {generatedPaper && (
                            <div className='mb-4 flex justify-end gap-2'>
                                <Button onClick={handleDownloadPDF} variant='outline'>
                                    <Download className='mr-2 h-4 w-4' /> Download PDF
                                </Button>
                            </div>
                        )}
                        {generatedPaper ? (
                            <div className='fade-in mx-auto max-w-4xl animate-in space-y-8 duration-500'>
                                <Card className='bg-white p-8 shadow-sm md:p-12'>
                                    <div className='mb-12 space-y-4 text-center'>
                                        <div className='font-semibold text-muted-foreground text-sm uppercase tracking-widest'>
                                            {chapters ? `Chapters: ${chapters}` : 'Full Syllabus'}
                                        </div>
                                        <h2 className='font-bold text-3xl text-gray-900 md:text-4xl'>{generatedPaper.title}</h2>
                                        <div className='inline-flex items-center rounded-full border bg-slate-100 px-4 py-1 font-medium text-slate-800'>
                                            Max Marks: {generatedPaper.totalMarks}
                                        </div>
                                    </div>

                                    <div className='space-y-10'>
                                        {generatedPaper.sections.map((section, idx) => (
                                            <div key={idx} className='space-y-6'>
                                                <div className='flex items-center gap-4'>
                                                    <h3 className='rounded-sm bg-primary px-4 py-1 font-bold text-lg text-primary-foreground uppercase tracking-wider'>
                                                        Section {String.fromCharCode(65 + idx)}
                                                    </h3>
                                                    <span className='font-medium text-muted-foreground'>
                                                        {section.markValue} marks per question
                                                    </span>
                                                </div>

                                                <div className='space-y-8 pl-2'>
                                                    {section.questions.map((q, qIdx) => (
                                                        <div
                                                            key={qIdx}
                                                            className='group relative border-transparent border-l-2 pl-8 transition-colors'>
                                                            <span className='-translate-x-[calc(100%+8px)] absolute top-0 left-0 w-6 text-right font-bold text-muted-foreground/40'>
                                                                {qIdx + 1}.
                                                            </span>
                                                            <div className='space-y-3'>
                                                                <p className='text-gray-800 text-lg leading-relaxed'>{q.text}</p>

                                                                {q.type === 'MCQ' && q.options && (
                                                                    <div className='mt-4 grid grid-cols-1 gap-3 md:grid-cols-2'>
                                                                        {q.options.map((opt, oIdx) => (
                                                                            <div
                                                                                key={oIdx}
                                                                                className={
                                                                                    'rounded-lg border border-muted bg-muted/10 p-3 text-foreground/70 text-sm'
                                                                                }>
                                                                                {opt.replace('*', '').trim()}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}

                                                                <div className='mt-2 flex gap-2'>
                                                                    <Badge variant='secondary' className='text-xs'>
                                                                        {q.difficulty}
                                                                    </Badge>
                                                                    <Badge variant='outline' className='text-xs'>
                                                                        {q.topic}
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <Separator className='my-8' />
                                            </div>
                                        ))}
                                    </div>

                                    <div className='mt-16 border-t pt-8 text-center text-muted-foreground text-sm'>
                                        Generated by AI Question Paper Generator • {new Date().getFullYear()}
                                    </div>
                                </Card>
                            </div>
                        ) : (
                            <div className='flex h-[500px] flex-col items-center justify-center rounded-xl border-2 border-dashed bg-muted/5'>
                                <Loader2 className='mb-4 h-10 w-10 animate-spin text-muted-foreground/20' />
                                <p className='text-muted-foreground'>Generating your paper...</p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
