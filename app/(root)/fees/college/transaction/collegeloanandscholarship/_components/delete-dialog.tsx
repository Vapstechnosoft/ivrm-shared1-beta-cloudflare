'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { Label } from '@/components/ui/extension/field';
import { useCollegeLoanSavedRecords } from '@/hooks/fees/college/useCollegeLoanAndScholarship';
import { deleteCollegeLoanRecord } from '@/server/fees/college/transaction/collegeloanandscholarship';
import type { IClgLoanScholarshipRecord } from '@/types/fees/college/transaction/collegeloanandscholarship';
import { useState } from 'react';
import { toast } from 'sonner';

interface DeleteDialogProps {
    record: IClgLoanScholarshipRecord;
    batchId: number;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function CollegeLoanDeleteDialog({ record, batchId, onClose, onSuccess }: DeleteDialogProps) {
    const { refetchAll } = useCollegeLoanSavedRecords(batchId);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const res = await deleteCollegeLoanRecord(record.fcL_Id);
            if (res?.success) {
                toast.success(res.message || 'Record deleted successfully.');
                await refetchAll();
                onSuccess?.();
                onClose();
            } else {
                toast.error(res?.message || 'Failed to delete record.');
            }
        } catch (err: any) {
            console.error('Delete error:', err);
            toast.error(err.message || 'Error occurred while deleting record.');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <AdaptiveDialog title='Delete Loan & Scholarship Record' isOpen={true} onClose={onClose}>
            <div className='space-y-6'>
                <AdaptiveBody className='space-y-3'>
                    <Label className='text-sm leading-relaxed text-gray-700'>
                        Are you sure you want to delete the Loan & Scholarship entry for{' '}
                        <strong>{record.studentName}</strong> (Adm No: <strong>{record.amcsT_AdmNo}</strong>)?
                    </Label>
                    <div className='rounded-lg bg-gray-50 border p-3 text-xs space-y-1 text-gray-600'>
                        <p>
                            <strong>Course & Branch:</strong> {record.amcO_CourseName} - {record.amB_BranchName} ({record.amsE_SEMName})
                        </p>
                        <p>
                            <strong>Loan Amount:</strong> ₹{record.loanAmount.toLocaleString('en-IN')} |{' '}
                            <strong>Scholarship Amount:</strong> ₹{record.scholarshipAmount.toLocaleString('en-IN')}
                        </p>
                        <p>
                            <strong>Total Deduction:</strong> ₹{record.totalAmount.toLocaleString('en-IN')}
                        </p>
                    </div>
                </AdaptiveBody>

                <AdaptiveFooter className='flex flex-col gap-3 sm:flex-row sm:justify-end'>
                    <Button type='button' variant='outline' onClick={onClose} disabled={isDeleting}>
                        Cancel
                    </Button>
                    <Button
                        type='button'
                        variant='destructive'
                        onClick={handleDelete}
                        disabled={isDeleting}>
                        {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                    </Button>
                </AdaptiveFooter>
            </div>
        </AdaptiveDialog>
    );
}
