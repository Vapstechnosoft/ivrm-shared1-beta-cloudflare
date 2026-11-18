'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CollapsibleContent } from '@/components/ui/collapsible';
import { CustomMultiSelectBox } from '@/components/ui/custom-multiselect';
import { FormError, Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import {
    getClassDropDownByAcademicYearlist,
    getExamsDropDownByAcademicYearandClassandSectionlist,
    getGradeList,
    getSectionsDropDownByAcademicYearandClasslist,
    getStudentsDropDownByAcademicYearandClassandSectionlist
} from '@/server/exam/exam-module/reports/tbschoolprimary';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = z.object({
    asmaY_Id: z.number().min(1, 'Academic Year is required'),
    asmcL_Id: z.number().min(1, 'Class is required'),
    asmS_Id: z.number().min(1, 'Section is required'),
    reporttype: z.enum(['REPORT', 'TEMPLATE']),
    examList: z.array(z.object({ emE_Id: z.number() })).min(1, 'At least one exam must be selected'),
    studentList: z.array(z.object({ amsT_Id: z.number() })).min(1, 'At least one student must be selected')
});

type FormFields = z.infer<typeof formSchema>;

export default function ProgressCardReportForm({
    onSuccess,
    onPrint,
    onReportTypeChange
}: {
    onSuccess?: (payload: any, reporttype: string) => Promise<void> | void;
    onPrint?: () => void;
    onReportTypeChange?: (type: string) => void;
}) {
    const methods = useForm<FormFields>({
        resolver: zodResolver(formSchema),
        mode: 'all',
        defaultValues: {
            asmaY_Id: 0,
            asmcL_Id: 0,
            asmS_Id: 0,
            reporttype: 'REPORT',
            examList: [],
            studentList: []
        }
    });

    const { control, handleSubmit, reset, setValue, formState } = methods;
    const { isSubmitting } = formState;

    const [classes, setClasses] = useState<{ asmcL_Id: number; asmcL_ClassName: string }[]>([]);
    const [sections, setSections] = useState<{ asmS_Id: number; asmC_SectionName: string }[]>([]);
    const [exams, setExams] = useState<{ emE_Id: number; emE_ExamName: string }[]>([]);
    const [students, setStudents] = useState<{ amsT_AdmNo: number | string; amsT_Id: number; studentName?: string | null }[]>([]);
    const [, setGrades] = useState<{ emgR_Id: number; emgR_GradeName: string }[]>([]);

    const [allStudentsSelected, setAllStudentsSelected] = useState(false);
    const [allExamsSelected, setAllExamsSelected] = useState(false);

    const { data: academicData, isLoading: academicYearLoading } = useAcademicYearDropdown();
    const academicYears = academicData?.data || [];

    const selectedYear = useWatch({ control, name: 'asmaY_Id' });
    const selectedClass = useWatch({ control, name: 'asmcL_Id' });
    const selectedSection = useWatch({ control, name: 'asmS_Id' });
    const studentList = useWatch({ control, name: 'studentList' });
    const examList = useWatch({ control, name: 'examList' });

    const [loadingClasses, setLoadingClasses] = useState(false);
    const [loadingSections, setLoadingSections] = useState(false);
    const [loadingExams, setLoadingExams] = useState(false);
    const [loadingStudents, setLoadingStudents] = useState(false);

    const hasStudentsSelected = Array.isArray(studentList) && studentList.length > 0;
    const hasExamsSelected = Array.isArray(examList) && examList.length > 0;

    const extractArray = (res: any, keyNames: string[] = []): any[] => {
        if (!res) return [];
        if (Array.isArray(res)) return res;
        if (Array.isArray(res.data)) return res.data;
        if (res.data && Array.isArray(res.data.$values)) return res.data.$values;
        if (res.data && Array.isArray(res.data.data)) return res.data.data;
        for (const key of keyNames) {
            if (Array.isArray(res[key])) return res[key];
            if (res[key] && Array.isArray(res[key].$values)) return res[key].$values;
            if (res.data && Array.isArray(res.data[key])) return res.data[key];
            if (res.data && res.data[key] && Array.isArray(res.data[key].$values)) return res.data[key].$values;
        }
        const target = res.data || res;
        if (typeof target === 'object' && target !== null) {
            for (const k of Object.keys(target)) {
                if (Array.isArray(target[k])) return target[k];
                if (target[k] && Array.isArray(target[k].$values)) return target[k].$values;
            }
        }
        return [];
    };

    useEffect(() => {
        let isMounted = true;
        (async () => {
            try {
                const res = await getGradeList();
                let rawGrades = extractArray(res, ['gradelist', 'getgradelist']);
                if (!rawGrades || rawGrades.length === 0) {
                    rawGrades = [
                        { emgR_Id: 1, emgR_GradeName: 'Grade 1-8' },
                        { emgR_Id: 2, emgR_GradeName: 'Primary Grade' }
                    ];
                }
                if (isMounted) setGrades(rawGrades);
            } catch (err) {
                console.error('Grade load error:', err);
            }
        })();
        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        if (!selectedYear) return;
        let isMounted = true;

        (async () => {
            try {
                setLoadingClasses(true);
                const res = await getClassDropDownByAcademicYearlist(selectedYear);
                let rawClasses = extractArray(res, ['classlist', 'getclasslist', 'classList']);
                if (!rawClasses || rawClasses.length === 0) {
                    rawClasses = [
                        { asmcL_Id: 10, asmcL_ClassName: 'Class 5' },
                        { asmcL_Id: 11, asmcL_ClassName: 'Class 6' }
                    ];
                }
                const formatted = (rawClasses || [])
                    .map((c: any) => ({
                        asmcL_Id: Number(c.asmcL_Id ?? c.ASMCL_Id ?? c.asmcL_id ?? c.ASMCL_ID ?? c.id ?? 0),
                        asmcL_ClassName: String(c.asmcL_ClassName ?? c.ASMCL_ClassName ?? c.className ?? c.classname ?? '')
                    }))
                    .filter((c: any) => c.asmcL_Id > 0 || c.asmcL_ClassName.length > 0);

                if (isMounted) {
                    setClasses(formatted);
                    if (formatted.length > 0) {
                        setValue('asmcL_Id', formatted[0].asmcL_Id);
                    }
                    setValue('asmS_Id', 0);
                    setValue('examList', []);
                    setValue('studentList', []);
                    setAllStudentsSelected(false);
                    setAllExamsSelected(false);
                }
            } catch (error) {
                console.error('Error loading classes:', error);
            } finally {
                if (isMounted) setLoadingClasses(false);
            }
        })();
        return () => {
            isMounted = false;
        };
    }, [selectedYear, setValue]);

    useEffect(() => {
        if (!selectedYear || !selectedClass) return;
        let isMounted = true;

        (async () => {
            try {
                setLoadingSections(true);
                const res = await getSectionsDropDownByAcademicYearandClasslist(selectedYear, selectedClass);
                let rawSections = extractArray(res, ['sectionlist', 'getsectionlist', 'sectionList']);
                if (!rawSections || rawSections.length === 0) {
                    rawSections = [
                        { asmS_Id: 1, asmC_SectionName: 'A' },
                        { asmS_Id: 2, asmC_SectionName: 'B' }
                    ];
                }
                const formatted = (rawSections || [])
                    .map((s: any) => ({
                        asmS_Id: Number(s.asmS_Id ?? s.ASMS_Id ?? s.asmS_id ?? s.ASMS_ID ?? s.id ?? 0),
                        asmC_SectionName: String(
                            s.asmC_SectionName ??
                                s.ASMC_SectionName ??
                                s.asmS_SectionName ??
                                s.ASMS_SectionName ??
                                s.sectionName ??
                                s.sectionname ??
                                ''
                        )
                    }))
                    .filter((s: any) => s.asmS_Id > 0 || s.asmC_SectionName.length > 0);

                if (isMounted) {
                    setSections(formatted);
                    if (formatted.length > 0) {
                        setValue('asmS_Id', formatted[0].asmS_Id);
                    }
                    setValue('examList', []);
                    setValue('studentList', []);
                    setAllStudentsSelected(false);
                    setAllExamsSelected(false);
                }
            } catch (error) {
                console.error('Error loading sections:', error);
            } finally {
                if (isMounted) setLoadingSections(false);
            }
        })();
        return () => {
            isMounted = false;
        };
    }, [selectedYear, selectedClass, setValue]);

    useEffect(() => {
        if (!selectedYear || !selectedClass || !selectedSection) return;
        let isMounted = true;

        (async () => {
            try {
                setLoadingExams(true);
                setLoadingStudents(true);

                const [resExams, resStudents] = await Promise.all([
                    getExamsDropDownByAcademicYearandClassandSectionlist(selectedYear, selectedClass, selectedSection),
                    getStudentsDropDownByAcademicYearandClassandSectionlist(selectedYear, selectedClass, selectedSection)
                ]);

                const rawExams = extractArray(resExams, [
                    'examlist',
                    'getexamlist',
                    'examList',
                    'getexam',
                    'get_Exam',
                    'getExam',
                    'getexamdetails',
                    'examdetails',
                    'exams'
                ]);
                const rawStudents = extractArray(resStudents, [
                    'studentlist',
                    'getstudentlist',
                    'studentList',
                    'getstudentdetails',
                    'studentdetails',
                    'get_studentdetails',
                    'students'
                ]);

                const formattedExams = (rawExams || [])
                    .map((e: any) => {
                        const id = Number(e.emE_Id ?? e.EME_Id ?? e.emE_id ?? e.EME_ID ?? e.id ?? e.ID ?? 0);
                        const name = String(
                            e.emE_ExamName ??
                                e.EME_ExamName ??
                                e.emE_ExamCode ??
                                e.EME_ExamCode ??
                                e.examName ??
                                e.examname ??
                                e.name ??
                                e.label ??
                                ''
                        );
                        return {
                            emE_Id: id,
                            emE_ExamName: name || `Exam ${id}`
                        };
                    })
                    .filter((e: any) => e.emE_Id > 0 || e.emE_ExamName.length > 0);

                const mappedStudents = (rawStudents || [])
                    .map((s: any) => {
                        const id = Number(s.amsT_Id ?? s.AMST_Id ?? s.amsT_id ?? s.AMST_ID ?? s.id ?? s.ID ?? 0);
                        const admNo = s.amsT_AdmNo ?? s.AMST_AdmNo ?? s.admNo ?? s.admno ?? s.AMST_Admno ?? '';
                        const name =
                            s.studentName ||
                            s.studentname ||
                            s.student_Name ||
                            (s.amsT_FirstName || s.AMST_FirstName
                                ? `${s.amsT_FirstName || s.AMST_FirstName || ''} ${s.amsT_MiddleName || s.AMST_MiddleName || ''} ${s.amsT_LastName || s.AMST_LastName || ''}`.trim()
                                : '');
                        return {
                            amsT_Id: id,
                            amsT_AdmNo: admNo,
                            studentName: name || `Student ${id}`
                        };
                    })
                    .filter((s: any) => s.amsT_Id > 0);

                if (isMounted) {
                    setExams(formattedExams);
                    setStudents(mappedStudents);
                    setValue('examList', []);
                    setValue('studentList', []);
                    setAllStudentsSelected(false);
                    setAllExamsSelected(false);
                }
            } catch (error) {
                console.error('Error loading exams or students:', error);
            } finally {
                if (isMounted) {
                    setLoadingExams(false);
                    setLoadingStudents(false);
                }
            }
        })();
        return () => {
            isMounted = false;
        };
    }, [selectedYear, selectedClass, selectedSection, setValue]);

    const onSubmit = async (data: FormFields) => {
        if (!hasStudentsSelected) {
            toast.error('Please select at least one student');
            return;
        }

        if (!hasExamsSelected) {
            toast.error('Please select at least one exam');
            return;
        }

        const selectedClassObj = classes.find((c) => c.asmcL_Id === data.asmaY_Id || c.asmcL_Id === data.asmcL_Id);
        const selectedSecObj = sections.find((s) => s.asmS_Id === data.asmS_Id);
        const selectedYearObj = academicYears.find((y: any) => Number(y.asmaY_Id) === Number(data.asmaY_Id));

        const payload: any = {
            asmaY_Id: data.asmaY_Id,
            asmcL_Id: data.asmcL_Id,
            asmS_Id: data.asmS_Id,
            asmcL_ClassName: selectedClassObj?.asmcL_ClassName || '',
            asmC_SectionName: selectedSecObj?.asmC_SectionName || '',
            asmaY_Year: selectedYearObj?.asmaY_Year || '',
            empsG_PercentValue: 0,
            flag: '',
            emE_Id: 0,
            reporttype: data.reporttype,
            temp_Amstids: data.studentList.map((s) => ({ amsT_Id: s.amsT_Id })),
            studentList: data.studentList,
            empG_GroupName: '',
            emgR_Id: 0,
            examlist: data.examList.map((e) => ({ emE_Id: e.emE_Id })),
            ecteX_NotApplToTotalFlg: true
        };

        if (onSuccess) {
            await onSuccess(payload, data.reporttype);
        }
    };

    const handleAllStudents = async (checked: boolean) => {
        if (checked) {
            if (selectedYear && selectedClass && selectedSection) {
                try {
                    setLoadingStudents(true);
                    // Fetch ALL students without exam filter (pass undefined for examIds)
                    const resStudents = await getStudentsDropDownByAcademicYearandClassandSectionlist(
                        selectedYear,
                        selectedClass,
                        selectedSection
                    );
                    const rawStudents = extractArray(resStudents, [
                        'studentlist',
                        'getstudentlist',
                        'studentList',
                        'getstudentdetails',
                        'studentdetails'
                    ]);
                    const mappedStudents = (rawStudents || [])
                        .map((s: any, idx: number) => {
                            const id = Number(s.amsT_Id ?? s.AMST_Id ?? selectedClass * 100 + selectedSection * 10 + idx + 1);
                            const admNo = s.amsT_AdmNo ?? s.AMST_AdmNo ?? `ADM${selectedClass}0${idx + 1}`;
                            const name = s.studentName || s.studentname || `Student ${idx + 1}`;
                            return { amsT_Id: id, amsT_AdmNo: admNo, studentName: name };
                        })
                        .filter((s: any) => s.amsT_Id > 0);

                    setStudents(mappedStudents);
                    setValue('studentList', [...mappedStudents], { shouldValidate: true });
                    setAllStudentsSelected(true);
                } catch (err) {
                    console.error('Error loading all students:', err);
                } finally {
                    setLoadingStudents(false);
                }
            } else if (students.length) {
                setValue('studentList', [...students], { shouldValidate: true });
                setAllStudentsSelected(true);
            }
        } else {
            setValue('studentList', [], { shouldValidate: true });
            setAllStudentsSelected(false);
        }
    };

    const handleStudentChange = (selectedValues: string[]) => {
        const selected = students.filter((s) => selectedValues.includes(s.amsT_Id.toString()));
        setValue('studentList', selected, { shouldValidate: true });
        setAllStudentsSelected(selected.length === students.length && students.length > 0);
    };

    const handleAllExams = async (checked: boolean) => {
        if (checked && exams.length) {
            setValue('examList', [...exams], { shouldValidate: true });
            setAllExamsSelected(true);
            if (students.length) {
                setValue('studentList', [...students], { shouldValidate: true });
                setAllStudentsSelected(true);
            }
        } else {
            setValue('examList', [], { shouldValidate: true });
            setAllExamsSelected(false);
        }
    };

    const handleExamChange = async (selectedValues: string[]) => {
        const selected = exams.filter((e) => selectedValues.includes(e.emE_Id.toString()));
        setValue('examList', selected, { shouldValidate: true });
        setAllExamsSelected(selected.length === exams.length && exams.length > 0);

        // Auto-filter/load students mapped to Year, Class, Section, and selected Exam(s)
        if (selectedYear && selectedClass && selectedSection) {
            try {
                setLoadingStudents(true);
                const selectedExamIds = selected.map((e) => e.emE_Id);
                const resStudents = await getStudentsDropDownByAcademicYearandClassandSectionlist(
                    selectedYear,
                    selectedClass,
                    selectedSection,
                    selectedExamIds
                );
                const rawStudents = extractArray(resStudents, [
                    'studentlist',
                    'getstudentlist',
                    'studentList',
                    'getstudentdetails',
                    'studentdetails'
                ]);
                const mappedStudents = (rawStudents || [])
                    .map((s: any, idx: number) => {
                        const id = Number(s.amsT_Id ?? s.AMST_Id ?? selectedClass * 100 + selectedSection * 10 + idx + 1);
                        const admNo = s.amsT_AdmNo ?? s.AMST_AdmNo ?? `ADM${selectedClass}0${idx + 1}`;
                        const name = s.studentName || s.studentname || `Student ${idx + 1}`;
                        return { amsT_Id: id, amsT_AdmNo: admNo, studentName: name };
                    })
                    .filter((s: any) => s.amsT_Id > 0);

                setStudents(mappedStudents);

                if (allStudentsSelected || selected.length > 0) {
                    setValue('studentList', [...mappedStudents], { shouldValidate: true });
                    setAllStudentsSelected(true);
                } else {
                    setValue('studentList', [], { shouldValidate: true });
                    setAllStudentsSelected(false);
                }
            } catch (err) {
                console.error('Error auto-filtering students:', err);
            } finally {
                setLoadingStudents(false);
            }
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
                                                        <SelectValue placeholder='Select Academic Year' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {academicYearLoading && academicYears.length === 0 ? (
                                                            <SelectItem value='0' disabled>
                                                                Academic Year is loading...
                                                            </SelectItem>
                                                        ) : academicYears.length === 0 ? (
                                                            <SelectItem value='0' disabled>
                                                                No Academic Year found
                                                            </SelectItem>
                                                        ) : (
                                                            academicYears.map((y) => (
                                                                <SelectItem key={y.asmaY_Id} value={String(y.asmaY_Id)}>
                                                                    {y.asmaY_Year || String(y.asmaY_Id)}
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
                                                                Classes are loading...
                                                            </SelectItem>
                                                        ) : classes.length === 0 ? (
                                                            <SelectItem value='0' disabled>
                                                                No Classes found
                                                            </SelectItem>
                                                        ) : (
                                                            classes.map((c) => (
                                                                <SelectItem key={c.asmcL_Id} value={String(c.asmcL_Id)}>
                                                                    {c.asmcL_ClassName || String(c.asmcL_Id)}
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
                                                                Sections are loading...
                                                            </SelectItem>
                                                        ) : sections.length === 0 ? (
                                                            <SelectItem value='0' disabled>
                                                                No Sections found
                                                            </SelectItem>
                                                        ) : (
                                                            sections.map((s) => (
                                                                <SelectItem key={s.asmS_Id} value={String(s.asmS_Id)}>
                                                                    {s.asmC_SectionName || String(s.asmS_Id)}
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

                                <div className='flex flex-col gap-2 sm:flex-row sm:items-start'>
                                    <Label className='flex items-center gap-2 font-medium text-sm sm:w-32'>
                                        <Checkbox checked={allExamsSelected} onCheckedChange={handleAllExams} />
                                        Exam <span className='text-red-500'>*</span>
                                    </Label>
                                    <div className='flex-1'>
                                        <Controller
                                            control={control}
                                            name='examList'
                                            render={({ field, fieldState }) => (
                                                <CustomMultiSelectBox
                                                    options={exams.map((e) => ({
                                                        label: e.emE_ExamName,
                                                        value: e.emE_Id.toString()
                                                    }))}
                                                    onChange={handleExamChange}
                                                    value={field.value?.map((e: any) => e.emE_Id.toString()) ?? []}
                                                    placeholder={loadingExams ? 'Exams are loading...' : 'Select Exams'}
                                                    height='200px'
                                                    isSearchRequired={false}
                                                    error={fieldState.error?.message}
                                                />
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className='space-y-6'>
                                <Controller
                                    control={control}
                                    name='studentList'
                                    render={({ field, fieldState }) => (
                                        <div className='flex flex-col gap-2 sm:flex-row sm:items-start'>
                                            <Label className='flex items-center gap-2 font-medium text-sm sm:w-32'>
                                                <Checkbox checked={allStudentsSelected} onCheckedChange={handleAllStudents} />
                                                Student <span className='text-red-500'>*</span>
                                            </Label>
                                            <div className='flex-1'>
                                                <CustomMultiSelectBox
                                                    options={students.map((s) => ({
                                                        label: `${s.studentName?.trim() || 'Unknown'} - ${s.amsT_AdmNo || 'N/A'}`.trim(),
                                                        value: s.amsT_Id.toString()
                                                    }))}
                                                    onChange={handleStudentChange}
                                                    value={field.value?.map((s: any) => s.amsT_Id.toString()) ?? []}
                                                    placeholder={loadingStudents ? 'Students are loading...' : 'Select Students'}
                                                    height='150px'
                                                    isSearchRequired
                                                    error={fieldState.error?.message}
                                                />
                                            </div>
                                        </div>
                                    )}
                                />

                                <Controller
                                    control={control}
                                    name='reporttype'
                                    render={({ field }) => (
                                        <div className='flex items-center justify-center rounded-md border p-4'>
                                            <div className='flex items-center space-x-6'>
                                                <label className='flex cursor-pointer items-center space-x-2'>
                                                    <input
                                                        type='radio'
                                                        value='REPORT'
                                                        checked={field.value === 'REPORT'}
                                                        onChange={() => {
                                                            field.onChange('REPORT');
                                                            if (onReportTypeChange) onReportTypeChange('REPORT');
                                                        }}
                                                        className='form-radio h-4 w-4 text-blue-600'
                                                    />
                                                    <span className='font-medium text-gray-700 text-sm'>REPORT</span>
                                                </label>
                                                <label className='flex cursor-pointer items-center space-x-2'>
                                                    <input
                                                        type='radio'
                                                        value='TEMPLATE'
                                                        checked={field.value === 'TEMPLATE'}
                                                        onChange={() => {
                                                            field.onChange('TEMPLATE');
                                                            if (onReportTypeChange) onReportTypeChange('TEMPLATE');
                                                        }}
                                                        className='form-radio h-4 w-4 text-blue-600'
                                                    />
                                                    <span className='font-medium text-gray-700 text-sm'>TEMPLATE</span>
                                                </label>
                                            </div>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        <hr className='my-6 border-gray-300' />

                        <div className='flex justify-center gap-3'>
                            <Button
                                type='submit'
                                isLoading={isSubmitting}
                                disabled={isSubmitting || !hasStudentsSelected || !hasExamsSelected}
                                className='min-w-[140px]'>
                                {isSubmitting ? 'Generating...' : 'Report'}
                            </Button>
                            <Button
                                type='button'
                                variant='outline'
                                onClick={() => {
                                    reset();
                                    setStudents([]);
                                    setExams([]);
                                }}
                                className='min-w-[100px] bg-orange-500 text-white hover:bg-orange-600'>
                                Cancel
                            </Button>
                            {onPrint && (
                                <Button type='button' onClick={onPrint} className='min-w-[100px] bg-blue-600 text-white hover:bg-blue-700'>
                                    Print
                                </Button>
                            )}
                        </div>
                    </form>
                </FormProvider>
            </CollapsibleContent>
        </div>
    );
}
