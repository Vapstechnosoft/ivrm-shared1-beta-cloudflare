'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSRKVSSportsReport } from '@/hooks/sports/useSRKVSSportsReport';
import {
    type ISRKVSCategory,
    type ISRKVSCompetitionLevel,
    type ISRKVSMainEvent,
    type ISRKVSMasterEvent,
    type ISRKVSReportData,
    type ISRKVSSubEvent,
    type ISRKVSSubSubEvent,
    type ISRKVSYear,
    type SRKVSSportsReportFormSchema,
    SRKVSSportsReportSchema
} from '@/types/sports/reports/srkvs-sports-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

interface ReportFormProps {
    onReportGenerated: (data: ISRKVSReportData[]) => void;
    onTypeChange: (type: any) => void;
}

// Helper to normalize flat item field names (API returns camelCase)
const normalizeItem = (item: any): any => {
    // If already using old-style PascalCase DB fields, return as-is
    if (item.SPCCMCC_CompitionCategory || item.AMST_FirstName) return item;
    // Map camelCase API response fields to the expected property names
    return {
        ...item,
        SPCCMCC_CompitionCategory: item.categoryName,
        SPCCMSCCG_SportsCCGroupName: item.groupName,
        AMAY_RollNo: item.rollNo,
        AMST_FirstName: item.studentName,
        AMST_AdmNo: item.admNo,
        ASMCL_ClassName: item.className,
        ASMC_SectionName: item.sectionName,
        SPCCMUOM_UOMName: item.uomName,
        ASMAY_Year: item.academicYear,
        SPCCESTR_Value: item.points,
        SPCCESTR_Rank: item.rank
    };
};

// Helper to group data
const groupData = (flatData: any[], type: string): ISRKVSReportData[] => {
    if (!flatData || flatData.length === 0) return [];

    // Check if already grouped (has RecordDetails)
    if (flatData[0].RecordDetails) return flatData as ISRKVSReportData[];

    const normalized = flatData.map(normalizeItem);
    const groups: { [key: string]: ISRKVSReportData } = {};

    normalized.forEach((item: any) => {
        let key = '';
        if (
            type === 'Record' ||
            type === 'Consolidated' ||
            type === 'Indoor' ||
            type === 'Outdoor' ||
            type === 'Team' ||
            type === 'Externals' ||
            type === 'Selection'
        ) {
            key = item.SPCCMCC_CompitionCategory || 'Unknown';
        } else if (type === 'Start' || type === 'Finish') {
            key = (item.SPCCMCC_CompitionCategory || '') + '_' + (item.SPCCMSCCG_SportsCCGroupName || '');
        } else {
            key = item.SPCCMCC_CompitionCategory || 'Default';
        }

        if (!groups[key]) {
            groups[key] = {
                SPCCMCC_CompitionCategory: item.SPCCMCC_CompitionCategory,
                SPCCMSCCG_SportsCCGroupName: item.SPCCMSCCG_SportsCCGroupName,
                RecordDetails: []
            };
        }
        groups[key].RecordDetails.push(item);
    });

    return Object.values(groups);
};

