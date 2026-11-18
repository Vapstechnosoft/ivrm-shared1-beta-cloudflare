'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, MessageSquare, Save } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { saveModuleFeedback } from '../actions';
import type { IFeedbackQuestion, ISaveFeedbackItem } from '../types';

interface FeedbackModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    questions: IFeedbackQuestion[];
}

export function FeedbackModal({ open, onOpenChange, questions }: FeedbackModalProps) {
    const [answers, setAnswers] = useState<Record<number, { optionId: number; remarks: string }>>({});
    const [isSaving, setIsSaving] = useState(false);

    const handleSelectOption = (questionId: number, optionId: number) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: {
                optionId,
                remarks: prev[questionId]?.remarks || ''
            }
        }));
    };

    const handleRemarksChange = (questionId: number, remarks: string) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: {
                optionId: prev[questionId]?.optionId || 0,
                remarks
            }
        }));
    };

    const handleSave = async () => {
        // Validate that all questions have an option selected
        for (const q of questions) {
            if (!answers[q.fmqE_Id]?.optionId) {
                toast.error(`Please select an answer for question: ${q.fmqE_FeedbackQuestions}`);
                return;
            }
            if (!answers[q.fmqE_Id]?.remarks?.trim()) {
                toast.error(`Please enter remarks for question: ${q.fmqE_FeedbackQuestions}`);
                return;
            }
        }

        const payloadItems: ISaveFeedbackItem[] = [];

        questions.forEach((q) => {
            const ans = answers[q.fmqE_Id];
            if (ans?.optionId) {
                const selectedOpt = q.feedbackoptiondata?.find((o) => o.fmoP_Id === ans.optionId);
                payloadItems.push({
                    name: ans.optionId,
                    FMOP_FeedbackOptions: selectedOpt?.fmoP_FeedbackOptions || '',
                    FMOP_OptionsValue: selectedOpt?.fmoP_OptionsValue,
                    FMTY_Id: q.fmtY_Id,
                    FMQE_Id: q.fmqE_Id,
                    FMQE_FeedbackQuestions: q.fmqE_FeedbackQuestions,
                    FMQE_FeedbackQRemarks: q.fmqE_FeedbackQRemarks,
                    FMTY_FeedbackTypeName: q.fmtY_FeedbackTypeName,
                    FSTTR_FeedBack: ans.remarks || ''
                });
            }
        });

        setIsSaving(true);
        try {
            const res = await saveModuleFeedback({ savemodulefeedback: payloadItems });
            if (res.success) {
                toast.success('Feedback saved successfully');
                onOpenChange(false);
            } else {
                toast.error(res.message || 'Failed to save feedback');
            }
        } catch (error: any) {
            toast.error(error.message || 'Error saving feedback');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='max-h-[85vh] max-w-2xl overflow-y-auto'>
                <DialogHeader>
                    <DialogTitle className='flex items-center gap-2 font-bold text-lg'>
                        <MessageSquare className='h-5 w-5 text-primary' />
                        Module Feedback
                    </DialogTitle>
                    <DialogDescription className='text-muted-foreground text-xs'>
                        Please provide your feedback on the examination module.
                    </DialogDescription>
                </DialogHeader>

                <div className='space-y-6 py-3'>
                    {questions.map((q, idx) => (
                        <div key={q.fmqE_Id} className='space-y-3 rounded-lg border bg-muted/20 p-4'>
                            <h4 className='font-semibold text-foreground text-sm'>
                                {idx + 1}. {q.fmqE_FeedbackQuestions}
                            </h4>

                            {/* Radio Options */}
                            <RadioGroup
                                value={answers[q.fmqE_Id]?.optionId ? String(answers[q.fmqE_Id].optionId) : ''}
                                onValueChange={(val) => handleSelectOption(q.fmqE_Id, Number(val))}
                                className='flex flex-wrap gap-4 pt-1'>
                                {q.feedbackoptiondata?.map((opt) => (
                                    <div key={opt.fmoP_Id} className='flex items-center space-x-2'>
                                        <RadioGroupItem value={String(opt.fmoP_Id)} id={`opt-${q.fmqE_Id}-${opt.fmoP_Id}`} />
                                        <Label htmlFor={`opt-${q.fmqE_Id}-${opt.fmoP_Id}`} className='cursor-pointer font-medium text-xs'>
                                            {opt.fmoP_FeedbackOptions}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>

                            {/* Remarks Textarea */}
                            <div className='space-y-1.5 pt-2'>
                                <Label htmlFor={`remarks-${q.fmqE_Id}`} className='font-semibold text-foreground text-xs'>
                                    Remarks <span className='text-destructive'>*</span>
                                </Label>
                                <Textarea
                                    id={`remarks-${q.fmqE_Id}`}
                                    placeholder='Enter your remarks here...'
                                    rows={3}
                                    value={answers[q.fmqE_Id]?.remarks || ''}
                                    onChange={(e) => handleRemarksChange(q.fmqE_Id, e.target.value)}
                                    maxLength={500}
                                    className='text-xs'
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <DialogFooter className='gap-2'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={() => onOpenChange(false)}
                        disabled={isSaving}
                        className='h-9 px-4 font-medium text-xs'>
                        Cancel
                    </Button>
                    <Button type='button' onClick={handleSave} disabled={isSaving} className='h-9 px-5 font-semibold text-xs shadow-sm'>
                        {isSaving ? (
                            <>
                                <Loader2 className='mr-2 h-3.5 w-3.5 animate-spin' />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className='mr-2 h-3.5 w-3.5' />
                                Save Feedback
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
