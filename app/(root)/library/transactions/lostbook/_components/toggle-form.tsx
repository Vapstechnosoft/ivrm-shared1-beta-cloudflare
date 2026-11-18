'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { toggleLostBookRecord } from '@/server/library/transactions/lost-book';
import { useState } from 'react';
import { toast } from 'sonner';

interface ToggleLostBookFormProps {
    configId: number;
    isActive: boolean;
    configName?: string;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function ToggleLostBookForm({
    configId,
    isActive,
    configName = 'this record',
    onClose,
    onSuccess
}: ToggleLostBookFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleToggle = async () => {
        if (!configId) {
            toast.error('Invalid record ID');
            return;
        }

        try {
            setIsSubmitting(true);

            const response = await toggleLostBookRecord(configId);

            if (response.success) {
                toast.success(response.message || `Record ${isActive ? 'deactivated' : 'activated'} successfully`);
                onSuccess?.();
                onClose();
            } else {
                toast.error(response.message || 'Failed to update status');
            }
        } catch (error: any) {
            toast.error(error?.message || 'Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    const closeDialog = () => {
        if (!isSubmitting) {
            onClose();
        }
    };

    return (
        <AdaptiveDialog title='Toggle Record Status' isOpen={true} onClose={closeDialog}>
            <div className='flex flex-col gap-6'>
                <AdaptiveBody className='space-y-4'>
                    <p className='text-muted-foreground text-sm'>
                        Are you sure you want to{' '}
                        <strong className={isActive ? 'text-destructive' : 'text-green-600'}>{isActive ? 'deactivate' : 'activate'}</strong>{' '}
                        <span className='font-medium text-foreground'>"{configName}"</span>?
                    </p>
                    <p className='text-muted-foreground text-xs'>This will {isActive ? 'deactivate' : 'activate'} the lost book record.</p>
                </AdaptiveBody>

                <AdaptiveFooter>
                    <Button variant='secondary' onClick={closeDialog} disabled={isSubmitting} type='button'>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleToggle}
                        isLoading={isSubmitting}
                        disabled={isSubmitting}
                        variant={isActive ? 'destructive' : 'default'}
                        className='min-w-28'>
                        {isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                </AdaptiveFooter>
            </div>
        </AdaptiveDialog>
    );
}
