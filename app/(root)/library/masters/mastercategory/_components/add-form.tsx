'use client';

import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMasterCategoryListData } from '@/hooks/library/useMasters';
import { masterCategorySchema } from '@/schemas/library/masters';
import { addOrUpdateMasterCategory } from '@/server/library/masters/library_category';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterCategorySchema.addOrUpdate>;

interface AddMasterCategoryFormProps {
    onSuccess?: () => void;
    className?: string;
}

export default function AddMasterCategoryForm({ onSuccess, className = '' }: AddMasterCategoryFormProps) {
    const { refetchAll } = useMasterCategoryListData();

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterCategorySchema.addOrUpdate),
        mode: 'onChange',
        defaultValues: {
            lmC_CategoryName: '',
            lmC_CategoryCode: '',
            lmC_BNBFlg: 'Book'
        }
    });

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const payload = {
                lmC_Id: 0,
                mI_Id: 0,
                lmC_CategoryName: data.lmC_CategoryName,
                lmC_CategoryCode: data.lmC_CategoryCode,
                lmC_BNBFlg: data.lmC_BNBFlg,
                createdDate: new Date().toISOString(),
                updatedDate: new Date().toISOString(),
                lmC_ActiveFlag: true
            };

            const response = await addOrUpdateMasterCategory(payload);

            if (response?.success) {
                toast.success(response.message || 'Category saved successfully');
                reset();
                refetchAll();
                onSuccess?.();
            } else {
                toast.error(response.message || 'Failed to save category');
            }
        } catch (error: any) {
            toast.error(error?.message || 'Something went wrong');
        }
    };

    const handleReset = () => {
        reset({
            lmC_CategoryName: '',
            lmC_CategoryCode: '',
            lmC_BNBFlg: 'Book'
        });
    };

    return (
        <div className={className}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                        <InputText
                            label='Category Name'
                            required
                            id='lmC_CategoryName'
                            placeholder='Enter Category name'
                            {...register('lmC_CategoryName')}
                            error={errors.lmC_CategoryName?.message}
                        />

                        <InputText
                            label='Category Code'
                            required
                            id='lmC_CategoryCode'
                            placeholder='Enter Category code'
                            {...register('lmC_CategoryCode')}
                            error={errors.lmC_CategoryCode?.message}
                        />

                        <div className='space-y-2'>
                            <label className='font-medium text-sm'>
                                Category Type <span className='text-red-500'>*</span>
                            </label>
                            <Controller
                                name='lmC_BNBFlg'
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Type' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='Book'>Book</SelectItem>
                                            <SelectItem value='Non Book'>Non Book</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.lmC_BNBFlg && <FormError>{errors.lmC_BNBFlg.message}</FormError>}
                        </div>
                    </div>

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
                            Save Master Category
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
