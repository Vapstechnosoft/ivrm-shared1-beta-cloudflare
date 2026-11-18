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
import { useInvMasterStore } from '@/hooks/inventory/masters/use-inv-master-store';
import { deactivateInvMasterStore } from '@/server/inventory/masters/inv-master-store';
import type { IInvMasterStore } from '@/types/inventory/masters/inv-master-store';
import { useCallback } from 'react';
import { toast } from 'sonner';

interface ToggleInvMasterStoreFormProps {
    rowData: IInvMasterStore;
    onClose: () => void;
}

export default function ToggleInvMasterStoreForm({ rowData, onClose }: ToggleInvMasterStoreFormProps) {
    const { refetchAll } = useInvMasterStore();
    const isActive = Boolean(
        rowData.invmS_ActiveFlg ??
        (rowData as any).invmsT_ActiveFlg ??
        (rowData as any).INVMST_ActiveFlg ??
        (rowData as any).INVMS_ActiveFlg
    );

    const handleToggle = useCallback(async () => {
        try {
            const result = await deactivateInvMasterStore(rowData);
            if (result.success || result.returnval) {
                if (isActive) {
                    toast.error('Deactivated Successfully');
                } else {
                    toast.success('Activated Successfully');
                }
                refetchAll();
                onClose();
            } else {
                toast.error(result.message || 'Failed to update status');
            }
        } catch (error: any) {
            toast.error(error.message || 'An error occurred');
        }
    }, [rowData, isActive, refetchAll, onClose]);

    return (
        <AlertDialog open={true} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{isActive ? 'Deactivate Record' : 'Activate Record'}</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to {isActive ? 'deactivate' : 'activate'} this store record?
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter className='flex gap-2'>
                    <AlertDialogCancel className='text-black hover:bg-transparent dark:text-white'>Cancel</AlertDialogCancel>

                    <AlertDialogAction asChild>
                        <Button variant={isActive ? 'destructive' : 'default'} onClick={handleToggle}>
                            Yes, {isActive ? 'Deactivate' : 'Activate'} it
                        </Button>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
