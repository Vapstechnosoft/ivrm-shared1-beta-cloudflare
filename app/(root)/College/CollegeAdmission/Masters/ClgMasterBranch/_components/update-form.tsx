'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, Save } from 'lucide-react';
import { useSaveClgMasterBranch, useEditClgMasterBranch } from '@/hooks/college/useCollegeMasters';
import { IClgMasterBranch } from '@/types/college/masters';
import { useEffect } from 'react';

import { InputText } from '@/components/ui/extension/input-text';
import { InputNumber } from '@/components/ui/extension/input-number';
import { FormError, Label } from '@/components/ui/extension/field';
import { Controller } from 'react-hook-form';

const updateSchema = z.object({
    amB_BranchName: z.string().trim().min(1, 'Please enter branch name').regex(/^[a-zA-Z\s.]+$/, 'Only alphabets, spaces and dots are allowed'),
    amB_BranchCode: z.string().trim().min(1, 'Please enter branch code').regex(/^[\sA-Za-z0-9]+$/, 'Only alphanumeric characters are allowed'),
    amB_BranchInfo: z.string().trim().min(1, 'Please enter branch info').regex(/^[\sa-zA-Z0-9.]+$/, 'Only alphanumeric characters, spaces and dots are allowed'),
    amB_BranchType: z.string().min(1, 'Please select branch type'),
    amB_Order: z.coerce.number({ invalid_type_error: 'Please enter branch order', required_error: 'Please enter branch order' }).min(1, 'Please enter branch order'),
    amB_StudentCapacity: z.coerce.number({ invalid_type_error: 'Please enter branch capacity', required_error: 'Please enter branch capacity' }).min(1, 'Please enter branch capacity'),
    amB_AidedUnAided: z.string().min(1, 'Please select aided/unaided')
});

type UpdateFormValues = z.infer<typeof updateSchema>;

interface UpdateClgMasterBranchFormProps {
    selectedRow: IClgMasterBranch;
    onSuccess: () => void;
}

