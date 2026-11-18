'use client';

import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearList } from '@/hooks/pettycash/report/usePDAReport';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileDown, Printer, RotateCcw, Search } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
    ASMAY_Id: z.string().min(1, { message: 'Academic Year is required' }),
    From_Date: z.date({ required_error: 'Date is required' })
});

export type PDAFormValues = z.infer<typeof formSchema>;

interface PDAReportFormProps {
    onSearch: (values: PDAFormValues) => void;
    onCancel: () => void;
    onExport: () => void;
    onPrint: () => void;
    showReportButtons: boolean;
}

export default function PDAReportForm({ onSearch, onCancel, onExport, onPrint, showReportButtons }: PDAReportFormProps) {
    const { data: yearList } = useAcademicYearList();
    console.log(yearList, 'academic year');

    const {
        control,
        handleSubmit,
        reset,
        setValue,
        getValues,
        formState: { errors }
    } = useForm<PDAFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            ASMAY_Id: '',
            From_Date: undefined
        }
    });

    const yearsRaw = yearList?.data;
    const years: any[] = Array.isArray(yearsRaw) ? yearsRaw : (yearsRaw as any)?.acayyearbind || (yearsRaw as any)?.$values || [];

    function onSubmit(values: PDAFormValues) {
        onSearch(values);
    }

    const handleReset = () => {
        reset({
            ASMAY_Id: '',
            From_Date: undefined
        });
        onCancel();
    };

    return (
        <div className='fade-in mx-auto w-full animate-in space-y-8 rounded-xl border border-purple-100 bg-white p-8 shadow-sm duration-500'>
            <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
                {/* Academic Year */}
                <div className='space-y-3'>
                    <Label className='font-semibold text-purple-900'>
                        Academic Year: <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='ASMAY_Id'
                        control={control}
                        render={({ field }) => (
                            <Select key={field.value} onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger className='w-full'>
                                    <SelectValue placeholder='--Select--' />
                                </SelectTrigger>
                                <SelectContent>
                                    {years?.map((year: any) => (
                                        <SelectItem key={year.asmaY_Id} value={year.asmaY_Id.toString()}>
                                            {year.asmaY_Year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.ASMAY_Id && <span className='font-medium text-red-500 text-xs'>{errors.ASMAY_Id.message}</span>}
                </div>

                {/* From Date */}
                <div className='space-y-3'>
                    <Label className='font-semibold text-purple-900'>
                        Date: <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='From_Date'
                        control={control}
                        render={({ field }) => <DatePicker date={field.value} setDate={field.onChange} placeholder='Select Date' />}
                    />
                    {errors.From_Date && <span className='font-medium text-red-500 text-xs'>{errors.From_Date.message}</span>}
                </div>
            </div>

            {/* Actions */}
            <div className='flex flex-col items-center justify-between gap-6 border-purple-50 border-t pt-4 md:flex-row'>
                <div className='flex items-center gap-4 whitespace-nowrap'>
                    <Button
                        onClick={handleSubmit(onSubmit)}
                        className='h-10 rounded-md bg-gradient-to-r from-orange-600 to-orange-700 px-6 font-bold text-white shadow-md transition-all hover:from-orange-700 hover:to-orange-800 active:scale-95'>
                        <Search className='mr-2 h-4 w-4' />
                        Report
                    </Button>

                    <Button
                        variant='outline'
                        onClick={handleReset}
                        className='h-10 rounded-md border-orange-200 px-6 font-bold text-orange-700 shadow-sm transition-all hover:bg-orange-50'>
                        <RotateCcw className='mr-2 h-4 w-4' />
                        Reset
                    </Button>
                </div>

                {showReportButtons && (
                    <div className='flex flex-wrap items-center gap-3'>
                        <Button
                            type='button'
                            variant='outline'
                            onClick={onExport}
                            className='h-10 w-auto rounded-md border-green-200 bg-white px-6 font-bold text-green-700 text-xs shadow-sm hover:bg-green-50 hover:text-green-800'>
                            <FileDown className='mr-1.5 h-4 w-4' />
                            Export Excel
                        </Button>

                        <Button
                            type='button'
                            variant='outline'
                            onClick={onPrint}
                            className='h-10 w-auto rounded-md border-blue-200 bg-white px-6 font-bold text-blue-700 text-xs shadow-sm hover:bg-blue-50 hover:text-blue-800'>
                            <Printer className='mr-1.5 h-4 w-4' />
                            Print
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
