'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { getInvRMonthEndReport } from '@/server/inventory/reports/inv-r-month-end-report';
import type {
    IInvRMonthEndReportData,
    IInvRMonthEndReportPayload,
    IInvRMonthEndReportTableRow
} from '@/types/inventory/reports/inv-r-month-end-report';
import { format } from 'date-fns';
import { saveAs } from 'file-saver';
import { FileSpreadsheet, Printer } from 'lucide-react';
import { useState } from 'react';
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { columns } from './_components/columns';
import ReportForm from './_components/report-form';

import { InvRMonthEndReportPrint } from './_components/inv-r-month-end-report-print';

export default function InvRMonthEndReportPage() {
    const [reportData, setReportData] = useState<IInvRMonthEndReportData | null>(null);
    const [currentPayload, setCurrentPayload] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showReport, setShowReport] = useState(false);
    const componentRef = useRef<HTMLDivElement>(null);

    const handleReportGenerated = async (data: IInvRMonthEndReportPayload | null, extraPayload: any) => {
        if (data === null) {
            setReportData(null);
            setCurrentPayload(null);
            setShowReport(false);
            return;
        }
        setIsLoading(true);
        const result = await getInvRMonthEndReport(data);
        if (result.success && result.data) {
            const hasData = result.data.grnCount > 0 || result.data.salesCount > 0 || result.data.itemCount > 0;
            if (!hasData) {
                toast.error('No record found');
            }
            setReportData(result.data);
            setCurrentPayload({ ...data, ...extraPayload });
            setShowReport(true);
        } else {
            setReportData(null);
            setShowReport(false);
            toast.error(result.message || 'No record found');
        }
        setIsLoading(false);
    };

    const handlePrintContent = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Month End Report - ${format(new Date(), 'dd-MM-yyyy')}`
    });

    const handlePrint = () => {
        if (!reportData) return;
        handlePrintContent();
    };

    const getTableData = (): IInvRMonthEndReportTableRow[] => {
        if (!reportData) return [];
        return [
            {
                id: 1,
                inventory: 'GRN',
                count: reportData.grnCount,
                sms: reportData.sms,
                email: reportData.email
            },
            {
                id: 2,
                inventory: 'SALES',
                count: reportData.salesCount,
                sms: reportData.sms,
                email: reportData.email
            },
            {
                id: 3,
                inventory: 'ITEM CONSUMPTION',
                count: reportData.itemCount,
                sms: reportData.sms,
                email: reportData.email
            }
        ];
    };

    const tableData = getTableData();

    const handleExport = () => {
        if (!reportData) return;
        const dataToExport = tableData.map((row) => ({
            'SL.NO': row.id,
            INVENTORY: row.inventory,
            COUNT: row.count,
            SMS: row.sms,
            EMAIL: row.email
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Month End Report');
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
        saveAs(data, `Inventory_Month_End_Report_${currentPayload?.Month_Name}_${currentPayload?.ASMAY_Year}.xlsx`);
    };

    const chartData = reportData
        ? [
              { name: 'GRN COUNT', count: reportData.grnCount },
              { name: 'SALES COUNT', count: reportData.salesCount },
              { name: 'ITEM CONS.', count: reportData.itemCount },
              { name: 'SMS COUNT', count: reportData.sms },
              { name: 'EMAIL COUNT', count: reportData.email }
          ]
        : [];

    return (
        <div className='container mx-auto space-y-6 px-4 py-6'>
            <Heading title='Inventory Month End Report' description='Generate Inventory Month End Report' />

            <ReportForm onReportGenerated={handleReportGenerated} isLoading={isLoading} />

            {showReport && currentPayload && (
                <CollapsibleSection title='Report Result' defaultOpen={true}>
                    <div className='space-y-8 rounded-lg border border-slate-200 bg-white p-6 text-slate-900 shadow-sm'>
                        {/* Header Section */}
                        <div className='mb-8 flex flex-col items-center justify-center space-y-3 border-slate-200 border-b pb-6'>
                            <h3 className='text-center font-bold text-3xl text-slate-800 uppercase tracking-tight'>
                                Inventory Month End Report
                            </h3>
                            <div className='h-1 w-24 rounded-full bg-primary'></div>
                            <p className='font-medium text-lg text-slate-600 uppercase tracking-wide'>
                                {currentPayload.Month_Name} - {currentPayload.ASMAY_Year}
                            </p>
                        </div>

                        {/* Info Grid */}
                        <div className='mb-8 grid grid-cols-1 gap-8 md:grid-cols-2'>
                            <div className='rounded-xl border border-slate-100 bg-slate-50 p-6 shadow-sm'>
                                <h4 className='mb-4 flex items-center border-slate-200 border-b pb-2 font-semibold text-slate-500 text-sm uppercase tracking-wider'>
                                    User Details
                                </h4>
                                <div className='space-y-3 text-sm'>
                                    <div className='flex justify-between'>
                                        <span className='text-slate-500'>Name</span>
                                        <span className='font-medium text-slate-900'>{currentPayload.IE_Name || 'N/A'}</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-slate-500'>Designation</span>
                                        <span className='font-medium text-slate-900'>Implementation Engineer</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-slate-500'>Module</span>
                                        <span className='font-medium text-slate-900'>Inventory</span>
                                    </div>
                                </div>
                            </div>

                            <div className='rounded-xl border border-slate-100 bg-slate-50 p-6 shadow-sm'>
                                <h4 className='mb-4 flex items-center border-slate-200 border-b pb-2 font-semibold text-slate-500 text-sm uppercase tracking-wider'>
                                    Report Details
                                </h4>
                                <div className='space-y-3 text-sm'>
                                    <div className='flex justify-between'>
                                        <span className='text-slate-500'>Academic Year</span>
                                        <span className='font-medium text-slate-900'>{currentPayload.ASMAY_Year}</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-slate-500'>Report Month</span>
                                        <span className='font-medium text-slate-900'>{currentPayload.Month_Name}</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-slate-500'>Generated Date</span>
                                        <span className='font-medium text-slate-900'>{format(new Date(), 'dd/MM/yyyy')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Table Section */}
                        <div className='mb-8 overflow-hidden rounded-xl border border-slate-200 shadow-sm'>
                            <div className='border-slate-200 border-b bg-slate-50 px-6 py-4'>
                                <h4 className='font-semibold text-slate-800'>Detailed Statistics</h4>
                            </div>
                            <div className='p-0'>
                                <GenericDataTable
                                    data={tableData}
                                    columns={columns}
                                    isLoading={isLoading}
                                    totalItems={tableData.length}
                                    isSearchRequired={false}
                                    isPaginationRequired={false}
                                    noDataTitle='No Month End Data'
                                    noDataDescription='No records found for the selected period.'
                                />
                            </div>
                        </div>

                        {/* Chart Section */}
                        <div className='mb-8 rounded-xl border border-slate-200 bg-slate-50 p-6 shadow-sm'>
                            <h4 className='mb-6 px-2 font-semibold text-slate-800'>Graphical Representation</h4>
                            <div className='h-[350px] w-full'>
                                <ResponsiveContainer width='100%' height='100%'>
                                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray='3 3' vertical={false} stroke='#e2e8f0' />
                                        <XAxis
                                            dataKey='name'
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#64748b', fontSize: 12 }}
                                            dy={10}
                                        />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: '8px',
                                                border: 'none',
                                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                            }}
                                            cursor={{ fill: '#f1f5f9' }}
                                        />
                                        <Bar dataKey='count' fill='#3b82f6' name='Count' radius={[4, 4, 0, 0]} barSize={60} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className='mt-8 flex justify-center gap-4 border-slate-100 border-t pt-8'>
                            <Button
                                onClick={handlePrint}
                                variant='secondary'
                                className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                                <Printer className='mr-2 h-4 w-4' /> Print
                            </Button>
                            <Button
                                onClick={handleExport}
                                variant='outline'
                                className='w-fit border-green-600 text-green-700 shadow-md transition-all duration-200 hover:scale-105 hover:bg-green-50 hover:shadow-lg'>
                                <FileSpreadsheet className='mr-2 h-4 w-4' /> Export Excel
                            </Button>
                        </div>
                    </div>
                </CollapsibleSection>
            )}

            {/* Hidden Print Component */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: 0,
                    height: 0,
                    overflow: 'visible',
                    opacity: 0,
                    pointerEvents: 'none',
                    zIndex: -1
                }}>
                <InvRMonthEndReportPrint
                    ref={componentRef}
                    data={reportData}
                    tableData={tableData}
                    chartData={chartData}
                    payload={currentPayload}
                />
            </div>
        </div>
    );
}
