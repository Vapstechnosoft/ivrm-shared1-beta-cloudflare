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
import { useDeactivateClgMasterCategory } from '@/hooks/college/useCollegeMasters';
import { IClgMasterCategory } from '@/types/college/masters';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface ToggleClgMasterCategoryFormProps {
    rowData: IClgMasterCategory;
    onClose: () => void;
}

export default function ToggleClgMasterCategoryForm({ rowData, onClose }: ToggleClgMasterCategoryFormProps) {
    const deactivateMutation = useDeactivateClgMasterCategory();
    const actionText = rowData.acmC_ActiveFlag ? 'Deactivate' : 'Activate';

    const handleToggle = async () => {
        const promise = deactivateMutation.mutateAsync(rowData);

        toast.promise(promise, {
            loading: `${actionText}ing category...`,
            success: (data: any) => {
                if (data?.message === 'Mapped') {
                    throw new Error('You Can Not Deactive This Record Its Already Mapped.');
                }
                if (data?.success === false) {
                    throw new Error(data?.message || `Failed To ${actionText} Record`);
                }
                if (data?.success || data?.returnval) {
                    onClose();
                    return data?.message || `Record Successfully ${actionText}d`;
                }
                throw new Error(`Failed To ${actionText} Record`);
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
                        Do you want to {actionText.toLowerCase()} this category?
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
                        className={rowData.acmC_ActiveFlag ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground' : 'bg-primary hover:bg-primary/90'}
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
