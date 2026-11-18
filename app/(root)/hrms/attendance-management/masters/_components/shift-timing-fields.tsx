'use client';

import { FormError, Label } from '@/components/ui/extension/field';
import { useEffect, useId } from 'react';
import { type Control, Controller, type FieldErrors } from 'react-hook-form';
import { TimePicker12Hour } from '../master-shift/_components/time-picker-12hour';

// Helper function to calculate time difference in HH:mm format
export function calculateTimeDifference(startTime: string, endTime: string): string {
    if (!startTime || !endTime) return '00:00';
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    let diffMinutes = endTotalMinutes - startTotalMinutes;
    if (diffMinutes < 0) {
        diffMinutes += 24 * 60; // Handle next day
    }
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

interface ShiftTimingFieldsProps<T extends Record<string, any>> {
    control: Control<T>;
    errors: FieldErrors<T>;
    watch: (name: keyof T) => any;
    setValue: (name: keyof T, value: any) => void;
    fieldNames: {
        shiftStartTime: keyof T;
        shiftEndTime: keyof T;
        totalWorkingHours: keyof T;
        lunchStartTime: keyof T;
        lunchEndTime: keyof T;
        lunchHours: keyof T;
        earlyPerShift: keyof T;
        delayPerShift: keyof T;
        halfDayWorkingHours: keyof T;
    };
    disabled?: boolean;
}

export function ShiftTimingFields<T extends Record<string, any>>({
    control,
    errors,
    watch,
    setValue,
    fieldNames,
    disabled = false
}: ShiftTimingFieldsProps<T>) {
    const shiftStartTimeId = useId();
    const shiftEndTimeId = useId();
    const totalWorkingHoursId = useId();
    const lunchStartTimeId = useId();
    const lunchEndTimeId = useId();
    const lunchHoursId = useId();
    const earlyPerShiftId = useId();
    const delayPerShiftId = useId();
    const halfDayWorkingHoursId = useId();

    const shiftStartTime = watch(fieldNames.shiftStartTime);
    const shiftEndTime = watch(fieldNames.shiftEndTime);
    const lunchStartTime = watch(fieldNames.lunchStartTime);
    const lunchEndTime = watch(fieldNames.lunchEndTime);

    // Helper to sum minutes from HH:mm
    const getMinutes = (time: string) => {
        if (!time || !time.includes(':')) return 0;
        const [h, m] = time.split(':').map(Number);
        return h * 60 + m;
    };

    // Helper to format minutes to HH:mm
    const formatMinutes = (totalMinutes: number) => {
        const h = Math.floor(totalMinutes / 60);
        const m = totalMinutes % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };

    // Calculate total working hours when start/end times or lunch times change
    useEffect(() => {
        if (shiftStartTime && shiftEndTime) {
            const totalDurationMinutes = getMinutes(calculateTimeDifference(shiftStartTime, shiftEndTime));
            let netWorkingMinutes = totalDurationMinutes;

            if (lunchStartTime && lunchEndTime) {
                const lunchDurationMinutes = getMinutes(calculateTimeDifference(lunchStartTime, lunchEndTime));
                netWorkingMinutes = totalDurationMinutes - lunchDurationMinutes;

                // Update lunch hours field as well
                setValue(fieldNames.lunchHours, formatMinutes(lunchDurationMinutes));
            }

            setValue(fieldNames.totalWorkingHours, formatMinutes(Math.max(0, netWorkingMinutes)));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shiftStartTime, shiftEndTime, lunchStartTime, lunchEndTime]);

    return (
        <div className='space-y-4 rounded-md border border-input bg-background p-4'>
            <h3 className='font-semibold text-sm'>Timing Details</h3>
            {/* First Row: Shift Start Time, Shift End Time, Total working hours per shift */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                <div className='space-y-2'>
                    <Label htmlFor={shiftStartTimeId}>
                        Shift Start Time <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        name={fieldNames.shiftStartTime as any}
                        control={control}
                        render={({ field }) => (
                            <TimePicker12Hour
                                value={field.value}
                                onChange={field.onChange}
                                name={String(fieldNames.shiftStartTime)}
                                showPeriod={false}
                                disabled={disabled}
                            />
                        )}
                    />
                    {errors[fieldNames.shiftStartTime] && <FormError>{(errors[fieldNames.shiftStartTime] as any)?.message}</FormError>}
                </div>
                <div className='space-y-2'>
                    <Label htmlFor={shiftEndTimeId}>
                        Shift End Time <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        name={fieldNames.shiftEndTime as any}
                        control={control}
                        render={({ field }) => (
                            <TimePicker12Hour
                                value={field.value}
                                onChange={field.onChange}
                                name={String(fieldNames.shiftEndTime)}
                                showPeriod={false}
                                disabled={disabled}
                            />
                        )}
                    />
                    {errors[fieldNames.shiftEndTime] && <FormError>{(errors[fieldNames.shiftEndTime] as any)?.message}</FormError>}
                </div>
                <div className='space-y-2'>
                    <Label htmlFor={totalWorkingHoursId}>Total working hours per shift </Label>
                    <Controller
                        name={fieldNames.totalWorkingHours as any}
                        control={control}
                        render={({ field }) => (
                            <TimePicker12Hour
                                value={field.value}
                                onChange={field.onChange}
                                name={String(fieldNames.totalWorkingHours)}
                                disabled={true}
                                showPeriod={false}
                            />
                        )}
                    />
                </div>
            </div>
            {/* Second Row: Lunch start time, Lunch End time, Lunch Hours */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                <div className='space-y-2'>
                    <Label htmlFor={lunchStartTimeId}>
                        Lunch start time <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        name={fieldNames.lunchStartTime as any}
                        control={control}
                        render={({ field }) => (
                            <TimePicker12Hour
                                value={field.value}
                                onChange={field.onChange}
                                name={String(fieldNames.lunchStartTime)}
                                showPeriod={false}
                                disabled={disabled}
                            />
                        )}
                    />
                    {errors[fieldNames.lunchStartTime] && <FormError>{(errors[fieldNames.lunchStartTime] as any)?.message}</FormError>}
                </div>
                <div className='space-y-2'>
                    <Label htmlFor={lunchEndTimeId}>
                        Lunch End time <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        name={fieldNames.lunchEndTime as any}
                        control={control}
                        render={({ field }) => (
                            <TimePicker12Hour
                                value={field.value}
                                onChange={field.onChange}
                                name={String(fieldNames.lunchEndTime)}
                                showPeriod={false}
                                disabled={disabled}
                            />
                        )}
                    />
                    {errors[fieldNames.lunchEndTime] && <FormError>{(errors[fieldNames.lunchEndTime] as any)?.message}</FormError>}
                </div>
                <div className='space-y-2'>
                    <Label htmlFor={lunchHoursId}>
                        Lunch Hours <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        name={fieldNames.lunchHours as any}
                        control={control}
                        render={({ field }) => (
                            <TimePicker12Hour
                                value={field.value}
                                onChange={field.onChange}
                                name={String(fieldNames.lunchHours)}
                                disabled={true}
                                showPeriod={false}
                            />
                        )}
                    />
                    {errors[fieldNames.lunchHours] && <FormError>{(errors[fieldNames.lunchHours] as any)?.message}</FormError>}
                </div>
            </div>
            {/* Third Row: Early per shift, Delay per shift, Half day working hours per shift */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                <div className='space-y-2'>
                    <Label htmlFor={earlyPerShiftId}>
                        Early per shift <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        name={fieldNames.earlyPerShift as any}
                        control={control}
                        render={({ field }) => (
                            <TimePicker12Hour
                                value={field.value}
                                onChange={field.onChange}
                                name={String(fieldNames.earlyPerShift)}
                                showPeriod={false}
                                disabled={disabled}
                            />
                        )}
                    />
                    {errors[fieldNames.earlyPerShift] && <FormError>{(errors[fieldNames.earlyPerShift] as any)?.message}</FormError>}
                </div>
                <div className='space-y-2'>
                    <Label htmlFor={delayPerShiftId}>
                        Delay per shift <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        name={fieldNames.delayPerShift as any}
                        control={control}
                        render={({ field }) => (
                            <TimePicker12Hour
                                value={field.value}
                                onChange={field.onChange}
                                name={String(fieldNames.delayPerShift)}
                                showPeriod={false}
                                disabled={disabled}
                            />
                        )}
                    />
                    {errors[fieldNames.delayPerShift] && <FormError>{(errors[fieldNames.delayPerShift] as any)?.message}</FormError>}
                </div>
                <div className='space-y-2'>
                    <Label htmlFor={halfDayWorkingHoursId}>
                        Half day working hours per shift <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        name={fieldNames.halfDayWorkingHours as any}
                        control={control}
                        render={({ field }) => (
                            <TimePicker12Hour
                                value={field.value}
                                onChange={field.onChange}
                                name={String(fieldNames.halfDayWorkingHours)}
                                showPeriod={false}
                                disabled={disabled}
                            />
                        )}
                    />
                    {errors[fieldNames.halfDayWorkingHours] && (
                        <FormError>{(errors[fieldNames.halfDayWorkingHours] as any)?.message}</FormError>
                    )}
                </div>
            </div>
        </div>
    );
}
