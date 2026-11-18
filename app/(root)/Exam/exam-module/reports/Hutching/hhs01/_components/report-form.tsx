'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { FileText, Loader2, RefreshCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DateField } from '@/components/ui/dateField';
import { FormError, Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import { getPrimarySaveDetails } from '@/server/exam/exam-module/reports/Hutching/hhs01';
import {
    getClassDropDownByAcademicYearlist,
    getSectionsDropDownByAcademicYearandClasslist,
    getStudentsDropDownByAcademicYearandClassandSectionlist
} from '@/server/exam/exam-module/reports/cumulative-report';

const hhs01ReportSchema = z.object({
    ASMAY_Id: z.string().min(1, 'Academic Year is required'),
    ASMCL_Id: z.string().min(1, 'Class is required'),
    ASMS_Id: z.string().min(1, 'Section is required'),
    AMST_Id: z.string().min(1, 'Student is required'),
    re_opendate: z.coerce.date().optional()
});

export type HHS01ReportSchema = z.infer<typeof hhs01ReportSchema>;

interface ReportFormProps {
    onReportGenerated: (data: any, year: string, cls: string, sec: string, reOpen: Date | null) => void;
    onReset: () => void;
    onPrint?: () => void;
}

export const ReportForm = ({ onReportGenerated, onReset, onPrint }: ReportFormProps) => {
    const { data: academicData, isLoading: academicYearLoading } = useAcademicYearDropdown();
    const academicYears = academicData?.data || [];

    const [classes, setClasses] = useState<{ asmcL_Id: number; asmcL_ClassName: string }[]>([]);
    const [sections, setSections] = useState<{ asmS_Id: number; asmC_SectionName: string }[]>([]);
    const [students, setStudents] = useState<{ amsT_Id: number; amsT_FirstName: string }[]>([]);

    const [loadingClasses, setLoadingClasses] = useState(false);
    const [loadingSections, setLoadingSections] = useState(false);
    const [loadingStudents, setLoadingStudents] = useState(false);

    const methods = useForm<HHS01ReportSchema>({
        resolver: zodResolver(hhs01ReportSchema),
        defaultValues: {
            ASMAY_Id: '',
            ASMCL_Id: '',
            ASMS_Id: '',
            AMST_Id: '',
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
                setStudents(list);
                setValue('AMST_Id', '');
            } catch {
                toast.error('Failed to load students');
            } finally {
                setLoadingStudents(false);
            }
        })();
    }, [watchYear, watchClass, watchSection, setValue]);

    const onSubmit = async (data: HHS01ReportSchema) => {
        try {
            const payload = {
                asmaY_Id: Number(data.ASMAY_Id),
                asmcL_Id: Number(data.ASMCL_Id),
                asmS_Id: Number(data.ASMS_Id),
                amsT_Id: Number(data.AMST_Id),
                AMST_Id: Number(data.AMST_Id),
                ASMAY_Id: Number(data.ASMAY_Id),
                ASMCL_Id: Number(data.ASMCL_Id),
                ASMS_Id: Number(data.ASMS_Id)
            };

            console.log('HHS01 Report payload:', payload);
            const response = await getPrimarySaveDetails(payload);
            console.log('HHS01 Report response:', response);

            const selectedYear = academicYears.find((y: any) => String(y.asmaY_Id) === data.ASMAY_Id);
            const selectedYearName = selectedYear?.asmaY_Year || '';
            const selectedClass = classes.find((c: any) => String(c.asmcL_Id) === data.ASMCL_Id);
            const selectedClassName = selectedClass?.asmcL_ClassName || '';
            const selectedSection = sections.find((s: any) => String(s.asmS_Id) === data.ASMS_Id);
            const selectedSectionName = selectedSection?.asmC_SectionName || '';

            if (
                response &&
                response.success !== false &&
                ((response as any).stu_details ||
                    (response as any).fillterms ||
                    (response as any).data?.stu_details ||
                    (response as any).data?.studentDetails)
            ) {
                const reportData = (response as any).data || response;
                onReportGenerated(reportData, selectedYearName, selectedClassName, selectedSectionName, data.re_opendate || null);
                toast.success('Report card data fetched successfully');
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
                    HHS Progress Card Pre Nursery
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
                                                {students.map((student: any) => {
                                                    const studentName =
                                                        student.studentname ||
                                                        student.studentName ||
                                                        student.amsT_FirstName ||
                                                        `${student.amsT_FirstName ?? ''} ${student.amsT_MiddleName ?? ''} ${student.amsT_LastName ?? ''}`.trim();
                                                    return (
                                                        <SelectItem key={student.amsT_Id} value={String(student.amsT_Id)}>
                                                            {studentName}
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
