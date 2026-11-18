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
import { togglePDAMasterHead } from '@/server/pda/master/master-head';
import type { IPDAMasterHead } from '@/types/pda/master/master-head';
import { useState } from 'react';
import { toast } from 'sonner';

interface TogglePDAMasterHeadFormProps {
    rowData: IPDAMasterHead;
    onClose: () => void;
    onSuccess: () => void;
}

export default function TogglePDAMasterHeadForm({ rowData, onClose, onSuccess }: TogglePDAMasterHeadFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleToggle = async () => {
        setIsSubmitting(true);

        try {
            const response = await togglePDAMasterHead(rowData);

            if (response.returnval === true || (response as any).success === true) {
                const statusMessage = rowData.pdamH_ActiveFlag ? 'Deactivated Successfully' : 'Activated Successfully';

                toast.success(statusMessage);

                onSuccess();
            } else {
                toast.error(response.message || 'Failed to update record status');
            }
        } catch (error: any) {
            console.error('Toggle error:', error);
            toast.error(error.message || 'Error updating record status');
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <AlertDialog open={true} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Do you want to {rowData.pdamH_ActiveFlag ? 'Deactivate' : 'Activate'} the record for "{rowData.pdamH_HeadName}"?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            handleToggle();
                        }}
                        disabled={isSubmitting}
                        className={rowData.pdamH_ActiveFlag ? 'bg-destructive hover:bg-destructive/90' : 'bg-success hover:bg-success/90'}>
                        {isSubmitting ? 'Processing...' : rowData.pdamH_ActiveFlag ? 'Deactivate' : 'Activate'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
