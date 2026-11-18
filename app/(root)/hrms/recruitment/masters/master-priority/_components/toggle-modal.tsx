'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { useTogglePriorityStatus } from '@/hooks/hrms/recruitment/masters/useMasters';
import { toast } from 'sonner';
import type { MasterPriority } from './columns';

interface ToggleMasterPriorityModalProps {
    rowData: MasterPriority;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ToggleMasterPriorityModal({ rowData, isOpen, onClose, onSuccess }: ToggleMasterPriorityModalProps) {
    const { mutateAsync: toggleMutation, isPending: isSubmitting } = useTogglePriorityStatus();
    const isActive = rowData?.hrmP_ActiveFlag;

    const handleToggle = async () => {
        try {
            const response = await toggleMutation(rowData.hrmpR_Id);

            if (response?.success) {
                toast.success(response?.message || `Priority status toggled successfully`);
                onSuccess();
                onClose();
            } else {
                toast.error(response?.message || `Failed to toggle priority status`);
            }
        } catch (error: any) {
            toast.error(error?.message || `Failed to toggle priority status`);
        }
    };

    return (
        <AdaptiveDialog title='Toggle Master Priority Status' isOpen={isOpen} onClose={onClose}>
            <div className='flex flex-col gap-4'>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <p>
                        Are you sure you want to {isActive ? 'Deactivate' : 'Activate'} <strong>{rowData.hrmP_Name}</strong>?
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
