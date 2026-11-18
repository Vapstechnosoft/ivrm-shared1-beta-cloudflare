'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { FormError } from '@/components/ui/extension/field';
import { useStudentFeeEnablePartialPayment } from '@/hooks/fees/useTrasactions';
import { studentFeeEnablePartialPaymentSchema } from '@/schemas/fees/trasactions';
import { toggleStudentFeeEnablePartialPayment } from '@/server/fees/trasactions/student_fee_enable_partial_payment';
import type { IStudentFeeEnablePartialPaymentList } from '@/types/fees/transactions/transactions';
import { zodResolver } from '@hookform/resolvers/zod';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof studentFeeEnablePartialPaymentSchema.delete>;

interface ToggleStudentFeeEnablePartialPaymentFormProps {
    rowData: IStudentFeeEnablePartialPaymentList;
    onClose: () => void;
}

export default function ToggleStudentFeeEnablePartialPaymentForm({ rowData, onClose }: ToggleStudentFeeEnablePartialPaymentFormProps) {
    const { refetchAll } = useStudentFeeEnablePartialPayment();
    const id = rowData.fsepP_Id ?? (rowData as any).FSEPP_Id ?? 0;
    const isActive = Boolean(
        rowData.fsepP_ActiveFlag ?? (rowData as any).FSEPP_ActiveFlag ?? (rowData as any).is_Active ?? (rowData as any).isActive
    );

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(studentFeeEnablePartialPaymentSchema.delete),
        mode: 'onChange',
        defaultValues: {
            fsepP_Id: String(id)
        }
    });

    function closeDialog() {
        onClose();
        reset();
    }

    const onSubmit: SubmitHandler<FormFields> = async () => {
        try {
            const payload = {
                FSEPP_Id: Number(id)
            };
            const response = await toggleStudentFeeEnablePartialPayment(payload);

            const isSuccess =
                response?.retrunMsg === 'Activated' ||
                response?.retrunMsg === 'Deactivated' ||
                response?.success === true ||
                Boolean(response?.retrunMsg);

            if (isSuccess) {
                const msg =
                    response?.message ||
                    (response?.retrunMsg ? `Record ${response.retrunMsg} successfully` : '') ||
                    `Record ${isActive ? 'deactivated' : 'activated'} successfully`;

                if (isActive || msg.toLowerCase().includes('deactivated')) {
                    toast.error(msg);
                } else {
                    toast.success(msg);
                }

                refetchAll();
                closeDialog();
            } else {
                toast.error(response?.message || 'Record not activated/deactivated');
            }
        } catch (error: any) {
            toast.error(error?.message || 'Something went wrong while toggling status');
        }
    };

    return (
        <AdaptiveDialog title={`${isActive ? 'Deactivate' : 'Activate'} Record`} isOpen={true} onClose={closeDialog}>
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <input type='hidden' {...register('fsepP_Id')} />
                    <p className='text-muted-foreground text-sm leading-relaxed'>
                        Are you sure you want to {isActive ? 'deactivate' : 'activate'} partial payment for{' '}
                        <strong className='text-foreground'>{rowData.amsT_FirstName || 'this student'}</strong> ({rowData.asmaY_Year})?
                    </p>
                    {errors.fsepP_Id && <FormError>{errors.fsepP_Id.message}</FormError>}
                    {errors.root && <FormError>{errors.root.message}</FormError>}
                </AdaptiveBody>
                <AdaptiveFooter>
                    <Button variant='secondary' onClick={closeDialog} type='button' disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button
                        type='submit'
                        isLoading={isSubmitting}
                        loadingText={isActive ? 'Deactivating...' : 'Activating...'}
                        variant={isActive ? 'destructive' : 'default'}>
                        {isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                </AdaptiveFooter>
            </form>
        </AdaptiveDialog>
    );
}
