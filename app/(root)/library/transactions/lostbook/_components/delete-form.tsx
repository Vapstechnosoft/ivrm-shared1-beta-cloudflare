'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { deleteLostBookRecord } from '@/server/library/transactions/lost-book';
import type { ILostBookList } from '@/types/library/transactions/transactions';
import { useState } from 'react';
import { toast } from 'sonner';

interface DeleteLostBookFormProps {
    rowData: ILostBookList;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function DeleteLostBookForm({ rowData, onClose, onSuccess }: DeleteLostBookFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleDelete = async () => {
        if (!rowData.lmbanO_Id) {
            toast.error('Invalid record ID');
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await deleteLostBookRecord(rowData.lmbanO_Id);

            if (response.success) {
                toast.success(response.message || 'Record deleted successfully');
                onSuccess?.();
                onClose();
            } else {
                toast.error(response.message || 'Failed to delete record');
            }
        } catch (error: any) {
            toast.error(error?.message || 'Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AdaptiveDialog title='Delete Lost Book Record' isOpen={true} onClose={onClose}>
            <div className='flex flex-col gap-6'>
                <AdaptiveBody className='space-y-4'>
                    <p className='text-muted-foreground text-sm'>
                        Are you sure you want to delete the lost book record for{' '}
                        <span className='font-medium text-foreground'>"{rowData.lmB_BookTitle}"</span>?
                    </p>
                    <p className='font-semibold text-red-500 text-xs'>This action cannot be undone.</p>
                </AdaptiveBody>

                <AdaptiveFooter>
                    <Button variant='secondary' onClick={onClose} disabled={isSubmitting} type='button'>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDelete}
                        isLoading={isSubmitting}
                        disabled={isSubmitting}
                        variant='destructive'
                        className='min-w-28'>
                        Delete
                    </Button>
                </AdaptiveFooter>
            </div>
        </AdaptiveDialog>
    );
}
