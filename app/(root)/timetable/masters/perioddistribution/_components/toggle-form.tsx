'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { FormError } from '@/components/ui/extension/field';
import { usePeriodDistributionDetails } from '@/hooks/timetable/useMasters';
import { periodDistributionSchema } from '@/schemas/timetable/masters';
import { ActivedeactivatePeriodDistribution } from '@/server/timetable/masters/perioddistribution';
import type { PeriodDistributionColumn } from '@/types/timetable/masters/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof periodDistributionSchema.delete>;

interface TogglePeriodDistributionFormProps {
    rowData: PeriodDistributionColumn;
    onClose: () => void;
}

export default function TogglePeriodDistributionForm({ rowData, onClose }: TogglePeriodDistributionFormProps) {
    const { refetchAll } = usePeriodDistributionDetails();
    const isActive = rowData.ttfpD_ActiveFlag;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(periodDistributionSchema.delete),
        mode: 'onChange'
    });

    function closeDialog() {
        onClose();
        reset();
    }

    const onSubmit: SubmitHandler<FormFields | any> = async () => {
        try {
            const response = await ActivedeactivatePeriodDistribution(Number(rowData.ttfpD_Id));

            if (response.success) {
                toast.success(response.message);
                refetchAll();
                closeDialog();
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    return (
        <AdaptiveDialog title='Toggle Period Distribution' isOpen={true} onClose={closeDialog}>
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <input type='hidden' {...register('ttfpD_Id')} defaultValue={rowData.ttfpD_Id} />
                    <p>Are you sure you want to {isActive ? 'deactivate' : 'activate'} this period distribution?</p>
                    <FormError>{errors.ttfpD_Id?.message}</FormError>
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
