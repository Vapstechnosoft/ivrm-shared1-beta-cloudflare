'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { useToggleLeaveTransactionManual } from '@/hooks/hrms/leave-management/useLeaveTransactionManual';
import { useState } from 'react';
import { toast } from 'sonner';
import type { LeaveCreditTransaction } from './columns';

interface ToggleLeaveTransactionManualFormProps {
    rowData: LeaveCreditTransaction;
    onClose: () => void;
    onSuccess: () => void;
}

export function ToggleLeaveTransactionManualForm({ rowData, onClose, onSuccess }: ToggleLeaveTransactionManualFormProps) {
    const { mutate: toggleStatus } = useToggleLeaveTransactionManual();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isActive = rowData.isActive;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const idToToggle = rowData.transactionId;

        toggleStatus(idToToggle, {
            onSuccess: () => {
                toast.success(`Transaction ${!isActive ? 'activated' : 'deactivated'} successfully`);
                onSuccess();
                onClose();
            },
            onError: (error) => {
                toast.error(error.message || `Failed to ${!isActive ? 'activate' : 'deactivate'} transaction`);
                setIsSubmitting(false);
            }
        });
    };

    return (
        <AdaptiveDialog title='Toggle Transaction Status' isOpen={true} onClose={onClose}>
            <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <p>
                        Are you sure you want to {isActive ? 'deactivate' : 'activate'} the transaction for{' '}
                        <strong>{rowData.employeeName}</strong>?
                    </p>
                </AdaptiveBody>
                <AdaptiveFooter>
                    <Button variant='secondary' onClick={onClose} type='button'>
                        Cancel
                    </Button>
                    <Button type='submit' isLoading={isSubmitting} variant={isActive ? 'destructive' : 'default'}>
                        {isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                </AdaptiveFooter>
            </form>
        </AdaptiveDialog>
    );
}
