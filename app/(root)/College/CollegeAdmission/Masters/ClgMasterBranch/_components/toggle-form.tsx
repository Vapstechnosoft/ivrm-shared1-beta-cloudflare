'use client';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useDeactivateClgMasterBranch } from '@/hooks/college/useCollegeMasters';
import { IClgMasterBranch } from '@/types/college/masters';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface ToggleClgMasterBranchFormProps {
    rowData: IClgMasterBranch;
    onClose: () => void;
}

export default function ToggleClgMasterBranchForm({ rowData, onClose }: ToggleClgMasterBranchFormProps) {
    const deactivateMutation = useDeactivateClgMasterBranch();
    const actionText = rowData.amB_ActiveFlag ? 'Deactivate' : 'Activate';

    const handleToggle = async () => {
        const promise = deactivateMutation.mutateAsync({
            AMB_Id: rowData.amB_Id
        });

        toast.promise(promise, {
            loading: `${actionText}ing branch...`,
            success: (data: any) => {
                if (data?.success === false) {
                    throw new Error(data?.message || `Failed to ${actionText.toLowerCase()} record`);
                }
                if (data?.message) {
                    onClose();
                    return data.message;
                }
                if (data?.returnval === 'true') {
                    onClose();
                    return 'Branch De-Activated Successfully';
                }
                if (data?.returnval === 'false') {
                    onClose();
                    return 'Branch Activated Successfully';
                }
                throw new Error(`Failed to ${actionText.toLowerCase()} record`);
            },
            error: (err: any) => err.message || 'Something went wrong. Please try again.'
        });
    };

    return (
        <AlertDialog open={true} onOpenChange={(open) => !open && onClose()}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Do you want to {actionText.toLowerCase()} this branch?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={deactivateMutation.isPending}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            handleToggle();
                        }}
                        disabled={deactivateMutation.isPending}
                        className={rowData.amB_ActiveFlag ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground' : 'bg-primary hover:bg-primary/90'}
                    >
                        {deactivateMutation.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Yes, {actionText} it!
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
