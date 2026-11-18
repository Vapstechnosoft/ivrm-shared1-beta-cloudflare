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
import { useBranchChange, useDeactivateBranchChange } from '@/hooks/college/useCollegeMasters';
import type { IBranchChange } from '@/types/college/masters';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ToggleBranchChangeFormProps {
    rowData: IBranchChange;
    onClose: () => void;
}

export default function ToggleBranchChangeForm({ rowData, onClose }: ToggleBranchChangeFormProps) {
    const { refetchAll } = useBranchChange();
    const deactivateMutation = useDeactivateBranchChange();
    const isActive =
        rowData.acscoB_ActiveFlag === true || (rowData as any).ACSCOB_ActiveFlag === 1 || (rowData as any).ACSCOB_ActiveFlag === true;
    const actionText = isActive ? 'Deactivate' : 'Activate';

    const handleToggle = async () => {
        try {
            const payload = {
                ...rowData,
                ACSCOB_Id: rowData.acscoB_Id || (rowData as any).ACSCOB_Id,
                ACSCOB_ActiveFlag: isActive ? 0 : 1
            };

            const res = await deactivateMutation.mutateAsync(payload);

            if (res?.returnval === true || res?.success === true) {
                toast.success(`Record ${actionText}d Successfully!`);
                refetchAll();
                onClose();
            } else {
                toast.error(`Record Not ${actionText}d Successfully!`);
            }
        } catch (error: any) {
            toast.error(error.message || `Failed to ${actionText.toLowerCase()} record`);
        }
    };

    return (
        <AlertDialog open={true} onOpenChange={(open) => !open && onClose()}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>Do you want to {actionText.toLowerCase()} this branch change record?</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onClose} disabled={deactivateMutation.isPending}>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleToggle}
                        disabled={deactivateMutation.isPending}
                        className={isActive ? 'bg-destructive hover:bg-destructive/90' : ''}>
                        {deactivateMutation.isPending ? (
                            <>
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                Processing...
                            </>
                        ) : (
                            `Yes, ${actionText} it`
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
