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
import { useToggleSchemeName } from '@/hooks/college/useCollegeMasters';
import { IClgSubjectSchemeName } from '@/types/college/masters';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface ToggleSchemeNameFormProps {
    rowData: IClgSubjectSchemeName;
    onClose: () => void;
}

export default function ToggleSchemeNameForm({ rowData, onClose }: ToggleSchemeNameFormProps) {
    const toggleMutation = useToggleSchemeName();
    const actionText = rowData.acsT_ActiveFlg ? 'Deactivate' : 'Activate';

    const handleToggle = async () => {
        const promise = toggleMutation.mutateAsync(rowData);

        toast.promise(promise, {
            loading: `${actionText}ing Scheme Name...`,
            success: (data: any) => {
                if (data?.message !== "" && data?.message != null) {
                    onClose();
                    return data.message;
                }
                
                onClose();
                return `Failed to ${actionText} Scheme Name`;
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
                        Do You Want to {actionText} Scheme Name?
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
                        className={rowData.acsT_ActiveFlg ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground' : 'bg-primary hover:bg-primary/90'}
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
