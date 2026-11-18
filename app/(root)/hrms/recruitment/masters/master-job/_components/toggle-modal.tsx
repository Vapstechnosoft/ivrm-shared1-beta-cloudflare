'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { useToggleJobStatus } from '@/hooks/hrms/recruitment/masters/useMasters';
import { toast } from 'sonner';
import type { MasterJob } from './columns';

interface ToggleMasterJobModalProps {
    rowData: MasterJob;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ToggleMasterJobModal({ rowData, isOpen, onClose, onSuccess }: ToggleMasterJobModalProps) {
    const { mutateAsync: toggleMutation, isPending: isSubmitting } = useToggleJobStatus();
    const isActive = rowData.hrmJ_ActiveFlg;

    const handleToggle = async () => {
        try {
            const response = await toggleMutation(rowData.hrmJ_Id);

            if (response?.success) {
                toast.success(response?.message || `Job activate/deactivate successfully`);
                onSuccess();
                onClose();
            } else {
                toast.error(response?.message || `Failed to activate/deactivate job`);
            }
        } catch (error: any) {
            toast.error(error?.message || `Failed to activate/deactivate job`);
        }
    };

    return (
        <AdaptiveDialog title='Toggle Master Job Status' isOpen={isOpen} onClose={onClose}>
            <div className='flex flex-col gap-4'>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <p>
                        Are you sure you want to {isActive ? 'Deactivate' : 'Activate'} <strong>{rowData.hrmJ_JobTiTle}</strong>?
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
