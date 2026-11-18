'use client';

import { forwardRef } from 'react';

interface StaffWiseReportPrintableProps {
    reportData: any[];
}

const StaffWiseReportPrintable = forwardRef<HTMLDivElement, StaffWiseReportPrintableProps>(({ reportData }, ref) => {
    return (
        <div ref={ref} className='printable-content'>
            <style jsx global>{`
                @media screen {
                    .printable-content {
                        display: none;
                    }
                }
                @media print {
                    .printable-content {
                        display: block !important;
                        visibility: visible !important;
                    }
                    .printable-content * {
                        visibility: visible !important;
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
                        padding: 8px;
                        text-align: center;
                        font-size: 10pt;
                    }
                    th {
                        background-color: #f0f0f0 !important;
                        -webkit-print-color-adjust: exact;
                        font-weight: bold;
                    }
                    .day-cell {
                        color: blue !important;
                        -webkit-print-color-adjust: exact;
                        font-weight: bold;
                    }
                    h3 {
                        text-align: center;
                        color: #15803d !important; /* text-green-700 equivalent */
                        -webkit-print-color-adjust: exact;
                        margin-bottom: 5px;
                        font-size: 16pt;
                    }
                    .sub-header {
                        text-align: center;
                        color: #15803d !important;
                        margin-bottom: 2px;
                        font-size: 11pt;
                        font-style: italic;
                    }
                    .stf-header {
                        text-align: center;
                        color: #4b5563 !important; /* text-gray-600 equivalent */
                        margin-bottom: 10px;
                        font-size: 10pt;
                        font-style: italic;
                    }
                }
            `}</style>

            {reportData.map((table, idx) => (
                <div key={idx} className={idx < reportData.length - 1 ? 'page-break' : ''}>
                    <h3>Staff Name : {table.header}</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Day / Period</th>
                                {table.periodList?.map((p: any, pIdx: number) => (
                                    <th key={pIdx}>{p.is_break ? 'Break' : `Period ${p.ped_name}`}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {table.rows?.map((row: any, rIdx: number) => (
                                <tr key={rIdx}>
                                    <td className='day-cell'>{row.dayName}</td>
                                    {row.cells?.map((cell: any, cIdx: number) => (
                                        <td key={cIdx} style={{ color: cell.color }}>
                                            {cell.content || '-'}
                                        </td>
                                    ))}
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
