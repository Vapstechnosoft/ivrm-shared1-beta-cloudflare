'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getReportDetails } from '@/server/alumni/user-password-creation';
import type { IClass, ISection, IYear } from '@/types/alumni/user-password-creation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { type UserPasswordCreationSchema, userPasswordCreationSchema } from './schema';

interface FilterFormProps {
    years: IYear[];
    classes: IClass[];
    sections: ISection[];
    onSuccess: (data: any, filterdata: string, total?: number) => void;
    onReset: () => void;
    onLoading: (isLoading: boolean) => void;
}

export default function FilterForm({ years, classes, sections, onSuccess, onReset, onLoading }: FilterFormProps) {
    const [clearKey, setClearKey] = useState(0);

    const {
        control,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { isSubmitting, errors }
    } = useForm<UserPasswordCreationSchema>({
        resolver: zodResolver(userPasswordCreationSchema),
        defaultValues: {
            filterdata: 'reg',
            asmaY_Id: '',
            asmcL_Id: '',
            asmS_Id: ''
        }
    });

    const filterdata = watch('filterdata');

    useEffect(() => {
        if (filterdata === 'Alumni') {
            setValue('asmS_Id', '');
        }
    }, [filterdata, setValue]);

    const onSubmit = async (values: UserPasswordCreationSchema) => {
        onLoading(true);
        try {
            const payload = {
                asmaY_Id: Number(values.asmaY_Id),
                asmcL_Id: Number(values.asmcL_Id),
                asmS_Id: values.asmS_Id ? Number(values.asmS_Id) : 0,
                filterdata: values.filterdata
            };

            const res = await getReportDetails(payload);
            if (res.success && Array.isArray(res.data) && res.data.length > 0) {
                onSuccess(res.data, values.filterdata, res.total);
            } else {
                toast.error(res.message || 'No Records Found');
                onSuccess([], values.filterdata, 0);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to fetch report');
        } finally {
            onLoading(false);
        }
    };

    const handleCancel = () => {
        reset({
            filterdata: 'reg',
            asmaY_Id: '',
            asmcL_Id: '',
            asmS_Id: ''
        });
        setClearKey((prev) => prev + 1);
        onReset();
    };

    return (
        <form key={clearKey} onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            <div className='flex justify-center'>
                <div className='w-full max-w-lg rounded-xl border border-slate-200 bg-slate-50/50 p-4 shadow-sm'>
                    <Controller
                        name='filterdata'
                        control={control}
                        render={({ field }) => (
                            <RadioGroup value={field.value} onValueChange={field.onChange} className='flex justify-center gap-8'>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='reg' id='all' />
                                    <Label htmlFor='all' className='cursor-pointer font-medium text-sm'>
                                        All
                                    </Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='new' id='new' />
                                    <Label htmlFor='new' className='cursor-pointer font-medium text-sm'>
                                        New
                                    </Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='Alumni' id='alumni' />
                                    <Label htmlFor='alumni' className='cursor-pointer font-medium text-sm'>
                                        Alumni
                                    </Label>
                                </div>
                            </RadioGroup>
                        )}
                    />
                </div>
            </div>

            <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                <div className='flex flex-col gap-2'>
                    <Label htmlFor='asmaY_Id' className='font-semibold text-slate-700 text-sm'>
                        Academic Year <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='asmaY_Id'
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value || undefined}>
                                <SelectTrigger id='asmaY_Id' className='h-10 rounded-lg border-slate-300 bg-white'>
                                    <SelectValue placeholder='Select Academic Year' />
                                </SelectTrigger>
                                <SelectContent side='bottom'>
                                    {years.map((y) => (
                                        <SelectItem key={y.asmaY_Id} value={String(y.asmaY_Id)}>
                                            {y.asmaY_Year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.asmaY_Id && <FormError>{errors.asmaY_Id.message}</FormError>}
                </div>

                <div className='flex flex-col gap-2'>
                    <Label htmlFor='asmcL_Id' className='font-semibold text-slate-700 text-sm'>
                        Class <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='asmcL_Id'
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value || undefined}>
                                <SelectTrigger id='asmcL_Id' className='h-10 rounded-lg border-slate-300 bg-white'>
                                    <SelectValue placeholder='Select Class' />
                                </SelectTrigger>
                                <SelectContent side='bottom'>
                                    {classes.map((c) => (
                                        <SelectItem key={c.asmcL_Id} value={String(c.asmcL_Id)}>
                                            {c.asmcL_ClassName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.asmcL_Id && <FormError>{errors.asmcL_Id.message}</FormError>}
                </div>

                {filterdata !== 'Alumni' && (
                    <div className='flex flex-col gap-2'>
                        <Label htmlFor='asmS_Id' className='font-semibold text-slate-700 text-sm'>
                            Section <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            name='asmS_Id'
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value || undefined}>
                                    <SelectTrigger id='asmS_Id' className='h-10 rounded-lg border-slate-300 bg-white'>
                                        <SelectValue placeholder='Select Section' />
                                    </SelectTrigger>
                                    <SelectContent side='bottom'>
                                        <SelectItem value='0'>ALL</SelectItem>
                                        {sections.map((s) => (
                                            <SelectItem key={s.asmS_Id} value={String(s.asmS_Id)}>
                                                {s.asmC_SectionName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.asmS_Id && <FormError>{errors.asmS_Id.message}</FormError>}
                    </div>
                )}
            </div>

            <div className='flex justify-center gap-4 pt-2'>
                <Button type='submit' className='h-10 w-36 font-semibold shadow-md transition-all hover:scale-105' disabled={isSubmitting}>
                    <Eye className='mr-2 h-4 w-4' /> SEARCH
                </Button>
                <Button type='button' variant='outline' className='h-10 w-36 font-semibold' onClick={handleCancel}>
                    <RotateCcw className='mr-2 h-4 w-4' /> Cancel
                </Button>
            </div>
        </form>
    );
}

