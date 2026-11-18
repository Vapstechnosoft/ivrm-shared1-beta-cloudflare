'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { FormError } from '@/components/ui/extension/field';
import { useDeleteMasterTimeSetting, useMasterTimeSetting } from '@/hooks/hrms/attendance-management/useMasters';
import type { IMasterTimeSetting } from '@/types/hrms/attendance-management/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';

interface DeleteMasterTimeSettingFormProps {
    rowData: IMasterTimeSetting;
    onClose: () => void;
}

export default function DeleteMasterTimeSettingForm({ rowData, onClose }: DeleteMasterTimeSettingFormProps) {
    const { refetchAll } = useMasterTimeSetting();
    const { mutate: deleteMasterTimeSetting, isPending } = useDeleteMasterTimeSetting();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<{ id: number }>({
        resolver: zodResolver(z.object({ id: z.coerce.number() })),
        mode: 'onChange'
    });

    function closeDialog() {
        onClose();
        reset();
    }

    const onSubmit: SubmitHandler<{ id: number }> = async () => {
        deleteMasterTimeSetting(rowData.fomtS_Id, {
            onSuccess: () => {
                refetchAll();
                closeDialog();
            }
        });
    };

    return (
        <AdaptiveDialog title='Delete Master Time Setting' isOpen={true} onClose={closeDialog}>
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <input type='hidden' {...register('id')} defaultValue={rowData.fomtS_Id} />
                    <p>
                        Are you sure you want to delete this master time setting (ID: <strong>{rowData.fomtS_Id}</strong>)?
                    </p>
                    <FormError>{errors.id?.message}</FormError>
                    <FormError>{errors.root?.message}</FormError>
                </AdaptiveBody>
                <AdaptiveFooter>
                    <Button variant='secondary' onClick={closeDialog} type='button'>
                        Cancel
                    </Button>
                    <Button type='submit' isLoading={isSubmitting || isPending} variant={'destructive'}>
                        Delete
                    </Button>
                </AdaptiveFooter>
            </form>
        </AdaptiveDialog>
    );
}
