'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    useFeeAcademicYearReport,
    useFeeSectionYearReport,
    useFeeStudentsYearReport,
    useFeeTaxReport,
    useFeeclassYearReport
} from '@/hooks/fees/useReports';
import { feeIncomeTaxReportSchema } from '@/schemas/fees/reports';
import type { IFeeIncomeTaxReportResult } from '@/types/fees/reports/FeeIncomeTax_Report';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileText, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof feeIncomeTaxReportSchema>;

interface FeeIncomeTaxFormProps {
    onReportGenerated: (data: IFeeIncomeTaxReportResult[]) => void;
    onReset: () => void;
}

export default function FeeIncomeTaxForm({ onReportGenerated, onReset }: FeeIncomeTaxFormProps) {
    const [resetKey, setResetKey] = useState(0);
    const { data: academicYears, isLoading: isAcademicYearsLoading, error: academicYearsError } = useFeeAcademicYearReport({} as any);
    console.log('academicYears.data:', academicYears?.data);

    const { data: classes, isLoading: isClassesLoading, error: classesError } = useFeeclassYearReport({} as any);
    console.log('class.data:', classes?.data);

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(feeIncomeTaxReportSchema),
        mode: 'onChange',
        defaultValues: {
            asmaY_Id: undefined,
            asmcL_Id: undefined,
            asmS_Id: undefined,
            amst_Id: undefined
        }
    });

    const selectedYear = watch('asmaY_Id');
    const selectedClass = watch('asmcL_Id');
    const selectedSection = watch('asmS_Id');

    const {
        data: sections,
        isLoading: isSectionsLoading,
        error: sectionsError
    } = useFeeSectionYearReport({
        asmaY_Id: selectedYear,
        asmcL_Id: selectedClass
    });
    console.log('section.data:', sections?.data);

    const {
        data: students,
        isLoading: isStudentsLoading,
        error: studentsError
    } = useFeeStudentsYearReport({
        asmaY_Id: selectedYear,
        asmcL_Id: selectedClass,
        amsC_Id: selectedSection
    });

    const { mutateAsync: getTaxReport, isPending: isTaxReportLoading } = useFeeTaxReport();

    // Reset dependent fields
    useEffect(() => {
        setValue('asmS_Id', undefined as any);
        setValue('amst_Id', undefined as any);
    }, [selectedYear, selectedClass, setValue]);

    useEffect(() => {
        setValue('amst_Id', undefined as any);
    }, [selectedSection, setValue]);

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const response = await getTaxReport({
                asmaY_Id: data.asmaY_Id,
                asmcL_Id: data.asmcL_Id,
                amsC_Id: data.asmS_Id,
                amsT_Id: data.amst_Id
            });

            if (response?.success && Array.isArray(response.data) && response.data.length > 0) {
                onReportGenerated(response.data);
                toast.success('Report generated successfully');
            } else {
                toast.error(response?.message || 'No records found for the selected criteria');
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error?.message);
        }
    };
    const handleReset = () => {
        reset({
            asmaY_Id: undefined,
            asmcL_Id: undefined,
            asmS_Id: undefined,
            amst_Id: undefined
        });
        setResetKey((prev) => prev + 1);
        if (onReset) {
            onReset();
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            <div key={resetKey} className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
                {/* Academic Year */}
                <div className='space-y-2'>
                    <Label>
                        Academic Year<span className='ml-1 text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='asmaY_Id'
                        control={control}
                        render={({ field }) => (
                            <Select value={field.value ? String(field.value) : ''} onValueChange={(value) => field.onChange(Number(value))}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select Year' />
                                </SelectTrigger>
                                <SelectContent>
                                    {isAcademicYearsLoading ? (
                                        <SelectItem value='loading' disabled>
                                            Loading...
                                        </SelectItem>
                                    ) : academicYearsError ? (
                                        <SelectItem value='error' disabled>
                                            Error loading years
                                        </SelectItem>
                                    ) : (
                                        academicYears?.data?.map((year: any) => (
                                            <SelectItem key={year.asmaY_Id} value={year.asmaY_Id.toString()}>
                                                {year.asmaY_Year}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.asmaY_Id && <FormError>{errors.asmaY_Id.message}</FormError>}
                </div>

                {/* Class */}
                <div className='space-y-2'>
                    <Label>
                        Class<span className='ml-1 text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='asmcL_Id'
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value ? String(field.value) : ''}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select Class' />
                                </SelectTrigger>
                                <SelectContent>
                                    {isClassesLoading ? (
                                        <SelectItem value='loading' disabled>
                                            Loading...
                                        </SelectItem>
                                    ) : classesError ? (
                                        <SelectItem value='error' disabled>
                                            Error loading classes
                                        </SelectItem>
                                    ) : (
                                        classes?.data?.map((cls: any) => (
                                            <SelectItem key={cls.asmcL_Id} value={cls.asmcL_Id.toString()}>
                                                {cls.asmcL_ClassName}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.asmcL_Id && <FormError>{errors.asmcL_Id.message}</FormError>}
                </div>

                {/* Section */}
                <div className='space-y-2'>
                    <Label>
                        Section<span className='ml-1 text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='asmS_Id'
                        control={control}
                        render={({ field }) => (
                            <Select
                                onValueChange={(value) => field.onChange(Number(value))}
                                value={field.value ? String(field.value) : ''}
                                disabled={!selectedYear || !selectedClass}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select Section' />
                                </SelectTrigger>
                                <SelectContent>
                                    {isSectionsLoading ? (
                                        <SelectItem value='loading' disabled>
                                            Loading...
                                        </SelectItem>
                                    ) : sectionsError ? (
                                        <SelectItem value='error' disabled>
                                            Error loading sections
                                        </SelectItem>
                                    ) : (
                                        sections?.data?.map((sec: any) => (
                                            <SelectItem key={sec.asmS_Id} value={sec.asmS_Id.toString()}>
                                                {sec.asmC_SectionName}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.asmS_Id && <FormError>{errors.asmS_Id.message}</FormError>}
                </div>

                {/* Student */}
                <div className='space-y-2'>
                    <Label>
                        Student<span className='ml-1 text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='amst_Id'
                        control={control}
                        render={({ field }) => (
                            <Select
                                onValueChange={(value) => field.onChange(Number(value))}
                                value={field.value ? String(field.value) : ''}
                                disabled={!selectedSection}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select Student' />
                                </SelectTrigger>
                                <SelectContent>
                                    {isStudentsLoading ? (
                                        <SelectItem value='loading' disabled>
                                            Loading...
                                        </SelectItem>
                                    ) : studentsError ? (
                                        <SelectItem value='error' disabled>
                                            Error loading students
                                        </SelectItem>
                                    ) : (
                                        students?.data?.map((stud: any) => (
                                            <SelectItem key={stud.amst_Id} value={stud.amst_Id.toString()}>
                                                {stud.studentName} ({stud.amst_AdmNo})
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.amst_Id && <FormError>{errors.amst_Id.message}</FormError>}
                </div>
            </div>

            <div className='flex justify-center gap-4 pt-4'>
                <Button
                    type='submit'
                    disabled={isSubmitting}
                    isLoading={isSubmitting}
                    className='w-40 transition-all duration-200 hover:scale-105'>
                    <FileText className='mr-2 h-4 w-4' />
                    Get Report
                </Button>
                <Button type='button' variant='outline' onClick={handleReset} className='w-40 transition-all duration-200 hover:scale-105'>
                    <RotateCcw className='mr-2 h-4 w-4' />
                    Reset
                </Button>
            </div>
        </form>
    );
}
