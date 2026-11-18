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
import { Button } from '@/components/ui/button';
import { useInvMasterCustomer } from '@/hooks/inventory/masters/use-inv-master-customer';

interface ToggleCustomerModalProps {
    rowData: any;
    onClose: () => void;
}

export function ToggleCustomerModal({ rowData, onClose }: ToggleCustomerModalProps) {
    const { deleteMutation } = useInvMasterCustomer();
    const isActive = Boolean(rowData?.invmC_ActiveFlg ?? (rowData as any)?.INVMC_ActiveFlg);

    const handleConfirm = () => {
        deleteMutation.mutate(
            { ...rowData, wasActive: isActive },
            {
                onSuccess: () => {
                    onClose();
                }
            }
        );
    };

    return (
        <AlertDialog open={true} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{isActive ? 'Deactivate Record' : 'Activate Record'}</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to {isActive ? 'deactivate' : 'activate'} this customer record?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className='flex gap-2'>
                    <AlertDialogCancel className='text-black hover:bg-transparent dark:text-white' disabled={deleteMutation.isPending}>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction asChild>
                        <Button variant={isActive ? 'destructive' : 'default'} onClick={handleConfirm} isLoading={deleteMutation.isPending}>
                            Yes, {isActive ? 'Deactivate' : 'Activate'} it
                        </Button>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
