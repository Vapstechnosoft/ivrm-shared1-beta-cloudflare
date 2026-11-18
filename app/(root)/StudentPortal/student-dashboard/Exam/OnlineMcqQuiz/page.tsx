'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowRight,
    BarChart3,
    Brain,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock,
    FileText,
    PlayCircle,
    Sparkles,
    Target,
    TrendingDown,
    TrendingUp,
    Trophy,
    X
} from 'lucide-react';
import { getAvailableExams, getExamQuestions, saveAnswer, submitExam } from '@/server/naac/lp-online-exam/student-exam';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function StudentOnlineMcqQuizPage() {
    // Current student ID (Mocked for now, usually from session)
    const [studentId] = useState('student-demo');

    // View States: 'dashboard' | 'taking-quiz' | 'result'
    const [viewMode, setViewMode] = useState<'dashboard' | 'taking-quiz' | 'result'>('dashboard');

    // Data States
    const [availableQuizzes, setAvailableQuizzes] = useState<any[]>([]);
    const [studentAnalytics, setStudentAnalytics] = useState<any>(null);
    const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Quiz Execution State
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionResult, setSubmissionResult] = useState<any>(null);
    const [detailedAnalysis, setDetailedAnalysis] = useState<any>(null);
    const [isFetchingAnalysis, setIsFetchingAnalysis] = useState(false);
    const [showAnalysisModal, setShowAnalysisModal] = useState(false);

    // Initial Fetch
    useEffect(() => {
        const loadDashboard = async () => {
            setLoading(true);
            try {
                // 1. Fetch exams from Backend
                const res = await getAvailableExams();
                if (res.success) {
                    const exams = res.data || [];
                    const mappedQuizzes = exams.map((exam: any) => ({
                        id: exam.lpmoeeX_Id || exam.LPMOEEX_Id,
                        title: exam.lpmoeeX_ExamName || exam.LPMOEEX_ExamName,
                        questionsCount: exam.lpmoeeX_NoOfQuestion || exam.LPMOEEX_NoOfQuestion || 0,
                        duration: exam.lpmoeeX_Duration || exam.LPMOEEX_Duration || 'N/A',
                        activeFrom: exam.lpmoeeX_FromDateTime || exam.LPMOEEX_FromDateTime,
                        activeTo: exam.lpmoeeX_ToDateTime || exam.LPMOEEX_ToDateTime,
                        date: new Date(exam.lpmoeeX_CreatedDate || exam.LPMOEEX_CreatedDate || Date.now()).toLocaleDateString()
                    }));
                    
                    // Filter by availability window (Only show if current time is within [activeFrom, activeTo])
                    const now = new Date();
                    const filteredQuizzes = mappedQuizzes.filter((quiz: any) => {
                        if (!quiz.activeFrom && !quiz.activeTo) return true; // Show if no window specified
                        const from = quiz.activeFrom ? new Date(quiz.activeFrom) : new Date(0);
                        const to = quiz.activeTo ? new Date(quiz.activeTo) : new Date(8640000000000000); // Max date
                        return now >= from && now <= to;
                    });
                    
                    setAvailableQuizzes(filteredQuizzes);
                } else {
                    toast.error(`Failed to load exams: ${res.message}`);
                }

                // 2. Load Student Analytics (To check attempts)
                const analyticsRes = await fetch(`/api/exam/student-analytics/${studentId}`);
                if (analyticsRes.ok) {
                    const data = await analyticsRes.json();
                    setStudentAnalytics(data);
                }
            } catch (err) {
                console.error(err);
                toast.error('Failed to load portal data');
            } finally {
                setLoading(false);
            }
        };
        loadDashboard();

        // Refresh filter every minute
        const interval = setInterval(loadDashboard, 60000);
        return () => clearInterval(interval);
    }, [studentId]);

    const handleStartQuiz = async (quiz: any) => {
        // 1. Check if already answered
        const attempts = Array.isArray(studentAnalytics?.attempts) ? studentAnalytics.attempts : [];
        const hasAttempted = attempts.some((a: any) => a.exam_id === quiz.id);

        if (hasAttempted) {
            toast.error('You have already attended this assessment');
            return;
        }

        // 2. Strict Availability Window Check
        const now = new Date();
        if (quiz.activeTo && now > new Date(quiz.activeTo)) {
            toast.error('This assessment window has closed and is no longer accessible.');
            // Re-filter list
            setAvailableQuizzes((prev) => prev.filter((q) => q.id !== quiz.id));
            return;
        }

        if (quiz.activeFrom && now < new Date(quiz.activeFrom)) {
            toast.error('This assessment is not yet active.');
            return;
        }

        setSelectedQuiz(quiz);
        setLoading(true);

        try {
            const res = await getExamQuestions(quiz.id);
            if (res.success && res.data) {
                // Ensure questions is an array
                const questionsList = Array.isArray(res.data) ? res.data : 
                                    (res.data.$values ? res.data.$values : []);
                
                if (questionsList.length === 0) {
                    toast.error('This assessment has no questions yet.');
                    return;
                }

                // The backend now returns { id, question_text, type, order, options }
                // where options is an array of strings.
                setSelectedQuiz({ 
                    ...quiz, 
                    questions: questionsList 
                });
                
                setViewMode('taking-quiz');
                setCurrentQuestionIdx(0);
                setUserAnswers({});
            } else {
                toast.error(`Cannot load quiz: ${res.message || 'Unknown error'}`);
            }
        } catch (err: any) {
            toast.error('Cannot load quiz: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitQuiz = async () => {
        setIsSubmitting(true);
        try {
            // Save answers iteratively
            const savePromises = selectedQuiz.questions.map((q: any, idx: number) => {
                if (!userAnswers[idx]) return Promise.resolve(null);
                
                const payload = {
                    LPMOEEX_Id: selectedQuiz.id,
                    LPMOEQ_Id: q.id || idx + 1,
                    LPMOEQOA_Id: 0, // Not matching with option ID yet
                    Answer: userAnswers[idx] || ''
                };
                return saveAnswer(payload);
            });

            await Promise.all(savePromises);

            // Final submit
            const res = await submitExam(selectedQuiz.id);
            
            if (!res.success) {
                toast.error(`Error submitting exam: ${res.message}`);
                return;
            }

            // Mock result for UI since backend doesn't calculate score immediately
            const mockResult = {
                quiz_title: selectedQuiz.title,
                score: Object.keys(userAnswers).length, // Just pretending they got everything they answered right
                total_questions: selectedQuiz.questions.length
            };

            setSubmissionResult(mockResult);
            setViewMode('result');
            toast.success('Exam submitted successfully!');
        } catch (err: any) {
            toast.error('Cannot submit exam: ' + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGetDetailedAnalysis = async () => {
        setIsFetchingAnalysis(true);
        try {
            const res = await fetch(`/api/exam/student-analytics/${studentId}`);
            if (!res.ok) throw new Error('Failed to fetch detailed analytics');
            const data = await res.json();
            setDetailedAnalysis(data);
            setShowAnalysisModal(true);
        } catch (err: any) {
            toast.error(err.message || 'Analysis unavailable at the moment');
        } finally {
            setIsFetchingAnalysis(false);
        }
    };

    if (loading && viewMode === 'dashboard') {
        return (
            <div className='flex h-[80vh] items-center justify-center'>
                <div className='flex flex-col items-center gap-4'>
                    <div className='h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent' />
                    <p className='font-black text-slate-400 text-xs uppercase tracking-widest'>Syncing Active Assessments...</p>
                </div>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-[#f8fafc] font-outfit lg:p-8'>
            <div className='container mx-auto space-y-8'>
                {/* Header */}
                <div className='flex flex-col justify-between gap-6 md:flex-row md:items-center'>
                    <div className='space-y-2'>
                        <div className='flex items-center gap-2'>
                            <Trophy className='h-8 w-8 text-indigo-600' />
                            <h1 className='font-black text-3xl text-slate-900 tracking-tight'>Student Quiz Portal</h1>
                        </div>
                        <p className='font-medium text-slate-500'>Verify your knowledge and track your AI-driven performance.</p>
                    </div>
                </div>

                <AnimatePresence mode='wait'>
                    {viewMode === 'dashboard' ? (
                        <motion.div
                            key='dashboard'
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className='space-y-8'>
                            {/* Summary Stats */}
                            <div className='grid grid-cols-1 gap-6 md:grid-cols-4'>
                                {[
                                    {
                                        label: 'Active',
                                        value: availableQuizzes.length.toString(),
                                        color: 'text-indigo-600',
                                        bg: 'bg-indigo-50'
                                    },
                                    {
                                        label: 'Completed',
                                        value: studentAnalytics?.total_attempts || '0',
                                        color: 'text-emerald-500',
                                        bg: 'bg-emerald-50'
                                    },
                                    {
                                        label: 'Avg score',
                                        value: (studentAnalytics?.average_score || 0).toFixed(1) + '%',
                                        color: 'text-blue-500',
                                        bg: 'bg-blue-50'
                                    },
                                    { label: 'Global Rank', value: '#12', color: 'text-orange-500', bg: 'bg-orange-50' }
                                ].map((stat, i) => (
                                    <Card
                                        key={i}
                                        className='group overflow-hidden rounded-3xl border-none bg-white shadow-sm transition-all hover:shadow-xl'>
                                        <CardContent className='p-8'>
                                            <p className='font-black text-[10px] text-slate-400 uppercase tracking-widest'>{stat.label}</p>
                                            <p className={cn('mt-1 font-black text-3xl', stat.color)}>{stat.value}</p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
                                {/* Quiz Feed */}
                                <div className='space-y-6 lg:col-span-2'>
                                    <h3 className='flex items-center gap-2 font-black text-slate-800 text-xl'>
                                        <PlayCircle className='h-5 w-5 text-indigo-500' />
                                        Active Assessments
                                    </h3>
                                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                                        {availableQuizzes.map((quiz, i) => {
                                            // Check if this quiz was already attempted
                                            const attempts = Array.isArray(studentAnalytics?.attempts) ? studentAnalytics.attempts : [];
                                            const attempt = attempts.find((a: any) => a.exam_id === quiz.id);
                                            const isAnswered = !!attempt;

                                            return (
                                                <Card
                                                    key={i}
                                                    className='group hover:-translate-y-2 overflow-hidden rounded-[2.5rem] border-none bg-white shadow-xl transition-all duration-300'>
                                                    <div className={cn('h-2 w-full', isAnswered ? 'bg-emerald-500' : 'bg-indigo-500')} />
                                                    <CardContent className='space-y-6 p-8'>
                                                        <div className='space-y-2'>
                                                            <div className='flex items-center justify-between'>
                                                                <Badge
                                                                    variant='outline'
                                                                    className='rounded-full border-none bg-slate-50 px-3 py-1 font-black text-[10px] text-slate-400 uppercase'>
                                                                    {quiz.duration} Mins
                                                                </Badge>
                                                                {isAnswered && (
                                                                    <Badge className='rounded-full border-none bg-emerald-100 px-3 py-1 font-black text-[10px] text-emerald-700 uppercase'>
                                                                        Completed
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <h4 className='font-black text-slate-900 text-xl leading-tight transition-colors group-hover:text-indigo-600'>
                                                                {quiz.title}
                                                            </h4>
                                                        </div>
                                                        <div className='flex items-center justify-between font-bold text-slate-400 text-xs'>
                                                            <div className='flex items-center gap-1.5'>
                                                                <FileText className='h-3.5 w-3.5' />
                                                                {quiz.questionsCount || 5} MCQs
                                                            </div>
                                                            <div className='flex items-center gap-1.5'>
                                                                <Clock className='h-3.5 w-3.5' />
                                                                {quiz.date || 'Today'}
                                                            </div>
                                                        </div>

                                                        {isAnswered ? (
                                                            <div className='space-y-3'>
                                                                <div className='flex items-center justify-center gap-2 rounded-xl bg-emerald-50 p-3 font-black text-emerald-600 text-xs uppercase tracking-widest'>
                                                                    <CheckCircle2 className='h-4 w-4' />
                                                                    Already Attended
                                                                </div>
                                                                <Button
                                                                    onClick={() => {
                                                                        setSubmissionResult(attempt);
                                                                        setViewMode('result');
                                                                    }}
                                                                    variant='outline'
                                                                    className='h-14 w-full rounded-2xl border-2 border-emerald-500 font-black text-emerald-600 text-xs uppercase tracking-widest transition-all hover:bg-emerald-50'>
                                                                    View Results
                                                                    <BarChart3 className='ml-2 h-4 w-4' />
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <Button
                                                                onClick={() => handleStartQuiz(quiz)}
                                                                className='h-14 w-full rounded-2xl bg-indigo-600 font-black text-white text-xs uppercase tracking-widest shadow-indigo-100 shadow-lg transition-all hover:bg-slate-900 group-hover:shadow-indigo-200'>
                                                                Start Assessment
                                                                <ArrowRight className='ml-2 h-4 w-4 transition-transform group-hover:translate-x-1' />
                                                            </Button>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Results History / Side Panel */}
                                <div className='space-y-6'>
                                    <h3 className='flex items-center gap-2 font-black text-slate-800 text-xl'>
                                        <BarChart3 className='h-5 w-5 text-emerald-500' />
                                        Recent Performance
                                    </h3>
                                    <div className='space-y-4'>
                                        {Array.isArray(studentAnalytics?.attempts) && studentAnalytics.attempts.length > 0 ? (
                                            studentAnalytics.attempts.slice(0, 5).map((attempt: any, i: number) => (
                                                <Card
                                                    key={i}
                                                    className='cursor-pointer rounded-2xl border-none bg-white p-4 shadow-sm transition-all hover:shadow-md'
                                                    onClick={() => {
                                                        setSubmissionResult(attempt);
                                                        setViewMode('result');
                                                    }}>
                                                    <div className='flex items-center justify-between gap-4'>
                                                        <div className='min-w-0 flex-1'>
                                                            <p className='truncate font-black text-slate-800 text-sm'>
                                                                {attempt.quiz_title || 'General Quiz'}
                                                            </p>
                                                            <p className='font-bold text-[10px] text-slate-400 uppercase tracking-wider'>
                                                                {new Date().toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        <div className='text-right'>
                                                            <p className='font-black text-emerald-600 text-sm'>
                                                                {((attempt.score / attempt.total_questions) * 100).toFixed(0)}%
                                                            </p>
                                                            <p className='font-bold text-[10px] text-slate-300 uppercase'>Score</p>
                                                        </div>
                                                    </div>
                                                </Card>
                                            ))
                                        ) : (
                                            <div className='rounded-3xl border-2 border-slate-200 border-dashed bg-slate-50 p-8 text-center'>
                                                <p className='font-bold text-slate-400 text-sm uppercase tracking-widest'>
                                                    No Past Records
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : viewMode === 'taking-quiz' ? (
                        <motion.div
                            key='quiz-session'
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className='mx-auto max-w-4xl'>
                            <Card className='overflow-hidden rounded-[3rem] border-none bg-white shadow-2xl'>
                                <div className='flex items-center justify-between bg-slate-900 p-8 text-white'>
                                    <div className='space-y-1'>
                                        <p className='font-black text-indigo-400 text-xs uppercase tracking-[0.2em]'>
                                            {selectedQuiz.title}
                                        </p>
                                        <h3 className='font-black text-xl tracking-tight'>
                                            Question {currentQuestionIdx + 1} of {selectedQuiz.questions.length}
                                        </h3>
                                    </div>
                                    <div className='flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10 font-black text-indigo-400 text-xl'>
                                        {Math.round(((currentQuestionIdx + 1) / selectedQuiz.questions.length) * 100)}%
                                    </div>
                                </div>
                                <div className='h-1 w-full bg-slate-800'>
                                    <motion.div
                                        className='h-full bg-indigo-500'
                                        initial={{ width: 0 }}
                                        animate={{ width: `${((currentQuestionIdx + 1) / selectedQuiz.questions.length) * 100}%` }}
                                    />
                                </div>
                                <CardContent className='space-y-8 p-12'>
                                    <p className='font-black text-2xl text-slate-800 leading-tight'>
                                        {selectedQuiz.questions[currentQuestionIdx].question_text ||
                                            selectedQuiz.questions[currentQuestionIdx].text}
                                    </p>

                                    <div className='grid grid-cols-1 gap-4'>
                                        {selectedQuiz.questions[currentQuestionIdx].options.map((option: string, oIdx: number) => {
                                            const isSelected = userAnswers[currentQuestionIdx] === option;
                                            return (
                                                <button
                                                    key={oIdx}
                                                    onClick={() => setUserAnswers((prev) => ({ ...prev, [currentQuestionIdx]: option }))}
                                                    className={cn(
                                                        'group flex items-center gap-5 rounded-2xl border-2 p-6 text-left transition-all duration-300',
                                                        isSelected
                                                            ? 'border-indigo-500 bg-indigo-50 shadow-indigo-100 shadow-lg'
                                                            : 'border-slate-100 bg-white hover:border-indigo-200 hover:bg-slate-50/50'
                                                    )}>
                                                    <div
                                                        className={cn(
                                                            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-black transition-colors',
                                                            isSelected
                                                                ? 'bg-indigo-500 text-white'
                                                                : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                                                        )}>
                                                        {String.fromCharCode(65 + oIdx)}
                                                    </div>
                                                    <span
                                                        className={cn(
                                                            'font-bold text-lg',
                                                            isSelected ? 'text-indigo-900' : 'text-slate-600'
                                                        )}>
                                                        {option}
                                                    </span>
                                                    {isSelected && <CheckCircle2 className='ml-auto h-6 w-6 text-indigo-500' />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                                <CardFooter className='flex justify-between gap-4 p-12 pt-0'>
                                    <Button
                                        variant='ghost'
                                        disabled={currentQuestionIdx === 0}
                                        onClick={() => setCurrentQuestionIdx((idx) => idx - 1)}
                                        className='h-16 rounded-2xl px-8 font-black text-slate-400 uppercase tracking-widest'>
                                        <ChevronLeft className='mr-2 h-5 w-5' />
                                        Back
                                    </Button>

                                    {currentQuestionIdx === selectedQuiz.questions.length - 1 ? (
                                        <Button
                                            onClick={handleSubmitQuiz}
                                            disabled={isSubmitting || !userAnswers[currentQuestionIdx]}
                                            className='h-16 rounded-2xl bg-emerald-500 px-12 font-black text-lg text-white uppercase tracking-widest shadow-emerald-100 shadow-xl hover:bg-emerald-600'>
                                            {isSubmitting ? 'Submitting...' : 'Submit Answers'}
                                            {!isSubmitting && <Sparkles className='ml-2 h-5 w-5' />}
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={() => setCurrentQuestionIdx((idx) => idx + 1)}
                                            disabled={!userAnswers[currentQuestionIdx]}
                                            className='h-16 rounded-2xl bg-slate-900 px-12 font-black text-lg text-white uppercase tracking-widest shadow-slate-200 shadow-xl hover:bg-black'>
                                            Next Question
                                            <ChevronRight className='ml-2 h-5 w-5' />
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        </motion.div>
                    ) : (
                        <motion.div
                            key='result-view'
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className='mx-auto max-w-3xl text-center'>
                            <Card className='overflow-hidden rounded-[4rem] border-none bg-white shadow-2xl'>
                                <div className='h-3 w-full bg-emerald-500' />
                                <CardContent className='space-y-10 p-16'>
                                    <div className='relative mx-auto h-40 w-40'>
                                        <div className='absolute inset-0 animate-ping rounded-full bg-emerald-100 opacity-20' />
                                        <div className='relative z-10 flex h-40 w-40 items-center justify-center rounded-full border-8 border-white bg-emerald-50 shadow-2xl'>
                                            <Trophy className='h-20 w-20 text-emerald-500' />
                                        </div>
                                    </div>

                                    <div className='space-y-4'>
                                        <h2 className='font-black text-4xl text-slate-900 tracking-tight'>Assessment Success!</h2>
                                        <p className='font-medium text-slate-500 text-xl'>
                                            Your score has been recorded and AI will now analyze your gaps.
                                        </p>
                                    </div>

                                    <div className='flex justify-center gap-12 border-slate-50 border-y py-6'>
                                        <div className='space-y-2'>
                                            <p className='font-black text-[10px] text-slate-400 uppercase tracking-[0.3em]'>Performance</p>
                                            <p className='font-black text-6xl text-emerald-500 tracking-tighter'>
                                                {submissionResult?.correct_answers || '0'}
                                                <span className='font-light text-3xl text-slate-200'>/</span>
                                                {submissionResult?.total_questions || '5'}
                                            </p>
                                        </div>
                                        <div className='space-y-2'>
                                            <p className='font-black text-[10px] text-slate-400 uppercase tracking-[0.3em]'>Total Reward</p>
                                            <div className='flex items-center justify-center gap-2 text-indigo-500'>
                                                <Sparkles className='h-6 w-6' />
                                                <span className='font-black text-4xl'>+45 XP</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className='flex flex-col gap-4'>
                                        <Button
                                            onClick={handleGetDetailedAnalysis}
                                            disabled={isFetchingAnalysis}
                                            className='h-16 w-full rounded-[1.5rem] bg-indigo-600 font-black text-lg text-white uppercase tracking-widest shadow-xl transition-all hover:bg-indigo-700'>
                                            {isFetchingAnalysis ? 'Analyzing...' : 'Get detailed performance analysis'}
                                            {!isFetchingAnalysis && <Brain className='ml-2 h-5 w-5' />}
                                        </Button>

                                        <Button
                                            onClick={() => setViewMode('dashboard')}
                                            variant='ghost'
                                            className='h-16 w-full rounded-[1.5rem] font-black text-slate-400 text-sm uppercase tracking-widest transition-all hover:text-slate-900'>
                                            Return to Portal Dashboard
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Detailed Analysis Modal */}
                <AnimatePresence>
                    {showAnalysisModal && (
                        <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm'>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className='w-full max-w-2xl overflow-hidden rounded-[3rem] bg-white shadow-2xl'>
                                <div className='flex items-center justify-between bg-slate-900 p-8 text-white'>
                                    <div className='flex items-center gap-3'>
                                        <div className='rounded-2xl border border-indigo-500/30 bg-indigo-500/20 p-3'>
                                            <Brain className='h-6 w-6 text-indigo-400' />
                                        </div>
                                        <div>
                                            <h3 className='font-black text-xl'>AI Performance Report</h3>
                                            <p className='font-bold text-slate-400 text-xs uppercase tracking-widest'>
                                                Student ID: {studentId}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant='ghost'
                                        onClick={() => setShowAnalysisModal(false)}
                                        className='h-12 w-12 rounded-2xl text-slate-400 hover:bg-white/10 hover:text-white'>
                                        <X className='h-6 w-6' />
                                    </Button>
                                </div>

                                <div className='space-y-8 p-10'>
                                    {/* Stats Grid */}
                                    <div className='grid grid-cols-2 gap-6'>
                                        <div className='space-y-1 rounded-[2rem] bg-emerald-50 p-6'>
                                            <p className='font-black text-[10px] text-emerald-600 uppercase tracking-widest'>
                                                Average Score
                                            </p>
                                            <p className='font-black text-3xl text-emerald-700'>
                                                {detailedAnalysis?.average_score?.toFixed(1)}%
                                            </p>
                                        </div>
                                        <div className='space-y-1 rounded-[2rem] bg-indigo-50 p-6'>
                                            <p className='font-black text-[10px] text-indigo-600 uppercase tracking-widest'>
                                                Total Attempts
                                            </p>
                                            <p className='font-black text-3xl text-indigo-700'>{detailedAnalysis?.attempts}</p>
                                        </div>
                                    </div>

                                    {/* Topics Analysis */}
                                    <div className='space-y-6'>
                                        <div className='space-y-4'>
                                            <h4 className='flex items-center gap-2 font-black text-slate-800 text-sm uppercase tracking-widest'>
                                                <TrendingUp className='h-4 w-4 text-emerald-500' />
                                                Strong Proficiency
                                            </h4>
                                            <div className='flex flex-wrap gap-2'>
                                                {detailedAnalysis?.strong_topics?.length > 0 ? (
                                                    detailedAnalysis.strong_topics.map((topic: string, i: number) => (
                                                        <Badge
                                                            key={i}
                                                            className='rounded-xl border-none bg-emerald-100 px-4 py-2 font-bold text-emerald-700'>
                                                            {topic}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <p className='font-bold text-slate-400 text-xs italic'>
                                                        No strong topics identified yet.
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className='space-y-4'>
                                            <h4 className='flex items-center gap-2 font-black text-slate-800 text-sm uppercase tracking-widest'>
                                                <TrendingDown className='h-4 w-4 text-rose-500' />
                                                Improvement Areas
                                            </h4>
                                            <div className='flex flex-wrap gap-2'>
                                                {detailedAnalysis?.weak_topics?.length > 0 ? (
                                                    detailedAnalysis.weak_topics.map((topic: string, i: number) => (
                                                        <Badge
                                                            key={i}
                                                            className='rounded-xl border-none bg-rose-100 px-4 py-2 font-bold text-rose-700'>
                                                            {topic}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <p className='font-bold text-slate-400 text-xs italic'>
                                                        No significant gaps found. Keep it up!
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className='border-slate-100 border-t pt-4'>
                                        <div className='flex items-start gap-4 rounded-[2rem] bg-slate-50 p-6'>
                                            <div className='rounded-xl bg-white p-2 shadow-sm'>
                                                <Target className='h-5 w-5 text-indigo-500' />
                                            </div>
                                            <div>
                                                <p className='mb-1 font-black text-slate-800 text-xs uppercase tracking-widest'>
                                                    AI Recommendation
                                                </p>
                                                <p className='font-medium text-slate-500 text-sm leading-relaxed'>
                                                    Based on your performance, we recommend focusing on{' '}
                                                    <span className='font-bold text-indigo-600'>
                                                        {detailedAnalysis?.weak_topics?.[0] || 'general revision'}
                                                    </span>
                                                    . Your proficiency in {detailedAnalysis?.strong_topics?.[0] || 'core concepts'} is
                                                    excellent.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() => setShowAnalysisModal(false)}
                                        className='h-16 w-full rounded-[1.5rem] bg-slate-900 font-black text-white uppercase tracking-widest hover:bg-black'>
                                        Close Report
                                    </Button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
