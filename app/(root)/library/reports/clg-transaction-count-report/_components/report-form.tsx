'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCLGTransactionCountReportInitialData } from '@/hooks/library/reports/useCLGTransactionCountReport';
import type { ICLGTransactionCountReportRequest } from '@/types/library/reports/clg-transaction-count-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { FileSpreadsheet, Loader2, Printer, Search, X } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
    lmaL_Id: z.coerce
        .number({
            required_error: 'Select Library',
            invalid_type_error: 'Select Library'
        })
        .min(1, 'Select Library'),
    asmaY_Id: z.coerce
        .number({
            required_error: 'Select Academic Year',
            invalid_type_error: 'Select Academic Year'
        })
        .min(1, 'Select Academic Year'),
    statuscount: z.boolean().default(false),
    issue_Date: z.date({ required_error: 'From Date is required' }),
    issueToDate: z.date({ required_error: 'To Date is required' }),
    type: z.string().default('Student')
});

interface ReportFormProps {
    onSearch: (data: ICLGTransactionCountReportRequest) => void;
    isLoading: boolean;
    onPrint?: () => void;
    onExport?: () => void;
    onCancel?: () => void;
    hasData: boolean;
}

export const ReportForm = ({ onSearch, isLoading, onPrint, onExport, onCancel, hasData }: ReportFormProps) => {
    const { data: initialDataWrapper } = useCLGTransactionCountReportInitialData();
    const initialData = (initialDataWrapper as any)?.data || initialDataWrapper;

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            statuscount: false
        }
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        onSearch({
            ...values,
            issue_Date: format(values.issue_Date, "yyyy-MM-dd'T'HH:mm:ss"),
            issueToDate: format(values.issueToDate, "yyyy-MM-dd'T'HH:mm:ss")
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            {/* Main Selection Row */}
            <div className='mx-auto max-w-2xl space-y-4'>
                    {/* Library Name */}
                    <div className='flex items-center gap-4'>
                        <Label className='min-w-[150px] text-right font-medium text-sm'>
                            Library Name:<span className='text-red-500'>*</span>
                        </Label>
                        <div className='flex-1'>
                            <Controller
                                control={control}
                                name='lmaL_Id'
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value?.toString()}>
                                        <SelectTrigger className='w-full border-muted-foreground/30'>
                                            <SelectValue placeholder='Select' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.isArray(initialData?.msterliblist1) &&
                                                initialData?.msterliblist1?.map((item: any) => (
                                                    <SelectItem key={item.lmaL_Id} value={item.lmaL_Id.toString()}>
                                                        {item.lmaL_LibraryName}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.lmaL_Id && <p className='mt-1 text-destructive text-xs'>{errors.lmaL_Id.message}</p>}
                        </div>
                    </div>

                    {/* Academic Year */}
                    <div className='flex items-center gap-4'>
                        <Label className='min-w-[150px] text-right font-medium text-sm'>
                            Academic Year:<span className='text-red-500'>*</span>
                        </Label>
                        <div className='flex-1'>
                            <Controller
                                control={control}
                                name='asmaY_Id'
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value?.toString()}>
                                        <SelectTrigger className='w-full border-muted-foreground/30'>
                                            <SelectValue placeholder='Select' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.isArray(initialData?.yearlist) &&
                                                initialData?.yearlist?.map((item: any) => (
                                                    <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                        {item.asmaY_Year}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.asmaY_Id && <p className='mt-1 text-destructive text-xs'>{errors.asmaY_Id.message}</p>}
                        </div>
                    </div>

                    {/* Status Count Checkbox */}
                    <div className='flex items-center gap-4'>
                        <div className='min-w-[150px]' />
                        <div className='flex flex-1 items-center space-x-2 pt-1'>
                            <Controller
                                control={control}
                                name='statuscount'
                                render={({ field }) => (
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} id='status-count-checkbox' />
                                )}
                            />
                            <Label htmlFor='status-count-checkbox' className='cursor-pointer font-normal'>
                                Status Count
                            </Label>
                        </div>
                    </div>
                </div>

            {/* Date Selection Section */}
            <div className='mx-auto mt-8 w-full max-w-4xl'>
                <Label className='mb-4 block font-semibold text-[#4251b1] text-xs uppercase tracking-wider'>Issue Date Between :-</Label>
                <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
                    {/* From Date */}
                    <div className='flex items-center gap-4'>
                        <Label className='min-w-[100px] text-right font-medium text-sm'>
                            From Date <span className='text-red-500'>*</span>
                        </Label>
                        <div className='flex-1'>
                            <Controller
                                control={control}
                                name='issue_Date'
                                render={({ field }) => (
                                    <DatePicker
                                        date={field.value}
                                        setDate={field.onChange}
                                        placeholder='Enter From date'
                                        disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                                    />
                                )}
                            />
                            {errors.issue_Date && <p className='mt-1 text-destructive text-xs'>{errors.issue_Date.message}</p>}
                        </div>
                    </div>

                    {/* To Date */}
                    <div className='flex items-center gap-4'>
                        <Label className='min-w-[100px] text-right font-medium text-sm'>
                            To Date <span className='text-red-500'>*</span>
                        </Label>
                        <div className='flex-1'>
                            <Controller
                                control={control}
                                name='issueToDate'
                                render={({ field }) => (
                                    <DatePicker
                                        date={field.value}
                                        setDate={field.onChange}
                                        placeholder='Enter To date'
                                        disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                                    />
                                )}
                            />
                            {errors.issueToDate && <p className='mt-1 text-destructive text-xs'>{errors.issueToDate.message}</p>}
                        </div>
                    </div>
                </div>
            </div>

            <hr className='my-6 border-muted-foreground/20' />

            {/* Action Buttons */}
            <div className='flex items-center justify-center gap-4'>
                <Button
                    type='submit'
                    className='!w-auto h-9 min-w-[120px] rounded-md bg-[#4251b1] px-6 py-2 font-medium text-white text-xs shadow-sm hover:bg-[#35418e]'
                    disabled={isLoading}>
                    {isLoading ? <Loader2 className='mr-1.5 h-3.5 w-3.5 animate-spin' /> : <Search className='mr-1.5 h-3.5 w-3.5' />}
                    REPORT
                </Button>
                <Button
                    type='button'
                    className='!w-auto h-9 min-w-[120px] rounded-md bg-[#ff5a30] px-6 py-2 font-medium text-white text-xs shadow-sm hover:bg-[#e64d26]'
                    onClick={() => {
                        reset();
                        onCancel?.();
                    }}
                    disabled={isLoading}>
                    <X className='mr-1.5 h-3.5 w-3.5' />
                    CANCEL
                </Button>

                {hasData && (
                    <>
                        <Button
                            type='button'
                            onClick={onPrint}
                            className='!w-auto h-9 min-w-[120px] rounded-md bg-[#4251b1] px-6 py-2 font-medium text-white text-xs shadow-sm hover:bg-[#35418e]'>
                            <Printer className='mr-1.5 h-3.5 w-3.5' />
                            PRINT
                        </Button>
                        <Button
                            type='button'
                            onClick={onExport}
                            className='!w-auto h-9 min-w-[140px] rounded-md bg-[#4251b1] px-6 py-2 font-medium text-white text-xs shadow-sm hover:bg-[#35418e]'>
                            <FileSpreadsheet className='mr-1.5 h-3.5 w-3.5' />
                            EXPORT TO EXCEL
                        </Button>
                    </>
                )}
            </div>
        </form>
    );
};
