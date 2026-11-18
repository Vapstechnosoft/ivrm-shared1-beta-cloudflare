'use client';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNdaStudentTcSections } from '@/hooks/admission/preadmission/useNdaStudentTc';
import { type NdaStudentTcFilterFields, ndaStudentTcFilterSchema } from '@/schemas/admission/preadmission/reports/nda-student-tc';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, RotateCcw, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface NdaStudentTcSearchProps {
    academicList: any[];
    classList: any[];
    onSubmit: (data: any) => void;
    onReset: () => void;
    isLoading: boolean;
}

export function NdaStudentTcSearch({ academicList, classList, onSubmit, onReset, isLoading }: NdaStudentTcSearchProps) {
    const [sections, setSections] = useState<any[]>([]);
    const sectionMutation = useNdaStudentTcSections();

    const form = useForm<NdaStudentTcFilterFields>({
        resolver: zodResolver(ndaStudentTcFilterSchema),
        defaultValues: {
            academic_year: '',
            classname: '',
            sectionname: ''
        }
    });

    const { watch, setValue } = form;
    const selectedYear = watch('academic_year');
    const selectedClass = watch('classname');

    useEffect(() => {
        async function fetchSections() {
            if (selectedYear && selectedClass) {
                try {
                    const res = (await sectionMutation.mutateAsync({
                        ASMAY_Id: Number(selectedYear),
                        ASMCL_Id: Number(selectedClass)
                    })) as any;

                    if (Array.isArray(res)) {
                        setSections(res);
                    } else if (res?.sectionList && Array.isArray(res.sectionList)) {
                        setSections(res.sectionList);
                    } else {
                        setSections([]);
                        toast.error('No sections found for this class');
                    }
                } catch (error) {
                    console.error('Error fetching sections:', error);
                    setSections([]);
                }
            } else {
                setSections([]);
            }
            setValue('sectionname', '');
        }
        fetchSections();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedYear, selectedClass, setValue]);

    const handleFormReset = () => {
        form.reset();
        setSections([]);
        onReset();
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                    <FormField
                        control={form.control}
                        name='academic_year'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className='font-bold text-gray-700 text-sm'>
                                    Academic Year <span className='text-red-500'>*</span>
                                </FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger className='h-12 rounded-xl border-gray-200 bg-gray-50/50 transition-all focus:ring-2 focus:ring-indigo-500'>
                                            <SelectValue placeholder='Select Year' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className='overflow-hidden rounded-xl border-gray-200 shadow-xl'>
                                        {academicList?.map((year) => (
                                            <SelectItem
                                                key={year.asmaY_Id}
                                                value={year.asmaY_Id.toString()}
                                                className='py-3 font-medium focus:bg-indigo-50 focus:text-indigo-700'>
                                                {year.asmaY_Year}
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
                                <FormLabel className='font-bold text-gray-700 text-sm'>
                                    Class <span className='text-red-500'>*</span>
                                </FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger className='h-12 rounded-xl border-gray-200 bg-gray-50/50 transition-all focus:ring-2 focus:ring-indigo-500'>
                                            <SelectValue placeholder='Select Class' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className='overflow-hidden rounded-xl border-gray-200 shadow-xl'>
                                        {classList?.map((cls) => (
                                            <SelectItem
                                                key={cls.asmcL_Id}
                                                value={cls.asmcL_Id.toString()}
                                                className='py-3 font-medium focus:bg-indigo-50 focus:text-indigo-700'>
                                                {cls.asmcL_ClassName}
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
                                <FormLabel className='font-bold text-gray-700 text-sm'>
                                    Section <span className='text-red-500'>*</span>
                                </FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    disabled={sectionMutation.isPending || sections.length === 0}>
                                    <FormControl>
                                        <SelectTrigger className='h-12 rounded-xl border-gray-200 bg-gray-50/50 transition-all focus:ring-2 focus:ring-indigo-500'>
                                            <SelectValue placeholder={sectionMutation.isPending ? 'Loading...' : 'Select Section'} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className='overflow-hidden rounded-xl border-gray-200 shadow-xl'>
                                        {sections.map((section) => (
                                            <SelectItem
                                                key={section.asmS_Id}
                                                value={section.asmS_Id.toString()}
                                                className='py-3 font-medium focus:bg-indigo-50 focus:text-indigo-700'>
                                                {section.asmC_SectionName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className='flex justify-center gap-4 pt-2'>
                    <Button
                        type='submit'
                        disabled={isLoading}
                        className='h-12 transform rounded-full bg-indigo-600 px-10 py-3 font-bold text-white shadow-indigo-200 shadow-lg transition-all hover:scale-105 hover:bg-indigo-700 active:scale-95'>
                        {isLoading ? <Loader2 className='mr-2 h-5 w-5 animate-spin' /> : <Search className='mr-2 h-5 w-5' />}
                        Search
                    </Button>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={handleFormReset}
                        className='h-12 transform rounded-full border-gray-300 px-10 py-3 font-bold text-gray-700 transition-all hover:scale-105 hover:bg-gray-100 active:scale-95 dark:bg-white'>
                        <RotateCcw className='mr-2 h-5 w-5' />
                        Cancel
                    </Button>
                </div>
            </form>
        </Form>
    );
}
