'use client';

import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { masterTimeSettingSchema } from '@/schemas/hrms/attendance-management-schemas';
import type { IMasterTimeSetting } from '@/types/hrms/attendance-management/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { RefreshCw, Save } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import type { z } from 'zod';
import { TimePicker12Hour } from './time-picker-12hour';

export type MasterTimeSettingFormData = z.infer<typeof masterTimeSettingSchema.addOrUpdate>;

interface MasterTimeSettingFormProps {
    editingData: IMasterTimeSetting | null;
    onSubmit: (data: MasterTimeSettingFormData) => void;
    onCancel: () => void;
}

export function MasterTimeSettingForm({ editingData, onSubmit, onCancel }: MasterTimeSettingFormProps) {
    const {
        handleSubmit,
        reset,
        control,
        formState: { errors, isSubmitting }
    } = useForm<MasterTimeSettingFormData>({
        resolver: zodResolver(masterTimeSettingSchema.addOrUpdate),
        mode: 'onChange',
        defaultValues: editingData
            ? {
                  fomtS_IHalfLoginTime: editingData.fomtS_IHalfLoginTime,
                  fomtS_IhalfLogoutTime: editingData.fomtS_IhalfLogoutTime,
                  fomtS_FDWHrMin: editingData.fomtS_FDWHrMin,
                  fomtS_IIHalfLoginTime: editingData.fomtS_IIHalfLoginTime,
                  fomtS_IIHalfLogoutTime: editingData.fomtS_IIHalfLogoutTime,
                  fomtS_HDWHrMin: editingData.fomtS_HDWHrMin,
                  fomtS_FixTimings: editingData.fomtS_FixTimings,
                  fomtS_DelayPerShiftHrMin: editingData.fomtS_DelayPerShiftHrMin,
                  fomtS_EarlyPerShiftHrMin: editingData.fomtS_EarlyPerShiftHrMin,
                  fomtS_LunchHoursDuration: editingData.fomtS_LunchHoursDuration,
                  fomtS_BlockAttendance: editingData.fomtS_BlockAttendance || '00:00',
                  fomhwD_ActiveFlg: editingData.fomhwD_ActiveFlg
              }
            : {
                  fomtS_IHalfLoginTime: '00:00',
                  fomtS_IhalfLogoutTime: '00:00',
                  fomtS_FDWHrMin: '00:00',
                  fomtS_IIHalfLoginTime: '00:00',
                  fomtS_IIHalfLogoutTime: '00:00',
                  fomtS_HDWHrMin: '00:00',
                  fomtS_FixTimings: '00:00',
                  fomtS_DelayPerShiftHrMin: '00:00',
                  fomtS_EarlyPerShiftHrMin: '00:00',
                  fomtS_LunchHoursDuration: '00:00',
                  fomtS_BlockAttendance: '00:00',
                  fomhwD_ActiveFlg: true
              }
    });

    // Reset form when editing data changes
    useEffect(() => {
        if (editingData) {
            reset({
                fomtS_IHalfLoginTime: editingData.fomtS_IHalfLoginTime,
                fomtS_IhalfLogoutTime: editingData.fomtS_IhalfLogoutTime,
                fomtS_FDWHrMin: editingData.fomtS_FDWHrMin,
                fomtS_IIHalfLoginTime: editingData.fomtS_IIHalfLoginTime,
                fomtS_IIHalfLogoutTime: editingData.fomtS_IIHalfLogoutTime,
                fomtS_HDWHrMin: editingData.fomtS_HDWHrMin,
                fomtS_FixTimings: editingData.fomtS_FixTimings,
                fomtS_DelayPerShiftHrMin: editingData.fomtS_DelayPerShiftHrMin,
                fomtS_EarlyPerShiftHrMin: editingData.fomtS_EarlyPerShiftHrMin,
                fomtS_LunchHoursDuration: editingData.fomtS_LunchHoursDuration,
                fomtS_BlockAttendance: editingData.fomtS_BlockAttendance || '00:00',
                fomhwD_ActiveFlg: editingData.fomhwD_ActiveFlg
            });
        }
    }, [editingData, reset]);

    const handleFormSubmit: SubmitHandler<MasterTimeSettingFormData> = async (data) => {
        onSubmit(data);
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-6'>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                {/* Row 1 */}
                <div className='space-y-2'>
                    <label className='font-medium text-sm'>
                        Morning Login <span className='text-red-500'>*</span>
                    </label>
                    <Controller
                        name='fomtS_IHalfLoginTime'
                        control={control}
                        render={({ field }) => (
                            <TimePicker12Hour
                                value={field.value}
                                onChange={field.onChange}
                                name='fomtS_IHalfLoginTime'
                                required
                                showPeriod={false}
                            />
                        )}
                    />
                    {errors.fomtS_IHalfLoginTime && <FormError>{errors.fomtS_IHalfLoginTime.message}</FormError>}
                </div>

                <div className='space-y-2'>
                    <label className='font-medium text-sm'>
                        Morning Logout <span className='text-red-500'>*</span>
                    </label>
                    <Controller
                        name='fomtS_IhalfLogoutTime'
                        control={control}
                        render={({ field }) => (
                            <TimePicker12Hour
                                value={field.value}
                                onChange={field.onChange}
                                name='fomtS_IhalfLogoutTime'
                                required
                                showPeriod={false}
                            />
                        )}
                    />
                    {errors.fomtS_IhalfLogoutTime && <FormError>{errors.fomtS_IhalfLogoutTime.message}</FormError>}
                </div>

                <div className='space-y-2'>
                    <label className='font-medium text-sm'>
                        Total working hours per shift <span className='text-red-500'>*</span>
                    </label>
                    <Controller
                        name='fomtS_FDWHrMin'
                        control={control}
                        render={({ field }) => (
                            <TimePicker12Hour
                                value={field.value}
                                onChange={field.onChange}
                                name='fomtS_FDWHrMin'
                                required
                                showPeriod={false}
                            />
                        )}
                    />
                    {errors.fomtS_FDWHrMin && <FormError>{errors.fomtS_FDWHrMin.message}</FormError>}
                </div>

                {/* Row 2 */}
                <div className='space-y-2'>
                    <label className='font-medium text-sm'>
                        Afternoon Login <span className='text-red-500'>*</span>
                    </label>
                    <Controller
                        name='fomtS_IIHalfLoginTime'
                        control={control}
                        render={({ field }) => (
                            <TimePicker12Hour
                                value={field.value}
                                onChange={field.onChange}
                                name='fomtS_IIHalfLoginTime'
                                required
                                showPeriod={false}
                            />
                        )}
                    />
                    {errors.fomtS_IIHalfLoginTime && <FormError>{errors.fomtS_IIHalfLoginTime.message}</FormError>}
                </div>

                <div className='space-y-2'>
                    <label className='font-medium text-sm'>
                        Afternoon Logout <span className='text-red-500'>*</span>
                    </label>
                    <Controller
                        name='fomtS_IIHalfLogoutTime'
                        control={control}
                        render={({ field }) => (
                            <TimePicker12Hour
                                value={field.value}
                                onChange={field.onChange}
                                name='fomtS_IIHalfLogoutTime'
                                required
                                showPeriod={false}
                            />
                        )}
                    />
                    {errors.fomtS_IIHalfLogoutTime && <FormError>{errors.fomtS_IIHalfLogoutTime.message}</FormError>}
                </div>

                <div className='space-y-2'>
                    <label className='font-medium text-sm'>
                        Half day working hours per shift <span className='text-red-500'>*</span>
                    </label>
                    <Controller
                        name='fomtS_HDWHrMin'
                        control={control}
                        render={({ field }) => (
                            <TimePicker12Hour
                                value={field.value}
                                onChange={field.onChange}
                                name='fomtS_HDWHrMin'
                                required
                                showPeriod={false}
                            />
                        )}
                    />
                    {errors.fomtS_HDWHrMin && <FormError>{errors.fomtS_HDWHrMin.message}</FormError>}
                </div>

                {/* Row 3 */}
                <div className='space-y-2'>
                    <label className='font-medium text-sm'>
                        Min Time Between Two Punching <span className='text-red-500'>*</span>
                    </label>
                    <Controller
                        name='fomtS_FixTimings'
                        control={control}
                        render={({ field }) => (
                            <TimePicker12Hour
                                value={field.value}
                                onChange={field.onChange}
                                name='fomtS_FixTimings'
                                required
                                showPeriod={false}
                            />
                        )}
                    />
                    {errors.fomtS_FixTimings && <FormError>{errors.fomtS_FixTimings.message}</FormError>}
                </div>

                <div className='space-y-2'>
                    <label className='font-medium text-sm'>
                        Daily per shift <span className='text-red-500'>*</span>
                    </label>
                    <Controller
                        name='fomtS_DelayPerShiftHrMin'
                        control={control}
                        render={({ field }) => (
                            <TimePicker12Hour
                                value={field.value}
                                onChange={field.onChange}
                                name='fomtS_DelayPerShiftHrMin'
                                required
                                showPeriod={false}
                            />
                        )}
                    />
                    {errors.fomtS_DelayPerShiftHrMin && <FormError>{errors.fomtS_DelayPerShiftHrMin.message}</FormError>}
                </div>

                <div className='space-y-2'>
                    <label className='font-medium text-sm'>
                        Early per shift <span className='text-red-500'>*</span>
                    </label>
                    <Controller
                        name='fomtS_EarlyPerShiftHrMin'
                        control={control}
                        render={({ field }) => (
                            <TimePicker12Hour
                                value={field.value}
                                onChange={field.onChange}
                                name='fomtS_EarlyPerShiftHrMin'
                                required
                                showPeriod={false}
                            />
                        )}
                    />
                    {errors.fomtS_EarlyPerShiftHrMin && <FormError>{errors.fomtS_EarlyPerShiftHrMin.message}</FormError>}
                </div>

                {/* Row 4 */}
                <div className='space-y-2'>
                    <label className='font-medium text-sm'>
                        Lunch Hours <span className='text-red-500'>*</span>
                    </label>
                    <Controller
                        name='fomtS_LunchHoursDuration'
                        control={control}
                        render={({ field }) => (
                            <TimePicker12Hour
                                value={field.value}
                                onChange={field.onChange}
                                name='fomtS_LunchHoursDuration'
                                required
                                showPeriod={false}
                            />
                        )}
                    />
                    {errors.fomtS_LunchHoursDuration && <FormError>{errors.fomtS_LunchHoursDuration.message}</FormError>}
                </div>
            </div>

            <div className='flex justify-end gap-4 border-t pt-6'>
                <Button type='button' variant='outline' onClick={onCancel}>
                    <RefreshCw className='mr-2 h-4 w-4' />
                    CANCEL
                </Button>
                <Button type='submit' disabled={isSubmitting}>
                    {isSubmitting ? (
                        <>
                            <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className='mr-2 h-4 w-4' />
                            SAVE
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}
