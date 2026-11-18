'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useMasterQuestion, useToggleMasterQuestion } from '@/hooks/exam/online-exam/useMasters';
import type { IMasterQuestionList } from '@/types/exam/online-exam/masters';
import { useState } from 'react';
import { toast } from 'sonner';

interface ToggleQuestionFormProps {
    rowData: IMasterQuestionList;
    onClose: () => void;
}

export default function ToggleQuestionForm({ rowData, onClose }: ToggleQuestionFormProps) {
    const { refetch } = useMasterQuestion(undefined, { enabled: false });
    const toggleMutation = useToggleMasterQuestion();
    const [isLoading, setIsLoading] = useState(false);
    const isActive = rowData.lmsmoeQ_ActiveFlg;

    const handleConfirm = async () => {
        setIsLoading(true);
        try {
            const questionId = rowData.lmsmoeQ_Id || (rowData as any).lpmoeQ_Id;
            const response = await toggleMutation.mutateAsync(questionId);

            if (response?.success !== false && !response?.error) {
                toast.success(`Question successfully ${isActive ? 'deactivated' : 'activated'}!`);
                refetch();
                onClose();
            } else {
                toast.error(response?.message || response?.error || 'Failed to toggle status');
            }
        } catch (error: any) {
            toast.error(error?.message || 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className='sm:max-w-md'>
                <DialogHeader>
                    <DialogTitle className='font-semibold text-lg'>{isActive ? 'Deactivate Question' : 'Activate Question'}</DialogTitle>
                    <DialogDescription className='text-muted-foreground text-sm'>
                        Are you sure you want to {isActive ? 'deactivate' : 'activate'} this question?
                    </DialogDescription>
                </DialogHeader>

                <div className='rounded-md border bg-muted/40 p-3 text-sm'>
                    <p className='truncate font-semibold text-foreground'>{rowData.lmsmoeQ_Question}</p>
                    <p className='mt-1 text-muted-foreground text-xs'>
                        Subject: {rowData.ismS_SubjectName || 'N/A'} | Marks: {rowData.lmsmoeQ_Marks}
                    </p>
                </div>

                <DialogFooter className='gap-2 sm:gap-0'>
                    <Button type='button' variant='outline' onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button type='button' variant={isActive ? 'destructive' : 'default'} onClick={handleConfirm} disabled={isLoading}>
                        {isLoading ? 'Processing...' : isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
