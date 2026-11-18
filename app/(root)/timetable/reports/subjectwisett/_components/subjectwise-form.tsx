'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSubjectDropDown, useTimeTableAcademicYear } from '@/hooks/timetable/useMasters';
import { subjectWiseReportSchema } from '@/schemas/timetable/reports';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Search, X } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import type { z } from 'zod';

type FormFields = z.infer<typeof subjectWiseReportSchema.search>;

import { useTimeTableClassDropdown } from '@/hooks/timetable/reports';
import { getSubjectWiseReport } from '@/server/timetable/reports/subjectwisett';

interface SubjectWiseFormProps {
    initialData: any;
    onReportGenerated: (response: any, payload: any) => void;
    onCancel: () => void;
}

export default function SubjectWiseForm({ initialData, onReportGenerated, onCancel }: SubjectWiseFormProps) {
    const { data: academicyeardata, isLoading: academicyearloading } = useTimeTableAcademicYear();

    const { data: classdropdowndata, isLoading: classloading } = useTimeTableClassDropdown();

    const { data: subjectdropdowndata, isLoading: subjectloading } = useSubjectDropDown();

    const academicList = Array.isArray(academicyeardata) ? academicyeardata : (academicyeardata as any)?.data || [];
    const classList = Array.isArray(classdropdowndata) ? classdropdowndata : (classdropdowndata as any)?.data || [];
    const subjectList = Array.isArray(subjectdropdowndata) ? subjectdropdowndata : (subjectdropdowndata as any)?.data || [];

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset
    } = useForm<FormFields>({
        resolver: zodResolver(subjectWiseReportSchema.search),
        defaultValues: {
            asmaY_Id: undefined,
            classId: [],
            subjectId: []
        }
    });

    const handleCancelClick = () => {
        reset();
        onCancel();
    };

    const onFormSubmit = async (data: FormFields) => {
        const selectedClasses = classList.filter((c: any) => data.classId?.includes(c.asmcL_Id));
        // Ensure property name matches API response. Usually ismS_Id for subjects.
        const selectedSubjects = subjectList.filter((s: any) => data.subjectId?.includes(s.ismS_Id));

        const payload = {
            asmaY_Id: data.asmaY_Id,
            ASMAY_Id: data.asmaY_Id,
            classarray: selectedClasses,
            subarray: selectedSubjects,
            subjectarray: selectedSubjects
        };

        try {
            console.log('Subject wise tt payload:', JSON.stringify(payload));
            const response = await getSubjectWiseReport(payload);
            console.log('Subject wise tt response:', response);
            onReportGenerated(response, payload);
        } catch (error: any) {
            console.error('Error generating subject wise report:', error);
            // no need to throw unless you want to propagate it
        }
    };

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className='space-y-6 rounded-lg border bg-white p-6 shadow-sm'>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                {/* Academic Year */}
                <div className='space-y-2'>
                    <Label>
                        Academic Year <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        control={control}
                        name='asmaY_Id'
                        render={({ field }) => (
                            <Select
                                key={field.value ?? 'empty'}
                                onValueChange={(val) => field.onChange(Number(val))}
                                value={field.value?.toString()}>
                                <SelectTrigger>
                                    <SelectValue placeholder='--Select--' />
                                </SelectTrigger>
                                <SelectContent>
                                    {academicList?.map((item: any) => (
                                        <SelectItem key={item.asmaY_Id} value={item.asmaY_Id?.toString() || ''}>
                                            {item.asmaY_Year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.asmaY_Id && <span className='text-red-500 text-sm'>{errors.asmaY_Id.message}</span>}
                </div>

                {/* Class */}
                <div className='space-y-2'>
                    <Label>
                        Class <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        control={control}
                        name='classId'
                        render={({ field }) => (
                            <MultiSelect
                                options={classList?.map((c: any) => ({ label: c.asmcL_ClassName, value: c.asmcL_Id?.toString() || '' }))}
                                defaultValue={(field.value || []).map(String)}
                                onValueChange={(val) => field.onChange(val.map(Number))}
                                placeholder='Select Classes'
                            />
                        )}
                    />
                    {errors.classId && <span className='text-red-500 text-sm'>{errors.classId.message}</span>}
                </div>

                {/* Subject */}
                <div className='space-y-2'>
                    <Label>
                        Subject <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        control={control}
                        name='subjectId'
                        render={({ field }) => (
                            <MultiSelect
                                options={subjectList?.map((s: any) => ({ label: s.ismS_SubjectName, value: s.ismS_Id?.toString() || '' }))}
                                defaultValue={(field.value || []).map(String)}
                                onValueChange={(val) => field.onChange(val.map(Number))}
                                placeholder='Select Subjects'
                            />
                        )}
                    />
                    {errors.subjectId && <span className='text-red-500 text-sm'>{errors.subjectId.message}</span>}
                </div>
            </div>

            <div className='flex justify-center space-x-2'>
                <Button type='submit' disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                    <Search className='mr-2 h-4 w-4' />
                    Report
                </Button>
                <Button type='button' variant='outline' onClick={handleCancelClick}>
                    <X className='mr-2 h-4 w-4' />
                    Cancel
                </Button>
            </div>
        </form>
    );
}
