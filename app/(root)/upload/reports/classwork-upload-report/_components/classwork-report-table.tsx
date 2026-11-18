'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { exportToExcel, exportToPdf } from '@/lib/export-to-file';
import type { IClassWorkReport } from '@/types/upload/reports/classwork-upload-report';
import { ChevronLeft, ChevronRight, Eye, FileSpreadsheet, Printer, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

interface ClassWorkReportTableProps {
    data: IClassWorkReport[];
    onViewAttachment: (item: IClassWorkReport) => void;
}

export function ClassWorkReportTable({ data, onViewAttachment }: ClassWorkReportTableProps) {
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
                    <title>ClassWork Upload Report</title>
                    <style>
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; font-family: 'Inter', sans-serif; }
                        th, td { border: 1px solid #e2e8f0; padding: 12px 8px; text-align: center; font-size: 11px; }
                        th { background-color: #0f172a; color: white; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; }
                        h2 { text-align: center; color: #0f172a; font-family: 'Inter', sans-serif; text-transform: uppercase; margin-bottom: 5px; }
                        p { text-align: center; color: #64748b; font-size: 12px; margin-top: 0; }
                        .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 10px; }
                        .slno { width: 40px; }
                    </style>
                </head>
                <body>
                    <h2>ClassWork Upload Report</h2>
                    <p>Generated for selected classes and date range</p>
                    <table>
                        <thead>
                            <tr>
                                <th class="slno">SL.NO</th>
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
                                    <td style="text-align: left; font-weight: 600;">${item.Topic}</td>
                                    <td>${item.ClassName}</td>
                                    <td>${item.SectionName}</td>
                                    <td>${item.SubjectName}</td>
                                    <td>${item.FileName || 'N/A'}</td>
                                    <td>${new Date(item.UploadDate).toLocaleDateString('en-GB')}</td>
                                    <td>${item.EmployeeName || item.UserName || 'N/A'}</td>
                                </tr>
                            `
                                )
                                .join('')}
                        </tbody>
                    </table>
                    <div class="footer">
                        Report generated on ${new Date().toLocaleString()} | IVRM Next Generation
                    </div>
                </body>
            </html>
        `;

        printWindow.document.write(content);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
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
            filename: item.FileName || 'N/A',
            date: new Date(item.UploadDate).toLocaleDateString('en-GB'),
            by: item.EmployeeName || item.UserName || 'N/A'
        }));

        exportToExcel('ClassWork_Upload_Report', JSON.stringify(columns), JSON.stringify(content));
    };

    const handleExportPdf = () => {
        const columns = ['SL.NO', 'Topic', 'Class', 'Section', 'Subject', 'File Name', 'Date', 'By'];

        const content = filteredData.map((item, index) => [
            index + 1,
            item.Topic,
            item.ClassName,
            item.SectionName,
            item.SubjectName,
            item.FileName || 'N/A',
            new Date(item.UploadDate).toLocaleDateString('en-GB'),
            item.EmployeeName || item.UserName || 'N/A'
        ]);

        exportToPdf('ClassWork_Upload_Report', columns, content);
    };

    return (
        <div className='space-y-6'>
            <div className='flex flex-col items-center justify-between gap-6 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 shadow-inner md:flex-row'>
                <div className='flex items-center gap-6'>
                    <div className='flex flex-col gap-0.5'>
                        <span className='font-black text-[10px] text-slate-400 uppercase tracking-widest'>Global Records</span>
                        <div className='flex items-center gap-2'>
                            <span className='font-black text-2xl text-slate-800 leading-none'>{data.length}</span>
                            <span className='rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 font-bold text-[10px] text-primary uppercase tracking-tighter shadow-sm'>
                                Total
                            </span>
                        </div>
                    </div>

                    {search && (
                        <div className='slide-in-from-left flex animate-in flex-col gap-0.5 duration-300'>
                            <span className='font-black text-[10px] text-amber-400 uppercase tracking-widest'>Search Results</span>
                            <div className='flex items-center gap-2'>
                                <span className='font-black text-2xl text-amber-500 leading-none'>{filteredData.length}</span>
                                <span className='rounded-full border border-amber-200 bg-amber-100 px-2 py-0.5 font-bold text-[10px] text-amber-600 uppercase tracking-tighter shadow-sm'>
                                    Found
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <div className='group relative flex max-w-sm flex-1'>
                    <div className='absolute inset-0 rounded-full bg-primary/5 opacity-0 blur transition-opacity group-focus-within:opacity-100' />
                    <Search className='-translate-y-1/2 absolute top-1/2 left-4 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-primary' />
                    <Input
                        placeholder='Search records across all columns...'
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                        }}
                        className='h-11 rounded-full border-slate-200 bg-white pl-11 font-medium transition-all placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10'
                    />
                </div>

                <div className='flex gap-3'>
                    <Button
                        variant='outline'
                        size='sm'
                        onClick={handleExportExcel}
                        className='flex h-11 items-center gap-2 rounded-full border-slate-200 px-5 font-bold text-[11px] uppercase tracking-widest shadow-sm transition-all hover:border-green-200 hover:bg-green-50 hover:text-green-600 active:scale-95'>
                        <FileSpreadsheet className='h-4 w-4' /> Export Excel
                    </Button>
                    <Button
                        variant='outline'
                        size='sm'
                        onClick={handleExportPdf}
                        className='flex h-11 items-center gap-2 rounded-full border-slate-200 px-5 font-bold text-[11px] uppercase tracking-widest shadow-sm transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600 active:scale-95'>
                        <FileSpreadsheet className='h-4 w-4' /> Export PDF
                    </Button>
                    <Button
                        variant='outline'
                        size='sm'
                        onClick={handlePrint}
                        className='flex h-11 items-center gap-2 rounded-full border-slate-200 px-5 font-bold text-[11px] uppercase tracking-widest shadow-sm transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 active:scale-95'>
                        <Printer className='h-4 w-4' /> Print Report
                    </Button>
                </div>
            </div>

            <div className='fade-in zoom-in-95 animate-in overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl duration-500'>
                <div className='overflow-x-auto'>
                    <Table>
                        <TableHeader className='border-none bg-slate-900'>
                            <TableRow className='border-none hover:bg-transparent'>
                                <TableHead className='h-14 px-4 text-center font-black text-[10px] text-white uppercase tracking-widest'>
                                    SL.NO
                                </TableHead>
                                <TableHead className='h-14 font-black text-[10px] text-white uppercase tracking-widest'>
                                    Topic Details
                                </TableHead>
                                <TableHead className='h-14 text-center font-black text-[10px] text-white uppercase tracking-widest'>
                                    Class / Section
                                </TableHead>
                                <TableHead className='h-14 text-center font-black text-[10px] text-white uppercase tracking-widest'>
                                    Subject
                                </TableHead>
                                <TableHead className='h-14 text-center font-black text-[10px] text-white uppercase tracking-widest'>
                                    File Metadata
                                </TableHead>
                                <TableHead className='h-14 text-center font-black text-[10px] text-white uppercase tracking-widest'>
                                    Upload Timeline
                                </TableHead>
                                <TableHead className='h-14 text-center font-black text-[10px] text-white uppercase tracking-widest'>
                                    Uploader Info
                                </TableHead>
                                <TableHead className='h-14 px-4 text-center font-black text-[10px] text-white uppercase tracking-widest'>
                                    Action
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedData.map((item, index) => (
                                <TableRow key={index} className='group border-slate-50 transition-all hover:bg-slate-50/80'>
                                    <TableCell className='text-center font-black text-slate-400 text-xs'>
                                        {(currentPage - 1) * itemsPerPage + index + 1}
                                    </TableCell>
                                    <TableCell className='py-5'>
                                        <div className='flex flex-col gap-0.5'>
                                            <span className='font-black text-slate-800 text-sm leading-tight tracking-tight transition-colors group-hover:text-primary'>
                                                {item.Topic}
                                            </span>
                                            <span className='font-bold text-[10px] text-slate-400 uppercase tracking-tighter'>
                                                Topic Title
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className='text-center'>
                                        <div className='inline-flex flex-col items-center'>
                                            <span className='rounded-full bg-slate-100 px-3 py-1 font-black text-slate-700 text-xs'>
                                                {item.ClassName}
                                            </span>
                                            <span className='mt-1 font-black text-[10px] text-slate-400 uppercase tracking-widest'>
                                                {item.SectionName}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className='text-center'>
                                        <span className='rounded-lg border border-primary/10 bg-primary/5 px-3 py-1 font-bold text-primary text-xs tracking-tight'>
                                            {item.SubjectName}
                                        </span>
                                    </TableCell>
                                    <TableCell className='text-center'>
                                        <div className='flex flex-col items-center gap-1'>
                                            <span
                                                className='max-w-[120px] truncate font-semibold text-slate-500 text-xs italic'
                                                title={item.FileName || 'No File'}>
                                                {item.FileName || 'N/A'}
                                            </span>
                                            {item.FileName && (
                                                <span className='rounded bg-slate-200 px-1.5 font-black text-[9px] text-slate-600 uppercase tracking-tighter'>
                                                    System File
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className='text-center'>
                                        <div className='flex flex-col items-center'>
                                            <span className='font-black text-slate-700 text-xs'>
                                                {new Date(item.UploadDate).toLocaleDateString('en-GB')}
                                            </span>
                                            <span className='font-bold text-[10px] text-slate-400 uppercase tracking-widest'>
                                                {new Date(item.UploadDate).toLocaleDateString('en-GB', { weekday: 'short' })}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className='text-center'>
                                        <div className='flex items-center justify-center gap-2'>
                                            <div className='flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-100 font-black text-[10px] text-slate-500 uppercase shadow-sm'>
                                                {(item.EmployeeName || item.UserName || 'U').charAt(0)}
                                            </div>
                                            <div className='flex flex-col items-start text-left'>
                                                <span className='font-black text-slate-700 text-xs leading-none'>
                                                    {item.EmployeeName || item.UserName || 'N/A'}
                                                </span>
                                                <span className='mt-1 font-bold text-[9px] text-slate-400 uppercase tracking-tighter'>
                                                    {item.EmployeeName ? 'Staff' : 'User'}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className='px-4 text-center'>
                                        {item.FileName || item.Filepath ? (
                                            <Button
                                                variant='ghost'
                                                size='sm'
                                                onClick={() => onViewAttachment(item)}
                                                className='h-9 w-20 rounded-full font-black text-[10px] text-primary uppercase tracking-widest shadow-sm transition-all hover:bg-primary hover:text-white hover:shadow-md active:scale-95'>
                                                <Eye className='mr-1 h-3.5 w-3.5' /> View
                                            </Button>
                                        ) : (
                                            <div className='flex h-9 items-center justify-center'>
                                                <span className='font-black text-[10px] text-slate-300 uppercase italic tracking-widest opacity-40'>
                                                    No Media
                                                </span>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredData.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8} className='h-80 text-center'>
                                        <div className='flex flex-col items-center justify-center space-y-6'>
                                            <div className='relative'>
                                                <div className='absolute inset-0 scale-150 rounded-full bg-slate-100 opacity-50 blur-2xl' />
                                                <div className='relative rounded-full border border-slate-50 bg-white p-8 shadow-2xl'>
                                                    <Search className='h-16 w-16 text-slate-200' />
                                                </div>
                                            </div>
                                            <div className='space-y-2'>
                                                <h3 className='font-black text-2xl text-slate-800 uppercase tracking-tight'>
                                                    No matching records
                                                </h3>
                                                <p className='mx-auto max-w-[300px] font-medium text-slate-400 text-sm leading-relaxed'>
                                                    We couldn't find any classwork records matching your current search criteria.
                                                </p>
                                            </div>
                                            <Button
                                                variant='outline'
                                                onClick={() => setSearch('')}
                                                className='h-11 rounded-full border-slate-200 px-8 font-black text-[11px] uppercase tracking-widest transition-all hover:bg-slate-50 active:scale-95'>
                                                Clear Search
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {totalPages > 1 && (
                <div className='slide-in-from-bottom mt-8 flex animate-in items-center justify-center gap-4 duration-500'>
                    <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className='flex h-11 items-center gap-2 rounded-full border border-slate-100 px-6 font-black text-[11px] uppercase tracking-widest transition-all hover:bg-slate-100 disabled:opacity-30'>
                        <ChevronLeft className='h-4 w-4' /> Previous
                    </Button>

                    <div className='flex h-11 items-center rounded-full border border-slate-100 bg-white px-6 shadow-sm'>
                        <span className='mr-2 font-black text-[11px] text-slate-400 uppercase tracking-widest'>Page</span>
                        <span className='rounded-full bg-primary/10 px-3 py-1 font-black text-primary text-sm'>{currentPage}</span>
                        <span className='ml-2 font-black text-[11px] text-slate-400 uppercase tracking-widest'>of {totalPages}</span>
                    </div>

                    <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className='flex h-11 items-center gap-2 rounded-full border border-slate-100 px-6 font-black text-[11px] uppercase tracking-widest transition-all hover:bg-slate-100 disabled:opacity-30'>
                        Next <ChevronRight className='h-4 w-4' />
                    </Button>
                </div>
            )}
        </div>
    );
}
