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
import { employeeMonthlyReportFilterSchema } from '@/schemas/hrms/attendance-management-schemas';
import { getEmployeeMonthlyReport } from '@/server/hrms/hrmsConfig/reports/employee-monthly-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { addMonths } from 'date-fns';
import { Save } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { Label } from 'react-aria-components';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof employeeMonthlyReportFilterSchema>;

interface AddEmployeeMonthlyReportFormProps {
    onSuccess?: () => void;
    className?: string;
    searchParams?: any;
    groupTypes?: Array<{ label: string; value: string }>;
    onSearchParamsChange?: (params: Record<string, string | string[] | undefined>) => void;
}

export default function AddEmployeeMonthlyReportForm({
    onSuccess,
    className = '',
    searchParams,
    onSearchParamsChange,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    groupTypes = []
}: AddEmployeeMonthlyReportFormProps) {
    const queryClient = useQueryClient();
    const router = useRouter();
    const pathname = usePathname();

    const {
        handleSubmit,
        control,
        reset,
        watch,
        clearErrors,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(employeeMonthlyReportFilterSchema),
        mode: 'onSubmit',
        defaultValues: {
            type: [],
            department: [],
            designation: [],
            allOrIndividual: 'All',
            employeeIds: '',
            fromDate: '',
            toDate: '',
            reportOptions: []
        }
    });

    const allOrIndividualValue = watch('allOrIndividual');
    const fromDateValue = watch('fromDate');
    const watchedType = watch('type') || [];
    const watchedDepartment = watch('department') || [];
    const watchedDesignation = watch('designation') || [];

    const fromDateObject = fromDateValue ? new Date(fromDateValue) : undefined;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const groupTypeIds = useMemo(() => watchedType.map(Number).filter(Boolean), [watchedType]);
    const deptIds = useMemo(() => watchedDepartment.map(Number).filter(Boolean), [watchedDepartment]);
    const desigIds = useMemo(() => watchedDesignation.map(Number).filter(Boolean), [watchedDesignation]);

    const { data: groupTypesData, isLoading: isGroupTypesLoading } = useReportGroupTypes();
    const { data: departmentsData, isLoading: isDepartmentsLoading } = useReportDepartments(groupTypeIds.join(','));
    const { data: designationsData, isLoading: isDesignationsLoading } = useReportDesignations(groupTypeIds.join(','), deptIds.join(','));
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
            if (data.allOrIndividual === 'Individual' && data.employeeIds && data.employeeIds.length > 0) {
                hrmeIds = data.employeeIds.toString();
            } else if (data.allOrIndividual === 'All') {
                const allIds = employeesDataTransformed.map((emp: any) => emp.id).join(',');
                hrmeIds = allIds || '0';
            }

            const payload = {
                from_date: data.fromDate ? data.fromDate.split('T')[0] : '',
                to_date: data.toDate ? data.toDate.split('T')[0] : '',
                hrme_ids: hrmeIds,
                type: 'monthly'
            };

            console.log('Submitting with payload:', payload);

            const response = await getEmployeeMonthlyReport(payload, searchParams);
            console.log('API response:', response);

            const isSuccess = response?.success ?? (Array.isArray(response) ? response.length > 0 : !!response?.data);

            if (isSuccess) {
                const reportItem = response?.data?.[0] || response?.[0];
                const parsedData = reportItem ? JSON.parse(reportItem?.report_data) : null;
                if(parsedData.length === 0) {
                    toast.warning('No data found for the selected criteria');
                    return;
                }
                toast.success(response?.message || 'Report generated successfully');

                const nextSearchParams: Record<string, string | string[]> = {
                    fromDate: data.fromDate,
                    toDate: data.toDate,
                    allOrIndividual: data.allOrIndividual
                };
                if (hrmeIds && hrmeIds.length < 1500) {
                    nextSearchParams.employee = hrmeIds;
                }

                if (data.type.length === 1) nextSearchParams.type = data.type[0];
                else if (data.type.length > 1) nextSearchParams.type = data.type;

                if (data.department.length === 1) nextSearchParams.department = data.department[0];
                else if (data.department.length > 1) nextSearchParams.department = data.department;

                if (data.designation.length === 1) nextSearchParams.designation = data.designation[0];
                else if (data.designation.length > 1) nextSearchParams.designation = data.designation;

                nextSearchParams.reportOptions = data.reportOptions || [];

                // Update local search params instead of updating the browser URL
                onSearchParamsChange?.(nextSearchParams);

                // Update cache with the new reportOptions so the next hook read is cached
                const cacheData = Array.isArray(response)
                    ? { data: response, success: true, reportOptions: data.reportOptions || [] }
                    : { ...response, reportOptions: data.reportOptions || [] };

                queryClient.setQueryData([HRMS_QUERY_KEYS.EMPLOYEE_MONTHLY_REPORT, nextSearchParams], cacheData);

                onSuccess?.();
            } else {
                toast.error(response?.message || 'Failed to generate report');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to generate report');
        }
    };

    const handleReset = () => {
        reset({
            type: [],
            department: [],
            designation: [],
            allOrIndividual: 'All',
            employeeIds: '',
            fromDate: '',
            toDate: '',
            reportOptions: []
        });
        clearErrors();
        onSearchParamsChange?.({});
        router.replace(pathname);
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
                                            placeholder={isDepartmentsLoading ? 'Loading...' : 'Select Departments'}
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
                                        name='employeeIds'
                                        control={control}
                                        render={({ field }) => (
                                            <MultiSelect
                                                options={employeesDataTransformed.map((emp: any) => ({
                                                    label: `${emp.employeeName} - [${emp.employeeCode}]`,
                                                    value: String(emp.id)
                                                }))}
                                                onValueChange={(values) => field.onChange(values)}
                                                defaultValue={field.value || []}
                                                placeholder='Select Employees'
                                                className={`w-full ${errors.employeeIds ? 'border-red-500' : ''}`}
                                                maxHeight={240}
                                            />
                                        )}
                                    /> */}
                                    <Controller
                                        name='employeeIds'
                                        control={control}
                                        render={({ field }) => (
                                            <Select value={field.value || ''} onValueChange={field.onChange}>
                                                <SelectTrigger className={errors.employeeIds ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder='Select Employee' />
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
                                    {errors.employeeIds && <FormError>{errors.employeeIds.message}</FormError>}
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
                                            setDate={(date) => {
                                                if (date) {
                                                    const year = date.getFullYear();
                                                    const month = String(date.getMonth() + 1).padStart(2, '0');
                                                    const day = String(date.getDate()).padStart(2, '0');
                                                    field.onChange(`${year}-${month}-${day}`);
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
                                            placeholder='From date'
                                            className={errors.fromDate ? 'border-red-500' : ''}
                                            disabled={[{ after: today }]}
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
                                            disabled={fromDateObject ? [{ before: fromDateObject }, { after: today }] : [{ after: today }]}
                                        />
                                    )}
                                />
                                {errors.toDate && <FormError>{errors.toDate.message}</FormError>}
                            </div>

                            {/* Report Options */}
                            <div className='col-span-1'>
                                <Label className='mb-2 block font-medium text-gray-700 text-sm'>Report Options</Label>
                                <Controller
                                    name='reportOptions'
                                    control={control}
                                    render={({ field }) => (
                                        <MultiSelect
                                            options={[
                                                { label: 'Total Working Days', value: 'Total Working Days' },
                                                { label: 'Show Holiday Punch', value: 'Show Holiday Punch' },
                                                { label: 'Format One', value: 'Format One' },
                                                { label: 'Date Of Joining', value: 'Date Of Joining' },
                                                { label: 'Total Absent Days', value: 'Total Absent Days' }
                                            ]}
                                            onValueChange={(values) => {
                                                field.onChange(values);
                                                onSearchParamsChange?.({
                                                    ...searchParams,
                                                    reportOptions: values
                                                });
                                            }}
                                            defaultValue={field.value || []}
                                            placeholder='Select Report Options'
                                            className='w-full'
                                            maxHeight={240}
                                        />
                                    )}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Root Error */}
                    {errors.root && <FormError>{errors.root.message}</FormError>}
                </div>

                {/* Action Buttons */}
                <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start md:justify-end'>
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
