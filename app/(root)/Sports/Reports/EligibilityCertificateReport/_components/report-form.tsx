'use client';

import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEligibilityCertificateReport } from '@/hooks/sports/useEligibilityCertificateReport';
import {
    type IEligibilityCertificateReport,
    eligibilityCertificateReportSchema
} from '@/types/sports/reports/eligibility-certificate-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { FileSpreadsheet, FileText, Loader2, Printer, X } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface ReportFormProps {
    onReport: (data: any) => void;
    onReset: () => void;
    onPrint: () => void;
    onExcel: () => void;
    hasData: boolean;
}

export default function ReportForm({ onReport, onReset, onPrint, onExcel, hasData }: ReportFormProps) {
    const {
        data: loadGridData,
        isLoading,
        getClasses,
        getSections,
        getStudents,
        getAge,
        generateReport
    } = useEligibilityCertificateReport();

    const getUniqueListBy = (arr: any[], key: string) => {
        return [...new Map(arr.map((item) => [item[key], item])).values()];
    };

    const {
        control,
        handleSubmit,
        watch,
        reset,
        setValue,
        formState: { errors }
    } = useForm<IEligibilityCertificateReport>({
        resolver: zodResolver(eligibilityCertificateReportSchema),
        mode: 'onSubmit',
        defaultValues: {
            optionflag: 'SCHOOL',
            asmaY_Id: 0,
            asmcL_Id: 0,
            asmS_Id: 0,
            amsT_Id: 0,
            spccmE_Id: 0,
            amsT_Date: new Date(),
            spccsH_Age: '',
            spccmE_EventName: ''
        }
    });

    const watchedOptionFlag = watch('optionflag');
    const watchedAsmaY_Id = watch('asmaY_Id');
    const watchedAsmcL_Id = watch('asmcL_Id');
    const watchedAsmS_Id = watch('asmS_Id');
    const watchedAmsT_Id = watch('amsT_Id');
    const watchedSpccmE_Id = watch('spccmE_Id');
    const watchedAmsT_Date = watch('amsT_Date');

    // Reset all fields when School/College option changes
    useEffect(() => {
        setValue('asmaY_Id', 0);
        setValue('asmcL_Id', 0);
        setValue('asmS_Id', 0);
        setValue('amsT_Id', 0);
        setValue('spccmE_Id', 0);
        setValue('spccsH_Age', '');
    }, [watchedOptionFlag]);

    // Fetch Classes when Year or Option changes
    useEffect(() => {
        if (watchedAsmaY_Id && watchedAsmaY_Id !== 0) {
            getClasses.mutateAsync({ asmaY_Id: watchedAsmaY_Id }).then((res) => {
                if (!res.success && !res.data) {
                    toast.error(res.message || 'Error fetching classes');
                }
            });
        }
    }, [watchedAsmaY_Id, watchedOptionFlag]);

    // Precise Resets
    useEffect(() => {
        if (watchedAsmaY_Id) {
            if (watchedAsmcL_Id !== 0) setValue('asmcL_Id', 0);
            if (watchedAsmS_Id !== 0) setValue('asmS_Id', 0);
            if (watchedAmsT_Id !== 0) setValue('amsT_Id', 0);
        }
    }, [watchedAsmaY_Id, watchedOptionFlag]);

    useEffect(() => {
        if (watchedAsmcL_Id) {
            if (watchedAsmS_Id !== 0) setValue('asmS_Id', 0);
            if (watchedAmsT_Id !== 0) setValue('amsT_Id', 0);
        }
    }, [watchedAsmcL_Id]);

    useEffect(() => {
        if (watchedAsmS_Id) {
            if (watchedAmsT_Id !== 0) setValue('amsT_Id', 0);
        }
    }, [watchedAsmS_Id]);

    // Fetch Sections when Class changes
    useEffect(() => {
        if (watchedAsmcL_Id && watchedAsmcL_Id !== 0 && watchedAsmaY_Id) {
            getSections
                .mutateAsync({
                    asmaY_Id: watchedAsmaY_Id,
                    asmcL_Id: watchedAsmcL_Id
                })
                .then((res) => {
                    if (!res.success && !res.data) {
                        toast.error(res.message || 'Error fetching sections');
                    }
                });
        }
    }, [watchedAsmcL_Id, watchedAsmaY_Id]);

    // Fetch Students when Section changes
    useEffect(() => {
        if (watchedAsmS_Id && watchedAsmS_Id !== 0 && watchedAsmcL_Id && watchedAsmaY_Id) {
            getStudents
                .mutateAsync({
                    asmaY_Id: watchedAsmaY_Id,
                    asmcL_Id: watchedAsmcL_Id,
                    asmS_Id: watchedAsmS_Id
                })
                .then((res) => {
                    if (!res.success && !res.data) {
                        toast.error(res.message || 'Error fetching students');
                    }
                });
        }
    }, [watchedAsmS_Id, watchedAsmcL_Id, watchedAsmaY_Id]);

    // Fetch Age when Student, Date, or Event changes
    useEffect(() => {
        if (watchedAmsT_Id && watchedAmsT_Date && watchedSpccmE_Id) {
            const event = loadGridData?.data?.eventList?.find((e: any) => e.spccmE_Id === watchedSpccmE_Id);
            const eventName = event?.spccmE_EventName || '';
            setValue('spccmE_EventName', eventName);

            getAge
                .mutateAsync({
                    asmaY_Id: watchedAsmaY_Id,
                    asmcL_Id: watchedAsmcL_Id,
                    asmS_Id: watchedAsmS_Id,
                    amsT_Id: watchedAmsT_Id,
                    spccmE_Id: watchedSpccmE_Id,
                    amsT_Date: format(new Date(watchedAmsT_Date), 'yyyy-MM-dd'),
                    spccmE_EventName: eventName
                })
                .then((res) => {
                    if (res.success && res.data?.age_tilldate?.[0]) {
                        setValue('spccsH_Age', res.data.age_tilldate[0].spccsH_Age);
                    }
                });
        }
    }, [watchedAmsT_Id, watchedAmsT_Date, watchedSpccmE_Id]);

    const onSubmit = async (values: IEligibilityCertificateReport) => {
        const year = loadGridData?.data?.yearlist?.find((y: any) => y.asmaY_Id === values.asmaY_Id);
        const payload = {
            ...values,
            asmaY_Year: year?.asmaY_Year || '',
            amsT_Date: format(new Date(values.amsT_Date), 'yyyy-MM-dd')
        };

        const res = await generateReport.mutateAsync(payload);

        if (res.success && res.data && res.data.length > 0) {
            onReport(res.data);
            toast.success('Report generated successfully');
        } else {
            toast.info(res.message || 'No records found');
            onReport([]);
        }
    };

    const handleCancel = () => {
        reset({
            optionflag: 'SCHOOL',
            asmaY_Id: 0,
            asmcL_Id: 0,
            asmS_Id: 0,
            amsT_Id: 0,
            spccmE_Id: 0,
            amsT_Date: new Date(),
            spccsH_Age: '',
            spccmE_EventName: ''
        });
        onReset();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            {/* School / College Option */}
            <div className='flex justify-center'>
                <Controller
                    name='optionflag'
                    control={control}
                    render={({ field }) => (
                        <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className='flex gap-8 rounded-md border bg-muted/30 p-4'>
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='SCHOOL' id='school' />
                                <Label htmlFor='school' className='cursor-pointer font-bold'>
                                    SCHOOL
                                </Label>
                            </div>
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='COLLEGE' id='college' />
                                <Label htmlFor='college' className='cursor-pointer font-bold'>
                                    COLLEGE
                                </Label>
                            </div>
                        </RadioGroup>
                    )}
                />
            </div>

            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                {/* Left Column */}
                <div className='space-y-4'>
                    {/* Academic Year */}
                    <div className='grid grid-cols-4 items-center gap-4'>
                        <Label className='text-right'>
                            Academic Year <span className='text-destructive'>*</span>
                        </Label>
                        <div className='col-span-3'>
                            <Controller
                                name='asmaY_Id'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(val) => field.onChange(Number(val))}
                                        value={field.value !== 0 ? field.value?.toString() : undefined}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={isLoading ? 'Loading Years...' : 'Select Academic Year'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='0'>Select Academic Year</SelectItem>
                                            {getUniqueListBy(loadGridData?.data?.yearlist || [], 'asmaY_Id').map((y: any) => (
                                                <SelectItem key={y.asmaY_Id} value={y.asmaY_Id.toString()}>
                                                    {y.asmaY_Year}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.asmaY_Id && <span className='text-destructive text-xs'>{errors.asmaY_Id.message}</span>}
                        </div>
                    </div>

                    {/* Class */}
                    <div className='grid grid-cols-4 items-center gap-4'>
                        <Label className='text-right'>
                            Class <span className='text-destructive'>*</span>
                        </Label>
                        <div className='col-span-3'>
                            <Controller
                                name='asmcL_Id'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(val) => field.onChange(Number(val))}
                                        value={field.value !== 0 ? field.value?.toString() : undefined}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={getClasses.isPending ? 'Loading Classes...' : 'Select Class'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='0'>Select Class</SelectItem>
                                            {getUniqueListBy(
                                                getClasses.data?.data?.classList?.result ||
                                                    getClasses.data?.data?.classList ||
                                                    getClasses.data?.data?.ClassList ||
                                                    [],
                                                'asmcL_Id'
                                            ).map((c: any) => (
                                                <SelectItem key={c.asmcL_Id} value={c.asmcL_Id.toString()}>
                                                    {c.asmcL_ClassName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.asmcL_Id && <span className='text-destructive text-xs'>{errors.asmcL_Id.message}</span>}
                        </div>
                    </div>

                    {/* Section */}
                    <div className='grid grid-cols-4 items-center gap-4'>
                        <Label className='text-right'>
                            Section <span className='text-destructive'>*</span>
                        </Label>
                        <div className='col-span-3'>
                            <Controller
                                name='asmS_Id'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(val) => field.onChange(Number(val))}
                                        value={field.value !== 0 ? field.value?.toString() : undefined}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={getSections.isPending ? 'Loading Sections...' : 'Select Section'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='0'>Select Section</SelectItem>
                                            {getUniqueListBy(
                                                getSections.data?.data?.sectionList?.result || getSections.data?.data?.sectionList || [],
                                                'asmS_Id'
                                            ).map((s: any) => (
                                                <SelectItem key={s.asmS_Id} value={s.asmS_Id.toString()}>
                                                    {s.asmC_SectionName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.asmS_Id && <span className='text-destructive text-xs'>{errors.asmS_Id.message}</span>}
                        </div>
                    </div>

                    {/* Event Name */}
                    <div className='grid grid-cols-4 items-center gap-4'>
                        <Label className='text-right'>
                            Event Name <span className='text-destructive'>*</span>
                        </Label>
                        <div className='col-span-3'>
                            <Controller
                                name='spccmE_Id'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(val) => field.onChange(Number(val))}
                                        value={field.value !== 0 ? field.value?.toString() : undefined}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={isLoading ? 'Loading Events...' : 'Select Event Name'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='0'>Select Event Name</SelectItem>
                                            {getUniqueListBy(loadGridData?.data?.eventList || [], 'spccmE_Id').map((e: any) => (
                                                <SelectItem key={e.spccmE_Id} value={e.spccmE_Id.toString()}>
                                                    {e.spccmE_EventName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.spccmE_Id && <span className='text-destructive text-xs'>{errors.spccmE_Id.message}</span>}
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className='space-y-4'>
                    {/* Student Name */}
                    <div className='grid grid-cols-4 items-center gap-4'>
                        <Label className='text-right'>
                            Student Name <span className='text-destructive'>*</span>
                        </Label>
                        <div className='col-span-3'>
                            <Controller
                                name='amsT_Id'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(val) => field.onChange(Number(val))}
                                        value={field.value !== 0 ? field.value?.toString() : undefined}
                                        disabled={watchedAsmS_Id === 0 || getStudents.isPending}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={getStudents.isPending ? 'Loading Students...' : 'Select Student'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='0'>Select Student</SelectItem>
                                            {getUniqueListBy(
                                                getStudents.data?.data?.studentList ||
                                                    getStudents.data?.data?.studentList1 ||
                                                    getStudents.data?.data?.pudatareport ||
                                                    [],
                                                'amsT_Id'
                                            ).map((s: any) => {
                                                const id = s.amsT_Id || s.amst_id;
                                                return (
                                                    <SelectItem key={id} value={id.toString()}>
                                                        {s.studentname || s.amst_firstname}
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.amsT_Id && <span className='text-destructive text-xs'>{errors.amsT_Id.message}</span>}
                        </div>
                    </div>

                    {/* Date */}
                    <div className='grid grid-cols-4 items-center gap-4'>
                        <Label className='text-right'>
                            Date <span className='text-destructive'>*</span>
                        </Label>
                        <div className='col-span-3'>
                            <Controller
                                name='amsT_Date'
                                control={control}
                                render={({ field }) => (
                                    <DatePicker
                                        date={field.value instanceof Date ? field.value : new Date(field.value)}
                                        setDate={field.onChange}
                                    />
                                )}
                            />
                            {errors.amsT_Date && <span className='text-destructive text-xs'>{errors.amsT_Date.message}</span>}
                        </div>
                    </div>

                    {/* Age Till Date */}
                    <div className='grid grid-cols-4 items-center gap-4'>
                        <Label className='text-right'>Age Till Date</Label>
                        <div className='col-span-3'>
                            <Controller
                                name='spccsH_Age'
                                control={control}
                                render={({ field }) => <Input {...field} placeholder='Age' disabled className='bg-muted' />}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className='flex justify-center gap-4 border-t pt-4'>
                <Button type='submit' className='bg-primary' disabled={generateReport.isPending}>
                    {generateReport.isPending ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <FileText className='mr-2 h-4 w-4' />}
                    Report
                </Button>
                <Button type='button' variant='outline' onClick={handleCancel}>
                    <X className='mr-2 h-4 w-4' />
                    Cancel
                </Button>
                <Button type='button' className='bg-blue-600 hover:bg-blue-700' onClick={onPrint} disabled={!hasData}>
                    <Printer className='mr-2 h-4 w-4' />
                    Print
                </Button>
                <Button type='button' className='bg-green-600 hover:bg-green-700' onClick={onExcel} disabled={!hasData}>
                    <FileSpreadsheet className='mr-2 h-4 w-4' />
                    Excel
                </Button>
            </div>
        </form>
    );
}
