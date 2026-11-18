'use client';

import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { useMasterExamPaper } from '@/hooks/exam/exammodule/usemasters';
import { masterExamPaperSchema } from '@/schemas/exam/exam-module/masters';
import { addOrUpdateMasterExamPaper } from '@/server/exam/exam-module/masters/exam-paper';
import type { IMasterExamPaper } from '@/types/exam/exam-module/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterExamPaperSchema.addOrUpdate>;

interface UpdateMasterExamPaperFormProps {
    onSuccess?: () => void;
    className?: string;
    selectedRow: IMasterExamPaper;
}

export default function UpdateMasterExamPaperForm({ onSuccess, className = '', selectedRow: row }: UpdateMasterExamPaperFormProps) {
    const { refetchAll } = useMasterExamPaper();
    const paperId = (row as any)?.empatY_Id ?? (row as any)?.EMPATY_Id ?? (row as any)?.id ?? 0;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterExamPaperSchema.addOrUpdate),
        mode: 'onChange',
        defaultValues: {
            empatY_Id: paperId,
            empatY_PaperTypeName: (row as any)?.empatY_PaperTypeName ?? (row as any)?.EMPATY_PaperTypeName ?? '',
            empatY_Color: (row as any)?.empatY_Color ?? (row as any)?.EMPATY_Color ?? '',
            empatY_PaperTypeDescription: (row as any)?.empatY_PaperTypeDescription ?? (row as any)?.EMPATY_PaperTypeDescription ?? ''
        }
    });

    // Set initial values when a row is selected or updated
    useEffect(() => {
        if (row) {
            const id = (row as any)?.empatY_Id ?? (row as any)?.EMPATY_Id ?? (row as any)?.id ?? 0;
            const name = (row as any)?.empatY_PaperTypeName ?? (row as any)?.EMPATY_PaperTypeName ?? '';
            const color = (row as any)?.empatY_Color ?? (row as any)?.EMPATY_Color ?? '';
            const desc = (row as any)?.empatY_PaperTypeDescription ?? (row as any)?.EMPATY_PaperTypeDescription ?? '';

            reset({
                empatY_Id: id,
                empatY_PaperTypeName: name,
                empatY_Color: color,
                empatY_PaperTypeDescription: desc
            });
        }
    }, [row, reset]);

    // Handle form submission
    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const currentPaperId = (row as any)?.empatY_Id ?? (row as any)?.EMPATY_Id ?? (row as any)?.id ?? data.empatY_Id ?? paperId;
            const payload = {
                empatY_Id: currentPaperId,
                empatY_PaperTypeName: data.empatY_PaperTypeName.trim(),
                empatY_Color: data.empatY_Color.trim(),
                empatY_PaperTypeDescription: data.empatY_PaperTypeDescription.trim()
            };

            const response = await addOrUpdateMasterExamPaper(payload);

            if (response.success) {
                toast.success(response.message || 'Updated successfully');
                reset();
                refetchAll();
                onSuccess?.();
            } else {
                toast.error(response.message || 'Failed to update');
            }
        } catch (error: any) {
            toast.error(error.message || 'Something went wrong');
        }
    };

    const handleReset = () => {
        if (row) {
            const id = (row as any)?.empatY_Id ?? (row as any)?.EMPATY_Id ?? (row as any)?.id ?? 0;
            const name = (row as any)?.empatY_PaperTypeName ?? (row as any)?.EMPATY_PaperTypeName ?? '';
            const color = (row as any)?.empatY_Color ?? (row as any)?.EMPATY_Color ?? '';
            const desc = (row as any)?.empatY_PaperTypeDescription ?? (row as any)?.EMPATY_PaperTypeDescription ?? '';

            reset({
                empatY_Id: id,
                empatY_PaperTypeName: name,
                empatY_Color: color,
                empatY_PaperTypeDescription: desc
            });
        } else {
            reset();
        }
    };

    return (
        <div className={className}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <InputText
                            label='Paper Type Name'
                            required
                            placeholder='Enter Paper Type Name'
                            id='empatY_PaperTypeName'
                            {...register('empatY_PaperTypeName')}
                            error={errors.empatY_PaperTypeName?.message}
                        />
                        <InputText
                            label='Color'
                            required
                            placeholder='Enter Color'
                            id='empatY_Color'
                            {...register('empatY_Color')}
                            error={errors.empatY_Color?.message}
                        />
                    </div>

                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <InputText
                            label='Paper Type Description'
                            required
                            placeholder='Enter Paper Type Description'
                            id='empatY_PaperTypeDescription'
                            {...register('empatY_PaperTypeDescription')}
                            error={errors.empatY_PaperTypeDescription?.message}
                        />
                    </div>

                    {errors.root && <FormError>{errors.root.message}</FormError>}
                </div>

                <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                    <Button type='button' variant='outline' onClick={handleReset} disabled={isSubmitting} className='order-2 w-fit'>
                        Reset
                    </Button>
                    <Button
                        type='submit'
                        disabled={isSubmitting}
                        isLoading={isSubmitting}
                        loadingText='Saving...'
                        className='order-1 w-fit'>
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' />
                            Save
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
