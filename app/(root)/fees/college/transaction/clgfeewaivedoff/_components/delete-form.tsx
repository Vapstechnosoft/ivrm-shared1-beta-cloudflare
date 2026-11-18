'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { FormError } from '@/components/ui/extension/field';
import { useCollegeFeeWaivedOffList } from '@/hooks/fees/college/useTransactions';
import { collegeFeeWaivedOffSchema } from '@/schemas/fees/college/transactions/clgfeewaivedoff';
import { deleteCollegeFeeWaivedOff } from '@/server/fees/college/transaction/clgfeewaivedoff';
import type { ICollegeFeeWaivedOffGrid } from '@/types/fees/college/transaction/clgfeewaivedoff';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trash2 } from 'lucide-react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof collegeFeeWaivedOffSchema.delete>;

interface DeleteCollegeFeeWaivedOffFormProps {
    rowData: ICollegeFeeWaivedOffGrid;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function DeleteCollegeFeeWaivedOffForm({ rowData, onClose, onSuccess }: DeleteCollegeFeeWaivedOffFormProps) {
    const { refetchAll } = useCollegeFeeWaivedOffList();

    const deleteId = Number(rowData.fcswO_Id || rowData.FCSWO_Id);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(collegeFeeWaivedOffSchema.delete),
        defaultValues: {
            fcswO_Id: String(deleteId)
        },
        mode: 'onChange'
    });

    function closeDialog() {
        onClose();
        reset();
    }

    const onSubmit: SubmitHandler<FormFields> = async () => {
        try {
            const response = await deleteCollegeFeeWaivedOff(deleteId);

            const status = response?.returnduplicatestatus || response?.returnval || response?.message;
            if (status === 'success' || status === 'Saved' || response?.success) {
                toast.success('Record Deleted Successfully');
                refetchAll();
                onSuccess?.();
                closeDialog();
            } else if (status === 'adjusted') {
                toast.warning('Record already adjusted / refunded');
                refetchAll();
                closeDialog();
            } else {
                toast.error(response?.message || 'Record Not Deleted');
            }
        } catch (error: any) {
            toast.error(error.message ?? 'Failed to delete record');
        }
    };

    return (
        <AdaptiveDialog title='Delete College Fee Waived Off' isOpen={true} onClose={closeDialog}>
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <input type='hidden' {...register('fcswO_Id')} defaultValue={deleteId} />
                    <p className='text-foreground text-sm leading-relaxed'>
                        Are you sure you want to <strong>delete</strong> the Waived Off record for student{' '}
                        <span className='font-semibold text-primary'>{rowData.amcsT_FirstName || 'N.A'}</span>?
                    </p>
                    <div className='rounded-md border bg-muted/30 p-3 text-xs'>
                        <div className='grid grid-cols-2 gap-2'>
                            <div>
                                <span className='text-muted-foreground'>Fee Head:</span>{' '}
                                <span className='font-medium text-foreground'>{rowData.fmH_FeeName || 'N.A'}</span>
                            </div>
                            <div>
                                <span className='text-muted-foreground'>Installment:</span>{' '}
                                <span className='font-medium text-foreground'>{rowData.ftI_Name || 'N.A'}</span>
                            </div>
                            <div className='col-span-2'>
                                <span className='text-muted-foreground'>Waived Off Amount:</span>{' '}
                                <span className='font-bold text-destructive'>
                                    ₹ {Number(rowData.fcswO_WaivedOffAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>
                    </div>
                    <FormError>{errors.fcswO_Id?.message}</FormError>
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
