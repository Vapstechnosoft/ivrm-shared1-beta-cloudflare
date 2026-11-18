'use client';

import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { useFinancialYearDropdown, useGetEmployees } from '@/hooks/hrms/useMasters';
import { useVPFSummaryReport } from '@/hooks/hrms/useReports';
import { zodResolver } from '@hookform/resolvers/zod';
import { saveAs } from 'file-saver';
import { Download, Loader2, Printer, Search, X } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

interface VPFYearlyReportProps {
    employees: string;
    year: string;
}

const VPFYearlyReportSchema = z.object({
    employees: z.string().min(1, 'At least one employee must be selected'),
    year: z.string().min(1, 'Year is required')
});
export default function VPFYearlyReport() {
    const [reportData, setReportData] = useState<any[]>([]);
    const [employeeDetails, setEmployeeDetails] = useState<any[]>([]);
    const [financialYear, setFinancialYear] = useState<string>('');
    const [resetKey, setResetKey] = useState<number>(0);

    const { data: employeesData, isLoading: isLoadingEmployees } = useGetEmployees();
    const { data: yearsData, isLoading: isLoadingYears } = useFinancialYearDropdown();

    const { mutateAsync: getVPFSummaryReport, isPending: isLoadingVPFSummaryReport } = useVPFSummaryReport();

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<VPFYearlyReportProps>({
        resolver: zodResolver(VPFYearlyReportSchema),
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

    const onSubmit = async (data: VPFYearlyReportProps) => {
        console.log('form data', data);
        const yearObj = yearsData?.data?.find((y: any) => y.imfY_Id.toString() === data.year);
        setFinancialYear(yearObj?.imfY_FinancialYear || '');

        try {
            const response = await getVPFSummaryReport({
                hrmE_Id: data.employees,
                imfY_Id: data.year,
                flag: 'EmployeeVPFreport'
            });

            if (response?.success && response?.data) {
                console.log('VPF response', response);
                setReportData(response.data.reportData || []);
                setEmployeeDetails(response.data.empDetails || []);
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
        setResetKey((prev) => prev + 1);
    };

    const handleExport = () => {
        const divToPrint = document.getElementById('printable-report');
        if (divToPrint) {
            const blob = new Blob([divToPrint.outerHTML], {
                type: 'application/vnd.ms-excel;charset=utf-8'
            });
            saveAs(blob, 'VPFYearlyReport.xls');
        } else {
            toast.error('Report content not found');
        }
    };

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
                
                .page-break-before-always {
                    page-break-before: always;
                }
            }
        `}
            </style>
            <div className='container min-h-screen space-y-4 p-2 pt-4 md:p-4'>
                <CollapsibleSection
                    title='VPF YEARLY REPORT'
                    description='Filter the report data by selecting the year and employees.'
                    defaultOpen={true}>
                    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 '>
                        <div className='mx-auto flex w-full justify-center gap-6 rounded-md p-4'>
                            <div className='w-1/2'>
                                <Label className='mb-2 block font-semibold'>
                                    Year <span className='text-destructive'>*</span>
                                </Label>
                                <Controller
                                    key={resetKey}
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
                                    key={`emp-${resetKey}`}
                                    name='employees'
                                    control={control}
                                    render={({ field }) => (
                                        <div className={isLoadingEmployees ? 'pointer-events-none opacity-150' : ''}>
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
                                {isLoadingVPFSummaryReport ? (
                                    <Loader2 className=' h-4 w-4 animate-spin' />
                                ) : (
                                    <Search className=' h-4 w-4 ' />
                                )}{' '}
                                Generate
                            </Button>
                            <Button type='button' variant='outline' className='w-[120px]' onClick={handleReset}>
                                <X className='mr-2 h-4 w-4 ' /> Cancel
                            </Button>
                        </div>
                    </form>
                </CollapsibleSection>

                {reportData.length > 0 && (
                    <CollapsibleSection title='VPF YEARLY REPORT' defaultOpen={true} className='mt-6 shadow-sm'>
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
                                    <div className='mb-6 space-y-2 border-black border-b pb-4 text-center'>
                                        <h2 className='font-bold text-xl uppercase'>{emp.mI_Name || "St. James' School"}</h2>
                                        <h3 className='font-bold text-lg uppercase underline'>
                                            VPF STATEMENT FOR FINANCIAL YEAR {financialYear}
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
                                                        EMPLOYEE: <span className='font-normal'>&nbsp;&nbsp;{emp.hrmE_EmployeeCode}</span>
                                                        &nbsp;&nbsp;<span className='font-normal'>{emp.employeeName}</span>
                                                    </td>
                                                    <td className='p-2 text-right'>
                                                        PF A/C NO: <span className='font-normal'>&nbsp;&nbsp;{emp.hrmE_PFAccNo}</span>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className='overflow-x-auto'>
                                        <table className='w-full border-collapse border border-slate-300 text-center text-sm' border={1}>
                                            <thead>
                                                <tr className='bg-violet-500 font-bold text-white uppercase'>
                                                    <th className='border border-slate-300 p-2'>Months</th>
                                                    <th className='border border-slate-300 p-2'>CONTRIBUTION</th>
                                                    <th className='border border-slate-300 p-2'>INTEREST</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {reportData
                                                    .filter((d) => d.hrmE_Id.toString() === emp.hrmE_Id.toString())
                                                    .map((row, idx) => (
                                                        <tr key={idx}>
                                                            <td className='border border-slate-300 p-2 px-4 text-left'>
                                                                {row.ivrM_Month_Name || 'Summary'}
                                                            </td>
                                                            <td className='border border-slate-300 p-2 px-4 text-left'>
                                                                {row.hrevpfsT_Contribution
                                                                    ? Number(row.hrevpfsT_Contribution).toLocaleString(undefined, {
                                                                          minimumFractionDigits: 2,
                                                                          maximumFractionDigits: 2
                                                                      })
                                                                    : '0.00'}
                                                            </td>
                                                            <td className='border border-slate-300 p-2 px-4 text-left'>
                                                                {row.hrevpfsT_Intersest
                                                                    ? Number(row.hrevpfsT_Intersest).toLocaleString(undefined, {
                                                                          minimumFractionDigits: 2,
                                                                          maximumFractionDigits: 2
                                                                      })
                                                                    : '0.00'}
                                                            </td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                            {/* {reportData.filter((d) => d.hrmE_Id.toString() === emp.hrmE_Id.toString()).length > 1 && (
                        <tfoot>
                          <tr className="font-bold bg-gray-50">
                            <td className="border border-slate-300 p-2 text-center px-4 uppercase">
                              Total
                            </td>
                            <td className="border border-slate-300 p-2 text-center px-4">
                              {reportData
                                .filter((d) => d.hrmE_Id.toString() === emp.hrmE_Id.toString())
                                .reduce((acc, curr) => acc + Number(curr.hrevpfsT_Contribution || 0), 0)
                                .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="border border-slate-300 p-2 text-center px-4">
                              {reportData
                                .filter((d) => d.hrmE_Id.toString() === emp.hrmE_Id.toString())
                                .reduce((acc, curr) => acc + Number(curr.hrevpfsT_Intersest || 0), 0)
                                .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                          </tr>
                        </tfoot>
                      )} */}
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
