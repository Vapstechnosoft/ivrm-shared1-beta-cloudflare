'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CustomMultiSelectBox } from '@/components/ui/custom-multiselect';
import { FormError, Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import { getPromotionalGroups } from '@/server/exam/exam-module/masters/category-class-mapping';
import { getPromotionCumulativeReport } from '@/server/exam/exam-module/reports/StThomos/promotion-cumulative-report';
import {
    getClassDropDownByAcademicYearlist,
    getSectionsDropDownByAcademicYearandClasslist,
    getStudentsDropDownByAcademicYearandClassandSectionlist
} from '@/server/exam/exam-module/reports/cumulative-report';
import { getMasterInstitution } from '@/server/exam/exam-module/reports/vvehpc_exam-report-card';
import type { IPromotionalGroup } from '@/types/exam/exam-module/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

export const promotionCumulativeSchema = z
    .object({
        ASMAY_Id: z.string().min(1, 'Academic Year is required'),
        ASMCL_Id: z.string().min(1, 'Class is required'),
        ASMS_Id: z.string().min(1, 'Section is required'),
        empG_GroupName: z.string().optional(),
        Left_FlagAverage: z.boolean(),
        selectedStudents: z.array(z.string()).min(1, 'At least one student must be selected')
    })
    .superRefine((data, ctx) => {
        // Term is required if Super Average is false
        if (!data.Left_FlagAverage && !data.empG_GroupName) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Term is required when Super Average is not selected',
                path: ['empG_GroupName']
            });
        }
    });

type PromotionCumulativeFormValues = z.infer<typeof promotionCumulativeSchema>;

interface ReportFormProps {
    onReportGenerated: (data: any, params: any) => void;
    onReset: () => void;
}

