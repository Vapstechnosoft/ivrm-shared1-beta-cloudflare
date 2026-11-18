'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { Label } from '@/components/ui/extension/field';
import { usePcRequisition } from '@/hooks/pettycash/transaction/pcREQUISITION';
import { toggleRequisitionStatus } from '@/server/pettycash/transaction/pcREQUISITION';
import type { IPcRequisition } from '@/types/pettycash/transaction/pcREQUISITION';
import { useState } from 'react';
import { toast } from 'sonner';

interface ToggleMasterParticularsFormProps {
    rowData: IPcRequisition;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function TogglePcRequisitionForm({ rowData, onClose, onSuccess }: ToggleMasterParticularsFormProps) {
    const { refetch } = usePcRequisition();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const closeDialog = () => {
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            const idToToggle = Number(rowData.pcreqtN_Id ?? 0);

            if (!idToToggle) {
                setIsSubmitting(false);
                toast.error('Invalid record id. Cannot toggle.');
                return;
            }

            const response = await toggleRequisitionStatus(idToToggle);

            if (response?.success) {
                const itemName = rowData.pcreqtN_RequisitionNo ?? 'Record';
                toast.success(`${itemName} status updated successfully`);
                try {
                    await refetch();
                    onSuccess?.();
                } catch (e) {
                    onSuccess?.();
                }
                closeDialog();
            } else {
                toast.error(response?.message);
            }
        } catch (error: any) {
            console.error('Toggle error:', error);
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isActive = rowData.pcreqtN_ActiveFlg;

    return (
        <AdaptiveDialog title={isActive ? 'Deactivate Particular' : 'Activate Particular'} isOpen={true} onClose={closeDialog}>
            <form onSubmit={handleSubmit} className='space-y-6'>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <Label>
                        Are you sure you want to {isActive ? 'deactivate' : 'activate'} <strong>{rowData.pcreqtN_RequisitionNo}</strong>?
                    </Label>
                    {rowData.pcreqtN_RequisitionNo && (
                        <div className='text-muted-foreground text-sm'>Description: {rowData.pcreqtN_RequisitionNo}</div>
                    )}
                </AdaptiveBody>

                <AdaptiveFooter className='flex flex-col gap-3 sm:flex-row sm:justify-end'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={closeDialog}
                        disabled={isSubmitting}
                        className='w-fit transition-all duration-200 hover:scale-105'>
                        Cancel
                    </Button>
                    <Button
                        type='submit'
                        disabled={isSubmitting}
                        variant={isActive ? 'destructive' : 'default'}
                        className='w-fit transition-all duration-200 hover:scale-105'>
                        {isSubmitting ? 'Processing...' : isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                </AdaptiveFooter>
            </form>
        </AdaptiveDialog>
    );
}
