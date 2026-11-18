'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { FormError } from '@/components/ui/extension/field';
import { useDeleteLeaveById } from '@/hooks/hrms/leave-management/useAdminOnDutyApply';
import type { AdminOnDutyApply } from '@/types/hrms/leave-management/admin-on-duty-apply';
import { useState } from 'react';

interface DeleteAdminOnDutyFormProps {
    rowData: AdminOnDutyApply;
    onClose: () => void;
}

export default function DeleteAdminOnDutyForm({ rowData, onClose }: DeleteAdminOnDutyFormProps) {
    const { mutate: deleteLeave, isPending: isSubmitting } = useDeleteLeaveById();
    const [error, setError] = useState<string | null>(null);

    console.log('rowData', rowData);
    const handleDelete = () => {
        try {
            setError(null);
            deleteLeave(rowData.id, {
                onSuccess: () => {
                    onClose();
                },
                onError: (err: any) => {
                    setError(err?.message || 'Failed to delete admin on-duty request');
                }
            });
        } catch (err: any) {
            setError(err?.message || 'Failed to delete admin on-duty request');
        }
    };

    return (
        <AdaptiveDialog title='Delete Admin On-Duty Request' isOpen={true} onClose={onClose}>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleDelete();
                }}
                className='flex flex-col gap-4'>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <p>
                        Are you sure you want to delete the admin on-duty request for{' '}
                        <strong>{rowData.employeeName || 'this record'}</strong>?
                    </p>
                    {rowData.fromDate && rowData.toDate && (
                        <p className='text-muted-foreground text-sm'>
                            Period: {new Date(rowData.fromDate).toLocaleDateString()} to {new Date(rowData.toDate).toLocaleDateString()}
                        </p>
                    )}
                    <FormError>{error || ''}</FormError>
                </AdaptiveBody>
                <AdaptiveFooter>
                    <Button variant='secondary' onClick={onClose} type='button' disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button type='submit' isLoading={isSubmitting} variant={'destructive'}>
                        Delete
                    </Button>
                </AdaptiveFooter>
            </form>
        </AdaptiveDialog>
    );
}
