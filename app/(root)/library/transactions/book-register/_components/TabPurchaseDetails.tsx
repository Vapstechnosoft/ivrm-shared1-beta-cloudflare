'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePublisherDropdown, useVendorDropdown } from '@/hooks/library/useBookRegister';
import { cn } from '@/lib/utils';
import type { BookRegisterPayload } from '@/types/library/masters/bookRegister';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useState } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

export default function TabPurchaseDetails({
    dropdownData,
    onNext,
    onPrevious,
    onCancel,
    onClear,
    isSaving
}: {
    dropdownData: any;
    onNext: () => void;
    onPrevious: () => void;
    onCancel: () => void;
    onClear: () => void;
    isSaving?: boolean;
}) {
    const {
        control,
        register,
        formState: { errors }
    } = useFormContext<BookRegisterPayload>();
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const purchaseType = useWatch({ control, name: 'lmB_PurOrDonated' });
    const { data: directVendorData } = useVendorDropdown();
    const { data: directPublisherData } = usePublisherDropdown();

    const rawData = dropdownData?.data || dropdownData;
    const publisherList =
        (directPublisherData && directPublisherData.length > 0)
            ? directPublisherData
            : rawData?.publisherlist || rawData?.publisherList || dropdownData?.publisherlist || dropdownData?.publisherList || [];
    const langList = rawData?.langlist || rawData?.langList || dropdownData?.langlist || dropdownData?.langList || [];
    const vendorList =
        (directVendorData && directVendorData.length > 0)
            ? directVendorData
            : rawData?.vendorlist || rawData?.vendorList || dropdownData?.vendorlist || dropdownData?.vendorList || [];

    return (
        <div className='flex flex-col gap-6'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div className='flex flex-col gap-1.5'>
                    <Label>
                        Purchase Date <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        control={control}
                        name='purchase_Date'
                        render={({ field }) => (
                            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={'outline'}
                                        className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>
                                        {field.value ? format(new Date(field.value), 'dd-MM-yyyy') : <span>Pick a date</span>}
                                        <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className='w-auto p-0' align='start'>
                                    <Calendar
                                        mode='single'
                                        selected={field.value ? new Date(field.value) : undefined}
                                        onSelect={(date) => {
                                            field.onChange(date);
                                            setIsCalendarOpen(false);
                                        }}
                                        disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        )}
                    />
                    {errors.purchase_Date && <FormError>{errors.purchase_Date.message}</FormError>}
                </div>

                <div className='flex flex-col gap-1.5'>
                    <Label>
                        Purchased/Donated/Specimen <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        control={control}
                        name='lmB_PurOrDonated'
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value || undefined}>
                                <SelectTrigger>
                                    <SelectValue placeholder='--Select--' />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='P'>Purchased</SelectItem>
                                    <SelectItem value='D'>Donated</SelectItem>
                                    <SelectItem value='S'>Specimen</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.lmB_PurOrDonated && <FormError>{errors.lmB_PurOrDonated.message}</FormError>}
                </div>

                <div className='flex flex-col gap-1.5'>
                    <Label>
                        Language <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        control={control}
                        name='lmL_Id'
                        render={({ field }) => (
                            <Select
                                onValueChange={(val) => field.onChange(Number(val))}
                                value={field.value ? field.value.toString() : undefined}>
                                <SelectTrigger>
                                    <SelectValue placeholder='--Select--' />
                                </SelectTrigger>
                                <SelectContent>
                                    {langList?.map((item: any, idx: number) => {
                                        const langId = item.lmL_Id ?? item.lml_Id ?? item.LML_Id ?? item.id ?? item.value;
                                        const langName =
                                            item.lmL_LanguageName ||
                                            item.lml_LanguageName ||
                                            item.LML_LanguageName ||
                                            item.languageName ||
                                            item.name ||
                                            item.label ||
                                            String(langId);
                                        if (langId === undefined || langId === null) return null;
                                        return (
                                            <SelectItem key={`${langId}-${idx}`} value={langId.toString()}>
                                                {langName}
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.lmL_Id && <FormError>{errors.lmL_Id.message}</FormError>}
                </div>

                <InputText label='Voucher No' {...register('voucher_No')} placeholder='Enter Voucher No.' />

                <div className='flex flex-col gap-1.5'>
                    <Label>Vendor</Label>
                    <Controller
                        control={control}
                        name='lmV_Id'
                        render={({ field }) => (
                            <Select
                                onValueChange={(val) => field.onChange(Number(val))}
                                value={field.value ? field.value.toString() : undefined}>
                                <SelectTrigger>
                                    <SelectValue placeholder='--Select--' />
                                </SelectTrigger>
                                <SelectContent>
                                    {vendorList?.map((item: any, idx: number) => {
                                        const vendorId = item.lmV_Id ?? item.lmv_Id ?? item.LMV_Id ?? item.id ?? item.value;
                                        const vendorName =
                                            item.lmV_VendorName ||
                                            item.lmv_VendorName ||
                                            item.LMV_VendorName ||
                                            item.vendorName ||
                                            item.name ||
                                            item.label ||
                                            String(vendorId);
                                        if (vendorId === undefined || vendorId === null) return null;
                                        return (
                                            <SelectItem key={`${vendorId}-${idx}`} value={vendorId.toString()}>
                                                {vendorName}
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>

                <InputText label='Bill No' {...register('lmB_BillNo')} placeholder='Enter Bill No.' />

                {(purchaseType === 'Donated' || purchaseType === 'D') && (
                    <>
                        <InputText label='Donor Name' {...register('donor_Id')} />
                        <InputText label='Donor Address' {...register('lmB_DonorAddress')} />
                    </>
                )}

                <div className='flex flex-col gap-1.5'>
                    <Label>Keywords</Label>
                    <textarea
                        {...register('mB_Keywords')}
                        placeholder='Enter the Keywords'
                        className='min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                    />
                </div>

                <InputText label='Currency Type' {...register('currencyType')} placeholder='Enter Currency Type' />
                <InputText label='Net Price' type='number' step='any' {...register('lmB_NetPrice')} placeholder='Enter Net Price' />
            </div>

            {/* PUBLISHER DETAILS Section */}
            <div className='mt-4'>
                <h3 className='mb-4 border-b pb-2 font-bold text-blue-800 uppercase tracking-wide'>Publisher Details</h3>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <div className='flex flex-col gap-1.5'>
                        <Label>Publisher</Label>
                        <Controller
                            control={control}
                            name='lmP_Id'
                            render={({ field }) => (
                                <Select
                                    onValueChange={(val) => field.onChange(Number(val))}
                                    value={field.value ? field.value.toString() : undefined}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='--Select--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {publisherList?.map((item: any, idx: number) => {
                                            const publisherId = item.lmP_Id ?? item.lmp_Id ?? item.LMP_Id ?? item.id ?? item.value;
                                            const publisherName =
                                                item.lmP_PublisherName || item.lmp_PublisherName || item.LMP_PublisherName || item.publisherName || item.name || String(publisherId);
                                            if (publisherId === undefined || publisherId === null) return null;
                                            return (
                                                <SelectItem key={`${publisherId}-${idx}`} value={publisherId.toString()}>
                                                    {publisherName}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>

                    <div className='flex flex-col gap-1.5'>
                        <Label>Remarks</Label>
                        <textarea
                            {...register('mB_Remarks')}
                            placeholder='Enter the Remarks'
                            className='min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                        />
                    </div>

                    <InputText label='Bibliography Page' {...register('bibliography_Page')} placeholder='Enter the Bibliography Page' />
                    <InputText label='Index Page' {...register('index_Page')} placeholder='Enter the Index Page' />
                </div>
            </div>

            {/* Action Buttons */}
            <div className='flex justify-center gap-2 border-t pt-4'>
                <Button
                    type='button'
                    variant='default'
                    onClick={onPrevious}
                    className='bg-blue-600 px-6 font-bold text-xs uppercase hover:bg-blue-700'>
                    Previous
                </Button>
                <Button
                    type='button'
                    variant='destructive'
                    onClick={onClear}
                    className='bg-red-500 px-6 font-bold text-xs uppercase hover:bg-red-600'>
                    Clear
                </Button>
                <Button
                    type='button'
                    variant='warning'
                    onClick={onCancel}
                    className='bg-orange-500 px-6 font-bold text-xs uppercase hover:bg-orange-600'>
                    Cancel
                </Button>
                <Button
                    type='button'
                    variant='default'
                    onClick={onNext}
                    isLoading={isSaving}
                    disabled={isSaving}
                    className='bg-blue-600 px-6 font-bold text-xs uppercase hover:bg-blue-700'>
                    Save & Next
                </Button>
            </div>
        </div>
    );
}
