'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Loader2, Mail, MessageSquare, RotateCcw, Search, Send } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useAbsentStaffList, useDeputationDetails, useTimeTableAcademicYear } from '@/hooks/timetable/useTransactions';
import { DeputationSchema } from '@/schemas/timetable/transactions';
import type { IAcademicYearItem, IDayItem, IStaffItem } from '@/types/timetable/Transaction/deputation';

import { Button } from '@/components/ui/button';
import { CalendarYear } from '@/components/ui/calendar_year';
import { Checkbox } from '@/components/ui/checkbox';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export interface IDeputationFormSelection {
    date: Date;
    dateStr: string;
    dayId: number;
    dayName: string;
    asmaY_Id: number;
    absentStaffId: number;
    absflag: boolean;
    remarks: string;
    smsflag: boolean;
    mailflag: boolean;
    noT_Flag: boolean;
    masters: any;
}

interface DeputationFormProps {
    onFetch: (selection: IDeputationFormSelection | null) => void;
    onResetParent?: () => void;
}

export default function DeputationForm({ onFetch, onResetParent }: DeputationFormProps) {
    const { data: initialDetails, isLoading: detailsLoading } = useDeputationDetails();
    const { data: academicYearsData } = useTimeTableAcademicYear();
    const [staffSearchQuery, setStaffSearchQuery] = useState('');
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [resetKey, setResetKey] = useState(0);

    const initialData = initialDetails?.data !== undefined ? initialDetails.data : initialDetails;

    const ayList: IAcademicYearItem[] = useMemo(() => {
        const rawYears = academicYearsData?.data !== undefined ? academicYearsData.data : academicYearsData;
        if (Array.isArray(rawYears) && rawYears.length > 0) {
            return rawYears;
        }
        return initialData?.acayear || initialData?.academiclist || [];
    }, [academicYearsData, initialData]);

    const dayList: IDayItem[] = useMemo(() => {
        return (
            initialData?.daylist ||
            initialData?.day_list ||
            initialData?.daydropdown ||
            initialData?.daydrp ||
            initialData?.dayslst_fix ||
            initialData?.dayslst ||
            initialData?.gridweeks ||
            []
        );
    }, [initialData]);

    const masterStaffList: IStaffItem[] = useMemo(() => {
        return initialData?.stafflist || initialData?.staff_list || [];
    }, [initialData]);

    const {
        control,
        reset,
        setValue,
        watch,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(DeputationSchema),
        mode: 'onChange',
        defaultValues: {
            asmaY_Id: '',
            ttmD_Date: undefined as any,
            ttmD_Day: '',
            ttmD_Id: 0,
            absent_Staff_Flag: false,
            sms_Flag: false,
            email_Flag: false,
            notification_Flag: false,
            ttmD_Remarks: '',
            hrmE_Id: ''
        }
    });

    const watchAsmaYId = watch('asmaY_Id');
    const watchDate = watch('ttmD_Date');
    const watchAbsent = watch('absent_Staff_Flag');
    const watchHrmEId = watch('hrmE_Id');
    const watchDayId = watch('ttmD_Id');
    const watchDayName = watch('ttmD_Day');
    const watchRemarks = watch('ttmD_Remarks');
    const watchSms = watch('sms_Flag');
    const watchEmail = watch('email_Flag');
    const watchNot = watch('notification_Flag');

    // Match selected date to working day in daylist (get(myDate) in AngularJS)
    useEffect(() => {
        if (!watchDate) {
            setValue('ttmD_Day', '');
            setValue('ttmD_Id', 0);
            return;
        }

        try {
            const dateObj = new Date(watchDate);
            if (isNaN(dateObj.getTime())) {
                setValue('ttmD_Day', '');
                setValue('ttmD_Id', 0);
                return;
            }

            const shortDay = format(dateObj, 'EEE').toUpperCase(); // e.g. "MON", "TUE"
            const fullDay = format(dateObj, 'EEEE').toUpperCase(); // e.g. "MONDAY"

            if (dayList && dayList.length > 0) {
                const matchedDay = dayList.find((d) => {
                    const dayName = (d.ttmD_DayName || d.dayName || d.day_name || '').toUpperCase();
                    const dayCode = (d.ttmD_DayCode || d.dayCode || d.day_code || '').toUpperCase();
                    return dayName.startsWith(shortDay) || dayName === fullDay || dayCode.startsWith(shortDay);
                });

                if (matchedDay) {
                    setValue('ttmD_Id', Number(matchedDay.ttmD_Id || 0));
                    setValue('ttmD_Day', matchedDay.ttmD_DayName || fullDay);
                } else {
                    setValue('ttmD_Id', 0);
                    setValue('ttmD_Day', fullDay);
                }
            } else {
                // Master day list still loading or empty, automatically display day from date
                setValue('ttmD_Day', fullDay);
            }
        } catch (error) {
            console.error('Error calculating day from date:', error);
        }
    }, [watchDate, dayList, setValue]);

    // Query absent staff list when absent flag is toggled (changesbs in AngularJS)
    const dateFormattedString = watchDate ? new Date(watchDate).toDateString() : '';
    const { data: rawAbsentStaffRes, isFetching: absentStaffLoading } = useAbsentStaffList(
        {
            ASMAY_Id: Number(watchAsmaYId || 0),
            TTMD_Id: Number(watchDayId || 0),
            HRME_Id: Number(watchHrmEId || 0),
            TTSD_Date: dateFormattedString,
            absflag: watchAbsent
        },
        watchAbsent && !!watchAsmaYId && !!watchDate
    );

    const absentStaffPayload = rawAbsentStaffRes?.data !== undefined ? rawAbsentStaffRes.data : rawAbsentStaffRes;
    const absentStaffList: any[] = useMemo(() => {
        if (!watchAbsent) {
            return masterStaffList;
        }
        return Array.isArray(absentStaffPayload?.absentstafflist) && absentStaffPayload.absentstafflist.length > 0
            ? absentStaffPayload.absentstafflist
            : Array.isArray(absentStaffPayload?.stafflist) && absentStaffPayload.stafflist.length > 0
            ? absentStaffPayload.stafflist
            : Array.isArray(absentStaffPayload?.staff_list) && absentStaffPayload.staff_list.length > 0
            ? absentStaffPayload.staff_list
            : [];
    }, [watchAbsent, absentStaffPayload, masterStaffList]);

    // Filter staff list by search query
    const filteredStaffList = useMemo(() => {
        if (!staffSearchQuery.trim()) return absentStaffList;
        const q = staffSearchQuery.toLowerCase();
        return absentStaffList.filter((s: any) => {
            const fullName = [s.hrmE_EmployeeFirstName, s.hrmE_EmployeeMiddleName, s.hrmE_EmployeeLastName]
                .filter(Boolean)
                .join(' ');
            const name = (s.employeeName || s.staffName || fullName || '').toLowerCase();
            const code = (s.employeeCode || s.hrmE_EmployeeCode || '').toLowerCase();
            return name.includes(q) || code.includes(q);
        });
    }, [absentStaffList, staffSearchQuery]);

    // Handle Absent Staff checkbox toggle
    const handleAbsentToggle = (checked: boolean) => {
        if (checked && (!watchAsmaYId || !watchDate)) {
            toast.error('Please Select Academic Year And Date');
            setValue('absent_Staff_Flag', false);
            return;
        }
        setValue('absent_Staff_Flag', checked);
        setValue('hrmE_Id', '');
        onFetch(null);
    };

    // When staff selection changes, trigger onFetch
    useEffect(() => {
        if (watchAsmaYId && watchDate && watchHrmEId && watchDayId > 0) {
            onFetch({
                date: watchDate,
                dateStr: new Date(watchDate).toDateString(),
                dayId: watchDayId,
                dayName: watchDayName || '',
                asmaY_Id: Number(watchAsmaYId),
                absentStaffId: Number(watchHrmEId),
                absflag: watchAbsent,
                remarks: watchRemarks || '',
                smsflag: watchSms,
                mailflag: watchEmail,
                noT_Flag: watchNot,
                masters: initialData
            });
        } else {
            onFetch(null);
        }
    }, [
        watchAsmaYId,
        watchDate,
        watchHrmEId,
        watchDayId,
        watchDayName,
        watchRemarks,
        watchSms,
        watchEmail,
        watchNot,
        watchAbsent,
        initialData
    ]);

    const handleReset = () => {
        setResetKey((prev) => prev + 1);

        reset({
            asmaY_Id: '',
            ttmD_Date: undefined as any,
            ttmD_Day: '',
            ttmD_Id: 0,
            absent_Staff_Flag: false,
            sms_Flag: false,
            email_Flag: false,
            notification_Flag: false,
            ttmD_Remarks: '',
            hrmE_Id: ''
        });

        setValue('asmaY_Id', '');
        setValue('ttmD_Date', undefined as any);
        setValue('ttmD_Day', '');
        setValue('ttmD_Id', 0);
        setValue('absent_Staff_Flag', false);
        setValue('sms_Flag', false);
        setValue('email_Flag', false);
        setValue('notification_Flag', false);
        setValue('ttmD_Remarks', '');
        setValue('hrmE_Id', '');

        setStaffSearchQuery('');
        onFetch(null);
        if (onResetParent) onResetParent();
    };

    return (
        <CollapsibleSection title='Deputation Management' defaultOpen>
            <div className='rounded-2xl border border-purple-100 bg-white p-6 shadow-lg shadow-purple-500/5 transition-all'>
                <form onSubmit={(e) => e.preventDefault()} className='space-y-6'>
                    {/* TOP SECTION: Academic Year & Date & Day */}
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                        {/* Academic Year */}
                        <div className='space-y-1.5'>
                            <Label className='flex items-center gap-1.5 font-bold text-purple-900 text-xs uppercase tracking-wider'>
                                Academic Year <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                name='asmaY_Id'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        key={`${resetKey}-ay-${field.value || 'empty'}`}
                                        onValueChange={(val) => {
                                            field.onChange(val || '');
                                            setValue('hrmE_Id', '');
                                        }}
                                        value={field.value ? field.value.toString() : undefined}>
                                        <SelectTrigger className='h-10 border-purple-200 bg-purple-50/20 font-medium focus:border-purple-600 focus:ring-purple-200'>
                                            <SelectValue placeholder={detailsLoading ? 'Loading Years...' : '-- Select Academic Year --'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ayList?.map((ay) => (
                                                <SelectItem key={ay.asmaY_Id} value={ay.asmaY_Id.toString()}>
                                                    {ay.asmaY_Year}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.asmaY_Id && <p className='font-medium text-[11px] text-red-500'>{errors.asmaY_Id.message}</p>}
                        </div>

                        {/* Date Picker */}
                        <div className='space-y-1.5'>
                            <Label className='flex items-center gap-1.5 font-bold text-purple-900 text-xs uppercase tracking-wider'>
                                Date <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                name='ttmD_Date'
                                control={control}
                                render={({ field }) => (
                                    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                type='button'
                                                variant='outline'
                                                className='h-10 w-full justify-start border-purple-200 bg-purple-50/20 text-left font-medium focus:border-purple-600 focus:ring-purple-200'>
                                                <CalendarIcon className='mr-2 h-4 w-4 text-purple-600' />
                                                {field.value ? (
                                                    format(new Date(field.value), 'dd/MM/yyyy')
                                                ) : (
                                                    <span className='font-normal text-muted-foreground'>Select Date</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className='w-auto p-0' align='start'>
                                            <CalendarYear
                                                mode='single'
                                                selected={field.value ? new Date(field.value) : undefined}
                                                onSelect={(d) => {
                                                    if (d) {
                                                        field.onChange(d);
                                                        setValue('hrmE_Id', '');
                                                        try {
                                                            const shortDay = format(d, 'EEE').toUpperCase();
                                                            const fullDay = format(d, 'EEEE').toUpperCase();
                                                            const matched = dayList.find((item) => {
                                                                const dName = (item.ttmD_DayName || item.dayName || item.day_name || '').toUpperCase();
                                                                const dCode = (item.ttmD_DayCode || item.dayCode || item.day_code || '').toUpperCase();
                                                                return dName.startsWith(shortDay) || dName === fullDay || dCode.startsWith(shortDay);
                                                            });
                                                            if (matched) {
                                                                setValue('ttmD_Id', Number(matched.ttmD_Id || 0));
                                                                setValue('ttmD_Day', matched.ttmD_DayName || fullDay);
                                                            } else {
                                                                setValue('ttmD_Id', 0);
                                                                setValue('ttmD_Day', fullDay);
                                                            }
                                                        } catch {
                                                            // ignore
                                                        }
                                                        setIsCalendarOpen(false);
                                                    }
                                                }}
                                                fromYear={2000}
                                                toYear={2050}
                                                captionLayout='dropdown'
                                            />
                                        </PopoverContent>
                                    </Popover>
                                )}
                            />
                            {errors.ttmD_Date?.message && (
                                <p className='font-medium text-[11px] text-red-500'>
                                    {String(errors.ttmD_Date.message)}
                                </p>
                            )}
                        </div>

                        {/* Day (Readonly / Auto-detected) */}
                        <div className='space-y-1.5'>
                            <Label className='flex items-center gap-1.5 font-bold text-purple-900 text-xs uppercase tracking-wider'>
                                Day
                            </Label>
                            <Controller
                                name='ttmD_Day'
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        value={field.value || ''}
                                        placeholder='-- Auto selected from date --'
                                        readOnly
                                        className='h-10 cursor-not-allowed border-purple-200 bg-purple-100/50 font-bold text-purple-950 uppercase placeholder:normal-case placeholder:font-normal placeholder:text-muted-foreground'
                                    />
                                )}
                            />
                        </div>
                    </div>

                    {/* ABSENT STAFF TOGGLE & STAFF SELECTION */}
                    <div className='rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50/50 via-purple-50/30 to-indigo-50/50 p-5 shadow-xs'>
                        <div className='grid grid-cols-1 items-center gap-6 md:grid-cols-2'>
                            {/* Absent Staff Checkbox */}
                            <div className='flex items-center space-x-3 rounded-lg border border-indigo-200/60 bg-white px-4 py-3 shadow-xs'>
                                <Controller
                                    name='absent_Staff_Flag'
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox
                                            id='absent_staff_checkbox'
                                            checked={!!field.value}
                                            onCheckedChange={handleAbsentToggle}
                                            className='data-[state=checked]:border-indigo-700 data-[state=checked]:bg-indigo-700'
                                        />
                                    )}
                                />
                                <Label
                                    htmlFor='absent_staff_checkbox'
                                    className='cursor-pointer font-bold text-indigo-900 text-xs uppercase'>
                                    ABSENT STAFF ON :{' '}
                                    <span className='text-purple-700'>
                                        {watchDate ? format(new Date(watchDate), 'dd/MM/yyyy') : '--'}
                                    </span>
                                </Label>
                            </div>

                            {/* Staff Dropdown */}
                            <div className='space-y-1.5'>
                                <div className='flex items-center justify-between'>
                                    <Label className='flex items-center gap-1.5 font-bold text-purple-900 text-xs uppercase tracking-wider'>
                                        {watchAbsent ? 'Absent Staff Name' : 'Staff Name'} <span className='text-red-500'>*</span>
                                    </Label>
                                    <span className='font-semibold text-[11px] text-indigo-700'>
                                        {absentStaffLoading
                                            ? 'Fetching staff...'
                                            : `${absentStaffList.length} ${watchAbsent ? 'absent staff' : 'staff'} available`}
                                    </span>
                                </div>

                                <Controller
                                    name='hrmE_Id'
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            key={`${resetKey}-staff-${field.value || 'empty'}`}
                                            onValueChange={(val) => field.onChange(val || '')}
                                            value={field.value ? field.value.toString() : undefined}>
                                            <SelectTrigger
                                                className={`h-10 border-purple-200 bg-white font-medium ${
                                                    errors.hrmE_Id
                                                        ? 'border-red-500 ring-red-100'
                                                        : 'focus:border-purple-600 focus:ring-purple-200'
                                                }`}>
                                                <SelectValue
                                                    placeholder={
                                                        absentStaffLoading
                                                            ? 'Fetching Absent Staff...'
                                                            : watchAbsent
                                                            ? '-- Select Absent Staff --'
                                                            : '-- Select or Search Staff --'
                                                    }
                                                />
                                            </SelectTrigger>
                                            <SelectContent className='max-h-72'>
                                                <div className='sticky top-0 z-10 border-gray-100 border-b bg-white p-2'>
                                                    <div className='relative'>
                                                        <Search className='absolute top-2.5 left-2.5 h-3.5 w-3.5 text-gray-400' />
                                                        <Input
                                                            placeholder='Search staff by name or code...'
                                                            value={staffSearchQuery}
                                                            onChange={(e) => setStaffSearchQuery(e.target.value)}
                                                            className='h-8 pl-8 text-xs'
                                                            onClick={(e) => e.stopPropagation()}
                                                            onKeyDown={(e) => e.stopPropagation()}
                                                        />
                                                    </div>
                                                </div>
                                                {filteredStaffList.length === 0 ? (
                                                    <div className='p-4 text-center text-muted-foreground text-xs'>
                                                        {absentStaffLoading
                                                            ? 'Loading staff list...'
                                                            : watchAbsent
                                                            ? 'No absent staff records found for this date.'
                                                            : 'No staff records found.'}
                                                    </div>
                                                ) : (
                                                    filteredStaffList.map((staff: any, idx: number) => {
                                                        const staffId =
                                                            staff.employeeID ??
                                                            staff.employeeId ??
                                                            staff.hrmE_Id ??
                                                            staff.hrE_Id ??
                                                            staff.HRME_Id ??
                                                            idx;
                                                        const fullName = [
                                                            staff.hrmE_EmployeeFirstName,
                                                            staff.hrmE_EmployeeMiddleName,
                                                            staff.hrmE_EmployeeLastName
                                                        ]
                                                            .filter(Boolean)
                                                            .join(' ');
                                                        const staffName =
                                                            staff.employeeName ||
                                                            staff.staffName ||
                                                            fullName ||
                                                            `Staff #${staffId}`;
                                                        const staffCode = staff.employeeCode || staff.hrmE_EmployeeCode;

                                                        return (
                                                            <SelectItem key={`${staffId}-${idx}`} value={staffId.toString()}>
                                                                <span>{staffName}</span>
                                                                {staffCode && (
                                                                    <span className='ml-2 text-muted-foreground text-xs'>
                                                                        ({staffCode})
                                                                    </span>
                                                                )}
                                                            </SelectItem>
                                                        );
                                                    })
                                                )}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.hrmE_Id && <p className='font-medium text-[11px] text-red-500'>{errors.hrmE_Id.message}</p>}
                            </div>
                        </div>
                    </div>

                    {/* REMARKS */}
                    <div className='space-y-1.5'>
                        <Label className='flex items-center gap-1.5 font-bold text-purple-900 text-xs uppercase tracking-wider'>
                            <MessageSquare className='h-3.5 w-3.5 text-purple-600' /> Remarks
                        </Label>
                        <Controller
                            name='ttmD_Remarks'
                            control={control}
                            render={({ field }) => (
                                <Textarea
                                    {...field}
                                    value={field.value || ''}
                                    placeholder='Enter deputation remarks or notes here...'
                                    rows={2}
                                    className='border-purple-200 bg-purple-50/10 text-xs focus:border-purple-600 focus:ring-purple-200'
                                />
                            )}
                        />
                    </div>

                    {/* NOTIFICATION CHANNELS */}
                    <div className='flex flex-wrap items-center gap-8 rounded-xl border border-gray-100 bg-gray-50/70 p-4'>
                        <div className='flex items-center space-x-2'>
                            <Controller
                                name='sms_Flag'
                                control={control}
                                render={({ field }) => (
                                    <Checkbox
                                        id='sms_checkbox'
                                        checked={!!field.value}
                                        onCheckedChange={field.onChange}
                                        className='data-[state=checked]:border-purple-700 data-[state=checked]:bg-purple-700'
                                    />
                                )}
                            />
                            <Label
                                htmlFor='sms_checkbox'
                                className='flex cursor-pointer items-center gap-1.5 font-bold text-gray-700 text-xs uppercase'>
                                <MessageSquare className='h-3.5 w-3.5 text-purple-600' /> SEND SMS
                            </Label>
                        </div>

                        <div className='flex items-center space-x-2'>
                            <Controller
                                name='email_Flag'
                                control={control}
                                render={({ field }) => (
                                    <Checkbox
                                        id='email_checkbox'
                                        checked={!!field.value}
                                        onCheckedChange={field.onChange}
                                        className='data-[state=checked]:border-purple-700 data-[state=checked]:bg-purple-700'
                                    />
                                )}
                            />
                            <Label
                                htmlFor='email_checkbox'
                                className='flex cursor-pointer items-center gap-1.5 font-bold text-gray-700 text-xs uppercase'>
                                <Mail className='h-3.5 w-3.5 text-purple-600' /> SEND EMAIL
                            </Label>
                        </div>

                        <div className='flex items-center space-x-2'>
                            <Controller
                                name='notification_Flag'
                                control={control}
                                render={({ field }) => (
                                    <Checkbox
                                        id='notification_checkbox'
                                        checked={!!field.value}
                                        onCheckedChange={field.onChange}
                                        className='data-[state=checked]:border-purple-700 data-[state=checked]:bg-purple-700'
                                    />
                                )}
                            />
                            <Label
                                htmlFor='notification_checkbox'
                                className='flex cursor-pointer items-center gap-1.5 font-bold text-gray-700 text-xs uppercase'>
                                <Send className='h-3.5 w-3.5 text-purple-600' /> MOBILE NOTIFICATION
                            </Label>
                        </div>
                    </div>

                    {/* FORM ACTIONS */}
                    <div className='flex items-center justify-center gap-4 pt-2'>
                        <Button
                            type='button'
                            onClick={handleReset}
                            variant='outline'
                            className='h-10 border-orange-500 px-8 font-bold text-orange-600 text-xs uppercase tracking-wider shadow-xs hover:bg-orange-50'>
                            <RotateCcw className='mr-2 h-4 w-4' /> Cancel / Reset
                        </Button>
                        {detailsLoading && (
                            <div className='flex items-center gap-2 font-semibold text-purple-700 text-xs'>
                                <Loader2 className='h-4 w-4 animate-spin text-purple-600' />
                                <span>Loading master details...</span>
                            </div>
                        )}
                    </div>
                </form>
            </div>
        </CollapsibleSection>
    );
}
