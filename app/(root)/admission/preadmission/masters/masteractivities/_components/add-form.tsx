'use client';

import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { InputTextarea } from '@/components/ui/extension/input-textarea';
import { useMasterActivity } from '@/hooks/admission/preadmission/useMasters';
import { masterActivitySchema } from '@/schemas/admission/preadmission/master_activity';
import { addOrUpdateMasterActivity } from '@/server/admission/preadmission/masters/master_activity';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterActivitySchema.addOrUpdate>;

interface AddMasterActivityFormProps {
    onSuccess?: () => void;
    className?: string;
}

export default function AddMasterActivityForm({ onSuccess, className = '' }: AddMasterActivityFormProps) {
    const { refetchAll } = useMasterActivity();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterActivitySchema.addOrUpdate),
        mode: 'onChange'
    });

    const onSubmit: SubmitHandler<FormFields | any> = async (data: FormFields) => {
        try {
            const { amA_Activity, amA_Activity_Desc } = data;
            const payload = {
                amA_Id: 0,
                amA_Activity,
                amA_Activity_Desc
            };

            const response = await addOrUpdateMasterActivity(payload);

            if (response.success) {
                toast.success(response.message || 'Master Activity added successfully');
                reset();
                refetchAll();
                onSuccess?.();
            } else {
                toast.error(response.message || 'Failed to add Master Activity');
            }
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleReset = () => {
        reset();
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
                        type='button'
                        variant='outline'
                        onClick={handleReset}
                        disabled={isSubmitting}
                        className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'>
                        Reset
                    </Button>
                    <Button
                        type='submit'
                        disabled={isSubmitting}
                        className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'
                        isLoading={isSubmitting}
                        loadingText='Saving...'>
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' />
                            Save Master Activity
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
