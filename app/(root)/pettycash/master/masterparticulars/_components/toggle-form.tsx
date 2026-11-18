'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { Label } from '@/components/ui/extension/field';
import { useMasterParticulars } from '@/hooks/pettycash/master/useMasters';
import { toggleMasterParticulars } from '@/server/pettycash/master/particulars';
import type { IMasterParticulars } from '@/types/pettycash/master/masters';
import { useState } from 'react';
import { toast } from 'sonner';

interface ToggleMasterParticularsFormProps {
    rowData: IMasterParticulars;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function ToggleMasterParticularsForm({ rowData, onClose, onSuccess }: ToggleMasterParticularsFormProps) {
    const { refetch } = useMasterParticulars();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const closeDialog = () => {
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            const idToToggle = Number(rowData.pcmparT_Id ?? 0);

            if (!idToToggle) {
                setIsSubmitting(false);
                toast.error('Invalid record id. Cannot toggle.');
                return;
            }

            const response = await toggleMasterParticulars(idToToggle);

            if (response?.success) {
                const itemName = rowData.pcmparT_ParticularName ?? 'Record';
                toast.success(`${itemName} status updated successfully`);
                try {
                    await refetch();
                    onSuccess?.();
                } catch (e) {
                    console.warn('Local refetch failed after toggle:', e);
                    onSuccess?.();
                }
                closeDialog();
            } else {
                toast.error(response?.message || 'Failed to update status');
            }
        } catch (error: any) {
            console.error('Toggle error:', error);
            toast.error(error.message || 'Error updating status');
        } finally {
            setIsSubmitting(false);
        }
    };

    const isActive = rowData.pcmparT_ActiveFlg;

    return (
        <AdaptiveDialog title={isActive ? 'Deactivate Particular' : 'Activate Particular'} isOpen={true} onClose={closeDialog}>
            <form onSubmit={handleSubmit} className='space-y-6'>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <Label>
                        Are you sure you want to {isActive ? 'deactivate' : 'activate'} <strong>{rowData.pcmparT_ParticularName}</strong>?
                    </Label>
                    {rowData.pcmparT_ParticularDesc && (
                        <div className='text-muted-foreground text-sm'>Description: {rowData.pcmparT_ParticularDesc}</div>
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
