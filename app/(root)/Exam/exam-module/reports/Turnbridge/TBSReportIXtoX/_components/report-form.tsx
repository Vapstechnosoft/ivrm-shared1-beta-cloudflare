'use client';

import { Button } from '@/components/ui/button';
import { CustomMultiSelectBox } from '@/components/ui/custom-multiselect';
import { FormError, Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import { getTBSReportIXtoX } from '@/server/exam/exam-module/reports/Turnbridge/TBSReportIXtoX';
import {
    getClassDropDownByAcademicYearlist,
    getSectionsDropDownByAcademicYearandClasslist,
    getStudentsDropDownByAcademicYearandClassandSectionlist
} from '@/server/exam/exam-module/reports/cumulative-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const tbsReportIXtoXSchema = z.object({
    ASMAY_Id: z.string().min(1, 'Select Academic Year'),
    ASMCL_Id: z.string().min(1, 'Select Class'),
    ASMS_Id: z.string().min(1, 'Select Section'),
    selectedStudents: z.array(z.string()).min(1, 'Select at least one student')
});

type TBSReportIXtoXSchema = z.infer<typeof tbsReportIXtoXSchema>;

interface AddFormProps {
    onReportGenerated: (data: any, params: any) => void;
    onReset: () => void;
}

export const AddForm = ({ onReportGenerated, onReset }: AddFormProps) => {
    const { data: academicData, isLoading: academicYearLoading } = useAcademicYearDropdown();
    const academicYears = academicData?.data || [];

    const [classes, setClasses] = useState<{ asmcL_Id: number; asmcL_ClassName: string }[]>([]);
    const [sections, setSections] = useState<{ asmS_Id: number; asmC_SectionName: string }[]>([]);
    const [students, setStudents] = useState<{ amsT_Id: number; studentname: string }[]>([]);

    const [loadingClasses, setLoadingClasses] = useState(false);
    const [loadingSections, setLoadingSections] = useState(false);
    const [loadingStudents, setLoadingStudents] = useState(false);

    const methods = useForm<TBSReportIXtoXSchema>({
        resolver: zodResolver(tbsReportIXtoXSchema),
        defaultValues: {
            selectedStudents: []
        }
    });

    const { control, handleSubmit, setValue, reset, formState } = methods;
    const { isSubmitting } = formState;

    const watchYear = useWatch({ control, name: 'ASMAY_Id' });
    const watchClass = useWatch({ control, name: 'ASMCL_Id' });
    const watchSection = useWatch({ control, name: 'ASMS_Id' });

    // Load Classes when year changes
    useEffect(() => {
        if (!watchYear) return;
        (async () => {
            try {
                setLoadingClasses(true);
                const response = await getClassDropDownByAcademicYearlist(Number(watchYear));
                if (response?.success) {
                    setClasses(response.data || []);
                }
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
                if (response?.success) {
                    setSections(response.data || []);
                }
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
                const response = await getStudentsDropDownByAcademicYearandClassandSectionlist(
                    Number(watchYear),
                    Number(watchClass),
                    Number(watchSection)
                );
                if (response?.success && response.data) {
                    const mapped = response.data.map((s: any) => ({
                        amsT_Id: s.amsT_Id,
                        studentname:
                            s.studentname ||
                            s.studentName ||
                            `${s.amsT_FirstName ?? ''} ${s.amsT_MiddleName ?? ''} ${s.amsT_LastName ?? ''}`.trim()
                    }));
                    setStudents(mapped);
                }
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

    const onSubmit = async (data: TBSReportIXtoXSchema) => {
        try {
            const payload = {
                ASMAY_Id: Number(data.ASMAY_Id),
                ASMCL_Id: Number(data.ASMCL_Id),
                ASMS_Id: Number(data.ASMS_Id),
                Temp_AmstIds: data.selectedStudents.map((id) => ({ amsT_Id: Number(id) })),
                EMPG_GroupName: '',
                EMGR_Id: 0
            };

            const response = await getTBSReportIXtoX(payload);

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

            onReportGenerated(response, extraParams);

            if (response?.success && response?.data?.getstudentdetails?.length > 0) {
                toast.success('Report generated successfully');
            } else {
                toast.error('No report data found for the selected criteria');
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
                <h3 className='font-semibold text-gray-800 text-lg'>TBS Report School IX to X</h3>
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
                                        <Label>
                                            Academic Year <span className='text-red-500'>*</span>
                                        </Label>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Academic Year' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {academicYearLoading ? (
                                                    <SelectItem value='0' disabled>
                                                        Loading...
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
                                )}
                            />

                            {/* Class */}
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
