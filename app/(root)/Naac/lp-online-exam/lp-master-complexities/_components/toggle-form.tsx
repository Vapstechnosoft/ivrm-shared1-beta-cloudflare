'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useMasterComplexity, useToggleMasterComplexity } from '@/hooks/exam/online-exam/useMasters';
import type { IMasterComplexity } from '@/types/exam/online-exam/masters';
import { useState } from 'react';
import { toast } from 'sonner';

interface ToggleMasterComplexityFormProps {
    rowData: IMasterComplexity;
    onClose: () => void;
}

export default function ToggleMasterComplexityForm({ rowData, onClose }: ToggleMasterComplexityFormProps) {
    const { refetch } = useMasterComplexity(undefined, { enabled: false });
    const toggleMutation = useToggleMasterComplexity();
    const [isLoading, setIsLoading] = useState(false);
    const isActive = rowData.lpmcomP_ActiveFlg;

    const handleConfirm = async () => {
        setIsLoading(true);
        try {
            const response = await toggleMutation.mutateAsync(rowData.lpmcomP_Id);

            if (response?.success !== false && !response?.error) {
                toast.success(`Complexity successfully ${isActive ? 'deactivated' : 'activated'}!`);
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
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className='sm:max-w-md'>
                <DialogHeader>
                    <DialogTitle>{isActive ? 'Deactivate' : 'Activate'} Complexity</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to {isActive ? 'deactivate' : 'activate'}{' '}
                        <strong className='font-semibold text-foreground'>{rowData.lpmcomP_ComplexityName}</strong>?
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
