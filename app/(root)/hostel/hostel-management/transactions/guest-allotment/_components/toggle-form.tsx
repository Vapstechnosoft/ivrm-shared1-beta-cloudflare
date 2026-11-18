'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { useGuestAllotments } from '@/hooks/hostel/hostel-management/useGuestAllotment';
import { toggleGuestAllotment } from '@/server/hostel/hostel-management/transactions/guest-allotment';
import { useState } from 'react';
import { toast } from 'sonner';
import type { GuestAllotmentColumn } from './columns';

interface ToggleGuestAllotmentFormProps {
    rowData: GuestAllotmentColumn;
    onClose: () => void;
}

export default function ToggleGuestAllotmentForm({ rowData, onClose }: ToggleGuestAllotmentFormProps) {
    const { refetchAll } = useGuestAllotments();
    const isActive = rowData.hlhgstalT_ActiveFlag;
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await toggleGuestAllotment(rowData.hlhgstalT_Id);
            if (response.success) {
                toast.success(response.message || `Guest Allotment ${isActive ? 'deactivated' : 'activated'} successfully`);
                refetchAll();
                onClose();
            } else {
                toast.error(response.message || 'Failed to update status');
            }
        } catch (error: any) {
            toast.error(error.message || 'Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AdaptiveDialog title='Toggle Guest Allotment Status' isOpen={true} onClose={onClose}>
            <form onSubmit={onSubmit} className='flex flex-col gap-4'>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <p>
                        Are you sure you want to {isActive ? 'deactivate' : 'activate'} <strong>{rowData.hlhgstalT_GuestName}</strong>?
                    </p>
                </AdaptiveBody>
                <AdaptiveFooter>
                    <Button variant='secondary' onClick={onClose} type='button' disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button type='submit' isLoading={isSubmitting} variant={isActive ? 'destructive' : 'default'} disabled={isSubmitting}>
                        {isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                </AdaptiveFooter>
            </form>
        </AdaptiveDialog>
    );
}
