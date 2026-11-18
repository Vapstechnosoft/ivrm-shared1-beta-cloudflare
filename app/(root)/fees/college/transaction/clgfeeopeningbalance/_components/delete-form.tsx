'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { FormError } from '@/components/ui/extension/field';
import { useCollegeFeeOpeningBalanceList } from '@/hooks/fees/college/useCollegeFeeOpeningBalance';
import { clgFeeOpeningBalanceSchema } from '@/schemas/fees/college/transactions/clgfeeopeningbalance';
import { deleteCollegeFeeOpeningBalance } from '@/server/fees/college/transaction/clgfeeopeningbalance';
import type { ICollegeFeeOpeningBalanceGrid } from '@/types/fees/college/transaction/clgfeeopeningbalance';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trash2 } from 'lucide-react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof clgFeeOpeningBalanceSchema.delete>;

interface DeleteCollegeFeeOpeningBalanceFormProps {
    rowData: ICollegeFeeOpeningBalanceGrid;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function DeleteCollegeFeeOpeningBalanceForm({ rowData, onClose, onSuccess }: DeleteCollegeFeeOpeningBalanceFormProps) {
    const { refetchAll } = useCollegeFeeOpeningBalanceList();

    const deleteId = Number(rowData.fcmoB_Id);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(clgFeeOpeningBalanceSchema.delete),
        defaultValues: { fcmoB_Id: String(deleteId) },
        mode: 'onChange'
    });

    function closeDialog() {
        onClose();
        reset();
    }

    const onSubmit: SubmitHandler<FormFields> = async () => {
        try {
            const response = await deleteCollegeFeeOpeningBalance(deleteId);
            const status = response?.returnval || response?.success;
            if (status === true || response?.returnval === true || response?.success) {
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

    const first = rowData.amcsT_FirstName || '';
    const middle = rowData.amcsT_MiddleName || '';
    const last = rowData.amcsT_LastName || '';
    const studentName = [first, middle, last].filter(Boolean).join(' ') || 'N.A';

    return (
        <AdaptiveDialog title='Delete College Fee Opening Balance' isOpen={true} onClose={closeDialog}>
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <input type='hidden' {...register('fcmoB_Id')} defaultValue={deleteId} />
                    <p className='text-foreground text-sm leading-relaxed'>
                        Are you sure you want to <strong>delete</strong> the Opening Balance record for student{' '}
                        <span className='font-semibold text-primary'>{studentName}</span>?
                    </p>
                    <div className='rounded-md border bg-muted/30 p-3 text-xs'>
                        <div className='grid grid-cols-2 gap-2'>
                            <div>
                                <span className='text-muted-foreground'>Academic Year:</span>{' '}
                                <span className='font-medium text-foreground'>{rowData.asmaY_Year || 'N.A'}</span>
                            </div>
                            <div>
                                <span className='text-muted-foreground'>Group:</span>{' '}
                                <span className='font-medium text-foreground'>{rowData.fmG_GroupName || 'N.A'}</span>
                            </div>
                            <div>
                                <span className='text-muted-foreground'>Head:</span>{' '}
                                <span className='font-medium text-foreground'>{rowData.fmH_FeeName || 'N.A'}</span>
                            </div>
                            <div>
                                <span className='text-muted-foreground'>Installment:</span>{' '}
                                <span className='font-medium text-foreground'>{rowData.ftI_Name || 'N.A'}</span>
                            </div>
                        </div>
                    </div>
                    <FormError>{errors.fcmoB_Id?.message}</FormError>
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
