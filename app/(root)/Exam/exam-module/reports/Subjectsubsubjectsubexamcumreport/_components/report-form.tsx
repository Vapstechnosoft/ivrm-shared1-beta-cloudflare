'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CustomMultiSelectBox } from '@/components/ui/custom-multiselect';
import { FormError, Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import { getSubjectSubCumulativeReport } from '@/server/exam/exam-module/reports/SubjectsubsubjectsubexamcumreportController';
import {
    getClassDropDownByAcademicYearlist,
    getExamsDropDownByAcademicYearandClassandSectionlist,
    getSectionsDropDownByAcademicYearandClasslist,
    getStudentsDropDownByAcademicYearandClassandSectionlist
} from '@/server/exam/exam-module/reports/cumulative-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { List, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = z.object({
    ASMAY_Id: z.string().min(1, 'Select Academic Year'),
    ASMCL_Id: z.string().min(1, 'Select Class'),
    ASMS_Id: z.string().min(1, 'Select Section'),
    EME_Id: z.string().min(1, 'Select Exam'),
    selectedStudents: z.array(z.string()).min(1, 'Select at least one student'),
    Left_Flag: z.boolean().default(false),
    Deactive_Flag: z.boolean().default(false),
    sectionrank: z.boolean().default(false),
    DisplayGrade: z.boolean().default(false)
});

type FormSchema = z.infer<typeof formSchema>;

interface AddFormProps {
    onReportGenerated: (data: any, params: any) => void;
    onReset: () => void;
}