export default function UpdateClgMasterBranchForm({ selectedRow, onSuccess }: UpdateClgMasterBranchFormProps) {
    const saveMutation = useSaveClgMasterBranch();
    const { data: editData, isLoading: isEditLoading } = useEditClgMasterBranch(selectedRow.amB_Id);

    const form = useForm<UpdateFormValues>({
        resolver: zodResolver(updateSchema),
        mode: 'onChange',
        defaultValues: {
            amB_BranchName: '',
            amB_BranchCode: '',
            amB_BranchInfo: '',
            amB_BranchType: '',
            amB_Order: 0,
            amB_StudentCapacity: 0,
            amB_AidedUnAided: ''
        }
    });

    useEffect(() => {
        const details = (editData as any)?.data?.[0] || (editData as any)?.editdetails?.[0];
        if (details) {
            form.reset({
                amB_BranchName: details.amB_BranchName,
                amB_BranchCode: details.amB_BranchCode,
                amB_BranchInfo: details.amB_BranchInfo,
                amB_BranchType: details.amB_BranchType,
                amB_Order: details.amB_Order,
                amB_StudentCapacity: details.amB_StudentCapacity,
                amB_AidedUnAided: details.amB_AidedUnAided
            });
        }
    }, [editData, form]);

    const onSubmit = async (values: UpdateFormValues) => {
        const promise = saveMutation.mutateAsync({
            amB_Id: selectedRow.amB_Id,
            amB_BranchName: values.amB_BranchName,
            amB_BranchCode: values.amB_BranchCode,
            amB_BranchInfo: values.amB_BranchInfo,
            amB_BranchType: values.amB_BranchType,
            amB_Order: values.amB_Order,
            amB_StudentCapacity: values.amB_StudentCapacity,
            amB_AidedUnAided: values.amB_AidedUnAided
        });

        toast.promise(promise, {
            loading: 'Updating branch...',
            success: (data: any) => {
                if (data?.success === false || data?.message === 'Duplicate') {
                    throw new Error(data?.message === 'Duplicate' ? 'Record Already Exists' : (data?.message || 'Failed to update record'));
                }
                if (data?.success || data?.returnval) {
                    onSuccess();
                    return data?.message && data.message !== 'Add' && data.message !== 'Duplicate' ? data.message : 'Record Updated Successfully';
                }
                throw new Error('Failed to update record');
            },
            error: (err: any) => err.message || 'Something Went Wrong Please Contact Administrator'
        });
    };

    if (isEditLoading) {
        return (
            <div className='flex h-32 items-center justify-center'>
                <Loader2 className='h-6 w-6 animate-spin text-primary' />
            </div>
        );
    }

    const { register, formState: { errors } } = form;

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                <div className='space-y-6'>
                    <InputText
                        label='Branch Name'
                        required
                        placeholder='Enter branch name'
                        {...register('amB_BranchName')}
                        error={errors.amB_BranchName?.message}
                        className='transition-colors focus:ring-2 focus:ring-primary/20'
                    />

                    <Controller
                        control={form.control}
                        name='amB_Order'
                        render={({ field, fieldState }) => (
                            <InputNumber
                                label='Branch Order'
                                required
                                placeholder='Enter branch order'
                                value={field.value as any}
                                onChange={field.onChange}
                                error={fieldState.error?.message}
                                maxDigits={5}
                            />
                        )}
                    />

                    <div className='group flex flex-col gap-1.5'>
                        <Label isRequired>Branch Type</Label>
                        <Controller
                            control={form.control}
                            name='amB_BranchType'
                            render={({ field, fieldState }) => (
                                <>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger className={fieldState.error ? 'border-destructive focus:ring-destructive/20' : 'transition-colors focus:ring-2 focus:ring-primary/20'}>
                                            <SelectValue placeholder='Select' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='Common Branch'>Common Branch</SelectItem>
                                            <SelectItem value='Different Branch'>Different Branch</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {fieldState.error?.message && <FormError>{fieldState.error.message}</FormError>}
                                </>
                            )}
                        />
                    </div>

                    <div className='group flex flex-col gap-1.5'>
                        <Label isRequired>Branch Aided / Unaided</Label>
                        <Controller
                            control={form.control}
                            name='amB_AidedUnAided'
                            render={({ field, fieldState }) => (
                                <>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger className={fieldState.error ? 'border-destructive focus:ring-destructive/20' : 'transition-colors focus:ring-2 focus:ring-primary/20'}>
                                            <SelectValue placeholder='Select' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='Aided'>Aided</SelectItem>
                                            <SelectItem value='UnAided'>Unaided</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {fieldState.error?.message && <FormError>{fieldState.error.message}</FormError>}
                                </>
                            )}
                        />
                    </div>
                </div>
                
                <div className='space-y-6'>
                    <InputText
                        label='Branch Code'
                        required
                        placeholder='Enter branch code'
                        {...register('amB_BranchCode')}
                        error={errors.amB_BranchCode?.message}
                        className='transition-colors focus:ring-2 focus:ring-primary/20'
                    />

                    <InputText
                        label='Branch Info'
                        required
                        placeholder='Enter branch info'
                        {...register('amB_BranchInfo')}
                        error={errors.amB_BranchInfo?.message}
                        className='transition-colors focus:ring-2 focus:ring-primary/20'
                    />

                    <Controller
                        control={form.control}
                        name='amB_StudentCapacity'
                        render={({ field, fieldState }) => (
                            <InputNumber
                                label='Branch Capacity'
                                required
                                placeholder='Enter branch capacity'
                                value={field.value as any}
                                onChange={field.onChange}
                                error={fieldState.error?.message}
                                maxDigits={5}
                            />
                        )}
                    />
                </div>
            </div>
            
            <div className='flex flex-col gap-3 border-t pt-6 sm:flex-row sm:justify-start'>
                <Button
                    type='button'
                    variant='outline'
                    onClick={onSuccess}
                    className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'>
                    Cancel
                </Button>
                <Button
                    type='submit'
                    disabled={saveMutation.isPending}
                    className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'>
                    <div className='flex items-center'>
                        {saveMutation.isPending ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Save className='mr-2 h-4 w-4' />}
                        Update
                    </div>
                </Button>
            </div>
        </form>
    );
}
