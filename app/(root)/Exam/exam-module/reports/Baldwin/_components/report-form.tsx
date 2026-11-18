'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CustomMultiSelectBox } from '@/components/ui/custom-multiselect';
import { FormError, Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import { type BaldwinReportSchema, baldwinReportSchema } from '@/schemas/exam/exam-module/reports';
import {
    getClassDropDownByAcademicYearlist,
    getSectionsDropDownByAcademicYearandClasslist,
    getStudentsDropDownByAcademicYearandClassandSectionlist
} from '@/server/exam/exam-module/reports/cumulative-report';
import { getMasterInstitution } from '@/server/exam/exam-module/reports/vvehpc_exam-report-card';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

interface ReportFormProps {
    title: string;
    onReportGenerated: (data: any, params: any) => void;
    onReset: () => void;
    apiAction: (data: any) => Promise<any>;
}

export const ReportForm = ({ title, onReportGenerated, onReset, apiAction }: ReportFormProps) => {
    const { data: academicData, isLoading: academicYearLoading } = useAcademicYearDropdown();
    const academicYears = academicData?.data || [];

    // Dropdown States
    const [classes, setClasses] = useState<{ asmcL_Id: number; asmcL_ClassName: string }[]>([]);
    const [sections, setSections] = useState<{ asmS_Id: number; asmC_SectionName: string }[]>([]);
    const [students, setStudents] = useState<{ amsT_Id: number; studentName?: string; amsT_AdmNo: number }[]>([]);
    const [allStudentsSelected, setAllStudentsSelected] = useState(false);

    // Loading States
    const [loadingClasses, setLoadingClasses] = useState(false);
    const [loadingSections, setLoadingSections] = useState(false);
    const [loadingStudents, setLoadingStudents] = useState(false);

    const methods = useForm<BaldwinReportSchema>({
        resolver: zodResolver(baldwinReportSchema),
        defaultValues: {
            printLogo: true,
            left_logo: true,
            right_logo: true,
            dontShowRank: true,
            selectedStudents: [],
            ASMAY_Id: '',
            ASMCL_Id: '',
            ASMS_Id: '',
            workingDays: '',
            presentDays: ''
        }
    });

    const { control, handleSubmit, setValue, reset, formState } = methods;
    const { isSubmitting } = formState;

    const watchYear = useWatch({ control, name: 'ASMAY_Id' });
    const watchClass = useWatch({ control, name: 'ASMCL_Id' });
    const watchSection = useWatch({ control, name: 'ASMS_Id' });

    // Load Classes
    useEffect(() => {
        if (!watchYear) return;
        (async () => {
            try {
                setLoadingClasses(true);
                const { data } = await getClassDropDownByAcademicYearlist(Number(watchYear));
                console.log('class', data);
                setClasses(Array.isArray(data) ? data : []);
                setValue('ASMCL_Id', '');
                setValue('ASMS_Id', '');
                setValue('selectedStudents', []);
                setAllStudentsSelected(false);
            } catch {
                toast.error('Failed to load classes');
            } finally {
                setLoadingClasses(false);
            }
        })();
    }, [watchYear, setValue]);

    // Load Sections
    useEffect(() => {
        if (!watchYear || !watchClass) return;
        (async () => {
            try {
                setLoadingSections(true);
                const { data } = await getSectionsDropDownByAcademicYearandClasslist(Number(watchYear), Number(watchClass));
                setSections(Array.isArray(data) ? data : []);
                setValue('ASMS_Id', '');
                setValue('selectedStudents', []);
                setAllStudentsSelected(false);
            } catch {
                toast.error('Failed to load sections');
            } finally {
                setLoadingSections(false);
            }
        })();
    }, [watchYear, watchClass, setValue]);

    // Load Students
    useEffect(() => {
        if (!watchYear || !watchClass || !watchSection) return;
        (async () => {
            try {
                setLoadingStudents(true);
                const { data } = await getStudentsDropDownByAcademicYearandClassandSectionlist(
                    Number(watchYear),
                    Number(watchClass),
                    Number(watchSection)
                );
                const valid = Array.isArray(data)
                    ? (data as any[]).filter(
                          (
                              s
                          ): s is {
                              amsT_AdmNo: number;
                              amsT_Id: number;
                              studentName?: string;
                              amsT_FirstName?: string;
                              amsT_MiddleName?: string;
                              amsT_LastName?: string;
                          } => !!s?.amsT_Id
                      )
                    : [];

                const mappedStudents = valid.map((s) => ({
                    amsT_Id: s.amsT_Id,
                    amsT_AdmNo: s.amsT_AdmNo,
                    studentName: s.studentName || `${s.amsT_FirstName || ''} ${s.amsT_MiddleName || ''} ${s.amsT_LastName || ''}`.trim()
                }));

                setStudents(mappedStudents);
                setValue('selectedStudents', []);
                setAllStudentsSelected(false);
            } catch {
                toast.error('Failed to load students');
            } finally {
                setLoadingStudents(false);
            }
        })();
    }, [watchYear, watchClass, watchSection, setValue]);

    const handleAllStudents = (checked: boolean) => {
        if (checked && students.length) {
            setValue(
                'selectedStudents',
                students.map((s) => String(s.amsT_Id)),
                { shouldValidate: true }
            );
            setAllStudentsSelected(true);
        } else {
            setValue('selectedStudents', [], { shouldValidate: true });
            setAllStudentsSelected(false);
        }
    };

    const handleStudentChange = (selectedValues: string[]) => {
        setValue('selectedStudents', selectedValues, { shouldValidate: true });
        setAllStudentsSelected(selectedValues.length === students.length && students.length > 0);
    };

    const onSubmit = async (values: BaldwinReportSchema) => {
        onReset();
        try {
            const selectedStudentDetails = students.filter((s) => values.selectedStudents.includes(String(s.amsT_Id)));
            const selected_academicYear = academicYears.find((ay: any) => ay.asmaY_Id === Number(values.ASMAY_Id))?.asmaY_Year;
            const selected_class = classes.find((c: any) => c.asmcL_Id === Number(values.ASMCL_Id))?.asmcL_ClassName;
            const selected_section = sections.find((s: any) => s.asmS_Id === Number(values.ASMS_Id))?.asmC_SectionName;

            console.log('values', values);
            console.log('selectedStudentDetails', selectedStudentDetails);
            console.log('selected_academicYear', selected_academicYear);
            console.log('selected_class', selected_class);
            console.log('selected_section', selected_section);
            const [result, institutionRes] = await Promise.all([
                apiAction({ ...values, studentDetails: selectedStudentDetails, selected_academicYear, selected_class, selected_section }),
                getMasterInstitution()
            ]);
            console.log('institutionRes', institutionRes?.data);

            if (result && result.success === false) {
                toast.error(result.message || 'Failed to generate report');
                return;
            }

            onReportGenerated(
                { ...result, selected_academicYear, selected_class, selected_section, institution: institutionRes?.data },
                values
            );
        } catch (error) {
            console.error('Error generating report:', error);
            toast.error('Failed to generate report');
        }
    };

    const handleClear = () => {
        reset({
            printLogo: true,
            left_logo: true,
            right_logo: true,
            dontShowRank: true,
            selectedStudents: [],
            ASMAY_Id: '',
            ASMCL_Id: '',
            ASMS_Id: '',
            workingDays: '',
            presentDays: ''
        });
        setClasses([]);
        setSections([]);
        setStudents([]);
        setAllStudentsSelected(false);
        onReset();
    };

    return (
        <div className='mx-auto w-full rounded-lg border border-gray-200 bg-white p-4 shadow-md'>
            <div className='mb-4 flex items-center justify-between border-b pb-2'>
                <h3 className='font-semibold text-gray-800 text-lg'>{title}</h3>
            </div>
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                        {/* Left Column */}
                        <div className='space-y-4'>
                            <div className='space-y-2'>
                                <Controller
                                    control={control}
                                    name='ASMAY_Id'
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
                            </div>

                            <div className='space-y-2'>
                                <Label>
                                    Class <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    control={control}
                                    name='ASMCL_Id'
                                    render={({ field, fieldState }) => (
                                        <div className='space-y-2'>
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
                                            {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                        </div>
                                    )}
                                />
                            </div>

                            <div className='space-y-2'>
                                <Label>
                                    Section <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    control={control}
                                    name='ASMS_Id'
                                    render={({ field, fieldState }) => (
                                        <div className='space-y-2'>
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
                                            {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                        </div>
                                    )}
                                />
                            </div>

                            <div className='grid grid-cols-2 gap-4'>
                                <Controller
                                    control={control}
                                    name='workingDays'
                                    render={({ field }) => (
                                        <div className='space-y-2'>
                                            <Label>Working Days</Label>
                                            <input
                                                {...field}
                                                className='flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20'
                                                placeholder='Working Days'
                                            />
                                        </div>
                                    )}
                                />
                                <Controller
                                    control={control}
                                    name='presentDays'
                                    render={({ field }) => (
                                        <div className='space-y-2'>
                                            <Label>Present Days</Label>
                                            <input
                                                {...field}
                                                className='flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20'
                                                placeholder='Present Days'
                                            />
                                        </div>
                                    )}
                                />
                            </div>

                            <div className='flex flex-wrap gap-4 pt-2'>
                                <div className='flex items-center space-x-2'>
                                    <Controller
                                        control={control}
                                        name='dontShowRank'
                                        render={({ field }) => (
                                            <Checkbox id='dontShowRank' checked={field.value} onCheckedChange={field.onChange} />
                                        )}
                                    />
                                    <Label htmlFor='dontShowRank' className='cursor-pointer font-normal'>
                                        Don't Show Rank
                                    </Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <Controller
                                        control={control}
                                        name='printLogo'
                                        render={({ field }) => (
                                            <Checkbox id='printLogo' checked={field.value} onCheckedChange={field.onChange} />
                                        )}
                                    />
                                    <Label htmlFor='printLogo' className='cursor-pointer font-normal'>
                                        Print Logo
                                    </Label>
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className='space-y-4'>
                            <div className='flex flex-col gap-2'>
                                <Label className='flex items-center gap-2 font-medium'>
                                    <Checkbox
                                        checked={allStudentsSelected}
                                        onCheckedChange={handleAllStudents}
                                        disabled={students.length === 0}
                                    />
                                    Student <span className='text-red-500'>*</span>
                                </Label>
                                <div className='flex-1'>
                                    <Controller
                                        control={control}
                                        name='selectedStudents'
                                        render={({ field, fieldState }) => (
                                            <CustomMultiSelectBox
                                                options={students.map((s) => ({
                                                    label: `${s.studentName} - ${s.amsT_AdmNo}`,
                                                    value: String(s.amsT_Id)
                                                }))}
                                                onChange={handleStudentChange}
                                                value={field.value}
                                                placeholder='Select Students'
                                                height='250px'
                                                isSearchRequired
                                                error={fieldState.error?.message}
                                            />
                                        )}
                                    />
                                    <div className='mt-2 flex items-center gap-2'>
                                        <Controller
                                            name='includeLeftStudents'
                                            control={control}
                                            render={({ field }) => (
                                                <Checkbox
                                                    id='includeLeftStudents'
                                                    checked={field.value}
                                                    onCheckedChange={(checked) => {
                                                        field.onChange(checked);
                                                        // Trigger student fetch if needed
                                                    }}
                                                />
                                            )}
                                        />
                                        <Label htmlFor='includeLeftStudents' className='cursor-pointer font-medium'>
                                            Include Left Students
                                        </Label>
                                    </div>
                                </div>
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