export const ReportForm = ({ onReportGenerated, onTypeChange }: ReportFormProps) => {
    const { loadData, getClass, getSportsName, getUomName, generateReport } = useSRKVSSportsReport();
    const { data: initialData, isLoading: isInitialLoading } = loadData;

    const [academicYears, setAcademicYears] = useState<ISRKVSYear[]>([]);
    const [masterEvents, setMasterEvents] = useState<ISRKVSMasterEvent[]>([]);
    const [competitionLevels, setCompetitionLevels] = useState<ISRKVSCompetitionLevel[]>([]);
    const [categories, setCategories] = useState<ISRKVSCategory[]>([]);
    const [mainEvents, setMainEvents] = useState<ISRKVSMainEvent[]>([]);
    const [subEvents, setSubEvents] = useState<ISRKVSSubEvent[]>([]);
    const [subSubEvents, setSubSubEvents] = useState<ISRKVSSubSubEvent[]>([]);

    const form = useForm<SRKVSSportsReportFormSchema>({
        resolver: zodResolver(SRKVSSportsReportSchema),
        defaultValues: {
            Type: undefined as any,
            ASMAY_Id: undefined,
            SPCCME_Id: undefined,
            selectedCompetitionLevels: [],
            selectedCategories: [],
            selectedSubSubEvents: []
        }
    });

    const {
        control,
        handleSubmit,
        formState: { errors }
    } = form;

    const watchedType = useWatch({ control: form.control, name: 'Type' });
    const watchedYear = useWatch({ control: form.control, name: 'ASMAY_Id' });
    const watchedMainEvent = useWatch({ control: form.control, name: 'spccmsccG_Id' }); // Group ID
    const watchedSubEvent = useWatch({ control: form.control, name: 'spccmscC_Id' });

    const isMultiSelectType = watchedType === 'Record' || watchedType === 'Start';
    const isMultiLevel = watchedType === 'Record' || watchedType === 'Start';
    const isMultiCategory = ['Record', 'Start', 'Consolidated', 'Indoor'].includes(watchedType);

    // Initial Data Load
    useEffect(() => {
        if (initialData) {
            setAcademicYears(Array.isArray(initialData.yearlist) ? initialData.yearlist : []);
        }
    }, [initialData]);

    // Year Change -> Get Class (and other dropdowns)
    useEffect(() => {
        if (watchedYear) {
            getClass.mutate(
                { asmaY_Id: watchedYear },
                {
                    onSuccess: (data) => {
                        setCategories(Array.isArray(data?.categoryList) ? data.categoryList : []);
                        setCompetitionLevels(Array.isArray(data?.competetionLevel) ? data.competetionLevel : []);
                        setMasterEvents(Array.isArray(data?.masterEvent) ? data.masterEvent : []);
                        setMainEvents(Array.isArray(data?.getMasterEvent) ? data.getMasterEvent : []);
                    }
                }
            );
        }
    }, [watchedYear]);

    // Main Event Change -> Get Sub Events (Sports Name)
    useEffect(() => {
        if (watchedYear && watchedMainEvent) {
            if (['Start', 'Finish', 'Indoor', 'Outdoor', 'Team', 'Externals'].includes(watchedType)) {
                getSportsName.mutate(
                    { asmaY_Id: watchedYear, spccmsccG_Id: watchedMainEvent },
                    {
                        onSuccess: (data) => {
                            setSubEvents(Array.isArray(data?.sportsCCList) ? data.sportsCCList : []);
                        }
                    }
                );
            }
        }
    }, [watchedYear, watchedMainEvent, watchedType]);

    // Sub Event Change -> Get Sub Sub Events (UOM Name)
    useEffect(() => {
        if (watchedYear && watchedSubEvent) {
            if (['Start', 'Finish', 'Indoor', 'Outdoor', 'Team', 'Externals'].includes(watchedType)) {
                getUomName.mutate(
                    { asmaY_Id: watchedYear, spccmscC_Id: watchedSubEvent },
                    {
                        onSuccess: (data) => {
                            setSubSubEvents(Array.isArray(data?.getsubsubevent) ? data.getsubsubevent : []);
                        }
                    }
                );
            }
        }
    }, [watchedYear, watchedSubEvent, watchedType]);

    // Propagate type change up
    useEffect(() => {
        onTypeChange(watchedType);
        // Reset dependent fields logic can be added here if reset is needed on type change
    }, [watchedType, onTypeChange]);

    const onSubmit = (data: SRKVSSportsReportFormSchema) => {
        const payload: any = {
            ASMAY_Id: data.ASMAY_Id,
            Type: data.Type,
            SPCCME_Id: data.SPCCME_Id,
            Sportleveltemps: [{ SPCCME_Id: data.SPCCME_Id }]
        };

        // Handle Category Lists
        if (isMultiCategory) {
            payload.Categorylists = data.selectedCategories?.map((c) => ({ SPCCMCC_Id: c.spccmcC_Id })) || [];
        } else if (data.spccmcC_Id) {
            payload.Categorylists = [{ SPCCMCC_Id: data.spccmcC_Id }];
        } else {
            payload.Categorylists = [];
        }

        // Handle Competition Levels
        if (isMultiLevel) {
            payload.CompetetionLevels = data.selectedCompetitionLevels?.map((l) => ({ SPCCMCL_Id: l.spccmcL_Id })) || [];
        } else if (data.spccmcL_Id) {
            payload.CompetetionLevels = [{ SPCCMCL_Id: data.spccmcL_Id }];
        } else {
            payload.CompetetionLevels = [];
        }

        // Handle Sub Event Lists
        const isMultiSubSub = ['Indoor', 'Outdoor', 'Externals'].includes(data.Type);
        const isSingleSubSub = ['Start', 'Team', 'Finish'].includes(data.Type);

        if (isMultiSubSub) {
            payload.SubEventLists = data.selectedSubSubEvents?.map((s) => ({ SPCCMSCCG_Id: s.spccmsccG_Id })) || [];
        } else if (isSingleSubSub && data.spccmsccG_Idsub) {
            payload.SubEventLists = [{ SPCCMSCCG_Id: data.spccmsccG_Idsub }];
        }

        generateReport.mutate(payload, {
            onSuccess: (responseData) => {
                // Pick the first non-empty array from the response
                const rawData =
                    (responseData?.getReport?.length ? responseData.getReport : null) ||
                    (responseData?.gettsreport?.length ? responseData.gettsreport : null) ||
                    (responseData?.getReportfinish?.length ? responseData.getReportfinish : null) ||
                    (Array.isArray(responseData) ? responseData : []);
                const groupedData = groupData(rawData, data.Type);
                onReportGenerated(groupedData);
                if (rawData && rawData.length > 0) {
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
    };

    if (isInitialLoading) {
        return (
            <div className='flex justify-center p-4'>
                <Loader2 className='h-6 w-6 animate-spin' />
            </div>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 rounded-md border bg-white p-4 shadow-sm'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    {/* Academic Year */}
                    <div className='flex flex-col gap-2'>
                        <Label className="font-semibold text-sm after:ml-0.5 after:text-red-500 after:content-['*']">Academic Year</Label>
                        <Controller
                            control={control}
                            name='ASMAY_Id'
                            render={({ field }) => (
                                <div className='flex flex-col gap-1'>
                                    <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                        <SelectTrigger className={errors.ASMAY_Id ? 'border-destructive ring-destructive/20' : ''}>
                                            <SelectValue placeholder='Select Academic Year' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {academicYears.map((item) => (
                                                <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                    {item.asmaY_Year}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.ASMAY_Id && (
                                        <span className='font-medium text-destructive text-xs'>{errors.ASMAY_Id.message}</span>
                                    )}
                                </div>
                            )}
                        />
                    </div>

                    {/* Event */}
                    <div className='flex flex-col gap-2'>
                        <Label className="font-semibold text-sm after:ml-0.5 after:text-red-500 after:content-['*']">Event</Label>
                        <Controller
                            control={control}
                            name='SPCCME_Id'
                            render={({ field }) => (
                                <div className='flex flex-col gap-1'>
                                    <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                        <SelectTrigger className={errors.SPCCME_Id ? 'border-destructive ring-destructive/20' : ''}>
                                            <SelectValue placeholder='Select Event' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {masterEvents.map((item) => (
                                                <SelectItem key={item.spccmE_Id} value={item.spccmE_Id.toString()}>
                                                    {item.spccmE_EventName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.SPCCME_Id && (
                                        <span className='font-medium text-destructive text-xs'>{errors.SPCCME_Id.message}</span>
                                    )}
                                </div>
                            )}
                        />
                    </div>

                    <div className='flex flex-col gap-2'>
                        <Label className="font-semibold text-sm after:ml-0.5 after:text-red-500 after:content-['*']">Result</Label>
                        <Controller
                            control={control}
                            name='Type'
                            render={({ field }) => (
                                <div className='flex flex-col gap-1'>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger className={errors.Type ? 'border-destructive ring-destructive/20' : ''}>
                                            <SelectValue placeholder='Select Result' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='Record'>Records</SelectItem>
                                            <SelectItem value='Start'>Start List</SelectItem>
                                            <SelectItem value='Finish'>Finish List</SelectItem>
                                            <SelectItem value='Consolidated'>Consolidated</SelectItem>
                                            <SelectItem value='Indoor'>Indoor</SelectItem>
                                            <SelectItem value='Outdoor'>Outdoor</SelectItem>
                                            <SelectItem value='Team'>Team</SelectItem>
                                            <SelectItem value='Externals'>Externals</SelectItem>
                                            <SelectItem value='Selection'>Selection</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.Type && <span className='font-medium text-destructive text-xs'>{errors.Type.message}</span>}
                                </div>
                            )}
                        />
                    </div>

                    {/* Competition Level */}
                    {watchedType && (
                        <>
                            {isMultiLevel ? (
                                <div className='flex flex-col gap-2'>
                                    <Label className="font-semibold text-sm after:ml-0.5 after:text-red-500 after:content-['*']">
                                        Competition Level
                                    </Label>
                                    <Controller
                                        control={control}
                                        name='selectedCompetitionLevels'
                                        render={({ field }) => (
                                            <div className='flex flex-col gap-1'>
                                                <ScrollArea
                                                    className={`h-[150px] w-full rounded-md border p-2 ${errors.selectedCompetitionLevels ? 'border-destructive ring-destructive/20' : ''}`}>
                                                    {competitionLevels.map((item) => (
                                                        <div
                                                            key={item.spccmcL_Id}
                                                            className='mb-2 flex flex-row items-start space-x-3 space-y-0'>
                                                            <Checkbox
                                                                checked={field.value?.some((val) => val.spccmcL_Id === item.spccmcL_Id)}
                                                                onCheckedChange={(checked) => {
                                                                    const current = field.value || [];
                                                                    return checked
                                                                        ? field.onChange([...current, { spccmcL_Id: item.spccmcL_Id }])
                                                                        : field.onChange(
                                                                              current.filter((val) => val.spccmcL_Id !== item.spccmcL_Id)
                                                                          );
                                                                }}
                                                            />
                                                            <label className='font-normal text-sm'>{item.spccmcL_CompitionLevel}</label>
                                                        </div>
                                                    ))}
                                                </ScrollArea>
                                                {errors.selectedCompetitionLevels && (
                                                    <span className='font-medium text-destructive text-xs'>
                                                        {errors.selectedCompetitionLevels.message}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    />
                                </div>
                            ) : (
                                <div className='flex flex-col gap-2'>
                                    <Label className="font-semibold text-sm after:ml-0.5 after:text-red-500 after:content-['*']">
                                        Competition Level
                                    </Label>
                                    <Controller
                                        control={control}
                                        name='spccmcL_Id'
                                        render={({ field }) => (
                                            <div className='flex flex-col gap-1'>
                                                <Select
                                                    onValueChange={(val) => field.onChange(Number(val))}
                                                    value={field.value?.toString()}>
                                                    <SelectTrigger
                                                        className={errors.spccmcL_Id ? 'border-destructive ring-destructive/20' : ''}>
                                                        <SelectValue placeholder='Select Competition Level' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {competitionLevels.map((item) => (
                                                            <SelectItem key={item.spccmcL_Id} value={item.spccmcL_Id.toString()}>
                                                                {item.spccmcL_CompitionLevel}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.spccmcL_Id && (
                                                    <span className='font-medium text-destructive text-xs'>
                                                        {errors.spccmcL_Id.message}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    />
                                </div>
                            )}
                        </>
                    )}

                    {/* From Date */}
                    <div className='flex flex-col gap-2'>
                        <Label className="font-semibold text-sm after:ml-0.5 after:text-red-500 after:content-['*']">Date</Label>
                        <Controller
                            control={control}
                            name='FromDate'
                            render={({ field }) => (
                                <div className='flex flex-col gap-1'>
                                    <DatePicker
                                        date={field.value}
                                        setDate={field.onChange}
                                        placeholder='Select Date'
                                        className={errors.FromDate ? 'border-destructive ring-destructive/20' : ''}
                                    />
                                    {errors.FromDate && (
                                        <span className='font-medium text-destructive text-xs'>{errors.FromDate.message}</span>
                                    )}
                                </div>
                            )}
                        />
                    </div>

                    {/* Competition Category */}
                    {watchedType && (
                        <>
                            {isMultiCategory ? (
                                <div className='flex flex-col gap-2'>
                                    <Label className="font-semibold text-sm after:ml-0.5 after:text-red-500 after:content-['*']">
                                        Competition Category
                                    </Label>
                                    <Controller
                                        control={control}
                                        name='selectedCategories'
                                        render={({ field }) => (
                                            <div className='flex flex-col gap-1'>
                                                <ScrollArea
                                                    className={`h-[150px] w-full rounded-md border p-2 ${errors.selectedCategories ? 'border-destructive ring-destructive/20' : ''}`}>
                                                    {categories.map((item) => (
                                                        <div
                                                            key={item.spccmcC_Id}
                                                            className='mb-2 flex flex-row items-start space-x-3 space-y-0'>
                                                            <Checkbox
                                                                checked={field.value?.some((val) => val.spccmcC_Id === item.spccmcC_Id)}
                                                                onCheckedChange={(checked) => {
                                                                    const current = field.value || [];
                                                                    return checked
                                                                        ? field.onChange([...current, { spccmcC_Id: item.spccmcC_Id }])
                                                                        : field.onChange(
                                                                              current.filter((val) => val.spccmcC_Id !== item.spccmcC_Id)
                                                                          );
                                                                }}
                                                            />
                                                            <label className='font-normal text-sm'>{item.spccmcC_CompitionCategory}</label>
                                                        </div>
                                                    ))}
                                                </ScrollArea>
                                                {errors.selectedCategories && (
                                                    <span className='font-medium text-destructive text-xs'>
                                                        {errors.selectedCategories.message}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    />
                                </div>
                            ) : (
                                <div className='flex flex-col gap-2'>
                                    <Label className="font-semibold text-sm after:ml-0.5 after:text-red-500 after:content-['*']">
                                        Competition Category
                                    </Label>
                                    <Controller
                                        control={control}
                                        name='spccmcC_Id'
                                        render={({ field }) => (
                                            <div className='flex flex-col gap-1'>
                                                <Select
                                                    onValueChange={(val) => field.onChange(Number(val))}
                                                    value={field.value?.toString()}>
                                                    <SelectTrigger
                                                        className={errors.spccmcC_Id ? 'border-destructive ring-destructive/20' : ''}>
                                                        <SelectValue placeholder='Select Category' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {categories.map((item) => (
                                                            <SelectItem key={item.spccmcC_Id} value={item.spccmcC_Id.toString()}>
                                                                {item.spccmcC_CompitionCategory}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.spccmcC_Id && (
                                                    <span className='font-medium text-destructive text-xs'>
                                                        {errors.spccmcC_Id.message}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    />
                                </div>
                            )}
                        </>
                    )}

                    {/* Meet Year */}
                    <div className='flex flex-col gap-2'>
                        <Label className='font-semibold text-sm'>Meet Year</Label>
                        <Controller
                            control={control}
                            name='Meet_Year'
                            render={({ field }) => (
                                <div className='flex flex-col gap-1'>
                                    <Input
                                        placeholder='Enter Meet Year'
                                        {...field}
                                        className={errors.Meet_Year ? 'border-destructive ring-destructive/20' : ''}
                                    />
                                    {errors.Meet_Year && (
                                        <span className='font-medium text-destructive text-xs'>{errors.Meet_Year.message}</span>
                                    )}
                                </div>
                            )}
                        />
                    </div>

                    {/* Conditional Event Fields */}
                    {['Start', 'Finish', 'Indoor', 'Outdoor', 'Team', 'Externals'].includes(watchedType) && (
                        <>
                            {/* Main Event */}
                            <div className='flex flex-col gap-2'>
                                <Label className="font-semibold text-sm after:ml-0.5 after:text-red-500 after:content-['*']">
                                    Main Event
                                </Label>
                                <Controller
                                    control={control}
                                    name='spccmsccG_Id'
                                    render={({ field }) => (
                                        <div className='flex flex-col gap-1'>
                                            <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                                <SelectTrigger
                                                    className={errors.spccmsccG_Id ? 'border-destructive ring-destructive/20' : ''}>
                                                    <SelectValue placeholder='Select Main Event' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {mainEvents.map((item) => (
                                                        <SelectItem key={item.spccmsccG_Id} value={item.spccmsccG_Id.toString()}>
                                                            {item.spccmsccG_SportsCCGroupName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.spccmsccG_Id && (
                                                <span className='font-medium text-destructive text-xs'>{errors.spccmsccG_Id.message}</span>
                                            )}
                                        </div>
                                    )}
                                />
                            </div>

                            {/* Sub Event */}
                            <div className='flex flex-col gap-2'>
                                <Label className="font-semibold text-sm after:ml-0.5 after:text-red-500 after:content-['*']">
                                    Sub Event
                                </Label>
                                <Controller
                                    control={control}
                                    name='spccmscC_Id'
                                    render={({ field }) => (
                                        <div className='flex flex-col gap-1'>
                                            <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                                <SelectTrigger
                                                    className={errors.spccmscC_Id ? 'border-destructive ring-destructive/20' : ''}>
                                                    <SelectValue placeholder='Select Sub Event' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {subEvents.map((item) => (
                                                        <SelectItem key={item.spccmscC_Id} value={item.spccmscC_Id.toString()}>
                                                            {item.spccmscC_SportsCCName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.spccmscC_Id && (
                                                <span className='font-medium text-destructive text-xs'>{errors.spccmscC_Id.message}</span>
                                            )}
                                        </div>
                                    )}
                                />
                            </div>

                            {/* Sub Sub Event */}
                            {/* Multi for Indoor, Outdoor, Externals */}
                            {['Indoor', 'Outdoor', 'Externals'].includes(watchedType) && (
                                <div className='flex flex-col gap-2'>
                                    <Label className="font-semibold text-sm after:ml-0.5 after:text-red-500 after:content-['*']">
                                        Sub Sub Event
                                    </Label>
                                    <Controller
                                        control={control}
                                        name='selectedSubSubEvents'
                                        render={({ field }) => (
                                            <div className='flex flex-col gap-1'>
                                                <ScrollArea
                                                    className={`h-[150px] w-full rounded-md border p-2 ${errors.selectedSubSubEvents ? 'border-destructive ring-destructive/20' : ''}`}>
                                                    {subSubEvents.map((item) => (
                                                        <div
                                                            key={item.spccmsccG_Id}
                                                            className='mb-2 flex flex-row items-start space-x-3 space-y-0'>
                                                            <Checkbox
                                                                checked={field.value?.some((val) => val.spccmsccG_Id === item.spccmsccG_Id)}
                                                                onCheckedChange={(checked) => {
                                                                    const current = field.value || [];
                                                                    return checked
                                                                        ? field.onChange([...current, { spccmsccG_Id: item.spccmsccG_Id }])
                                                                        : field.onChange(
                                                                              current.filter(
                                                                                  (val) => val.spccmsccG_Id !== item.spccmsccG_Id
                                                                              )
                                                                          );
                                                                }}
                                                            />
                                                            <label className='font-normal text-sm'>
                                                                {item.spccmsccG_SportsCCGroupName}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </ScrollArea>
                                                {errors.selectedSubSubEvents && (
                                                    <span className='font-medium text-destructive text-xs'>
                                                        {errors.selectedSubSubEvents.message}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    />
                                </div>
                            )}

                            {/* Single for Start, Team, Finish */}
                            {['Start', 'Team', 'Finish'].includes(watchedType) && (
                                <div className='flex flex-col gap-2'>
                                    <Label className="font-semibold text-sm after:ml-0.5 after:text-red-500 after:content-['*']">
                                        Sub Sub Event
                                    </Label>
                                    <Controller
                                        control={control}
                                        name='spccmsccG_Idsub'
                                        render={({ field }) => (
                                            <div className='flex flex-col gap-1'>
                                                <Select
                                                    onValueChange={(val) => field.onChange(Number(val))}
                                                    value={field.value?.toString()}>
                                                    <SelectTrigger
                                                        className={errors.spccmsccG_Idsub ? 'border-destructive ring-destructive/20' : ''}>
                                                        <SelectValue placeholder='Select Sub Sub Event' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {subSubEvents.map((item) => (
                                                            <SelectItem key={item.spccmsccG_Id} value={item.spccmsccG_Id.toString()}>
                                                                {item.spccmsccG_SportsCCGroupName}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.spccmsccG_Idsub && (
                                                    <span className='font-medium text-destructive text-xs'>
                                                        {errors.spccmsccG_Idsub.message}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className='flex justify-center gap-2'>
                    <Button type='submit' disabled={generateReport.isPending}>
                        {generateReport.isPending ? (
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        ) : (
                            <i className='fa fa-list-alt mr-2' aria-hidden='true'></i>
                        )}
                        Report
                    </Button>
                    <Button type='button' variant='destructive' onClick={() => window.location.reload()}>
                        <i className='fa fa-times mr-2' aria-hidden='true'></i>
                        Cancel
                    </Button>
                </div>
            </form>
        </Form>
    );
};
