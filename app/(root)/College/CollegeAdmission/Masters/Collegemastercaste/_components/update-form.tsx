'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCollegeMasterCaste, useCollegeMasterCasteById, useSaveCollegeMasterCaste } from '@/hooks/college/useCollegeMasters';
import { collegeMasterCasteSchema } from '@/schemas/college/masters';
import type { ICollegeMasterCaste } from '@/types/college/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof collegeMasterCasteSchema.addOrUpdate>;

interface UpdateCollegeMasterCasteFormProps {
    selectedRow: ICollegeMasterCaste;
    onSuccess?: () => void;
    className?: string;
}

export default function UpdateCollegeMasterCasteForm({ selectedRow, onSuccess, className = '' }: UpdateCollegeMasterCasteFormProps) {
    const casteId = selectedRow.iC_Id || selectedRow.imC_Id || 0;
    const { data: initialResponse, refetchAll } = useCollegeMasterCaste();
    const { data: rowDetailsResponse, isLoading: isLoadingDetails } = useCollegeMasterCasteById(casteId);
    const { mutateAsync: saveCaste } = useSaveCollegeMasterCaste();

    const categoryList = initialResponse?.data?.mastercastename || initialResponse?.mastercastename || [];

    const {
        register,
        control,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(collegeMasterCasteSchema.addOrUpdate),
        defaultValues: {
            iC_CasteName: selectedRow.iC_CasteName || selectedRow.imC_CasteName || '',
            iC_CasteDesc: selectedRow.iC_CasteDesc || selectedRow.imC_CasteDesc || '',
            imcC_Id: selectedRow.imcC_Id ? selectedRow.imcC_Id.toString() : ''
        },
        mode: 'onChange'
    });

    useEffect(() => {
        const details = rowDetailsResponse?.data?.gridviewDetails?.[0] || rowDetailsResponse?.gridviewDetails?.[0] || selectedRow;

        if (details) {
            const name = details.imC_CasteName || details.iC_CasteName || '';
            const desc = details.imC_CasteDesc || details.iC_CasteDesc || '';
            const catId = details.imcC_Id ? details.imcC_Id.toString() : '';

            setValue('iC_CasteName', name);
            setValue('iC_CasteDesc', desc);
            setValue('imcC_Id', catId);
        }
    }, [rowDetailsResponse, selectedRow, setValue]);

    const onSubmit: SubmitHandler<FormFields> = async (data: FormFields) => {
        try {
            const payload = {
                iC_Id: casteId,
                imcC_Id: Number(data.imcC_Id),
                iC_CasteName: data.iC_CasteName,
                iC_CasteDesc: data.iC_CasteDesc
            };

            const res = await saveCaste(payload);

            if (res?.duplicate_caste_name_bool === true || res?.msg === 'Duplicate' || res?.retrunMsg === 'Duplicate') {
                toast.error('Caste Name Already Exists');
                return;
            }

            if (res?.returnVal_update === true || res?.returnVal === true || res?.success === true) {
                toast.success(res?.msg || res?.retrunMsg || 'Record Updated Successfully');
                refetchAll();
                onSuccess?.();
            } else if (res?.returnVal_update === false || res?.returnVal === false || res?.success === false) {
                toast.error(res?.msg || res?.retrunMsg || res?.message || 'Failed to Update');
            } else {
                toast.success('Record Updated Successfully');
                refetchAll();
                onSuccess?.();
            }
        } catch (error: any) {
            toast.error(error.message || 'An error occurred while updating.');
        }
    };

    if (isLoadingDetails) {
        return (
            <div className='flex items-center justify-center p-8'>
                <Loader2 className='h-6 w-6 animate-spin text-primary' />
                <span className='ml-2 text-muted-foreground text-sm'>Loading details...</span>
            </div>
        );
    }

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
                        onClick={onSuccess}
                        disabled={isSubmitting}
                        className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'>
                        Cancel
                    </Button>
                    <Button
                        type='submit'
                        disabled={isSubmitting}
                        className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'
                        isLoading={isSubmitting}
                        loadingText='Updating...'>
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' />
                            Update
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
