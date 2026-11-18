'use client';

import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { useFinancialYearDropdown, useGetEmployees } from '@/hooks/hrms/useMasters';
import { usePFSummaryReport } from '@/hooks/hrms/useReports';
import { zodResolver } from '@hookform/resolvers/zod';
import { saveAs } from 'file-saver';
import { Download, Loader2, Printer, Search, X } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

interface PFYearlyReportProps {
    employees: string;
    year: string;
}

const PFYearlyReportSchema = z.object({
    employees: z.string().min(1, 'At least one employee must be selected'),
    year: z.string().min(1, 'Year is required')
});

export default function PFYearlyReport() {
    const [reportData, setReportData] = useState<any[]>([]);
    const [employeeDetails, setEmployeeDetails] = useState<any[]>([]);
    const [financialYear, setFinancialYear] = useState<string>('');

    const { data: employeesData, isLoading: isLoadingEmployees } = useGetEmployees();
    const { data: yearsData, isLoading: isLoadingYears } = useFinancialYearDropdown();

    const { mutateAsync: fetchReportData, isPending: isLoadingPFSummary } = usePFSummaryReport();

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<PFYearlyReportProps>({
        resolver: zodResolver(PFYearlyReportSchema),
        defaultValues: {
            employees: '',
            year: ''
        }
    });

    const formatedEmployees =
        employeesData?.data?.map((emp: any) => ({
            label: emp.value,
            value: emp.key.toString()
        })) || [];

    const onSubmit = async (data: PFYearlyReportProps) => {
        console.log('form data', data);
        const selectedYear = yearsData?.data?.find((y: any) => y.imfY_Id.toString() === data.year);
        setFinancialYear(selectedYear?.imfY_FinancialYear || '');

        try {
            const response = await fetchReportData({
                hrmE_Id: data.employees,
                imfY_Id: data.year,
                flag: 'EmployeePFreport'
            });

            if (response?.success && response?.data) {
                console.log('response', response);
                const actualData = response?.data;
                setReportData(actualData.reportData || []);
                setEmployeeDetails(actualData.empDetails || []);
                toast.success(response.message || 'Report generated successfully');
            } else {
                console.log('API Error:', response);
                toast.error(response?.message || 'Failed to fetch report data');
            }
        } catch (error: any) {
            console.error('API Error:', error);
            toast.error('An error occurred while fetching the report');
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleReset = () => {
        setReportData([]);
        setEmployeeDetails([]);
        setFinancialYear('');
        reset({
            employees: '',
            year: ''
        });
    };

    const handleExport = () => {
        const divToPrint = document.getElementById('printable-report');
        if (divToPrint) {
            const blob = new Blob([divToPrint.outerHTML], {
                type: 'application/vnd.ms-excel;charset=utf-8'
            });
            saveAs(blob, 'PFYearlyReport.xls');
        } else {
            toast.error('Report content not found');
        }
    };

    const todayDate = new Date()
        .toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })
        .replace(/\//g, '.');

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
                    
                    .page-break-after-always {
                        page-break-after: always;
                    }
                }
                
                #printable-report h4, #printable-report h5 {
                    margin: 0;
                    padding: 0;
                    font-size: 14px;
                }
                
                .report-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 10px;
                }
                
                .report-table th, .report-table td {
                    border: 1px solid #000 !important;
                    padding: 4px 8px;
                    font-size: 12px;
                }
                
                .text-right {
                    text-align: right;
                }
                
                .text-center {
                    text-align: center;
                }
                
                .font-bold {
                    font-weight: bold;
                }
                `}
            </style>
            <div className='container min-h-screen space-y-4 p-2 pt-4 md:p-4'>
                <CollapsibleSection
                    title='PF YEARLY REPORT'
                    description='Filter the report data by selecting the year and employees.'
                    defaultOpen={true}>
                    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 '>
                        <div className='mx-auto flex w-full justify-center gap-6 rounded-md p-4'>
                            <div className='w-1/2'>
                                <Label className='mb-2 block font-semibold'>
                                    Year <span className='text-destructive'>*</span>
                                </Label>
                                <Controller
                                    name='year'
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            value={field.value ?? ''}
                                            onValueChange={(value) => field.onChange(value)}
                                            disabled={isLoadingYears}>
                                            <SelectTrigger>
                                                {isLoadingYears
                                                    ? 'Loading years...'
                                                    : field.value
                                                      ? yearsData?.data?.find((y: any) => y.imfY_Id.toString() === field.value)
                                                            ?.imfY_FinancialYear
                                                      : 'Select Year'}
                                            </SelectTrigger>
                                            <SelectContent>
                                                {yearsData?.data?.map((year: any) => (
                                                    <SelectItem key={year.imfY_Id} value={year.imfY_Id.toString()}>
                                                        {year.imfY_FinancialYear}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.year && <FormError>{errors.year.message}</FormError>}
                            </div>
                            <div className='w-1/2'>
                                <Label className='mb-2 block font-semibold'>
                                    Employees <span className='text-destructive'>*</span>
                                </Label>
                                <Controller
                                    name='employees'
                                    control={control}
                                    disabled={isLoadingEmployees}
                                    render={({ field }) => (
                                        <div className={isLoadingEmployees ? 'pointer-events-none opacity-50' : ''}>
                                            <MultiSelect
                                                id={field.name}
                                                options={formatedEmployees}
                                                onValueChange={(values) => {
                                                    field.onChange(values.join(', '));
                                                }}
                                                defaultValue={field.value ? field.value.split(', ') : []}
                                                placeholder={isLoadingEmployees ? 'Loading employees...' : 'Select Employees'}
                                                variant='inverted'
                                                className='min-h-9'
                                                disabled={isLoadingEmployees}
                                            />
                                        </div>
                                    )}
                                />
                                {errors.employees && <FormError>{errors.employees.message}</FormError>}
                            </div>
                        </div>
                        <div className='flex justify-center gap-2'>
                            <Button type='submit' className='w-[120px]'>
                                {isLoadingPFSummary ? <Loader2 className=' h-4 w-4 animate-spin' /> : <Search className='h-4 w-4' />}{' '}
                                Generate
                            </Button>
                            <Button type='button' variant='outline' className='w-[120px]' onClick={handleReset}>
                                <X className='mr-2 h-4 w-4 ' /> Cancel
                            </Button>
                        </div>
                    </form>
                </CollapsibleSection>

                {reportData?.length > 0 && (
                    <CollapsibleSection title='PF YEARLY REPORT' defaultOpen={true} className='mt-6 shadow-sm'>
                        <div className='mb-4 flex justify-end gap-2 border-b pb-4 print:hidden'>
                            <Button type='button' variant='destructive' className='w-fit gap-2 ' onClick={handlePrint}>
                                <Printer className='h-4 w-4' /> Print
                            </Button>
                            <Button type='button' variant='destructive' className='w-fit gap-2 ' onClick={handleExport}>
                                <Download className='h-4 w-4' /> Export
                            </Button>
                            <Button type='button' variant='outline' className='w-fit' onClick={handleReset}>
                                <X className='h-4 w-4 ' /> Cancel
                            </Button>
                        </div>

                        <div className='space-y-12' id='printable-report'>
                            {employeeDetails.map((emp, index) => (
                                <div key={emp.hrmE_Id} className='page-break-after-always border-[1px] border-black p-6'>
                                    <div className='space-y-4'>
                                        {/* Header Row */}
                                        <div className='mb-6 space-y-2 border-black border-b pb-4 text-center'>
                                            <h2 className='font-bold text-xl uppercase'>{emp.mI_Name || "St. James' School"}</h2>
                                            <h3 className='font-bold text-lg uppercase underline'>
                                                PF STATEMENT FOR FINANCIAL YEAR {financialYear}
                                            </h3>
                                        </div>

                                        <div className='mb-6 w-full'>
                                            <table className='w-full font-bold text-sm'>
                                                <tbody>
                                                    <tr>
                                                        <td className='w-1/3'></td>
                                                        <td className='w-1/3 text-center'></td>
                                                        <td className='w-1/3 p-1 text-right'>Slip No. {index + 1}</td>
                                                    </tr>
                                                    <tr className='border-black border-t'>
                                                        <td className='p-2' colSpan={2}>
                                                            EMPLOYEE:{' '}
                                                            <span className='font-normal'>&nbsp;&nbsp;{emp.hrmE_EmployeeCode}</span>
                                                            &nbsp;&nbsp;<span className='font-normal'>{emp.employeeName}</span>
                                                        </td>
                                                        <td className='p-2 text-right'>
                                                            PF A/C NO: <span className='font-normal'>&nbsp;&nbsp;{emp.hrmE_PFAccNo}</span>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Data Table */}
                                        <table className='report-table mt-4'>
                                            <thead>
                                                <tr className='bg-gray-50 text-center font-bold uppercase'>
                                                    <th rowSpan={1} style={{ width: '33.33%' }}>
                                                        &nbsp;
                                                    </th>
                                                    <th colSpan={2} style={{ width: '33.33%' }}>
                                                        CONTRIBUTION
                                                    </th>
                                                    <th colSpan={2} style={{ width: '33.33%' }}>
                                                        INTEREST
                                                    </th>
                                                </tr>
                                                <tr className='bg-gray-50 text-center font-bold uppercase'>
                                                    <th style={{ width: '33.33%' }}>Month</th>
                                                    <th style={{ width: '16.66%' }}>OWN</th>
                                                    <th style={{ width: '16.66%' }}>SCHOOL</th>
                                                    <th style={{ width: '16.66%' }}>OWN</th>
                                                    <th style={{ width: '16.66%' }}>SCHOOL</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {reportData
                                                    .filter((d) => d.hrmE_Id === emp.hrmE_Id)
                                                    .map((row, idx) => (
                                                        <tr key={idx}>
                                                            <td className='text-left'>{row.ivrM_Month_Name || '-'}</td>
                                                            <td className='text-left'>
                                                                {row.hrepfsT_OwnContribution > 0
                                                                    ? row.hrepfsT_OwnContribution.toLocaleString(undefined, {
                                                                          minimumFractionDigits: 2,
                                                                          maximumFractionDigits: 2
                                                                      })
                                                                    : '0.00'}
                                                            </td>
                                                            <td className='text-left'>
                                                                {row.hrepfsT_InstituteContribution > 0
                                                                    ? row.hrepfsT_InstituteContribution.toLocaleString(undefined, {
                                                                          minimumFractionDigits: 2,
                                                                          maximumFractionDigits: 2
                                                                      })
                                                                    : '0.00'}
                                                            </td>
                                                            <td className='text-left'>
                                                                {row.hrepfsT_OwnInterest > 0
                                                                    ? row.hrepfsT_OwnInterest.toLocaleString(undefined, {
                                                                          minimumFractionDigits: 2,
                                                                          maximumFractionDigits: 2
                                                                      })
                                                                    : '0.00'}
                                                            </td>
                                                            <td className='text-left'>
                                                                {row.hrepfsT_InstituteInterest > 0
                                                                    ? row.hrepfsT_InstituteInterest.toLocaleString(undefined, {
                                                                          minimumFractionDigits: 2,
                                                                          maximumFractionDigits: 2
                                                                      })
                                                                    : '0.00'}
                                                            </td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CollapsibleSection>
                )}
            </div>
        </>
    );
}
