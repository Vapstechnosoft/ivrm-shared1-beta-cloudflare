'use client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { InputTextarea } from '@/components/ui/extension/input-textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMasterLeave, useSaveMasterLeave } from '@/hooks/hrms/leave-management/useMasters';
import { MASTER_LEAVE_VALIDATION } from '@/lib/validation/hrms-master-validation';
import { Loader2, RotateCcw, Save, X } from 'lucide-react';
import { useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import type { MasterLeave } from './columns';
interface AddMasterLeaveFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
    className?: string;
}
const LEAVE_TYPE_OPTIONS = [
    { value: 'Comp_Off', label: 'Comp Off' },
    { value: 'LWP', label: 'LWP' },
    { value: 'On_Duty', label: 'On Duty' },
    { value: 'Sat_Off', label: 'Sat Off' }
];

export default function AddMasterLeaveForm({ onSuccess, onCancel, className = '' }: AddMasterLeaveFormProps) {
    const { refetchAll } = useMasterLeave();
    const { mutate: saveMasterLeave, isPending } = useSaveMasterLeave();
    const [resetKey, setResetKey] = useState(0);

    const leaveTypeOptions = LEAVE_TYPE_OPTIONS;
    const {
        register,
        handleSubmit,
        control,
        watch: _watch,
        setValue: _setValue,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<MasterLeave>({
        mode: 'onChange',
        defaultValues: {
            hrmL_LeaveName: '',
            hrmL_LeaveCode: '',
            hrmL_LeaveType: '',
            hrmL_LeaveDetails: '',
            hrmL_LeaveCreditFlg: true,
            hrmL_LateDeductFlag: true,
            hrmL_ProbationNotApplicableFlg: false,
            hrmL_LeaveApplyCriteria: '',
            hrmL_DaysForApplyCriteria: '',
            hrmL_MaxDaysForApply: '',
            hrmL_LateDeductOrder: 0,
            isActive: true
        }
    });
    const onSubmit: SubmitHandler<MasterLeave> = async (data) => {
        saveMasterLeave(
            {
                ...data,
                hrmL_LateDeductOrder: data.hrmL_LateDeductOrder || 0
            },
            {
                onSuccess: () => {
                    reset();
                    refetchAll();
                    onSuccess?.();
                }
            }
        );
    };
    const handleReset = () => {
        reset();
        setResetKey((prev) => prev + 1);
    };
    const mastersLoading = isPending || isSubmitting;
    return (
        <div className={`${className}`}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                        <InputText
                            label='Leave Name'
                            placeholder='Enter Leave Name'
                            required
                            id='hrmL_LeaveName'
                            {...register('hrmL_LeaveName', MASTER_LEAVE_VALIDATION.hrmL_LeaveName)}
                            error={errors.hrmL_LeaveName?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <InputText
                            label='Leave Code'
                            placeholder='Enter Leave Code'
                            required
                            id='hrmL_LeaveCode'
                            {...register('hrmL_LeaveCode', MASTER_LEAVE_VALIDATION.hrmL_LeaveCode)}
                            error={errors.hrmL_LeaveCode?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <Controller
                            key={`leaveType-${resetKey}`}
                            name='hrmL_LeaveType'
                            control={control}
                            rules={MASTER_LEAVE_VALIDATION.hrmL_LeaveType}
                            render={({ field }) => (
                                <div>
                                    <label htmlFor='hrmL_LeaveType' className='block font-medium text-sm'>
                                        Leave Type <span className='text-destructive'>*</span>
                                    </label>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger id='hrmL_LeaveType'>
                                            <SelectValue placeholder='Select Leave Type' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {leaveTypeOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.hrmL_LeaveType?.message && (
                                        <p className='mt-1 text-destructive text-xs'>{errors.hrmL_LeaveType.message}</p>
                                    )}
                                </div>
                            )}
                        />
                    </div>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-1'>
                        <InputTextarea
                            label='Leave Details'
                            required
                            id='hrmL_LeaveDetails'
                            {...register('hrmL_LeaveDetails', MASTER_LEAVE_VALIDATION.hrmL_LeaveDetails)}
                            error={errors.hrmL_LeaveDetails?.message}
                            rows={3}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                    </div>
                    {/* Checkboxes for Leave Credit Flag and Late Deduct Flag */}
                    <div className='flex flex-wrap gap-6 pt-1'>
                        <Controller
                            key={`leaveCredit-${resetKey}`}
                            name='hrmL_LeaveCreditFlg'
                            control={control}
                            render={({ field }) => (
                                <div className='flex items-center gap-2'>
                                    <Checkbox id='hrmL_LeaveCreditFlg' checked={Boolean(field.value)} onCheckedChange={field.onChange} />
                                    <label
                                        htmlFor='hrmL_LeaveCreditFlg'
                                        className='cursor-pointer select-none font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                                        Leave Credit
                                    </label>
                                    {errors.hrmL_LeaveCreditFlg?.message && <FormError>{errors.hrmL_LeaveCreditFlg.message}</FormError>}
                                </div>
                            )}
                        />
                        <Controller
                            key={`lateDeduct-${resetKey}`}
                            name='hrmL_LateDeductFlag'
                            control={control}
                            render={({ field }) => (
                                <div className='flex items-center gap-2'>
                                    <Checkbox id='hrmL_LateDeductFlag' checked={Boolean(field.value)} onCheckedChange={field.onChange} />
                                    <label
                                        htmlFor='hrmL_LateDeductFlag'
                                        className='cursor-pointer select-none font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                                        Late Deduct
                                    </label>
                                    {errors.hrmL_LateDeductFlag?.message && <FormError>{errors.hrmL_LateDeductFlag.message}</FormError>}
                                </div>
                            )}
                        />
                    </div>
                </div>

                <div className='flex justify-end gap-2'>
                    {onCancel && (
                        <Button type='button' variant='outline' onClick={onCancel} disabled={isPending || isSubmitting}>
                            <X className='mr-2 h-4 w-4' />
                            CANCEL
                        </Button>
                    )}
                    <Button type='button' variant='outline' onClick={handleReset} disabled={isPending || isSubmitting}>
                        <RotateCcw className='mr-1.5 h-4 w-4' />
                        Reset
                    </Button>
                    {mastersLoading && <Loader2 className='h-4 w-4 animate-spin text-purple-500' />}
                    <Button type='submit' disabled={isPending || isSubmitting}>
                        <Save className='mr-2 h-4 w-4' />
                        {isPending || isSubmitting ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
