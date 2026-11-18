'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CustomMultiSelectBox } from '@/components/ui/custom-multiselect';
import { FormError, Label } from '@/components/ui/extension/field';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import {
    getClassesByAcademicYear,
    getExamsAndStudentsBySection,
    getHallTicketReport,
    getSectionsByYearAndClass
} from '@/server/exam/exam-module/reports/Calcatta/hall-ticket-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

// ─── Zod Schema ───────────────────────────────────────────────────────────────
const hallTicketSchema = z.object({
    reportFormat: z.enum(['format1', 'format2', 'format3'], {
        required_error: 'Please select a report format'
    }),
    ASMAY_Id: z.string().min(1, 'Academic Year is required'),
    ASMCL_Id: z.string().min(1, 'Class is required'),
    ASMS_Id: z.string().min(1, 'Section is required'),
    EME_Id: z.string().min(1, 'Exam is required'),
    selectedStudents: z.array(z.string()).min(1, 'Please select at least one student')
});

type HallTicketFormValues = z.infer<typeof hallTicketSchema>;

interface ReportFormProps {
    onReportGenerated: (data: any, params: any) => void;
    onReset: () => void;
}

export const ReportForm = ({ onReportGenerated, onReset }: ReportFormProps) => {
    const { data: academicData, isLoading: academicYearLoading } = useAcademicYearDropdown();
    const academicYears = academicData?.data ?? [];

    const [classes, setClasses] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [exams, setExams] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [allSelected, setAllSelected] = useState(false);

    const [loadingClasses, setLoadingClasses] = useState(false);
    const [loadingSections, setLoadingSections] = useState(false);
    const [loadingSection, setLoadingSection] = useState(false);

    const methods = useForm<HallTicketFormValues>({
        resolver: zodResolver(hallTicketSchema),
        defaultValues: {
            reportFormat: 'format1',
            ASMAY_Id: '',
            ASMCL_Id: '',
            ASMS_Id: '',
            EME_Id: '',
            selectedStudents: []
        }
    });

    const { control, handleSubmit, setValue, reset, formState } = methods;
    const { isSubmitting } = formState;

    const watchYear = useWatch({ control, name: 'ASMAY_Id' });
    const watchClass = useWatch({ control, name: 'ASMCL_Id' });
    const watchSection = useWatch({ control, name: 'ASMS_Id' });
    const watchFormat = useWatch({ control, name: 'reportFormat' });

    // ── Reset report when format changes ─────────────────────────────────────
    useEffect(() => {
        onReset();
    }, [watchFormat, onReset]);

    // ── Load classes on year change ──────────────────────────────────────────
    useEffect(() => {
        if (!watchYear) return;
        (async () => {
            try {
                setLoadingClasses(true);
                const res = await getClassesByAcademicYear(Number(watchYear));
                setClasses(Array.isArray(res.data) ? res.data : []);
                setValue('ASMCL_Id', '');
                setValue('ASMS_Id', '');
                setValue('EME_Id', '');
                setValue('selectedStudents', []);
                setSections([]);
                setExams([]);
                setStudents([]);
                setAllSelected(false);
            } catch {
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
                const res = await getSectionsByYearAndClass(Number(watchYear), Number(watchClass));
                setSections(Array.isArray(res.data) ? res.data : []);
                setValue('ASMS_Id', '');
                setValue('EME_Id', '');
                setValue('selectedStudents', []);
                setExams([]);
                setStudents([]);
                setAllSelected(false);
            } catch {
                toast.error('Failed to load sections');
            } finally {
                setLoadingSections(false);
            }
        })();
    }, [watchYear, watchClass, setValue]);

    // ── Load exams + students on section change ──────────────────────────────
    useEffect(() => {
        if (!watchYear || !watchClass || !watchSection) return;
        (async () => {
            try {
                setLoadingSection(true);
                const { examlist, studentlist } = await getExamsAndStudentsBySection(
                    Number(watchYear),
                    Number(watchClass),
                    Number(watchSection)
                );
                setExams(examlist);
                // Normalise student names
                const mapped = studentlist.map((s: any) => ({
                    amsT_Id: s.amsT_Id,
                    amsT_AdmNo: s.amsT_AdmNo ?? s.admno ?? '',
                    studentName: s.studentName || `${s.amsT_FirstName ?? ''} ${s.amsT_MiddleName ?? ''} ${s.amsT_LastName ?? ''}`.trim()
                }));
                setStudents(mapped);
                // Pre-select all
                setValue(
                    'selectedStudents',
                    mapped.map((s: any) => String(s.amsT_Id)),
                    { shouldValidate: false }
                );
                setAllSelected(true);
                setValue('EME_Id', '');
            } catch {
                toast.error('Failed to load exams / students');
            } finally {
                setLoadingSection(false);
            }
        })();
    }, [watchYear, watchClass, watchSection, setValue]);

    // ── Select-all toggle ────────────────────────────────────────────────────
    const handleSelectAll = (checked: boolean) => {
        if (checked && students.length) {
            setValue(
                'selectedStudents',
                students.map((s) => String(s.amsT_Id)),
                { shouldValidate: true }
            );
            setAllSelected(true);
        } else {
            setValue('selectedStudents', [], { shouldValidate: true });
            setAllSelected(false);
        }
    };

    const handleStudentChange = (vals: string[]) => {
        setValue('selectedStudents', vals, { shouldValidate: true });
        setAllSelected(vals.length === students.length && students.length > 0);
    };

    // ── Submit ───────────────────────────────────────────────────────────────
    const onSubmit = async (formData: HallTicketFormValues) => {
        const payload = {
            ASMAY_Id: Number(formData.ASMAY_Id),
            ASMCL_Id: Number(formData.ASMCL_Id),
            ASMS_Id: Number(formData.ASMS_Id),
            EME_Id: Number(formData.EME_Id),
            studentlist: formData.selectedStudents.map((id) => ({ amsT_Id: Number(id) }))
        };

        try {
            const response = await getHallTicketReport(payload);

            if (!response.success) {
                toast.error(response.message ?? 'No records found');
                return;
            }

            // Resolve display names for header labels
            const selectedYear = academicYears.find((y: any) => String(y.asmaY_Id) === formData.ASMAY_Id)?.asmaY_Year ?? '';
            const selectedExam = exams.find((e: any) => String(e.emE_Id) === formData.EME_Id)?.emE_ExamName ?? '';

            console.log('Baldwin Hall Ticket response', response);

            onReportGenerated(response.data, {
                reportFormat: formData.reportFormat,
                accyear: selectedYear,
                examname: selectedExam
            });
            toast.success('Report generated successfully');
        } catch {
            toast.error('Error generating report');
        }
    };

    // ── Clear ────────────────────────────────────────────────────────────────
    const handleClear = () => {
        reset({
            reportFormat: 'format1',
            ASMAY_Id: '',
            ASMCL_Id: '',
            ASMS_Id: '',
            EME_Id: '',
            selectedStudents: []
        });
        setClasses([]);
        setSections([]);
        setExams([]);
        setStudents([]);
        setAllSelected(false);
        onReset();
    };

    return (
        <div className='mx-auto w-full rounded-lg border border-gray-200 bg-white p-4 shadow-md'>
            <div className='mb-4 flex items-center justify-between border-b pb-2'>
                <h3 className='font-semibold text-gray-800 text-lg'>Hall Ticket Report</h3>
            </div>

            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                    {/* ── Format radio group ──────────────────────────────── */}
                    <div className='flex justify-center rounded-md bg-gray-50 p-3'>
                        <Controller
                            control={control}
                            name='reportFormat'
                            render={({ field, fieldState }) => (
                                <div className='space-y-2'>
                                    <RadioGroup onValueChange={field.onChange} value={field.value} className='flex gap-8'>
                                        {(['format1', 'format2', 'format3'] as const).map((fmt, i) => (
                                            <div key={fmt} className='flex items-center space-x-2'>
                                                <RadioGroupItem value={fmt} id={fmt} />
                                                <Label htmlFor={fmt} className='cursor-pointer font-normal'>
                                                    Format {i + 1}
                                                </Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                    {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                </div>
                            )}
                        />
                    </div>

                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                        {/* ── Left column ───────────────────────────────── */}
                        <div className='space-y-4'>
                            {/* Academic Year */}
                            <div className='space-y-2'>
                                <Label>
                                    Academic Year <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    control={control}
                                    name='ASMAY_Id'
                                    render={({ field, fieldState }) => (
                                        <>
                                            <Select key={field.value} onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger className='w-full'>
                                                    <SelectValue placeholder='Select Academic Year' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {academicYearLoading ? (
                                                        <SelectItem value='0' disabled>
                                                            Loading…
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
                                        </>
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
                                                            Loading…
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
                                                            Loading…
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
                                        </>
                                    )}
                                />
                            </div>

                            {/* Exam Name */}
                            <div className='space-y-2'>
                                <Label>
                                    Exam Name <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    control={control}
                                    name='EME_Id'
                                    render={({ field, fieldState }) => (
                                        <>
                                            <Select
                                                key={field.value}
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                disabled={loadingSection || exams.length === 0}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Select Exam' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {loadingSection ? (
                                                        <SelectItem value='0' disabled>
                                                            Loading…
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
                                        </>
                                    )}
                                />
                            </div>
                        </div>

                        {/* ── Right column: student multi-select ──────────── */}
                        <div className='space-y-4'>
                            <div className='flex flex-col gap-2 sm:flex-row sm:items-start'>
                                <Label className='flex items-center gap-2 font-medium text-sm sm:w-36'>
                                    <Checkbox checked={allSelected} onCheckedChange={handleSelectAll} id='selectAll' />
                                    <span>
                                        Student <span className='text-red-500'>*</span>
                                    </span>
                                </Label>

                                <div className='flex-1'>
                                    <Controller
                                        control={control}
                                        name='selectedStudents'
                                        render={({ field, fieldState }) => (
                                            <CustomMultiSelectBox
                                                options={students.map((s) => ({
                                                    label: `${s.studentName?.trim() || 'Unknown'} - ${s.amsT_AdmNo || 'N/A'}`,
                                                    value: String(s.amsT_Id)
                                                }))}
                                                onChange={handleStudentChange}
                                                value={field.value ?? []}
                                                placeholder={loadingSection ? 'Loading students…' : 'Select Students'}
                                                height='280px'
                                                isSearchRequired
                                                error={fieldState.error?.message}
                                            />
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Action buttons ──────────────────────────────────── */}
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
export default ReportForm;
