'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCollegeMasterCaste, useSaveCollegeMasterCaste } from '@/hooks/college/useCollegeMasters';
import { collegeMasterCasteSchema } from '@/schemas/college/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof collegeMasterCasteSchema.addOrUpdate>;

interface AddCollegeMasterCasteFormProps {
    onSuccess?: () => void;
    className?: string;
}

export default function AddCollegeMasterCasteForm({ onSuccess, className = '' }: AddCollegeMasterCasteFormProps) {
    const { data: response, refetchAll } = useCollegeMasterCaste();
    const { mutateAsync: saveCaste } = useSaveCollegeMasterCaste();

    const categoryList = response?.data?.mastercastename || response?.mastercastename || [];

    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(collegeMasterCasteSchema.addOrUpdate),
        defaultValues: {
            iC_CasteName: '',
            iC_CasteDesc: '',
            imcC_Id: ''
        },
        mode: 'onChange'
    });

    const onSubmit: SubmitHandler<FormFields> = async (data: FormFields) => {
        try {
            const payload = {
                iC_Id: 0,
                imcC_Id: Number(data.imcC_Id),
                iC_CasteName: data.iC_CasteName,
                iC_CasteDesc: data.iC_CasteDesc
            };

            const res = await saveCaste(payload);

            if (res?.duplicate_caste_name_bool === true || res?.msg === 'Duplicate' || res?.retrunMsg === 'Duplicate') {
                toast.error('Caste Name Already Exists');
                return;
            }

            if (res?.returnVal === true || res?.success === true) {
                toast.success(res?.msg || res?.retrunMsg || 'Record Saved Successfully');
                reset();
                refetchAll();
                onSuccess?.();
            } else if (res?.returnVal === false || res?.success === false) {
                toast.error(res?.msg || res?.retrunMsg || res?.message || 'Failed to Save');
            } else {
                toast.success('Record Saved Successfully');
                reset();
                refetchAll();
                onSuccess?.();
            }
        } catch (error: any) {
            toast.error(error.message || 'An error occurred while saving.');
        }
    };

    return (
        <div className={`${className}`}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                        <InputText
                            label='Caste Name'
                            required
                            id='iC_CasteName'
                            placeholder='Enter Caste Name'
                            {...register('iC_CasteName')}
                            error={errors.iC_CasteName?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />

                        <InputText
                            label='Caste Description'
                            required
                            id='iC_CasteDesc'
                            placeholder='Enter Caste Description'
                            {...register('iC_CasteDesc')}
                            error={errors.iC_CasteDesc?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />

                        <div className='group flex flex-col gap-1.5'>
                            <Label isRequired>Caste Category</Label>
                            <Controller
                                name='imcC_Id'
                                control={control}
                                render={({ field, fieldState }) => (
                                    <>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger
                                                className={
                                                    fieldState.error
                                                        ? 'border-destructive focus:ring-destructive/20'
                                                        : 'transition-colors focus:ring-2 focus:ring-primary/20'
                                                }>
                                                <SelectValue placeholder='--Select--' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categoryList.map((cat: any) => (
                                                    <SelectItem key={cat.imcC_Id} value={cat.imcC_Id.toString()}>
                                                        {cat.imcC_CategoryName}
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
                            Save
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
