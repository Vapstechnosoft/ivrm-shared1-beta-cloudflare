'use client';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { usePFForm3ABasicData, useSearchPFForm3AReport } from '@/hooks/hrms/useReports';
import { type PFForm3aFields, PFForm3aSchema } from '@/schemas/hrms/employee-category-schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Search, X } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import PFChallan from './_components/columns';

type FormFields = z.infer<typeof PFForm3aSchema>;

export default function DepartmentSalaryReportPage() {
    const [reportData, setReportData] = useState<any>(null);
    const [selectedEmployee, setSelectedEmployee] = useState<string>('');
    const [selectedYear, setSelectedYear] = useState<string>('');
    const [resetKey, setResetKey] = useState(0);

    // Fetch basic data (years, employees, months)
    const { data: basicData, isLoading: basicDataLoading, isError: basicDataError } = usePFForm3ABasicData();
    const searchMutation = useSearchPFForm3AReport();

    const YearsOptions =
        basicData?.data?.leaves?.map((item: any) => ({
            value: item.hrmlY_LeaveYear,
            label: item.hrmlY_LeaveYear
        })) || [];

    const EmployeeOptions =
        basicData?.data?.employee?.map((emp: any) => {
            const fullName = [emp.hrmE_EmployeeFirstName, emp.hrmE_EmployeeMiddleName, emp.hrmE_EmployeeLastName]
                .filter((name) => name && name.trim() !== '')
                .join(' ');
            return {
                value: emp.hrmE_Id.toString(),
                label: fullName
            };
        }) || [];

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(PFForm3aSchema),
        defaultValues: {
            year: '',
            employee: ''
        },
        mode: 'onChange'
    });

    const onSearch = async (data: PFForm3aFields) => {
        try {
            searchMutation.mutate(
                {
                    MI_Id: HRMS_MI_ID,
                    HRME_Id: Number(data.employee),
                    HRES_Year: data.year
                },
                {
                    onSuccess: (res) => {
                        if (res.success && res.data) {
                            const employeeInfo = res.data.employeeDetails?.[0] || res.data.currentemployeeDetails?.[0] || {};
                            const accountNo = employeeInfo.hrmE_PFAccNo || employeeInfo.HRME_PFAccNo || '-';
                            const fatherName =
                                employeeInfo.hrmE_FatherName ||
                                employeeInfo.HRME_FatherName ||
                                employeeInfo.fatherHusbandName ||
                                employeeInfo.FatherHusbandName ||
                                res.data.fatherHusbandName ||
                                '-';

                            const inst = res.data.institutionDetails?.[0] || {};
                            const establishmentName = inst.mI_Name || inst.MI_Name || res.data.mI_Name || res.data.MI_Name || '-';
                            const establishmentAddress =
                                [
                                    inst.mI_Address1 || inst.MI_Address1 || '',
                                    inst.mI_Address2 || inst.MI_Address2 || '',
                                    inst.mI_Address3 || inst.MI_Address3 || ''
                                ]
                                    .map((s) => (s ? s.trim() : ''))
                                    .filter(Boolean)
                                    .join(', ') || '-';

                            const finFrom = res.data.finYearFromDate || '';
                            const yearMatch = finFrom.match(/\d{4}/);
                            const startYear = yearMatch ? Number(yearMatch[0]) : Number(data.year) || new Date().getFullYear();

                            const MONTH_NAMES = [
                                'April',
                                'May',
                                'June',
                                'July',
                                'August',
                                'September',
                                'October',
                                'November',
                                'December',
                                'January',
                                'February',
                                'March'
                            ];

                            const rawGridData = res.data.getpfgriddata || res.data.pfreport || [];
                            const contributions = Array.isArray(rawGridData)
                                ? rawGridData.map((item: any, index: number) => {
                                      const monthName =
                                          item.hreS_Month ||
                                          item.HRES_Month ||
                                          item.ivrM_Month_Name ||
                                          item.IVRM_Month_Name ||
                                          MONTH_NAMES[index] ||
                                          '';
                                      const yearVal = item.hreS_Year || item.HRES_Year || (index < 9 ? startYear : startYear + 1);
                                      const monthYear = monthName && yearVal ? `${monthName.trim()} - ${yearVal}` : monthName;

                                      const amount = Number(item.amountofWages || item.AmountofWages || 0);
                                      const epf = Number(item.pfAmount || item.PFAmount || 0);
                                      const epfDifference = Number(item.hreS_EPF || item.HRES_EPF || 0);
                                      const pensionContribution = Number(item.hreS_FPF || item.HRES_FPF || 0);
                                      const total = epfDifference + pensionContribution;

                                      return {
                                          month: monthYear || 'N/A',
                                          amount,
                                          epf,
                                          epfDifference,
                                          pensionContribution,
                                          total,
                                          refund: Number(item.refund || item.vpfAmount || item.VPFAmount || 0),
                                          periodFrom: item.periodFrom || item.FromDate || '',
                                          periodTo: item.periodTo || item.ToDate || '',
                                          remarks: item.remark || item.Remark || ''
                                      };
                                  })
                                : [];

                            const yearLabel = YearsOptions.find((opt: any) => opt.value === data.year)?.label || data.year;
                            const employeeLabel = EmployeeOptions.find((opt: any) => opt.value === data.employee)?.label || data.employee;

                            setSelectedEmployee(employeeLabel);
                            setSelectedYear(yearLabel);

                            setReportData({
                                contributions,
                                accountNo,
                                fatherName,
                                establishmentName,
                                establishmentAddress
                            });

                            toast.success('Report generated successfully!');
                        } else {
                            toast.warning(res.message || 'No data found for selected criteria');
                        }
                    },
                    onError: (error: any) => {
                        toast.error(error.message || 'Failed to search PF Form 3A report');
                    }
                }
            );
        } catch (error: any) {
            toast.error(error.message || 'Failed to generate report');
        }
    };

    const handleReset = () => {
        reset({
            year: '',
            employee: ''
        });
        setReportData(null);
        setSelectedEmployee('');
        setSelectedYear('');
        setResetKey((prev) => prev + 1);
    };
    const handleCancel = () => {
        setReportData(null);
        setSelectedEmployee('');
        setSelectedYear('');
    };

    return (
        <div className='min-h-screen p-8'>
            <div className='container space-y-4 p-1'>
                <CollapsibleSection
                    title='Form 3A'
                    defaultOpen={true}
                    variant='outline'
                    size='md'
                    className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                    <div className='space-y-6'>
                        <div className='flex justify-center'>
                            <div className='grid w-full max-w-2xl grid-cols-1 gap-6 md:grid-cols-2'>
                                <div className='space-y-2'>
                                    <Label htmlFor='year' className='font-medium text-sm text-white-900'>
                                        Year: <span className='text-red-500'>*</span>
                                    </Label>
                                    <Controller
                                        key={resetKey}
                                        name='year'
                                        control={control}
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger className='w-full' disabled={basicDataLoading}>
                                                    <SelectValue placeholder={basicDataLoading ? 'Loading...' : 'Select Year'} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {basicDataLoading ? (
                                                        <SelectItem value='loading' disabled>
                                                            Loading...
                                                        </SelectItem>
                                                    ) : basicDataError ? (
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
                                <div className='w-full max-w-md space-y-2'>
                                    <Label htmlFor='employee' className='font-medium text-sm text-white-900'>
                                        Employee: <span className='text-red-500'>*</span>
                                    </Label>
                                    <Controller
                                        key={resetKey}
                                        name='employee'
                                        control={control}
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger className='w-full' disabled={basicDataLoading}>
                                                    <SelectValue placeholder={basicDataLoading ? 'Loading...' : 'Select Employee'} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {basicDataLoading ? (
                                                        <SelectItem value='loading' disabled>
                                                            Loading...
                                                        </SelectItem>
                                                    ) : basicDataError ? (
                                                        <SelectItem value='error' disabled>
                                                            Error loading data
                                                        </SelectItem>
                                                    ) : (
                                                        EmployeeOptions.map((opt: any) => (
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
                        </div>

                        <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-center'>
                            <Button
                                type='button'
                                variant='outline'
                                onClick={handleReset}
                                disabled={searchMutation.isPending || isSubmitting}
                                className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'>
                                <X className='mr-2 h-4 w-4' />
                                Cancel
                            </Button>
                            <Button
                                type='submit'
                                onClick={handleSubmit(onSearch)}
                                disabled={searchMutation.isPending || isSubmitting}
                                className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'>
                                {searchMutation.isPending ? (
                                    <>
                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                        Generate
                                    </>
                                ) : (
                                    <div className='flex items-center'>
                                        <Search className='mr-2 h-4 w-4' />
                                        Generate
                                    </div>
                                )}
                            </Button>
                        </div>
                    </div>
                </CollapsibleSection>

                {reportData && (
                    <CollapsibleSection
                        title='Form 3A'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                        <PFChallan
                            contributions={reportData.contributions || []}
                            accountNo={reportData.accountNo}
                            employeeName={selectedEmployee}
                            fatherName={reportData.fatherName}
                            establishmentName={reportData.establishmentName}
                            establishmentAddress={reportData.establishmentAddress}
                            contributionRate={12}
                            vpfContribution={0}
                            year={selectedYear}
                            onCancel={handleReset}
                            isLoading={searchMutation.isPending}
                        />
                    </CollapsibleSection>
                )}
            </div>
        </div>
    );
}
