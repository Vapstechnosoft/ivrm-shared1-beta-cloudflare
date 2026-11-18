'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    type NdaStudentProfileReportFields,
    ndaStudentProfileReportSchema
} from '@/schemas/admission/preadmission/reports/nda-student-profile-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileText, Loader2, XCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface ProfileReportFormProps {
    academicList: any[];
    classList: any[];
    sectionList: any[];
    onSubmit: (data: NdaStudentProfileReportFields) => void;
    onReset: () => void;
    isPending: boolean;
}

export function ProfileReportForm({ academicList, classList, sectionList, onSubmit, onReset, isPending }: ProfileReportFormProps) {
    const form = useForm<NdaStudentProfileReportFields>({
        resolver: zodResolver(ndaStudentProfileReportSchema),
        defaultValues: {
            type: 'Student',
            academic_year: '',
            classname: '',
            sectionname: ''
        }
    });

    const reportType = form.watch('type');

    const handleReset = () => {
        form.reset();
        onReset();
    };

    return (
        <Card className='overflow-hidden rounded-[2rem] border-slate-200 bg-white/80 shadow-xl backdrop-blur-sm'>
            <CardHeader className='bg-gradient-to-r from-indigo-600 to-indigo-800 p-8 text-white'>
                <CardTitle className='flex items-center gap-3 font-black text-2xl tracking-tight'>
                    <FileText className='h-8 w-8' />
                    REPORT CRITERIA
                </CardTitle>
                <p className='font-medium text-indigo-100 opacity-90'>Select the parameters to generate the profile status report</p>
            </CardHeader>
            <CardContent className='p-10'>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-10'>
                        {/* Report Type Selection */}
                        <FormField
                            control={form.control}
                            name='type'
                            render={({ field }) => (
                                <FormItem className='space-y-4'>
                                    <FormLabel className='font-bold text-lg text-slate-800 uppercase tracking-tight'>
                                        SELECT REPORT TYPE
                                    </FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className='flex gap-8 rounded-2xl border border-slate-100 bg-slate-50 p-6 ring-1 ring-slate-200/50'>
                                            <div className='group flex cursor-pointer items-center space-x-3'>
                                                <RadioGroupItem value='Student' id='student' className='h-5 w-5 border-2 text-indigo-600' />
                                                <label
                                                    htmlFor='student'
                                                    className='cursor-pointer font-bold text-slate-600 transition-colors group-hover:text-indigo-600'>
                                                    STUDENT
                                                </label>
                                            </div>
                                            <div className='group flex cursor-pointer items-center space-x-3'>
                                                <RadioGroupItem value='Staff' id='staff' className='h-5 w-5 border-2 text-indigo-600' />
                                                <label
                                                    htmlFor='staff'
                                                    className='cursor-pointer font-bold text-slate-600 transition-colors group-hover:text-indigo-600'>
                                                    STAFF
                                                </label>
                                            </div>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Student Specific Filters */}
                        {reportType === 'Student' && (
                            <div className='fade-in slide-in-from-top-4 grid animate-in grid-cols-1 gap-8 duration-500 md:grid-cols-3'>
                                <FormField
                                    control={form.control}
                                    name='academic_year'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className='font-bold text-slate-700'>ACADEMIC YEAR</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className='h-14 rounded-xl border-slate-200 bg-white font-medium shadow-sm transition-all focus:ring-2 focus:ring-indigo-500'>
                                                        <SelectValue placeholder='Select Year' />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className='rounded-xl border-slate-200 shadow-2xl'>
                                                    {academicList.map((year: any, index: number) => (
                                                        <SelectItem
                                                            key={`${year.asmaY_Id}-${index}`}
                                                            value={year.asmaY_Id.toString()}
                                                            className='h-12 font-medium'>
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
                                            <FormLabel className='font-bold text-slate-700'>CLASS</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className='h-14 rounded-xl border-slate-200 bg-white font-medium shadow-sm transition-all focus:ring-2 focus:ring-indigo-500'>
                                                        <SelectValue placeholder='Select Class' />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className='rounded-xl border-slate-200 shadow-2xl'>
                                                    {classList.map((cls: any, index: number) => (
                                                        <SelectItem
                                                            key={`${cls.asmcL_Id}-${index}`}
                                                            value={cls.asmcL_Id.toString()}
                                                            className='h-12 font-medium'>
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
                                            <FormLabel className='font-bold text-slate-700'>SECTION</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className='h-14 rounded-xl border-slate-200 bg-white font-medium shadow-sm transition-all focus:ring-2 focus:ring-indigo-500'>
                                                        <SelectValue placeholder='Select Section' />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className='rounded-xl border-slate-200 shadow-2xl'>
                                                    {sectionList.map((sec: any, index: number) => (
                                                        <SelectItem
                                                            key={`${sec.asmS_Id}-${index}`}
                                                            value={sec.asmS_Id.toString()}
                                                            className='h-12 font-medium'>
                                                            {sec.asmC_SectionName}
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

                        {/* Action Buttons */}
                        <div className='flex justify-center gap-6 pt-6'>
                            <Button
                                type='submit'
                                disabled={isPending}
                                className='flex h-14 transform items-center gap-3 rounded-full bg-indigo-600 px-12 font-black text-lg text-white tracking-tighter shadow-indigo-200 shadow-lg transition-all hover:scale-105 hover:bg-indigo-700 active:scale-95'>
                                {isPending ? <Loader2 className='h-6 w-6 animate-spin' /> : <FileText className='h-6 w-6' />}
                                GENERATE REPORT
                            </Button>
                            <Button
                                type='button'
                                variant='outline'
                                onClick={handleReset}
                                className='flex h-14 transform items-center gap-3 rounded-full border-slate-200 px-12 font-black text-lg text-slate-600 tracking-tighter shadow-md transition-all hover:scale-105 hover:bg-slate-50 active:scale-95 dark:bg-white'>
                                <XCircle className='h-6 w-6' />
                                CANCEL
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
