'use client';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

import { parentsubjectdropdowndata, useMasterSubject } from '@/hooks/library/useMasters';
import { masterSubjectSchema } from '@/schemas/library/masters';
import { addOrUpdateMasterSubject } from '@/server/library/masters/master_subject';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterSubjectSchema.addOrUpdate>;

interface AddMasterSubjectFormProps {
    onSuccess?: () => void;
    className?: string;
}

export default function AddMasterSubjectForm({ onSuccess, className = '' }: AddMasterSubjectFormProps) {
    const { refetchAll } = useMasterSubject();
    const [resetKey, setResetKey] = useState(0);

    const {
        control,
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterSubjectSchema.addOrUpdate),
        defaultValues: {
            lmS_ParentId: undefined,
            ismS_SubjectName: '',
            lmS_Level: '',
            lmS_SubjectNo: '',
            lmS_ClassNo: ''
        },
        mode: 'onSubmit'
    });

    const { data: category, isLoading: categoryLoading, error: categoryError } = parentsubjectdropdowndata();

    const parentList = Array.isArray(category?.data)
        ? category.data
        : Array.isArray(category)
          ? category
          : [];

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const payload = {
                lmS_Id: 0,
                lmS_SubjectNo: data.lmS_SubjectNo || '',
                lmS_SubjectName: data.ismS_SubjectName || data.lmS_SubjectName || '',
                lmS_ParentId: Number(data.lmS_ParentId),
                lmS_Level: data.lmS_Level ? Number(data.lmS_Level) : 0,
                lmS_ClassNo: data.lmS_ClassNo || '',
                lmS_ActiveFlg: true
            };

            const response: any = await addOrUpdateMasterSubject(payload);

            if (response?.success) {
                toast.success(response.message || 'Master Subject saved successfully');
                handleReset();
                refetchAll();
                onSuccess?.();
            } else {
                toast.error(response?.message || 'Failed to save Master Subject');
            }
        } catch (error: any) {
            console.error('Submit Error:', error);
            toast.error(error?.message || 'Something went wrong');
        }
    };

    const handleReset = () => {
        reset({
            lmS_ParentId: undefined,
            ismS_SubjectName: '',
            lmS_Level: '',
            lmS_SubjectNo: '',
            lmS_ClassNo: ''
        });
        setResetKey((prev) => prev + 1);
    };

    return (
        <div className={`${className}`}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
                        <div className='group flex flex-col gap-2'>
                            <Label htmlFor='lmS_ParentId' className='whitespace-nowrap font-medium'>
                                Parent Name <span className='ml-1 text-red-500'>*</span>:
                            </Label>
                            <div className='w-full'>
                                <Controller
                                    name='lmS_ParentId'
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            key={resetKey}
                                            onValueChange={(val) => field.onChange(val === 'none' ? undefined : Number(val))}
                                            value={field.value?.toString() || ''}>
                                            <SelectTrigger className='w-full'>
                                                <SelectValue placeholder='Select Parent Subject' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categoryLoading ? (
                                                    <SelectItem value='loading' disabled>
                                                        Loading Parent Subject...
                                                    </SelectItem>
                                                ) : categoryError ? (
                                                    <SelectItem value='error' disabled>
                                                        Error loading Parent Subjects
                                                    </SelectItem>
                                                ) : (
                                                    parentList.map((item: any) => (
                                                        <SelectItem
                                                            key={item.ismS_Id || Math.random()}
                                                            value={item.ismS_Id?.toString() || ''}>
                                                            {item.ismS_SubjectName}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.lmS_ParentId && <FormError className='ml-2'>{errors.lmS_ParentId.message}</FormError>}
                            </div>
                        </div>

                        <InputText
                            label='Sub-Subject :'
                            required
                            placeholder='Enter Sub Subject'
                            {...register('ismS_SubjectName')}
                            error={errors.ismS_SubjectName?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                    </div>
                    {/* Root Error */}
                    {errors.root && <FormError>{errors.root.message}</FormError>}
                </div>

                <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <InputText
                            label='Level :'
                            placeholder='Enter Level'
                            {...register('lmS_Level')}
                            error={errors.lmS_Level?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <InputText
                            label='Subject No :'
                            placeholder='Enter Subject No'
                            {...register('lmS_SubjectNo')}
                            error={errors.lmS_SubjectNo?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                    </div>

                    {/* Root Error */}
                    {errors.root && <FormError>{errors.root.message}</FormError>}
                </div>

                <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <InputText
                            label='Class No :'
                            id='lmS_ClassNo'
                            placeholder='Enter Class No'
                            {...register('lmS_ClassNo')}
                            error={errors.lmS_ClassNo?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                    </div>

                    {/* Root Error */}
                    {errors.root && <FormError>{errors.root.message}</FormError>}
                </div>

                {/* Action Buttons */}
                <div className='flex flex-col gap-3 border-t pt-6 sm:flex-row sm:justify-start'>
                    <Button
                        type='submit'
                        disabled={isSubmitting}
                        className='order-1 w-fit bg-[#4251b1] text-white transition-all duration-200 hover:scale-105 hover:bg-[#35418e]'
                        isLoading={isSubmitting}
                        loadingText='Saving...'>
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' />
                            Save Master Subject
                        </div>
                    </Button>
                    <Button
                        type='button'
                        onClick={handleReset}
                        disabled={isSubmitting}
                        className='order-2 w-fit bg-[#ff5a30] text-white transition-all duration-200 hover:scale-105 hover:bg-[#e64d26]'>
                        Reset
                    </Button>
                </div>
            </form>
        </div>
    );
}

