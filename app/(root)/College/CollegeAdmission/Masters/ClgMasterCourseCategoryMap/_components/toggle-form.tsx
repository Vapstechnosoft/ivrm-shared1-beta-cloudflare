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
import { useDeactivateClgMasterCourseCategoryMap, useClgMasterCourseCategoryMap } from '@/hooks/college/useCollegeMasters';
import { IClgMasterCourseCategoryMap } from '@/types/college/masters';
import { toast } from 'sonner';

interface ToggleCourseCategoryMapFormProps {
    rowData: IClgMasterCourseCategoryMap;
    onClose: () => void;
}

export default function ToggleCourseCategoryMapForm({ rowData, onClose }: ToggleCourseCategoryMapFormProps) {
    const { refetchAll } = useClgMasterCourseCategoryMap();
    const { mutateAsync: deactivateMap, isPending } = useDeactivateClgMasterCourseCategoryMap();

    const isCurrentlyActive = rowData.amcocM_ActiveFlg !== false;

    const handleToggle = async () => {
        try {
            const response = await deactivateMap(rowData.amcocM_Id);

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
                    <AlertDialogTitle>{isCurrentlyActive ? 'Deactivate' : 'Activate'} Category Map</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to {isCurrentlyActive ? 'deactivate' : 'activate'} the mapping between{' '}
                        <span className='font-bold text-foreground'>{rowData.amcO_CourseName}</span> and{' '}
                        <span className='font-bold text-foreground'>{rowData.amcoC_Name}</span>?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            handleToggle();
                        }}
                        disabled={isPending}
                        className={isCurrentlyActive ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : 'bg-primary text-primary-foreground hover:bg-primary/90'}>
                        {isPending ? 'Processing...' : 'Confirm'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
