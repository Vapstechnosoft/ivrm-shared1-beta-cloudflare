'use client';

import { Button } from '@/components/ui/button';
import { InputText } from '@/components/ui/extension/input-text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMasterRackDetails } from '@/hooks/library/useMasters';
import { masterRackDetailsSchema } from '@/schemas/library/masters';
import { addOrUpdateMasterRack } from '@/server/library/masters/rack-details';
import type { IMasterRackDetails } from '@/types/library/masters/rack-details';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterRackDetailsSchema.addOrUpdate>;

interface UpdateMasterRackFormProps {
    onSuccess?: () => void;
    className?: string;
    selectedRow: IMasterRackDetails;
    subjectList: any[];
}

export default function UpdateMasterRackForm({ onSuccess, className = '', selectedRow: row, subjectList }: UpdateMasterRackFormProps) {
    const { refetchAll } = useMasterRackDetails();

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterRackDetailsSchema.addOrUpdate),
        mode: 'onChange',
        defaultValues: {
            lmrA_Id: row.lmrA_Id,
            lmrA_BuildingName: row.lmrA_BuildingName,
            lmrA_RackName: row.lmrA_RackName,
            lmrA_DisplayColour: row.lmrA_DisplayColour,
            lmrA_FloorName: row.lmrA_FloorName,
            lmrA_Location: row.lmrA_Location,
            lmS_Id: row.lmS_Id
        }
    });

    useEffect(() => {
        if (row) {
            reset({
                ...row,
                lmS_Id: row.lmS_Id ? Number(row.lmS_Id) : undefined
            } as any);
        }
    }, [row, reset]);

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const response: any = await addOrUpdateMasterRack(data);

            if (response.returnval || response.success) {
                toast.success(response.message || 'Record Updated Successfully!!!');
                reset(data);
                refetchAll();
                onSuccess?.();
            } else if (response.duplicate) {
                toast.error(response.message || 'Record already exist');
            } else {
                toast.error(response.message || 'Record Not Updated Successfully!!!');
            }
        } catch (error: any) {
            toast.error(error.message || 'Something went wrong');
        }
    };

    const handleReset = () => {
        reset({
            lmrA_Id: row.lmrA_Id,
            lmrA_BuildingName: '',
            lmrA_RackName: '',
            lmrA_DisplayColour: '',
            lmrA_FloorName: '',
            lmrA_Location: '',
            lmS_Id: 0,
            lmrA_ActiveFlag: row.lmrA_ActiveFlag
        });
    };

    return (
        <div className={className}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <InputText
                            label='Building Name'
                            required
                            placeholder='Enter Building Name'
                            {...register('lmrA_BuildingName')}
                            error={errors.lmrA_BuildingName?.message}
                        />
                        <InputText
                            label='Rack Name'
                            required
                            placeholder='Enter Rack Name'
                            {...register('lmrA_RackName')}
                            error={errors.lmrA_RackName?.message}
                        />
                        <InputText
                            label='Rack Color'
                            placeholder='Enter Rack Color'
                            {...register('lmrA_DisplayColour')}
                            error={errors.lmrA_DisplayColour?.message}
                        />
                        <Controller
                            control={control}
                            name='lmS_Id'
                            render={({ field }) => (
                                <div className='flex flex-col gap-1.5'>
                                    <label className='font-medium text-sm'>
                                        Subject Name <span className='text-red-500'>*</span>
                                    </label>
                                    <Select
                                        onValueChange={(value) => field.onChange(Number(value))}
                                        value={field.value ? String(field.value) : undefined}>
                                        <SelectTrigger className={errors.lmS_Id ? 'border-red-500' : ''}>
                                            <SelectValue placeholder='--Select--' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {subjectList.map((subject: any) => (
                                                <SelectItem key={subject.lmS_Id} value={String(subject.lmS_Id)}>
                                                    {subject.lmS_SubjectName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.lmS_Id && <span className='text-red-500 text-sm'>{errors.lmS_Id.message}</span>}
                                </div>
                            )}
                        />
                        <InputText
                            label='Floor Name'
                            required
                            placeholder='Enter Floor Name'
                            {...register('lmrA_FloorName')}
                            error={errors.lmrA_FloorName?.message}
                        />
                    </div>
                    <div className='grid grid-cols-1'>
                        <div className='flex flex-col gap-1.5'>
                            <label className='font-medium text-sm'>
                                Location <span className='text-red-500'>*</span>
                            </label>
                            <textarea
                                className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.lmrA_Location ? 'border-red-500' : ''}`}
                                placeholder='Enter Location'
                                {...register('lmrA_Location')}
                            />
                            {errors.lmrA_Location && <span className='text-red-500 text-sm'>{errors.lmrA_Location.message}</span>}
                        </div>
                    </div>
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
                            Update
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
