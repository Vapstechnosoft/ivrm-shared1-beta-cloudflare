'use client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { InputTextarea } from '@/components/ui/extension/input-textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMasterLeave, useMasterLeaveForEdit, useUpdateMasterLeave } from '@/hooks/hrms/leave-management/useMasters';
import { MASTER_LEAVE_VALIDATION } from '@/lib/validation/hrms-master-validation';
import { Loader2, Save, X } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import type { MasterLeave } from './columns';

interface UpdateMasterLeaveFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
    className?: string;
    selectedRow: MasterLeave;
}

const LEAVE_TYPE_OPTIONS = [
    { value: 'Comp_Off', label: 'Comp Off' },
    { value: 'LWP', label: 'LWP' },
    { value: 'On_Duty', label: 'On Duty' },
    { value: 'Sat_Off', label: 'Sat Off' }
];

export default function UpdateMasterLeaveForm({ onSuccess, onCancel, className = '', selectedRow: row }: UpdateMasterLeaveFormProps) {
    const { refetchAll } = useMasterLeave();
    const { mutate: updateMasterLeave, isPending } = useUpdateMasterLeave();

    // Fetch fresh data for editing
    const { data: editDataResponse, isLoading: isLoadingEditData } = useMasterLeaveForEdit(row.id);
    const freshData = editDataResponse?.data;

    const leaveTypeOptions = LEAVE_TYPE_OPTIONS;

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<MasterLeave>({
        mode: 'onChange'
    });

    useEffect(() => {
        if (freshData) {
            console.log('🔄 [UpdateForm] Fresh Data:', freshData);
            reset({
                hrmL_LeaveName: freshData.hrmL_LeaveName || '',
                hrmL_LeaveCode: freshData.hrmL_LeaveCode || '',
                hrmL_LeaveType: String(freshData.hrmL_LeaveType || ''),
                hrmL_LeaveDetails: freshData.hrmL_LeaveDetails || '',
                hrmL_LeaveCreditFlg: !!freshData.hrmL_LeaveCreditFlg,
                hrmL_LateDeductFlag: !!freshData.hrmL_LateDeductFlag
                // hrmL_ProbationNotApplicableFlg: !!freshData.hrmL_ProbationNotApplicableFlg,
                // hrmL_LeaveApplyCriteria: String(freshData.hrmL_LeaveApplyCriteria || ''),
                // hrmL_DaysForApplyCriteria: String(freshData.hrmL_DaysForApplyCriteria || ''),
                // hrmL_MaxDaysForApply: String(freshData.hrmL_MaxDaysForApply || ''),
                // hrmL_LateDeductOrder: Number(freshData.hrmL_LateDeductOrder || 0),
                // isActive: !!freshData.isActive
            });
        }
    }, [freshData, reset]);

    if (isLoadingEditData) {
        return (
            <div className='flex h-40 items-center justify-center space-x-2 text-muted-foreground'>
                <Loader2 className='h-5 w-5 animate-spin' />
                <span>Loading leave details...</span>
            </div>
        );
    }
    const onSubmit: SubmitHandler<MasterLeave> = async (data) => {
        updateMasterLeave(
            {
                ...data,
                id: row.id,
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
    };
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
                            name='hrmL_LeaveType'
                            control={control}
                            rules={MASTER_LEAVE_VALIDATION.hrmL_LeaveType}
                            render={({ field }) => (
                                <div>
                                    <label htmlFor='hrmL_LeaveType' className='mb-2 block font-medium text-sm'>
                                        Leave Type <span className='text-red-500'>*</span>
                                    </label>
                                    <Select value={field.value} onValueChange={field.onChange} key={`type-${row.id}-${field.value}`}>
                                        <SelectTrigger id='hrmL_LeaveType' className={errors.hrmL_LeaveType ? 'border-red-500' : ''}>
                                            <SelectValue placeholder='Select Leave Type' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {leaveTypeOptions.length > 0 ? (
                                                leaveTypeOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <div className='px-2 py-1.5 text-muted-foreground text-sm'>No options available</div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {errors.hrmL_LeaveType && <FormError>{errors.hrmL_LeaveType.message}</FormError>}
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
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
                        <div className='flex items-center space-x-2'>
                            <Controller
                                name='hrmL_LeaveCreditFlg'
                                control={control}
                                render={({ field }) => (
                                    <Checkbox id='hrmL_LeaveCreditFlg' checked={field.value} onCheckedChange={field.onChange} />
                                )}
                            />
                            <label htmlFor='hrmL_LeaveCreditFlg' className='font-medium text-sm'>
                                Leave Credit
                            </label>
                        </div>
                        <div className='flex items-center space-x-2'>
                            <Controller
                                name='hrmL_LateDeductFlag'
                                control={control}
                                render={({ field }) => (
                                    <Checkbox id='hrmL_LateDeductFlag' checked={field.value} onCheckedChange={field.onChange} />
                                )}
                            />
                            <label htmlFor='hrmL_LateDeductFlag' className='font-medium text-sm'>
                                Late Deduct
                            </label>
                        </div>
                        {/* <InputText
                            label='Leave Order'
                            id='hrmL_LateDeductOrder'
                            type='number'
                            {...register('hrmL_LateDeductOrder', { valueAsNumber: true })}
                            error={errors.hrmL_LateDeductOrder?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        /> */}
                    </div>
                    {/* <div className='grid grid-cols-1 gap-4 border-t pt-4 md:grid-cols-3'>
                        <Controller
                            name='hrmL_LeaveApplyCriteria'
                            control={control}
                            rules={MASTER_LEAVE_VALIDATION.hrmL_LeaveApplyCriteria}
                            render={({ field }) => (
                                <div>
                                    <label htmlFor='hrmL_LeaveApplyCriteria' className='mb-2 block font-medium text-sm'>
                                        Apply Criteria <span className='text-red-500'>*</span>
                                    </label>
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        key={`criteria-${row.id}-${field.value}`}
                                    >
                                        <SelectTrigger
                                            id='hrmL_LeaveApplyCriteria'
                                            className={errors.hrmL_LeaveApplyCriteria ? 'border-red-500' : ''}>
                                            <SelectValue placeholder='Select Criteria' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='Before'>Before</SelectItem>
                                            <SelectItem value='After'>After</SelectItem>
                                            <SelectItem value='Same Day'>Same Day</SelectItem>
                                            <SelectItem value='Month'>Month</SelectItem>
                                            <SelectItem value='Quarter'>Quarter</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.hrmL_LeaveApplyCriteria && <FormError>{errors.hrmL_LeaveApplyCriteria.message}</FormError>}
                                </div>
                            )}
                        />
                        <InputText
                            label='Days for Criteria'
                            id='hrmL_DaysForApplyCriteria'
                            {...register('hrmL_DaysForApplyCriteria', MASTER_LEAVE_VALIDATION.hrmL_DaysForApplyCriteria)}
                            error={errors.hrmL_DaysForApplyCriteria?.message}
                            placeholder='Enter days'
                            type='number'
                        />
                        <InputText
                            label='Max Days for Apply'
                            id='hrmL_MaxDaysForApply'
                            {...register('hrmL_MaxDaysForApply', MASTER_LEAVE_VALIDATION.hrmL_MaxDaysForApply)}
                            error={errors.hrmL_MaxDaysForApply?.message}
                            placeholder='Enter max days'
                            type='number'
                        />
                    </div> */}
                </div>
                <div className='flex justify-end gap-2'>
                    {onCancel && (
                        <Button type='button' variant='outline' onClick={onCancel} disabled={isPending || isSubmitting}>
                            <X className='mr-2 h-4 w-4' />
                            CANCEL
                        </Button>
                    )}
                    <Button type='button' variant='outline' onClick={handleReset} disabled={isPending || isSubmitting}>
                        Reset
                    </Button>
                    <Button type='submit' disabled={isPending || isSubmitting}>
                        <Save className='mr-2 h-4 w-4' />
                        {isPending || isSubmitting ? 'Updating...' : 'Update'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
