'use client';

import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLeaveYearDropdown, useMonthDropdown } from '@/hooks/hrms/useMasters';
import {
    useReportDepartments,
    useReportDesignations,
    useReportEmployeesByGroupTypeDeptAndDesignation,
    useReportGroupTypes
} from '@/hooks/hrms/useReports';
import { useLoanReport } from '@/hooks/hrms/useReports';
import { getMasterInstitution } from '@/server/hrms/master-dropdown';
import { zodResolver } from '@hookform/resolvers/zod';
import { Printer, RefreshCw, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

// Define the form fields type
type LoanReportFormFields = {
    groupType: string[];
    department: string[];
    designation: string[];
    reportType: 'All' | 'Individual';
    month: string;
    year: string;
    employee: string;
};

// Zod schema for form validation
const LoanReportSchema = z
    .object({
        groupType: z.array(z.string()).min(1, 'Select at least one group type'),
        department: z.array(z.string()).min(1, 'Select at least one department'),
        designation: z.array(z.string()).min(1, 'Select at least one designation'),
        reportType: z.enum(['All', 'Individual']),
        month: z.string().optional().or(z.literal('')),
        year: z.string().optional().or(z.literal('')),
        employee: z.string().optional().or(z.literal(''))
    })
    .superRefine((data, ctx) => {
        if (data.reportType === 'All') {
            if (!data.month) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Month is required',
                    path: ['month']
                });
            }
            if (!data.year) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Year is required',
                    path: ['year']
                });
            }
        } else if (data.reportType === 'Individual') {
            if (!data.employee) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Employee is required',
                    path: ['employee']
                });
            }
        }
    });

