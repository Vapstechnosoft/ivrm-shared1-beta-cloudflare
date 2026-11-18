'use client';

import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { useDeactivateClgMasterBatch, useClgMasterBatch } from '@/hooks/college/useCollegeMasters';
import { IClgMasterBatch } from '@/types/college/masters';
import { toast } from 'sonner';

interface ToggleClgMasterBatchFormProps {
    rowData: IClgMasterBatch;
    onClose: () => void;
}

export default function ToggleClgMasterBatchForm({ rowData, onClose }: ToggleClgMasterBatchFormProps) {
    const { refetchAll } = useClgMasterBatch();
    const { mutateAsync: deactivateBatch, isPending } = useDeactivateClgMasterBatch();

    const isCurrentlyActive = rowData.acmsN_ActiveFlag !== false;

    const handleToggle = async () => {
        try {
            const response = await deactivateBatch(rowData.acmB_Id);

            if (response.success || response.message?.toLowerCase()?.includes('success')) {
                toast.success(response.message || `Record ${isCurrentlyActive ? 'Deactivated' : 'Activated'} Successfully`);
                refetchAll();
                onClose();
            } else {
                toast.error(response.message || 'Action failed');
            }
        } catch (error: any) {
            toast.error(error.message || 'An error occurred.');
        }
    };

    return (
        <AlertDialog open={true} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{isCurrentlyActive ? 'Deactivate' : 'Activate'} Batch</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to {isCurrentlyActive ? 'deactivate' : 'activate'} the batch{' '}
                        <span className='font-bold text-foreground'>{rowData.acmsN_SessionName}</span>?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => { e.preventDefault(); handleToggle(); }}
                        disabled={isPending}
                        className={isCurrentlyActive ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : 'bg-primary text-primary-foreground hover:bg-primary/90'}>
                        {isPending ? 'Processing...' : 'Confirm'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
