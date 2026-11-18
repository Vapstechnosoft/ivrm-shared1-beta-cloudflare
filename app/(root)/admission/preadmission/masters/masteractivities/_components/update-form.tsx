'use client';

import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { InputTextarea } from '@/components/ui/extension/input-textarea';
import { useMasterActivity } from '@/hooks/admission/preadmission/useMasters';
import { masterActivitySchema } from '@/schemas/admission/preadmission/master_activity';
import type { IMasterActivityList } from '@/schemas/admission/preadmission/master_activity';
import { addOrUpdateMasterActivity } from '@/server/admission/preadmission/masters/master_activity';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterActivitySchema.addOrUpdate>;

interface UpdateMasterActivityFormProps {
    selectedRow: IMasterActivityList;
    onSuccess?: () => void;
    className?: string;
}

export default function UpdateMasterActivityForm({ selectedRow, onSuccess, className = '' }: UpdateMasterActivityFormProps) {
    const { refetchAll } = useMasterActivity();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting, isDirty }
    } = useForm<FormFields>({
        resolver: zodResolver(masterActivitySchema.addOrUpdate),
        mode: 'onChange',
        defaultValues: {
            amA_Id: selectedRow.amA_Id,
            amA_Activity: selectedRow.amA_Activity,
            amA_Activity_Desc: selectedRow.amA_Activity_Desc
        }
    });

    useEffect(() => {
        reset({
            amA_Id: selectedRow.amA_Id,
            amA_Activity: selectedRow.amA_Activity,
            amA_Activity_Desc: selectedRow.amA_Activity_Desc
        });
    }, [selectedRow, reset]);

    const onSubmit: SubmitHandler<FormFields | any> = async (data: FormFields) => {
        if (!isDirty) {
            toast.info('No changes made to update');
            return;
        }

        try {
            const { amA_Id, amA_Activity, amA_Activity_Desc } = data;
            const payload = {
                amA_Id: amA_Id ?? selectedRow.amA_Id,
                amA_Activity,
                amA_Activity_Desc
            };

            const response = await addOrUpdateMasterActivity(payload);

            if (response.success) {
                toast.success(response.message || 'Master Activity updated successfully');
                refetchAll();
                onSuccess?.();
            } else {
                toast.error(response.message || 'Failed to update Master Activity');
            }
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    return (
        <div className={`${className}`}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <InputText
                            label='Activity Name'
                            required
                            id='amA_Activity'
                            placeholder='Enter activity name'
                            {...register('amA_Activity')}
                            error={errors.amA_Activity?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <InputTextarea
                            label='Activity Description'
                            required
                            id='amA_Activity_Desc'
                            placeholder='Enter activity description'
                            {...register('amA_Activity_Desc')}
                            error={errors.amA_Activity_Desc?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                            minHeight={20}
                        />
                    </div>

                    {/* Root Error */}
                    {errors.root && <FormError>{errors.root.message}</FormError>}
                </div>

                {/* Action Buttons */}
                <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                    <Button
                        type='submit'
                        disabled={isSubmitting || !isDirty}
                        className='w-fit transition-all duration-200 hover:scale-105'
                        isLoading={isSubmitting}
                        loadingText='Updating...'>
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' />
                            Update Master Activity
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
