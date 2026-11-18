'use client';

import { Button } from '@/components/ui/button';
import { CalendarYear } from '@/components/ui/calendar_year';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useScheduleList, useScheduleReportInitialDetails } from '@/hooks/admission/preadmission/useReports';
import { scheduleReportSchema } from '@/schemas/admission/preadmission/reports';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof scheduleReportSchema>;

interface AddScheduleReportFormProps {
    onFilterChange?: (payload: any, reset?: boolean) => void;
}

/**
 * Filter form for generating the Schedule Report.
 */
export default function AddScheduleReportForm({ onFilterChange }: AddScheduleReportFormProps) {
    const {
        handleSubmit,
        control,
        reset,
        watch,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(scheduleReportSchema),
        defaultValues: {
            autostudent: false,
            yearwiseorbtwdates: 'yearwise',
            asmcL_Id: 0,
            oralwrittenschedule: 'oral',
            hrsrt: '12hrrt'
        }
    });

    const watchYearwise = watch('yearwiseorbtwdates');
    const watchTestType = watch('oralwrittenschedule');
    const watchAsmayId = watch('asmaY_Id');

    const { data: initialDetails } = useScheduleReportInitialDetails();

    const { data: scheduleList, isLoading: isScheduleLoading } = useScheduleList(
        {
            oralwrittenscheduleflag: watchTestType,
            yearorbtwndates: watchYearwise,
            asmay_id: watchAsmayId || 0
        },
        watchYearwise === 'yearwise' ? !!watchAsmayId : true
    );

    const schedulesList = useMemo(() => {
        if (!scheduleList) return [];
        if (Array.isArray(scheduleList)) return scheduleList;
        if (Array.isArray((scheduleList as any).$values)) return (scheduleList as any).$values;
        if (Array.isArray((scheduleList as any).writentestlist)) return (scheduleList as any).writentestlist;
        if (Array.isArray((scheduleList as any).writentestlist?.$values)) return (scheduleList as any).writentestlist.$values;
        if (Array.isArray((scheduleList as any).data)) return (scheduleList as any).data;
        return [];
    }, [scheduleList]);

    // Reset schedule selection when test type or year changes
    useEffect(() => {
        setValue('disid', undefined);
    }, [watchTestType, watchAsmayId, watchYearwise, setValue]);

    const onSubmit = async (data: FormFields) => {
        try {
            const payload = {
                asmayid: data.yearwiseorbtwdates === 'yearwise' ? data.asmaY_Id : 0,
                asmclid: data.asmcL_Id,
                fromdate:
                    data.yearwiseorbtwdates === 'btwdates' && data.from_date
                        ? new Date(data.from_date).toISOString()
                        : new Date().toISOString(),
                todate:
                    data.yearwiseorbtwdates === 'btwdates' && data.to_date
                        ? new Date(data.to_date).toISOString()
                        : new Date().toISOString(),
                flagows: data.oralwrittenschedule,
                schids: data.disid || '',
                stype: data.autostudent ? 2 : 1,
                hrsrt: data.hrsrt
            };

            if (onFilterChange) {
                const selectedSchedule = (schedulesList || []).find((s: any) => s.disid.toString() === data.disid);
                onFilterChange({
                    ...payload,
                    schedulename: selectedSchedule?.disname || ''
                });
            }
            toast.success('Filters applied successfully');
        } catch (error: any) {
            toast.error(error.message || 'Failed to apply filters');
        }
    };

    const handleReset = () => {
        reset();
        if (onFilterChange) {
            onFilterChange({}, true);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            {/* Top Row: Scheduled Report Checkbox */}
            <div className='mb-2 flex items-center space-x-2'>
                <Controller
                    name='autostudent'
                    control={control}
                    render={({ field }) => (
                        <Checkbox id='autostudent' checked={field.value} onCheckedChange={field.onChange} className='h-4 w-4' />
                    )}
                />
                <Label htmlFor='autostudent' className='cursor-pointer font-bold text-slate-700 text-sm uppercase'>
                    Scheduled Report
                </Label>
            </div>

            {/* Filter Section with Grey Background */}
            <div className='space-y-4 rounded-sm border border-slate-200 bg-white p-4'>
                {/* Row 1: Year Selection & Academic Year */}
                <div className='grid grid-cols-1 items-center gap-6 md:grid-cols-2'>
                    <div className='flex min-h-[42px] items-center justify-center gap-6 rounded-sm border border-slate-200 bg-white p-2'>
                        <Controller
                            name='yearwiseorbtwdates'
                            control={control}
                            render={({ field }) => (
                                <RadioGroup value={field.value} onValueChange={field.onChange} className='flex items-center gap-6'>
                                    <div className='flex items-center gap-2'>
                                        <RadioGroupItem value='yearwise' id='yearwise' />
                                        <Label htmlFor='yearwise' className='font-bold text-[11px] uppercase'>
                                            Year Wise <span className='text-red-500'>*</span>
                                        </Label>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        <RadioGroupItem value='btwdates' id='btwdates' />
                                        <Label htmlFor='btwdates' className='font-bold text-[11px] uppercase'>
                                            Between Dates <span className='text-red-500'>*</span>
                                        </Label>
                                    </div>
                                </RadioGroup>
                            )}
                        />
                    </div>

                    <div className='grid grid-cols-12 items-center gap-2 px-2'>
                        <Label className='col-span-4 text-right font-bold text-[11px] uppercase'>
                            Academic Year : <span className='text-red-500'>*</span>
                        </Label>
                        <div className='col-span-8'>
                            {watchYearwise === 'yearwise' ? (
                                <Controller
                                    name='asmaY_Id'
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                                            <SelectTrigger className='h-8 text-xs'>
                                                <SelectValue placeholder='Select' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {(initialDetails?.year || []).map((year: any) => (
                                                    <SelectItem key={year.asmaY_Id} value={year.asmaY_Id.toString()} className='text-xs'>
                                                        {year.asmaY_Year}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            ) : (
                                <div className='flex items-center gap-1'>
                                    <Controller
                                        name='from_date'
                                        control={control}
                                        render={({ field }) => (
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant='outline'
                                                        className='flex h-8 w-full justify-between px-2 font-normal text-[10px]'>
                                                        {field.value ? format(new Date(field.value), 'dd/MM/yyyy') : 'From Date'}
                                                        <CalendarIcon className='h-3 w-3 opacity-50' />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className='w-auto p-0' align='start'>
                                                    <CalendarYear
                                                        mode='single'
                                                        selected={field.value ? new Date(field.value) : undefined}
                                                        onSelect={(d) => field.onChange(d?.toISOString())}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        )}
                                    />
                                    <Controller
                                        name='to_date'
                                        control={control}
                                        render={({ field }) => (
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant='outline'
                                                        className='flex h-8 w-full justify-between px-2 font-normal text-[10px]'>
                                                        {field.value ? format(new Date(field.value), 'dd/MM/yyyy') : 'To Date'}
                                                        <CalendarIcon className='h-3 w-3 opacity-50' />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className='w-auto p-0' align='start'>
                                                    <CalendarYear
                                                        mode='single'
                                                        selected={field.value ? new Date(field.value) : undefined}
                                                        onSelect={(d) => field.onChange(d?.toISOString())}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        )}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Row 2: Class & Test Type */}
                <div className='grid grid-cols-1 items-center gap-6 md:grid-cols-2'>
                    <div className='grid grid-cols-12 items-center gap-2 px-2'>
                        <Label className='col-span-4 text-right font-bold text-[11px] uppercase'>
                            Class : <span className='text-red-500'>*</span>
                        </Label>
                        <div className='col-span-8'>
                            <Controller
                                name='asmcL_Id'
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                                        <SelectTrigger className='h-8 text-xs'>
                                            <SelectValue placeholder='Select' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='0' className='text-xs'>
                                                All
                                            </SelectItem>
                                            {(initialDetails?.classname || []).map((cls: any) => (
                                                <SelectItem key={cls.asmcL_Id} value={cls.asmcL_Id.toString()} className='text-xs'>
                                                    {cls.asmcL_ClassName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                    </div>

                    <div className='flex min-h-[42px] items-center justify-center gap-4 rounded-sm border border-slate-200 bg-white p-2'>
                        <Controller
                            name='oralwrittenschedule'
                            control={control}
                            render={({ field }) => (
                                <RadioGroup value={field.value} onValueChange={field.onChange} className='flex items-center gap-4'>
                                    <div className='flex items-center gap-1'>
                                        <RadioGroupItem value='oral' id='oral' className='h-3 w-3' />
                                        <Label htmlFor='oral' className='whitespace-nowrap font-bold text-[10px] uppercase'>
                                            Oral Test <span className='text-red-500'>*</span>
                                        </Label>
                                    </div>
                                    <div className='flex items-center gap-1'>
                                        <RadioGroupItem value='written' id='written' className='h-3 w-3' />
                                        <Label htmlFor='written' className='whitespace-nowrap font-bold text-[10px] uppercase'>
                                            Written Test <span className='text-red-500'>*</span>
                                        </Label>
                                    </div>
                                    <div className='flex items-center gap-1'>
                                        <RadioGroupItem value='statusschedule' id='statusschedule' className='h-3 w-3' />
                                        <Label htmlFor='statusschedule' className='whitespace-nowrap font-bold text-[10px] uppercase'>
                                            IntimationSchedule <span className='text-red-500'>*</span>
                                        </Label>
                                    </div>
                                </RadioGroup>
                            )}
                        />
                    </div>
                </div>

                {/* Row 3: Time Format & Schedule Name */}
                <div className='grid grid-cols-1 items-center gap-6 md:grid-cols-2'>
                    <div className='flex min-h-[42px] items-center justify-center gap-6 rounded-sm border border-slate-200 bg-white p-2'>
                        <Controller
                            name='hrsrt'
                            control={control}
                            render={({ field }) => (
                                <RadioGroup value={field.value} onValueChange={field.onChange} className='flex items-center gap-6'>
                                    <div className='flex items-center gap-2'>
                                        <RadioGroupItem value='12hrrt' id='12hr' className='h-3 w-3' />
                                        <Label htmlFor='12hr' className='font-bold text-[10px] uppercase'>
                                            12 Hours Format
                                        </Label>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        <RadioGroupItem value='24hrrt' id='24hr' className='h-3 w-3' />
                                        <Label htmlFor='24hr' className='font-bold text-[10px] uppercase'>
                                            24 Hours Format
                                        </Label>
                                    </div>
                                </RadioGroup>
                            )}
                        />
                    </div>

                    <div className='grid grid-cols-12 items-center gap-2 px-2'>
                        <Label className='col-span-4 text-right font-bold text-[11px] uppercase'>
                            Schedule Name : <span className='text-red-500'>*</span>
                        </Label>
                        <div className='col-span-8'>
                            <Controller
                                name='disid'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value || ''}
                                        disabled={watchYearwise === 'yearwise' && !watchAsmayId}>
                                        <SelectTrigger className='h-8 text-xs'>
                                            <SelectValue placeholder='Select' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {schedulesList.map((s: any) => (
                                                <SelectItem key={s.disid} value={s.disid.toString()} className='text-xs'>
                                                    {s.disname}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className='flex justify-center gap-2 pt-4'>
                <Button
                    type='submit'
                    className='h-9 rounded-sm bg-[#3f51b5] px-8 font-bold text-white text-xs uppercase shadow-md transition-all hover:bg-[#303f9f] active:scale-95'
                    disabled={isSubmitting}>
                    REPORT
                </Button>
                <Button
                    type='button'
                    onClick={handleReset}
                    className='h-9 rounded-sm bg-[#ff5722] px-8 font-bold text-white text-xs uppercase shadow-md transition-all hover:bg-[#e64a19] active:scale-95'>
                    CANCEL
                </Button>
            </div>
        </form>
    );
}
