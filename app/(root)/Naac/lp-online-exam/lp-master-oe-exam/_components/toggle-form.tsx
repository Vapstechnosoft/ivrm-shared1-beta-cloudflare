'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useMasterOEExam, useToggleMasterOEExam } from '@/hooks/naac/lp-online-exam/useMasters';
import type { IMasterOEExam } from '@/types/naac/lp-online-exam/masters';
import { useState } from 'react';
import { toast } from 'sonner';

interface ToggleMasterOEExamFormProps {
    rowData: IMasterOEExam;
    onClose: () => void;
}

export default function ToggleMasterOEExamForm({ rowData, onClose }: ToggleMasterOEExamFormProps) {
    const { refetchAll } = useMasterOEExam();
    const toggleMutation = useToggleMasterOEExam();
    const [isLoading, setIsLoading] = useState(false);
    const isActive = rowData.lpmoeeX_ActiveFlg;

    const handleConfirm = async () => {
        setIsLoading(true);
        try {
            const res = await toggleMutation.mutateAsync(rowData.lpmoeeX_Id);
            if (res?.success !== false && !res?.error) {
                toast.success(`Exam successfully ${isActive ? 'deactivated' : 'activated'}!`);
                refetchAll();
                onClose();
            } else {
                toast.error(res?.message || res?.error || 'Failed to toggle status');
            }
        } catch (error: any) {
            toast.error(error?.message || 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className='sm:max-w-md'>
                <DialogHeader>
                    <DialogTitle>{isActive ? 'Deactivate' : 'Activate'} Exam</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to {isActive ? 'deactivate' : 'activate'}{' '}
                        <strong className='font-semibold text-foreground'>{rowData.lpmoeeX_ExamName}</strong>?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className='flex flex-row justify-end gap-2'>
                    <Button variant='outline' onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button variant={isActive ? 'destructive' : 'default'} onClick={handleConfirm} disabled={isLoading}>
                        {isLoading ? 'Updating...' : isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
