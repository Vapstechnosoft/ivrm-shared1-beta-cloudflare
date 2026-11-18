'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useMasterGradeDropdownList } from '@/hooks/exam/exammodule/usemasters';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import {
    type MultipleExamCumulativeReportCalcuttaValues,
    multipleExamCumulativeReportCalcuttaSchema
} from '@/schemas/exam/exam-module/reports';
import { getMultipleExamCumulativeReportCalcutta } from '@/server/exam/exam-module/reports/Calcatta/calcutta-promotion-report';
import {
    getClassDropDownByAcademicYearlist,
    getSectionsDropDownByAcademicYearandClasslist
} from '@/server/exam/exam-module/reports/cumulative-report';
import { getExamsDropDownByAcademicYearandClassandSectionlist } from '@/server/exam/exam-module/reports/cumulative-report';
import type { IMasterGrade } from '@/types/exam/exam-module/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, RotateCcw, Search } from 'lucide-react';
import { useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import MultipleExamCumulativeReportCalcuttaList from './report-list';

type MultipleExamCumulativeReportCalcuttaFormProps = {};

const MultipleExamCumulativeReportCalcuttaForm = ({}: MultipleExamCumulativeReportCalcuttaFormProps) => {
    const [isPending, startTransition] = useTransition();
    const [academicYears, setAcademicYears] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [grades, setGrades] = useState<any[]>([]);
    const [exams, setExams] = useState<any[]>([]);
    const [reportData, setReportData] = useState<any>(null);

    const { data: academicData, error: academicError, isLoading: academicYearLoading } = useAcademicYearDropdown();
    const { data: gradeData, error: gradeError } = useMasterGradeDropdownList();

    const form = useForm<MultipleExamCumulativeReportCalcuttaValues>({
        resolver: zodResolver(multipleExamCumulativeReportCalcuttaSchema),
        defaultValues: {
            asmaY_Id: 0,
            asmcL_Id: 0,
            asmS_Id: 0,
            emgR_Id: 0,
            examlist: [],
            empsG_PercentValue: 0,
            flag: '4',
            emE_Id: 0,
            reporttype: '',
            empG_GroupName: ''
        }
    });

    const watchYear = form.watch('asmaY_Id');
    const watchClass = form.watch('asmcL_Id');
    const watchSection = form.watch('asmS_Id');

    // set academic years
    useEffect(() => {
        if (academicError) {
            toast.error(academicError.message || 'Error loading academic years');
            setAcademicYears([]);
        } else if (academicData?.data) {
            const formatted = academicData.data.map((i: any) => ({
                asmaY_Id: i.asmaY_Id ?? 0,
                asmaY_Year: i.asmaY_Year ?? ''
            }));
            setAcademicYears(formatted);
        }
    }, [academicData, academicError]);

    useEffect(() => {
        if (gradeError) {
            toast.error(gradeError.message || 'Error fetching grades');
            setGrades([]);
        } else if (gradeData?.data && Array.isArray(gradeData.data)) {
            const formattedGrades: IMasterGrade[] = gradeData.data.map((item: any) => ({
                emgR_Id: item.emgR_Id?.toString() ?? '',
                emgR_GradeName: item.emgR_GradeName ?? '',
                emgR_MarksPerFlag: item.emgR_MarksPerFlag ?? 'm',
                emgR_ActiveFlag: item.emgR_ActiveFlag ?? true,
                grade_list: [],
                mI_Id: item.mI_Id
            }));
            setGrades(formattedGrades);
        } else {
            setGrades([]);
        }
    }, [gradeData, gradeError]);

    // Year change -> fetch classes
    useEffect(() => {
        if (watchYear > 0) {
            (async () => {
                try {
                    const res = await getClassDropDownByAcademicYearlist(watchYear);
                    if (res?.data) {
                        setClasses(res.data);
                    }
                    form.setValue('asmcL_Id', 0);
                    form.setValue('asmS_Id', 0);
                    form.setValue('emgR_Id', 0);
                    form.setValue('examlist', []);
                    setSections([]);
                    setExams([]);
                } catch (error) {
                    console.error(error);
                }
            })();
        }
    }, [watchYear, form]);

    // Class change -> fetch sections
    useEffect(() => {
        if (watchYear > 0 && watchClass > 0) {
            (async () => {
                try {
                    const res = await getSectionsDropDownByAcademicYearandClasslist(watchYear, watchClass);
                    if (res?.data) {
                        setSections(res.data);
                        console.log(res.data);
                    }
                    form.setValue('asmS_Id', 0);
                    form.setValue('emgR_Id', 0);
                    form.setValue('examlist', []);
                    setExams([]);
                } catch (error) {
                    console.error(error);
                }
            })();
        }
    }, [watchYear, watchClass, form]);

    // Section change -> fetch exams
    useEffect(() => {
        if (watchYear > 0 && watchClass > 0 && watchSection > 0) {
            (async () => {
                try {
                    // Fetch Exams
                    const examRes = await getExamsDropDownByAcademicYearandClassandSectionlist(watchYear, watchClass, watchSection);
                    if (examRes?.data) {
                        setExams(examRes.data);
                    }

                    form.setValue('examlist', []);
                } catch (error) {
                    console.error(error);
                }
            })();
        }
    }, [watchYear, watchClass, watchSection, form]);

    const onSubmit = (values: MultipleExamCumulativeReportCalcuttaValues) => {
        setReportData(null);
        startTransition(async () => {
            try {
                const payload = {
                    ASMAY_Id: values.asmaY_Id,
                    ASMCL_Id: values.asmcL_Id,
                    ASMS_Id: values.asmS_Id,
                    EMPSG_PercentValue: values.empsG_PercentValue,
                    flag: values.flag,
                    EME_Id: values.emE_Id,
                    reporttype: values.reporttype,
                    Temp_AmstIds: [], // Removed students part as requested
                    EMPG_GroupName: values.empG_GroupName,
                    EMGR_Id: values.emgR_Id,
                    examlist: values.examlist?.map((x) => ({
                        EME_Id: x.emE_Id
                    }))
                };

                console.log('payload', payload);
                const res = await getMultipleExamCumulativeReportCalcutta(payload);
                console.log('res', res);
                if (res?.cumulativeReportDetails?.length > 0) {
                    // Inject metadata for printing
                    const yr = academicYears.find((y) => y.asmaY_Id === values.asmaY_Id)?.asmaY_Year;
                    const cla = classes.find((c) => c.asmcL_Id === values.asmcL_Id)?.asmcL_ClassName;
                    const sec = sections.find((s) => s.asmS_Id === values.asmS_Id)?.asmC_SectionName;

                    setReportData({
                        ...res,
                        yr,
                        cla,
                        sec
                    });
                } else {
                    toast.info('No records found');
                    setReportData(null);
                }
            } catch (error) {
                toast.error('Failed to fetch report');
                console.error(error);
            }
        });
    };

    const handleReset = () => {
        form.reset();
        setReportData(null);
    };

    return (
        <div className='container mx-auto space-y-6 py-4'>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                    <div className='overflow-hidden rounded-lg border border-sky-200 bg-white shadow-sm'>
                        <div className='bg-sky-800 px-4 py-2 font-medium text-white'>Progress Card Report</div>
                        <div className='p-6'>
                            <div className='grid grid-cols-1 gap-x-12 gap-y-6 md:grid-cols-2'>
                                <div className='space-y-4'>
                                    {/* Academic Year */}
                                    <FormField
                                        control={form.control}
                                        name='asmaY_Id'
                                        render={({ field }) => (
                                            <FormItem className='grid grid-cols-3 items-center gap-4 space-y-0'>
                                                <FormLabel className='text-right'>
                                                    Academic Year:<span className='text-red-500'>*</span>
                                                </FormLabel>
                                                <div className='col-span-2'>
                                                    <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value.toString()}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder='--Select--' />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {academicYearLoading ? (
                                                                <SelectItem value='0' disabled>
                                                                    Loading...
                                                                </SelectItem>
                                                            ) : (
                                                                academicYears.map((y) => (
                                                                    <SelectItem key={y.asmaY_Id} value={y.asmaY_Id.toString()}>
                                                                        {y.asmaY_Year}
                                                                    </SelectItem>
                                                                ))
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </div>
                                            </FormItem>
                                        )}
                                    />

                                    {/* Class */}
                                    <FormField
                                        control={form.control}
                                        name='asmcL_Id'
                                        render={({ field }) => (
                                            <FormItem className='grid grid-cols-3 items-center gap-4 space-y-0'>
                                                <FormLabel className='text-right'>
                                                    Class:<span className='text-red-500'>*</span>
                                                </FormLabel>
                                                <div className='col-span-2'>
                                                    <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value.toString()}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder='--Select--' />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {classes.map((c) => (
                                                                <SelectItem key={c.asmcL_Id} value={c.asmcL_Id.toString()}>
                                                                    {c.asmcL_ClassName}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </div>
                                            </FormItem>
                                        )}
                                    />

                                    {/* Section */}
                                    <FormField
                                        control={form.control}
                                        name='asmS_Id'
                                        render={({ field }) => (
                                            <FormItem className='grid grid-cols-3 items-center gap-4 space-y-0'>
                                                <FormLabel className='text-right'>
                                                    Section:<span className='text-red-500'>*</span>
                                                </FormLabel>
                                                <div className='col-span-2'>
                                                    <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value.toString()}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder='--Select--' />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {sections.map((s) => (
                                                                <SelectItem key={s.asmS_Id} value={s.asmS_Id.toString()}>
                                                                    {s.asmC_SectionName}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </div>
                                            </FormItem>
                                        )}
                                    />

                                    {/* Grade */}
                                    <FormField
                                        control={form.control}
                                        name='emgR_Id'
                                        render={({ field }) => (
                                            <FormItem className='grid grid-cols-3 items-center gap-4 space-y-0'>
                                                <FormLabel className='text-right'>
                                                    Grade:<span className='text-red-500'>*</span>
                                                </FormLabel>
                                                <div className='col-span-2'>
                                                    <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value.toString()}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder='Select Grade' />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {grades.map((g) => (
                                                                <SelectItem key={g.emgR_Id} value={g.emgR_Id.toString()}>
                                                                    {g.emgR_GradeName}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className='space-y-4'>
                                    {/* Exam Multiselect */}
                                    <FormField
                                        control={form.control}
                                        name='examlist'
                                        render={({ field }) => (
                                            <FormItem className='flex flex-col gap-2'>
                                                <FormLabel className='text-left font-bold text-sky-800 text-xs uppercase tracking-wider'>
                                                    Exam List:<span className='text-red-500'>*</span>
                                                </FormLabel>
                                                <div className='h-[180px] space-y-2 overflow-y-auto rounded-md border bg-slate-50/50 p-4'>
                                                    {exams.map((exam) => (
                                                        <div key={exam.emE_Id} className='flex items-center space-x-2'>
                                                            <Checkbox
                                                                id={`exam-${exam.emE_Id}`}
                                                                checked={field.value.some((v) => v.emE_Id === exam.emE_Id)}
                                                                onCheckedChange={(checked) => {
                                                                    const currentValues = [...field.value];
                                                                    if (checked) {
                                                                        currentValues.push({ emE_Id: exam.emE_Id });
                                                                    } else {
                                                                        const idx = currentValues.findIndex(
                                                                            (v) => v.emE_Id === exam.emE_Id
                                                                        );
                                                                        if (idx > -1) currentValues.splice(idx, 1);
                                                                    }
                                                                    field.onChange(currentValues);
                                                                }}
                                                            />
                                                            <label
                                                                htmlFor={`exam-${exam.emE_Id}`}
                                                                className='font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                                                                {exam.emE_ExamName}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <div className='mt-8 flex justify-center gap-4'>
                                <Button type='submit' disabled={isPending} className='min-w-[120px] bg-sky-800 hover:bg-sky-900'>
                                    {isPending ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Search className='mr-2 h-4 w-4' />}
                                    Report
                                </Button>
                                <Button type='button' variant='destructive' onClick={handleReset} className='min-w-[120px]'>
                                    <RotateCcw className='mr-2 h-4 w-4' />
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </Form>

            {isPending && (
                <div className='flex min-h-[200px] flex-col items-center justify-center space-y-4 rounded-lg border border-sky-100 bg-white p-12 shadow-sm'>
                    <Loader2 className='h-10 w-10 animate-spin text-sky-800' />
                    <p className='animate-pulse font-medium text-slate-500 text-sm'>Generating cumulative report, please wait...</p>
                </div>
            )}

            {!isPending && reportData && <MultipleExamCumulativeReportCalcuttaList data={reportData} />}
        </div>
    );
};

export default MultipleExamCumulativeReportCalcuttaForm;
