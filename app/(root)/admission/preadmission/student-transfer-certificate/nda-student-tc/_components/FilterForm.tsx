'use client';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNdaStudentTcInitialData, useNdaStudentTcSections } from '@/hooks/admission/preadmission/useNdaStudentTc';
import { type NdaStudentTcFilterFields, ndaStudentTcFilterSchema } from '@/schemas/admission/preadmission/reports/nda-student-tc';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, RotateCcw, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

interface FilterFormProps {
    onSearch: (data: any) => void;
    onReset: () => void;
}

export function FilterForm({ onSearch, onReset }: FilterFormProps) {
    const form = useForm<NdaStudentTcFilterFields>({
        resolver: zodResolver(ndaStudentTcFilterSchema),
        defaultValues: {
            academic_year: '',
            classname: '',
            sectionname: ''
        }
    });

    const { watch, setValue, reset } = form;
    const academicYear = watch('academic_year');
    const className = watch('classname');

    const { data: initialData, isLoading } = useNdaStudentTcInitialData();
    const sectionMutation = useNdaStudentTcSections();
    const [sections, setSections] = useState<any[]>([]);

    // Auto-select current year
    useEffect(() => {
        const currentYearId = initialData?.data?.currentYear?.[0]?.asmaY_Id;
        if (currentYearId && !academicYear) {
            setValue('academic_year', currentYearId.toString());
        }
    }, [initialData, academicYear, setValue]);

    // Handle Class Change to load Sections
    useEffect(() => {
        if (academicYear && className) {
            sectionMutation.mutate(
                {
                    ASMAY_Id: Number(academicYear),
                    ASMCL_Id: Number(className)
                },
                {
                    onSuccess: (response: any) => {
                        const data = response?.data || response;
                        const sectionList = Array.isArray(data) ? data : data.sectionList || [];
                        setSections(sectionList);
                        setValue('sectionname', '');
                    }
                }
            );
        }
    }, [academicYear, className]);

    const handleReset = () => {
        reset();
        setSections([]);
        onReset();
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSearch)} className='space-y-6'>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                    <FormField
                        control={form.control}
                        name='academic_year'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className='font-bold text-slate-700 text-sm uppercase'>
                                    Academic Year <span className='text-red-500'>*</span>
                                </FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger className='h-11 rounded-xl border-slate-200 bg-white shadow-sm focus:ring-indigo-500/20'>
                                            <SelectValue placeholder={isLoading ? 'Loading...' : 'Select Year'} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {((initialData as any)?.data?.academicList || (initialData as any)?.academicList)?.map((y: any) => (
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

                    <FormField
                        control={form.control}
                        name='classname'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className='font-bold text-slate-700 text-sm uppercase'>
                                    Class <span className='text-red-500'>*</span>
                                </FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger className='h-11 rounded-xl border-slate-200 bg-white shadow-sm focus:ring-indigo-500/20'>
                                            <SelectValue placeholder='Select Class' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {((initialData as any)?.data?.classlist || (initialData as any)?.classlist)?.map((c: any) => (
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

                    <FormField
                        control={form.control}
                        name='sectionname'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className='font-bold text-slate-700 text-sm uppercase'>
                                    Section <span className='text-red-500'>*</span>
                                </FormLabel>
                                <Select onValueChange={field.onChange} value={field.value} disabled={!className}>
                                    <FormControl>
                                        <SelectTrigger className='h-11 rounded-xl border-slate-200 bg-white shadow-sm focus:ring-indigo-500/20 disabled:bg-slate-50'>
                                            <SelectValue placeholder={sectionMutation.isPending ? 'Loading...' : 'Select Section'} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {sections.map((s: any) => (
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
                </div>

                <div className='flex items-center justify-center gap-4 pt-4'>
                    <Button
                        type='submit'
                        className='h-11 min-w-[140px] rounded-full bg-indigo-600 px-8 font-bold text-white shadow-indigo-100 shadow-lg transition-all hover:bg-indigo-700'>
                        {isLoading ? (
                            <Loader2 className='h-5 w-5 animate-spin' />
                        ) : (
                            <>
                                <Search className='mr-2 h-4 w-4' /> SEARCH
                            </>
                        )}
                    </Button>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={handleReset}
                        className='h-11 min-w-[140px] rounded-full border-slate-200 px-8 font-bold text-slate-600 hover:bg-slate-50'>
                        <RotateCcw className='mr-2 h-4 w-4' /> CANCEL
                    </Button>
                </div>
            </form>
        </Form>
    );
}
