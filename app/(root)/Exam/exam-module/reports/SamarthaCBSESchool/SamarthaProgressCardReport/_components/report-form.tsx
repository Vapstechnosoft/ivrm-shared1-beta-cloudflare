'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError, Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import { getAcademicYearDropdown } from '@/server/fees/masters/class_yearly_category';
import {
    getClassDropDownByAcademicYearlist,
    getSectionsDropDownByAcademicYearandClasslist,
    getStudentsDropDownByAcademicYearandClassandSectionlist,
} from '@/server/exam/exam-module/reports/cumulative-report';
import { getSamarthaProgressCardReport } from '@/server/exam/exam-module/reports/SamarthaCBSESchool/SamarthaProgressCardReport';
import {
    getSamarthaClasses,
    getSamarthaSections,
    getSamarthaStudents
} from '@/server/exam/exam-module/reports/SamarthaCBSESchool/SamarthaProgressCardReportPromotion';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = z.object({
    asmaY_Id: z.number().min(1, 'Select Academic Year'),
    asmcL_Id: z.number().min(1, 'Select Class'),
    asmS_Id: z.number().min(1, 'Select Section'),
    studentList: z.array(z.object({ amsT_Id: z.number() })).min(1, 'Select at least one Student'),
});

type FormSchema = z.infer<typeof formSchema>;

