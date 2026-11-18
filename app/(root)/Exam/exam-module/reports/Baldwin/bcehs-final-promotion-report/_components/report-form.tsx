'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CustomMultiSelectBox } from '@/components/ui/custom-multiselect';
import { FormError, Label } from '@/components/ui/extension/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import {
    getBCEHSFinalPromotionReport,
    getClassDropDownByAcademicYearlist,
    getSectionsDropDownByAcademicYearandClasslist
} from '@/server/exam/exam-module/reports/Baldwin/bcehs-final-promotion-report';
import { getStudentsDropDownByAcademicYearandClassandSectionlist } from '@/server/exam/exam-module/reports/cumulative-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

// ─── Zod Schema ───────────────────────────────────────────────────────────────
const bcehsSchema = z.object({
    ASMAY_Id: z.string().min(1, 'Academic Year is required'),
    ASMCL_Id: z.string().min(1, 'Class is required'),
    ASMS_Id: z.string().min(1, 'Section is required'),
    workingDays: z.string().optional(),
    presentDays: z.string().optional(),
    dontShowRank: z.boolean().default(true),
    selectedStudents: z.array(z.string()).min(1, 'Please select at least one student')
});

type BCEHSFormValues = z.infer<typeof bcehsSchema>;

interface ReportFormProps {
    onReportGenerated: (data: any, params: any) => void;
    onReset: () => void;
}

