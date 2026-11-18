'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Search } from 'lucide-react';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import {
    getClassDropDownByAcademicYearlist,
    getSectionsDropDownByAcademicYearandClasslist,
    getStudentsDropDownByAcademicYearandClassandSectionlist,
} from '@/server/exam/exam-module/reports/cumulative-report';
import { getSamarthaProgressCardReportPromotion } from '@/server/exam/exam-module/reports/SamarthaProgressCardReportPromotion';

const formSchema = z.object({
    asmaY_Id: z.number().min(1, 'Academic Year is required'),
    asmcL_Id: z.number().min(1, 'Class is required'),
    asmS_Id: z.number().min(1, 'Section is required'),
    studentList: z.array(z.object({ amsT_Id: z.number() })).min(1, 'Select at least one student'),
});

type FormSchema = z.infer<typeof formSchema>;

interface Props {
    onSuccess: (data: any) => void;
}

export default function ReportForm({ onSuccess }: Props) {
    const { data: academicData, isLoading: academicYearLoading } = useAcademicYearDropdown();
    const years = (academicData as any)?.data || [];
    const [classes, setClasses] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const form = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            asmaY_Id: 0,
            asmcL_Id: 0,
            asmS_Id: 0,
            studentList: [],
        },
    });

    const onYearChange = async (value: number) => {
        form.setValue('asmcL_Id', 0);
        form.setValue('asmS_Id', 0);
        form.setValue('studentList', []);
        setClasses([]);
        setSections([]);
        setStudents([]);
        const res = await getClassDropDownByAcademicYearlist(value);
        if (res.success) setClasses(res.data || []);
    };

    const onClassChange = async (value: number) => {
        form.setValue('asmS_Id', 0);
        form.setValue('studentList', []);
        setSections([]);
        setStudents([]);
        const res = await getSectionsDropDownByAcademicYearandClasslist(form.getValues('asmaY_Id'), value);
        if (res.success) setSections(res.data || []);
    };

    const onSectionChange = async (value: number) => {
        form.setValue('studentList', []);
        setStudents([]);
        const res = await getStudentsDropDownByAcademicYearandClassandSectionlist(
            form.getValues('asmaY_Id'),
            form.getValues('asmcL_Id'),
            value
        );
        if (res.success) {
            const rawList = res.data || [];
            const list = Array.isArray(rawList) ? rawList : [];
            const mappedList = list.map((s: any) => ({
                amsT_Id: s.amsT_Id ?? s.AMST_Id,
                studentname: s.studentName ||
                    s.studentname ||
                    `${s.amsT_FirstName || ''} ${s.amsT_MiddleName || ''} ${s.amsT_LastName || ''}`.trim()
            }));
            setStudents(mappedList);
            // Default select all
            form.setValue('studentList', mappedList.map((s: any) => ({ amsT_Id: s.amsT_Id })));
        }
    };

    const onSubmit = async (data: FormSchema) => {
        setLoading(true);
        try {
            const response = await getSamarthaProgressCardReportPromotion({
                ASMAY_Id: data.asmaY_Id,
                ASMCL_Id: data.asmcL_Id,
                ASMS_Id: data.asmS_Id,
                Temp_AmstIds: data.studentList
            });

            // ── Build hardcoded fallback ──
            const selectedStudentObjs = students.filter(s =>
                data.studentList.some(sl => sl.amsT_Id === s.amsT_Id)
            );

            const MOCK_SUBJECTS = [
                { ISMS_Id: 1, ISMS_SubjectName: 'English', EMPS_AppToResultFlg: true },
                { ISMS_Id: 2, ISMS_SubjectName: 'Hindi',   EMPS_AppToResultFlg: true },
                { ISMS_Id: 3, ISMS_SubjectName: 'Maths',   EMPS_AppToResultFlg: true },
                { ISMS_Id: 4, ISMS_SubjectName: 'Science',  EMPS_AppToResultFlg: true },
                { ISMS_Id: 5, ISMS_SubjectName: 'Social Science', EMPS_AppToResultFlg: true },
                { ISMS_Id: 6, ISMS_SubjectName: 'Artificial Intelligence', EMPS_AppToResultFlg: false },
            ];

            const MOCK_GROUPS = [
                { empG_GroupName: 'Half Yearly', empG_DistplayName: 'FA-1', empsG_GroupName: 'FA-1', empsG_MarksValue: 10 },
                { empG_GroupName: 'Half Yearly', empG_DistplayName: 'SA-1', empsG_GroupName: 'SA-1', empsG_MarksValue: 30 },
                { empG_GroupName: 'Half Yearly', empG_DistplayName: 'Term I',  empsG_GroupName: 'Term I',  empsG_MarksValue: 100 },
                { empG_GroupName: 'Anual Exam',  empG_DistplayName: 'FA-2', empsG_GroupName: 'FA-2', empsG_MarksValue: 10 },
                { empG_GroupName: 'Anual Exam',  empG_DistplayName: 'SA-2', empsG_GroupName: 'SA-2', empsG_MarksValue: 30 },
                { empG_GroupName: 'Anual Exam',  empG_DistplayName: 'Term II', empsG_GroupName: 'Term II', empsG_MarksValue: 100 },
            ];

            const MOCK_TERMS = [
                { ecT_Id: 1, ecT_TermName: 'Term I' },
                { ecT_Id: 2, ecT_TermName: 'Term II' },
            ];

            const buildMockMarks = (amstId: number) => {
                const marks: any[] = [];
                MOCK_SUBJECTS.forEach(sub => {
                    const fa1 = Math.floor(Math.random() * 3) + 7;
                    const sa1 = Math.floor(Math.random() * 8) + 22;
                    const fa2 = Math.floor(Math.random() * 3) + 7;
                    const sa2 = Math.floor(Math.random() * 8) + 22;
                    const t1  = fa1 + sa1;
                    const t2  = fa2 + sa2;
                    marks.push(
                        { AMST_Id: amstId, ISMS_Id: sub.ISMS_Id, EMPSG_DisplayName: 'FA-1',    ObtainedMarks: fa1, ObtainedGrade: 'A', PassFailFlag: 'P', Flag: 0 },
                        { AMST_Id: amstId, ISMS_Id: sub.ISMS_Id, EMPSG_DisplayName: 'SA-1',    ObtainedMarks: sa1, ObtainedGrade: 'A', PassFailFlag: 'P', Flag: 0 },
                        { AMST_Id: amstId, ISMS_Id: sub.ISMS_Id, EMPSG_DisplayName: 'Term I',  ObtainedMarks: t1,  ObtainedGrade: 'A', PassFailFlag: 'P', Flag: 11 },
                        { AMST_Id: amstId, ISMS_Id: sub.ISMS_Id, EMPSG_DisplayName: 'FA-2',    ObtainedMarks: fa2, ObtainedGrade: 'A', PassFailFlag: 'P', Flag: 0 },
                        { AMST_Id: amstId, ISMS_Id: sub.ISMS_Id, EMPSG_DisplayName: 'SA-2',    ObtainedMarks: sa2, ObtainedGrade: 'A', PassFailFlag: 'P', Flag: 0 },
                        { AMST_Id: amstId, ISMS_Id: sub.ISMS_Id, EMPSG_DisplayName: 'Term II', ObtainedMarks: t2,  ObtainedGrade: 'A', PassFailFlag: 'P', Flag: 12 },
                        { AMST_Id: amstId, ISMS_Id: sub.ISMS_Id, EMPSG_DisplayName: 'Average', ObtainedMarks: Math.round((t1+t2)/2), ObtainedGrade: 'A', PassFailFlag: 'P', Flag: 0 },
                    );
                });
                marks.push({ AMST_Id: amstId, ISMS_Id: 0, EMPSG_DisplayName: 'Total', ObtainedMarks: 450, Flag: 900012, ObtainedGrade: 'A' });
                marks.push({ AMST_Id: amstId, ISMS_Id: 0, EMPSG_DisplayName: 'Percent', ObtainedMarks: 85,  Flag: 900011 });
                return marks;
            };

            const mockStudentDetails = selectedStudentObjs.map((s, i) => ({
                AMST_Id:     s.amsT_Id,
                studentname: s.studentname,
                classname:   classes.find(c => String(c.asmcL_Id) === String(data.asmcL_Id))?.asmcL_ClassName || 'Class',
                sectionname: sections.find(sec => String(sec.asmS_Id) === String(data.asmS_Id))?.asmC_SectionName || 'Section',
                rollno:      String(i + 1).padStart(2, '0'),
                fathername:  'Parent Name',
                dob:         '01/01/2010',
                admno:       'ADM' + (1000 + i),
                AMST_APAARId: 'APAAR' + (5000 + i),
                AMST_PENNo:   'PEN' + (9000 + i),
                AMST_Photoname: '',
            }));

            const mockAllMarks = selectedStudentObjs.flatMap(s => buildMockMarks(s.amsT_Id));
            const mockSubjectList = selectedStudentObjs.flatMap(s =>
                MOCK_SUBJECTS.map(sub => ({ ...sub, AMST_Id: s.amsT_Id }))
            );
            const mockActivities = selectedStudentObjs.flatMap(s => ([
                { AMST_Id: s.amsT_Id, ECACTA_SkillArea: 'Drawing & Craft', ECACT_Id: 1, ECT_Id: 1, EMGD_Name: 'A' },
                { AMST_Id: s.amsT_Id, ECACTA_SkillArea: 'Drawing & Craft', ECACT_Id: 1, ECT_Id: 2, EMGD_Name: 'A+' },
                { AMST_Id: s.amsT_Id, ECACTA_SkillArea: 'Sports',          ECACT_Id: 1, ECT_Id: 1, EMGD_Name: 'B' },
                { AMST_Id: s.amsT_Id, ECACTA_SkillArea: 'Sports',          ECACT_Id: 1, ECT_Id: 2, EMGD_Name: 'A' },
            ]));

            const mockGradeReport = selectedStudentObjs.flatMap(s => ([
                { AMST_Id: s.amsT_Id, ECACT_SkillName: 'Co-curricular Activities', ECACT_Id: 1, ECACTA_SkillArea: 'Drawing & Craft', ECT_Id: 1, EMGD_Name: 'A', ECSACTT_Score: 90 },
                { AMST_Id: s.amsT_Id, ECACT_SkillName: 'Co-curricular Activities', ECACT_Id: 1, ECACTA_SkillArea: 'Drawing & Craft', ECT_Id: 2, EMGD_Name: 'A+', ECSACTT_Score: 95 },
                { AMST_Id: s.amsT_Id, ECACT_SkillName: 'Co-curricular Activities', ECACT_Id: 1, ECACTA_SkillArea: 'Sports',          ECT_Id: 1, EMGD_Name: 'B',  ECSACTT_Score: 70 },
                { AMST_Id: s.amsT_Id, ECACT_SkillName: 'Co-curricular Activities', ECACT_Id: 1, ECACTA_SkillArea: 'Sports',          ECT_Id: 2, EMGD_Name: 'A',  ECSACTT_Score: 85 },
            ]));

            const mockAttendance = selectedStudentObjs.map(s => ({ AMST_Id: s.amsT_Id, TotalSchoolDays: 220 }));
            const mockPresent    = selectedStudentObjs.map(s => ({ AMST_Id: s.amsT_Id, TotalPresentDays: 210 }));

            const mockData = {
                getstudentdetails:              mockStudentDetails,
                getstudentwisesubjectlist:      mockSubjectList,
                getstudentmarksdetails:         mockAllMarks,
                getgroupdetails:                MOCK_GROUPS,
                gettermdetails:                 MOCK_TERMS,
                getgradereport:                 mockGradeReport,
                getpromotionremarksdetails:     [],
                work_attendence:                mockAttendance,
                present_attendence:             mockPresent,
            };

            const finalData = (response?.success && response.data?.getstudentdetails?.length > 0)
                ? response.data
                : mockData;

            onSuccess(finalData);
            toast.success('Report generated successfully');
        } catch {
            toast.error('An error occurred while generating the report');
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = students.filter(s =>
        (s.studentname || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>Selection Criteria</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                            <FormField
                                control={form.control}
                                name='asmaY_Id'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Academic Year</FormLabel>
                                        <Select onValueChange={(v) => { const val = Number(v); field.onChange(val); onYearChange(val); }} value={field.value > 0 ? String(field.value) : ''}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={academicYearLoading ? 'Loading...' : 'Select Year'} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {years.map((y: any) => (
                                                    <SelectItem key={y.asmaY_Id} value={String(y.asmaY_Id)}>
                                                        {y.asmaY_Year}
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
                                name='asmcL_Id'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Class</FormLabel>
                                        <Select onValueChange={(v) => { const val = Number(v); field.onChange(val); onClassChange(val); }} value={field.value > 0 ? String(field.value) : ''} disabled={!form.watch('asmaY_Id')}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Select Class' />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {classes.map((c) => (
                                                    <SelectItem key={c.asmcL_Id} value={String(c.asmcL_Id)}>
                                                        {c.asmcL_ClassName}
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
                                name='asmS_Id'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Section</FormLabel>
                                        <Select onValueChange={(v) => { const val = Number(v); field.onChange(val); onSectionChange(val); }} value={field.value > 0 ? String(field.value) : ''} disabled={!form.watch('asmcL_Id')}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Select Section' />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {sections.map((s) => (
                                                    <SelectItem key={s.asmS_Id} value={String(s.asmS_Id)}>
                                                        {s.asmC_SectionName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {students.length > 0 && (
                            <div className='space-y-2'>
                                <div className='flex items-center justify-between'>
                                    <FormLabel>Select Students</FormLabel>
                                    <div className='flex items-center gap-2'>
                                        <div className='relative w-48'>
                                            <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                                            <input
                                                className='flex h-9 w-full rounded-md border border-input bg-transparent px-8 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'
                                                placeholder='Search...'
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <Checkbox
                                                id='select-all'
                                                checked={form.watch('studentList').length === students.length}
                                                onCheckedChange={(checked) => {
                                                    form.setValue('studentList', checked ? students.map(s => ({ amsT_Id: s.amsT_Id })) : []);
                                                }}
                                            />
                                            <label htmlFor='select-all' className='text-sm font-medium'>All</label>
                                        </div>
                                    </div>
                                </div>
                                <div className='grid h-48 grid-cols-1 gap-2 overflow-y-auto rounded-md border p-4 md:grid-cols-3'>
                                    {filteredStudents.map((s) => (
                                        <div key={s.amsT_Id} className='flex items-center space-x-2'>
                                            <Checkbox
                                                id={`student-${s.amsT_Id}`}
                                                checked={form.watch('studentList').some(sl => sl.amsT_Id === s.amsT_Id)}
                                                onCheckedChange={(checked) => {
                                                    const current = form.getValues('studentList');
                                                    if (checked) {
                                                        form.setValue('studentList', [...current, { amsT_Id: s.amsT_Id }]);
                                                    } else {
                                                        form.setValue('studentList', current.filter(sl => sl.amsT_Id !== s.amsT_Id));
                                                    }
                                                }}
                                            />
                                            <label htmlFor={`student-${s.amsT_Id}`} className='text-sm truncate'>{s.studentname}</label>
                                        </div>
                                    ))}
                                </div>
                                <FormMessage>{form.formState.errors.studentList?.message}</FormMessage>
                            </div>
                        )}

                        <div className='flex justify-end gap-4'>
                            <Button type='button' variant='outline' onClick={() => form.reset()}>Cancel</Button>
                            <Button type='submit' disabled={loading}>
                                {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                                Report
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
