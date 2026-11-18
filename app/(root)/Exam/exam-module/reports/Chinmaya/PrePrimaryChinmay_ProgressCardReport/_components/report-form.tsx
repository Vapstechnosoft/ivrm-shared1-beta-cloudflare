'use client';

import { Button } from '@/components/ui/button';
import { CustomMultiSelectBox } from '@/components/ui/custom-multiselect';
import { DatePicker } from '@/components/ui/date-picker';
import { FormError, Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import {
    getClassDropDownByAcademicYearlist,
    getExamsDropDownByAcademicYearandClassandSectionlist,
    getSectionsDropDownByAcademicYearandClasslist,
    getStudentsDropDownByAcademicYearandClassandSectionlist
} from '@/server/exam/exam-module/reports/cumulative-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const prePrimaryChinmaySchema = z.object({
    asmaY_Id: z.number().min(1, 'Select Academic Year'),
    asmcL_Id: z.number().min(1, 'Select Class'),
    asmS_Id: z.number().min(1, 'Select Section'),
    amsT_Id: z.number().min(1, 'Select Student'),
    reopen_date: z.date({ required_error: 'Select Reopen Date' }),
    selectedExamIds: z.array(z.string()).min(1, 'Select at least one exam')
});

type PrePrimaryChinmaySchema = z.infer<typeof prePrimaryChinmaySchema>;

interface PrePrimaryChinmayReportFormProps {
    onSuccess: (data: { apiData: any; payload: any; academicYears: any[]; students: any[] }) => void;
}

export function PrePrimaryChinmayReportForm({ onSuccess }: PrePrimaryChinmayReportFormProps) {
    const methods = useForm<PrePrimaryChinmaySchema>({
        resolver: zodResolver(prePrimaryChinmaySchema),
        defaultValues: {
            asmaY_Id: 0,
            asmcL_Id: 0,
            asmS_Id: 0,
            amsT_Id: 0,
            selectedExamIds: [],
            reopen_date: new Date('2026-05-13')
        }
    });

    const { control, handleSubmit, setValue, reset, formState } = methods;
    const { isSubmitting } = formState;

    const [classes, setClasses] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [exams, setExams] = useState<any[]>([]);

    const { data: academicData, isLoading: academicLoading } = useAcademicYearDropdown();
    const academicYears = academicData?.data || [];

    const selectedYear = useWatch({ control, name: 'asmaY_Id' });
    const selectedClass = useWatch({ control, name: 'asmcL_Id' });
    const selectedSection = useWatch({ control, name: 'asmS_Id' });

    useEffect(() => {
        if (selectedYear && selectedYear !== 0) {
            getClassDropDownByAcademicYearlist(selectedYear).then((res: any) => {
                setClasses(Array.isArray(res.data) ? res.data : []);
                setValue('asmcL_Id', 0);
                setValue('asmS_Id', 0);
                setValue('amsT_Id', 0);
                setSections([]);
                setStudents([]);
                setExams([]);
            });
        }
    }, [selectedYear, setValue]);

    useEffect(() => {
        if (selectedYear && selectedClass && selectedClass !== 0) {
            getSectionsDropDownByAcademicYearandClasslist(selectedYear, selectedClass).then((res: any) => {
                setSections(Array.isArray(res.data) ? res.data : []);
                setValue('asmS_Id', 0);
                setValue('amsT_Id', 0);
                setStudents([]);
                setExams([]);
            });
        }
    }, [selectedYear, selectedClass, setValue]);

    useEffect(() => {
        if (selectedYear && selectedClass && selectedSection && selectedSection !== 0) {
            getStudentsDropDownByAcademicYearandClassandSectionlist(selectedYear, selectedClass, selectedSection).then((res: any) => {
                setStudents(Array.isArray(res.data) ? res.data : []);
                setValue('amsT_Id', 0);
            });
            getExamsDropDownByAcademicYearandClassandSectionlist(selectedYear, selectedClass, selectedSection).then((res: any) => {
                setExams(Array.isArray(res.data) ? res.data : []);
            });
        }
    }, [selectedYear, selectedClass, selectedSection, setValue]);

    const onSubmit = async (values: PrePrimaryChinmaySchema) => {
        try {
            const selectedExamList = exams
                .filter((e) => values.selectedExamIds.includes(String(e.emE_Id)))
                .map((e) => ({ EME_Id: e.emE_Id, EME_ExamName: e.emE_ExamName }));

            const payload = {
                ...values,
                examlist: selectedExamList
            };

            onSuccess({ apiData: null, payload, academicYears, students });
        } catch (error) {
            toast.error('Failed to generate report');
        }
    };

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6' noValidate>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
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
                                    <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value ? String(field.value) : ''}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='--Select Class--' />
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
                                    <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value ? String(field.value) : ''}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='--Select Section--' />
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

                    {/* Student */}
                    <div className='space-y-2'>
                        <Label>
                            Student <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            name='amsT_Id'
                            control={control}
                            render={({ field, fieldState }) => (
                                <>
                                    <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value ? String(field.value) : ''}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='--Select Student--' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {students.map((stu: any) => (
                                                <SelectItem key={stu.amsT_Id} value={String(stu.amsT_Id)}>
                                                    {stu.studentName ||
                                                        `${stu.amsT_FirstName || ''} ${stu.amsT_MiddleName || ''} ${stu.amsT_LastName || ''}`.trim()}
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
                        <Label>
                            Reopen Date <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            name='reopen_date'
                            control={control}
                            render={({ field, fieldState }) => (
                                <div>
                                    <DatePicker date={field.value} setDate={field.onChange} />
                                    {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                </div>
                            )}
                        />
                    </div>

                    {/* Exam Multi-select */}
                    <div className='space-y-2 lg:col-span-3'>
                        <Label>
                            Exam <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            name='selectedExamIds'
                            control={control}
                            render={({ field, fieldState }) => (
                                <CustomMultiSelectBox
                                    options={exams.map((e) => ({ label: e.emE_ExamName, value: String(e.emE_Id) }))}
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder='--Select Exams--'
                                    height='150px'
                                    error={fieldState.error?.message}
                                />
                            )}
                        />
                    </div>
                </div>

                <div className='flex justify-center gap-4 border-t pt-6'>
                    <Button type='submit' isLoading={isSubmitting} disabled={isSubmitting} className='min-w-[120px]'>
                        {isSubmitting ? 'Generating...' : 'Report'}
                    </Button>
                    <Button
                        type='button'
                        variant='secondary'
                        onClick={() =>
                            onSuccess({
                                apiData: null,
                                payload: {
                                    asmaY_Id: 1,
                                    amsT_Id: 1,
                                    reopen_date: new Date(),
                                    examlist: [
                                        { EME_Id: 1, EME_ExamName: 'TERM 1' },
                                        { EME_Id: 2, EME_ExamName: 'TERM 2' }
                                    ]
                                },
                                academicYears: [],
                                students: []
                            })
                        }>
                        Preview Mock
                    </Button>
                    <Button type='button' variant='outline' onClick={() => reset()} className='min-w-[100px]'>
                        Clear
                    </Button>
                </div>
            </form>
        </FormProvider>
    );
}
