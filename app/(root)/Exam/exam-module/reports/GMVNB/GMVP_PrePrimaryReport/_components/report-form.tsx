'use client';

import { Button } from '@/components/ui/button';
import { CustomMultiSelectBox } from '@/components/ui/custom-multiselect';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import { getMultipleExamProgressReport } from '@/server/exam/exam-module/reports/Baldwin/multiple-exam-progress-card-report-2';
import {
    getClassDropDownByAcademicYearlist,
    getExamsDropDownByAcademicYearandClassandSectionlist,
    getSectionsDropDownByAcademicYearandClasslist
} from '@/server/exam/exam-module/reports/cumulative-report';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

interface ReportFormProps {
    title: string;
    onReportGenerated: (data: any, params: any) => void;
    onReset: () => void;
}

export const ReportForm = ({ title, onReportGenerated, onReset }: ReportFormProps) => {
    const { data: academicData, isLoading: academicYearLoading } = useAcademicYearDropdown();
    const academicYears = academicData?.data || [];

    const [classes, setClasses] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [exams, setExams] = useState<any[]>([]);

    const [loadingClasses, setLoadingClasses] = useState(false);
    const [loadingSections, setLoadingSections] = useState(false);
    const [loadingExams, setLoadingExams] = useState(false);

    const methods = useForm({
        defaultValues: {
            ASMAY_Id: '',
            ASMCL_Id: '',
            ASMS_Id: '',
            selectedExams: [] as string[],
            Reopen_Date: new Date(),
            BG: 'BG1'
        }
    });

    const { control, handleSubmit, setValue, reset, formState } = methods;
    const { isSubmitting } = formState;

    const watchYear = useWatch({ control, name: 'ASMAY_Id' });
    const watchClass = useWatch({ control, name: 'ASMCL_Id' });
    const watchSection = useWatch({ control, name: 'ASMS_Id' });

    useEffect(() => {
        if (!watchYear) return;
        (async () => {
            try {
                setLoadingClasses(true);
                const { data } = await getClassDropDownByAcademicYearlist(Number(watchYear));
                setClasses(Array.isArray(data) ? data : []);
                setValue('ASMCL_Id', '');
                setValue('ASMS_Id', '');
                setValue('selectedExams', []);
            } catch {
                toast.error('Failed to load classes');
            } finally {
                setLoadingClasses(false);
            }
        })();
    }, [watchYear, setValue]);

    useEffect(() => {
        if (!watchYear || !watchClass) return;
        (async () => {
            try {
                setLoadingSections(true);
                const { data } = await getSectionsDropDownByAcademicYearandClasslist(Number(watchYear), Number(watchClass));
                setSections(Array.isArray(data) ? data : []);
                setValue('ASMS_Id', '');
                setValue('selectedExams', []);
            } catch {
                toast.error('Failed to load sections');
            } finally {
                setLoadingSections(false);
            }
        })();
    }, [watchYear, watchClass, setValue]);

    useEffect(() => {
        if (!watchYear || !watchClass || !watchSection) return;
        (async () => {
            try {
                setLoadingExams(true);
                const { data } = await getExamsDropDownByAcademicYearandClassandSectionlist(
                    Number(watchYear),
                    Number(watchClass),
                    Number(watchSection)
                );
                setExams(Array.isArray(data) ? data : []);
            } catch {
                toast.error('Failed to load exams');
            } finally {
                setLoadingExams(false);
            }
        })();
    }, [watchYear, watchClass, watchSection, setValue]);

    const onSubmit = async (values: any) => {
        if (!values.selectedExams?.length) {
            toast.error('Please select at least one exam');
            return;
        }

        try {
            const selectedExamsList = exams
                .filter((e) => values.selectedExams.includes(String(e.emE_Id)))
                .map((e) => ({ EME_Id: Number(e.emE_Id), EME_ExamName: e.emE_ExamName }));

            const payload = {
                ASMAY_Id: Number(values.ASMAY_Id),
                ASMCL_Id: Number(values.ASMCL_Id),
                ASMS_Id: Number(values.ASMS_Id),
                examlist: selectedExamsList
            };

            const response = await getMultipleExamProgressReport(payload);

            if (response && response.data) {
                const apiData = response.data;
                const {
                    getstudentmarksdetails = [],
                    getstudentwisesubjectlist = [],
                    getstudentdetails = [],
                    getexamdetails = [],
                    getexamwisesubsubjectlist = [],
                    getstudentwisesubjectlistnew = [],
                    getstudentwiseattendancedetails = [],
                    examwiseremarks = [],
                    getstudentwiseactiviteslist = []
                } = apiData;

                if (!getstudentmarksdetails || getstudentmarksdetails.length === 0) {
                    toast.error('No record found for the selected criteria');
                    return;
                }

                // 1. Unique exam details list
                const examlist_new: any[] = [];
                getexamdetails.forEach((exm: any) => {
                    if (examlist_new.length === 0) {
                        examlist_new.push(exm);
                    } else {
                        const exists = examlist_new.some((existingExm) => existingExm.emE_Id === exm.emE_Id);
                        if (!exists) {
                            examlist_new.push(exm);
                        }
                    }
                });

                // Keep all students returned from getstudentdetails
                const filteredStudents = getstudentdetails;

                if (filteredStudents.length === 0) {
                    toast.error('No student records found in API response');
                    return;
                }

                // Transform each student object to append necessary nested arrays
                const transformedStudents = filteredStudents.map((st: any) => {
                    const studentId = st.AMST_Id ?? st.amsT_Id;

                    // Obtained subject sub-exam marks
                    const obtaioned_subject_wisemarks = getexamwisesubsubjectlist.filter(
                        (dev: any) => (dev.AMST_Id ?? dev.amsT_Id) === studentId
                    );

                    // Student subjects
                    const studentSubjects = getstudentwisesubjectlist.filter((sub: any) => (sub.AMST_Id ?? sub.amsT_Id) === studentId);

                    // Nested subexam_list under each subject
                    const subjectsWithSubExams = studentSubjects.map((stu_sub: any) => {
                        const subexam_list_for_this_subject: any[] = [];
                        getexamwisesubsubjectlist.forEach((sub_exam: any) => {
                            if (stu_sub.ISMS_Id === sub_exam.ISMS_Id) {
                                const exists = subexam_list_for_this_subject.some(
                                    (existingSubExam) => existingSubExam.EMSS_Id === sub_exam.EMSS_Id
                                );
                                if (!exists) {
                                    subexam_list_for_this_subject.push(sub_exam);
                                }
                            }
                        });
                        return {
                            ...stu_sub,
                            subexam_list: subexam_list_for_this_subject
                        };
                    });

                    // Activity Skill areas
                    const studentActivitiesMap = new Map();
                    getstudentwiseactiviteslist.forEach((activity: any) => {
                        if ((activity.AMST_Id ?? activity.amsT_Id) === studentId) {
                            studentActivitiesMap.set(activity.ECACTA_SkillArea, activity);
                        }
                    });
                    const ECACTA_SkillArea_temp = Array.from(studentActivitiesMap.values());

                    // Main student-wise activities
                    const activity_mian_stu_wise = getstudentwiseactiviteslist.filter(
                        (act: any) => (act.AMST_Id ?? act.amsT_Id) === studentId
                    );

                    // Attendance sums
                    let totalWorkingDays = 0;
                    let totalPresentDays = 0;
                    getstudentwiseattendancedetails.forEach((su: any) => {
                        if ((su.AMST_Id ?? su.amsT_Id) === studentId) {
                            totalWorkingDays += Number(su.TOTALWORKINGDAYS ?? su.totalWorkingDays ?? su.TotalWorkingDays ?? 0);
                            totalPresentDays += Number(su.PRESENTDAYS ?? su.presentDays ?? su.PresentDays ?? 0);
                        }
                    });

                    // Remarks
                    const exam_wise_remarks = examwiseremarks.filter((atten: any) => (atten.AMST_Id ?? atten.amsT_Id) === studentId);

                    // Grades
                    const obtgrade = getstudentwisesubjectlistnew.filter((su: any) => (su.AMST_Id ?? su.amsT_Id) === studentId);

                    // Marks
                    const marks = getstudentmarksdetails.filter((su: any) => (su.AMST_Id ?? su.amsT_Id) === studentId);

                    return {
                        ...st,
                        AMST_Id: studentId,
                        obtaioned_subject_wisemarks,
                        subjects: subjectsWithSubExams,
                        ECACTA_SkillArea_temp,
                        activity_mian_stu_wise,
                        totalWorkingDays,
                        totalPresentDays,
                        exam_wise_remarks,
                        obtgrade,
                        marks
                    };
                });

                // Unique activities template
                const uniqueActivitiesMap = new Map();
                getstudentwiseactiviteslist.forEach((dev: any) => {
                    uniqueActivitiesMap.set(dev.ECACT_Id, dev);
                });
                const activity_temp = Array.from(uniqueActivitiesMap.values());

                // Year name
                const selectedYearObj = academicYears.find((y: any) => y.asmaY_Id === Number(values.ASMAY_Id));
                const yearName = selectedYearObj?.asmaY_Year || '';

                const finalReportData = {
                    year: yearName,
                    Reopen_Date: values.Reopen_Date,
                    headerbg: values.BG === 'BG1' ? '#ffd3ac' : '#811414d4',
                    marksbg: values.BG === 'BG1' ? '#fdece9' : '#FAF9F6',
                    color: values.BG === 'BG1' ? 'black' : 'white',
                    examlist_new,
                    getstudentdetails: transformedStudents,
                    activity_temp
                };

                onReportGenerated(finalReportData, values);
                toast.success('Report generated successfully');
            } else {
                toast.error('No record found for the selected criteria');
            }
        } catch (error: any) {
            console.error('Submit report error:', error);
            toast.error(error?.message || 'Failed to submit report');
        }
    };

    const handleClear = () => {
        reset();
        setClasses([]);
        setSections([]);
        setExams([]);
        onReset();
    };

    return (
        <div className='mx-auto w-full'>
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                        {/* Left Column */}
                        <div className='space-y-4'>
                            <Controller
                                control={control}
                                name='ASMAY_Id'
                                render={({ field }) => (
                                    <div className='space-y-2'>
                                        <Label>
                                            Academic Year <span className='text-red-500'>*</span>
                                        </Label>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Academic Year' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {academicYearLoading ? (
                                                    <SelectItem value='loading' disabled>
                                                        Loading...
                                                    </SelectItem>
                                                ) : (
                                                    academicYears.map((y: any) => (
                                                        <SelectItem key={y.asmaY_Id} value={String(y.asmaY_Id)}>
                                                            {y.asmaY_Year}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            />
                            <Controller
                                control={control}
                                name='ASMCL_Id'
                                render={({ field }) => (
                                    <div className='space-y-2'>
                                        <Label>
                                            Class <span className='text-red-500'>*</span>
                                        </Label>
                                        <Select onValueChange={field.onChange} value={field.value} disabled={!watchYear}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Class' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {loadingClasses ? (
                                                    <SelectItem value='loading' disabled>
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
                                    </div>
                                )}
                            />
                            <Controller
                                control={control}
                                name='ASMS_Id'
                                render={({ field }) => (
                                    <div className='space-y-2'>
                                        <Label>
                                            Section <span className='text-red-500'>*</span>
                                        </Label>
                                        <Select onValueChange={field.onChange} value={field.value} disabled={!watchClass}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Section' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {loadingSections ? (
                                                    <SelectItem value='loading' disabled>
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
                                    </div>
                                )}
                            />
                            <Controller
                                control={control}
                                name='Reopen_Date'
                                render={({ field }) => (
                                    <div className='space-y-2'>
                                        <Label>
                                            Reopen Date <span className='text-red-500'>*</span>
                                        </Label>
                                        <DatePicker date={field.value} setDate={field.onChange} />
                                    </div>
                                )}
                            />
                            <Controller
                                control={control}
                                name='BG'
                                render={({ field }) => (
                                    <div className='space-y-2'>
                                        <Label>Color</Label>
                                        <div className='flex gap-4'>
                                            <Label className='flex cursor-pointer items-center gap-2'>
                                                <input
                                                    type='radio'
                                                    name='BG'
                                                    value='BG1'
                                                    checked={field.value === 'BG1'}
                                                    onChange={() => field.onChange('BG1')}
                                                    className='h-4 w-4 text-blue-600'
                                                />
                                                <span
                                                    className='inline-block h-4 w-4 rounded'
                                                    style={{ backgroundColor: '#2E6F40' }}></span>
                                            </Label>
                                            <Label className='flex cursor-pointer items-center gap-2'>
                                                <input
                                                    type='radio'
                                                    name='BG'
                                                    value='BG2'
                                                    checked={field.value === 'BG2'}
                                                    onChange={() => field.onChange('BG2')}
                                                    className='h-4 w-4 text-blue-600'
                                                />
                                                <span
                                                    className='inline-block h-4 w-4 rounded'
                                                    style={{ backgroundColor: '#811414d4' }}></span>
                                            </Label>
                                        </div>
                                    </div>
                                )}
                            />
                        </div>

                        {/* Right Column */}
                        <div className='space-y-4'>
                            <div className='flex flex-col gap-2'>
                                <Label className='font-medium'>
                                    Exam <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    control={control}
                                    name='selectedExams'
                                    render={({ field, fieldState }) => (
                                        <CustomMultiSelectBox
                                            options={exams.map((e) => ({ label: e.emE_ExamName, value: String(e.emE_Id) }))}
                                            onChange={field.onChange}
                                            value={field.value}
                                            placeholder='Select Exams'
                                            height='150px'
                                            isSearchRequired
                                            error={fieldState.error?.message}
                                        />
                                    )}
                                />
                            </div>
                        </div>
                    </div>

                    <div className='mt-8 flex justify-center gap-4 border-t pt-6'>
                        <Button type='submit' disabled={isSubmitting} className='min-w-[120px]'>
                            {isSubmitting ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null} Report
                        </Button>
                        <Button type='button' variant='destructive' onClick={handleClear} disabled={isSubmitting} className='min-w-[120px]'>
                            Cancel
                        </Button>
                    </div>
                </form>
            </FormProvider>
        </div>
    );
};
