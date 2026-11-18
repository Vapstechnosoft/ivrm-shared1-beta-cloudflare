'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CollapsibleContent } from '@/components/ui/collapsible';
import { FormError, Label } from '@/components/ui/extension/field';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import { type StJamesIX_XReportSchema, stJamesIX_XReportSchema } from '@/schemas/exam/exam-module/reports';
import {
    getClassDropDownByAcademicYearlist,
    getExamsStjames,
    getSectionsDropDownByAcademicYearandClasslist
} from '@/server/exam/exam-module/reports/cumulative-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

export default function StJamesIVReportForm({
    onSuccess
}: {
    onSuccess?: (payload: any) => Promise<void> | void;
}) {
    const methods = useForm<StJamesIX_XReportSchema>({
        resolver: zodResolver(stJamesIX_XReportSchema),
        mode: 'all',
        defaultValues: {
            asmaY_Id: 0,
            asmcL_Id: 0,
            asmS_Id: 0,
            reporttype: 'indi',
            displayAttendance: true
        } as any
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
    const selectedExams = useWatch({ control, name: 'emE_Id' });

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
                if (!data || (Array.isArray(data) && data.length === 0)) {
                    toast.info('No classes mapped to this academic year');
                }
                setClasses(Array.isArray(data) ? data : []);
                setValue('asmcL_Id', 0);
                setValue('asmS_Id', 0);
                setValue('emE_Id', []);
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
                if (!data || (Array.isArray(data) && data.length === 0)) {
                    toast.info('No sections found');
                }
                setSections(Array.isArray(data) ? data : []);
                setValue('asmS_Id', 0);
                setValue('emE_Id', []);
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
                const payload: any = {
                    asmaY_Id: selectedYear,
                    asmcL_Id: selectedClass,
                    asmS_Id: selectedSection,
                    reporttype: 'indi'
                };
                setLoadingExams(true);
                const { data } = await getExamsStjames(payload);
                if (!data || (Array.isArray(data) && data.length === 0)) {
                    toast.info('No exams found');
                }
                setExams(Array.isArray(data) ? data : []);
                setValue('emE_Id', []);
            } catch {
                toast.error('Failed to load exams');
            } finally {
                setLoadingExams(false);
            }
        })();
    }, [selectedYear, selectedClass, selectedSection, setValue]);

    // on submit
    const onSubmit = async (data: StJamesIX_XReportSchema) => {
        const payload: any = {
            asmaY_Id: data.asmaY_Id,
            asmcL_Id: data.asmcL_Id,
            asmS_Id: data.asmS_Id,
            examlist: data.emE_Id.map((e: any) => {
                const exam = exams.find((x) => x.emE_Id === e.emE_Id);
                return {
                    emE_Id: e.emE_Id,
                    emE_ExamName: exam?.emE_ExamName || ''
                };
            }),
            reporttype: data.reporttype,
            displayAttendance: data.displayAttendance
        };
        if (onSuccess) {
            console.log('reportpayload', payload);
            await onSuccess(payload);
        }
    };

    return (
        <div className='rounded-lg border bg-card text-card-foreground shadow-sm'>
            <CollapsibleContent className='p-6'>
                <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6' noValidate>
                        <div>
                            <Controller
                                control={control}
                                name='reporttype'
                                render={({ field, fieldState }) => (
                                    <div className='flex h-8 flex-1 justify-center gap-2 rounded-md bg-gray-100 sm:flex-row sm:items-center '>
                                        <RadioGroup onValueChange={field.onChange} value={field.value} className='flex flex-row space-x-4'>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='indi' id='r1' />
                                                <Label htmlFor='r1' className='font-normal'>
                                                    Individual
                                                </Label>
                                            </div>
                                            {/* <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='groupwise' id='r2' />
                                                <Label htmlFor='r2' className='font-normal'>
                                                    Promotion
                                                </Label>
                                            </div> */}
                                        </RadioGroup>
                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                    </div>
                                )}
                            />
                        </div>
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
                                <div className='flex items-center gap-2'>
                                    <Controller
                                        control={control}
                                        name='displayAttendance'
                                        render={({ field }) => (
                                            <Checkbox id='displayAttendance' checked={field.value} onCheckedChange={field.onChange} />
                                        )}
                                    />
                                    <Label htmlFor='displayAttendance'>Display Attendance</Label>
                                </div>
                            </div>

                            <div className='space-y-6'>
                                <div className='flex flex-col gap-2 sm:flex-row sm:items-start'>
                                    <Label className='flex items-center gap-2 font-medium text-sm sm:w-32'>
                                        <Checkbox
                                            checked={selectedExams?.length === exams.length && exams.length > 0}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setValue(
                                                        'emE_Id',
                                                        exams.map((e) => ({ emE_Id: e.emE_Id })),
                                                        { shouldValidate: true }
                                                    );
                                                } else {
                                                    setValue('emE_Id', [], { shouldValidate: true });
                                                }
                                            }}
                                        />
                                        Exams <span className='text-red-500'>*</span>
                                    </Label>
                                    <div className='flex-1'>
                                        <Controller
                                            control={control}
                                            name='emE_Id'
                                            render={({ field, fieldState }) => (
                                                <div className='flex flex-col gap-2'>
                                                    <div className='flex max-h-[200px] flex-col gap-3 overflow-y-auto rounded-md border p-4'>
                                                        {loadingExams ? (
                                                            <span className='text-muted-foreground text-sm'>Exams are loading...</span>
                                                        ) : exams.length === 0 ? (
                                                            <span className='text-muted-foreground text-sm'>No Exams found</span>
                                                        ) : (
                                                            <div className='flex flex-col gap-3'>
                                                                {exams.map((e) => {
                                                                    const isChecked =
                                                                        field.value?.some((val: any) => val.emE_Id === e.emE_Id) || false;
                                                                    return (
                                                                        <div key={e.emE_Id} className='flex items-center space-x-2'>
                                                                            <Checkbox
                                                                                id={`exam-${e.emE_Id}`}
                                                                                checked={isChecked}
                                                                                onCheckedChange={(checked) => {
                                                                                    if (checked) {
                                                                                        field.onChange([
                                                                                            ...(field.value || []),
                                                                                            { emE_Id: e.emE_Id }
                                                                                        ]);
                                                                                    } else {
                                                                                        field.onChange(
                                                                                            (field.value || []).filter(
                                                                                                (val: any) => val.emE_Id !== e.emE_Id
                                                                                            )
                                                                                        );
                                                                                    }
                                                                                }}
                                                                            />
                                                                            <Label
                                                                                htmlFor={`exam-${e.emE_Id}`}
                                                                                className='font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                                                                                {e.emE_ExamName}
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

                        <div className='flex justify-center gap-3'>
                            <Button
                                type='submit'
                                isLoading={isSubmitting}
                                disabled={isSubmitting || selectedExams?.length === 0}
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
            </CollapsibleContent>
        </div>
    );
}
