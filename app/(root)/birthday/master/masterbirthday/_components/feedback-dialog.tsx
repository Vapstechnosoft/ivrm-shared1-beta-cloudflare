'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { saveFeedback } from '@/server/alumni/alumni-student-birthday';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface FeedbackDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    questions: any[];
    mI_Id?: number;
    hrmE_Id?: number;
}

export default function FeedbackDialog({ open, onOpenChange, questions, mI_Id, hrmE_Id }: FeedbackDialogProps) {
    const [responses, setResponses] = useState<any[]>([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (questions?.length > 0) {
            setResponses(
                questions.map((q) => ({
                    FMQE_Id: q.fmqE_Id,
                    FMTY_Id: q.fmtY_Id,
                    fmoP_Id: 0,
                    fsttR_FeedBack: '',
                    fmqE_FeedbackQuestions: q.fmqE_FeedbackQuestions,
                    fmtY_FeedbackTypeName: q.fmtY_FeedbackTypeName,
                    feedbackoptiondata: q.feedbackoptiondata
                }))
            );
        }
    }, [questions]);

    const handleOptionChange = (qIndex: number, optionId: number) => {
        const newResponses = [...responses];
        newResponses[qIndex].fmoP_Id = optionId;
        setResponses(newResponses);
    };

    const handleRemarkChange = (qIndex: number, remark: string) => {
        const newResponses = [...responses];
        newResponses[qIndex].fsttR_FeedBack = remark;
        setResponses(newResponses);
    };

    const handleSubmit = async () => {
        // Validation
        const incomplete = responses.some((r) => r.fmoP_Id === 0 || !r.fsttR_FeedBack);
        if (incomplete) {
            toast.error('Please answer all questions and provide remarks');
            return;
        }

        setSubmitting(true);
        try {
            const feedbackList = responses.map((r) => ({
                fmtY_Id: r.FMTY_Id,
                fmqE_Id: r.FMQE_Id,
                name: String(r.fmoP_Id),
                fsttR_FeedBack: r.fsttR_FeedBack
            }));

            const res = await saveFeedback({
                mi_Id: mI_Id || 0,
                hrmE_Id: hrmE_Id || 0,
                savemodulefeedback: feedbackList
            });
            if (res.success) {
                toast.success(res.message || 'Feedback submitted successfully');
                onOpenChange(false);
            } else {
                toast.error(res.message || 'Failed to save feedback');
            }
        } catch (error) {
            toast.error('An error occurred while saving feedback');
        } finally {
            setSubmitting(false);
        }
    };

    if (!questions || questions.length === 0) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='flex max-h-[90vh] max-w-4xl flex-col overflow-hidden rounded-[32px] border-none p-0 shadow-2xl'>
                <DialogHeader className='bg-primary p-8 text-primary-foreground'>
                    <DialogTitle className='font-bold text-2xl tracking-tight'>Module Feedback</DialogTitle>
                    <DialogDescription className='font-medium text-primary-foreground/80'>
                        Your feedback helps us improve. Please answer the following questions.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className='flex-1 p-8'>
                    <div className='space-y-12 pb-8'>
                        {responses.map((resp, idx) => (
                            <div
                                key={resp.FMQE_Id}
                                className='fade-in slide-in-from-bottom-4 animate-in space-y-6 duration-500'
                                style={{ animationDelay: `${idx * 100}ms` }}>
                                <div className='space-y-3'>
                                    <h3 className='flex gap-3 font-bold text-lg text-slate-800'>
                                        <span className='font-black text-primary/40'>{idx + 1}.</span>
                                        {resp.fmqE_FeedbackQuestions}
                                    </h3>

                                    <RadioGroup
                                        value={resp.fmoP_Id.toString()}
                                        onValueChange={(val) => handleOptionChange(idx, Number(val))}
                                        className='flex flex-wrap gap-4 pt-2'>
                                        {resp.feedbackoptiondata?.map((opt: any) => (
                                            <div
                                                key={opt.fmoP_Id}
                                                className='flex cursor-pointer items-center space-x-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-2 transition-colors hover:bg-slate-100'>
                                                <RadioGroupItem value={opt.fmoP_Id.toString()} id={`q-${idx}-opt-${opt.fmoP_Id}`} />
                                                <label
                                                    htmlFor={`q-${idx}-opt-${opt.fmoP_Id}`}
                                                    className='cursor-pointer select-none font-semibold text-slate-600 text-sm'>
                                                    {opt.fmoP_FeedbackOptions}
                                                </label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </div>

                                <div className='space-y-2'>
                                    <label className='font-bold text-slate-400 text-xs uppercase tracking-widest'>Your Remarks</label>
                                    <Textarea
                                        placeholder='Enter your detailed feedback here...'
                                        value={resp.fsttR_FeedBack}
                                        onChange={(e) => handleRemarkChange(idx, e.target.value)}
                                        className='min-h-[100px] resize-none rounded-2xl border-slate-200 transition-all focus:ring-primary/20'
                                    />
                                </div>
                                {idx < responses.length - 1 && <Separator className='opacity-50' />}
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                <DialogFooter className='flex items-center justify-center gap-4 border-t bg-slate-50 p-8 sm:justify-center'>
                    <Button
                        variant='ghost'
                        onClick={() => onOpenChange(false)}
                        className='h-12 rounded-xl px-8 font-bold text-slate-500 hover:bg-slate-200'>
                        SKIP FOR NOW
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className='h-12 animate-pulse-slow rounded-xl px-12 font-bold shadow-primary/20 shadow-xl'>
                        {submitting ? 'SAVING...' : 'SAVE FEEDBACK'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
