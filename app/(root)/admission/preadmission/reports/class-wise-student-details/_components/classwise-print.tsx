'use client';

import { forwardRef } from 'react';
import { ColumnValue } from './columnvalue';

interface ClasswisePrintProps {
    data: any[];
    selectedFields: string[];
    academicYear: string;
    classes: string;
    sections: string;
    printTimestamp: string;
}

export const ClasswisePrint = forwardRef<HTMLDivElement, ClasswisePrintProps>(
    ({ data, selectedFields, academicYear, classes, sections, printTimestamp }, ref) => {
        const activeFields = ColumnValue.filter((f) => selectedFields.includes(f.columnID));

        return (
            <div ref={ref} className='print-container bg-white text-black'>
                <style
                    dangerouslySetInnerHTML={{
                        __html: `
                    @media print {
                        @page {
                            size: A4 landscape;
                            margin: 8mm;
                        }
                        body {
                            visibility: hidden;
                            background: white !important;
                            margin: 0 !important;
                            padding: 0 !important;
                        }
                        .print-container {
                            visibility: visible !important;
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                            padding: 0;
                            margin: 0;
                        }
                        .print-container * {
                            visibility: visible !important;
                        }
                        table {
                            border-collapse: collapse;
                            width: 100%;
                        }
                        th, td {
                            border: 0.5pt solid #555;
                            padding: 4px 6px;
                            font-size: 10px;
                        }
                        th {
                            background-color: #e5e7eb !important;
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                            text-align: left;
                        }
                        td { text-align: left; }
                        td.center { text-align: center; }
                        .print-footer { margin-top: 12px; font-size: 9px; opacity: 0.6; }
                    }
                    `
                    }}
                />

                <div style={{ padding: '16px', fontFamily: 'Arial, sans-serif' }}>
                    {/* Report Header */}
                    <h2
                        style={{
                            textAlign: 'center',
                            fontSize: '15px',
                            fontWeight: 'bold',
                            marginBottom: '4px',
                            textTransform: 'uppercase'
                        }}>
                        Class Wise Student Details
                    </h2>
                    <p style={{ textAlign: 'center', fontSize: '11px', marginBottom: '2px' }}>
                        Academic Year: <strong>{academicYear || 'N/A'}</strong>
                    </p>
                    <p style={{ textAlign: 'center', fontSize: '11px', marginBottom: '2px' }}>
                        Classes: <strong>{classes || 'All'}</strong>
                    </p>
                    <p style={{ textAlign: 'center', fontSize: '11px', marginBottom: '12px' }}>
                        Sections: <strong>{sections || 'All'}</strong>
                    </p>

                    {/* Data Table */}
                    <table>
                        <thead>
                            <tr>
                                <th style={{ width: '40px', textAlign: 'center' }}>Sl.No</th>
                                {activeFields.map((f) => (
                                    <th key={f.columnID}>{f.columnName}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row: any, idx: number) => (
                                <tr key={idx}>
                                    <td className='center' style={{ textAlign: 'center' }}>
                                        {idx + 1}
                                    </td>
                                    {activeFields.map((f) => (
                                        <td key={f.columnID}>{row[f.columnID] ?? '-'}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Footer */}
                    <div
                        className='print-footer'
                        style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '9px', opacity: 0.6 }}>
                        <span>Printed on: {printTimestamp}</span>
                    </div>
                </div>
            </div>
        );
    }
);

ClasswisePrint.displayName = 'ClasswisePrint';
