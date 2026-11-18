'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { consolidatedReportSchema } from '@/schemas/timetable/reports';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Controller, useForm } from 'react-hook-form';
import type { z } from 'zod';

type FormFields = z.infer<typeof consolidatedReportSchema.search>;

interface ConsolidatedFormProps {
    initialData: any;
    onSubmit: (data: any) => void;
}

export default function ConsolidatedForm({ initialData, onSubmit }: ConsolidatedFormProps) {
    // We use the data directly from initialData as per user request to integrate the facade API lists
    const academicList = initialData?.acayear || initialData?.academiclist || [];
    const categoryList = initialData?.cateoglst || initialData?.catelist || initialData?.categorylist || [];
    const staffList = initialData?.stafflst || initialData?.stafflist || [];
    const periodList = initialData?.periodslst || initialData?.periodlist || [];
    const daysList = initialData?.dayslst_fix || initialData?.daylist || [];
    const sectionList = initialData?.sectionlists || initialData?.sectionlist || [];

    const [classList, setClassList] = useState<any[]>([]);

    const mockReportTypes = [
        { id: 'ST', label: 'STAFF WISE DETAILS' },
        { id: 'STD', label: 'STAFF DAY WISE' },
        { id: 'CSUB', label: 'CLASS SUBJECT' },
        { id: 'STSUB', label: 'STAFF SUBJECT' },
        { id: 'SPW', label: 'STAFF PERIOD WISE WORKLOAD' },
        { id: 'STFP', label: 'STAFF FREE PERIOD' },
        { id: 'PSTF', label: 'PERIOD WISE STAFF FREE' },
        { id: 'SPC', label: 'STAFF-PERIOD CONSOLIDATED' },
        { id: 'CSPC', label: 'CLASS-SECTION PERIOD CONSOLIDATED' },
        { id: 'RMR', label: 'ROOM-WISE REPORT' },
        { id: 'ATG', label: 'STAFF WORKLOAD AFTER TIMETABLE GENERATION' }
    ];

    const form = useForm<FormFields>({
        resolver: zodResolver(consolidatedReportSchema.search),
        defaultValues: {
            type: 'ST',
            rpttyp: 'SAWC',
            rpttypai: false,
            asmaY_Id: undefined
        }
    });

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors, isSubmitting }
    } = form;

    const watchedType = watch('type');
    const watchedAcademicYear = watch('asmaY_Id');
    const watchedCategory = watch('ttmC_Id');

    // Filter classes based on selected category from the initial classlists
    useEffect(() => {
        const allClassLists = initialData?.classlists || initialData?.classlist || [];
        if (watchedCategory && allClassLists.length > 0) {
            // Filter by category if the property exists, otherwise show all
            const filtered = allClassLists.filter((c: any) => !c.ttmC_Id || c.ttmC_Id === watchedCategory);
            setClassList(filtered);
            // Optionally clear class selection when category changes
            // setValue('classId', []);
        } else {
            setClassList(allClassLists);
        }
    }, [watchedCategory, initialData]);

    const onFormSubmit = (data: FormFields) => {
        const fullClassList = initialData?.classlists || initialData?.classlist || [];
        const fullSectionList = initialData?.sectionlists || initialData?.sectionlist || [];
        const fullStaffList = initialData?.stafflst || initialData?.stafflist || [];
        const fullDayList = initialData?.dayslst_fix || initialData?.daylist || [];
        const fullPeriodList = initialData?.periodslst || initialData?.periodlist || [];

        // Map selections back to full objects and set the selection flags
        const classdss = (data.classId || [])
            .map((id) => {
                const obj = { ...fullClassList.find((c: any) => c.asmcL_Id === id) };
                if (obj) obj.claslis = true;
                return { ...obj, ASMCL_Id: id };
            })
            .filter((o) => o.ASMCL_Id);

        const sectiondss = (data.sectionId || [])
            .map((id) => {
                const obj = { ...fullSectionList.find((s: any) => s.asmS_Id === id) };
                if (obj) obj.secs = true;
                return { ...obj, ASMS_Id: id };
            })
            .filter((o) => o.ASMS_Id);

        const stfidss = (data.staffId || [])
            .map((id) => {
                const obj = { ...fullStaffList.find((s: any) => s.hrmE_Id === id) };
                if (obj) obj.stf = true;
                return { ...obj, HRME_Id: id };
            })
            .filter((o) => o.HRME_Id);

        const dayidss = (data.dayId || [])
            .map((id) => {
                const obj = { ...fullDayList.find((d: any) => d.ttmD_Id === id) };
                if (obj) obj.sayy = true;
                return { ...obj, TTMD_Id: id };
            })
            .filter((o) => o.TTMD_Id);

        const periodidss = (data.periodId || [])
            .map((id) => {
                const obj = { ...fullPeriodList.find((p: any) => p.ttmP_Id === id) };
                if (obj) obj.ppr = true;
                return { ...obj, TTMP_Id: id };
            })
            .filter((o) => o.TTMP_Id);

        let payload: any = {
            ASMAY_Id: String(data.asmaY_Id),
            TYPE: data.type
        };

        if (['CSUB', 'STSUB', 'SPW'].includes(data.type)) {
            payload = { ...payload, stfidss, dayidss, periodidss };
        } else if (data.type === 'PSTF') {
            payload = {
                ...payload,
                TTMD_Id: data.singleDayId,
                TTMP_Id: data.singlePeriodId,
                rpttypairods: data.rpttypai,
                stfidss,
                dayidss,
                periodidss
            };
        } else if (data.type === 'STFP') {
            payload = {
                ...payload,
                TTMD_Id: data.singleDayId,
                rpttypairods: data.rpttypai,
                stfidss,
                dayidss,
                periodidss
            };
        } else if (data.type === 'RMR') {
            // RMR uses minimal payload, no extra fields required
        } else if (data.type === 'STD') {
            payload = {
                ...payload,
                stfidss,
                dayidss
            };
        } else if (['ATG', 'SPC', 'CSPC'].includes(data.type)) {
            // These types use minimal payload in original controller
        } else {
            // Default report type (e.g. ST)
            payload = {
                ...payload,
                rpttypairods: data.rpttypai,
                rpttyp: data.rpttyp,
                TTMC_Id: data.ttmC_Id,
                classdss,
                sectiondss,
                stfidss,
                dayidss,
                periodidss
            };
        }

        onSubmit(payload);
    };

    const handleClear = () => {
        reset();
        onSubmit({ CLEAR: true });
    };
    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className='space-y-6 rounded-lg border bg-white p-6 shadow-sm'>
            {/* Report Type Selection */}
            <div className='space-y-4'>
                <Label className='font-bold text-gray-700'>Report Type</Label>
                <Controller
                    control={control}
                    name='type'
                    render={({ field }) => (
                        <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className='grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3'>
                            {mockReportTypes.map((type) => (
                                <div key={type.id} className='flex items-center space-x-2'>
                                    <RadioGroupItem value={type.id} id={type.id} />
                                    <Label htmlFor={type.id} className='cursor-pointer font-medium text-sm'>
                                        {type.label}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    )}
                />
            </div>

            <div className='grid grid-cols-1 gap-6 border-t pt-6 md:grid-cols-2 lg:grid-cols-3'>
                {/* Common Field: Academic Year */}
                <div className='space-y-2'>
                    <Label className='font-semibold'>
                        Academic Year <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='asmaY_Id'
                        control={control}
                        render={({ field }) => (
                            <Select
                                onValueChange={(value) => field.onChange(value ? Number(value) : '')}
                                value={field.value ? field.value.toString() : ''}>
                                <SelectTrigger className='w-full'>
                                    <SelectValue placeholder='Select Academic Year' />
                                </SelectTrigger>

                                <SelectContent>
                                    {academicList?.map((item: any) => (
                                        <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                            {item.asmaY_Year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.asmaY_Id && <span className='font-medium text-red-500 text-sm'>{errors.asmaY_Id.message}</span>}
                </div>

                {/* Specific for ST */}
                {watchedType === 'ST' && (
                    <>
                        <div className='space-y-2'>
                            <div className='flex items-center space-x-2'>
                                <Controller
                                    control={control}
                                    name='rpttypai'
                                    render={({ field }) => (
                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} id='rpttypai' />
                                    )}
                                />
                                <Label htmlFor='rpttypai' className='font-semibold'>
                                    Teacher Master
                                </Label>
                            </div>
                        </div>

                        <div className='space-y-2'>
                            <Label className='font-semibold'>
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
                                            {categoryList.map((item: any) => (
                                                <SelectItem key={item.ttmC_Id} value={item.ttmC_Id.toString()}>
                                                    {item.ttmC_CategoryName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.ttmC_Id && <span className='font-medium text-red-500 text-sm'>{errors.ttmC_Id.message}</span>}
                        </div>

                        <div className='space-y-2'>
                            <Label className='font-semibold'>
                                Class <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                control={control}
                                name='classId'
                                render={({ field }) => (
                                    <MultiSelect
                                        options={classList.map((c: any) => ({ label: c.asmcL_ClassName, value: c.asmcL_Id.toString() }))}
                                        defaultValue={(field.value || []).map(String)}
                                        onValueChange={(val) => field.onChange(val.map(Number))}
                                        placeholder='Select Classes'
                                    />
                                )}
                            />
                            {errors.classId && <span className='font-medium text-red-500 text-sm'>{errors.classId.message}</span>}
                        </div>

                        <div className='space-y-2'>
                            <Label className='font-semibold'>
                                Section <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                control={control}
                                name='sectionId'
                                render={({ field }) => (
                                    <MultiSelect
                                        options={sectionList.map((s: any) => ({ label: s.asmC_SectionName, value: s.asmS_Id.toString() }))}
                                        defaultValue={(field.value || []).map(String)}
                                        onValueChange={(val) => field.onChange(val.map(Number))}
                                        placeholder='Select Sections'
                                    />
                                )}
                            />
                            {errors.sectionId && <span className='font-medium text-red-500 text-sm'>{errors.sectionId.message}</span>}
                        </div>
                    </>
                )}

                {/* Specific for CSUB, STSUB, SPW */}
                {['CSUB', 'STSUB', 'SPW'].includes(watchedType) && (
                    <>
                        <div className='space-y-2'>
                            <Label className='font-semibold'>
                                Staff Name <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                control={control}
                                name='staffId'
                                render={({ field }) => (
                                    <MultiSelect
                                        options={staffList.map((s: any) => ({ label: s.empName, value: s.hrmE_Id.toString() }))}
                                        defaultValue={(field.value || []).map(String)}
                                        onValueChange={(val) => field.onChange(val.map(Number))}
                                        placeholder='Select Staff'
                                        className='border-purple-200'
                                    />
                                )}
                            />
                            {errors.staffId && <span className='font-medium text-red-500 text-sm'>{errors.staffId.message}</span>}
                        </div>
                        <div className='space-y-2'>
                            <Label className='font-semibold'>
                                Day <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                control={control}
                                name='dayId'
                                render={({ field }) => (
                                    <MultiSelect
                                        options={daysList.map((d: any) => ({ label: d.ttmD_DayName, value: d.ttmD_Id.toString() }))}
                                        defaultValue={(field.value || []).map(String)}
                                        onValueChange={(val) => field.onChange(val.map(Number))}
                                        placeholder='Select Days'
                                        className='border-purple-200'
                                    />
                                )}
                            />
                            {errors.dayId && <span className='font-medium text-red-500 text-sm'>{errors.dayId.message}</span>}
                        </div>
                        <div className='space-y-2'>
                            <Label className='font-semibold'>
                                Period <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                control={control}
                                name='periodId'
                                render={({ field }) => (
                                    <MultiSelect
                                        options={periodList.map((p: any) => ({ label: p.ttmP_PeriodName, value: p.ttmP_Id.toString() }))}
                                        defaultValue={(field.value || []).map(String)}
                                        onValueChange={(val) => field.onChange(val.map(Number))}
                                        placeholder='Select Periods'
                                        className='border-purple-200'
                                    />
                                )}
                            />
                            {errors.periodId && <span className='font-medium text-red-500 text-sm'>{errors.periodId.message}</span>}
                        </div>
                    </>
                )}

                {/* Specific for STFP, PSTF */}
                {['STFP', 'PSTF'].includes(watchedType) && (
                    <div className='space-y-2'>
                        <Label className='font-semibold'>
                            Day <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            control={control}
                            name='singleDayId'
                            render={({ field }) => (
                                <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                    <SelectTrigger className='border-purple-200'>
                                        <SelectValue placeholder='--Select Day--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {daysList.map((item: any) => (
                                            <SelectItem key={item.ttmD_Id} value={item.ttmD_Id.toString()}>
                                                {item.ttmD_DayName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.singleDayId && <span className='font-medium text-red-500 text-sm'>{errors.singleDayId.message}</span>}
                    </div>
                )}

                {/* Specific for PSTF */}
                {watchedType === 'PSTF' && (
                    <div className='space-y-2'>
                        <Label className='font-semibold'>
                            Period <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            control={control}
                            name='singlePeriodId'
                            render={({ field }) => (
                                <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                    <SelectTrigger className='border-purple-200'>
                                        <SelectValue placeholder='--Select Period--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {periodList.map((item: any) => (
                                            <SelectItem key={item.ttmP_Id} value={item.ttmP_Id.toString()}>
                                                {item.ttmP_PeriodName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.singlePeriodId && <span className='font-medium text-red-500 text-sm'>{errors.singlePeriodId.message}</span>}
                    </div>
                )}
            </div>

            <div className='flex justify-center gap-4 pt-4'>
                <Button type='submit' disabled={isSubmitting} className='min-w-[120px]'>
                    {isSubmitting ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Search className='mr-2 h-4 w-4' />}
                    Report
                </Button>
                <Button type='button' variant='outline' onClick={handleClear} className='min-w-[120px]'>
                    <X className='mr-2 h-4 w-4' /> Cancel
                </Button>
            </div>
        </form>
    );
}
