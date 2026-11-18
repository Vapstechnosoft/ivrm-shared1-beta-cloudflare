'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { FormError } from '@/components/ui/extension/field';
import { useCollegeFeeChequeBounceList } from '@/hooks/fees/college/useCollegeFeeChequeBounce';
import { clgFeeChequeBounceSchema } from '@/schemas/fees/college/transactions/clgfeechequebounce';
import { deleteCollegeFeeChequeBounce } from '@/server/fees/college/transaction/clgfeechequebounce';
import type { ICollegeFeeChequeBounceGrid } from '@/types/fees/college/transaction/clgfeechequebounce';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trash2 } from 'lucide-react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof clgFeeChequeBounceSchema.delete>;

interface DeleteCollegeFeeChequeBounceFormProps {
    rowData: ICollegeFeeChequeBounceGrid;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function DeleteCollegeFeeChequeBounceForm({ rowData, onClose, onSuccess }: DeleteCollegeFeeChequeBounceFormProps) {
    const { refetchAll } = useCollegeFeeChequeBounceList();

    const deleteId = Number(rowData.fccB_Id);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(clgFeeChequeBounceSchema.delete),
        defaultValues: { fccB_Id: String(deleteId) },
        mode: 'onChange'
    });

    function closeDialog() {
        onClose();
        reset();
    }

    const onSubmit: SubmitHandler<FormFields> = async () => {
        try {
            const response = await deleteCollegeFeeChequeBounce(deleteId);
            const status = response?.returnduplicatestatus || response?.returnval || response?.message;
            if (status === 'success' || status === true || response?.returnval === true || response?.success) {
                toast.success('Record Deleted Successfully');
                refetchAll();
                onSuccess?.();
                closeDialog();
            } else {
                toast.error(response?.message || 'Record Not Deleted Successfully');
            }
        } catch (error: any) {
            toast.error(error.message ?? 'Failed to delete record');
        }
    };

    return (
        <AdaptiveDialog title='Delete College Fee Cheque Bounce' isOpen={true} onClose={closeDialog}>
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <input type='hidden' {...register('fccB_Id')} defaultValue={deleteId} />
                    <p className='text-foreground text-sm leading-relaxed'>
                        Are you sure you want to <strong>delete</strong> the Cheque Bounce record for student{' '}
                        <span className='font-semibold text-primary'>{rowData.amcsT_FirstName || 'N.A'}</span>?
                    </p>
                    <div className='rounded-md border bg-muted/30 p-3 text-xs'>
                        <div className='grid grid-cols-2 gap-2'>
                            <div>
                                <span className='text-muted-foreground'>Academic Year:</span>{' '}
                                <span className='font-medium text-foreground'>{rowData.asmaY_Year || 'N.A'}</span>
                            </div>
                            <div>
                                <span className='text-muted-foreground'>Receipt No:</span>{' '}
                                <span className='font-medium text-foreground'>{rowData.fyP_ReceiptNo || 'N.A'}</span>
                            </div>
                            <div className='col-span-2'>
                                <span className='text-muted-foreground'>Amount:</span>{' '}
                                <span className='font-bold text-destructive'>
                                    &#8377; {Number(rowData.fccB_Amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>
                    </div>
                    <FormError>{errors.fccB_Id?.message}</FormError>
                    <FormError>{errors.root?.message}</FormError>
                </AdaptiveBody>
                <AdaptiveFooter>
                    <Button variant='secondary' onClick={closeDialog} type='button'>
                        Cancel
                    </Button>
                    <Button type='submit' isLoading={isSubmitting} variant='destructive'>
                        <Trash2 className='mr-2 h-4 w-4' />
                        Delete
                    </Button>
                </AdaptiveFooter>
            </form>
        </AdaptiveDialog>
    );
}