export const ReportForm = ({ onReportGenerated, onReset }: ReportFormProps) => {
    const { data: academicData, isLoading: academicYearLoading } = useAcademicYearDropdown();
    const academicYears = academicData?.data ?? [];

    const [classes, setClasses] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [allSelected, setAllSelected] = useState(false);

    const [loadingClasses, setLoadingClasses] = useState(false);
    const [loadingSections, setLoadingSections] = useState(false);
    const [loadingSection, setLoadingSection] = useState(false);

    const methods = useForm<BCEHSFormValues>({
        resolver: zodResolver(bcehsSchema),
        defaultValues: {
            ASMAY_Id: '',
            ASMCL_Id: '',
            ASMS_Id: '',
            workingDays: '',
            presentDays: '',
            dontShowRank: true,
            selectedStudents: []
        }
    });

    const { control, handleSubmit, setValue, reset, formState } = methods;
    const { isSubmitting } = formState;

    const watchYear = useWatch({ control, name: 'ASMAY_Id' });
    const watchClass = useWatch({ control, name: 'ASMCL_Id' });
    const watchSection = useWatch({ control, name: 'ASMS_Id' });

    // ── Load classes on year change ──────────────────────────────────────────
    useEffect(() => {
        if (!watchYear) return;
        (async () => {
            try {
                setLoadingClasses(true);
                const res = await getClassDropDownByAcademicYearlist(Number(watchYear));
                setClasses(Array.isArray(res.data) ? res.data : (res as any) || []);
                setValue('ASMCL_Id', '');
                setValue('ASMS_Id', '');
                setValue('selectedStudents', []);
                setSections([]);
                setStudents([]);
                setAllSelected(false);
            } catch (err) {
                console.error(err);
                toast.error('Failed to load classes');
            } finally {
                setLoadingClasses(false);
            }
        })();
    }, [watchYear, setValue]);

    // ── Load sections on class change ────────────────────────────────────────
    useEffect(() => {
        if (!watchYear || !watchClass) return;
        (async () => {
            try {
                setLoadingSections(true);
                const res = await getSectionsDropDownByAcademicYearandClasslist(Number(watchYear), Number(watchClass));
                setSections(Array.isArray(res.data) ? res.data : (res as any) || []);
                setValue('ASMS_Id', '');
                setValue('selectedStudents', []);
                setStudents([]);
                setAllSelected(false);
            } catch (err) {
                console.error(err);
                toast.error('Failed to load sections');
            } finally {
                setLoadingSections(false);
            }
        })();
    }, [watchYear, watchClass, setValue]);

    // ── Load students on section change ──────────────────────────────
    useEffect(() => {
        if (!watchYear || !watchClass || !watchSection) return;
        (async () => {
            try {
                const { data } = await getStudentsDropDownByAcademicYearandClassandSectionlist(
                    Number(watchYear),
                    Number(watchClass),
                    Number(watchSection)
                );
                const valid = Array.isArray(data) ? data.filter((s): s is any => !!s?.amsT_Id) : [];

                // Map to consistent format if needed, but the cumulative report logic returns objects with amsT_Id and studentName/amsT_FirstName
                // We'll map them to a structure suitable for the display
                const mappedStudents = valid.map((s) => ({
                    amsT_Id: s.amsT_Id,
                    amsT_AdmNo: s.amsT_AdmNo,
                    studentName: s.studentName || `${s.amsT_FirstName || ''} ${s.amsT_MiddleName || ''} ${s.amsT_LastName || ''}`.trim()
                }));

                setStudents(mappedStudents);
                setValue('selectedStudents', []);
            } catch {
                toast.error('Failed to load students');
            } finally {
            }
        })();
    }, [watchYear, watchClass, watchSection, setValue]);

    const handleSelectAll = (checked: boolean) => {
        if (checked && students.length) {
            setValue(
                'selectedStudents',
                students.map((s) => String(s.amsT_Id))
            );
            setAllSelected(true);
        } else {
            setValue('selectedStudents', []);
            setAllSelected(false);
        }
    };

    const onSubmit = async (formData: BCEHSFormValues) => {
        onReset();
        const payload = {
            ASMAY_Id: Number(formData.ASMAY_Id),
            ASMCL_Id: Number(formData.ASMCL_Id),
            ASMS_Id: Number(formData.ASMS_Id),
            // Working: formData.workingDays,
            // Workingtwo: formData.presentDays,
            // dontshowrank: formData.dontShowRank,
            Temp_AmstIds: formData.selectedStudents.map((id) => ({ amsT_Id: Number(id) }))
        };
        console.log('getBCEHSFinalPromotionReport payload', payload);

        try {
            const response = await getBCEHSFinalPromotionReport(payload);
            console.log('response', response);
            if (response && response.success && response.data) {
                const yearName = academicYears.find((y: any) => String(y.asmaY_Id) === formData.ASMAY_Id)?.asmaY_Year || '';
                const className = classes.find((c: any) => String(c.asmcL_Id) === formData.ASMCL_Id)?.asmcL_ClassName || '';
                const sectionName = sections.find((s: any) => String(s.asmS_Id) === formData.ASMS_Id)?.asmC_SectionName || '';

                onReportGenerated(response.data, {
                    ...formData,
                    yearName,
                    className,
                    sectionName
                });
                toast.success('Report generated successfully');
            } else {
                toast.error(response?.message || 'No data found for the selected criteria');
            }
        } catch (err) {
            console.error(err);
            toast.error('Error generating report');
        }
    };

    const handleClear = () => {
        reset();
        setClasses([]);
        setSections([]);
        setStudents([]);
        setAllSelected(false);
        onReportGenerated(null, null);
    };

    return (
        <div className='mx-auto w-full rounded-lg border border-gray-200 bg-white p-4 shadow-md'>
            <div className='mb-4 flex items-center justify-between border-b pb-2'>
                <h3 className='font-semibold text-gray-800 text-lg'>Report Filters</h3>
            </div>

            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                        {/* ── Left Column ───────────────────────────────── */}
                        <div className='space-y-4'>
                            <div className='space-y-2'>
                                <Label>
                                    Academic Year <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    control={control}
                                    name='ASMAY_Id'
                                    render={({ field, fieldState }) => (
                                        <>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Select Academic Year' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {academicYearLoading ? (
                                                        <SelectItem value='0' disabled>
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
                                        </>
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
                                        <>
                                            <Select onValueChange={field.onChange} value={field.value} disabled={!watchYear}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Select Class' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {loadingClasses ? (
                                                        <SelectItem value='0' disabled>
                                                            Loading...
                                                        </SelectItem>
                                                    ) : (
                                                        classes.map((c: any) => (
                                                            <SelectItem key={c.asmcL_Id} value={String(c.asmcL_Id)}>
                                                                {c.asmcL_ClassName}
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

                            <div className='space-y-2'>
                                <Label>
                                    Section <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    control={control}
                                    name='ASMS_Id'
                                    render={({ field, fieldState }) => (
                                        <>
                                            <Select onValueChange={field.onChange} value={field.value} disabled={!watchClass}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Select Section' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {loadingSections ? (
                                                        <SelectItem value='0' disabled>
                                                            Loading...
                                                        </SelectItem>
                                                    ) : (
                                                        sections.map((s: any) => (
                                                            <SelectItem key={s.asmS_Id} value={String(s.asmS_Id)}>
                                                                {s.asmC_SectionName}
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

                            <div className='grid grid-cols-2 gap-4'>
                                <div className='space-y-2'>
                                    <Label>Working Days</Label>
                                    <Controller
                                        control={control}
                                        name='workingDays'
                                        render={({ field }) => <Input {...field} placeholder='Working Days' />}
                                    />
                                </div>
                                <div className='space-y-2'>
                                    <Label>Present Days</Label>
                                    <Controller
                                        control={control}
                                        name='presentDays'
                                        render={({ field }) => <Input {...field} placeholder='Present Days' />}
                                    />
                                </div>
                            </div>

                            <div className='flex items-center space-x-2 pt-2'>
                                <Controller
                                    control={control}
                                    name='dontShowRank'
                                    render={({ field }) => (
                                        <Checkbox id='dontShowRank' checked={field.value} onCheckedChange={field.onChange} />
                                    )}
                                />
                                <Label htmlFor='dontShowRank' className='cursor-pointer'>
                                    Don't Show Rank
                                </Label>
                            </div>
                        </div>

                        {/* ── Right Column: Multi-select ────────────────── */}
                        <div className='space-y-4'>
                            <div className='flex flex-col gap-2'>
                                <div className='flex items-center gap-2'>
                                    <Checkbox checked={allSelected} onCheckedChange={handleSelectAll} id='selectAll' />
                                    <Label htmlFor='selectAll' className='font-medium'>
                                        Student <span className='text-red-500'>*</span>
                                    </Label>
                                </div>

                                <Controller
                                    control={control}
                                    name='selectedStudents'
                                    render={({ field, fieldState }) => (
                                        <div className='flex-1'>
                                            <CustomMultiSelectBox
                                                options={students.map((s) => ({
                                                    label: `${s.studentName} / ${s.amsT_AdmNo}`,
                                                    value: String(s.amsT_Id)
                                                }))}
                                                onChange={(vals) => {
                                                    field.onChange(vals);
                                                    setAllSelected(vals.length === students.length && students.length > 0);
                                                }}
                                                value={field.value}
                                                placeholder={loadingSection ? 'Loading students...' : 'Select Students'}
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

                    <div className='mt-8 flex justify-center gap-4 border-t pt-6'>
                        <Button type='submit' disabled={isSubmitting} className='min-w-[100px]'>
                            {isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                            Report
                        </Button>
                        <Button type='button' variant='destructive' onClick={handleClear} disabled={isSubmitting} className='min-w-[100px]'>
                            Cancel
                        </Button>
                    </div>
                </form>
            </FormProvider>
        </div>
    );
};
