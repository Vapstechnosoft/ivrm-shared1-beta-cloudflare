'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSportVenuewiseParticipationReport } from '@/hooks/sports/useSportVenuewiseParticipationReport';
import {
    type SportVenuewiseParticipationReportFormData,
    sportVenuewiseParticipationReportSchema
} from '@/schemas/sports/transactions/sport-venuewise-participation-report';
import type { ISportVenueWiseParticipationReportPayload } from '@/types/sports/reports/venue-wise-participation-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { use, useEffect, useMemo, useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function SportVenuewiseParticipationReportPage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const { loadData, refetchAll } = useSportVenuewiseParticipationReport(searchParams);

    return (
        <FormProvider
            {...useForm<SportVenuewiseParticipationReportFormData>({
                resolver: zodResolver(sportVenuewiseParticipationReportSchema),
                defaultValues: {
                    type: 'House',
                    asmaY_Id: undefined,
                    spccmeV_Id: [],
                    spccmH_Id: [],
                    asmcL_Id: undefined,
                    asmS_Id: []
                }
            })}>
            <SportVenuewiseParticipationReportPageContent
                response={loadData.data}
                isLoading={loadData.isPending || loadData.isFetching}
                error={loadData.error}
                refetchAll={refetchAll}
                searchParams={searchParams}
            />
        </FormProvider>
    );
}

