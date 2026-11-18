'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table/data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useLeaveYearDropdown } from '@/hooks/hrms/useMasters';
import { useGetEmployees } from '@/hooks/hrms/useMasters';
import { getSalaryIncrementReport } from '@/server/hrms/reports/salary-increment-report';
import { useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import { FileSpreadsheet, FileText, Printer } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { columns } from './_components/columns';
import {
    type SalaryIncrementErrors,
    SalaryIncrementFilters,
    type SalaryIncrementFilters as SalaryIncrementFiltersType
} from './_components/filters';

const MONTH_LIST = [
    { ivrM_Month_Id: 1, ivrM_Month_Name: 'January' },
    { ivrM_Month_Id: 2, ivrM_Month_Name: 'February' },
    { ivrM_Month_Id: 3, ivrM_Month_Name: 'March' },
    { ivrM_Month_Id: 4, ivrM_Month_Name: 'April' },
    { ivrM_Month_Id: 5, ivrM_Month_Name: 'May' },
    { ivrM_Month_Id: 6, ivrM_Month_Name: 'June' },
    { ivrM_Month_Id: 7, ivrM_Month_Name: 'July' },
    { ivrM_Month_Id: 8, ivrM_Month_Name: 'August' },
    { ivrM_Month_Id: 9, ivrM_Month_Name: 'September' },
    { ivrM_Month_Id: 10, ivrM_Month_Name: 'October' },
    { ivrM_Month_Id: 11, ivrM_Month_Name: 'November' },
    { ivrM_Month_Id: 12, ivrM_Month_Name: 'December' }
];

export default function SalaryIncrementReportPage() {
    const [filters, setFilters] = useState<SalaryIncrementFiltersType>({
        type: 'All',
        option: 'MONTHWISE',
        hrmE_Id: '',
        monthid: '',
        yearid: '',
        fromdate: undefined,
        todate: undefined
    });
    const [errors, setErrors] = useState<SalaryIncrementErrors>({});

    const [reportData, setReportData] = useState<any[]>([]);

    const { data: employeesData, isLoading: isLoadingEmployees } = useGetEmployees();
    const { data: yearsData, isLoading: isLoadingYears } = useLeaveYearDropdown();

    console.log('employeesData', employeesData);
    console.log('yearsData', yearsData);

    const { mutate: getReport, isPending: isGenerating } = useMutation({
        mutationFn: getSalaryIncrementReport,
        onSuccess: (res) => {
            if (res.success && res.data) {
                setReportData(res.data);
                if (res.data.length === 0) {
                    toast.info('No records found for the selected criteria');
                } else {
                    toast.success(`Fetched ${res.data.length} record(s) successfully`);
                }
            } else {
                toast.error(res.message || 'Failed to fetch report');
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || 'An error occurred while fetching the report');
        }
    });

    const handleFilterChange = (newFilters: SalaryIncrementFiltersType) => {
        setFilters(newFilters);
        // Clear error for the field being changed
        setErrors({});
    };

    const handleReport = () => {
        console.log('filters', filters);
        // Validation
        const newErrors: SalaryIncrementErrors = {};
        let hasErrors = false;

        if (filters.type === 'Individual' && !filters.hrmE_Id) {
            newErrors.hrmE_Id = 'Employee selection is required';
            hasErrors = true;
        }

        if (filters.option === 'MONTHWISE') {
            if (!filters.monthid) {
                newErrors.monthid = 'Month is required';
                hasErrors = true;
            }
            if (!filters.yearid) {
                newErrors.yearid = 'Year is required';
                hasErrors = true;
            }
        } else {
            if (!filters.fromdate) {
                newErrors.fromdate = 'From date is required';
                hasErrors = true;
            }
            if (!filters.todate) {
                newErrors.todate = 'To date is required';
                hasErrors = true;
            }
        }

        if (hasErrors) {
            setErrors(newErrors);
            // toast.error('Please fix the errors in the form');
            return;
        }

        setErrors({});

        const payload = {
            hrmE_Id: filters.type === 'All' ? '' : filters.hrmE_Id,
            fromdate: filters.option === 'DATEWISE' ? format(filters.fromdate!, 'yyyy-MM-dd') : '',
            todate: filters.option === 'DATEWISE' ? format(filters.todate!, 'yyyy-MM-dd') : '',
            monthid: filters.option === 'MONTHWISE' ? filters.monthid : '',
            yearid: filters.option === 'MONTHWISE' ? filters.yearid : '',
            type: filters.type,
            option: filters.option
        };

        console.log('payload', payload);

        getReport(payload);
    };

    const [formKey, setFormKey] = useState(0);

    const handleCancel = () => {
        setFilters({
            type: 'All',
            option: 'MONTHWISE',
            hrmE_Id: '',
            monthid: '',
            yearid: '',
            fromdate: undefined,
            todate: undefined
        });
        setErrors({});
        setReportData([]);
        setFormKey((prev) => prev + 1);
        toast.info('Filters have been reset');
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExport = () => {
        if (reportData.length === 0) return;

        const exportData = reportData.map((item, index) => ({
            'SL.No.': index + 1,
            'Employee Name': item.employeeName,
            'Head Name': item.hrmeD_Name,
            'Increment Date': item.hreiC_IncrementDate ? format(new Date(item.hreiC_IncrementDate), 'dd/MM/yyyy') : '',
            'Next Increment Date': item.hreiC_NextIncrementGivenDate
                ? format(new Date(item.hreiC_NextIncrementGivenDate), 'dd/MM/yyyy')
                : '',
            'Previous Amount': item.hreiceD_PreviousAmount,
            Amount: item.hreiceD_Amount,
            Percentage: item.hreiceD_Percentage + '%',
            'Amount Incremented': item.incrementamount,
            'Total Amount': item.hreeD_Amount
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Increment Report');
        XLSX.writeFile(wb, `Salary_Increment_Report_${format(new Date(), 'yyyyMMdd')}.xlsx`);
    };

    return (
        <div className='fade-in container mx-auto animate-in space-y-8 p-6 duration-500'>
            <SalaryIncrementFilters
                key={formKey}
                filters={filters}
                errors={errors}
                employees={employeesData?.data || []}
                months={MONTH_LIST}
                years={yearsData?.data || []}
                isLoadingEmployees={isLoadingEmployees}
                isLoadingYears={isLoadingYears}
                isGenerating={isGenerating}
                hasResults={reportData.length > 0}
                onFilterChange={handleFilterChange}
                onReport={handleReport}
                onCancel={handleCancel}
                onPrint={handlePrint}
                onExport={handleExport}
            />

            {reportData.length > 0 && (
                <CollapsibleSection defaultOpen={true} title='Report Results' className='font-medium text-xl'>
                    <Card className='border-none shadow-xl print:shadow-none '>
                        <CardHeader className='flex flex-row items-center justify-between border-b bg-primary/5'>
                            <div className='flex items-center gap-3'>
                                <div className='rounded-lg bg-primary/10 p-2'>
                                    <FileText className='h-5 w-5 text-primary' />
                                </div>
                                <div>
                                    <CardTitle className='font-bold text-xl'>Report Results</CardTitle>
                                    <p className='font-medium text-muted-foreground text-xs uppercase tracking-wider'>
                                        Total Records: {reportData.length}
                                    </p>
                                </div>
                            </div>
                            <div className='flex gap-4'>
                                <Button
                                    variant='outline'
                                    onClick={handlePrint}
                                    className='min-w-[140px] border-primary text-primary hover:bg-primary hover:text-white'>
                                    <Printer className='mr-2 h-4 w-4' />
                                    Print
                                </Button>
                                <Button
                                    variant='outline'
                                    onClick={handleExport}
                                    className='min-w-[140px] border-green-600 text-green-600 hover:bg-green-600 hover:text-white'>
                                    <FileSpreadsheet className='mr-2 h-4 w-4' />
                                    Export Excel
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className='p-2 '>
                            <div className='print:hidden'>
                                <DataTable
                                    columns={columns}
                                    data={reportData}
                                    totalItems={reportData.length}
                                    isSearchRequired={true}
                                    isPaginationRequired={true}
                                    showViewOptions={false}
                                />
                            </div>

                            {/* Print View Table */}
                            <div className='printable-content hidden p-8 print:block'>
                                <h2 className='mb-6 text-center font-bold text-2xl'>Salary Increment Report</h2>
                                <table className='w-full border-collapse border border-gray-300 text-sm'>
                                    <thead>
                                        <tr className='bg-gray-100 italic'>
                                            <th className='border border-gray-300 p-2 text-xs'>SL.No.</th>
                                            <th className='border border-gray-300 p-2 text-left text-xs'>Employee Name</th>
                                            <th className='border border-gray-300 p-2 text-left text-xs'>Head Name</th>
                                            <th className='border border-gray-300 p-2 text-xs'>Increment Date</th>
                                            <th className='border border-gray-300 p-2 text-xs'>Next Increment Date</th>
                                            <th className='border border-gray-300 p-2 text-right text-xs'>Prev Amount</th>
                                            <th className='border border-gray-300 p-2 text-right text-xs'>Amount</th>
                                            <th className='border border-gray-300 p-2 text-xs'>%</th>
                                            <th className='border border-gray-300 p-2 text-right text-xs'>Inc Amount</th>
                                            <th className='border border-gray-300 p-2 text-right text-xs'>Total Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportData.map((item, index) => (
                                            <tr key={index} className='hover:bg-gray-50'>
                                                <td className='border border-gray-300 p-2 text-center text-xs'>{index + 1}</td>
                                                <td className='border border-gray-300 p-2 text-xs'>{item.employeeName}</td>
                                                <td className='border border-gray-300 p-2 text-xs'>{item.hrmeD_Name}</td>
                                                <td className='border border-gray-300 p-2 text-center text-xs'>
                                                    {item.hreiC_IncrementDate
                                                        ? format(new Date(item.hreiC_IncrementDate), 'dd/MM/yyyy')
                                                        : '-'}
                                                </td>
                                                <td className='border border-gray-300 p-2 text-center text-xs'>
                                                    {item.hreiC_NextIncrementGivenDate
                                                        ? format(new Date(item.hreiC_NextIncrementGivenDate), 'dd/MM/yyyy')
                                                        : '-'}
                                                </td>
                                                <td className='border border-gray-300 p-2 text-right text-xs'>
                                                    {item.hreiceD_PreviousAmount?.toLocaleString()}
                                                </td>
                                                <td className='border border-gray-300 p-2 text-right text-xs'>
                                                    {item.hreiceD_Amount?.toLocaleString()}
                                                </td>
                                                <td className='border border-gray-300 p-2 text-center text-xs'>
                                                    {item.hreiceD_Percentage}%
                                                </td>
                                                <td className='border border-gray-300 p-2 text-right text-xs'>
                                                    {item.incrementamount?.toLocaleString()}
                                                </td>
                                                <td className='border border-gray-300 p-2 text-right font-bold text-xs'>
                                                    {item.hreeD_Amount?.toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </CollapsibleSection>
            )}
        </div>
    );
}
