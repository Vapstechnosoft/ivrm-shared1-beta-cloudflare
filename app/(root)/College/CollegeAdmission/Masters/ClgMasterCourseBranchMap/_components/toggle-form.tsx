'use client';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { useDeactivateClgMasterCourseBranchMap, useClgMasterCourseBranchMap } from '@/hooks/college/useCollegeMasters';
import { IClgMasterCourseBranchMap } from '@/types/college/masters';
import { toast } from 'sonner';

interface ToggleCourseBranchMapFormProps {
    rowData: IClgMasterCourseBranchMap;
    onClose: () => void;
}

export default function ToggleCourseBranchMapForm({ rowData, onClose }: ToggleCourseBranchMapFormProps) {
    const { refetchAll } = useClgMasterCourseBranchMap();
    const { mutateAsync: deactivateMap, isPending } = useDeactivateClgMasterCourseBranchMap();

    const isCurrentlyActive = rowData.amcobM_ActiveFlg !== false;

    const handleToggle = async () => {
        try {
            const response = await deactivateMap({ AMCOBM_Id: rowData.amcobM_Id });

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
                    <AlertDialogTitle>{isCurrentlyActive ? 'Deactivate' : 'Activate'} Course Branch Map</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to {isCurrentlyActive ? 'deactivate' : 'activate'} the mapping between{' '}
                        <span className='font-bold text-foreground'>{rowData.amcO_CourseName}</span> and{' '}
                        <span className='font-bold text-foreground'>{rowData.amB_BranchName}</span>?
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
