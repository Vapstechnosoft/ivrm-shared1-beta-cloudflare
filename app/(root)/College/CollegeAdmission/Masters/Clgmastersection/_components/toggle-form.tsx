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
import { useToggleMasterSection } from '@/hooks/college/useCollegeMasters';
import { IClgMasterSection } from '@/types/college/masters';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface ToggleMasterSectionFormProps {
    rowData: IClgMasterSection;
    onClose: () => void;
}

export default function ToggleMasterSectionForm({ rowData, onClose }: ToggleMasterSectionFormProps) {
    const toggleMutation = useToggleMasterSection();
    const actionText = rowData.acmS_ActiveFlag === 1 ? 'Deactivate' : 'Activate';

    const handleToggle = async () => {
        const promise = toggleMutation.mutateAsync(rowData.acmS_Id);

        toast.promise(promise, {
            loading: `${actionText}ing Section...`,
            success: (data: any) => {
                if (data?.success) {
                    onClose();
                    return data?.message || `Section ${actionText}d Successfully`;
                }
                throw new Error(data?.message || `Failed to ${actionText} Section`);
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
                        Do You Want to {actionText} Section?
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
                        className={rowData.acmS_ActiveFlag === 1 ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground' : 'bg-primary hover:bg-primary/90'}
                    >
                        {toggleMutation.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Yes, {actionText} It!
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
