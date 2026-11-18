'use client';

import { Button } from '@/components/ui/button';
import { InputText } from '@/components/ui/extension/input-text';
import { useFormContext } from '@/components/ui/form/form-provider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    useAcademicYearPeriodDistrubution,
    useCategtoryPeriodDistrubution,
    useDayDropDownMasterDayClasswise,
    usePeriodDropdown,
    usePeriodTimeSettingDetails
} from '@/hooks/timetable/useMasters';
import { cn } from '@/lib/utils';
import { periodTimeSettingSchema } from '@/schemas/timetable/masters';
import { getPeriodTimeSettingDetails, savePeriodTimeSetting } from '@/server/timetable/masters/periodtimesetting';
import type { IPeriodTimeSettingData } from '@/types/timetable/masters/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CheckSquare, Save, Square } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import { SpinnerTimePicker } from '../../breaktimesettings/_components/SpinnerTimePicker';

type FormFields = z.infer<typeof periodTimeSettingSchema.save>;

interface PeriodTimeSettingFormProps {
    onSuccess?: () => void;
}

export default function PeriodTimeSettingForm({ onSuccess }: PeriodTimeSettingFormProps) {
    const { data: response, refetchAll } = usePeriodTimeSettingDetails();
    const { selectedRow: editData, closeEditForm } = useFormContext<IPeriodTimeSettingData>();
    const [daySearch, setDaySearch] = useState('');
    const { data: academicData } = useAcademicYearPeriodDistrubution();
    const { data: categoryData } = useCategtoryPeriodDistrubution();

    const { data: periodList, isLoading: perioddataloading, error: perioddataError, refetchAll: perioddataRefetch } = usePeriodDropdown();

    console.log('periodList', periodList);

    const {
        data: Masterdaydata,
        isLoading: masterdaydataloading,
        error: masterdaydataError,
        refetchAll: masterdaydataRefetch
    } = useDayDropDownMasterDayClasswise();

    //const periodList: any[] = (response as any)?.perioddrp || [];
    const dayList: any[] = (response as any)?.daydrp || [];

    const {
        register,
        handleSubmit,
        watch,
        control,
        setValue,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(periodTimeSettingSchema.save),
        defaultValues: {
            dayids: undefined
        }
    });

    const day_ids = watch('dayids') || [];
    const startTime = watch('startTime');

    // Reset endTime when startTime changes (Requirement: ng-change="validateTomintime(StartTime)")
    useEffect(() => {
        if (startTime) {
            setValue('endTime', undefined as any, { shouldValidate: false });
        }
    }, [startTime, setValue]);

    const filteredDayIds = Masterdaydata?.data?.filter((d) => d.ttmD_DayName.toLowerCase().includes(daySearch.toLowerCase())) ?? [];

    const toggleDay = (id: string) => {
        let updated: string[] = [];

        if (day_ids.includes(id)) {
            updated = day_ids.filter((v) => v !== id);
        } else {
            updated = [...day_ids, id];
        }

        if (updated.length === 0) {
            setValue('dayids', undefined as any);
        } else {
            setValue('dayids', updated as [string, ...string[]], {
                shouldValidate: true
            });
        }
    };
    // Populate Form on Edit
    useEffect(() => {
        if (Array.isArray(editData) && editData.ttmdpT_Id) {
            const fetchData = async () => {
                try {
                    const res: any = await getPeriodTimeSettingDetails(editData.ttmdpT_Id);
                    if (res?.periodlistedit?.length > 0) {
                        const data = res.periodlistedit[0];
                        setValue('ttmdpT_Id', data.ttmdpT_Id);
                        setValue('asmaY_Id', data.asmaY_Id);
                        setValue('ttmC_Id', data.ttmC_Id);
                        setValue('ttmP_Id', data.ttmP_Id);

                        // Parse Time
                        // Assuming time comes as "10:30 AM" or similar string, need to convert to Date object for TimePicker
                        // Use a dummy date and set time
                        const parseTime = (timeStr: string) => {
                            const [time, modifier] = timeStr.split(' ');
                            let [hours, minutes] = time.split(':');
                            if (hours === '12') {
                                hours = '00';
                            }
                            if (modifier === 'PM') {
                                hours = (Number.parseInt(hours, 10) + 12).toString();
                            }
                            const date = new Date();
                            date.setHours(Number.parseInt(hours, 10));
                            date.setMinutes(Number.parseInt(minutes, 10));
                            date.setSeconds(0);
                            return date;
                        };

                        if (data.ttmdpT_StartTime) setValue('startTime', parseTime(data.ttmdpT_StartTime));
                        if (data.ttmdpT_EndTime) setValue('endTime', parseTime(data.ttmdpT_EndTime));

                        // Set Day
                        // Edit mode usually returns a single day for the record, but form supports multiple for creation
                        // We will set the single day in the array
                        const selectedDay = dayList.find((d) => d.ttmD_Id === data.ttmD_Id);
                        if (selectedDay) {
                            setValue('dayids', [selectedDay.ttmD_Id.toString()]); // Just set the object directly if schema allows or structure accordingly
                        }
                    }
                } catch (err) {
                    console.error('Error fetching details', err);
                    toast.error('Failed to fetch details');
                }
            };
            fetchData();
        }
    }, [editData, setValue, dayList]);

    const onSubmit = async (data: FormFields) => {
        try {
            // Format times to "h:mm a"
            const formatTime = (date: Date) => format(date, 'h:mm a');

            const payload = {
                ttmdpT_Id: data.ttmdpT_Id || 0,
                asmaY_Id: data.asmaY_Id,
                ttmC_Id: data.ttmC_Id,
                ttmP_Id: data.ttmP_Id,
                ttmdpT_StartTime: formatTime(data.startTime),
                ttmdpT_EndTime: formatTime(data.endTime),
                datidss: data.dayids.map((id) => ({
                    ttmD_Id: Number(id)
                }))
            };

            // Validation: End Time must be greater than Start Time
            const startMin = data.startTime.getHours() * 60 + data.startTime.getMinutes();
            const endMin = data.endTime.getHours() * 60 + data.endTime.getMinutes();
            if (endMin <= startMin) {
                toast.error('To Time must be greater than From Time');
                return;
            }

            console.log('Submitting Payload:', JSON.stringify(payload));
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
                cancelEdit();
            } else {
                toast.error(response?.message || 'Failed to save data');
            }
        } catch (error: any) {
            toast.error(error?.message || 'Failed to save data');
        }
    };

    const cancelEdit = () => {
        reset({
            ttmdpT_Id: 0,
            asmaY_Id: '' as any,
            ttmC_Id: '' as any,
            ttmP_Id: '' as any,
            dayids: undefined as any,
            startTime: undefined,
            endTime: undefined
        });
        setDaySearch('');
        closeEditForm();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6 p-4'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div className='space-y-2'>
                    <Label>
                        Academic Year <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        control={control}
                        name='asmaY_Id'
                        render={({ field }) => (
                            <Select
                                key={field.value?.toString() || 'empty'}
                                onValueChange={(val) => field.onChange(Number(val))}
                                value={field.value?.toString() || undefined}>
                                <SelectTrigger>
                                    <SelectValue placeholder='--Select--' />
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
                    {errors.asmaY_Id && <span className='text-red-500 text-sm'>{errors.asmaY_Id.message}</span>}
                </div>

                <div className='space-y-2'>
                    <Label>
                        Category Name <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        control={control}
                        name='ttmC_Id'
                        render={({ field }) => (
                            <Select
                                key={field.value?.toString() || 'empty'}
                                onValueChange={(val) => field.onChange(Number(val))}
                                value={field.value?.toString() || undefined}>
                                <SelectTrigger>
                                    <SelectValue placeholder='--Select--' />
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
                    {errors.ttmC_Id && <span className='text-red-500 text-sm'>{errors.ttmC_Id.message}</span>}
                </div>

                <div className='space-y-2'>
                    <Label>
                        No of Period <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        control={control}
                        name='ttmP_Id'
                        render={({ field }) => (
                            <Select
                                key={field.value?.toString() || 'empty'}
                                onValueChange={(value) => {
                                    field.onChange(value ? Number(value) : '');
                                }}
                                value={field.value?.toString() || undefined}>
                                <SelectTrigger className='w-full'>
                                    <SelectValue placeholder='Select Period' />
                                </SelectTrigger>
                                <SelectContent>
                                    {perioddataloading ? (
                                        <SelectItem value='loading' disabled>
                                            Loading Periods
                                        </SelectItem>
                                    ) : perioddataError ? (
                                        <SelectItem value='error' disabled>
                                            Error loading Periods
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
                    {errors.ttmP_Id && <span className='text-red-500 text-sm'>{errors.ttmP_Id.message}</span>}
                </div>
                <div className='space-y-2'>
                    <Label>
                        Day <span className='text-red-500'>*</span>
                    </Label>

                    <div className='mt-2 rounded-md border border-gray-300 bg-white p-3'>
                        <InputText
                            placeholder='Search Day...'
                            value={daySearch}
                            onChange={(e) => setDaySearch(e.target.value)}
                            className='mb-3'
                        />

                        {/* {Masterdaydata?.data && (
                            <div
                                onClick={selectAllDayIds}
                                className={cn(
                                    'mb-2 flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1.5 font-medium text-sm transition-all',
                                    day_ids.length === (daySearch.trim() ? filteredDayIds.length : Masterdaydata.data.length) &&
                                        day_ids.length > 0
                                        ? 'border-primary bg-primary/5 text-primary'
                                        : 'border-gray-300 hover:border-primary/40'
                                )}>
                                {day_ids.length === (daySearch.trim() ? filteredDayIds.length : Masterdaydata.data.length) &&
                                day_ids.length > 0 ? (
                                    <CheckSquare className='h-4 w-4 text-primary' />
                                ) : (
                                    <Square className='h-4 w-4 text-gray-400' />
                                )}
                                <span>Select All</span>
                            </div>
                        )} */}

                        <div className='max-h-40 overflow-y-auto rounded-md border border-gray-300 p-1'>
                            {masterdaydataloading ? (
                                <div className='py-4 text-center text-gray-500 text-sm'>Loading Days...</div>
                            ) : filteredDayIds.length === 0 ? (
                                <div className='py-4 text-center text-gray-500 text-sm'>No Day found</div>
                            ) : (
                                filteredDayIds.map((d) => {
                                    const id = d.ttmD_Id.toString();
                                    const selected = day_ids.includes(id);

                                    return (
                                        <div
                                            key={d.ttmD_Id}
                                            onClick={() => toggleDay(id)}
                                            className={cn(
                                                'mb-1 flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1.5 text-sm transition-all',
                                                selected
                                                    ? 'border-primary bg-primary/5 text-primary'
                                                    : 'border-gray-300 hover:border-primary/40'
                                            )}>
                                            {selected ? (
                                                <CheckSquare className='h-4 w-4 text-primary' />
                                            ) : (
                                                <Square className='h-4 w-4 text-gray-400' />
                                            )}
                                            <span>{d.ttmD_DayName}</span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {errors.dayids && <span className='text-red-500 text-sm'>{errors.dayids.message}</span>}
                </div>

                <div className='space-y-2'>
                    <Label>
                        From Time <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        control={control}
                        name='startTime'
                        render={({ field }) => <SpinnerTimePicker value={field.value} onChange={field.onChange} />}
                    />
                    {errors.startTime && <span className='text-red-500 text-sm'>{errors.startTime.message}</span>}
                </div>

                <div className='space-y-2'>
                    <Label>
                        To Time <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        control={control}
                        name='endTime'
                        render={({ field }) => <SpinnerTimePicker value={field.value} onChange={field.onChange} />}
                    />
                    {errors.endTime && <span className='text-red-500 text-sm'>{errors.endTime.message}</span>}
                </div>
            </div>

            <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                <Button
                    type='button'
                    variant='outline'
                    onClick={cancelEdit}
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
                        Save
                    </div>
                </Button>
                {/* <Button type='submit' disabled={isSubmitting} isLoading={isSubmitting}>
                    <Save className='mr-2 h-4 w-4' />
                    {editData ? 'Update' : 'Save'}
                </Button> */}
            </div>

            {/* <div className='flex justify-center gap-3'>
                <Button type='submit' disabled={isSubmitting} isLoading={isSubmitting}>
                    <Save className='mr-2 h-4 w-4' />
                    {editData ? 'Update' : 'Save'}
                </Button>
                <Button type='button' variant='destructive' onClick={cancelEdit}>
                    <X className='mr-2 h-4 w-4' />
                    Cancel
                </Button>
            </div> */}
        </form>
    );
}
