'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { deactivateEvent } from '@/server/coe/masters/master-coe';
import type { IEventsMapping } from '@/types/alumni/master-coe';
import type React from 'react';
import Swal from 'sweetalert2';

interface ToggleEventsMappingFormProps {
    rowData: IEventsMapping;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function ToggleEventsMappingForm({ rowData, onClose, onSuccess }: ToggleEventsMappingFormProps) {
    const handleConfirm = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const coeeId = rowData.coeE_Id || (rowData as any).COEE_Id;
            const isActive = rowData.coeE_ActiveFlag || (rowData as any).COEE_ActiveFlag;

            // Use deactivate API for both activation and deactivation as it acts as a toggle
            const res = await deactivateEvent(coeeId);

            const isSuccess = res.success === true || res.returnval === true || res.message?.toLowerCase().includes('successfully');

            if (isSuccess) {
                Swal.fire({
                    title: 'Success!',
                    text: res.message || `Mapping ${isActive ? 'deactivated' : 'activated'} successfully`,
                    icon: 'success'
                });
                onSuccess?.();
                onClose();
            } else {
                Swal.fire({
                    title: 'Failed!',
                    text: res.message || 'Failed to update mapping status',
                    icon: 'error'
                });
            }
        } catch (error: any) {
            Swal.fire({
                title: 'Error!',
                text: error.message || 'Failed to update mapping status',
                icon: 'error'
            });
        }
    };

    return (
        <AdaptiveDialog
            title={`${rowData.coeE_ActiveFlag || (rowData as any).COEE_ActiveFlag ? 'Deactivate' : 'Activate'} Mapping?`}
            isOpen={true}
            onClose={onClose}>
            <form onSubmit={handleConfirm} className='flex flex-col gap-4'>
                <AdaptiveBody>
                    Are you sure you want to {rowData.coeE_ActiveFlag || (rowData as any).COEE_ActiveFlag ? 'deactivate' : 'activate'} the
                    mapping for event &quot;{rowData.coemE_EventName || (rowData as any).COEME_EventName}&quot;?
                </AdaptiveBody>
                <AdaptiveFooter>
                    <Button variant='secondary' onClick={onClose} type='button'>
                        Cancel
                    </Button>
                    <Button type='submit' variant={rowData.coeE_ActiveFlag || (rowData as any).COEE_ActiveFlag ? 'destructive' : 'default'}>
                        {rowData.coeE_ActiveFlag || (rowData as any).COEE_ActiveFlag ? 'Deactivate' : 'Activate'}
                    </Button>
                </AdaptiveFooter>
            </form>
        </AdaptiveDialog>
    );
}
