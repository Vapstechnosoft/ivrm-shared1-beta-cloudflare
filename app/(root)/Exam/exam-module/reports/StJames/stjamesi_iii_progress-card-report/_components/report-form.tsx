'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CollapsibleContent } from '@/components/ui/collapsible';
import { FormError, Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import { type StJamesI_IIIReportSchema, stJamesI_IIIReportSchema } from '@/schemas/exam/exam-module/reports';
import {
    getClassDropDownByAcademicYearlist,
    getExamsDropDownByAcademicYearandClassandSectionlist,
    getSectionsDropDownByAcademicYearandClasslist
} from '@/server/exam/exam-module/reports/cumulative-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

export default function StJamesI_IIIReportForm({
    onSuccess,
    loading: externalLoading
}: {
    onSuccess?: (payload: any) => Promise<void> | void;
    loading?: boolean;
}) {
    const methods = useForm<StJamesI_IIIReportSchema>({
        resolver: zodResolver(stJamesI_IIIReportSchema),
        mode: 'all',
        defaultValues: {
            asmaY_Id: 0,
            asmcL_Id: 0,
            asmS_Id: 0,
            emE_Id: 0,
            readmit: false,
            displayattendance: false,
            displayMarks: false
        }
    });

    const { control, handleSubmit, reset, setValue, formState } = methods;
    const { isSubmitting } = formState;

    const [academicYears, setAcademicYears] = useState<{ asmaY_Id: number; asmaY_Year: string }[]>([]);
    const [classes, setClasses] = useState<{ asmcL_Id: number; asmcL_ClassName: string }[]>([]);
    const [sections, setSections] = useState<{ asmS_Id: number; asmC_SectionName: string }[]>([]);
    const [exams, setExams] = useState<{ emE_Id: number; emE_ExamName: string }[]>([]);

    const { data: academicData, error: academicError, isLoading: academicYearLoading } = useAcademicYearDropdown();

    const selectedYear = useWatch({ control, name: 'asmaY_Id' });
    const selectedClass = useWatch({ control, name: 'asmcL_Id' });
    const selectedSection = useWatch({ control, name: 'asmS_Id' });

    const [loadingClasses, setLoadingClasses] = useState(false);
    const [loadingSections, setLoadingSections] = useState(false);
    const [loadingExams, setLoadingExams] = useState(false);

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
                setValue('emE_Id', 0);
                setExams([]);
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
                setValue('emE_Id', 0);
                setExams([]);
            } catch {
                toast.error('Failed to load sections');
            } finally {
                setLoadingSections(false);
            }
        })();
    }, [selectedYear, selectedClass, setValue]);

    // set Exams
    useEffect(() => {
        if (!selectedYear || !selectedClass || !selectedSection) return;
        (async () => {
            try {
                setLoadingExams(true);
                const { data } = await getExamsDropDownByAcademicYearandClassandSectionlist(selectedYear, selectedClass, selectedSection);
                setExams(Array.isArray(data) ? data : []);
                setValue('emE_Id', 0);
            } catch {
                toast.error('Failed to load exams');
            } finally {
                setLoadingExams(false);
            }
        })();
    }, [selectedYear, selectedClass, selectedSection, setValue]);

    const onSubmit = async (data: StJamesI_IIIReportSchema) => {
        const selectedYearObj = academicYears.find((y) => y.asmaY_Id === data.asmaY_Id);
        const selectedExamObj = exams.find((e) => e.emE_Id === data.emE_Id);

        const payload = {
            ...data,
            asmaY_Year: selectedYearObj?.asmaY_Year || '',
            emE_ExamName: selectedExamObj?.emE_ExamName || ''
        };

        if (onSuccess) {
            await onSuccess(payload);
        }
    };

    return (
        <div className='rounded-lg border bg-card text-card-foreground shadow-sm'>
            <CollapsibleContent className='p-6' forceMount>
                <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6' noValidate>
                        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
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
                                name='emE_Id'
                                render={({ field, fieldState }) => (
                                    <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                                        <Label className='font-medium text-sm sm:w-32'>
                                            Exam <span className='text-red-500'>*</span>
                                        </Label>
                                        <div className='flex-1'>
                                            <Select
                                                onValueChange={(v) => field.onChange(Number(v))}
                                                value={field.value ? String(field.value) : ''}>
                                                <SelectTrigger className='w-full'>
                                                    <SelectValue placeholder='Select Exam' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {loadingExams ? (
                                                        <SelectItem value='0' disabled>
                                                            Exams are loading...
                                                        </SelectItem>
                                                    ) : exams.length === 0 ? (
                                                        <SelectItem value='0' disabled>
                                                            No Exams found
                                                        </SelectItem>
                                                    ) : (
                                                        exams.map((e) => (
                                                            <SelectItem key={e.emE_Id} value={String(e.emE_Id)}>
                                                                {e.emE_ExamName}
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

                        <div className='flex flex-wrap gap-6'>
                            <div className='flex items-center gap-2'>
                                <Controller
                                    control={control}
                                    name='readmit'
                                    render={({ field }) => <Checkbox id='readmit' checked={field.value} onCheckedChange={field.onChange} />}
                                />
                                <Label htmlFor='readmit' className='cursor-pointer'>
                                    Display Promotion
                                </Label>
                            </div>
                            <div className='flex items-center gap-2'>
                                <Controller
                                    control={control}
                                    name='displayattendance'
                                    render={({ field }) => (
                                        <Checkbox id='displayattendance' checked={field.value} onCheckedChange={field.onChange} />
                                    )}
                                />
                                <Label htmlFor='displayattendance' className='cursor-pointer'>
                                    Display Attendance
                                </Label>
                            </div>
                            <div className='flex items-center gap-2'>
                                <Controller
                                    control={control}
                                    name='displayMarks'
                                    render={({ field }) => (
                                        <Checkbox id='displayMarks' checked={field.value} onCheckedChange={field.onChange} />
                                    )}
                                />
                                <Label htmlFor='displayMarks' className='cursor-pointer'>
                                    Display Marks Display
                                </Label>
                            </div>
                        </div>

                        <div className='flex justify-center gap-3'>
                            <Button
                                type='submit'
                                isLoading={isSubmitting || externalLoading}
                                disabled={isSubmitting || externalLoading}
                                className='min-w-[140px]'>
                                Report
                            </Button>
                            <Button type='button' variant='outline' onClick={() => reset()} className='min-w-[100px]'>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </FormProvider>
            </CollapsibleContent>
        </div>
    );
}
