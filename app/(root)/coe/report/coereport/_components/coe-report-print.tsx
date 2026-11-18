'use client';

import { format } from 'date-fns';
import React from 'react';

interface CoeReportPrintProps {
    coeReportData: any[];
    masterCompany?: any;
}

export const CoeReportPrint = React.forwardRef<HTMLDivElement, CoeReportPrintProps>(({ coeReportData, masterCompany }, ref) => {
    const currentDate = format(new Date(), 'dd/MM/yyyy');

    return (
        <div ref={ref} className='print-preview-container min-h-full w-full bg-white text-black'>
            <style>
                {`
                        @media print {
                            @page {
                                margin: 0;
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
                                padding: 10mm;
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
                                display: flex;
                                flex-direction: column;
                                align-items: center;
                                justify-content: center;
                                padding-bottom: 15px;
                                border-bottom: 2px solid #e5e7eb;
                                margin-bottom: 15px;
                            }
                            .header-content {
                                text-align: center;
                                margin-top: 10px;
                            }
                            .header-logo {
                                width: 100%;
                                max-width: 800px;
                            }
                            .header-logo img {
                                width: 100%;
                                height: auto;
                                object-fit: contain;
                            }
                            .footer-section {
                                padding-top: 10px;
                                display: flex;
                                justify-content: space-between;
                                font-size: 10px;
                                opacity: 0.7;
                            }
                            .no-border {
                                border: none !important;
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
                                {masterCompany?.logo && (
                                    <div className='header-logo'>
                                        <img src={masterCompany.logo} alt='Institution Logo' />
                                    </div>
                                )}
                                <div className='header-content'>
                                    <h2 className='font-bold text-md uppercase mt-1'>COE Report</h2>
                                    <p className='mt-1 text-xs'>Date: {currentDate}</p>
                                </div>
                            </div>
                        </td>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className='no-border'>
                            {/* Table */}
                            <table className='data-table w-full'>
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
                                    {(coeReportData || []).map((row, idx) => (
                                        <tr key={idx}>
                                            <td>{idx + 1}</td>
                                            <td className='text-left font-medium'>{row.eventName ?? row.coemE_EventName ?? 'NA'}</td>
                                            <td className='text-left'>{row.eventDesc ?? row.coemE_EventDesc ?? 'NA'}</td>
                                            <td>{row.coeE_EStartDate ? new Date(row.coeE_EStartDate).toISOString().slice(0, 10) : 'NA'}</td>
                                            <td>{row.coeE_EEndDate ? new Date(row.coeE_EEndDate).toISOString().slice(0, 10) : 'NA'}</td>
                                        </tr>
                                    ))}
                                    {(!coeReportData || coeReportData.length === 0) && (
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
            </table>
        </div>
    );
});

CoeReportPrint.displayName = 'CoeReportPrint';
