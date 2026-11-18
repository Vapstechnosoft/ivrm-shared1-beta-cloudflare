'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { useClgMasterCourseCategoryMap, useSaveClgMasterCourseCategoryMap } from '@/hooks/college/useCollegeMasters';
import { clgMasterCourseCategoryMapSchema } from '@/schemas/college/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type FormFields = z.infer<typeof clgMasterCourseCategoryMapSchema.addOrUpdate>;

interface AddCourseCategoryMapFormProps {
    onSuccess?: () => void;
    className?: string;
}

export default function AddCourseCategoryMapForm({ onSuccess, className = '' }: AddCourseCategoryMapFormProps) {
    const { data: response, refetchAll } = useClgMasterCourseCategoryMap();
    const { mutateAsync: saveMap } = useSaveClgMasterCourseCategoryMap();

    const masterCourseList = response?.data?.masterCourseList || [];
    const masterCategoryList = response?.data?.masterCategoryList || response?.data?.mastercategory || [];

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(clgMasterCourseCategoryMapSchema.addOrUpdate),
        mode: 'onChange'
    });

    const onSubmit: SubmitHandler<FormFields> = async (data: FormFields) => {
        try {
            const payload = {
                amcocM_Id: 0,
                amcO_Id: Number(data.amcO_Id),
                amcoC_Id: Number(data.amcoC_Id)
            };

            const res = await saveMap(payload);

            if (res.success || res.message?.toLowerCase()?.includes('success')) {
                toast.success(res.message || 'Record Saved Successfully');
                reset();
                refetchAll();
                onSuccess?.();
            } else {
                toast.error(res.message || 'Failed to save record');
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
                        <div className='group flex flex-col gap-1.5'>
                            <Label isRequired>Course Name</Label>
                            <Controller
                                name='amcO_Id'
                                control={control}
                                render={({ field, fieldState }) => (
                                    <>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger className={fieldState.error ? 'border-destructive focus:ring-destructive/20' : 'transition-colors focus:ring-2 focus:ring-primary/20'}>
                                                <SelectValue placeholder='--Select--' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {masterCourseList.map((option: any) => (
                                                    <SelectItem key={option.amcO_Id} value={option.amcO_Id.toString()}>
                                                        {option.amcO_CourseName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {fieldState.error?.message && <FormError>{fieldState.error.message}</FormError>}
                                    </>
                                )}
                            />
                        </div>

                        <div className='group flex flex-col gap-1.5'>
                            <Label isRequired>Category Name</Label>
                            <Controller
                                name='amcoC_Id'
                                control={control}
                                render={({ field, fieldState }) => (
                                    <>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger className={fieldState.error ? 'border-destructive focus:ring-destructive/20' : 'transition-colors focus:ring-2 focus:ring-primary/20'}>
                                                <SelectValue placeholder='--Select--' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {masterCategoryList.map((option: any) => (
                                                    <SelectItem key={option.amcoC_Id} value={option.amcoC_Id.toString()}>
                                                        {option.amcoC_Name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {fieldState.error?.message && <FormError>{fieldState.error.message}</FormError>}
                                    </>
                                )}
                            />
                        </div>
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
                            Save Map
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
