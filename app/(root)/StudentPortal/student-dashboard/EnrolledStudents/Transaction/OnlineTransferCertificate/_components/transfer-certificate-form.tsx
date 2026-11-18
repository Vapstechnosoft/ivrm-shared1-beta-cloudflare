'use client';

import { Button } from '@/components/ui/button';
import { DatePickerWithYear } from '@/components/ui/date-picker-year';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputTextarea } from '@/components/ui/extension/input-textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { applyTransferCertificate } from '../actions';

const formSchema = z.object({
    ASTC_Reason: z.string().min(1, 'Reason is required'),
    ASTC_Date: z.date({
        required_error: 'Date is required'
    })
});

export default function TransferCertificateForm({ onClose, onSuccess }: { onClose?: () => void; onSuccess?: () => void }) {
    const [isLoading, setIsLoading] = useState(false);

    const {
        control,
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            ASTC_Reason: '',
            ASTC_Date: new Date()
        }
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        try {
            // Convert date to string format expected by API
            const payload = {
                ...values,
                ASTC_Date: values.ASTC_Date.toISOString()
            };

            const result = await applyTransferCertificate(payload);
            if (result && result.returnval === true) {
                toast.success('Transfer Certificate applied successfully');
                if (onSuccess) onSuccess();
                if (onClose) onClose();
            } else {
                toast.error(result?.message || 'Failed to apply');
            }
        } catch (error) {
            toast.error('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div className='flex flex-col gap-1.5'>
                    <Label htmlFor='ASTC_Date'>Apply Date</Label>
                    <Controller
                        control={control}
                        name='ASTC_Date'
                        render={({ field }) => (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={'outline'}
                                        className={cn(
                                            'w-full justify-start text-left font-normal',
                                            !field.value && 'text-muted-foreground'
                                        )}>
                                        <CalendarIcon className='mr-2 h-4 w-4' />
                                        {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className='w-auto p-0'>
                                    <DatePickerWithYear
                                        mode='single'
                                        selected={field.value}
                                        onDayClick={(day) => field.onChange(day)}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        )}
                    />
                    {errors.ASTC_Date && <FormError>{errors.ASTC_Date.message}</FormError>}
                </div>

                <div className='flex flex-col gap-1.5'>
                    <InputTextarea
                        label='Reason'
                        id='ASTC_Reason'
                        placeholder='Reason for transfer'
                        {...register('ASTC_Reason')}
                        error={errors.ASTC_Reason?.message}
                    />
                </div>
            </div>

            <div className='flex justify-end gap-2'>
                {onClose && (
                    <Button type='button' variant='outline' onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                )}
                <Button type='submit' disabled={isLoading}>
                    {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                    Apply
                </Button>
            </div>
        </form>
    );
}
