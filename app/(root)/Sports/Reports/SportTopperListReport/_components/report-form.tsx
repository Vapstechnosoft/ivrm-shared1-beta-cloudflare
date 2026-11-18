'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSportTopperListReport } from '@/hooks/sports/useSportTopperListReport';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileText, Loader2, RefreshCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { type SportTopperListFormData, sportTopperListSchema } from '../schema';
import type { IClass, IEvent, IHouse, ISection, ITopperListReportData } from '../types';

interface ReportFormProps {
    onReportGenerated: (data: ITopperListReportData[] | null) => void;
    onReset: () => void;
}

export default function ReportForm({ onReportGenerated, onReset }: ReportFormProps) {
    const { initialData, classHouseEventMutation, sectionMutation, reportMutation } = useSportTopperListReport();

    const [classList, setClassList] = useState<IClass[]>([]);
    const [houseList, setHouseList] = useState<IHouse[]>([]);
    const [eventList, setEventList] = useState<IEvent[]>([]);
    const [sectionList, setSectionList] = useState<ISection[]>([]);
    // Sports list comes from initialData

    const form = useForm<SportTopperListFormData>({
        resolver: zodResolver(sportTopperListSchema),
        defaultValues: {
            type: 'House',
            asmaY_Id: undefined,
            spccmH_Id: [],
            asmcL_Id: undefined,
            asmS_Id: [],
            spccmE_Id: [],
            spccmscC_Id: []
        }
    });

    const {
        control,
        handleSubmit,
        formState: { errors }
    } = form;

    const watchedType = useWatch({ control: form.control, name: 'type' });
    const watchedYear = useWatch({ control: form.control, name: 'asmaY_Id' });
    const watchedClass = useWatch({ control: form.control, name: 'asmcL_Id' });

    // Reset fields when Report Type changes
    useEffect(() => {
        form.setValue('asmcL_Id', undefined);
        form.setValue('asmS_Id', []);
        // We keep/reset others?
        // Logic: specific fields for CS should be cleared.
        // House, Event, Sports selectors are common/available in both (House visible in both based on previous analysis).
    }, [watchedType, form]);

    // Fetch Classes, Houses, Events when Year changes
    useEffect(() => {
        if (watchedYear) {
            classHouseEventMutation.mutate(
                { asmaY_Id: watchedYear },
                {
                    onSuccess: (data) => {
                        setClassList(data.classList || []);
                        setHouseList(data.houseList || []);
                        setEventList(data.eventList || []);
                    }
                }
            );
        } else {
            setClassList([]);
            setHouseList([]);
            setEventList([]);
        }
    }, [watchedYear]);

    // Fetch Sections when Class changes (and Type is CS)
    useEffect(() => {
        if (watchedYear && watchedClass && watchedType === 'CS') {
            sectionMutation.mutate(
                { asmaY_Id: watchedYear, asmcL_Id: watchedClass },
                {
                    onSuccess: (data) => {
                        setSectionList(data.sectionList || []);
                    }
                }
            );
        } else {
            setSectionList([]);
        }
    }, [watchedYear, watchedClass, watchedType]);

    function onSubmit(data: SportTopperListFormData) {
        const payload: any = {
            type: data.type,
            asmaY_Id: data.asmaY_Id,
            selectedhouselist: data.spccmH_Id?.map((id) => ({ spccmH_Id: id })) || [],
            selectedeventlist: data.spccmE_Id?.map((id) => ({ spccmE_Id: id })) || [],
            selectedsportslist: data.spccmscC_Id?.map((id) => ({ spccmscC_Id: id })) || []
        };

        if (data.type === 'House') {
            payload.asmcL_Id = 0;
            // No selectedSectionlist for House type
        } else {
            payload.asmcL_Id = data.asmcL_Id;
            payload.selectedSectionlist = data.asmS_Id?.map((id) => ({ asmS_Id: id })) || [];
        }

        reportMutation.mutate(payload, {
            onSuccess: (responseData) => {
                onReportGenerated(responseData);
                if (responseData && responseData.length > 0) {
                    toast.success('Report generated successfully');
                } else {
                    toast.info('No records found');
                }
            },
            onError: (error) => {
                console.error(error);
                toast.error('Failed to generate report');
            }
        });
    }

    const handleReset = () => {
        form.reset();
        setClassList([]);
        setHouseList([]);
        setEventList([]);
        setSectionList([]);
        onReset();
        window.location.reload();
    };

    return (
        <Card>
            <CardHeader className='border-b bg-primary/5 py-4'>
                <CardTitle className='flex items-center gap-2 font-bold text-lg'>
                    <FileText className='h-5 w-5 text-primary' />
                    Sport Topper List Report Filter
                </CardTitle>
            </CardHeader>
            <CardContent className='pt-6'>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                        {/* Report Type Radio */}
                        <div className='space-y-3'>
                            <Label>Report Type</Label>
                            <Controller
                                control={control}
                                name='type'
                                render={({ field }) => (
                                    <div className='flex flex-col gap-2'>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className='flex flex-col gap-4 sm:flex-row'>
                                            <div className='flex w-full items-center space-x-2 rounded-md border p-3 transition-colors hover:bg-muted/50 sm:w-auto'>
                                                <RadioGroupItem value='House' id='r1' />
                                                <label htmlFor='r1' className='cursor-pointer font-medium'>
                                                    By House
                                                </label>
                                            </div>
                                            <div className='flex w-full items-center space-x-2 rounded-md border p-3 transition-colors hover:bg-muted/50 sm:w-auto'>
                                                <RadioGroupItem value='CS' id='r2' />
                                                <label htmlFor='r2' className='cursor-pointer font-medium'>
                                                    By Class/Section
                                                </label>
                                            </div>
                                        </RadioGroup>
                                        {errors.type && <span className='font-medium text-destructive text-xs'>{errors.type.message}</span>}
                                    </div>
                                )}
                            />
                        </div>

                        <div className='grid grid-cols-1 items-end gap-6 md:grid-cols-2 lg:grid-cols-3'>
                            {/* Academic Year */}
                            <div className='flex flex-col gap-2'>
                                <Label className="font-semibold text-sm after:ml-0.5 after:text-red-500 after:content-['*']">
                                    Academic Year
                                </Label>
                                <Controller
                                    control={control}
                                    name='asmaY_Id'
                                    render={({ field }) => (
                                        <div className='flex flex-col gap-1'>
                                            <Select
                                                onValueChange={(value) => field.onChange(Number(value))}
                                                value={field.value?.toString()}
                                                disabled={initialData.isLoading}>
                                                <SelectTrigger className={errors.asmaY_Id ? 'border-destructive ring-destructive/20' : ''}>
                                                    <SelectValue placeholder='Select Year' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {initialData.data?.yearlist?.map((year) => (
                                                        <SelectItem key={year.asmaY_Id} value={year.asmaY_Id.toString()}>
                                                            {year.asmaY_Year}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.asmaY_Id && (
                                                <span className='font-medium text-destructive text-xs'>{errors.asmaY_Id.message}</span>
                                            )}
                                        </div>
                                    )}
                                />
                            </div>

                            {/* Class Selection (Only if Type == CS) */}
                            {watchedType === 'CS' && (
                                <div className='flex flex-col gap-2'>
                                    <Label className="font-semibold text-sm after:ml-0.5 after:text-red-500 after:content-['*']">
                                        Class
                                    </Label>
                                    <Controller
                                        control={control}
                                        name='asmcL_Id'
                                        render={({ field }) => (
                                            <div className='flex flex-col gap-1'>
                                                <Select
                                                    onValueChange={(value) => field.onChange(Number(value))}
                                                    value={field.value?.toString()}
                                                    disabled={!watchedYear}>
                                                    <SelectTrigger
                                                        className={errors.asmcL_Id ? 'border-destructive ring-destructive/20' : ''}>
                                                        <SelectValue placeholder='Select Class' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {classList.map((cls) => (
                                                            <SelectItem key={cls.asmcL_Id} value={cls.asmcL_Id.toString()}>
                                                                {cls.asmcL_ClassName}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.asmcL_Id && (
                                                    <span className='font-medium text-destructive text-xs'>{errors.asmcL_Id.message}</span>
                                                )}
                                            </div>
                                        )}
                                    />
                                </div>
                            )}

                            {/* Section Selection (Only if Type == CS) */}
                            {watchedType === 'CS' && (
                                <div className='flex flex-col gap-2'>
                                    <Label className="font-semibold text-sm after:ml-0.5 after:text-red-500 after:content-['*']">
                                        Section
                                    </Label>
                                    <Controller
                                        control={control}
                                        name='asmS_Id'
                                        render={({ field }) => (
                                            <div className='flex flex-col gap-1'>
                                                <MultiSelect
                                                    options={sectionList.map((s) => ({
                                                        value: s.asmS_Id.toString(),
                                                        label: s.asmC_SectionName
                                                    }))}
                                                    onValueChange={(vals) => field.onChange(vals.map(Number))}
                                                    defaultValue={field.value?.map(String) || []}
                                                    placeholder='Select Sections'
                                                    disabled={!watchedClass || sectionMutation.isPending}
                                                    className={errors.asmS_Id ? 'border-destructive ring-destructive/20' : ''}
                                                />
                                                {errors.asmS_Id && (
                                                    <span className='font-medium text-destructive text-xs'>{errors.asmS_Id.message}</span>
                                                )}
                                            </div>
                                        )}
                                    />
                                </div>
                            )}

                            {/* House Selection (Always visible per analysis) */}
                            <div className='flex flex-col gap-2'>
                                <Label className="font-semibold text-sm after:ml-0.5 after:text-red-500 after:content-['*']">House</Label>
                                <Controller
                                    control={control}
                                    name='spccmH_Id'
                                    render={({ field }) => (
                                        <div className='flex flex-col gap-1'>
                                            <MultiSelect
                                                options={houseList.map((h) => ({
                                                    value: h.spccmH_Id.toString(),
                                                    label: h.spccmH_HouseName
                                                }))}
                                                onValueChange={(vals) => field.onChange(vals.map(Number))}
                                                defaultValue={field.value?.map(String) || []}
                                                placeholder='Select Houses'
                                                disabled={!watchedYear || classHouseEventMutation.isPending}
                                                className={errors.spccmH_Id ? 'border-destructive ring-destructive/20' : ''}
                                            />
                                            {errors.spccmH_Id && (
                                                <span className='font-medium text-destructive text-xs'>{errors.spccmH_Id.message}</span>
                                            )}
                                        </div>
                                    )}
                                />
                            </div>

                            {/* Event Selection */}
                            <div className='flex flex-col gap-2'>
                                <Label className="font-semibold text-sm after:ml-0.5 after:text-red-500 after:content-['*']">Event</Label>
                                <Controller
                                    control={control}
                                    name='spccmE_Id'
                                    render={({ field }) => (
                                        <div className='flex flex-col gap-1'>
                                            <MultiSelect
                                                options={eventList.map((e) => ({
                                                    value: e.spccmE_Id.toString(),
                                                    label: e.spccmE_EventName
                                                }))}
                                                onValueChange={(vals) => field.onChange(vals.map(Number))}
                                                defaultValue={field.value?.map(String) || []}
                                                placeholder='Select Events'
                                                disabled={!watchedYear || classHouseEventMutation.isPending}
                                                className={errors.spccmE_Id ? 'border-destructive ring-destructive/20' : ''}
                                            />
                                            {errors.spccmE_Id && (
                                                <span className='font-medium text-destructive text-xs'>{errors.spccmE_Id.message}</span>
                                            )}
                                        </div>
                                    )}
                                />
                            </div>

                            {/* Sports Selection */}
                            <div className='flex flex-col gap-2'>
                                <Label className='font-semibold text-sm'>Sports</Label>
                                <Controller
                                    control={control}
                                    name='spccmscC_Id'
                                    render={({ field }) => (
                                        <div className='flex flex-col gap-1'>
                                            <MultiSelect
                                                options={
                                                    initialData.data?.sportslist?.map((s) => ({
                                                        value: s.spccmscC_Id.toString(),
                                                        label: s.spccmscC_SportsCCName
                                                    })) || []
                                                }
                                                onValueChange={(vals) => field.onChange(vals.map(Number))}
                                                defaultValue={field.value?.map(String) || []}
                                                placeholder='Select Sports'
                                                disabled={initialData.isLoading}
                                                className={errors.spccmscC_Id ? 'border-destructive ring-destructive/20' : ''}
                                            />
                                            {errors.spccmscC_Id && (
                                                <span className='font-medium text-destructive text-xs'>{errors.spccmscC_Id.message}</span>
                                            )}
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className='flex justify-center gap-4 pt-4'>
                            <Button
                                type='submit'
                                className='min-w-[150px] font-bold shadow-md transition-all hover:shadow-lg'
                                disabled={reportMutation.isPending}>
                                {reportMutation.isPending ? (
                                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                ) : (
                                    <FileText className='mr-2 h-4 w-4' />
                                )}
                                Report
                            </Button>
                            <Button type='button' variant='outline' onClick={handleReset} className='min-w-[150px] border-2 hover:bg-muted'>
                                <RefreshCcw className='mr-2 h-4 w-4' />
                                Cancel
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
