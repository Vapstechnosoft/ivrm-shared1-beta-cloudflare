'use client';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type LeaveConfigurationFormValues, leaveConfigurationSchema } from '@/schemas/hrms/leaveConfiguration/leaveConfiguration';
import type { LeaveConfigurationFormData } from '@/types/hrms/leave-management/leaveConfiguration/leaveConfiguration';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, RotateCcw, Save } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';

interface LeaveConfigurationFormProps {
    initialData?: LeaveConfigurationFormData | LeaveConfigurationFormValues | null;
    onSubmit: (data: LeaveConfigurationFormValues) => void;
    onCancel?: () => void;
    isPending?: boolean;
}

const DEFAULT_FORM_VALUES: LeaveConfigurationFormValues = {
    id: 0,
    policy_name: '',
    proc_name: '',
    servic_name: '',
    late_flag: true,
    Late_Time: '',
    numlate_flag: true,
    Late_num: '',
    Early: true,
    Early_Time: '',
    Time_flag: true,
    cum_time: '',
    Aftr_cum_time: '',
    carry_flag: true,
    sufix_flag: true,
    holiday_inc_flag: true,
    HRLPC_LateLeaveFlag: 'leave',
    sporgen_flag: 'GEN',
    HRLPC_AbsentLeaveFlag: 'leave'
};

