'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { RefreshCw } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import type { z } from 'zod';

import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { ttMonthEndReportSchema } from '@/schemas/timetable/reports';

type FormFields = z.infer<typeof ttMonthEndReportSchema.search>;

interface IAcademicYear {
    asmaY_Id: number;
    asmaY_Year: string;
}

interface IMonth {
    ivrM_Month_Id: number;
    ivrM_Month_Name: string;
}

interface ReportFormProps {
    academicYears: IAcademicYear[];
    months: IMonth[];
    loadingDetails: boolean;
    onSubmit: (data: FormFields) => Promise<void>;
    onClear: () => void;
}

export default function ReportForm({ academicYears, months, loadingDetails, onSubmit, onClear }: ReportFormProps) {
    const {
        control,
        handleSubmit,
        register,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(ttMonthEndReportSchema.search),
        defaultValues: {
            asmaY_Id: undefined,
            month: undefined,
            name: ''
        }
    });

    const handleClear = () => {
        reset();
        onClear();
    };

    return (
        <CollapsibleSection title='Time Table Month End Report' defaultOpen={true}>
            {loadingDetails ? (
                <div className='flex items-center justify-center p-8'>
                    <RefreshCw className='h-6 w-6 animate-spin text-primary' />
                    <span className='ml-3 text-muted-foreground'>Loading criteria details...</span>
                </div>
            ) : (
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-6 p-4'>
                    <div className='mx-auto grid max-w-4xl grid-cols-1 gap-x-12 gap-y-6 md:grid-cols-2'>
                        {/* Academic Year Select */}
                        <div className='flex flex-col gap-2'>
                            <Label htmlFor='asmaY_Id' className='font-semibold text-sm'>
                                Academic Year:<span className='ml-0.5 text-red-500'>*</span>
                            </Label>
                            <Controller
                                name='asmaY_Id'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        key={field.value ?? 'empty-year'}
                                        onValueChange={(val) => field.onChange(val ? Number(val) : undefined)}
                                        value={field.value ? String(field.value) : ''}>
                                        <SelectTrigger id='asmaY_Id' className='w-full'>
                                            <SelectValue placeholder='Select Academic Year' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {academicYears.map((item) => (
                                                <SelectItem key={item.asmaY_Id} value={String(item.asmaY_Id)}>
                                                    {item.asmaY_Year}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.asmaY_Id && <FormError>{errors.asmaY_Id.message}</FormError>}
                        </div>

                        {/* Month Select */}
                        <div className='flex flex-col gap-2'>
                            <Label htmlFor='month' className='font-semibold text-sm'>
                                Month:<span className='ml-0.5 text-red-500'>*</span>
                            </Label>
                            <Controller
                                name='month'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        key={field.value ?? 'empty-month'}
                                        onValueChange={(val) => field.onChange(val ? Number(val) : undefined)}
                                        value={field.value ? String(field.value) : ''}>
                                        <SelectTrigger id='month' className='w-full'>
                                            <SelectValue placeholder='Select Month' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {months.map((item) => (
                                                <SelectItem key={item.ivrM_Month_Id} value={String(item.ivrM_Month_Id)}>
                                                    {item.ivrM_Month_Name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.month && <FormError>{errors.month.message}</FormError>}
                        </div>

                        {/* IE Name Input */}
                        {/* <div className='flex max-w-md flex-col gap-2 md:col-span-2'>
                            <Label htmlFor='name' className='font-semibold text-sm'>
                                IE Name:
                            </Label>
                            <InputText id='name' placeholder='Enter Implementation Engineer Name' {...register('name')} />
                        </div> */}
                    </div>

                    {/* Action Buttons */}
                    <div className='mx-auto flex max-w-4xl justify-end gap-3 border-t pt-4'>
                        <Button type='button' variant='outline' onClick={handleClear} disabled={isSubmitting}>
                            Clear
                        </Button>
                        <Button type='submit' disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                                    Generating...
                                </>
                            ) : (
                                'Report'
                            )}
                        </Button>
                    </div>
                </form>
            )}
        </CollapsibleSection>
    );
}
