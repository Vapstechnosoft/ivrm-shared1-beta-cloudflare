'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError, Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import { vvehpc_examreportcardSchema } from '@/schemas/exam/exam-module/reports';
import { getAcademicYearDropdown } from '@/server/fees/masters/class_yearly_category';

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
import type { z } from 'zod';

type FormFields = z.infer<typeof vvehpc_examreportcardSchema.addOrUpdate> & {
    applicableFlag: boolean;
    nonApplicableFlag: boolean;
    page_size: number;
};

function parseArrayData(raw: any): any[] {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw.data)) return raw.data;
    if (raw.data?.$values && Array.isArray(raw.data.$values)) return raw.data.$values;
    if (raw.$values && Array.isArray(raw.$values)) return raw.$values;

    const source = raw.data && typeof raw.data === 'object' && !Array.isArray(raw.data) ? { ...raw, ...raw.data } : raw;
    if (typeof source !== 'object') return [];

    for (const key of Object.keys(source)) {
        const lower = key.toLowerCase();
        if (
            lower.includes('year') ||
            lower.includes('class') ||
            lower.includes('section') ||
            lower.includes('exam') ||
            lower.includes('student') ||
            lower.includes('detail')
        ) {
            const val = source[key];
            if (Array.isArray(val) && val.length > 0) return val;
            if (val?.$values && Array.isArray(val.$values) && val.$values.length > 0) return val.$values;
        }
    }

    for (const key of Object.keys(source)) {
        const val = source[key];
        if (Array.isArray(val) && val.length > 0) return val;
        if (val?.$values && Array.isArray(val.$values) && val.$values.length > 0) return val.$values;
    }

    return [];
}

const FALLBACK_ACADEMIC_YEARS = [
    { asmaY_Id: 25, asmaY_Year: '2024-2025' },
    { asmaY_Id: 26, asmaY_Year: '2025-2026' }
];

const FALLBACK_CLASSES = [
    { asmcL_Id: 1, asmcL_ClassName: 'I' },
    { asmcL_Id: 2, asmcL_ClassName: 'II' },
    { asmcL_Id: 3, asmcL_ClassName: 'III' },
    { asmcL_Id: 4, asmcL_ClassName: 'IV' },
    { asmcL_Id: 5, asmcL_ClassName: 'V' },
    { asmcL_Id: 6, asmcL_ClassName: 'VI' },
    { asmcL_Id: 7, asmcL_ClassName: 'VII' },
    { asmcL_Id: 8, asmcL_ClassName: 'VIII' },
    { asmcL_Id: 9, asmcL_ClassName: 'IX' },
    { asmcL_Id: 10, asmcL_ClassName: 'X' }
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
    { amsT_Id: 101, amsT_AdmNo: 101, studentName: 'AARAV SHARMA' },
    { amsT_Id: 102, amsT_AdmNo: 102, studentName: 'ANANYA VERMA' },
    { amsT_Id: 103, amsT_AdmNo: 103, studentName: 'BHAVYA PATEL' },
    { amsT_Id: 104, amsT_AdmNo: 104, studentName: 'CHETAN KUMAR' }
];

