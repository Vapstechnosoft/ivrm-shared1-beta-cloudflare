import type { IInvRMonthEndReportData, IInvRMonthEndReportTableRow } from '@/types/inventory/reports/inv-r-month-end-report';
import { format } from 'date-fns';
import React from 'react';

interface InvRMonthEndReportPrintProps {
    data: IInvRMonthEndReportData | null;
    tableData: IInvRMonthEndReportTableRow[];
    chartData: { name: string; count: number }[];
    payload: any | null;
}

export const InvRMonthEndReportPrint = React.forwardRef<HTMLDivElement, InvRMonthEndReportPrintProps>(
    ({ data, tableData, chartData, payload }, ref) => {
        const currentDate = format(new Date(), 'dd/MM/yyyy');

        if (!data || !payload) {
            return (
                <div ref={ref} className='bg-white p-5 text-center text-black'>
                    No data available for printing.
                </div>
            );
        }

        return (
            <div ref={ref} className='print-preview-container min-h-full w-full bg-white p-8 text-black'>
                <style
                    dangerouslySetInnerHTML={{
                        __html: `
                        @media print {
                            @page {
                                margin: 15mm;
                                size: A4 portrait;
                            }
                            body {
                                visibility: hidden;
                                background: white;
                                margin: 0;
                                padding: 0;
                            }
                            .print-preview-container {
                                visibility: visible !important;
                                position: absolute;
                                left: 0;
                                top: 0;
                                width: 100%;
                                background: white;
                                z-index: 9999;
                                color: black;
                            }
                            .print-preview-container * {
                                visibility: visible !important;
                            }
                            .main-table {
                                width: 100%;
                                border-collapse: collapse;
                                border: none !important;
                            }
                            .data-table {
                                width: 100%;
                                border-collapse: collapse;
                                border: 1px solid #000;
                                margin-top: 20px;
                            }
                            .data-table th, .data-table td {
                                border: 1px solid #000;
                                padding: 10px;
                                font-size: 12px;
                            }
                            .data-table th {
                                background-color: #f3f4f6 !important;
                                font-weight: bold;
                                text-align: left;
                                -webkit-print-color-adjust: exact;
                            }
                            .header-section {
                                text-align: center;
                                padding-bottom: 30px;
                                border-bottom: 2px solid #000;
                                margin-bottom: 25px;
                            }
                            .info-grid {
                                display: grid;
                                grid-template-columns: 1fr 1fr;
                                gap: 40px;
                                margin-bottom: 30px;
                            }
                            .info-box {
                                border: 1px solid #000;
                                padding: 15px;
                            }
                            .info-box h4 {
                                border-bottom: 1px solid #000;
                                margin-bottom: 10px;
                                padding-bottom: 5px;
                                text-transform: uppercase;
                                font-size: 13px;
                            }
                            .info-row {
                                display: flex;
                                justify-content: space-between;
                                font-size: 12px;
                                margin-bottom: 5px;
                            }
                            .footer-section {
                                margin-top: 50px;
                                display: flex;
                                justify-content: space-between;
                                font-size: 12px;
                            }
                            .signature-box {
                                text-align: center;
                                width: 200px;
                            }
                            .signature-line {
                                border-top: 1px solid #000;
                                margin-top: 40px;
                                padding-top: 5px;
                                font-weight: bold;
                            }
                            .footer-section {
                                margin-top: 50px;
                                display: flex;
                                justify-content: space-between;
                                font-size: 12px;
                            }
                            .chart-container {
                                margin-top: 30px;
                                border: 1px solid #000;
                                padding: 15px;
                                break-inside: avoid;
                            }
                            .chart-title {
                                font-weight: bold;
                                font-size: 13px;
                                text-transform: uppercase;
                                border-bottom: 1px solid #000;
                                padding-bottom: 5px;
                                margin-bottom: 15px;
                            }
                            .bar-wrapper {
                                display: flex;
                                align-items: center;
                                margin-bottom: 10px;
                            }
                            .bar-label {
                                width: 120px;
                                font-size: 11px;
                            }
                            .bar-track {
                                flex-grow: 1;
                                height: 20px;
                                background-color: #f3f4f6;
                                border: 1px solid #000;
                                position: relative;
                            }
                            .bar-fill {
                                height: 100%;
                                background-color: #3b82f6 !important;
                                -webkit-print-color-adjust: exact;
                            }
                            .bar-value {
                                margin-left: 10px;
                                font-weight: bold;
                                font-size: 11px;
                            }
                            .no-border {
                                border: none !important;
                            }
                        }
                    `
                    }}
                />

                <div className='header-section'>
                    <h2 className='font-bold text-2xl uppercase'>Inventory Month End Report</h2>
                    <p className='mt-2 font-semibold text-lg'>
                        {payload.Month_Name} - {payload.ASMAY_Year}
                    </p>
                </div>

                <div className='info-grid'>
                    <div className='info-box'>
                        <h4>User Details</h4>
                        <div className='info-row'>
                            <span>Name:</span>
                            <span className='font-bold'>{payload.IE_Name || 'N/A'}</span>
                        </div>
                        <div className='info-row'>
                            <span>Designation:</span>
                            <span>Implementation Engineer</span>
                        </div>
                        <div className='info-row'>
                            <span>Module:</span>
                            <span>Inventory</span>
                        </div>
                    </div>

                    <div className='info-box'>
                        <h4>Report Details</h4>
                        <div className='info-row'>
                            <span>Academic Year:</span>
                            <span className='font-bold'>{payload.ASMAY_Year}</span>
                        </div>
                        <div className='info-row'>
                            <span>Report Month:</span>
                            <span className='font-bold'>{payload.Month_Name}</span>
                        </div>
                        <div className='info-row'>
                            <span>Generated Date:</span>
                            <span>{currentDate}</span>
                        </div>
                    </div>
                </div>

                <div className='mt-5'>
                    <h4 className='mb-2 font-bold text-sm uppercase'>Detailed Statistics</h4>
                    <table className='data-table'>
                        <thead>
                            <tr>
                                <th className='w-16 text-center'>Sl.No</th>
                                <th>Inventory</th>
                                <th className='text-center'>Count</th>
                                <th className='text-center'>SMS</th>
                                <th className='text-center'>Email</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tableData.map((row, index) => (
                                <tr key={row.id}>
                                    <td className='text-center'>{index + 1}</td>
                                    <td>{row.inventory}</td>
                                    <td className='text-center'>{row.count}</td>
                                    <td className='text-center'>{row.sms}</td>
                                    <td className='text-center'>{row.email}</td>
                                </tr>
                            ))}
                            <tr className='bg-gray-50 font-bold'>
                                <td colSpan={2} className='text-right'>
                                    Summary Totals
                                </td>
                                <td className='text-center'>{(data?.grnCount || 0) + (data?.salesCount || 0) + (data?.itemCount || 0)}</td>
                                <td className='text-center'>{data?.sms || 0}</td>
                                <td className='text-center'>{data?.email || 0}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Print Chart Section */}
                <div className='chart-container'>
                    <div className='chart-title'>Graphical Representation</div>
                    {chartData.map((item, idx) => {
                        const maxVal = Math.max(...chartData.map((c) => c.count), 1);
                        const percentage = (item.count / maxVal) * 100;
                        return (
                            <div key={idx} className='bar-wrapper'>
                                <div className='bar-label'>{item.name}</div>
                                <div className='bar-track'>
                                    <div className='bar-fill' style={{ width: `${percentage}%` }}></div>
                                </div>
                                <div className='bar-value'>{item.count}</div>
                            </div>
                        );
                    })}
                </div>

                <div className='footer-section'>
                    <div className='signature-box'>
                        <div className='signature-line'>Implementation Engineer</div>
                    </div>
                    <div className='signature-box'>
                        <div className='h-8'></div>
                        <div>Printed Date: {currentDate}</div>
                    </div>
                    <div className='signature-box'>
                        <div className='signature-line'>Nodal Officer & Seal</div>
                    </div>
                </div>
            </div>
        );
    }
);

InvRMonthEndReportPrint.displayName = 'InvRMonthEndReportPrint';
