'use client';

import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';
import { useState } from 'react';
import * as XLSX from 'xlsx';

interface SubjectWiseReportGridProps {
    reportData: any[];
    onPrint: () => void;
    initialSize?: string;
}

export default function SubjectWiseReportGrid({ reportData, onPrint, initialSize = '10' }: SubjectWiseReportGridProps) {
    const [size, setSize] = useState(initialSize);

    const fontSizeClass =
        {
            '8': 'text-xs',
            '9': 'text-xs',
            '10': 'text-sm',
            '11': 'text-base',
            '12': 'text-base',
            '14': 'text-lg',
            '16': 'text-xl',
            '18': 'text-2xl',
            '20': 'text-3xl'
        }[size] || 'text-sm';

    const exportToExcel = () => {
        if (!reportData.length) {
            alert('No data to export!');
            return;
        }

        const wb = XLSX.utils.book_new();

        reportData.forEach((tableData, index) => {
            const worksheetData: any[] = [];

            // Title
            worksheetData.push([tableData.header.toUpperCase()]);
            worksheetData.push([]);

            // Header Row
            const headerRow = ['Day / Period'];
            tableData.periodList.forEach((p: any) => {
                headerRow.push(p.is_break ? 'Break' : `Period ${p.ped_name}`);
            });
            worksheetData.push(headerRow);

            // Data Rows
            tableData.rows.forEach((row: any) => {
                const dataRow = [row.dayName];
                row.cells.forEach((cell: any) => {
                    dataRow.push(cell.content || '');
                });
                worksheetData.push(dataRow);
            });

            const ws = XLSX.utils.aoa_to_sheet(worksheetData);

            const sheetName = tableData.header.substring(0, 31).replace(/[:\\/?*[\]]/g, '_');
            XLSX.utils.book_append_sheet(wb, ws, sheetName);
        });

        const fileName = `SubjectWise_TimeTable_${new Date().toISOString().slice(0, 10)}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    return (
        <div className={`screen-only ${fontSizeClass}`}>
            <div className='no-print flex items-center justify-between bg-white px-4 py-2 text-sm'>
                <span style={{ fontSize: '15px', fontWeight: '300' }}></span>
                <div className='flex items-center gap-3'>
                    <Button onClick={onPrint} size='sm' className='bg-purple-600 hover:bg-blue-700'>
                        <Printer className='mr-2 h-4 w-4' /> Print
                    </Button>

                    <Button
                        onClick={exportToExcel}
                        size='sm'
                        variant='outline'
                        className='gap-2 border-green-600 text-green-700 hover:bg-green-50'>
                        <Download className='h-4 w-4' />
                        Export Excel
                    </Button>
                </div>
            </div>

            <div className='mt-6 space-y-12 bg-white p-4'>
                {reportData.map((table, idx) => (
                    <div key={idx} className='overflow-x-auto'>
                        <h3 className='mb-4 text-center font-bold text-green-700 text-xl'>{table.header}</h3>
                        <table className='w-full border-collapse border-2 border-purple-700'>
                            <thead>
                                <tr className='bg-purple-700 text-white'>
                                    <th className='border border-purple-700 px-2 py-3'>Day / Period</th>
                                    {table.periodList.map((p: any, pIdx: number) => (
                                        <th key={pIdx} className='border border-purple-700 px-2 py-3'>
                                            {p.is_break ? 'Break' : `Period ${p.ped_name}`}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {table.rows.map((row: any, rIdx: number) => (
                                    <tr key={rIdx} className='hover:bg-gray-50'>
                                        <td
                                            className='border border-gray-400 px-2 py-2 text-center font-medium text-purple-600'
                                            style={{ minWidth: '120px' }}>
                                            {row.dayName}
                                        </td>
                                        {row.cells.map((cell: any, cIdx: number) => (
                                            <td
                                                key={cIdx}
                                                className='border border-gray-400 p-2 text-center text-sm'
                                                style={{ color: cell.color, minWidth: '120px' }}>
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
        </div>
    );
}
