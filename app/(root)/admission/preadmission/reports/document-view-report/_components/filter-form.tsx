'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/extension/field';
import { FormError } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown, useMasterClassDropdown } from '@/hooks/admission/preadmission/useMasters';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

const filterSchema = z.object({
    asmaY_Id: z.number().min(1, 'Academic Year is required'),
    asmcL_Id: z
        .number({
            required_error: 'Class is required',
            invalid_type_error: 'Class is required'
        })
        .min(0)
});

type FormFields = z.infer<typeof filterSchema>;

interface FilterFormProps {
    onFilterChange: (payload: any, reset?: boolean) => void;
}

export default function FilterForm({ onFilterChange }: FilterFormProps) {
    const {
        handleSubmit,
        control,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(filterSchema),
        defaultValues: {
            asmaY_Id: 0,
            asmcL_Id: undefined
        }
    });

    const { data: academicYears, isLoading: academicYearLoading } = useAcademicYearDropdown();
    const { data: classes, isLoading: classesLoading } = useMasterClassDropdown();

    const onSubmit = (data: FormFields) => {
        onFilterChange({
            asmaY_Id: data.asmaY_Id,
            asmcL_Id: data.asmcL_Id || 0
        });
    };

    const handleReset = () => {
        reset();
        onFilterChange({}, true);
        window.location.reload();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div className='space-y-2'>
                    <Label htmlFor='asmaY_Id'>
                        Academic Year <span className='text-destructive'>*</span>
                    </Label>
                    <Controller
                        name='asmaY_Id'
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value ? String(field.value) : undefined}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select Academic Year' />
                                </SelectTrigger>
                                <SelectContent>
                                    {academicYears?.data?.map((year) => (
                                        <SelectItem key={year.asmaY_Id} value={String(year.asmaY_Id)}>
                                            {year.asmaY_Year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.asmaY_Id && <FormError>{errors.asmaY_Id.message}</FormError>}
                </div>

                <div className='space-y-2'>
                    <Label htmlFor='asmcL_Id'>Class</Label>
                    <Controller
                        name='asmcL_Id'
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value ? String(field.value) : undefined}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select Class' />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='0'>All</SelectItem>
                                    {classes?.data?.map((cls) => (
                                        <SelectItem key={cls.asmcL_Id} value={String(cls.asmcL_Id)}>
                                            {cls.asmcL_ClassName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.asmcL_Id && <FormError>{errors.asmcL_Id.message}</FormError>}
                </div>
            </div>

            <div className='flex gap-2'>
                <Button type='submit' disabled={isSubmitting} className='gap-2'>
                    <Search className='h-4 w-4' />
                    Report
                </Button>
                <Button type='button' variant='outline' onClick={handleReset} disabled={isSubmitting}>
                    Reset
                </Button>
            </div>
        </form>
    );
}
