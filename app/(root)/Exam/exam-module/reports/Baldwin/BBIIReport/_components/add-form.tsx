'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CustomMultiSelectBox } from '@/components/ui/custom-multiselect';
import { FormError, Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import { vvehpc_examreportcardSchema } from '@/schemas/exam/exam-module/reports';
import {
    getClassDropDownByAcademicYearlist,
    getExamsDropDownByAcademicYearandClassandSectionlist,
    getSectionsDropDownByAcademicYearandClasslist,
    getStudentsDropDownByAcademicYearandClassandSectionlist
} from '@/server/exam/exam-module/reports/cumulative-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileText, Loader2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof vvehpc_examreportcardSchema.addOrUpdate> & {
    showRemarks: boolean;
    showRank: boolean;
    showRankInSection: boolean;
};

export default function BBIIReportForm({
    onSuccess,
    onReset
}: {
    onSuccess?: (payload: any) => Promise<void> | void;
    onReset?: () => void;
}) {
    const methods = useForm<FormFields>({
        resolver: zodResolver(vvehpc_examreportcardSchema.addOrUpdate),
        mode: 'all',
        defaultValues: {
            asmaY_Id: 0,
            asmcL_Id: 0,
            asmS_Id: 0,
            emE_Id: 0,
            studentList: [],
            showRemarks: true,
            showRank: false,
            showRankInSection: false
        }
    });

    const { control, handleSubmit, reset, setValue, formState } = methods;
    const { isSubmitting } = formState;

    const [academicYears, setAcademicYears] = useState<{ asmaY_Id: number; asmaY_Year: string }[]>([]);
    const [classes, setClasses] = useState<{ asmcL_Id: number; asmcL_ClassName: string }[]>([]);
    const [sections, setSections] = useState<{ asmS_Id: number; asmC_SectionName: string }[]>([]);
    const [exams, setExams] = useState<{ emE_Id: number; emE_ExamName: string }[]>([]);
    const [students, setStudents] = useState<{ amsT_Id: number; amsT_FirstName: string; amsT_AdmNo: string }[]>([]);
    const [allStudentsSelected, setAllStudentsSelected] = useState(false);

    const { data: academicData, error: academicError, isLoading: academicYearLoading } = useAcademicYearDropdown();

    const selectedYear = useWatch({ control, name: 'asmaY_Id' });
    const selectedClass = useWatch({ control, name: 'asmcL_Id' });
    const selectedSection = useWatch({ control, name: 'asmS_Id' });
    const studentList = useWatch({ control, name: 'studentList' });

    const [loadingClasses, setLoadingClasses] = useState(false);
    const [loadingSections, setLoadingSections] = useState(false);
    const [loadingExams, setLoadingExams] = useState(false);
    const [loadingStudents, setLoadingStudents] = useState(false);

    const hasStudentsSelected = Array.isArray(studentList) && studentList.length > 0;

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
        if (!selectedYear) return;
        (async () => {
            try {
                setLoadingClasses(true);
                const res: any = await getClassDropDownByAcademicYearlist(selectedYear);
                const raw = res?.data ?? res;
                const list = Array.isArray(raw) ? raw : (raw?.classlist || raw?.classList || raw?.data || []);
                setClasses(Array.isArray(list) ? list : []);
                setValue('asmcL_Id', 0);
                setValue('asmS_Id', 0);
                setValue('emE_Id', 0);
                setValue('studentList', []);
                setAllStudentsSelected(false);
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
                const res: any = await getSectionsDropDownByAcademicYearandClasslist(selectedYear, selectedClass);
                const raw = res?.data ?? res;
                const list = Array.isArray(raw) ? raw : (raw?.seclist || raw?.secList || raw?.sections || raw?.data || []);
                setSections(Array.isArray(list) ? list : []);
                setValue('asmS_Id', 0);
                setValue('emE_Id', 0);
                setValue('studentList', []);
                setAllStudentsSelected(false);
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
                setLoadingExams(true);
                const res: any = await getExamsDropDownByAcademicYearandClassandSectionlist(selectedYear, selectedClass, selectedSection);
                const raw = res?.data ?? res;
                const list = Array.isArray(raw) ? raw : (raw?.exmstdlist || raw?.examlist || raw?.exams || raw?.data || []);
                setExams(Array.isArray(list) ? list : []);
                setValue('emE_Id', 0);
            } catch {
                toast.error('Failed to load exams');
            } finally {
                setLoadingExams(false);
            }
        })();

        (async () => {
            try {
                setLoadingStudents(true);
                const res: any = await getStudentsDropDownByAcademicYearandClassandSectionlist(
                    selectedYear,
                    selectedClass,
                    selectedSection
                );
                const raw = res?.data ?? res;
                const list = Array.isArray(raw) ? raw : (raw?.studentlist || raw?.studentlistdetails || raw?.students || raw?.data || []);
                if (Array.isArray(list)) {
                    const mapped = list.map((s: any) => ({
                        amsT_Id: s.amsT_Id ?? s.AMST_Id,
                        amsT_FirstName: s.studentName || `${s.amsT_FirstName || s.AMST_FirstName || ''} ${s.amsT_MiddleName || ''} ${s.amsT_LastName || ''}`.trim(),
                        amsT_AdmNo: s.amsT_AdmNo || s.AMST_AdmNo
                    }));
                    setStudents(mapped);
                }
            } catch {
                toast.error('Failed to load students');
            } finally {
                setLoadingStudents(false);
            }
        })();
    }, [selectedYear, selectedClass, selectedSection, setValue]);

    const submitForm = async (data: FormFields, isPrint = false) => {
        if (!hasStudentsSelected) {
            toast.error('Please select at least one student');
            return;
        }

        const className = classes.find((c) => c.asmcL_Id === data.asmcL_Id)?.asmcL_ClassName || '';
        const sectionName = sections.find((s) => s.asmS_Id === data.asmS_Id)?.asmC_SectionName || '';

        const currentDateTime = new Date().toISOString();
        const rankVal = data.showRankInSection ?? data.showRank ?? false;
        const payload: any = {
            asmaY_Id: data.asmaY_Id,
            asmcL_Id: data.asmcL_Id,
            asmS_Id: data.asmS_Id,
            emE_Id: data.emE_Id,
            amsT_Ids: data.studentList.map((s) => s.amsT_Id).join(','),
            fromDate: currentDateTime,
            toDate: currentDateTime,
            selectedClassName: className,
            selectedSectionName: sectionName,
            showRemarks: data.showRemarks,
            showRank: rankVal,
            showRankInSection: rankVal,
            isPrint
        };
        if (onSuccess) {
            await onSuccess(payload);
        }
    };

    const onSubmit = async (data: FormFields) => {
        await submitForm(data, false);
    };

    const handlePrintClick = () => {
        handleSubmit((data) => submitForm(data, true))();
    };

    const handleCancel = () => {
        reset({
            asmaY_Id: 0,
            asmcL_Id: 0,
            asmS_Id: 0,
            emE_Id: 0,
            studentList: [],
            showRemarks: true,
            showRank: false,
            showRankInSection: false
        });
        setClasses([]);
        setSections([]);
        setExams([]);
        setStudents([]);
        setAllStudentsSelected(false);
        if (onReset) onReset();
    };

    const handleAllStudents = (checked: boolean) => {
        if (checked && students.length) {
            setValue(
                'studentList',
                students.map((s) => ({ amsT_Id: s.amsT_Id })),
                { shouldValidate: true }
            );
            setAllStudentsSelected(true);
        } else {
            setValue('studentList', [], { shouldValidate: true });
            setAllStudentsSelected(false);
        }
    };

    const handleStudentChange = (selectedValues: string[]) => {
        const selected = selectedValues.map((v) => ({ amsT_Id: Number(v) }));
        setValue('studentList', selected, { shouldValidate: true });
        setAllStudentsSelected(selected.length === students.length && students.length > 0);
    };

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
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
                                            onValueChange={(v) => field.onChange(Number(v))}
                                            value={field.value ? String(field.value) : ''}>
                                            <SelectTrigger className='w-full'>
                                                <SelectValue placeholder='Select Academic Year' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {academicYearLoading ? (
                                                    <SelectItem value='0' disabled>
                                                        Loading...
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
                                            value={field.value ? String(field.value) : ''}
                                            disabled={!selectedYear}>
                                            <SelectTrigger className='w-full'>
                                                <SelectValue placeholder='Select Class' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {loadingClasses ? (
                                                    <SelectItem value='0' disabled>
                                                        Loading...
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
                                            value={field.value ? String(field.value) : ''}
                                            disabled={!selectedClass}>
                                            <SelectTrigger className='w-full'>
                                                <SelectValue placeholder='Select Section' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {loadingSections ? (
                                                    <SelectItem value='0' disabled>
                                                        Loading...
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
                                        Exam Name <span className='text-red-500'>*</span>
                                    </Label>
                                    <div className='flex-1'>
                                        <Select
                                            onValueChange={(v) => field.onChange(Number(v))}
                                            value={field.value ? String(field.value) : ''}
                                            disabled={!selectedSection}>
                                            <SelectTrigger className='w-full'>
                                                <SelectValue placeholder='Select Exam' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {loadingExams ? (
                                                    <SelectItem value='0' disabled>
                                                        Loading...
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

                    <div className='space-y-6'>
                        <div className='flex flex-col gap-2 sm:flex-row sm:items-start'>
                            <Label className='flex items-center gap-2 pt-2 font-medium text-sm sm:w-32'>
                                <Checkbox checked={allStudentsSelected} onCheckedChange={handleAllStudents} />
                                Student <span className='text-red-500'>*</span>
                            </Label>
                            <div className='flex-1'>
                                <Controller
                                    control={control}
                                    name='studentList'
                                    render={({ field, fieldState }) => (
                                        <CustomMultiSelectBox
                                            options={students.map((s) => ({
                                                label: s.amsT_AdmNo ? `${s.amsT_FirstName} : ${s.amsT_AdmNo}` : s.amsT_FirstName,
                                                value: s.amsT_Id.toString()
                                            }))}
                                            onChange={handleStudentChange}
                                            value={field.value?.map((s: any) => s.amsT_Id.toString()) ?? []}
                                            placeholder='Select Students'
                                            height='200px'
                                            isSearchRequired
                                            error={fieldState.error?.message}
                                            disabled={loadingStudents || students.length === 0}
                                        />
                                    )}
                                />
                            </div>
                        </div>

                        <div className='flex flex-col gap-3 sm:ml-32 pl-2'>
                            <Controller
                                control={control}
                                name='showRemarks'
                                render={({ field }) => (
                                    <div className='flex items-center space-x-2'>
                                        <Checkbox
                                            id='showRemarks'
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                        <Label htmlFor='showRemarks' className='cursor-pointer font-medium text-sm'>
                                            Show Remarks
                                        </Label>
                                    </div>
                                )}
                            />
                            <Controller
                                control={control}
                                name='showRankInSection'
                                render={({ field }) => (
                                    <div className='flex items-center space-x-2'>
                                        <Checkbox
                                            id='showRankInSection'
                                            checked={field.value}
                                            onCheckedChange={(checked) => {
                                                field.onChange(checked);
                                                setValue('showRank', !!checked);
                                            }}
                                        />
                                        <Label htmlFor='showRankInSection' className='cursor-pointer font-medium text-sm'>
                                            Show Rank in Section
                                        </Label>
                                    </div>
                                )}
                            />
                        </div>
                    </div>
                </div>

                <div className='flex justify-center gap-4 pt-4 border-t'>
                    <Button type='submit' disabled={isSubmitting || !hasStudentsSelected} className='min-w-[120px]'>
                        {isSubmitting ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <FileText className='mr-2 h-4 w-4' />}
                        Report
                    </Button>
                    <Button type='button' variant='outline' onClick={handleCancel} className='min-w-[100px]'>
                        <X className='mr-2 h-4 w-4' />
                        Cancel
                    </Button>
                    <Button
                        type='button'
                        onClick={handlePrintClick}
                        disabled={isSubmitting || !hasStudentsSelected}
                        className='min-w-[120px] bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-600 dark:hover:bg-indigo-700'
                    >
                        <Printer className='mr-2 h-4 w-4' />
                        Print
                    </Button>
                </div>
            </form>
        </FormProvider>
    );
}

