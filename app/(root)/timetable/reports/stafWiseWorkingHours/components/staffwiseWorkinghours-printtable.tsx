'use client';

import { forwardRef } from 'react';

interface StaffWiseReportPrintableProps {
    reportData: any[];
}

const StaffWiseReportPrintable = forwardRef<HTMLDivElement, StaffWiseReportPrintableProps>(({ reportData }, ref) => {
    return (
        <div ref={ref} className='print-only'>
            <style jsx global>{`
                @media screen {
                    .print-only {
                        display: none;
                    }
                }
                @media print {
                    .print-only {
                        display: block;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .page-break {
                        page-break-after: always;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 20px;
                    }
                    th, td {
                        border: 1px solid #000;
                        padding: 6px;
                        text-align: center;
                        font-size: 10pt;
                    }
                    th {
                        background-color: #e5e7eb !important;
                        -webkit-print-color-adjust: exact;
                        font-weight: bold;
                    }
                    .day-cell {
                        font-weight: bold;
                    }
                    h3 {
                        text-align: center;
                        margin-bottom: 10px;
                        font-size: 14pt;
                    }
                }
            `}</style>

            {reportData.map((table, idx) => (
                <div key={idx} className={idx < reportData.length - 1 ? 'page-break' : ''}>
                    {/* Staff Header */}
                    <h3>Staff Name: {table.header}</h3>

                    <table>
                        <thead>
                            <tr>
                                <th>Day</th>
                                <th>TT Periods</th>
                                <th>PW Mins</th>
                                <th>Working Hrs</th>
                            </tr>
                        </thead>

                        <tbody>
                            {table.rows?.map((row: any, rIdx: number) => (
                                <tr key={rIdx}>
                                    <td className='day-cell'>{row.dayName}</td>
                                    <td>{row.ttPeriods ?? '-'}</td>
                                    <td>{row.pwMins ?? '-'}</td>
                                    <td>{row.workingHrs ?? '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ))}
        </div>
    );
});

StaffWiseReportPrintable.displayName = 'StaffWiseReportPrintable';

export default StaffWiseReportPrintable;
