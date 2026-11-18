'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { FormError } from '@/components/ui/extension/field';
import { useConsecutive } from '@/hooks/timetable/constraints/consecutive';
import { deactivateConsecutiveConstraints } from '@/server/timetable/constraints/consecutive';
import type { IConsecutiveConstraintDetails } from '@/types/timetable/constraints/bifurcationconstraints';
import { zodResolver } from '@hookform/resolvers/zod';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const toggleSchema = z.object({
    ttC_Id: z.coerce.number()
});

type FormFields = z.infer<typeof toggleSchema>;

interface ToggleConsecutiveConstraintsFormProps {
    rowData: IConsecutiveConstraintDetails;
    onClose: () => void;
}

export default function ToggleConsecutiveConstraintsForm({ rowData, onClose }: ToggleConsecutiveConstraintsFormProps) {
    const { refetchAll } = useConsecutive();
    const isActive = rowData.ttC_ActiveFlag;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(toggleSchema),
        mode: 'onChange'
    });

    function closeDialog() {
        onClose();
        reset();
    }

    const onSubmit: SubmitHandler<FormFields | any> = async () => {
        try {
            const response = await deactivateConsecutiveConstraints(rowData);
            console.log('response', response);

            if (response.success) {
                toast.success(response.message);
                reset();
                refetchAll();
                onClose?.();
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occured');
        }
    };

    return (
        <AdaptiveDialog title='Toggle Consecutive Constraints' isOpen={true} onClose={closeDialog}>
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <input type='hidden' {...register('ttC_Id')} defaultValue={rowData.ttC_Id} />
                    <p>Are you sure you want to {isActive ? 'deactivate' : 'activate'} this constraint?</p>
                    <FormError>{errors.ttC_Id?.message}</FormError>
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
