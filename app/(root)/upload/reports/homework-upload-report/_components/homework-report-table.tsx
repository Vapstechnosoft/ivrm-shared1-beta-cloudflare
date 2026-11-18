'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { exportToExcel, exportToPdf } from '@/lib/export-to-file';
import type { IHomeWorkReport } from '@/types/upload/reports/homework-upload-report';
import { ChevronLeft, ChevronRight, Eye, FileSpreadsheet, Printer, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

interface HomeWorkReportTableProps {
    data: IHomeWorkReport[];
    onViewAttachment: (item: IHomeWorkReport) => void;
}

export function HomeWorkReportTable({ data, onViewAttachment }: HomeWorkReportTableProps) {
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredData = useMemo(() => {
        return data.filter((item) => Object.values(item).some((val) => val && val.toString().toLowerCase().includes(search.toLowerCase())));
    }, [data, search]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const content = `
            <html>
                <head>
                    <title>HomeWork Upload Report</title>
                    <style>
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; font-family: sans-serif; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: center; font-size: 12px; }
                        th { background-color: #f2f2f2; font-weight: bold; }
                        h2 { text-align: center; color: #333; }
                        .footer { margin-top: 20px; text-align: center; font-size: 10px; color: #666; }
                    </style>
                </head>
                <body>
                    <h2>HomeWork Upload Report</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>SL.NO</th>
                                <th>Topic</th>
                                <th>Class</th>
                                <th>Section</th>
                                <th>Subject</th>
                                <th>File Name</th>
                                <th>Upload Date</th>
                                <th>Uploaded By</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filteredData
                                .map(
                                    (item, index) => `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td style="text-align: left;">${item.Topic}</td>
                                    <td>${item.ClassName}</td>
                                    <td>${item.SectionName}</td>
                                    <td>${item.SubjectName}</td>
                                    <td>${item.FileName || '--'}</td>
                                    <td>${new Date(item.UploadDate).toLocaleDateString('en-GB')}</td>
                                    <td>${item.EmployeeName || item.UserName || 'N/A'}</td>
                                </tr>
                            `
                                )
                                .join('')}
                        </tbody>
                    </table>
                    <div class="footer">
                        Generated on ${new Date().toLocaleString()}
                    </div>
                </body>
            </html>
        `;

        printWindow.document.write(content);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    };

    const handleExportExcel = () => {
        const columns = [
            { label: 'SL.NO', value: 'slno' },
            { label: 'Topic', value: 'topic' },
            { label: 'Class', value: 'class' },
            { label: 'Section', value: 'section' },
            { label: 'Subject', value: 'subject' },
            { label: 'File Name', value: 'filename' },
            { label: 'Upload Date', value: 'date' },
            { label: 'Uploaded By', value: 'by' }
        ];

        const content = filteredData.map((item, index) => ({
            slno: index + 1,
            topic: item.Topic,
            class: item.ClassName,
            section: item.SectionName,
            subject: item.SubjectName,
            filename: item.FileName || '--',
            date: new Date(item.UploadDate).toLocaleDateString('en-GB'),
            by: item.EmployeeName || item.UserName || 'N/A'
        }));

        exportToExcel('HomeWork_Upload_Report', JSON.stringify(columns), JSON.stringify(content));
    };

    const handleExportPdf = () => {
        const columns = ['SL.NO', 'Topic', 'Class', 'Section', 'Subject', 'File Name', 'Date', 'By'];

        const content = filteredData.map((item, index) => [
            index + 1,
            item.Topic,
            item.ClassName,
            item.SectionName,
            item.SubjectName,
            item.FileName || '--',
            new Date(item.UploadDate).toLocaleDateString('en-GB'),
            item.EmployeeName || item.UserName || 'N/A'
        ]);

        exportToPdf('HomeWork_Upload_Report', columns, content);
    };

    return (
        <div className='space-y-4'>
            <div className='flex flex-col items-center justify-between gap-4 md:flex-row'>
                <div className='flex items-center gap-4'>
                    <div className='flex items-center gap-2'>
                        <span className='font-medium text-[11px] text-muted-foreground text-sm uppercase tracking-wider'>
                            Total Grid Records:
                        </span>
                        <span className='rounded-full bg-primary px-3 py-1 font-bold text-white text-xs shadow-sm'>{data.length}</span>
                    </div>
                    {search && (
                        <div className='flex items-center gap-2'>
                            <span className='font-medium text-[11px] text-muted-foreground text-sm uppercase tracking-wider'>
                                Total Records Searched:
                            </span>
                            <span className='rounded-full bg-amber-500 px-3 py-1 font-bold text-white text-xs shadow-sm'>
                                {filteredData.length}
                            </span>
                        </div>
                    )}
                </div>
                <div className='relative flex max-w-sm flex-1'>
                    <Search className='-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground' />
                    <Input
                        placeholder='Search records...'
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                        }}
                        className='h-9 rounded-full border-slate-200 bg-slate-50 pl-9 transition-all focus:bg-white'
                    />
                </div>
                <div className='flex gap-2'>
                    <Button
                        variant='outline'
                        size='sm'
                        onClick={handleExportExcel}
                        className='flex items-center gap-2 rounded-full px-4 transition-colors hover:border-green-200 hover:bg-green-50 hover:text-green-600'>
                        <FileSpreadsheet className='h-4 w-4' /> Export to Excel
                    </Button>
                    <Button
                        variant='outline'
                        size='sm'
                        onClick={handleExportPdf}
                        className='flex items-center gap-2 rounded-full px-4 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600'>
                        <FileSpreadsheet className='h-4 w-4' /> Export to PDF
                    </Button>
                    <Button
                        variant='outline'
                        size='sm'
                        onClick={handlePrint}
                        className='flex items-center gap-2 rounded-full px-4 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600'>
                        <Printer className='h-4 w-4' /> Print
                    </Button>
                </div>
            </div>

            <div className='overflow-hidden rounded-xl border bg-white shadow-sm'>
                <Table>
                    <TableHeader className='border-none bg-slate-900 hover:bg-slate-900'>
                        <TableRow className='border-none hover:bg-transparent'>
                            <TableHead className='h-12 text-center font-bold text-[11px] text-white uppercase tracking-widest'>
                                SL.NO
                            </TableHead>
                            <TableHead className='h-12 font-bold text-[11px] text-white uppercase tracking-widest'>Topic</TableHead>
                            <TableHead className='h-12 text-center font-bold text-[11px] text-white uppercase tracking-widest'>
                                Class
                            </TableHead>
                            <TableHead className='h-12 text-center font-bold text-[11px] text-white uppercase tracking-widest'>
                                Section
                            </TableHead>
                            <TableHead className='h-12 text-center font-bold text-[11px] text-white uppercase tracking-widest'>
                                Subject
                            </TableHead>
                            <TableHead className='h-12 text-center font-bold text-[11px] text-white uppercase tracking-widest'>
                                File Name
                            </TableHead>
                            <TableHead className='h-12 text-center font-bold text-[11px] text-white uppercase tracking-widest'>
                                Upload Date
                            </TableHead>
                            <TableHead className='h-12 text-center font-bold text-[11px] text-white uppercase tracking-widest'>
                                Upload By
                            </TableHead>
                            <TableHead className='h-12 text-center font-bold text-[11px] text-white uppercase tracking-widest'>
                                View
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedData.map((item, index) => (
                            <TableRow key={index} className='transition-colors hover:bg-slate-50'>
                                <TableCell className='text-center font-medium text-slate-500'>
                                    {(currentPage - 1) * itemsPerPage + index + 1}
                                </TableCell>
                                <TableCell className='font-semibold text-slate-700'>{item.Topic}</TableCell>
                                <TableCell className='text-center'>{item.ClassName}</TableCell>
                                <TableCell className='text-center'>{item.SectionName}</TableCell>
                                <TableCell className='text-center font-medium text-primary'>{item.SubjectName}</TableCell>
                                <TableCell className='max-w-[150px] truncate text-center text-slate-500' title={item.FileName || ''}>
                                    {item.FileName || '--'}
                                </TableCell>
                                <TableCell className='text-center font-medium'>
                                    {new Date(item.UploadDate).toLocaleDateString('en-GB')}
                                </TableCell>
                                <TableCell className='text-center text-slate-600 italic'>
                                    {item.EmployeeName || item.UserName || 'N/A'}
                                </TableCell>
                                <TableCell className='text-center'>
                                    {item.FileName || item.Filepath ? (
                                        <Button
                                            variant='ghost'
                                            size='sm'
                                            onClick={() => onViewAttachment(item)}
                                            className='mx-auto flex items-center gap-1 text-primary transition-all hover:bg-primary/10 hover:text-primary'>
                                            <Eye className='h-4 w-4' /> View
                                        </Button>
                                    ) : (
                                        <span className='font-medium text-[11px] text-muted-foreground opacity-50'>--</span>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredData.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={9} className='h-40 text-center'>
                                    <div className='flex flex-col items-center justify-center space-y-3'>
                                        <div className='rounded-full bg-slate-50 p-4'>
                                            <Search className='h-8 w-8 text-slate-300' />
                                        </div>
                                        <div className='font-semibold text-lg text-slate-400'>No records found matching your search.</div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {totalPages > 1 && (
                <div className='mt-6 flex items-center justify-center space-x-2'>
                    <Button
                        variant='outline'
                        size='sm'
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className='rounded-full shadow-sm transition-all hover:shadow'>
                        <ChevronLeft className='mr-1 h-4 w-4' /> Previous
                    </Button>
                    <div className='flex items-center gap-1'>
                        <span className='rounded-full bg-slate-100 px-3 py-1 font-medium text-sm'>
                            Page {currentPage} of {totalPages}
                        </span>
                    </div>
                    <Button
                        variant='outline'
                        size='sm'
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className='rounded-full shadow-sm transition-all hover:shadow'>
                        Next <ChevronRight className='ml-1 h-4 w-4' />
                    </Button>
                </div>
            )}
        </div>
    );
}
