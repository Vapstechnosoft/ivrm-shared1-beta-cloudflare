'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    AlertCircle,
    BrainCircuit,
    Briefcase,
    CheckCircle2,
    Eye,
    FileText,
    GraduationCap,
    Info,
    Mail,
    Phone,
    Search,
    Sparkles,
    Target,
    UploadCloud,
    User,
    XCircle,
    Zap
} from 'lucide-react';
import * as React from 'react';
import { analyzeResume } from './actions';

export default function AIResumeCheckerPage() {
    const [isUploading, setIsUploading] = React.useState(false);
    const [isAnalyzed, setIsAnalyzed] = React.useState(false);
    const [uploadProgress, setUploadProgress] = React.useState(0);
    const [resumeFile, setResumeFile] = React.useState<File | null>(null);
    const [jdText, setJdText] = React.useState('');
    const [jdFile, setJdFile] = React.useState<File | null>(null);
    const [error, setError] = React.useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = React.useState<any>(null);
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

    const handlePreview = (file: File | null) => (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (file) {
            const url = URL.createObjectURL(file);
            window.open(url, '_blank');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const allowedExtensions = ['.pdf', '.docx', '.doc'];
            const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

            if (!allowedExtensions.includes(fileExtension)) {
                setError('Format Not Accepted. Please upload only PDF or Word documents (.pdf, .docx, .doc).');
                setResumeFile(null);
                e.target.value = '';
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                setError('File size exceeds 5MB limit.');
                setResumeFile(null);
                e.target.value = '';
                return;
            }

            setResumeFile(file);
            setError(null);
            setIsAnalyzed(false);
            setAnalysisResult(null);
        }
    };

    const handleUpload = async () => {
        if (!resumeFile) {
            setError('Please upload a resume file.');
            return;
        }

        if (!jdFile && !jdText.trim()) {
            setError('Please provide a Job Description (paste text or upload file).');
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);
        setError(null);

        const interval = setInterval(() => {
            setUploadProgress((prev) => {
                if (prev >= 90) {
                    clearInterval(interval);
                    return 90;
                }
                return prev + 10;
            });
        }, 300);

        try {
            const formData = new FormData();
            formData.append('resume', resumeFile);

            if (jdFile) {
                formData.append('jd_file', jdFile);
            } else if (jdText.trim()) {
                formData.append('jd_text', jdText);
            }

            const response = await analyzeResume(formData);

            clearInterval(interval);
            setUploadProgress(100);

            if (response.success) {
                setAnalysisResult(response.data);
                setIsAnalyzed(true);
            } else {
                setError(response.error || 'Failed to analyze resume.');
            }
        } catch (err: any) {
            clearInterval(interval);
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setTimeout(() => setIsUploading(false), 500);
        }
    };

    const getScoreColor = (score: number | string, decision: string) => {
        if (decision === 'HIGHLY SUITABLE' || decision === 'SUITABLE') return 'text-emerald-600';
        if (decision === 'MAYBE') return 'text-amber-500';
        return 'text-red-500';
    };

    const getScoreBg = (decision: string) => {
        if (decision === 'HIGHLY SUITABLE' || decision === 'SUITABLE') return 'bg-emerald-50 border-emerald-200';
        if (decision === 'MAYBE') return 'bg-amber-50 border-amber-200';
        return 'bg-red-50 border-red-200';
    };

    return (
        <div className='min-h-screen bg-gray-50 py-8'>
            <div className='mx-auto max-w-7xl space-y-6 px-4'>
                <div className='rounded-xl border border-slate-200 bg-white p-5 shadow-sm'>
                    <div className='mb-4 flex items-center gap-3'>
                        <div className='rounded-lg bg-indigo-50 p-2'>
                            <Info className='h-5 w-5 text-indigo-600' />
                        </div>
                        <div>
                            <h2 className='font-bold text-lg text-slate-800'>How to Use AI Resume Checker</h2>
                            <p className='text-slate-500 text-xs'>Evaluate your profile against industry standards in two simple steps</p>
                        </div>
                    </div>
                    <div className='mt-4 grid grid-cols-1 gap-10 md:grid-cols-2'>
                        <div className='flex gap-4'>
                            <div className='flex-none'>
                                <span className='flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 font-bold text-sm text-white shadow-indigo-100 shadow-lg'>
                                    1
                                </span>
                            </div>
                            <div className='space-y-1'>
                                <p className='font-bold text-base text-slate-800'>Upload & Define</p>
                                <p className='text-slate-600 text-sm leading-relaxed'>
                                    Upload your resume (PDF/DOCX) and provide the Job Description (text or file).
                                </p>
                            </div>
                        </div>
                        <div className='flex gap-4'>
                            <div className='flex-none'>
                                <span className='flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 font-bold text-sm text-white shadow-indigo-100 shadow-lg'>
                                    2
                                </span>
                            </div>
                            <div className='space-y-1'>
                                <p className='font-bold text-base text-slate-800'>Get AI Insights</p>
                                <p className='text-slate-600 text-sm leading-relaxed'>
                                    Receive instant ATS score, detailed skills breakdown, and AI executive report.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                {error && (
                    <div className='fade-in slide-in-from-top-2 flex animate-in items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600 shadow-sm'>
                        <AlertCircle className='h-5 w-5' />
                        {error}
                    </div>
                )}

                <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
                    {/* Upload Section */}
                    <div className='space-y-6 lg:col-span-1'>
                        <Card className='group overflow-hidden border-none bg-white/80 shadow-xl backdrop-blur-sm'>
                            <div className='h-2 bg-gradient-to-r from-indigo-500 to-purple-500' />
                            <CardHeader>
                                <CardTitle className='flex items-center gap-2'>
                                    <UploadCloud className='h-5 w-5 text-indigo-600' />
                                    Upload Document
                                </CardTitle>
                                <CardDescription>PDF, DOCX supported. Max 5MB.</CardDescription>
                            </CardHeader>
                            <CardContent className='space-y-6'>
                                <div className='group/upload relative cursor-pointer rounded-2xl border-2 border-slate-200 border-dashed bg-white p-8 text-center transition-all duration-300 hover:border-indigo-400 hover:bg-indigo-50/50'>
                                    <input
                                        type='file'
                                        className='absolute inset-0 cursor-pointer opacity-0'
                                        onChange={handleFileChange}
                                        accept='.pdf,.doc,.docx'
                                    />
                                    <div className='pointer-events-none relative flex flex-col items-center justify-center space-y-3'>
                                        <div className='pointer-events-auto relative flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 transition-transform duration-300 group-hover/upload:scale-110'>
                                            <FileText className='h-6 w-6' />
                                            {resumeFile && (
                                                <Button
                                                    variant='secondary'
                                                    size='icon'
                                                    className='-right-2 -top-2 absolute h-6 w-6 rounded-full bg-white text-indigo-600 shadow-sm hover:bg-indigo-50'
                                                    onClick={handlePreview(resumeFile)}>
                                                    <Eye className='h-3 w-3' />
                                                </Button>
                                            )}
                                        </div>
                                        <div>
                                            {resumeFile ? (
                                                <p className='mx-auto max-w-[200px] truncate font-bold text-indigo-700'>
                                                    {resumeFile.name}
                                                </p>
                                            ) : (
                                                <>
                                                    <p className='font-semibold text-slate-700'>Drop your resume here</p>
                                                    <p className='text-slate-500 text-sm'>or click to browse</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className='space-y-3'>
                                    <Label className='flex items-center gap-2 font-bold text-slate-700'>
                                        <Target className='h-4 w-4' /> Job Description
                                    </Label>
                                    <Tabs defaultValue='text' className='w-full'>
                                        <TabsList className='mb-2 grid w-full grid-cols-2 bg-slate-100/50 p-1'>
                                            <TabsTrigger value='text' className='font-bold text-[10px] uppercase tracking-wider'>
                                                Paste Text
                                            </TabsTrigger>
                                            <TabsTrigger value='file' className='font-bold text-[10px] uppercase tracking-wider'>
                                                Upload File
                                            </TabsTrigger>
                                        </TabsList>
                                        <TabsContent value='text' className='mt-0'>
                                            <textarea
                                                className='min-h-[120px] w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-[11px] shadow-inner outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500'
                                                placeholder='Paste job description for precise ATS matching...'
                                                value={jdText}
                                                onChange={(e) => {
                                                    setJdText(e.target.value);
                                                    if (e.target.value) setJdFile(null);
                                                }}
                                            />
                                        </TabsContent>
                                        <TabsContent value='file' className='mt-0'>
                                            <div className='relative rounded-xl border border-slate-200 border-dashed bg-white p-6 text-center transition-all hover:bg-slate-50'>
                                                <div className='pointer-events-none space-y-2'>
                                                    <div className='pointer-events-auto relative mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50'>
                                                        <FileText className='h-4 w-4 text-indigo-600' />
                                                        {jdFile && (
                                                            <Button
                                                                variant='secondary'
                                                                size='icon'
                                                                className='-right-2 -top-1 absolute h-5 w-5 rounded-full bg-white text-indigo-600 shadow-sm hover:bg-indigo-50'
                                                                onClick={handlePreview(jdFile)}>
                                                                <Eye className='h-2.5 w-2.5' />
                                                            </Button>
                                                        )}
                                                    </div>
                                                    <p className='font-medium text-[11px] text-slate-700'>
                                                        {jdFile ? jdFile.name : 'Click to upload JD File (PDF/Word)'}
                                                    </p>
                                                    {jdFile && (
                                                        <p className='font-bold text-[10px] text-emerald-600'>File Loaded Successfully</p>
                                                    )}
                                                </div>
                                                <input
                                                    type='file'
                                                    className='absolute inset-0 z-0 cursor-pointer opacity-0'
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
                                                            if (['.pdf', '.docx', '.doc'].includes(ext)) {
                                                                setJdFile(file);
                                                                setJdText('');
                                                            } else {
                                                                setError('JD format not accepted. PDF/Word only.');
                                                            }
                                                        }
                                                    }}
                                                    accept='.pdf,.doc,.docx'
                                                />
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </div>

                                <Button
                                    className='w-full rounded-xl bg-indigo-600 py-6 font-bold text-lg text-white shadow-indigo-200 shadow-lg transition-all hover:bg-indigo-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50'
                                    onClick={handleUpload}
                                    disabled={isUploading || !resumeFile || (!jdFile && !jdText.trim())}>
                                    {isUploading ? (
                                        <>
                                            <div className='mr-3 h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white' />
                                            Analyzing Profile...
                                        </>
                                    ) : (
                                        <>
                                            <Zap className='mr-2 h-5 w-5' />
                                            Analyze with AI
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Results Section */}
                    <div className='lg:col-span-2'>
                        <Card className='flex h-full flex-col overflow-hidden border-none bg-white shadow-xl'>
                            <div className='h-2 bg-gradient-to-r from-indigo-500 to-purple-500' />
                            <CardHeader className='flex-none border-slate-50 border-b bg-slate-50/50'>
                                <CardTitle className='flex items-center justify-between'>
                                    <div className='flex items-center gap-2'>
                                        <Sparkles className='h-5 w-5 text-indigo-600' />
                                        <span className='text-indigo-600'>Analysis Report</span>
                                    </div>
                                    {isAnalyzed && analysisResult?.score?.decision && (
                                        <Badge
                                            variant='outline'
                                            className={`px-3 py-1 ${
                                                analysisResult.score.decision === 'HIGHLY SUITABLE' ||
                                                analysisResult.score.decision === 'SUITABLE'
                                                    ? 'border-emerald-500 text-emerald-700'
                                                    : analysisResult.score.decision === 'MAYBE'
                                                      ? 'border-amber-500 text-amber-700'
                                                      : 'border-red-500 text-red-700'
                                            }`}>
                                            {analysisResult.score.decision}
                                        </Badge>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className='relative flex-1 p-0'>
                                <ScrollArea className='h-[700px] w-full'>
                                    <div className='p-6'>
                                        {isUploading ? (
                                            <div className='flex h-full flex-col items-center justify-center space-y-8 py-32'>
                                                <div className='relative'>
                                                    <div className='h-32 w-32 animate-spin rounded-full border-4 border-slate-100 border-t-indigo-600' />
                                                    <BrainCircuit className='absolute inset-0 m-auto h-12 w-12 animate-pulse text-indigo-600' />
                                                </div>
                                                <div className='space-y-2 text-center'>
                                                    <h3 className='font-bold text-2xl text-slate-800'>AI Engine Processing</h3>
                                                    <p className='text-slate-500 italic'>
                                                        "Extracting entities, calculating TF-IDF, running LLM analysis..."
                                                    </p>
                                                </div>
                                                <div className='w-full max-w-md'>
                                                    <Progress value={uploadProgress} className='h-2' />
                                                </div>
                                            </div>
                                        ) : isAnalyzed && analysisResult ? (
                                            <div className='fade-in slide-in-from-bottom-4 animate-in space-y-8 duration-500'>
                                                {/* Top Metrics Grid */}
                                                <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                                                    <div
                                                        className={`col-span-1 flex flex-col items-center justify-center rounded-2xl border p-6 text-center shadow-sm ${getScoreBg(analysisResult?.score?.decision || '')}`}>
                                                        <p className='mb-2 font-bold text-sm uppercase tracking-wider opacity-80'>
                                                            ATS Score
                                                        </p>
                                                        <div
                                                            className={`font-black text-5xl tracking-tighter ${getScoreColor(0, analysisResult?.score?.decision || '')}`}>
                                                            {analysisResult?.score?.value ?? 'N/A'}
                                                        </div>
                                                    </div>

                                                    <div className='col-span-2 flex flex-col justify-center space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'>
                                                        <div className='flex items-center justify-between'>
                                                            <div className='flex items-center gap-2 text-slate-700'>
                                                                <Briefcase className='h-5 w-5 text-indigo-500' />
                                                                <span className='font-semibold'>Experience</span>
                                                            </div>
                                                            <div className='text-right'>
                                                                <span className='font-bold text-slate-900'>
                                                                    {analysisResult?.candidate?.experience_years || 0} years
                                                                </span>
                                                                <span className='block text-slate-500 text-xs'>
                                                                    Req: {analysisResult?.job?.min_experience || 0} years
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className='flex items-center justify-between'>
                                                            <div className='flex items-center gap-2 text-slate-700'>
                                                                <GraduationCap className='h-5 w-5 text-indigo-500' />
                                                                <span className='font-semibold'>Education</span>
                                                            </div>
                                                            <div className='flex items-center gap-2 text-right'>
                                                                {analysisResult?.score?.breakdown?.education?.meets ? (
                                                                    <CheckCircle2 className='h-5 w-5 text-emerald-500' />
                                                                ) : (
                                                                    <XCircle className='h-5 w-5 text-red-500' />
                                                                )}
                                                                <span className='font-medium text-slate-700 text-sm'>
                                                                    {analysisResult?.score?.breakdown?.education?.note || 'Checked'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* AI Report / Insights */}
                                                {analysisResult?.report?.text && (
                                                    <div className='relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-purple-50 p-6 shadow-sm'>
                                                        <Sparkles className='-right-4 -top-4 absolute h-24 w-24 text-indigo-500/10' />
                                                        <h3 className='mb-3 flex items-center gap-2 font-bold text-indigo-900 text-lg'>
                                                            <BrainCircuit className='h-5 w-5' />
                                                            AI Executive Summary
                                                        </h3>
                                                        <p className='relative z-10 whitespace-pre-wrap text-slate-700 text-sm leading-relaxed'>
                                                            {analysisResult.report.text}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Fallback if report failed */}
                                                {analysisResult?.report?.error && !analysisResult?.report?.text && (
                                                    <div className='flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4'>
                                                        <AlertCircle className='mt-0.5 h-5 w-5 shrink-0 text-amber-500' />
                                                        <div>
                                                            <p className='font-bold text-amber-800 text-sm'>LLM Summary Unavailable</p>
                                                            <p className='mt-1 text-amber-700 text-xs'>
                                                                The system successfully parsed the resume and generated scores, but the
                                                                detailed text summary encountered a backend LLM error.
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                <Tabs defaultValue='skills' className='w-full'>
                                                    <TabsList className='grid w-full grid-cols-2 rounded-xl bg-slate-100/80 p-1'>
                                                        <TabsTrigger
                                                            value='skills'
                                                            className='rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm'>
                                                            Skills Analysis
                                                        </TabsTrigger>
                                                        <TabsTrigger
                                                            value='profile'
                                                            className='rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm'>
                                                            Extracted Profile
                                                        </TabsTrigger>
                                                    </TabsList>

                                                    <TabsContent value='skills' className='mt-6 space-y-6'>
                                                        {/* Matched Terms Overview */}
                                                        {analysisResult?.score?.top_matched_terms?.length > 0 && (
                                                            <div>
                                                                <h4 className='mb-3 font-bold text-slate-800 text-sm uppercase tracking-wider'>
                                                                    Top Keyword Matches
                                                                </h4>
                                                                <div className='flex flex-wrap gap-2'>
                                                                    {analysisResult.score.top_matched_terms.map(
                                                                        (term: string, i: number) => (
                                                                            <Badge
                                                                                key={i}
                                                                                className='border-none bg-indigo-100 px-3 py-1 font-medium text-indigo-700 text-sm hover:bg-indigo-200'>
                                                                                {term}
                                                                            </Badge>
                                                                        )
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                                                            {/* Technical Skills */}
                                                            <div className='space-y-4'>
                                                                <div className='flex items-center justify-between border-b pb-2'>
                                                                    <h4 className='flex items-center gap-2 font-bold text-slate-800'>
                                                                        <Target className='h-4 w-4 text-emerald-500' />
                                                                        Matched Technical
                                                                    </h4>
                                                                    <Badge variant='outline'>
                                                                        {analysisResult?.score?.breakdown?.required_technical_skills
                                                                            ?.match_pct || 0}
                                                                        %
                                                                    </Badge>
                                                                </div>
                                                                <div className='flex flex-wrap gap-2'>
                                                                    {analysisResult?.score?.breakdown?.required_technical_skills?.matched
                                                                        ?.length > 0 ? (
                                                                        analysisResult.score.breakdown.required_technical_skills.matched.map(
                                                                            (s: string, i: number) => (
                                                                                <Badge
                                                                                    key={i}
                                                                                    className='border-none bg-emerald-100 text-emerald-700 hover:bg-emerald-200'>
                                                                                    {s}
                                                                                </Badge>
                                                                            )
                                                                        )
                                                                    ) : (
                                                                        <span className='text-slate-400 text-sm italic'>
                                                                            No matches found
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Missing Skills */}
                                                            <div className='space-y-4'>
                                                                <div className='flex items-center justify-between border-b pb-2'>
                                                                    <h4 className='flex items-center gap-2 font-bold text-slate-800'>
                                                                        <AlertCircle className='h-4 w-4 text-red-500' />
                                                                        Missing Skills
                                                                    </h4>
                                                                </div>
                                                                <div className='flex flex-wrap gap-2'>
                                                                    {analysisResult?.score?.breakdown?.required_technical_skills?.missing
                                                                        ?.length > 0 ? (
                                                                        analysisResult.score.breakdown.required_technical_skills.missing.map(
                                                                            (s: string, i: number) => (
                                                                                <Badge
                                                                                    key={i}
                                                                                    variant='outline'
                                                                                    className='border-red-200 bg-red-50 text-red-600'>
                                                                                    {s}
                                                                                </Badge>
                                                                            )
                                                                        )
                                                                    ) : (
                                                                        <span className='font-medium text-emerald-600 text-sm'>
                                                                            All required skills met!
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TabsContent>

                                                    <TabsContent value='profile' className='mt-6'>
                                                        <div className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
                                                            <div className='flex items-start gap-4 border-slate-200 border-b bg-slate-50 p-6'>
                                                                <div className='flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600'>
                                                                    <User className='h-8 w-8' />
                                                                </div>
                                                                <div className='space-y-1'>
                                                                    <h3 className='font-bold text-slate-900 text-xl'>
                                                                        {analysisResult?.candidate?.name || 'Unknown Candidate'}
                                                                    </h3>
                                                                    <div className='flex flex-wrap gap-x-4 gap-y-2 text-slate-600 text-sm'>
                                                                        <span className='flex items-center gap-1.5'>
                                                                            <Mail className='h-3.5 w-3.5' />{' '}
                                                                            {analysisResult?.candidate?.email || 'Not extracted'}
                                                                        </span>
                                                                        <span className='flex items-center gap-1.5'>
                                                                            <Phone className='h-3.5 w-3.5' />{' '}
                                                                            {analysisResult?.candidate?.phone || 'Not extracted'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className='p-6'>
                                                                <h4 className='mb-4 font-bold text-slate-800 text-sm uppercase tracking-wider'>
                                                                    Extracted Details
                                                                </h4>
                                                                <div className='grid grid-cols-1 gap-x-4 gap-y-6 md:grid-cols-2'>
                                                                    <div>
                                                                        <p className='mb-1 flex items-center gap-1.5 text-slate-500 text-sm'>
                                                                            <Briefcase className='h-4 w-4' /> Experience
                                                                        </p>
                                                                        <p className='font-medium text-slate-900'>
                                                                            {analysisResult?.candidate?.experience_years ?? 0} Years Total
                                                                        </p>
                                                                    </div>
                                                                    <div>
                                                                        <p className='mb-1 flex items-center gap-1.5 text-slate-500 text-sm'>
                                                                            <GraduationCap className='h-4 w-4' /> Education Focus
                                                                        </p>
                                                                        <p className='font-medium text-slate-900'>
                                                                            {analysisResult?.candidate?.education?.field || 'Not specified'}
                                                                        </p>
                                                                    </div>
                                                                    <div className='md:col-span-2'>
                                                                        <p className='mb-2 flex items-center gap-1.5 text-slate-500 text-sm'>
                                                                            <Zap className='h-4 w-4 text-emerald-500' /> Extracted Technical
                                                                            Skills
                                                                        </p>
                                                                        <div className='flex flex-wrap gap-1.5'>
                                                                            {analysisResult?.candidate?.skills?.technical?.length > 0 ? (
                                                                                analysisResult.candidate.skills.technical.map(
                                                                                    (s: string, i: number) => (
                                                                                        <Badge
                                                                                            key={i}
                                                                                            variant='secondary'
                                                                                            className='bg-emerald-50 text-emerald-700 hover:bg-emerald-100'>
                                                                                            {s}
                                                                                        </Badge>
                                                                                    )
                                                                                )
                                                                            ) : (
                                                                                <span className='text-slate-400 text-sm'>
                                                                                    None detected
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    {analysisResult?.candidate?.skills?.soft?.length > 0 && (
                                                                        <div className='md:col-span-2'>
                                                                            <p className='mb-2 flex items-center gap-1.5 text-slate-500 text-sm'>
                                                                                <Sparkles className='h-4 w-4 text-amber-500' />{' '}
                                                                                Interpersonal & Soft Skills
                                                                            </p>
                                                                            <div className='flex flex-wrap gap-1.5'>
                                                                                {analysisResult.candidate.skills.soft.map(
                                                                                    (s: string, i: number) => (
                                                                                        <Badge
                                                                                            key={i}
                                                                                            variant='secondary'
                                                                                            className='bg-amber-50 text-amber-700 hover:bg-amber-100'>
                                                                                            {s}
                                                                                        </Badge>
                                                                                    )
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TabsContent>
                                                </Tabs>
                                            </div>
                                        ) : (
                                            <div className='flex h-full flex-col items-center justify-center py-32 text-center text-slate-400'>
                                                <Search className='mx-auto mb-6 h-20 w-20 opacity-20' />
                                                <h3 className='mb-2 font-bold text-slate-700 text-xl'>Awaiting Document</h3>
                                                <p className='max-w-md text-slate-500'>
                                                    Upload a resume and click 'Analyze with AI' to generate a comprehensive ATS
                                                    compatibility report.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
