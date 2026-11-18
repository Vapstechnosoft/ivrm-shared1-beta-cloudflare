'use client';

import type { IRigistrationReportList } from '@/types/admission/preadmission/reports';
import { format, isValid } from 'date-fns';
import React from 'react';

interface RegistrationReportPrintProps {
    data: IRigistrationReportList[];
    institutionName?: string;
}

export const RegistrationReportPrint = React.forwardRef<HTMLDivElement, RegistrationReportPrintProps>(({ data, institutionName }, ref) => {
    const currentDate = format(new Date(), 'dd/MM/yyyy');

    const formatDate = (dateStr: string | null | undefined) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return isValid(date) ? format(date, 'dd/MM/yyyy') : dateStr;
    };

    const reportData = Array.isArray(data) ? data : [];

    return (
        <div ref={ref} className='print-preview-container min-h-full w-full bg-white p-5 text-black'>
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
                                padding: 15mm;
                            }
                            .print-preview-container * {
                                visibility: visible !important;
                            }
                            table {
                                width: 100%;
                                border-collapse: collapse;
                                border: 1px solid #000;
                            }
                            th, td {
                                border: 1px solid #000;
                                padding: 8px;
                                text-align: left;
                                font-size: 12px;
                            }
                            th {
                                background-color: #f3f4f6;
                                font-weight: bold;
                                -webkit-print-color-adjust: exact;
                            }
                            .header-section {
                                text-align: center;
                                margin-bottom: 20px;
                                border-bottom: 2px solid black;
                                padding-bottom: 10px;
                            }
                            .footer-section {
                                margin-top: 20px;
                                padding-top: 10px;
                                text-align: center;
                                font-size: 10px;
                                color: #666;
                                border-top: 1px solid #eee;
                            }
                        }
                    `}
            </style>

            <div className='header-section'>
                <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>{institutionName}</h1>
                <h2 style={{ margin: '5px 0 0', fontSize: '18px', fontWeight: 'bold', textDecoration: 'underline' }}>
                    REGISTRATION REPORT
                </h2>
            </div>

            {reportData.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', border: '1px dashed #ccc' }}>No records found to display.</div>
            ) : (
                <table>
                    <thead>
                        <tr style={{ backgroundColor: '#f3f4f6' }}>
                            <th style={{ width: '50px', textAlign: 'center' }}>SL.No</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th style={{ width: '100px', textAlign: 'center' }}>Mobile No</th>
                            <th style={{ width: '90px', textAlign: 'center' }}>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportData.map((row, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'center' }}>{index + 1}</td>
                                <td>{row.name || '-'}</td>
                                <td>{row.email_Id || '-'}</td>
                                <td style={{ textAlign: 'center' }}>{row.mob_No || '-'}</td>
                                <td style={{ textAlign: 'center' }}>{formatDate(row.created_Date)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <div className='footer-section'>Printed on: {currentDate}</div>
        </div>
    );
});

RegistrationReportPrint.displayName = 'RegistrationReportPrint';
