'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { exportToExcel, exportToPdf } from '@/lib/export-to-file';
import type { INoticeBoardReport } from '@/types/upload/reports/noticeboard-report';
import { ChevronLeft, ChevronRight, Eye, FileSpreadsheet, Printer, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

interface NoticeBoardReportTableProps {
    data: INoticeBoardReport[];
    onViewAttachment: (item: INoticeBoardReport) => void;
}

export function NoticeBoardReportTable({ data, onViewAttachment }: NoticeBoardReportTableProps) {
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
                    <title>NoticeBoard Report</title>
                    <style>
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
                        th { background-color: #f2f2f2; }
                        h2 { text-align: center; }
                    </style>
                </head>
                <body>
                    <h2>NoticeBoard Report</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>SL.NO</th>
                                <th>Title</th>
                                <th>Class</th>
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
                                    <td>${new Date(item.UploadDate).toLocaleDateString('en-GB')}</td>
                                    <td>${item.EmployeeName || item.UserName || 'N/A'}</td>
                                </tr>
                            `
                                )
                                .join('')}
                        </tbody>
                    </table>
                </body>
            </html>
        `;

        printWindow.document.write(content);
        printWindow.document.close();
        printWindow.print();
    };

    const handleExportExcel = () => {
        const columns = [
            { label: 'SL.NO', value: 'slno' },
            { label: 'Title', value: 'title' },
            { label: 'Class', value: 'class' },
            { label: 'Section', value: 'section' },
            { label: 'Upload Date', value: 'date' },
            { label: 'Uploaded By', value: 'by' }
        ];

        const content = filteredData.map((item, index) => ({
            slno: index + 1,
            title: item.Topic,
            class: item.ClassName,
            section: item.SectionName,
            date: new Date(item.UploadDate).toLocaleDateString('en-GB'),
            by: item.EmployeeName || item.UserName || 'N/A'
        }));

        exportToExcel('NoticeBoard_Report', JSON.stringify(columns), JSON.stringify(content));
    };

    const handleExportPdf = () => {
        const columns = ['SL.NO', 'Title', 'Class', 'Section', 'Upload Date', 'By'];

        const content = filteredData.map((item, index) => [
            index + 1,
            item.Topic,
            item.ClassName,
            item.SectionName,
            new Date(item.UploadDate).toLocaleDateString('en-GB'),
            item.EmployeeName || item.UserName || 'N/A'
        ]);

        exportToPdf('NoticeBoard_Report', columns, content);
    };

    return (
        <div className='space-y-4'>
            <div className='flex flex-col items-center justify-between gap-4 md:flex-row'>
                <div className='flex items-center gap-2'>
                    <span className='font-medium text-sm'>Total Records:</span>
                    <span className='rounded-full bg-primary/10 px-2 py-1 font-bold text-primary text-xs'>{filteredData.length}</span>
                </div>
                <div className='relative flex max-w-sm flex-1'>
                    <Search className='-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground' />
                    <Input
                        placeholder='Search here...'
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                        }}
                        className='pl-9'
                    />
                </div>
                <div className='flex gap-2'>
                    <Button variant='outline' size='sm' onClick={handleExportExcel} className='flex items-center gap-2'>
                        <FileSpreadsheet className='h-4 w-4' /> Export
                    </Button>
                    <Button variant='outline' size='sm' onClick={handleExportPdf} className='flex items-center gap-2'>
                        <FileSpreadsheet className='h-4 w-4' /> PDF
                    </Button>
                    <Button variant='outline' size='sm' onClick={handlePrint} className='flex items-center gap-2'>
                        <Printer className='h-4 w-4' /> Print
                    </Button>
                </div>
            </div>

            <div className='overflow-hidden rounded-md border'>
                <Table>
                    <TableHeader className='bg-primary hover:bg-primary'>
                        <TableRow>
                            <TableHead className='text-white'>SL.NO</TableHead>
                            <TableHead className='text-white'>Title</TableHead>
                            <TableHead className='text-center text-white'>Class</TableHead>
                            <TableHead className='text-center text-white'>Upload Date</TableHead>
                            <TableHead className='text-center text-white'>Uploaded By</TableHead>
                            <TableHead className='text-center text-white'>View Attachment</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedData.map((item, index) => (
                            <TableRow key={`${item.Id}-${index}`}>
                                <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                                <TableCell className='font-medium'>{item.Topic}</TableCell>
                                <TableCell className='text-center'>{item.ClassName}</TableCell>
                                <TableCell className='text-center'>{new Date(item.UploadDate).toLocaleDateString('en-GB')}</TableCell>
                                <TableCell className='text-center'>{item.EmployeeName || item.UserName || 'N/A'}</TableCell>
                                <TableCell className='text-center'>
                                    {item.Filepath ? (
                                        <Button
                                            variant='ghost'
                                            size='sm'
                                            onClick={() => onViewAttachment(item)}
                                            className='mx-auto flex items-center gap-1 text-primary hover:bg-primary/10 hover:text-primary'>
                                            <Eye className='h-4 w-4' /> View
                                        </Button>
                                    ) : (
                                        <span className='text-muted-foreground text-xs'>---</span>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredData.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className='h-24 text-center'>
                                    No records found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {totalPages > 1 && (
                <div className='mt-4 flex items-center justify-center space-x-2'>
                    <Button
                        variant='outline'
                        size='sm'
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}>
                        <ChevronLeft className='mr-1 h-4 w-4' /> Previous
                    </Button>
                    <div className='font-medium text-sm'>
                        Page {currentPage} of {totalPages}
                    </div>
                    <Button
                        variant='outline'
                        size='sm'
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}>
                        Next <ChevronRight className='ml-1 h-4 w-4' />
                    </Button>
                </div>
            )}
        </div>
    );
}
