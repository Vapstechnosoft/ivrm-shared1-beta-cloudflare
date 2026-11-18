'use client';

import { format } from 'date-fns';
import React from 'react';

interface CoeMonthEndReportPrintProps {
    reportData: any[];
    selectedYear: string;
    selectedMonth: string;
    ieName?: string;
}

export const CoeMonthEndReportPrint = React.forwardRef<HTMLDivElement, CoeMonthEndReportPrintProps>(
    ({ reportData, selectedYear, selectedMonth, ieName }, ref) => {
        const currentDate = format(new Date(), 'dd/MM/yyyy');

        return (
            <div ref={ref} className='print-preview-container min-h-full w-full bg-white text-black'>
                <style>
                    {`
                        @media print {
                            @page {
                                margin: 10mm;
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
                            }
                            .data-table th, .data-table td {
                                border: 1px solid #000;
                                padding: 6px;
                                text-align: center;
                                font-size: 11px;
                            }
                            .data-table th {
                                background-color: #f3f4f6;
                                font-weight: bold;
                                -webkit-print-color-adjust: exact;
                            }
                            .text-left { text-align: left !important; }
                            .text-center { text-align: center !important; }
                            .header-section {
                                text-align: center;
                                padding-bottom: 10px;
                            }
                            .footer-section {
                                padding-top: 50px;
                                display: flex;
                                justify-content: space-between;
                                font-size: 12px;
                                font-weight: bold;
                            }
                            .no-border {
                                border: none !important;
                            }
                            .info-grid {
                                display: grid;
                                grid-template-columns: 1fr 1fr;
                                gap: 10px;
                                margin-bottom: 20px;
                                font-size: 12px;
                            }
                            .info-row {
                                display: flex;
                                justify-content: center;
                                gap: 20px;
                                padding-bottom: 4px;
                            }
                            .col-span-2 {
                                grid-column: span 2;
                            }
                        }
                    `}
                </style>

                <table className='main-table no-border'>
                    <thead>
                        <tr>
                            <td className='no-border'>
                                {/* Header */}
                                <div className='header-section'>
                                    <h2 className='font-bold text-xl uppercase underline'>COE Report</h2>
                                    <div style={{ border: '1px solid black', display: 'inline-block', padding: '5px', marginTop: '10px' }}>
                                        <h3 className='text-center font-semibold uppercase'>COE {selectedMonth} MONTH REPORT</h3>
                                    </div>
                                </div>
                                {/* Info Table */}
                                <div className='info-grid mt-4'>
                                    <div className='info-row'>
                                        <span className='font-semibold'>Name:</span>
                                        <span>{ieName || reportData?.[0]?.ieName || '_________________'}</span>
                                    </div>
                                    <div className='info-row'>
                                        <span className='font-semibold'>Date:</span>
                                        <span>{currentDate}</span>
                                    </div>
                                    <div className='info-row'>
                                        <span className='font-semibold'>Designation:</span>
                                        <span>{reportData?.[0]?.designation || 'Implementation Engineer'}</span>
                                    </div>
                                    <div className='info-row'>
                                        <span className='font-semibold'>Academic Year:</span>
                                        <span>{selectedYear}</span>
                                    </div>
                                    <div className='info-row col-span-2'>
                                        <span className='font-semibold'>Module:</span>
                                        <span>COE</span>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className='no-border'>
                                {/* Table */}
                                <table className='data-table mt-4 w-full'>
                                    <thead>
                                        <tr className='bg-gray-100 uppercase'>
                                            <th className='w-12'>Sl No</th>
                                            <th className='text-left'>Event Name</th>
                                            <th className='text-left'>Event Description</th>
                                            <th className='w-24'>Event Start Date</th>
                                            <th className='w-24'>Event End Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(reportData || []).map((row, idx) => (
                                            <tr key={idx}>
                                                <td>{idx + 1}</td>
                                                <td className='text-left font-medium'>{row.eventName ?? 'NA'}</td>
                                                <td className='text-left'>{row.eventDesc ?? 'NA'}</td>
                                                <td>
                                                    {row.coeE_EStartDate ? new Date(row.coeE_EStartDate).toISOString().slice(0, 10) : 'NA'}
                                                </td>
                                                <td>{row.coeE_EEndDate ? new Date(row.coeE_EEndDate).toISOString().slice(0, 10) : 'NA'}</td>
                                            </tr>
                                        ))}
                                        {(!reportData || reportData.length === 0) && (
                                            <tr>
                                                <td colSpan={5} className='py-4 text-center font-bold'>
                                                    No records found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr>
                            <td className='no-border'>
                                <div className='footer-section'>
                                    <div className='text-left'>Implementation Engineer: ________________</div>
                                    <div className='text-right'>Nodal Officer: ________________</div>
                                </div>
                                <div className='footer-section mt-4' style={{ paddingTop: '20px' }}>
                                    <div className='text-left'>End User: ________________</div>
                                    <div className='text-right'>Seal: ________________</div>
                                </div>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        );
    }
);

CoeMonthEndReportPrint.displayName = 'CoeMonthEndReportPrint';
