'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider } from '@/components/ui/form/form-provider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { HRMS_MI_ID, MONTH_LIST } from '@/constants/hrms-config';
import { useLeaveDetailsGrid, useSaveLeaveDetails } from '@/hooks/hrms/leave-management/useLeaveDetails';
import { useGradeDropdown } from '@/hooks/hrms/useEmployeeRegister';
import { useReportDepartments, useReportDesignations, useReportGroupTypes } from '@/hooks/hrms/useReports';
import { getEarningList } from '@/server/hrms/hrmsConfig/employee/register';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { useMasterLeaveCodeDropdown } from '@/hooks/hrms/useMasters';
import { tableSearchVariables } from '@/lib/data-table.config';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { LeaveDetailsGrid } from './_components/leave-details-grid';

interface LeaveDetailsFormValues {
    selectedTypes: string[];
    selectedDepartments: string[];
    selectedDesignations: string[];
    grades: string[];
    hrmL_Id: string;
    hrmlD_NoOfDays: string;
    hrmlD_MaxLeaveApplicable: string;
    hrmlD_CarryForFlg: boolean;
    hrmlD_EncashFlg: boolean;
    hrmldcF_MaxLeaveAplFlg: boolean;
    hrmldcF_MaxLeaveCF: string;
    selectedMonthList: string[];
    selectedcarryMonthList: string[];
    // Encashment fields
    hrmlDEC_ServiceAplFlg: boolean;
    hrmlDEC_ServiceYear: string;
    hrmlDEC_ServiceMonth: string;
    hrmlDEC_ServiceDays: string;
    hrmlDEC_MaxLeaveFlg: boolean;
    hrmlDEC_MaxLeaves: string;
    hrmlDEC_MinLeaveFlg: boolean;
    hrmlDEC_MinLeaves: string;
    hrmlDEC_ScheduleFlg: string;
    hrmlDEC_ScheduleYear: string;
    hrmlDEC_ScheduleMonth: string;
    hrmlDEC_VariableFixedFlg: string;
    hrmlDEC_FixedAmount: string;
    hrmlDEC_Earnings: string[];
    hrmlDEC_ScheduleAplFlg: boolean;
    hrmL_LeaveCode: string;
}

export default function LeaveDetailsPage() {
    return (
        <FormProvider>
            <LeaveDetailsPageContent />
        </FormProvider>
    );
}

