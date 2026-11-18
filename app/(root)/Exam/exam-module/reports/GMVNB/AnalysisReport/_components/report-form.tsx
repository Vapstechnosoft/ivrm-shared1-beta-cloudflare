'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import { getClassDropDownByAcademicYearlist } from '@/server/exam/exam-module/reports/cumulative-report';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_CLASSES = [
    { asmcL_Id: 381, asmcL_ClassName: 'Pre-Nursery' },
    { asmcL_Id: 382, asmcL_ClassName: 'LKG' },
    { asmcL_Id: 383, asmcL_ClassName: 'UKG' },
    { asmcL_Id: 384, asmcL_ClassName: 'Class I' },
    { asmcL_Id: 385, asmcL_ClassName: 'Class II' },
    { asmcL_Id: 386, asmcL_ClassName: 'Class III' },
    { asmcL_Id: 387, asmcL_ClassName: 'Class IV' },
    { asmcL_Id: 388, asmcL_ClassName: 'Class V' },
    { asmcL_Id: 389, asmcL_ClassName: 'Class VI' },
    { asmcL_Id: 390, asmcL_ClassName: 'Class VII' },
    { asmcL_Id: 391, asmcL_ClassName: 'Class VIII' },
    { asmcL_Id: 392, asmcL_ClassName: 'Class IX' },
    { asmcL_Id: 393, asmcL_ClassName: 'Class X' }
];

const MOCK_EXAMS = [
    { emE_Id: 1, emE_ExamName: 'Unit Test - 1' },
    { emE_Id: 2, emE_ExamName: 'Midterm Examination' },
    { emE_Id: 3, emE_ExamName: 'Unit Test - 2' },
    { emE_Id: 4, emE_ExamName: 'Annual Examination' }
];

const MOCK_REPORT_DATA = {
    studlist: [
        {
            ExamName: 'Annual Examination',
            ClassName: 'Class VI',
            TotalStudent: 45,
            PassedAllSubjects: 38,
            FailedAllSubjects: 7,
            HighestPercentage: '97.80%',
            LowestPercentage: '34.50%',
            ClassAverage: '74.20%',
            Fail1Subject: 4,
            Fail2Subject: 2,
            Fail3Subject: 1,
            Fail4Subject: 0,
            Fail5Subject: 0,
            CountEngFailure: 2,
            CountHindiFailure: 1,
            CountkndFailure: 3,
            CountMathsFailure: 4,
            CountScienceFailure: 2,
            CountSocialScienceFailure: 1,
            CountEvsFailure: 0,
            Above90to100: 5,
            Above80to89: 9,
            Above70to79: 12,
            Above60to69: 8,
            Above50to59: 4,
            Above40to49: 5,
            Above33to39: 2,
            Below33: 0
        }
    ],
    subjectlists: [
        { ISMS_Id: 101, ISMS_SubjectName: 'English' },
        { ISMS_Id: 102, ISMS_SubjectName: 'Hindi' },
        { ISMS_Id: 103, ISMS_SubjectName: 'Kannada' },
        { ISMS_Id: 104, ISMS_SubjectName: 'Mathematics' },
        { ISMS_Id: 105, ISMS_SubjectName: 'Science' },
        { ISMS_Id: 106, ISMS_SubjectName: 'Social Science' }
    ],
    subjectcountlist: [
        { ISMS_Id: 101, HighestMarks: 99, LowestMarks: 28, AverageMarks: 72.5 },
        { ISMS_Id: 102, HighestMarks: 95, LowestMarks: 32, AverageMarks: 68.4 },
        { ISMS_Id: 103, HighestMarks: 97, LowestMarks: 25, AverageMarks: 65.2 },
        { ISMS_Id: 104, HighestMarks: 100, LowestMarks: 22, AverageMarks: 70.8 },
        { ISMS_Id: 105, HighestMarks: 96, LowestMarks: 30, AverageMarks: 73.1 },
        { ISMS_Id: 106, HighestMarks: 98, LowestMarks: 35, AverageMarks: 76.3 }
    ],
    asmcL_Id: 389
};

// ─── Form types ────────────────────────────────────────────────────────────────

interface FormValues {
    ASMAY_Id: string;
    ASMCL_Id: string;
    emE_Id: string;
}

interface AnalysisReportFormProps {
    title: string;
    onReportGenerated: (data: any, params: any) => void;
    onReset: () => void;
}

