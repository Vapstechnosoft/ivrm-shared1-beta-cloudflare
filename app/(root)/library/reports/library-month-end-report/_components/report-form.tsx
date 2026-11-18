'use client';

import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLibraryMonthEndReportInitialData } from '@/hooks/library/reports/useLibraryMonthEndReport';
import type { ILibraryMonthEndReportRequest } from '@/types/library/reports/library-month-end-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Printer, Search, X } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
    ASMAY_Id: z.preprocess(
        (val) => (val ? Number(val) : 0),
        z.number({ invalid_type_error: 'Select Academic Year' }).min(1, 'Select Academic Year')
    ),
    IVRM_Month_Id: z.preprocess((val) => (val ? Number(val) : 0), z.number({ invalid_type_error: 'Select Month' }).min(1, 'Select Month')),
    LMRA_Id: z.preprocess((val) => (val === '' || val === undefined ? 0 : Number(val)), z.number().optional()),
    IE_Name: z.string().optional(),
    year: z.string().min(1, 'Year is required')
});

interface ReportFormProps {
    onSearch: (data: ILibraryMonthEndReportRequest) => void;
    onPrint?: () => void;
    isLoading: boolean;
}

export const ReportForm = ({ onSearch, onPrint, isLoading }: ReportFormProps) => {
    const { data: monthEndData } = useLibraryMonthEndReportInitialData();
    const initialData = (monthEndData as any)?.data || monthEndData;

    const {
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
        reset
    } = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            LMRA_Id: undefined,
            IE_Name: '',
            year: ''
        }
    });

    const watchAsmayId = watch('ASMAY_Id');

    // Auto-select single items
    useEffect(() => {
        if (Array.isArray(initialData?.acdlist) && initialData.acdlist.length === 1 && !watchAsmayId) {
            const firstAcd = initialData.acdlist[0];
            setValue('ASMAY_Id', firstAcd.asmaY_Id);
            const yearMatch = firstAcd.asmaY_Year?.match(/\d{4}/);
            if (yearMatch) {
                setValue('year', yearMatch[0]);
            }
        }
    }, [initialData, watchAsmayId, setValue]);

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        onSearch({
            ASMAY_Id: values.ASMAY_Id,
            IVRM_Month_Id: values.IVRM_Month_Id,
            year: values.year,
            LMRA_Id: values.LMRA_Id || 0,
            IE_Name: values.IE_Name || ''
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            <div className='mx-auto max-w-2xl space-y-6'>
                    {/* Library Name (if available) */}
                    {Array.isArray(initialData?.msterliblist1) && initialData.msterliblist1.length > 0 && (
                        <div className='flex items-center gap-4'>
                            <Label className='min-w-[150px] text-right font-medium text-sm'>Library Name:</Label>
                            <div className='flex-1'>
                                <Controller
                                    control={control}
                                    name='LMRA_Id'
                                    render={({ field }) => (
                                        <Select
                                            onValueChange={(val) => field.onChange(Number(val))}
                                            value={field.value?.toString()}>
                                            <SelectTrigger className='w-full border-muted-foreground/30'>
                                                <SelectValue placeholder='Select' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {initialData.msterliblist1.map((item: any) => {
                                                    const id =
                                                        item.lmrA_Id ??
                                                        item.lmaL_Id ??
                                                        item.LMRA_Id ??
                                                        item.LMAL_Id ??
                                                        item.id ??
                                                        0;
                                                    const name =
                                                        item.lmaL_LibraryName ??
                                                        item.lmrA_RackName ??
                                                        item.libraryName ??
                                                        item.name ??
                                                        'Library';
                                                    return (
                                                        <SelectItem key={id} value={id.toString()}>
                                                            {name}
                                                        </SelectItem>
                                                    );
                                                })}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                        </div>
                    )}

                    {/* Academic Year */}
                    <div className='flex items-center gap-4'>
                        <Label className='min-w-[150px] text-right font-medium text-sm'>
                            Academic Year:<span className='text-red-500'>*</span>
                        </Label>
                        <div className='flex-1'>
                            <Controller
                                control={control}
                                name='ASMAY_Id'
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(val) => {
                                            field.onChange(Number(val));
                                            const selectedAcd = initialData?.acdlist?.find(
                                                (a: any) => a.asmaY_Id.toString() === val.toString()
                                            );
                                            if (selectedAcd?.asmaY_Year) {
                                                const yearMatch = selectedAcd.asmaY_Year.match(/\d{4}/);
                                                if (yearMatch) {
                                                    setValue('year', yearMatch[0]);
                                                }
                                            }
                                        }}
                                        value={field.value?.toString()}>
                                        <SelectTrigger className='w-full border-muted-foreground/30'>
                                            <SelectValue placeholder='Select' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.isArray(initialData?.acdlist) &&
                                                initialData?.acdlist?.map((item: any) => (
                                                    <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                        {item.asmaY_Year}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.ASMAY_Id && <p className='mt-1 text-destructive text-xs'>{errors.ASMAY_Id.message}</p>}
                        </div>
                    </div>

                    {/* Month */}
                    <div className='flex items-center gap-4'>
                        <Label className='min-w-[150px] text-right font-medium text-sm'>
                            Month:<span className='text-red-500'>*</span>
                        </Label>
                        <div className='flex-1'>
                            <Controller
                                control={control}
                                name='IVRM_Month_Id'
                                render={({ field }) => (
                                    <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                        <SelectTrigger className='w-full border-muted-foreground/30'>
                                            <SelectValue placeholder='Select' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.isArray(initialData?.monthlist) &&
                                                initialData?.monthlist?.map((item: any) => (
                                                    <SelectItem key={item.ivrM_Month_Id} value={item.ivrM_Month_Id.toString()}>
                                                        {item.ivrM_Month_Name}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.IVRM_Month_Id && <p className='mt-1 text-destructive text-xs'>{errors.IVRM_Month_Id.message}</p>}
                        </div>
                    </div>

                    {/* IE (Text Field) */}
                    <div className='flex items-center gap-4'>
                        <Label className='min-w-[150px] text-right font-medium text-sm'>IE:</Label>
                        <div className='flex-1'>
                            <Controller
                                control={control}
                                name='IE_Name'
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        value={field.value ?? ''}
                                        placeholder='Enter IE Name'
                                        className='w-full border-muted-foreground/30'
                                    />
                                )}
                            />
                            {errors.IE_Name && <p className='mt-1 text-destructive text-xs'>{errors.IE_Name.message}</p>}
                        </div>
                    </div>

                    {/* Year */}
                    <div className='flex items-center gap-4'>
                        <Label className='min-w-[150px] text-right font-medium text-sm'>
                            Year:<span className='text-red-500'>*</span>
                        </Label>
                        <div className='flex-1'>
                            <Controller
                                control={control}
                                name='year'
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        value={field.value ?? ''}
                                        placeholder='Enter Year (e.g. 2024)'
                                        className='w-full border-muted-foreground/30'
                                    />
                                )}
                            />
                            {errors.year && <p className='mt-1 text-destructive text-xs'>{errors.year.message}</p>}
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
                    onClick={() => reset()}
                    disabled={isLoading}>
                    <X className='mr-1.5 h-3.5 w-3.5' />
                    CANCEL
                </Button>
                {onPrint && (
                    <Button
                        type='button'
                        className='!w-auto h-9 min-w-[120px] rounded-md bg-[#4251b1] px-6 py-2 font-medium text-white text-xs shadow-sm hover:bg-[#35418e]'
                        onClick={onPrint}
                        disabled={isLoading}>
                        <Printer className='mr-1.5 h-3.5 w-3.5' />
                        PRINT
                    </Button>
                )}
            </div>
        </form>
    );
};
