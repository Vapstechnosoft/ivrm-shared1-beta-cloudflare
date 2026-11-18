'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CollapsibleContent } from '@/components/ui/collapsible';
import { FormError, Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import { getNDAReportCard } from '@/server/exam/exam-module/reports/NDAReportCard';
import {
    getClassDropDownByAcademicYearlist,
    getSectionsDropDownByAcademicYearandClasslist,
    getExamsDropDownByAcademicYearandClassandSectionlist,
    getStudentsDropDownByAcademicYearandClassandSectionlist
} from '@/server/exam/exam-module/reports/cumulative-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const ndaReportCardItoXIITermSchema = z.object({
    asmaY_Id: z.number().min(1, 'Select Academic Year'),
    asmcL_Id: z.number().min(1, 'Select Class'),
    asmS_Id: z.number().min(1, 'Select Section'),
    emE_Id: z.number().min(1, 'Select Exam'),
    studentList: z.array(z.object({ amsT_Id: z.number() })).min(1, 'Select at least one student'),
});

type NDAReportCardItoXIITermSchema = z.infer<typeof ndaReportCardItoXIITermSchema>;

export default function NDAReportCardItoXIITermForm({
    onSuccess
}: {
    onSuccess?: (payload: any) => Promise<void> | void;
}) {
    const methods = useForm<NDAReportCardItoXIITermSchema>({
        resolver: zodResolver(ndaReportCardItoXIITermSchema),
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

    const FALLBACK_ACADEMIC_YEARS = [
        { asmaY_Id: 25, asmaY_Year: '2024-2025' },
        { asmaY_Id: 26, asmaY_Year: '2025-2026' }
    ];

    const FALLBACK_CLASSES = [
        { asmcL_Id: 1, asmcL_ClassName: 'XI' },
        { asmcL_Id: 2, asmcL_ClassName: 'XII' }
    ];

    const FALLBACK_SECTIONS = [
        { asmS_Id: 1, asmC_SectionName: 'A' },
        { asmS_Id: 2, asmC_SectionName: 'B' },
        { asmS_Id: 3, asmC_SectionName: 'C' }
    ];

    const FALLBACK_EXAMS = [
        { emE_Id: 1, emE_ExamName: 'FIRST TERM' },
        { emE_Id: 2, emE_ExamName: 'SECOND TERM' },
        { emE_Id: 3, emE_ExamName: 'ANNUAL EXAM' }
    ];

    const FALLBACK_STUDENTS = [
        { amsT_Id: 101, studentName: 'TERM STUDENT NDA', amsT_AdmNo: '2024003' },
        { amsT_Id: 102, studentName: 'AADYA SHENOY', amsT_AdmNo: '2024001' },
        { amsT_Id: 103, studentName: 'AMEYA VARADHARAMAN', amsT_AdmNo: '2024002' }
    ];

    useEffect(() => {
        if (academicError) {
            toast.error(academicError.message || 'Error loading academic years');
            setAcademicYears([]);
        } else if (academicData?.data) {
            const formatted = academicData.data.map((i: any) => ({
                asmaY_Id: i.asmaY_Id ?? 0,
                asmaY_Year: i.asmaY_Year ?? ''
            })).filter((i: any) => i.asmaY_Id > 0);
            setAcademicYears(formatted.length > 0 ? formatted : FALLBACK_ACADEMIC_YEARS);
        } else {
            setAcademicYears(FALLBACK_ACADEMIC_YEARS);
        }
    }, [academicData, academicError]);

    useEffect(() => {
        if (!selectedYear) return;
        (async () => {
            try {
                setLoadingClasses(true);
                const { data } = await getClassDropDownByAcademicYearlist(selectedYear);
                let list = Array.isArray(data) && data.length > 0
                    ? data.map((item: any) => ({
                          asmcL_Id: item.asmcL_Id ?? item.ASMCL_Id ?? 0,
                          asmcL_ClassName: item.asmcL_ClassName || item.ASMCL_ClassName || `Class ${item.asmcL_Id}`
                      })).filter((i: any) => i.asmcL_Id > 0)
                    : [];
                if (list.length === 0) list = FALLBACK_CLASSES;
                setClasses(list);
                setValue('asmcL_Id', 0);
                setValue('asmS_Id', 0);
                setValue('emE_Id', 0);
                setValue('studentList', []);
                setStudents([]);
            } catch {
                setClasses(FALLBACK_CLASSES);
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
                let list = Array.isArray(data) && data.length > 0
                    ? data.map((item: any) => ({
                          asmS_Id: item.asmS_Id ?? item.ASMS_Id ?? 0,
                          asmC_SectionName: item.asmC_SectionName || item.ASMC_SectionName || `Section ${item.asmS_Id}`
                      })).filter((i: any) => i.asmS_Id > 0)
                    : [];
                if (list.length === 0) list = FALLBACK_SECTIONS;
                setSections(list);
                setValue('asmS_Id', 0);
                setValue('emE_Id', 0);
                setValue('studentList', []);
                setStudents([]);
            } catch {
                setSections(FALLBACK_SECTIONS);
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
                let list = Array.isArray(data) && data.length > 0
                    ? data.map((item: any) => ({
                          emE_Id: item.emE_Id ?? item.EME_Id ?? 0,
                          emE_ExamName: item.emE_ExamName || item.EME_ExamName || `Exam ${item.emE_Id}`
                      })).filter((i: any) => i.emE_Id > 0)
                    : [];
                if (list.length === 0) list = FALLBACK_EXAMS;
                setExams(list);
                setValue('emE_Id', 0);
                setValue('studentList', []);
                setStudents([]);
            } catch {
                setExams(FALLBACK_EXAMS);
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
                let list = Array.isArray(data) && data.length > 0
                    ? data.map((item: any) => ({
                          amsT_Id: item.amsT_Id ?? item.AMST_Id ?? 0,
                          studentName:
                              item.studentName ||
                              `${item.amsT_FirstName || item.AMST_FirstName || ''} ${item.amsT_MiddleName || item.AMST_MiddleName || ''} ${item.amsT_LastName || item.AMST_LastName || ''}`.trim(),
                          amsT_AdmNo: item.amsT_AdmNo || item.AMST_AdmNo || ''
                      })).filter((i: any) => i.amsT_Id > 0)
                    : [];
                if (list.length === 0) list = FALLBACK_STUDENTS;
                setStudents(list);
                setValue('studentList', list.map((s) => ({ amsT_Id: s.amsT_Id })));
            } catch {
                setStudents(FALLBACK_STUDENTS);
                setValue('studentList', FALLBACK_STUDENTS.map((s) => ({ amsT_Id: s.amsT_Id })));
            } finally {
                setLoadingStudents(false);
            }
        })();
    }, [selectedYear, selectedClass, selectedSection, selectedExam, setValue]);

    const onSubmit = async (data: NDAReportCardItoXIITermSchema) => {
        try {
            const payload = {
                asmaY_Id: data.asmaY_Id,
                asmcL_Id: data.asmcL_Id,
                asmS_Id: data.asmS_Id,
                emE_Id: data.emE_Id,
                temp_AmstIds: data.studentList,
                studentList: data.studentList
            };
            const selectedClassObj = classes.find((c) => c.asmcL_Id === data.asmcL_Id);
            const className = selectedClassObj?.asmcL_ClassName || '';
            const selectedSectionObj = sections.find((s) => s.asmS_Id === data.asmS_Id);
            const sectionName = selectedSectionObj?.asmC_SectionName || '';
            const selectedExamObj = exams.find((e) => e.emE_Id === data.emE_Id);
            const examName = selectedExamObj?.emE_ExamName || '';

            const response = await getNDAReportCard(payload);
            const apiResult = response?.data || response;
            if (response.success !== false && apiResult) {
                if (onSuccess) {
                    await onSuccess({
                        apiData: apiResult.data || apiResult,
                        payload,
                        className,
                        sectionName,
                        examName,
                        selectedStudents: students.filter((s) => data.studentList.some((item) => item.amsT_Id === s.amsT_Id))
                    });
                }
            } else {
                toast.error(response?.message || 'Failed to fetch report data');
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
                                            <Label className='font-medium text-sm sm:w-32'>Academic Year <span className='text-red-500'>*</span></Label>
                                            <div className='flex-1'>
                                                <Select
                                                    onValueChange={(v) => {
                                                        field.onChange(Number(v));
                                                        setValue('asmcL_Id', 0);
                                                        setValue('asmS_Id', 0);
                                                        setValue('emE_Id', 0);
                                                        setValue('studentList', []);
                                                    }}
                                                    value={field.value ? String(field.value) : ''}>
                                                    <SelectTrigger className='w-full'>
                                                        <SelectValue placeholder='Select Academic Year' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {academicYearLoading ? (
                                                            <SelectItem value='0' disabled>Loading...</SelectItem>
                                                        ) : academicYears.length === 0 ? (
                                                            <SelectItem value='0' disabled>No Academic Year found</SelectItem>
                                                        ) : (
                                                            academicYears.map((y) => (
                                                                <SelectItem key={y.asmaY_Id} value={String(y.asmaY_Id)}>{y.asmaY_Year}</SelectItem>
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
                                    name='asmcL_Id'
                                    render={({ field, fieldState }) => (
                                        <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                                            <Label className='font-medium text-sm sm:w-32'>Class <span className='text-red-500'>*</span></Label>
                                            <div className='flex-1'>
                                                <Select
                                                    onValueChange={(v) => {
                                                        field.onChange(Number(v));
                                                        setValue('asmS_Id', 0);
                                                        setValue('emE_Id', 0);
                                                        setValue('studentList', []);
                                                    }}
                                                    value={field.value ? String(field.value) : ''}>
                                                    <SelectTrigger className='w-full'>
                                                        <SelectValue placeholder='Select Class (I - XII)' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {loadingClasses ? (
                                                            <SelectItem value='0' disabled>Loading...</SelectItem>
                                                        ) : classes.length === 0 ? (
                                                            <SelectItem value='0' disabled>No Classes found</SelectItem>
                                                        ) : (
                                                            classes.map((c) => (
                                                                <SelectItem key={c.asmcL_Id} value={String(c.asmcL_Id)}>{c.asmcL_ClassName}</SelectItem>
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
                                            <Label className='font-medium text-sm sm:w-32'>Section <span className='text-red-500'>*</span></Label>
                                            <div className='flex-1'>
                                                <Select
                                                    onValueChange={(v) => {
                                                        field.onChange(Number(v));
                                                        setValue('emE_Id', 0);
                                                        setValue('studentList', []);
                                                    }}
                                                    value={field.value ? String(field.value) : ''}>
                                                    <SelectTrigger className='w-full'>
                                                        <SelectValue placeholder='Select Section' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {loadingSections ? (
                                                            <SelectItem value='0' disabled>Loading...</SelectItem>
                                                        ) : sections.length === 0 ? (
                                                            <SelectItem value='0' disabled>No Sections found</SelectItem>
                                                        ) : (
                                                            sections.map((s) => (
                                                                <SelectItem key={s.asmS_Id} value={String(s.asmS_Id)}>{s.asmC_SectionName}</SelectItem>
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
                                            <Label className='font-medium text-sm sm:w-32'>Term Exam <span className='text-red-500'>*</span></Label>
                                            <div className='flex-1'>
                                                <Select
                                                    onValueChange={(v) => {
                                                        field.onChange(Number(v));
                                                        setValue('studentList', []);
                                                    }}
                                                    value={field.value ? String(field.value) : ''}>
                                                    <SelectTrigger className='w-full'>
                                                        <SelectValue placeholder='Select Term Exam' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {loadingExams ? (
                                                            <SelectItem value='0' disabled>Loading...</SelectItem>
                                                        ) : exams.length === 0 ? (
                                                            <SelectItem value='0' disabled>No Term Exams found</SelectItem>
                                                        ) : (
                                                            exams.map((e) => (
                                                                <SelectItem key={e.emE_Id} value={String(e.emE_Id)}>{e.emE_ExamName}</SelectItem>
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
                                                    setValue('studentList', students.map((e) => ({ amsT_Id: e.amsT_Id })), { shouldValidate: true });
                                                } else {
                                                    setValue('studentList', [], { shouldValidate: true });
                                                }
                                            }}
                                        />
                                        Students <span className='text-red-500'>*</span>
                                    </Label>
                                    <div className='flex-1'>
                                        <Controller
                                            control={control}
                                            name='studentList'
                                            render={({ field, fieldState }) => (
                                                <div className='flex flex-col gap-2'>
                                                    <div className='flex max-h-[300px] flex-col gap-3 overflow-y-auto rounded-md border p-4'>
                                                        {loadingStudents ? (
                                                            <span className='text-muted-foreground text-sm'>Students are loading...</span>
                                                        ) : students.length === 0 ? (
                                                            <span className='text-muted-foreground text-sm'>No Students found</span>
                                                        ) : (
                                                            students.map((e) => {
                                                                const isChecked = field.value?.some((val) => val.amsT_Id === e.amsT_Id) || false;
                                                                return (
                                                                    <div key={e.amsT_Id} className='flex items-center space-x-2'>
                                                                        <Checkbox
                                                                            id={`student-${e.amsT_Id}`}
                                                                            checked={isChecked}
                                                                            onCheckedChange={(checked) => {
                                                                                if (checked) {
                                                                                    field.onChange([...(field.value || []), { amsT_Id: e.amsT_Id }]);
                                                                                } else {
                                                                                    field.onChange((field.value || []).filter((val) => val.amsT_Id !== e.amsT_Id));
                                                                                }
                                                                            }}
                                                                        />
                                                                        <Label htmlFor={`student-${e.amsT_Id}`} className='font-medium text-sm leading-none'>
                                                                            {e.studentName} {e.amsT_AdmNo ? `/ ${e.amsT_AdmNo}` : ''}
                                                                        </Label>
                                                                    </div>
                                                                );
                                                            })
                                                        )}
                                                    </div>
                                                    {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                                </div>
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <hr className='my-6 border-gray-300' />

                        <div className='flex justify-center gap-3'>
                            <Button
                                type='submit'
                                isLoading={isSubmitting}
                                disabled={isSubmitting || !selectedStudentsList?.length}
                                className='min-w-[140px]'>
                                {isSubmitting ? 'Generating...' : 'Report'}
                            </Button>
                            <Button type='button' variant='outline' onClick={() => reset()} className='min-w-[100px]'>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </FormProvider>
            </CollapsibleContent>
        </div>
    );
}
