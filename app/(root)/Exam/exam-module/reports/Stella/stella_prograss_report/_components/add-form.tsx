'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { CollapsibleContent } from '@/components/ui/collapsible';
import { CustomMultiSelectBox } from '@/components/ui/custom-multiselect';
import { FormError, Label } from '@/components/ui/extension/field';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import { cn } from '@/lib/utils';
import { type StellaProgressReportSchema, stellaProgressReportSchema } from '@/schemas/exam/exam-module/reports';
import {
    getClassDropDownByAcademicYearlist,
    getSectionsDropDownByAcademicYearandClasslist,
    getStudentsDropDownByAcademicYearandClassandSectionlist
} from '@/server/exam/exam-module/reports/cumulative-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

export default function StellaProgressReportForm({
    onSuccess
}: {
    onSuccess?: (payload: any) => Promise<void> | void;
}) {
    const methods = useForm<StellaProgressReportSchema>({
        resolver: zodResolver(stellaProgressReportSchema),
        mode: 'all',
        defaultValues: {
            asmaY_Id: 0,
            asmcL_Id: 0,
            asmS_Id: 0,
            studentList: []
        }
    });

    const { control, handleSubmit, reset, setValue, formState } = methods;
    const { isSubmitting } = formState;

    const [academicYears, setAcademicYears] = useState<{ asmaY_Id: number; asmaY_Year: string }[]>([]);
    const [classes, setClasses] = useState<{ asmcL_Id: number; asmcL_ClassName: string }[]>([]);
    const [sections, setSections] = useState<{ asmS_Id: number; asmC_SectionName: string }[]>([]);
    const [students, setStudents] = useState<{ amsT_AdmNo: number; amsT_Id: number; studentName?: string | null }[]>([]);
    const [allStudentsSelected, setAllStudentsSelected] = useState(false);

    const { data: academicData, error: academicError, isLoading: academicYearLoading } = useAcademicYearDropdown();

    const selectedYear = useWatch({ control, name: 'asmaY_Id' });
    const selectedClass = useWatch({ control, name: 'asmcL_Id' });
    const selectedSection = useWatch({ control, name: 'asmS_Id' });
    const studentList = useWatch({ control, name: 'studentList' });

    const [loadingClasses, setLoadingClasses] = useState(false);
    const [loadingSections, setLoadingSections] = useState(false);
    const [_loadingStudents, setLoadingStudents] = useState(false);

    const hasStudentsSelected = Array.isArray(studentList) && studentList.length > 0;

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
                setAllStudentsSelected(false);
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
                setAllStudentsSelected(false);
            } catch {
                toast.error('Failed to load sections');
            } finally {
                setLoadingSections(false);
            }
        })();
    }, [selectedYear, selectedClass, setValue]);

    // set students
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
                const valid = Array.isArray(data) ? data.filter((s): s is any => !!s?.amsT_Id) : [];
                if (valid.length === 0) {
                    toast.info('No students found');
                }

                const mappedStudents = valid.map((s) => ({
                    amsT_Id: s.amsT_Id,
                    amsT_AdmNo: s.amsT_AdmNo,
                    studentName: s.studentName || `${s.amsT_FirstName || ''} ${s.amsT_MiddleName || ''} ${s.amsT_LastName || ''}`.trim()
                }));

                setStudents(mappedStudents);
                setValue('studentList', []);
                setAllStudentsSelected(false);
            } catch {
                toast.error('Failed to load students');
            } finally {
                setLoadingStudents(false);
            }
        })();
    }, [selectedYear, selectedClass, selectedSection, setValue]);

    // on submit
    const onSubmit = async (data: StellaProgressReportSchema) => {
        if (!hasStudentsSelected) {
            toast.error('Please select at least one student');
            return;
        }

        const currentDateTime = new Date().toISOString();
        const payload: any = {
            asmaY_Id: data.asmaY_Id,
            asmcL_Id: data.asmcL_Id,
            asmS_Id: data.asmS_Id,
            amsT_Ids: data.studentList.map((s) => s.amsT_Id).join(','),
            reopenDate: data.reopenDate ? data.reopenDate.toISOString() : null, // Added Reopen Date
            fromDate: currentDateTime,
            toDate: currentDateTime
        };
        if (onSuccess) {
            await onSuccess(payload);
        }
    };

    // handlers
    const handleAllStudents = (checked: boolean) => {
        if (checked && students.length) {
            setValue('studentList', [...students], { shouldValidate: true });
            setAllStudentsSelected(true);
        } else {
            setValue('studentList', [], { shouldValidate: true });
            setAllStudentsSelected(false);
        }
    };

    // handle student change
    const handleStudentChange = (selectedValues: string[]) => {
        const selected = students.filter((s) => selectedValues.includes(s.amsT_Id.toString()));
        setValue('studentList', selected, { shouldValidate: true });
        setAllStudentsSelected(selected.length === students.length && students.length > 0);
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

                                <Controller
                                    control={control}
                                    name='reopenDate'
                                    render={({ field, fieldState }) => (
                                        <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                                            <Label className='font-medium text-sm sm:w-32'>
                                                Reopen Date <span className='text-red-500'>*</span>
                                            </Label>
                                            <div className='flex-1'>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant={'outline'}
                                                            className={cn(
                                                                'w-full justify-start text-left font-normal',
                                                                !field.value && 'text-muted-foreground'
                                                            )}>
                                                            <CalendarIcon className='mr-2 h-4 w-4' />
                                                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className='w-auto p-0'>
                                                        <Calendar
                                                            mode='single'
                                                            selected={field.value}
                                                            onSelect={field.onChange}
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                            </div>
                                        </div>
                                    )}
                                />
                            </div>

                            <div className='space-y-6'>
                                <div className='flex flex-col gap-2 sm:flex-row sm:items-start'>
                                    <Label className='flex items-center gap-2 font-medium text-sm sm:w-32'>
                                        <Checkbox checked={allStudentsSelected} onCheckedChange={handleAllStudents} />
                                        Student <span className='text-red-500'>*</span>
                                    </Label>
                                    <div className='flex-1'>
                                        <Controller
                                            control={control}
                                            name='studentList'
                                            render={({ field, fieldState }) => (
                                                <CustomMultiSelectBox
                                                    options={students.map((s) => ({
                                                        label: `${s.studentName?.trim() || 'Unknown'} - ${s.amsT_AdmNo || 'N/A'}`.trim(),
                                                        value: s.amsT_Id.toString()
                                                    }))}
                                                    onChange={handleStudentChange}
                                                    value={field.value?.map((s: any) => s.amsT_Id.toString()) ?? []}
                                                    placeholder='Select Students'
                                                    height='200px'
                                                    isSearchRequired
                                                    error={fieldState.error?.message}
                                                />
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
                                disabled={isSubmitting || !hasStudentsSelected}
                                className='min-w-[140px]'>
                                {isSubmitting ? 'Generating...' : 'Report'}
                            </Button>
                            <Button
                                type='button'
                                variant='outline'
                                onClick={() => {
                                    reset();
                                    setStudents([]);
                                }}
                                className='min-w-[100px]'>
                                Clear
                            </Button>
                        </div>
                    </form>
                </FormProvider>
            </CollapsibleContent>
        </div>
    );
}
