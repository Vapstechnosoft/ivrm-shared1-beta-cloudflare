'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { useFormContext } from '@/components/ui/form/form-provider';
import { Spinner as LoadingSpinner } from '@/components/ui/spinner';
import { type MasterRoleSchema, masterRoleSchema } from '@/schemas/super-admin/super-admin-module/general-setting/master-role';
import { getMasterRoleById, saveMasterRole } from '@/server/super-admin/super-admin-module/general-setting/master-role';
import type { IMasterRole } from '@/types/super-admin/super-admin-module/general-setting/master-role';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, X } from 'lucide-react';
import { useEffect } from 'react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface AddMasterRoleFormProps {
    onSuccess?: () => void;
}

export default function AddMasterRoleForm({ onSuccess }: AddMasterRoleFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { selectedRow } = useFormContext<IMasterRole>();

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<MasterRoleSchema>({
        resolver: zodResolver(masterRoleSchema),
        defaultValues: {
            name: selectedRow?.name || '',
            normalizedName: selectedRow?.normalizedName || '',
            id: selectedRow?.id || undefined
        }
    });

    useEffect(() => {
        const fetchDetails = async () => {
            if (selectedRow?.id) {
                setIsLoading(true);
                try {
                    const response = await getMasterRoleById(selectedRow.id);
                    if (response?.success && response?.data) {
                        reset({
                            id: response.data.id,
                            name: response.data.name,
                            normalizedName: response.data.normalizedName
                        });
                    } else {
                        toast.error('Failed to load role details');
                        reset({
                            id: selectedRow.id,
                            name: selectedRow.name,
                            normalizedName: selectedRow.normalizedName
                        });
                    }
                } catch (error) {
                    console.error('Error fetching role details', error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                reset({
                    name: '',
                    normalizedName: '',
                    id: undefined
                });
            }
        };

        fetchDetails();
    }, [selectedRow, reset]);

    const onSubmit = async (data: MasterRoleSchema) => {
        setIsLoading(true);
        try {
            const result = await saveMasterRole(data);
            if (result.success) {
                toast.success(result.message);
                reset();
                onSuccess?.();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            <div className='rounded-md border p-4'>
                <h3 className='mb-4 border-b pb-2 font-semibold text-lg text-primary'>Master Role</h3>
                <div className='mx-auto max-w-2xl space-y-4'>
                    <div className='grid grid-cols-12 items-center gap-4'>
                        <Label className='col-span-12 text-left md:col-span-4 md:text-right'>
                            Role Name: <span className='text-red-500'>*</span>
                        </Label>
                        <div className='col-span-12 md:col-span-8'>
                            <Controller
                                control={control}
                                name='name'
                                render={({ field }) => (
                                    <InputText value={field.value} onChange={field.onChange} placeholder='Enter Role Name' maxLength={40} />
                                )}
                            />
                            <FormError>{errors.name?.message}</FormError>
                        </div>
                    </div>

                    <div className='grid grid-cols-12 items-center gap-4'>
                        <Label className='col-span-12 text-left md:col-span-4 md:text-right'>
                            Description: <span className='text-red-500'>*</span>
                        </Label>
                        <div className='col-span-12 md:col-span-8'>
                            <Controller
                                control={control}
                                name='normalizedName'
                                render={({ field }) => (
                                    <InputText
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder='Enter Description'
                                        maxLength={100}
                                        // multiline // InputText might support this if it wraps textarea, checking usage
                                    />
                                )}
                            />
                            <FormError>{errors.normalizedName?.message}</FormError>
                        </div>
                    </div>
                </div>

                <div className='mt-8 flex justify-center gap-4 border-t pt-4'>
                    <Button type='submit' disabled={isLoading} className='w-32 bg-blue-600 hover:bg-blue-700'>
                        {isLoading ? <LoadingSpinner /> : <Save className='mr-2 h-4 w-4' />}
                        Save
                    </Button>
                    <Button
                        type='button'
                        variant='destructive'
                        onClick={() => {
                            reset();
                            onSuccess?.();
                        }}
                        className='w-32 bg-red-500 hover:bg-red-600'>
                        <X className='mr-2 h-4 w-4' />
                        Cancel
                    </Button>
                </div>
            </div>
        </form>
    );
}
