'use client';

import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    useFeeAcademicYearReport,
    useFeeSectionYearReport,
    useFeeStudentsYearReport,
    useFeeclassYearReport
} from '@/hooks/fees/useReports';
import { useFeeChequeBounceReceipts } from '@/hooks/fees/useTrasactions';
import { feeChequeBounceSchema } from '@/schemas/fees/reports';
import { saveFeeChequeBounce } from '@/server/fees/trasactions/fee_cheque_bounce';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { Save, X } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof feeChequeBounceSchema>;

export default function AddFeeChequeBounceForm({ onSuccess }: { onSuccess: () => void }) {
    const queryClient = useQueryClient();

    const {
        control,
        handleSubmit,
        setValue,
        reset,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(feeChequeBounceSchema),
        defaultValues: {
            asmaY_Id: undefined,
            asmcL_Id: undefined,
            asmS_Id: undefined,
            amst_Id: undefined,
            FYP_ID: '',
            FCB_DATE: new Date(),
            FCB_Remarks: ''
        }
    });

    const asmayId = watch('asmaY_Id');
    const classId = watch('asmcL_Id');
    const sectionId = watch('asmS_Id');
    const studentId = watch('amst_Id');

    // Hooks for data fetching using standard report hooks
    const { data: academicYears, isLoading: loadingAcademicYear } = useFeeAcademicYearReport({} as any);
    const { data: classes, isLoading: loadingClasses } = useFeeclassYearReport({} as any);
    const { data: sections, isLoading: loadingSections } = useFeeSectionYearReport({
        asmaY_Id: asmayId,
        asmcL_Id: classId
    });
    const { data: students, isLoading: loadingStudents } = useFeeStudentsYearReport({
        asmaY_Id: asmayId,
        asmcL_Id: classId,
        amsC_Id: sectionId
    });

    const { data: receiptData, isLoading: loadingReceipts } = useFeeChequeBounceReceipts(studentId, asmayId);

    // Reset dependent fields when parents change
    useEffect(() => {
        setValue('asmcL_Id', undefined as any);
        setValue('asmS_Id', undefined as any);
        setValue('amst_Id', undefined as any);
    }, [asmayId, setValue]);

    useEffect(() => {
        setValue('asmS_Id', undefined as any);
        setValue('amst_Id', undefined as any);
    }, [classId, setValue]);

    useEffect(() => {
        setValue('amst_Id', undefined as any);
    }, [sectionId, setValue]);

    const onSubmit = async (data: any) => {
        try {
            const payload = {
                ASMAY_ID: Number(data.asmaY_Id),
                AMST_Id: Number(data.amst_Id),
                FYP_ID: Number(data.FYP_ID),
                FCB_DATE: data.FCB_DATE instanceof Date ? data.FCB_DATE.toISOString() : new Date(data.FCB_DATE).toISOString(),
                FCB_Remarks: data.FCB_Remarks
            };

            const result = (await saveFeeChequeBounce(payload)) as any;

            if (result?.success) {
                toast.success(result.message);

                queryClient.invalidateQueries();
                onSuccess();
                reset();
            } else {
                toast.error(result?.message);
            }
        } catch (error) {
            toast.error('An error occurred while saving the record');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 p-4'>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                {/* Academic Year */}
                <div className='space-y-2'>
                    <Label>
                        Academic Year <span className='text-destructive'>*</span>
                    </Label>
                    <Controller
                        name='asmaY_Id'
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value ? String(field.value) : ''}>
                                <SelectTrigger>
                                    <SelectValue placeholder={loadingAcademicYear ? 'Loading...' : 'Select Academic Year'} />
                                </SelectTrigger>
                                <SelectContent>
                                    {academicYears?.data?.map((yr: any) => (
                                        <SelectItem key={yr.asmaY_Id} value={String(yr.asmaY_Id)}>
                                            {yr.asmaY_Year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.asmaY_Id && <p className='text-destructive text-xs'>{errors.asmaY_Id.message}</p>}
                </div>

                {/* Class */}
                <div className='space-y-2'>
                    <Label>
                        Class <span className='text-destructive'>*</span>
                    </Label>
                    <Controller
                        name='asmcL_Id'
                        control={control}
                        render={({ field }) => (
                            <Select
                                onValueChange={(val) => field.onChange(Number(val))}
                                value={field.value ? String(field.value) : ''}
                                disabled={!asmayId || loadingClasses}>
                                <SelectTrigger>
                                    <SelectValue placeholder={loadingClasses ? 'Loading...' : 'Select Class'} />
                                </SelectTrigger>
                                <SelectContent>
                                    {classes?.data?.map((cls: any) => (
                                        <SelectItem key={cls.asmcL_Id} value={String(cls.asmcL_Id)}>
                                            {cls.asmcL_ClassName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.asmcL_Id && <p className='text-destructive text-xs'>{errors.asmcL_Id.message}</p>}
                </div>

                {/* Section */}
                <div className='space-y-2'>
                    <Label>
                        Section <span className='text-destructive'>*</span>
                    </Label>
                    <Controller
                        name='asmS_Id'
                        control={control}
                        render={({ field }) => (
                            <Select
                                onValueChange={(val) => field.onChange(Number(val))}
                                value={field.value ? String(field.value) : ''}
                                disabled={!classId || loadingSections}>
                                <SelectTrigger>
                                    <SelectValue placeholder={loadingSections ? 'Loading...' : 'Select Section'} />
                                </SelectTrigger>
                                <SelectContent>
                                    {sections?.data?.map((sec: any) => (
                                        <SelectItem key={sec.asmS_Id} value={String(sec.asmS_Id)}>
                                            {sec.asmC_SectionName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.asmS_Id && <p className='text-destructive text-xs'>{errors.asmS_Id.message}</p>}
                </div>

                {/* Student */}
                <div className='space-y-2'>
                    <Label>
                        Student Name <span className='text-destructive'>*</span>
                    </Label>
                    <Controller
                        name='amst_Id'
                        control={control}
                        render={({ field }) => (
                            <Select
                                onValueChange={(val) => field.onChange(Number(val))}
                                value={field.value ? String(field.value) : ''}
                                disabled={!sectionId || loadingStudents}>
                                <SelectTrigger>
                                    <SelectValue placeholder={loadingStudents ? 'Loading...' : 'Select Student'} />
                                </SelectTrigger>
                                <SelectContent>
                                    {students?.data?.map((std: any) => (
                                        <SelectItem key={std.amst_Id} value={String(std.amst_Id)}>
                                            {std.studentName} ({std.amst_AdmNo})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.amst_Id && <p className='text-destructive text-xs'>{errors.amst_Id.message}</p>}
                </div>

                {/* Receipt No */}
                <div className='space-y-2'>
                    <Label>
                        Receipt No <span className='text-destructive'>*</span>
                    </Label>
                    <Controller
                        name='FYP_ID'
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value} disabled={!studentId || loadingReceipts}>
                                <SelectTrigger>
                                    <SelectValue placeholder={loadingReceipts ? 'Loading...' : 'Select Receipt No'} />
                                </SelectTrigger>
                                <SelectContent>
                                    {receiptData?.data?.map((rec: any) => (
                                        <SelectItem key={rec.fyP_ID} value={String(rec.fyP_ID)}>
                                            {rec.fyP_Receipt_No}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>

                {/* Date */}
                <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                    <Label className='w-40'>
                        Date <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='FCB_DATE'
                        control={control}
                        render={({ field }) => (
                            <DatePicker date={field.value} setDate={(date) => field.onChange(date)} className='w-full sm:w-96' />
                        )}
                    />
                    {errors.FCB_DATE && <p className='text-destructive text-xs'>{errors.FCB_DATE.message}</p>}
                </div>

                {/* Remarks */}
                <div className='space-y-2 md:col-span-2'>
                    <Label>Remarks</Label>
                    <Controller
                        name='FCB_Remarks'
                        control={control}
                        render={({ field }) => <Input {...field} placeholder='Enter remarks...' />}
                    />
                </div>
            </div>

            <div className='flex justify-center gap-4 pt-4'>
                <Button type='submit' disabled={isSubmitting} className='w-32'>
                    <Save className='mr-2 h-4 w-4' /> Save
                </Button>
                <Button type='button' variant='outline' onClick={() => reset()} className='w-32'>
                    <X className='mr-2 h-4 w-4' /> Cancel
                </Button>
            </div>
        </form>
    );
}
