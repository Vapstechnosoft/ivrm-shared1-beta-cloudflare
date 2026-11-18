'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useMasterGrade } from '@/hooks/exam/exammodule/usemasters';
import { masterGradeSchema } from '@/schemas/exam/exam-module/masters';
import { addOrUpdateMasterGrade, getGradeDetailsById } from '@/server/exam/exam-module/masters/grade';
import type { IMasterGrade } from '@/types/exam/exam-module/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, RefreshCw, Save, Trash } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Controller, type SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

interface UpdateMasterGradeFormProps {
    gradeData: IMasterGrade;
    onSuccess?: () => void;
    className?: string;
}

export default function UpdateMasterGradeForm({ gradeData, onSuccess, className = '' }: UpdateMasterGradeFormProps) {
    const [isLoading, setIsLoading] = useState(true);
    const { refetchAll } = useMasterGrade();

    const {
        control,
        register,
        handleSubmit,
        reset,
        trigger,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<z.infer<typeof masterGradeSchema.addOrUpdate>>({
        resolver: zodResolver(masterGradeSchema.addOrUpdate),
        mode: 'onChange',
        reValidateMode: 'onChange',
        defaultValues: {
            emgR_Id: gradeData.emgR_Id,
            mI_Id: gradeData.mI_Id ?? 0,
            emgR_GradeName: gradeData.emgR_GradeName ?? '',
            emgR_MarksPerFlag: gradeData.emgR_MarksPerFlag?.toUpperCase() === 'P' ? 'P' : 'M',
            emgR_ActiveFlag: gradeData.emgR_ActiveFlag ?? true,
            grade_list: []
        }
    });

    const { fields, append, remove, replace } = useFieldArray({
        control,
        name: 'grade_list'
    });
    const _marksPerFlag = watch('emgR_MarksPerFlag');
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

    // Scroll helpers
    const tableRef = useRef<HTMLDivElement | null>(null);
    const scrollToBottom = () => {
        if (tableRef.current) {
            tableRef.current.scrollTop = tableRef.current.scrollHeight;
        }
    };

    // Fetch and populate grade details
    useEffect(() => {
        async function fetchGradeDetails() {
            setIsLoading(true);
            try {
                const result = await getGradeDetailsById(gradeData.emgR_Id);
                if (result?.data) {
                    const data = Array.isArray(result.data)
                        ? result.data.map((g: any) => ({
                            emgD_Id: Number(g.emgD_Id ?? 0),
                            emgR_Id: Number(g.emgR_Id ?? 0),
                            emgD_Name: g.emgD_Name || '',
                            emgD_From: Number(g.emgD_From ?? null),
                            emgD_To: Number(g.emgD_To ?? null),
                            emgD_GradePoints: Number(g.emgD_GradePoints ?? null),
                            emgD_Remarks: g.emgD_Remarks || '',
                            emgD_ActiveFlag: g.emgD_ActiveFlag ?? true,
                            emgR_MarksPerFlag: g.emgR_MarksPerFlag
                        }))
                        : [];

                    const rawFlag = (result.data as any)?.[0]?.emgR_MarksPerFlag ?? gradeData.emgR_MarksPerFlag;
                    const marksPerFlag = rawFlag?.toUpperCase() === 'P' ? 'P' : 'M';

                    reset(
                        {
                            emgR_Id: gradeData.emgR_Id,
                            mI_Id: gradeData.mI_Id ?? 0,
                            emgR_GradeName: gradeData.emgR_GradeName ?? '',
                            emgR_MarksPerFlag: marksPerFlag,
                            emgR_ActiveFlag: gradeData.emgR_ActiveFlag ?? true,
                            grade_list: data
                        },
                        {
                            keepErrors: true,
                            keepDirty: true,
                            keepIsSubmitted: false,
                            keepTouched: true
                        }
                    );

                    replace(data);
                    scrollToBottom();
                    await trigger();

                    setTimeout(() => trigger(), 0);
                } else {
                    toast.error('Failed to fetch grade details');
                }
            } catch (err: any) {
                toast.error(err.message || 'Error fetching grade details');
            } finally {
                setIsLoading(false);
            }
        }

        fetchGradeDetails();
    }, [gradeData.emgR_Id, reset, replace, trigger, gradeData]);

    // Submit handler
    const onSubmit: SubmitHandler<z.infer<typeof masterGradeSchema.addOrUpdate>> = async (data) => {
        const names = new Set<string>();
        const ranges: { from: number; to: number; name: string }[] = [];

        for (const row of data.grade_list) {
            // Check duplicate Name
            if (!row.emgD_Name || row.emgD_Name.trim() === '') {
                toast.error('Please enter a Grade Name');
                return;
            }
            const normalizedName = row.emgD_Name.trim().toLowerCase();
            if (names.has(normalizedName)) {
                toast.error(`Duplicate grade name found in details: ${row.emgD_Name}`);
                return;
            }
            names.add(normalizedName);

            // Validate Range
            if (row.emgD_From === null || row.emgD_From === undefined || (row.emgD_From as any) === '') {
                toast.error(`Please enter the 'From' range field for grade: ${row.emgD_Name}`);
                return;
            }

            if (row.emgD_To === null || row.emgD_To === undefined || (row.emgD_To as any) === '') {
                toast.error(`Please enter the 'To' range field for grade: ${row.emgD_Name}`);
                return;
            }

            if (row.emgD_GradePoints === null || row.emgD_GradePoints === undefined || (row.emgD_GradePoints as any) === '') {
                toast.error(`Please enter Grade Points for grade: ${row.emgD_Name}`);
                return;
            }

            const from = Number(row.emgD_From);
            const to = Number(row.emgD_To);

            if (from >= to) {
                toast.error(`Invalid range for ${row.emgD_Name}: 'From' (${from}) must be less than 'To' (${to})`);
                return;
            }

            // Check overlap with existing ranges
            for (const range of ranges) {
                if (from < range.to && to > range.from) {
                    toast.error(`Range for ${row.emgD_Name} (${from}-${to}) overlaps with ${range.name} (${range.from}-${range.to})`);
                    return;
                }

                if (from === range.from || to === range.to) {
                    toast.error(`Duplicate range boundaries found between ${row.emgD_Name} and ${range.name}`);
                    return;
                }
            }
            ranges.push({ from, to, name: row.emgD_Name });
        }

        try {
            const payload = {
                emgR_Id: Number(data.emgR_Id),
                emgR_GradeName: data.emgR_GradeName,
                emgR_MarksPerFlag: data.emgR_MarksPerFlag,
                emgR_ActiveFlag: data.emgR_ActiveFlag ?? true,
                grade_list: data.grade_list.map((row) => ({
                    emgD_Id: Number(row.emgD_Id ?? 0),
                    emgR_Id: Number(data.emgR_Id),
                    emgD_Name: row.emgD_Name,
                    emgD_From: Number(row.emgD_From),
                    emgD_To: Number(row.emgD_To),
                    emgD_GradePoints: Number(row.emgD_GradePoints),
                    emgD_Remarks: row.emgD_Remarks || '',
                    emgD_ActiveFlag: row.emgD_ActiveFlag ?? true
                }))
            };

            const response = await addOrUpdateMasterGrade(payload);

            if (response?.success) {
                toast.success(response.message);
                onSuccess?.();
                refetchAll();
            } else {
                toast.error(response?.message || 'Failed to save');
            }
        } catch (err: any) {
            toast.error(err.message || 'Error saving data');
        }
    };

    // Reset Form To Original Data (Fetched Grade + Grade_List Rows)
    const handleReset = async () => {
        try {
            setIsLoading(true);
            const result = await getGradeDetailsById(gradeData.emgR_Id);
            if (result?.data) {
                const restoredRows = Array.isArray(result.data)
                    ? result.data.map((g: any) => ({
                        emgD_Id: Number(g.emgD_Id ?? 0),
                        emgR_Id: Number(g.emgR_Id ?? 0),
                        emgD_Name: g.emgD_Name || '',
                        emgD_From: Number(g.emgD_From ?? null),
                        emgD_To: Number(g.emgD_To ?? null),
                        emgD_GradePoints: Number(g.emgD_GradePoints ?? null),
                        emgD_Remarks: g.emgD_Remarks || '',
                        emgD_ActiveFlag: g.emgD_ActiveFlag ?? true,
                        emgR_MarksPerFlag: g.emgR_MarksPerFlag
                    }))
                    : [];

                const rawFlag = (result.data as any)?.[0]?.emgR_MarksPerFlag ?? gradeData.emgR_MarksPerFlag;
                const marksPerFlag = rawFlag?.toUpperCase() === 'P' ? 'P' : 'M';

                reset({
                    emgR_Id: gradeData.emgR_Id,
                    mI_Id: gradeData.mI_Id ?? 0,
                    emgR_GradeName: gradeData.emgR_GradeName ?? '',
                    emgR_MarksPerFlag: marksPerFlag,
                    emgR_ActiveFlag: gradeData.emgR_ActiveFlag ?? true,
                    grade_list: restoredRows
                });

                replace(restoredRows);
                await trigger();
                toast.info('Form reset to original data.');
            } else {
                toast.error('No data found to reset.');
            }
        } catch (error: any) {
            toast.error(error.message || 'Reset failed.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (fields.length > 0) {
            tableRef.current?.scrollIntoView({ behavior: 'smooth' });
            setTimeout(scrollToBottom, 50);
        }
    }, [fields.length]);

    if (isLoading) {
        return (
            <div className='flex flex-col items-center justify-center space-y-4 py-12'>
                <RefreshCw className='h-8 w-8 animate-spin text-secondary' />
                <p className='text-muted-foreground text-sm'>Loading data...</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className={`space-y-6 ${className}`} noValidate>
            {/* Grade Info */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <InputText
                    label='Grade Name'
                    required
                    placeholder='Enter Grade Name'
                    {...register('emgR_GradeName')}
                    error={errors.emgR_GradeName?.message}
                />
                <div>
                    <Label>
                        Marks/Percentage <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='emgR_MarksPerFlag'
                        control={control}
                        render={({ field }) => (
                            <RadioGroup
                                value={field.value}
                                onValueChange={(val) => {
                                    field.onChange(val);
                                    trigger();
                                }}
                                className='flex gap-4'>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='M' id='marks' />
                                    <Label htmlFor='marks'>Marks</Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='P' id='percentage' />
                                    <Label htmlFor='percentage'>Percentage</Label>
                                </div>
                            </RadioGroup>
                        )}
                    />
                    {errors.emgR_MarksPerFlag && <FormError>{errors.emgR_MarksPerFlag.message}</FormError>}
                </div>
            </div>

            {/* Grade List */}
            <CollapsibleSection title='Grade Details' defaultOpen>
                <div className='overflow-x-auto' ref={tableRef}>
                    <table className='w-full border border-gray-200'>
                        <thead className='bg-gray-100'>
                            <tr>
                                <th className='border px-2 py-1'>Sl.No</th>
                                <th className='border px-2 py-1'>Grade Name</th>
                                <th className='border px-2 py-1'>From</th>
                                <th className='border px-2 py-1'>To</th>
                                <th className='border px-2 py-1'>Grade Points</th>
                                <th className='border px-2 py-1'>Remarks</th>
                                <th className='border px-2 py-1'>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fields.map((item, index) => (
                                <tr key={item.id}>
                                    <td className='border text-center'>{index + 1}</td>

                                    {/* Grade Name */}
                                    <td className='border'>
                                        <InputText
                                            {...register(`grade_list.${index}.emgD_Name` as const)}
                                            placeholder='Enter Grade Name'
                                            error={errors.grade_list?.[index]?.emgD_Name?.message}
                                        />
                                    </td>

                                    {/* From Marks */}
                                    <td className='border'>
                                        <InputText
                                            type='text'
                                            {...register(`grade_list.${index}.emgD_From`, {
                                                onChange: (e) => {
                                                    const value = e.target.value;
                                                    if (value && !/^\d*\.?\d*$/.test(value)) {
                                                        e.target.value = value.replace(/[^\d.]/g, '');
                                                    }
                                                    trigger(`grade_list.${index}.emgD_To`);
                                                    trigger(`grade_list.${index}.emgD_From`);
                                                }
                                            })}
                                            placeholder='Enter From'
                                            error={errors.grade_list?.[index]?.emgD_From?.message}
                                            onKeyPress={(e) => {
                                                const char = String.fromCharCode(e.which);
                                                if (!/[\d.]/.test(char)) {
                                                    e.preventDefault();
                                                }
                                            }}
                                            onPaste={(e) => {
                                                const pasteData = e.clipboardData.getData('text');
                                                if (!/^[\d.]*$/.test(pasteData)) {
                                                    e.preventDefault();
                                                }
                                            }}
                                        />
                                    </td>

                                    {/* To Marks */}
                                    <td className='border'>
                                        <InputText
                                            type='text'
                                            {...register(`grade_list.${index}.emgD_To`, {
                                                onChange: (e) => {
                                                    const value = e.target.value;
                                                    if (value && !/^\d*\.?\d*$/.test(value)) {
                                                        e.target.value = value.replace(/[^\d.]/g, '');
                                                    }
                                                    trigger(`grade_list.${index}.emgD_From`);
                                                    trigger(`grade_list.${index}.emgD_To`);
                                                }
                                            })}
                                            placeholder='Enter To'
                                            error={errors.grade_list?.[index]?.emgD_To?.message}
                                            onKeyPress={(e) => {
                                                const char = String.fromCharCode(e.which);
                                                if (!/[\d.]/.test(char)) {
                                                    e.preventDefault();
                                                }
                                            }}
                                            onPaste={(e) => {
                                                const pasteData = e.clipboardData.getData('text');
                                                if (!/^[\d.]*$/.test(pasteData)) {
                                                    e.preventDefault();
                                                }
                                            }}
                                        />
                                    </td>

                                    {/* Grade Points */}
                                    <td className='border'>
                                        <InputText
                                            type='text'
                                            {...register(`grade_list.${index}.emgD_GradePoints`, {
                                                onChange: (e) => {
                                                    const value = e.target.value;
                                                    if (value && !/^\d*\.?\d*$/.test(value)) {
                                                        e.target.value = value.replace(/[^\d.]/g, '');
                                                    }
                                                }
                                            })}
                                            placeholder='Enter Grade Points'
                                            error={errors.grade_list?.[index]?.emgD_GradePoints?.message}
                                            onKeyPress={(e) => {
                                                const char = String.fromCharCode(e.which);
                                                if (!/[\d.]/.test(char)) {
                                                    e.preventDefault();
                                                }
                                            }}
                                            onPaste={(e) => {
                                                const pasteData = e.clipboardData.getData('text');
                                                if (!/^[\d.]*$/.test(pasteData)) {
                                                    e.preventDefault();
                                                }
                                            }}
                                        />
                                    </td>

                                    {/* Remarks */}
                                    <td className='border'>
                                        <InputText
                                            {...register(`grade_list.${index}.emgD_Remarks` as const)}
                                            placeholder='Enter Remarks'
                                            error={errors.grade_list?.[index]?.emgD_Remarks?.message}
                                        />
                                    </td>
                                    <td className='flex justify-center gap-2 border px-2 py-1'>
                                        <Button
                                            type='button'
                                            size='sm'
                                            onClick={() => {
                                                const last = watch('grade_list')[index];
                                                if (
                                                    last.emgD_Name.trim() === '' ||
                                                    last.emgD_From === null ||
                                                    last.emgD_To === null ||
                                                    last.emgD_GradePoints === null
                                                ) {
                                                    toast.error('Please fill the current row before adding a new one.');
                                                    return;
                                                }

                                                append({
                                                    emgD_Id: 0,
                                                    emgR_Id: 0,
                                                    emgD_Name: '',
                                                    emgD_From: '' as any,
                                                    emgD_To: '' as any,
                                                    emgD_GradePoints: '' as any,
                                                    emgD_Remarks: '',
                                                    emgD_ActiveFlag: true
                                                });
                                            }}>
                                            <Plus className='h-3 w-3' />
                                        </Button>

                                        {/* Remove row */}
                                        {fields.length > 1 && (
                                            <Button
                                                type='button'
                                                size='sm'
                                                variant='destructive'
                                                onClick={() => {
                                                    setDeleteIndex(index);
                                                    setConfirmOpen(true);
                                                }}>
                                                <Trash className='h-3 w-3' />
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className='flex w-fit gap-3 border-t pt-4'>
                    <Button type='button' variant='outline' onClick={handleReset} disabled={isSubmitting}>
                        Reset
                    </Button>
                    <Button type='submit' disabled={isSubmitting} isLoading={isSubmitting}>
                        <Save className='mr-2 h-4 w-4' /> Update
                    </Button>
                </div>
            </CollapsibleSection>
            {confirmOpen && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
                    <div className='w-[350px] rounded-md bg-white p-6 text-center shadow-xl'>
                        <h2 className='mb-3 font-semibold text-lg'>Delete Row?</h2>
                        <p className='mb-6 text-gray-700'>Are you sure you want to remove this grade row?</p>

                        <div className='flex justify-center gap-4'>
                            <Button
                                variant='outline'
                                onClick={() => {
                                    setConfirmOpen(false);
                                    setDeleteIndex(null);
                                }}>
                                Cancel
                            </Button>

                            <Button
                                variant='destructive'
                                onClick={() => {
                                    if (deleteIndex !== null) remove(deleteIndex);
                                    setConfirmOpen(false);
                                    setDeleteIndex(null);
                                }}>
                                Yes, Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </form>
    );
}
