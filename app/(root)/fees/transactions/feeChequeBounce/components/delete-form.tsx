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
import { deleteFeeChequeBounce } from '@/server/fees/trasactions/fee_cheque_bounce';
import type { IFeeChequeBounceGrid } from '@/types/fees/transactions/feeChequeBounce';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function DeleteFeeChequeBounceForm({
    rowData,
    onClose
}: {
    rowData: IFeeChequeBounceGrid;
    onClose: () => void;
}) {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: () => deleteFeeChequeBounce(rowData.fcB_Id),
        onSuccess: (data) => {
            if (data.success) {
                toast.success(data.message);
                queryClient.invalidateQueries();
                onClose();
            } else {
                toast.error(data.message);
            }
        },
        onError: () => {
            toast.error('An error occurred while deleting the record');
        }
    });

    return (
        <AlertDialog open={true} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>Do You Want To Delete Record for Receipt No: {rowData.fyP_Receipt_No}?</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => mutation.mutate()}
                        className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
                        {mutation.isPending ? 'Deleting...' : 'Yes, Delete it'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
