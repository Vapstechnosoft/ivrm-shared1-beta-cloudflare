'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { FormError } from '@/components/ui/extension/field';
import { useGenerationMasters } from '@/hooks/timetable/useTransactions';
import { ttGenerationSchema } from '@/schemas/timetable/transactions';
import { toggleTimeTableGeneration } from '@/server/timetable/transactions/timetablegeneration';
import type { TTGenerationGridData } from '@/types/timetable/Transaction/timetablegeneration';
import { zodResolver } from '@hookform/resolvers/zod';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof ttGenerationSchema.delete>;

interface ToggleTTGenerationProps {
    rowData: TTGenerationGridData;
    onClose: () => void;
}

export default function ToggleTTGeneration({ rowData, onClose }: ToggleTTGenerationProps) {
    const { refetchAll } = useGenerationMasters();
    const isActive = rowData.ttfG_ActiveFlag;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(ttGenerationSchema.delete),
        mode: 'onChange',
        defaultValues: {
            ttfG_Id: String(rowData.ttfG_Id)
        }
    });

    function closeDialog() {
        onClose();
        reset();
    }

    const onSubmit: SubmitHandler<FormFields | any> = async () => {
        try {
            console.log('Toggling TTFG_Id:', rowData.ttfG_Id);
            const response = await toggleTimeTableGeneration(Number(rowData.ttfG_Id));
            console.log('Toggle Response:', response);

            if (response.success) {
                toast.success(response.message);
                refetchAll();
                closeDialog();
            } else {
                toast.error(response.message);
                console.error('Toggle failed:', response);
            }
        } catch (error: any) {
            const errorMessage = typeof error === 'string' ? error : error?.message || 'An error occurred';
            toast.error(errorMessage);
            console.error('Toggle error:', error);
        }
    };

    return (
        <AdaptiveDialog title='Toggle Generation' isOpen={true} onClose={closeDialog}>
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <input type='hidden' {...register('ttfG_Id')} />
                    <p>
                        Are you sure you want to {isActive ? 'deactivate' : 'activate'} <strong>{rowData.insname}</strong>?
                    </p>
                    <FormError>{errors.ttfG_Id?.message}</FormError>
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
