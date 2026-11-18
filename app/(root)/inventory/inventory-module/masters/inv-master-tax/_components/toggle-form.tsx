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
import { useInvMasterTax } from '@/hooks/inventory/masters/use-inv-master-tax';
import { deactivateInvMasterTax } from '@/server/inventory/masters/inv-master-tax';
import type { IInvMasterTax } from '@/types/inventory/masters/inv-master-tax';
import { useCallback } from 'react';
import { toast } from 'sonner';

interface ToggleInvMasterTaxFormProps {
    rowData: IInvMasterTax;
    onClose: () => void;
}

export default function ToggleInvMasterTaxForm({ rowData, onClose }: ToggleInvMasterTaxFormProps) {
    const { refetchAll } = useInvMasterTax();

    const handleToggle = useCallback(async () => {
        try {
            const result = await deactivateInvMasterTax(rowData);
            if (result.success || result.returnval) {
                if (rowData.invmT_ActiveFlg) {
                    toast.error('Deactivated Successfully');
                } else {
                    toast.success('Activated Successfully');
                }
                refetchAll(); // call the hook's refetch function
                onClose();
            } else {
                toast.error(result.message || 'Failed to update status');
            }
        } catch (error: any) {
            toast.error(error.message || 'An error occurred');
        }
    }, [rowData, refetchAll, onClose]);

    return (
        <AlertDialog open={true} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{rowData.invmT_ActiveFlg ? 'Deactivate Record' : 'Activate Record'}</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to {rowData.invmT_ActiveFlg ? 'deactivate' : 'activate'} this tax record?
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter className='flex gap-2'>
                    <AlertDialogCancel className='text-black hover:bg-transparent dark:text-white'>Cancel</AlertDialogCancel>

                    <AlertDialogAction asChild>
                        <Button variant={rowData.invmT_ActiveFlg ? 'destructive' : 'default'} onClick={handleToggle}>
                            Yes, {rowData.invmT_ActiveFlg ? 'Deactivate' : 'Activate'} it
                        </Button>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
