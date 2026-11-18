'use client';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type NdaPhotoFilterFields, ndaPhotoFilterSchema } from '@/schemas/admission/preadmission/masters/nda-student-photo-approval';
import { zodResolver } from '@hookform/resolvers/zod';
import { Briefcase, Loader2, RotateCcw, Search, Users } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

interface NdaStudentPhotoSearchProps {
    academicList: any[];
    classList: any[];
    sectionList: any[];
    onSubmit: (data: any) => void;
    onReset: () => void;
    isLoading: boolean;
}

export function NdaStudentPhotoSearch({ academicList, classList, sectionList, onSubmit, onReset, isLoading }: NdaStudentPhotoSearchProps) {
    const form = useForm<NdaPhotoFilterFields>({
        resolver: zodResolver(ndaPhotoFilterSchema),
        defaultValues: {
            type: 'Student',
            academic_year: '',
            classname: '',
            sectionname: ''
        }
    });

    const { watch, setValue, reset } = form;
    const selectionType = watch('type');

    // Set default academic year if list exists
    useEffect(() => {
        if (academicList?.length > 0 && !form.getValues('academic_year')) {
            const selectedYear = academicList.find((y) => y.Selected === true) || academicList[0];
            setValue('academic_year', selectedYear.asmaY_Id.toString());
        }
    }, [academicList, setValue, form]);

    const handleFormReset = () => {
        reset({
            type: 'Student',
            academic_year: academicList.find((y) => y.Selected === true)?.asmaY_Id.toString() || academicList[0]?.asmaY_Id.toString() || '',
            classname: '',
            sectionname: ''
        });
        onReset();
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
                {/* Type Selection */}
                <div className='flex justify-center pb-4'>
                    <FormField
                        control={form.control}
                        name='type'
                        render={({ field }) => (
                            <FormItem className='space-y-3'>
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        value={field.value}
                                        className='flex rounded-2xl bg-slate-100/50 p-2 ring-1 ring-slate-200 backdrop-blur-sm'>
                                        <FormItem className='flex items-center space-x-0 space-y-0'>
                                            <FormControl>
                                                <RadioGroupItem value='Student' className='sr-only' />
                                            </FormControl>
                                            <FormLabel
                                                className={`flex cursor-pointer items-center gap-3 rounded-xl px-8 py-3 font-bold tracking-tight transition-all duration-300 ${
                                                    field.value === 'Student'
                                                        ? 'bg-white text-indigo-600 shadow-lg ring-1 ring-slate-200'
                                                        : 'text-slate-400 hover:text-slate-600'
                                                }`}>
                                                <Users className={`h-5 w-5 ${field.value === 'Student' ? 'animate-pulse' : ''}`} />
                                                STUDENT
                                            </FormLabel>
                                        </FormItem>
                                        <FormItem className='flex items-center space-x-0 space-y-0'>
                                            <FormControl>
                                                <RadioGroupItem value='Staff' className='sr-only' />
                                            </FormControl>
                                            <FormLabel
                                                className={`flex cursor-pointer items-center gap-3 rounded-xl px-8 py-3 font-bold tracking-tight transition-all duration-300 ${
                                                    field.value === 'Staff'
                                                        ? 'bg-white text-indigo-600 shadow-lg ring-1 ring-slate-200'
                                                        : 'text-slate-400 hover:text-slate-600'
                                                }`}>
                                                <Briefcase className={`h-5 w-5 ${field.value === 'Staff' ? 'animate-pulse' : ''}`} />
                                                STAFF
                                            </FormLabel>
                                        </FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Filters - Only for Student */}
                {selectionType === 'Student' && (
                    <div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
                        <FormField
                            control={form.control}
                            name='academic_year'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className='ml-1 font-black text-[10px] text-indigo-900/40 uppercase tracking-[0.2em]'>
                                        Academic Year
                                    </FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger className='h-14 rounded-2xl border-slate-200 bg-white font-semibold text-slate-700 shadow-sm transition-all focus:ring-2 focus:ring-indigo-500/20'>
                                                <SelectValue placeholder='Select Year' />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className='rounded-2xl border-slate-200 shadow-2xl'>
                                            {academicList?.map((year) => (
                                                <SelectItem
                                                    key={year.asmaY_Id}
                                                    value={year.asmaY_Id.toString()}
                                                    className='mx-1 my-1 rounded-xl px-4 py-3 font-bold focus:bg-indigo-50 focus:text-indigo-700'>
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
                                    <FormLabel className='ml-1 font-black text-[10px] text-indigo-900/40 uppercase tracking-[0.2em]'>
                                        Class
                                    </FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger className='h-14 rounded-2xl border-slate-200 bg-white font-semibold text-slate-700 shadow-sm transition-all focus:ring-2 focus:ring-indigo-500/20'>
                                                <SelectValue placeholder='Select Class' />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className='rounded-2xl border-slate-200 shadow-2xl'>
                                            {classList?.map((cls) => (
                                                <SelectItem
                                                    key={cls.asmcL_Id}
                                                    value={cls.asmcL_Id.toString()}
                                                    className='mx-1 my-1 rounded-xl px-4 py-3 font-bold focus:bg-indigo-50 focus:text-indigo-700'>
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
                                    <FormLabel className='ml-1 font-black text-[10px] text-indigo-900/40 uppercase tracking-[0.2em]'>
                                        Section
                                    </FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger className='h-14 rounded-2xl border-slate-200 bg-white font-semibold text-slate-700 shadow-sm transition-all focus:ring-2 focus:ring-indigo-500/20'>
                                                <SelectValue placeholder='Select Section' />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className='rounded-2xl border-slate-200 shadow-2xl'>
                                            {sectionList?.map((section) => (
                                                <SelectItem
                                                    key={section.asmS_Id}
                                                    value={section.asmS_Id.toString()}
                                                    className='mx-1 my-1 rounded-xl px-4 py-3 font-bold focus:bg-indigo-50 focus:text-indigo-700'>
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
                )}

                {/* Buttons */}
                <div className='flex justify-center gap-6 pt-4'>
                    <Button
                        type='submit'
                        disabled={isLoading}
                        className='h-14 transform rounded-2xl bg-indigo-600 px-12 font-black text-base text-white tracking-tighter shadow-indigo-200 shadow-xl transition-all hover:scale-105 hover:bg-indigo-700 active:scale-95'>
                        {isLoading ? <Loader2 className='mr-3 h-5 w-5 animate-spin' /> : <Search className='mr-3 h-5 w-5' />}
                        {selectionType === 'Student' ? 'FETCH STUDENTS' : 'FETCH STAFF'}
                    </Button>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={handleFormReset}
                        className='h-14 transform rounded-2xl border-2 border-slate-200 bg-white px-12 font-black text-base text-slate-600 tracking-tighter transition-all hover:scale-105 hover:bg-slate-50 active:scale-95'>
                        <RotateCcw className='mr-3 h-5 w-5' />
                        RESET
                    </Button>
                </div>
            </form>
        </Form>
    );
}
