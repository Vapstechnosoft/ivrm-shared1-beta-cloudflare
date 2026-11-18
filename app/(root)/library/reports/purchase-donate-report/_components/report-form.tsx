'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { IPurchaseDonateReportRequest } from '@/types/library/reports/purchase-donate-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileSpreadsheet, Loader2, Printer, Search, X } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

const reportFormSchema = z.object({
    book_Flag: z.enum(['Purchased', 'Donated']),
    LMB_BookType: z.string().min(1, 'Book Category is required')
});

type ReportFormValues = z.infer<typeof reportFormSchema>;

interface ReportFormProps {
    onSearch: (data: IPurchaseDonateReportRequest) => void;
    isLoading: boolean;
    onPrint: () => void;
    onExport: () => void;
    onCancel: () => void;
    hasData: boolean;
}

export const ReportForm = ({ onSearch, isLoading, onPrint, onExport, onCancel, hasData }: ReportFormProps) => {
    const [resetKey, setResetKey] = useState(0);

    const {
        control,
        handleSubmit,
        reset,
        setValue,
        formState: { errors }
    } = useForm<ReportFormValues>({
        resolver: zodResolver(reportFormSchema),
        defaultValues: {
            book_Flag: 'Purchased',
            LMB_BookType: ''
        }
    });

    const onSubmit = (data: ReportFormValues) => {
        onSearch({
            mI_Id: 30,
            MI_Id: 30,
            circ_Flag: data.LMB_BookType, // "Book" or "Non-Book"
            LMB_BookType: data.LMB_BookType,
            lbcpA_Flg: data.book_Flag, // "Purchased" or "Donated"
            book_Flag: data.book_Flag
        });
    };

    const handleCancel = () => {
        setValue('LMB_BookType', '', { shouldValidate: false, shouldDirty: false });
        reset({
            book_Flag: 'Purchased',
            LMB_BookType: ''
        });
        setResetKey((prev) => prev + 1);
        onCancel();
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className='mx-auto max-w-2xl space-y-8 rounded-[20px] border border-slate-100 bg-white p-10 shadow-lg'>
            {/* Purchase / Donate Type - Matches Screenshot */}
            <div className='flex items-center justify-center gap-12'>
                <Controller
                    control={control}
                    name='book_Flag'
                    render={({ field }) => (
                        <RadioGroup onValueChange={field.onChange} value={field.value} className='flex items-center gap-12'>
                            <div className='flex items-center space-x-3'>
                                <RadioGroupItem value='Purchased' id='r-purchased' className='h-5 w-5 border-[#3f51b5] text-[#3f51b5]' />
                                <Label
                                    htmlFor='r-purchased'
                                    className='cursor-pointer font-bold text-[#3f51b5] text-xs uppercase tracking-wide'>
                                    Purchase
                                </Label>
                            </div>
                            <div className='flex items-center space-x-3'>
                                <RadioGroupItem value='Donated' id='r-donated' className='h-5 w-5 border-[#3f51b5] text-[#3f51b5]' />
                                <Label
                                    htmlFor='r-donated'
                                    className='cursor-pointer font-bold text-[#3f51b5] text-xs uppercase tracking-wide'>
                                    Donate
                                </Label>
                            </div>
                        </RadioGroup>
                    )}
                />
            </div>

            {/* Book Category - Row */}
            <div className='flex items-center justify-center gap-4'>
                <Label className='min-w-[120px] text-right font-bold text-[#3f51b5] text-[13px]'>
                    Book Category: <span className='text-red-500'>*</span>
                </Label>
                <div className='w-full max-w-sm'>
                    <Controller
                        control={control}
                        name='LMB_BookType'
                        render={({ field }) => (
                            <Select
                                key={`book-cat-${resetKey}-${field.value || 'empty'}`}
                                onValueChange={field.onChange}
                                value={field.value || ''}>
                                <SelectTrigger className='h-10 w-full rounded-full border-slate-300 px-4 text-sm'>
                                    <SelectValue placeholder='Select Book Category' />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='Book'>Book</SelectItem>
                                    <SelectItem value='Non-Book'>Non-Book</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.LMB_BookType && <p className='mt-1 ml-4 text-red-500 text-xs'>{errors.LMB_BookType.message}</p>}
                </div>
            </div>

            {/* Action Buttons */}
            <div className='flex flex-row flex-wrap items-center justify-center gap-4 pt-4'>
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
                    onClick={handleCancel}
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
