'use client';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSophiaSmartcardReport } from '@/hooks/admission/preadmission/reports/useSophiaSmartcardReport';
import {
    type SophiaSmartcardReportFields,
    SophiaSmartcardReportSchema
} from '@/schemas/admission/preadmission/reports/sophia-smartcard-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { ClipboardList, Download, Printer, RotateCcw } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

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

    const form = useForm<SophiaSmartcardReportFields>({
        resolver: zodResolver(SophiaSmartcardReportSchema),
        defaultValues: {
            ASMAY_Id: 0,
            ASMCL_Id: 0,
            ASMS_Id: 0,
            Admnoallind: 'Regular'
        }
    });

    const handleFormSubmit = (data: SophiaSmartcardReportFields) => {
        onSubmit(data);
    };

    const handleFormError = (errors: any) => {
        const errorMessages = Object.values(errors).map((err: any) => err.message);
        if (errorMessages.length > 0) {
            toast.error(errorMessages[0]);
        }
    };

    const handleReset = () => {
        form.reset({
            ASMAY_Id: undefined,
            ASMCL_Id: undefined,
            ASMS_Id: undefined,
            SPCCMH_Id: undefined,
            Admnoallind: 'Regular'
        });
        onReset();
        window.location.reload();
    };

    const data = (loadData.data as any)?.data || (loadData.data as any);
    const yearList = data?.academicList || [];
    const classList = data?.classlist || [];
    const sectionList = data?.sectionList || [];
    const houseList = data?.houseList || [];

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit, handleFormError)} className='space-y-6'>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
                    {/* Academic Year */}
                    <FormField
                        control={form.control}
                        name='ASMAY_Id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className='font-bold text-xs uppercase tracking-wider'>
                                    Academic Year <span className='text-red-500'>*</span>
                                </FormLabel>
                                <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
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
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Class */}
                    <FormField
                        control={form.control}
                        name='ASMCL_Id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className='font-bold text-xs uppercase tracking-wider'>
                                    Class <span className='text-red-500'>*</span>
                                </FormLabel>
                                <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
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
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Section */}
                    <FormField
                        control={form.control}
                        name='ASMS_Id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className='font-bold text-xs uppercase tracking-wider'>
                                    Section <span className='text-red-500'>*</span>
                                </FormLabel>
                                <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
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
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* House */}
                    {/* <FormField
                        control={form.control}
                        name="SPCCMH_Id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-bold uppercase tracking-wider text-xs">House</FormLabel>
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

                <div className='flex flex-col items-center justify-center space-y-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-6 shadow-inner'>
                    <FormField
                        control={form.control}
                        name='Admnoallind'
                        render={({ field }) => (
                            <FormItem className='space-y-3'>
                                <FormControl>
                                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className='flex gap-8'>
                                        <FormItem className='flex items-center space-x-2 space-y-0'>
                                            <FormControl>
                                                <RadioGroupItem value='Regular' id='regular' className='border-slate-300 text-[#f15a24]' />
                                            </FormControl>
                                            <FormLabel
                                                htmlFor='regular'
                                                className='cursor-pointer font-bold text-[10px] text-slate-600 uppercase tracking-widest'>
                                                Regular
                                            </FormLabel>
                                        </FormItem>
                                        <FormItem className='flex items-center space-x-2 space-y-0'>
                                            <FormControl>
                                                <RadioGroupItem value='New' id='new' className='border-slate-300 text-[#f15a24]' />
                                            </FormControl>
                                            <FormLabel
                                                htmlFor='new'
                                                className='cursor-pointer font-bold text-[10px] text-slate-600 uppercase tracking-widest'>
                                                New
                                            </FormLabel>
                                        </FormItem>
                                    </RadioGroup>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>

                <div className='flex flex-wrap items-center justify-center gap-4 pt-6'>
                    <Button
                        type='submit'
                        className='w-auto min-w-[120px] rounded-full bg-[#f15a24] font-bold text-white text-xs uppercase tracking-wider shadow-lg shadow-orange-200/50 transition-all hover:scale-105 hover:bg-[#d94e1c] active:scale-95'
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
                        className='w-auto min-w-[120px] rounded-full bg-slate-200 font-bold text-slate-700 text-xs uppercase tracking-wider transition-all hover:scale-105 hover:bg-slate-300 active:scale-95'>
                        <RotateCcw className='mr-2 h-4 w-4' /> Cancel
                    </Button>
                    <Button
                        type='button'
                        onClick={onExport}
                        disabled={!hasData}
                        className='w-auto min-w-[120px] rounded-full bg-[#337ab7] font-bold text-white text-xs uppercase tracking-wider shadow-blue-200/50 shadow-lg transition-all hover:scale-105 hover:bg-[#286090] active:scale-95'>
                        <Download className='mr-2 h-4 w-4' /> Export
                    </Button>
                    <Button
                        type='button'
                        onClick={onPrint}
                        disabled={!hasSelectedData}
                        className='w-auto min-w-[120px] rounded-full bg-[#f0ad4e] font-bold text-white text-xs uppercase tracking-wider shadow-amber-200/50 shadow-lg transition-all hover:scale-105 hover:bg-[#ec971f] active:scale-95'>
                        <Printer className='mr-2 h-4 w-4' /> Print
                    </Button>
                </div>
            </form>
        </Form>
    );
};
