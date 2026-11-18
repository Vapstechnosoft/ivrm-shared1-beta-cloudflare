'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { InputText } from '@/components/ui/extension/input-text';
import { useMasterQuestion, useQuestionOptions, useSaveMasterQuestion } from '@/hooks/exam/online-exam/useMasters';
import type { IMasterQuestionList, IQuestionOption } from '@/types/exam/online-exam/masters';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface QuestionOptionsModalProps {
    question: IMasterQuestionList | null;
    open: boolean;
    onClose: () => void;
}

export default function QuestionOptionsModal({ question, open, onClose }: QuestionOptionsModalProps) {
    const { refetch } = useMasterQuestion(undefined, { enabled: false });
    const saveMutation = useSaveMasterQuestion();
    const { data: initialOptions, isLoading: isOptionsLoading } = useQuestionOptions(question?.lmsmoeQ_Id ?? null);

    const [options, setOptions] = useState<IQuestionOption[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (initialOptions && Array.isArray(initialOptions) && initialOptions.length > 0) {
            setOptions(
                initialOptions.map((opt, idx) => ({
                    ...opt,
                    lmsmoeqoA_Option: opt.lmsmoeqoA_Option || (opt as any).lpmoeqoA_Option || `Option ${String.fromCharCode(65 + idx)}`
                }))
            );
        } else if (question?.questionOptions && question.questionOptions.length > 0) {
            setOptions(
                question.questionOptions.map((opt, idx) => ({
                    ...opt,
                    lmsmoeqoA_Option: opt.lmsmoeqoA_Option || `Option ${String.fromCharCode(65 + idx)}`
                }))
            );
        } else {
            // Default with 4 prefilled options
            setOptions([
                { lmsmoeqoA_Option: 'Option A', lmsmoeqoA_AnswerFlag: true, lmsmoeqoA_Marks: 1, lmsmoeqoA_OptionOrder: 1 },
                { lmsmoeqoA_Option: 'Option B', lmsmoeqoA_AnswerFlag: false, lmsmoeqoA_Marks: 0, lmsmoeqoA_OptionOrder: 2 },
                { lmsmoeqoA_Option: 'Option C', lmsmoeqoA_AnswerFlag: false, lmsmoeqoA_Marks: 0, lmsmoeqoA_OptionOrder: 3 },
                { lmsmoeqoA_Option: 'Option D', lmsmoeqoA_AnswerFlag: false, lmsmoeqoA_Marks: 0, lmsmoeqoA_OptionOrder: 4 }
            ]);
        }
    }, [initialOptions, question]);

    const handleAddOption = () => {
        setOptions((prev) => [
            ...prev,
            {
                lmsmoeqoA_Option: `Option ${String.fromCharCode(65 + prev.length)}`,
                lmsmoeqoA_AnswerFlag: false,
                lmsmoeqoA_Marks: 0,
                lmsmoeqoA_OptionOrder: prev.length + 1
            }
        ]);
    };

    const handleRemoveOption = (index: number) => {
        setOptions((prev) => prev.filter((_, i) => i !== index));
    };

    const handleOptionTextChange = (index: number, text: string) => {
        setOptions((prev) => prev.map((opt, i) => (i === index ? { ...opt, lmsmoeqoA_Option: text } : opt)));
    };

    const handleAnswerFlagToggle = (index: number) => {
        setOptions((prev) =>
            prev.map((opt, i) =>
                i === index
                    ? {
                          ...opt,
                          lmsmoeqoA_AnswerFlag: !opt.lmsmoeqoA_AnswerFlag,
                          lmsmoeqoA_Marks: !opt.lmsmoeqoA_AnswerFlag ? opt.lmsmoeqoA_Marks || 1 : 0
                      }
                    : opt
            )
        );
    };

    const handleMarksChange = (index: number, marks: number) => {
        setOptions((prev) => prev.map((opt, i) => (i === index ? { ...opt, lmsmoeqoA_Marks: marks } : opt)));
    };

    const handleSave = async () => {
        if (!question) return;

        // Auto-fill any blank option names so saving never fails on placeholder ambiguity
        const sanitizedOptions = options.map((o, idx) => ({
            ...o,
            lmsmoeqoA_Option: o.lmsmoeqoA_Option?.trim() || `Option ${String.fromCharCode(65 + idx)}`
        }));

        if (sanitizedOptions.length < 2) {
            toast.error('Please enter at least 2 options for this question.');
            return;
        }

        const hasCorrect = sanitizedOptions.some((o) => o.lmsmoeqoA_AnswerFlag);
        if (!hasCorrect) {
            toast.error('Please select at least one option as the Correct Answer.');
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                MI_Id: 30,
                LPMOEQ_Id: question.lmsmoeQ_Id || (question as any).lpmoeQ_Id,
                ISMS_Id: question.ismS_Id,
                LPMOEQ_Question: question.lmsmoeQ_Question,
                LPMOEQ_Marks: question.lmsmoeQ_Marks,
                LPMCOMP_Id: question.lmsmoecX_Id || 1,
                tempoptionsDTO: sanitizedOptions.map((o, idx) => ({
                    LPMOEQOA_Id: o.lmsmoeqoA_Id || (o as any).lpmoeqoA_Id || 0,
                    LPMOEQOA_Option: o.lmsmoeqoA_Option.trim(),
                    LPMOEQOA_OptionCode: String.fromCharCode(65 + idx),
                    LPMOEQOA_AnswerFlag: Boolean(o.lmsmoeqoA_AnswerFlag),
                    LPMOEQOA_Marks: Number(o.lmsmoeqoA_Marks || (o.lmsmoeqoA_AnswerFlag ? question.lmsmoeQ_Marks || 1 : 0)),
                    LPMOEQOA_Order: idx + 1
                }))
            };

            const response = await saveMutation.mutateAsync(payload);
            if (response?.success !== false && !response?.error) {
                toast.success('Question options saved successfully!');
                refetch();
                onClose();
            } else {
                toast.error(response?.message || response?.error || 'Failed to save options');
            }
        } catch (error: any) {
            toast.error(error?.message || 'An error occurred while saving options');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className='flex max-h-[85vh] max-w-2xl flex-col'>
                <DialogHeader>
                    <DialogTitle className='font-bold text-lg'>Manage Question Options</DialogTitle>
                    <DialogDescription className='text-muted-foreground text-xs'>
                        Configure multiple-choice answers, select 1 or more correct options, and set marks
                    </DialogDescription>
                </DialogHeader>

                <div className='rounded-md bg-muted/40 p-3 text-xs'>
                    <span className='font-semibold text-foreground'>Question: </span>
                    <span className='text-foreground'>{question?.lmsmoeQ_Question}</span>
                    <div className='mt-1 text-muted-foreground'>
                        Total Question Marks: <span className='font-semibold text-foreground'>{question?.lmsmoeQ_Marks}</span>
                    </div>
                </div>

                <div className='flex-1 space-y-3 overflow-y-auto py-2'>
                    {isOptionsLoading ? (
                        <div className='py-6 text-center text-muted-foreground text-sm'>Loading options...</div>
                    ) : (
                        options.map((opt, idx) => (
                            <div
                                key={idx}
                                className={`flex items-center gap-3 rounded-lg border p-3 transition-all ${
                                    opt.lmsmoeqoA_AnswerFlag ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-border bg-card'
                                }`}>
                                <span className='w-7 text-center font-bold text-muted-foreground text-sm'>
                                    {String.fromCharCode(65 + idx)}.
                                </span>

                                <div className='flex-1'>
                                    <InputText
                                        value={opt.lmsmoeqoA_Option}
                                        onChange={(e) => handleOptionTextChange(idx, e.target.value)}
                                        placeholder={`Option ${String.fromCharCode(65 + idx)} text (e.g. Answer)`}
                                        className='h-9'
                                    />
                                </div>

                                <div className='w-20'>
                                    <input
                                        type='number'
                                        value={opt.lmsmoeqoA_Marks || 0}
                                        onChange={(e) => handleMarksChange(idx, Number(e.target.value))}
                                        placeholder='Marks'
                                        min={0}
                                        className='flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-center text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                                    />
                                </div>

                                <label className='flex cursor-pointer items-center gap-1.5 rounded-md border border-input px-2 py-1.5 font-semibold text-xs hover:bg-muted'>
                                    <input
                                        type='checkbox'
                                        checked={Boolean(opt.lmsmoeqoA_AnswerFlag)}
                                        onChange={() => handleAnswerFlagToggle(idx)}
                                        className='h-4 w-4 rounded accent-emerald-600'
                                    />
                                    Correct
                                </label>

                                {options.length > 2 && (
                                    <Button
                                        type='button'
                                        variant='ghost'
                                        size='sm'
                                        onClick={() => handleRemoveOption(idx)}
                                        className='h-8 w-8 p-0 text-destructive'>
                                        <Trash2 className='h-4 w-4' />
                                    </Button>
                                )}
                            </div>
                        ))
                    )}

                    <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={handleAddOption}
                        className='w-full gap-1 border-dashed text-xs'>
                        <Plus className='h-3.5 w-3.5' /> Add Another Option
                    </Button>
                </div>

                <DialogFooter className='border-t pt-3'>
                    <Button type='button' variant='outline' onClick={onClose} disabled={isSaving}>
                        Cancel
                    </Button>
                    <Button type='button' onClick={handleSave} disabled={isSaving} className='min-w-28'>
                        {isSaving ? 'Saving...' : 'Save Options'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
