'use client';

import { format } from 'date-fns';
import React from 'react';
import type { IAdmissionProcedureReport } from './columns';

interface AdmissionProcedurePrintProps {
    data: IAdmissionProcedureReport[];
    logo?: string;
    academicYear?: string;
}

export const AdmissionProcedurePrint = React.forwardRef<HTMLDivElement, AdmissionProcedurePrintProps>(
    ({ data, logo, academicYear }, ref) => {
        const currentDate = format(new Date(), 'dd/MM/yyyy');
        const reportData = Array.isArray(data) ? data : [];

        return (
            <div ref={ref} className='print-preview-container min-h-full w-full bg-white p-5 text-black'>
                <style>
                    {`
                        @media print {
                            @page {
                                margin: 15mm;
                                size: A4 portrait;
                            }
                            body {
                                visibility: hidden !important;
                                background: white;
                                margin: 0;
                                padding: 0;
                            }
                            .printable-content {
                                display: block !important;
                                visibility: visible !important;
                                position: absolute !important;
                                left: 0 !important;
                                top: 0 !important;
                                width: 100% !important;
                                height: auto !important;
                                overflow: visible !important;
                                opacity: 1 !important;
                                z-index: 9999 !important;
                                background: white !important;
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
                    {logo && <img src={logo} alt='Logo' className='mx-auto mb-2 h-16 object-contain' />}
                    <h2
                        style={{
                            margin: '5px 0 0',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            textDecoration: 'underline',
                            textTransform: 'uppercase'
                        }}>
                        ADMISSION PROCEDURE REPORT
                    </h2>
                    {academicYear && (
                        <p style={{ margin: '5px 0 0', fontSize: '12px', fontWeight: 'semibold' }}>Academic Year: {academicYear}</p>
                    )}
                </div>

                {reportData.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px', border: '1px dashed #ccc' }}>No records found to display.</div>
                ) : (
                    <table>
                        <thead>
                            <tr style={{ backgroundColor: '#f3f4f6' }}>
                                <th style={{ width: '60px', textAlign: 'center' }}>SL. No.</th>
                                <th>Student Name</th>
                                <th>Admission No.</th>
                                <th>Class Name</th>
                                <th>Section Name</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.map((row, index) => (
                                <tr key={index}>
                                    <td style={{ textAlign: 'center' }}>{index + 1}</td>
                                    <td>{row.FullName || '-'}</td>
                                    <td>{row.AMST_AdmNo || '-'}</td>
                                    <td>{row.ASMCL_ClassName || '-'}</td>
                                    <td>{row.ASMC_SectionName || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                <div className='footer-section'>Printed on: {currentDate}</div>
            </div>
        );
    }
);

AdmissionProcedurePrint.displayName = 'AdmissionProcedurePrint';
