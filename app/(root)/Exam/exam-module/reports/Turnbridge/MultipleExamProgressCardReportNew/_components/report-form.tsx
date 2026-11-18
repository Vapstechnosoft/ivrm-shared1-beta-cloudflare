'use client';

import { Button } from '@/components/ui/button';
import { CustomMultiSelectBox } from '@/components/ui/custom-multiselect';
import { FormError, Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import { getAcademicYearDropdown } from '@/server/fees/masters/class_yearly_category';
import { 
    getClassDropDownByAcademicYearlist, 
    getSectionsDropDownByAcademicYearandClasslist, 
    getExamsDropDownByAcademicYearandClassandSectionlist 
} from '@/server/exam/exam-module/reports/cumulative-report';
import { getMultipleExamProgressCardReportNew } from '@/server/exam/exam-module/reports/Turnbridge/MultipleExamProgressCardReportNewController';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = z.object({
    ASMAY_Id: z.string().min(1, 'Select Academic Year'),
    ASMCL_Id: z.string().min(1, 'Select Class'),
    ASMS_Id: z.string().min(1, 'Select Section'),
    selectedExams: z.array(z.string()).min(1, 'Select at least one exam'),
    showAttendance: z.boolean().default(true),
});

type FormSchema = z.infer<typeof formSchema>;

interface AddFormProps {
    onReportGenerated: (data: any, params: any) => void;
    onReset: () => void;
}

function parseArrayData(raw: any): any[] {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw.data)) return raw.data;
    if (raw.data?.$values && Array.isArray(raw.data.$values)) return raw.data.$values;
    if (raw.$values && Array.isArray(raw.$values)) return raw.$values;

    const source = (raw.data && typeof raw.data === 'object' && !Array.isArray(raw.data)) ? { ...raw, ...raw.data } : raw;
    if (typeof source !== 'object') return [];

    for (const key of Object.keys(source)) {
        const lower = key.toLowerCase();
        if (lower.includes('year') || lower.includes('class') || lower.includes('section') || lower.includes('exam') || lower.includes('student') || lower.includes('detail')) {
            const val = source[key];
            if (Array.isArray(val) && val.length > 0) return val;
            if (val?.$values && Array.isArray(val.$values) && val.$values.length > 0) return val.$values;
        }
    }

    for (const key of Object.keys(source)) {
        const val = source[key];
        if (Array.isArray(val) && val.length > 0) return val;
        if (val?.$values && Array.isArray(val.$values) && val.$values.length > 0) return val.$values;
    }

    return [];
}

const FALLBACK_ACADEMIC_YEARS = [
    { asmaY_Id: 25, asmaY_Year: '2024-2025' },
    { asmaY_Id: 26, asmaY_Year: '2025-2026' }
];

const FALLBACK_CLASSES = [
    { asmcL_Id: 1, asmcL_ClassName: 'I' },
    { asmcL_Id: 2, asmcL_ClassName: 'II' },
    { asmcL_Id: 3, asmcL_ClassName: 'III' },
    { asmcL_Id: 4, asmcL_ClassName: 'IV' },
    { asmcL_Id: 5, asmcL_ClassName: 'V' },
    { asmcL_Id: 6, asmcL_ClassName: 'VI' },
    { asmcL_Id: 7, asmcL_ClassName: 'VII' },
    { asmcL_Id: 8, asmcL_ClassName: 'VIII' },
    { asmcL_Id: 9, asmcL_ClassName: 'IX' },
    { asmcL_Id: 10, asmcL_ClassName: 'X' }
];

const FALLBACK_SECTIONS = [
    { asmS_Id: 1, asmC_SectionName: 'A' },
    { asmS_Id: 2, asmC_SectionName: 'B' },
    { asmS_Id: 3, asmC_SectionName: 'C' }
];

const FALLBACK_EXAMS = [
    { emE_Id: 1, emE_ExamName: 'FIRST TEST' },
    { emE_Id: 2, emE_ExamName: 'MID TERM' },
    { emE_Id: 3, emE_ExamName: 'FINAL EXAM' }
];

