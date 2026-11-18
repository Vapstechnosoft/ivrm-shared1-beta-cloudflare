'use client';

import { Button } from '@/components/ui/button';
import { InputText } from '@/components/ui/extension/input-text';
import { useClgMasterBatch, useSaveClgMasterBatch } from '@/hooks/college/useCollegeMasters';
import { clgMasterBatchSchema } from '@/schemas/college/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof clgMasterBatchSchema.addOrUpdate>;

interface AddClgMasterBatchFormProps {
    onSuccess?: () => void;
}

export default function AddClgMasterBatchForm({ onSuccess }: AddClgMasterBatchFormProps) {
    const { refetchAll } = useClgMasterBatch();
    const { mutateAsync: saveBatch } = useSaveClgMasterBatch();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(clgMasterBatchSchema.addOrUpdate),
        mode: 'onChange'
    });

    const onSubmit: SubmitHandler<FormFields> = async (data: FormFields) => {
        try {
            const payload = {
                ACMB_Id: 0,
                ACMSN_SessionName: data.acmsN_SessionName,
                ACMNS_Order: data.acmnS_Order
            };

            const response = await saveBatch(payload);

            if (response.success || response.message?.toLowerCase()?.includes('success')) {
                toast.success(response.message || 'Record Saved Successfully');
                reset();
                refetchAll();
                onSuccess?.();
            } else {
                toast.error(response.message || 'Failed to save record');
            }
        } catch (error: any) {
            toast.error(error.message || 'An error occurred while saving.');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <InputText
                    label='Batch Name'
                    required
                    id='acmsN_SessionName'
                    placeholder='Enter Batch Name'
                    maxLength={30}
                    {...register('acmsN_SessionName')}
                    error={errors.acmsN_SessionName?.message}
                />
                <InputText
                    label='Batch Order'
                    required
                    id='acmnS_Order'
                    placeholder='Enter Batch Order'
                    maxLength={5}
                    {...register('acmnS_Order')}
                    error={errors.acmnS_Order?.message}
                />
            </div>

            <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row'>
                <Button type='button' variant='outline' onClick={() => reset()} disabled={isSubmitting} className='w-fit'>Reset</Button>
                <Button type='submit' disabled={isSubmitting} className='w-fit' isLoading={isSubmitting} loadingText='Saving...'>
                    <Save className='mr-2 h-4 w-4' /> Save Batch
                </Button>
            </div>
        </form>
    );
}
