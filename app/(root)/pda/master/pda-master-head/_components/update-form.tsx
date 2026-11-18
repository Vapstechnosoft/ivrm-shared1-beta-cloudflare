'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type PDAMasterHeadFormValues, pdaMasterHeadSchema } from '@/schemas/pda/master/master-head';
import { savePDAMasterHead } from '@/server/pda/master/master-head';
import type { IPDAMasterHead } from '@/types/pda/master/master-head';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface UpdatePDAMasterHeadFormProps {
    selectedRow: IPDAMasterHead;
    feeHeads: { fmH_Id: number; fmH_FeeName: string }[];
    onSuccess?: () => void;
    className?: string;
}

export default function UpdatePDAMasterHeadForm({ selectedRow, feeHeads, onSuccess, className = '' }: UpdatePDAMasterHeadFormProps) {
    const [hasSubmitted, setHasSubmitted] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors, isSubmitting }
    } = useForm<PDAMasterHeadFormValues>({
        resolver: zodResolver(pdaMasterHeadSchema.addOrUpdate),
        defaultValues: {
            pdamH_HeadName: selectedRow.pdamH_HeadName,
            fmH_Id: selectedRow.fmH_Id
        }
    });

    useEffect(() => {
        reset({
            pdamH_HeadName: selectedRow.pdamH_HeadName,
            fmH_Id: selectedRow.fmH_Id
        });
    }, [selectedRow, reset]);

    const onSubmit: SubmitHandler<PDAMasterHeadFormValues> = async (data) => {
        try {
            const payload = {
                PDAMH_Id: selectedRow.pdamH_Id,
                fmh_id: data.fmH_Id,
                PDAMH_HeadName: data.pdamH_HeadName
            };

            const response = await savePDAMasterHead(payload);

            if (response.returnval === true) {
                toast.success(response.message || 'Record Updated Successfully');
                onSuccess?.();
            } else if (response.returnduplicatestatus === 'Duplicate') {
                toast.error('Record Already Exist');
            } else {
                toast.error(response.message || 'Record Not Updated');
            }
        } catch (error: any) {
            console.error('Submission error:', error);
            toast.error(error.message || 'Error updating record');
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
                <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        {/* Expenditure Head */}
                        <div className='md:col-span-2'>
                            <Label htmlFor='pdamH_HeadName'>
                                Expenditure Head <span className='ml-1 text-red-500'>*</span>
                            </Label>
                            <Input
                                id='pdamH_HeadName'
                                placeholder='Enter expenditure head name'
                                {...register('pdamH_HeadName')}
                                className={hasSubmitted && errors.pdamH_HeadName ? 'border-red-500' : ''}
                            />
                            {hasSubmitted && errors.pdamH_HeadName && <FormError>{errors.pdamH_HeadName.message}</FormError>}
                        </div>

                        {/* Fee Head Type */}
                        <div className='md:col-span-2'>
                            <Label htmlFor='fmH_Id'>
                                Fee Head Type <span className='ml-1 text-red-500'>*</span>
                            </Label>
                            <Controller
                                name='fmH_Id'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(value) => field.onChange(Number(value))}
                                        value={field.value ? field.value.toString() : ''}>
                                        <SelectTrigger className={hasSubmitted && errors.fmH_Id ? 'border-red-500' : ''}>
                                            <SelectValue placeholder='Select Fee Head' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {feeHeads.map((head) => (
                                                <SelectItem key={head.fmH_Id} value={head.fmH_Id.toString()}>
                                                    {head.fmH_FeeName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {hasSubmitted && errors.fmH_Id && <FormError>{errors.fmH_Id.message}</FormError>}
                        </div>
                    </div>
                </div>

                <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                    <Button
                        type='submit'
                        disabled={isSubmitting}
                        className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'>
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4 font-bold' />
                            {isSubmitting ? 'Updating...' : 'Update'}
                        </div>
                    </Button>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={() => {
                            reset();
                            setHasSubmitted(false);
                        }}
                        disabled={isSubmitting}
                        className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'>
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    );
}
