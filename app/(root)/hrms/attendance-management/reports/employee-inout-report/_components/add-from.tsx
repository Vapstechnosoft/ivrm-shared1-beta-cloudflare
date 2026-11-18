'use client';

import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { FormError } from '@/components/ui/extension/field';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HRMS_QUERY_KEYS } from '@/constants/query-keys';
import {
    useReportDepartments,
    useReportDesignations,
    useReportEmployeesByGroupTypeDeptAndDesignation,
    useReportGroupTypes
} from '@/hooks/hrms/useReports';
import { employeeInOutReportFilterSchema } from '@/schemas/hrms/attendance-management-schemas';
import { getEmployeeInOutReport } from '@/server/hrms/hrmsConfig/reports/employee-inout-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { addMonths } from 'date-fns';
import { Save } from 'lucide-react';
import { useMemo } from 'react';
import { Label } from 'react-aria-components';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof employeeInOutReportFilterSchema>;

interface AddEmployeeInOutReportFormProps {
    onSuccess?: () => void;
    className?: string;
    groupTypes?: Array<{ label: string; value: string }>;
    onTimeFilterChange?: (v: string | undefined) => void;
}

export default function AddEmployeeInOutReportForm({
    onSuccess,
    className = '',
    groupTypes = [],
    onTimeFilterChange
}: AddEmployeeInOutReportFormProps) {
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
        resolver: zodResolver(employeeInOutReportFilterSchema),
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
            timeInTimeOut: 'Time In'
        }
    });

    const allOrIndividualValue = watch('allOrIndividual');
    const fromDateValue = watch('fromDate');

    const watchedType = watch('type') || [];
    const watchedDepartment = watch('department') || [];
    const watchedDesignation = watch('designation') || [];

    const groupTypeIds = watchedType.map(Number).filter(Boolean);
    const deptIds = watchedDepartment.map(Number).filter(Boolean);
    const desigIds = watchedDesignation.map(Number).filter(Boolean);

    const fromDateObject = fromDateValue ? new Date(fromDateValue) : undefined;
    const maxToDate = fromDateObject ? addMonths(fromDateObject, 1) : undefined;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const effectiveToDateMax = maxToDate && maxToDate < today ? maxToDate : today;

    console.log('Selected GroupType IDs:', groupTypeIds);
    console.log('Selected Department IDs:', deptIds);
    console.log('Selected Designation IDs:', desigIds);

    const { data: groupTypesData, isLoading: isGroupTypesLoading } = useReportGroupTypes();
    const { data: departmentsData, isLoading: isDepartmentsLoading } = useReportDepartments(groupTypeIds.toString());
    const { data: designationsData, isLoading: isDesignationsLoading } = useReportDesignations(groupTypeIds.toString(), deptIds.toString());
    const { data: employeesData, isLoading: isEmployeesLoading } = useReportEmployeesByGroupTypeDeptAndDesignation(
        groupTypeIds,
        deptIds,
        desigIds
    );

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
        let list = employeesData?.data || employeesData;

        // Handle nested array if present (e.g., response.data.employeeNames)
        if (list && typeof list === 'object' && !Array.isArray(list)) {
            list = list.employeeNames || list.data || list;
        }

        if (!list || !Array.isArray(list)) return [];

        return list
            .map((emp: any) => {
                const id = emp.HRME_Id || emp.hrmE_Id || emp.id || emp.key;
                if (id == null) return null;

                const firstName = (emp.HRME_EmployeeFirstName || emp.hrmE_EmployeeFirstName || '').trim();
                const middleName = (emp.HRME_EmployeeMiddleName || emp.hrmE_EmployeeMiddleName || '').trim();
                const lastName = (emp.HRME_EmployeeLastName || emp.hrmE_EmployeeLastName || '').trim();

                const employeeName =
                    emp.employeeFullName ||
                    emp.hrmE_EmployeeFullName ||
                    [firstName, middleName, lastName].filter(Boolean).join(' ') ||
                    emp.value ||
                    emp.employeeName ||
                    'Unknown Employee';

                const employeeCode = emp.HRME_EmployeeCode || emp.hrmE_EmployeeCode || emp.employeeCode || id.toString();

                return {
                    id: Number(id),
                    employeeCode,
                    employeeName
                };
            })
            .filter(Boolean);
    }, [employeesData]);

    console.log('employeesDataTransformed', employeesDataTransformed);

    const onSubmit: SubmitHandler<FormFields> = async (data: FormFields) => {
        try {
            console.log('form data', data);
            // Determine employee IDs as an array of numbers
            let hrmeIds: number[] = [];
            if (data.allOrIndividual === 'Individual') {
                hrmeIds = data.query ? [Number(data.query)] : [];
            } else if (data.allOrIndividual === 'All') {
                hrmeIds = employeesDataTransformed.map((emp: any) => Number(emp.id));
            }

            const payload = {
                from_date: data.fromDate,
                to_date: data.toDate,
                hrme_ids: hrmeIds
            };
            console.log("inout",payload);

            const response = (await getEmployeeInOutReport(payload)) as any;

            // Allow filtering logic *after* getting the API response
            if (response.success && response.data?.report_data) {
                response.timeInTimeOut = data.timeInTimeOut;
                response.fromDate = data.fromDate;
                response.toDate = data.toDate;
            }

            console.log('response', response);

            if (response.success) {
                const isDataEmpty = !response.data?.report_data || response.data.report_data.length === 0;

                if (isDataEmpty) {
                    toast.error('No Employee In/Out Reports Found');
                } else {
                    toast.success(response.message || 'Report generated successfully');
                }

                try {
                    if (response?.total != null) {
                        queryClient.setQueryData([HRMS_QUERY_KEYS.EMPLOYEE_INOUT_REPORT, {}], response);
                    } else if (Array.isArray(response?.data)) {
                        const parseParam = (k: string) => {
                            // noop
                            return undefined;
                        };
                        const page = parseParam('page') || 1;
                        const pageSize = parseParam('page_size') || 10;
                        const total = response.data.length;
                        const start = (page - 1) * pageSize;
                        const pageData = response.data.slice(start, start + pageSize);

                        queryClient.setQueryData([HRMS_QUERY_KEYS.EMPLOYEE_INOUT_REPORT, {}], {
                            data: pageData,
                            total,
                            success: true,
                            message: response.message
                        });
                    } else {
                        queryClient.setQueryData([HRMS_QUERY_KEYS.EMPLOYEE_INOUT_REPORT, {}], response);
                    }
                } catch (e) {
                    // noop
                }

                // Do NOT reset form fields as per user request to preserve selection
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
                toDate: ''
            },
            {
                keepDefaultValues: false,
                keepErrors: false,
                keepDirty: false,
                keepTouched: false,
                keepIsValid: false
            }
        );
        // Explicitly clear all errors to ensure a clean state on the first click
        // Using setTimeout to ensure it runs after any immediate re-validation triggered by reset()
        setTimeout(() => {
            clearErrors();
        }, 0);
        onTimeFilterChange?.('Time In');
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
                                            placeholder={`${isGroupTypesLoading ? 'Loading...' : 'Select Group Types'}`}
                                            className={`w-full ${errors.type ? 'border-red-500' : ''}`}
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
                                            placeholder={`${isDepartmentsLoading ? 'Loading...' : 'Select Departments'}`}
                                            className={`w-full ${errors.department ? 'border-red-500' : ''}`}
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
                                            placeholder={`${isDesignationsLoading ? 'Loading...' : 'Select Designations'}`}
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
                                    <Controller
                                        name='query'
                                        control={control}
                                        render={({ field }) => (
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger className={errors.query ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder={`${isEmployeesLoading ? 'Loading...' : 'Select Employee'}`} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {employeesDataTransformed.length === 0 ? (
                                                        <div className='p-4 text-center text-gray-500 text-sm'>No employees found</div>
                                                    ) : (
                                                        employeesDataTransformed.map((emp: any) => (
                                                            <SelectItem key={emp.id} value={String(emp.id)}>
                                                                {emp.employeeName} - [{emp.employeeCode}]
                                                            </SelectItem>
                                                        ))
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
                                        <DatePicker
                                            date={field.value ? new Date(field.value) : undefined}
                                            disabled={[{ after: today }]}
                                            setDate={(date) => {
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
                                                    setValue('toDate', `${nextYear}-${nextMonth}-${nextDay}`);
                                                } else {
                                                    field.onChange('');
                                                    setValue('toDate', '');
                                                }
                                            }}
                                            placeholder='From date'
                                            className={errors.fromDate ? 'border-red-500' : ''}
                                        />
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
                                        <DatePicker
                                            date={field.value ? new Date(field.value) : undefined}
                                            disabled={
                                                fromDateObject
                                                    ? [{ before: fromDateObject }, { after: effectiveToDateMax }]
                                                    : [{ after: today }]
                                            }
                                            setDate={(date) => {
                                                if (date) {
                                                    const year = date.getFullYear();
                                                    const month = String(date.getMonth() + 1).padStart(2, '0');
                                                    const day = String(date.getDate()).padStart(2, '0');
                                                    field.onChange(`${year}-${month}-${day}`);
                                                } else {
                                                    field.onChange('');
                                                }
                                            }}
                                            placeholder='To date'
                                            className={errors.toDate ? 'border-red-500' : ''}
                                        />
                                    )}
                                />
                                {errors.toDate && <FormError>{errors.toDate.message}</FormError>}
                            </div>

                            {/* Employee and Code  */}
                            <div className='col-span-1'>
                                <Label className='mb-2 block font-medium text-gray-700 text-sm'>Code & Name</Label>
                                <Controller
                                    name='codeOrName'
                                    control={control}
                                    render={({ field }) => (
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Code or Name' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value='Code'>Code :: Name</SelectItem>
                                                <SelectItem value='Name'>Name :: Code</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>

                            {/* Time In/Time Out */}
                            <div className='col-span-1'>
                                <Label className='mb-2 block font-medium text-gray-700 text-sm'>Time In/Out</Label>
                                <Controller
                                    name='timeInTimeOut'
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            value={field.value}
                                            onValueChange={(value) => {
                                                field.onChange(value);
                                                onTimeFilterChange?.(value);
                                            }}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Time In/Out' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value='Time In'>Time In</SelectItem>
                                                <SelectItem value='Time Out'>Time Out</SelectItem>
                                                <SelectItem value='In Out'>In Out</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.timeInTimeOut && <FormError>{errors.timeInTimeOut.message}</FormError>}
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
