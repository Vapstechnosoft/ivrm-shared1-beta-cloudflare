'use client';

import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { MultiSelect } from '@/components/ui/multi-select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HRMS_QUERY_KEYS } from '@/constants/query-keys';
import {
    useReportDepartments,
    useReportDesignations,
    useReportEmployeesByGroupTypeDeptAndDesignation,
    useReportGroupTypes
} from '@/hooks/hrms/useReports';
import { cn } from '@/lib/utils';
import { employeeLateInEarlyOutReportFilterSchema } from '@/schemas/hrms/attendance-management-schemas';
import { getEmployeeLogReport } from '@/server/hrms/hrmsConfig/reports/employee-log-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { addMonths, format } from 'date-fns';
import { Calendar as CalendarIcon, Save } from 'lucide-react';
import { useMemo } from 'react';
import { Label } from 'react-aria-components';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import { CalendarYear } from './calendarYear';

type FormFields = z.infer<typeof employeeLateInEarlyOutReportFilterSchema>;

interface AddEmployeeLateInEarlyOutReportFormProps {
    onSuccess?: () => void;
    className?: string;
    searchParams?: any;
    groupTypes?: Array<{ label: string; value: string }>;
}

export default function AddEmployeeLateInEarlyOutReportForm({
    onSuccess,
    className = '',
    searchParams,
    groupTypes = []
}: AddEmployeeLateInEarlyOutReportFormProps) {
    const queryClient = useQueryClient();

    const {
        handleSubmit,
        control,
        reset,
        watch,
        clearErrors,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(employeeLateInEarlyOutReportFilterSchema),
        mode: 'onChange',
        defaultValues: {
            type: [],
            department: [],
            designation: [],
            allOrIndividual: 'All',
            codeOrName: 'Code',
            query: '',
            fromDate: '',
            toDate: '',
            mode: 'Late By'
        }
    });

    const allOrIndividualValue = watch('allOrIndividual');
    const fromDateValue = watch('fromDate');
    const fromDateObject = fromDateValue ? new Date(fromDateValue) : undefined;
    const today = new Date();
    const effectiveToDateMax = fromDateObject ? addMonths(fromDateObject, 1) : today;

    const watchedType = watch('type') || [];
    const watchedDepartment = watch('department') || [];
    const watchedDesignation = watch('designation') || [];

    const groupTypeIds = watchedType.map(Number).filter(Boolean);
    const deptIds = watchedDepartment.map(Number).filter(Boolean);
    const desigIds = watchedDesignation.map(Number).filter(Boolean);

    console.log('groupTypeIds', groupTypeIds);
    console.log('deptIds', deptIds);
    console.log('desigIds', desigIds);

    const { data: groupTypesData, isLoading: isGroupTypesLoading } = useReportGroupTypes();
    const { data: departmentsData, isLoading: isDepartmentsLoading } = useReportDepartments(groupTypeIds.toString());
    const { data: designationsData, isLoading: isDesignationsLoading } = useReportDesignations(groupTypeIds.toString(), deptIds.toString());
    const { data: employeesData, isLoading: isEmployeesLoading } = useReportEmployeesByGroupTypeDeptAndDesignation(
        groupTypeIds,
        deptIds,
        desigIds
    );

    console.log('employeesData', employeesData);

    const groupTypesDataTransformed = useMemo(() => {
        return (
            groupTypesData?.data?.map((gt: any) => ({
                id: gt.key || gt.hrmgT_Id,
                name: gt.value || gt.hrmgT_EmployeeGroupType
            })) || []
        ).filter((d: any) => d.id != null);
    }, [groupTypesData]);

    const departmentsDataTransformed = useMemo(() => {
        return (
            departmentsData?.data?.map((d: any) => ({
                id: d.hrmD_Id || d.hrmd_id || d.key || d.id,
                name: d.hrmD_DepartmentName || d.hrmd_departmentName || d.value || d.name
            })) || []
        ).filter((d: any) => d.id != null);
    }, [departmentsData]);

    const designationsDataTransformed = useMemo(() => {
        return (
            designationsData?.data?.map((d: any) => ({
                id: d.hrmdeS_Id || d.hrmdes_id || d.key || d.id,
                name: d.hrmdeS_DesignationName || d.hrmdes_designationName || d.value || d.name
            })) || []
        ).filter((d: any) => d.id != null);
    }, [designationsData]);

    const employeesDataTransformed = useMemo(() => {
        const list = employeesData?.data?.employeeNames || employeesData;
        if (!list || !Array.isArray(list)) return [];

        return list
            .map((emp: any) => {
                const id = emp.HRME_Id || emp.hrmE_Id || emp.id || emp.key;
                if (id == null) return null;

                const employeeName = emp.employeeFullName;

                const employeeCode = id;

                return {
                    id: Number(id),
                    employeeCode,
                    employeeName
                };
            })
            .filter(Boolean);
    }, [employeesData]);

    const onSubmit: SubmitHandler<FormFields> = async (data: FormFields) => {
        try {
            // Determine comma-separated employee IDs
            let hrmeIds = '0';
            if (data.allOrIndividual === 'Individual') {
                hrmeIds = data.query?.toString() || '0';
            } else if (data.allOrIndividual === 'All') {
                const allIds = employeesDataTransformed.map((emp: any) => emp.id).join(',');
                hrmeIds = allIds || '0';
            }

            const fromDateObj = data.fromDate ? new Date(data.fromDate) : null;

            const punchTypeMap: Record<string, string> = {
                'Late By': 'late',
                'Early Out': 'early',
                'Late In Early Out': 'LIEO'
            };

            const payload = {
                hrme_ids: hrmeIds,
                select_date: fromDateObj ? format(fromDateObj, 'yyyy-MM-dd') : '',
                select_month: fromDateObj ? format(fromDateObj, 'MMMM') : '',
                select_year: fromDateObj ? format(fromDateObj, 'yyyy') : '',
                from_date: data.fromDate ? format(new Date(data.fromDate), 'yyyy-MM-dd') : '',
                to_date: data.toDate ? format(new Date(data.toDate), 'yyyy-MM-dd') : '',
                punch_type: punchTypeMap[data.mode] || 'LIEO'
            };

            const response = await getEmployeeLogReport(payload);

            console.log('response', response);

            if (response.success) {
                const isDataEmpty = !response.data || (Array.isArray(response.data) && response.data.length === 0);

                if (isDataEmpty) {
                    toast.error('No data found');
                } else {
                    toast.success(response.message || 'Report generated successfully');
                }

                try {
                    // Attach dates for the report header in page.tsx
                    response.fromDate = data.fromDate;
                    response.toDate = data.toDate;

                    // Update the query cache for Late In Early Out Report
                    // We use {} as a fixed key to match exactly between page and form
                    if (response?.total != null) {
                        queryClient.setQueryData([HRMS_QUERY_KEYS.EMPLOYEE_LATEIN_EARLYOUT_REPORT, {}], response);
                    } else if (Array.isArray(response?.data)) {
                        // Pass the full array to allow GenericDataTable to handle pagination client-side
                        queryClient.setQueryData([HRMS_QUERY_KEYS.EMPLOYEE_LATEIN_EARLYOUT_REPORT, {}], {
                            data: response.data,
                            total: response.data.length,
                            success: true,
                            message: response.message,
                            fromDate: data.fromDate,
                            toDate: data.toDate,
                            mode: data.mode
                        });
                    } else {
                        response.mode = data.mode;
                        queryClient.setQueryData([HRMS_QUERY_KEYS.EMPLOYEE_LATEIN_EARLYOUT_REPORT, {}], response);
                    }
                } catch (e) {
                    // noop
                }
                // Do NOT reset form fields to preserve selection
                // reset();
                onSuccess?.();
            } else {
                toast.error(response.message || 'Failed to generate report');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to generate report');
        }
    };

    const handleReset = () => {
        reset(
            {
                type: [],
                department: [],
                designation: [],
                allOrIndividual: 'All',
                codeOrName: 'Code',
                query: '',
                fromDate: '',
                toDate: '',
                mode: 'Late By'
            },
            {
                keepDefaultValues: false,
                keepErrors: false,
                keepDirty: false,
                keepTouched: false,
                keepIsValid: false
            }
        );

        // Explicitly clear all errors to ensure a clean state
        // Using setTimeout to ensure it runs after any immediate re-validation triggered by reset()
        setTimeout(() => {
            clearErrors();
        }, 0);

        // Also clear the query cache so the grid results are removed from view
        // Using setQueryData(..., null) is more explicit and ensures the UI observer
        // immediately sees the change and hides the report section.
        queryClient.setQueryData([HRMS_QUERY_KEYS.EMPLOYEE_LATEIN_EARLYOUT_REPORT, {}], null);
    };

    return (
        <div className={`${className}`}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='space-y-4'>
                    <div className='rounded-lg bg-white p-6 shadow'>
                        <div className='grid grid-cols-1 items-center gap-10 lg:grid-cols-3'>
                            {/* Type */}
                            <div className='col-span-1'>
                                <Label className='mb-2 block font-medium text-gray-700 text-sm'>
                                    Type <span className='ml-1 text-red-500'>*</span>
                                </Label>
                                <Controller
                                    name='type'
                                    control={control}
                                    render={({ field }) => (
                                        <MultiSelect
                                            options={groupTypesDataTransformed.map((gt: any) => ({
                                                label: gt.name,
                                                value: String(gt.id)
                                            }))}
                                            onValueChange={(values) => field.onChange(values)}
                                            defaultValue={field.value || []}
                                            placeholder={isGroupTypesLoading ? 'Loading...' : 'Select Group Types'}
                                            className={`w-full ${errors.type ? 'border-red-500' : ''} `}
                                            maxHeight={240}
                                            disabled={isGroupTypesLoading || groupTypesDataTransformed.length === 0}
                                        />
                                    )}
                                />
                                {errors.type && <FormError>{errors.type.message}</FormError>}
                            </div>

                            {/* Department */}
                            <div className='col-span-1'>
                                <Label className='mb-2 block font-medium text-gray-700 text-sm'>
                                    Department <span className='ml-1 text-red-500'>*</span>
                                </Label>
                                <Controller
                                    name='department'
                                    control={control}
                                    render={({ field }) => (
                                        <MultiSelect
                                            options={departmentsDataTransformed.map((dept: any) => ({
                                                label: dept.name,
                                                value: String(dept.id)
                                            }))}
                                            onValueChange={(values) => field.onChange(values)}
                                            defaultValue={field.value || []}
                                            placeholder={isDepartmentsLoading ? 'Loading...' : 'Select Departments'}
                                            className={`w-full ${errors.department ? 'border-red-500' : ''} `}
                                            maxHeight={240}
                                            disabled={isDepartmentsLoading || departmentsDataTransformed.length === 0}
                                        />
                                    )}
                                />
                                {errors.department && <FormError>{errors.department.message}</FormError>}
                            </div>

                            {/* Designation */}
                            <div className='col-span-1'>
                                <Label className='mb-2 block font-medium text-gray-700 text-sm'>
                                    Designation <span className='ml-1 text-red-500'>*</span>
                                </Label>
                                <Controller
                                    name='designation'
                                    control={control}
                                    render={({ field }) => (
                                        <MultiSelect
                                            options={designationsDataTransformed.map((desg: any) => ({
                                                label: desg.name,
                                                value: String(desg.id)
                                            }))}
                                            onValueChange={(values) => field.onChange(values)}
                                            defaultValue={field.value || []}
                                            placeholder={isDesignationsLoading ? 'Loading...' : 'Select Designations'}
                                            className={`w-full ${errors.designation ? 'border-red-500' : ''}`}
                                            maxHeight={240}
                                            disabled={isDesignationsLoading || designationsDataTransformed.length === 0}
                                        />
                                    )}
                                />
                                {errors.designation && <FormError>{errors.designation.message}</FormError>}
                            </div>

                            {/* All/Individual */}
                            <div className='col-span-1'>
                                <Label className='mb-2 block font-medium text-gray-700 text-sm'>
                                    All / Individual <span className='ml-1 text-red-500'>*</span>
                                </Label>
                                <Controller
                                    name='allOrIndividual'
                                    control={control}
                                    render={({ field }) => (
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger className={errors.allOrIndividual ? 'border-red-500' : ''}>
                                                <SelectValue placeholder='Select' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value='All'>All</SelectItem>
                                                <SelectItem value='Individual'>Individual</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.allOrIndividual && <FormError>{errors.allOrIndividual.message}</FormError>}
                            </div>

                            {/* Employee - Only show when Individual is selected */}
                            {allOrIndividualValue === 'Individual' && (
                                <div className='col-span-1'>
                                    <Label className='mb-2 block font-medium text-gray-700 text-sm'>
                                        Employee <span className='ml-1 text-red-500'>*</span>
                                    </Label>
                                    {/* <Controller
                                        name='query'
                                        control={control}
                                        render={({ field }) => (
                                            <MultiSelect
                                                options={employeesDataTransformed.map((emp: any) => ({
                                                    label: `${emp.employeeName} - [${emp.employeeCode}]`,
                                                    value: String(emp.id)
                                                }))}
                                                onValueChange={(values) => field.onChange(values)}
                                                defaultValue={field.value || []}
                                                placeholder={employeesDataTransformed.length > 0 ? "Select Employees" : "No employees available"}
                                                className={`w-full ${errors.query ? 'border-red-500' : ''}`}
                                                maxHeight={240}
                                            />
                                        )}
                                    /> */}
                                    <Controller
                                        name='query'
                                        control={control}
                                        render={({ field }) => (
                                            <Select value={field.value || ''} onValueChange={field.onChange}>
                                                <SelectTrigger className={errors.query ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder={isEmployeesLoading ? 'Loading...' : 'Select Employee'} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {employeesDataTransformed.length === 0 ? (
                                                        <div className='p-4 text-center text-muted-foreground text-sm'>
                                                            No employees found for the selected criteria.
                                                        </div>
                                                    ) : (
                                                        (employeesDataTransformed as any[]).map((emp: any) => {
                                                            return (
                                                                <SelectItem key={emp.id} value={emp.id?.toString() || ''}>
                                                                    {emp.employeeName} - [{emp.employeeCode}]
                                                                </SelectItem>
                                                            );
                                                        })
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.query && <FormError>{errors.query.message}</FormError>}
                                </div>
                            )}

                            {/* From Date */}
                            <div className='col-span-1'>
                                <Label className='mb-2 block font-medium text-gray-700 text-sm'>
                                    From Date <span className='ml-1 text-red-500'>*</span>
                                </Label>
                                <Controller
                                    name='fromDate'
                                    control={control}
                                    render={({ field }) => (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    type='button'
                                                    variant='outline'
                                                    className={cn(
                                                        'w-full justify-start text-left font-normal',
                                                        !field.value && 'text-muted-foreground',
                                                        errors.fromDate && 'border-red-500'
                                                    )}>
                                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                                    {field.value ? format(new Date(field.value), 'dd/MM/yyyy') : 'From date'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className='w-auto p-0' align='start'>
                                                <CalendarYear
                                                    mode='single'
                                                    selected={field.value ? new Date(field.value) : undefined}
                                                    disabled={[{ after: today }]}
                                                    onSelect={(date: Date | undefined) => {
                                                        if (date) {
                                                            const year = date.getFullYear();
                                                            const month = String(date.getMonth() + 1).padStart(2, '0');
                                                            const day = String(date.getDate()).padStart(2, '0');
                                                            const formattedFromDate = `${year}-${month}-${day}`;
                                                            field.onChange(formattedFromDate);

                                                            const nextMonthDate = addMonths(date, 1);
                                                            const nextYear = nextMonthDate.getFullYear();
                                                            const nextMonth = String(nextMonthDate.getMonth() + 1).padStart(2, '0');
                                                            const nextDay = String(nextMonthDate.getDate()).padStart(2, '0');
                                                            // setValue('toDate', `${nextYear}-${nextMonth}-${nextDay}`);
                                                        } else {
                                                            field.onChange('');
                                                            setValue('toDate', '');
                                                        }
                                                    }}
                                                    captionLayout='dropdown'
                                                    fromYear={2000}
                                                    toYear={2050}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    )}
                                />
                                {errors.fromDate && <FormError>{errors.fromDate.message}</FormError>}
                            </div>

                            {/* To Date */}
                            <div className='col-span-1'>
                                <Label className='mb-2 block font-medium text-gray-700 text-sm'>
                                    To Date <span className='ml-1 text-red-500'>*</span>
                                </Label>
                                <Controller
                                    name='toDate'
                                    control={control}
                                    render={({ field }) => (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    type='button'
                                                    variant='outline'
                                                    className={cn(
                                                        'w-full justify-start text-left font-normal',
                                                        !field.value && 'text-muted-foreground',
                                                        errors.toDate && 'border-red-500'
                                                    )}>
                                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                                    {field.value ? format(new Date(field.value), 'dd/MM/yyyy') : 'To date'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className='w-auto p-0' align='start'>
                                                <CalendarYear
                                                    mode='single'
                                                    selected={field.value ? new Date(field.value) : undefined}
                                                    disabled={
                                                        fromDateObject ? [{ before: fromDateObject }, { after: today }] : [{ after: today }]
                                                    }
                                                    onSelect={(date: Date | undefined) => {
                                                        if (date) {
                                                            const year = date.getFullYear();
                                                            const month = String(date.getMonth() + 1).padStart(2, '0');
                                                            const day = String(date.getDate()).padStart(2, '0');
                                                            field.onChange(`${year}-${month}-${day}`);
                                                        } else {
                                                            field.onChange('');
                                                        }
                                                    }}
                                                    captionLayout='dropdown'
                                                    fromYear={2000}
                                                    toYear={2050}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    )}
                                />
                                {errors.toDate && <FormError>{errors.toDate.message}</FormError>}
                            </div>

                            {/* Mode */}
                            <div className='col-span-1'>
                                <Label className='mb-2 block font-medium text-gray-700 text-sm'>
                                    Mode <span className='ml-1 text-red-500'>*</span>
                                </Label>
                                <Controller
                                    name='mode'
                                    control={control}
                                    render={({ field }) => (
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger className={errors.mode ? 'border-red-500' : ''}>
                                                <SelectValue placeholder='Select Mode' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value='Late By'>Late By</SelectItem>
                                                <SelectItem value='Early Out'>Early Out</SelectItem>
                                                <SelectItem value='Late In Early Out'>Late In Early Out</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.mode && <FormError>{errors.mode.message}</FormError>}
                            </div>
                        </div>
                    </div>

                    {/* Root Error */}
                    {errors.root && <FormError>{errors.root.message}</FormError>}
                </div>

                {/* Action Buttons */}
                <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={handleReset}
                        disabled={isSubmitting}
                        className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'>
                        Reset
                    </Button>
                    <Button
                        type='submit'
                        disabled={isSubmitting}
                        className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'
                        isLoading={isSubmitting}
                        loadingText='Searching...'>
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' />
                            Search
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
