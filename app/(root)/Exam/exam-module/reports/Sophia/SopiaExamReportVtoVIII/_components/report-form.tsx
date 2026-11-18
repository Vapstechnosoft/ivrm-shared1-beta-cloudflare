'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CollapsibleContent } from '@/components/ui/collapsible';
import { FormError, Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import { getSopiaExamReportTermExam } from '@/server/exam/exam-module/reports/SopiaExamReportTermExam';
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

const sopiaExamReportVtoVIIISchema = z.object({
    asmaY_Id: z.number().min(1, 'Select Academic Year'),
    asmcL_Id: z.number().min(1, 'Select Class'),
    asmS_Id: z.number().min(1, 'Select Section'),
    emE_Id: z.number().min(1, 'Select Exam'),
    studentList: z.array(z.object({ amsT_Id: z.number() })).min(1, 'Select at least one student')
});

type SopiaExamReportVtoVIIISchema = z.infer<typeof sopiaExamReportVtoVIIISchema>;

export default function SopiaExamReportVtoVIIIForm({
    onSuccess
}: {
    onSuccess?: (payload: any) => Promise<void> | void;
}) {
    const methods = useForm<SopiaExamReportVtoVIIISchema>({
        resolver: zodResolver(sopiaExamReportVtoVIIISchema),
        mode: 'all',
        defaultValues: {
            asmaY_Id: 0,
            asmcL_Id: 0,
            asmS_Id: 0,
            emE_Id: 0,
            studentList: []
        }
    });

    const { control, handleSubmit, reset, setValue, formState } = methods;
    const { isSubmitting } = formState;

    const [academicYears, setAcademicYears] = useState<{ asmaY_Id: number; asmaY_Year: string }[]>([]);
    const [classes, setClasses] = useState<{ asmcL_Id: number; asmcL_ClassName: string }[]>([]);
    const [sections, setSections] = useState<{ asmS_Id: number; asmC_SectionName: string }[]>([]);
    const [exams, setExams] = useState<{ emE_Id: number; emE_ExamName: string }[]>([]);
    const [students, setStudents] = useState<{ amsT_Id: number; studentName: string; amsT_AdmNo: string }[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const { data: academicData, error: academicError, isLoading: academicYearLoading } = useAcademicYearDropdown();

    const selectedYear = useWatch({ control, name: 'asmaY_Id' });
    const selectedClass = useWatch({ control, name: 'asmcL_Id' });
    const selectedSection = useWatch({ control, name: 'asmS_Id' });
    const selectedExam = useWatch({ control, name: 'emE_Id' });
    const selectedStudentsList = useWatch({ control, name: 'studentList' });

    const [loadingClasses, setLoadingClasses] = useState(false);
    const [loadingSections, setLoadingSections] = useState(false);
    const [loadingExams, setLoadingExams] = useState(false);
    const [loadingStudents, setLoadingStudents] = useState(false);

    useEffect(() => {
        if (academicError) {
            toast.error(academicError.message || 'Error loading academic years');
            setAcademicYears([]);
        } else if (academicData?.data) {
            setAcademicYears(
                academicData.data.map((i: any) => ({
                    asmaY_Id: i.asmaY_Id ?? 0,
                    asmaY_Year: i.asmaY_Year ?? ''
                }))
            );
        }
    }, [academicData, academicError]);

    useEffect(() => {
        if (!selectedYear) return;
        (async () => {
            try {
                setLoadingClasses(true);
                const { data } = await getClassDropDownByAcademicYearlist(selectedYear);
                setClasses(Array.isArray(data) ? data : []);
                setValue('asmcL_Id', 0);
            } catch {
                toast.error('Failed to load classes');
            } finally {
                setLoadingClasses(false);
            }
        })();
    }, [selectedYear, setValue]);

    useEffect(() => {
        if (!selectedYear || !selectedClass) return;
        (async () => {
            try {
                setLoadingSections(true);
                const { data } = await getSectionsDropDownByAcademicYearandClasslist(selectedYear, selectedClass);
                setSections(Array.isArray(data) ? data : []);
                setValue('asmS_Id', 0);
            } catch {
                toast.error('Failed to load sections');
            } finally {
                setLoadingSections(false);
            }
        })();
    }, [selectedYear, selectedClass, setValue]);

    useEffect(() => {
        if (!selectedYear || !selectedClass || !selectedSection) return;
        (async () => {
            try {
                setLoadingExams(true);
                const { data } = await getExamsDropDownByAcademicYearandClassandSectionlist(selectedYear, selectedClass, selectedSection);
                setExams(Array.isArray(data) ? data.map((i: any) => ({ emE_Id: i.emE_Id, emE_ExamName: i.emE_ExamName })) : []);
                setValue('emE_Id', 0);
            } catch {
                toast.error('Failed to load exams');
            } finally {
                setLoadingExams(false);
            }
        })();
    }, [selectedYear, selectedClass, selectedSection, setValue]);

    useEffect(() => {
        if (!selectedYear || !selectedClass || !selectedSection || !selectedExam) return;
        (async () => {
            try {
                setLoadingStudents(true);
                const { data } = await getStudentsDropDownByAcademicYearandClassandSectionlist(
                    selectedYear,
                    selectedClass,
                    selectedSection
                );
                setStudents(
                    Array.isArray(data)
                        ? data.map((item: any) => ({
                              amsT_Id: item.amsT_Id,
                              studentName:
                                  item.studentName ||
                                  `${item.amsT_FirstName || ''} ${item.amsT_MiddleName || ''} ${item.amsT_LastName || ''}`.trim(),
                              amsT_AdmNo: item.amsT_AdmNo || ''
                          }))
                        : []
                );
                setValue('studentList', []);
            } catch {
                toast.error('Failed to load students');
            } finally {
                setLoadingStudents(false);
            }
        })();
    }, [selectedYear, selectedClass, selectedSection, selectedExam, setValue]);

    const onSubmit = async (data: SopiaExamReportVtoVIIISchema) => {
        try {
            const response = await getSopiaExamReportTermExam(data);

            if (response.success && response.data) {
                if (onSuccess) {
                    await onSuccess(response.data);
                }
            } else {
                toast.error(response.message || 'Failed to fetch report data');
            }
        } catch (err: any) {
            console.error('Error submitting form:', err);
            toast.error(err?.message || 'Unexpected error occurred');
        }
    };

    return (
        <div className='rounded-lg border bg-card text-card-foreground shadow-sm'>
            <CollapsibleContent className='p-6'>
                <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6' noValidate>
                        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                            <div className='space-y-6'>
                                <Controller
                                    control={control}
                                    name='asmaY_Id'
                                    render={({ field, fieldState }) => (
                                        <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                                            <Label className='font-medium text-sm sm:w-32'>
                                                Academic Year <span className='text-red-500'>*</span>
                                            </Label>
                                            <div className='flex-1'>
                                                <Select
                                                    onValueChange={(v) => field.onChange(Number(v))}
                                                    value={field.value ? String(field.value) : ''}>
                                                    <SelectTrigger className='w-full'>
                                                        <SelectValue
                                                            placeholder={academicYearLoading ? 'Loading years...' : 'Select Academic Year'}
                                                        />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {academicYears.map((y) => (
                                                            <SelectItem key={y.asmaY_Id} value={String(y.asmaY_Id)}>
                                                                {y.asmaY_Year}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                            </div>
                                        </div>
                                    )}
                                />

                                <Controller
                                    control={control}
                                    name='asmcL_Id'
                                    render={({ field, fieldState }) => (
                                        <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                                            <Label className='font-medium text-sm sm:w-32'>
                                                Class <span className='text-red-500'>*</span>
                                            </Label>
                                            <div className='flex-1'>
                                                <Select
                                                    onValueChange={(v) => field.onChange(Number(v))}
                                                    value={field.value ? String(field.value) : ''}>
                                                    <SelectTrigger className='w-full'>
                                                        <SelectValue placeholder='Select Class' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {loadingClasses ? (
                                                            <SelectItem value='0' disabled>
                                                                Loading...
                                                            </SelectItem>
                                                        ) : (
                                                            classes.map((c) => (
                                                                <SelectItem key={c.asmcL_Id} value={String(c.asmcL_Id)}>
                                                                    {c.asmcL_ClassName}
                                                                </SelectItem>
                                                            ))
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                            </div>
                                        </div>
                                    )}
                                />

                                <Controller
                                    control={control}
                                    name='asmS_Id'
                                    render={({ field, fieldState }) => (
                                        <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                                            <Label className='font-medium text-sm sm:w-32'>
                                                Section <span className='text-red-500'>*</span>
                                            </Label>
                                            <div className='flex-1'>
                                                <Select
                                                    onValueChange={(v) => field.onChange(Number(v))}
                                                    value={field.value ? String(field.value) : ''}>
                                                    <SelectTrigger className='w-full'>
                                                        <SelectValue placeholder='Select Section' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {loadingSections ? (
                                                            <SelectItem value='0' disabled>
                                                                Loading...
                                                            </SelectItem>
                                                        ) : (
                                                            sections.map((s) => (
                                                                <SelectItem key={s.asmS_Id} value={String(s.asmS_Id)}>
                                                                    {s.asmC_SectionName}
                                                                </SelectItem>
                                                            ))
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                            </div>
                                        </div>
                                    )}
                                />

                                <Controller
                                    control={control}
                                    name='emE_Id'
                                    render={({ field, fieldState }) => (
                                        <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                                            <Label className='font-medium text-sm sm:w-32'>
                                                Exam Name <span className='text-red-500'>*</span>
                                            </Label>
                                            <div className='flex-1'>
                                                <Select
                                                    onValueChange={(v) => field.onChange(Number(v))}
                                                    value={field.value ? String(field.value) : ''}>
                                                    <SelectTrigger className='w-full'>
                                                        <SelectValue placeholder='Select Exam' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {loadingExams ? (
                                                            <SelectItem value='0' disabled>
                                                                Loading...
                                                            </SelectItem>
                                                        ) : (
                                                            exams.map((e) => (
                                                                <SelectItem key={e.emE_Id} value={String(e.emE_Id)}>
                                                                    {e.emE_ExamName}
                                                                </SelectItem>
                                                            ))
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                            </div>
                                        </div>
                                    )}
                                />
                            </div>

                            <div className='space-y-6'>
                                <div className='flex flex-col gap-2 sm:flex-row sm:items-start'>
                                    <Label className='flex items-center gap-2 font-medium text-sm sm:w-32'>
                                        <Checkbox
                                            checked={selectedStudentsList?.length === students.length && students.length > 0}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setValue(
                                                        'studentList',
                                                        students.map((e) => ({ amsT_Id: e.amsT_Id })),
                                                        { shouldValidate: true }
                                                    );
                                                } else {
                                                    setValue('studentList', [], { shouldValidate: true });
                                                }
                                            }}
                                        />
                                        Students <span className='text-red-500'>*</span>
                                    </Label>
                                    <div className='flex-1 rounded-md border'>
                                        <div className='sticky top-0 z-10 border-bottom bg-white p-2'>
                                            <input
                                                type='text'
                                                placeholder='Search student...'
                                                className='w-full rounded border p-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary'
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                        <div className='max-h-48 overflow-y-auto p-4'>
                                            {loadingStudents ? (
                                                <span className='text-muted-foreground text-sm'>Loading students...</span>
                                            ) : students.length === 0 ? (
                                                <span className='text-muted-foreground text-sm'>No students found</span>
                                            ) : (
                                                students
                                                    .filter(
                                                        (s) =>
                                                            s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                            (s.amsT_AdmNo || '').toLowerCase().includes(searchTerm.toLowerCase())
                                                    )
                                                    .map((s) => (
                                                        <div key={s.amsT_Id} className='mb-2 flex items-center space-x-2'>
                                                            <Checkbox
                                                                id={`student-${s.amsT_Id}`}
                                                                checked={selectedStudentsList?.some((val) => val.amsT_Id === s.amsT_Id)}
                                                                onCheckedChange={(checked) => {
                                                                    const current = selectedStudentsList || [];
                                                                    if (checked) {
                                                                        setValue('studentList', [...current, { amsT_Id: s.amsT_Id }], {
                                                                            shouldValidate: true
                                                                        });
                                                                    } else {
                                                                        setValue(
                                                                            'studentList',
                                                                            current.filter((v) => v.amsT_Id !== s.amsT_Id),
                                                                            { shouldValidate: true }
                                                                        );
                                                                    }
                                                                }}
                                                            />
                                                            <Label
                                                                htmlFor={`student-${s.amsT_Id}`}
                                                                className='font-medium text-sm leading-none'>
                                                                {s.studentName} {s.amsT_AdmNo ? `/ ${s.amsT_AdmNo}` : ''}
                                                            </Label>
                                                        </div>
                                                    ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='mt-6 flex justify-center gap-3'>
                            <Button type='submit' isLoading={isSubmitting} disabled={isSubmitting} className='min-w-[120px]'>
                                Report
                            </Button>
                            <Button type='button' variant='outline' onClick={() => reset()} className='min-w-[100px]'>
                                Clear
                            </Button>
                        </div>
                    </form>
                </FormProvider>
            </CollapsibleContent>
        </div>
    );
}
