'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { InputText } from '@/components/ui/extension/input-text';
import { InputNumber } from '@/components/ui/extension/input-number';
import { useSaveMasterSection, useEditMasterSection } from '@/hooks/college/useCollegeMasters';
import { IClgMasterSection } from '@/types/college/masters';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const formSchema = z.object({
    ACMS_SectionName: z.string().min(1, 'Enter the Section Name').max(40, 'Maximum 40 characters')
        .regex(/^[a-zA-Z\s]+$/, 'Only alphabetic characters allowed'),
    ACMS_Order: z.coerce.number().min(1, 'Enter the Section Order').max(99, 'Maximum 2 digits'),
    ACMS_SectionCode: z.string().min(1, 'Enter the Section Code').max(5, 'Maximum 5 characters')
        .regex(/^[a-zA-Z0-9\s]+$/, 'Alphanumeric and spaces only'),
    ACMS_MaxCapacity: z.coerce.number().min(1, 'Enter the Section Capacity').max(99999, 'Maximum 5 digits'),
});

type FormValues = z.infer<typeof formSchema>;

export default function UpdateMasterSectionForm({ selectedRow, onSuccess }: { selectedRow: IClgMasterSection, onSuccess: () => void }) {
    const saveMutation = useSaveMasterSection();
    const editMutation = useEditMasterSection();
    const [isLoadingDetails, setIsLoadingDetails] = useState(true);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            ACMS_SectionName: '',
            ACMS_Order: undefined,
            ACMS_SectionCode: '',
            ACMS_MaxCapacity: undefined,
        }
    });

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const data: any = await editMutation.mutateAsync(selectedRow.acmS_Id);
                const editData = data?.data?.[0] ?? data?.editdetails?.[0];
                if (editData) {
                    form.reset({
                        ACMS_SectionName: editData.acmS_SectionName ?? '',
                        ACMS_Order: editData.acmS_Order ?? '',
                        ACMS_SectionCode: editData.acmS_SectionCode ?? '',
                        ACMS_MaxCapacity: editData.acmS_MaxCapacity ?? '',
                    });
                }
            } catch (error) {
                toast.error('Failed to load details for editing');
                onSuccess();
            } finally {
                setIsLoadingDetails(false);
            }
        };

        fetchDetails();
    }, [selectedRow.acmS_Id]);

    const onSubmit = async (values: FormValues) => {
        const payload = {
            acmS_Id: selectedRow.acmS_Id,
            acmS_SectionName: values.ACMS_SectionName,
            acmS_SectionCode: values.ACMS_SectionCode,
            acmS_Order: values.ACMS_Order,
            acmS_MaxCapacity: values.ACMS_MaxCapacity
        };

        const promise = saveMutation.mutateAsync(payload);

        toast.promise(promise, {
            loading: 'Updating record...',
            success: (data: any) => {
                if (data?.success) {
                    onSuccess();
                    return data?.message || 'Record Updated Successfully';
                }
                throw new Error(data?.message || 'Failed To Update Record');
            },
            error: (err: any) => err.message || 'Something went wrong'
        });
    };

    if (isLoadingDetails) {
        return (
            <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading details...</span>
            </div>
        );
    }

    return (
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 p-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <InputText
                        label='Section Name'
                        id='ACMS_SectionName'
                        placeholder='Enter Section Name'
                        required
                        {...form.register('ACMS_SectionName')}
                        error={form.formState.errors.ACMS_SectionName?.message}
                    />
                    <Controller
                        name='ACMS_Order'
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <InputNumber
                                label='Section Order'
                                id='ACMS_Order'
                                placeholder='Enter Section Order'
                                required
                                value={field.value}
                                onChange={field.onChange}
                                error={fieldState.error?.message}
                            />
                        )}
                    />
                    <InputText
                        label='Section Code'
                        id='ACMS_SectionCode'
                        placeholder='Enter Section Code'
                        required
                        {...form.register('ACMS_SectionCode')}
                        error={form.formState.errors.ACMS_SectionCode?.message}
                    />
                    <Controller
                        name='ACMS_MaxCapacity'
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <InputNumber
                                label='Section Capacity'
                                id='ACMS_MaxCapacity'
                                placeholder='Enter Section Capacity'
                                required
                                value={field.value}
                                onChange={field.onChange}
                                error={fieldState.error?.message}
                            />
                        )}
                    />
                </div>
                
                <div className='flex justify-center gap-4 mt-6'>
                    <Button type='submit' disabled={saveMutation.isPending}>
                        {saveMutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                        Update
                    </Button>
                    <Button type='button' variant='destructive' onClick={() => {
                        form.reset();
                        onSuccess();
                    }} disabled={saveMutation.isPending}>
                        Cancel
                    </Button>
                </div>
            </form>
    );
}
