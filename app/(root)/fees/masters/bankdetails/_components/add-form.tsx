'use client';

import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { useMasterBankDetails } from '@/hooks/fees/useMasters';
import { masterBankDetailsSchema } from '@/schemas/fees/masters';
import { addOrUpdateFeeBankDetails } from '@/server/fees/masters/bank_details';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterBankDetailsSchema.addOrUpdate>;

interface AddMasterBankDetailsProps {
    onSuccess?: () => void;
    className?: string;
}

export default function AddMasterBankDetailsForm({ onSuccess, className = '' }: AddMasterBankDetailsProps) {
    const { refetchAll } = useMasterBankDetails();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterBankDetailsSchema.addOrUpdate),
        mode: 'onChange',
        defaultValues: {
            fmbanK_BankName: '',
            fmbanK_BankDescription: ''
        }
    });

    const onSubmit: SubmitHandler<FormFields> = async (data: FormFields) => {
        try {
            const { fmbanK_BankName, fmbanK_BankDescription } = data;
            const payload = {
                FMBANK_BankName: fmbanK_BankName.trim(),
                FMBANK_BankDescription: fmbanK_BankDescription.trim(),
                FMBANK_ActiveFlg: true
            };

            const response = await addOrUpdateFeeBankDetails(payload);
            if (response.success) {
                toast.success(response.message || 'Bank details saved successfully');
                reset();
                refetchAll();
                onSuccess?.();
            } else {
                toast.error(response.message || 'Failed to save bank details');
            }
        } catch (error: any) {
            toast.error(error.message || 'An unexpected error occurred');
        }
    };

    const handleReset = () => {
        reset();
    };

    return (
        <div className={`${className}`}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <InputText
                            label='Bank Name'
                            required
                            placeholder='Enter Bank Name'
                            id='fmbanK_BankName'
                            {...register('fmbanK_BankName')}
                            onKeyDown={(e) => {
                                const allowed = /^[A-Za-z0-9\s.\-&,]$/;
                                if (e.key.length === 1 && !allowed.test(e.key)) {
                                    e.preventDefault();
                                }
                            }}
                            onPaste={(e) => {
                                const pasteText = e.clipboardData.getData('text');
                                if (!/^[A-Za-z0-9\s.\-&,]*$/.test(pasteText)) {
                                    e.preventDefault();
                                }
                            }}
                            error={errors.fmbanK_BankName?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />

                        <InputText
                            label='Bank Details'
                            required
                            placeholder='Enter Bank Details'
                            id='fmbanK_BankDescription'
                            {...register('fmbanK_BankDescription')}
                            error={errors.fmbanK_BankDescription?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                    </div>

                    {errors.root && <FormError>{errors.root.message}</FormError>}
                </div>

                <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={handleReset}
                        disabled={isSubmitting}
                        className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'>
                        Reset
                    </Button>
                    <Button
                        type='submit'
                        disabled={isSubmitting}
                        className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'
                        isLoading={isSubmitting}
                        loadingText='Saving...'>
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' />
                            Save Bank Details
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
