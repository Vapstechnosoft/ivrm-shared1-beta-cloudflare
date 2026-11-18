'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTimeTableAcademicYear } from '@/hooks/timetable/useMasters';
import { constraintReportSchema } from '@/schemas/timetable/reports/constraintReport';
import { getConstraintReport } from '@/server/timetable/reports/constraintReport';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Search, X } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import type { z } from 'zod';

type FormFields = z.infer<typeof constraintReportSchema.search>;

interface ConstraintReportFormProps {
    onReportGenerated: (response: any, payload: any) => void;
    onCancel: () => void;
}

export default function ConstraintReportForm({ onReportGenerated, onCancel }: ConstraintReportFormProps) {
    const { data: academicyeardata } = useTimeTableAcademicYear();
    const academicList = (academicyeardata as any)?.data || [];

    const {
        control,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
        reset
    } = useForm<FormFields>({
        resolver: zodResolver(constraintReportSchema.search),
        defaultValues: {
            asmaY_Id: 0,
            ttconstrep: 'F',
            fixing1: 'DP'
        }
    });

    const ttconstrepValue = watch('ttconstrep');

    const onFormSubmit = async (data: FormFields) => {
        const payload = {
            ASMAY_Id: data.asmaY_Id,
            constype: data.ttconstrep,
            periodtype: data.fixing1 || ''
        };

        try {
            console.log('constraint report payload', JSON.stringify(payload));
            const response = await getConstraintReport(payload);
            console.log('constraint report response', response);
            onReportGenerated(response, data);
        } catch (error: any) {
            console.error('Error generating constraint report:', error);
            throw error;
        }
    };

    const handleCancelClick = () => {
        reset();
        onCancel();
    };

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className='space-y-6 rounded-lg border bg-white p-6 shadow-sm'>
            <div className='flex flex-col items-center space-y-6'>
                {/* Constraint Type Radio Group */}
                <Controller
                    control={control}
                    name='ttconstrep'
                    render={({ field }) => (
                        <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className='flex flex-wrap justify-center gap-6 rounded-lg bg-gray-50 p-4 w-full md:w-3/4'>
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='F' id='tt-f' />
                                <Label htmlFor='tt-f'>Fixing</Label>
                            </div>
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='R' id='tt-r' />
                                <Label htmlFor='tt-r'>Restriction</Label>
                            </div>
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='C' id='tt-c' />
                                <Label htmlFor='tt-c'>Consecutive</Label>
                            </div>
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='B' id='tt-b' />
                                <Label htmlFor='tt-b'>Bifurcation</Label>
                            </div>
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='L' id='tt-l' />
                                <Label htmlFor='tt-l'>Lab</Label>
                            </div>
                        </RadioGroup>
                    )}
                />

                {/* Sub-type Radio Group for F or R */}
                {(ttconstrepValue === 'F' || ttconstrepValue === 'R') && (
                    <Controller
                        control={control}
                        name='fixing1'
                        render={({ field }) => (
                            <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className='flex flex-wrap justify-center gap-6 rounded-lg bg-gray-50 p-4 w-full md:w-3/4'>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='DP' id='sub-dp' />
                                    <Label htmlFor='sub-dp'>Day Period</Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='DS' id='sub-ds' />
                                    <Label htmlFor='sub-ds'>Day Staff</Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='DSUB' id='sub-dsub' />
                                    <Label htmlFor='sub-dsub'>Day Subject</Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='PS' id='sub-ps' />
                                    <Label htmlFor='sub-ps'>Period Staff</Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='PSUB' id='sub-psub' />
                                    <Label htmlFor='sub-psub'>Period Subject</Label>
                                </div>
                            </RadioGroup>
                        )}
                    />
                )}

                {/* Academic Year Dropdown */}
                <div className='w-full md:w-1/2 space-y-2'>
                    <Label>
                        Academic Year <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        control={control}
                        name='asmaY_Id'
                        render={({ field }) => (
                            <Select
                                key={field.value ?? 'empty'}
                                value={field.value && field.value !== 0 ? field.value.toString() : undefined}
                                onValueChange={(val) => field.onChange(Number(val))}>
                                <SelectTrigger>
                                    <SelectValue placeholder='--Select--' />
                                </SelectTrigger>
                                <SelectContent>
                                    {academicList.map((item: any) => (
                                        <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                            {item.asmaY_Year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.asmaY_Id && <span className='text-red-500 text-sm'>{errors.asmaY_Id.message}</span>}
                </div>
            </div>

            <div className='flex justify-center space-x-2 mt-6'>
                <Button type='submit' disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                    <Search className='mr-2 h-4 w-4' />
                    Report
                </Button>
                <Button type='button' variant='outline' onClick={handleCancelClick}>
                    <X className='mr-2 h-4 w-4' />
                    Cancel
                </Button>
            </div>
        </form>
    );
}