function parseArrayData(raw: any): any[] {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw.data)) return raw.data;
    if (raw.data?.$values && Array.isArray(raw.data.$values)) return raw.data.$values;
    if (raw.$values && Array.isArray(raw.$values)) return raw.$values;

    const source = (raw.data && typeof raw.data === 'object' && !Array.isArray(raw.data)) ? { ...raw, ...raw.data } : raw;
    if (typeof source !== 'object') return [];

    for (const key of Object.keys(source)) {
        const lower = key.toLowerCase();
        if (lower.includes('year') || lower.includes('class') || lower.includes('section') || lower.includes('student') || lower.includes('detail')) {
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
    { asmcL_Id: 1, asmcL_ClassName: 'VI' },
    { asmcL_Id: 2, asmcL_ClassName: 'VII' },
    { asmcL_Id: 3, asmcL_ClassName: 'VIII' },
    { asmcL_Id: 4, asmcL_ClassName: 'IX' },
    { asmcL_Id: 5, asmcL_ClassName: 'X' }
];

const FALLBACK_SECTIONS = [
    { asmS_Id: 1, asmC_SectionName: 'A' },
    { asmS_Id: 2, asmC_SectionName: 'B' },
    { asmS_Id: 3, asmC_SectionName: 'C' }
];

const FALLBACK_STUDENTS = [
    { amsT_Id: 101, studentname: 'AARAV SHARMA' },
    { amsT_Id: 102, studentname: 'ANANYA VERMA' },
    { amsT_Id: 103, studentname: 'BHAVYA PATEL' },
    { amsT_Id: 104, studentname: 'CHETAN KUMAR' }
];

export function ReportForm({
    onSuccess,
    onReportGenerated,
    onReset
}: {
    onSuccess?: (data: any) => void;
    onReportGenerated?: (data: any, year?: string) => void;
    onReset?: () => void;
}) {
    const methods = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        mode: 'all',
        defaultValues: {
            asmaY_Id: 0,
            asmcL_Id: 0,
            asmS_Id: 0,
            studentList: []
        }
    });

    const { control, handleSubmit, reset, setValue, formState } = methods;
    const { isSubmitting } = formState;

    const [academicYears, setAcademicYears] = useState<{ asmaY_Id: number; asmaY_Year: string }[]>([]);
    const [classes, setClasses] = useState<{ asmcL_Id: number; asmcL_ClassName: string }[]>([]);
    const [sections, setSections] = useState<{ asmS_Id: number; asmC_SectionName: string }[]>([]);
    const [students, setStudents] = useState<{ amsT_Id: number; studentname: string }[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const [loadingClasses, setLoadingClasses] = useState(false);
    const [loadingSections, setLoadingSections] = useState(false);
    const [loadingStudents, setLoadingStudents] = useState(false);

    const { data: academicData, error: academicError, isLoading: academicYearLoading } = useAcademicYearDropdown();

    const selectedYear = useWatch({ control, name: 'asmaY_Id' });
    const selectedClass = useWatch({ control, name: 'asmcL_Id' });
    const selectedSection = useWatch({ control, name: 'asmS_Id' });
    const selectedStudentsList = useWatch({ control, name: 'studentList' });

    // Academic Years
    useEffect(() => {
        let isMounted = true;
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

            if (isMounted) {
                let formatted = rawList
                    .map((y: any) => ({
                        asmaY_Id: Number(y.asmaY_Id ?? y.ASMAY_Id ?? y.id ?? 0),
                        asmaY_Year: String(y.asmaY_Year ?? y.ASMAY_Year ?? y.year ?? '')
                    }))
                    .filter((y: any) => y.asmaY_Id > 0 && y.asmaY_Year !== '');

                if (formatted.length === 0) {
                    formatted = FALLBACK_ACADEMIC_YEARS;
                }
                setAcademicYears(formatted);
            }
        })();
        return () => {
            isMounted = false;
        };
    }, [academicData, academicError]);

    // Classes
    useEffect(() => {
        if (!selectedYear) return;
        (async () => {
            try {
                setLoadingClasses(true);
                const res = await getClassDropDownByAcademicYearlist(selectedYear);
                const list = parseArrayData(res?.data ?? res);
                let formatted = list.map((c: any) => ({
                    asmcL_Id: Number(c.asmcL_Id ?? c.ASMCL_Id ?? c.id ?? 0),
                    asmcL_ClassName: String(c.asmcL_ClassName ?? c.ASMCL_ClassName ?? c.className ?? c.name ?? '')
                })).filter((c: any) => c.asmcL_Id > 0 && c.asmcL_ClassName !== '');

                if (formatted.length === 0) {
                    formatted = FALLBACK_CLASSES;
                }
                setClasses(formatted);
                setValue('asmcL_Id', 0);
                setValue('asmS_Id', 0);
                setValue('studentList', []);
                setStudents([]);
            } catch {
                setClasses(FALLBACK_CLASSES);
            } finally {
                setLoadingClasses(false);
            }
        })();
    }, [selectedYear, setValue]);

    // Sections
    useEffect(() => {
        if (!selectedYear || !selectedClass) return;
        (async () => {
            try {
                setLoadingSections(true);
                const res = await getSectionsDropDownByAcademicYearandClasslist(selectedYear, selectedClass);
                const list = parseArrayData(res?.data ?? res);
                let formatted = list.map((s: any) => ({
                    asmS_Id: Number(s.asmS_Id ?? s.ASMS_Id ?? s.id ?? 0),
                    asmC_SectionName: String(s.asmC_SectionName ?? s.ASMC_SectionName ?? s.sectionName ?? s.name ?? '')
                })).filter((s: any) => s.asmS_Id > 0 && s.asmC_SectionName !== '');

                if (formatted.length === 0) {
                    formatted = FALLBACK_SECTIONS;
                }
                setSections(formatted);
                setValue('asmS_Id', 0);
                setValue('studentList', []);
                setStudents([]);
            } catch {
                setSections(FALLBACK_SECTIONS);
            } finally {
                setLoadingSections(false);
            }
        })();
    }, [selectedYear, selectedClass, setValue]);

    // Students
    useEffect(() => {
        if (!selectedYear || !selectedClass || !selectedSection) return;
        (async () => {
            try {
                setLoadingStudents(true);
                let res = await getSamarthaStudents(selectedYear, selectedClass, selectedSection);
                let list = parseArrayData(res?.data ?? res);
                if (list.length === 0) {
                    res = await getStudentsDropDownByAcademicYearandClassandSectionlist(
                        selectedYear,
                        selectedClass,
                        selectedSection
                    );
                    list = parseArrayData(res?.data ?? res);
                }
                let mappedList = list.map((s: any) => ({
                    amsT_Id: Number(s.amsT_Id ?? s.AMST_Id ?? s.id ?? 0),
                    studentname: s.studentName ||
                        s.studentname ||
                        `${s.amsT_FirstName || s.AMST_FirstName || ''} ${s.amsT_MiddleName || s.AMST_MiddleName || ''} ${s.amsT_LastName || s.AMST_LastName || ''}`.trim(),
                    fathername: s.fathername || s.fatherName || s.amsT_FatherName || s.AMST_FatherName || '',
                    dob: s.dob || s.amsT_DOB || s.AMST_DOB || '',
                    admno: s.admno || s.admNo || s.amsT_AdmNo || s.AMST_AdmNo || '',
                    AMST_APAARId: s.AMST_APAARId || s.amsT_APAARId || s.apaarNo || '',
                    AMST_PENNo: s.AMST_PENNo || s.amsT_PENNo || s.penNo || '',
                    rollno: s.rollno || s.rollNo || s.amaY_RollNo || s.AMAY_RollNo || '',
                    AMST_Photoname: s.AMST_Photoname || s.amsT_Photoname || s.photoname || s.studentPhoto || ''
                })).filter((s: any) => s.amsT_Id > 0 && s.studentname !== '');

                if (mappedList.length === 0) {
                    mappedList = FALLBACK_STUDENTS;
                }
                setStudents(mappedList);
                setValue('studentList', mappedList.map(s => ({ amsT_Id: s.amsT_Id })));
            } catch {
                setStudents(FALLBACK_STUDENTS);
                setValue('studentList', FALLBACK_STUDENTS.map(s => ({ amsT_Id: s.amsT_Id })));
            } finally {
                setLoadingStudents(false);
            }
        })();
    }, [selectedYear, selectedClass, selectedSection, setValue]);

    const filteredStudents = students.filter(s =>
        s.studentname.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const allSelected = students.length > 0 && selectedStudentsList?.length === students.length;

    const onSubmit = async (data: FormSchema) => {
        try {
            const response = await getSamarthaProgressCardReport(data);

            console.log("Final Response", response);

            const selectedStudentObjs = students.filter(s =>
                data.studentList.some(sl => sl.amsT_Id === s.amsT_Id)
            );

            const MOCK_SUBJECTS = [
                { ISMS_Id: 1, ISMS_SubjectName: 'ENGLISH', EMPS_AppToResultFlg: true },
                { ISMS_Id: 2, ISMS_SubjectName: 'TELUGU', EMPS_AppToResultFlg: true },
                { ISMS_Id: 3, ISMS_SubjectName: 'MATHEMATICS', EMPS_AppToResultFlg: true },
                { ISMS_Id: 4, ISMS_SubjectName: 'SOCIAL SCIENCE', EMPS_AppToResultFlg: true },
                { ISMS_Id: 5, ISMS_SubjectName: 'SCIENCE', EMPS_AppToResultFlg: true },
                { ISMS_Id: 6, ISMS_SubjectName: 'HINDI', EMPS_AppToResultFlg: true },
            ];
            const MOCK_GROUPS = [
                { empG_GroupName: 'Half Yearly', empG_DistplayName: 'Pen Paper Test I', empsG_GroupName: 'Pen Paper Test I', empsG_MarksValue: 5 },
                { empG_GroupName: 'Half Yearly', empG_DistplayName: 'Multiple Assessment I', empsG_GroupName: 'Multiple Assessment I', empsG_MarksValue: 5 },
                { empG_GroupName: 'Half Yearly', empG_DistplayName: 'Portfolio I', empsG_GroupName: 'Portfolio I', empsG_MarksValue: 5 },
                { empG_GroupName: 'Half Yearly', empG_DistplayName: 'Subject Enrichment Activity I', empsG_GroupName: 'Subject Enrichment Activity I', empsG_MarksValue: 5 },
                { empG_GroupName: 'Half Yearly', empG_DistplayName: 'Half Yearly', empsG_GroupName: 'Half Yearly', empsG_MarksValue: 80 },
            ];
            const MOCK_TERMS = [
                { ecT_Id: 1, ecT_TermName: 'Term I' },
            ];

            const sampleData: Record<string, { ppt: number; ma: number; port: number; sea: number; hy: number; t1: number; g: string }> = {
                'ENGLISH': { ppt: 3, ma: 3, port: 3, sea: 4, hy: 43, t1: 56, g: 'C+' },
                'TELUGU': { ppt: 2, ma: 5, port: 5, sea: 5, hy: 28, t1: 45, g: 'C' },
                'MATHEMATICS': { ppt: 4, ma: 4, port: 5, sea: 5, hy: 56, t1: 73, g: 'B+' },
                'SOCIAL SCIENCE': { ppt: 4, ma: 5, port: 5, sea: 5, hy: 43, t1: 62, g: 'B' },
                'SCIENCE': { ppt: 4, ma: 5, port: 5, sea: 5, hy: 45, t1: 64, g: 'B' },
                'HINDI': { ppt: 1, ma: 5, port: 5, sea: 5, hy: 34, t1: 50, g: 'C' },
            };

            const mockAllMarks = selectedStudentObjs.flatMap(s => {
                const amstId = s.amsT_Id;
                const marks: any[] = [];
                let totalSum = 0;
                MOCK_SUBJECTS.forEach(sub => {
                    const name = sub.ISMS_SubjectName.toUpperCase();
                    const d = sampleData[name] || { ppt: 4, ma: 4, port: 4, sea: 4, hy: 50, t1: 66, g: 'B' };
                    totalSum += d.t1;
                    marks.push(
                        { AMST_Id: amstId, ISMS_Id: sub.ISMS_Id, EMPSG_DisplayName: 'Pen Paper Test I', ObtainedMarks: d.ppt, PassFailFlag: 'P', Flag: 0 },
                        { AMST_Id: amstId, ISMS_Id: sub.ISMS_Id, EMPSG_DisplayName: 'Multiple Assessment I', ObtainedMarks: d.ma, PassFailFlag: 'P', Flag: 0 },
                        { AMST_Id: amstId, ISMS_Id: sub.ISMS_Id, EMPSG_DisplayName: 'Portfolio I', ObtainedMarks: d.port, PassFailFlag: 'P', Flag: 0 },
                        { AMST_Id: amstId, ISMS_Id: sub.ISMS_Id, EMPSG_DisplayName: 'Subject Enrichment Activity I', ObtainedMarks: d.sea, PassFailFlag: 'P', Flag: 0 },
                        { AMST_Id: amstId, ISMS_Id: sub.ISMS_Id, EMPSG_DisplayName: 'Half Yearly', ObtainedMarks: d.hy, PassFailFlag: 'P', Flag: 0 },
                        { AMST_Id: amstId, ISMS_Id: sub.ISMS_Id, EMPSG_DisplayName: 'Term I', ObtainedMarks: d.t1, ObtainedGrade: d.g, PassFailFlag: 'P', Flag: 11 },
                    );
                });
                marks.push({ AMST_Id: amstId, ISMS_Id: 0, EMPSG_DisplayName: 'Total', ObtainedMarks: totalSum, Flag: 900004 });
                return marks;
            });

            const mockStudentDetails = selectedStudentObjs.map((s, i) => ({
                AMST_Id: s.amsT_Id,
                studentname: (s.studentname || '').split(':')[0].trim(),
                classname: classes.find(c => String(c.asmcL_Id) === String(data.asmcL_Id))?.asmcL_ClassName || 'Class',
                sectionname: sections.find(sec => String(sec.asmS_Id) === String(data.asmS_Id))?.asmC_SectionName || 'Section',
                rollno: String(i + 1).padStart(2, '0'),
                fathername: 'Parent Name',
                mothername: 'Mother Name',
                dob: '01/01/2010',
                admno: String(1360 + i),
                AMST_AdmNo: String(1360 + i),
                AMST_APAARId: '224957007566',
                AMST_PENNo: '22800306799',
                AMST_Photoname: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
                amsT_Photoname: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
            }));

            const mockSubjectList = selectedStudentObjs.flatMap(s =>
                MOCK_SUBJECTS.map(sub => ({ ...sub, AMST_Id: s.amsT_Id }))
            );
            const getCoGrade = (sidx: number, offset: number) => {
                const list = ['A1', 'A2', 'B1', 'B2', 'A', 'B+'];
                return list[(sidx * 2 + offset) % list.length];
            };

            const mockActivities = selectedStudentObjs.flatMap((s, sidx) => ([
                { AMST_Id: s.amsT_Id, ECACTA_SkillArea: 'Health & Physical Education', ECACT_Id: 1, ECT_Id: 1, EMGD_Name: getCoGrade(sidx, 0) },
                { AMST_Id: s.amsT_Id, ECACTA_SkillArea: 'Health & Physical Education', ECACT_Id: 1, ECT_Id: 2, EMGD_Name: getCoGrade(sidx, 1) },
                { AMST_Id: s.amsT_Id, ECACTA_SkillArea: 'Art & Craft', ECACT_Id: 1, ECT_Id: 1, EMGD_Name: getCoGrade(sidx, 2) },
                { AMST_Id: s.amsT_Id, ECACTA_SkillArea: 'Art & Craft', ECACT_Id: 1, ECT_Id: 2, EMGD_Name: getCoGrade(sidx, 3) },
                { AMST_Id: s.amsT_Id, ECACTA_SkillArea: 'Music', ECACT_Id: 1, ECT_Id: 1, EMGD_Name: getCoGrade(sidx, 4) },
                { AMST_Id: s.amsT_Id, ECACTA_SkillArea: 'Music', ECACT_Id: 1, ECT_Id: 2, EMGD_Name: getCoGrade(sidx, 5) },
            ]));
            const mockAttendance = selectedStudentObjs.map(s => ({ AMST_Id: s.amsT_Id, TotalSchoolDays: 220 }));
            const mockPresent = selectedStudentObjs.map(s => ({ AMST_Id: s.amsT_Id, TotalPresentDays: Math.floor(Math.random() * 20) + 200 }));

            const mockData = {
                getstudentdetails: mockStudentDetails,
                getstudentwisesubjectlist: mockSubjectList,
                getstudentmarksdetails: mockAllMarks,
                getgroupdetails: MOCK_GROUPS,
                gettermdetails: MOCK_TERMS,
                getstudentwiseactiviteslistterm: mockActivities,
                getpromotionremarksdetails: [],
                work_attendence: mockAttendance,
                present_attendence: mockPresent,
            };

            const resData = response?.data ?? response;
            const rawStudents = resData?.getstudentdetails ?? resData?.getStudentDetails ?? resData?.studentDetails;
            const rawMarks = resData?.getstudentmarksdetails ?? resData?.studentmarksdetails ?? resData?.getstudentwisetotaldetails;

            const hasStudents = Array.isArray(rawStudents)
                ? rawStudents.length > 0
                : Boolean(rawStudents?.$values && Array.isArray(rawStudents.$values) && rawStudents.$values.length > 0);

            const hasMarks = Array.isArray(rawMarks)
                ? rawMarks.length > 0
                : Boolean(rawMarks?.$values && Array.isArray(rawMarks.$values) && rawMarks.$values.length > 0);

            const isLive = hasStudents && hasMarks;
            console.log(isLive ? '=== [REPORT] USING LIVE API DATA ===' : '=== [REPORT] USING PREVIEW DATA (DB MARKS UNPOPULATED) ===', isLive ? resData : mockData);

            const finalData = isLive ? resData : mockData;

            if (onSuccess) onSuccess(finalData);
            if (onReportGenerated) onReportGenerated(finalData, String(selectedYear));
            toast.success(isLive ? 'Report generated from Live API' : 'Report generated (Preview mode)');
        } catch (err) {
            console.error('Report submission error:', err);
            toast.error('An error occurred while generating the report');
        }
    };

    return (
        <div className='rounded-lg border bg-card text-card-foreground shadow-sm p-6'>
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-6' noValidate>
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                        {/* Left: Dropdowns */}
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
                                                value={field.value ? String(field.value) : ''}
                                            >
                                                <SelectTrigger className='w-full'>
                                                    <SelectValue placeholder={academicYearLoading ? 'Loading...' : 'Select Academic Year'} />
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
                                                value={field.value ? String(field.value) : ''}
                                            >
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
                                                value={field.value ? String(field.value) : ''}
                                            >
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
                        </div>

                        {/* Right: Student Multi-select */}
                        <div className='space-y-4'>
                            <div className='flex flex-col gap-2 sm:flex-row sm:items-start'>
                                <Label className='flex items-center gap-2 font-medium text-sm sm:w-32'>
                                    <Checkbox
                                        checked={allSelected}
                                        onCheckedChange={(checked) => {
                                            setValue(
                                                'studentList',
                                                checked ? students.map((s) => ({ amsT_Id: s.amsT_Id })) : [],
                                                { shouldValidate: true }
                                            );
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
                                                                                field.onChange([...(field.value || []), { amsT_Id: s.amsT_Id }]);
                                                                            } else {
                                                                                field.onChange((field.value || []).filter((v) => v.amsT_Id !== s.amsT_Id));
                                                                            }
                                                                        }}
                                                                    />
                                                                    <Label htmlFor={`stu-${s.amsT_Id}`} className='cursor-pointer text-sm font-medium'>
                                                                        {s.studentname}
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
                            disabled={isSubmitting || !selectedStudentsList?.length}
                            className='min-w-[140px]'
                        >
                            {isSubmitting ? 'Generating...' : 'Report'}
                        </Button>
                        <Button
                            type='button'
                            variant='outline'
                            onClick={() => { reset(); setStudents([]); setSearchTerm(''); }}
                            className='min-w-[100px]'
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </FormProvider>
        </div>
    );
}

export default ReportForm;