export const ReportForm = ({ onReportGenerated, onReset }: ReportFormProps) => {
    const { data: academicData, isLoading: academicYearLoading } = useAcademicYearDropdown();
    const academicYears = academicData?.data || [];

    // Dropdown States
    const [classes, setClasses] = useState<{ asmcL_Id: number; asmcL_ClassName: string }[]>([]);
    const [sections, setSections] = useState<{ asmS_Id: number; asmC_SectionName: string }[]>([]);
    const [students, setStudents] = useState<{ amsT_AdmNo: number; amsT_Id: number; studentName?: string | null }[]>([]);
    const [terms, setTerms] = useState<IPromotionalGroup[]>([]);
    const [allStudentsSelected, setAllStudentsSelected] = useState(false);

    // Loading States
    const [loadingClasses, setLoadingClasses] = useState(false);
    const [loadingSections, setLoadingSections] = useState(false);
    const [_loadingStudents, setLoadingStudents] = useState(false);
    const [loadingTerms, setLoadingTerms] = useState(false);

    const methods = useForm<PromotionCumulativeFormValues>({
        resolver: zodResolver(promotionCumulativeSchema),
        defaultValues: {
            Left_FlagAverage: false,
            selectedStudents: [],
            ASMAY_Id: '',
            ASMCL_Id: '',
            ASMS_Id: '',
            empG_GroupName: ''
        }
    });

    const { control, handleSubmit, setValue, reset, formState } = methods;
    const { isSubmitting } = formState;

    const watchYear = useWatch({ control, name: 'ASMAY_Id' });
    const watchClass = useWatch({ control, name: 'ASMCL_Id' });
    const watchSection = useWatch({ control, name: 'ASMS_Id' });
    const watchSuperAverage = useWatch({ control, name: 'Left_FlagAverage' });
    const watchTerm = useWatch({ control, name: 'empG_GroupName' });

    // Clear Term if Super Average changes to true
    useEffect(() => {
        if (watchSuperAverage) {
            setValue('empG_GroupName', '');
        }
    }, [watchSuperAverage, setValue]);

    // Load Classes
    useEffect(() => {
        if (!watchYear) return;
        (async () => {
            try {
                setLoadingClasses(true);
                const { data } = await getClassDropDownByAcademicYearlist(Number(watchYear));
                setClasses(Array.isArray(data) ? data : []);
                setValue('ASMCL_Id', '');
                setValue('ASMS_Id', '');
                setValue('empG_GroupName', '');
                setValue('selectedStudents', []);
                setAllStudentsSelected(false);
            } catch {
                toast.error('Failed to load classes');
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
                const { data } = await getSectionsDropDownByAcademicYearandClasslist(Number(watchYear), Number(watchClass));
                setSections(Array.isArray(data) ? data : []);
                setValue('ASMS_Id', '');
                setValue('selectedStudents', []);
                setAllStudentsSelected(false);
            } catch {
                toast.error('Failed to load sections');
            } finally {
                setLoadingSections(false);
            }
        })();
    }, [watchYear, watchClass, setValue]);

    // Load Students & Terms
    useEffect(() => {
        if (!watchYear || !watchClass || !watchSection) return;
        (async () => {
            try {
                setLoadingStudents(true);
                setLoadingTerms(true);
                const { data } = await getStudentsDropDownByAcademicYearandClassandSectionlist(
                    Number(watchYear),
                    Number(watchClass),
                    Number(watchSection)
                );
                const valid = Array.isArray(data)
                    ? (data as any[]).filter(
                          (
                              s
                          ): s is {
                              amsT_AdmNo: number;
                              amsT_Id: number;
                              studentName?: string;
                              amsT_FirstName?: string;
                              amsT_MiddleName?: string;
                              amsT_LastName?: string;
                          } => !!s?.amsT_Id
                      )
                    : [];

                const mappedStudents = valid.map((s) => ({
                    amsT_Id: s.amsT_Id,
                    amsT_AdmNo: s.amsT_AdmNo,
                    studentName: s.studentName || `${s.amsT_FirstName || ''} ${s.amsT_MiddleName || ''} ${s.amsT_LastName || ''}`.trim()
                }));

                setStudents(mappedStudents);
                setValue('selectedStudents', []);
                setAllStudentsSelected(false);

                // Fetch terms
                // We're mocking the Subjectwise term loading since the backend code uses complex logic to resolve terms by section
                // usually these come with studentlistdetails onchangesection endpoint, let's just make it simple using common term dropdown if missing... OR use hardcoded common ones initially
                try {
                    // Try to fetch terms from the same API or a common dropdown if needed.
                    // The angular component uses `subjectwisetotal` returned from `PromotionReportDetails/onchangesection`
                    // As we just map this with cumulative-report endpoint, we might lack `subjectwisetotal`.
                    // We can use a common dropdown for Terms if we don't have it exactly from the same endpoint.
                    // For now, let's load terms from the common dropdown 'Exm_Term_Master' if it exists, or just use hardcoded ones as placeholder
                    const { data: termsData } = await getPromotionalGroups(Number(watchYear), Number(watchClass), Number(watchSection));
                    setTerms(Array.isArray(termsData) ? termsData : []);
                    console.log('termsData', termsData);
                } catch (e) {
                    setTerms([]);
                }
            } catch {
                toast.error('Failed to load students');
            } finally {
                setLoadingStudents(false);
                setLoadingTerms(false);
            }
        })();
    }, [watchYear, watchClass, watchSection, setValue]);

    const handleAllStudents = (checked: boolean) => {
        if (checked && students.length) {
            setValue(
                'selectedStudents',
                students.map((s) => String(s.amsT_Id)),
                { shouldValidate: true }
            );
            setAllStudentsSelected(true);
        } else {
            setValue('selectedStudents', [], { shouldValidate: true });
            setAllStudentsSelected(false);
        }
    };

    const handleStudentChange = (selectedValues: string[]) => {
        setValue('selectedStudents', selectedValues, { shouldValidate: true });
        setAllStudentsSelected(selectedValues.length === students.length && students.length > 0);
    };

    const onSubmit = async (data: PromotionCumulativeFormValues) => {
        const payload = {
            ASMAY_Id: Number(data.ASMAY_Id),
            ASMCL_Id: Number(data.ASMCL_Id),
            ASMS_Id: Number(data.ASMS_Id),
            EMPG_GroupName: watchTerm,
            reporttype: data.Left_FlagAverage ? 'superaverage' : '',
            Temp_AmstIds: data.selectedStudents.map((id) => ({
                AMST_Id: Number(id)
            }))
        };
        try {
            const [result, institutionRes] = await Promise.all([getPromotionCumulativeReport(payload), getMasterInstitution()]);

            // Re-inject the selected year name, class name, section name to match angular's logic
            const selectedYear = academicYears.find((y: any) => String(y.asmaY_Id) === data.ASMAY_Id)?.asmaY_Year || '';
            const selectedClass = classes.find((c: any) => String(c.asmcL_Id) === data.ASMCL_Id)?.asmcL_ClassName || '';
            const selectedSection = sections.find((s: any) => String(s.asmS_Id) === data.ASMS_Id)?.asmC_SectionName || '';

            const finalResult = result;
            // if (!result?.data?.getstudentmarksdetails?.length && !result?.data?.getstudentwisesubjectlist?.length && !result?.data?.getstudentmarksdetails_temp?.length) {
            //     finalResult = {
            //         ...result,
            //         success: true,
            //         data: {
            //             getstudentwisesubjectlist: [
            //                 { ismS_Id: 1, ISMS_SubjectName: 'ENGLISH LANGUAGE', grporder: 1 },
            //                 { ismS_Id: 2, ISMS_SubjectName: 'ENGLISH LITERATURE', grporder: 2 },
            //                 { ismS_Id: 4, ISMS_SubjectName: '2ND LANGUAGE (HINDI)', grporder: 4 },
            //                 { ismS_Id: 5, ISMS_SubjectName: 'GENERAL SCIENCE', grporder: 5 },
            //                 { ismS_Id: 6, ISMS_SubjectName: 'MATHEMATICS', grporder: 6 },
            //                 { ismS_Id: 7, ISMS_SubjectName: 'SOCIAL STUDIES', grporder: 7 },
            //                 { ismS_Id: 8, ISMS_SubjectName: 'COMPUTER', grporder: 8 },
            //                 { ismS_Id: 9, ISMS_SubjectName: 'SPELLING & DICTATION', grporder: 9 },
            //                 { ismS_Id: 11, ISMS_SubjectName: 'GENERAL KNOWLEDGE', grporder: 10 },
            //                 { ismS_Id: 12, ISMS_SubjectName: 'MORAL SCIENCE', grporder: 11 },
            //                 { ismS_Id: 25, ISMS_SubjectName: '3RD LANGUAGE (BENGALI)', grporder: 13 }
            //             ],
            //             getstudentmarksdetails_temp: [
            //                 {
            //                     AMST_Id: 5758,
            //                     AMST_AdmNo: '18780',
            //                     studentname: 'AARIZ AHMED  ',
            //                     '2ND LANGUAGE (HINDI)': 70,
            //                     '3RD LANGUAGE (BENGALI)': 33,
            //                     'COMPUTER': 52,
            //                     'ENGLISH LANGUAGE': 58,
            //                     'ENGLISH LITERATURE': 58,
            //                     'GENERAL KNOWLEDGE': 45,
            //                     'GENERAL SCIENCE': 52,
            //                     'MATHEMATICS': 49,
            //                     'MORAL SCIENCE': 40,
            //                     'SOCIAL STUDIES': 50,
            //                     'SPELLING & DICTATION': 42
            //                 }
            //             ],
            //             St_ThomosTotal: [
            //                 {
            //                     AMST_Id: 5758,
            //                     ESTMPPSG_GroupObtMarks: 549,
            //                     estmpP_SectionRank: 1,
            //                     TotalPercentage: 61
            //                 }
            //             ]
            //         }
            //     };
            // }

            onReportGenerated(
                {
                    ...finalResult,
                    ...(finalResult?.data || {}),
                    institution: institutionRes?.data,
                    YearName: selectedYear,
                    stream: selectedClass,
                    section: selectedSection,
                    empG_GroupName: payload.EMPG_GroupName,
                    Left_FlagAverage: data.Left_FlagAverage
                },
                data
            );
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to generate report');
        }
    };

    const handleClear = () => {
        reset({
            Left_FlagAverage: false,
            selectedStudents: [],
            ASMAY_Id: '',
            ASMCL_Id: '',
            ASMS_Id: '',
            empG_GroupName: ''
        });
        setClasses([]);
        setSections([]);
        setStudents([]);
        onReset();
    };

    return (
        <div className='mx-auto w-full rounded-lg border border-gray-200 bg-white p-4 shadow-md'>
            <div className='mb-4 flex items-center justify-between border-b pb-2'>
                <h3 className='font-semibold text-gray-800 text-lg'>Promotion Details</h3>
            </div>
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                        {/* Left Column */}
                        <div className='space-y-4'>
                            <div className='space-y-2'>
                                <Controller
                                    control={control}
                                    name='ASMAY_Id'
                                    render={({ field, fieldState }) => (
                                        <div className='space-y-2'>
                                            <Label>
                                                Academic Year <span className='text-red-500'>*</span>
                                            </Label>
                                            <div className='flex-1'>
                                                <Select
                                                    key={field.value}
                                                    onValueChange={field.onChange}
                                                    value={field.value ? String(field.value) : ''}>
                                                    <SelectTrigger className='w-full'>
                                                        <SelectValue placeholder='Select Academic Year' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {academicYearLoading ? (
                                                            <SelectItem value='0' disabled>
                                                                Academic Years are loading...
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
                                            </div>
                                        </div>
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
                                                            Loading...
                                                        </SelectItem>
                                                    ) : classes.length === 0 ? (
                                                        <SelectItem value='0' disabled>
                                                            No Classes found
                                                        </SelectItem>
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
                                                            Loading...
                                                        </SelectItem>
                                                    ) : sections.length === 0 ? (
                                                        <SelectItem value='0' disabled>
                                                            No Sections found
                                                        </SelectItem>
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
                                        </>
                                    )}
                                />
                            </div>

                            {/* Term */}
                            <div className='space-y-2'>
                                <Label>Term {!watchSuperAverage && <span className='text-red-500'>*</span>}</Label>
                                <Controller
                                    control={control}
                                    name='empG_GroupName'
                                    render={({ field, fieldState }) => (
                                        <>
                                            <Select
                                                key={field.value}
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                disabled={watchSuperAverage}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Select Term' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {loadingTerms ? (
                                                        <SelectItem value='0' disabled>
                                                            Loading...
                                                        </SelectItem>
                                                    ) : terms.length === 0 ? (
                                                        <SelectItem value='0' disabled>
                                                            No Terms found
                                                        </SelectItem>
                                                    ) : (
                                                        terms.map((term, i) => (
                                                            <SelectItem key={i} value={String(term.empG_GroupName)}>
                                                                {term.empG_DisplayName}
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

                            <div className='flex space-x-6 pt-4'>
                                <div className='flex items-center space-x-2'>
                                    <Controller
                                        control={control}
                                        name='Left_FlagAverage'
                                        render={({ field }) => (
                                            <Checkbox id='superAvg' checked={field.value} onCheckedChange={field.onChange} />
                                        )}
                                    />
                                    <Label htmlFor='superAvg' className='cursor-pointer font-normal'>
                                        Super Average
                                    </Label>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Student Multi-select */}
                        <div className='space-y-4'>
                            <div className='flex flex-col gap-2 sm:flex-row sm:items-start'>
                                <Label className='flex items-center gap-2 font-medium text-sm sm:w-32'>
                                    <Checkbox checked={allStudentsSelected} onCheckedChange={handleAllStudents} />
                                    Student <span className='text-red-500'>*</span>
                                </Label>
                                <div className='flex-1'>
                                    <Controller
                                        control={control}
                                        name='selectedStudents'
                                        render={({ field, fieldState }) => (
                                            <CustomMultiSelectBox
                                                options={students.map((s) => ({
                                                    label: `${s.studentName?.trim() || 'Unknown'} - ${s.amsT_AdmNo || 'N/A'}`.trim(),
                                                    value: s.amsT_Id.toString()
                                                }))}
                                                onChange={handleStudentChange}
                                                value={field.value ?? []}
                                                placeholder='Select Students'
                                                height='300px'
                                                isSearchRequired
                                                error={fieldState.error?.message}
                                            />
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='mt-8 flex justify-center gap-4 border-t pt-6'>
                        <Button type='submit' disabled={isSubmitting} className='w-fit min-w-[100px]'>
                            {isSubmitting ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null} Report
                        </Button>
                        <Button
                            type='button'
                            variant='destructive'
                            onClick={handleClear}
                            disabled={isSubmitting}
                            className='w-fit min-w-[100px]'>
                            Cancel
                        </Button>
                    </div>
                </form>
            </FormProvider>
        </div>
    );
};
