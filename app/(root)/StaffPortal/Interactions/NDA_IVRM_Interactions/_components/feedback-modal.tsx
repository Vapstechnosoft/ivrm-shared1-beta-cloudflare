'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { saveFeedback } from '@/server/staff-portal/interactions';
import type { IFeedbackOption, IFeedbackQuestion } from '@/types/staff-portal/interactions';
import { Loader2, MessageSquareQuote, Save } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    questions: IFeedbackQuestion[];
    options: IFeedbackOption[];
    roleFlg: string;
    userhrmE_Id: number;
}
export const dynamic = 'force-dynamic';
export function FeedbackModal({ isOpen, onClose, questions, options, roleFlg, userhrmE_Id }: FeedbackModalProps) {
    const [responses, setResponses] = useState<Record<number, { optionId: number; remark: string }>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleOptionChange = (questionId: number, optionId: number) => {
        setResponses((prev) => ({
            ...prev,
            [questionId]: {
                ...prev[questionId],
                optionId
            }
        }));
    };

    const handleRemarkChange = (questionId: number, remark: string) => {
        setResponses((prev) => ({
            ...prev,
            [questionId]: {
                ...prev[questionId],
                remark
            }
        }));
    };

    const handleSubmit = async () => {
        // Validation
        const unanswered = questions.filter((q) => !responses[q.fmqE_Id]?.optionId);
        if (unanswered.length > 0) {
            toast.error('Please answer all questions before saving.');
            return;
        }

        setIsSubmitting(true);
        try {
            const savemodulefeedback = questions.map((q) => {
                const response = responses[q.fmqE_Id];
                return {
                    FMTY_Id: q.fmtY_Id,
                    FMQE_Id: q.fmqE_Id,
                    name: response.optionId.toString(),
                    FSTTR_FeedBack: response.remark || ''
                };
            });

            const result = await saveFeedback({
                savemodulefeedback,
                Flag: roleFlg,
                HRME_Id: userhrmE_Id
            });
            if (result.success) {
                toast.success(result.message || 'Feedback submitted successfully. Thank you!');
                onClose();
            } else {
                toast.error(result.message || 'Failed to submit feedback.');
            }
        } catch (error) {
            console.error('Error saving feedback:', error);
            toast.error('An error occurred while saving feedback.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className='max-w-4xl overflow-hidden rounded-3xl border-none p-0 shadow-2xl'>
                <DialogHeader className='bg-primary p-8 text-white'>
                    <div className='flex items-center gap-4'>
                        <div className='rounded-2xl bg-white/20 p-3 backdrop-blur-md'>
                            <MessageSquareQuote className='h-8 w-8 text-white' />
                        </div>
                        <div>
                            <DialogTitle className='font-black text-2xl tracking-tight'>System Feedback</DialogTitle>
                            <p className='mt-1 font-medium text-primary-foreground/80 text-sm'>
                                Your feedback helps us improve our interaction system.
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                <ScrollArea className='max-h-[60vh] p-8'>
                    <div className='space-y-12'>
                        {questions.map((question, index) => (
                            <div key={question.fmqE_Id} className='group space-y-6'>
                                <div className='space-y-2'>
                                    <h4 className='font-black text-lg tracking-tight transition-colors group-hover:text-primary'>
                                        <span className='mr-2 text-primary/40'>0{index + 1}.</span>
                                        {question.fmqE_FeedbackQuestions}
                                    </h4>
                                    <div className='h-1 w-12 rounded-full bg-primary/10 transition-all duration-300 group-hover:w-20' />
                                </div>

                                <RadioGroup
                                    className='flex flex-wrap gap-4'
                                    onValueChange={(val) => handleOptionChange(question.fmqE_Id, Number(val))}>
                                    {question.feedbackoptiondata?.map((option) => (
                                        <div key={option.fmoP_Id} className='flex items-center space-x-2'>
                                            <Label
                                                htmlFor={`q-${question.fmqE_Id}-o-${option.fmoP_Id}`}
                                                className='flex cursor-pointer items-center gap-2 rounded-xl border-2 px-6 py-3 font-bold transition-all hover:bg-muted'
                                                style={{
                                                    borderColor:
                                                        responses[question.fmqE_Id]?.optionId === option.fmoP_Id
                                                            ? 'hsl(var(--primary))'
                                                            : 'transparent',
                                                    backgroundColor:
                                                        responses[question.fmqE_Id]?.optionId === option.fmoP_Id
                                                            ? 'hsl(var(--primary)/0.05)'
                                                            : 'hsl(var(--muted)/0.3)'
                                                }}>
                                                <RadioGroupItem
                                                    value={option.fmoP_Id.toString()}
                                                    id={`q-${question.fmqE_Id}-o-${option.fmoP_Id}`}
                                                    className='sr-only'
                                                />
                                                <span className='text-sm'>{option.fmoP_FeedbackOptions}</span>
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>

                                <div className='space-y-2'>
                                    <Label className='ml-1 font-black text-[11px] text-muted-foreground uppercase tracking-widest'>
                                        Optional Remark
                                    </Label>
                                    <Textarea
                                        placeholder='Tell us more...'
                                        className='min-h-[100px] rounded-2xl border-none bg-muted/30 p-4 font-medium text-sm focus-visible:ring-primary/20'
                                        onChange={(e) => handleRemarkChange(question.fmqE_Id, e.target.value)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                <DialogFooter className='flex items-center justify-between bg-muted/30 p-6'>
                    <Button
                        variant='ghost'
                        onClick={onClose}
                        disabled={isSubmitting}
                        className='font-bold text-muted-foreground uppercase tracking-widest'>
                        Remind Me Later
                    </Button>
                    <Button
                        className='h-12 min-w-[180px] rounded-2xl font-black shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]'
                        onClick={handleSubmit}
                        disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className='mr-2 h-4 w-4' />
                                Submit Feedback
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default FeedbackModal;
