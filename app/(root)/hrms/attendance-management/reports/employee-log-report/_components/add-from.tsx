'use client';

import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { FormError } from '@/components/ui/extension/field';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HRMS_QUERY_KEYS } from '@/constants/query-keys';
import { useLeaveYearDropdown } from '@/hooks/hrms/useMasters';
import {
    useReportDepartments,
    useReportDesignations,
    useReportEmployeesByGroupTypeDeptAndDesignation,
    useReportGroupTypes
} from '@/hooks/hrms/useReports';
import { employeeLogReportFilterSchema } from '@/schemas/hrms/attendance-management-schemas';
import { getEmployeeLogReport } from '@/server/hrms/hrmsConfig/reports/employee-log-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { addMonths, format } from 'date-fns';
import { Save } from 'lucide-react';
import { useMemo } from 'react';
import { Label } from 'react-aria-components';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof employeeLogReportFilterSchema>;

interface AddEmployeeLogReportFormProps {
    onSuccess?: () => void;
    className?: string;
    searchParams?: any;
    groupTypes?: Array<{ label: string; value: string }>;
}

export default function AddEmployeeLogReportForm({
    onSuccess,
    className = '',
    searchParams,
    groupTypes = []
}: AddEmployeeLogReportFormProps) {
    const queryClient = useQueryClient();
    const { data: yearsData } = useLeaveYearDropdown();

    const {
        handleSubmit,
        control,
        reset,
        watch,
        setValue,
        clearErrors,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(employeeLogReportFilterSchema),
        mode: 'onChange',
        defaultValues: {
            type: [],
            department: [],
            designation: [],
            allOrIndividual: 'All',
            codeOrName: 'Code',
            query: '',
            dateMode: 'Date',
            date: '',
            month: '',
            year: '',
            fromDate: '',
            toDate: '',
            metric: 'Punch Time'
        }
    });

    const allOrIndividualValue = watch('allOrIndividual');
    const dateModeValue = watch('dateMode');
    const fromDateValue = watch('fromDate');
    const watchedType = watch('type') || [];
    const watchedDepartment = watch('department') || [];
    const watchedDesignation = watch('designation') || [];

    const fromDateObject = fromDateValue ? new Date(fromDateValue) : undefined;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const groupTypeIds = watchedType.map(Number).filter(Boolean);
    const deptIds = watchedDepartment.map(Number).filter(Boolean);
    const desigIds = watchedDesignation.map(Number).filter(Boolean);

    console.log('Selected Group Type IDs', groupTypeIds);
    console.log('Selected Department IDs', deptIds);
    console.log('Selected Designation IDs', desigIds);

    // Cascading Hooks
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

                // const firstName = (emp.HRME_EmployeeFirstName || emp.hrmE_EmployeeFirstName || '').trim();
                // const middleName = (emp.HRME_EmployeeMiddleName || emp.hrmE_EmployeeMiddleName || '').trim();
                // const lastName = (emp.HRME_EmployeeLastName || emp.hrmE_EmployeeLastName || '').trim();

                const employeeName = emp.employeeFullName;
                // [firstName, middleName, lastName].filter(Boolean).join(' ') ||
                // emp.value ||
                // emp.employeeName ||
                // 'Unknown Employee';

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
            console.log('form data', data);
            const punchTypeMap: Record<string, string> = {
                'Punch Time': 'punch',
                'Late In': 'late',
                'Early Out': 'early'
            };

            let hrmeIds = '0';
            if (data.allOrIndividual === 'Individual') {
                hrmeIds = data.query || '0';
            } else if (data.allOrIndividual === 'All') {
                const allIds = (employeesDataTransformed as any[]).map((emp: any) => emp.id).join(',');
                hrmeIds = allIds || '0';
            }

            let select_date = '';
            let select_month = '';
            let select_year = '';
            let from_date = '';
            let to_date = '';

            if (data.dateMode === 'Date' && data.date) {
                const d = new Date(data.date);
                select_date = format(d, 'yyyy-MM-dd');
                select_month = format(d, 'MMMM');
                select_year = format(d, 'yyyy');
                from_date = select_date;
                to_date = select_date;
                console.log('Selected Month', select_month, 'Selected Year', select_year);
            } else if (data.dateMode === 'Monthly' && data.month && data.year) {
                select_month = data.month;
                select_year = data.year;

                // Take today's day number (e.g. 20) and add it to the selected month/year
                const todayDay = new Date().getDate();
                const d = new Date(`${data.month} 1, ${data.year}`);

                // Prevent date overflow (e.g. if today is 31st, but they select February)
                const lastDayOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
                d.setDate(Math.min(todayDay, lastDayOfMonth));

                select_date = format(d, 'yyyy-MM-dd');
                from_date = select_date;
                to_date = select_date;
            } else if (data.dateMode === 'From Date' && data.fromDate && data.toDate) {
                const from = new Date(data.fromDate);
                const to = new Date(data.toDate);

                from_date = format(from, 'yyyy-MM-dd');
                to_date = format(to, 'yyyy-MM-dd');

                // Optional: derive month/year from fromDate (or you can adjust logic)
                select_month = format(from, 'MMMM');
                select_year = format(from, 'yyyy');
            }

            const payload = {
                hrme_ids: hrmeIds,
                select_date,
                select_month,
                select_year,
                from_date,
                to_date,
                punch_type: punchTypeMap[data.metric] || 'punch'
            };
            console.log('Payload', payload);
            const response = await getEmployeeLogReport(payload);
            console.log('Response', response);
            if (response.success && response.data?.length > 0) {
                toast.success(response.message || 'Report generated successfully');
                response.fromdate = from_date;
                response.todate = to_date;
                try {
                    queryClient.setQueryData([HRMS_QUERY_KEYS.EMPLOYEE_LOG_REPORT, {}], response);
                } catch (e) {
                    console.error('Error setting query data:', e);
                }
            } else if (response.success && response.data?.length == 0) {
                toast.error('No data found');
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
                dateMode: 'Date',
                date: '',
                month: '',
                year: '',
                fromDate: '',
                toDate: '',
                metric: 'Punch Time'
            },
            {
                keepDefaultValues: false,
                keepErrors: false,
                keepDirty: false,
                keepTouched: false,
                keepIsValid: false
            }
        );
        setTimeout(() => {
            clearErrors();
        }, 0);
        queryClient.setQueryData([HRMS_QUERY_KEYS.EMPLOYEE_LOG_REPORT, {}], null);
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
                                                value: gt.id?.toString() || ''
                                            }))}
                                            onValueChange={(values) => {
                                                field.onChange(values);
                                                setValue('department', []);
                                                setValue('designation', []);
                                                setValue('query', '');
                                            }}
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
                                            options={departmentsDataTransformed.map((d: any) => ({
                                                label: d.name,
                                                value: d.id?.toString() || ''
                                            }))}
                                            onValueChange={(values) => {
                                                field.onChange(values);
                                                setValue('designation', []);
                                                setValue('query', '');
                                            }}
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
                                            options={designationsDataTransformed.map((ds: any) => ({
                                                label: ds.name,
                                                value: ds.id?.toString() || ''
                                            }))}
                                            onValueChange={(values) => {
                                                field.onChange(values);
                                                setValue('query', '');
                                            }}
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

                            {/* Date Mode */}
                            <div className='col-span-1'>
                                <Label className='mb-2 block font-medium text-gray-700 text-sm'>
                                    Date Mode <span className='ml-1 text-red-500'>*</span>
                                </Label>
                                <Controller
                                    name='dateMode'
                                    control={control}
                                    render={({ field }) => (
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger className={errors.dateMode ? 'border-red-500' : ''}>
                                                <SelectValue placeholder='Select Date Mode' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value='Date'>Date</SelectItem>
                                                <SelectItem value='Monthly'>Monthly</SelectItem>
                                                <SelectItem value='From Date'>From Date</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.dateMode && <FormError>{errors.dateMode.message}</FormError>}
                            </div>

                            {/* Date Field - Show when Date mode is selected */}
                            {dateModeValue === 'Date' && (
                                <div className='col-span-1'>
                                    <Label className='mb-2 block font-medium text-gray-700 text-sm'>
                                        Date <span className='ml-1 text-red-500'>*</span>
                                    </Label>
                                    <Controller
                                        name='date'
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
                                                placeholder='Select date'
                                                className={errors.date ? 'border-red-500' : ''}
                                                disabled={[{ after: today }]}
                                            />
                                        )}
                                    />
                                    {errors.date && <FormError>{errors.date.message}</FormError>}
                                </div>
                            )}

                            {/* Monthly Field - Show when Monthly mode is selected */}
                            {dateModeValue === 'Monthly' && (
                                <>
                                    <div className='col-span-1'>
                                        <Label className='mb-2 block font-medium text-gray-700 text-sm'>
                                            Month <span className='ml-1 text-red-500'>*</span>
                                        </Label>
                                        <Controller
                                            name='month'
                                            control={control}
                                            render={({ field }) => (
                                                <Select value={field.value || ''} onValueChange={field.onChange}>
                                                    <SelectTrigger className={errors.month ? 'border-red-500' : ''}>
                                                        <SelectValue placeholder='Select Month' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {[
                                                            { value: '01', label: 'January' },
                                                            { value: '02', label: 'February' },
                                                            { value: '03', label: 'March' },
                                                            { value: '04', label: 'April' },
                                                            { value: '05', label: 'May' },
                                                            { value: '06', label: 'June' },
                                                            { value: '07', label: 'July' },
                                                            { value: '08', label: 'August' },
                                                            { value: '09', label: 'September' },
                                                            { value: '10', label: 'October' },
                                                            { value: '11', label: 'November' },
                                                            { value: '12', label: 'December' }
                                                        ].map((m) => (
                                                            <SelectItem key={m.value} value={m.label}>
                                                                {m.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.month && <FormError>{errors.month.message}</FormError>}
                                    </div>
                                    <div className='col-span-1'>
                                        <Label className='mb-2 block font-medium text-gray-700 text-sm'>
                                            Year <span className='ml-1 text-red-500'>*</span>
                                        </Label>
                                        <Controller
                                            name='year'
                                            control={control}
                                            render={({ field }) => (
                                                <Select value={field.value || ''} onValueChange={field.onChange}>
                                                    <SelectTrigger className={errors.year ? 'border-red-500' : ''}>
                                                        <SelectValue placeholder='Select Year' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {yearsData?.data?.map((y: any) => (
                                                            <SelectItem key={y.hrmlY_Id} value={y.hrmlY_LeaveYear?.toString() || ''}>
                                                                {y.hrmlY_LeaveYear}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.year && <FormError>{errors.year.message}</FormError>}
                                    </div>
                                </>
                            )}

                            {/* From Date and To Date Fields - Show when From Date mode is selected */}
                            {dateModeValue === 'From Date' && (
                                <>
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
                                                    disabled={
                                                        fromDateObject ? [{ before: fromDateObject }, { after: today }] : [{ after: today }]
                                                    }
                                                />
                                            )}
                                        />
                                        {errors.toDate && <FormError>{errors.toDate.message}</FormError>}
                                    </div>
                                </>
                            )}

                            {/* Metric */}
                            <div className='col-span-1'>
                                <Label className='mb-2 block font-medium text-gray-700 text-sm'>
                                    Mode <span className='ml-1 text-red-500'>*</span>
                                </Label>
                                <Controller
                                    name='metric'
                                    control={control}
                                    render={({ field }) => (
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger className={errors.metric ? 'border-red-500' : ''}>
                                                <SelectValue placeholder='Select Mode' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value='Punch Time'>Punch Time</SelectItem>
                                                <SelectItem value='Late In'>Late In</SelectItem>
                                                <SelectItem value='Early Out'>Early Out</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.metric && <FormError>{errors.metric.message}</FormError>}
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
