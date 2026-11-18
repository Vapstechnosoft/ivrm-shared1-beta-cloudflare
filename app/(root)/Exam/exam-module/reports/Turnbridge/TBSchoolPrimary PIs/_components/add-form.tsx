'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CollapsibleContent } from '@/components/ui/collapsible';
import { CustomMultiSelectBox } from '@/components/ui/custom-multiselect';
import { FormError, Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import {
    getClassDropDownByAcademicYearlist,
    getExamsDropDownByAcademicYearandClassandSectionlist,
    getGradeList,
    getSectionsDropDownByAcademicYearandClasslist,
    getStudentsDropDownByAcademicYearandClassandSectionlist
} from '@/server/exam/exam-module/reports/tbschoolprimary';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = z.object({
    asmaY_Id: z.number().min(1, 'Academic Year is required'),
    asmcL_Id: z.number().min(1, 'Class is required'),
    asmS_Id: z.number().min(1, 'Section is required'),
    reporttype: z.enum(['REPORT', 'TEMPLATE']),
    examList: z.array(z.object({ emE_Id: z.number() })).min(1, 'At least one exam must be selected'),
    studentList: z.array(z.object({ amsT_Id: z.number() })).min(1, 'At least one student must be selected')
});

type FormFields = z.infer<typeof formSchema>;

export default function ProgressCardReportForm({
    onSuccess,
    onPrint,
    onReportTypeChange
}: {
    onSuccess?: (payload: any, reporttype: string) => Promise<void> | void;
    onPrint?: () => void;
    onReportTypeChange?: (type: string) => void;
}) {
    const methods = useForm<FormFields>({
        resolver: zodResolver(formSchema),
        mode: 'all',
        defaultValues: {
            asmaY_Id: 0,
            asmcL_Id: 0,
            asmS_Id: 0,
            reporttype: 'REPORT',
            examList: [],
            studentList: []
        }
    });

    const { control, handleSubmit, reset, setValue, formState } = methods;
    const { isSubmitting } = formState;

    const [academicYears, setAcademicYears] = useState<{ asmaY_Id: number; asmaY_Year: string }[]>([]);
    const [classes, setClasses] = useState<{ asmcL_Id: number; asmcL_ClassName: string }[]>([]);
    const [sections, setSections] = useState<{ asmS_Id: number; asmC_SectionName: string }[]>([]);
    const [exams, setExams] = useState<{ emE_Id: number; emE_ExamName: string }[]>([]);
    const [students, setStudents] = useState<{ amsT_AdmNo: number; amsT_Id: number; studentName?: string | null }[]>([]);
    const [grades, setGrades] = useState<{ emgR_Id: number; emgR_GradeName: string }[]>([]);

    const [allStudentsSelected, setAllStudentsSelected] = useState(false);
    const [allExamsSelected, setAllExamsSelected] = useState(false);

    const { data: academicData, error: academicError, isLoading: academicYearLoading } = useAcademicYearDropdown();

    const selectedYear = useWatch({ control, name: 'asmaY_Id' });
    const selectedClass = useWatch({ control, name: 'asmcL_Id' });
    const selectedSection = useWatch({ control, name: 'asmS_Id' });
    const studentList = useWatch({ control, name: 'studentList' });
    const examList = useWatch({ control, name: 'examList' });

    const [loadingClasses, setLoadingClasses] = useState(false);
    const [loadingSections, setLoadingSections] = useState(false);
    const [loadingExams, setLoadingExams] = useState(false);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [loadingGrades, setLoadingGrades] = useState(false);

    const hasStudentsSelected = Array.isArray(studentList) && studentList.length > 0;
    const hasExamsSelected = Array.isArray(examList) && examList.length > 0;

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

    useEffect(() => {
        (async () => {
            try {
                setLoadingGrades(true);
                const { data } = await getGradeList();
                if (data && Array.isArray(data)) {
                    setGrades(data);
                } else if (data?.data && Array.isArray(data.data)) {
                    setGrades(data.data);
                }
            } catch {
                toast.error('Failed to load grades');
            } finally {
                setLoadingGrades(false);
            }
        })();
    }, []);

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
                setValue('examList', []);
                setValue('studentList', []);
                setAllStudentsSelected(false);
                setAllExamsSelected(false);
            } catch {
                toast.error('Failed to load classes');
            } finally {
                setLoadingClasses(false);
            }
        })();
    }, [selectedYear, setValue]);

    useEffect(() => {
        if (!selectedYear || !selectedClass) return;
        (async () => {
            try {
                setLoadingSections(true);
                const { data } = await getSectionsDropDownByAcademicYearandClasslist(selectedClass, selectedYear);
                if (!data || (Array.isArray(data) && data.length === 0)) {
                    toast.info('No sections found');
                }
                setSections(Array.isArray(data) ? data : []);
                setValue('asmS_Id', 0);
                setValue('examList', []);
                setValue('studentList', []);
                setAllStudentsSelected(false);
                setAllExamsSelected(false);
            } catch {
                toast.error('Failed to load sections');
            } finally {
                setLoadingSections(false);
            }
        })();
    }, [selectedYear, selectedClass, setValue]);

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

    useEffect(() => {
        if (!selectedYear || !selectedClass || !selectedSection) return;
        (async () => {
            try {
                setLoadingExams(true);
                const { data } = await getExamsDropDownByAcademicYearandClassandSectionlist(selectedYear, selectedClass, selectedSection);
                if (!data || (Array.isArray(data) && data.length === 0)) {
                    toast.info('No exams found');
                }
                setExams(Array.isArray(data) ? data : []);
                setValue('examList', []);
                setAllExamsSelected(false);
            } catch {
                toast.error('Failed to load exams');
            } finally {
                setLoadingExams(false);
            }
        })();
    }, [selectedYear, selectedClass, selectedSection, setValue]);

    const onSubmit = async (data: FormFields) => {
        if (!hasStudentsSelected) {
            toast.error('Please select at least one student');
            return;
        }

        if (!hasExamsSelected) {
            toast.error('Please select at least one exam');
            return;
        }

        const payload: any = {
            ASMAY_Id: data.asmaY_Id,
            ASMCL_Id: data.asmcL_Id,
            ASMS_Id: data.asmS_Id,
            Temp_AmstIds: data.studentList.map((s) => ({ amsT_Id: s.amsT_Id })),
            examlist: data.examList.map((e) => ({ emE_Id: e.emE_Id })),
            EMGR_Id: 0
        };

        if (onSuccess) {
            await onSuccess(payload, data.reporttype);
        }
    };

    const handleAllStudents = (checked: boolean) => {
        if (checked && students.length) {
            setValue('studentList', [...students], { shouldValidate: true });
            setAllStudentsSelected(true);
        } else {
            setValue('studentList', [], { shouldValidate: true });
            setAllStudentsSelected(false);
        }
    };

    const handleStudentChange = (selectedValues: string[]) => {
        const selected = students.filter((s) => selectedValues.includes(s.amsT_Id.toString()));
        setValue('studentList', selected, { shouldValidate: true });
        setAllStudentsSelected(selected.length === students.length && students.length > 0);
    };

    const handleAllExams = (checked: boolean) => {
        if (checked && exams.length) {
            setValue('examList', [...exams], { shouldValidate: true });
            setAllExamsSelected(true);
        } else {
            setValue('examList', [], { shouldValidate: true });
            setAllExamsSelected(false);
        }
    };

    const handleExamChange = (selectedValues: string[]) => {
        const selected = exams.filter((e) => selectedValues.includes(e.emE_Id.toString()));
        setValue('examList', selected, { shouldValidate: true });
        setAllExamsSelected(selected.length === exams.length && exams.length > 0);
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

                                <div className='flex flex-col gap-2 sm:flex-row sm:items-start'>
                                    <Label className='flex items-center gap-2 font-medium text-sm sm:w-32'>
                                        <Checkbox checked={allExamsSelected} onCheckedChange={handleAllExams} />
                                        Exam <span className='text-red-500'>*</span>
                                    </Label>
                                    <div className='flex-1'>
                                        <Controller
                                            control={control}
                                            name='examList'
                                            render={({ field, fieldState }) => (
                                                <CustomMultiSelectBox
                                                    options={exams.map((e) => ({
                                                        label: e.emE_ExamName,
                                                        value: e.emE_Id.toString()
                                                    }))}
                                                    onChange={handleExamChange}
                                                    value={field.value?.map((e: any) => e.emE_Id.toString()) ?? []}
                                                    placeholder={loadingExams ? 'Exams are loading...' : 'Select Exams'}
                                                    height='200px'
                                                    isSearchRequired={false}
                                                    error={fieldState.error?.message}
                                                />
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className='space-y-6'>
                                <Controller
                                    control={control}
                                    name='studentList'
                                    render={({ field, fieldState }) => (
                                        <div className='flex flex-col gap-2 sm:flex-row sm:items-start'>
                                            <Label className='flex items-center gap-2 font-medium text-sm sm:w-32'>
                                                <Checkbox checked={allStudentsSelected} onCheckedChange={handleAllStudents} />
                                                Student <span className='text-red-500'>*</span>
                                            </Label>
                                            <div className='flex-1'>
                                                <CustomMultiSelectBox
                                                    options={students.map((s) => ({
                                                        label: `${s.studentName?.trim() || 'Unknown'} - ${s.amsT_AdmNo || 'N/A'}`.trim(),
                                                        value: s.amsT_Id.toString()
                                                    }))}
                                                    onChange={handleStudentChange}
                                                    value={field.value?.map((s: any) => s.amsT_Id.toString()) ?? []}
                                                    placeholder={loadingStudents ? 'Students are loading...' : 'Select Students'}
                                                    height='150px'
                                                    isSearchRequired
                                                    error={fieldState.error?.message}
                                                />
                                            </div>
                                        </div>
                                    )}
                                />

                                <Controller
                                    control={control}
                                    name='reporttype'
                                    render={({ field }) => (
                                        <div className='flex items-center justify-center rounded-md border p-4'>
                                            <div className='flex items-center space-x-6'>
                                                <label className='flex cursor-pointer items-center space-x-2'>
                                                    <input
                                                        type='radio'
                                                        value='REPORT'
                                                        checked={field.value === 'REPORT'}
                                                        onChange={() => {
                                                            field.onChange('REPORT');
                                                            if (onReportTypeChange) onReportTypeChange('REPORT');
                                                        }}
                                                        className='form-radio h-4 w-4 text-blue-600'
                                                    />
                                                    <span className='font-medium text-gray-700 text-sm'>REPORT</span>
                                                </label>
                                                <label className='flex cursor-pointer items-center space-x-2'>
                                                    <input
                                                        type='radio'
                                                        value='TEMPLATE'
                                                        checked={field.value === 'TEMPLATE'}
                                                        onChange={() => {
                                                            field.onChange('TEMPLATE');
                                                            if (onReportTypeChange) onReportTypeChange('TEMPLATE');
                                                        }}
                                                        className='form-radio h-4 w-4 text-blue-600'
                                                    />
                                                    <span className='font-medium text-gray-700 text-sm'>TEMPLATE</span>
                                                </label>
                                            </div>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        <hr className='my-6 border-gray-300' />

                        <div className='flex justify-center gap-3'>
                            <Button
                                type='submit'
                                isLoading={isSubmitting}
                                disabled={isSubmitting || !hasStudentsSelected || !hasExamsSelected}
                                className='min-w-[140px]'>
                                {isSubmitting ? 'Generating...' : 'Report'}
                            </Button>
                            <Button
                                type='button'
                                variant='outline'
                                onClick={() => {
                                    reset();
                                    setStudents([]);
                                    setExams([]);
                                }}
                                className='min-w-[100px] bg-orange-500 text-white hover:bg-orange-600'>
                                Cancel
                            </Button>
                            {onPrint && (
                                <Button type='button' onClick={onPrint} className='min-w-[100px] bg-blue-600 text-white hover:bg-blue-700'>
                                    Print
                                </Button>
                            )}
                        </div>
                    </form>
                </FormProvider>
            </CollapsibleContent>
        </div>
    );
}
