'use client';

import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    type CollegeOverallDailyAttendanceFormData,
    collegeOverallDailyAttendanceSchema
} from '@/schemas/college/college-overall-daily-attendance-report.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileSpreadsheet, FileText, Loader2, RotateCcw } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

interface AcademicYearItem {
    asmaY_Id: number;
    asmaY_Year: string;
    Selected?: boolean;
}

interface FilterFormProps {
    academicYears: AcademicYearItem[];
    defaultYearId?: number;
    onSubmit: (values: CollegeOverallDailyAttendanceFormData) => void;
    onReset: () => void;
    onExport: () => void;
    isGenerating: boolean;
    hasReportData: boolean;
}

export function FilterForm({ academicYears, defaultYearId, onSubmit, onReset, onExport, isGenerating, hasReportData }: FilterFormProps) {
    const form = useForm<CollegeOverallDailyAttendanceFormData>({
        resolver: zodResolver(collegeOverallDailyAttendanceSchema),
        defaultValues: {
            asmaY_Id: defaultYearId || 0,
            fromdate: new Date()
        }
    });

    const { handleSubmit, reset, setValue } = form;

    // Synchronize default year if provided and not yet set
    useEffect(() => {
        if (defaultYearId && defaultYearId > 0) {
            setValue('asmaY_Id', defaultYearId);
        }
    }, [defaultYearId, setValue]);

    const handleFormReset = () => {
        reset({
            asmaY_Id: defaultYearId || 0,
            fromdate: new Date()
        });
        onReset();
    };

    return (
        <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2'>
                    {/* Academic Year */}
                    <FormField
                        control={form.control}
                        name='asmaY_Id'
                        render={({ field }) => (
                            <FormItem className='space-y-1.5'>
                                <FormLabel className='flex items-center gap-1 font-semibold text-slate-700 text-sm'>
                                    Academic Year <span className='text-rose-500'>*</span>
                                </FormLabel>
                                <Select value={field.value ? String(field.value) : ''} onValueChange={(val) => field.onChange(Number(val))}>
                                    <FormControl>
                                        <SelectTrigger className='h-10 rounded-xl border-slate-200 bg-white shadow-sm focus:ring-2 focus:ring-primary/20'>
                                            <SelectValue placeholder='Select Academic Year' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className='max-h-60 rounded-xl'>
                                        {academicYears?.map((year) => (
                                            <SelectItem key={year.asmaY_Id} value={String(year.asmaY_Id)} className='cursor-pointer'>
                                                {year.asmaY_Year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage className='font-medium text-rose-500 text-xs' />
                            </FormItem>
                        )}
                    />

                    {/* Date */}
                    <FormField
                        control={form.control}
                        name='fromdate'
                        render={({ field }) => (
                            <FormItem className='space-y-1.5'>
                                <FormLabel className='flex items-center gap-1 font-semibold text-slate-700 text-sm'>
                                    Date <span className='text-rose-500'>*</span>
                                </FormLabel>
                                <FormControl>
                                    <DatePicker
                                        date={field.value}
                                        setDate={(date) => field.onChange(date || new Date())}
                                        placeholder='Pick a date'
                                        className='h-10 rounded-xl border-slate-200 bg-white shadow-sm focus:ring-2 focus:ring-primary/20'
                                    />
                                </FormControl>
                                <FormMessage className='font-medium text-rose-500 text-xs' />
                            </FormItem>
                        )}
                    />
                </div>

                <div className='border-slate-200/80 border-t pt-5'>
                    <div className='flex flex-wrap items-center justify-center gap-3'>
                        {/* Report (Submit) */}
                        <Button
                            type='submit'
                            disabled={isGenerating}
                            className='flex h-10 items-center gap-2 rounded-xl bg-primary px-6 font-semibold text-white shadow-md transition-all hover:scale-[1.02] hover:bg-primary/90 active:scale-[0.98]'>
                            {isGenerating ? (
                                <>
                                    <Loader2 className='h-4 w-4 animate-spin' />
                                    Loading Report...
                                </>
                            ) : (
                                <>
                                    <FileText className='h-4 w-4' />
                                    Report
                                </>
                            )}
                        </Button>

                        {/* Cancel / Reset */}
                        <Button
                            type='button'
                            variant='destructive'
                            onClick={handleFormReset}
                            disabled={isGenerating}
                            className='flex h-10 items-center gap-2 rounded-xl px-6 font-semibold shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]'>
                            <RotateCcw className='h-4 w-4' />
                            Cancel
                        </Button>

                        {/* Export to Excel */}
                        {hasReportData && (
                            <Button
                                type='button'
                                variant='outline'
                                onClick={onExport}
                                className='flex h-10 items-center gap-2 rounded-xl border-emerald-600 px-6 font-semibold text-emerald-700 shadow-sm transition-all hover:scale-[1.02] hover:bg-emerald-50 hover:text-emerald-800 active:scale-[0.98]'>
                                <FileSpreadsheet className='h-4 w-4 text-emerald-600' />
                                Export
                            </Button>
                        )}
                    </div>
                </div>
            </form>
        </Form>
    );
}
