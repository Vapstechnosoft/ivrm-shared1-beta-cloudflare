'use client';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSportPointsAndRecordReport } from '@/hooks/sports/useSportPointsAndRecordReport';
import { type SportPointsAndRecordReportFormSchema, SportPointsAndRecordReportSchema } from '@/types/sports/reports/points-record-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

interface ReportFormProps {
    onReportGenerated: (data: any[]) => void;
}

export const ReportForm = ({ onReportGenerated }: ReportFormProps) => {
    const { loadData, classHouseEventMutation, sectionMutation, generateReport } = useSportPointsAndRecordReport();
    const [houseList, setHouseList] = useState<any[]>([]);
    const [programList, setProgramList] = useState<any[]>([]);
    const [eventList, setEventList] = useState<any[]>([]);
    const [divisionList, setDivisionList] = useState<any[]>([]);
    const [classList, setClassList] = useState<any[]>([]);
    const [sectionList, setSectionList] = useState<any[]>([]);

    const form = useForm<SportPointsAndRecordReportFormSchema>({
        resolver: zodResolver(SportPointsAndRecordReportSchema),
        defaultValues: {
            qualification_type: 'others'
        }
    });

    const {
        control,
        handleSubmit: hookHandleSubmit,
        formState: { errors }
    } = form;

    const watchYear = useWatch({ control: form.control, name: 'asmaY_Id' });
    const watchClass = useWatch({ control: form.control, name: 'asmcL_Id' });
    const watchType = useWatch({ control: form.control, name: 'qualification_type' });

    useEffect(() => {
        if (watchYear) {
            classHouseEventMutation.mutate(
                { asmaY_Id: watchYear },
                {
                    onSuccess: (data) => {
                        if (data.classList) setClassList(data.classList);
                        if (data.houseList && data.houseList.length > 0) setHouseList(data.houseList);
                        if (data.events && data.events.length > 0) setProgramList(data.events);
                        else if (data.eventList && data.eventList.length > 0) setProgramList(data.eventList);
                        if (data.eventList && data.eventList.length > 0) setEventList(data.eventList);
                    }
                }
            );
        } else {
            setClassList([]);
            setHouseList([]);
            setProgramList([]);
            setEventList([]);
            form.setValue('asmcL_Id', undefined);
            form.setValue('asmS_Id', undefined);
        }
    }, [watchYear]);

    useEffect(() => {
        if (watchYear && watchClass) {
            sectionMutation.mutate(
                { asmaY_Id: watchYear, asmcL_Id: watchClass },
                {
                    onSuccess: (data) => {
                        setSectionList(data.sectionList || []);
                    }
                }
            );
        } else {
            setSectionList([]);
            form.setValue('asmS_Id', undefined);
        }
    }, [watchYear, watchClass]);

    useEffect(() => {
        if (loadData.data) {
            if (loadData.data.houseList) setHouseList(loadData.data.houseList);
            if (loadData.data.events || loadData.data.eventList) {
                setProgramList(loadData.data.events || loadData.data.eventList || []);
            }
            if (loadData.data.eventList) setEventList(loadData.data.eventList);
            if (loadData.data.divisionList) setDivisionList(loadData.data.divisionList);
        }
    }, [loadData.data]);

    const handleSubmit = (data: SportPointsAndRecordReportFormSchema) => {
        generateReport.mutate(data, {
            onSuccess: (result) => {
                // @ts-ignore
                if (result && result.length > 0) {
                    onReportGenerated(result);
                    toast.success('Report generated successfully');
                } else {
                    onReportGenerated([]);
                    toast.info('No data found for the selected criteria');
                }
            },
            onError: (error) => {
                console.error(error);
                toast.error('Failed to generate report');
            }
        });
    };

    const handleCancel = () => {
        form.reset({
            qualification_type: 'others',
            asmaY_Id: undefined,
            asmcL_Id: undefined,
            asmS_Id: undefined,
            spccmH_Id: undefined,
            spccE_Id: undefined,
            spccmE_Id: undefined,
            spccmD_Id: undefined
        });
        onReportGenerated([]);
        window.location.reload();
    };

    return (
        <div className='space-y-4 rounded-lg border bg-white p-4 shadow-sm'>
            <h2 className='border-b pb-2 font-semibold text-lg'>Sport Points And Record Report</h2>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
                    {/* Radio Buttons for Qualification Type */}
                    <Controller
                        control={control}
                        name='qualification_type'
                        render={({ field }) => (
                            <div className='flex flex-col gap-2'>
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className='flex flex-col justify-center space-y-2 rounded-md bg-gray-50 p-4 sm:flex-row sm:space-x-6 sm:space-y-0'>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='eca' id='eca' />
                                        <label htmlFor='eca' className='cursor-pointer font-normal'>
                                            Extra Curricular Activities
                                        </label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='cca' id='cca' />
                                        <label htmlFor='cca' className='cursor-pointer font-normal'>
                                            Co Curricular Activities
                                        </label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='ih' id='ih' />
                                        <label htmlFor='ih' className='cursor-pointer font-normal'>
                                            Interhouse
                                        </label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='others' id='others' />
                                        <label htmlFor='others' className='cursor-pointer font-normal'>
                                            Others
                                        </label>
                                    </div>
                                </RadioGroup>
                                {errors.qualification_type && (
                                    <span className='font-medium text-destructive text-xs'>{errors.qualification_type.message}</span>
                                )}
                            </div>
                        )}
                    />

                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
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
                                        <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString() || ''}>
                                            <SelectTrigger className={errors.asmaY_Id ? 'border-destructive ring-destructive/20' : ''}>
                                                <SelectValue placeholder='Select Academic Year' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {loadData.data?.academicYear?.map((year, index) => (
                                                    <SelectItem key={`${year.asmaY_Id}-${index}`} value={year.asmaY_Id.toString()}>
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

                        {/* Class Name */}
                        <div className='flex flex-col gap-2'>
                            <Label className='font-semibold text-sm'>Class Name</Label>
                            <Controller
                                control={control}
                                name='asmcL_Id'
                                render={({ field }) => (
                                    <div className='flex flex-col gap-1'>
                                        <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString() || ''}>
                                            <SelectTrigger className={errors.asmcL_Id ? 'border-destructive ring-destructive/20' : ''}>
                                                <SelectValue placeholder='Select Class Name' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {classList.map((cls, index) => (
                                                    <SelectItem key={`${cls.asmcL_Id}-${index}`} value={String(cls.asmcL_Id)}>
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

                        {/* Section Name */}
                        <div className='flex flex-col gap-2'>
                            <Label className='font-semibold text-sm'>Section Name</Label>
                            <Controller
                                control={control}
                                name='asmS_Id'
                                render={({ field }) => (
                                    <div className='flex flex-col gap-1'>
                                        <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString() || ''}>
                                            <SelectTrigger className={errors.asmS_Id ? 'border-destructive ring-destructive/20' : ''}>
                                                <SelectValue placeholder='Select Section Name' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {sectionList.map((sec, index) => (
                                                    <SelectItem key={`${sec.asmS_Id}-${index}`} value={String(sec.asmS_Id)}>
                                                        {sec.asmC_SectionName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.asmS_Id && (
                                            <span className='font-medium text-destructive text-xs'>{errors.asmS_Id.message}</span>
                                        )}
                                    </div>
                                )}
                            />
                        </div>

                        {/* House Name */}
                        <div className='flex flex-col gap-2'>
                            <Label className="font-semibold text-sm after:ml-0.5 after:text-red-500 after:content-['*']">House Name</Label>
                            <Controller
                                control={control}
                                name='spccmH_Id'
                                render={({ field }) => (
                                    <div className='flex flex-col gap-1'>
                                        <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString() || ''}>
                                            <SelectTrigger className={errors.spccmH_Id ? 'border-destructive ring-destructive/20' : ''}>
                                                <SelectValue placeholder='Select House Name' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {houseList.map((house, index) => (
                                                    <SelectItem key={`${house.spccmH_Id}-${index}`} value={String(house.spccmH_Id)}>
                                                        {house.spccmH_HouseName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.spccmH_Id && (
                                            <span className='font-medium text-destructive text-xs'>{errors.spccmH_Id.message}</span>
                                        )}
                                    </div>
                                )}
                            />
                        </div>

                        {/* Program Master (Events) */}
                        <div className='flex flex-col gap-2'>
                            <Label className="font-semibold text-sm after:ml-0.5 after:text-red-500 after:content-['*']">
                                Program Master
                            </Label>
                            <Controller
                                control={control}
                                name='spccE_Id'
                                render={({ field }) => {
                                    // Deduplicate by ID and Name to ensure all unique choices are available
                                    const uniquePrograms = Array.from(
                                        new Map(
                                            programList.map((prog) => {
                                                const id = prog.spccE_Id || prog.spccpM_Id || prog.spccmE_Id || 0;
                                                const name =
                                                    prog.spccpM_Name || prog.spccE_EventName || prog.spccmE_EventName || 'Unnamed Program';
                                                return [`${id}::${name}`, prog];
                                            })
                                        ).values()
                                    ) as any[];

                                    // Find current selected value's composite key
                                    const selectedProg = uniquePrograms.find(
                                        (p) => String(p.spccE_Id || p.spccpM_Id || p.spccmE_Id || 0) === String(field.value)
                                    );
                                    const selectedName = selectedProg
                                        ? selectedProg.spccpM_Name ||
                                          selectedProg.spccE_EventName ||
                                          selectedProg.spccmE_EventName ||
                                          'Unnamed Program'
                                        : '';
                                    const currentVal = field.value ? `${field.value}::${selectedName}` : '';

                                    return (
                                        <div className='flex flex-col gap-1'>
                                            <Select
                                                onValueChange={(val) => {
                                                    const [id] = val.split('::');
                                                    field.onChange(Number(id));
                                                }}
                                                value={currentVal}>
                                                <SelectTrigger className={errors.spccE_Id ? 'border-destructive ring-destructive/20' : ''}>
                                                    <SelectValue placeholder='Select Program Name' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {uniquePrograms.map((prog, index) => {
                                                        const id = prog.spccE_Id || prog.spccpM_Id || prog.spccmE_Id || index;
                                                        const name =
                                                            prog.spccpM_Name ||
                                                            prog.spccE_EventName ||
                                                            prog.spccmE_EventName ||
                                                            'Unnamed Program';
                                                        const idValue = `${id}::${name}`;
                                                        return (
                                                            <SelectItem key={`${idValue}-${index}`} value={idValue}>
                                                                {name}
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>
                                            {errors.spccE_Id && (
                                                <span className='font-medium text-destructive text-xs'>{errors.spccE_Id.message}</span>
                                            )}
                                        </div>
                                    );
                                }}
                            />
                        </div>

                        {/* Event Name */}
                        <div className='flex flex-col gap-2'>
                            <Label className="font-semibold text-sm after:ml-0.5 after:text-red-500 after:content-['*']">Event Name</Label>
                            <Controller
                                control={control}
                                name='spccmE_Id'
                                render={({ field }) => (
                                    <div className='flex flex-col gap-1'>
                                        <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString() || ''}>
                                            <SelectTrigger className={errors.spccmE_Id ? 'border-destructive ring-destructive/20' : ''}>
                                                <SelectValue placeholder='Select Event Name' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {eventList.map((evt, index) => {
                                                    const idValue = String(evt.spccmE_Id || index);
                                                    return (
                                                        <SelectItem key={`${idValue}-${index}`} value={idValue}>
                                                            {evt.spccmE_EventName}
                                                        </SelectItem>
                                                    );
                                                })}
                                            </SelectContent>
                                        </Select>
                                        {errors.spccmE_Id && (
                                            <span className='font-medium text-destructive text-xs'>{errors.spccmE_Id.message}</span>
                                        )}
                                    </div>
                                )}
                            />
                        </div>

                        {/* Division Name */}
                        <div className='flex flex-col gap-2'>
                            <Label className="font-semibold text-sm after:ml-0.5 after:text-red-500 after:content-['*']">
                                Division Name
                            </Label>
                            <Controller
                                control={control}
                                name='spccmD_Id'
                                render={({ field }) => (
                                    <div className='flex flex-col gap-1'>
                                        <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString() || ''}>
                                            <SelectTrigger className={errors.spccmD_Id ? 'border-destructive ring-destructive/20' : ''}>
                                                <SelectValue placeholder='Select Division Name' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {divisionList.map((div, index) => (
                                                    <SelectItem key={`${div.spccmD_Id}-${index}`} value={String(div.spccmD_Id)}>
                                                        {div.spccmD_DivisionName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.spccmD_Id && (
                                            <span className='font-medium text-destructive text-xs'>{errors.spccmD_Id.message}</span>
                                        )}
                                    </div>
                                )}
                            />
                        </div>
                    </div>

                    <div className='flex justify-center space-x-4 pt-4'>
                        <Button type='submit' disabled={generateReport.isPending} className='bg-blue-600 hover:bg-blue-700'>
                            {generateReport.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                            Report
                        </Button>
                        <Button type='button' variant='destructive' onClick={handleCancel} className='bg-red-600 hover:bg-red-700'>
                            Cancel
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
};
