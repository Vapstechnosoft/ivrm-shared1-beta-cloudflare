'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Loader2, Mail, MessageSquare, RotateCcw, Search, Send } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useDeputationNewAbsentStaff, useDeputationNewAcademicYears, useDeputationNewDetails } from '@/hooks/timetable/useDeputationNew';
import { DeputationNewSchema } from '@/schemas/timetable/deputationnew';
import type { IAcademicYearItem, IDayItem, IDeputationNewFormValues, IDeputationNewInitialData, IStaffItem } from '@/types/timetable/Transaction/deputationnew';

import { Button } from '@/components/ui/button';
import { CalendarYear } from '@/components/ui/calendar_year';
import { Checkbox } from '@/components/ui/checkbox';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export interface IDeputationNewFormSelection {
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

interface DeputationNewFormProps {
    onFetch: (selection: IDeputationNewFormSelection | null) => void;
    onResetParent?: () => void;
}

export default function DeputationNewForm({ onFetch, onResetParent }: DeputationNewFormProps) {
    const { data: initialDetails, isLoading: detailsLoading } = useDeputationNewDetails();
    const { data: academicYearsData } = useDeputationNewAcademicYears();
    const [staffSearchQuery, setStaffSearchQuery] = useState('');
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [resetKey, setResetKey] = useState(0);

    const initialData: IDeputationNewInitialData | undefined =
        initialDetails && 'data' in initialDetails ? initialDetails.data : (initialDetails as unknown as IDeputationNewInitialData | undefined);

    const ayList: IAcademicYearItem[] = useMemo(() => {
        const rawYears = academicYearsData?.data !== undefined ? academicYearsData.data : academicYearsData;
        if (Array.isArray(rawYears) && rawYears.length > 0) {
            return rawYears;
        }
        return initialData?.acayear || initialData?.academiclist || [];
    }, [academicYearsData, initialData]);

    const dayList: IDayItem[] = useMemo(() => {
        return initialData?.daylist || [];
    }, [initialData]);

    const form = useForm<IDeputationNewFormValues>({
        resolver: zodResolver(DeputationNewSchema),
        defaultValues: {
            asmaY_Id: '',
            ttmD_Date: new Date(),
            ttmD_Day: '',
            ttmD_Id: 0,
            absflag: false,
            hrmE_Id: '',
            remarks: '',
            sms_Flag: false,
            email_Flag: false,
            not_Flag: false
        }
    });

    const {
        control,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors }
    } = form;

    const watchedYearId = watch('asmaY_Id');
    const watchedDate = watch('ttmD_Date');
    const watchedAbsFlag = watch('absflag');
    const watchedStaffId = watch('hrmE_Id');
    const watchedDayId = watch('ttmD_Id');
    const watchedRemarks = watch('remarks');
    const watchedSms = watch('sms_Flag');
    const watchedEmail = watch('email_Flag');
    const watchedNot = watch('not_Flag');

    // Auto-select first academic year if not selected
    useEffect(() => {
        if (ayList && ayList.length > 0 && !watchedYearId) {
            const defaultYear = ayList[0];
            setValue('asmaY_Id', defaultYear.asmaY_Id.toString());
        }
    }, [ayList, watchedYearId, setValue]);

    // Format date string for API payload
    const formattedDateString = useMemo(() => {
        if (!watchedDate) return '';
        return new Date(watchedDate).toDateString();
    }, [watchedDate]);

    // Calculate Day from watchedDate and match with dayList
    useEffect(() => {
        if (!watchedDate || dayList.length === 0) return;

        const dateObj = new Date(watchedDate);
        const dayAbbr = format(dateObj, 'EEE').toUpperCase(); // MON, TUE, etc.
        const fullDay = format(dateObj, 'EEEE').toUpperCase(); // MONDAY, TUESDAY, etc.

        let matchedDay: IDayItem | undefined;
        for (const d of dayList) {
            const dayName = (d.ttmD_DayName || d.dayName || d.day_name || '').toUpperCase();
            const dayCode = (d.ttmD_DayCode || d.dayCode || d.day_code || '').toUpperCase();
            if (dayName.startsWith(dayAbbr) || dayName === fullDay || dayCode.startsWith(dayAbbr)) {
                matchedDay = d;
                break;
            }
        }

        if (matchedDay) {
            setValue('ttmD_Day', matchedDay.ttmD_DayName || fullDay);
            setValue('ttmD_Id', Number(matchedDay.ttmD_Id || 0));
        } else {
            setValue('ttmD_Day', fullDay);
            setValue('ttmD_Id', 0);
        }
    }, [watchedDate, dayList, setValue]);

    // Query absent staff list when absflag is toggled on
    const absentStaffQueryPayload = useMemo(() => {
        return {
            ASMAY_Id: Number(watchedYearId) || 0,
            TTSD_Date: formattedDateString,
            absflag: !!watchedAbsFlag
        };
    }, [watchedYearId, formattedDateString, watchedAbsFlag]);

    const { data: absentStaffData, isLoading: absentStaffLoading } = useDeputationNewAbsentStaff(
        absentStaffQueryPayload,
        !!watchedAbsFlag && !!watchedYearId && !!formattedDateString
    );

    // Resolved staff list based on absflag toggle
    const staffOptions: IStaffItem[] = useMemo(() => {
        if (watchedAbsFlag) {
            const rawAbsent = absentStaffData?.data !== undefined ? absentStaffData.data : absentStaffData;
            return rawAbsent?.stafflist || [];
        }
        return initialData?.stafflist || [];
    }, [watchedAbsFlag, absentStaffData, initialData]);

    // Filter staff list by search query
    const filteredStaffOptions = useMemo(() => {
        if (!staffSearchQuery) return staffOptions;
        const q = staffSearchQuery.toLowerCase();
        return staffOptions.filter((s) => {
            const name = (s.staffName || `${s.hrmE_EmployeeFirstName || ''} ${s.hrmE_EmployeeLastName || ''}`).toLowerCase();
            const code = (s.hrmE_EmployeeCode || '').toLowerCase();
            return name.includes(q) || code.includes(q);
        });
    }, [staffOptions, staffSearchQuery]);

    // Reset selected staff if the staff is no longer in options
    useEffect(() => {
        if (watchedStaffId && staffOptions.length > 0) {
            const exists = staffOptions.some((s) => s.hrmE_Id.toString() === watchedStaffId);
            if (!exists) {
                setValue('hrmE_Id', '');
                onFetch(null);
            }
        }
    }, [watchedStaffId, staffOptions, setValue, onFetch]);

    // Automatically trigger table fetch when year, date, day, and staff are selected
    useEffect(() => {
        if (watchedYearId && watchedDate && watchedDayId && watchedStaffId) {
            const dayObj = dayList.find((d) => Number(d.ttmD_Id) === Number(watchedDayId));
            onFetch({
                date: watchedDate,
                dateStr: formattedDateString,
                dayId: Number(watchedDayId),
                dayName: dayObj?.ttmD_DayName || '',
                asmaY_Id: Number(watchedYearId),
                absentStaffId: Number(watchedStaffId),
                absflag: !!watchedAbsFlag,
                remarks: watchedRemarks || '',
                smsflag: !!watchedSms,
                mailflag: !!watchedEmail,
                noT_Flag: !!watchedNot,
                masters: initialData
            });
        } else {
            onFetch(null);
        }
    }, [
        watchedYearId,
        watchedDate,
        watchedDayId,
        watchedStaffId,
        watchedAbsFlag,
        watchedRemarks,
        watchedSms,
        watchedEmail,
        watchedNot,
        dayList,
        formattedDateString,
        initialData,
        onFetch
    ]);

    const handleFormReset = () => {
        reset({
            asmaY_Id: ayList[0]?.asmaY_Id ? ayList[0].asmaY_Id.toString() : '',
            ttmD_Date: new Date(),
            ttmD_Day: '',
            ttmD_Id: 0,
            absflag: false,
            hrmE_Id: '',
            remarks: '',
            sms_Flag: false,
            email_Flag: false,
            not_Flag: false
        });
        setStaffSearchQuery('');
        setResetKey((prev) => prev + 1);
        if (onResetParent) onResetParent();
        onFetch(null);
        toast.info('Form cleared');
    };

    return (
        <CollapsibleSection
            title='Absent Staff Allotment (Deputation New)'
            description='Allocate substitute staff for absent teachers and manage period substitutions'
            defaultOpen={true}>
            <form
                onSubmit={handleSubmit(() => {
                    // Selection is handled dynamically on change
                })}
                className='space-y-6 pt-2'>
                {/* 2-Column Responsive Form Layout */}
                <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                    {/* Left Column */}
                    <div className='space-y-5 rounded-2xl border border-slate-100 bg-slate-50/50 p-5 shadow-xs'>
                        {/* 1. Academic Year */}
                        <div className='space-y-2'>
                            <Label htmlFor='asmaY_Id' className='font-bold text-slate-700 text-xs uppercase tracking-wider'>
                                Academic Year <span className='text-rose-500'>*</span>
                            </Label>
                            <Controller
                                name='asmaY_Id'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        value={field.value || undefined}
                                        onValueChange={(val) => {
                                            field.onChange(val);
                                            setValue('hrmE_Id', '');
                                        }}
                                        disabled={detailsLoading}>
                                        <SelectTrigger
                                            id='asmaY_Id'
                                            className='h-10 w-full rounded-xl border-slate-200 bg-white shadow-xs focus:ring-2 focus:ring-purple-400'>
                                            <SelectValue placeholder='Select Academic Year' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ayList.map((year) => (
                                                <SelectItem key={year.asmaY_Id} value={year.asmaY_Id.toString()}>
                                                    {year.asmaY_Year}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.asmaY_Id && <p className='font-medium text-rose-500 text-xs'>{errors.asmaY_Id.message}</p>}
                        </div>

                        {/* 2. Absent Staff Checkbox */}
                        <div className='flex items-center space-x-3 rounded-xl border border-amber-200/60 bg-amber-50/50 p-3'>
                            <Controller
                                name='absflag'
                                control={control}
                                render={({ field }) => (
                                    <Checkbox
                                        id='absflag'
                                        checked={field.value}
                                        onCheckedChange={(checked) => {
                                            field.onChange(!!checked);
                                            setValue('hrmE_Id', '');
                                        }}
                                        className='h-4 w-4 border-amber-400 data-[state=checked]:bg-amber-600'
                                    />
                                )}
                            />
                            <Label htmlFor='absflag' className='cursor-pointer font-bold text-amber-900 text-xs'>
                                ABSENT STAFF ON : {watchedDate ? format(new Date(watchedDate), 'dd/MM/yyyy') : '--/--/----'}
                            </Label>
                        </div>

                        {/* 3. Staff Name */}
                        <div className='space-y-2'>
                            <div className='flex items-center justify-between'>
                                <Label htmlFor='hrmE_Id' className='font-bold text-slate-700 text-xs uppercase tracking-wider'>
                                    Staff Name <span className='text-rose-500'>*</span>
                                </Label>
                                {watchedAbsFlag && absentStaffLoading && (
                                    <span className='flex items-center gap-1 font-medium text-[11px] text-amber-600'>
                                        <Loader2 className='h-3 w-3 animate-spin' /> Loading absent staff...
                                    </span>
                                )}
                            </div>
                            <Controller
                                name='hrmE_Id'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        value={field.value || undefined}
                                        onValueChange={field.onChange}
                                        disabled={detailsLoading || (watchedAbsFlag && absentStaffLoading)}>
                                        <SelectTrigger
                                            id='hrmE_Id'
                                            className='h-10 w-full rounded-xl border-slate-200 bg-white shadow-xs focus:ring-2 focus:ring-purple-400'>
                                            <SelectValue
                                                placeholder={staffOptions.length === 0 ? 'No staff available' : 'Select Staff Name'}
                                            />
                                        </SelectTrigger>
                                        <SelectContent className='max-h-60'>
                                            <div className='sticky top-0 z-10 bg-white p-2'>
                                                <div className='flex items-center gap-2 rounded-lg border border-slate-200 px-2 py-1'>
                                                    <Search className='h-3.5 w-3.5 text-slate-400' />
                                                    <Input
                                                        type='text'
                                                        placeholder='Filter staff...'
                                                        value={staffSearchQuery}
                                                        onChange={(e) => setStaffSearchQuery(e.target.value)}
                                                        className='h-7 border-0 p-0 text-xs shadow-none focus-visible:ring-0'
                                                    />
                                                </div>
                                            </div>
                                            {filteredStaffOptions.length === 0 ? (
                                                <div className='p-3 text-center text-slate-500 text-xs'>No staff members found</div>
                                            ) : (
                                                filteredStaffOptions.map((staff) => {
                                                    const displayName =
                                                        staff.staffName ||
                                                        `${staff.hrmE_EmployeeFirstName || ''} ${staff.hrmE_EmployeeLastName || ''}`.trim();
                                                    const code = staff.hrmE_EmployeeCode ? ` [${staff.hrmE_EmployeeCode}]` : '';
                                                    return (
                                                        <SelectItem key={staff.hrmE_Id} value={staff.hrmE_Id.toString()}>
                                                            {displayName}
                                                            {code}
                                                        </SelectItem>
                                                    );
                                                })
                                            )}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.hrmE_Id && <p className='font-medium text-rose-500 text-xs'>{errors.hrmE_Id.message}</p>}
                        </div>

                        {/* 4. Remarks */}
                        <div className='space-y-2'>
                            <Label htmlFor='remarks' className='font-bold text-slate-700 text-xs uppercase tracking-wider'>
                                Remarks
                            </Label>
                            <Controller
                                name='remarks'
                                control={control}
                                render={({ field }) => (
                                    <Textarea
                                        {...field}
                                        id='remarks'
                                        placeholder='Enter remarks for this deputation assignment...'
                                        rows={3}
                                        className='resize-none rounded-xl border-slate-200 bg-white text-xs shadow-xs focus:ring-2 focus:ring-purple-400'
                                    />
                                )}
                            />
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className='space-y-5 rounded-2xl border border-slate-100 bg-slate-50/50 p-5 shadow-xs'>
                        {/* 5. Date Selection */}
                        <div className='space-y-2'>
                            <Label htmlFor='ttmD_Date' className='font-bold text-slate-700 text-xs uppercase tracking-wider'>
                                Date <span className='text-rose-500'>*</span>
                            </Label>
                            <Controller
                                name='ttmD_Date'
                                control={control}
                                render={({ field }) => (
                                    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                id='ttmD_Date'
                                                variant='outline'
                                                type='button'
                                                className='h-10 w-full justify-start rounded-xl border-slate-200 bg-white text-left font-normal shadow-xs hover:bg-slate-50'>
                                                <CalendarIcon className='mr-2 h-4 w-4 text-purple-600' />
                                                {field.value ? (
                                                    <span className='font-semibold text-slate-800'>{format(field.value, 'PPP')}</span>
                                                ) : (
                                                    <span className='text-slate-400'>Pick a date</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className='w-auto p-0' align='start'>
                                            <CalendarYear
                                                key={resetKey}
                                                mode='single'
                                                selected={field.value}
                                                onSelect={(selectedDate) => {
                                                    if (selectedDate) {
                                                        field.onChange(selectedDate);
                                                        setIsCalendarOpen(false);
                                                    }
                                                }}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                )}
                            />
                            {errors.ttmD_Date && <p className='font-medium text-rose-500 text-xs'>{errors.ttmD_Date.message}</p>}
                        </div>

                        {/* 6. Day Auto-Detected */}
                        <div className='space-y-2'>
                            <Label htmlFor='ttmD_Day' className='font-bold text-slate-700 text-xs uppercase tracking-wider'>
                                Day <span className='text-rose-500'>*</span>
                            </Label>
                            <Controller
                                name='ttmD_Day'
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id='ttmD_Day'
                                        readOnly
                                        placeholder='Day auto-detected from date'
                                        className='h-10 rounded-xl border-slate-200 bg-slate-100 font-semibold text-slate-800 shadow-xs'
                                    />
                                )}
                            />
                            {errors.ttmD_Id && <p className='font-medium text-rose-500 text-xs'>{errors.ttmD_Id.message}</p>}
                        </div>

                        {/* 7. Notification Channels */}
                        <div className='space-y-3 pt-2'>
                            <Label className='font-bold text-slate-700 text-xs uppercase tracking-wider'>Notification Channels</Label>
                            <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
                                {/* SEND SMS */}
                                <div className='flex items-center space-x-2.5 rounded-xl border border-slate-200 bg-white p-3 shadow-2xs'>
                                    <Controller
                                        name='sms_Flag'
                                        control={control}
                                        render={({ field }) => (
                                            <Checkbox
                                                id='sms_Flag'
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                className='h-4 w-4 border-purple-400 data-[state=checked]:bg-purple-600'
                                            />
                                        )}
                                    />
                                    <Label
                                        htmlFor='sms_Flag'
                                        className='flex cursor-pointer items-center gap-1.5 font-bold text-slate-700 text-xs'>
                                        <MessageSquare className='h-3.5 w-3.5 text-purple-600' /> SMS
                                    </Label>
                                </div>

                                {/* SEND EMAIL */}
                                <div className='flex items-center space-x-2.5 rounded-xl border border-slate-200 bg-white p-3 shadow-2xs'>
                                    <Controller
                                        name='email_Flag'
                                        control={control}
                                        render={({ field }) => (
                                            <Checkbox
                                                id='email_Flag'
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                className='h-4 w-4 border-blue-400 data-[state=checked]:bg-blue-600'
                                            />
                                        )}
                                    />
                                    <Label
                                        htmlFor='email_Flag'
                                        className='flex cursor-pointer items-center gap-1.5 font-bold text-slate-700 text-xs'>
                                        <Mail className='h-3.5 w-3.5 text-blue-600' /> EMAIL
                                    </Label>
                                </div>

                                {/* MOBILE NOTIFICATION */}
                                <div className='flex items-center space-x-2.5 rounded-xl border border-slate-200 bg-white p-3 shadow-2xs'>
                                    <Controller
                                        name='not_Flag'
                                        control={control}
                                        render={({ field }) => (
                                            <Checkbox
                                                id='not_Flag'
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                className='h-4 w-4 border-emerald-400 data-[state=checked]:bg-emerald-600'
                                            />
                                        )}
                                    />
                                    <Label
                                        htmlFor='not_Flag'
                                        className='flex cursor-pointer items-center gap-1.5 font-bold text-slate-700 text-xs'>
                                        <Send className='h-3.5 w-3.5 text-emerald-600' /> PUSH NOTIF
                                    </Label>
                                </div>
                            </div>
                        </div>

                        {/* Reset Action */}
                        <div className='flex justify-end pt-3'>
                            <Button
                                type='button'
                                variant='outline'
                                onClick={handleFormReset}
                                className='h-10 rounded-xl border-slate-200 px-5 font-semibold text-slate-700 text-xs shadow-xs hover:bg-slate-100 hover:text-slate-900'>
                                <RotateCcw className='mr-2 h-3.5 w-3.5' /> Reset Form
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </CollapsibleSection>
    );
}
