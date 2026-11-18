'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CustomMultiSelectBox } from '@/components/ui/custom-multiselect';
import { DatePicker } from '@/components/ui/date-picker';
import { FormError, Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import { finalPromReportChinmayI_IXSchema } from '@/schemas/exam/exam-module/reports';
import { getFinalPromReportChinmayI_IX } from '@/server/exam/exam-module/reports/FinalPromReportChinmayI_IX';
import {
    getClassDropDownByAcademicYearlist,
    getSectionsDropDownByAcademicYearandClasslist,
    getStudentsDropDownByAcademicYearandClassandSectionlist
} from '@/server/exam/exam-module/reports/cumulative-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormValues = z.infer<typeof finalPromReportChinmayI_IXSchema>;

export default function FinalPromReportChinmayI_IXForm({
    onSuccess
}: {
    onSuccess?: (data: { apiData: any; payload: any; academicYears: any[]; students: any[] }) => void;
}) {
    const methods = useForm<FormValues>({
        resolver: zodResolver(finalPromReportChinmayI_IXSchema),
        mode: 'all',
        defaultValues: {
            ASMAY_Id: undefined as any,
            ASMCL_Id: undefined as any,
            ASMS_Id: undefined as any,
            OverAlltotal: false,
            OverAlClass: false,
            ECTEX_NotApplToTotalFlg: false,
            reopen_date: new Date().toISOString(),
            selectedStudents: []
        }
    });

    const { control, handleSubmit, setValue, reset, formState } = methods;
    const { isSubmitting } = formState;

    const { data: academicData, error: academicError, isLoading: academicYearLoading } = useAcademicYearDropdown();

    const [academicYears, setAcademicYears] = useState<{ asmaY_Id: number; asmaY_Year: string }[]>([]);
    const [classes, setClasses] = useState<{ asmcL_Id: number; asmcL_ClassName: string }[]>([]);
    const [sections, setSections] = useState<{ asmS_Id: number; asmC_SectionName: string }[]>([]);
    const [students, setStudents] = useState<{ amsT_Id: number; studentname?: string | null; amsT_AdmNo?: string }[]>([]);
    const [allStudentsSelected, setAllStudentsSelected] = useState(false);

    const selectedYear = useWatch({ control, name: 'ASMAY_Id' });
    const selectedClass = useWatch({ control, name: 'ASMCL_Id' });
    const selectedSection = useWatch({ control, name: 'ASMS_Id' });
    const selectedStudentsList = useWatch({ control, name: 'selectedStudents' });

    const [loadingClasses, setLoadingClasses] = useState(false);
    const [loadingSections, setLoadingSections] = useState(false);
    const [loadingStudents, setLoadingStudents] = useState(false);

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
        if (!selectedYear) {
            setClasses([]);
            return;
        }
        (async () => {
            try {
                setLoadingClasses(true);
                const { data } = await getClassDropDownByAcademicYearlist(Number(selectedYear));
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
    }, [selectedYear, setValue]);

    useEffect(() => {
        if (!selectedYear || !selectedClass) {
            setSections([]);
            return;
        }
        (async () => {
            try {
                setLoadingSections(true);
                const { data } = await getSectionsDropDownByAcademicYearandClasslist(Number(selectedYear), Number(selectedClass));
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
    }, [selectedYear, selectedClass, setValue]);

    useEffect(() => {
        if (!selectedYear || !selectedClass || !selectedSection) {
            setStudents([]);
            return;
        }
        (async () => {
            try {
                setLoadingStudents(true);
                const { data } = await getStudentsDropDownByAcademicYearandClassandSectionlist(
                    Number(selectedYear),
                    Number(selectedClass),
                    Number(selectedSection)
                );
                const valid = Array.isArray(data) ? data : [];
                const formattedStudents = valid.map((s: any) => ({
                    amsT_Id: s.amsT_Id,
                    studentname: s.studentName || `${s.amsT_FirstName || ''} ${s.amsT_MiddleName || ''} ${s.amsT_LastName || ''}`.trim(),
                    amsT_AdmNo: s.amsT_AdmNo || ''
                }));
                setStudents(formattedStudents);

                // Select all by default
                setValue(
                    'selectedStudents',
                    formattedStudents.map((s) => s.amsT_Id.toString())
                );
                setAllStudentsSelected(true);
            } catch {
                toast.error('Failed to load students');
            } finally {
                setLoadingStudents(false);
            }
        })();
    }, [selectedYear, selectedClass, selectedSection, setValue]);

    const onSubmit = async (data: FormValues) => {
        try {
            const payload = {
                ASMAY_Id: Number(data.ASMAY_Id),
                ASMCL_Id: Number(data.ASMCL_Id),
                ASMS_Id: Number(data.ASMS_Id),
                OverAlltotal: data.OverAlltotal,
                OverAlClass: data.OverAlClass,
                ECTEX_NotApplToTotalFlg: data.ECTEX_NotApplToTotalFlg,
                Reopen_Date: data.reopen_date,
                Temp_AmstIds: data.selectedStudents.map((id) => ({ AMST_Id: Number(id) }))
            };

            const response: any = await getFinalPromReportChinmayI_IX(payload as any);

            if (response?.success && response?.data && response.data.getstudentdetails?.length > 0) {
                if (onSuccess) await onSuccess({ apiData: response.data, payload, academicYears, students });
            } else {
                // Trigger mock data fallback in page.tsx
                if (onSuccess) await onSuccess({ apiData: null, payload, academicYears, students });
            }
        } catch (err: any) {
            console.error('API Error:', err);
            // Even on catch, show mock data for testing
            const formData = methods.getValues();
            const fallbackPayload = {
                ASMAY_Id: Number(formData.ASMAY_Id),
                ASMCL_Id: Number(formData.ASMCL_Id),
                ASMS_Id: Number(formData.ASMS_Id),
                Temp_AmstIds: formData.selectedStudents.map((id) => ({ AMST_Id: Number(id) })),
                Reopen_Date: formData.reopen_date,
                OverAlltotal: formData.OverAlltotal,
                OverAlClass: formData.OverAlClass,
                ECTEX_NotApplToTotalFlg: formData.ECTEX_NotApplToTotalFlg
            };
            if (onSuccess) await onSuccess({ apiData: null, payload: fallbackPayload, academicYears, students });
        }
    };

    const handleAllStudents = (checked: boolean) => {
        if (checked && students.length) {
            setValue(
                'selectedStudents',
                students.map((s) => s.amsT_Id.toString()),
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

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6' noValidate>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                    <div className='space-y-4'>
                        {/* Academic Year */}
                        <Controller
                            control={control}
                            name='ASMAY_Id'
                            render={({ field, fieldState }) => (
                                <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                                    <Label className='font-medium text-sm sm:w-36'>
                                        Academic Year <span className='text-red-500'>*</span>
                                    </Label>
                                    <div className='flex-1'>
                                        <Select key={field.value} onValueChange={field.onChange} value={field.value || undefined}>
                                            <SelectTrigger>
                                                <SelectValue placeholder={academicYearLoading ? 'Loading...' : 'Select Academic Year'} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {academicYears.map((y) => (
                                                    <SelectItem key={y.asmaY_Id} value={y.asmaY_Id.toString()}>
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
                            name='ASMCL_Id'
                            render={({ field, fieldState }) => (
                                <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                                    <Label className='font-medium text-sm sm:w-36'>
                                        Class <span className='text-red-500'>*</span>
                                    </Label>
                                    <div className='flex-1'>
                                        <Select
                                            key={field.value}
                                            onValueChange={field.onChange}
                                            value={field.value || undefined}
                                            disabled={!selectedYear || loadingClasses}>
                                            <SelectTrigger>
                                                <SelectValue placeholder={loadingClasses ? 'Loading...' : 'Select Class'} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {classes.map((c) => (
                                                    <SelectItem key={c.asmcL_Id} value={c.asmcL_Id.toString()}>
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
                            name='ASMS_Id'
                            render={({ field, fieldState }) => (
                                <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                                    <Label className='font-medium text-sm sm:w-36'>
                                        Section <span className='text-red-500'>*</span>
                                    </Label>
                                    <div className='flex-1'>
                                        <Select
                                            key={field.value}
                                            onValueChange={field.onChange}
                                            value={field.value || undefined}
                                            disabled={!selectedClass || loadingSections}>
                                            <SelectTrigger>
                                                <SelectValue placeholder={loadingSections ? 'Loading...' : 'Select Section'} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {sections.map((s) => (
                                                    <SelectItem key={s.asmS_Id} value={s.asmS_Id.toString()}>
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

                        {/* Reopen Date */}
                        <Controller
                            control={control}
                            name='reopen_date'
                            render={({ field, fieldState }) => (
                                <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                                    <Label className='font-medium text-sm sm:w-36'>
                                        Reopen Date <span className='text-red-500'>*</span>
                                    </Label>
                                    <div className='flex-1'>
                                        <DatePicker
                                            date={field.value ? new Date(field.value) : undefined}
                                            setDate={(date) => field.onChange(date?.toISOString())}
                                        />
                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                    </div>
                                </div>
                            )}
                        />

                        {/* Chinmaya Specific Checkboxes */}
                        <div className='space-y-2 border-t pt-2'>
                            <Controller
                                control={control}
                                name='OverAlltotal'
                                render={({ field }) => (
                                    <div className='flex items-center space-x-2'>
                                        <Checkbox id='OverAlltotal' checked={field.value} onCheckedChange={field.onChange} />
                                        <Label htmlFor='OverAlltotal' className='cursor-pointer font-normal text-xs'>
                                            OverAll Total Grade ?
                                        </Label>
                                    </div>
                                )}
                            />
                            <Controller
                                control={control}
                                name='OverAlClass'
                                render={({ field }) => (
                                    <div className='flex items-center space-x-2'>
                                        <Checkbox id='OverAlClass' checked={field.value} onCheckedChange={field.onChange} />
                                        <Label htmlFor='OverAlClass' className='cursor-pointer font-normal text-xs'>
                                            OverAll Class-Section Rank ?
                                        </Label>
                                    </div>
                                )}
                            />
                            <Controller
                                control={control}
                                name='ECTEX_NotApplToTotalFlg'
                                render={({ field }) => (
                                    <div className='flex items-center space-x-2'>
                                        <Checkbox id='ECTEX_NotApplToTotalFlg' checked={field.value} onCheckedChange={field.onChange} />
                                        <Label htmlFor='ECTEX_NotApplToTotalFlg' className='cursor-pointer font-normal text-xs'>
                                            Exam Wise Remarks ?
                                        </Label>
                                    </div>
                                )}
                            />
                        </div>
                    </div>

                    {/* Students */}
                    <div className='space-y-4'>
                        <div className='flex flex-col gap-2'>
                            <div className='flex items-center gap-2'>
                                <Checkbox checked={allStudentsSelected} onCheckedChange={handleAllStudents} id='all-students-chinmaya' />
                                <Label htmlFor='all-students-chinmaya' className='font-medium text-sm'>
                                    Select All Students <span className='text-red-500'>*</span>
                                </Label>
                            </div>
                            <Controller
                                control={control}
                                name='selectedStudents'
                                render={({ field, fieldState }) => (
                                    <div className='flex-1'>
                                        <CustomMultiSelectBox
                                            options={students.map((s) => ({
                                                label: `${s.studentname} ${s.amsT_AdmNo ? `(${s.amsT_AdmNo})` : ''}`,
                                                value: s.amsT_Id.toString()
                                            }))}
                                            onChange={handleStudentChange}
                                            value={field.value}
                                            placeholder='Select Students'
                                            height='250px'
                                            isSearchRequired
                                            error={fieldState.error?.message}
                                        />
                                    </div>
                                )}
                            />
                        </div>
                    </div>
                </div>

                <div className='flex justify-center gap-4 border-t pt-6'>
                    <Button type='submit' isLoading={isSubmitting} disabled={isSubmitting}>
                        Report
                    </Button>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={() => {
                            reset();
                            setStudents([]);
                            setClasses([]);
                            setSections([]);
                        }}>
                        Cancel
                    </Button>
                </div>
            </form>
        </FormProvider>
    );
}
