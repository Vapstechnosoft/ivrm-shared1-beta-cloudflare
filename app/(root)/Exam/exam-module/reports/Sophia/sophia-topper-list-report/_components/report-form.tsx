'use client';

import { Button } from '@/components/ui/button';
import { CollapsibleContent } from '@/components/ui/collapsible';
import { FormError, Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import { type SophiaTopperListReportSchema, sophiaTopperListReportSchema } from '@/schemas/exam/exam-module/reports';
import { getCategoryDropDownByAcademicYearlist } from '@/server/exam/exam-module/exam-mapping/exam-subject-group-mapping';
import {
    getExamsDropDownByAcademicYearandClassandSectionlist,
    getSectionsDropDownByAcademicYearandClasslist
} from '@/server/exam/exam-module/reports/cumulative-report';
import { getClassDropDownByYearCategoryList } from '@/server/exam/exam-module/reports/vvehpc_exam-report-card';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

export default function SophiaTopperListReportForm({
    onSuccess
}: {
    onSuccess?: (payload: any) => Promise<void> | void;
}) {
    const methods = useForm<SophiaTopperListReportSchema>({
        resolver: zodResolver(sophiaTopperListReportSchema),
        mode: 'all',
        defaultValues: {
            asmaY_Id: 0,
            emcA_Id: 0,
            asmcL_Id: 0,
            emE_Id: 0,
            asmS_Id: 0
        } as any
    });

    const { control, handleSubmit, reset, setValue, formState } = methods;
    const { isSubmitting } = formState;

    const [academicYears, setAcademicYears] = useState<{ asmaY_Id: number; asmaY_Year: string }[]>([]);
    const [categories, setCategories] = useState<{ emcA_Id: number; emcA_CategoryName: string }[]>([]);
    const [classes, setClasses] = useState<{ asmcL_Id: number; asmcL_ClassName: string }[]>([]);
    const [sections, setSections] = useState<{ asmS_Id: number; asmC_SectionName: string }[]>([]);
    const [exams, setExams] = useState<{ emE_Id: number; emE_ExamName: string }[]>([]);

    const { data: academicData, error: academicError, isLoading: academicYearLoading } = useAcademicYearDropdown();

    const selectedYear = useWatch({ control, name: 'asmaY_Id' });
    const selectedCategory = useWatch({ control, name: 'emcA_Id' });
    const selectedClass = useWatch({ control, name: 'asmcL_Id' });
    const selectedSection = useWatch({ control, name: 'asmS_Id' });

    const [loadingCategories, setLoadingCategories] = useState(false);
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

    // set categories
    useEffect(() => {
        if (!selectedYear) return;
        (async () => {
            try {
                setLoadingCategories(true);
                const { data } = await getCategoryDropDownByAcademicYearlist(selectedYear);
                if (!data || (Array.isArray(data) && data.length === 0)) {
                    toast.info('No categories mapped to this academic year');
                }
                setCategories(Array.isArray(data) ? data : []);
                setValue('emcA_Id', 0);
            } catch {
                toast.error('Failed to load categories');
            } finally {
                setLoadingCategories(false);
            }
        })();
    }, [selectedYear, setValue]);

    // set classes
    useEffect(() => {
        if (!selectedYear || !selectedCategory) {
            setClasses([]);
            setValue('asmcL_Id', 0);
            return;
        }
        (async () => {
            try {
                setLoadingClasses(true);
                const data = await getClassDropDownByYearCategoryList(selectedYear, selectedCategory);
                if (!data || (Array.isArray(data) && data.length === 0)) {
                    toast.info('No classes mapped to this category');
                }
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
    }, [selectedYear, selectedCategory, setValue]);

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
                setValue('emE_Id', 0);
                setExams([]);
            } catch {
                toast.error('Failed to load sections');
            } finally {
                setLoadingSections(false);
            }
        })();
    }, [selectedYear, selectedClass, setValue]);

    // set exams
    useEffect(() => {
        if (!selectedYear || !selectedClass || !selectedSection) return;
        (async () => {
            try {
                setLoadingExams(true);
                const { data } = await getExamsDropDownByAcademicYearandClassandSectionlist(selectedYear, selectedClass, selectedSection);
                if (!data || (Array.isArray(data) && data.length === 0)) {
                    toast.info('No exams found');
                }
                setExams(Array.isArray(data) ? (data as any) : []);
                setValue('emE_Id', 0);
            } catch {
                toast.error('Failed to load exams');
            } finally {
                setLoadingExams(false);
            }
        })();
    }, [selectedYear, selectedClass, selectedSection, setValue]);

    // on submit
    const onSubmit = async (data: SophiaTopperListReportSchema) => {
        const payload: any = {
            asmaY_Id: data.asmaY_Id,
            emcA_Id: data.emcA_Id,
            asmcL_Id: data.asmcL_Id,
            emE_Id: data.emE_Id,
            asmS_Id: data.asmS_Id
        };
        if (onSuccess) {
            await onSuccess(payload);
        }
    };

    return (
        <div className='rounded-lg border bg-card text-card-foreground shadow-sm'>
            <CollapsibleContent className='p-6'>
                <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6' noValidate>
                        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2'>
                            {/* Academic Year */}
                            <Controller
                                control={control}
                                name='asmaY_Id'
                                render={({ field, fieldState }) => (
                                    <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                                        <Label className='font-medium text-sm sm:w-32'>
                                            Academic Year : <span className='text-red-500'>*</span>
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

                            {/* Category */}
                            <Controller
                                control={control}
                                name='emcA_Id'
                                render={({ field, fieldState }) => (
                                    <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                                        <Label className='font-medium text-sm sm:w-32'>
                                            Category : <span className='text-red-500'>*</span>
                                        </Label>
                                        <div className='flex-1'>
                                            <Select
                                                key={field.value}
                                                onValueChange={(v) => field.onChange(Number(v))}
                                                value={field.value ? String(field.value) : ''}>
                                                <SelectTrigger className='w-full'>
                                                    <SelectValue placeholder='Select Category' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {loadingCategories ? (
                                                        <SelectItem value='0' disabled>
                                                            Categories are loading...
                                                        </SelectItem>
                                                    ) : categories.length === 0 ? (
                                                        <SelectItem value='0' disabled>
                                                            No Categories found
                                                        </SelectItem>
                                                    ) : (
                                                        categories.map((c) => (
                                                            <SelectItem key={c.emcA_Id} value={String(c.emcA_Id)}>
                                                                {c.emcA_CategoryName}
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

                            {/* Class Name */}
                            <Controller
                                control={control}
                                name='asmcL_Id'
                                render={({ field, fieldState }) => (
                                    <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                                        <Label className='font-medium text-sm sm:w-32'>
                                            Class Name: <span className='text-red-500'>*</span>
                                        </Label>
                                        <div className='flex-1'>
                                            <Select
                                                key={field.value}
                                                onValueChange={(v) => field.onChange(Number(v))}
                                                value={field.value ? String(field.value) : ''}>
                                                <SelectTrigger className='w-full'>
                                                    <SelectValue placeholder='Select class' />
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

                            {/* Exam Name */}
                            <Controller
                                control={control}
                                name='emE_Id'
                                render={({ field, fieldState }) => (
                                    <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                                        <Label className='font-medium text-sm sm:w-32'>
                                            Exam Name : <span className='text-red-500'>*</span>
                                        </Label>
                                        <div className='flex-1'>
                                            <Select
                                                key={field.value}
                                                onValueChange={(v) => field.onChange(Number(v))}
                                                value={field.value ? String(field.value) : ''}>
                                                <SelectTrigger className='w-full'>
                                                    <SelectValue placeholder='Select Exam Name' />
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

                            {/* Section Name */}
                            <Controller
                                control={control}
                                name='asmS_Id'
                                render={({ field, fieldState }) => (
                                    <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                                        <Label className='font-medium text-sm sm:w-32'>
                                            Section Name : <span className='text-red-500'>*</span>
                                        </Label>
                                        <div className='flex-1'>
                                            <Select
                                                key={field.value}
                                                onValueChange={(v) => field.onChange(Number(v))}
                                                value={field.value ? String(field.value) : ''}>
                                                <SelectTrigger className='w-full'>
                                                    <SelectValue placeholder='Select Section Name' />
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
                        </div>

                        <hr className='my-6 border-gray-300' />

                        <div className='flex justify-center gap-3'>
                            <Button type='submit' isLoading={isSubmitting} disabled={isSubmitting} className='min-w-[140px]'>
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
