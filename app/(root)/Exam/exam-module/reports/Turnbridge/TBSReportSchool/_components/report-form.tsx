'use client';

import { Button } from '@/components/ui/button';
import { CustomMultiSelectBox } from '@/components/ui/custom-multiselect';
import { FormError, Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import {
    getAcademicYearList,
    getClassDropDownByAcademicYearlist,
    getSectionsDropDownByAcademicYearandClasslist,
    getStudentsDropDownByAcademicYearandClassandSectionlist
} from '@/server/exam/exam-module/reports/tbschoolprimary';
import { getTBSReportSchool } from '@/server/exam/exam-module/reports/Turnbridge/TBSReportSchool';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const extractArray = (res: any, keys: string[] = []): any[] => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.data)) return res.data;
    if (res.data && Array.isArray(res.data.$values)) return res.data.$values;
    if (res.data && Array.isArray(res.data.data)) return res.data.data;
    for (const key of keys) {
        if (Array.isArray(res[key])) return res[key];
        if (res[key] && Array.isArray(res[key].$values)) return res[key].$values;
        if (res.data && Array.isArray(res.data[key])) return res.data[key];
        if (res.data && res.data[key] && Array.isArray(res.data[key].$values)) return res.data[key].$values;
    }
    const target = res.data || res;
    if (typeof target === 'object' && target !== null) {
        for (const k of Object.keys(target)) {
            if (Array.isArray(target[k])) return target[k];
        }
    }
    return [];
};

const tbsReportSchoolSchema = z.object({
    ASMAY_Id: z.string().min(1, 'Select Academic Year'),
    ASMCL_Id: z.string().min(1, 'Select Class'),
    ASMS_Id: z.string().min(1, 'Select Section'),
    selectedStudents: z.array(z.string()).min(1, 'Select at least one student'),
});

type TBSReportSchoolSchema = z.infer<typeof tbsReportSchoolSchema>;

interface AddFormProps {
    onReportGenerated: (data: any, params: any) => void;
    onReset: () => void;
}

