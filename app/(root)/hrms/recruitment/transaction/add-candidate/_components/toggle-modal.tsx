'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { useToggleCandidateStatus } from '@/hooks/hrms/recruitment/transactions/useTransactions';
import { toast } from 'sonner';
import type { Candidate } from './columns';

interface ToggleCandidateModalProps {
    rowData: Candidate;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ToggleCandidateModal({ rowData, isOpen, onClose, onSuccess }: ToggleCandidateModalProps) {
    const { mutateAsync: toggleMutation, isPending: isSubmitting } = useToggleCandidateStatus();
    console.log('toggleModal rowData', rowData);
    const isActive = rowData?.hrcD_ActiveFlg;

    const handleToggle = async () => {
        try {
            const response = await toggleMutation(rowData.hrcD_Id);

            if (response?.success) {
                toast.success(response?.message || `Candidate status updated successfully`);
                onSuccess();
                onClose();
            } else {
                toast.error(response?.message || `Failed to update candidate status`);
            }
        } catch (error: any) {
            toast.error(error?.message || `Failed to update candidate status`);
        }
    };

    return (
        <AdaptiveDialog title='Toggle Candidate Status' isOpen={isOpen} onClose={onClose}>
            <div className='flex flex-col gap-4'>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <p>
                        Are you sure you want to {isActive ? 'Deactivate' : 'Activate'}{' '}
                        <strong>{rowData.hrcD_FullName || rowData.firstName}</strong>?
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
