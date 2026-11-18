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
import { useToggleMasterQuota } from '@/hooks/college/useCollegeMasters';
import { IMasterQuota } from '@/types/college/masters';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface ToggleMasterQuotaFormProps {
    rowData: IMasterQuota;
    onClose: () => void;
}

export default function ToggleMasterQuotaForm({ rowData, onClose }: ToggleMasterQuotaFormProps) {
    const toggleMutation = useToggleMasterQuota();
    const actionText = rowData.acQ_ActiveFlg ? 'Deactivate' : 'Activate';

    const handleToggle = async () => {
        const promise = toggleMutation.mutateAsync(rowData);

        toast.promise(promise, {
            loading: `${actionText}ing Quota...`,
            success: (data: any) => {
                if (data?.success === false) {
                    onClose();
                    throw new Error(data?.message || 'Something Went Wrong please contact administrator');
                } else if (data?.message === 'Mapped') {
                    onClose();
                    throw new Error('You Can Not Deactive This Record Its Already Mapped');
                } else if (data?.message === 'Error') {
                    onClose();
                    throw new Error('Something Went Wrong please contact administrator');
                } else if (data?.returnval === 'true' || data?.returnval === true || data?.success) {
                    onClose();
                    return `Quota ${actionText}d Successfully`;
                }
                
                onClose();
                return `Quota ${actionText}d Successfully`;
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
                        Do You Want To {actionText} Quota?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={toggleMutation.isPending}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            handleToggle();
                        }}
                        disabled={toggleMutation.isPending}
                        className={rowData.acQ_ActiveFlg ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground' : 'bg-primary hover:bg-primary/90'}
                    >
                        {toggleMutation.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Yes, {actionText} it
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
