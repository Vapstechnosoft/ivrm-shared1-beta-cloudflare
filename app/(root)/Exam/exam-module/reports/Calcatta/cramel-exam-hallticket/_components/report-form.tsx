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
const cramelHallTicketSchema = z.object({
    reportFormat: z.enum(['daily', 'btwdates'], {
        required_error: 'Please select a report format'
    }),
    ASMAY_Id: z.string().min(1, 'Academic Year is required'),
    ASMCL_Id: z.string().min(1, 'Class is required'),
    ASMS_Id: z.string().min(1, 'Section is required'),
    EME_Id: z.string().min(1, 'Exam is required'),
    selectedStudents: z.array(z.string()).min(1, 'Please select at least one student')
});

type CramelHallTicketFormValues = z.infer<typeof cramelHallTicketSchema>;

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

    const methods = useForm<CramelHallTicketFormValues>({
        resolver: zodResolver(cramelHallTicketSchema),
        defaultValues: {
            reportFormat: 'daily',
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
                setClasses(Array.isArray(res?.data) ? res.data : []);
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
                setSections(Array.isArray(res?.data) ? res.data : []);
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

    // ── Load exams and students on section change ────────────────────────────
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
                setExams(examlist || []);

                // Normalize student names and data
                const mapped = (studentlist || []).map((s: any) => ({
                    amsT_Id: s.amsT_Id,
                    amsT_AdmNo: s.amsT_AdmNo ?? s.admno ?? '',
                    studentName: s.studentName || `${s.amsT_FirstName ?? ''} ${s.amsT_MiddleName ?? ''} ${s.amsT_LastName ?? ''}`.trim()
                }));
                setStudents(mapped);

                // Pre-select all students
                setValue(
                    'selectedStudents',
                    mapped.map((s: any) => String(s.amsT_Id)),
                    { shouldValidate: false }
                );
                setAllSelected(true);
                setValue('EME_Id', '');
            } catch {
                toast.error('Failed to load exams and students');
            } finally {
                setLoadingSection(false);
            }
        })();
    }, [watchYear, watchClass, watchSection, setValue]);

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

    const handleStudentChange = (value: string[]) => {
        setValue('selectedStudents', value, { shouldValidate: true });
        setAllSelected(value.length === students.length && students.length > 0);
    };

    const handleClear = () => {
        reset({
            reportFormat: 'daily',
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

    const onSubmit = async (values: CramelHallTicketFormValues) => {
        try {
            const payload = {
                ASMAY_Id: Number(values.ASMAY_Id),
                ASMCL_Id: Number(values.ASMCL_Id),
                ASMS_Id: Number(values.ASMS_Id),
                EME_Id: Number(values.EME_Id),
                studentlist: values.selectedStudents.map((id) => ({ amsT_Id: Number(id) }))
            };

            const response = await getHallTicketReport(payload);
            console.log('Cramel Hall Ticket response', response);
            if (!response.success) {
                toast.error(response.message || 'No records found');
                return;
            }

            const yearObj = academicYears.find((y: any) => String(y.asmaY_Id) === values.ASMAY_Id);
            const examObj = exams.find((e: any) => String(e.emE_Id) === values.EME_Id);

            const reportParams = {
                reportFormat: values.reportFormat,
                accyear: yearObj?.asmaY_Year || '',
                examname: examObj?.emE_ExamName || ''
            };

            onReportGenerated(response.data, reportParams);
            toast.success('Report generated successfully');
        } catch {
            toast.error('Failed to generate report');
        }
    };

    return (
        <div className='mx-auto w-full rounded-lg border border-gray-200 bg-white p-6 shadow-md'>
            <div className='mb-4 flex items-center justify-between border-b pb-2'>
                <h3 className='font-semibold text-gray-800 text-lg'>Cramel Hallticket Report</h3>
            </div>

            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                    {/* ── Format selection ──────────────────────────────────────── */}
                    <div className='flex justify-center rounded-md bg-gray-50 p-3'>
                        <Controller
                            control={control}
                            name='reportFormat'
                            render={({ field }) => (
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className='flex flex-wrap gap-8'>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='daily' id='f1' />
                                        <Label htmlFor='f1' className='cursor-pointer font-normal'>
                                            Format 1 (Grid View)
                                        </Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='btwdates' id='f2' />
                                        <Label htmlFor='f2' className='cursor-pointer font-normal'>
                                            Format 2 (Hall Ticket)
                                        </Label>
                                    </div>
                                </RadioGroup>
                            )}
                        />
                    </div>

                    <div className='grid grid-cols-1 gap-8 pt-4 md:grid-cols-2'>
                        {/* ── Left side: Dropdowns ─────────────────────────────────── */}
                        <div className='space-y-4'>
                            {/* Academic Year */}
                            <div className='grid grid-cols-1 gap-2'>
                                <Label>Academic Year</Label>
                                <Controller
                                    control={control}
                                    name='ASMAY_Id'
                                    render={({ field, fieldState }) => (
                                        <div className='space-y-1'>
                                            <Select onValueChange={field.onChange} value={field.value} disabled={academicYearLoading}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={academicYearLoading ? 'Loading...' : 'Select Year'} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {academicYears.map((item: any) => (
                                                        <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                            {item.asmaY_Year}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormError>{fieldState.error?.message}</FormError>
                                        </div>
                                    )}
                                />
                            </div>

                            {/* Class */}
                            <div className='grid grid-cols-1 gap-2'>
                                <Label>Class</Label>
                                <Controller
                                    control={control}
                                    name='ASMCL_Id'
                                    render={({ field, fieldState }) => (
                                        <div className='space-y-1'>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                disabled={!watchYear || loadingClasses}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={loadingClasses ? 'Loading...' : 'Select Class'} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {classes.map((item: any) => (
                                                        <SelectItem key={item.asmcL_Id} value={item.asmcL_Id.toString()}>
                                                            {item.asmcL_ClassName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormError>{fieldState.error?.message}</FormError>
                                        </div>
                                    )}
                                />
                            </div>

                            {/* Section */}
                            <div className='grid grid-cols-1 gap-2'>
                                <Label>Section</Label>
                                <Controller
                                    control={control}
                                    name='ASMS_Id'
                                    render={({ field, fieldState }) => (
                                        <div className='space-y-1'>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                disabled={!watchClass || loadingSections}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={loadingSections ? 'Loading...' : 'Select Section'} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {sections.map((item: any) => (
                                                        <SelectItem key={item.asmS_Id} value={item.asmS_Id.toString()}>
                                                            {item.asmC_SectionName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormError>{fieldState.error?.message}</FormError>
                                        </div>
                                    )}
                                />
                            </div>

                            {/* Exam */}
                            <div className='grid grid-cols-1 gap-2'>
                                <Label>Exam</Label>
                                <Controller
                                    control={control}
                                    name='EME_Id'
                                    render={({ field, fieldState }) => (
                                        <div className='space-y-1'>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                disabled={!watchSection || loadingSection}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={loadingSection ? 'Loading...' : 'Select Exam'} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {exams.map((item: any) => (
                                                        <SelectItem key={item.emE_Id} value={item.emE_Id.toString()}>
                                                            {item.emE_ExamName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormError>{fieldState.error?.message}</FormError>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        {/* ── Right side: Student Multi-select ─────────────────────── */}
                        <div className='space-y-4'>
                            <div className='flex items-center justify-between'>
                                <Label>Select Students</Label>
                                <div className='flex items-center space-x-2'>
                                    <Checkbox
                                        id='selectAll'
                                        checked={allSelected}
                                        onCheckedChange={handleSelectAll}
                                        disabled={!students.length}
                                    />
                                    <label
                                        htmlFor='selectAll'
                                        className='font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                                        Select All
                                    </label>
                                </div>
                            </div>
                            <div className='rounded-lg border bg-muted/30'>
                                <div className='p-4'>
                                    <Controller
                                        control={control}
                                        name='selectedStudents'
                                        render={({ field, fieldState }) => (
                                            <CustomMultiSelectBox
                                                options={students.map((s) => ({
                                                    label: `${s.studentName?.trim() || 'Unknown'} - ${s.amsT_AdmNo || 'N/A'}`,
                                                    value: String(s.amsT_Id)
                                                }))}
                                                value={field.value ?? []}
                                                onChange={handleStudentChange}
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
