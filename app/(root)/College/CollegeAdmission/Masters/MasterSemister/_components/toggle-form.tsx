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
import { useToggleMasterSemester } from '@/hooks/college/useCollegeMasters';
import { IClgMasterSemester } from '@/types/college/masters';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface ToggleMasterSemesterFormProps {
    rowData: IClgMasterSemester;
    onClose: () => void;
}

export default function ToggleMasterSemesterForm({ rowData, onClose }: ToggleMasterSemesterFormProps) {
    const toggleMutation = useToggleMasterSemester();
    const actionText = rowData.amsE_ActiveFlg === true ? 'Deactivate' : 'Activate';

    const handleToggle = async () => {
        const promise = toggleMutation.mutateAsync(rowData.amsE_Id);

        toast.promise(promise, {
            loading: `${actionText}ing Semester...`,
            success: (data: any) => {
                if (data?.message === 'Record Already Mapped') {
                    throw new Error('Record is already mapped and cannot be deactivated');
                }
                if (data?.success) {
                    onClose();
                    return data?.message || `Record Successfully ${actionText}d`;
                }
                throw new Error(data?.message || `Failed To ${actionText} Record`);
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
                        Do You Want to {actionText} Semester?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={toggleMutation.isPending}>Cancel..!</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            handleToggle();
                        }}
                        disabled={toggleMutation.isPending}
                        className={rowData.amsE_ActiveFlg === true ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground' : 'bg-primary hover:bg-primary/90'}
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