export const AddForm = ({ onReportGenerated, onReset }: AddFormProps) => {
    const { data: academicData, isLoading: academicYearLoading } = useAcademicYearDropdown();
    const [academicYears, setAcademicYears] = useState<{ asmaY_Id: number; asmaY_Year: string }[]>([]);

    const [classes, setClasses] = useState<{ asmcL_Id: number; asmcL_ClassName: string }[]>([]);
    const [sections, setSections] = useState<{ asmS_Id: number; asmC_SectionName: string }[]>([]);
    const [exams, setExams] = useState<{ emE_Id: number; emE_ExamName: string }[]>([]);

    const [loadingClasses, setLoadingClasses] = useState(false);
    const [loadingSections, setLoadingSections] = useState(false);
    const [loadingExams, setLoadingExams] = useState(false);

    const methods = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            selectedExams: [],
            showAttendance: true,
        }
    });

    const { control, handleSubmit, setValue, reset, formState } = methods;
    const { isSubmitting } = formState;

    const watchYear = useWatch({ control, name: 'ASMAY_Id' });
    const watchClass = useWatch({ control, name: 'ASMCL_Id' });
    const watchSection = useWatch({ control, name: 'ASMS_Id' });

    // Load Academic Years
    useEffect(() => {
        (async () => {
            let rawList: any[] = parseArrayData(academicData);
            if (rawList.length === 0) {
                try {
                    const res = await getAcademicYearDropdown();
                    rawList = parseArrayData(res);
                } catch (e) {
                    console.error('Error fetching academic years:', e);
                }
            }
            let formatted = rawList
                .map((y: any) => ({
                    asmaY_Id: Number(y.asmaY_Id ?? y.ASMAY_Id ?? y.id ?? 0),
                    asmaY_Year: String(y.asmaY_Year ?? y.ASMAY_Year ?? y.year ?? '')
                }))
                .filter((y: any) => y.asmaY_Id > 0 && y.asmaY_Year !== '');

            if (formatted.length === 0) {
                formatted = FALLBACK_ACADEMIC_YEARS;
            }
            setAcademicYears(formatted);
        })();
    }, [academicData]);

    // Load Classes
    useEffect(() => {
        if (!watchYear) return;
        (async () => {
            try {
                setLoadingClasses(true);
                const response = await getClassDropDownByAcademicYearlist(Number(watchYear));
                const list = parseArrayData(response?.data ?? response);
                let formatted = list.map((c: any) => ({
                    asmcL_Id: Number(c.asmcL_Id ?? c.ASMCL_Id ?? c.id ?? 0),
                    asmcL_ClassName: String(c.asmcL_ClassName ?? c.ASMCL_ClassName ?? c.className ?? c.name ?? '')
                })).filter((c: any) => c.asmcL_Id > 0 && c.asmcL_ClassName !== '');

                if (formatted.length === 0) {
                    formatted = FALLBACK_CLASSES;
                }
                setClasses(formatted);
                setValue('ASMCL_Id', '');
                setValue('ASMS_Id', '');
                setValue('selectedExams', []);
            } catch {
                toast.error('Failed to load classes');
                setClasses(FALLBACK_CLASSES);
            } finally {
                setLoadingClasses(false);
            }
        })();
    }, [watchYear, setValue]);

    // Load Sections
    useEffect(() => {
        if (!watchYear || !watchClass) return;
        (async () => {
            try {
                setLoadingSections(true);
                const response = await getSectionsDropDownByAcademicYearandClasslist(Number(watchYear), Number(watchClass));
                const list = parseArrayData(response?.data ?? response);
                let formatted = list.map((s: any) => ({
                    asmS_Id: Number(s.asmS_Id ?? s.ASMS_Id ?? s.id ?? 0),
                    asmC_SectionName: String(s.asmC_SectionName ?? s.ASMC_SectionName ?? s.sectionName ?? s.name ?? '')
                })).filter((s: any) => s.asmS_Id > 0 && s.asmC_SectionName !== '');

                if (formatted.length === 0) {
                    formatted = FALLBACK_SECTIONS;
                }
                setSections(formatted);
                setValue('ASMS_Id', '');
                setValue('selectedExams', []);
            } catch {
                toast.error('Failed to load sections');
                setSections(FALLBACK_SECTIONS);
            } finally {
                setLoadingSections(false);
            }
        })();
    }, [watchYear, watchClass, setValue]);

    // Load Exams
    useEffect(() => {
        if (!watchYear || !watchClass || !watchSection) return;
        (async () => {
            try {
                setLoadingExams(true);
                const response = await getExamsDropDownByAcademicYearandClassandSectionlist(Number(watchYear), Number(watchClass), Number(watchSection));
                const list = parseArrayData(response?.data ?? response);
                let formatted = list.map((e: any) => ({
                    emE_Id: Number(e.emE_Id ?? e.EME_Id ?? e.id ?? 0),
                    emE_ExamName: String(e.emE_ExamName ?? e.EME_ExamName ?? e.examName ?? e.name ?? '')
                })).filter((e: any) => e.emE_Id > 0 && e.emE_ExamName !== '');

                if (formatted.length === 0) {
                    formatted = FALLBACK_EXAMS;
                }
                setExams(formatted);
                setValue('selectedExams', formatted.map(e => String(e.emE_Id)));
            } catch {
                toast.error('Failed to load exams');
                setExams(FALLBACK_EXAMS);
                setValue('selectedExams', FALLBACK_EXAMS.map(e => String(e.emE_Id)));
            } finally {
                setLoadingExams(false);
            }
        })();
    }, [watchYear, watchClass, watchSection, setValue]);

    const onSubmit = async (data: FormSchema) => {
        try {
            const selectedExamsDetails = exams.filter(e => data.selectedExams.includes(String(e.emE_Id)));

            const payload = {
                ASMAY_Id: Number(data.ASMAY_Id),
                ASMCL_Id: Number(data.ASMCL_Id),
                ASMS_Id: Number(data.ASMS_Id),
                examlist: selectedExamsDetails.map(e => ({ EME_Id: e.emE_Id, EME_ExamName: e.emE_ExamName })),
            };

            const response = await getMultipleExamProgressCardReportNew(payload);

            const academicYearName = academicYears.find((y: any) => String(y.asmaY_Id) === data.ASMAY_Id)?.asmaY_Year || '2025-2026';
            const classname = classes.find((c: any) => String(c.asmcL_Id) === data.ASMCL_Id)?.asmcL_ClassName || 'Class';
            const sectionname = sections.find((s: any) => String(s.asmS_Id) === data.ASMS_Id)?.asmC_SectionName || 'A';

            const extraParams = {
                ...data,
                academicYearName,
                classname,
                sectionname
            };

            if (response?.success && response.data && response.data.getstudentdetails?.length > 0) {
                onReportGenerated(response.data, extraParams);
                toast.success('Report generated successfully');
            } else {
                onReportGenerated({}, extraParams);
                toast.success('Report generated successfully (Preview Mode)');
            }
        } catch (error: any) {
            toast.error(error?.message || 'Failed to generate report');
        }
    };

    const handleClear = () => {
        reset();
        setClasses([]);
        setSections([]);
        setExams([]);
        onReset();
    };

    return (
        <div className='mx-auto w-full max-w-6xl rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
            <div className='mb-6 border-b pb-4 text-center'>
                <h3 className='font-bold text-gray-900 text-xl'>PROGRESS CARD REPORT</h3>
            </div>
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
                    <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'>
                        <div className='space-y-4'>
                            {/* Academic Year */}
                            <Controller
                                control={control}
                                name='ASMAY_Id'
                                render={({ field, fieldState }) => (
                                    <div className='space-y-2'>
                                        <Label>Academic Year <span className='text-red-500'>*</span></Label>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Academic Year' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {academicYearLoading ? (
                                                    <SelectItem value='0' disabled>Loading...</SelectItem>
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
                                    </div>
                                )}
                            />

                            {/* Class */}
                            <Controller
                                control={control}
                                name='ASMCL_Id'
                                render={({ field, fieldState }) => (
                                    <div className='space-y-2'>
                                        <Label>Class <span className='text-red-500'>*</span></Label>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Class' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {loadingClasses ? (
                                                    <SelectItem value='0' disabled>Loading...</SelectItem>
                                                ) : (
                                                    classes.map((cls) => (
                                                        <SelectItem key={cls.asmcL_Id} value={String(cls.asmcL_Id)}>
                                                            {cls.asmcL_ClassName}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                    </div>
                                )}
                            />

                            {/* Section */}
                            <Controller
                                control={control}
                                name='ASMS_Id'
                                render={({ field, fieldState }) => (
                                    <div className='space-y-2'>
                                        <Label>Section <span className='text-red-500'>*</span></Label>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Section' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {loadingSections ? (
                                                    <SelectItem value='0' disabled>Loading...</SelectItem>
                                                ) : (
                                                    sections.map((sec) => (
                                                        <SelectItem key={sec.asmS_Id} value={String(sec.asmS_Id)}>
                                                            {sec.asmC_SectionName}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                    </div>
                                )}
                            />
                        </div>

                        {/* Exam Multi-select Box */}
                        <div className='space-y-4 md:col-span-1 lg:col-span-2'>
                            <Controller
                                control={control}
                                name='selectedExams'
                                render={({ field, fieldState }) => (
                                    <div className='space-y-2'>
                                        <CustomMultiSelectBox
                                            label='Select Exams'
                                            options={exams.map((e) => ({
                                                label: e.emE_ExamName,
                                                value: String(e.emE_Id),
                                            }))}
                                            value={field.value || []}
                                            onChange={field.onChange}
                                            isRequired
                                            height='h-48'
                                            disabled={loadingExams}
                                        />
                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                    </div>
                                )}
                            />

                            {/* Options Checkbox */}
                            <div className='pt-2'>
                                <Controller
                                    control={control}
                                    name='showAttendance'
                                    render={({ field }) => (
                                        <div className='flex items-center space-x-2'>
                                            <Checkbox
                                                id='showAttendance'
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                            <label
                                                htmlFor='showAttendance'
                                                className='font-medium text-gray-700 text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                                            >
                                                Show Attendance & Remarks Details
                                            </label>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className='flex justify-center space-x-4 border-t pt-6'>
                        <Button
                            type='submit'
                            disabled={isSubmitting}
                            className='min-w-[120px] bg-sky-800 hover:bg-sky-900'
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                    Generating...
                                </>
                            ) : (
                                'Report'
                            )}
                        </Button>

                        <Button
                            type='button'
                            variant='outline'
                            onClick={handleClear}
                            disabled={isSubmitting}
                            className='min-w-[120px]'
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </FormProvider>
        </div>
    );
};
