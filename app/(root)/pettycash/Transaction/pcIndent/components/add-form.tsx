'use client';

import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { FormError, Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDepartmentName } from '@/hooks/pettycash/transaction/pcREQUISITION';
import { type PcIndentFormValues, pcIndentSchema } from '@/schemas/pettycash/transaction/pcIndent';
import { saveIndent } from '@/server/pettycash/transaction/pcIndent';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface AddPcIndentFormProps {
    onSuccess?: () => void;
    className?: string;
}

export default function AddPcIndentForm({ onSuccess, className = '' }: AddPcIndentFormProps) {
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const { data: session } = useSession();

    const mi_id = (session as any)?.mi_id || (session as any)?.mi_Id || (session as any)?.user?.mi_Id || (session as any)?.user?.mi_id || 0;

    const {
        handleSubmit,
        reset,
        control,
        formState: { errors, isSubmitting }
    } = useForm<PcIndentFormValues>({
        resolver: zodResolver(pcIndentSchema),
        defaultValues: {
            mdept_Id: 0,
            pcindT_FromDate: new Date(),
            pcindT_ToDate: new Date(),
            pcindT_ActiveFlg: true
        }
    });

    const { data: departmentRes, isLoading: isLoadingDept } = useDepartmentName({ id: mi_id, enabled: true });
    const departments = Array.isArray(departmentRes) ? departmentRes : ((departmentRes as any)?.data ?? []);

    const onSubmit: SubmitHandler<PcIndentFormValues> = async (data) => {
        try {
            const payload = {
                ...data,
                mI_Id: mi_id,
                pcindT_FromDate: data.pcindT_FromDate.toISOString(),
                pcindT_ToDate: data.pcindT_ToDate.toISOString()
            };

            const response = await saveIndent(payload);

            if (response?.success) {
                toast.success(response.message || 'Indent saved successfully');
                reset();
                onSuccess?.();
            } else {
                toast.error(response.message || 'Failed to save indent');
            }
        } catch (error: any) {
            console.error('Save Error:', error);
            toast.error(error.message || 'An error occurred during save');
        }
    };

    return (
        <div className={className}>
            <form
                onSubmit={(e) => {
                    setHasSubmitted(true);
                    handleSubmit(onSubmit)(e);
                }}
                className='space-y-6'>
                <div className='rounded-xl border bg-card p-6 shadow-sm'>
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                        {/* Organization */}
                        <div className='space-y-2'>
                            <Label>Organization *</Label>
                            <Controller
                                control={control}
                                name='mdept_Id'
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(val) => field.onChange(Number(val))}
                                        value={field.value ? field.value.toString() : ''}
                                        disabled={isLoadingDept}>
                                        <SelectTrigger className={hasSubmitted && errors.mdept_Id ? 'border-destructive' : ''}>
                                            <SelectValue placeholder={isLoadingDept ? 'Loading...' : 'Select Department'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.map((dept: any) => (
                                                <SelectItem key={dept.hrmD_Id} value={dept.hrmD_Id.toString()}>
                                                    {dept.hrmD_DepartmentName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {hasSubmitted && errors.mdept_Id && <FormError>{errors.mdept_Id.message}</FormError>}
                        </div>

                        {/* From Date */}
                        <div className='space-y-2'>
                            <Label>Requisition From Date *</Label>
                            <Controller
                                control={control}
                                name='pcindT_FromDate'
                                render={({ field }) => (
                                    <DatePicker
                                        date={field.value}
                                        setDate={field.onChange}
                                        className={hasSubmitted && errors.pcindT_FromDate ? 'border-destructive' : ''}
                                    />
                                )}
                            />
                            {hasSubmitted && errors.pcindT_FromDate && <FormError>{errors.pcindT_FromDate.message as string}</FormError>}
                        </div>

                        {/* To Date */}
                        <div className='space-y-2'>
                            <Label>Requisition To Date *</Label>
                            <Controller
                                control={control}
                                name='pcindT_ToDate'
                                render={({ field }) => (
                                    <DatePicker
                                        date={field.value}
                                        setDate={field.onChange}
                                        className={hasSubmitted && errors.pcindT_ToDate ? 'border-destructive' : ''}
                                    />
                                )}
                            />
                            {hasSubmitted && errors.pcindT_ToDate && <FormError>{errors.pcindT_ToDate.message as string}</FormError>}
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className='mt-6 flex items-center justify-end gap-3 border-t pt-4'>
                        <Button
                            type='button'
                            variant='outline'
                            onClick={() => {
                                reset();
                                setHasSubmitted(false);
                            }}
                            disabled={isSubmitting}>
                            Reset
                        </Button>

                        <Button type='submit' disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : 'SAVE INDENT'}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
