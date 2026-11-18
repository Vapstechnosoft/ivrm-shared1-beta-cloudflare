'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLibLostBookReportInitialData } from '@/hooks/library/reports/useLibLostBookReport';
import type { ILibLostBookReportRequest } from '@/types/library/reports/lib-lost-book-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Search, X } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z
    .object({
        lmaL_Id: z.preprocess((val) => Number(val), z.number().min(1, 'Library Name is required')),
        bnbFlg: z.enum(['Book', 'Non-Book', 'ALL']),
        bookType: z.enum(['Issue', 'Reference']),
        datewised: z.boolean().default(false),
        fromdate: z.date().optional(),
        toDate: z.date().optional()
    })
    .refine(
        (data) => {
            if (data.datewised) {
                return !!data.fromdate && !!data.toDate;
            }
            return true;
        },
        {
            message: 'Both dates are required when date range is enabled',
            path: ['fromdate']
        }
    );

interface ReportFormProps {
    onSearch: (data: ILibLostBookReportRequest) => void;
    isLoading: boolean;
}

export const ReportForm = ({ onSearch, isLoading }: ReportFormProps) => {
    const { data: initialData, isLoading: isInitialLoading } = useLibLostBookReportInitialData();

    const {
        control,
        handleSubmit,
        watch,
        formState: { errors },
        reset,
        setValue
    } = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            bnbFlg: 'Book',
            bookType: 'Issue',
            datewised: false
        }
    });

    const isDateEnabled = watch('datewised');

    // Auto-select library if only one is available or to show the first one by default
    useEffect(() => {
        if (initialData && initialData.length > 0) {
            const currentLmaLId = watch('lmaL_Id');
            if (!currentLmaLId) {
                setValue('lmaL_Id', initialData[0].lmaL_Id);
            }
        }
    }, [initialData, setValue, watch]);

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        onSearch({
            MI_Id: 30, // Using the provided MI_Id
            p_booktype: values.bookType,
            p_bnbflg: values.bnbFlg,
            p_fromdate: values.fromdate ? values.fromdate.toISOString() : '',
            p_todate: values.toDate ? values.toDate.toISOString() : '',
            p_lmal_id: values.lmaL_Id
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='mx-auto max-w-3xl space-y-6 rounded-lg border bg-white p-6 shadow-sm'>
            {/* Library Name */}
            <div className='flex items-center gap-4'>
                <Label className='min-w-[120px] font-medium text-sm'>
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
                                    {(initialData || []).map((item) => (
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

            {/* Radio Filters Container */}
            <div className='space-y-4 rounded-md border px-4 py-2'>
                {/* Entity Type Radio */}
                <div className='flex justify-center'>
                    <Controller
                        control={control}
                        name='bnbFlg'
                        render={({ field }) => (
                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className='flex space-x-12'>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='Book' id='r-book' />
                                    <Label htmlFor='r-book' className='cursor-pointer font-normal'>
                                        BOOK
                                    </Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='Non-Book' id='r-nonbook' />
                                    <Label htmlFor='r-nonbook' className='cursor-pointer font-normal'>
                                        NON-BOOK
                                    </Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='ALL' id='r-all' />
                                    <Label htmlFor='r-all' className='cursor-pointer font-normal'>
                                        ALL
                                    </Label>
                                </div>
                            </RadioGroup>
                        )}
                    />
                </div>

                <div className='mx-auto h-px w-full bg-border' />

                {/* Book Purpose Radio */}
                <div className='flex justify-center'>
                    <Controller
                        control={control}
                        name='bookType'
                        render={({ field }) => (
                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className='flex space-x-12'>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='Issue' id='r-issue' />
                                    <Label htmlFor='r-issue' className='cursor-pointer font-normal'>
                                        ISSUE
                                    </Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='Reference' id='r-reference' />
                                    <Label htmlFor='r-reference' className='cursor-pointer font-normal'>
                                        REFERENCE
                                    </Label>
                                </div>
                            </RadioGroup>
                        )}
                    />
                </div>
            </div>

            {/* Date Selection Box */}
            <div className='space-y-4 rounded-md border p-4'>
                <div className='flex items-center space-x-8'>
                    <Label className='font-medium text-sm'>Between Date :</Label>
                    <div className='flex items-center space-x-2'>
                        <Controller
                            control={control}
                            name='datewised'
                            render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} id='datewised' />}
                        />
                        <Label htmlFor='datewised' className='cursor-pointer text-sm'>
                            Entry Date
                        </Label>
                    </div>
                </div>

                {isDateEnabled && (
                    <div className='flex flex-wrap items-center gap-6 pt-2'>
                        <div className='flex items-center gap-2'>
                            <Label className='whitespace-nowrap text-sm'>From Date :</Label>
                            <Controller
                                control={control}
                                name='fromdate'
                                render={({ field }) => (
                                    <DatePicker
                                        date={field.value}
                                        setDate={field.onChange}
                                        placeholder='enter date'
                                        className='w-[180px]'
                                    />
                                )}
                            />
                        </div>
                        <div className='flex items-center gap-2'>
                            <Label className='whitespace-nowrap text-sm'>To Date :</Label>
                            <Controller
                                control={control}
                                name='toDate'
                                render={({ field }) => (
                                    <DatePicker
                                        date={field.value}
                                        setDate={field.onChange}
                                        placeholder='enter date'
                                        className='w-[180px]'
                                    />
                                )}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className='flex items-center justify-center gap-4 pt-4'>
                <Button
                    type='submit'
                    className='min-w-[120px] bg-[#4251b1] shadow-md hover:bg-[#35418e]'
                    disabled={isLoading || isInitialLoading}>
                    {isLoading ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Search className='mr-2 h-4 w-4' />}
                    REPORT
                </Button>
                <Button
                    type='button'
                    className='min-w-[120px] bg-[#ff5a30] text-white shadow-md hover:bg-[#e64d26]'
                    onClick={() => reset()}
                    disabled={isLoading}>
                    <X className='mr-2 h-4 w-4' />
                    CANCEL
                </Button>
            </div>
        </form>
    );
};
