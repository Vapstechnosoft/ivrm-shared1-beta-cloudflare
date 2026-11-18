'use client';

import { forwardRef } from 'react';

interface ClassSectionReportPrintableProps {
    reportData: any;
}

const ClassSectionReportPrintable = forwardRef<HTMLDivElement, ClassSectionReportPrintableProps>(({ reportData }, ref) => {
    if (!reportData) return null;

    return (
        <div ref={ref} className='print-only'>
            <style jsx global>{`
                @media print {
                    .print-only {
                        display: block !important;
                    }
                    .screen-only {
                        display: none !important;
                    }
                    @page {
                        size: landscape;
                        margin: 10mm;
                    }
                }
                @media screen {
                    .print-only {
                        display: none !important;
                    }
                }
            `}</style>

            <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
                <h3 style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '24px', marginBottom: '20px', color: '#15803d' }}>
                    Time Table Report
                </h3>
                <table style={{ border: '2px solid #7e22ce', width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#7e22ce', color: 'white' }}>
                            <th style={{ border: '1px solid #7e22ce', padding: '8px', textAlign: 'left' }}>Day / Period</th>
                            {reportData.periods.map((period: any, index: number) => (
                                <th key={index} style={{ border: '1px solid #7e22ce', padding: '8px', textAlign: 'center' }}>
                                    {period.ped_name}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {reportData.rows.map((row: any, rIdx: number) => (
                            <tr key={rIdx}>
                                <td
                                    style={{
                                        border: '1px solid #9ca3af',
                                        padding: '8px',
                                        textAlign: 'left',
                                        color: '#9333ea',
                                        fontWeight: 'bold'
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
                                            color: cell.color === 'red' ? '#dc2626' : 'black',
                                            fontWeight: cell.is_break ? 'bold' : 'normal'
                                        }}>
                                        {cell.is_break ? (cell.content || 'BRK').toUpperCase() : cell.content || '—'}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
});

ClassSectionReportPrintable.displayName = 'ClassSectionReportPrintable';

export default ClassSectionReportPrintable;
