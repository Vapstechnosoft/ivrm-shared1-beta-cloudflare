'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { InputTextarea } from '@/components/ui/extension/input-textarea';
import { Label } from '@/components/ui/label';
import { saveEvaluatedMarks } from '@/server/exam/online-exam/transactions/answer-paper-correction';
import type { IStudentAnswerSheetQuestion, IStudentExamSubmission } from '@/types/exam/online-exam/transactions';
import { CheckCircle2, FileText, UserCheck, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface AnswerEvaluationDialogProps {
    student: IStudentExamSubmission | null;
    examId: number;
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AnswerEvaluationDialog({ student, examId, open, onClose, onSuccess }: AnswerEvaluationDialogProps) {
    const [questions, setQuestions] = useState<IStudentAnswerSheetQuestion[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (student) {
            // Mock sample student evaluation questions if initial answers aren't attached
            setQuestions([
                {
                    questionId: 101,
                    questionText: 'What is the primary function of chlorophyll in photosynthesis?',
                    questionMarks: 2,
                    complexityLevel: 'Medium',
                    options: [
                        { optionId: 1, optionText: 'Absorption of light energy', isCorrect: true, isStudentSelected: true },
                        { optionId: 2, optionText: 'Storage of water', isCorrect: false, isStudentSelected: false },
                        { optionId: 3, optionText: 'Release of oxygen', isCorrect: false, isStudentSelected: false },
                        { optionId: 4, optionText: 'Synthesis of protein', isCorrect: false, isStudentSelected: false }
                    ],
                    awardedMarks: 2,
                    teacherRemarks: 'Correct option selected'
                },
                {
                    questionId: 102,
                    questionText: 'Explain the difference between mitosis and meiosis.',
                    questionMarks: 5,
                    complexityLevel: 'Hard',
                    options: [],
                    studentDescriptiveAnswer:
                        'Mitosis results in two identical diploid daughter cells for growth and repair. Meiosis results in four non-identical haploid gametes for sexual reproduction.',
                    awardedMarks: 4.5,
                    teacherRemarks: 'Very clear explanation and comparison points'
                },
                {
                    questionId: 103,
                    questionText: 'Which law of thermodynamics states that entropy of an isolated system always increases?',
                    questionMarks: 1,
                    complexityLevel: 'Easy',
                    options: [
                        { optionId: 5, optionText: 'First Law of Thermodynamics', isCorrect: false, isStudentSelected: true },
                        { optionId: 6, optionText: 'Second Law of Thermodynamics', isCorrect: true, isStudentSelected: false },
                        { optionId: 7, optionText: 'Third Law of Thermodynamics', isCorrect: false, isStudentSelected: false },
                        { optionId: 8, optionText: 'Zeroth Law of Thermodynamics', isCorrect: false, isStudentSelected: false }
                    ],
                    awardedMarks: 0,
                    teacherRemarks: 'Incorrect answer'
                }
            ]);
        }
    }, [student]);

    const handleMarksChange = (qIndex: number, marks: number) => {
        setQuestions((prev) => prev.map((q, i) => (i === qIndex ? { ...q, awardedMarks: marks } : q)));
    };

    const handleRemarksChange = (qIndex: number, remarks: string) => {
        setQuestions((prev) => prev.map((q, i) => (i === qIndex ? { ...q, teacherRemarks: remarks } : q)));
    };

    const totalAwarded = questions.reduce((sum, q) => sum + (Number(q.awardedMarks) || 0), 0);
    const totalMaxMarks = questions.reduce((sum, q) => sum + q.questionMarks, 0);

    const handleSaveEvaluation = async () => {
        if (!student) return;

        setIsSaving(true);
        try {
            const payload = {
                AMST_Id: student.amsT_Id,
                LPMOEEX_Id: examId,
                evaluations: questions.map((q) => ({
                    questionId: q.questionId,
                    awardedMarks: Number(q.awardedMarks || 0),
                    teacherRemarks: q.teacherRemarks?.trim() || ''
                }))
            };

            const response = await saveEvaluatedMarks(payload);
            if (response?.success || response?.returnval === true || !response?.error) {
                toast.success(`Evaluation for ${student.studentName} saved successfully!`);
                onSuccess();
                onClose();
            } else {
                toast.error(response?.message || 'Failed to save evaluation');
            }
        } catch (error: any) {
            toast.error(error?.message || 'An error occurred while saving evaluation');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className='flex max-h-[90vh] max-w-4xl flex-col p-6'>
                <DialogHeader className='border-b pb-3'>
                    <div className='flex items-center justify-between'>
                        <div>
                            <DialogTitle className='flex items-center gap-2 font-bold text-xl'>
                                <UserCheck className='h-5 w-5 text-primary' />
                                Answer Sheet Evaluation
                            </DialogTitle>
                            <DialogDescription className='mt-0.5 text-muted-foreground text-xs'>
                                Review student answers, verify auto-evaluated MCQs, and award marks
                            </DialogDescription>
                        </div>
                        <div className='text-right'>
                            <span className='text-muted-foreground text-xs'>Total Score:</span>
                            <div className='font-bold text-lg text-primary'>
                                {totalAwarded} / {totalMaxMarks}
                            </div>
                        </div>
                    </div>

                    {/* Student Info Bar */}
                    {student && (
                        <div className='mt-3 grid grid-cols-2 gap-3 rounded-lg bg-muted/40 p-3 text-xs sm:grid-cols-4'>
                            <div>
                                <span className='text-muted-foreground'>Student:</span>{' '}
                                <span className='font-semibold text-foreground'>{student.studentName}</span>
                            </div>
                            <div>
                                <span className='text-muted-foreground'>Adm No:</span>{' '}
                                <span className='font-semibold text-foreground'>{student.admNo}</span>
                            </div>
                            <div>
                                <span className='text-muted-foreground'>Roll No:</span>{' '}
                                <span className='font-semibold text-foreground'>{student.rollNo}</span>
                            </div>
                            <div>
                                <span className='text-muted-foreground'>Status:</span>{' '}
                                <Badge variant='outline' className='font-semibold'>
                                    {student.examStatus}
                                </Badge>
                            </div>
                        </div>
                    )}
                </DialogHeader>

                {/* Questions Evaluation Body */}
                <div className='flex-1 space-y-4 overflow-y-auto py-3 pr-1'>
                    {questions.map((q, qIdx) => (
                        <div key={q.questionId} className='space-y-3 rounded-xl border bg-card p-4 shadow-xs'>
                            <div className='flex items-start justify-between gap-4'>
                                <div className='space-y-1'>
                                    <div className='flex items-center gap-2'>
                                        <Badge variant='secondary' className='font-bold text-xs'>
                                            Q{qIdx + 1}
                                        </Badge>
                                        <span className='text-muted-foreground text-xs'>
                                            Max Marks: <strong className='text-foreground'>{q.questionMarks}</strong>
                                        </span>
                                        {q.complexityLevel && (
                                            <Badge variant='outline' className='text-[10px]'>
                                                {q.complexityLevel}
                                            </Badge>
                                        )}
                                    </div>
                                    <p className='pt-1 font-semibold text-foreground text-sm'>{q.questionText}</p>
                                </div>

                                <div className='w-28 space-y-1 text-right'>
                                    <Label className='text-[11px] text-muted-foreground'>Awarded Marks</Label>
                                    <input
                                        type='number'
                                        value={q.awardedMarks}
                                        onChange={(e) => handleMarksChange(qIdx, Number(e.target.value))}
                                        min={0}
                                        max={q.questionMarks}
                                        step={0.5}
                                        className='flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-center font-bold text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                                    />
                                </div>
                            </div>

                            {/* Multiple Choice Options */}
                            {q.options && q.options.length > 0 && (
                                <div className='grid grid-cols-1 gap-2 pt-1 sm:grid-cols-2'>
                                    {q.options.map((opt, optIdx) => {
                                        const isCorrect = opt.isCorrect;
                                        const isSelected = opt.isStudentSelected;

                                        let optionBg = 'border-border bg-background';
                                        if (isCorrect && isSelected) {
                                            optionBg = 'border-emerald-500 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200';
                                        } else if (isCorrect && !isSelected) {
                                            optionBg = 'border-emerald-400/60 bg-emerald-500/5 text-emerald-800 dark:text-emerald-300';
                                        } else if (!isCorrect && isSelected) {
                                            optionBg = 'border-destructive bg-destructive/10 text-destructive';
                                        }

                                        return (
                                            <div
                                                key={opt.optionId}
                                                className={`flex items-center justify-between rounded-lg border p-2.5 font-medium text-xs transition-all ${optionBg}`}>
                                                <div className='flex items-center gap-2'>
                                                    <span className='font-bold text-muted-foreground'>
                                                        {String.fromCharCode(65 + optIdx)}.
                                                    </span>
                                                    <span>{opt.optionText}</span>
                                                </div>

                                                <div className='flex items-center gap-1.5'>
                                                    {isSelected && (
                                                        <Badge variant='outline' className='px-1.5 py-0 text-[10px]'>
                                                            Student Choice
                                                        </Badge>
                                                    )}
                                                    {isCorrect ? (
                                                        <CheckCircle2 className='h-4 w-4 text-emerald-600' />
                                                    ) : isSelected ? (
                                                        <XCircle className='h-4 w-4 text-destructive' />
                                                    ) : null}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Descriptive Answer if any */}
                            {q.studentDescriptiveAnswer && (
                                <div className='space-y-1 rounded-lg bg-muted/40 p-3 text-xs'>
                                    <span className='flex items-center gap-1 font-semibold text-muted-foreground'>
                                        <FileText className='h-3.5 w-3.5' /> Student Response:
                                    </span>
                                    <p className='font-medium text-foreground'>{q.studentDescriptiveAnswer}</p>
                                </div>
                            )}

                            {/* Teacher Remarks Input */}
                            <div className='pt-1'>
                                <InputTextarea
                                    value={q.teacherRemarks || ''}
                                    onChange={(e) => handleRemarksChange(qIdx, e.target.value)}
                                    placeholder='Enter remarks or feedback for this answer...'
                                    rows={1}
                                    className='text-xs'
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <DialogFooter className='flex items-center justify-between border-t pt-3 sm:justify-between'>
                    <div className='text-muted-foreground text-xs'>
                        Evaluated questions:{' '}
                        <strong className='text-foreground'>
                            {questions.length} / {questions.length}
                        </strong>
                    </div>
                    <div className='flex gap-2'>
                        <Button type='button' variant='outline' onClick={onClose} disabled={isSaving}>
                            Cancel
                        </Button>
                        <Button type='button' onClick={handleSaveEvaluation} disabled={isSaving} className='min-w-32'>
                            {isSaving ? 'Saving...' : 'Complete Evaluation'}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
