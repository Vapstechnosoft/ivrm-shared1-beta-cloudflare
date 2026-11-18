'use client';

import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import type { ColumnDef } from '@tanstack/react-table';
import { FileSpreadsheet, Printer } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ReportGridProps {
    response: any;
    isLoading?: boolean;
    error?: any;
}

// Column header labels for print & excel
const printHeaders = [
    'SL. No.',
    'House Name',
    'Venue',
    'Student Name',
    'Adm. No.',
    'Class',
    'Section',
    'Event',
    'Sports Name',
    'Event Date'
];

// Accessor keys matching columns order
const printAccessors = [
    'slNo',
    'spccmH_HouseName',
    'spccmeV_EventVenue',
    'amsT_Name',
    'amsT_AdmNo',
    'asmcL_ClassName',
    'asmC_SectionName',
    'spccmE_EventName',
    'spccmscC_SportsCCName',
    'spccE_StartDate'
];

function formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '-';
    try {
        return new Date(dateStr).toLocaleDateString();
    } catch {
        return '-';
    }
}

function getCellValue(row: any, key: string, index: number): string {
    if (key === 'slNo') return String(index + 1);
    if (key === 'spccE_StartDate') return formatDate(row[key]);
    const val = row[key];
    return val !== null && val !== undefined ? String(val) : '-';
}

function buildPrintHtml(data: any[]): string {
    const rows = data
        .map((row, idx) => {
            const cells = printAccessors
                .map((key) => {
                    const val = getCellValue(row, key, idx);
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
            <title>Venue Wise Participation Report</title>
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
            <h2>Venue Wise Participation Report</h2>
            <table>
                <thead><tr>${headerCells}</tr></thead>
                <tbody>${rows.length > 0 ? rows : '<tr><td colspan="' + printHeaders.length + '" style="text-align:center;padding:20px;">No Records Found</td></tr>'}</tbody>
            </table>
        </body>
        </html>
    `;
}

export const VenueWiseReportColumns: ColumnDef<any>[] = [
    {
        accessorKey: 'id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SL. No.' className='pl-4' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div className='pl-4'>{continuousIndex}</div>;
        },
        enableSorting: true,
        enableHiding: false
    },
    {
        accessorKey: 'spccmH_HouseName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='House Name' />
    },
    {
        accessorKey: 'spccmeV_EventVenue',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Venue' />
    },
    {
        accessorKey: 'amsT_Name',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Student Name' />
    },
    {
        accessorKey: 'amsT_AdmNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Adm. No.' />
    },
    {
        accessorKey: 'asmcL_ClassName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class' />
    },
    {
        accessorKey: 'asmC_SectionName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Section' />
    },
    {
        accessorKey: 'spccmE_EventName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Event' />
    },
    {
        accessorKey: 'spccmscC_SportsCCName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sports Name' />
    },
    {
        accessorKey: 'spccE_StartDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Event Date' />,
        cell: ({ row }) => formatDate(row.original.spccE_StartDate)
    }
];

export const ReportGrid = ({ response, isLoading, error }: ReportGridProps) => {
    const tableProps = useDataTableProps(response);

    const handlePrint = () => {
        const dataToPrint = response?.data || [];
        const html = buildPrintHtml(dataToPrint);

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
        const dataToExport = response?.data || [];
        const excelData = dataToExport.map((row: any, index: number) => ({
            'SL. No.': index + 1,
            'House Name': row.spccmH_HouseName || '-',
            Venue: row.spccmeV_EventVenue || '-',
            'Student Name': row.amsT_Name || '-',
            'Adm. No.': row.amsT_AdmNo || '-',
            Class: row.asmcL_ClassName || '-',
            Section: row.asmC_SectionName || '-',
            Event: row.spccmE_EventName || '-',
            'Sports Name': row.spccmscC_SportsCCName || '-',
            'Event Date': formatDate(row.spccE_StartDate)
        }));
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Venue Wise Report');
        XLSX.writeFile(workbook, 'VenueWiseParticipationReport.xlsx');
    };

    if (!response || !response.data || response.data.length === 0) {
        if (!isLoading) {
            return null;
        }
    }

    return (
        <div className='space-y-4'>
            <div className='flex items-center justify-between rounded-lg border bg-white p-4 shadow-sm'>
                <div className='flex items-center gap-4'>
                    <div className='font-medium text-sm'>
                        Total Records:{' '}
                        <span className='rounded bg-primary/10 px-3 py-1 font-bold text-primary'>{response?.total || 0}</span>
                    </div>
                    <div className='flex gap-2'>
                        <Button
                            variant='outline'
                            size='sm'
                            onClick={handlePrint}
                            className='border-2 hover:bg-primary/5'
                            disabled={isLoading || !response?.data?.length}>
                            <Printer className='mr-2 h-4 w-4 text-primary' /> Print
                        </Button>
                        <Button
                            variant='outline'
                            size='sm'
                            onClick={exportToExcel}
                            className='border-2 hover:bg-primary/5'
                            disabled={isLoading || !response?.data?.length}>
                            <FileSpreadsheet className='mr-2 h-4 w-4 text-green-600' /> Excel
                        </Button>
                    </div>
                </div>
            </div>

            <div className='rounded-lg border bg-white shadow-sm'>
                <GenericDataTable<any>
                    {...tableProps}
                    columns={VenueWiseReportColumns}
                    isLoading={isLoading || false}
                    error={error}
                    showSearchColumns={true}
                    loadingMessage='Loading report...'
                    noDataTitle='No Records Found'
                    noDataDescription='Adjust your filters to see more results'
                    errorTitle='Error Loading Report'
                />
            </div>
        </div>
    );
};
