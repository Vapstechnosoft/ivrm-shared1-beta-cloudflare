'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { InputText } from '@/components/ui/extension/input-text';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TimePicker } from '@/components/ui/time-picker/time-picker';
import {
    useAcademicYearDropDownMasterDayClasswise,
    useBreakTimeSettingDetails,
    useCategtoryDropDownMasterDayClasswise,
    useDayDropDownMasterDayClasswise
} from '@/hooks/timetable/useMasters';

import { breakTimeSettingsSchema } from '@/schemas/timetable/masters';
import { getBreakTimeSettingsEdit, getMaximumPeriodsCount, saveBreakTimeSettings } from '@/server/timetable/masters/breaktimesettings';
import { ClassDropDownDataOnchnGeYrAndCategory } from '@/server/timetable/masters/masterdayclasswise';
import type { IBreakTimeSettingsList } from '@/types/timetable/masters/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof breakTimeSettingsSchema.addOrUpdate>;

interface UpdateBreakTimeSettingsFormProps {
    onSuccess?: () => void;
    selectedRow: IBreakTimeSettingsList;
}

export default function UpdateBreakTimeSettingsForm({ onSuccess, selectedRow }: UpdateBreakTimeSettingsFormProps) {
    const { data: response, refetchAll } = useBreakTimeSettingDetails();
    const [classList, setClassList] = useState<any[]>([]);
    const [periodsBefore, setPeriodsBefore] = useState<any[]>([]);
    const [periodsAfter, setPeriodsAfter] = useState<any[]>([]);
    const [maxPeriods, setMaxPeriods] = useState<number>(0);
    const [isLoadingData, setIsLoadingData] = useState(true);

    const {
        register,
        handleSubmit,
        reset,
        control,
        watch,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(breakTimeSettingsSchema.addOrUpdate),
        mode: 'onChange',
        defaultValues: {}
    });

    const { data: academicListRes, isLoading: academicLoading } = useAcademicYearDropDownMasterDayClasswise();
    const { data: Masterdaydata, isLoading: masterdaydataloading } = useDayDropDownMasterDayClasswise();

    const academicList = (academicListRes as any)?.data || [];
    const categoryList = (response as any)?.catelist || []; // Try from response first
    const dayList: any[] = (Masterdaydata as any)?.data || [];

    const academicyear = watch('asmay_id');
    const { data: categoryListRes, isLoading: categoryLoading } = useCategtoryDropDownMasterDayClasswise({ enabled: !!academicyear });

    const finalCategoryList = (categoryListRes as any)?.data || categoryList;

    // Fetch Details on Mount
    useEffect(() => {
        const fetchData = async () => {
            if (selectedRow?.ttmB_Id) {
                try {
                    const res = await getBreakTimeSettingsEdit(selectedRow.ttmB_Id);
                    console.log('getBreakTimeSettingsEdit res', res);

                    // Robust extraction logic
                    let breakData: any[] = [];
                    if (res) {
                        if (Array.isArray(res)) {
                            breakData = res;
                        } else if (res.data && Array.isArray(res.data)) {
                            breakData = res.data;
                        } else if (res.breaklist && Array.isArray(res.breaklist)) {
                            breakData = res.breaklist;
                        } else if (res.breakList && Array.isArray(res.breakList)) {
                            breakData = res.breakList;
                        } else if (res.editlist && Array.isArray(res.editlist)) {
                            breakData = res.editlist;
                        } else if (res.editList && Array.isArray(res.editList)) {
                            breakData = res.editList;
                        } else if (res.editdetails && Array.isArray(res.editdetails)) {
                            breakData = res.editdetails;
                        } else if (res.editDetails && Array.isArray(res.editDetails)) {
                            breakData = res.editDetails;
                        } else if (res.data?.breaklist && Array.isArray(res.data.breaklist)) {
                            breakData = res.data.breaklist;
                        } else if (res.data?.editdetails && Array.isArray(res.data.editdetails)) {
                            breakData = res.data.editdetails;
                        }
                    }

                    if (breakData.length > 0) {
                        const data = breakData[0];

                        // Prefill basic fields (handling case sensitivity)
                        setValue('asmay_id', data.asmaY_Id ?? data.ASMAY_Id ?? data.asmay_id);
                        setValue('ttmC_Id', data.ttmC_Id ?? data.TTMC_Id ?? data.ttmc_id);
                        setValue('ttmB_BreakName', data.ttmB_BreakName ?? data.TTMB_BreakName ?? data.ttmb_breakname);
                        setValue('ttmB_AfterPeriod', data.ttmB_AfterPeriod ?? data.TTMB_AfterPeriod ?? data.ttmb_afterperiod);

                        const parseTime = (timeStr: string) => {
                            if (!timeStr) return new Date();
                            const d = new Date();
                            const [time, modifier] = timeStr.split(' ');
                            let [hours, minutes] = time.split(':');
                            if (hours === '12') hours = '00';
                            if (modifier === 'PM') hours = (Number.parseInt(hours, 10) + 12).toString();
                            d.setHours(Number.parseInt(hours, 10), Number.parseInt(minutes, 10));
                            return d;
                        };

                        const startTimeStr = data.ttmB_BreakStartTime ?? data.TTMB_BreakStartTime ?? data.ttmb_breakstarttime;
                        let startTime = new Date(startTimeStr);
                        if (Number.isNaN(startTime.getTime())) startTime = parseTime(startTimeStr);

                        const endTimeStr = data.ttmB_BreakEndTime ?? data.TTMB_BreakEndTime ?? data.ttmb_breakendtime;
                        let endTime = new Date(endTimeStr);
                        if (Number.isNaN(endTime.getTime())) endTime = parseTime(endTimeStr);

                        setValue('ttmB_BreakStartTime', startTime);
                        setValue('ttmB_BreakEndTime', endTime);

                        // Trigger class fetch
                        const asmay_id = data.asmaY_Id ?? data.ASMAY_Id ?? data.asmay_id;
                        const ttmC_Id = data.ttmC_Id ?? data.TTMC_Id ?? data.ttmc_id;

                        const classRes = await ClassDropDownDataOnchnGeYrAndCategory(asmay_id, ttmC_Id);

                        if (classRes?.data && Array.isArray(classRes.data)) {
                            const classListRaw = classRes.data;
                            setClassList(classListRaw as any[]);

                            const selectedcalssids = breakData.map((r: any) => r.asmcL_Id || r.ASMCL_Id || r.asmcl_id);
                            const uniquecalssids = Array.from(new Set(selectedcalssids));

                            const selectedObjs = (classListRaw as any[])
                                .filter((c: any) => uniquecalssids.includes(c.asmcL_Id || c.ASMCL_Id || c.asmcl_id))
                                .map((c: any) => ({
                                    asmcL_Id: c.asmcL_Id || c.ASMCL_Id || c.asmcl_id,
                                    asmcL_ClassName: c.asmcL_ClassName || c.ASMCL_ClassName || c.asmcl_classname
                                }));

                            setValue('calssids', selectedObjs as [any, ...any[]]);
                        }

                        // Set Selected Days
                        const selecteddayids = breakData.map((r: any) => r.ttmD_Id || r.TTMD_Id || r.ttmd_id);
                        const uniquedayids = Array.from(new Set(selecteddayids));
                        const selectedDayObjs = dayList
                            .filter((d: any) => uniquedayids.includes(d.ttmD_Id || d.TTMD_Id || d.ttmd_id))
                            .map((d: any) => ({
                                ttmD_Id: d.ttmD_Id || d.TTMD_Id || d.ttmd_id,
                                ttmD_DayName: d.ttmD_DayName || d.TTMD_DayName || d.ttmd_dayname
                            }));
                        setValue('dayids', selectedDayObjs as [any, ...any[]]);

                        setIsLoadingData(false);
                    } else {
                        console.warn('No break data found for edit', res);
                        setIsLoadingData(false);
                    }
                } catch (err) {
                    console.error('Error fetching details', err);
                    setIsLoadingData(false);
                }
            }
        };
        fetchData();
    }, [selectedRow, dayList, setValue]);

    const watchedCategory = watch('ttmC_Id');
    const watchedAcademicYear = watch('asmay_id');
    const watchedClasses = watch('calssids') as any[];
    const watchedAfterPeriod = watch('ttmB_AfterPeriod');

    // Logic for Max Periods
    useEffect(() => {
        const fetchMaxPeriods = async () => {
            if (watchedClasses && watchedClasses.length > 0) {
                try {
                    const classId = watchedClasses[watchedClasses.length - 1].asmcL_Id.toString();
                    const count = watchedClasses.length;
                    const res = await getMaximumPeriodsCount(Number(classId), count);
                    if (res?.success) {
                        setMaxPeriods(res.data as number);
                    } else {
                        setMaxPeriods(0);
                    }
                } catch (err) {
                    console.error('Error fetching max periods', err);
                    setMaxPeriods(0);
                }
            } else {
                setMaxPeriods(0);
            }
        };
        fetchMaxPeriods();
    }, [watchedClasses]);

    useEffect(() => {
        if (watchedAfterPeriod !== undefined && maxPeriods > 0) {
            const ap = Number(watchedAfterPeriod);

            if (ap > maxPeriods) {
                toast.error(`After Period cannot exceed Max Periods (${maxPeriods})`);
                setValue('ttmB_AfterPeriod', 0);
                setPeriodsBefore([]);
                setPeriodsAfter([]);
                return;
            }

            const before = [];
            for (let i = 1; i <= ap; i++) {
                before.push({ key: i, label: `Period ${i}` });
            }
            setPeriodsBefore(before);

            if (before.length > 0) {
                const allBeforeKeys = before.map((p) => p.key);
                setValue('arraybeforeperiodsList', allBeforeKeys);
            }

            const after = [];
            for (let i = ap + 1; i <= maxPeriods; i++) {
                after.push({ key: i, label: `Period ${i}` });
            }
            setPeriodsAfter(after);

            if (after.length > 0) {
                const allAfterKeys = after.map((p) => p.key);
                setValue('arrayafterperiodsList', allAfterKeys);
            }
        }
    }, [watchedAfterPeriod, maxPeriods, setValue]);

    const onSubmit: SubmitHandler<FormFields | any> = async (data: FormFields) => {
        try {
            // Validate End Time
            const startMin = data.ttmB_BreakStartTime.getHours() * 60 + data.ttmB_BreakStartTime.getMinutes();
            const endMin = data.ttmB_BreakEndTime.getHours() * 60 + data.ttmB_BreakEndTime.getMinutes();
            if (endMin <= startMin) {
                toast.error('End Time must be greater than Start Time');
                return;
            }

            const formatTime = (date: Date) => format(date, 'h:mm a');

            const payload = {
                TTMB_Id: selectedRow.ttmB_Id,
                ASMAY_Id: data.asmay_id,
                TTMC_Id: data.ttmC_Id,
                ArrayClassList: data.calssids.map((c: any) => ({ asmcL_Id: Number(c.asmcL_Id) })),
                ArrayDayList: data.dayids.map((d: any) => ({ ttmD_Id: Number(d.ttmD_Id) })),
                TTMB_BreakName: data.ttmB_BreakName,
                TTMB_BreakStartTime: formatTime(data.ttmB_BreakStartTime),
                TTMB_BreakEndTime: formatTime(data.ttmB_BreakEndTime),
                TTMB_AfterPeriod: data.ttmB_AfterPeriod,
                ArraybeforeperiodsList: periodsBefore.map((p) => ({ TTPeriodnameB: p.key })),
                ArrayafterperiodsList: periodsAfter.map((p) => ({ TTPeriodnameA: p.key })),
                TTMB_ActiveFlag: true
            };

            const response = await saveBreakTimeSettings(payload as any);
            if (response.success) {
                toast.success(response.message);
                refetchAll();
                onSuccess?.();
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    if (isLoadingData) return <div>Loading...</div>;

    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <div className='space-y-4'>
                        <div className='space-y-2'>
                            <Label>
                                Academic Year <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                control={control}
                                name='asmay_id'
                                render={({ field }) => (
                                    <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='--Select--' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {academicLoading ? (
                                                <SelectItem value='loading' disabled>
                                                    Loading...
                                                </SelectItem>
                                            ) : (
                                                academicList.map((item: any) => (
                                                    <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                        {item.asmaY_Year}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

                        <div className='space-y-2'>
                            <Label>
                                Class <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                control={control}
                                name='calssids'
                                render={({ field }) => (
                                    <MultiSelect
                                        options={classList.map((c: any) => ({ label: c.asmcL_ClassName, value: c.asmcL_Id.toString() }))}
                                        defaultValue={field.value?.map((v: any) => v.asmcL_Id.toString()) || []}
                                        onValueChange={(vals) => {
                                            const selectedObjs = vals
                                                .map((id) => {
                                                    const found = classList.find((c) => c.asmcL_Id.toString() === id);
                                                    return found
                                                        ? { asmcL_Id: found.asmcL_Id, asmcL_ClassName: found.asmcL_ClassName }
                                                        : null;
                                                })
                                                .filter((x) => x) as any[];
                                            field.onChange(selectedObjs as [any, ...any[]]);
                                        }}
                                        placeholder='Select Classes'
                                    />
                                )}
                            />
                        </div>

                        <div className='space-y-2'>
                            <InputText
                                label='Break Name'
                                placeholder='Enter Break Name'
                                required
                                {...register('ttmB_BreakName')}
                                error={errors.ttmB_BreakName?.message}
                            />
                        </div>

                        <div className='space-y-2'>
                            <Label>
                                Start Time <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                control={control}
                                name='ttmB_BreakStartTime'
                                render={({ field }) => <TimePicker date={field.value} setDate={field.onChange} />}
                            />
                        </div>

                        <div className='space-y-2'>
                            <Label>Before Period</Label>
                            <div className='flex flex-wrap gap-2 rounded-md border bg-muted/20 p-2'>
                                {periodsBefore.map((p) => (
                                    <div key={p.key} className='flex items-center space-x-2'>
                                        <Checkbox checked disabled />
                                        <Label className='font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                                            {p.label}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className='space-y-4'>
                        <div className='space-y-2'>
                            <Label>
                                Category <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                control={control}
                                name='ttmC_Id'
                                render={({ field }) => (
                                    <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='--Select--' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categoryLoading ? (
                                                <SelectItem value='loading' disabled>
                                                    Loading...
                                                </SelectItem>
                                            ) : (
                                                finalCategoryList.map((item: any) => (
                                                    <SelectItem key={item.ttmC_Id} value={item.ttmC_Id.toString()}>
                                                        {item.ttmC_CategoryName}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

                        <div className='space-y-2'>
                            <Label>
                                Day <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                control={control}
                                name='dayids'
                                render={({ field }) => (
                                    <MultiSelect
                                        options={dayList.map((d: any) => ({
                                            label: d.ttmD_DayName || (d as any).TTMD_DayName,
                                            value: (d.ttmD_Id || (d as any).TTMD_Id).toString()
                                        }))}
                                        defaultValue={field.value?.map((v: any) => (v.ttmD_Id || (v as any).TTMD_Id).toString()) || []}
                                        onValueChange={(vals) => {
                                            const selectedObjs = vals
                                                .map((id) => {
                                                    const found = dayList.find(
                                                        (d: any) => (d.ttmD_Id || (d as any).TTMD_Id).toString() === id
                                                    );
                                                    return found
                                                        ? {
                                                              ttmD_Id: found.ttmD_Id || (found as any).TTMD_Id,
                                                              ttmD_DayName: found.ttmD_DayName || (found as any).TTMD_DayName
                                                          }
                                                        : null;
                                                })
                                                .filter((x) => x);
                                            field.onChange(selectedObjs as [any, ...any[]]);
                                        }}
                                        placeholder='Select Days'
                                    />
                                )}
                            />
                        </div>

                        <div className='space-y-2'>
                            <InputText
                                label='After Period'
                                placeholder='Enter After Period'
                                required
                                {...register('ttmB_AfterPeriod')}
                                error={errors.ttmB_AfterPeriod?.message}
                                type='number'
                            />
                        </div>

                        <div className='space-y-2'>
                            <Label>
                                End Time <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                control={control}
                                name='ttmB_BreakEndTime'
                                render={({ field }) => <TimePicker date={field.value} setDate={field.onChange} />}
                            />
                        </div>

                        <div className='space-y-2'>
                            <Label>After Period (Remaining)</Label>
                            <div className='flex flex-wrap gap-2 rounded-md border bg-muted/20 p-2'>
                                {periodsAfter.map((p) => (
                                    <div key={p.key} className='flex items-center space-x-2'>
                                        <Checkbox checked disabled />
                                        <Label className='font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                                            {p.label}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className='flex justify-end gap-3'>
                    <Button type='button' variant='outline' onClick={onSuccess} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button type='submit' disabled={isSubmitting} isLoading={isSubmitting} loadingText='Updating...'>
                        <Save className='mr-2 h-4 w-4' />
                        Update
                    </Button>
                </div>
            </form>
        </div>
    );
}