function SportVenuewiseParticipationReportPageContent({ response, isLoading, error, refetchAll, searchParams }: any) {
    const { detailsData, sectionsData, reportData } = useSportVenuewiseParticipationReport(searchParams);
    const [houseOptions, setHouseOptions] = useState<{ label: string; value: string }[]>([]);
    const [venueOptions, setVenueOptions] = useState<{ label: string; value: string }[]>([]);
    const [classOptions, setClassOptions] = useState<{ label: string; value: string }[]>([]);
    const [sectionOptions, setSectionOptions] = useState<{ label: string; value: string }[]>([]);
    const [showReport, setShowReport] = useState(false);

    const {
        control,
        handleSubmit,
        watch,
        reset,
        formState: { errors }
    } = useForm<SportVenuewiseParticipationReportFormData>({
        resolver: zodResolver(sportVenuewiseParticipationReportSchema),
        defaultValues: {
            type: 'House',
            asmaY_Id: undefined,
            spccmeV_Id: [],
            spccmH_Id: [],
            asmcL_Id: undefined,
            asmS_Id: []
        }
    });

    const watchType = watch('type');
    const watchAcademicYear = watch('asmaY_Id');
    const watchClass = watch('asmcL_Id');

    useEffect(() => {
        if (watchAcademicYear) {
            detailsData.mutate(
                { asmaY_Id: watchAcademicYear },
                {
                    onSuccess: (res) => {
                        if (res.success && res.data) {
                            setClassOptions(
                                res.data.classList?.map((c) => ({ label: c.asmcL_ClassName, value: c.asmcL_Id.toString() })) || []
                            );
                            setHouseOptions(
                                res.data.houseList?.map((h) => ({ label: h.spccmH_HouseName, value: h.spccmH_Id.toString() })) || []
                            );
                            setVenueOptions(
                                res.data.venueList?.map((v) => ({ label: v.spccmeV_EventVenue, value: v.spccmeV_Id.toString() })) || []
                            );
                        }
                    }
                }
            );
        } else {
            setClassOptions([]);
            setHouseOptions([]);
            setVenueOptions([]);
        }
    }, [watchAcademicYear]);

    useEffect(() => {
        if (watchAcademicYear && watchClass) {
            sectionsData.mutate(
                { asmaY_Id: watchAcademicYear, asmcL_Id: watchClass },
                {
                    onSuccess: (res) => {
                        if (res.success && res.data?.sectionList) {
                            setSectionOptions(
                                res.data.sectionList.map((s) => ({ label: s.asmC_SectionName, value: s.asmS_Id.toString() }))
                            );
                        }
                    }
                }
            );
        } else {
            setSectionOptions([]);
        }
    }, [watchAcademicYear, watchClass]);

    const onSubmit = (data: SportVenuewiseParticipationReportFormData) => {
        const payload: ISportVenueWiseParticipationReportPayload = {
            ...data,
            selectedVenuelist: data.spccmeV_Id.map((id) => ({ spccmeV_Id: id })),
            selectedhouselist: data.spccmH_Id.map((id) => ({ spccmH_Id: id })),
            selectedSectionlist: data.asmS_Id?.map((id) => ({ asmS_Id: id }))
        };
        reportData.mutate(payload, {
            onSuccess: (res) => {
                if (res.success) {
                    setShowReport(true);
                }
            }
        });
    };

    const onCancel = () => {
        reset();
        setShowReport(false);
        setHouseOptions([]);
        setVenueOptions([]);
        setClassOptions([]);
        setSectionOptions([]);
    };

    const columns = useMemo(
        () => [
            { id: 'id', header: 'SL. No.', cell: ({ row }: any) => <div>{row.index + 1}</div> },
            {
                accessorKey: 'spccmH_HouseName',
                header: ({ column }: any) => <DataTableColumnHeader column={column} title='House Name' />,
                enableSorting: true
            },
            {
                accessorKey: 'spccmeV_EventVenue',
                header: ({ column }: any) => <DataTableColumnHeader column={column} title='Venue' />,
                enableSorting: true
            },
            {
                accessorKey: 'amsT_Name',
                header: ({ column }: any) => <DataTableColumnHeader column={column} title='Student Name' />,
                enableSorting: true
            },
            {
                accessorKey: 'amsT_AdmNo',
                header: ({ column }: any) => <DataTableColumnHeader column={column} title='Adm. No.' />,
                enableSorting: true
            },
            {
                accessorKey: 'asmcL_ClassName',
                header: ({ column }: any) => <DataTableColumnHeader column={column} title='Class' />,
                enableSorting: true
            },
            {
                accessorKey: 'asmC_SectionName',
                header: ({ column }: any) => <DataTableColumnHeader column={column} title='Section' />,
                enableSorting: true
            },
            {
                accessorKey: 'spccmE_EventName',
                header: ({ column }: any) => <DataTableColumnHeader column={column} title='Event' />,
                enableSorting: true
            },
            {
                accessorKey: 'spccmscc_SportsCCName',
                header: ({ column }: any) => <DataTableColumnHeader column={column} title='Sports Name' />,
                enableSorting: true
            },
            {
                accessorKey: 'spccE_StartDate',
                header: ({ column }: any) => <DataTableColumnHeader column={column} title='Event Date' />,
                enableSorting: true
            }
        ],
        []
    );

    const academicYears =
        response?.data?.yearlist?.map((y: any) => ({
            id: y.asmaY_Id,
            label: y.asmaY_Year
        })) || [];

    const tableProps = useDataTableProps(reportData.data?.data || []);

    if (isLoading) {
        return (
            <div className='flex h-full items-center justify-center'>
                <Loader2 className='animate-spin' />
            </div>
        );
    }

    return (
        <div className='space-y-6'>
            <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle>Venue Wise Participation Report</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                        <div className='mb-4 flex justify-center'>
                            <Controller
                                control={control}
                                name='type'
                                render={({ field }) => (
                                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className='flex space-x-4'>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='House' id='r1' />
                                            <Label htmlFor='r1'>By House</Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='CS' id='r2' />
                                            <Label htmlFor='r2'>By Class/Section</Label>
                                        </div>
                                    </RadioGroup>
                                )}
                            />
                        </div>

                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            <div className='space-y-2'>
                                <Label>
                                    Academic Year <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    control={control}
                                    name='asmaY_Id'
                                    render={({ field }) => (
                                        <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Academic Year' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {academicYears.map((year: any) => (
                                                    <SelectItem key={year.id} value={year.id.toString()}>
                                                        {year.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.asmaY_Id && <span className='text-destructive text-sm'>{errors.asmaY_Id.message}</span>}
                            </div>

                            {watchType === 'CS' && (
                                <>
                                    <div className='space-y-2'>
                                        <Label>
                                            Class <span className='text-red-500'>*</span>
                                        </Label>
                                        <Controller
                                            control={control}
                                            name='asmcL_Id'
                                            render={({ field }) => (
                                                <Select
                                                    onValueChange={(val) => field.onChange(Number(val))}
                                                    value={field.value?.toString()}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder='Select Class' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {classOptions.map((cls: any) => (
                                                            <SelectItem key={cls.value} value={cls.value}>
                                                                {cls.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.asmcL_Id && <span className='text-destructive text-sm'>{errors.asmcL_Id.message}</span>}
                                    </div>

                                    <div className='space-y-2'>
                                        <Label>
                                            Section <span className='text-red-500'>*</span>
                                        </Label>
                                        <Controller
                                            control={control}
                                            name='asmS_Id'
                                            render={({ field }) => (
                                                <MultiSelect
                                                    options={sectionOptions}
                                                    onValueChange={(vals) => field.onChange(vals.map(Number))}
                                                    defaultValue={field.value?.map(String) || []}
                                                    placeholder='Select Section'
                                                    variant='default'
                                                    maxCount={3}
                                                />
                                            )}
                                        />
                                        {errors.asmS_Id && <span className='text-destructive text-sm'>{errors.asmS_Id.message}</span>}
                                    </div>
                                </>
                            )}

                            <div className='space-y-2'>
                                <Label>
                                    House Name <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    control={control}
                                    name='spccmH_Id'
                                    render={({ field }) => (
                                        <MultiSelect
                                            options={houseOptions}
                                            onValueChange={(vals) => field.onChange(vals.map(Number))}
                                            defaultValue={field.value?.map(String) || []}
                                            placeholder='Select House'
                                            variant='default'
                                            maxCount={3}
                                        />
                                    )}
                                />
                                {errors.spccmH_Id && <span className='text-destructive text-sm'>{errors.spccmH_Id.message}</span>}
                            </div>

                            <div className='space-y-2'>
                                <Label>
                                    Venue Name <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    control={control}
                                    name='spccmeV_Id'
                                    render={({ field }) => (
                                        <MultiSelect
                                            options={venueOptions}
                                            onValueChange={(vals) => field.onChange(vals.map(Number))}
                                            defaultValue={field.value?.map(String) || []}
                                            placeholder='Select Venue'
                                            variant='default'
                                            maxCount={3}
                                        />
                                    )}
                                />
                                {errors.spccmeV_Id && <span className='text-destructive text-sm'>{errors.spccmeV_Id.message}</span>}
                            </div>
                        </div>

                        <div className='flex justify-center space-x-2'>
                            <Button type='submit' disabled={reportData.isPending}>
                                {reportData.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                                Report
                            </Button>
                            <Button type='button' variant='destructive' onClick={onCancel}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {showReport && (
                <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                        <CardTitle>Venue Wise Participation Report List</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <GenericDataTable<any>
                            {...tableProps}
                            columns={columns}
                            isLoading={reportData.isPending}
                            error={reportData.error}
                            showSearchColumns={true}
                        />
                        <div className='mt-4 flex justify-end space-x-2'>
                            <Button onClick={() => window.print()}>Print</Button>
                            <Button variant='outline'>Excel</Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
