'use client';

import { Button } from '@/components/ui/button';
import { InputText } from '@/components/ui/extension/input-text';
import { Label } from '@/components/ui/label';
import { SpinnerTimePicker } from '../../breaktimesettings/_components/SpinnerTimePicker';
import {
    useAcademicYearPeriodDistrubution,
    useCategtoryPeriodDistrubution,
    useDayDropDownMasterDayClasswise,
    usePeriodDropdown,
    usePeriodTimeSettingDetails
} from '@/hooks/timetable/useMasters';
import { cn } from '@/lib/utils';
import { periodTimeSettingSchema } from '@/schemas/timetable/masters';
import { savePeriodTimeSetting } from '@/server/timetable/masters/periodtimesetting';
import type { IPeriodTimeSettingData } from '@/types/timetable/masters/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CheckSquare, Save, Square } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type FormFields = z.infer<typeof periodTimeSettingSchema.save>;

interface UpdatePeriodTimeSettingFormProps {
    onSuccess?: () => void;
    selectedRow: IPeriodTimeSettingData;
}

export default function UpdatePeriodTimeSettingForm({ onSuccess, selectedRow: row }: UpdatePeriodTimeSettingFormProps) {
    const { refetchAll } = usePeriodTimeSettingDetails();
    const [daySearch, setDaySearch] = useState('');
    const { data: academicData, isLoading: acadLoading } = useAcademicYearPeriodDistrubution();
    const { data: categoryData, isLoading: catLoading } = useCategtoryPeriodDistrubution();
    const { data: periodList, isLoading: periodLoading } = usePeriodDropdown();
    const { data: dayData, isLoading: dayLoading } = useDayDropDownMasterDayClasswise();
    const [isRowBinding, setIsRowBinding] = useState(true);

    const {
        handleSubmit,
        watch,
        control,
        setValue,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(periodTimeSettingSchema.save),
        defaultValues: {
            ttmdpT_Id: row.ttmdpT_Id,
            dayids: []
        }
    });

    const day_ids = watch('dayids') || [];
    const startTime = watch('startTime');

    // Reset endTime when startTime changes
    useEffect(() => {
        if (startTime) {
            // Only clear if it's a user interaction, but for initialization we need to be careful
            // However, the AngularJS logic says clear EndTime when StartTime changes.
        }
    }, [startTime, setValue]);

    const filteredDays = dayData?.data?.filter((d) => d.ttmD_DayName.toLowerCase().includes(daySearch.toLowerCase())) ?? [];

    const toggleDay = (id: string) => {
        let updated: string[] = [];
        if (day_ids.includes(id)) {
            updated = day_ids.filter((v) => v !== id);
        } else {
            updated = [...day_ids, id];
        }

        setValue('dayids', updated.length === 0 ? (undefined as any) : (updated as [string, ...string[]]), {
            shouldValidate: true
        });
    };

    const parseTimeString = (timeStr: string) => {
        if (!timeStr) return null;
        try {
            const [time, modifier] = timeStr.split(' ');
            let [hours, minutes] = time.split(':');
            if (hours === '12') hours = '00';
            if (modifier === 'PM') hours = (Number.parseInt(hours, 10) + 12).toString();

            const date = new Date();
            date.setHours(Number.parseInt(hours, 10));
            date.setMinutes(Number.parseInt(minutes, 10));
            date.setSeconds(0);
            date.setMilliseconds(0);
            return date;
        } catch (e) {
            console.error('Error parsing time', e);
            return null;
        }
    };

    useEffect(() => {
        if (row?.ttmdpT_Id && !acadLoading && !catLoading && !periodLoading && !dayLoading) {
            const acadId = row.asmaY_Id || academicData?.find((a) => a.asmaY_Year === row.asmaY_Year)?.asmaY_Id;
            const catId = row.ttmC_Id || categoryData?.find((c) => c.ttmC_CategoryName === row.ttmC_CategoryName)?.ttmC_Id;
            const perId = row.ttmP_Id || periodList?.data?.find((p) => p.ttmP_PeriodName === row.ttmP_PeriodName)?.ttmP_Id;
            const dayId = row.ttmD_Id || dayData?.data?.find((d) => d.ttmD_DayName === row.ttmD_DayName)?.ttmD_Id;

            reset({
                ttmdpT_Id: row.ttmdpT_Id,
                asmaY_Id: acadId,
                ttmC_Id: catId,
                ttmP_Id: perId,
                startTime: parseTimeString(row.ttmdpT_StartTime) ?? undefined,
                endTime: parseTimeString(row.ttmdpT_EndTime) ?? undefined,
                dayids: dayId ? ([dayId.toString()] as [string, ...string[]]) : ([] as any)
            });
            setIsRowBinding(false);
        }
    }, [row, reset, academicData, categoryData, periodList, dayData, acadLoading, catLoading, periodLoading, dayLoading]);

    const onSubmit = async (data: FormFields) => {
        try {
            const startMin = data.startTime.getHours() * 60 + data.startTime.getMinutes();
            const endMin = data.endTime.getHours() * 60 + data.endTime.getMinutes();
            if (endMin <= startMin) {
                toast.error('To Time must be greater than From Time');
                return;
            }

            const formatTime = (date: Date) => format(date, 'h:mm a');

            const payload = {
                ttmdpT_Id: data.ttmdpT_Id,
                asmaY_Id: data.asmaY_Id,
                ttmC_Id: data.ttmC_Id,
                ttmP_Id: data.ttmP_Id,
                ttmdpT_StartTime: formatTime(data.startTime),
                ttmdpT_EndTime: formatTime(data.endTime),
                datidss: data.dayids.map((id) => ({ ttmD_Id: Number(id) }))
            };

            const response = await savePeriodTimeSetting(payload);
            const isSuccess =
                response?.returnval === true ||
                response?.returnval === 'saved' ||
                response?.returnval === 'updated' ||
                response?.success === true ||
                response?.message?.toLowerCase().includes('success');

            if (isSuccess) {
                toast.success('Data saved successfully');
                refetchAll();
                onSuccess?.();
            } else {
                toast.error(response?.message || 'Failed to save data');
            }
        } catch (error: any) {
            toast.error(error?.message || 'Failed to save data');
        }
    };

    if (acadLoading || catLoading || periodLoading || dayLoading || isRowBinding) {
        return (
            <div className='flex h-64 items-center justify-center'>
                <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
                <span className='ml-3 animate-pulse text-muted-foreground'>Loading and binding data...</span>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6 p-4'>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                <div className='space-y-2'>
                    <Label className='font-medium'>
                        Academic Year <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        control={control}
                        name='asmaY_Id'
                        render={({ field }) => (
                            <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                <SelectTrigger className='w-full'>
                                    <SelectValue placeholder='Select Academic Year' />
                                </SelectTrigger>
                                <SelectContent>
                                    {(academicData || []).map((item) => (
                                        <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                            {item.asmaY_Year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.asmaY_Id && <p className='text-red-500 text-xs'>{errors.asmaY_Id.message}</p>}
                </div>

                <div className='space-y-2'>
                    <Label className='font-medium'>
                        Category <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        control={control}
                        name='ttmC_Id'
                        render={({ field }) => (
                            <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                <SelectTrigger className='w-full'>
                                    <SelectValue placeholder='Select Category' />
                                </SelectTrigger>
                                <SelectContent>
                                    {(categoryData || []).map((item) => (
                                        <SelectItem key={item.ttmC_Id} value={item.ttmC_Id.toString()}>
                                            {item.ttmC_CategoryName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.ttmC_Id && <p className='text-red-500 text-xs'>{errors.ttmC_Id.message}</p>}
                </div>

                <div className='space-y-2'>
                    <Label className='font-medium'>
                        Period <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        control={control}
                        name='ttmP_Id'
                        render={({ field }) => (
                            <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                <SelectTrigger className='w-full'>
                                    <SelectValue placeholder='Select Period' />
                                </SelectTrigger>
                                <SelectContent>
                                    {periodLoading ? (
                                        <SelectItem value='loading' disabled>
                                            Loading...
                                        </SelectItem>
                                    ) : (
                                        periodList?.data?.map((item) => (
                                            <SelectItem key={item.ttmP_Id} value={item.ttmP_Id.toString()}>
                                                {item.ttmP_PeriodName}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.ttmP_Id && <p className='text-red-500 text-xs'>{errors.ttmP_Id.message}</p>}
                </div>

                <div className='space-y-2'>
                    <Label className='font-medium'>
                        Days <span className='text-red-500'>*</span>
                    </Label>
                    <div className='rounded-md border border-input bg-background p-3'>
                        <InputText
                            placeholder='Search days...'
                            value={daySearch}
                            onChange={(e) => setDaySearch(e.target.value)}
                            className='mb-2 h-8 text-sm'
                        />
                        <div className='max-h-32 space-y-1 overflow-y-auto pr-2'>
                            {dayLoading ? (
                                <p className='py-2 text-center text-muted-foreground text-xs'>Loading days...</p>
                            ) : filteredDays.length === 0 ? (
                                <p className='py-2 text-center text-muted-foreground text-xs'>No days found</p>
                            ) : (
                                filteredDays.map((d) => {
                                    const id = d.ttmD_Id.toString();
                                    const selected = day_ids.includes(id);
                                    return (
                                        <div
                                            key={id}
                                            onClick={() => toggleDay(id)}
                                            className={cn(
                                                'flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 transition-colors hover:bg-accent hover:text-accent-foreground',
                                                selected ? 'bg-primary/10 font-medium text-primary' : 'text-sm'
                                            )}>
                                            {selected ? (
                                                <CheckSquare className='h-4 w-4 shrink-0' />
                                            ) : (
                                                <Square className='h-4 w-4 shrink-0 text-muted-foreground' />
                                            )}
                                            <span>{d.ttmD_DayName}</span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                    {errors.dayids && <p className='text-red-500 text-xs'>{errors.dayids.message}</p>}
                </div>

                <div className='space-y-2'>
                    <Label className='font-medium'>
                        From Time <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        control={control}
                        name='startTime'
                        render={({ field }) => (
                            <SpinnerTimePicker
                                value={field.value}
                                onChange={(date) => {
                                    field.onChange(date);
                                    setValue('endTime', undefined as any);
                                }}
                            />
                        )}
                    />
                    {errors.startTime && <p className='text-red-500 text-xs'>{errors.startTime.message}</p>}
                </div>

                <div className='space-y-2'>
                    <Label className='font-medium'>
                        To Time <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        control={control}
                        name='endTime'
                        render={({ field }) => <SpinnerTimePicker value={field.value} onChange={field.onChange} />}
                    />
                    {errors.endTime && <p className='text-red-500 text-xs'>{errors.endTime.message}</p>}
                </div>
            </div>

            <div className='flex items-center justify-end gap-3 border-t pt-6'>
                <Button
                    type='button'
                    variant='outline'
                    onClick={() => reset()}
                    disabled={isSubmitting}
                    className='px-6 transition-all active:scale-95'>
                    Reset
                </Button>
                <Button type='submit' disabled={isSubmitting} className='px-6 transition-all active:scale-95' isLoading={isSubmitting}>
                    <Save className='mr-2 h-4 w-4' />
                    Update Setting
                </Button>
            </div>
        </form>
    );
}
