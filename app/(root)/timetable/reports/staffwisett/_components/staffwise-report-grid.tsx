'use client';

import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';
import * as XLSX from 'xlsx';

interface StaffWiseReportGridProps {
    reportData: any[];
    onPrint: () => void;
}

export default function StaffWiseReportGrid({ reportData, onPrint }: StaffWiseReportGridProps) {
    const handleExport = () => {
        const wb = XLSX.utils.book_new();

        reportData.forEach((table, idx) => {
            const headerRow = ['Day / Period', ...table.periodList.map((p: any) => (p.is_break ? 'Break' : `Period ${p.ped_name}`))];

            const sheetData = [headerRow];

            table.rows.forEach((row: any) => {
                const rowData = [row.dayName, ...row.cells.map((c: any) => c.content)];
                sheetData.push(rowData);
            });

            const ws = XLSX.utils.aoa_to_sheet(sheetData);

            let sheetName = String(table.header)
                .substring(0, 31)
                .replace(/[:\/\\?*\[\]]/g, '');
            if (sheetName.length === 0) sheetName = `Sheet ${idx + 1}`;

            let suffix = 1;
            const originalName = sheetName;
            while (wb.SheetNames.includes(sheetName)) {
                sheetName = `${originalName.substring(0, 28)}_${suffix}`;
                suffix++;
            }

            XLSX.utils.book_append_sheet(wb, ws, sheetName);
        });

        XLSX.writeFile(wb, 'StaffWiseTimeTable.xlsx');
    };

    return (
        <div className='space-y-6'>
            <div className='no-print flex items-center justify-between bg-gray-50 px-4 py-2 text-sm'>
                <span className='font-medium text-gray-500'>* Use the buttons below to export or print the report.</span>
                <div className='flex items-center gap-3'>
                    <Button onClick={onPrint} size='sm' className='bg-purple-600 shadow-sm hover:bg-purple-700'>
                        <Printer className='mr-2 h-4 w-4' /> Print
                    </Button>

                    <Button
                        onClick={handleExport}
                        size='sm'
                        variant='outline'
                        className='gap-2 border-green-600 text-green-700 shadow-sm hover:bg-green-50'>
                        <Download className='h-4 w-4' />
                        Export Excel
                    </Button>
                </div>
            </div>

            <div className='mt-6 space-y-12 bg-white'>
                {reportData.map((table, idx) => (
                    <div key={idx} className='page-break-after-always overflow-x-auto p-4'>
                        <h3 className='mb-4 text-center font-bold text-green-700 text-xl tracking-tight'>Staff Name : {table.header}</h3>
                        <table className='w-full border-collapse border-2 border-purple-700'>
                            <thead>
                                <tr className='bg-purple-700 text-white'>
                                    <th className='border border-purple-700 px-2 py-3 font-bold text-sm tracking-wider'>Day / Period</th>
                                    {table.periodList?.map((p: any, pIdx: number) => (
                                        <th key={pIdx} className='border border-purple-700 px-2 py-3 font-bold text-sm tracking-wider'>
                                            {p.is_break ? 'Break' : `Period ${p.ped_name}`}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-gray-200'>
                                {table.rows?.map((row: any, rIdx: number) => (
                                    <tr key={rIdx} className='hover:bg-gray-50'>
                                        <td
                                            className='border border-gray-400 px-2 py-2 text-center font-medium text-purple-600 uppercase'
                                            style={{ minWidth: '120px' }}>
                                            {row.dayName}
                                        </td>
                                        {row.cells?.map((cell: any, cIdx: number) => (
                                            <td
                                                key={cIdx}
                                                className='border border-gray-400 p-2 text-center text-sm'
                                                style={{ color: cell.color, minWidth: '120px' }}>
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

            <div className='mt-8 flex items-center justify-between border-gray-100 border-t px-4 py-2 font-medium text-gray-400 text-xs italic'>
                <p>* This report is generated dynamically based on chosen schedule.</p>
                <p>Generated on: {new Date().toLocaleString()}</p>
            </div>
        </div>
    );
}
