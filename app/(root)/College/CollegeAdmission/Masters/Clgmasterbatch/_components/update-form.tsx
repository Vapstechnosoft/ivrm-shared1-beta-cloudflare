'use client';

import { Button } from '@/components/ui/button';
import { InputText } from '@/components/ui/extension/input-text';
import { useClgMasterBatch, useEditClgMasterBatch, useSaveClgMasterBatch } from '@/hooks/college/useCollegeMasters';
import { clgMasterBatchSchema } from '@/schemas/college/masters';
import { IClgMasterBatch } from '@/types/college/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof clgMasterBatchSchema.addOrUpdate>;

interface UpdateClgMasterBatchFormProps {
    selectedRow: IClgMasterBatch;
    onSuccess?: () => void;
}

export default function UpdateClgMasterBatchForm({ selectedRow, onSuccess }: UpdateClgMasterBatchFormProps) {
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

    const { data: editResponse, isLoading: isEditLoading } = useEditClgMasterBatch(selectedRow?.acmB_Id ?? null);

    useEffect(() => {
        const editData = editResponse?.data?.[0] || editResponse?.data;
        if (editData) {
            reset({
                acmsN_SessionName: editData.acmsN_SessionName || '',
                acmnS_Order: editData.acmnS_Order?.toString() || ''
            });
        } else if (selectedRow) {
            reset({
                acmsN_SessionName: selectedRow.acmsN_SessionName || '',
                acmnS_Order: selectedRow.acmnS_Order?.toString() || ''
            });
        }
    }, [editResponse, selectedRow, reset]);

    const onSubmit: SubmitHandler<FormFields> = async (data: FormFields) => {
        try {
            const payload = {
                ACMB_Id: selectedRow.acmB_Id,
                ACMSN_SessionName: data.acmsN_SessionName,
                ACMNS_Order: data.acmnS_Order
            };

            const response = await saveBatch(payload);

            if (response.success || response.message?.toLowerCase()?.includes('success')) {
                toast.success(response.message || 'Record Updated Successfully');
                refetchAll();
                onSuccess?.();
            } else {
                toast.error(response.message || 'Failed to update record');
            }
        } catch (error: any) {
            toast.error(error.message || 'An error occurred while updating.');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            {isEditLoading ? (
                <div className='flex items-center justify-center py-8'>
                    <span className='text-muted-foreground text-sm'>Loading batch data...</span>
                </div>
            ) : (
            <>
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
                <Button type='submit' disabled={isSubmitting} className='w-fit' isLoading={isSubmitting} loadingText='Updating...'>
                    <Save className='mr-2 h-4 w-4' /> Update Batch
                </Button>
            </div>
            </>
            )}
        </form>
    );
}
