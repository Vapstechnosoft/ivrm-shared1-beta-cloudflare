'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { InputText } from '@/components/ui/extension/input-text';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMasterTimeSlabList } from '@/hooks/library/useMasters';
import { masterTimeSlabSchema } from '@/schemas/library/masters';
import { addOrUpdateMasterTimeSlab } from '@/server/library/masters/time-slab';
import type { IMasterTimeSlab } from '@/types/library/masters/time-slab';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterTimeSlabSchema.addOrUpdate>;

interface UpdateMasterTimeSlabFormProps {
    onloaddata?: any;
    onSuccess?: () => void;
    className?: string;
    selectedRow: IMasterTimeSlab;
}

export default function UpdateMasterTimeSlabForm({
    onloaddata,
    onSuccess,
    className = '',
    selectedRow: row
}: UpdateMasterTimeSlabFormProps) {
    const { refetchAll } = useMasterTimeSlabList();

    const {
        register,
        handleSubmit,
        reset,
        control,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterTimeSlabSchema.addOrUpdate),
        mode: 'onSubmit',
        defaultValues: {
            lfsE_Id: (row as any).lfsE_Id ?? (row as any).LFSE_Id ?? 0,
            lfsE_UserType: (row as any).lfsE_UserType ?? (row as any).LFSE_UserType ?? '',
            lfsE_SlabTypeFlg: (row as any).lfsE_SlabTypeFlg ?? (row as any).LFSE_SlabTypeFlg ?? '',
            lfsE_PerDayFlg:
                (row as any).lfsE_PerDayFlg === true ||
                (row as any).lfsE_PerDayFlg === 1 ||
                (row as any).LFSE_PerDayFlg === true ||
                (row as any).LFSE_PerDayFlg === 1
                    ? 1
                    : 0,
            lfsE_FromDay: (row as any).lfsE_FromDay ?? (row as any).LFSE_FromDay ?? 0,
            lfsE_ToDay: (row as any).lfsE_ToDay ?? (row as any).LFSE_ToDay ?? 0,
            lfsE_Amount: (row as any).lfsE_Amount ?? (row as any).LFSE_Amount ?? 0,
            lfsE_ActiveFlg: (row as any).lfsE_ActiveFlg ?? (row as any).LFSE_ActiveFlg ?? true
        }
    });

    const slabType = watch('lfsE_SlabTypeFlg');

    useEffect(() => {
        if (row) {
            reset({
                lfsE_Id: (row as any).lfsE_Id ?? (row as any).LFSE_Id,
                lfsE_UserType: (row as any).lfsE_UserType ?? (row as any).LFSE_UserType ?? '',
                lfsE_SlabTypeFlg: (row as any).lfsE_SlabTypeFlg ?? (row as any).LFSE_SlabTypeFlg ?? '',
                lfsE_PerDayFlg:
                    (row as any).lfsE_PerDayFlg === true ||
                    (row as any).lfsE_PerDayFlg === 1 ||
                    (row as any).LFSE_PerDayFlg === true ||
                    (row as any).LFSE_PerDayFlg === 1
                        ? 1
                        : 0,
                lfsE_FromDay: (row as any).lfsE_FromDay ?? (row as any).LFSE_FromDay ?? 0,
                lfsE_ToDay: (row as any).lfsE_ToDay ?? (row as any).LFSE_ToDay ?? 0,
                lfsE_Amount: (row as any).lfsE_Amount ?? (row as any).LFSE_Amount ?? 0,
                lfsE_ActiveFlg: (row as any).lfsE_ActiveFlg ?? (row as any).LFSE_ActiveFlg ?? true
            });
        }
    }, [row, reset]);

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const payload = {
                lfsE_Id: (row as any).lfsE_Id ?? (row as any).LFSE_Id,
                lfsE_UserType: data.lfsE_UserType,
                lfsE_SlabTypeFlg: data.lfsE_SlabTypeFlg,
                lfsE_PerDayFlg: data.lfsE_PerDayFlg === 1 ? true : false,
                lfsE_FromDay: Number(data.lfsE_FromDay),
                lfsE_ToDay: data.lfsE_SlabTypeFlg === 'BETWEEN' ? Number(data.lfsE_ToDay) : 0,
                lfsE_Amount: Number(data.lfsE_Amount),
                lfsE_ActiveFlg: row.lfsE_ActiveFlg
            };

            const response = await addOrUpdateMasterTimeSlab(payload);

            if (response.success) {
                toast.success(response.message || 'Record Updated Successfully!!!');
                refetchAll();
                onSuccess?.();
            } else {
                toast.error(response.message || 'Record Not Updated Successfully!!!');
            }
        } catch (error: any) {
            toast.error(error.message || 'Something went wrong');
        }
    };

    const handleReset = () => {
        reset({
            lfsE_Id: (row as any).lfsE_Id ?? (row as any).LFSE_Id,
            lfsE_UserType: '',
            lfsE_SlabTypeFlg: '',
            lfsE_PerDayFlg: 0,
            lfsE_FromDay: 0,
            lfsE_ToDay: 0,
            lfsE_Amount: 0,
            lfsE_ActiveFlg: (row as any).lfsE_ActiveFlg ?? (row as any).LFSE_ActiveFlg ?? true
        });
    };

    return (
        <div className={className}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                    <div className='space-y-2'>
                        <Label>
                            User Type <span className='text-destructive'>*</span>
                        </Label>
                        <Controller
                            control={control}
                            name='lfsE_UserType'
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='--Select--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {onloaddata?.usertype && onloaddata.usertype.length > 0 ? (
                                            onloaddata.usertype.map((item: any, index: number) => (
                                                <SelectItem key={index} value={item.ivrmrT_Role}>
                                                    {item.ivrmrT_Role}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <>
                                                <SelectItem value='STUDENT'>STUDENT</SelectItem>
                                                <SelectItem value='STAFF'>STAFF</SelectItem>
                                                <SelectItem value='DEPARTMENT'>DEPARTMENT</SelectItem>
                                                <SelectItem value='GUEST'>GUEST</SelectItem>
                                            </>
                                        )}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.lfsE_UserType && <p className='text-destructive text-sm'>{errors.lfsE_UserType.message}</p>}
                    </div>

                    <div className='space-y-2'>
                        <Label>
                            Slab Type <span className='text-destructive'>*</span>
                        </Label>
                        <Controller
                            control={control}
                            name='lfsE_SlabTypeFlg'
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='--Select--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {onloaddata?.slabtype && onloaddata.slabtype.length > 0 ? (
                                            onloaddata.slabtype.map((item: any, index: number) => (
                                                <SelectItem key={index} value={item.slabtype}>
                                                    {item.slabtype}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <>
                                                <SelectItem value='BETWEEN'>BETWEEN</SelectItem>
                                                <SelectItem value='GREATER'>GREATER</SelectItem>
                                            </>
                                        )}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.lfsE_SlabTypeFlg && <p className='text-destructive text-sm'>{errors.lfsE_SlabTypeFlg.message}</p>}
                    </div>

                    <div className='flex items-center space-x-2 pt-8'>
                        <Controller
                            control={control}
                            name='lfsE_PerDayFlg'
                            render={({ field }) => (
                                <Checkbox
                                    id='perDay_update'
                                    checked={field.value === 1}
                                    onCheckedChange={(checked) => field.onChange(checked ? 1 : 0)}
                                />
                            )}
                        />
                        <Label htmlFor='perDay_update' className='font-normal'>
                            Per Day
                        </Label>
                    </div>

                    <InputText
                        label='From Day'
                        type='number'
                        required
                        placeholder='Enter From Day'
                        {...register('lfsE_FromDay')}
                        error={errors.lfsE_FromDay?.message}
                    />

                    {slabType === 'BETWEEN' && (
                        <InputText
                            label='To Day'
                            type='number'
                            required
                            placeholder='Enter To Day'
                            {...register('lfsE_ToDay')}
                            error={errors.lfsE_ToDay?.message}
                        />
                    )}

                    <InputText
                        label='Amount'
                        type='number'
                        step='0.01'
                        required
                        placeholder='Enter Amount'
                        {...register('lfsE_Amount')}
                        error={errors.lfsE_Amount?.message}
                    />
                </div>

                <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                    <Button
                        type='submit'
                        disabled={isSubmitting}
                        className='order-1 w-fit bg-[#4251b1] text-white transition-all duration-200 hover:scale-105 hover:bg-[#35418e]'
                        isLoading={isSubmitting}
                        loadingText='Updating...'>
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' />
                            Update
                        </div>
                    </Button>
                    <Button
                        type='button'
                        onClick={handleReset}
                        disabled={isSubmitting}
                        className='order-2 w-fit bg-[#ff5a30] text-white transition-all duration-200 hover:scale-105 hover:bg-[#e64d26]'>
                        Reset
                    </Button>
                </div>
            </form>
        </div>
    );
}
