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
import { useDeactivateMasterCourse } from '@/hooks/college/useCollegeMasters';
import type { IMasterCourse } from '@/types/college/masters';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ToggleMasterCourseFormProps {
    rowData: IMasterCourse;
    onClose: () => void;
}

export default function ToggleMasterCourseForm({ rowData, onClose }: ToggleMasterCourseFormProps) {
    const deactivateMutation = useDeactivateMasterCourse();
    const actionText = rowData.amcO_ActiveFlag ? 'Deactivate' : 'Activate';

    const handleToggle = async () => {
        const promise = deactivateMutation.mutateAsync(rowData);

        toast.promise(promise, {
            loading: `${actionText}ing course...`,
            success: (data: any) => {
                if (data?.returnval === true || data?.success === true) {
                    onClose();
                    return `Record ${actionText}d Successfully!!!`;
                }
                throw new Error(data?.message || `Record Not ${actionText}d Successfully!!!`);
            },
            error: (err: any) => err.message || 'Something went wrong. Please try again.'
        });
    };

    return (
        <AlertDialog open={true} onOpenChange={(open) => !open && onClose()}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>Do You Want To {actionText} Record?</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={deactivateMutation.isPending}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            handleToggle();
                        }}
                        disabled={deactivateMutation.isPending}
                        className={
                            rowData.amcO_ActiveFlag
                                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                                : 'bg-primary hover:bg-primary/90'
                        }>
                        {deactivateMutation.isPending ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null}
                        Yes, {actionText} it
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
