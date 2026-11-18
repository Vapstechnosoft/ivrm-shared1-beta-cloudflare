'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import {
    type SlabWiseExamReportValues,
    slabWiseExamReportSchema
} from '@/schemas/exam/exam-module/reports/vidhya-vikas/slab-wise-exam-report.schema';
import {
    getClassDropDownByAcademicYearlist,
    getExamsDropDownByAcademicYearandClassandSectionlist,
    getSectionsDropDownByAcademicYearandClasslist
} from '@/server/exam/exam-module/reports/cumulative-report';
import { getSubjects } from '@/server/exam/exam-module/reports/slab-wise-exam-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileText, Printer, RefreshCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

export default function SlabWiseExamReportForm({
    onSuccess,
    onPrint
}: {
    onSuccess: (data: SlabWiseExamReportValues) => Promise<void>;
    onPrint: () => void;
}) {
    const methods = useForm<SlabWiseExamReportValues>({
        resolver: zodResolver(slabWiseExamReportSchema),
        defaultValues: {
            asmaY_Id: 0,
            asmcL_Id: 0,
            asmS_Id: 0,
            emE_Id: 0,
            ISMS_Id: 0,
            frommarks: 0,
            tomarks: 0,
            reporttype: 'Marks'
        }
    });

    const {
        control,
        handleSubmit,
        setValue,
        reset,
        formState: { isSubmitting }
    } = methods;

    const [years, setYears] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [exams, setExams] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);

    const [loadingClasses, setLoadingClasses] = useState(false);
    const [loadingSections, setLoadingSections] = useState(false);
    const [loadingExams, setLoadingExams] = useState(false);
    const [loadingSubjects, setLoadingSubjects] = useState(false);

    const { data: academicData, isLoading: academicYearLoading } = useAcademicYearDropdown();

    const watchYear = useWatch({ control, name: 'asmaY_Id' });
    const watchClass = useWatch({ control, name: 'asmcL_Id' });
    const watchSection = useWatch({ control, name: 'asmS_Id' });
    const watchExam = useWatch({ control, name: 'emE_Id' });
    const watchReportType = useWatch({ control, name: 'reporttype' });

    // Load Academic Years from hook
    useEffect(() => {
        if (academicData?.data) {
            setYears(academicData.data);
        }
    }, [academicData]);

    // Chained Dropdown: Load Classes when Year changes
    useEffect(() => {
        if (watchYear) {
            (async () => {
                try {
                    setLoadingClasses(true);
                    const response = await getClassDropDownByAcademicYearlist(watchYear);
                    if (response.success && response.data) {
                        setClasses(response.data);
                        setValue('asmcL_Id', 0);
                        setValue('asmS_Id', 0);
                        setValue('emE_Id', 0);
                    }
                } catch (error) {
                    toast.error('Failed to load classes');
                } finally {
                    setLoadingClasses(false);
                }
            })();
        } else {
            setClasses([]);
        }
    }, [watchYear, setValue]);

    // Chained Dropdown: Load Sections when Class changes
    useEffect(() => {
        if (watchYear && watchClass) {
            (async () => {
                try {
                    setLoadingSections(true);
                    const response = await getSectionsDropDownByAcademicYearandClasslist(watchYear, watchClass);
                    if (response.success && response.data) {
                        setSections(response.data);
                        setValue('asmS_Id', 0);
                        setValue('emE_Id', 0);
                    }
                } catch (error) {
                    toast.error('Failed to load sections');
                } finally {
                    setLoadingSections(false);
                }
            })();
        } else {
            setSections([]);
        }
    }, [watchYear, watchClass, setValue]);

    // Chained Dropdown: Load Exams when Section changes
    useEffect(() => {
        if (watchYear && watchClass && watchSection) {
            (async () => {
                try {
                    setLoadingExams(true);
                    const response = await getExamsDropDownByAcademicYearandClassandSectionlist(watchYear, watchClass, watchSection);
                    if (response.success && response.data) {
                        setExams(response.data);
                        setValue('emE_Id', 0);
                    }
                } catch (error) {
                    toast.error('Failed to load exams');
                } finally {
                    setLoadingExams(false);
                }
            })();
        } else {
            setExams([]);
        }
    }, [watchYear, watchClass, watchSection, setValue]);

    // Load subjects when Year, Class, Section, or Exam changes
    useEffect(() => {
        if (watchYear && watchClass && watchSection && watchExam) {
            (async () => {
                try {
                    setLoadingSubjects(true);
                    const payload = {
                        ASMAY_ID: watchYear,
                        ASMCL_ID: watchClass,
                        ASMS_ID: watchSection,
                        EME_ID: watchExam
                    };
                    const response = await getSubjects(payload);
                    if (response.success && response.data) {
                        setSubjects(response.data.subjectlist || []);
                    }
                } catch (error) {
                    toast.error('Failed to load subjects');
                } finally {
                    setLoadingSubjects(false);
                }
            })();
        } else {
            setSubjects([]);
        }
    }, [watchYear, watchClass, watchSection, watchExam]);

    const onSubmit = async (data: SlabWiseExamReportValues) => {
        await onSuccess(data);
    };

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='rounded-lg border bg-card p-6 shadow-sm'>
                    <div className='mb-6 flex items-center justify-between border-b pb-4'>
                        <h3 className='font-semibold text-lg'>Slab Wise Exam Marks Report</h3>
                    </div>

                    <div className='mb-6 flex justify-center space-x-8 rounded-md bg-muted/50 p-4'>
                        <Controller
                            control={control}
                            name='reporttype'
                            render={({ field }) => (
                                <RadioGroup onValueChange={field.onChange} value={field.value} className='flex items-center space-x-6'>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='Marks' id='marks' />
                                        <Label htmlFor='marks' className='cursor-pointer'>
                                            Between Marks
                                        </Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='Percentage' id='percentage' />
                                        <Label htmlFor='percentage' className='cursor-pointer'>
                                            Between Percentage
                                        </Label>
                                    </div>
                                </RadioGroup>
                            )}
                        />
                    </div>

                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                        <div className='space-y-4'>
                            <Controller
                                control={control}
                                name='asmaY_Id'
                                render={({ field, fieldState }) => (
                                    <div className='space-y-2'>
                                        <Label>
                                            Academic Year <span className='text-destructive'>*</span>
                                        </Label>
                                        <Select
                                            onValueChange={(v) => field.onChange(Number(v))}
                                            value={field.value ? String(field.value) : undefined}
                                            disabled={academicYearLoading}>
                                            <SelectTrigger>
                                                <SelectValue placeholder={academicYearLoading ? 'Loading...' : 'Select Academic Year'} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {years.map((y) => (
                                                    <SelectItem key={y.asmaY_Id} value={String(y.asmaY_Id)}>
                                                        {y.asmaY_Year}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                    </div>
                                )}
                            />

                            <Controller
                                control={control}
                                name='asmS_Id'
                                render={({ field, fieldState }) => (
                                    <div className='space-y-2'>
                                        <Label>
                                            Section <span className='text-destructive'>*</span>
                                        </Label>
                                        <Select
                                            onValueChange={(v) => field.onChange(Number(v))}
                                            value={field.value ? String(field.value) : undefined}
                                            disabled={loadingSections}>
                                            <SelectTrigger>
                                                <SelectValue placeholder={loadingSections ? 'Loading Sections...' : 'Select Section'} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {sections.map((s) => (
                                                    <SelectItem key={s.asmS_Id} value={String(s.asmS_Id)}>
                                                        {s.asmC_SectionName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                    </div>
                                )}
                            />
                        </div>

                        <div className='space-y-4'>
                            <Controller
                                control={control}
                                name='asmcL_Id'
                                render={({ field, fieldState }) => (
                                    <div className='space-y-2'>
                                        <Label>
                                            Class <span className='text-destructive'>*</span>
                                        </Label>
                                        <Select
                                            onValueChange={(v) => field.onChange(Number(v))}
                                            value={field.value ? String(field.value) : undefined}
                                            disabled={loadingClasses}>
                                            <SelectTrigger>
                                                <SelectValue placeholder={loadingClasses ? 'Loading Classes...' : 'Select Class'} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {classes.map((c) => (
                                                    <SelectItem key={c.asmcL_Id} value={String(c.asmcL_Id)}>
                                                        {c.asmcL_ClassName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                    </div>
                                )}
                            />

                            <Controller
                                control={control}
                                name='emE_Id'
                                render={({ field, fieldState }) => (
                                    <div className='space-y-2'>
                                        <Label>
                                            Exam Name <span className='text-destructive'>*</span>
                                        </Label>
                                        <Select
                                            onValueChange={(v) => field.onChange(Number(v))}
                                            value={field.value ? String(field.value) : undefined}
                                            disabled={loadingExams}>
                                            <SelectTrigger>
                                                <SelectValue placeholder={loadingExams ? 'Loading Exams...' : 'Select Exam Name'} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {exams.map((e) => (
                                                    <SelectItem key={e.emE_Id} value={String(e.emE_Id)}>
                                                        {e.emE_ExamName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                    </div>
                                )}
                            />
                        </div>
                    </div>

                    <div className='mt-6 grid grid-cols-1 gap-6 md:grid-cols-2'>
                        {watchReportType === 'Marks' && (
                            <Controller
                                control={control}
                                name='ISMS_Id'
                                render={({ field, fieldState }) => (
                                    <div className='space-y-2'>
                                        <Label>
                                            Select Subject <span className='text-destructive'>*</span>
                                        </Label>
                                        <Select
                                            onValueChange={(v) => field.onChange(Number(v))}
                                            value={field.value ? String(field.value) : undefined}
                                            disabled={loadingSubjects}>
                                            <SelectTrigger>
                                                <SelectValue placeholder={loadingSubjects ? 'Loading subjects...' : 'Select Subject'} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {subjects.map((s) => (
                                                    <SelectItem key={s.ISMS_Id} value={String(s.ISMS_Id)}>
                                                        {s.ISMS_SubjectName} - [{s.ESTMPS_MaxMarks} Mar]
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                    </div>
                                )}
                            />
                        )}

                        <div className='grid grid-cols-2 gap-4'>
                            <Controller
                                control={control}
                                name='frommarks'
                                render={({ field, fieldState }) => (
                                    <div className='space-y-2'>
                                        <Label>
                                            {watchReportType === 'Marks' ? 'From Marks' : 'From %'}{' '}
                                            <span className='text-destructive'>*</span>
                                        </Label>
                                        <Input
                                            type='number'
                                            placeholder={watchReportType === 'Marks' ? 'From Marks' : 'From %'}
                                            {...field}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                        />
                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                    </div>
                                )}
                            />
                            <Controller
                                control={control}
                                name='tomarks'
                                render={({ field, fieldState }) => (
                                    <div className='space-y-2'>
                                        <Label>
                                            {watchReportType === 'Marks' ? 'To Marks' : 'To %'} <span className='text-destructive'>*</span>
                                        </Label>
                                        <Input
                                            type='number'
                                            placeholder={watchReportType === 'Marks' ? 'To Marks' : 'To %'}
                                            {...field}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                        />
                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                    </div>
                                )}
                            />
                        </div>
                    </div>

                    <div className='mt-8 flex justify-center space-x-4 border-t pt-6'>
                        <Button type='submit' disabled={isSubmitting} className='w-32'>
                            <FileText className='mr-2 h-4 w-4' />
                            Report
                        </Button>
                        <Button type='button' variant='secondary' onClick={() => reset()} className='w-32'>
                            <RefreshCcw className='mr-2 h-4 w-4' />
                            Cancel
                        </Button>
                        <Button type='button' variant='outline' onClick={onPrint} className='w-32'>
                            <Printer className='mr-2 h-4 w-4' />
                            Print
                        </Button>
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}