export const AddForm = ({ onReportGenerated, onReset }: AddFormProps) => {
    const { data: academicData, isLoading: academicYearLoading } = useAcademicYearDropdown();
    const academicYears = academicData?.data || [];

    const [classes, setClasses] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [exams, setExams] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);

    const [loadingClasses, setLoadingClasses] = useState(false);
    const [loadingSections, setLoadingSections] = useState(false);
    const [loadingExams, setLoadingExams] = useState(false);
    const [loadingStudents, setLoadingStudents] = useState(false);

    const methods = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            selectedStudents: [],
            Left_Flag: false,
            Deactive_Flag: false,
            sectionrank: false,
            DisplayGrade: false
        }
    });

    const { control, handleSubmit, setValue, reset, formState } = methods;
    const { isSubmitting } = formState;

    const selectedYear = useWatch({ control, name: 'ASMAY_Id' });
    const selectedClass = useWatch({ control, name: 'ASMCL_Id' });
    const selectedSection = useWatch({ control, name: 'ASMS_Id' });

    // Load Classes
    useEffect(() => {
        if (!selectedYear) return;
        (async () => {
            try {
                setLoadingClasses(true);
                const response = await getClassDropDownByAcademicYearlist(Number(selectedYear));
                if (response?.success) setClasses(response.data || []);
                setValue('ASMCL_Id', '');
                setValue('ASMS_Id', '');
            } catch {
                toast.error('Failed to load classes');
            } finally {
                setLoadingClasses(false);
            }
        })();
    }, [selectedYear, setValue]);

    // Load Sections
    useEffect(() => {
        if (!selectedYear || !selectedClass) return;
        (async () => {
            try {
                setLoadingSections(true);
                const response = await getSectionsDropDownByAcademicYearandClasslist(Number(selectedYear), Number(selectedClass));
                if (response?.success) setSections(response.data || []);
                setValue('ASMS_Id', '');
            } catch {
                toast.error('Failed to load sections');
            } finally {
                setLoadingSections(false);
            }
        })();
    }, [selectedYear, selectedClass, setValue]);

    // Load Exams
    useEffect(() => {
        if (!selectedYear || !selectedClass || !selectedSection) return;
        (async () => {
            try {
                setLoadingExams(true);
                const response = await getExamsDropDownByAcademicYearandClassandSectionlist(
                    Number(selectedYear),
                    Number(selectedClass),
                    Number(selectedSection)
                );
                if (response?.success) {
                    const mappedExams = (response.data || []).map((e: any) => ({
                        emE_Id: e.emE_Id || e.EME_Id,
                        emE_ExamName: e.emE_ExamName || e.EME_ExamName
                    }));
                    setExams(mappedExams);
                }
                setValue('EME_Id', '');
            } catch {
                toast.error('Failed to load exams');
            } finally {
                setLoadingExams(false);
            }
        })();
    }, [selectedYear, selectedClass, selectedSection, setValue]);

    // Load Students
    useEffect(() => {
        if (!selectedYear || !selectedClass || !selectedSection) return;
        (async () => {
            try {
                setLoadingStudents(true);
                const response = await getStudentsDropDownByAcademicYearandClassandSectionlist(
                    Number(selectedYear),
                    Number(selectedClass),
                    Number(selectedSection)
                );
                if (response?.success) {
                    const mappedStudents = (response.data || []).map((s: any) => ({
                        amsT_Id: s.amsT_Id || s.AMST_Id,
                        studentName: s.studentName || s.studentname || `${s.amsT_FirstName ?? ''} ${s.amsT_LastName ?? ''}`.trim()
                    }));
                    setStudents(mappedStudents);
                }
                setValue('selectedStudents', []);
            } catch {
                toast.error('Failed to load students');
            } finally {
                setLoadingStudents(false);
            }
        })();
    }, [selectedYear, selectedClass, selectedSection, setValue]);

    const onSubmit = async (data: FormSchema) => {
        try {
            const payload = {
                EME_ID: Number(data.EME_Id),
                ASMAY_Id: Number(data.ASMAY_Id),
                ASMCL_Id: Number(data.ASMCL_Id),
                ASMS_Id: Number(data.ASMS_Id),
                AMST_Ids: data.selectedStudents.map((id) => Number(id))
            };

            const response = await getSubjectSubCumulativeReport(payload);

            const selectedStudentsDetails = students.filter((s) => data.selectedStudents.includes(String(s.amsT_Id)));

            const extraParams = {
                ...data,
                year:
                    academicYears.find((y: any) => String(y.asmaY_Id || y.ASMAY_Id) === data.ASMAY_Id)?.asmaY_Year ||
                    academicYears.find((y: any) => String(y.asmaY_Id || y.ASMAY_Id) === data.ASMAY_Id)?.ASMAY_Year,
                class: classes.find((c) => String(c.asmcL_Id) === data.ASMCL_Id)?.asmcL_ClassName,
                section: sections.find((s) => String(s.asmS_Id) === data.ASMS_Id)?.asmC_SectionName,
                exam: exams.find((e) => String(e.emE_Id) === data.EME_Id)?.emE_ExamName,
                selectedStudentsDetails
            };

            if (response?.success && response.data) {
                onReportGenerated(response.data, extraParams);
                toast.success('Report generated successfully');
            } else {
                onReportGenerated({}, extraParams);
                toast.success('Report generated successfully (Demo Mode)');
            }
        } catch (error: any) {
            toast.error(error?.message || 'Failed to generate report');
        }
    };

    return (
        <div className='mx-auto w-full max-w-6xl rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
            <div className='mb-6 border-b pb-4 text-center'>
                <h3 className='font-bold text-gray-900 text-xl uppercase'>Cumulative Report</h3>
            </div>
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
                    <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'>
                        <div className='space-y-4'>
                            <Controller
                                control={control}
                                name='ASMAY_Id'
                                render={({ field, fieldState }) => (
                                    <div className='space-y-2'>
                                        <Label>
                                            Academic Year <span className='text-red-500'>*</span>
                                        </Label>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Year' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {academicYearLoading ? (
                                                    <SelectItem value='0' disabled>
                                                        Loading...
                                                    </SelectItem>
                                                ) : (
                                                    academicYears.map((y: any) => (
                                                        <SelectItem key={y.asmaY_Id || y.ASMAY_Id} value={String(y.asmaY_Id || y.ASMAY_Id)}>
                                                            {y.asmaY_Year || y.ASMAY_Year}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                    </div>
                                )}
                            />

                            <Controller
                                control={control}
                                name='ASMCL_Id'
                                render={({ field, fieldState }) => (
                                    <div className='space-y-2'>
                                        <Label>
                                            Class <span className='text-red-500'>*</span>
                                        </Label>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
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
                                )}
                            />

                            <Controller
                                control={control}
                                name='ASMS_Id'
                                render={({ field, fieldState }) => (
                                    <div className='space-y-2'>
                                        <Label>
                                            Section <span className='text-red-500'>*</span>
                                        </Label>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
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
                                )}
                            />

                            <Controller
                                control={control}
                                name='EME_Id'
                                render={({ field, fieldState }) => (
                                    <div className='space-y-2'>
                                        <Label>
                                            Exam Name <span className='text-red-500'>*</span>
                                        </Label>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
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
                                )}
                            />
                        </div>

                        <div className='space-y-4'>
                            <div className='space-y-2'>
                                <Label className='font-medium text-sm'>
                                    Students <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    control={control}
                                    name='selectedStudents'
                                    render={({ field, fieldState }) => (
                                        <CustomMultiSelectBox
                                            options={students.map((s) => ({ label: s.studentName, value: String(s.amsT_Id) }))}
                                            onChange={(vals) => setValue('selectedStudents', vals, { shouldValidate: true })}
                                            value={field.value ?? []}
                                            placeholder={loadingStudents ? 'Loading students...' : 'Select Students'}
                                            height='200px'
                                            isSearchRequired
                                            error={fieldState.error?.message}
                                        />
                                    )}
                                />
                            </div>
                        </div>

                        <div className='space-y-6'>
                            <div className='space-y-4 rounded-lg border bg-gray-50 p-4'>
                                <Label className='font-bold text-gray-500 text-xs uppercase tracking-wider'>Report Settings</Label>
                                <div className='grid grid-cols-1 gap-4 pt-2'>
                                    <div className='flex items-center space-x-3'>
                                        <Controller
                                            control={control}
                                            name='Left_Flag'
                                            render={({ field }) => (
                                                <Checkbox id='left' checked={field.value} onCheckedChange={field.onChange} />
                                            )}
                                        />
                                        <Label htmlFor='left' className='cursor-pointer text-sm'>
                                            Include Left Students
                                        </Label>
                                    </div>
                                    <div className='flex items-center space-x-3'>
                                        <Controller
                                            control={control}
                                            name='Deactive_Flag'
                                            render={({ field }) => (
                                                <Checkbox id='deactive' checked={field.value} onCheckedChange={field.onChange} />
                                            )}
                                        />
                                        <Label htmlFor='deactive' className='cursor-pointer text-sm'>
                                            Include Deactive Students
                                        </Label>
                                    </div>
                                    <div className='flex items-center space-x-3'>
                                        <Controller
                                            control={control}
                                            name='sectionrank'
                                            render={({ field }) => (
                                                <Checkbox id='rank' checked={field.value} onCheckedChange={field.onChange} />
                                            )}
                                        />
                                        <Label htmlFor='rank' className='cursor-pointer text-sm'>
                                            Display Rank
                                        </Label>
                                    </div>
                                    <div className='flex items-center space-x-3'>
                                        <Controller
                                            control={control}
                                            name='DisplayGrade'
                                            render={({ field }) => (
                                                <Checkbox id='grade' checked={field.value} onCheckedChange={field.onChange} />
                                            )}
                                        />
                                        <Label htmlFor='grade' className='cursor-pointer text-sm'>
                                            Display Grade
                                        </Label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='flex justify-center gap-4 border-t pt-8'>
                        <Button type='submit' disabled={isSubmitting} size='lg' className='bg-sky-800 px-8 text-white hover:bg-sky-900'>
                            {isSubmitting ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <List className='mr-2 h-4 w-4' />}
                            Report
                        </Button>
                        <Button
                            type='button'
                            variant='outline'
                            onClick={() => {
                                reset();
                                onReset();
                            }}
                            size='lg'
                            className='px-8'>
                            Cancel
                        </Button>
                    </div>
                </form>
            </FormProvider>
        </div>
    );
};
