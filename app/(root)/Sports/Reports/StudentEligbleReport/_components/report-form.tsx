'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStudentEligibleReport } from '@/hooks/sports/useStudentEligibleReport';
import { type IStudentEligibleReport, studentEligibleReportSchema } from '@/types/sports/reports/student-eligible-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileSpreadsheet, FileText, Loader2, Printer, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface ReportFormProps {
    onReport: (data: any, payload: any) => void;
    onReset: () => void;
    onPrint: () => void;
    onExcel: () => void;
    hasData: boolean;
    isLoading?: boolean;
}

export default function ReportForm({ onReport, onReset, onPrint, onExcel, hasData, isLoading }: ReportFormProps) {
    const { data: loadGridData, getClasses, getSections, getStudents } = useStudentEligibleReport();
    const [showStudentList, setShowStudentList] = useState(false);

    const {
        control,
        handleSubmit,
        watch,
        reset,
        formState: { errors }
    } = useForm<IStudentEligibleReport>({
        resolver: zodResolver(studentEligibleReportSchema),
        defaultValues: {
            asmaY_Id: 0,
            asmcL_Id: 0,
            asmS_Id: 0,
            studentList: []
        }
    });

    const { fields, replace, update } = useFieldArray({
        control,
        name: 'studentList'
    });

    const watchedAsmaY_Id = watch('asmaY_Id');
    const watchedAsmcL_Id = watch('asmcL_Id');
    const watchedAsmS_Id = watch('asmS_Id');

    // Cascade: Year -> Class
    useEffect(() => {
        if (watchedAsmaY_Id) {
            getClasses.mutate({ ASMAY_Id: watchedAsmaY_Id });
        }
    }, [watchedAsmaY_Id, getClasses.mutate]);

    // Cascade: Class -> Section
    useEffect(() => {
        if (watchedAsmaY_Id && watchedAsmcL_Id) {
            getSections.mutate({ ASMAY_Id: watchedAsmaY_Id, ASMCL_Id: watchedAsmcL_Id });
        }
    }, [watchedAsmaY_Id, watchedAsmcL_Id, getSections.mutate]);

    // Cascade: Section -> Students
    useEffect(() => {
        if (watchedAsmaY_Id && watchedAsmcL_Id && watchedAsmS_Id) {
            getStudents
                .mutateAsync({
                    ASMAY_Id: watchedAsmaY_Id,
                    ASMCL_Id: watchedAsmcL_Id,
                    ASMS_Id: watchedAsmS_Id
                })
                .then((data) => {
                    if (data && data.length > 0) {
                        replace(data.map((s: any) => ({ ...s, Selected: false })));
                        setShowStudentList(true);
                    } else {
                        replace([]);
                        setShowStudentList(false);
                    }
                });
        }
    }, [watchedAsmaY_Id, watchedAsmcL_Id, watchedAsmS_Id, getStudents.mutateAsync, replace]);

    const onSubmit = (values: IStudentEligibleReport) => {
        const selectedStudents = values.studentList?.filter((s) => s.Selected) || [];
        if (selectedStudents.length === 0) {
            toast.error('Please select at least one student');
            return;
        }

        const payload = {
            asmaY_Id: values.asmaY_Id,
            asmcL_Id: values.asmcL_Id,
            asmS_Id: values.asmS_Id,
            studentList: selectedStudents.map((s) => ({ amsT_Id: s.amsT_Id }))
        };

        // Notify parent; the reportQuery in Page will handle the fetch
        onReport(null, payload);
    };

    const handleCancel = () => {
        reset();
        setShowStudentList(false);
        onReset();
        window.location.reload();
    };

    // Toggle Select All
    const handleSelectAll = (checked: boolean) => {
        fields.forEach((_, index) => {
            update(index, { ...fields[index], Selected: checked } as any);
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                {/* Academic Year */}
                <div className='flex flex-col gap-2'>
                    <Label>
                        Academic Year <span className='text-destructive'>*</span>
                    </Label>
                    <Controller
                        name='asmaY_Id'
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value ? field.value.toString() : ''}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select Academic Year' />
                                </SelectTrigger>
                                <SelectContent>
                                    {loadGridData?.yearlist?.map((y: any) => (
                                        <SelectItem key={y.asmaY_Id} value={y.asmaY_Id.toString()}>
                                            {y.asmaY_Year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.asmaY_Id && <span className='text-destructive text-xs'>{errors.asmaY_Id.message}</span>}
                </div>

                {/* Class */}
                <div className='flex flex-col gap-2'>
                    <Label>
                        Class <span className='text-destructive'>*</span>
                    </Label>
                    <Controller
                        name='asmcL_Id'
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value ? field.value.toString() : ''}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select Class' />
                                </SelectTrigger>
                                <SelectContent>
                                    {getClasses.data?.map((c: any) => (
                                        <SelectItem key={c.asmcL_Id} value={c.asmcL_Id.toString()}>
                                            {c.asmcL_ClassName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.asmcL_Id && <span className='text-destructive text-xs'>{errors.asmcL_Id.message}</span>}
                </div>

                {/* Section */}
                <div className='flex flex-col gap-2'>
                    <Label>
                        Section <span className='text-destructive'>*</span>
                    </Label>
                    <Controller
                        name='asmS_Id'
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value ? field.value.toString() : ''}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select Section' />
                                </SelectTrigger>
                                <SelectContent>
                                    {getSections.data?.map((s: any) => (
                                        <SelectItem key={s.asmS_Id} value={s.asmS_Id.toString()}>
                                            {s.asmC_SectionName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.asmS_Id && <span className='text-destructive text-xs'>{errors.asmS_Id.message}</span>}
                </div>

                {/* Students Multiselect */}
                {showStudentList && (
                    <div className='flex flex-col gap-2'>
                        <Label>
                            Student <span className='text-destructive'>*</span>
                        </Label>
                        <div className='h-32 space-y-1 overflow-y-auto rounded-md border p-2'>
                            <div className='mb-1 flex items-center space-x-2 border-b pb-1'>
                                <Checkbox onCheckedChange={(checked) => handleSelectAll(!!checked)} />
                                <span className='font-medium text-xs'>Select All</span>
                            </div>
                            {fields.map((field, index) => (
                                <div key={field.id} className='flex items-center space-x-2'>
                                    <Controller
                                        name={`studentList.${index}.Selected`}
                                        control={control}
                                        render={({ field: checkField }) => (
                                            <Checkbox checked={!!checkField.value} onCheckedChange={checkField.onChange} />
                                        )}
                                    />
                                    <span className='text-sm'>{field.studentname}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className='flex justify-center gap-4'>
                <Button type='submit' className='bg-primary' disabled={isLoading}>
                    {isLoading ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <FileText className='mr-2 h-4 w-4' />}
                    Report
                </Button>
                <Button type='button' variant='destructive' onClick={handleCancel}>
                    <X className='mr-2 h-4 w-4' />
                    Cancel
                </Button>
                <Button type='button' variant='outline' onClick={onPrint} disabled={!hasData}>
                    <Printer className='mr-2 h-4 w-4' />
                    Print
                </Button>
                <Button type='button' variant='outline' onClick={onExcel} disabled={!hasData}>
                    <FileSpreadsheet className='mr-2 h-4 w-4' />
                    Excel
                </Button>
            </div>
        </form>
    );
}
