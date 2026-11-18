'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputNumber } from '@/components/ui/extension/input-number';
import { InputText } from '@/components/ui/extension/input-text';
import { useMasterClass } from '@/hooks/admission/preadmission/useMasters';
import { masterClassSchema } from '@/schemas/admission/preadmission/masters';
import { addOrUpdateMasterClass } from '@/server/admission/preadmission/masters/class';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterClassSchema.addOrUpdate>;

interface AddMasterClassFormProps {
    onSuccess?: () => void;
    className?: string;
}

export default function AddMasterClassForm({ onSuccess, className = '' }: AddMasterClassFormProps) {
    const { refetchAll } = useMasterClass();

    const {
        control,
        watch,
        setValue,
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterClassSchema.addOrUpdate),
        mode: 'onChange',
        defaultValues: {
            asmcl_preadmflag: 0
        }
    });

    const onSubmit: SubmitHandler<FormFields | any> = async (data: FormFields) => {
        try {
            const {
                asmcl_classcode,
                asmcl_classname,
                asmcl_maxcapacity,
                asmcl_order,
                asmcl_minageyear,
                asmcl_minagemonth,
                asmcl_minagedays,
                asmcl_maxageyear,
                asmcl_maxagemonth,
                asmcl_maxagedays,
                asmcl_preadmflag
            } = data;
            const payload = {
                ASMCL_Id: 0,
                ASMCL_ClassCode: asmcl_classcode,
                ASMCL_ClassName: asmcl_classname,
                ASMCL_MaxCapacity: asmcl_maxcapacity,
                ASMCL_Order: asmcl_order,
                ASMCL_MinAgeYear: asmcl_minageyear,
                ASMCL_MinAgeMonth: asmcl_minagemonth,
                ASMCL_MinAgeDays: asmcl_minagedays,
                ASMCL_MaxAgeYear: asmcl_maxageyear,
                ASMCL_MaxAgeMonth: asmcl_maxagemonth,
                ASMCL_MaxAgeDays: asmcl_maxagedays,
                ASMCL_PreadmFlag: asmcl_preadmflag,
                ASMCL_ActiveFlag: true
            };

            const response = await addOrUpdateMasterClass(payload);

            if (response.success) {
                const Swal = (await import('sweetalert2')).default;
                Swal.fire({
                    title: 'Success',
                    text: 'Record Saved Successfully',
                    icon: 'success',
                    confirmButtonText: 'OK',
                    allowOutsideClick: true
                }).then(() => {
                    window.location.reload();
                });
                reset();
                refetchAll();
                onSuccess?.();
            } else {
                toast.error(response.message);
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
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
                        <InputText
                            label='Class Code'
                            required
                            id='asmcl_classcode'
                            placeholder='Enter Class Code (e.g. C01)'
                            {...register('asmcl_classcode')}
                            error={errors.asmcl_classcode?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <InputText
                            label='Class Name'
                            required
                            id='asmcl_classname'
                            placeholder='Enter Class Name (e.g. Class I)'
                            {...register('asmcl_classname')}
                            error={errors.asmcl_classname?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <div className='group flex flex-col gap-1.5'>
                            <Controller
                                name='asmcl_maxcapacity'
                                control={control}
                                render={({ field }) => (
                                    <InputNumber
                                        label='Max Capacity'
                                        placeholder='Enter Max Capacity'
                                        required
                                        id='asmcl_maxcapacity'
                                        value={field.value}
                                        onChange={(value) => field.onChange(value)}
                                        minValue={0}
                                        step={1}
                                    />
                                )}
                            />
                            {errors.asmcl_maxcapacity && <FormError>{errors.asmcl_maxcapacity.message}</FormError>}
                        </div>
                        <div className='group flex flex-col gap-1.5'>
                            <Controller
                                name='asmcl_order'
                                control={control}
                                render={({ field }) => (
                                    <InputNumber
                                        label='Class Order'
                                        placeholder='Enter Class Order'
                                        required
                                        id='asmcl_order'
                                        value={field.value}
                                        onChange={(value) => field.onChange(value)}
                                        minValue={0}
                                        step={1}
                                    />
                                )}
                            />
                            {errors.asmcl_order && <FormError>{errors.asmcl_order.message}</FormError>}
                        </div>
                    </div>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                        <div className='group flex flex-col gap-1.5'>
                            <Controller
                                name='asmcl_minageyear'
                                control={control}
                                render={({ field }) => (
                                    <InputNumber
                                        label='Class Min Age (Year)'
                                        placeholder='Enter Min Age Year'
                                        required
                                        id='asmcl_minageyear'
                                        value={field.value}
                                        onChange={(value) => field.onChange(value)}
                                        minValue={0}
                                        maxValue={100}
                                        step={1}
                                    />
                                )}
                            />
                            {errors.asmcl_minageyear && <FormError>{errors.asmcl_minageyear.message}</FormError>}
                        </div>
                        <div className='group flex flex-col gap-1.5'>
                            <Controller
                                name='asmcl_minagemonth'
                                control={control}
                                render={({ field }) => (
                                    <InputNumber
                                        label='Class Min Age (Month)'
                                        placeholder='Enter Min Age Month'
                                        required
                                        id='asmcl_minagemonth'
                                        value={field.value}
                                        onChange={(value) => field.onChange(value)}
                                        minValue={0}
                                        maxValue={11}
                                        step={1}
                                    />
                                )}
                            />
                            {errors.asmcl_minagemonth && <FormError>{errors.asmcl_minagemonth.message}</FormError>}
                        </div>
                        <div className='group flex flex-col gap-1.5'>
                            <Controller
                                name='asmcl_minagedays'
                                control={control}
                                render={({ field }) => (
                                    <InputNumber
                                        label='Class Min Age (Days)'
                                        placeholder='Enter Min Age Days'
                                        required
                                        id='asmcl_minagedays'
                                        value={field.value}
                                        onChange={(value) => field.onChange(value)}
                                        minValue={0}
                                        maxValue={31}
                                        step={1}
                                    />
                                )}
                            />
                            {errors.asmcl_minagedays && <FormError>{errors.asmcl_minagedays.message}</FormError>}
                        </div>
                    </div>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                        <div className='group flex flex-col gap-1.5'>
                            <Controller
                                name='asmcl_maxageyear'
                                control={control}
                                render={({ field }) => (
                                    <InputNumber
                                        label='Class Max Age (Year)'
                                        placeholder='Enter Max Age Year'
                                        required
                                        id='asmcl_maxageyear'
                                        value={field.value}
                                        onChange={(value) => field.onChange(value)}
                                        minValue={0}
                                        maxValue={100}
                                        step={1}
                                    />
                                )}
                            />
                            {errors.asmcl_maxageyear && <FormError>{errors.asmcl_maxageyear.message}</FormError>}
                        </div>
                        <div className='group flex flex-col gap-1.5'>
                            <Controller
                                name='asmcl_maxagemonth'
                                control={control}
                                render={({ field }) => (
                                    <InputNumber
                                        label='Class Max Age (Month)'
                                        placeholder='Enter Max Age Month'
                                        required
                                        id='asmcl_maxagemonth'
                                        value={field.value}
                                        onChange={(value) => field.onChange(value)}
                                        minValue={0}
                                        maxValue={11}
                                        step={1}
                                    />
                                )}
                            />
                            {errors.asmcl_maxagemonth && <FormError>{errors.asmcl_maxagemonth.message}</FormError>}
                        </div>
                        <div className='group flex flex-col gap-1.5'>
                            <Controller
                                name='asmcl_maxagedays'
                                control={control}
                                render={({ field }) => (
                                    <InputNumber
                                        label='Class Max Age (Days)'
                                        placeholder='Enter Max Age Days'
                                        required
                                        id='asmcl_maxagedays'
                                        value={field.value}
                                        onChange={(value) => field.onChange(value)}
                                        minValue={0}
                                        maxValue={31}
                                        step={1}
                                    />
                                )}
                            />
                            {errors.asmcl_maxagedays && <FormError>{errors.asmcl_maxagedays.message}</FormError>}
                        </div>
                    </div>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <div className='flex items-center gap-2 pt-6'>
                            <Controller
                                name='asmcl_preadmflag'
                                control={control}
                                render={({ field }) => (
                                    <Checkbox
                                        id='asmcl_preadmflag'
                                        checked={field.value === 1}
                                        onCheckedChange={(checked) => field.onChange(checked ? 1 : 0)}
                                    />
                                )}
                            />
                            <Label
                                aria-label='Preadmission Class'
                                htmlFor='asmcl_preadmflag'
                                className='cursor-pointer font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                                Preadmission Class
                            </Label>
                        </div>
                        {errors.asmcl_preadmflag && <FormError>{errors.asmcl_preadmflag.message}</FormError>}
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
                            Save Master Class
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