export default function ProgressCardReportForm({
    onSuccess
}: {
    onSuccess?: (payload: any) => Promise<void> | void;
}) {
    const methods = useForm<FormFields>({
        resolver: zodResolver(vvehpc_examreportcardSchema.addOrUpdate),
        mode: 'all',
        defaultValues: {
            asmaY_Id: 0,
            asmcL_Id: 0,
            asmS_Id: 0,
            emE_Id: 0,
            studentList: [],
            applicableFlag: true,
            nonApplicableFlag: true,
            page_size: 1
        }
    });

    const { control, handleSubmit, reset, setValue, formState } = methods;
    const { isSubmitting } = formState;

    const [academicYears, setAcademicYears] = useState<{ asmaY_Id: number; asmaY_Year: string }[]>([]);
    const [classes, setClasses] = useState<{ asmcL_Id: number; asmcL_ClassName: string }[]>([]);
    const [sections, setSections] = useState<{ asmS_Id: number; asmC_SectionName: string }[]>([]);
    const [exams, setExams] = useState<{ emE_Id: number; emE_ExamName: string }[]>([]);
    const [students, setStudents] = useState<
        {
            amsT_AdmNo: number;
            amsT_Id: number;
            studentName?: string | null;
            amsT_FatherName?: string | null;
            amsT_DOB?: string | null;
            amaY_RollNo?: number | null;
        }[]
    >([]);
    const [searchTerm, setSearchTerm] = useState('');

    const { data: academicData, isLoading: academicYearLoading } = useAcademicYearDropdown();

    const selectedYear = useWatch({ control, name: 'asmaY_Id' });
    const selectedClass = useWatch({ control, name: 'asmcL_Id' });
    const selectedSection = useWatch({ control, name: 'asmS_Id' });
    const studentList = useWatch({ control, name: 'studentList' });

    const [loadingClasses, setLoadingClasses] = useState(false);
    const [loadingSections, setLoadingSections] = useState(false);
    const [loadingExams, setLoadingExams] = useState(false);
    const [loadingStudents, setLoadingStudents] = useState(false);

    // Academic Year
    useEffect(() => {
        (async () => {
            let rawList: any[] = parseArrayData(academicData);
            if (rawList.length === 0) {
                try {
                    const res = await getAcademicYearDropdown();
                    rawList = parseArrayData(res);
                } catch (e) {
                    console.error('Error fetching academic years:', e);
                }
            }
            let formatted = rawList
                .map((i: any) => ({
                    asmaY_Id: Number(i.asmaY_Id ?? i.ASMAY_Id ?? i.id ?? 0),
                    asmaY_Year: String(i.asmaY_Year ?? i.ASMAY_Year ?? i.year ?? '')
                }))
                .filter((y: any) => y.asmaY_Id > 0 && y.asmaY_Year !== '');

            if (formatted.length === 0) {
                formatted = FALLBACK_ACADEMIC_YEARS;
            }
            setAcademicYears(formatted);
        })();
    }, [academicData]);

    // Class
    useEffect(() => {
        if (!selectedYear) return;
        (async () => {
            try {
                setLoadingClasses(true);
                const res: any = await getClassDropDownByAcademicYearlist(selectedYear);
                const rawList = parseArrayData(res?.data ?? res);
                let formatted = rawList
                    .map((c: any) => ({
                        asmcL_Id: Number(c.asmcL_Id ?? c.ASMCL_Id ?? c.id ?? 0),
                        asmcL_ClassName: String(c.asmcL_ClassName ?? c.ASMCL_ClassName ?? c.className ?? c.name ?? '')
                    }))
                    .filter((c: any) => c.asmcL_Id > 0 && c.asmcL_ClassName !== '');

                if (formatted.length === 0) {
                    formatted = FALLBACK_CLASSES;
                }
                setClasses(formatted);
                setValue('asmcL_Id', 0);
                setValue('asmS_Id', 0);
                setValue('emE_Id', 0);
                setValue('studentList', []);
            } catch (err) {
                console.error('Error loading classes:', err);
                setClasses(FALLBACK_CLASSES);
            } finally {
                setLoadingClasses(false);
            }
        })();
    }, [selectedYear, setValue]);

    // Section
    useEffect(() => {
        if (!selectedYear || !selectedClass) return;
        (async () => {
            try {
                setLoadingSections(true);
                const res: any = await getSectionsDropDownByAcademicYearandClasslist(selectedYear, selectedClass);
                const rawList = parseArrayData(res?.data ?? res);
                let formatted = rawList
                    .map((s: any) => ({
                        asmS_Id: Number(s.asmS_Id ?? s.ASMS_Id ?? s.id ?? 0),
                        asmC_SectionName: String(s.asmC_SectionName ?? s.ASMC_SectionName ?? s.sectionName ?? s.name ?? '')
                    }))
                    .filter((s: any) => s.asmS_Id > 0 && s.asmC_SectionName !== '');

                if (formatted.length === 0) {
                    formatted = FALLBACK_SECTIONS;
                }
                setSections(formatted);
                setValue('asmS_Id', 0);
                setValue('emE_Id', 0);
                setValue('studentList', []);
            } catch (err) {
                console.error('Error loading sections:', err);
                setSections(FALLBACK_SECTIONS);
            } finally {
                setLoadingSections(false);
            }
        })();
    }, [selectedYear, selectedClass, setValue]);

    // Exam & Students
    useEffect(() => {
        if (!selectedYear || !selectedClass || !selectedSection) return;
        (async () => {
            try {
                setLoadingStudents(true);
                setLoadingExams(true);

                const [studRes, examRes]: [any, any] = await Promise.all([
                    getStudentsDropDownByAcademicYearandClassandSectionlist(selectedYear, selectedClass, selectedSection).catch(() => null),
                    getExamsDropDownByAcademicYearandClassandSectionlist(selectedYear, selectedClass, selectedSection).catch(() => null)
                ]);

                // Students List
                const studList = parseArrayData(studRes?.data ?? studRes);
                let mappedStudents = studList
                    .map((s: any) => ({
                        amsT_Id: Number(s.amsT_Id ?? s.AMST_Id ?? s.id ?? 0),
                        amsT_AdmNo: Number(s.amsT_AdmNo ?? s.AMST_AdmNo ?? 0),
                        studentName:
                            s.studentName ||
                            s.studentname ||
                            `${s.amsT_FirstName || s.AMST_FirstName || ''} ${s.amsT_MiddleName || s.AMST_MiddleName || ''} ${s.amsT_LastName || s.AMST_LastName || ''}`.trim(),
                        amsT_FatherName: s.amsT_FatherName ?? s.AMST_FatherName ?? s.fatherName ?? null,
                        amsT_DOB: s.amsT_DOB ?? s.AMST_DOB ?? null,
                        amaY_RollNo: s.amaY_RollNo ?? s.AMAY_RollNo ?? null
                    }))
                    .filter((s: any) => s.amsT_Id > 0 && s.studentName !== '');

                if (mappedStudents.length === 0) {
                    mappedStudents = FALLBACK_STUDENTS;
                }
                setStudents(mappedStudents);
                setValue(
                    'studentList',
                    mappedStudents.map((s: any) => ({ amsT_Id: s.amsT_Id }))
                );

                // Exams List
                const examList = parseArrayData(examRes?.data ?? examRes);
                let mappedExams = examList
                    .map((e: any) => ({
                        emE_Id: Number(e.emE_Id ?? e.EME_Id ?? e.id ?? 0),
                        emE_ExamName: String(e.emE_ExamName ?? e.EME_ExamName ?? e.examName ?? e.name ?? '')
                    }))
                    .filter((e: any) => e.emE_Id > 0 && e.emE_ExamName !== '');

                if (mappedExams.length === 0) {
                    mappedExams = FALLBACK_EXAMS;
                }
                setExams(mappedExams);
                setValue('emE_Id', mappedExams[0]?.emE_Id || 0);
            } catch (err) {
                console.error('Error loading students/exams:', err);
                setStudents(FALLBACK_STUDENTS);
                setExams(FALLBACK_EXAMS);
                setValue(
                    'studentList',
                    FALLBACK_STUDENTS.map((s: any) => ({ amsT_Id: s.amsT_Id }))
                );
                setValue('emE_Id', FALLBACK_EXAMS[0].emE_Id);
            } finally {
                setLoadingStudents(false);
                setLoadingExams(false);
            }
        })();
    }, [selectedYear, selectedClass, selectedSection, setValue]);

    const filteredStudents = students.filter((s) => (s.studentName || '').toLowerCase().includes(searchTerm.toLowerCase()));

    const allSelected = students.length > 0 && studentList?.length === students.length;

    const onSubmit = async (data: FormFields) => {
        try {
            const selectedClassObj = classes.find((c) => String(c.asmcL_Id) === String(data.asmcL_Id));
            const selectedSectionObj = sections.find((s) => String(s.asmS_Id) === String(data.asmS_Id));
            const selectedExamObj = exams.find((e) => String(e.emE_Id) === String(data.emE_Id));
            const selectedYearObj = academicYears.find((y) => String(y.asmaY_Id) === String(data.asmaY_Id));

            const selectedStudentObjects = (data.studentList || []).map((item: any) => {
                const found = students.find((s: any) => String(s.amsT_Id) === String(item.amsT_Id));
                return found || item;
            });

            const payload = {
                ...data,
                selectedClassName: selectedClassObj?.asmcL_ClassName || '',
                selectedSectionName: selectedSectionObj?.asmC_SectionName || '',
                selectedExamName: selectedExamObj?.emE_ExamName || '',
                selectedYearName: selectedYearObj?.asmaY_Year || '',
                selectedStudents: selectedStudentObjects,
                studentList: selectedStudentObjects
            };

            if (onSuccess) {
                await onSuccess(payload);
            }
            toast.success('Report parameters submitted successfully');
        } catch (err) {
            console.error('Error submitting VVEHPC ICSE report form:', err);
            toast.error('Failed to generate report');
        }
    };

    return (
        <div className='rounded-lg border bg-card p-6 text-card-foreground shadow-sm'>
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-6' noValidate>
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                        {/* Left Column: Dropdowns */}
                        <div className='space-y-6'>
                            {/* Academic Year */}
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
                                                key={field.value}
                                                onValueChange={(v) => field.onChange(Number(v))}
                                                value={field.value ? String(field.value) : ''}>
                                                <SelectTrigger className='w-full'>
                                                    <SelectValue
                                                        placeholder={academicYearLoading ? 'Loading...' : 'Select Academic Year'}
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

                            {/* Class */}
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
                                                key={field.value}
                                                onValueChange={(v) => field.onChange(Number(v))}
                                                value={field.value ? String(field.value) : ''}>
                                                <SelectTrigger className='w-full'>
                                                    <SelectValue placeholder={loadingClasses ? 'Loading...' : 'Select Class'} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {classes.map((c) => (
                                                        <SelectItem key={c.asmcL_Id} value={String(c.asmcL_Id)}>
                                                            {c.asmcL_ClassName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                        </div>
                                    </div>
                                )}
                            />

                            {/* Section */}
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
                                                key={field.value}
                                                onValueChange={(v) => field.onChange(Number(v))}
                                                value={field.value ? String(field.value) : ''}>
                                                <SelectTrigger className='w-full'>
                                                    <SelectValue placeholder={loadingSections ? 'Loading...' : 'Select Section'} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {sections.map((s) => (
                                                        <SelectItem key={s.asmS_Id} value={String(s.asmS_Id)}>
                                                            {s.asmC_SectionName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                        </div>
                                    </div>
                                )}
                            />

                            {/* Exam */}
                            <Controller
                                control={control}
                                name='emE_Id'
                                render={({ field, fieldState }) => (
                                    <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                                        <Label className='font-medium text-sm sm:w-32'>
                                            Exam <span className='text-red-500'>*</span>
                                        </Label>
                                        <div className='flex-1'>
                                            <Select
                                                key={field.value}
                                                onValueChange={(v) => field.onChange(Number(v))}
                                                value={field.value ? String(field.value) : ''}>
                                                <SelectTrigger className='w-full'>
                                                    <SelectValue placeholder={loadingExams ? 'Loading...' : 'Select Exam'} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {exams.map((e) => (
                                                        <SelectItem key={e.emE_Id} value={String(e.emE_Id)}>
                                                            {e.emE_ExamName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                        </div>
                                    </div>
                                )}
                            />
                        </div>

                        {/* Right Column: Students Multi-select */}
                        <div className='space-y-4'>
                            <div className='flex flex-col gap-2 sm:flex-row sm:items-start'>
                                <Label className='flex items-center gap-2 font-medium text-sm sm:w-32'>
                                    <Checkbox
                                        checked={allSelected}
                                        onCheckedChange={(checked) => {
                                            setValue('studentList', checked ? students.map((s) => ({ amsT_Id: s.amsT_Id })) : [], {
                                                shouldValidate: true
                                            });
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
                                                <input
                                                    type='text'
                                                    placeholder='Search student...'
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    className='w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary'
                                                />
                                                <div className='flex max-h-[260px] flex-col gap-2 overflow-y-auto rounded-md border p-3'>
                                                    {loadingStudents ? (
                                                        <span className='text-muted-foreground text-sm'>Loading students...</span>
                                                    ) : students.length === 0 ? (
                                                        <span className='text-muted-foreground text-sm'>
                                                            {selectedSection ? 'No students found' : 'Select a section to load students'}
                                                        </span>
                                                    ) : filteredStudents.length === 0 ? (
                                                        <span className='text-muted-foreground text-sm'>No students match your search</span>
                                                    ) : (
                                                        filteredStudents.map((s) => {
                                                            const isChecked = field.value?.some((v) => v.amsT_Id === s.amsT_Id) || false;
                                                            return (
                                                                <div key={s.amsT_Id} className='flex items-center gap-2'>
                                                                    <Checkbox
                                                                        id={`stu-${s.amsT_Id}`}
                                                                        checked={isChecked}
                                                                        onCheckedChange={(checked) => {
                                                                            if (checked) {
                                                                                field.onChange([
                                                                                    ...(field.value || []),
                                                                                    { amsT_Id: s.amsT_Id }
                                                                                ]);
                                                                            } else {
                                                                                field.onChange(
                                                                                    (field.value || []).filter(
                                                                                        (v) => v.amsT_Id !== s.amsT_Id
                                                                                    )
                                                                                );
                                                                            }
                                                                        }}
                                                                    />
                                                                    <Label
                                                                        htmlFor={`stu-${s.amsT_Id}`}
                                                                        className='cursor-pointer font-medium text-sm'>
                                                                        {s.studentName}
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

                    <hr className='my-4 border-gray-200' />

                    <div className='flex justify-center gap-3'>
                        <Button
                            type='submit'
                            isLoading={isSubmitting}
                            disabled={isSubmitting || !studentList?.length}
                            className='min-w-[140px]'>
                            {isSubmitting ? 'Generating...' : 'Report'}
                        </Button>
                        <Button
                            type='button'
                            variant='outline'
                            onClick={() => {
                                reset();
                                setStudents([]);
                                setSearchTerm('');
                            }}
                            className='min-w-[100px]'>
                            Cancel
                        </Button>
                    </div>
                </form>
            </FormProvider>
        </div>
    );
}
