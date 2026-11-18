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
import { COLLEGE_QUERY_KEYS } from '@/constants/query-keys';
import { useDeleteCollegeCasteCategory } from '@/hooks/college/useCollegeMasters';
import { ICollegeCasteCategory } from '@/types/college/masters';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface DeleteCollegeCasteCategoryFormProps {
    rowData: ICollegeCasteCategory;
    onClose: () => void;
}

export default function DeleteCollegeCasteCategoryForm({ rowData, onClose }: DeleteCollegeCasteCategoryFormProps) {
    const queryClient = useQueryClient();
    const { mutateAsync: deleteCategory, isPending } = useDeleteCollegeCasteCategory();

    const handleDelete = async () => {
        try {
            const response = await deleteCategory(rowData.imcC_Id);

            if (response?.success === true) {
                toast.success(response.message || 'Record Deleted Successfully');
                // Update cache directly with the returned updated list
                if (response.data?.castecategoryname) {
                    queryClient.setQueryData(
                        [COLLEGE_QUERY_KEYS.MASTER_CASTE_CATEGORY],
                        (old: any) => ({
                            ...old,
                            data: {
                                castecategoryname: response.data.castecategoryname,
                                count: response.data.count
                            }
                        })
                    );
                } else {
                    queryClient.invalidateQueries({ queryKey: [COLLEGE_QUERY_KEYS.MASTER_CASTE_CATEGORY] });
                }
                onClose();
            } else {
                toast.error(response?.message || 'Failed to delete record');
            }
        } catch (error: any) {
            toast.error(error.message || 'An error occurred.');
        }
    };

    return (
        <AlertDialog open={true} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Caste Category</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete the caste category{' '}
                        <span className='font-bold text-foreground'>{rowData.imcC_CategoryName}</span>?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            handleDelete();
                        }}
                        disabled={isPending}
                        className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
                        {isPending ? 'Processing...' : 'Confirm'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
