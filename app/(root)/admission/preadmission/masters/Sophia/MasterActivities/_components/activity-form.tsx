'use client';

import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { useMasterActivityDetails } from '@/hooks/admission/preadmission/useMasterActivity';
import { type IMasterActivity, masterActivitySchema } from '@/schemas/admission/preadmission/master_activity';
import { addOrUpdateMasterActivity } from '@/server/admission/preadmission/masters/master_activity';
import { zodResolver } from '@hookform/resolvers/zod';
import { RotateCcw, Save } from 'lucide-react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterActivitySchema.addOrUpdate>;

interface ActivityFormProps {
    initialData?: Partial<IMasterActivity>;
    onSuccess?: () => void;
    className?: string;
}

export default function ActivityForm({ initialData, onSuccess, className = '' }: ActivityFormProps) {
    const isEditing = !!initialData?.amA_Id;
    const { refetchAll } = useMasterActivityDetails();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterActivitySchema.addOrUpdate),
        mode: 'onChange',
        defaultValues: {
            amA_Id: initialData?.amA_Id || 0,
            amA_Activity: initialData?.amA_Activity || '',
            amA_Activity_Desc: initialData?.amA_Activity_Desc || ''
        }
    });

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const payload = {
                amA_Id: data.amA_Id || 0,
                amA_Activity: data.amA_Activity,
                amA_Activity_Desc: data.amA_Activity_Desc
            };

            const response = await addOrUpdateMasterActivity(payload);

            if (response.success) {
                toast.success(response.message);
                reset();
                refetchAll();
                onSuccess?.();
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            toast.error(error.message || 'An error occurred during submission.');
        }
    };

    const handleReset = () => {
        reset();
    };

    return (
        <div className={className}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        {/* Activity Name */}
                        <InputText
                            label='Activity Name'
                            required
                            id='amA_Activity'
                            placeholder='Enter activity name'
                            {...register('amA_Activity')}
                            error={errors.amA_Activity?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />

                        {/* Activity Description */}
                        <InputText
                            label='Activity Description'
                            required
                            id='amA_Activity_Desc'
                            placeholder='Enter activity description'
                            {...register('amA_Activity_Desc')}
                            error={errors.amA_Activity_Desc?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                    </div>

                    {/* Root Error */}
                    {errors.root && <FormError>{errors.root.message}</FormError>}
                </div>

                {/* Action Buttons */}
                <div className='flex flex-col gap-3 border-t border-t pt-4 pt-6 sm:flex-row sm:justify-start'>
                    <Button
                        type='submit'
                        disabled={isSubmitting}
                        className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-1'
                        isLoading={isSubmitting}>
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' />
                            {isEditing ? 'Update Master Activity' : 'Save Master Activity'}
                        </div>
                    </Button>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={handleReset}
                        disabled={isSubmitting}
                        className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-2'>
                        <RotateCcw className='mr-2 h-4 w-4' />
                        Reset
                    </Button>
                </div>
            </form>
        </div>
    );
}