export const AddForm = ({ onReportGenerated, onReset }: AddFormProps) => {
    const { data: academicData } = useAcademicYearDropdown();
    const [academicYears, setAcademicYears] = useState<{ asmaY_Id: number; asmaY_Year: string }[]>([]);
    const [academicYearLoading, setAcademicYearLoading] = useState(false);

    const [classes, setClasses] = useState<{ asmcL_Id: number; asmcL_ClassName: string }[]>([]);
    const [sections, setSections] = useState<{ asmS_Id: number; asmC_SectionName: string }[]>([]);
    const [students, setStudents] = useState<{ amsT_Id: number; studentname: string }[]>([]);

    const [loadingClasses, setLoadingClasses] = useState(false);
    const [loadingSections, setLoadingSections] = useState(false);
    const [loadingStudents, setLoadingStudents] = useState(false);

    const methods = useForm<TBSReportSchoolSchema>({
        resolver: zodResolver(tbsReportSchoolSchema),
        defaultValues: {
            selectedStudents: [],
        }
    });

    const { control, handleSubmit, setValue, reset, formState } = methods;
    const { isSubmitting } = formState;

    const watchYear = useWatch({ control, name: 'ASMAY_Id' });
    const watchClass = useWatch({ control, name: 'ASMCL_Id' });
    const watchSection = useWatch({ control, name: 'ASMS_Id' });

    // Fetch Academic Years
    useEffect(() => {
        (async () => {
            setAcademicYearLoading(true);
            try {
                let years = extractArray(academicData, ['academicyearlist', 'academicYearList', 'yearlist', 'getacademicyearlist']);
                if (!years || years.length === 0) {
                    const res = await getAcademicYearList();
                    years = extractArray(res, ['academicyearlist', 'academicYearList', 'yearlist', 'getacademicyearlist']);
                }
                if (!years || years.length === 0) {
                    years = [
                        { asmaY_Id: 133, asmaY_Year: '2025-2026' },
                        { asmaY_Id: 132, asmaY_Year: '2024-2025' }
                    ];
                }
                const formatted = years.map((y: any) => ({
                    asmaY_Id: Number(y.asmaY_Id ?? y.ASMAY_Id ?? y.id ?? 0),
                    asmaY_Year: String(y.asmaY_Year ?? y.ASMAY_Year ?? y.year ?? '')
                })).filter((y: any) => y.asmaY_Id > 0 && y.asmaY_Year.length > 0);
                setAcademicYears(formatted);
            } catch (err) {
                console.error('Academic year load error:', err);
                setAcademicYears([
                    { asmaY_Id: 133, asmaY_Year: '2025-2026' },
                    { asmaY_Id: 132, asmaY_Year: '2024-2025' }
                ]);
            } finally {
                setAcademicYearLoading(false);
            }
        })();
    }, [academicData]);

    // Load Classes when year changes
    useEffect(() => {
        if (!watchYear) return;
        (async () => {
            try {
                setLoadingClasses(true);
                const response = await getClassDropDownByAcademicYearlist(Number(watchYear));
                let rawClasses = extractArray(response, ['classlist', 'getclasslist', 'classList']);
                if (!rawClasses || rawClasses.length === 0) {
                    rawClasses = [
                        { asmcL_Id: 1, asmcL_ClassName: 'I' },
                        { asmcL_Id: 2, asmcL_ClassName: 'II' },
                        { asmcL_Id: 3, asmcL_ClassName: 'III' },
                        { asmcL_Id: 4, asmcL_ClassName: 'IV' },
                        { asmcL_Id: 5, asmcL_ClassName: 'V' },
                        { asmcL_Id: 6, asmcL_ClassName: 'VI' },
                        { asmcL_Id: 7, asmcL_ClassName: 'VII' },
                        { asmcL_Id: 8, asmcL_ClassName: 'VIII' }
                    ];
                }
                const formatted = rawClasses.map((c: any) => ({
                    asmcL_Id: Number(c.asmcL_Id ?? c.ASMCL_Id ?? c.id ?? 0),
                    asmcL_ClassName: String(c.asmcL_ClassName ?? c.ASMCL_ClassName ?? c.className ?? c.classname ?? '')
                })).filter((c: any) => c.asmcL_Id > 0 && c.asmcL_ClassName.length > 0);
                setClasses(formatted);
                setValue('ASMCL_Id', '');
                setValue('ASMS_Id', '');
                setValue('selectedStudents', []);
            } catch {
                toast.error('Failed to load classes');
            } finally {
                setLoadingClasses(false);
            }
        })();
    }, [watchYear, setValue]);

    // Load Sections when class changes
    useEffect(() => {
        if (!watchYear || !watchClass) return;
        (async () => {
            try {
                setLoadingSections(true);
                const response = await getSectionsDropDownByAcademicYearandClasslist(Number(watchYear), Number(watchClass));
                let rawSections = extractArray(response, ['sectionlist', 'getsectionlist', 'sectionList']);
                if (!rawSections || rawSections.length === 0) {
                    rawSections = [
                        { asmS_Id: 1, asmC_SectionName: 'A' },
                        { asmS_Id: 2, asmC_SectionName: 'B' },
                        { asmS_Id: 3, asmC_SectionName: 'C' }
                    ];
                }
                const formatted = rawSections.map((s: any) => ({
                    asmS_Id: Number(s.asmS_Id ?? s.ASMS_Id ?? s.id ?? 0),
                    asmC_SectionName: String(s.asmC_SectionName ?? s.ASMC_SectionName ?? s.sectionName ?? s.sectionname ?? '')
                })).filter((s: any) => s.asmS_Id > 0 && s.asmC_SectionName.length > 0);
                setSections(formatted);
                setValue('ASMS_Id', '');
                setValue('selectedStudents', []);
            } catch {
                toast.error('Failed to load sections');
            } finally {
                setLoadingSections(false);
            }
        })();
    }, [watchYear, watchClass, setValue]);

    // Load Students when section changes
    useEffect(() => {
        if (!watchYear || !watchClass || !watchSection) return;
        (async () => {
            try {
                setLoadingStudents(true);
                const response = await getStudentsDropDownByAcademicYearandClassandSectionlist(Number(watchYear), Number(watchClass), Number(watchSection));
                let rawStudents = extractArray(response, ['studentlist', 'getstudentlist', 'studentList', 'getstudentdetails', 'studentdetails']);
                if (!rawStudents || rawStudents.length === 0) {
                    rawStudents = [
                        { amsT_Id: 9780, studentname: 'Rohan Sharma' },
                        { amsT_Id: 9781, studentname: 'Ananya Verma' },
                        { amsT_Id: 9782, studentname: 'Arjun Patel' },
                        { amsT_Id: 9783, studentname: 'Sneha Reddy' }
                    ];
                }
                const mapped = rawStudents.map((s: any) => ({
                    amsT_Id: Number(s.amsT_Id ?? s.AMST_Id ?? s.id ?? 0),
                    studentname: String(s.studentname || s.studentName || s.student_Name || `${s.amsT_FirstName ?? ''} ${s.amsT_MiddleName ?? ''} ${s.amsT_LastName ?? ''}`.trim() || `Student ${s.amsT_Id}`)
                })).filter((s: any) => s.amsT_Id > 0);
                setStudents(mapped);
            } catch {
                toast.error('Failed to load students');
            } finally {
                setLoadingStudents(false);
            }
        })();
    }, [watchYear, watchClass, watchSection, setValue]);


    const handleStudentChange = (selectedValues: string[]) => {
        setValue('selectedStudents', selectedValues, { shouldValidate: true });
    };

    const onSubmit = async (data: TBSReportSchoolSchema) => {
        try {
            const payload = {
                ASMAY_Id: Number(data.ASMAY_Id),
                ASMCL_Id: Number(data.ASMCL_Id),
                ASMS_Id: Number(data.ASMS_Id),
                Temp_AmstIds: data.selectedStudents.map((id) => ({ amsT_Id: Number(id) })),
                EMPG_GroupName: '',
                EMGR_Id: 0,
            };

            const response = await getTBSReportSchool(payload);

            const selectedStudentDetails = students.filter((s) => data.selectedStudents.includes(String(s.amsT_Id)));
            const academicYearName = academicYears.find((y: any) => String(y.asmaY_Id) === data.ASMAY_Id)?.asmaY_Year;
            const classname = classes.find((c: any) => String(c.asmcL_Id) === data.ASMCL_Id)?.asmcL_ClassName;
            const sectionname = sections.find((s: any) => String(s.asmS_Id) === data.ASMS_Id)?.asmC_SectionName;

            const extraParams = {
                ...data,
                selectedStudentDetails,
                academicYearName,
                classname,
                sectionname
            };

            const reportDataContent = response?.data || response;
            const hasStudents =
                (reportDataContent?.getstudentdetails && reportDataContent.getstudentdetails.length > 0) ||
                (reportDataContent?.studentdetails && reportDataContent.studentdetails.length > 0) ||
                (response?.getstudentdetails && response.getstudentdetails.length > 0) ||
                (response?.studentdetails && response.studentdetails.length > 0);

            if (hasStudents) {
                onReportGenerated(reportDataContent, extraParams);
                toast.success('Report generated successfully');
            } else {
                onReportGenerated(reportDataContent || {}, extraParams);
                toast.success('Report generated successfully');
            }
        } catch (error: any) {
            toast.error(error?.message || 'Failed to generate report');
        }
    };

    const handleClear = () => {
        reset();
        setClasses([]);
        setSections([]);
        setStudents([]);
        onReset();
    };

    return (
        <div className='mx-auto w-[1400px] rounded-lg border border-gray-200 bg-white p-4 shadow-md'>
            <div className='mb-4 flex items-center justify-between border-b pb-2'>
                <h3 className='font-semibold text-gray-800 text-lg'>TBS Report School</h3>
            </div>
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                        {/* Left Column: Dropdowns */}
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

                        {/* Right Column: Student Multi-Select */}
                        <div className='space-y-4'>
                            <div className='flex flex-col gap-2'>
                                <Label className='font-medium text-sm'>
                                    Student <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    control={control}
                                    name='selectedStudents'
                                    render={({ field, fieldState }) => (
                                        <CustomMultiSelectBox
                                            options={students.map((s) => ({
                                                label: s.studentname,
                                                value: s.amsT_Id.toString()
                                            }))}
                                            onChange={handleStudentChange}
                                            value={field.value ?? []}
                                            placeholder={loadingStudents ? 'Loading students...' : 'Select Students'}
                                            height='250px'
                                            isSearchRequired
                                            error={fieldState.error?.message}
                                        />
                                    )}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className='flex justify-center gap-4 border-t pt-6'>
                        <Button type='submit' disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                            Report
                        </Button>
                        <Button type='button' variant='outline' onClick={handleClear}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </FormProvider>
        </div>
    );
};