function LeaveDetailsPageContent() {
    const [searchValue, setSearchValue] = useState('');
    const [activeTab, setActiveTab] = useState('leave-credit');

    const {
        control,
        handleSubmit,
        watch,
        reset,
        setValue,
        trigger,
        getValues,
        formState: { errors }
    } = useForm<LeaveDetailsFormValues>({
        defaultValues: {
            selectedTypes: [],
            selectedDepartments: [],
            selectedDesignations: [],
            grades: [],
            hrmL_Id: '',
            hrmlD_NoOfDays: '',
            hrmlD_MaxLeaveApplicable: '',
            hrmlD_CarryForFlg: false,
            hrmlD_EncashFlg: false,
            hrmldcF_MaxLeaveAplFlg: false,
            hrmldcF_MaxLeaveCF: '',
            selectedMonthList: [],
            selectedcarryMonthList: [],
            hrmlDEC_ServiceAplFlg: false,
            hrmlDEC_ServiceYear: '',
            hrmlDEC_ServiceMonth: '',
            hrmlDEC_ServiceDays: '',
            hrmlDEC_MaxLeaveFlg: false,
            hrmlDEC_MaxLeaves: '',
            hrmlDEC_MinLeaveFlg: false,
            hrmlDEC_MinLeaves: '',
            hrmlDEC_ScheduleFlg: 'year',
            hrmlDEC_ScheduleYear: '',
            hrmlDEC_ScheduleMonth: '',
            hrmlDEC_VariableFixedFlg: 'vardata',
            hrmlDEC_FixedAmount: '',
            hrmlDEC_Earnings: [],
            hrmlDEC_ScheduleAplFlg: false,
            hrmL_LeaveCode: ''
        }
    });

    const watchedTypes = watch('selectedTypes');
    const watchedDepartments = watch('selectedDepartments');
    const watchedDesignations = watch('selectedDesignations');
    const watchedCarryForward = watch('hrmlD_CarryForFlg');
    const watchedEncashment = watch('hrmlD_EncashFlg');
    const watchedMinService = watch('hrmlDEC_ServiceAplFlg');
    const watchedMaxLeaveEnc = watch('hrmlDEC_MaxLeaveFlg');
    const watchedMinLeaveEnc = watch('hrmlDEC_MinLeaveFlg');
    const watchedEncashSch = watch('hrmlDEC_ScheduleAplFlg');
    const watchedScheduleType = watch('hrmlDEC_ScheduleFlg');
    const watchedVarFixed = watch('hrmlDEC_VariableFixedFlg');
    const watchedLeaveId = watch('hrmL_Id');
    const watchedMaxLeaveApl = watch('hrmldcF_MaxLeaveAplFlg');

    const typeIds = useMemo(() => watchedTypes.map(Number).filter(Boolean), [watchedTypes]);
    const deptIds = useMemo(() => watchedDepartments.map(Number).filter(Boolean), [watchedDepartments]);

    // URL State for Grid
    const [pageNumber, setPageNumber] = useQueryState(tableSearchVariables.page, parseAsInteger.withDefault(1));
    const [pageSize, setPageSize] = useQueryState(tableSearchVariables.page_size, parseAsInteger.withDefault(10));
    const [searchQuery, setSearchQuery] = useQueryState(tableSearchVariables.search, parseAsString.withDefault(''));

    const apiParams = useMemo(
        () => ({
            page: pageNumber,
            page_size: pageSize,
            search_query: searchQuery
        }),
        [pageNumber, pageSize, searchQuery]
    );

    // Data Fetching
    const { data: groupTypesData, isLoading: isLoadingGroupTypes } = useReportGroupTypes();
    const { data: departmentsData, isLoading: isLoadingDepartments } = useReportDepartments(typeIds.toString());
    const { data: designationsData, isLoading: isLoadingDesignations } = useReportDesignations(typeIds.toString(), deptIds.toString());
    const { data: gradeData, isLoading: isLoadingGrade } = useGradeDropdown();
    const { data: leaveData, isLoading: isLoadingLeave } = useMasterLeaveCodeDropdown();
    const { data: gridData, isLoading: isGridLoading } = useLeaveDetailsGrid(apiParams);
    const saveMutation = useSaveLeaveDetails();

    const { data: earningsData } = useQuery({
        queryKey: ['earnings-dropdown'],
        queryFn: async () => getEarningList()
    });

    // Transforms
    const groupTypesOptions = useMemo(() => {
        const data = gridData?.rawResponse?.data?.staff_types || groupTypesData?.data;
        return (
            data?.map((gt: any) => ({
                label: gt.hrmgT_EmployeeGroupType || gt.HRMGT_EmployeeGroupType || gt.hrmgT_Name || gt.value || gt.label || 'Unknown Type',
                value: String(gt.hrmgT_Id || gt.HRMGT_Id || gt.key || gt.id)
            })) || []
        );
    }, [groupTypesData, gridData]);

    const departmentOptions = useMemo(() => {
        const data = gridData?.rawResponse?.data?.Department_types || departmentsData?.data;
        return (
            data?.map((d: any) => ({
                label: d.hrmD_DepartmentName || d.HRMD_DepartmentName || d.hrmD_Name || d.value || d.label || 'Unknown Department',
                value: String(d.hrmD_Id || d.HRMD_Id || d.key || d.id)
            })) || []
        );
    }, [departmentsData, gridData]);

    const earningOptions = useMemo(() => {
        const data = gridData?.rawResponse?.data?.earnded || earningsData?.data;
        return (
            data?.map((e: any) => ({
                label: e.hrmeD_Name || e.HRMED_Name || e.value || e.label || 'Unknown Earning',
                value: String(e.hrmeD_Id || e.HRMED_Id || e.key || e.id)
            })) || []
        );
    }, [earningsData, gridData]);

    const designationOptions = useMemo(() => {
        const data = gridData?.rawResponse?.data?.Designation_types || designationsData?.data;
        return (
            data?.map((d: any) => ({
                label: d.hrmdeS_DesignationName || d.HRMDES_DesignationName || d.hrmdeS_Name || d.value || d.label || 'Unknown Designation',
                value: String(d.hrmdeS_Id || d.HRMDES_Id || d.key || d.id)
            })) || []
        );
    }, [designationsData, gridData]);

    const gradeOptions = useMemo(() => gradeData?.data?.map((d: any) => ({ label: d.value, value: String(d.key) })) || [], [gradeData]);

    const leavesDataTransformed = useMemo(() => {
        return (
            leaveData?.data?.map((lv: any) => ({
                id: lv.hrmL_Id || lv.key || lv.id,
                name: lv.hrmL_LeaveName || lv.value || lv.name,
                code: lv.hrmL_LeaveCode || ''
            })) || []
        ).filter((lv: any) => lv.id != null);
    }, [leaveData]);

    useEffect(() => {
        if (watchedLeaveId && leavesDataTransformed.length > 0) {
            const selectedLeave = leavesDataTransformed.find((l: any) => String(l.id) === String(watchedLeaveId));
            if (selectedLeave) {
                setValue('hrmL_LeaveCode', selectedLeave.code, { shouldValidate: true });
            } else {
                setValue('hrmL_LeaveCode', '');
            }
        } else if (!watchedLeaveId) {
            setValue('hrmL_LeaveCode', '');
        }
    }, [watchedLeaveId, leavesDataTransformed, setValue]);

    const creditMonthOptions = useMemo(() => MONTH_LIST.map((m: any) => ({ label: m.name, value: String(m.id) })), []);

    const onSubmit = (data: LeaveDetailsFormValues) => {
        const payload = {
            hrmlD_Id: 0,
            hrmL_Id: Number(data.hrmL_Id),
            mI_Id: HRMS_MI_ID,
            hrmlD_NoOfDays: data.hrmlD_NoOfDays,
            hrmlD_MaxLeaveApplicable: Number(data.hrmlD_MaxLeaveApplicable),
            hrmlD_CarryForFlg: data.hrmlD_CarryForFlg,
            hrmlD_EncashFlg: data.hrmlD_EncashFlg,
            hrmldcF_MaxLeaveAplFlg: data.hrmldcF_MaxLeaveAplFlg,
            hrmldcF_MaxLeaveCF: Number(data.hrmldcF_MaxLeaveCF) || 0,
            edit_flag: false,
            emp_types: data.selectedTypes.map((id) => ({ hrmgT_Id: Number(id) })),
            dept_types: data.selectedDepartments.map((id) => ({ hrmD_Id: Number(id) })),
            desig_types: data.selectedDesignations.map((id) => ({ hrmdeS_Id: Number(id) })),
            grade_types: data.grades.map((id) => ({ hrmG_Id: Number(id) })),
            selectedcarryMonthList: data.selectedcarryMonthList.map(Number),
            selectedMonthList: data.selectedMonthList.map(Number)
        };

        saveMutation.mutate(payload, {
            onSuccess: () => {
                reset();
                setActiveTab('leave-credit');
            }
        });
    };
    return (
        <div className='space-y-6 px-40 py-10'>
            <CollapsibleSection title='Leave Details' defaultOpen>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
                        <div className='space-y-2'>
                            <Label>Type<span className='text-destructive'>*</span></Label>
                            <Controller
                                name='selectedTypes'
                                control={control}
                                rules={{ required: 'Staff Type is required' }}
                                render={({ field }) => (
                                    <MultiSelect
                                        options={groupTypesOptions}
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        placeholder={isLoadingGroupTypes ? 'Loading...' : 'Select Type'}
                                        disabled={isLoadingGroupTypes || groupTypesOptions.length === 0}
                                    />
                                )}
                            />
                            {errors.selectedTypes && <p className='mt-1 text-destructive text-xs'>{errors.selectedTypes.message}</p>}
                        </div>
                        <div className='space-y-2'>
                            <Label>Department<span className='text-destructive'>*</span></Label>
                            <Controller
                                name='selectedDepartments'
                                control={control}
                                rules={{ required: 'Department is required' }}
                                render={({ field }) => (
                                    <MultiSelect
                                        options={departmentOptions}
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        placeholder={isLoadingDepartments ? 'Loading...' : 'Select Department'}
                                        disabled={isLoadingDepartments || departmentOptions.length === 0}
                                    />
                                )}
                            />
                            {errors.selectedDepartments && (
                                <p className='mt-1 text-destructive text-xs'>{errors.selectedDepartments.message}</p>
                            )}
                        </div>
                        <div className='space-y-2'>
                            <Label>Designation<span className='text-destructive'>*</span></Label>
                            <Controller
                                name='selectedDesignations'
                                control={control}
                                rules={{ required: 'Designation is required' }}
                                render={({ field }) => (
                                    <MultiSelect
                                        options={designationOptions}
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        placeholder={isLoadingDesignations ? 'Loading...' : 'Select Designation'}
                                        disabled={isLoadingDesignations || designationOptions.length === 0}
                                    />
                                )}
                            />
                            {errors.selectedDesignations && (
                                <p className='mt-1 text-destructive text-xs'>{errors.selectedDesignations.message}</p>
                            )}
                        </div>
                        <div className='space-y-2'>
                            <Label>Grade<span className='text-destructive'>*</span></Label>
                            <Controller
                                name='grades'
                                control={control}
                                rules={{ required: 'Grade is required' }}
                                render={({ field }) => (
                                    <MultiSelect
                                        options={gradeOptions}
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        placeholder={isLoadingGrade ? 'Loading...' : 'Select Grade'}
                                        disabled={isLoadingGrade || gradeOptions?.length === 0}
                                    />
                                )}
                            />
                            {errors.grades && <p className='mt-1 text-destructive text-xs'>{errors.grades.message}</p>}
                        </div>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
                        <TabsList className='grid w-full grid-cols-3'>
                            <TabsTrigger value='leave-credit'>Leave Credit</TabsTrigger>
                            <TabsTrigger value='carry-forward' disabled={!watchedCarryForward}>
                                Carry Forward
                            </TabsTrigger>
                            <TabsTrigger value='encashment' disabled={!watchedEncashment}>
                                Encashment
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value='leave-credit' className='mt-4 rounded-md border p-4'>
                            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                                <div className='space-y-4'>
                                    <div className='space-y-2'>
                                        <Label>
                                            Leave Name <span className='text-destructive'>*</span>
                                        </Label>
                                        <Controller
                                            name='hrmL_Id'
                                            control={control}
                                            rules={{ required: true }}
                                            render={({ field }) => (
                                                <Select
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                    disabled={leavesDataTransformed.length === 0}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder='--Select--' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {leavesDataTransformed.map((opt: any) => (
                                                            <SelectItem key={opt.id} value={String(opt.id)}>
                                                                {opt.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.hrmL_Id && <p className='mt-1 text-destructive text-xs'>Leave name is required</p>}
                                    </div>
                                    <div className='space-y-2'>
                                        <Label>Leave Code</Label>
                                        <Input {...control.register('hrmL_LeaveCode')} disabled placeholder='Leave Code' />
                                    </div>
                                    <div className='space-y-2'>
                                        <Label>
                                            No of Days <span className='text-destructive'>*</span>
                                        </Label>
                                        <Input {...control.register('hrmlD_NoOfDays', { required: true })} />
                                        {errors.hrmlD_NoOfDays && (
                                            <p className='mt-1 text-destructive text-xs'>Number of days is required</p>
                                        )}
                                    </div>
                                    <div className='space-y-2'>
                                        <Label>
                                            Max Leave Applicable <span className='text-destructive'>*</span>
                                        </Label>
                                        <Input {...control.register('hrmlD_MaxLeaveApplicable', { required: true })} />
                                        {errors.hrmlD_MaxLeaveApplicable && (
                                            <p className='mt-1 text-destructive text-xs'>Max leave applicable is required</p>
                                        )}
                                    </div>
                                    <div className='flex items-center justify-center space-x-6 pt-4'>
                                        <div className='flex items-center space-x-2'>
                                            <Controller
                                                name='hrmlD_CarryForFlg'
                                                control={control}
                                                render={({ field }) => (
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} id='carry-forward' />
                                                )}
                                            />
                                            <Label htmlFor='carry-forward'>Leave Carry Forward</Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <Controller
                                                name='hrmlD_EncashFlg'
                                                control={control}
                                                render={({ field }) => (
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} id='encashment' />
                                                )}
                                            />
                                            <Label htmlFor='encashment'>Leave Encashment</Label>
                                        </div>
                                    </div>
                                </div>
                                <div className='space-y-2'>
                                    <Label>Credit Month</Label>
                                    <Controller
                                        name='selectedMonthList'
                                        control={control}
                                        render={({ field }) => (
                                            <MultiSelect
                                                options={creditMonthOptions}
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                placeholder='Select Month'
                                                className='w-full'
                                                disabled={creditMonthOptions.length === 0}
                                            />
                                        )}
                                    />
                                </div>
                            </div>
                            <div className='mt-8 flex justify-center gap-4'>
                                <Button
                                    size='sm'
                                    type='submit'
                                    className='w-fit bg-primary'
                                    disabled={watchedCarryForward || watchedEncashment}>
                                    Save
                                </Button>
                                <Button size='sm' type='button' variant='outline' className='w-fit' onClick={() => reset()}>
                                    Clear
                                </Button>
                                {(watchedCarryForward || watchedEncashment) && (
                                    <Button
                                        size='sm'
                                        type='button'
                                        className='w-fit bg-primary'
                                        onClick={async () => {
                                            const isValid = await trigger([
                                                'selectedTypes',
                                                'selectedDepartments',
                                                'selectedDesignations',
                                                'grades',
                                                'hrmL_Id',
                                                'hrmlD_NoOfDays',
                                                'hrmlD_MaxLeaveApplicable'
                                            ]);
                                            if (isValid) {
                                                // Sync selected months from Leave Credit to Carry Forward
                                                const currentMonths = getValues('selectedMonthList');
                                                setValue('selectedcarryMonthList', currentMonths);

                                                setActiveTab(watchedCarryForward ? 'carry-forward' : 'encashment');
                                            }
                                        }}>
                                        Next
                                    </Button>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value='carry-forward' className='mt-4 rounded-md border p-4'>
                            <div className='mx-auto max-w-2xl space-y-6'>
                                <div className='space-y-2'>
                                    <div className='flex items-center space-x-2'>
                                        <Controller
                                            name='hrmldcF_MaxLeaveAplFlg'
                                            control={control}
                                            render={({ field }) => (
                                                <Checkbox checked={field.value} onCheckedChange={field.onChange} id='max-cf' />
                                            )}
                                        />
                                        <Label htmlFor='max-cf'>Max Leave Applicable :</Label>
                                    </div>
                                    <Input
                                        {...control.register('hrmldcF_MaxLeaveCF', { required: watchedMaxLeaveApl })}
                                        disabled={!watchedMaxLeaveApl}
                                        placeholder='Max Carry Forward Leaves'
                                    />
                                    {errors.hrmldcF_MaxLeaveCF && (
                                        <p className='mt-1 text-destructive text-xs'>Max carry forward leaves is required</p>
                                    )}
                                </div>
                                <div className='space-y-2'>
                                    <Label>Credit Month</Label>
                                    <Controller
                                        name='selectedcarryMonthList'
                                        control={control}
                                        rules={{ required: watchedCarryForward }}
                                        render={({ field }) => (
                                            <MultiSelect
                                                options={creditMonthOptions}
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                placeholder='Select Month'
                                                className='w-full'
                                                disabled={creditMonthOptions.length === 0}
                                            />
                                        )}
                                    />
                                    {errors.selectedcarryMonthList && (
                                        <p className='mt-1 text-destructive text-xs'>Carry forward month is required</p>
                                    )}
                                </div>
                                <div className='mt-8 flex justify-center gap-4'>
                                    <Button size='sm' type='button' className='w-fit' onClick={() => setActiveTab('leave-credit')}>
                                        Previous
                                    </Button>
                                    <Button
                                        size='sm'
                                        type='button'
                                        className='w-fit bg-primary'
                                        onClick={async () => {
                                            const isValid = await trigger([
                                                'selectedTypes',
                                                'selectedDepartments',
                                                'selectedDesignations',
                                                'grades',
                                                'hrmldcF_MaxLeaveCF',
                                                'selectedcarryMonthList'
                                            ]);
                                            if (isValid) {
                                                setActiveTab('encashment');
                                            }
                                        }}>
                                        Next
                                    </Button>

                                    <Button size='sm' type='button' variant='outline' className='w-fit' onClick={() => reset()}>
                                        Clear
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value='encashment' className='mt-4 rounded-md border p-4'>
                            <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
                                <div className='space-y-4'>
                                    <div className='well space-y-4 rounded-md border p-4'>
                                        <div className='flex items-center space-x-2'>
                                            <Controller
                                                name='hrmlDEC_ServiceAplFlg'
                                                control={control}
                                                render={({ field }) => (
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} id='min-service' />
                                                )}
                                            />
                                            <Label htmlFor='min-service' className='font-bold'>
                                                Min Service Applicable
                                            </Label>
                                        </div>
                                        <div className='grid grid-cols-3 gap-2'>
                                            <div className='space-y-1'>
                                                <Label className='text-xs'>Year</Label>
                                                <Input
                                                    {...control.register('hrmlDEC_ServiceYear')}
                                                    disabled={!watchedMinService}
                                                    placeholder='Year'
                                                />
                                            </div>
                                            <div className='space-y-1'>
                                                <Label className='text-xs'>Month</Label>
                                                <Input
                                                    {...control.register('hrmlDEC_ServiceMonth')}
                                                    disabled={!watchedMinService}
                                                    placeholder='Month'
                                                />
                                            </div>
                                            <div className='space-y-1'>
                                                <Label className='text-xs'>Days</Label>
                                                <Input
                                                    {...control.register('hrmlDEC_ServiceDays')}
                                                    disabled={!watchedMinService}
                                                    placeholder='Days'
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className='grid grid-cols-4 items-center gap-4'>
                                        <div className='flex items-center space-x-2'>
                                            <Controller
                                                name='hrmlDEC_MaxLeaveFlg'
                                                control={control}
                                                render={({ field }) => (
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} id='max-leave-enc' />
                                                )}
                                            />
                                            <Label htmlFor='max-leave-enc' className='whitespace-nowrap'>
                                                Max Leave Applicable :
                                            </Label>
                                        </div>
                                        <Input
                                            {...control.register('hrmlDEC_MaxLeaves')}
                                            className='col-span-3'
                                            disabled={!watchedMaxLeaveEnc}
                                        />
                                    </div>

                                    <div className='grid grid-cols-4 items-center gap-4'>
                                        <div className='flex items-center space-x-2'>
                                            <Controller
                                                name='hrmlDEC_MinLeaveFlg'
                                                control={control}
                                                render={({ field }) => (
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} id='min-leave-enc' />
                                                )}
                                            />
                                            <Label htmlFor='min-leave-enc' className='whitespace-nowrap'>
                                                Min Leave Applicable :
                                            </Label>
                                        </div>
                                        <Input
                                            {...control.register('hrmlDEC_MinLeaves')}
                                            className='col-span-3'
                                            disabled={!watchedMinLeaveEnc}
                                        />
                                    </div>

                                    <div className='well space-y-4 rounded-md border p-4'>
                                        <div className='flex items-center space-x-2'>
                                            <Controller
                                                name='hrmlDEC_ScheduleAplFlg'
                                                control={control}
                                                render={({ field }) => (
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} id='encash-sch' />
                                                )}
                                            />
                                            <Label htmlFor='encash-sch' className='font-bold'>
                                                Encashment Schedule
                                            </Label>
                                        </div>
                                        <div className={`space-y-4 ${!watchedEncashSch ? 'pointer-events-none opacity-50' : ''}`}>
                                            <div className='flex items-center space-x-4'>
                                                <Controller
                                                    name='hrmlDEC_ScheduleFlg'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <div className='flex items-center space-x-4'>
                                                            <div className='flex items-center space-x-1'>
                                                                <input
                                                                    type='radio'
                                                                    id='sch-year'
                                                                    value='year'
                                                                    checked={field.value === 'year'}
                                                                    onChange={() => field.onChange('year')}
                                                                    className='h-4 w-4'
                                                                />
                                                                <Label htmlFor='sch-year'>Year</Label>
                                                            </div>
                                                            <div className='flex items-center space-x-1'>
                                                                <input
                                                                    type='radio'
                                                                    id='sch-month'
                                                                    value='month'
                                                                    checked={field.value === 'month'}
                                                                    onChange={() => field.onChange('month')}
                                                                    className='h-4 w-4'
                                                                />
                                                                <Label htmlFor='sch-month'>Month</Label>
                                                            </div>
                                                        </div>
                                                    )}
                                                />
                                                <div className='flex-1'>
                                                    {watchedScheduleType === 'year' ? (
                                                        <Controller
                                                            name='hrmlDEC_ScheduleYear'
                                                            control={control}
                                                            render={({ field }) => (
                                                                <Select onValueChange={field.onChange} value={field.value}>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder='--Select--' />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value='1'>Once in Year</SelectItem>
                                                                        <SelectItem value='2'>Once in Two Year</SelectItem>
                                                                        <SelectItem value='3'>Once in Three Year</SelectItem>
                                                                        <SelectItem value='4'>Once in Four Year</SelectItem>
                                                                        <SelectItem value='5'>Once in Five Year</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            )}
                                                        />
                                                    ) : (
                                                        <Controller
                                                            name='hrmlDEC_ScheduleMonth'
                                                            control={control}
                                                            render={({ field }) => (
                                                                <Select onValueChange={field.onChange} value={field.value}>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder='--Select--' />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {[1, 2, 3, 4, 5, 6].map((m) => (
                                                                            <SelectItem key={m} value={String(m)}>
                                                                                {m} Month
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            )}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className='space-y-4'>
                                    <div className='well space-y-4 rounded-md border p-4'>
                                        <Controller
                                            name='hrmlDEC_VariableFixedFlg'
                                            control={control}
                                            render={({ field }) => (
                                                <div className='flex items-center space-x-6'>
                                                    <div className='flex items-center space-x-2'>
                                                        <input
                                                            type='radio'
                                                            id='calc-var'
                                                            value='vardata'
                                                            checked={field.value === 'vardata'}
                                                            onChange={() => field.onChange('vardata')}
                                                            className='h-4 w-4'
                                                        />
                                                        <Label htmlFor='calc-var'>Variable</Label>
                                                    </div>
                                                    <div className='flex items-center space-x-2'>
                                                        <input
                                                            type='radio'
                                                            id='calc-fixed'
                                                            value='fxddata'
                                                            checked={field.value === 'fxddata'}
                                                            onChange={() => field.onChange('fxddata')}
                                                            className='h-4 w-4'
                                                        />
                                                        <Label htmlFor='calc-fixed'>Fixed</Label>
                                                    </div>
                                                    {field.value === 'fxddata' && (
                                                        <div className='flex flex-1 items-center gap-2'>
                                                            <Label>Amount:</Label>
                                                            <Input {...control.register('hrmlDEC_FixedAmount')} className='w-24' />
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        />
                                        {watchedVarFixed === 'vardata' && (
                                            <div className='space-y-2'>
                                                <Label>Earn/Ded</Label>
                                                <Controller
                                                    name='hrmlDEC_Earnings'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <MultiSelect
                                                            options={earningOptions}
                                                            onValueChange={field.onChange}
                                                            defaultValue={field.value}
                                                            placeholder='Select Earnings'
                                                        />
                                                    )}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className='mt-8 flex justify-center gap-4'>
                                <Button
                                    size='sm'
                                    type='button'
                                    className='w-fit'
                                    onClick={() => setActiveTab(watchedCarryForward ? 'carry-forward' : 'leave-credit')}>
                                    Previous
                                </Button>
                                <Button size='sm' type='submit' className='w-fit bg-primary'>
                                    Save
                                </Button>
                                <Button size='sm' type='button' variant='outline' className='w-fit' onClick={() => reset()}>
                                    Clear
                                </Button>
                            </div>
                        </TabsContent>
                    </Tabs>
                </form>
            </CollapsibleSection>

            <LeaveDetailsGrid
                response={gridData}
                isLoading={isGridLoading}
                currentApiParams={apiParams}
                onSearchQueryChange={(params) => {
                    setPageNumber(params.page || 1);
                    setPageSize(params.page_size || 10);
                    setSearchQuery(params.search_query || '');
                }}
            />
        </div>
    );
}
