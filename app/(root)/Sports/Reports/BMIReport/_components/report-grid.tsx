'use client';

import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import type { ApiResponse } from '@/lib/apiService';
import type { IBMIReport } from '@/types/sports/reports/bmi-report';
import type { ColumnDef } from '@tanstack/react-table';
import { FileSpreadsheet, Printer } from 'lucide-react';
import * as XLSX from 'xlsx';

const columns: ColumnDef<IBMIReport>[] = [
    {
        accessorKey: 'amsT_ID',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SL. No.' className='pl-6' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div className='pl-6'>{continuousIndex}</div>;
        },
        enableSorting: true
    },
    {
        accessorKey: 'amsT_Name',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Student Name' />,
        cell: ({ row }) => row.original.amsT_Name || '-',
        enableSorting: true
    },
    {
        accessorKey: 'amsT_AdmNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Adm. No.' />,
        cell: ({ row }) => row.original.amsT_AdmNo || '-',
        enableSorting: true
    },
    {
        accessorKey: 'asmcL_ClassName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class' />,
        cell: ({ row }) => row.original.asmcL_ClassName || '-'
    },
    {
        accessorKey: 'asmC_SectionName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Section' />,
        cell: ({ row }) => row.original.asmC_SectionName || '-'
    },
    {
        accessorKey: 'spccshW_HeighT',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Height' />,
        cell: ({ row }) => row.original.spccshW_HeighT ?? '-',
        enableSorting: true
    },
    {
        accessorKey: 'spccshW_WeighT',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Weight' />,
        cell: ({ row }) => row.original.spccshW_WeighT ?? '-',
        enableSorting: true
    },
    {
        accessorKey: 'spccshW_BMi',
        header: ({ column }) => <DataTableColumnHeader column={column} title='BMI' />,
        cell: ({ row }) => row.original.spccshW_BMi ?? '-',
        enableSorting: true
    },
    {
        accessorKey: 'spccshW_BMiRemark',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Remark' />,
        cell: ({ row }) => row.original.spccshW_BMiRemark || '-'
    }
];

// Column header labels for print table
const printHeaders = ['SL. No.', 'Student Name', 'Adm. No.', 'Class', 'Section', 'Height', 'Weight', 'BMI', 'Remark'];

// Accessor keys matching columns order
const printAccessors: (keyof IBMIReport)[] = [
    'amsT_ID',
    'amsT_Name',
    'amsT_AdmNo',
    'asmcL_ClassName',
    'asmC_SectionName',
    'spccshW_HeighT',
    'spccshW_WeighT',
    'spccshW_BMi',
    'spccshW_BMiRemark'
];

function buildPrintHtml(data: IBMIReport[]): string {
    const rows = data
        .map((row, idx) => {
            const cells = printAccessors
                .map((key, colIdx) => {
                    // SL. No. column
                    const val = colIdx === 0 ? String(idx + 1) : row[key] !== null && row[key] !== undefined ? String(row[key]) : '-';
                    return `<td style="border:1px solid #000;padding:6px 10px;text-align:center;">${val}</td>`;
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
            <title>BMI Report</title>
            <style>
                * { box-sizing: border-box; }
                body { font-family: Arial, sans-serif; font-size: 12px; margin: 20px; background: #fff; color: #000; }
                h2 { text-align: center; text-transform: uppercase; text-decoration: underline; margin-bottom: 16px; font-size: 16px; }
                table { width: 100%; border-collapse: collapse; }
                @media print {
                    body { margin: 10mm; }
                    @page { size: A4 landscape; margin: 10mm; }
                }
            </style>
        </head>
        <body>
            <h2>BMI Report</h2>
            <table>
                <thead><tr>${headerCells}</tr></thead>
                <tbody>${rows.length > 0 ? rows : '<tr><td colspan="' + printHeaders.length + '" style="text-align:center;padding:20px;">No Records Found</td></tr>'}</tbody>
            </table>
        </body>
        </html>
    `;
}

interface ReportGridProps {
    response: ApiResponse<IBMIReport[]>;
    searchParams?: any;
    isLoading: boolean;
}

export default function ReportGrid({ response, searchParams, isLoading }: ReportGridProps) {
    const tableProps = useDataTableProps(response);

    const handlePrint = () => {
        const data = response.data || [];
        const html = buildPrintHtml(data);

        const printWindow = window.open('', '_blank', 'width=1200,height=800');
        if (!printWindow) return;

        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();

        // Wait for content to render before printing
        printWindow.onload = () => {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        };
    };

    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(response.data || []);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'BMI Report');
        XLSX.writeFile(workbook, 'BMI_Report.xlsx');
    };

    return (
        <div className='space-y-4'>
            <div className='flex items-center justify-between rounded-lg border bg-white p-4 shadow-sm'>
                <div className='flex items-center gap-4'>
                    <div className='font-medium text-sm'>
                        Total Records: <span className='rounded bg-primary/10 px-3 py-1 font-bold text-primary'>{response.total || 0}</span>
                    </div>
                    <div className='flex gap-2'>
                        <Button variant='outline' size='sm' onClick={handlePrint} className='border-2 hover:bg-primary/5'>
                            <Printer className='mr-2 h-4 w-4 text-primary' /> Print
                        </Button>
                        <Button variant='outline' size='sm' onClick={exportToExcel} className='border-2 hover:bg-primary/5'>
                            <FileSpreadsheet className='mr-2 h-4 w-4 text-green-600' /> Excel
                        </Button>
                    </div>
                </div>
            </div>

            <div className='rounded-lg border bg-white p-4 shadow-sm'>
                <GenericDataTable<IBMIReport>
                    {...tableProps}
                    columns={columns}
                    isLoading={isLoading}
                    showSearchColumns={true}
                    loadingMessage='Loading report data...'
                />
            </div>
        </div>
    );
}
