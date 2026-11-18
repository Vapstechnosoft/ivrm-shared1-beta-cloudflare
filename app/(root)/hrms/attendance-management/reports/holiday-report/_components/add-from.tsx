'use client';

import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEmployeeShiftMappingHolidayTypes } from '@/hooks/hrms/attendance-management/useMasters';
import { useLeaveYearDropdown } from '@/hooks/hrms/useMasters';
import { holidayReportFilterSchema } from '@/schemas/hrms/attendance-management-schemas';
import { getHolidayReport } from '@/server/hrms/hrmsConfig/reports/holiday-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Label } from 'react-aria-components';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof holidayReportFilterSchema>;

interface AddHolidayReportFormProps {
    onSuccess?: () => void;
    className?: string;
    onReportData?: (data: any[]) => void;
    onReset?: () => void;
}

export default function AddHolidayReportForm({ onSuccess, className = '', onReportData, onReset }: AddHolidayReportFormProps) {
    const { data: leaveYearData, isLoading: isLeaveYearLoading } = useLeaveYearDropdown();
    const {
        data: holidayTypeData,
        error: holidayTypeError,
        status: holidayTypeStatus,
        isLoading: isHolidayTypeLoading
    } = useEmployeeShiftMappingHolidayTypes();

    useEffect(() => {
        if (holidayTypeStatus === 'error') {
            console.error('❌ [HOLIDAY TYPE ERROR]:', holidayTypeError);
        }
    }, [holidayTypeError, holidayTypeStatus]);

    const leaveYearOptions = useMemo(() => {
        const rawData = leaveYearData as any;
        if (!rawData) return [];
        const list = Array.isArray(rawData) ? rawData : Array.isArray(rawData.data) ? rawData.data : [];

        return list.map((year: any) => ({
            label: year.hrmlY_LeaveYear || '',
            value: String(year.hrmlY_Id || '')
        }));
    }, [leaveYearData]);

    const holidayTypeOptions = useMemo(() => {
        const rawData = holidayTypeData as any;
        if (!rawData) return [];

        let list = [];
        if (Array.isArray(rawData)) {
            list = rawData;
        } else if (rawData.data && Array.isArray(rawData.data)) {
            list = rawData.data;
        } else if (rawData.data && rawData.data.$values && Array.isArray(rawData.data.$values)) {
            list = rawData.data.$values;
        } else if (rawData.$values && Array.isArray(rawData.$values)) {
            list = rawData.$values;
        }

        return list
            .map((type: any) => ({
                label: type.value || type.Value || '',
                value: String(type.key || type.Key || '')
            }))
            .filter((opt: any) => opt.value && opt.value !== 'undefined');
    }, [holidayTypeData]);

    const {
        handleSubmit,
        control,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(holidayReportFilterSchema),
        mode: 'onChange',
        defaultValues: {
            hrmlY_Id: '',
            fohwdT_Id: ''
        }
    });

    // incrementing this key forces the Select components to remount and show placeholder
    const [resetKey, setResetKey] = useState(0);

    const onSubmit: SubmitHandler<FormFields> = async (data: FormFields) => {
        try {
            const response = await getHolidayReport(Number(data.hrmlY_Id), Number(data.fohwdT_Id));

            if (response.success) {
                const raw = response?.data;
                const dataArray = Array.isArray(raw) ? raw : (raw?.$values ?? []);

                if (dataArray.length === 0) {
                    toast.warning('No data found for the selected criteria.');
                    onReportData?.([]);
                    return;
                }

                onReportData?.(dataArray);
                toast.success(response.message || 'Report generated successfully');
                reset();
                onSuccess?.();
            } else {
                toast.error(response.message || 'Failed to generate report');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to generate report');
        }
    };

    const handleReset = () => {
        reset({ hrmlY_Id: '', fohwdT_Id: '' });
        setResetKey((k) => k + 1); // force Select remount to show placeholder
        onReset?.();
    };

    return (
        <div className={`${className}`}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='space-y-4'>
                    <div className='rounded-lg bg-white p-6 shadow'>
                        <div className='grid grid-cols-1 items-center gap-10 lg:grid-cols-3'>
                            {/* Calendar Year */}
                            <div className='col-span-1'>
                                <Label className='mb-2 block font-medium text-gray-700 text-sm'>
                                    Calendar Year <span className='ml-1 text-red-500'>*</span>
                                </Label>
                                <Controller
                                    key={`year-${resetKey}`}
                                    name='hrmlY_Id'
                                    control={control}
                                    render={({ field }) => (
                                        <Select value={field.value || undefined} onValueChange={field.onChange}>
                                            <SelectTrigger
                                                className={errors.hrmlY_Id ? 'border-red-500' : ''}
                                                disabled={isLeaveYearLoading || leaveYearOptions.length === 0}>
                                                <SelectValue placeholder={isLeaveYearLoading ? 'Loading...' : 'Select Calendar Year'} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {leaveYearOptions.map((opt: any) => (
                                                    <SelectItem key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.hrmlY_Id && <FormError>{errors.hrmlY_Id.message}</FormError>}
                            </div>

                            {/* Holiday Type */}
                            <div className='col-span-1'>
                                <Label className='mb-2 block font-medium text-gray-700 text-sm'>
                                    Holiday Type <span className='ml-1 text-red-500'>*</span>
                                </Label>
                                <Controller
                                    key={`type-${resetKey}`}
                                    name='fohwdT_Id'
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            value={field.value || undefined}
                                            onValueChange={field.onChange}
                                            disabled={isHolidayTypeLoading || holidayTypeOptions.length === 0}>
                                            <SelectTrigger className={errors.fohwdT_Id ? 'border-red-500' : ''}>
                                                <SelectValue placeholder={isHolidayTypeLoading ? 'Loading...' : 'Select Holiday Type'} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {holidayTypeOptions.map((type: any) => (
                                                    <SelectItem key={type.value} value={type.value}>
                                                        {type.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.fohwdT_Id && <FormError>{errors.fohwdT_Id.message}</FormError>}
                            </div>
                        </div>
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
                        loadingText='Searching...'>
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' />
                            Search
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