export default function LoanReportPage() {
    const [isSearching, setIsSearching] = useState(false);
    const [reportData, setReportData] = useState<any>(null);
    const [institution, setInstitution] = useState<any>(null);
    const [resetKey, setResetKey] = useState<number>(0);

    const {
        control,
        handleSubmit,
        reset,
        setValue,
        watch,
        clearErrors,
        formState: { errors, isSubmitting }
    } = useForm<LoanReportFormFields>({
        resolver: zodResolver(LoanReportSchema),
        defaultValues: {
            groupType: [],
            department: [],
            designation: [],
            reportType: 'All',
            month: '',
            year: '',
            employee: ''
        },
        mode: 'onChange'
    });

    const watchReportType = watch('reportType');
    const watchedGroupType = watch('groupType');
    const watchedDepartment = watch('department');
    const watchedDesignation = watch('designation');

    const groupTypeIds = watchedGroupType?.join(',') || '';
    const deptIds = watchedDepartment?.join(',') || '';

    const { data: masterGroupTypes, isLoading: masterGroupTypesLoading, isError: masterGroupTypesError } = useReportGroupTypes();

    const {
        data: masterDepartments,
        isLoading: masterDepartmentsLoading,
        isError: masterDepartmentsError
    } = useReportDepartments(groupTypeIds);

    const {
        data: masterDesignations,
        isLoading: masterDesignationsLoading,
        isError: masterDesignationsError
    } = useReportDesignations(groupTypeIds, deptIds);

    const { data: masterMonths, isLoading: masterMonthsLoading, isError: masterMonthsError } = useMonthDropdown();

    const { data: masterYears, isLoading: masterYearsLoading, isError: masterYearsError } = useLeaveYearDropdown();

    const { data: employeesData, isLoading: isEmpLoading } = useReportEmployeesByGroupTypeDeptAndDesignation(
        watchedGroupType.map(Number),
        watchedDepartment.map(Number),
        watchedDesignation.map(Number)
    );

    const { mutateAsync: fetchLoanReport, isPending: isLoanReportPending } = useLoanReport();

    const groupTypeOptions =
        masterGroupTypes?.data?.map((item: any) => ({
            value: item.key.toString(),
            label: item.value
        })) || [];

    const DepartmentsOptions =
        masterDepartments?.data?.map((item: any) => ({
            value: item.hrmD_Id.toString(),
            label: item.hrmD_DepartmentName
        })) || [];

    const DesignationOptions =
        masterDesignations?.data?.map((item: any) => ({
            value: item.hrmdeS_Id.toString(),
            label: item.hrmdeS_DesignationName
        })) || [];

    const MonthsOptions =
        masterMonths?.data?.map((item: any) => ({
            value: item.key.toString(),
            label: item.value
        })) || [];

    const YearsOptions =
        masterYears?.data?.map((item: any) => ({
            value: item.hrmlY_Id.toString(),
            label: item.hrmlY_LeaveYear
        })) || [];

    const empOptions = useMemo(
        () =>
            employeesData?.data?.employeeNames?.map((e: any) => {
                const fullName = e.employeeFullName || e.hrme_employee_first_name || e.hrmE_EmployeeFirstName || '';
                return {
                    label: e.value || fullName || 'Unknown Employee',
                    value: String(e.key || e.hrme_id || e.hrmE_Id)
                };
            }) || [],
        [employeesData]
    );

    useEffect(() => {
        const fetchInstitution = async () => {
            try {
                const res = await getMasterInstitution();
                if (res?.data) {
                    setInstitution(Array.isArray(res.data) ? res.data[0] : res.data);
                }
            } catch (error) {
                console.error('Error fetching institution:', error);
            }
        };
        fetchInstitution();
    }, []);

    const onSearch = async (data: LoanReportFormFields) => {
        console.log('form data', data);
        setIsSearching(true);

        const year = YearsOptions.find((year: any) => year.value === data.year)?.label;
        const month = MonthsOptions.find((month: any) => month.value === data.month)?.label;
        const employees = empOptions.map((emp: any) => Number(emp.value)).toString();

        try {
            if (data.reportType === 'All') {
                const payload = {
                    hrelT_Year: Number(year),
                    hrelT_Month: month,
                    hrmE_Ids: employees
                };
                const response = await fetchLoanReport(payload);
                if (response.success && response.data.length > 0) {
                    setReportData(response.data);
                    toast.success('Data fetched successfully');
                } else {
                    toast.info('No data found');
                }
            } else {
                const payload = {
                    hrelT_Year: 0,
                    hrelT_Month: '',
                    hrmE_Ids: data.employee
                };
                const response = await fetchLoanReport(payload);
                if (response.success && response.data.length > 0) {
                    setReportData(response.data);
                    toast.success('Data fetched successfully');
                } else {
                    toast.info('No data found');
                }
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to generate report');
        } finally {
            setIsSearching(false);
        }
    };

    const handleReset = () => {
        reset({
            groupType: [],
            department: [],
            designation: [],
            reportType: 'All',
            month: '',
            year: '',
            employee: ''
        });
        setReportData(null);
        setResetKey((prev) => prev + 1);
        toast.info('Form has been reset');
    };
    const handlePrint = () => {
        window.print();
        toast.success('Print dialog opened');
    };

    const handleReportTypeChange = (value: 'All' | 'Individual') => {
        setValue('reportType', value);

        // Clear fields based on selection
        if (value === 'All') {
            setValue('employee', '');
        } else {
            setValue('month', '');
            setValue('year', '');
        }
    };

    const getTodayDate = () => {
        const today = new Date();
        return today.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // const getStatusColor = (status: string) => {
    //     switch (status.toLowerCase()) {
    //         case 'approved':
    //             return 'text-green-600 font-semibold';
    //         case 'pending':
    //             return 'text-yellow-600 font-semibold';
    //         case 'rejected':
    //             return 'text-red-600 font-semibold';
    //         default:
    //             return 'text-gray-600';
    //     }
    // };
    return (
        <>
            <style>
                {`
            @media print {
                body * {
                visibility: hidden;
                }

                #printable-report,
                #printable-report * {
                visibility: visible;
                }

                #printable-report {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                }
            }
            `}
            </style>
            <div className='min-h-screen p-8'>
                <div className='container space-y-4 p-1'>
                    <CollapsibleSection
                        title='Employee Loan Report'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                        <div className='space-y-6'>
                            <div className='mt-2 flex justify-center'>
                                <div className='space-y-2'>
                                    <Controller
                                        key={resetKey}
                                        name='reportType'
                                        control={control}
                                        render={({ field }) => (
                                            <RadioGroup
                                                onValueChange={(value: 'All' | 'Individual') => {
                                                    handleReportTypeChange(value);
                                                    field.onChange(value);
                                                }}
                                                value={field.value}
                                                className='flex items-center gap-6'>
                                                <div className='flex items-center space-x-2'>
                                                    <RadioGroupItem value='All' id='all' />
                                                    <Label htmlFor='all' className='cursor-pointer font-normal'>
                                                        All
                                                    </Label>
                                                </div>
                                                <div className='flex items-center space-x-2'>
                                                    <RadioGroupItem value='Individual' id='individual' />
                                                    <Label htmlFor='individual' className='cursor-pointer font-normal'>
                                                        Individual
                                                    </Label>
                                                </div>
                                            </RadioGroup>
                                        )}
                                    />
                                    {errors.reportType && <FormError>{errors.reportType.message}</FormError>}
                                </div>
                            </div>

                            <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
                                <div className='space-y-2'>
                                    <Label htmlFor='group-type' className='font-medium text-foreground text-sm'>
                                        Group Type: <span className='text-red-500'>*</span>
                                    </Label>
                                    <Controller
                                        key={resetKey}
                                        name='groupType'
                                        control={control}
                                        render={({ field }) => (
                                            <MultiSelect
                                                options={groupTypeOptions}
                                                defaultValue={field.value}
                                                onValueChange={field.onChange}
                                                placeholder={masterGroupTypesLoading ? 'Loading...' : 'Select Group Types'}
                                                disabled={masterGroupTypesLoading}
                                                className='w-full'
                                                maxHeight={240}
                                            />
                                        )}
                                    />
                                    {errors.groupType && <FormError>{errors.groupType.message}</FormError>}
                                </div>

                                <div className='space-y-2'>
                                    <Label htmlFor='department' className='font-medium text-foreground text-sm'>
                                        Department: <span className='text-red-500'>*</span>
                                    </Label>
                                    <Controller
                                        key={resetKey}
                                        name='department'
                                        control={control}
                                        render={({ field }) => (
                                            <MultiSelect
                                                options={DepartmentsOptions}
                                                defaultValue={field.value}
                                                onValueChange={field.onChange}
                                                placeholder={masterDepartmentsLoading ? 'Loading...' : 'Select Departments'}
                                                disabled={masterDepartmentsLoading || watchedGroupType?.length === 0}
                                                className='w-full'
                                                maxHeight={240}
                                            />
                                        )}
                                    />
                                    {errors.department && <FormError>{errors.department.message}</FormError>}
                                </div>

                                <div className='space-y-2'>
                                    <Label htmlFor='designation' className='font-medium text-foreground text-sm'>
                                        Designation: <span className='text-red-500'>*</span>
                                    </Label>
                                    <Controller
                                        key={resetKey}
                                        name='designation'
                                        control={control}
                                        render={({ field }) => (
                                            <MultiSelect
                                                options={DesignationOptions}
                                                defaultValue={field.value}
                                                onValueChange={field.onChange}
                                                placeholder={masterDesignationsLoading ? 'Loading...' : 'Select Designations'}
                                                disabled={masterDesignationsLoading || watchedDepartment?.length === 0}
                                                className='w-full'
                                                maxHeight={240}
                                            />
                                        )}
                                    />
                                    {errors.designation && <FormError>{errors.designation.message}</FormError>}
                                </div>
                            </div>

                            {watchReportType === 'All' ? (
                                <div className='flex justify-center'>
                                    <div className='grid w-full max-w-2xl grid-cols-1 gap-6 md:grid-cols-2'>
                                        <div className='space-y-2'>
                                            <Label htmlFor='month' className='font-medium text-sm text-white-900'>
                                                Month: <span className='text-red-500'>*</span>
                                            </Label>
                                            <Controller
                                                name='month'
                                                control={control}
                                                render={({ field }) => (
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        value={field.value}
                                                        disabled={masterMonthsLoading}>
                                                        <SelectTrigger className='w-full'>
                                                            <SelectValue
                                                                placeholder={masterMonthsLoading ? 'Loading...' : 'Select Month'}
                                                            />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {masterMonthsLoading ? (
                                                                <SelectItem value='loading' disabled>
                                                                    Loading...
                                                                </SelectItem>
                                                            ) : masterMonthsError ? (
                                                                <SelectItem value='error' disabled>
                                                                    Error loading data
                                                                </SelectItem>
                                                            ) : (
                                                                MonthsOptions?.map((opt: any) => (
                                                                    <SelectItem key={opt.value} value={opt.value}>
                                                                        {opt.label}
                                                                    </SelectItem>
                                                                ))
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                            {errors.month && <FormError>{errors.month.message}</FormError>}
                                        </div>

                                        <div className='space-y-2'>
                                            <Label htmlFor='year' className='font-medium text-sm text-white-900'>
                                                Year: <span className='text-red-500'>*</span>
                                            </Label>
                                            <Controller
                                                name='year'
                                                control={control}
                                                render={({ field }) => (
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        value={field.value}
                                                        disabled={masterYearsLoading}>
                                                        <SelectTrigger className='w-full'>
                                                            <SelectValue placeholder={masterYearsLoading ? 'Loading...' : 'Select Year'} />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {masterYearsLoading ? (
                                                                <SelectItem value='loading' disabled>
                                                                    Loading...
                                                                </SelectItem>
                                                            ) : masterYearsError ? (
                                                                <SelectItem value='error' disabled>
                                                                    Error loading data
                                                                </SelectItem>
                                                            ) : (
                                                                YearsOptions?.map((opt: any) => (
                                                                    <SelectItem key={opt.value} value={opt.value}>
                                                                        {opt.label}
                                                                    </SelectItem>
                                                                ))
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                            {errors.year && <FormError>{errors.year.message}</FormError>}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className='flex justify-center'>
                                    <div className='w-full max-w-md space-y-2'>
                                        <Label htmlFor='employee' className='font-medium text-sm text-white-900'>
                                            Employee: <span className='text-red-500'>*</span>
                                        </Label>
                                        <Controller
                                            name='employee'
                                            control={control}
                                            render={({ field }) => (
                                                <Select
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                    disabled={isEmpLoading || watchedDesignation?.length === 0}>
                                                    <SelectTrigger className='w-full'>
                                                        <SelectValue placeholder={isEmpLoading ? 'Loading...' : 'Select Employee'} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {empOptions.map((opt: any) => (
                                                            <SelectItem key={opt.value} value={opt.value}>
                                                                {opt.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.employee && <FormError>{errors.employee.message}</FormError>}
                                    </div>
                                </div>
                            )}

                            <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-center'>
                                <Button
                                    type='button'
                                    variant='outline'
                                    onClick={handleReset}
                                    disabled={isSearching || isSubmitting}
                                    className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'>
                                    Reset
                                </Button>
                                <Button
                                    type='button'
                                    onClick={handleSubmit(onSearch)}
                                    disabled={isSearching || isSubmitting}
                                    className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'>
                                    {isSearching ? (
                                        <>
                                            <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                                            Searching...
                                        </>
                                    ) : (
                                        <div className='flex items-center'>
                                            <Search className='mr-2 h-4 w-4' />
                                            Search
                                        </div>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </CollapsibleSection>

                    {reportData && reportData.length > 0 && (
                        <CollapsibleSection
                            title='Loan Report'
                            defaultOpen={true}
                            variant='outline'
                            size='md'
                            className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                            <div className='flex w-full justify-end gap-3 md:w-full print:hidden'>
                                <Button
                                    type='button'
                                    variant='outline'
                                    onClick={handleReset}
                                    className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'>
                                    Cancel
                                </Button>
                                <Button
                                    type='button'
                                    onClick={handlePrint}
                                    className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'>
                                    <Printer className='mr-2 h-4 w-4' />
                                    Print
                                </Button>
                            </div>
                            <div className='space-y-6 p-6' id='printable-report'>
                                <div className='h-[200px] w-full'>
                                    <img src={institution?.mI_Logo} alt='logo' className='h-full w-full object-contain' />
                                </div>
                                <div className='text-center'>
                                    <h2 className='font-bold text-2xl'>Employee Loan Report</h2>
                                    <p className='text-gray-600 text-sm'>Generated on: {getTodayDate()}</p>
                                </div>

                                <div className='overflow-x-auto rounded-lg border'>
                                    <table className='w-full border-collapse'>
                                        <thead>
                                            <tr className='border-white-300 border-b-2 bg-white-100'>
                                                <th className='border border-white-300 px-4 py-3 text-center font-semibold text-sm'>
                                                    SI. No
                                                </th>
                                                <th className='border border-white-300 px-4 py-3 font-semibold text-sm'>Employee Code</th>
                                                <th className='border border-white-300 px-4 py-3 font-semibold text-sm'>Employee Name</th>
                                                <th className='border border-white-300 px-4 py-3 font-semibold text-sm'>
                                                    Total Loan Amount
                                                </th>
                                                <th className='border border-white-300 px-4 py-3 font-semibold text-sm'>Paid Amount</th>
                                                <th className='border border-white-300 px-4 py-3 font-semibold text-sm'>Balance Amount</th>
                                                <th className='border border-white-300 px-4 py-3 font-semibold text-sm'>Month</th>
                                                <th className='border border-white-300 px-4 py-3 font-semibold text-sm'>Year</th>
                                                {/* <th className='border border-white-300 px-4 py-3 text-center font-semibold text-sm'>
                                                Status
                                            </th> */}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reportData.map((loan: any, index: number) => (
                                                <tr key={index} className='hover:bg-white-50'>
                                                    <td className='border border-white-300 px-4 py-2 text-center text-sm'>{index + 1}</td>
                                                    <td className='border border-white-300 px-4 py-2 text-center text-sm'>
                                                        {loan.employeeId}
                                                    </td>
                                                    <td className='border border-white-300 px-4 py-2 text-center text-sm'>
                                                        {loan.employeeName}
                                                    </td>
                                                    <td className='border border-white-300 px-4 py-2 text-center text-sm'>
                                                        ₹
                                                        {loan.totalhreL_LoanAmount.toLocaleString('en-IN', {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2
                                                        })}
                                                    </td>
                                                    <td className='border border-white-300 px-4 py-2 text-center text-sm'>
                                                        {loan.toatlPaidAmount}
                                                    </td>
                                                    <td className='border border-white-300 px-4 py-2 text-center text-sm'>
                                                        {loan.totalhreLT_LoanAmount}
                                                    </td>
                                                    <td className='border border-white-300 px-4 py-2 text-center text-sm'>
                                                        {loan.hreLT_Month}
                                                    </td>
                                                    <td className='border border-white-300 px-4 py-2 text-center text-sm'>
                                                        {loan.hreLT_Year}
                                                    </td>
                                                    {/* <td
                                                    className={`border border-white-300 px-4 py-2 text-center text-sm ${getStatusColor(
                                                        loan.status
                                                    )}`}>
                                                    {loan.status}
                                                </td> */}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </CollapsibleSection>
                    )}
                </div>
            </div>
        </>
    );
}
