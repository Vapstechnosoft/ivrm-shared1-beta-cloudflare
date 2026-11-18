'use client';

import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { useFinancialYearDropdown, useGetEmployees } from '@/hooks/hrms/useMasters';
import { usePFSummaryReport } from '@/hooks/hrms/useReports';
import { zodResolver } from '@hookform/resolvers/zod';
import { saveAs } from 'file-saver';
import { Download, Loader2, Printer, Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

// --- Schema ---

const PFSummaryReportSchema = z.object({
    employees: z.string().min(1, 'At least one employee must be selected'),
    year: z.string().min(1, 'Year is required'),
    flag: z.enum(['PFTotalReport', 'PFGrandTotalReport', 'PFStatementReport'])
});

type PFSummaryReportFormValues = z.infer<typeof PFSummaryReportSchema>;

// --- Component ---

export default function PFSummaryReport() {
    const [reportData, setReportData] = useState<any[]>([]);
    const [employeeDetails, setEmployeeDetails] = useState<any[]>([]);
    const [financialYear, setFinancialYear] = useState<string>('');

    const { data: employeesData, isLoading: isLoadingEmployees } = useGetEmployees();
    const { data: yearsData, isLoading: isLoadingYears } = useFinancialYearDropdown();
    const { mutateAsync: getPFSummaryReport, isPending: isLoadingPFSummary } = usePFSummaryReport();

    const [resetKey, setResetKey] = useState(0); // For resetting MultiSelect
    const {
        control,
        handleSubmit,
        reset,
        watch,
        formState: { errors }
    } = useForm<PFSummaryReportFormValues>({
        resolver: zodResolver(PFSummaryReportSchema),
        defaultValues: {
            employees: '',
            year: '',
            flag: 'PFTotalReport'
        }
    });

    const watchedFlag = watch('flag');

    useEffect(() => {
        setReportData([]);
        setEmployeeDetails([]);
    }, [watchedFlag]);

    const formatedEmployees = useMemo(() => {
        return (
            employeesData?.data?.map((emp: any) => ({
                label: emp.value,
                value: emp.key.toString()
            })) || []
        );
    }, [employeesData]);

    const onSubmit = async (data: PFSummaryReportFormValues) => {
        const selectedYear = yearsData?.data?.find((y: any) => y.imfY_Id.toString() === data.year);
        setFinancialYear(selectedYear?.imfY_FinancialYear || '');

        const payload = {
            hrmE_Id: data.employees,
            imfY_Id: data.year,
            flag: data.flag
        };

        try {
            const response = await getPFSummaryReport(payload);
            console.log('response', response);
            if (response.success && response.data) {
                const actualData = response.data.data || response.data;
                const reportList = Array.isArray(actualData) ? actualData : actualData?.reportData || [];
                setReportData(reportList);
                setEmployeeDetails(actualData?.empDetails || actualData || []);
                toast.success(`Data fetched successfully`);
            } else {
                toast.error(response.message || 'Failed to fetch report data');
            }
        } catch (error) {
            console.error('PF Summary Report Error:', error);
        }
    };

    const handlePrint = () => {
        const printContent = document.getElementById('printable-report');
        if (!printContent) return;

        const windowUrl = 'about:blank';
        const uniqueName = new Date().getTime();
        const windowName = 'Print' + uniqueName;
        const printWindow = window.open(windowUrl, windowName, 'left=50,top=50,width=800,height=600');

        if (printWindow) {
            printWindow.document.write(`
        <html>
          <head>
            <title>PF Summary Report</title>
            <style>
              body { font-family: 'Inter', sans-serif; padding: 20px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
              th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
              th { background-color: #f9f9f9; font-weight: bold; }
              .header { text-align: center; margin-bottom: 20px; }
              .header h2 { margin: 0; }
              .header h3 { margin: 5px 0; }
              @media print {
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
          </body>
        </html>
      `);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        }
    };

    const handleReset = () => {
        setReportData([]);
        setEmployeeDetails([]);
        setFinancialYear('');
        reset({
            employees: '',
            year: '',
            flag: 'PFTotalReport'
        });
        setResetKey((prev) => prev + 1); // Reset MultiSelect
    };

    const handleExport = () => {
        const table = document.getElementById('printable-report');
        if (table) {
            const blob = new Blob([table.outerHTML], {
                type: 'application/vnd.ms-excel;charset=utf-8'
            });
            saveAs(blob, `PF_Summary_Report_${financialYear}.xls`);
        } else {
            toast.error('Report content not found');
        }
    };

    // --- Calculations for Summary Table ---
    const totals = useMemo(() => {
        if (watchedFlag !== 'PFTotalReport' || reportData.length === 0) return null;
        return reportData.reduce(
            (acc, curr) => {
                acc.own_ob += curr.hrepfsT_OBOwnAmount || curr.HREPFST_OBOwnAmount || 0;
                acc.inst_ob += curr.hrepfsT_OBInstituteAmount || curr.HREPFST_OBInstituteAmount || 0;
                acc.own_cont += curr.hrepfsT_OwnContribution || curr.HREVPFST_Contribution || 0;
                acc.inst_cont += curr.hrepfsT_InstituteContribution || curr.HREPFST_IntstituteContribution || 0;
                acc.own_int += curr.hrepfsT_OwnInterest || curr.HREVPFST_Intersest || 0;
                acc.inst_int += curr.hrepfsT_InstituteInterest || curr.HREPFST_InstituteInterest || 0;
                acc.own_total += curr.own_GrandTotal || curr.OWN_GRANDTOTAL || 0;
                acc.inst_total += curr.inst_GrandTotal || curr.INST_GRANDTOTAL || 0;
                acc.own_settle += curr.hrepfsT_OwnSettlementAmount || curr.HREPFST_OwnSettlementAmount || 0;
                acc.inst_settle += curr.hrepfsT_InstituteLSettlementAmount || curr.HREPFST_InstituteLSettlementAmount || 0;
                acc.own_cb += curr.hrepfsT_OwnClosingBalance || curr.hrepfsT_OwnClosingBalance || 0;
                acc.inst_cb += curr.hrepfsT_InstituteClosingBalance || curr.hrepfsT_InstituteClosingBalance || 0;
                return acc;
            },
            {
                own_ob: 0,
                inst_ob: 0,
                own_cont: 0,
                inst_cont: 0,
                own_int: 0,
                inst_int: 0,
                own_total: 0,
                inst_total: 0,
                own_settle: 0,
                inst_settle: 0,
                own_cb: 0,
                inst_cb: 0
            }
        );
    }, [reportData, watchedFlag]);

    return (
        <div className='fade-in container min-h-screen animate-in space-y-4 p-2 pt-4 duration-500 md:p-4'>
            <CollapsibleSection
                title='PF SUMMARY REPORT'
                description='Select report type, year and employees to generate the report.'
                defaultOpen={true}>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                    <div className='flex flex-col items-center gap-6 rounded-xl border border-slate-200 p-6'>
                        {/* Report Type Radio Group */}
                        <Controller
                            name='flag'
                            key={resetKey}
                            control={control}
                            render={({ field }) => (
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    className='flex flex-wrap justify-center gap-8'>
                                    <div className='flex cursor-pointer items-center space-x-2 rounded-lg bg-white px-4 py-2 shadow-sm transition-shadow hover:shadow-md'>
                                        <RadioGroupItem value='PFTotalReport' id='r1' />
                                        <Label htmlFor='r1' className='cursor-pointer font-medium text-slate-700'>
                                            PF Summary Report
                                        </Label>
                                    </div>
                                    <div className='flex cursor-pointer items-center space-x-2 rounded-lg bg-white px-4 py-2 shadow-sm transition-shadow hover:shadow-md'>
                                        <RadioGroupItem value='PFGrandTotalReport' id='r2' />
                                        <Label htmlFor='r2' className='cursor-pointer font-medium text-slate-700'>
                                            PF Grand Total Report
                                        </Label>
                                    </div>
                                    <div className='flex cursor-pointer items-center space-x-2 rounded-lg bg-white px-4 py-2 shadow-sm transition-shadow hover:shadow-md'>
                                        <RadioGroupItem value='PFStatementReport' id='r3' />
                                        <Label htmlFor='r3' className='cursor-pointer font-medium text-slate-700'>
                                            PF Statement Report
                                        </Label>
                                    </div>
                                </RadioGroup>
                            )}
                        />

                        <div className='grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-2'>
                            {/* Year Selection */}
                            <div className='space-y-2'>
                                <Label className='block font-semibold text-slate-700'>
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

                            {/* Employee Selection */}
                            <div className='space-y-2'>
                                <Label className='block font-semibold text-slate-700'>
                                    Employees <span className='text-destructive'>*</span>
                                </Label>
                                <Controller
                                    key={resetKey}
                                    name='employees'
                                    control={control}
                                    render={({ field }) => (
                                        <MultiSelect
                                            id={field.name}
                                            options={formatedEmployees}
                                            onValueChange={(values) => {
                                                field.onChange(values.join(','));
                                            }}
                                            defaultValue={field.value ? field.value.split(',') : []}
                                            placeholder='Select Employees'
                                            variant='inverted'
                                            className='min-h-9 bg-white'
                                        />
                                    )}
                                />
                                {errors.employees && <FormError>{errors.employees.message}</FormError>}
                            </div>
                        </div>
                    </div>

                    <div className='flex justify-center gap-4'>
                        <Button
                            type='submit'
                            className='min-w-[140px] shadow-lg transition-all hover:shadow-xl'
                            disabled={isLoadingPFSummary}>
                            {isLoadingPFSummary ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Search className='mr-2 h-4 w-4 ' />}{' '}
                            Generate
                        </Button>
                        <Button
                            type='button'
                            variant='outline'
                            className='min-w-[140px] transition-colors hover:bg-slate-100'
                            onClick={handleReset}>
                            <X className='mr-2 h-4 w-4 ' /> Cancel
                        </Button>
                    </div>
                </form>
            </CollapsibleSection>

            {reportData.length > 0 && (
                <CollapsibleSection
                    title='REPORT DETAILS'
                    defaultOpen={true}
                    className='overflow-hidden rounded-xl border-none bg-white shadow-xl'>
                    <div className='flex justify-end gap-3 px-4 print:hidden '>
                        <Button type='button' variant='destructive' className='w-fit gap-2 shadow-md' onClick={handlePrint}>
                            <Printer className='h-4 w-4 ' /> Print
                        </Button>
                        <Button type='button' variant='destructive' className='w-fit gap-2 shadow-sm' onClick={handleExport}>
                            <Download className='h-4 w-4 ' /> Export
                        </Button>
                    </div>

                    <div className='overflow-x-auto p-6' id='printable-report'>
                        {/* Header Section for Print */}
                        <div className='mb-8 space-y-1 text-center'>
                            <h1 className='font-bold text-2xl text-slate-900 uppercase tracking-tight'>
                                {employeeDetails[0]?.mI_Name || "St. James' School"}
                            </h1>
                            <h2 className='font-semibold text-lg text-slate-600 uppercase'>
                                {watchedFlag === 'PFTotalReport'
                                    ? 'PF SUMMARY financial year'
                                    : watchedFlag === 'PFGrandTotalReport'
                                      ? 'PF GRAND TOTAL financial year'
                                      : 'PF Statement for financial year'}
                                <br /> {financialYear}
                            </h2>
                        </div>

                        {/* PF Summary Report Table */}
                        {watchedFlag === 'PFTotalReport' && (
                            <table className='w-full border-collapse text-sm'>
                                <thead>
                                    <tr className='bg-slate-100'>
                                        <th rowSpan={2} className='border border-slate-300 p-2 font-bold'>
                                            Employee Name
                                        </th>
                                        <th colSpan={2} className='border border-slate-300 p-2 font-bold'>
                                            OPENING BALANCE
                                        </th>
                                        <th colSpan={2} className='border border-slate-300 p-2 font-bold'>
                                            CONTRIBUTION
                                        </th>
                                        <th colSpan={2} className='border border-slate-300 p-2 font-bold'>
                                            INTEREST
                                        </th>
                                        <th colSpan={2} className='border border-slate-300 p-2 font-bold'>
                                            TOTAL
                                        </th>
                                        <th colSpan={2} className='border border-slate-300 p-2 font-bold'>
                                            SETTLEMENT
                                        </th>
                                        <th colSpan={2} className='border border-slate-300 p-2 font-bold'>
                                            CLOSING BALANCE
                                        </th>
                                    </tr>
                                    <tr className='bg-slate-50'>
                                        <th className='border border-slate-300 p-2 font-semibold'>Own</th>
                                        <th className='border border-slate-300 p-2 font-semibold'>School</th>
                                        <th className='border border-slate-300 p-2 font-semibold'>Own</th>
                                        <th className='border border-slate-300 p-2 font-semibold'>School</th>
                                        <th className='border border-slate-300 p-2 font-semibold'>Own</th>
                                        <th className='border border-slate-300 p-2 font-semibold'>School</th>
                                        <th className='border border-slate-300 p-2 font-semibold'>Own</th>
                                        <th className='border border-slate-300 p-2 font-semibold'>School</th>
                                        <th className='border border-slate-300 p-2 font-semibold'>Own</th>
                                        <th className='border border-slate-300 p-2 font-semibold'>School</th>
                                        <th className='border border-slate-300 p-2 font-semibold'>Own</th>
                                        <th className='border border-slate-300 p-2 font-semibold'>School</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportData.map((user, idx) => (
                                        <tr key={idx} className='transition-colors hover:bg-slate-50'>
                                            <td className='border border-slate-300 p-2 text-center font-medium'>
                                                {user?.hrmE_EmployeeFirstName}
                                            </td>
                                            <td className='border border-slate-300 p-2 text-center'>
                                                {user.hrepfsT_OBOwnAmount || user.HREPFST_OBOwnAmount || 0}
                                            </td>
                                            <td className='border border-slate-300 p-2 text-center'>
                                                {user.hrepfsT_OBInstituteAmount || user.HREPFST_OBInstituteAmount || 0}
                                            </td>
                                            <td className='border border-slate-300 p-2 text-center'>
                                                {user.hrepfsT_OwnContribution || user.HREVPFST_Contribution || 0}
                                            </td>
                                            <td className='border border-slate-300 p-2 text-center'>
                                                {user.hrepfsT_InstituteContribution || user.HREPFST_IntstituteContribution || 0}
                                            </td>
                                            <td className='border border-slate-300 p-2 text-center'>
                                                {user.hrepfsT_OwnInterest || user.HREVPFST_Intersest || 0}
                                            </td>
                                            <td className='border border-slate-300 p-2 text-center'>
                                                {user.hrepfsT_InstituteInterest || user.HREPFST_InstituteInterest || 0}
                                            </td>
                                            <td className='border border-slate-300 p-2 text-center'>
                                                {user.own_GrandTotal || user.OWN_GRANDTOTAL || 0}
                                            </td>
                                            <td className='border border-slate-300 p-2 text-center'>
                                                {user.inst_GrandTotal || user.INST_GRANDTOTAL || 0}
                                            </td>
                                            <td className='border border-slate-300 p-2 text-center'>
                                                {user.hrepfsT_OwnSettlementAmount || user.HREPFST_OwnSettlementAmount || 0}
                                            </td>
                                            <td className='border border-slate-300 p-2 text-center'>
                                                {user.hrepfsT_InstituteLSettlementAmount || user.hrepfsT_InstituteLSettlementAmount || 0}
                                            </td>
                                            <td className='border border-slate-300 p-2 text-center'>
                                                {user.hrepfsT_OwnClosingBalance || user.hrepfsT_OwnClosingBalance || 0}
                                            </td>
                                            <td className='border border-slate-300 p-2 text-center'>
                                                {user.hrepfsT_InstituteClosingBalance || user.hrepfsT_InstituteClosingBalance || 0}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className='bg-slate-100 font-bold'>
                                    <tr>
                                        <td className='border border-slate-300 p-2 text-center uppercase'>Grand Total</td>
                                        <td className='border border-slate-300 p-2 text-center'>{totals?.own_ob}</td>
                                        <td className='border border-slate-300 p-2 text-center'>{totals?.inst_ob}</td>
                                        <td className='border border-slate-300 p-2 text-center'>{totals?.own_cont}</td>
                                        <td className='border border-slate-300 p-2 text-center'>{totals?.inst_cont}</td>
                                        <td className='border border-slate-300 p-2 text-center'>{totals?.own_int}</td>
                                        <td className='border border-slate-300 p-2 text-center'>{totals?.inst_int}</td>
                                        <td className='border border-slate-300 p-2 text-center'>{totals?.own_total}</td>
                                        <td className='border border-slate-300 p-2 text-center'>{totals?.inst_total}</td>
                                        <td className='border border-slate-300 p-2 text-center'>{totals?.own_settle}</td>
                                        <td className='border border-slate-300 p-2 text-center'>{totals?.inst_settle}</td>
                                        <td className='border border-slate-300 p-2 text-center'>{totals?.own_cb}</td>
                                        <td className='border border-slate-300 p-2 text-center'>{totals?.inst_cb}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        )}

                        {/* PF Grand Total Report Table */}
                        {watchedFlag === 'PFGrandTotalReport' && (
                            <table className='mx-auto w-full rounded-lg text-sm shadow-sm ring-1 ring-slate-200 '>
                                <thead>
                                    <tr>
                                        <th className='border border-slate-300 p-3 text-center'>Category</th>
                                        <th className='border border-slate-300 p-3 text-center'>Own Total</th>
                                        <th className='border border-slate-300 p-3 text-center'>School Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        {
                                            label: 'OPENING BALANCE',
                                            own: 'hrepfsT_OBOwnAmount',
                                            altOwn: 'HREPFST_OBOwnAmount',
                                            inst: 'hrepfsT_OBInstituteAmount',
                                            altInst: 'HREPFST_OBInstituteAmount'
                                        },
                                        {
                                            label: 'PF CONTRIBUTION',
                                            own: 'hrepfsT_OwnContribution',
                                            altOwn: 'HREPFST_Contribution',
                                            inst: 'hrepfsT_InstituteContribution',
                                            altInst: 'HREPFST_IntstituteContribution'
                                        },
                                        {
                                            label: 'PF TRANSFER',
                                            own: 'hrepfsT_OwnTransferAmount',
                                            altOwn: 'HREPFST_OwnTransferAmount',
                                            inst: 'hrepfsT_InstituteTransferAmount',
                                            altInst: 'HREPFST_InstituteTransferAmount'
                                        },
                                        {
                                            label: 'INTEREST',
                                            own: 'hrepfsT_OwnInterest',
                                            altOwn: 'HREVPFST_Intersest',
                                            inst: 'hrepfsT_InstituteInterest',
                                            altInst: 'HREPFST_InstituteInterest'
                                        },
                                        {
                                            label: 'NON REFUNDABLE LOAN',
                                            own: 'hrepfsT_OwnWithdrwanAmount',
                                            altOwn: 'HREPFST_OwnWithdrawnAmount',
                                            inst: 'hrepfsT_InstituteWithdrawnAmount',
                                            altInst: 'HREPFST_InstituteWithdrawnAmount'
                                        },
                                        {
                                            label: 'SETTLEMENT',
                                            own: 'hrepfsT_OwnSettlementAmount',
                                            altOwn: 'HREPFST_OwnSettlementAmount',
                                            inst: 'hrepfsT_InstituteLSettlementAmount',
                                            altInst: 'HREPFST_InstituteLSettlementAmount'
                                        },
                                        {
                                            label: 'CLOSING BALANCE',
                                            own: 'hrepfsT_OwnClosingBalance',
                                            altOwn: 'HREPFST_OwnClosingBalance',
                                            inst: 'hrepfsT_InstituteClosingBalance',
                                            altInst: 'HREPFST_InstituteClosingBalance'
                                        }
                                    ].map((row: any, idx) => (
                                        <tr key={idx}>
                                            <td className='border border-slate-300 p-3 font-semibold'>{row.label}</td>
                                            <td className='border border-slate-300 p-3 text-center'>
                                                {reportData[0]?.[row.own] || reportData[0]?.[row.altOwn] || 0}
                                            </td>
                                            <td className='border border-slate-300 p-3 text-center'>
                                                {reportData[0]?.[row.inst] || reportData[0]?.[row.altInst] || 0}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {/* PF Statement Report Table */}
                        {watchedFlag === 'PFStatementReport' && (
                            <table className='w-full border-collapse text-sm'>
                                <thead className='bg-slate-100'>
                                    <tr>
                                        <th className='w-[10%] border border-slate-300 p-3'>SL NO.</th>
                                        <th className='w-[35%] border border-slate-300 p-3 text-left'>EMPLOYEE NAME</th>
                                        <th className='w-[20%] border border-slate-300 p-3'>PF AC NO</th>
                                        <th className='w-[15%] border border-slate-300 p-3'>SLIP NO</th>
                                        <th className='w-[20%] border border-slate-300 p-3'>SIGNATURE</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportData.map((item, idx) => (
                                        <tr key={idx} className='hover:bg-slate-50'>
                                            <td className='border border-slate-300 p-3 text-center'>{idx + 1}</td>
                                            <td className='border border-slate-300 p-3 text-left font-medium'>
                                                {item?.hrmE_EmployeeFirstName}
                                            </td>
                                            <td className='border border-slate-300 p-3 text-center'>
                                                {item.hrmE_PFAccNo || item.HRME_PFAccNo}
                                            </td>
                                            <td className='border border-slate-300 p-3 text-center'>
                                                {item.hrmE_EmployeeOrder || item.HRME_EmployeeOrder || idx + 1}
                                            </td>
                                            <td className='border border-slate-300 p-3'></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </CollapsibleSection>
            )}
        </div>
    );
}
