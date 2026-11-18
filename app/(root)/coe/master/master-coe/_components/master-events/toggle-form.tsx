'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { deactivateMasterEvent } from '@/server/coe/masters/master-coe';
import type { IMasterEvent } from '@/types/alumni/master-coe';
import type React from 'react';
import Swal from 'sweetalert2';

interface ToggleMasterEventFormProps {
    rowData: IMasterEvent;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function ToggleMasterEventForm({ rowData, onClose, onSuccess }: ToggleMasterEventFormProps) {
    const isActive = rowData.COEME_ActiveFlag ?? (rowData as any).coemE_ActiveFlag;
    const eventName = rowData.COEME_EventName || (rowData as any).coemE_EventName;

    const handleConfirm = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const coemeId = rowData.COEME_Id || (rowData as any).coemE_Id;

            const res = await deactivateMasterEvent(coemeId);

            const isSuccess = res.success === true || res.returnval === true || res.message?.toLowerCase().includes('successfully');

            if (isSuccess) {
                Swal.fire({
                    title: 'Success!',
                    text: res.message || `Event ${isActive ? 'deactivated' : 'activated'} successfully`,
                    icon: 'success'
                });
                onSuccess?.();
                onClose();
            } else {
                Swal.fire({
                    title: 'Failed!',
                    text: res.message || 'Failed to update event status',
                    icon: 'error'
                });
            }
        } catch (error: any) {
            Swal.fire({
                title: 'Error!',
                text: error.message || 'Failed to update event status',
                icon: 'error'
            });
        }
    };

    return (
        <AdaptiveDialog title={`${isActive ? 'Deactivate' : 'Activate'} Event?`} isOpen={true} onClose={onClose}>
            <form onSubmit={handleConfirm} className='flex flex-col gap-4'>
                <AdaptiveBody>
                    Are you sure you want to {isActive ? 'deactivate' : 'activate'} the event &quot;{eventName}&quot;?
                </AdaptiveBody>
                <AdaptiveFooter>
                    <Button variant='secondary' onClick={onClose} type='button'>
                        Cancel
                    </Button>
                    <Button type='submit' variant={isActive ? 'destructive' : 'default'}>
                        {isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                </AdaptiveFooter>
            </form>
        </AdaptiveDialog>
    );
}
