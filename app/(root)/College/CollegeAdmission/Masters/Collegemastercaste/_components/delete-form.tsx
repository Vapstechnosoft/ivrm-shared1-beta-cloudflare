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
import { useDeleteCollegeMasterCaste } from '@/hooks/college/useCollegeMasters';
import type { ICollegeMasterCaste } from '@/types/college/masters';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface DeleteCollegeMasterCasteFormProps {
    rowData: ICollegeMasterCaste;
    onClose: () => void;
}

export default function DeleteCollegeMasterCasteForm({ rowData, onClose }: DeleteCollegeMasterCasteFormProps) {
    const queryClient = useQueryClient();
    const { mutateAsync: deleteCaste, isPending } = useDeleteCollegeMasterCaste();

    const casteId = rowData.iC_Id || rowData.imC_Id || 0;
    const casteName = rowData.iC_CasteName || rowData.imC_CasteName || 'this caste';

    const handleDelete = async () => {
        try {
            const response = await deleteCaste(casteId);

            if (response?.returnVal === true || response?.success === true) {
                toast.success(response?.msg || response?.retrunMsg || 'Caste Deleted Successfully');
                queryClient.invalidateQueries({ queryKey: [COLLEGE_QUERY_KEYS.MASTER_CASTE] });
                onClose();
            } else {
                toast.error(response?.msg || response?.retrunMsg || response?.message || 'Failed to Delete the Caste');
            }
        } catch (error: any) {
            toast.error(error.message || 'An error occurred.');
        }
    };

    return (
        <AlertDialog open={true} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Do you want to delete the Caste <span className='font-bold text-foreground'>{casteName}</span>?
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
                        {isPending ? 'Processing...' : 'Yes, delete it!'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
