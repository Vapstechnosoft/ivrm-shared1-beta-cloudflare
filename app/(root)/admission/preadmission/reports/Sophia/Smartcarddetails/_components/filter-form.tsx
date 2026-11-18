'use client';

import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSophiaSmartcardReport } from '@/hooks/admission/preadmission/reports/useSophiaSmartcardReport';
import {
    type SophiaSmartcardReportFields,
    SophiaSmartcardReportSchema
} from '@/schemas/admission/preadmission/reports/sophia-smartcard-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { ClipboardList, Download, Printer, RotateCcw } from 'lucide-react';
import React from 'react';
import { useForm } from 'react-hook-form';

interface FilterFormProps {
    onSubmit: (data: SophiaSmartcardReportFields) => void;
    onReset: () => void;
    onExport: () => void;
    onPrint: () => void;
    hasData: boolean;
    hasSelectedData: boolean;
}

export const FilterForm = ({ onSubmit, onReset, onExport, onPrint, hasData, hasSelectedData }: FilterFormProps) => {
    const { loadData, reportMutation } = useSophiaSmartcardReport();
    const [resetKey, setResetKey] = React.useState(0);

    const form = useForm<SophiaSmartcardReportFields>({
        resolver: zodResolver(SophiaSmartcardReportSchema),
        defaultValues: {
            ASMAY_Id: 0,
            ASMCL_Id: 0,
            ASMS_Id: 0,
            SPCCMH_Id: 0,
            Admnoallind: 'Regular'
        }
    });

    const { reset } = form;

    const handleFormSubmit = (data: SophiaSmartcardReportFields) => {
        onSubmit(data);
    };

    const handleReset = () => {
        reset({
            ASMAY_Id: 0,
            ASMCL_Id: 0,
            ASMS_Id: 0,
            SPCCMH_Id: 0,
            Admnoallind: 'Regular'
        });
        setResetKey((prev) => prev + 1);
        onReset();
    };

    const data = (loadData.data as any)?.data || (loadData.data as any);
    const yearList = data?.academicList || [];
    const classList = data?.classlist || [];
    const sectionList = data?.sectionList || [];
    const houseList = data?.houseList || [];

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className='space-y-6'>
                <div key={resetKey} className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
                    {/* Academic Year */}
                    <FormField
                        control={form.control}
                        name='ASMAY_Id'
                        render={({ field }) => (
                            <FormItem>
                                <Label className='font-bold text-xs uppercase tracking-wider'>
                                    Academic Year <span className='text-red-500'>*</span>
                                </Label>
                                <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString() || '0'}>
                                    <FormControl>
                                        <SelectTrigger className='border-slate-300'>
                                            <SelectValue placeholder='---Select---' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {yearList.map((y: any) => (
                                            <SelectItem key={y.asmaY_Id} value={y.asmaY_Id.toString()}>
                                                {y.asmaY_Year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {form.formState.errors.ASMAY_Id && <FormError>{form.formState.errors.ASMAY_Id.message}</FormError>}
                            </FormItem>
                        )}
                    />

                    {/* Class */}
                    <FormField
                        control={form.control}
                        name='ASMCL_Id'
                        render={({ field }) => (
                            <FormItem>
                                <Label className='font-bold text-xs uppercase tracking-wider'>
                                    Class <span className='text-red-500'>*</span>
                                </Label>
                                <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString() || '0'}>
                                    <FormControl>
                                        <SelectTrigger className='border-slate-300'>
                                            <SelectValue placeholder='---Select---' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {classList.map((c: any) => (
                                            <SelectItem key={c.asmcL_Id} value={c.asmcL_Id.toString()}>
                                                {c.asmcL_ClassName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {form.formState.errors.ASMCL_Id && <FormError>{form.formState.errors.ASMCL_Id.message}</FormError>}
                            </FormItem>
                        )}
                    />

                    {/* Section */}
                    <FormField
                        control={form.control}
                        name='ASMS_Id'
                        render={({ field }) => (
                            <FormItem>
                                <Label className='font-bold text-xs uppercase tracking-wider'>
                                    Section <span className='text-red-500'>*</span>
                                </Label>
                                <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString() || '0'}>
                                    <FormControl>
                                        <SelectTrigger className='border-slate-300'>
                                            <SelectValue placeholder='---Select---' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {sectionList.map((s: any) => (
                                            <SelectItem key={s.asmS_Id} value={s.asmS_Id.toString()}>
                                                {s.asmC_SectionName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {form.formState.errors.ASMS_Id && <FormError>{form.formState.errors.ASMS_Id.message}</FormError>}
                            </FormItem>
                        )}
                    />

                    {/* House */}
                    {/* <FormField
                        control={form.control}
                        name="SPCCMH_Id"
                        render={({ field }) => (
                            <FormItem>
                                <Label className="font-bold uppercase tracking-wider text-xs">House</Label>
                                <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                                    <FormControl>
                                        <SelectTrigger className="border-slate-300">
                                            <SelectValue placeholder="---Select---" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="0">All</SelectItem>
                                        {houseList.map((h: any) => (
                                            <SelectItem key={h.spccmH_Id} value={h.spccmH_Id.toString()}>
                                                {h.spccmH_HouseName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    /> */}
                </div>

                <div className='flex flex-col items-center justify-center space-y-3 rounded-lg border bg-slate-50 p-4'>
                    <FormField
                        control={form.control}
                        name='Admnoallind'
                        render={({ field }) => (
                            <FormItem className='space-y-3'>
                                <FormControl>
                                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className='flex gap-8'>
                                        <FormItem className='flex items-center space-x-2 space-y-0'>
                                            <FormControl>
                                                <RadioGroupItem value='Regular' id='regular' />
                                            </FormControl>
                                            <Label htmlFor='regular' className='cursor-pointer font-semibold text-slate-700'>
                                                Regular
                                            </Label>
                                        </FormItem>
                                        <FormItem className='flex items-center space-x-2 space-y-0'>
                                            <FormControl>
                                                <RadioGroupItem value='New' id='new' />
                                            </FormControl>
                                            <Label htmlFor='new' className='cursor-pointer font-semibold text-slate-700'>
                                                New
                                            </Label>
                                        </FormItem>
                                    </RadioGroup>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>

                <div className='flex flex-wrap items-center justify-center gap-4 pt-4'>
                    <Button
                        type='submit'
                        className='w-fit rounded-none bg-[#3c8dbc] px-6 font-bold text-white uppercase hover:bg-[#367fa9]'
                        disabled={reportMutation.isPending}>
                        {reportMutation.isPending ? (
                            'Generating...'
                        ) : (
                            <span className='flex items-center gap-2'>
                                <ClipboardList className='h-4 w-4' /> Report
                            </span>
                        )}
                    </Button>
                    <Button
                        type='button'
                        onClick={handleReset}
                        className='w-fit rounded-none bg-[#dd4b39] px-6 font-bold text-white uppercase hover:bg-[#c23321]'>
                        <RotateCcw className='mr-2 h-4 w-4' /> Cancel
                    </Button>
                    <Button
                        type='button'
                        onClick={onExport}
                        disabled={!hasData}
                        className='w-fit rounded-none bg-[#337ab7] px-6 font-bold text-white uppercase hover:bg-[#286090]'>
                        <Download className='mr-2 h-4 w-4' /> Export to Excel
                    </Button>
                    <Button
                        type='button'
                        onClick={onPrint}
                        disabled={!hasSelectedData}
                        className='w-fit rounded-none bg-[#f0ad4e] px-6 font-bold text-white uppercase hover:bg-[#ec971f]'>
                        <Printer className='mr-2 h-4 w-4' /> Print
                    </Button>
                </div>
            </form>
        </Form>
    );
};
