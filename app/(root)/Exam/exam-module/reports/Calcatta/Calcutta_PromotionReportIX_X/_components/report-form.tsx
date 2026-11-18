'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CustomMultiSelectBox } from '@/components/ui/custom-multiselect';
import { DatePicker } from '@/components/ui/date-picker';
import { FormError, Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import { type CalcuttaPromotionReportItoVSchema, calcuttaPromotionReportItoVSchema } from '@/schemas/exam/exam-module/reports';
import {
    getClassDropDownByAcademicYearlist,
    getSectionsDropDownByAcademicYearandClasslist,
    getStudentsDropDownByAcademicYearandClassandSectionlist
} from '@/server/exam/exam-module/reports/cumulative-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

export default function CalcuttaPromotionReportForm({
    onSuccess
}: {
    onSuccess?: (payload: any) => Promise<void> | void;
}) {
    const methods = useForm<CalcuttaPromotionReportItoVSchema>({
        resolver: zodResolver(calcuttaPromotionReportItoVSchema),
        mode: 'all',
        defaultValues: {
            asmaY_Id: 0,
            asmcL_Id: 0,
            asmS_Id: 0,
            studentList: [],
            academicDate: new Date(),
            issueDate: new Date(),
            reportPrintedDate: new Date()
        } as any
    });

    const { control, handleSubmit, reset, setValue, formState } = methods;
    const { isSubmitting, errors } = formState;

    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            console.log('Form validation errors:', errors);
            toast.error(
                'Please correct validation errors: ' +
                    Object.keys(errors)
                        .map((key) => `${key}: ${errors[key as keyof typeof errors]?.message || 'invalid'}`)
                        .join(', ')
            );
        }
    }, [errors]);

    const [academicYears, setAcademicYears] = useState<{ asmaY_Id: number; asmaY_Year: string }[]>([]);
    const [classes, setClasses] = useState<{ asmcL_Id: number; asmcL_ClassName: string }[]>([]);
    const [sections, setSections] = useState<{ asmS_Id: number; asmC_SectionName: string }[]>([]);
    const [students, setStudents] = useState<{ amsT_Id: number; amsT_AdmNo?: string | number; studentName: string }[]>([]);

    const { data: academicData, error: academicError, isLoading: academicYearLoading } = useAcademicYearDropdown();

    const selectedYear = useWatch({ control, name: 'asmaY_Id' });
    const selectedClass = useWatch({ control, name: 'asmcL_Id' });
    const selectedSection = useWatch({ control, name: 'asmS_Id' });
    const selectedStudentsList = useWatch({ control, name: 'studentList' });

    const [loadingClasses, setLoadingClasses] = useState(false);
    const [loadingSections, setLoadingSections] = useState(false);
    const [loadingStudents, setLoadingStudents] = useState(false);

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

    // set classes
    useEffect(() => {
        if (!selectedYear) return;
        (async () => {
            try {
                setLoadingClasses(true);
                const { data } = await getClassDropDownByAcademicYearlist(selectedYear);
                if (!data || (Array.isArray(data) && data.length === 0)) {
                    toast.info('No classes mapped to this academic year');
                }
                setClasses(Array.isArray(data) ? data : []);
                setValue('asmcL_Id', 0);
                setValue('asmS_Id', 0);
                setValue('studentList', []);
                setStudents([]);
            } catch {
                toast.error('Failed to load classes');
            } finally {
                setLoadingClasses(false);
            }
        })();
    }, [selectedYear, setValue]);

    // set sections
    useEffect(() => {
        if (!selectedYear || !selectedClass) return;
        (async () => {
            try {
                setLoadingSections(true);
                const { data } = await getSectionsDropDownByAcademicYearandClasslist(selectedYear, selectedClass);
                if (!data || (Array.isArray(data) && data.length === 0)) {
                    toast.info('No sections found');
                }
                setSections(Array.isArray(data) ? data : []);
                setValue('asmS_Id', 0);
                setValue('studentList', []);
                setStudents([]);
            } catch {
                toast.error('Failed to load sections');
            } finally {
                setLoadingSections(false);
            }
        })();
    }, [selectedYear, selectedClass, setValue]);

    // set Students
    useEffect(() => {
        if (!selectedYear || !selectedClass || !selectedSection) return;
        (async () => {
            try {
                setLoadingStudents(true);
                const studentRes = await getStudentsDropDownByAcademicYearandClassandSectionlist(
                    selectedYear,
                    selectedClass,
                    selectedSection
                );

                const valid = Array.isArray(studentRes.data) ? (studentRes.data as any[]).filter((s) => !!s?.amsT_Id) : [];

                const formattedStudents = valid.map((s) => ({
                    amsT_Id: s.amsT_Id,
                    amsT_AdmNo: s.amsT_AdmNo,
                    studentName: s.studentName || `${s.amsT_FirstName || ''} ${s.amsT_MiddleName || ''} ${s.amsT_LastName || ''}`.trim()
                }));

                if (formattedStudents.length === 0) {
                    toast.info('No students found');
                }

                setStudents(formattedStudents);
                setValue('studentList', []);
            } catch {
                toast.error('Failed to load students');
            } finally {
                setLoadingStudents(false);
            }
        })();
    }, [selectedYear, selectedClass, selectedSection, setValue]);

    // on submit
    const onSubmit = async (data: CalcuttaPromotionReportItoVSchema) => {
        const selectedYearObj = academicYears.find((y) => y.asmaY_Id === data.asmaY_Id);
        const payload: any = {
            ASMAY_Id: data.asmaY_Id,
            ASMAY_Year: selectedYearObj ? selectedYearObj.asmaY_Year : '',
            ASMCL_Id: data.asmcL_Id,
            ASMS_Id: data.asmS_Id,
            Temp_AmstIds: data.studentList.map((s) => ({ AMST_Id: s.amsT_Id })),
            EMPG_GroupName: '',
            flag: '4',
            academicDate: data.academicDate,
            issueDate: data.issueDate,
            reportPrintedDate: data.reportPrintedDate
        };

        if (onSuccess) {
            await onSuccess(payload);
        }
    };

    return (
        <div className='mx-auto w-full rounded-lg border border-gray-200 bg-white p-4 shadow-md'>
            <div className='mb-4 flex items-center justify-between border-b pb-2'>
                <h3 className='font-semibold text-gray-800 text-lg'>Calcutta Promotion Report IX-X</h3>
            </div>
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-6' noValidate>
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                        <div className='space-y-6'>
                            <Controller
                                control={control}
                                name='asmaY_Id'
                                render={({ field, fieldState }) => (
                                    <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                                        <Label className='font-medium text-sm sm:w-44'>
                                            Academic Year <span className='text-red-500'>*</span>
                                        </Label>
                                        <div className='flex-1'>
                                            <Select
                                                key={field.value}
                                                onValueChange={(v) => field.onChange(Number(v))}
                                                value={field.value ? String(field.value) : ''}>
                                                <SelectTrigger className='w-full'>
                                                    <SelectValue placeholder='Select Academic Year' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {academicYearLoading ? (
                                                        <SelectItem value='0' disabled>
                                                            Academic Year is loading...
                                                        </SelectItem>
                                                    ) : academicYears.length === 0 ? (
                                                        <SelectItem value='0' disabled>
                                                            No Academic Year found
                                                        </SelectItem>
                                                    ) : (
                                                        academicYears.map((y) => (
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

                            <Controller
                                control={control}
                                name='asmcL_Id'
                                render={({ field, fieldState }) => (
                                    <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                                        <Label className='font-medium text-sm sm:w-44'>
                                            Class <span className='text-red-500'>*</span>
                                        </Label>
                                        <div className='flex-1'>
                                            <Select
                                                key={field.value}
                                                onValueChange={(v) => field.onChange(Number(v))}
                                                value={field.value ? String(field.value) : ''}>
                                                <SelectTrigger className='w-full'>
                                                    <SelectValue placeholder='Select Class' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {loadingClasses ? (
                                                        <SelectItem value='0' disabled>
                                                            Classes are loading...
                                                        </SelectItem>
                                                    ) : classes.length === 0 ? (
                                                        <SelectItem value='0' disabled>
                                                            No Classes found
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
                                    </div>
                                )}
                            />

                            <Controller
                                control={control}
                                name='asmS_Id'
                                render={({ field, fieldState }) => (
                                    <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                                        <Label className='font-medium text-sm sm:w-44'>
                                            Section <span className='text-red-500'>*</span>
                                        </Label>
                                        <div className='flex-1'>
                                            <Select
                                                key={field.value}
                                                onValueChange={(v) => field.onChange(Number(v))}
                                                value={field.value ? String(field.value) : ''}>
                                                <SelectTrigger className='w-full'>
                                                    <SelectValue placeholder='Select Section' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {loadingSections ? (
                                                        <SelectItem value='0' disabled>
                                                            Sections are loading...
                                                        </SelectItem>
                                                    ) : sections.length === 0 ? (
                                                        <SelectItem value='0' disabled>
                                                            No Sections found
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
                                    </div>
                                )}
                            />

                            <Controller
                                control={control}
                                name='academicDate'
                                render={({ field, fieldState }) => (
                                    <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                                        <Label className='font-medium text-sm sm:w-44'>
                                            New Academic Date <span className='text-red-500'>*</span>
                                        </Label>
                                        <div className='flex-1'>
                                            <DatePicker date={field.value} setDate={field.onChange} placeholder='Select Date' />
                                            {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                        </div>
                                    </div>
                                )}
                            />

                            <Controller
                                control={control}
                                name='reportPrintedDate'
                                render={({ field, fieldState }) => (
                                    <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                                        <Label className='font-medium text-sm sm:w-44'>Report Printed On</Label>
                                        <div className='flex-1'>
                                            <DatePicker date={field.value} setDate={field.onChange} placeholder='Select Date' />
                                            {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                        </div>
                                    </div>
                                )}
                            />

                            <Controller
                                control={control}
                                name='issueDate'
                                render={({ field, fieldState }) => (
                                    <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                                        <Label className='font-medium text-sm sm:w-44'>
                                            Issue Date <span className='text-red-500'>*</span>
                                        </Label>
                                        <div className='flex-1'>
                                            <DatePicker date={field.value} setDate={field.onChange} placeholder='Select Date' />
                                            {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                        </div>
                                    </div>
                                )}
                            />
                        </div>

                        <div className='space-y-6'>
                            <div className='flex flex-col gap-2 sm:flex-row sm:items-start'>
                                <Label className='flex items-center gap-2 font-medium text-sm sm:w-32'>
                                    <Checkbox
                                        checked={selectedStudentsList?.length === students.length && students.length > 0}
                                        onCheckedChange={(checked) => {
                                            if (checked) {
                                                setValue(
                                                    'studentList',
                                                    students.map((e) => ({ amsT_Id: e.amsT_Id })),
                                                    { shouldValidate: true }
                                                );
                                            } else {
                                                setValue('studentList', [], { shouldValidate: true });
                                            }
                                        }}
                                    />
                                    Students <span className='text-red-500'>*</span>
                                </Label>
                                <div className='flex-1'>
                                    <Controller
                                        control={control}
                                        name='studentList'
                                        render={({ field, fieldState }) => (
                                            <CustomMultiSelectBox
                                                options={students.map((s: any) => ({
                                                    label: `${s.studentName?.trim() || 'Unknown'} - ${s.amsT_AdmNo || 'N/A'}`.trim(),
                                                    value: s.amsT_Id.toString()
                                                }))}
                                                onChange={(selectedValues) => {
                                                    field.onChange(selectedValues.map((id) => ({ amsT_Id: Number(id) })));
                                                }}
                                                value={field.value?.map((v) => String(v.amsT_Id)) ?? []}
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
                        <Button
                            type='submit'
                            isLoading={isSubmitting}
                            disabled={isSubmitting || selectedStudentsList?.length === 0}
                            className='min-w-[140px]'>
                            {isSubmitting ? 'Generating...' : 'Report'}
                        </Button>
                        <Button
                            type='button'
                            variant='outline'
                            onClick={() => {
                                reset();
                            }}
                            className='min-w-[100px]'>
                            Clear
                        </Button>
                    </div>
                </form>
            </FormProvider>
        </div>
    );
}
