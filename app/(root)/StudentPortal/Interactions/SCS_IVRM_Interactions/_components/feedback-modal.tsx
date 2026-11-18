'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { saveFeedback } from '@/server/staff-portal/interactions';
import type { IFeedbackOption, IFeedbackQuestion } from '@/types/staff-portal/interactions';
import { GraduationCap, Loader2, Send, Sparkles } from 'lucide-react';
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
    const [responses, setResponses] = useState<Record<number, { optionId: number; remarks: string }>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleOptionSelect = (qId: number, oId: number) => {
        setResponses((prev) => ({
            ...prev,
            [qId]: { ...prev[qId], optionId: oId }
        }));
    };

    const handleRemarksChange = (qId: number, text: string) => {
        setResponses((prev) => ({
            ...prev,
            [qId]: { ...prev[qId], remarks: text }
        }));
    };

    const handleSubmit = async () => {
        const feedbackArray = Object.entries(responses).map(([qId, data]) => {
            const question = questions.find((q) => q.fmqE_Id === Number(qId));
            const option = question?.feedbackoptiondata.find((o) => o.fmoP_Id === data.optionId);

            return {
                name: data.optionId,
                FMOP_FeedbackOptions: option?.fmoP_FeedbackOptions || '',
                FMOP_OptionsValue: option?.fmoP_OptionsValue || '',
                FMTY_Id: question?.fmtY_Id,
                FMQE_Id: question?.fmqE_Id,
                FMQE_FeedbackQuestions: question?.fmqE_FeedbackQuestions,
                FMQE_FeedbackQRemarks: data.remarks || '',
                FMTY_FeedbackTypeName: question?.fmtY_FeedbackTypeName,
                FSTTR_FeedBack: data.remarks || ''
            };
        });

        if (feedbackArray.length === 0) {
            toast.error('Please answer at least one question');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await saveFeedback({
                savemodulefeedback: feedbackArray,
                Flag: roleFlg,
                HRME_Id: userhrmE_Id
            });
            if (res.success && res.data?.returnval) {
                toast.success('Thank you for your feedback!');
                onClose();
            } else {
                toast.error(res.message || 'Failed to save feedback');
            }
        } catch (error) {
            toast.error('An error occurred during submission');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className='flex max-h-[85vh] max-w-2xl flex-col overflow-hidden border-none bg-background/95 p-0 shadow-2xl backdrop-blur-md'>
                <DialogHeader className='relative overflow-hidden border-b bg-primary/5 p-8'>
                    <Sparkles className='-right-4 -top-4 absolute h-24 w-24 rotate-12 text-primary/10' />
                    <div className='relative z-10 flex items-center gap-4'>
                        <div className='rounded-2xl bg-primary/10 p-3 text-primary'>
                            <GraduationCap className='h-8 w-8' />
                        </div>
                        <div className='space-y-1'>
                            <DialogTitle className='font-black text-2xl text-primary tracking-tight'>We Value Your Feedback</DialogTitle>
                            <p className='font-medium text-muted-foreground text-sm'>Help us improve your interaction experience.</p>
                        </div>
                    </div>
                </DialogHeader>

                <ScrollArea className='flex-1 px-8 py-6'>
                    <div className='flex flex-col gap-10 py-4'>
                        {questions.map((q, idx) => (
                            <div
                                key={q.fmqE_Id}
                                className='fade-in slide-in-from-bottom-2 animate-in space-y-6 duration-500'
                                style={{ animationDelay: `${idx * 100}ms` }}>
                                <div className='space-y-2'>
                                    <h3 className='group flex items-start gap-3 font-bold text-lg leading-tight'>
                                        <span className='mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 font-black text-[10px] text-primary'>
                                            {idx + 1}
                                        </span>
                                        {q.fmqE_FeedbackQuestions}
                                    </h3>
                                    {q.fmtY_FeedbackTypeName && (
                                        <Badge
                                            variant='secondary'
                                            className='ml-9 font-bold text-[10px] uppercase tracking-widest opacity-70'>
                                            {q.fmtY_FeedbackTypeName}
                                        </Badge>
                                    )}
                                </div>

                                <div className='ml-9'>
                                    <RadioGroup
                                        className='grid grid-cols-2 gap-3'
                                        onValueChange={(val) => handleOptionSelect(q.fmqE_Id, Number(val))}>
                                        {q.feedbackoptiondata.map((opt) => (
                                            <Label
                                                key={opt.fmoP_Id}
                                                className={cn(
                                                    'flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition-all hover:bg-accent/50',
                                                    responses[q.fmqE_Id]?.optionId === opt.fmoP_Id
                                                        ? 'border-primary bg-primary/5 shadow-inner'
                                                        : 'border-transparent bg-muted/40'
                                                )}>
                                                <RadioGroupItem value={opt.fmoP_Id.toString()} />
                                                <span className='font-semibold text-sm'>{opt.fmoP_FeedbackOptions}</span>
                                            </Label>
                                        ))}
                                    </RadioGroup>

                                    <div className='mt-4 space-y-2'>
                                        <Label className='ml-1 font-bold text-muted-foreground text-xs uppercase'>Additional Remarks</Label>
                                        <Textarea
                                            placeholder='Tell us more (optional)...'
                                            className='resize-none bg-muted/20 focus-visible:ring-primary/20'
                                            onBlur={(e) => handleRemarksChange(q.fmqE_Id, e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                <DialogFooter className='border-t bg-muted/30 p-8'>
                    <div className='flex w-full items-center justify-between gap-4'>
                        <p className='text-muted-foreground text-xs italic'>Your responses are anonymous and help us improve.</p>
                        <div className='flex gap-3'>
                            <Button variant='ghost' onClick={onClose} className='font-bold'>
                                Skip for now
                            </Button>
                            <Button
                                className='min-w-[140px] font-bold shadow-lg shadow-primary/20'
                                onClick={handleSubmit}
                                disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <Loader2 className='h-4 w-4 animate-spin' />
                                ) : (
                                    <>
                                        Submit Feedback
                                        <Send className='ml-2 h-4 w-4' />
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
