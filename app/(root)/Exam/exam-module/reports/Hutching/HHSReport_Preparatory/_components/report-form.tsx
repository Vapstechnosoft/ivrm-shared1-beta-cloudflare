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
import { type HHSReportPreparatorySchema, hhsReportPreparatorySchema } from '@/schemas/exam/exam-module/reports';
import { getPrimarySaveDetails } from '@/server/exam/exam-module/reports/Hutching/hhs-report-preparatory';
import {
    getClassDropDownByAcademicYearlist,
    getSectionsDropDownByAcademicYearandClasslist,
    getStudentsDropDownByAcademicYearandClassandSectionlist
} from '@/server/exam/exam-module/reports/cumulative-report';

interface ReportFormProps {
    onReportGenerated: (data: any, year: string, cls: string, sec: string, reOpen: Date | null) => void;
    onReset: () => void;
    onPrint?: () => void;
}

export const ReportForm = ({ onReportGenerated, onReset, onPrint }: ReportFormProps) => {
    const { data: academicData, isLoading: academicYearLoading } = useAcademicYearDropdown();
    const academicYears = academicData?.data || [];

    const { data: gradeData } = useMasterGradeDropdownList();
    const grades = gradeData?.data || [];

    const [classes, setClasses] = useState<{ asmcL_Id: number; asmcL_ClassName: string }[]>([]);
    const [sections, setSections] = useState<{ asmS_Id: number; asmC_SectionName: string }[]>([]);
    const [students, setStudents] = useState<{ amsT_Id: number; studentName: string }[]>([]);

    const [loadingClasses, setLoadingClasses] = useState(false);
    const [loadingSections, setLoadingSections] = useState(false);
    const [loadingStudents, setLoadingStudents] = useState(false);

    const methods = useForm<HHSReportPreparatorySchema>({
        resolver: zodResolver(hhsReportPreparatorySchema),
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
    const watchStudent = useWatch({ control, name: 'AMST_Id' });

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
                setValue('EMGR_Id', '');
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
                setValue('EMGR_Id', '');
                setStudents([]);
            } catch {
                toast.error('Failed to load sections');
            } finally {
                setLoadingSections(false);
            }
        })();
    }, [watchYear, watchClass, setValue]);

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
                setValue('EMGR_Id', '');
            } catch {
                toast.error('Failed to load students');
            } finally {
                setLoadingStudents(false);
            }
        })();
    }, [watchYear, watchClass, watchSection, setValue]);

    // Reset Grade Group on Student Change
    useEffect(() => {
        setValue('EMGR_Id', '');
    }, [watchStudent, setValue]);

    const onSubmit = async (data: HHSReportPreparatorySchema) => {
        try {
            const payload = {
                asmaY_Id: Number(data.ASMAY_Id),
                asmcL_Id: Number(data.ASMCL_Id),
                asmS_Id: Number(data.ASMS_Id),
                emgR_Id: Number(data.EMGR_Id),
                amsT_Id: Number(data.AMST_Id),
                temp_AmstIds: [
                    {
                        amsT_Id: Number(data.AMST_Id)
                    }
                ],
                // Swagger DTO defaults
                flag: 'student',
                flagtype: '',
                reporttype: '',
                empG_GroupName: '',
                examIds: '',
                epfrC_ExamFlag: '',
                epfrC_PassFailFlag: '',
                ecteX_NotApplToTotalFlg: true,
                emE_Id: 0,
                epfrC_Id: 0,
                emcA_Id: 0,
                ecM_Id: 0,
                epfrC_From: 0,
                epfrC_To: 0,
                epfrC_RankFlag: 0,
                epfrC_OverallPercentage: 0,
                empsG_PercentValue: 0,
                examlist: [
                    {
                        emE_Id: 0
                    }
                ]
            };

            console.log('HHS Report payload:', payload);
            const response = (await getPrimarySaveDetails(payload)) as any;
            console.log('HHS Report response:', response);

            const selectedYear = academicYears.find((y: any) => String(y.asmaY_Id) === data.ASMAY_Id);
            const selectedYearName = selectedYear?.asmaY_Year || '';
            const selectedClass = classes.find((c: any) => String(c.asmcL_Id) === data.ASMCL_Id);
            const selectedClassName = selectedClass?.asmcL_ClassName || '';
            const selectedSection = sections.find((s: any) => String(s.asmS_Id) === data.ASMS_Id);
            const selectedSectionName = selectedSection?.asmC_SectionName || '';

            if (response && (response.success || response.eam_sub_mrks_list || response.data?.subjectMarks)) {
                const reportData = response.data || response;
                const marksList = reportData.subjectMarks || reportData.eam_sub_mrks_list || [];
                if (marksList && marksList.length > 0) {
                    onReportGenerated(reportData, selectedYearName, selectedClassName, selectedSectionName, data.re_opendate || null);
                    toast.success('Report card data fetched successfully');
                } else {
                    toast.error('No marks entry details found for the selected student');
                }
            } else {
                toast.error(`Failed to fetch report card details: ${response?.message || 'Empty response'}`);
            }
        } catch (error: any) {
            console.error('Error fetching report details:', error);
            toast.error(`An error occurred while generating the report: ${error?.message || error || 'Unknown error'}`);
        }
    };

    const handleClear = () => {
        reset({
            ASMAY_Id: '',
            ASMCL_Id: '',
            ASMS_Id: '',
            AMST_Id: '',
            EMGR_Id: '',
            re_opendate: undefined
        });
        setClasses([]);
        setSections([]);
        setStudents([]);
        onReset();
    };

    return (
        <Card className='w-full rounded-lg border border-gray-200 bg-white p-4 shadow-md transition-all duration-300 hover:shadow-lg'>
            <CardHeader className='mb-4 border-b bg-primary/5 pb-2'>
                <CardTitle className='flex items-center gap-2 font-semibold text-lg text-primary'>
                    <FileText className='h-5 w-5' />
                    HHS Progress Card Preparatory
                </CardTitle>
            </CardHeader>

            <CardContent>
                <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                            {/* Academic Year */}
                            <Controller
                                control={control}
                                name='ASMAY_Id'
                                render={({ field, fieldState }) => (
                                    <div className='space-y-2'>
                                        <Label className='font-medium text-sm'>
                                            Academic Year <span className='text-red-500'>*</span>
                                        </Label>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className='w-full'>
                                                <SelectValue placeholder='Select Academic Year' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {academicYearLoading ? (
                                                    <SelectItem value='loading' disabled>
                                                        Loading...
                                                    </SelectItem>
                                                ) : (
                                                    academicYears.map((year: any) => (
                                                        <SelectItem key={year.asmaY_Id} value={String(year.asmaY_Id)}>
                                                            {year.asmaY_Year}
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
                                render={({ field, fieldState }) => (
                                    <div className='space-y-2'>
                                        <Label className='font-medium text-sm'>
                                            Class <span className='text-red-500'>*</span>
                                        </Label>
                                        <Select onValueChange={field.onChange} value={field.value} disabled={!watchYear || loadingClasses}>
                                            <SelectTrigger className='w-full'>
                                                <SelectValue placeholder={loadingClasses ? 'Loading Classes...' : 'Select Class'} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {classes.map((cls) => (
                                                    <SelectItem key={cls.asmcL_Id} value={String(cls.asmcL_Id)}>
                                                        {cls.asmcL_ClassName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                    </div>
                                )}
                            />

                            {/* Section */}
                            <Controller
                                control={control}
                                name='ASMS_Id'
                                render={({ field, fieldState }) => (
                                    <div className='space-y-2'>
                                        <Label className='font-medium text-sm'>
                                            Section <span className='text-red-500'>*</span>
                                        </Label>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            disabled={!watchClass || loadingSections}>
                                            <SelectTrigger className='w-full'>
                                                <SelectValue placeholder={loadingSections ? 'Loading Sections...' : 'Select Section'} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {sections.map((sec) => (
                                                    <SelectItem key={sec.asmS_Id} value={String(sec.asmS_Id)}>
                                                        {sec.asmC_SectionName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                    </div>
                                )}
                            />

                            {/* Student Name */}
                            <Controller
                                control={control}
                                name='AMST_Id'
                                render={({ field, fieldState }) => (
                                    <div className='space-y-2'>
                                        <Label className='font-medium text-sm'>
                                            Student Name <span className='text-red-500'>*</span>
                                        </Label>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            disabled={!watchSection || loadingStudents}>
                                            <SelectTrigger className='w-full'>
                                                <SelectValue placeholder={loadingStudents ? 'Loading Students...' : 'Select Student'} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {students.map((student) => (
                                                    <SelectItem key={student.amsT_Id} value={String(student.amsT_Id)}>
                                                        {student.studentName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                    </div>
                                )}
                            />

                            {/* Grade */}
                            <Controller
                                control={control}
                                name='EMGR_Id'
                                render={({ field, fieldState }) => (
                                    <div className='space-y-2'>
                                        <Label className='font-medium text-sm'>
                                            Grade Group <span className='text-red-500'>*</span>
                                        </Label>
                                        <Select onValueChange={field.onChange} value={field.value} disabled={!watchStudent}>
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

                            {/* School Re-open Date */}
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
                        </div>

                        <div className='flex justify-center gap-4 border-t pt-4'>
                            <Button type='submit' disabled={isSubmitting} className='w-32 bg-primary text-white hover:bg-primary/95'>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                        Generating...
                                    </>
                                ) : (
                                    'Report'
                                )}
                            </Button>
                            <Button type='button' variant='outline' onClick={handleClear} className='w-32'>
                                <RefreshCcw className='mr-2 h-4 w-4' />
                                Cancel
                            </Button>
                        </div>
                    </form>
                </FormProvider>
            </CardContent>
        </Card>
    );
};
