'use client';

import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { FileSpreadsheet, Printer } from 'lucide-react';
import { useState } from 'react';
import * as XLSX from 'xlsx';

interface CustomTcResultsTableProps {
    data: any[];
    onPrint: (selected: any[]) => void;
}

export function CustomTcResultsTable({ data, onPrint }: CustomTcResultsTableProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredData = data.filter((item) =>
        Object.values(item).some((val) => val?.toString().toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const exportToExcel = () => {
        if (data.length === 0) return;

        const dataToExport = data.map((item, index) => ({
            'SL NO': index + 1,
            'Student Name': item.studentname,
            'Adm. No': item.amst_admno || item.amsT_AdmNo || '-',
            'TC No': item.astc_tcno || item.astC_TCNO || '-',
            'TC Date': item.astc_tcdate ? format(new Date(item.astc_tcdate), 'dd/MM/yyyy') : '-',
            Class: item.last_class_studied || '-',
            Section: item.asmc_sectionname || '-'
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'TC Summary Report');
        XLSX.writeFile(workbook, 'TC_Summary_Report.xlsx');
    };

    return (
        <div className='space-y-4'>
            <div className='flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row'>
                <div className='flex items-center gap-4'>
                    <div className='rounded-full bg-indigo-50 px-3 py-1 font-bold text-indigo-700 text-sm'>Total: {data.length}</div>
                    <input
                        type='text'
                        placeholder='Search records...'
                        className='w-64 rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className='flex items-center gap-3'>
                    <Button variant='outline' size='sm' onClick={exportToExcel} className='rounded-xl'>
                        <FileSpreadsheet className='mr-2 h-4 w-4' />
                        Excel
                    </Button>
                    <Button
                        variant='default'
                        size='sm'
                        onClick={() => onPrint(filteredData)}
                        className='rounded-xl bg-indigo-600 hover:bg-indigo-700'>
                        <Printer className='mr-2 h-4 w-4' />
                        Print List
                    </Button>
                </div>
            </div>

            <div className='overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm'>
                <Table>
                    <TableHeader className='bg-slate-50'>
                        <TableRow>
                            <TableHead className='w-16 text-center'>SL</TableHead>
                            <TableHead>Student Name</TableHead>
                            <TableHead>Adm. No</TableHead>
                            <TableHead>TC No</TableHead>
                            <TableHead>TC Date</TableHead>
                            <TableHead>Class</TableHead>
                            <TableHead>Section</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.map((item, index) => (
                            <TableRow key={item.amsT_Id || index} className='transition-colors hover:bg-slate-50'>
                                <TableCell className='text-center font-medium text-slate-500'>{index + 1}</TableCell>
                                <TableCell className='font-bold text-slate-900'>{item.studentname}</TableCell>
                                <TableCell>{item.amst_admno || item.amsT_AdmNo || '-'}</TableCell>
                                <TableCell>{item.astc_tcno || item.astC_TCNO || '-'}</TableCell>
                                <TableCell>{item.astc_tcdate ? format(new Date(item.astc_tcdate), 'dd/MM/yyyy') : '-'}</TableCell>
                                <TableCell>{item.last_class_studied || '-'}</TableCell>
                                <TableCell>{item.asmc_sectionname || '-'}</TableCell>
                            </TableRow>
                        ))}
                        {filteredData.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className='h-32 text-center text-slate-400 italic'>
                                    No records found matching your search.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
