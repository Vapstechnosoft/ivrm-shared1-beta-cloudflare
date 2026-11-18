'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLeaveYearDropdown } from '@/hooks/hrms/useMasters';
import {
    useMasterMonths,
    useReportDepartments,
    useReportDesignations,
    useReportEmployeesByGroupTypeDeptAndDesignation,
    useReportGroupTypes,
    useSalaryCertificateReport
} from '@/hooks/hrms/useReports';
import { type SalaryCertificateFormFields, SalaryCertificateSchema } from '@/schemas/hrms/report';
import type { salaryCertificateRequest } from '@/server/hrms/reports/salary-certificate';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Printer, Search as SearchIcon, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

export default function SalaryCertificatePage() {
    const [isSearching, setIsSearching] = useState(false);
    const [reportData, setReportData] = useState<any>(null);
    const [resetKey, setResetKey] = useState(0); // State to force reset the form
    const reportRef = useRef<HTMLDivElement>(null);

    const {
        watch,
        control,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<SalaryCertificateFormFields>({
        resolver: zodResolver(SalaryCertificateSchema),
        defaultValues: {
            groupType: [],
            department: [],
            designation: [],
            month: '',
            year: '',
            employee: 0
        },
        mode: 'onChange'
    });

    const selectedGroupType = watch('groupType');
    const selectedDepartment = watch('department');
    const selectedDesignation = watch('designation');
    const selectedMonth = watch('month');
    const selectedYear = watch('year');

    const { data: masterGroupTypes, isLoading: isGroupTypeLoading } = useReportGroupTypes();

    const groupTypeIds = selectedGroupType?.join(',') || '';
    const { data: masterDepartments, isLoading: isDepartmentLoading } = useReportDepartments(groupTypeIds);

    const deptIds = selectedDepartment?.join(',') || '';
    const { data: masterDesignations, isLoading: isDesignationLoading } = useReportDesignations(groupTypeIds, deptIds);
    const { data: masterMonths, isLoading: masterMonthsLoading, isError: masterMonthsError } = useMasterMonths();
    const { data: masterYears, isLoading: masterYearsLoading, isError: masterYearsError } = useLeaveYearDropdown();

    const { mutateAsync: getSalaryCertificateReport } = useSalaryCertificateReport();

    const groupTypeIdsArray = useMemo(() => selectedGroupType?.map(Number).filter(Boolean) || [], [selectedGroupType]);
    const deptIdsArray = useMemo(() => selectedDepartment?.map(Number).filter(Boolean) || [], [selectedDepartment]);
    const desigIdsArray = useMemo(() => selectedDesignation?.map(Number).filter(Boolean) || [], [selectedDesignation]);

    const { data: employeesData, isLoading: isEmployeeLoading } = useReportEmployeesByGroupTypeDeptAndDesignation(
        groupTypeIdsArray,
        deptIdsArray,
        desigIdsArray
    );

    // Formate the Type, department, designation
    const groupTypeOptions =
        masterGroupTypes?.data?.map((item: any) => ({
            label: item.value || item.hrmgT_EmployeeGroupType,
            value: (item.key ?? item.hrmgT_Id)?.toString() ?? ''
        })) || [];

    const departmentsOptions =
        masterDepartments?.data?.map((item: any) => ({
            label: item.hrmD_DepartmentName || item.value,
            value: (item.hrmD_Id ?? item.key)?.toString() ?? ''
        })) || [];

    const designationsOptions =
        masterDesignations?.data?.map((item: any) => ({
            label: item.value || item.hrmdeS_DesignationName,
            value: (item.key ?? item.hrmdeS_Id)?.toString() ?? ''
        })) || [];

    // Formate the years
    const yearOptions = useMemo(() => {
        const rawData = masterYears as any;
        if (!rawData) return [];
        const list = Array.isArray(rawData) ? rawData : Array.isArray(rawData.data) ? rawData.data : [];

        return list.map((year: any) => ({
            label: year.hrmlY_LeaveYear || '',
            value: String(year.hrmlY_Id || '')
        }));
    }, [masterYears]);

    // Get the employees
    const employeeOptions = useMemo(() => {
        const list = employeesData?.data?.employeeNames || employeesData;
        if (!list || !Array.isArray(list)) return [];

        return list
            .map((emp: any) => ({
                label: emp.employeeFullName || emp.employeeName || emp.hrmE_EmployeeFirstName || 'Unknown Employee',
                value: String(emp.hrmE_Id || emp.id)
            }))
            .filter((e: any) => e.value);
    }, [employeesData]);

    useEffect(() => {
        if (reportData && reportRef.current) {
            reportRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [reportData]);

    const onSearch = async (data: SalaryCertificateFormFields) => {
        setIsSearching(true);

        const payload: salaryCertificateRequest = {
            hreS_Month: data.month,
            hreS_Year: data.year,
            hrmE_Id: Number(data.employee)
        };
        try {
            const res = await getSalaryCertificateReport(payload);
            if (res.success) {
                console.log('Report API response :', res);
                setReportData(res.data);
                toast.success('Salary certificate generated successfully!');
            } else {
                toast.error(res.message || 'Failed to generate certificate');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to generate certificate');
        } finally {
            setIsSearching(false);
        }
    };

    const handleReset = () => {
        reset();
        setResetKey((prev) => prev + 1); // Force reset the form
        setReportData(null);
        toast.info('Form has been reset');
    };

    const handlePrint = () => {
        window.print();
    };

    const calculateGrossEarning = () => {
        if (!reportData) return 0;
        return reportData?.salaryHeads
            .filter((item: any) => item.hrmeD_EarnDedFlag === 'Earning')
            .reduce((sum: number, item: any) => sum + item.amount, 0);
    };

    const calculateTotalDeductions = () => {
        if (!reportData) return 0;
        return reportData?.salaryHeads
            .filter((item: any) => item.HRMED_EarnDedFlag === 'Deduction')
            .reduce((sum: number, item: any) => sum + item.Amount, 0);
    };

    const calculateNetSalary = () => {
        return calculateGrossEarning() - calculateTotalDeductions();
    };

    const getTodayDate = () => {
        const today = new Date();
        return today.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const grossEarning = calculateGrossEarning();
    const totalDeductions = calculateTotalDeductions();
    const netSalary = calculateNetSalary();

    return (
        <div className='container min-h-screen space-y-4 p-2'>
            <style>
                {`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #printable-certificate,
                    #printable-certificate * {
                        visibility: visible;
                    }
                    #printable-certificate {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
                `}
            </style>

            <CollapsibleSection title='Salary Certificate Configuration' defaultOpen={true} variant='outline' className='shadow-md'>
                <form onSubmit={handleSubmit(onSearch)} className='space-y-6'>
                    {/* Basic Filters */}
                    <div className='grid grid-cols-1 gap-6 rounded-md border bg-slate-50 p-4 lg:grid-cols-3 dark:bg-slate-900/50'>
                        <div className='space-y-2'>
                            <Label>
                                Group Type <span className='text-destructive'>*</span>
                            </Label>
                            <Controller
                                name='groupType'
                                control={control}
                                render={({ field }) => (
                                    <MultiSelect
                                        options={groupTypeOptions}
                                        defaultValue={field.value}
                                        onValueChange={field.onChange}
                                        placeholder={isGroupTypeLoading ? 'Loading...' : 'Select Group Type'}
                                    />
                                )}
                            />
                            {errors?.groupType && <FormError>{errors.groupType.message}</FormError>}
                        </div>

                        <div className='space-y-2'>
                            <Label>
                                Department <span className='text-destructive'>*</span>
                            </Label>
                            <Controller
                                name='department'
                                control={control}
                                render={({ field }) => (
                                    <MultiSelect
                                        options={departmentsOptions}
                                        defaultValue={field.value}
                                        onValueChange={field.onChange}
                                        placeholder={isDepartmentLoading ? 'Loading...' : 'Select Department'}
                                    />
                                )}
                            />
                            {errors?.department && <FormError>{errors.department.message}</FormError>}
                        </div>

                        <div className='space-y-2'>
                            <Label>
                                Designation <span className='text-destructive'>*</span>
                            </Label>
                            <Controller
                                name='designation'
                                control={control}
                                render={({ field }) => (
                                    <MultiSelect
                                        options={designationsOptions}
                                        defaultValue={field.value}
                                        onValueChange={field.onChange}
                                        placeholder={isDesignationLoading ? 'Loading...' : 'Select Designation'}
                                    />
                                )}
                            />
                            {errors?.designation && <FormError>{errors.designation.message}</FormError>}
                        </div>
                    </div>

                    {/* Month / Year Selection */}
                    <div className='grid grid-cols-1 gap-6 rounded-md border bg-slate-50 p-4 lg:grid-cols-3 dark:bg-slate-900/50'>
                        <div className='space-y-2'>
                            <Label>
                                Month <span className='text-destructive'>*</span>
                            </Label>
                            <Controller
                                key={resetKey}
                                name='month'
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value} disabled={masterYearsLoading}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={masterMonthsLoading ? 'Loading...' : 'Select Month'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {masterMonthsLoading ? (
                                                <SelectItem value='loading' disabled>
                                                    Loading...
                                                </SelectItem>
                                            ) : (
                                                masterMonths?.data?.map((item: any, index: number) => (
                                                    <SelectItem
                                                        key={`${item.key || 'month'}-${index}`}
                                                        value={item.value || `month-val-${index}`}>
                                                        {item.value}
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
                            <Label>
                                Year <span className='text-destructive'>*</span>
                            </Label>
                            <Controller
                                key={resetKey}
                                name='year'
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value} disabled={masterYearsLoading}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={masterYearsLoading ? 'Loading...' : 'Select Year'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {masterYearsLoading ? (
                                                <SelectItem value='loading' disabled>
                                                    Loading...
                                                </SelectItem>
                                            ) : (
                                                yearOptions?.map((item: any, index: number) => (
                                                    <SelectItem
                                                        key={`${item.value || 'year'}-${index}`}
                                                        value={item.value?.toString() ?? `year-val-${index}`}>
                                                        {item.label}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.year && <FormError>{errors.year.message}</FormError>}
                        </div>

                        <div className='space-y-2'>
                            <Label>
                                Employee <span className='text-destructive'>*</span>
                            </Label>
                            <Controller
                                key={resetKey}
                                name='employee'
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Employee' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {isEmployeeLoading ? (
                                                <SelectItem value='loading' disabled>
                                                    Loading...
                                                </SelectItem>
                                            ) : employeeOptions?.length === 0 ? (
                                                <SelectItem value='no-data' disabled>
                                                    No Employees Found
                                                </SelectItem>
                                            ) : (
                                                employeeOptions?.map((opt: any) => (
                                                    <SelectItem key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.employee && <FormError>{errors.employee.message}</FormError>}
                        </div>
                    </div>

                    <div className='flex justify-center gap-4'>
                        <Button type='submit' disabled={isSearching} className='w-32'>
                            {isSearching ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <SearchIcon className='mr-2 h-4 w-4' />}
                            Search
                        </Button>
                        <Button type='button' variant='destructive' onClick={handleReset} className='w-32'>
                            <X className='mr-2 h-4 w-4' />
                            Cancel
                        </Button>
                    </div>
                </form>
            </CollapsibleSection>

            {reportData && (
                <div ref={reportRef} id='printable-certificate'>
                    <CollapsibleSection
                        title='Salary Certificate Report Details'
                        defaultOpen={true}
                        variant='outline'
                        className='shadow-md'>
                        <div className='space-y-6 p-6'>
                            <div className='space-y-4'>
                                <Label className='mx-auto block text-center font-semibold text-gray-600 text-lg underline'>
                                    Salary Certificate
                                </Label>

                                <p className='text-justify leading-relaxed'>
                                    This is to certify that Mr/Ms. <span className='font-semibold'>{reportData.employee.employeeName}</span>{' '}
                                    (Employee Code: <span className='font-semibold'>{reportData.employee.employeeCode}</span>) is working in
                                    Our Institution as a <span className='font-semibold'>{reportData.designationName}</span> and his/her
                                    monthly emoluments are as follows.
                                </p>
                            </div>

                            {/* Salary Table */}
                            <div className='overflow-x-auto rounded-lg border'>
                                <table className='w-full border-collapse'>
                                    <thead>
                                        <tr className='border-slate-300 border-b-2 bg-slate-100 dark:bg-slate-800'>
                                            <th className='border border-slate-300 px-4 py-3 text-left font-semibold text-sm'>
                                                Pay & Allowance
                                            </th>
                                            <th className='border border-slate-300 px-4 py-3 text-right font-semibold text-sm'>Amount</th>
                                            <th className='border border-slate-300 px-4 py-3 text-left font-semibold text-sm'>
                                                Deductions
                                            </th>
                                            <th className='border border-slate-300 px-4 py-3 text-right font-semibold text-sm'>Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(() => {
                                            const earnings = reportData.salaryHeads.filter(
                                                (item: any) => item.hrmeD_EarnDedFlag === 'Earning'
                                            );
                                            const deductions = reportData.salaryHeads.filter(
                                                (item: any) => item.hrmeD_EarnDedFlag === 'Deduction'
                                            );
                                            const maxRows = Math.max(earnings.length, deductions.length);

                                            return Array.from({ length: maxRows }).map((_, index) => (
                                                <tr key={index} className='hover:bg-slate-50 dark:hover:bg-slate-900/50'>
                                                    <td className='border border-slate-300 px-4 py-2 text-sm'>
                                                        {earnings[index]?.hrmeD_Name || ''}
                                                    </td>
                                                    <td className='border border-slate-300 px-4 py-2 text-right text-sm'>
                                                        {earnings[index]
                                                            ? `₹${earnings[index].amount.toLocaleString('en-IN', {
                                                                  minimumFractionDigits: 2,
                                                                  maximumFractionDigits: 2
                                                              })}`
                                                            : ''}
                                                    </td>
                                                    <td className='border border-slate-300 px-4 py-2 text-sm'>
                                                        {deductions[index]?.hrmeD_Name || ''}
                                                    </td>
                                                    <td className='border border-slate-300 px-4 py-2 text-right text-sm'>
                                                        {deductions[index]
                                                            ? `₹${deductions[index].amount.toLocaleString('en-IN', {
                                                                  minimumFractionDigits: 2,
                                                                  maximumFractionDigits: 2
                                                              })}`
                                                            : ''}
                                                    </td>
                                                </tr>
                                            ));
                                        })()}

                                        <tr className='border-slate-400 border-t-2 bg-slate-200 font-bold dark:bg-slate-700'>
                                            <td className='border border-slate-300 px-4 py-3 text-sm'>Gross Earning:</td>
                                            <td className='border border-slate-300 px-4 py-3 text-right text-sm'>
                                                ₹
                                                {grossEarning.toLocaleString('en-IN', {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                })}
                                            </td>
                                            <td className='border border-slate-300 px-4 py-3 text-sm'>Gross Deduction:</td>
                                            <td className='border border-slate-300 px-4 py-3 text-right text-sm'>
                                                ₹
                                                {totalDeductions.toLocaleString('en-IN', {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                })}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className='flex justify-end'>
                                <div className='rounded-lg border bg-slate-50 px-6 py-4 dark:bg-slate-900/50'>
                                    <div className='flex items-center gap-4'>
                                        <span className='font-semibold text-lg'>Net Salary:</span>
                                        <span className='font-bold text-gray-600 text-xl dark:text-gray-300'>
                                            ₹
                                            {netSalary.toLocaleString('en-IN', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className='flex items-end justify-between border-t pt-6'>
                                <div>
                                    <p className='font-medium text-sm'>Date: {getTodayDate()}</p>
                                </div>
                                <div className='text-right'>
                                    <div className='mb-16' />
                                    <p className='font-semibold'>Principal</p>
                                </div>
                            </div>

                            {/* Action Buttons at Bottom */}
                            <div className='no-print flex justify-center gap-4 border-t pt-4'>
                                <Button type='button' variant='outline' onClick={handleReset} className='w-32'>
                                    <X className='mr-2 h-4 w-4' />
                                    Cancel
                                </Button>
                                <Button type='button' onClick={handlePrint} className='w-32'>
                                    <Printer className='mr-2 h-4 w-4' />
                                    Print
                                </Button>
                            </div>
                        </div>
                    </CollapsibleSection>
                </div>
            )}
        </div>
    );
}
