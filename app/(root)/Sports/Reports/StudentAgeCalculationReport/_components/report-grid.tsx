'use client';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Printer } from 'lucide-react';
import * as XLSX from 'xlsx';

import type { IStudentAgeReport } from '@/types/sports/reports/student-age-calculation';
import type { ColumnDef } from '@tanstack/react-table';
import { useRef } from 'react';

import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';

interface ReportGridProps {
    data: IStudentAgeReport[];
    isLoading?: boolean;
}

const columns: ColumnDef<IStudentAgeReport>[] = [
    {
        accessorKey: 'index',
        header: 'SL.No.',
        cell: ({ row }) => row.index + 1
    },
    {
        accessorKey: 'amsT_Admno',
        header: 'Adm. No.',
        cell: ({ row }) => row.original.amsT_Admno || '-'
    },
    {
        header: 'Student Name',
        accessorKey: 'amsT_Name',
        cell: ({ row }) => row.original.amsT_Name || '-'
    },
    {
        accessorKey: 'asmcL_Classname',
        header: 'Class',
        cell: ({ row }) => row.original.asmcL_Classname || '-'
    },
    {
        accessorKey: 'asmC_Sectionname',
        header: 'Section',
        cell: ({ row }) => row.original.asmC_Sectionname || '-'
    },
    {
        accessorKey: 'spccmH_Housename',
        header: 'House Name',
        cell: ({ row }) => row.original.spccmH_Housename || '-'
    },
    {
        accessorKey: 'amsT_DOb',
        header: 'DOB',
        cell: ({ row }) => {
            if (!row.original.amsT_DOb) return '-';
            const date = new Date(row.original.amsT_DOb);
            return isNaN(date.getTime()) ? '-' : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        }
    },
    {
        accessorKey: 'months',
        header: 'Age Months',
        cell: ({ row }) => row.original.months ?? '-'
    },
    {
        accessorKey: 'years',
        header: 'Years',
        cell: ({ row }) => row.original.years ?? '-'
    },
    {
        accessorKey: 'monthsd',
        header: 'Months',
        cell: ({ row }) => row.original.monthsd ?? '-'
    },
    {
        accessorKey: 'spccmcL_compitionLevel',
        header: 'Competition Category',
        cell: ({ row }) => row.original.spccmcL_compitionLevel || '-'
    }
];

// Column header labels for print table
const printHeaders = [
    'SL.No.',
    'Adm. No.',
    'Student Name',
    'Class',
    'Section',
    'House Name',
    'DOB',
    'Age Months',
    'Years',
    'Months',
    'Competition Category'
];

// Accessor keys matching columns order
const printAccessors: (keyof IStudentAgeReport)[] = [
    'amsT_Id',
    'amsT_Admno',
    'amsT_Name',
    'asmcL_Classname',
    'asmC_Sectionname',
    'spccmH_Housename',
    'amsT_DOb',
    'months',
    'years',
    'monthsd',
    'spccmcL_compitionLevel'
];

function buildPrintHtml(data: IStudentAgeReport[]): string {
    const rows = data
        .map((row, idx) => {
            const cells = printAccessors
                .map((key, colIdx) => {
                    // SL. No. column
                    if (colIdx === 0) return `<td style="border:1px solid #000;padding:6px 10px;text-align:center;">${idx + 1}</td>`;

                    let val: any = row[key];
                    if (key === 'amsT_DOb' && val) {
                        const date = new Date(val);
                        val = isNaN(date.getTime())
                            ? '-'
                            : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                    }

                    const displayVal = val !== null && val !== undefined ? String(val) : '-';
                    return `<td style="border:1px solid #000;padding:6px 10px;text-align:center;">${displayVal}</td>`;
                })
                .join('');
            return `<tr>${cells}</tr>`;
        })
        .join('');

    const headerCells = printHeaders
        .map((h) => `<th style="border:1px solid #000;padding:6px 10px;background:#f3f4f6;text-align:center;font-weight:bold;">${h}</th>`)
        .join('');

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8"/>
            <title>Student Age Calculation Report</title>
            <style>
                * { box-sizing: border-box; }
                body { font-family: Arial, sans-serif; font-size: 10px; margin: 20px; background: #fff; color: #000; }
                h2 { text-align: center; text-transform: uppercase; text-decoration: underline; margin-bottom: 16px; font-size: 16px; }
                table { width: 100%; border-collapse: collapse; }
                @media print {
                    body { margin: 10mm; }
                    @page { size: A4 landscape; margin: 10mm; }
                }
            </style>
        </head>
        <body>
            <h2>Student Age Calculation Report</h2>
            <table>
                <thead><tr>${headerCells}</tr></thead>
                <tbody>${rows.length > 0 ? rows : '<tr><td colspan="' + printHeaders.length + '" style="text-align:center;padding:20px;">No Records Found</td></tr>'}</tbody>
            </table>
        </body>
        </html>
    `;
}

export default function ReportGrid({ data, isLoading }: ReportGridProps) {
    const componentRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        const html = buildPrintHtml(data);
        const printWindow = window.open('', '_blank', 'width=1200,height=800');
        if (!printWindow) return;

        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();

        printWindow.onload = () => {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        };
    };

    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
        XLSX.writeFile(workbook, 'StudentAgeCalculationReport.xlsx');
    };

    return (
        <div className='space-y-4'>
            <div className='flex items-center justify-between rounded-lg border bg-white p-4 shadow-sm'>
                <div className='flex items-center gap-4'>
                    <div className='font-medium text-sm'>
                        Total Grid Records: <span className='rounded bg-primary/10 px-2 py-1 text-primary'>{data.length}</span>
                    </div>
                    <div className='flex gap-2'>
                        <Button variant='outline' size='sm' onClick={() => handlePrint()} className='border-2 hover:bg-primary/5'>
                            <Printer className='mr-2 h-4 w-4 text-primary' />
                            Print
                        </Button>
                        <Button variant='outline' size='sm' onClick={exportToExcel} className='border-2 hover:bg-primary/5'>
                            <FileSpreadsheet className='mr-2 h-4 w-4 text-success' />
                            Excel
                        </Button>
                    </div>
                </div>
            </div>

            <div className='min-h-[400px] rounded-lg border bg-white p-6 shadow-sm'>
                <div className='mb-6 text-center'>
                    <h1 className='font-bold text-2xl text-primary uppercase underline'>Student Age Calculation Report</h1>
                </div>

                <div>
                    <GenericDataTable<IStudentAgeReport>
                        columns={columns}
                        data={data}
                        isLoading={!!isLoading}
                        totalItems={data.length}
                        showSearchColumns={true}
                        loadingMessage='Generating report...'
                    />
                </div>
            </div>
        </div>
    );
}
