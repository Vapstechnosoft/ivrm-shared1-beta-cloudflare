'use client';

import { Button } from '@/components/ui/button';
import { InputText } from '@/components/ui/extension/input-text';
import { InputTextarea } from '@/components/ui/extension/input-textarea';
import { useInvMasterCustomer } from '@/hooks/inventory/masters/use-inv-master-customer';
import { type InvMasterCustomerSchema, invMasterCustomerSchema } from '@/schemas/inventory/masters/inv-master-customer';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface AddCustomerFormProps {
    onSuccess: () => void;
    onCancel?: () => void;
}

export default function AddCustomerForm({ onSuccess, onCancel }: AddCustomerFormProps) {
    const { saveMutation } = useInvMasterCustomer();

    const form = useForm<InvMasterCustomerSchema>({
        resolver: zodResolver(invMasterCustomerSchema),
        defaultValues: {
            invmC_CustomerName: '',
            invmC_CustomerContactPerson: '',
            invmC_CustomerContactNo: '',
            invmC_CustomerAddress: '',
            invmC_ActiveFlg: true,
            invmC_Id: 0
        }
    });

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isValid }
    } = form;

    const onSubmit = (data: InvMasterCustomerSchema) => {
        saveMutation.mutate(data, {
            onSuccess: () => {
                onSuccess();
                reset();
            }
        });
    };

    const handleCancel = () => {
        reset();
        if (onCancel) {
            onCancel();
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 p-4'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <InputText
                    label='Customer Name'
                    placeholder='Enter Customer Name'
                    {...register('invmC_CustomerName')}
                    error={errors.invmC_CustomerName?.message}
                    required
                    onInput={(e) => {
                        e.currentTarget.value = e.currentTarget.value.replace(/[^a-zA-Z\s]/g, '');
                    }}
                />

                <InputText
                    label='Contact Person'
                    placeholder='Enter Contact Person'
                    {...register('invmC_CustomerContactPerson')}
                    error={errors.invmC_CustomerContactPerson?.message}
                    required
                />

                <InputText
                    label='Contact Number'
                    placeholder='Enter Contact Number'
                    {...register('invmC_CustomerContactNo')}
                    error={errors.invmC_CustomerContactNo?.message}
                    required
                    maxLength={10}
                    onInput={(e) => {
                        e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '');
                    }}
                />
            </div>

            <div className='grid grid-cols-1 gap-4'>
                <InputTextarea
                    label='Address'
                    placeholder='Enter Customer Address'
                    {...register('invmC_CustomerAddress')}
                    error={errors.invmC_CustomerAddress?.message}
                    required
                    rows={3}
                />
            </div>

            <div className='mt-4 flex justify-end gap-2'>
                <Button type='button' variant='outline' onClick={handleCancel}>
                    Cancel
                </Button>
                <Button type='submit' isLoading={saveMutation.isPending}>
                    <Save className='mr-2 h-4 w-4' />
                    Save
                </Button>
            </div>
        </form>
    );
}
