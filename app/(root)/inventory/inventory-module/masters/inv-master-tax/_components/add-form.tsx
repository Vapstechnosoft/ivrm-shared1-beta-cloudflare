'use client';

import { Button } from '@/components/ui/button';
import { InputText } from '@/components/ui/extension/input-text';
import { useInvMasterTax } from '@/hooks/inventory/masters/use-inv-master-tax';
import { invMasterTaxSchema } from '@/schemas/inventory/masters/inv-master-tax';
import { saveInvMasterTax } from '@/server/inventory/masters/inv-master-tax';
import { zodResolver } from '@hookform/resolvers/zod';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

interface AddInvMasterTaxFormProps {
    onSuccess: () => void;
    onCancel?: () => void;
}
type FormFields = z.infer<typeof invMasterTaxSchema.addOrUpdate>;
export default function AddInvMasterTaxForm({ onSuccess, onCancel }: AddInvMasterTaxFormProps) {
    const { refetchAll } = useInvMasterTax();
    const {
        control,
        register,
        handleSubmit,
        reset,
        formState: { isSubmitting, errors }
    } = useForm<FormFields>({
        resolver: zodResolver(invMasterTaxSchema.addOrUpdate),
        defaultValues: {
            INVMT_TaxName: '',
            INVMT_TaxAliasName: '',
            INVMT_ActiveFlg: true
        }
    });

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        console.log('AddInvMasterTaxForm: Submitting data', data); // DEBUG LOG
        try {
            // Using PascalCase for payload as requested
            const payload = {
                INVMT_Id: 0,
                INVMT_TaxName: data.INVMT_TaxName,
                INVMT_TaxAliasName: data.INVMT_TaxAliasName,
                INVMT_ActiveFlg: true
            };
            console.log('AddInvMasterTaxForm: Payload', payload); // DEBUG LOG

            const result = await saveInvMasterTax(payload);

            if (result.success || result.returnval) {
                toast.success(result.message || 'Record saved successfully');
                refetchAll();
                onSuccess();
                reset();
            } else if (result.returnduplicatestatus === 'Duplicate' || result.message === 'Duplicate') {
                toast.error('Record already exists');
            } else {
                toast.error(result.message || 'Failed to save record');
            }
        } catch (error: any) {
            toast.error(error.message || 'An error occurred');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 p-4'>
            <div className='flex flex-col gap-4'>
                <InputText
                    label='Tax Name'
                    placeholder='Enter Tax Name'
                    required
                    id='INVMT_TaxName'
                    {...register('INVMT_TaxName')}
                    error={errors.INVMT_TaxName?.message}
                />

                <InputText
                    label='Alias Name'
                    placeholder='Enter Alias Name'
                    id='INVMT_TaxAliasName'
                    {...register('INVMT_TaxAliasName')}
                    error={errors.INVMT_TaxAliasName?.message}
                />
            </div>

            <div className='flex justify-end gap-2 pt-4'>
                <Button
                    type='button'
                    variant='outline'
                    onClick={() => {
                        reset();
                        onCancel?.();
                    }}
                    disabled={isSubmitting}>
                    Cancel
                </Button>
                <Button type='submit' disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save'}
                </Button>
            </div>
        </form>
    );
}
