'use client';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Printer, Search } from 'lucide-react';
import * as XLSX from 'xlsx';

import { DataTable } from '@/components/ui/data-table/data-table';
import { Input } from '@/components/ui/input';
import type { ISportHouseCommitteeReport } from '@/types/sports/reports/sport-house-committee-report';
import type { ColumnDef } from '@tanstack/react-table';
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';

interface ReportGridProps {
    data: ISportHouseCommitteeReport[];
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

const columns: ColumnDef<ISportHouseCommitteeReport>[] = [
    {
        accessorKey: 'index',
        header: 'SL.No.',
        cell: ({ row }) => row.index + 1
    },
    {
        accessorKey: 'spccmH_HouseName',
        header: 'House Name',
        cell: ({ row }) => row.original.spccmH_HouseName || '-'
    },
    {
        accessorKey: 'asmaY_Year',
        header: 'Year'
    },
    {
        accessorKey: 'amsT_AdmNo',
        header: 'Adm. No.'
    },
    {
        header: 'Student Name',
        accessorKey: 'studentname'
    },
    {
        accessorKey: 'asmcL_ClassName',
        header: 'Class'
    },
    {
        accessorKey: 'asmC_SectionName',
        header: 'Section'
    },
    {
        accessorKey: 'spccmhD_DesignationName',
        header: 'Designation'
    },
    {
        accessorKey: 'spccmhC_ContactNo',
        header: 'Contact No.',
        cell: ({ row }) => row.original.spccmhC_ContactNo || '-'
    },
    {
        accessorKey: 'spccmhC_EmailId',
        header: 'Email ID',
        cell: ({ row }) => row.original.spccmhC_EmailId || '-'
    }
];

export default function ReportGrid({ data, searchQuery, onSearchChange }: ReportGridProps) {
    const componentRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: 'Sport_House_Committee_Report',
        pageStyle: `
          @page { size: portrait; margin: 20mm; }
          @media print {
            body { -webkit-print-color-adjust: exact; }
            table { border-collapse: collapse !important; width: 100% !important; }
            th, td { border: 1px solid #000 !important; padding: 8px !important; text-align: center !important; }
          }
        `
    });

    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
        XLSX.writeFile(workbook, 'SportHouseCommitteeReport.xlsx');
    };

    const filteredData = data.filter((item) => {
        return (
            item.studentname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.amsT_AdmNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.spccmH_HouseName?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

    return (
        <div className='space-y-4'>
            <div className='flex items-center justify-between rounded-lg border bg-white p-4 shadow-sm'>
                <div className='flex items-center gap-4'>
                    <div className='mr-4 font-medium text-muted-foreground text-sm'>
                        Total Records: <span className='rounded-full bg-primary/10 px-3 py-1 font-bold text-primary'>{data.length}</span>
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
                <div className='relative w-72'>
                    <Search className='-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground' />
                    <Input
                        placeholder='Search student, adm no, or house...'
                        className='h-10 border-2 pl-10'
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
            </div>

            <div ref={componentRef} className='min-h-[400px] rounded-lg border bg-white p-6 shadow-sm'>
                <style jsx global>{`
                    @media screen {
                        .print-only { display: none !important; }
                    }
                    @media print {
                        .screen-only { display: none !important; }
                        .print-only { display: block !important; }
                        body { -webkit-print-color-adjust: exact !important; background: white !important; }
                    }
                `}</style>

                <div className='mb-6 text-center'>
                    <h1 className='font-bold text-2xl text-primary uppercase underline'>Sport House Committee Report</h1>
                </div>

                <div className='screen-only'>
                    {filteredData.length > 0 ? (
                        <DataTable columns={columns} data={filteredData} totalItems={filteredData.length} />
                    ) : (
                        <div className='rounded-xl border-2 border-dashed bg-muted/30 py-20 text-center'>
                            <div className='mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted'>
                                <Search className='h-8 w-8 text-muted-foreground' />
                            </div>
                            <h3 className='mb-2 font-semibold text-xl'>No records found</h3>
                            <p className='text-muted-foreground'>
                                Try adjusting your filters or search query to find what you're looking for.
                            </p>
                        </div>
                    )}
                </div>

                <div className='print-only overflow-x-auto'>
                    <table className='w-full border-collapse border border-gray-300 text-center text-[10pt]'>
                        <thead>
                            <tr className='bg-gray-100'>
                                {columns.map((col: any, i) => (
                                    <th key={i} className='whitespace-nowrap border border-gray-300 p-2 font-bold'>
                                        {typeof col.header === 'string' ? col.header : ''}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.length > 0 ? (
                                filteredData.map((row, rowIndex) => (
                                    <tr key={rowIndex}>
                                        {columns.map((col: any, colIndex) => (
                                            <td key={colIndex} className='border border-gray-300 p-2'>
                                                {col.accessorKey
                                                    ? (row as any)[col.accessorKey]
                                                    : col.cell
                                                      ? (col.cell as any)({ row: { original: row, index: rowIndex } })
                                                      : ''}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={columns.length}
                                        className='border border-gray-300 p-10 text-center font-medium text-muted-foreground'>
                                        No Records Found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
