'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { useTogglePositionTypeStatus } from '@/hooks/hrms/recruitment/masters/useMasters';
import { toast } from 'sonner';
import type { MasterPositionType } from './columns';

interface ToggleMasterPositionTypeModalProps {
    rowData: MasterPositionType;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ToggleMasterPositionTypeModal({ rowData, isOpen, onClose, onSuccess }: ToggleMasterPositionTypeModalProps) {
    const { mutateAsync: toggleMutation, isPending: isSubmitting } = useTogglePositionTypeStatus();
    const isActive = rowData?.hrmpT_ActiveFlg;

    const handleToggle = async () => {
        try {
            const response = await toggleMutation(rowData.hrmpT_Id);

            if (response?.success) {
                toast.success(response?.message || `Position type activated/deactivated successfully`);
                onSuccess();
                onClose();
            } else {
                toast.error(response?.message || `Failed to activate/deactivate position type`);
            }
        } catch (error: any) {
            toast.error(error?.message || `Failed to activate/deactivate position type`);
        }
    };

    return (
        <AdaptiveDialog title='Toggle Master Position Type Status' isOpen={isOpen} onClose={onClose}>
            <div className='flex flex-col gap-4'>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <p>
                        Are you sure you want to {isActive ? 'Deactivate' : 'Activate'} <strong>{rowData.hrmpT_Name}</strong>?
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
