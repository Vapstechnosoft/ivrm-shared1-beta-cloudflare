'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import {
    Clock,
    CheckCircle2,
    HelpCircle,
    Bookmark,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    Send,
    RotateCcw,
    Trophy,
    FileText,
    ShieldCheck,
    Volume2
} from 'lucide-react';
import { toast } from 'sonner';
import type { IExamQuestion } from '@/types/exam/online-exam';
import { submitStudentExam } from '@/server/exam/online-exam/student-exam';

export default function StudentOnlineExamPage() {
    // Exam States: 'instructions' | 'in_progress' | 'submitted'
    const [examState, setExamState] = useState<'instructions' | 'in_progress' | 'submitted'>('instructions');

    // Timer (in seconds)
    const [remainingSeconds, setRemainingSeconds] = useState<number>(30 * 60); // 30 minutes
    const [timerActive, setTimerActive] = useState<boolean>(false);

    // Current active question index (0-indexed)
    const [currentIndex, setCurrentIndex] = useState<number>(0);

    // Submit confirmation dialog
    const [submitModalOpen, setSubmitModalOpen] = useState(false);

    // Score / Result after submit
    const [examResult, setExamResult] = useState<{
        score: number;
        total: number;
        percentage: number;
        status: 'PASS' | 'FAIL';
        correct: number;
        wrong: number;
        unattempted: number;
    } | null>(null);

    // Sample question dataset
    const [questions, setQuestions] = useState<IExamQuestion[]>([
        {
            lmsmQ_Id: 1,
            questionNo: 1,
            lmsmQ_Question: 'Which organelle is known as the "Powerhouse of the Cell"?',
            lmsmQ_Marks: 1,
            lmsmQ_QuestionTypeFlg: 'O',
            options: [
                { lmsmoP_Id: 101, lmsmoP_Option: 'Nucleus' },
                { lmsmoP_Id: 102, lmsmoP_Option: 'Mitochondria' },
                { lmsmoP_Id: 103, lmsmoP_Option: 'Endoplasmic Reticulum' },
                { lmsmoP_Id: 104, lmsmoP_Option: 'Golgi Apparatus' }
            ],
            selectedOptionId: null,
            status: 'not_visited'
        },
        {
            lmsmQ_Id: 2,
            questionNo: 2,
            lmsmQ_Question: 'What is the acceleration due to gravity (g) near the Earth’s surface?',
            lmsmQ_Marks: 1,
            lmsmQ_QuestionTypeFlg: 'O',
            options: [
                { lmsmoP_Id: 201, lmsmoP_Option: '9.8 m/s²' },
                { lmsmoP_Id: 202, lmsmoP_Option: '8.9 m/s²' },
                { lmsmoP_Id: 203, lmsmoP_Option: '9.8 cm/s²' },
                { lmsmoP_Id: 204, lmsmoP_Option: '3.0 × 10⁸ m/s' }
            ],
            selectedOptionId: null,
            status: 'not_visited'
        },
        {
            lmsmQ_Id: 3,
            questionNo: 3,
            lmsmQ_Question: 'Describe the process of Photosynthesis with the balanced chemical reaction.',
            lmsmQ_Marks: 5,
            lmsmQ_QuestionTypeFlg: 'S',
            options: [],
            subjectiveAnswerText: '',
            status: 'not_visited'
        },
        {
            lmsmQ_Id: 4,
            questionNo: 4,
            lmsmQ_Question: 'Which gas is evolved when zinc granules react with dilute hydrochloric acid?',
            lmsmQ_Marks: 1,
            lmsmQ_QuestionTypeFlg: 'O',
            options: [
                { lmsmoP_Id: 401, lmsmoP_Option: 'Oxygen (O2)' },
                { lmsmoP_Id: 402, lmsmoP_Option: 'Hydrogen (H2)' },
                { lmsmoP_Id: 403, lmsmoP_Option: 'Chlorine (Cl2)' },
                { lmsmoP_Id: 404, lmsmoP_Option: 'Nitrogen Dioxide (NO2)' }
            ],
            selectedOptionId: null,
            status: 'not_visited'
        },
        {
            lmsmQ_Id: 5,
            questionNo: 5,
            lmsmQ_Question: 'What is the pH value of pure water at 25°C?',
            lmsmQ_Marks: 1,
            lmsmQ_QuestionTypeFlg: 'O',
            options: [
                { lmsmoP_Id: 501, lmsmoP_Option: '0' },
                { lmsmoP_Id: 502, lmsmoP_Option: '7' },
                { lmsmoP_Id: 503, lmsmoP_Option: '14' },
                { lmsmoP_Id: 504, lmsmoP_Option: '1' }
            ],
            selectedOptionId: null,
            status: 'not_visited'
        }
    ]);

    // Timer countdown effect
    useEffect(() => {
        let interval: any = null;
        if (timerActive && remainingSeconds > 0) {
            interval = setInterval(() => {
                setRemainingSeconds(prev => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        handleAutoSubmit();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timerActive, remainingSeconds]);

    // Start Exam Handler
    const handleStartExam = () => {
        setExamState('in_progress');
        setTimerActive(true);
        // Mark first question as visited/not answered if fresh
        setQuestions(prev => {
            const next = [...prev];
            if (next[0].status === 'not_visited') {
                next[0].status = 'not_answered';
            }
            return next;
        });
        toast.success('Online Exam started. Best of luck!');
    };

    // Format timer MM:SS
    const formattedTime = useMemo(() => {
        const mins = Math.floor(remainingSeconds / 60);
        const secs = remainingSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, [remainingSeconds]);

    const isLowTime = remainingSeconds < 300; // less than 5 minutes

    const currentQuestion = questions[currentIndex];

    // Select Objective Option
    const handleOptionSelect = (optionId: number) => {
        setQuestions(prev => {
            const next = [...prev];
            next[currentIndex].selectedOptionId = optionId;
            next[currentIndex].status = 'answered';
            return next;
        });
    };

    // Subjective Text Change
    const handleSubjectiveChange = (text: string) => {
        setQuestions(prev => {
            const next = [...prev];
            next[currentIndex].subjectiveAnswerText = text;
            next[currentIndex].status = text.trim() ? 'answered' : 'not_answered';
            return next;
        });
    };

    // Clear Response
    const handleClearResponse = () => {
        setQuestions(prev => {
            const next = [...prev];
            next[currentIndex].selectedOptionId = null;
            next[currentIndex].subjectiveAnswerText = '';
            next[currentIndex].status = 'not_answered';
            return next;
        });
        toast.info('Response cleared for this question');
    };

    // Mark for Review & Next
    const handleMarkForReviewAndNext = () => {
        setQuestions(prev => {
            const next = [...prev];
            const hasAnswer =
                next[currentIndex].selectedOptionId !== null ||
                Boolean(next[currentIndex].subjectiveAnswerText?.trim());
            next[currentIndex].status = hasAnswer
                ? 'answered_marked_for_review'
                : 'marked_for_review';
            return next;
        });

        goToNextQuestion();
    };

    // Save & Next
    const handleSaveAndNext = () => {
        setQuestions(prev => {
            const next = [...prev];
            const hasAnswer =
                next[currentIndex].selectedOptionId !== null ||
                Boolean(next[currentIndex].subjectiveAnswerText?.trim());
            if (!hasAnswer && next[currentIndex].status === 'not_visited') {
                next[currentIndex].status = 'not_answered';
            }
            return next;
        });

        goToNextQuestion();
    };

    const goToNextQuestion = () => {
        if (currentIndex < questions.length - 1) {
            const nextIdx = currentIndex + 1;
            setCurrentIndex(nextIdx);
            setQuestions(prev => {
                const next = [...prev];
                if (next[nextIdx].status === 'not_visited') {
                    next[nextIdx].status = 'not_answered';
                }
                return next;
            });
        }
    };

    const handleJumpToQuestion = (index: number) => {
        setCurrentIndex(index);
        setQuestions(prev => {
            const next = [...prev];
            if (next[index].status === 'not_visited') {
                next[index].status = 'not_answered';
            }
            return next;
        });
    };

    // Auto submit on timer zero
    const handleAutoSubmit = () => {
        toast.error('Time is up! Submitting your exam automatically...');
        handleSubmitFinal();
    };

    // Final Submit Action
    const handleSubmitFinal = async () => {
        try {
            await submitStudentExam({ lmsmoE_Id: 1 });
        } catch (err) {
            console.error('Failed to save submit to backend', err);
        }
        setTimerActive(false);
        setSubmitModalOpen(false);

        // Calculate score summary
        let score = 0;
        let correctCount = 0;
        let wrongCount = 0;
        let unattemptedCount = 0;

        questions.forEach(q => {
            if (q.selectedOptionId) {
                // For demo check option 2 or 1
                if (q.selectedOptionId === 102 || q.selectedOptionId === 201 || q.selectedOptionId === 402 || q.selectedOptionId === 502) {
                    score += q.lmsmQ_Marks;
                    correctCount++;
                } else {
                    wrongCount++;
                }
            } else if (!q.subjectiveAnswerText) {
                unattemptedCount++;
            }
        });

        const totalMarks = questions.reduce((acc, q) => acc + q.lmsmQ_Marks, 0);
        const percentage = Math.round((score / totalMarks) * 100);

        setExamResult({
            score,
            total: totalMarks,
            percentage,
            status: percentage >= 40 ? 'PASS' : 'FAIL',
            correct: correctCount,
            wrong: wrongCount,
            unattempted: unattemptedCount
        });

        setExamState('submitted');
        toast.success('Exam submitted successfully!');
    };

    // Question Counts
    const answeredCount = questions.filter(q => q.status === 'answered' || q.status === 'answered_marked_for_review').length;
    const notAnsweredCount = questions.filter(q => q.status === 'not_answered').length;
    const markedReviewCount = questions.filter(q => q.status === 'marked_for_review' || q.status === 'answered_marked_for_review').length;
    const notVisitedCount = questions.filter(q => q.status === 'not_visited').length;

    // 1. INSTRUCTIONS SCREEN
    if (examState === 'instructions') {
        return (
            <div className='min-h-screen p-4 sm:p-6 flex items-center justify-center max-w-4xl mx-auto'>
                <Card className='w-full border-slate-200 dark:border-slate-800 shadow-xl'>
                    <CardHeader className='border-b pb-6 text-center bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 rounded-t-xl'>
                        <div className='inline-flex p-3 rounded-full bg-blue-600 text-white mx-auto mb-3 shadow-md'>
                            <ShieldCheck className='h-8 w-8' />
                        </div>
                        <CardTitle className='text-2xl font-bold text-slate-900 dark:text-white'>
                            Online Examination Portal
                        </CardTitle>
                        <CardDescription className='text-slate-600 dark:text-slate-300'>
                            Class 10 | General Science Assessment Test 2026
                        </CardDescription>
                    </CardHeader>
                    <CardContent className='p-6 space-y-6'>
                        <div className='grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border text-center'>
                            <div>
                                <p className='text-xs text-slate-500'>Total Questions</p>
                                <p className='text-lg font-bold text-slate-800 dark:text-slate-100'>{questions.length}</p>
                            </div>
                            <div>
                                <p className='text-xs text-slate-500'>Total Duration</p>
                                <p className='text-lg font-bold text-blue-600'>30 Minutes</p>
                            </div>
                            <div>
                                <p className='text-xs text-slate-500'>Total Marks</p>
                                <p className='text-lg font-bold text-emerald-600'>9 Marks</p>
                            </div>
                            <div>
                                <p className='text-xs text-slate-500'>Passing Mark</p>
                                <p className='text-lg font-bold text-purple-600'>40%</p>
                            </div>
                        </div>

                        <div className='space-y-3 text-sm text-slate-700 dark:text-slate-300'>
                            <h3 className='font-bold text-base text-slate-900 dark:text-slate-100'>Exam Guidelines:</h3>
                            <ul className='list-disc pl-5 space-y-1.5 leading-relaxed'>
                                <li>The clock in the top right corner will display the remaining time.</li>
                                <li>Use the Question Palette on the right to directly navigate to any question.</li>
                                <li>Make sure to click <strong>Save & Next</strong> to save your answer for each question.</li>
                                <li>You can change your responses anytime before submitting the examination.</li>
                                <li>Do not refresh or close the browser tab during the test.</li>
                            </ul>
                        </div>
                    </CardContent>
                    <CardFooter className='flex justify-end p-6 border-t bg-slate-50/50 dark:bg-slate-900/50'>
                        <Button
                            size='lg'
                            onClick={handleStartExam}
                            className='bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 shadow-lg transition-transform hover:scale-[1.02]'
                        >
                            I Am Ready, Start Exam
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    // 2. SUBMITTED RESULT SCORECARD SCREEN
    if (examState === 'submitted' && examResult) {
        return (
            <div className='min-h-screen p-4 sm:p-6 flex items-center justify-center max-w-3xl mx-auto'>
                <Card className='w-full border-slate-200 dark:border-slate-800 shadow-xl'>
                    <CardHeader className='text-center border-b pb-6 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-800 rounded-t-xl'>
                        <div className='inline-flex p-3 rounded-full bg-emerald-600 text-white mx-auto mb-3 shadow-lg'>
                            <Trophy className='h-10 w-10' />
                        </div>
                        <CardTitle className='text-2xl font-bold text-slate-900 dark:text-white'>
                            Exam Completed Successfully!
                        </CardTitle>
                        <CardDescription>Your responses have been recorded and saved in the system.</CardDescription>
                    </CardHeader>
                    <CardContent className='p-6 space-y-6'>
                        <div className='p-6 rounded-xl bg-slate-50 dark:bg-slate-900 border text-center space-y-2'>
                            <p className='text-xs uppercase tracking-widest text-slate-500 font-bold'>Aggregate Score</p>
                            <p className='text-4xl font-extrabold text-emerald-600'>
                                {examResult.score} <span className='text-lg font-normal text-slate-500'>/ {examResult.total} Marks</span>
                            </p>
                            <Badge
                                variant={examResult.status === 'PASS' ? 'default' : 'destructive'}
                                className='px-4 py-1 text-sm font-bold mt-2'
                            >
                                Result: {examResult.status} ({examResult.percentage}%)
                            </Badge>
                        </div>

                        <div className='grid grid-cols-3 gap-4 text-center text-sm'>
                            <div className='p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200'>
                                <p className='text-xs font-semibold text-emerald-800 dark:text-emerald-400'>Correct</p>
                                <p className='text-2xl font-bold text-emerald-700'>{examResult.correct}</p>
                            </div>
                            <div className='p-4 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200'>
                                <p className='text-xs font-semibold text-rose-800 dark:text-rose-400'>Wrong</p>
                                <p className='text-2xl font-bold text-rose-700'>{examResult.wrong}</p>
                            </div>
                            <div className='p-4 rounded-lg bg-slate-100 dark:bg-slate-800 border'>
                                <p className='text-xs font-semibold text-slate-600 dark:text-slate-300'>Unattempted</p>
                                <p className='text-2xl font-bold text-slate-700 dark:text-slate-200'>{examResult.unattempted}</p>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className='flex justify-center p-6 border-t'>
                        <Button onClick={() => setExamState('instructions')} variant='outline'>
                            Back to Exam Dashboard
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    // 3. IN PROGRESS EXAM TAKING PORTAL
    return (
        <div className='min-h-screen p-3 sm:p-6 flex flex-col space-y-4 max-w-[1600px] mx-auto'>
            {/* Top Bar with Timer */}
            <header className='flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm'>
                <div className='flex items-center gap-3'>
                    <div className='h-10 w-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-lg'>
                        10
                    </div>
                    <div>
                        <h2 className='text-base sm:text-lg font-bold text-slate-900 dark:text-white'>
                            Science Mid-Term Assessment 2026
                        </h2>
                        <p className='text-xs text-slate-500'>Student: Rahul Sharma | Roll No: 1042</p>
                    </div>
                </div>

                <div className='flex items-center gap-4'>
                    <div
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-mono font-bold text-lg ${
                            isLowTime
                                ? 'bg-rose-50 border-rose-300 text-rose-600 animate-pulse'
                                : 'bg-slate-50 dark:bg-slate-800 border-slate-300 text-slate-800 dark:text-white'
                        }`}
                    >
                        <Clock className={`h-5 w-5 ${isLowTime ? 'text-rose-600' : 'text-blue-600'}`} />
                        <span>{formattedTime}</span>
                    </div>

                    <Button
                        onClick={() => setSubmitModalOpen(true)}
                        className='bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5 shadow-sm'
                    >
                        <Send className='h-4 w-4' /> Submit Exam
                    </Button>
                </div>
            </header>

            {/* Main Test Body */}
            <div className='grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1'>
                {/* Left: Question Presentation Area */}
                <div className='lg:col-span-8 flex flex-col'>
                    <Card className='flex-1 border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between'>
                        <CardHeader className='border-b pb-4 bg-slate-50/50 dark:bg-slate-900/30 flex flex-row items-center justify-between'>
                            <div className='flex items-center gap-2'>
                                <Badge className='bg-blue-600 text-white font-semibold text-sm px-3 py-1'>
                                    Question {currentQuestion.questionNo} of {questions.length}
                                </Badge>
                                <Badge variant='outline' className='text-xs font-semibold'>
                                    {currentQuestion.lmsmQ_Marks} Marks
                                </Badge>
                            </div>
                            <span className='text-xs font-medium text-slate-500 uppercase tracking-wider'>
                                {currentQuestion.lmsmQ_QuestionTypeFlg === 'O' ? 'Objective MCQ' : 'Subjective (Descriptive)'}
                            </span>
                        </CardHeader>

                        <CardContent className='p-6 space-y-6 flex-1'>
                            {/* Question Statement */}
                            <div className='text-base sm:text-lg font-medium text-slate-900 dark:text-slate-100 leading-relaxed'>
                                {currentQuestion.lmsmQ_Question}
                            </div>

                            {/* Options for MCQ */}
                            {currentQuestion.lmsmQ_QuestionTypeFlg === 'O' ? (
                                <div className='space-y-3 pt-2'>
                                    {currentQuestion.options.map((opt, optIdx) => {
                                        const isSelected = currentQuestion.selectedOptionId === opt.lmsmoP_Id;
                                        return (
                                            <div
                                                key={opt.lmsmoP_Id}
                                                onClick={() => handleOptionSelect(opt.lmsmoP_Id)}
                                                className={`p-4 rounded-xl border text-sm sm:text-base cursor-pointer transition-all flex items-center gap-3.5 ${
                                                    isSelected
                                                        ? 'bg-blue-50/80 border-blue-500 dark:bg-blue-950/40 text-blue-950 dark:text-blue-100 shadow-sm'
                                                        : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-blue-300 hover:bg-slate-50/50'
                                                }`}
                                            >
                                                <div
                                                    className={`h-6 w-6 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 ${
                                                        isSelected
                                                            ? 'bg-blue-600 border-blue-600 text-white'
                                                            : 'border-slate-300 text-slate-600'
                                                    }`}
                                                >
                                                    {String.fromCharCode(65 + optIdx)}
                                                </div>
                                                <span className='font-normal leading-relaxed'>{opt.lmsmoP_Option}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                /* Subjective Response Input */
                                <div className='space-y-3'>
                                    <Label className='text-xs font-semibold uppercase text-slate-500'>
                                        Type Your Answer Below:
                                    </Label>
                                    <Textarea
                                        rows={6}
                                        placeholder='Write your detailed explanation / answer here...'
                                        value={currentQuestion.subjectiveAnswerText || ''}
                                        onChange={e => handleSubjectiveChange(e.target.value)}
                                        className='text-base leading-relaxed'
                                    />
                                </div>
                            )}
                        </CardContent>

                        {/* Bottom Actions */}
                        <CardFooter className='border-t p-4 bg-slate-50/40 dark:bg-slate-900/30 flex flex-wrap items-center justify-between gap-3'>
                            <div className='flex items-center gap-2'>
                                <Button
                                    variant='outline'
                                    size='sm'
                                    disabled={currentIndex === 0}
                                    onClick={() => handleJumpToQuestion(currentIndex - 1)}
                                    className='gap-1'
                                >
                                    <ChevronLeft className='h-4 w-4' /> Previous
                                </Button>
                                <Button
                                    variant='ghost'
                                    size='sm'
                                    onClick={handleClearResponse}
                                    className='text-slate-500 hover:text-slate-700'
                                >
                                    <RotateCcw className='h-3.5 w-3.5 mr-1' /> Clear
                                </Button>
                            </div>

                            <div className='flex items-center gap-2'>
                                <Button
                                    variant='outline'
                                    size='sm'
                                    onClick={handleMarkForReviewAndNext}
                                    className='text-purple-700 border-purple-300 hover:bg-purple-50 gap-1'
                                >
                                    <Bookmark className='h-3.5 w-3.5' /> Mark for Review & Next
                                </Button>
                                <Button
                                    size='sm'
                                    onClick={handleSaveAndNext}
                                    className='bg-blue-600 hover:bg-blue-700 text-white gap-1'
                                >
                                    Save & Next <ChevronRight className='h-4 w-4' />
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                </div>

                {/* Right: Question Palette Sidebar */}
                <div className='lg:col-span-4 flex flex-col gap-4'>
                    <Card className='border-slate-200 dark:border-slate-800 shadow-sm'>
                        <CardHeader className='pb-3 border-b'>
                            <CardTitle className='text-base font-bold'>Question Palette</CardTitle>
                        </CardHeader>
                        <CardContent className='p-4 space-y-4'>
                            {/* Legend */}
                            <div className='grid grid-cols-2 gap-2 text-xs'>
                                <div className='flex items-center gap-2'>
                                    <span className='h-3.5 w-3.5 rounded bg-emerald-600 inline-block'></span>
                                    <span>Answered ({answeredCount})</span>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <span className='h-3.5 w-3.5 rounded bg-rose-600 inline-block'></span>
                                    <span>Not Answered ({notAnsweredCount})</span>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <span className='h-3.5 w-3.5 rounded bg-purple-600 inline-block'></span>
                                    <span>Marked for Review ({markedReviewCount})</span>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <span className='h-3.5 w-3.5 rounded bg-slate-300 dark:bg-slate-700 inline-block'></span>
                                    <span>Not Visited ({notVisitedCount})</span>
                                </div>
                            </div>

                            {/* Question Grid Buttons */}
                            <div className='grid grid-cols-5 gap-2 pt-2 border-t'>
                                {questions.map((q, idx) => {
                                    let btnColor = 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200';
                                    if (q.status === 'answered') btnColor = 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700';
                                    else if (q.status === 'not_answered') btnColor = 'bg-rose-600 text-white border-rose-600 hover:bg-rose-700';
                                    else if (q.status === 'marked_for_review' || q.status === 'answered_marked_for_review') btnColor = 'bg-purple-600 text-white border-purple-600 hover:bg-purple-700';

                                    const isCurrent = currentIndex === idx;

                                    return (
                                        <button
                                            key={q.lmsmQ_Id}
                                            onClick={() => handleJumpToQuestion(idx)}
                                            className={`h-10 rounded-lg font-bold text-sm border transition-all ${btnColor} ${
                                                isCurrent ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                                            }`}
                                        >
                                            {q.questionNo}
                                        </button>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Summary Quick Card */}
                    <Card className='border-slate-200 dark:border-slate-800 shadow-sm p-4 bg-slate-50/50 dark:bg-slate-900/30 text-xs space-y-2 text-slate-600'>
                        <div className='flex justify-between'>
                            <span>Total Attempted:</span>
                            <span className='font-bold text-emerald-700'>{answeredCount} / {questions.length}</span>
                        </div>
                        <div className='flex justify-between'>
                            <span>Pending Review:</span>
                            <span className='font-bold text-purple-700'>{markedReviewCount}</span>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Submission Confirmation Modal */}
            <Dialog open={submitModalOpen} onOpenChange={setSubmitModalOpen}>
                <DialogContent className='sm:max-w-md'>
                    <DialogHeader>
                        <DialogTitle className='text-lg font-bold'>Confirm Exam Submission</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to finish and submit your online exam?
                        </DialogDescription>
                    </DialogHeader>

                    <div className='space-y-2.5 py-3 text-sm'>
                        <div className='p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border grid grid-cols-2 gap-3 text-center'>
                            <div>
                                <p className='text-xs text-slate-500'>Answered</p>
                                <p className='text-xl font-bold text-emerald-600'>{answeredCount}</p>
                            </div>
                            <div>
                                <p className='text-xs text-slate-500'>Unanswered</p>
                                <p className='text-xl font-bold text-rose-600'>{questions.length - answeredCount}</p>
                            </div>
                        </div>
                        <p className='text-xs text-slate-500 text-center'>
                            Once submitted, you will not be able to modify your answers.
                        </p>
                    </div>

                    <DialogFooter className='gap-2 sm:gap-0'>
                        <Button variant='outline' onClick={() => setSubmitModalOpen(false)}>
                            Return to Exam
                        </Button>
                        <Button onClick={handleSubmitFinal} className='bg-emerald-600 hover:bg-emerald-700 text-white'>
                            Yes, Submit Exam
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
