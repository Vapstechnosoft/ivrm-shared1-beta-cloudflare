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
import { GraduationCap, Loader2, Send, Sparkles, Star } from 'lucide-react';
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
            toast.error('Please answer at least one question before submitting');
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
                toast.success('Your feedback has been submitted. Thank you!');
                onClose();
            } else {
                toast.error(res.message || 'There was an issue saving your feedback.');
            }
        } catch (error) {
            toast.error('A system error occurred. Please try again later.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className='flex max-h-[90vh] max-w-2xl flex-col overflow-hidden border-none bg-background/95 p-0 shadow-3xl ring-1 ring-primary/10 backdrop-blur-2xl'>
                <DialogHeader className='relative overflow-hidden border-b bg-gradient-to-br from-primary/[0.08] to-primary/[0.02] p-10'>
                    <Sparkles className='-right-8 -top-8 absolute h-32 w-32 rotate-12 text-primary/5' />
                    <Star className='-bottom-4 -rotate-12 absolute left-1/4 h-16 w-16 text-primary/5' />
                    <div className='relative z-10 flex items-center gap-6'>
                        <div className='rounded-2xl bg-primary p-4 text-white shadow-primary/20 shadow-xl'>
                            <GraduationCap className='h-10 w-10' />
                        </div>
                        <div className='space-y-1'>
                            <DialogTitle className='font-black text-3xl text-foreground leading-tight tracking-tight'>
                                Help Us Improve
                            </DialogTitle>
                            <p className='font-bold text-muted-foreground text-sm uppercase tracking-widest opacity-60'>
                                Your feedback shapes our platform
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                <ScrollArea className='flex-1 px-10 py-10'>
                    <div className='flex flex-col gap-14 py-4'>
                        {questions.map((q, idx) => (
                            <div
                                key={q.fmqE_Id}
                                className='fade-in slide-in-from-bottom-4 animate-in space-y-8 duration-700'
                                style={{ animationDelay: `${idx * 150}ms` }}>
                                <div className='space-y-3'>
                                    <h3 className='flex items-start gap-4 font-black text-xl leading-tight'>
                                        <span className='mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary font-black text-[12px] text-white shadow-lg shadow-primary/20'>
                                            {idx + 1}
                                        </span>
                                        {q.fmqE_FeedbackQuestions}
                                    </h3>
                                    {q.fmtY_FeedbackTypeName && (
                                        <Badge
                                            variant='secondary'
                                            className='ml-12 border-none bg-primary/5 px-3 py-1 font-black text-[10px] text-primary uppercase tracking-[0.2em]'>
                                            {q.fmtY_FeedbackTypeName}
                                        </Badge>
                                    )}
                                </div>

                                <div className='ml-12'>
                                    <RadioGroup
                                        className='grid grid-cols-2 gap-4'
                                        onValueChange={(val) => handleOptionSelect(q.fmqE_Id, Number(val))}>
                                        {q.feedbackoptiondata.map((opt) => (
                                            <Label
                                                key={opt.fmoP_Id}
                                                className={cn(
                                                    'flex cursor-pointer items-center gap-4 rounded-2xl border-2 p-5 transition-all duration-300',
                                                    responses[q.fmqE_Id]?.optionId === opt.fmoP_Id
                                                        ? 'border-primary bg-primary/[0.03] shadow-lg shadow-primary/5 ring-4 ring-primary/5'
                                                        : 'border-muted-foreground/10 bg-transparent hover:border-primary/30 hover:bg-muted/50'
                                                )}>
                                                <RadioGroupItem value={opt.fmoP_Id.toString()} className='h-5 w-5 border-2 text-primary' />
                                                <span className='font-black text-sm tracking-tight'>{opt.fmoP_FeedbackOptions}</span>
                                            </Label>
                                        ))}
                                    </RadioGroup>

                                    <div className='mt-8 space-y-3'>
                                        <Label className='ml-1 font-black text-[10px] text-muted-foreground uppercase italic tracking-widest opacity-70'>
                                            Additional Commentary
                                        </Label>
                                        <Textarea
                                            placeholder="We'd love to hear more details..."
                                            className='min-h-[100px] resize-none rounded-2xl border-2 bg-muted/20 px-5 py-4 font-medium placeholder:opacity-40 focus-visible:ring-primary/20'
                                            onBlur={(e) => handleRemarksChange(q.fmqE_Id, e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                <DialogFooter className='border-t bg-muted/30 p-10 shadow-[0_-10px_30px_-5px_rgba(0,0,0,0.03)]'>
                    <div className='flex w-full items-center justify-between gap-8'>
                        <p className='max-w-[200px] font-medium text-muted-foreground text-xs italic leading-relaxed opacity-60'>
                            Your honest feedback helps us provide a better experience.
                        </p>
                        <div className='flex gap-4'>
                            <Button
                                variant='ghost'
                                onClick={onClose}
                                className='h-14 px-8 font-black text-muted-foreground uppercase tracking-widest hover:text-foreground'>
                                Maybe Later
                            </Button>
                            <Button
                                className='h-14 min-w-[180px] rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]'
                                onClick={handleSubmit}
                                disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <Loader2 className='h-5 w-5 animate-spin' />
                                ) : (
                                    <>
                                        Submit Feedback
                                        <Send className='ml-3 h-4 w-4' />
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
