'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { useCollegeFeeTransactionList } from '@/hooks/fees/college/useCollegeTransaction';
import { deleteCollegeFeeTransaction } from '@/server/fees/college/transaction/college_fee_transaction';
import type { ICollegeFeeTransaction } from '@/types/fees/college/transaction/transaction';
import { useState } from 'react';
import { toast } from 'sonner';

interface DeleteCollegeFeeTransactionProps {
    rowData: ICollegeFeeTransaction;
    onClose: () => void;
    onSuccess?: () => void;
    asmayId: number;
}

export default function DeleteCollegeFeeTransactionForm({
    rowData,
    onClose,
    onSuccess,
    asmayId
}: DeleteCollegeFeeTransactionProps) {
    const { refetchAll } = useCollegeFeeTransactionList(Number(asmayId));
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [remark, setRemark] = useState('');

    const closeDialog = () => {
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;
        if (!remark.trim()) {
            toast.error('Please enter a remark before deleting.');
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                fyp_Id: rowData.fyp_Id,
                fyp_Remarks: remark,
                asmaY_Id: asmayId
            };
            const response = await deleteCollegeFeeTransaction(payload);

            if (response?.returnval === 'true' || response?.success) {
                toast.success(response?.message || 'College Fee Transaction deleted successfully');
                await refetchAll();
                onSuccess?.();
                closeDialog();
            } else {
                toast.error(response?.message || 'Failed to delete transaction');
            }
        } catch (error: any) {
            console.error('Delete error:', error);
            toast.error(error.message || 'Error deleting college transaction');
        } finally {
            setIsSubmitting(false);
        }
    };

    const studentFullName =
        `${rowData.amcst_FirstName || ''} ${rowData.amcst_MiddleName || ''} ${rowData.amcst_LastName || ''}`.trim() ||
        rowData.studentName ||
        'Student';

    return (
        <AdaptiveDialog title='Delete College Fee Transaction' isOpen={true} onClose={closeDialog}>
            <form onSubmit={handleSubmit} className='space-y-6'>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <Label className='text-sm leading-relaxed text-gray-700'>
                        Are you sure you want to delete the Fee Receipt <strong>{rowData.fyp_Receipt_No}</strong> for{' '}
                        <strong>{studentFullName}</strong> (Adm No: <strong>{rowData.amcst_AdmNo}</strong>)?
                    </Label>
                    <div className='space-y-1.5'>
                        <Label htmlFor='remark' className='text-xs font-semibold uppercase text-gray-600'>
                            Remark <span className='text-red-500'>*</span>
                        </Label>
                        <InputText
                            id='remark'
                            value={remark}
                            onChange={(e) => setRemark(e.target.value)}
                            placeholder='Enter reason for deleting this transaction...'
                            className='w-full transition-colors focus:ring-2 focus:ring-destructive/20'
                            autoFocus
                        />
                    </div>
                </AdaptiveBody>

                <AdaptiveFooter className='flex flex-col gap-3 sm:flex-row sm:justify-end'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={closeDialog}
                        disabled={isSubmitting}
                        className='w-fit'>
                        Cancel
                    </Button>
                    <Button
                        type='submit'
                        disabled={isSubmitting}
                        variant='destructive'
                        className='w-fit'>
                        {isSubmitting ? 'Deleting...' : 'Confirm Delete'}
                    </Button>
                </AdaptiveFooter>
            </form>
        </AdaptiveDialog>
    );
}
