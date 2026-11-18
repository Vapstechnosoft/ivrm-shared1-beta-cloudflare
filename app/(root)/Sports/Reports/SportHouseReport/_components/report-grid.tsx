'use client';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Printer, Search } from 'lucide-react';
import * as XLSX from 'xlsx';

import { DataTable } from '@/components/ui/data-table/data-table';
import { Input } from '@/components/ui/input';
import type { ColumnDef } from '@tanstack/react-table';
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import type { ISportHouseReportData } from '../types';

interface ReportGridProps {
    data: ISportHouseReportData[];
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

const columns: ColumnDef<ISportHouseReportData>[] = [
    {
        accessorKey: 'index',
        header: 'SL.No.',
        cell: ({ row }) => row.index + 1
    },
    {
        accessorKey: 'SPCCMH_HouseName',
        header: 'House Name',
        cell: ({ row }) => row.original.SPCCMH_HouseName || '-'
    },
    {
        accessorKey: 'AMST_Name',
        header: 'Student Name',
        cell: ({ row }) => row.original.AMST_Name || '-'
    },
    {
        accessorKey: 'AMST_AdmNo',
        header: 'Adm. No.',
        cell: ({ row }) => row.original.AMST_AdmNo || '-'
    },
    {
        accessorKey: 'ASMCL_ClassName',
        header: 'Class',
        cell: ({ row }) => row.original.ASMCL_ClassName || '-'
    },
    {
        accessorKey: 'ASMC_SectionName',
        header: 'Section',
        cell: ({ row }) => row.original.ASMC_SectionName || '-'
    },
    {
        accessorKey: 'AMST_MobileNo',
        header: 'Contact No.',
        cell: ({ row }) => row.original.AMST_MobileNo || '-'
    },
    {
        accessorKey: 'AMST_emailId',
        header: 'Email',
        cell: ({ row }) => row.original.AMST_emailId || '-'
    }
];

export default function ReportGrid({ data, searchQuery, onSearchChange }: ReportGridProps) {
    const componentRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: 'Sport_House_Report',
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
        XLSX.writeFile(workbook, 'SportHouseReport.xlsx');
    };

    const filteredData = data.filter((item) => {
        const query = searchQuery.toLowerCase();
        return (
            (item.SPCCMH_HouseName && item.SPCCMH_HouseName.toLowerCase().includes(query)) ||
            (item.AMST_Name && item.AMST_Name.toLowerCase().includes(query)) ||
            (item.AMST_AdmNo && item.AMST_AdmNo.toLowerCase().includes(query)) ||
            (item.ASMCL_ClassName && item.ASMCL_ClassName.toLowerCase().includes(query)) ||
            (item.ASMC_SectionName && item.ASMC_SectionName.toLowerCase().includes(query))
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
                        placeholder='Search...'
                        className='h-10 border-2 pl-10'
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
            </div>

            <div ref={componentRef} className='min-h-[400px] rounded-lg border bg-white p-6 shadow-sm'>
                <div className='mb-6 text-center'>
                    <h1 className='font-bold text-2xl text-primary uppercase underline'>Sport House Report</h1>
                </div>
                {filteredData.length > 0 ? (
                    <DataTable columns={columns} data={filteredData} totalItems={filteredData.length} />
                ) : (
                    <div className='rounded-xl border-2 border-dashed bg-muted/30 py-20 text-center'>
                        <div className='mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted'>
                            <Search className='h-8 w-8 text-muted-foreground' />
                        </div>
                        <h3 className='mb-2 font-semibold text-xl'>No records found</h3>
                        <p className='text-muted-foreground'>Try adjusting your filters or search query to find what you're looking for.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