export const AnalysisReportForm = ({ title, onReportGenerated, onReset }: AnalysisReportFormProps) => {
    const { data: academicData, isLoading: academicYearLoading } = useAcademicYearDropdown();
    const academicYears = academicData?.data || [];

    const [classes, setClasses] = useState<any[]>(MOCK_CLASSES);
    const [loadingClasses, setLoadingClasses] = useState(false);
    const [exams] = useState<any[]>(MOCK_EXAMS);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        control,
        handleSubmit,
        reset,
        setValue,
        formState: { errors }
    } = useForm<FormValues>({
        defaultValues: { ASMAY_Id: '', ASMCL_Id: '', emE_Id: '' }
    });

    const watchYear = useWatch({ control, name: 'ASMAY_Id' });
    const watchClass = useWatch({ control, name: 'ASMCL_Id' });

    useEffect(() => {
        if (!watchYear) {
            setClasses(MOCK_CLASSES);
            return;
        }
        (async () => {
            try {
                setLoadingClasses(true);
                const res = await getClassDropDownByAcademicYearlist(Number(watchYear));
                if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
                    setClasses(res.data);
                } else {
                    setClasses(MOCK_CLASSES);
                }
                setValue('ASMCL_Id', '');
                setValue('emE_Id', '');
            } catch {
                setClasses(MOCK_CLASSES);
            } finally {
                setLoadingClasses(false);
            }
        })();
    }, [watchYear, setValue]);

    const onSubmit = async (values: FormValues) => {
        setIsSubmitting(true);
        try {
            // APIs not ready — use mock data
            await new Promise((res) => setTimeout(res, 600));
            const selectedClass = classes.find((c: any) => String(c.asmcL_Id ?? c.ASMCL_Id ?? c.classid) === values.ASMCL_Id);
            const selectedExam = exams.find((e: any) => String(e.emE_Id ?? e.EME_Id) === values.emE_Id);
            const classIdNum =
                Number(values.ASMCL_Id) ||
                Number(selectedClass?.asmcL_Id ?? selectedClass?.ASMCL_Id ?? selectedClass?.classid) ||
                MOCK_REPORT_DATA.asmcL_Id;
            const mockData = {
                ...MOCK_REPORT_DATA,
                studlist: MOCK_REPORT_DATA.studlist.map((r) => ({
                    ...r,
                    ClassName: selectedClass?.asmcL_ClassName ?? selectedClass?.ASMCL_ClassName ?? selectedClass?.classname ?? r.ClassName,
                    ExamName: selectedExam?.emE_ExamName ?? selectedExam?.EME_ExamName ?? r.ExamName
                })),
                asmcL_Id: classIdNum
            };
            onReportGenerated(mockData, values);
            toast.success('Report generated successfully');
        } catch {
            toast.error('Failed to generate report');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClear = () => {
        reset({ ASMAY_Id: '', ASMCL_Id: '', emE_Id: '' });
        onReset();
    };

    return (
        <div className='mx-auto w-full rounded-lg border border-gray-200 bg-white p-4 shadow-md'>
            <div className='mb-4 flex items-center justify-between border-b pb-2'>
                <h3 className='font-semibold text-gray-800 text-lg'>{title}</h3>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                    {/* Academic Year */}
                    <Controller
                        control={control}
                        name='ASMAY_Id'
                        rules={{ required: 'Please select Academic Year' }}
                        render={({ field, fieldState }) => (
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
                                {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                            </div>
                        )}
                    />

                    {/* Class */}
                    <Controller
                        control={control}
                        name='ASMCL_Id'
                        rules={{ required: 'Please select Class' }}
                        render={({ field, fieldState }) => (
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
                                                Loading Classes...
                                            </SelectItem>
                                        ) : (
                                            classes.map((c: any) => {
                                                const id = c.asmcL_Id ?? c.ASMCL_Id ?? c.classid;
                                                const name = c.asmcL_ClassName ?? c.ASMCL_ClassName ?? c.classname;
                                                return (
                                                    <SelectItem key={id} value={String(id)}>
                                                        {name}
                                                    </SelectItem>
                                                );
                                            })
                                        )}
                                    </SelectContent>
                                </Select>
                                {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                            </div>
                        )}
                    />

                    {/* Exam Name */}
                    <Controller
                        control={control}
                        name='emE_Id'
                        rules={{ required: 'Please select Exam' }}
                        render={({ field, fieldState }) => (
                            <div className='space-y-2'>
                                <Label>
                                    Exam Name <span className='text-red-500'>*</span>
                                </Label>
                                <Select onValueChange={field.onChange} value={field.value} disabled={!watchClass}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select Exam Name' />
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
                        )}
                    />
                </div>

                <div className='mt-6 flex justify-center gap-4 border-t pt-4'>
                    <Button type='submit' disabled={isSubmitting} className='min-w-[120px]'>
                        {isSubmitting ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null}
                        Report
                    </Button>
                    <Button type='button' variant='destructive' onClick={handleClear} disabled={isSubmitting} className='min-w-[120px]'>
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    );
};
