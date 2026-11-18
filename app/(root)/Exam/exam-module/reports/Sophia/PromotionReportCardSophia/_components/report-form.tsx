'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CollapsibleContent } from '@/components/ui/collapsible';
import { DatePicker } from '@/components/ui/date-picker';
import { FormError, Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import { type PromotionReportCardSophiaSchema, promotionReportCardSophiaSchema } from '@/schemas/exam/exam-module/reports';
import { getPromotionReportSophia } from '@/server/exam/exam-module/reports/PromotionReportCardSophia';
import {
    getClassDropDownByAcademicYearlist,
    getSectionsDropDownByAcademicYearandClasslist,
    getStudentsDropDownByAcademicYearandClassandSectionlist
} from '@/server/exam/exam-module/reports/cumulative-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

export default function PromotionReportCardSophiaForm({
    onSuccess
}: {
    onSuccess?: (payload: any) => Promise<void> | void;
}) {
    const methods = useForm<PromotionReportCardSophiaSchema>({
        resolver: zodResolver(promotionReportCardSophiaSchema),
        mode: 'all',
        defaultValues: {
            asmaY_Id: 0,
            asmcL_Id: 0,
            asmS_Id: 0,
            studentList: []
        } as any
    });

    const { control, handleSubmit, reset, setValue, formState } = methods;
    const { isSubmitting } = formState;

    const [academicYears, setAcademicYears] = useState<{ asmaY_Id: number; asmaY_Year: string }[]>([]);
    const [classes, setClasses] = useState<{ asmcL_Id: number; asmcL_ClassName: string }[]>([]);
    const [sections, setSections] = useState<{ asmS_Id: number; asmC_SectionName: string }[]>([]);
    const [students, setStudents] = useState<{ amsT_Id: number; studentName: string; amsT_AdmNo: string }[]>([]);

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
                const { data } = await getStudentsDropDownByAcademicYearandClassandSectionlist(
                    selectedYear,
                    selectedClass,
                    selectedSection
                );
                const formattedStudents = Array.isArray(data)
                    ? data.map((item: any) => ({
                          amsT_Id: item.amsT_Id,
                          studentName:
                              item.studentName ||
                              `${item.amsT_FirstName || ''} ${item.amsT_MiddleName || ''} ${item.amsT_LastName || ''}`.trim(),
                          amsT_AdmNo: item.amsT_AdmNo || ''
                      }))
                    : [];
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
    const onSubmit = async (data: PromotionReportCardSophiaSchema) => {
        try {
            const response = await getPromotionReportSophia(data);
            if (response.success && response.data) {
                if (onSuccess) {
                    await onSuccess(response.data);
                }
            } else {
                toast.error(response.message || 'Failed to fetch report data');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error('An error occurred while generating report');
        }
    };

    return (
        <div className='rounded-lg border bg-card text-card-foreground shadow-sm'>
            <CollapsibleContent className='p-6'>
                <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6' noValidate>
                        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                            <div className='space-y-6'>
                                <Controller
                                    control={control}
                                    name='asmaY_Id'
                                    render={({ field, fieldState }) => (
                                        <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                                            <Label className='font-medium text-sm sm:w-32'>
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
                                            <Label className='font-medium text-sm sm:w-32'>
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
                                            <Label className='font-medium text-sm sm:w-32'>
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

                                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                                    <Controller
                                        control={control}
                                        name='from_date'
                                        render={({ field, fieldState }) => (
                                            <div className='flex flex-col gap-2'>
                                                <Label className='font-medium text-sm'>
                                                    From Date <span className='text-red-500'>*</span>
                                                </Label>
                                                <DatePicker date={field.value} setDate={field.onChange} placeholder='Pick From Date' />
                                                {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                            </div>
                                        )}
                                    />
                                    <Controller
                                        control={control}
                                        name='to_date'
                                        render={({ field, fieldState }) => (
                                            <div className='flex flex-col gap-2'>
                                                <Label className='font-medium text-sm'>
                                                    To Date <span className='text-red-500'>*</span>
                                                </Label>
                                                <DatePicker date={field.value} setDate={field.onChange} placeholder='Pick To Date' />
                                                {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                            </div>
                                        )}
                                    />
                                </div>
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
                                                <div className='flex flex-col gap-2'>
                                                    <div className='flex max-h-[300px] flex-col gap-3 overflow-y-auto rounded-md border p-4'>
                                                        {loadingStudents ? (
                                                            <span className='text-muted-foreground text-sm'>Students are loading...</span>
                                                        ) : students.length === 0 ? (
                                                            <span className='text-muted-foreground text-sm'>No Students found</span>
                                                        ) : (
                                                            <div className='flex flex-col gap-3'>
                                                                {students.map((e) => {
                                                                    const isChecked =
                                                                        field.value?.some((val) => val.amsT_Id === e.amsT_Id) || false;
                                                                    return (
                                                                        <div key={e.amsT_Id} className='flex items-center space-x-2'>
                                                                            <Checkbox
                                                                                id={`student-${e.amsT_Id}`}
                                                                                checked={isChecked}
                                                                                onCheckedChange={(checked) => {
                                                                                    if (checked) {
                                                                                        field.onChange([
                                                                                            ...(field.value || []),
                                                                                            { amsT_Id: e.amsT_Id }
                                                                                        ]);
                                                                                    } else {
                                                                                        field.onChange(
                                                                                            (field.value || []).filter(
                                                                                                (val) => val.amsT_Id !== e.amsT_Id
                                                                                            )
                                                                                        );
                                                                                    }
                                                                                }}
                                                                            />
                                                                            <Label
                                                                                htmlFor={`student-${e.amsT_Id}`}
                                                                                className='font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                                                                                {e.studentName} {e.amsT_AdmNo ? `/ ${e.amsT_AdmNo}` : ''}
                                                                            </Label>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                                </div>
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <hr className='my-6 border-gray-300' />

                        <div className='flex justify-center gap-3'>
                            <Button
                                type='submit'
                                isLoading={isSubmitting}
                                disabled={isSubmitting || selectedStudentsList?.length === 0}
                                className='min-w-[140px]'>
                                {isSubmitting ? 'Generating...' : 'Report'}
                            </Button>
                            <Button type='button' variant='outline' onClick={() => reset()} className='min-w-[100px]'>
                                Clear
                            </Button>
                        </div>
                    </form>
                </FormProvider>
            </CollapsibleContent>
        </div>
    );
}
