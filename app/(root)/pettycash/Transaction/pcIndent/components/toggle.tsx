'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { Label } from '@/components/ui/label';
import { toggleIndentStatus } from '@/server/pettycash/transaction/pcIndent';
import type { IPcIndent } from '@/types/pettycash/transaction/pcIndent';
import { useState } from 'react';
import { toast } from 'sonner';

interface TogglePcIndentFormProps {
    rowData: IPcIndent;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function TogglePcIndentForm({ rowData, onClose, onSuccess }: TogglePcIndentFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            const idToToggle = Number(rowData.pcindT_Id ?? 0);

            if (!idToToggle) {
                setIsSubmitting(false);
                toast.error('Invalid record id. Cannot toggle.');
                return;
            }

            const response = await toggleIndentStatus(idToToggle);

            if (response?.success) {
                const itemName = rowData.pcindT_IndentNo ?? 'Indent';
                toast.success(`${itemName} status updated successfully`);
                onSuccess?.();
                onClose();
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

    const isActive = rowData.pcindT_ActiveFlg;

    return (
        <AdaptiveDialog title={isActive ? 'Deactivate Indent' : 'Activate Indent'} isOpen={true} onClose={onClose}>
            <form onSubmit={handleSubmit} className='space-y-6'>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <Label className='text-base'>
                        Are you sure you want to {isActive ? 'deactivate' : 'activate'}{' '}
                        <strong className='text-primary'>{rowData.pcindT_IndentNo}</strong>?
                    </Label>
                    <div className='space-y-2 rounded-lg bg-muted/30 p-4 text-sm'>
                        <div className='flex justify-between'>
                            <span className='text-muted-foreground'>Department:</span>
                            <span className='font-medium'>{rowData.departmentname}</span>
                        </div>
                        <div className='flex justify-between'>
                            <span className='text-muted-foreground'>Date:</span>
                            <span className='font-medium'>
                                {rowData.pcindT_Date ? new Date(rowData.pcindT_Date).toLocaleDateString() : '-'}
                            </span>
                        </div>
                    </div>
                </AdaptiveBody>

                <AdaptiveFooter className='flex flex-col gap-3 sm:flex-row sm:justify-end'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={onClose}
                        disabled={isSubmitting}
                        className='transition-all duration-200 hover:scale-105'>
                        Cancel
                    </Button>
                    <Button
                        type='submit'
                        disabled={isSubmitting}
                        variant={isActive ? 'destructive' : 'default'}
                        className='transition-all duration-200 hover:scale-105'>
                        {isSubmitting ? 'Processing...' : isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                </AdaptiveFooter>
            </form>
        </AdaptiveDialog>
    );
}
