'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { useTogglePositionStatus } from '@/hooks/hrms/recruitment/masters/useMasters';
import { toast } from 'sonner';
import type { MasterPosition } from './columns';

interface ToggleMasterPositionModalProps {
    rowData: MasterPosition;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ToggleMasterPositionModal({ rowData, isOpen, onClose, onSuccess }: ToggleMasterPositionModalProps) {
    const { mutateAsync: toggleMutation, isPending: isSubmitting } = useTogglePositionStatus();
    const isActive = rowData?.hrmP_ActiveFlg;

    const handleToggle = async () => {
        try {
            const response = await toggleMutation(rowData.hrmP_Id);

            if (response?.success) {
                toast.success(response?.message || `Position activated/deactivated successfully`);
                onSuccess();
                onClose();
            } else {
                toast.error(response?.message || `Failed to activate/deactivate position`);
            }
        } catch (error: any) {
            toast.error(error?.message || `Failed to activate/deactivate position`);
        }
    };

    return (
        <AdaptiveDialog title='Toggle Master Position Status' isOpen={isOpen} onClose={onClose}>
            <div className='flex flex-col gap-4'>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <p>
                        Are you sure you want to {isActive ? 'Deactivate' : 'Activate'} <strong>{rowData.hrmP_Position}</strong>?
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
