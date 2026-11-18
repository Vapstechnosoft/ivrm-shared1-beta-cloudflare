'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { FormError } from '@/components/ui/extension/field';
import { usePeriodTimeSettingDetails } from '@/hooks/timetable/useMasters';
import { periodTimeSettingSchema } from '@/schemas/timetable/masters';
import { deactivatePeriodTimeSetting } from '@/server/timetable/masters/periodtimesetting';
import type { IPeriodTimeSettingData } from '@/types/timetable/masters/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof periodTimeSettingSchema.delete>;

interface TogglePeriodTimeSettingFormProps {
    rowData: IPeriodTimeSettingData;
    onClose: () => void;
}

export default function TogglePeriodTimeSettingForm({ rowData, onClose }: TogglePeriodTimeSettingFormProps) {
    const { refetchAll } = usePeriodTimeSettingDetails();
    const activeValues = new Set([1, true, '1', 'true', 'True']);
    const isActive = activeValues.has(rowData.ttmdpT_ActiveFlag);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(periodTimeSettingSchema.delete),
        mode: 'onChange'
    });

    function closeDialog() {
        onClose();
        reset();
    }

    const onSubmit: SubmitHandler<FormFields | any> = async () => {
        try {
            const response = await deactivatePeriodTimeSetting(Number(rowData.ttmdpT_Id));

            if (response.success) {
                if (isActive) {
                    toast.error('Deactivated Successfully');
                } else {
                    toast.success('Activated Successfully');
                }
                refetchAll();
                closeDialog();
            } else {
                toast.error(response.message || 'Failed to update status');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to update status');
        }
    };

    return (
        <AdaptiveDialog title='Toggle Period Time Setting' isOpen={true} onClose={closeDialog}>
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <input type='hidden' {...register('ttmdpT_Id')} defaultValue={rowData.ttmdpT_Id} />
                    <p>Are you sure you want to {isActive ? 'deactivate' : 'activate'} this period time setting?</p>
                    <FormError>{errors.ttmdpT_Id?.message}</FormError>
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
