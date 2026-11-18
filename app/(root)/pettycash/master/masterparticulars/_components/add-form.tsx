'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { type MasterParticularsFormValues, masterParticularsSchema } from '@/schemas/pettycash/masters';
import { addOrUpdateMasterParticulars } from '@/server/pettycash/master/particulars';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface AddMasterParticularsFormProps {
    onSuccess?: () => void;
    className?: string;
}

export default function AddMasterParticularsForm({ onSuccess, className = '' }: AddMasterParticularsFormProps) {
    const [hasSubmitted, setHasSubmitted] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<MasterParticularsFormValues>({
        resolver: zodResolver(masterParticularsSchema.addOrUpdate),
        defaultValues: {
            pcmparT_ParticularName: '',
            pcmparT_ParticularDesc: ''
        }
    });

    const onSubmit: SubmitHandler<MasterParticularsFormValues> = async (data) => {
        try {
            const payload = {
                pcmparT_Id: 0,
                pcmparT_ParticularName: data.pcmparT_ParticularName,
                pcmparT_ParticularDesc: data.pcmparT_ParticularDesc,
                pcmparT_ActiveFlg: true
            };

            const response = await addOrUpdateMasterParticulars(payload);

            if (response.success) {
                toast.success(response.message || 'Particular saved successfully');
                reset();
                onSuccess?.();
            } else {
                toast.error(response.message || 'Failed to save particular');
            }
        } catch (error: any) {
            console.error('Submission error:', error);
            toast.error(error.message || 'Error saving particular');
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
                        {/* Particular Name */}
                        <div className='md:col-span-2'>
                            <Label htmlFor='pcmparT_ParticularName'>
                                Particular Name <span className='ml-1 text-red-500'>*</span>
                            </Label>
                            <Input
                                id='pcmparT_ParticularName'
                                placeholder='Enter particular name'
                                {...register('pcmparT_ParticularName')}
                                className={hasSubmitted && errors.pcmparT_ParticularName ? 'border-red-500' : ''}
                            />
                            {hasSubmitted && errors.pcmparT_ParticularName && (
                                <FormError>{errors.pcmparT_ParticularName.message}</FormError>
                            )}
                        </div>

                        {/* Particular Description */}
                        <div className='md:col-span-2'>
                            <Label htmlFor='pcmparT_ParticularDesc'>Particular Description</Label>
                            <Textarea
                                id='pcmparT_ParticularDesc'
                                placeholder='Enter description (optional)'
                                {...register('pcmparT_ParticularDesc')}
                                rows={3}
                            />
                        </div>
                    </div>
                </div>

                <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={() => {
                            reset();
                            setHasSubmitted(false);
                        }}
                        disabled={isSubmitting}
                        className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'>
                        Reset
                    </Button>
                    <Button
                        type='submit'
                        disabled={isSubmitting}
                        className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'>
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4 font-bold' />
                            {isSubmitting ? 'Saving...' : 'Save Particular'}
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
