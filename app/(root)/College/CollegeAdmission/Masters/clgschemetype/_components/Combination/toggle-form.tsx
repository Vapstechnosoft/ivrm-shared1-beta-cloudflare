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
import { useToggleCombination } from '@/hooks/college/useCollegeMasters';
import { IClgMasterCombination } from '@/types/college/masters';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface ToggleCombinationFormProps {
    rowData: IClgMasterCombination;
    onClose: () => void;
}

export default function ToggleCombinationForm({ rowData, onClose }: ToggleCombinationFormProps) {
    const toggleMutation = useToggleCombination();
    const actionText = rowData.admcB_Activeflag ? 'Deactivate' : 'Activate';

    const handleToggle = async () => {
        const promise = toggleMutation.mutateAsync(rowData);

        toast.promise(promise, {
            loading: `${actionText}ing Combination...`,
            success: (data: any) => {
                if (data?.message !== "" && data?.message != null) {
                    onClose();
                    return data.message;
                }
                
                onClose();
                return `Failed to ${actionText} Combination`;
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
                        Do You Want to {actionText} Scheme?
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
                        className={rowData.admcB_Activeflag ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground' : 'bg-primary hover:bg-primary/90'}
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
