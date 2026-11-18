'use client';

import { Button } from '@/components/ui/button';
import { InputText } from '@/components/ui/extension/input-text';
import { useSaveCollegeCasteCategory, useCollegeCasteCategory, useCollegeCasteCategoryById } from '@/hooks/college/useCollegeMasters';
import { collegeCasteCategorySchema } from '@/schemas/college/masters';
import { ICollegeCasteCategory } from '@/types/college/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof collegeCasteCategorySchema.addOrUpdate>;

interface UpdateCollegeCasteCategoryFormProps {
    selectedRow: ICollegeCasteCategory;
    onSuccess?: () => void;
    className?: string;
}

export default function UpdateCollegeCasteCategoryForm({ selectedRow, onSuccess, className = '' }: UpdateCollegeCasteCategoryFormProps) {
    const { refetchAll } = useCollegeCasteCategory();
    const { mutateAsync: saveCategory } = useSaveCollegeCasteCategory();
    const { data: rowDetails, isLoading: isFetchingDetails } = useCollegeCasteCategoryById(selectedRow?.imcC_Id || null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(collegeCasteCategorySchema.addOrUpdate),
        mode: 'onChange'
    });

    useEffect(() => {
        if (rowDetails?.data?.[0]) {
            const details = rowDetails.data[0];
            reset({
                imcC_CategoryName: details.imcC_CategoryName,
                imcC_CategoryDesc: details.imcC_CategoryDesc
            });
        } else if (selectedRow) {
            reset({
                imcC_CategoryName: selectedRow.imcC_CategoryName,
                imcC_CategoryDesc: selectedRow.imcC_CategoryDesc
            });
        }
    }, [selectedRow, rowDetails, reset]);

    const onSubmit: SubmitHandler<FormFields> = async (data: FormFields) => {
        try {
            const payload = {
                imcC_Id: selectedRow.imcC_Id,
                imcC_CategoryName: data.imcC_CategoryName,
                imcC_CategoryDesc: data.imcC_CategoryDesc
            };

            const response = await saveCategory(payload);

            if (response.success === true) {
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
                        loadingText='Updating...'>
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' />
                            Update Category
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
