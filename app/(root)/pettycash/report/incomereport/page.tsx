'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { usePDAReportQuery } from '@/hooks/pettycash/report/usePDAReport';
import type { IPDAReportParams } from '@/types/pettycash/report/PDAReport';
import type { IPDAReportExpense, IPDAReportIncome, IPDAReportSummary } from '@/types/pettycash/report/PDAReport';
import { format } from 'date-fns';
import xlsx, { type IJsonSheet } from 'json-as-xlsx';
import { FileText, TrendingDown, TrendingUp, XCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';
import { expenseColumns, incomeColumns } from './_components/columns';
import PDAReportForm, { type PDAFormValues } from './_components/report-form';

export default function PDAReportPage() {
    const [incomeData, setIncomeData] = useState<IPDAReportIncome[]>([]);
    const [expenseData, setExpenseData] = useState<IPDAReportExpense[]>([]);
    const [summaryData, setSummaryData] = useState<IPDAReportSummary[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const [queryParams, setQueryParams] = useState<IPDAReportParams | null>(null);
    const { data: reportResponse, isLoading: isQueryLoading, error: queryError } = usePDAReportQuery(queryParams);
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: printRef
    });

    const handleSearch = (values: PDAFormValues) => {
        setIsSearching(true);
        setHasSearched(true);
        const payload = {
            ASMAY_Id: Number(values.ASMAY_Id),
            From_Date: format(values.From_Date, 'yyyy-MM-dd')
        };
        setQueryParams(payload);
    };

    // Use useEffect to handle response data when query completes
    useEffect(() => {
        if (reportResponse) {
            console.log('response', reportResponse?.data);
            const reportData = reportResponse?.data || (reportResponse as any);

            const incomeRaw = reportData?.incomereport || reportData?.income;
            const income = Array.isArray(incomeRaw) ? incomeRaw : incomeRaw?.$values || [];

            const expenseRaw = reportData?.expensereport || reportData?.expense;
            const expense = Array.isArray(expenseRaw) ? expenseRaw : expenseRaw?.$values || [];

            const summaryRaw = reportData?.fhwR_searchdatalist || reportData?.summary;
            const summary = Array.isArray(summaryRaw) ? summaryRaw : summaryRaw?.$values || [];

            setIncomeData(income);
            setExpenseData(expense);
            setSummaryData(summary);

            if (income.length === 0 && expense.length === 0) {
                if (!isQueryLoading) {
                    toast.info('No records found for the selected criteria.');
                }
            } else {
                toast.success('Report generated successfully!');
            }
            setIsSearching(false);
        }
        if (queryError) {
            console.error('Error fetching report:', queryError);
            toast.error('An error occurred while fetching the report.');
            setIncomeData([]);
            setExpenseData([]);
            setSummaryData([]);
            setIsSearching(false);
        }
    }, [reportResponse, queryError, isQueryLoading]);

    const handleCancel = () => {
        setIncomeData([]);
        setExpenseData([]);
        setSummaryData([]);
        setHasSearched(false);
        setQueryParams(null);
    };

    const handleExport = () => {
        if (incomeData.length === 0 && expenseData.length === 0) return;

        const incomeContent = incomeData.map((item, index) => ({
            slNo: index + 1,
            payment_Mode: item.payment_Mode || (item as any).Payment_Mode,
            fyP_Tot_Amount: item.fyP_Tot_Amount ?? (item as any).FYP_Tot_Amount ?? (item.cashAmount || 0) + (item.bankAmount || 0)
        }));

        const expenseContent = expenseData.map((item, index) => ({
            slNo: index + 1,
            particular: item.particular || (item as any).Particular,
            pcreqtndeT_Amount: item.pcreqtndeT_Amount ?? (item as any).PCREQTNDET_Amount ?? 0
        }));

        const data: IJsonSheet[] = [
            {
                sheet: 'Income Details',
                columns: [
                    { label: 'SL.NO', value: 'slNo' },
                    { label: 'Particulars', value: 'payment_Mode' },
                    { label: 'Total Amount', value: 'fyP_Tot_Amount' }
                ],
                content: incomeContent as any[]
            },
            {
                sheet: 'Expense Details',
                columns: [
                    { label: 'SL.NO', value: 'slNo' },
                    { label: 'Particulars', value: 'particular' },
                    { label: 'Amount', value: 'pcreqtndeT_Amount' }
                ],
                content: expenseContent as any[]
            }
        ];

        const settings = {
            fileName: `Income_Expense_Report_${format(new Date(), 'yyyyMMdd')}`,
            extraLength: 3,
            writeMode: 'writeFile'
        };

        xlsx(data, settings);
    };

    const totalIncome = incomeData.reduce(
        (acc, curr) =>
            acc + (Number(curr.fyP_Tot_Amount || (curr as any).FYP_Tot_Amount || (curr.cashAmount || 0) + (curr.bankAmount || 0)) || 0),
        0
    );
    const totalExpense = expenseData.reduce(
        (acc, curr) => acc + (Number(curr.pcreqtndeT_Amount || (curr as any).PCREQTNDET_Amount) || 0),
        0
    );
    const balance = totalIncome - totalExpense;

    return (
        <div className='min-h-screen bg-gray-50/30'>
            <div className='container space-y-6 p-6'>
                <CollapsibleSection defaultOpen>
                    <PDAReportForm
                        onSearch={handleSearch}
                        onCancel={handleCancel}
                        onExport={handleExport}
                        onPrint={() => handlePrint()}
                        showReportButtons={incomeData.length > 0 || expenseData.length > 0}
                    />
                </CollapsibleSection>

                {isSearching && (
                    <div className='flex flex-col items-center justify-center p-20'>
                        <div className='mb-4 h-10 w-10 animate-spin rounded-full border-orange-600 border-b-2'></div>
                        <p className='animate-pulse font-bold text-[10px] text-orange-600 uppercase tracking-widest'>
                            Generating Report...
                        </p>
                    </div>
                )}

                {!isSearching && (incomeData.length > 0 || expenseData.length > 0) && (
                    <div className='space-y-6'>
                        <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                            <Card className='border-green-100 bg-white shadow-sm'>
                                <CardContent className='flex items-center gap-4 p-4'>
                                    <div className='rounded-lg bg-green-50 p-3'>
                                        <TrendingUp className='h-6 w-6 text-green-600' />
                                    </div>
                                    <div>
                                        <p className='font-bold text-[10px] text-green-600 uppercase tracking-wider'>Total Income</p>
                                        <p className='font-bold text-slate-800 text-xl'>
                                            ₹ {totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className='border-red-100 bg-white shadow-sm'>
                                <CardContent className='flex items-center gap-4 p-4'>
                                    <div className='rounded-lg bg-red-50 p-3'>
                                        <TrendingDown className='h-6 w-6 text-red-600' />
                                    </div>
                                    <div>
                                        <p className='font-bold text-[10px] text-red-600 uppercase tracking-wider'>Total Expense</p>
                                        <p className='font-bold text-slate-800 text-xl'>
                                            ₹ {totalExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className={`bg-white shadow-sm ${balance >= 0 ? 'border-blue-100' : 'border-orange-100'}`}>
                                <CardContent className='flex items-center gap-4 p-4'>
                                    <div className={`rounded-lg p-3 ${balance >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}>
                                        <FileText className={`h-6 w-6 ${balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
                                    </div>
                                    <div>
                                        <p
                                            className={`font-bold text-[10px] uppercase tracking-wider ${balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                                            Net Balance
                                        </p>
                                        <p className={`font-bold text-xl ${balance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                            ₹ {balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className='grid grid-cols-1 gap-6 xl:grid-cols-2'>
                            <Card className='overflow-hidden border-purple-50 bg-white shadow-md'>
                                <CardHeader className='border-b bg-slate-50/50 px-4 py-3'>
                                    <CardTitle className='flex items-center gap-2 font-bold text-slate-700 text-sm'>
                                        <TrendingUp className='h-4 w-4 text-green-600' />
                                        Income Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className='p-0'>
                                    <GenericDataTable data={incomeData} columns={incomeColumns} isLoading={isSearching} />
                                </CardContent>
                            </Card>

                            <Card className='overflow-hidden border-purple-50 bg-white shadow-md'>
                                <CardHeader className='border-b bg-slate-50/50 px-4 py-3'>
                                    <CardTitle className='flex items-center gap-2 font-bold text-slate-700 text-sm'>
                                        <TrendingDown className='h-4 w-4 text-red-600' />
                                        Expense Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className='p-0'>
                                    <GenericDataTable data={expenseData} columns={expenseColumns} isLoading={isSearching} />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Summary Table */}
                        {summaryData && summaryData.length >= 2 && (
                            <div className='mt-6 flex justify-center'>
                                <Card className='w-full max-w-md border-purple-100 shadow-sm'>
                                    <CardContent className='p-0'>
                                        <table className='w-full text-sm'>
                                            <tbody>
                                                <tr className='border-b'>
                                                    <td className='p-3 font-semibold text-slate-700'>Cash Deposited By Bank</td>
                                                    <td className='p-3 text-right font-bold text-red-600'>
                                                        ₹{' '}
                                                        {(
                                                            Number(
                                                                summaryData[0].pcreqtndeT_Amount ||
                                                                    (summaryData[0] as any).PCREQTNDET_Amount
                                                            ) || 0
                                                        ).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className='p-3 font-semibold text-slate-700'>Cash Sent to Home</td>
                                                    <td className='p-3 text-right font-bold text-red-600'>
                                                        ₹{' '}
                                                        {(
                                                            Number(
                                                                summaryData[1].pcreqtndeT_Amount ||
                                                                    (summaryData[1] as any).PCREQTNDET_Amount
                                                            ) || 0
                                                        ).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>
                )}

                {!isSearching && hasSearched && incomeData.length === 0 && expenseData.length === 0 && (
                    <div className='flex flex-col items-center justify-center rounded-xl border border-gray-300 border-dashed bg-white p-20'>
                        <XCircle className='mb-4 h-12 w-12 text-gray-200' />
                        <p className='font-medium text-gray-500'>No records found for the selected period.</p>
                    </div>
                )}
            </div>

            {/* Hidden Print Section */}
            <div className='hidden'>
                <div ref={printRef} className='space-y-6 bg-white p-8 text-black'>
                    <div className='border-slate-900 border-b-2 pb-4 text-center'>
                        <h1 className='font-bold text-2xl uppercase'>Daily Income & Expense Report</h1>
                        <p className='text-sm'>Report Date: {format(new Date(), 'dd/MM/yyyy')}</p>
                    </div>

                    <div className='grid grid-cols-2 gap-8'>
                        <div>
                            <h2 className='mb-2 border-b font-bold text-green-700 text-lg'>Income</h2>
                            <table className='w-full border-collapse border border-slate-400 text-xs'>
                                <thead>
                                    <tr className='bg-slate-100'>
                                        <th className='border border-slate-400 p-1 text-center'>SL.NO</th>
                                        <th className='border border-slate-400 p-1 text-left'>Particulars</th>
                                        <th className='border border-slate-400 p-1 text-right'>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {incomeData.map((item, idx) => (
                                        <tr key={idx}>
                                            <td className='border border-slate-400 p-1 text-center'>{idx + 1}</td>
                                            <td className='border border-slate-400 p-1'>
                                                {item.payment_Mode || (item as any).Payment_Mode}
                                            </td>
                                            <td className='border border-slate-400 p-1 text-right font-bold'>
                                                {(Number(item.fyP_Tot_Amount || (item as any).FYP_Tot_Amount) || 0).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className='bg-green-50 font-bold'>
                                        <td colSpan={2} className='border border-slate-400 p-1 text-right'>
                                            Total Income
                                        </td>
                                        <td className='border border-slate-400 p-1 text-right'>₹ {totalIncome.toFixed(2)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        <div>
                            <h2 className='mb-2 border-b font-bold text-lg text-red-700'>Expense</h2>
                            <table className='w-full border-collapse border border-slate-400 text-xs'>
                                <thead>
                                    <tr className='bg-slate-100'>
                                        <th className='border border-slate-400 p-1 text-center'>SL.NO</th>
                                        <th className='border border-slate-400 p-1 text-left'>Particulars</th>
                                        <th className='border border-slate-400 p-1 text-right'>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {expenseData.map((item, idx) => (
                                        <tr key={idx}>
                                            <td className='border border-slate-400 p-1 text-center'>{idx + 1}</td>
                                            <td className='border border-slate-400 p-1'>{item.particular || (item as any).Particular}</td>
                                            <td className='border border-slate-400 p-1 text-right font-bold'>
                                                {(Number(item.pcreqtndeT_Amount || (item as any).PCREQTNDET_Amount) || 0).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className='bg-red-50 font-bold'>
                                        <td colSpan={2} className='border border-slate-400 p-1 text-right'>
                                            Total Expense
                                        </td>
                                        <td className='border border-slate-400 p-1 text-right'>₹ {totalExpense.toFixed(2)}</td>
                                    </tr>
                                    <tr className='bg-blue-50 font-bold'>
                                        <td colSpan={2} className='border border-slate-400 p-1 text-right'>
                                            Closing Balance
                                        </td>
                                        <td className='border border-slate-400 p-1 text-right'>₹ {balance.toFixed(2)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {summaryData && summaryData.length >= 2 && (
                        <div className='mt-6'>
                            <table className='mx-auto w-1/2 border-collapse border border-slate-400 text-sm'>
                                <tbody>
                                    <tr>
                                        <td className='border border-slate-400 p-2 font-bold'>Cash Deposited By Bank</td>
                                        <td className='border border-slate-400 p-2 text-right font-bold text-red-600'>
                                            ₹{' '}
                                            {(
                                                Number(summaryData[0].pcreqtndeT_Amount || (summaryData[0] as any).PCREQTNDET_Amount) || 0
                                            ).toFixed(2)}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='border border-slate-400 p-2 font-bold'>Cash Sent to Home</td>
                                        <td className='border border-slate-400 p-2 text-right font-bold text-red-600'>
                                            ₹{' '}
                                            {(
                                                Number(summaryData[1].pcreqtndeT_Amount || (summaryData[1] as any).PCREQTNDET_Amount) || 0
                                            ).toFixed(2)}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className='flex justify-between pt-12 font-bold text-[10px] uppercase'>
                        <div className='border-black border-t px-4 pt-1'>Generated By</div>
                        <div className='border-black border-t px-4 pt-1'>Authorized Signature</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
