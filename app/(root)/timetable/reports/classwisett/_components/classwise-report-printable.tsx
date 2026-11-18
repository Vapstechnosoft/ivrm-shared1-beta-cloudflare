'use client';

import { forwardRef } from 'react';

interface ClassWiseReportPrintableProps {
    reportData: any[];
}

const ClassWiseReportPrintable = forwardRef<HTMLDivElement, ClassWiseReportPrintableProps>(({ reportData }, ref) => {
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
                    .break-text {
                        color: red !important;
                        -webkit-print-color-adjust: exact;
                    }
                    h3 {
                        text-align: center;
                        color: green !important;
                        -webkit-print-color-adjust: exact;
                        margin-bottom: 10px;
                    }
                }
            `}</style>

            {reportData.map((table, idx) => (
                <div key={idx} className={idx < reportData.length - 1 ? 'page-break' : ''}>
                    <h3>{table.header}</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Day / Period</th>
                                {table.periodList.map((p: any, pIdx: number) => (
                                    <th key={pIdx}>Period {p.ped_name}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {table.rows.map((row: any, rIdx: number) => (
                                <tr key={rIdx}>
                                    <td className='day-cell'>{row.dayName}</td>
                                    {row.cells.map((cell: any, cIdx: number) => (
                                        <td key={cIdx} style={{ color: cell.color }}>
                                            {cell.content}
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

ClassWiseReportPrintable.displayName = 'ClassWiseReportPrintable';

export default ClassWiseReportPrintable;