export default function LeaveConfigurationForm({ initialData, onSubmit, onCancel, isPending = false }: LeaveConfigurationFormProps) {
    const {
        register,
        handleSubmit,
        control,
        watch,
        reset,
        clearErrors,
        formState: { errors }
    } = useForm<LeaveConfigurationFormValues>({
        mode: 'onSubmit',
        reValidateMode: 'onChange',
        resolver: zodResolver(leaveConfigurationSchema),
        defaultValues: initialData ? { ...DEFAULT_FORM_VALUES, ...initialData, id: initialData.id ?? 0 } : DEFAULT_FORM_VALUES
    });
    // Reset form values when initialData changes
    useEffect(() => {
        if (initialData) {
            reset({
                ...DEFAULT_FORM_VALUES,
                ...initialData,
                id: initialData.id ?? 0
            });
        }
    }, [initialData, reset]);

    const handleClear = () => {
        reset(DEFAULT_FORM_VALUES);
        // clearErrors must be called after reset when using onChange validation mode
        // otherwise onChange re-triggers immediately on the empty default values and
        // shows validation errors (e.g. "Please Select Service Name") upon cancel
        clearErrors();
        if (onCancel) {
            onCancel();
        }
    };

    // Ensure loaded procedure and service names are present in options even if custom
    const currentProcedure = watch('proc_name');
    const currentService = watch('servic_name');

    const procedureOptions = useMemo(() => {
        const base = ['xyz', 'ABC'];
        if (currentProcedure && !base.includes(currentProcedure)) {
            return [currentProcedure, ...base];
        }
        return base;
    }, [currentProcedure]);

    const serviceOptions = useMemo(() => {
        const base = ['qqqqqqq', 'ABdddddddC'];
        if (currentService && !base.includes(currentService)) {
            return [currentService, ...base];
        }
        return base;
    }, [currentService]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            {/* Row 1: Policy Name, Procedure Name, Service Name */}
            <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                {/* Policy Name */}
                <div className='space-y-2'>
                    <label htmlFor='policy_name' className='font-medium text-sm'>
                        Policy Name: <span className='text-destructive'>*</span>
                    </label>
                    <Input id='policy_name' placeholder='Enter policy name' {...register('policy_name')} />
                    {errors.policy_name?.message && <FormError>{errors.policy_name.message}</FormError>}
                </div>

                {/* Procedure Name */}
                <Controller
                    control={control}
                    name='proc_name'
                    render={({ field }) => (
                        <div className='space-y-2'>
                            <label htmlFor='proc_name' className='font-medium text-sm'>
                                Procedure Name:
                            </label>
                            <Select onValueChange={field.onChange} value={field.value || ''}>
                                <SelectTrigger id='proc_name' className='w-full'>
                                    <SelectValue placeholder='--Select--' />
                                </SelectTrigger>
                                <SelectContent>
                                    {procedureOptions.map((opt) => (
                                        <SelectItem key={opt} value={opt}>
                                            {opt}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                />

                {/* Service Name */}
                <Controller
                    control={control}
                    name='servic_name'
                    render={({ field }) => (
                        <div className='space-y-2'>
                            <label htmlFor='servic_name' className='font-medium text-sm'>
                                Service Name: <span className='text-destructive'>*</span>
                            </label>
                            <Select onValueChange={field.onChange} value={field.value || ''}>
                                <SelectTrigger id='servic_name' className='w-full'>
                                    <SelectValue placeholder='--Select--' />
                                </SelectTrigger>
                                <SelectContent>
                                    {serviceOptions.map((opt) => (
                                        <SelectItem key={opt} value={opt}>
                                            {opt}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.servic_name?.message && <FormError>{errors.servic_name.message}</FormError>}
                        </div>
                    )}
                />
            </div>

            {/* Row 2: Late In Flag & Late Time */}
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                {/* Late In Flag */}
                <Controller
                    control={control}
                    name='late_flag'
                    render={({ field }) => (
                        <div className='space-y-2'>
                            <div className='font-medium text-sm'>Late In:</div>
                            <div className='rounded-lg border bg-muted/30 p-3.5 shadow-xs'>
                                <RadioGroup
                                    aria-label='Late In'
                                    onValueChange={(val) => field.onChange(val === 'true')}
                                    value={field.value ? 'true' : 'false'}
                                    className='flex items-center gap-6'>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='true' id='late-yes' />
                                        <Label htmlFor='late-yes' className='cursor-pointer text-sm'>
                                            Yes
                                        </Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='false' id='late-no' />
                                        <Label htmlFor='late-no' className='cursor-pointer text-sm'>
                                            No
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>
                            {errors.late_flag?.message && <FormError>{errors.late_flag.message}</FormError>}
                        </div>
                    )}
                />

                {/* Late Time */}
                <div className='space-y-2'>
                    <label htmlFor='Late_Time' className='font-medium text-sm'>
                        Late Time : <span className='text-destructive'>*</span>
                    </label>
                    <Input id='Late_Time' placeholder='Enter minutes' {...register('Late_Time')} />
                    {errors.Late_Time?.message && <FormError>{errors.Late_Time.message}</FormError>}
                </div>
            </div>

            {/* Row 3: NO. of lates flag & NO. of lates */}
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                {/* NO. of lates flag */}
                <Controller
                    control={control}
                    name='numlate_flag'
                    render={({ field }) => (
                        <div className='space-y-2'>
                            <div className='font-medium text-sm'>NO. of lates flag:</div>
                            <div className='rounded-lg border bg-muted/30 p-3.5 shadow-xs'>
                                <RadioGroup
                                    aria-label='Number of lates flag'
                                    onValueChange={(val) => field.onChange(val === 'true')}
                                    value={field.value ? 'true' : 'false'}
                                    className='flex items-center gap-6'>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='true' id='numlate-yes' />
                                        <Label htmlFor='numlate-yes' className='cursor-pointer text-sm'>
                                            Yes
                                        </Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='false' id='numlate-no' />
                                        <Label htmlFor='numlate-no' className='cursor-pointer text-sm'>
                                            No
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>
                            {errors.numlate_flag?.message && <FormError>{errors.numlate_flag.message}</FormError>}
                        </div>
                    )}
                />

                {/* NO. of lates */}
                <div className='space-y-2'>
                    <label htmlFor='Late_num' className='font-medium text-sm'>
                        NO. of lates : <span className='text-destructive'>*</span>
                    </label>
                    <Input id='Late_num' placeholder='Enter num of lates' {...register('Late_num')} />
                    {errors.Late_num?.message && <FormError>{errors.Late_num.message}</FormError>}
                </div>
            </div>

            {/* Row 4: Early Out & Early Time */}
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                {/* Early Out */}
                <Controller
                    control={control}
                    name='Early'
                    render={({ field }) => (
                        <div className='space-y-2'>
                            <div className='font-medium text-sm'>
                                Early Out: <span className='text-destructive'>*</span>
                            </div>
                            <div className='rounded-lg border bg-muted/30 p-3.5 shadow-xs'>
                                <RadioGroup
                                    aria-label='Early Out'
                                    onValueChange={(val) => field.onChange(val === 'true')}
                                    value={field.value ? 'true' : 'false'}
                                    className='flex items-center gap-6'>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='true' id='early-yes' />
                                        <Label htmlFor='early-yes' className='cursor-pointer text-sm'>
                                            Yes
                                        </Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='false' id='early-no' />
                                        <Label htmlFor='early-no' className='cursor-pointer text-sm'>
                                            No
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>
                            {errors.Early?.message && <FormError>{errors.Early.message}</FormError>}
                        </div>
                    )}
                />

                {/* Early Time */}
                <div className='space-y-2'>
                    <label htmlFor='Early_Time' className='font-medium text-sm'>
                        Early Time : <span className='text-destructive'>*</span>
                    </label>
                    <Input id='Early_Time' placeholder='Enter minutes' {...register('Early_Time')} />
                    {errors.Early_Time?.message && <FormError>{errors.Early_Time.message}</FormError>}
                </div>
            </div>

            {/* Row 5: Cumulative Time Flag & Cumulative Time */}
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                {/* Cumulative Time Flag */}
                <Controller
                    control={control}
                    name='Time_flag'
                    render={({ field }) => (
                        <div className='space-y-2'>
                            <div className='font-medium text-sm'>
                                Cumulative Time Flag: <span className='text-destructive'>*</span>
                            </div>
                            <div className='rounded-lg border bg-muted/30 p-3.5 shadow-xs'>
                                <RadioGroup
                                    aria-label='Cumulative Time Flag'
                                    onValueChange={(val) => field.onChange(val === 'true')}
                                    value={field.value ? 'true' : 'false'}
                                    className='flex items-center gap-6'>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='true' id='timeflag-yes' />
                                        <Label htmlFor='timeflag-yes' className='cursor-pointer text-sm'>
                                            Yes
                                        </Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='false' id='timeflag-no' />
                                        <Label htmlFor='timeflag-no' className='cursor-pointer text-sm'>
                                            No
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>
                            {errors.Time_flag?.message && <FormError>{errors.Time_flag.message}</FormError>}
                        </div>
                    )}
                />

                {/* Cumulative Time */}
                <div className='space-y-2'>
                    <label htmlFor='cum_time' className='font-medium text-sm'>
                        Cumulative Time : <span className='text-destructive'>*</span>
                    </label>
                    <Input id='cum_time' placeholder='Enter minutes' {...register('cum_time')} />
                    {errors.cum_time?.message && <FormError>{errors.cum_time.message}</FormError>}
                </div>
            </div>

            {/* Row 6: After Cumulative Time */}
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                <div className='space-y-2'>
                    <label htmlFor='Aftr_cum_time' className='font-medium text-sm'>
                        After Cumulative Time : <span className='text-destructive'>*</span>
                    </label>
                    <Input id='Aftr_cum_time' placeholder='Enter Cumulative Time' {...register('Aftr_cum_time')} />
                    {errors.Aftr_cum_time?.message && <FormError>{errors.Aftr_cum_time.message}</FormError>}
                </div>
            </div>

            {/* Row 7: Carry Forward & Leave Prefix Sufix Flag */}
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                {/* Carry Forward */}
                <Controller
                    control={control}
                    name='carry_flag'
                    render={({ field }) => (
                        <div className='space-y-2'>
                            <div className='font-medium text-sm'>Carry Forward:</div>
                            <div className='rounded-lg border bg-muted/30 p-3.5 shadow-xs'>
                                <RadioGroup
                                    aria-label='Carry Forward'
                                    onValueChange={(val) => field.onChange(val === 'true')}
                                    value={field.value ? 'true' : 'false'}
                                    className='flex items-center gap-6'>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='true' id='carry-yes' />
                                        <Label htmlFor='carry-yes' className='cursor-pointer text-sm'>
                                            Yes
                                        </Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='false' id='carry-no' />
                                        <Label htmlFor='carry-no' className='cursor-pointer text-sm'>
                                            No
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>
                            {errors.carry_flag?.message && <FormError>{errors.carry_flag.message}</FormError>}
                        </div>
                    )}
                />

                {/* Leave Prefix Sufix Flag */}
                <Controller
                    control={control}
                    name='sufix_flag'
                    render={({ field }) => (
                        <div className='space-y-2'>
                            <div className='font-medium text-sm'>Leave Prefix Sufix Flag:</div>
                            <div className='rounded-lg border bg-muted/30 p-3.5 shadow-xs'>
                                <RadioGroup
                                    aria-label='Leave Prefix Suffix Flag'
                                    onValueChange={(val) => field.onChange(val === 'true')}
                                    value={field.value ? 'true' : 'false'}
                                    className='flex items-center gap-6'>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='true' id='sufix-yes' />
                                        <Label htmlFor='sufix-yes' className='cursor-pointer text-sm'>
                                            Yes
                                        </Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='false' id='sufix-no' />
                                        <Label htmlFor='sufix-no' className='cursor-pointer text-sm'>
                                            No
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>
                            {errors.sufix_flag?.message && <FormError>{errors.sufix_flag.message}</FormError>}
                        </div>
                    )}
                />
            </div>

            {/* Row 8: Include Holiday Flag & Late Leave/LOP Flag */}
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                {/* Include Holiday Flag */}
                <Controller
                    control={control}
                    name='holiday_inc_flag'
                    render={({ field }) => (
                        <div className='space-y-2'>
                            <div className='font-medium text-sm'>Include Holiday Flag:</div>
                            <div className='rounded-lg border bg-muted/30 p-3.5 shadow-xs'>
                                <RadioGroup
                                    aria-label='Include Holiday Flag'
                                    onValueChange={(val) => field.onChange(val === 'true')}
                                    value={field.value ? 'true' : 'false'}
                                    className='flex items-center gap-6'>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='true' id='holiday-yes' />
                                        <Label htmlFor='holiday-yes' className='cursor-pointer text-sm'>
                                            Yes
                                        </Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='false' id='holiday-no' />
                                        <Label htmlFor='holiday-no' className='cursor-pointer text-sm'>
                                            No
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>
                            {errors.holiday_inc_flag?.message && <FormError>{errors.holiday_inc_flag.message}</FormError>}
                        </div>
                    )}
                />

                {/* Late Leave/LOP Flag */}
                <Controller
                    control={control}
                    name='HRLPC_LateLeaveFlag'
                    render={({ field }) => (
                        <div className='space-y-2'>
                            <div className='font-medium text-sm'>Late Leave/LOP Flag:</div>
                            <div className='rounded-lg border bg-muted/30 p-3.5 shadow-xs'>
                                <RadioGroup
                                    aria-label='Late Leave or LOP Flag'
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    className='flex items-center gap-6'>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='leave' id='late-leave' />
                                        <Label htmlFor='late-leave' className='cursor-pointer font-medium text-sm'>
                                            Leave
                                        </Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='lop' id='late-lop' />
                                        <Label htmlFor='late-lop' className='cursor-pointer font-medium text-sm'>
                                            LOP
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>
                            {errors.HRLPC_LateLeaveFlag?.message && <FormError>{errors.HRLPC_LateLeaveFlag.message}</FormError>}
                        </div>
                    )}
                />
            </div>

            {/* Row 9: Stored Procedure/General Flag & Absent Leave/LOP Flag */}
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                {/* Stored Procedure/General Flag */}
                <Controller
                    control={control}
                    name='sporgen_flag'
                    render={({ field }) => (
                        <div className='space-y-2'>
                            <div className='font-medium text-sm'>Stored Procedure/General Flag:</div>
                            <div className='rounded-lg border bg-muted/30 p-3.5 shadow-xs'>
                                <RadioGroup
                                    aria-label='Stored Procedure or General Flag'
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    className='flex items-center gap-6'>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='SP' id='sp-sp' />
                                        <Label htmlFor='sp-sp' className='cursor-pointer font-medium text-sm'>
                                            Stored Procedure
                                        </Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='GEN' id='sp-gen' />
                                        <Label htmlFor='sp-gen' className='cursor-pointer font-medium text-sm'>
                                            General
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>
                            {errors.sporgen_flag?.message && <FormError>{errors.sporgen_flag.message}</FormError>}
                        </div>
                    )}
                />

                {/* Absent Leave/LOP Flag */}
                <Controller
                    control={control}
                    name='HRLPC_AbsentLeaveFlag'
                    render={({ field }) => (
                        <div className='space-y-2'>
                            <div className='font-medium text-sm'>Absent Leave/LOP Flag:</div>
                            <div className='rounded-lg border bg-muted/30 p-3.5 shadow-xs'>
                                <RadioGroup
                                    aria-label='Absent Leave or LOP Flag'
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    className='flex items-center gap-6'>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='leave' id='absent-leave' />
                                        <Label htmlFor='absent-leave' className='cursor-pointer font-medium text-sm'>
                                            Leave
                                        </Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='lop' id='absent-lop' />
                                        <Label htmlFor='absent-lop' className='cursor-pointer font-medium text-sm'>
                                            LOP
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>
                            {errors.HRLPC_AbsentLeaveFlag?.message && <FormError>{errors.HRLPC_AbsentLeaveFlag.message}</FormError>}
                        </div>
                    )}
                />
            </div>

            <hr className='my-6 border-border' />

            {/* Submit & Cancel Buttons */}
            <div className='flex items-center justify-center gap-4 pt-2'>
                <Button type='submit' disabled={isPending} className='w-fit font-medium shadow-sm'>
                    {isPending ? (
                        <>
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className='mr-2 h-4 w-4' />
                            Save
                        </>
                    )}
                </Button>
                <Button
                    type='button'
                    variant='destructive'
                    onClick={handleClear}
                    disabled={isPending}
                    className='w-fit font-medium shadow-sm'>
                    <RotateCcw className='mr-2 h-4 w-4' />
                    Cancel
                </Button>
            </div>
        </form>
    );
}
