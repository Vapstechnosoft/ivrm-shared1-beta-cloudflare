'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearList } from '@/hooks/pettycash/report/usePDAReport';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileDown, Printer, RotateCcw, Search } from 'lucide-react';
import { useMemo } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
    ASMAY_Id: z.string().min(1, { message: 'Academic Year is required' }),
    IVRM_Month_Id: z.string().min(1, { message: 'Month is required' }),
    ASMAY_Year: z.string().min(1, { message: 'Year is required' })
});

export type BankCopyFormValues = z.infer<typeof formSchema>;

interface BankCopyReportFormProps {
    onSearch: (values: BankCopyFormValues) => void;
    onCancel: () => void;
    onExport: () => void;
    onPrint: () => void;
    showReportButtons: boolean;
}

const months = [
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

export default function BankCopyReportForm({ onSearch, onCancel, onExport, onPrint, showReportButtons }: BankCopyReportFormProps) {
    const { data: yearList } = useAcademicYearList();

    const {
        control,
        handleSubmit,
        reset,
        setValue,
        getValues,
        formState: { errors }
    } = useForm<BankCopyFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            ASMAY_Id: '',
            IVRM_Month_Id: '',
            ASMAY_Year: ''
        }
    });

    const years = useMemo(() => {
        const raw = yearList?.data;
        if (Array.isArray(raw)) return raw;
        return (raw as any)?.acayyearbind || (raw as any)?.$values || [];
    }, [yearList?.data]);

    const selectedAcademicYearId = useWatch({
        control,
        name: 'ASMAY_Id'
    });

    const splitYears = useMemo(() => {
        if (selectedAcademicYearId && years.length > 0) {
            const selectedYear = years.find((y: any) => y.asmaY_Id.toString() === selectedAcademicYearId);
            if (selectedYear && selectedYear.asmaY_Year) {
                const yearStr = selectedYear.asmaY_Year.toString();
                const s1 = yearStr.substring(0, 4);
                const s2 = yearStr.length > 5 ? yearStr.substring(5, yearStr.length) : '';

                const temp = [{ id: '0', year: s1 }];
                if (s2) {
                    temp.push({ id: '1', year: s2 });
                }
                return temp;
            }
        }
        return [];
    }, [selectedAcademicYearId, years]);

    function onSubmit(values: BankCopyFormValues) {
        onSearch(values);
    }

    const handleReset = () => {
        reset();
        onCancel();
    };

    return (
        <div className='fade-in mx-auto w-full animate-in space-y-8 rounded-xl border border-purple-100 bg-white p-8 shadow-sm duration-500'>
            <div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
                {/* Academic Year */}
                <div className='space-y-3'>
                    <Label className='font-semibold text-purple-900 text-xs'>
                        Academic Year: <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='ASMAY_Id'
                        control={control}
                        render={({ field }) => (
                            <Select
                                key={field.value || 'empty'}
                                onValueChange={(val) => {
                                    field.onChange(val);
                                    setValue('ASMAY_Year', ''); // Reset year when academic year changes
                                }}
                                value={field.value || undefined}>
                                <SelectTrigger className='h-9 w-full text-xs'>
                                    <SelectValue placeholder='Select Academic Year' />
                                </SelectTrigger>
                                <SelectContent>
                                    {years?.map((year: any) => (
                                        <SelectItem key={year.asmaY_Id} value={year.asmaY_Id.toString()} className='text-xs'>
                                            {year.asmaY_Year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.ASMAY_Id && <span className='font-medium text-[10px] text-red-500'>{errors.ASMAY_Id.message}</span>}
                </div>

                {/* Month */}
                <div className='space-y-3'>
                    <Label className='font-semibold text-purple-900 text-xs'>
                        Month: <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='IVRM_Month_Id'
                        control={control}
                        render={({ field }) => (
                            <Select key={field.value || 'empty'} onValueChange={field.onChange} value={field.value || undefined}>
                                <SelectTrigger className='h-9 w-full text-xs'>
                                    <SelectValue placeholder='Select Month' />
                                </SelectTrigger>
                                <SelectContent>
                                    {months.map((mon) => (
                                        <SelectItem key={mon.value} value={mon.value} className='text-xs'>
                                            {mon.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.IVRM_Month_Id && <span className='font-medium text-[10px] text-red-500'>{errors.IVRM_Month_Id.message}</span>}
                </div>

                {/* Year (from Academic Year) */}
                <div className='space-y-3'>
                    <Label className='font-semibold text-purple-900 text-xs'>
                        Year: <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='ASMAY_Year'
                        control={control}
                        render={({ field }) => (
                            <Select key={field.value || 'empty'} onValueChange={field.onChange} value={field.value || undefined}>
                                <SelectTrigger className='h-9 w-full text-xs'>
                                    <SelectValue placeholder='Select Year' />
                                </SelectTrigger>
                                <SelectContent>
                                    {splitYears?.map((y) => (
                                        <SelectItem key={y.id} value={y.year} className='text-xs'>
                                            {y.year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.ASMAY_Year && <span className='font-medium text-[10px] text-red-500'>{errors.ASMAY_Year.message}</span>}
                </div>
            </div>

            {/* Actions */}
            <div className='flex flex-row items-center justify-center gap-4 overflow-x-auto border-purple-50 border-t pt-6'>
                <Button
                    onClick={handleSubmit(onSubmit)}
                    className='h-9 rounded-md bg-gradient-to-r from-orange-500 to-orange-500 px-6 font-bold text-white text-xs uppercase tracking-wider shadow-md transition-all hover:from-orange-700 hover:to-orange-800 active:scale-95'>
                    <Search className='mr-2 h-4 w-4' />
                    Report
                </Button>

                <Button
                    variant='outline'
                    onClick={handleReset}
                    className='h-9 rounded-md border-indigo-200 px-6 font-bold text-indigo-700 text-xs uppercase tracking-wider shadow-sm transition-all hover:bg-indigo-50'>
                    <RotateCcw className='mr-2 h-4 w-4' />
                    Clear
                </Button>

                {showReportButtons && (
                    <>
                        <Button
                            type='button'
                            variant='outline'
                            onClick={onExport}
                            className='h-9 rounded-md border-green-200 bg-white px-6 font-bold text-[10px] text-green-700 uppercase tracking-wider shadow-sm hover:bg-green-50 hover:text-green-800'>
                            <FileDown className='mr-1.5 h-4 w-4' />
                            Export to Excel
                        </Button>

                        <Button
                            type='button'
                            variant='outline'
                            onClick={onPrint}
                            className='h-9 rounded-md border-blue-200 bg-white px-6 font-bold text-[10px] text-blue-700 uppercase tracking-wider shadow-sm hover:bg-blue-50 hover:text-blue-800'>
                            <Printer className='mr-1.5 h-4 w-4' />
                            Print
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}
