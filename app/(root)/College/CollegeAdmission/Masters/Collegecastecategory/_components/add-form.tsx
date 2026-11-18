'use client';

import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { useSaveCollegeCasteCategory, useCollegeCasteCategory } from '@/hooks/college/useCollegeMasters';
import { collegeCasteCategorySchema } from '@/schemas/college/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof collegeCasteCategorySchema.addOrUpdate>;

interface AddCollegeCasteCategoryFormProps {
    onSuccess?: () => void;
    className?: string;
}

export default function AddCollegeCasteCategoryForm({ onSuccess, className = '' }: AddCollegeCasteCategoryFormProps) {
    const { refetchAll } = useCollegeCasteCategory();
    const { mutateAsync: saveCategory } = useSaveCollegeCasteCategory();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(collegeCasteCategorySchema.addOrUpdate),
        mode: 'onChange'
    });

    const onSubmit: SubmitHandler<FormFields> = async (data: FormFields) => {
        try {
            const payload = {
                imcC_Id: 0,
                imcC_CategoryName: data.imcC_CategoryName,
                imcC_CategoryDesc: data.imcC_CategoryDesc
            };

            const response = await saveCategory(payload);

            if (response.success === true) {
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
        <div className={`${className}`}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <InputText
                            label='Caste Category Name'
                            required
                            id='imcC_CategoryName'
                            placeholder='Enter Category Name'
                            {...register('imcC_CategoryName')}
                            error={errors.imcC_CategoryName?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <InputText
                            label='Description'
                            required
                            id='imcC_CategoryDesc'
                            placeholder='Enter Description'
                            {...register('imcC_CategoryDesc')}
                            error={errors.imcC_CategoryDesc?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                    </div>
                </div>

                <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={() => reset()}
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
                            Save Category
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
