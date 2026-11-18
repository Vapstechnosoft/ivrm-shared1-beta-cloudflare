'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError, Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    getGeneralSendSMSClasses,
    getGeneralSendSMSExamsAndGrades,
    getGeneralSendSMSOnLoad,
    getGeneralSendSMSSections,
    getGeneralSendSMSStudentList
} from '@/server/exam/exam-module/reports/GeneralSendSMSSRKVSController';
import { zodResolver } from '@hookform/resolvers/zod';
import { List, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = z
    .object({
        ASMAY_Id: z.string().min(1, 'Select Academic Year'),
        ASMCL_Id: z.string().min(1, 'Select Class'),
        ASMS_Id: z.string().min(1, 'Select Section'),
        GradeWise: z.boolean().default(true),
        EMGR_Id: z.string().optional(),
        selectedExams: z.array(z.string()).optional()
    })
    .refine(
        (data) => {
            if (data.GradeWise) {
                return !!data.EMGR_Id && data.selectedExams && data.selectedExams.length > 0;
            }
            return true;
        },
        {
            message: 'Select Grade and at least one Exam when Grade Wise is enabled',
            path: ['EMGR_Id']
        }
    );

type FormSchema = z.infer<typeof formSchema>;

interface SMSFormProps {
    onDataFetched: (data: any[], params: any) => void;
    onReset: () => void;
}

export const SMSForm = ({ onDataFetched, onReset }: SMSFormProps) => {
    const [academicYears, setAcademicYears] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [grades, setGrades] = useState<any[]>([]);
    const [exams, setExams] = useState<any[]>([]);

    const [loadingYears, setLoadingYears] = useState(false);
    const [loadingClasses, setLoadingClasses] = useState(false);
    const [loadingSections, setLoadingSections] = useState(false);
    const [loadingFilters, setLoadingFilters] = useState(false);

    const methods = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            GradeWise: true,
            selectedExams: []
        }
    });

    const { control, handleSubmit, setValue, reset, formState } = methods;
    const { isSubmitting } = formState;

    const selectedYear = useWatch({ control, name: 'ASMAY_Id' });
    const selectedClass = useWatch({ control, name: 'ASMCL_Id' });
    const selectedSection = useWatch({ control, name: 'ASMS_Id' });
    const isGradeWise = useWatch({ control, name: 'GradeWise' });

    // Initial Load
    useEffect(() => {
        (async () => {
            try {
                setLoadingYears(true);
                const response = await getGeneralSendSMSOnLoad();
                if (response?.success && response.data) {
                    setAcademicYears(response.data.getyearlist || []);
                }
            } catch {
                toast.error('Failed to load initial data');
            } finally {
                setLoadingYears(false);
            }
        })();
    }, []);

    // Load Classes
    useEffect(() => {
        if (!selectedYear) return;
        (async () => {
            try {
                setLoadingClasses(true);
                const response = await getGeneralSendSMSClasses(Number(selectedYear));
                if (response?.success) setClasses(response.data.getclasslist || []);
                setValue('ASMCL_Id', '');
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
                const response = await getGeneralSendSMSSections(Number(selectedYear), Number(selectedClass));
                if (response?.success) setSections(response.data.getsectionlist || []);
                setValue('ASMS_Id', '');
            } catch {
                toast.error('Failed to load sections');
            } finally {
                setLoadingSections(false);
            }
        })();
    }, [selectedYear, selectedClass, setValue]);

    // Load Grades and Exams
    useEffect(() => {
        if (!selectedYear || !selectedClass || !selectedSection) return;
        (async () => {
            try {
                setLoadingFilters(true);
                const payload = {
                    ASMAY_Id: Number(selectedYear),
                    ASMCL_Id: Number(selectedClass),
                    ASMS_Id: Number(selectedSection)
                };
                const response = await getGeneralSendSMSExamsAndGrades(payload);
                if (response?.success && response.data) {
                    setGrades(response.data.getallgrade || []);
                    setExams(response.data.getexam || []);
                }
            } catch {
                toast.error('Failed to load grades/exams');
            } finally {
                setLoadingFilters(false);
            }
        })();
    }, [selectedYear, selectedClass, selectedSection]);

    const onSubmit = async (data: FormSchema) => {
        try {
            let payload: any = {};
            if (data.GradeWise) {
                payload = {
                    ASMAY_Id: Number(data.ASMAY_Id),
                    ASMCL_Id: Number(data.ASMCL_Id),
                    ASMS_Id: Number(data.ASMS_Id),
                    EMGR_Id: Number(data.EMGR_Id),
                    examlist: exams
                        .filter((e) => data.selectedExams?.includes(String(e.emE_Id)))
                        .map((e) => ({ EME_Id: e.emE_Id, EME_ExamName: e.emE_ExamName })),
                    ECTEX_NotApplToTotalFlg: true
                };
            } else {
                payload = {
                    ASMAY_Id: Number(data.ASMAY_Id),
                    ASMCL_Id: Number(data.ASMCL_Id),
                    ASMS_Id: Number(data.ASMS_Id),
                    TotalGrade: ''
                };
            }

            const response = await getGeneralSendSMSStudentList(payload, data.GradeWise);

            if (response?.success && response.data) {
                const list = response.data.getcumulativereportdetails || response.data.studentlist || [];

                // Grouping logic from legacy JS
                const uniqueStudents: any[] = [];
                list.forEach((dev: any) => {
                    const existing = uniqueStudents.find((s) => s.AMST_ID === dev.AMST_ID);
                    if (!existing) {
                        uniqueStudents.push({
                            AMST_ID: dev.AMST_ID,
                            AMST_Firstname: dev.AMST_Firstname,
                            AMST_AdmNo: dev.AMST_AdmNo,
                            AMST_MobileNo: dev.AMST_MobileNo,
                            AMST_emailId: dev.AMST_emailId,
                            Total: dev.Total,
                            Percentage: dev.Percentage,
                            plannerdetails: list.filter((item: any) => item.AMST_ID === dev.AMST_ID),
                            selected: false
                        });
                    }
                });

                onDataFetched(uniqueStudents, {
                    ...data,
                    year: academicYears.find((y) => String(y.asmaY_Id) === data.ASMAY_Id)?.asmaY_Year,
                    class: classes.find((c) => String(c.asmcL_Id) === data.ASMCL_Id)?.asmcL_ClassName,
                    section: sections.find((s) => String(s.asmS_Id) === data.ASMS_Id)?.asmC_SectionName
                });
                toast.success('Student data fetched');
            } else {
                toast.error('No records found');
            }
        } catch (error) {
            toast.error('Failed to fetch data');
        }
    };

    return (
        <div className='rounded-lg border bg-white p-6 shadow-sm'>
            <div className='mb-6 border-b pb-4'>
                <h3 className='font-bold text-gray-900 text-xl'>Send SMS/EMAIL</h3>
            </div>
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
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
                                                {loadingYears ? (
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

                            <div className='flex items-center space-x-2 pt-2'>
                                <Controller
                                    control={control}
                                    name='GradeWise'
                                    render={({ field }) => (
                                        <Checkbox id='grade-wise' checked={field.value} onCheckedChange={field.onChange} />
                                    )}
                                />
                                <Label htmlFor='grade-wise'>Grade Wise ?</Label>
                            </div>

                            {isGradeWise && (
                                <Controller
                                    control={control}
                                    name='EMGR_Id'
                                    render={({ field, fieldState }) => (
                                        <div className='space-y-2'>
                                            <Label>
                                                Grade <span className='text-red-500'>*</span>
                                            </Label>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Select Grade' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {loadingFilters ? (
                                                        <SelectItem value='0' disabled>
                                                            Loading...
                                                        </SelectItem>
                                                    ) : (
                                                        grades.map((g) => (
                                                            <SelectItem key={g.emgR_Id} value={String(g.emgR_Id)}>
                                                                {g.emgR_GradeName}
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                        </div>
                                    )}
                                />
                            )}
                        </div>

                        <div className='space-y-4'>
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

                            {isGradeWise && (
                                <div className='space-y-2'>
                                    <Label>
                                        Exams <span className='text-red-500'>*</span>
                                    </Label>
                                    <div className='max-h-40 space-y-2 overflow-y-auto rounded-md border p-3'>
                                        {loadingFilters ? (
                                            <p className='text-gray-500 text-sm'>Loading exams...</p>
                                        ) : (
                                            exams.map((ex) => (
                                                <div key={ex.emE_Id} className='flex items-center space-x-2'>
                                                    <Controller
                                                        control={control}
                                                        name='selectedExams'
                                                        render={({ field }) => (
                                                            <Checkbox
                                                                id={`ex-${ex.emE_Id}`}
                                                                checked={field.value?.includes(String(ex.emE_Id))}
                                                                onCheckedChange={(checked) => {
                                                                    const current = field.value || [];
                                                                    const next = checked
                                                                        ? [...current, String(ex.emE_Id)]
                                                                        : current.filter((id) => id !== String(ex.emE_Id));
                                                                    field.onChange(next);
                                                                }}
                                                            />
                                                        )}
                                                    />
                                                    <Label htmlFor={`ex-${ex.emE_Id}`} className='text-sm'>
                                                        {ex.emE_ExamName}
                                                    </Label>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <Controller
                                        control={control}
                                        name='selectedExams'
                                        render={({ fieldState }) => (
                                            <>{fieldState.error && <FormError>{fieldState.error.message}</FormError>}</>
                                        )}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className='flex justify-center gap-4 border-t pt-6'>
                        <Button type='submit' disabled={isSubmitting} className='bg-sky-800'>
                            {isSubmitting ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <List className='mr-2 h-4 w-4' />}
                            GET
                        </Button>
                        <Button
                            type='button'
                            variant='outline'
                            onClick={() => {
                                reset();
                                onReset();
                            }}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </FormProvider>
        </div>
    );
};
