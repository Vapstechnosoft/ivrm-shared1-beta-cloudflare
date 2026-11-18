'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { useToggleLocationStatus } from '@/hooks/hrms/recruitment/masters/useMasters';
import { toast } from 'sonner';
import type { MasterLocation } from './columns';

interface ToggleMasterLocationModalProps {
    rowData: MasterLocation;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function ToggleMasterLocationModal({ rowData, isOpen, onClose, onSuccess }: ToggleMasterLocationModalProps) {
    const { mutateAsync: toggleMutation, isPending: isSubmitting } = useToggleLocationStatus();
    const isActive = rowData?.hrmlO_ActiveFlg;

    const handleToggle = async () => {
        try {
            const response = await toggleMutation(rowData.hrmlO_Id);

            if (response?.success) {
                toast.success(response?.message || `Location activate/deactivate successfully`);
                onSuccess?.();
                onClose();
            } else {
                toast.error(response?.message || `Failed to activate/deactivate location`);
            }
        } catch (error: any) {
            toast.error(error?.message || `Failed to activate/deactivate location`);
        }
    };

    return (
        <AdaptiveDialog title='Toggle Master Location Status' isOpen={isOpen} onClose={onClose}>
            <div className='flex flex-col gap-4'>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <p>
                        Are you sure you want to {isActive ? 'Deactivate' : 'Activate'} <strong>{rowData.hrmlO_LocationName}</strong>?
                    </p>
                </AdaptiveBody>
                <AdaptiveFooter>
                    <Button variant='secondary' onClick={onClose} type='button'>
                        Cancel
                    </Button>
                    <Button onClick={handleToggle} isLoading={isSubmitting} variant={isActive ? 'destructive' : 'default'}>
                        {isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                </AdaptiveFooter>
            </div>
        </AdaptiveDialog>
    );
}
