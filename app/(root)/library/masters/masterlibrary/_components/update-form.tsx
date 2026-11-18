'use client';

import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { useMasterLibrary } from '@/hooks/library/useMasters';
import { masterLibrarySchema } from '@/schemas/library/masters';
import { addOrUpdateMasterLibrary } from '@/server/library/masters/master_library';
import type { IMasterLibraryList } from '@/types/library/masters/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterLibrarySchema.addOrUpdate>;

interface UpdateMasterLibraryFormProps {
    onSuccess?: () => void;
    onSaveAndNext?: (id: string) => void;
    className?: string;
    selectedRow: IMasterLibraryList;
}

export default function UpdateMasterLibraryForm({
    onSuccess,
    onSaveAndNext,
    className = '',
    selectedRow: row
}: UpdateMasterLibraryFormProps) {
    const { refetchAll } = useMasterLibrary();
    const [shouldNext, setShouldNext] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterLibrarySchema.addOrUpdate),
        mode: 'onChange'
    });

    useEffect(() => {
        if (row) {
            reset({
                lmaL_Id: row.lmaL_Id,
                lmaL_LibraryName: row.lmaL_LibraryName
            });
        }
    }, [row, reset]);

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const { lmaL_LibraryName } = data;

            const payload = {
                lmaL_Id: row.lmaL_Id,
                lmaL_LibraryName: lmaL_LibraryName
            };

            const response: any = await addOrUpdateMasterLibrary(payload);

            if (response.success || response.returnval) {
                toast.success(response.message || 'Master Library updated successfully');
                refetchAll();
                if (shouldNext && onSaveAndNext) {
                    onSaveAndNext(row.lmaL_Id.toString());
                } else {
                    onSuccess?.();
                }
            } else {
                toast.error(response.message || 'Failed to update Master Library');
            }
        } catch (error: any) {
            toast.error(error?.message || 'Something went wrong');
        }
    };

    const handleReset = () => reset();

    return (
        <div className={className}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <InputText
                            label='Library Name'
                            required
                            id='lmaL_LibraryName'
                            placeholder='Enter library name'
                            onKeyDown={(e) => {
                                if (e.key.length === 1 && !/^[a-zA-Z0-9\s]$/.test(e.key) && !e.ctrlKey && !e.metaKey) {
                                    e.preventDefault();
                                }
                            }}
                            {...register('lmaL_LibraryName', {
                                onChange: (e) => {
                                    e.target.value = e.target.value.replace(/[^a-zA-Z0-9\s]/g, '');
                                }
                            })}
                            error={errors.lmaL_LibraryName?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                    </div>

                    {/* Root Error */}
                    {errors.root && <FormError>{errors.root.message}</FormError>}
                </div>

                {/* Action Buttons */}
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
                        onClick={() => setShouldNext(false)}
                        disabled={isSubmitting}
                        className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'
                        isLoading={isSubmitting && !shouldNext}
                        loadingText='Saving...'>
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' />
                            Update Master Library
                        </div>
                    </Button>
                    <Button
                        type='submit'
                        onClick={() => setShouldNext(true)}
                        disabled={isSubmitting}
                        className='order-1 w-fit bg-[#4251b1] transition-all duration-200 hover:scale-105 hover:bg-[#35418e] sm:order-3'
                        isLoading={isSubmitting && shouldNext}
                        loadingText='Saving...'>
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' />
                            Update & Next
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
