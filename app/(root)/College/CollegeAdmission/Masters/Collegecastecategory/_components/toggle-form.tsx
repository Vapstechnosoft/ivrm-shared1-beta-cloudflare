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
import { useDeactivateCollegeCasteCategory } from '@/hooks/college/useCollegeMasters';
import { ICollegeCasteCategory } from '@/types/college/masters';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface ToggleCollegeCasteCategoryFormProps {
    rowData: ICollegeCasteCategory;
    onClose: () => void;
}

export default function ToggleCollegeCasteCategoryForm({ rowData, onClose }: ToggleCollegeCasteCategoryFormProps) {
    const deactivateMutation = useDeactivateCollegeCasteCategory();
    const actionText = rowData.imcC_ActiveFlag ? 'Deactivate' : 'Activate';

    const handleToggle = async () => {
        const promise = deactivateMutation.mutateAsync({
            IMCC_Id: rowData.imcC_Id
        });

        toast.promise(promise, {
            loading: `${actionText}ing caste category...`,
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
                    return 'Caste Category De-Activated Successfully';
                }
                if (data?.returnval === 'false') {
                    onClose();
                    return 'Caste Category Activated Successfully';
                }
                onClose();
                return `Caste Category ${actionText}d Successfully`;
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
                        Do you want to {actionText.toLowerCase()} this caste category?
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
                        className={rowData.imcC_ActiveFlag ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground' : 'bg-primary hover:bg-primary/90'}
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
