'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { FileText, Loader2, RefreshCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DateField } from '@/components/ui/dateField';
import { FormError, Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMasterGradeDropdownList } from '@/hooks/exam/exammodule/usemasters';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import { type HHSIIVReportSchema, hhsIIVReportSchema } from '@/schemas/exam/exam-module/reports';
import { getHHSIIVSaveDetails } from '@/server/exam/exam-module/reports/Hutching/hhs-all-report';
import {
    getClassDropDownByAcademicYearlist,
    getSectionsDropDownByAcademicYearandClasslist,
    getStudentsDropDownByAcademicYearandClassandSectionlist
} from '@/server/exam/exam-module/reports/cumulative-report';

interface ReportFormProps {
    onReportGenerated: (data: any, yearName: string, className: string, sectionName: string, reOpen: Date | null) => void;
    onReset: () => void;
}

export default function ReportForm({ onReportGenerated, onReset }: ReportFormProps) {
    const { data: academicData, isLoading: academicYearLoading } = useAcademicYearDropdown();
    const academicYears = academicData?.data || [];

    const [classes, setClasses] = useState<{ asmcL_Id: number; asmcL_ClassName: string }[]>([]);
    const [sections, setSections] = useState<{ asmS_Id: number; asmC_SectionName: string }[]>([]);
    const [students, setStudents] = useState<{ amsT_Id: number; studentName: string }[]>([]);

    // Fallback if grades aren't returned from initial endpoint
    const { data: globalGradeData, isLoading: gradeLoading } = useMasterGradeDropdownList();
    const grades = globalGradeData?.data || [];

    const [loadingClasses, setLoadingClasses] = useState(false);
    const [loadingSections, setLoadingSections] = useState(false);
    const [loadingStudents, setLoadingStudents] = useState(false);

    const methods = useForm<HHSIIVReportSchema>({
        resolver: zodResolver(hhsIIVReportSchema),
        defaultValues: {
            ASMAY_Id: '',
            ASMCL_Id: '',
            ASMS_Id: '',
            AMST_Id: '',
            EMGR_Id: '',
            re_opendate: undefined
        }
    });

    const { control, handleSubmit, setValue, reset, formState } = methods;
    const { isSubmitting } = formState;

    const watchYear = useWatch({ control, name: 'ASMAY_Id' });
    const watchClass = useWatch({ control, name: 'ASMCL_Id' });
    const watchSection = useWatch({ control, name: 'ASMS_Id' });

    // Load Classes on Year Change
    useEffect(() => {
        if (!watchYear) {
            setClasses([]);
            setSections([]);
            setStudents([]);
            return;
        }
        (async () => {
            try {
                setLoadingClasses(true);
                const response = await getClassDropDownByAcademicYearlist(Number(watchYear));
                setClasses(Array.isArray(response?.data) ? response.data : []);
                setValue('ASMCL_Id', '');
                setValue('ASMS_Id', '');
                setValue('AMST_Id', '');
                setSections([]);
                setStudents([]);
            } catch {
                toast.error('Failed to load classes');
            } finally {
                setLoadingClasses(false);
            }
        })();
    }, [watchYear, setValue]);

    // Load Sections on Class Change
    useEffect(() => {
        if (!watchYear || !watchClass) {
            setSections([]);
            setStudents([]);
            return;
        }
        (async () => {
            try {
                setLoadingSections(true);
                const response = await getSectionsDropDownByAcademicYearandClasslist(Number(watchYear), Number(watchClass));
                setSections(Array.isArray(response?.data) ? response.data : []);
                setValue('ASMS_Id', '');
                setValue('AMST_Id', '');
                setStudents([]);
            } catch {
                toast.error('Failed to load sections');
            } finally {
                setLoadingSections(false);
            }
        })();
    }, [watchClass, watchYear, setValue]);

    // Load Students on Section Change
    useEffect(() => {
        if (!watchYear || !watchClass || !watchSection) {
            setStudents([]);
            return;
        }
        (async () => {
            try {
                setLoadingStudents(true);
                const response = await getStudentsDropDownByAcademicYearandClassandSectionlist(
                    Number(watchYear),
                    Number(watchClass),
                    Number(watchSection)
                );
                const list = Array.isArray(response?.data) ? response.data : [];
                const mapped = list.map((s: any) => ({
                    amsT_Id: s.amsT_Id,
                    studentName:
                        s.studentname ||
                        s.studentName ||
                        `${s.amsT_FirstName ?? ''} ${s.amsT_MiddleName ?? ''} ${s.amsT_LastName ?? ''}`.trim()
                }));
                setStudents(mapped);
                setValue('AMST_Id', '');
            } catch {
                toast.error('Failed to load students');
            } finally {
                setLoadingStudents(false);
            }
        })();
    }, [watchSection, watchClass, watchYear, setValue]);

    const onSubmit = async (data: HHSIIVReportSchema) => {
        try {
            const payload = {
                asmaY_Id: Number(data.ASMAY_Id),
                asmcL_Id: Number(data.ASMCL_Id),
                asmS_Id: Number(data.ASMS_Id),
                amsT_Id: Number(data.AMST_Id),
                emgR_Id: Number(data.EMGR_Id),
                temp_AmstIds: [{ amsT_Id: Number(data.AMST_Id) }],
                emE_Id: 0,
                examlist: [{ emE_Id: 0 }],
                examIds: '',
                emcA_Id: 0,
                ecM_Id: 0,
                empsG_PercentValue: 0,
                empG_GroupName: '',
                flag: 'student',
                flagtype: '',
                reporttype: '',
                ecteX_NotApplToTotalFlg: true,
                epfrC_Id: 0,
                epfrC_From: 0,
                epfrC_To: 0,
                epfrC_ExamFlag: '',
                epfrC_PassFailFlag: '',
                epfrC_RankFlag: 0,
                epfrC_OverallPercentage: 0
            };

            const response = await getHHSIIVSaveDetails(payload);

            const selectedYearName = academicYears.find((y) => y.asmaY_Id.toString() === data.ASMAY_Id)?.asmaY_Year || '';
            const selectedClassName = classes.find((c) => c.asmcL_Id.toString() === data.ASMCL_Id)?.asmcL_ClassName || '';
            const selectedSectionName = sections.find((s) => s.asmS_Id.toString() === data.ASMS_Id)?.asmC_SectionName || '';

            if (response && (response.success || (response as any).data)) {
                const reportData = (response as any).data || response;
                const marksList =
                    reportData.subjectMarks ||
                    reportData.eam_sub_mrks_list ||
                    reportData.exm_sub_mrks_list ||
                    reportData.savelist ||
                    reportData.savelisttot ||
                    [];
                const studentList = reportData.studentDetails || reportData.stu_details || [];

                if ((marksList && marksList.length > 0) || (studentList && studentList.length > 0)) {
                    onReportGenerated(reportData, selectedYearName, selectedClassName, selectedSectionName, data.re_opendate || null);
                    toast.success('Report card data fetched successfully');
                } else {
                    toast.info('No marks entry details found for the selected student');
                }
            } else {
                toast.error((response as any)?.message || 'Failed to generate report');
            }
        } catch (error) {
            console.error(error);
            toast.error('Something went wrong. Please try again.');
        }
    };

    const handleReset = () => {
        reset();
        setClasses([]);
        setSections([]);
        setStudents([]);
        onReset();
    };

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Card className='mb-6'>
                    <CardHeader className='flex flex-row items-center justify-between'>
                        <CardTitle>HHS Progress Card 1st to 4th</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                            <Controller
                                control={control}
                                name='ASMAY_Id'
                                render={({ field, fieldState }) => (
                                    <div className='flex flex-col gap-2'>
                                        <Label isRequired>Academic Year</Label>
                                        <Select value={field.value || ''} onValueChange={field.onChange} disabled={academicYearLoading}>
                                            <SelectTrigger className='w-full'>
                                                <SelectValue placeholder={academicYearLoading ? 'Loading...' : 'Select Academic Year'} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {academicYears.map((year: any) => (
                                                    <SelectItem key={year.asmaY_Id} value={year.asmaY_Id.toString()}>
                                                        {year.asmaY_Year}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                    </div>
                                )}
                            />

                            <Controller
                                control={control}
                                name='ASMCL_Id'
                                render={({ field, fieldState }) => (
                                    <div className='flex flex-col gap-2'>
                                        <Label isRequired>Class</Label>
                                        <Select
                                            value={field.value || ''}
                                            onValueChange={field.onChange}
                                            disabled={!watchYear || loadingClasses}>
                                            <SelectTrigger className='w-full'>
                                                <SelectValue placeholder={loadingClasses ? 'Loading...' : 'Select Class'} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {classes.map((cls) => (
                                                    <SelectItem key={cls.asmcL_Id} value={cls.asmcL_Id.toString()}>
                                                        {cls.asmcL_ClassName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                    </div>
                                )}
                            />

                            <Controller
                                control={control}
                                name='ASMS_Id'
                                render={({ field, fieldState }) => (
                                    <div className='flex flex-col gap-2'>
                                        <Label isRequired>Section</Label>
                                        <Select
                                            value={field.value || ''}
                                            onValueChange={field.onChange}
                                            disabled={!watchClass || loadingSections}>
                                            <SelectTrigger className='w-full'>
                                                <SelectValue placeholder={loadingSections ? 'Loading...' : 'Select Section'} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {sections.map((sec) => (
                                                    <SelectItem key={sec.asmS_Id} value={sec.asmS_Id.toString()}>
                                                        {sec.asmC_SectionName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                    </div>
                                )}
                            />

                            <Controller
                                control={control}
                                name='AMST_Id'
                                render={({ field, fieldState }) => (
                                    <div className='flex flex-col gap-2'>
                                        <Label isRequired>Student Name</Label>
                                        <Select
                                            value={field.value || ''}
                                            onValueChange={field.onChange}
                                            disabled={!watchSection || loadingStudents}>
                                            <SelectTrigger className='w-full'>
                                                <SelectValue placeholder={loadingStudents ? 'Loading...' : 'Select Student Name'} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {students.map((student) => (
                                                    <SelectItem key={student.amsT_Id} value={student.amsT_Id.toString()}>
                                                        {student.studentName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                    </div>
                                )}
                            />

                            <Controller
                                control={control}
                                name='re_opendate'
                                render={({ field, fieldState }) => (
                                    <DateField
                                        field={field}
                                        fieldState={fieldState}
                                        label='School Re-open Date'
                                        placeholder='Select Date'
                                    />
                                )}
                            />

                            <Controller
                                control={control}
                                name='EMGR_Id'
                                render={({ field, fieldState }) => (
                                    <div className='flex flex-col gap-2'>
                                        <Label isRequired>Grade Group</Label>
                                        <Select value={field.value || ''} onValueChange={field.onChange}>
                                            <SelectTrigger className='w-full'>
                                                <SelectValue placeholder='Select Grade' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {grades.map((grade: any) => {
                                                    const gradeId = grade.emgR_Id || grade.EMGR_Id;
                                                    const gradeName = grade.emgR_GradeName || grade.EMGR_GradeName;
                                                    return (
                                                        <SelectItem key={gradeId} value={String(gradeId)}>
                                                            {gradeName}
                                                        </SelectItem>
                                                    );
                                                })}
                                            </SelectContent>
                                        </Select>
                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                    </div>
                                )}
                            />
                        </div>

                        <div className='mt-8 flex items-center justify-center gap-4 border-t pt-6'>
                            <Button type='submit' disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <FileText className='mr-2 h-4 w-4' />}
                                Report
                            </Button>
                            <Button type='button' variant='destructive' onClick={handleReset} disabled={isSubmitting}>
                                <RefreshCcw className='mr-2 h-4 w-4' />
                                Cancel
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </FormProvider>
    );
}
