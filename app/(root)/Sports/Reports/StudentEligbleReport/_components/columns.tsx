'use client';

import type { IStudentEligibleReportDetail } from '@/types/sports/reports/student-eligible-report';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';

import * as XLSX from 'xlsx';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';

export const columns: ColumnDef<IStudentEligibleReportDetail>[] = [
    {
        id: 'serialNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SL. No.' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            return pageIndex * pageSize + row.index + 1;
        },
        enableSorting: false
    },
    {
        accessorKey: 'adm_no',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Adm. No.' />,
        enableSorting: true
    },
    {
        accessorKey: 'studentname',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Student Name' />,
        enableSorting: true
    },
    {
        accessorKey: 'classname',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class' />,
        enableSorting: true
    },
    {
        accessorKey: 'sectionname',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Section' />,
        enableSorting: true
    },
    {
        id: 'SPCCE_StartDate',
        accessorKey: 'spccE_StartDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='DOB' />,
        cell: ({ row }) => {
            const date = row.original.spccE_StartDate;
            return date ? format(new Date(date), 'dd/MM/yyyy') : '-';
        },
        enableSorting: true
    },
    {
        id: 'PASR_Age',
        accessorKey: 'pasR_Age',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Age' />,
        enableSorting: true
    },
    {
        id: 'AMST_FatherName',
        accessorKey: 'amsT_FatherName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Father Name' />,
        enableSorting: true
    },
    {
        id: 'AMST_MotherName',
        accessorKey: 'amsT_MotherName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Mother Name' />,
        enableSorting: true
    },
    {
        id: 'Address',
        accessorKey: 'address',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Address' />,
        enableSorting: true
    }
];

export function printTable(headers: string[], rows: any[]) {
    const printWindow = window.open('', '', 'width=1200,height=800');
    if (!printWindow) return;

    const tableHead = headers.map((col) => `<th>${col}</th>`).join('');
    const tableRows = rows.map((row) => `<tr>${headers.map((col) => `<td>${row[col] ?? ''}</td>`).join('')}</tr>`).join('');

    printWindow.document.write(`
        <html>
        <head>
            <title>Student Eligible Report</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h2 { text-align: center; margin-bottom: 10px; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #333; padding: 6px; font-size: 12px; }
                th { background: #eaeaea; }
                tr:nth-child(even) td { background: #fafafa; }
                @media print {
                    body { margin: 0; }
                }
            </style>
        </head>
        <body>
            <h2>Student Eligible Report</h2>
            <table>
                <thead>
                    <tr>${tableHead}</tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </body>
        </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 250);
}

export function exportToExcel(rows: any[], fileName: string) {
    if (!rows || rows.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');

    XLSX.writeFile(workbook, `${fileName}.xlsx`);
}
