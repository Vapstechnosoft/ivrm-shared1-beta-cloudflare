'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { FormError, Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import {
    getClassDropDownByAcademicYearlist,
    getExamsDropDownByAcademicYearandClassandSectionlist,
    getSectionsDropDownByAcademicYearandClasslist
} from '@/server/exam/exam-module/reports/cumulative-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const finalPromReportLESSchema = z.object({
    asmaY_Id: z.number().min(1, 'Select Academic Year'),
    asmcL_Id: z.number().min(1, 'Select Class'),
    asmS_Id: z.number().min(1, 'Select Section'),
    reopen_date: z.date().optional(),
    overAlltotal: z.boolean().default(false),
    overAlClass: z.boolean().default(false),
    ecTEX_NotApplToTotalFlg: z.boolean().default(false)
});

type FinalPromReportLESSchema = z.infer<typeof finalPromReportLESSchema>;

interface FinalPromReportLESFormProps {
    onSuccess: (data: { apiData: any; payload: any; academicYears: any[]; type?: string }) => void;
}

export function FinalPromReportLESForm({ onSuccess }: FinalPromReportLESFormProps) {
    const methods = useForm<FinalPromReportLESSchema>({
        resolver: zodResolver(finalPromReportLESSchema),
        defaultValues: {
            asmaY_Id: 0,
            asmcL_Id: 0,
            asmS_Id: 0,
            reopen_date: new Date(),
            overAlltotal: false,
            overAlClass: false,
            ecTEX_NotApplToTotalFlg: false
        }
    });

    const { control, handleSubmit, setValue, reset, formState } = methods;
    const { isSubmitting } = formState;

    const [classes, setClasses] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [exams, setExams] = useState<any[]>([]);

    // Loading States
    const [classLoading, setClassLoading] = useState(false);
    const [sectionLoading, setSectionLoading] = useState(false);

    const { data: academicData, isLoading: academicLoading } = useAcademicYearDropdown();
    const academicYears = academicData?.data || [];

    const selectedYear = useWatch({ control, name: 'asmaY_Id' });
    const selectedClass = useWatch({ control, name: 'asmcL_Id' });
    const selectedSection = useWatch({ control, name: 'asmS_Id' });

    useEffect(() => {
        if (selectedYear && selectedYear !== 0) {
            setClassLoading(true);
            getClassDropDownByAcademicYearlist(selectedYear)
                .then((res: any) => {
                    const data = Array.isArray(res.data) ? res.data : [];
                    setClasses(data);
                    // Reset dependent fields
                    setValue('asmcL_Id', 0, { shouldValidate: false });
                    setValue('asmS_Id', 0, { shouldValidate: false });
                    setSections([]);
                })
                .finally(() => setClassLoading(false));
        }
    }, [selectedYear, setValue]);

    useEffect(() => {
        if (selectedYear && selectedClass && selectedClass !== 0) {
            setSectionLoading(true);
            getSectionsDropDownByAcademicYearandClasslist(selectedYear, selectedClass)
                .then((res: any) => {
                    const data = Array.isArray(res.data) ? res.data : [];
                    setSections(data);
                    setValue('asmS_Id', 0, { shouldValidate: false });
                })
                .finally(() => setSectionLoading(false));
        } else {
            setSections([]);
            setValue('asmS_Id', 0, { shouldValidate: false });
        }
    }, [selectedYear, selectedClass, setValue]);

    useEffect(() => {
        if (selectedYear && selectedClass && selectedSection && selectedSection !== 0) {
            getExamsDropDownByAcademicYearandClassandSectionlist(selectedYear, selectedClass, selectedSection).then((res: any) => {
                setExams(Array.isArray(res.data) ? res.data : []);
            });
        }
    }, [selectedYear, selectedClass, selectedSection]);

    const onSubmit = async (values: FinalPromReportLESSchema, type: 'report' | 'print') => {
        try {
            const payload = {
                ...values,
                examlist: exams.map((e) => ({ emE_Id: e.emE_Id, emE_ExamName: e.emE_ExamName, emE_ExamCode: e.emE_ExamCode }))
            };

            onSuccess({ apiData: null, payload, academicYears, type });
        } catch (error) {
            toast.error('Failed to generate report');
        }
    };

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit((v) => onSubmit(v, 'report'))} className='space-y-6' noValidate>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
                    {/* Academic Year */}
                    <div className='space-y-2'>
                        <Label>
                            Academic Year <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            name='asmaY_Id'
                            control={control}
                            render={({ field, fieldState }) => (
                                <>
                                    <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value ? String(field.value) : ''}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='--Select Year--' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {academicLoading ? (
                                                <SelectItem value='0' disabled>
                                                    Loading...
                                                </SelectItem>
                                            ) : (
                                                academicYears.map((year: any) => (
                                                    <SelectItem key={year.asmaY_Id} value={String(year.asmaY_Id)}>
                                                        {year.asmaY_Year}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                </>
                            )}
                        />
                    </div>

                    {/* Class */}
                    <div className='space-y-2'>
                        <Label>
                            Class <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            name='asmcL_Id'
                            control={control}
                            render={({ field, fieldState }) => (
                                <>
                                    <Select
                                        onValueChange={(v) => field.onChange(Number(v))}
                                        value={field.value ? String(field.value) : ''}
                                        disabled={classLoading}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={classLoading ? 'Loading...' : '--Select Class--'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {classes.map((cls: any) => (
                                                <SelectItem key={cls.asmcL_Id} value={String(cls.asmcL_Id)}>
                                                    {cls.asmcL_ClassName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                </>
                            )}
                        />
                    </div>

                    {/* Section */}
                    <div className='space-y-2'>
                        <Label>
                            Section <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            name='asmS_Id'
                            control={control}
                            render={({ field, fieldState }) => (
                                <>
                                    <Select
                                        onValueChange={(v) => field.onChange(Number(v))}
                                        value={field.value ? String(field.value) : ''}
                                        disabled={sectionLoading}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={sectionLoading ? 'Loading...' : '--Select Section--'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {sections.map((sec: any) => (
                                                <SelectItem key={sec.asmS_Id} value={String(sec.asmS_Id)}>
                                                    {sec.asmC_SectionName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                </>
                            )}
                        />
                    </div>

                    {/* Reopen Date */}
                    <div className='space-y-2'>
                        <Label>Reopen Date</Label>
                        <Controller
                            name='reopen_date'
                            control={control}
                            render={({ field }) => <DatePicker date={field.value} setDate={field.onChange} />}
                        />
                    </div>
                </div>

                <div className='grid grid-cols-1 gap-6 pt-2 md:grid-cols-3'>
                    <div className='flex items-center space-x-2'>
                        <Controller
                            name='overAlltotal'
                            control={control}
                            render={({ field }) => <Checkbox id='overAlltotal' checked={field.value} onCheckedChange={field.onChange} />}
                        />
                        <Label htmlFor='overAlltotal'>OverAll Total Grade ?</Label>
                    </div>
                    <div className='flex items-center space-x-2'>
                        <Controller
                            name='overAlClass'
                            control={control}
                            render={({ field }) => <Checkbox id='overAlClass' checked={field.value} onCheckedChange={field.onChange} />}
                        />
                        <Label htmlFor='overAlClass'>OverAll Class-Section Rank ?</Label>
                    </div>
                    <div className='flex items-center space-x-2'>
                        <Controller
                            name='ecTEX_NotApplToTotalFlg'
                            control={control}
                            render={({ field }) => (
                                <Checkbox id='ecTEX_NotApplToTotalFlg' checked={field.value} onCheckedChange={field.onChange} />
                            )}
                        />
                        <Label htmlFor='ecTEX_NotApplToTotalFlg'>Exam Wise Remarks ?</Label>
                    </div>
                </div>

                <div className='flex justify-center gap-4 border-t pt-6'>
                    <Button type='submit' isLoading={isSubmitting} disabled={isSubmitting} className='min-w-[120px]'>
                        Report
                    </Button>
                    <Button type='button' variant='outline' onClick={() => window.location.reload()} className='min-w-[100px]'>
                        Cancel
                    </Button>
                    <Button type='button' variant='outline' onClick={handleSubmit((v) => onSubmit(v, 'print'))} className='min-w-[100px]'>
                        Print
                    </Button>
                </div>
            </form>
        </FormProvider>
    );
}
