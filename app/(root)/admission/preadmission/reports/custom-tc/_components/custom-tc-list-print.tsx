'use client';

import { format, isValid } from 'date-fns';
import React from 'react';

interface CustomTcListPrintProps {
    data: any[];
    institutionName?: string;
    academicYear?: string;
}

export const CustomTcListPrint = React.forwardRef<HTMLDivElement, CustomTcListPrintProps>(
    ({ data, institutionName = 'VAPS TECHNOSOFT', academicYear }, ref) => {
        const currentDate = format(new Date(), 'dd/MM/yyyy');

        const formatDate = (dateStr: string | null | undefined) => {
            if (!dateStr) return '-';
            const date = new Date(dateStr);
            return isValid(date) ? format(date, 'dd/MM/yyyy') : '-';
        };

        if (!data || data.length === 0) {
            return (
                <div ref={ref} style={{ padding: '20px', background: 'white', color: 'black', textAlign: 'center' }}>
                    No students selected for printing.
                </div>
            );
        }

        return (
            <div
                ref={ref}
                className='custom-tc-list-print'
                style={{ padding: '15mm', background: 'white', color: 'black', minHeight: '100%', width: '100%' }}>
                <style
                    dangerouslySetInnerHTML={{
                        __html: `
                    @media print {
                        .print-list-wrapper {
                            display: block !important;
                            position: static !important;
                            visibility: visible !important;
                        }
                        @page {
                            size: A4;
                            margin: 0;
                        }
                    }
                    .list-table {
                        width: 100%;
                        border-collapse: collapse;
                        border: 1px solid black;
                        font-family: 'Times New Roman', Times, serif;
                        font-size: 10.5pt;
                    }
                    .list-table th, .list-table td {
                        border: 1px solid black;
                        padding: 6px 8px;
                    }
                    .list-table th {
                        background-color: #f2f2f2;
                        font-weight: bold;
                        text-transform: uppercase;
                        font-size: 9pt;
                    }
                `
                    }}
                />
                <div className='print-list-wrapper'>
                    <div style={{ textAlign: 'center', marginBottom: '25px', borderBottom: '2px solid black', paddingBottom: '12px' }}>
                        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0', textTransform: 'uppercase' }}>{institutionName}</h1>
                        <h2 style={{ fontSize: '18px', fontWeight: 'bold', textDecoration: 'underline', marginTop: '10px' }}>
                            LIST OF STUDENTS WITH ISSUED TRANSFER CERTIFICATES {academicYear ? `(${academicYear})` : ''}
                        </h2>
                    </div>

                    <table className='list-table'>
                        <thead>
                            <tr>
                                <th style={{ width: '40px', textAlign: 'center' }}>SL</th>
                                <th style={{ textAlign: 'left' }}>Student Name</th>
                                <th style={{ textAlign: 'left', width: '120px' }}>Admission No</th>
                                <th style={{ textAlign: 'left', width: '120px' }}>TC No</th>
                                <th style={{ textAlign: 'center', width: '100px' }}>TC Date</th>
                                <th style={{ textAlign: 'left', width: '100px' }}>Class</th>
                                <th style={{ textAlign: 'left', width: '80px' }}>Section</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, index) => (
                                <tr key={row.amsT_Id || index}>
                                    <td style={{ textAlign: 'center' }}>{index + 1}</td>
                                    <td style={{ fontWeight: '600' }}>{row.studentname}</td>
                                    <td>{row.amst_admno || row.amsT_AdmNo || '-'}</td>
                                    <td>{row.astc_tcno || row.astC_TCNO || '-'}</td>
                                    <td style={{ textAlign: 'center' }}>{formatDate(row.astc_tcdate || row.astC_TCDate)}</td>
                                    <td>{row.last_class_studied || row.Last_Class_Studied || '-'}</td>
                                    <td>{row.asmc_sectionname || row.asmC_SectionName || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div style={{ marginTop: '20px', fontSize: '9px', opacity: 0.8, textAlign: 'right', fontStyle: 'italic' }}>
                        Report Generated on {currentDate} | VAPS TECHNOSOFT PVT. LTD.
                    </div>
                </div>
            </div>
        );
    }
);

CustomTcListPrint.displayName = 'CustomTcListPrint';
