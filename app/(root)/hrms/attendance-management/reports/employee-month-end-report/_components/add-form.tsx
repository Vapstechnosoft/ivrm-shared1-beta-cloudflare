'use client';

import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import { getEmployeeMonthEndReport } from '@/server/hrms/hrmsConfig/reports/employee-month-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { Label } from 'react-aria-components';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const employeeMonthReportFilterSchema = z.object({
    year: z.string().min(1, 'Year is required'),
    month: z.string().min(1, 'Month is required'),
    ieName: z.string().min(1, 'IE Name is required')
});

type FormFields = z.infer<typeof employeeMonthReportFilterSchema>;

interface AddEmployeeMonthReportFormProps {
    onSuccess?: (data: any) => void;
    onReset?: () => void;
    className?: string;
}

const MONTHS = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
];

export default function AddEmployeeMonthReportForm({ onSuccess, onReset, className = '' }: AddEmployeeMonthReportFormProps) {
    const { data: academicYears, isLoading: isYearsLoading } = useAcademicYearDropdown();

    const {
        handleSubmit,
        control,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(employeeMonthReportFilterSchema),
        mode: 'onChange',
        defaultValues: {
            year: '',
            month: '',
            ieName: ''
        }
    });

    const onSubmit: SubmitHandler<FormFields> = async (data: FormFields) => {
        try {
            console.log('form data', data);
            const response = await getEmployeeMonthEndReport({
                year: data.year,
                month: Number(data.month)
            });
            console.log('response', response);
            if (response.success) {
                toast.success(response.message || 'Report generated successfully');
                // Pass everything to the parent
                onSuccess?.({
                    ...response.data,
                    meta: {
                        ieName: data.ieName,
                        academicYear: data.year,
                        monthName: MONTHS.find((m) => m.value === data.month)?.label
                    }
                });
            } else {
                toast.error(response.message || 'Failed to generate report');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to generate report');
        }
    };

    const handleReset = () => {
        reset();
        onReset?.();
    };

    return (
        <div className={`${className}`}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='space-y-4'>
                    <div className='rounded-lg bg-white p-6 shadow'>
                        <div className='grid grid-cols-1 items-center gap-10 lg:grid-cols-3'>
                            {/* Academic Year */}
                            <div className='col-span-1'>
                                <Label className='mb-2 block font-medium text-gray-700 text-sm'>
                                    Academic Year <span className='ml-1 text-red-500'>*</span>
                                </Label>
                                <Controller
                                    name='year'
                                    control={control}
                                    render={({ field }) => (
                                        <Select value={field.value || ''} onValueChange={field.onChange} disabled={isYearsLoading}>
                                            <SelectTrigger className={errors.year ? 'border-red-500' : ''}>
                                                <SelectValue placeholder={isYearsLoading ? 'Loading Years...' : 'Select Academic Year'} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {academicYears?.data?.map((year: any) => (
                                                    <SelectItem key={year.asmaY_Id} value={year.asmaY_Year}>
                                                        {year.asmaY_Year}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.year && <FormError>{errors.year.message}</FormError>}
                            </div>

                            {/* Month */}
                            <div className='col-span-1'>
                                <Label className='mb-2 block font-medium text-gray-700 text-sm'>
                                    Month <span className='ml-1 text-red-500'>*</span>
                                </Label>
                                <Controller
                                    name='month'
                                    control={control}
                                    render={({ field }) => (
                                        <Select value={field.value || ''} onValueChange={field.onChange}>
                                            <SelectTrigger className={errors.month ? 'border-red-500' : ''}>
                                                <SelectValue placeholder='Select Month' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {MONTHS.map((m) => (
                                                    <SelectItem key={m.value} value={m.value}>
                                                        {m.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.month && <FormError>{errors.month.message}</FormError>}
                            </div>

                            {/* IE Name */}
                            <div className='col-span-1'>
                                <Label className='mb-2 block font-medium text-gray-700 text-sm'>
                                    IE Name <span className='ml-1 text-red-500'>*</span>
                                </Label>
                                <Controller
                                    name='ieName'
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            type='text'
                                            {...field}
                                            placeholder='Enter IE Name'
                                            className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:font-medium file:text-sm placeholder:text-muted-foreground focus-visible:outline-none ${errors.ieName ? 'border-red-500' : ''}`}
                                        />
                                    )}
                                />
                                {errors.ieName && <FormError>{errors.ieName.message}</FormError>}
                            </div>
                        </div>
                    </div>

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
                            Generate Report
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
