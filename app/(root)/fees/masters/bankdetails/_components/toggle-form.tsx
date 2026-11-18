'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { FormError } from '@/components/ui/extension/field';
import { useMasterBankDetails } from '@/hooks/fees/useMasters';
import { masterBankDetailsSchema } from '@/schemas/fees/masters';
import { toggleFeeBankDetails } from '@/server/fees/masters/bank_details';
import type { IFeeBankDetailsList } from '@/types/fees/masters/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterBankDetailsSchema.delete>;

interface ToggleMasterBankDetailsFormProps {
    rowData: IFeeBankDetailsList;
    onClose: () => void;
}

export default function ToggleMasterBankDetailsForm({ rowData, onClose }: ToggleMasterBankDetailsFormProps) {
    const { refetchAll } = useMasterBankDetails();
    const isActive = rowData.fmbanK_ActiveFlg;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterBankDetailsSchema.delete),
        mode: 'onChange'
    });

    function closeDialog() {
        onClose();
        reset();
    }

    const onSubmit: SubmitHandler<FormFields> = async () => {
        try {
            const response = await toggleFeeBankDetails(Number(rowData.fmbanK_Id));

            if (response.success) {
                toast.success(response.message || `Bank successfully ${isActive ? 'deactivated' : 'activated'}`);
                refetchAll();
                closeDialog();
            } else {
                toast.error(response.message || 'Operation failed');
            }
        } catch (error: any) {
            toast.error(error.message || 'An unexpected error occurred');
        }
    };

    return (
        <AdaptiveDialog title='Toggle Master Bank Status' isOpen={true} onClose={closeDialog}>
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <input type='hidden' {...register('fmbanK_Id')} defaultValue={rowData.fmbanK_Id} />
                    <p>
                        Are you sure you want to {isActive ? 'deactivate' : 'activate'} <strong>{rowData.fmbanK_BankName}</strong>?
                    </p>
                    <FormError>{errors.fmbanK_Id?.message}</FormError>
                    <FormError>{errors.root?.message}</FormError>
                </AdaptiveBody>
                <AdaptiveFooter>
                    <Button variant='secondary' onClick={closeDialog} type='button'>
                        Cancel
                    </Button>
                    <Button type='submit' isLoading={isSubmitting} variant={isActive ? 'destructive' : 'default'}>
                        {isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                </AdaptiveFooter>
            </form>
        </AdaptiveDialog>
    );
}
