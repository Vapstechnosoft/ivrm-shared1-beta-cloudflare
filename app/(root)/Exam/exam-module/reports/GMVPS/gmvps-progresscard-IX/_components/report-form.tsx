'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CustomMultiSelectBox } from '@/components/ui/custom-multiselect';
import { DateField } from '@/components/ui/dateField';
import { FormError, Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import { type GmvpsProgressCardIXSchema, gmvpsProgressCardIXSchema } from '@/schemas/exam/exam-module/reports';
import {
    getClassDropDownByAcademicYearlist,
    getSectionsDropDownByAcademicYearandClasslist,
    getStudentsDropDownByAcademicYearandClassandSectionlist
} from '@/server/exam/exam-module/reports/cumulative-report';
import { getGmvpsProgressCardIXReport } from '@/server/exam/exam-module/reports/gmvps-report-card-ix';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

interface ReportFormProps {
    onReportGenerated: (data: any, params: any) => void;
    onReset: () => void;
}

export const ReportForm = ({ onReportGenerated, onReset }: ReportFormProps) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { data: academicData, isLoading: academicYearLoading } = useAcademicYearDropdown();
    const academicYears = academicData?.data || [];

    // Dropdown States
    const [classes, setClasses] = useState<{ asmcL_Id: number; asmcL_ClassName: string }[]>([]);
    const [sections, setSections] = useState<{ asmS_Id: number; asmC_SectionName: string }[]>([]);
    const [students, setStudents] = useState<{ amsT_AdmNo: number; amsT_Id: number; studentName?: string | null }[]>([]);
    const [allStudentsSelected, setAllStudentsSelected] = useState(false);

    // Loading States
    const [loadingClasses, setLoadingClasses] = useState(false);
    const [loadingSections, setLoadingSections] = useState(false);
    const [_loadingStudents, setLoadingStudents] = useState(false);

    const methods = useForm<GmvpsProgressCardIXSchema>({
        resolver: zodResolver(gmvpsProgressCardIXSchema),
        defaultValues: {
            selectedStudents: []
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

    const onSubmit = async (data: GmvpsProgressCardIXSchema) => {
        try {
            const payload = {
                asmaY_Id: Number(data.ASMAY_Id),
                asmcL_Id: Number(data.ASMCL_Id),
                asmS_Id: Number(data.ASMS_Id),
                empsG_PercentValue: 0,
                flag: '2',
                emE_Id: 0,
                reporttype: 'supverage',
                temp_AmstIds: data.selectedStudents.map((id) => ({ amsT_Id: Number(id) })),
                empG_GroupName: ''
            };

            const response = await getGmvpsProgressCardIXReport(payload);

            if (response?.success && response.data) {
                console.log('response.data', response.data);
                // Add academic year to response data for display
                const asmaY_Year = academicYears.find((y: any) => String(y.asmaY_Id) === data.ASMAY_Id)?.asmaY_Year || '';
                onReportGenerated({ ...response.data, asmaY_Year }, data);
                toast.success('Report generated successfully');
            } else {
                toast.error(response?.message || 'No data found for the selected criteria');
            }
        } catch (error: any) {
            console.error('Report submission error:', error);
            toast.error(error?.message || 'Failed to generate report');
        }
    };

    const handleClear = () => {
        reset({
            selectedStudents: [],
            ASMAY_Id: '',
            ASMCL_Id: '',
            ASMS_Id: '',
            date: undefined
        });
        setClasses([]);
        setSections([]);
        setStudents([]);
        onReset();
    };

    return (
        <div className='mx-auto w-full rounded-lg border border-gray-200 bg-white p-4 shadow-md'>
            <div className='mb-4 flex items-center justify-between border-b pb-2'>
                <h3 className='font-semibold text-gray-800 text-lg'>9th Progress Card Report</h3>
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
                                            <div className='flex-1'>
                                                <Select
                                                    key={field.value}
                                                    onValueChange={field.onChange}
                                                    value={field.value ? String(field.value) : ''}>
                                                    <SelectTrigger className='w-full'>
                                                        <SelectValue placeholder='Select Academic Year' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {academicYearLoading ? (
                                                            <SelectItem value='0' disabled>
                                                                Academic Years are loading...
                                                            </SelectItem>
                                                        ) : academicYears.length === 0 ? (
                                                            <SelectItem value='0' disabled>
                                                                No Academic Years found
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
                                        </div>
                                    )}
                                />
                            </div>

                            {/* Class */}
                            <div className='space-y-2'>
                                <Label>
                                    Class <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    control={control}
                                    name='ASMCL_Id'
                                    render={({ field, fieldState }) => (
                                        <>
                                            <Select key={field.value} onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Select Class' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {loadingClasses ? (
                                                        <SelectItem value='0' disabled>
                                                            Loading...
                                                        </SelectItem>
                                                    ) : classes.length === 0 ? (
                                                        <SelectItem value='0' disabled>
                                                            No Classes found
                                                        </SelectItem>
                                                    ) : (
                                                        classes.map((cls) => (
                                                            <SelectItem key={cls.asmcL_Id} value={String(cls.asmcL_Id)}>
                                                                {cls.asmcL_ClassName}
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                        </>
                                    )}
                                />
                            </div>

                            {/* Section */}
                            <div className='space-y-2'>
                                <Label>
                                    Section <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    control={control}
                                    name='ASMS_Id'
                                    render={({ field, fieldState }) => (
                                        <>
                                            <Select key={field.value} onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Select Section' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {loadingSections ? (
                                                        <SelectItem value='0' disabled>
                                                            Loading...
                                                        </SelectItem>
                                                    ) : sections.length === 0 ? (
                                                        <SelectItem value='0' disabled>
                                                            No Sections found
                                                        </SelectItem>
                                                    ) : (
                                                        sections.map((sec) => (
                                                            <SelectItem key={sec.asmS_Id} value={String(sec.asmS_Id)}>
                                                                {sec.asmC_SectionName}
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                        </>
                                    )}
                                />
                            </div>

                            {/* Date */}
                            <div className='space-y-2'>
                                <Controller
                                    control={control}
                                    name='date'
                                    render={({ field, fieldState }) => (
                                        <DateField
                                            field={field}
                                            fieldState={fieldState}
                                            label='Date'
                                            placeholder='Select Date'
                                            fromDate={today}
                                            required={true}
                                        />
                                    )}
                                />
                            </div>
                        </div>

                        {/* Right Column: Student Multi-select */}
                        <div className='space-y-4'>
                            <div className='flex flex-col gap-2 sm:flex-row sm:items-start'>
                                <Label className='flex items-center gap-2 font-medium text-sm sm:w-32'>
                                    <Checkbox checked={allStudentsSelected} onCheckedChange={handleAllStudents} />
                                    Student <span className='text-red-500'>*</span>
                                </Label>
                                <div className='flex-1'>
                                    <Controller
                                        control={control}
                                        name='selectedStudents'
                                        render={({ field, fieldState }) => (
                                            <CustomMultiSelectBox
                                                options={students.map((s) => ({
                                                    label: `${s.studentName?.trim() || 'Unknown'} - ${s.amsT_AdmNo || 'N/A'}`.trim(),
                                                    value: s.amsT_Id.toString()
                                                }))}
                                                onChange={handleStudentChange}
                                                value={field.value ?? []}
                                                placeholder='Select Students'
                                                height='300px'
                                                isSearchRequired
                                                error={fieldState.error?.message}
                                            />
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='mt-8 flex justify-center gap-4 border-t pt-6'>
                        <Button type='submit' disabled={isSubmitting} className='w-fit min-w-[100px]'>
                            {isSubmitting ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null} Report
                        </Button>
                        <Button
                            type='button'
                            variant='destructive'
                            onClick={handleClear}
                            disabled={isSubmitting}
                            className='w-fit min-w-[100px]'>
                            Cancel
                        </Button>
                    </div>
                </form>
            </FormProvider>
        </div>
    );
};
