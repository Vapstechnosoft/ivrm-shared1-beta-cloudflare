'use client';

import { forwardRef } from 'react';

interface SubjectWiseReportPrintableProps {
    reportData: any[];
}

const SubjectWiseReportPrintable = forwardRef<HTMLDivElement, SubjectWiseReportPrintableProps>(({ reportData }, ref) => {
    return (
        <div ref={ref} className='print-only'>
            <style jsx global>{`
    .print-only {
        display: none;
    }
    @media print {
        .print-only {
            display: block !important;
        }
        .screen-only {
            display: none !important;
        }
        .no-print {
            display: none !important;
        }
        @page {
            size: landscape;
            margin: 10mm;
        }
    }
`}</style>
            {reportData.map((table, idx) => (
                <div key={idx} className='mb-12 break-after-page'>
                    <h3 className='mb-4 text-center font-bold text-green-700 text-xl' style={{ color: '#15803d' }}>
                        {table.header}
                    </h3>
                    <table
                        className='w-full border-collapse'
                        style={{ border: '2px solid #7e22ce', width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#7e22ce', color: 'white' }}>
                                <th style={{ border: '1px solid #7e22ce', padding: '8px' }}>Day / Period</th>
                                {table.periodList.map((p: any, pIdx: number) => (
                                    <th key={pIdx} style={{ border: '1px solid #7e22ce', padding: '8px' }}>
                                        {p.is_break ? 'Break' : `Period ${p.ped_name}`}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {table.rows.map((row: any, rIdx: number) => (
                                <tr key={rIdx}>
                                    <td
                                        style={{
                                            border: '1px solid #9ca3af',
                                            padding: '8px',
                                            textAlign: 'center',
                                            color: '#9333ea',
                                            fontWeight: '500'
                                        }}>
                                        {row.dayName}
                                    </td>
                                    {row.cells.map((cell: any, cIdx: number) => (
                                        <td
                                            key={cIdx}
                                            style={{
                                                border: '1px solid #9ca3af',
                                                padding: '8px',
                                                textAlign: 'center',
                                                fontSize: '12px',
                                                color: cell.color
                                            }}>
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

SubjectWiseReportPrintable.displayName = 'SubjectWiseReportPrintable';

export default SubjectWiseReportPrintable;
