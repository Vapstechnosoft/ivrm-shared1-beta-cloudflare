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
    getSectionsDropDownByAcademicYearandClasslist,
    getStudentsDropDownByAcademicYearandClassandSectionlist
} from '@/server/exam/exam-module/reports/cumulative-report';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

export default function ProgressCardReportForm({
    onSuccess
}: {
    onSuccess?: (payload: any) => Promise<void> | void;
}) {
    const methods = useForm<any>({
        mode: 'all',
        defaultValues: {
            asmaY_Id: '',
            asmcL_Id: '',
            asmS_Id: '',
            emE_Id: '',
            studentList: []
        }
    });

    const { control, handleSubmit, reset, setValue, formState } = methods;
    const { isSubmitting } = formState;

    const [academicYears, setAcademicYears] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [exams, setExams] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [allStudentsSelected, setAllStudentsSelected] = useState(false);

    const { data: academicData, isLoading: academicYearLoading } = useAcademicYearDropdown();

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
        if (academicData?.data) {
            setAcademicYears(academicData.data);
        }
    }, [academicData]);

    useEffect(() => {
        if (!selectedYear) return;
        (async () => {
            try {
                setLoadingClasses(true);
                const { data } = await getClassDropDownByAcademicYearlist(Number(selectedYear));
                setClasses(data || []);
                setValue('asmcL_Id', '');
                setValue('asmS_Id', '');
                setValue('emE_Id', '');
                setValue('studentList', []);
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
                const { data } = await getSectionsDropDownByAcademicYearandClasslist(Number(selectedYear), Number(selectedClass));
                setSections(data || []);
                setValue('asmS_Id', '');
                setValue('emE_Id', '');
                setValue('studentList', []);
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
                const { data } = await getExamsDropDownByAcademicYearandClassandSectionlist(
                    Number(selectedYear),
                    Number(selectedClass),
                    Number(selectedSection)
                );
                setExams(data || []);
                setValue('emE_Id', '');
            } catch {
                toast.error('Failed to load exams');
            } finally {
                setLoadingExams(false);
            }
        })();
    }, [selectedYear, selectedClass, selectedSection, setValue]);

    useEffect(() => {
        if (!selectedYear || !selectedClass || !selectedSection) return;
        (async () => {
            try {
                setLoadingStudents(true);
                const { data } = await getStudentsDropDownByAcademicYearandClassandSectionlist(
                    Number(selectedYear),
                    Number(selectedClass),
                    Number(selectedSection)
                );
                const mapped = (data || []).map((s: any) => ({
                    amsT_Id: s.amsT_Id,
                    studentName: s.studentName || `${s.amsT_FirstName || ''} ${s.amsT_AdmNo || ''}`.trim()
                }));
                setStudents(mapped);
                setValue('studentList', []);
            } catch {
                toast.error('Failed to load students');
            } finally {
                setLoadingStudents(false);
            }
        })();
    }, [selectedYear, selectedClass, selectedSection, setValue]);

    const onSubmit = async (data: any) => {
        if (!hasStudentsSelected) {
            toast.error('Please select at least one student');
            return;
        }

        const selectedYearObj = academicYears.find((y) => String(y.asmaY_Id) === String(data.asmaY_Id));
        const selectedExamObj = exams.find((e) => String(e.emE_Id) === String(data.emE_Id));
        const studentIdsArray = data.studentList.map((s: any) => Number(s.amsT_Id));

        const payload: any = {
            ASMAY_Id: Number(data.asmaY_Id),
            ASMCL_Id: Number(data.asmcL_Id),
            ASMS_Id: Number(data.asmS_Id),
            EME_Id: Number(data.emE_Id),
            AMST_Ids: studentIdsArray.join(','),
            yearName: selectedYearObj?.asmaY_Year || '',
            examName: selectedExamObj?.emE_ExamName || '',
            examCode: selectedExamObj?.emE_ExamCode || '',
            fromDate: new Date().toISOString(),
            toDate: new Date().toISOString()
        };

        if (onSuccess) {
            await onSuccess(payload);
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

    return (
        <div className='rounded-lg border bg-card text-card-foreground shadow-sm'>
            <CollapsibleContent className='p-6' forceMount>
                <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6' noValidate>
                        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                            <div className='space-y-6'>
                                <Controller
                                    control={control}
                                    name='asmaY_Id'
                                    rules={{ required: 'Select Academic Year' }}
                                    render={({ field, fieldState }) => (
                                        <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                                            <Label className='font-medium text-sm sm:w-32'>
                                                Academic Year <span className='text-red-500'>*</span>
                                            </Label>
                                            <div className='flex-1'>
                                                <Select
                                                    onValueChange={(v) => field.onChange(v)}
                                                    value={field.value ? String(field.value) : ''}>
                                                    <SelectTrigger className='w-full'>
                                                        <SelectValue placeholder='Select Academic Year' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {academicYearLoading ? (
                                                            <SelectItem value='loading' disabled>
                                                                Loading...
                                                            </SelectItem>
                                                        ) : academicYears.length === 0 ? (
                                                            <SelectItem value='none' disabled>
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
                                    rules={{ required: 'Select Class' }}
                                    render={({ field, fieldState }) => (
                                        <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                                            <Label className='font-medium text-sm sm:w-32'>
                                                Class <span className='text-red-500'>*</span>
                                            </Label>
                                            <div className='flex-1'>
                                                <Select
                                                    onValueChange={(v) => field.onChange(v)}
                                                    value={field.value ? String(field.value) : ''}>
                                                    <SelectTrigger className='w-full'>
                                                        <SelectValue placeholder='Select Class' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {loadingClasses ? (
                                                            <SelectItem value='loading' disabled>
                                                                Loading...
                                                            </SelectItem>
                                                        ) : classes.length === 0 ? (
                                                            <SelectItem value='none' disabled>
                                                                No Classes found
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
                                            </div>
                                        </div>
                                    )}
                                />

                                <Controller
                                    control={control}
                                    name='asmS_Id'
                                    rules={{ required: 'Select Section' }}
                                    render={({ field, fieldState }) => (
                                        <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                                            <Label className='font-medium text-sm sm:w-32'>
                                                Section <span className='text-red-500'>*</span>
                                            </Label>
                                            <div className='flex-1'>
                                                <Select
                                                    onValueChange={(v) => field.onChange(v)}
                                                    value={field.value ? String(field.value) : ''}>
                                                    <SelectTrigger className='w-full'>
                                                        <SelectValue placeholder='Select Section' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {loadingSections ? (
                                                            <SelectItem value='loading' disabled>
                                                                Loading...
                                                            </SelectItem>
                                                        ) : sections.length === 0 ? (
                                                            <SelectItem value='none' disabled>
                                                                No Sections found
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
                                            </div>
                                        </div>
                                    )}
                                />

                                <Controller
                                    control={control}
                                    name='emE_Id'
                                    rules={{ required: 'Select Exam Name' }}
                                    render={({ field, fieldState }) => (
                                        <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                                            <Label className='font-medium text-sm sm:w-32'>
                                                Exam Name <span className='text-red-500'>*</span>
                                            </Label>
                                            <div className='flex-1'>
                                                <Select
                                                    onValueChange={(v) => field.onChange(v)}
                                                    value={field.value ? String(field.value) : ''}>
                                                    <SelectTrigger className='w-full'>
                                                        <SelectValue placeholder='Select Exam' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {loadingExams ? (
                                                            <SelectItem value='loading' disabled>
                                                                Loading...
                                                            </SelectItem>
                                                        ) : exams.length === 0 ? (
                                                            <SelectItem value='none' disabled>
                                                                No Exams found
                                                            </SelectItem>
                                                        ) : (
                                                            exams.map((e: any) => (
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
                                    <Label className='flex items-center gap-2 font-medium text-sm sm:w-32'>
                                        <Checkbox checked={allStudentsSelected} onCheckedChange={handleAllStudents} />
                                        Student <span className='text-red-500'>*</span>
                                    </Label>
                                    <div className='flex-1'>
                                        <Controller
                                            control={control}
                                            name='studentList'
                                            rules={{ required: 'Select at least one student' }}
                                            render={({ field, fieldState }) => (
                                                <CustomMultiSelectBox
                                                    options={students.map((s) => ({
                                                        label: s.studentName,
                                                        value: s.amsT_Id.toString()
                                                    }))}
                                                    onChange={handleStudentChange}
                                                    value={field.value?.map((s: any) => s.amsT_Id.toString()) ?? []}
                                                    placeholder='Select Students'
                                                    height='200px'
                                                    isSearchRequired
                                                    error={fieldState.error?.message}
                                                />
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>
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
                                    setStudents([]);
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
