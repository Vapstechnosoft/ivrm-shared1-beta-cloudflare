'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronLeft, ChevronRight, Eye, FileText, Info, Search } from 'lucide-react';
import { useState } from 'react';

interface NdaStudentTcDetailsTableProps {
    data: any[];
    onViewPdf: (student: any) => void;
    onViewStatus: (student: any) => void;
}

export function NdaStudentTcDetailsTable({ data, onViewPdf, onViewStatus }: NdaStudentTcDetailsTableProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredData = data.filter(
        (s) =>
            s.StudentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.AMST_AdmNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.ASMCL_ClassName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleSearch = (val: string) => {
        setSearchTerm(val);
        setCurrentPage(1);
    };

    return (
        <div className='space-y-6'>
            <div className='flex flex-col items-center justify-between gap-6 rounded-3xl border border-slate-100 bg-slate-50 p-6 shadow-inner md:flex-row'>
                <div className='flex items-center gap-4'>
                    <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-indigo-100 shadow-lg'>
                        <FileText className='h-6 w-6' />
                    </div>
                    <div>
                        <h4 className='font-black text-indigo-950 text-xl uppercase tracking-tight'>Approved TC Details</h4>
                        <p className='font-medium text-slate-500 text-sm italic'>Listing official records of generated certificates.</p>
                    </div>
                </div>
                <div className='group relative w-full md:w-80'>
                    <Search className='-translate-y-1/2 absolute top-1/2 left-3 h-5 w-5 text-slate-400 transition-colors group-focus-within:text-indigo-600' />
                    <Input
                        placeholder='Search records...'
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className='h-12 rounded-2xl border-slate-200 bg-white pl-11 shadow-sm ring-1 ring-slate-100 focus:ring-indigo-500/20'
                    />
                </div>
            </div>

            <div className='overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl ring-1 ring-slate-100'>
                <Table>
                    <TableHeader className='bg-slate-50/50'>
                        <TableRow className='border-slate-200 border-b'>
                            <TableHead className='w-16 text-center font-bold text-slate-700'>SL.</TableHead>
                            <TableHead className='font-bold text-slate-700'>Student Name</TableHead>
                            <TableHead className='font-bold text-slate-700'>Adm No.</TableHead>
                            <TableHead className='font-bold text-slate-700'>Class (Section)</TableHead>
                            <TableHead className='w-32 text-center font-bold text-slate-700'>View Status</TableHead>
                            <TableHead className='w-32 text-center font-bold text-slate-700'>View PDF</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedData.length > 0 ? (
                            paginatedData.map((s, index) => (
                                <TableRow
                                    key={s.AMST_Id}
                                    className='group border-slate-100 border-b transition-colors last:border-none hover:bg-indigo-50/30'>
                                    <TableCell className='text-center font-black text-slate-400'>
                                        {(currentPage - 1) * itemsPerPage + index + 1}
                                    </TableCell>
                                    <TableCell className='font-black text-slate-900 transition-colors group-hover:text-indigo-600'>
                                        {s.StudentName}
                                    </TableCell>
                                    <TableCell className='font-bold text-indigo-700'>{s.AMST_AdmNo}</TableCell>
                                    <TableCell className='font-medium text-slate-600'>
                                        {s.ASMCL_ClassName} ({s.ASMC_SectionName})
                                    </TableCell>
                                    <TableCell className='text-center'>
                                        <Button
                                            variant='ghost'
                                            size='icon'
                                            onClick={() => onViewStatus(s)}
                                            className='rounded-xl text-slate-400 transition-all hover:bg-indigo-50 hover:text-indigo-600'
                                            title='View Approval Status'>
                                            <Info className='h-5 w-5' />
                                        </Button>
                                    </TableCell>
                                    <TableCell className='text-center'>
                                        <Button
                                            variant='outline'
                                            size='icon'
                                            onClick={() => onViewPdf(s)}
                                            className='rounded-xl border-indigo-100 text-indigo-600 shadow-sm transition-all hover:bg-indigo-600 hover:text-white hover:shadow-indigo-100'
                                            title='View Certificate PDF'>
                                            <Eye className='h-5 w-5' />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className='h-40 text-center'>
                                    <div className='flex flex-col items-center justify-center space-y-2 opacity-30'>
                                        <FileText className='h-12 w-12' />
                                        <p className='font-bold text-lg'>No records found Matching your search.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {totalPages > 1 && (
                <div className='flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-6 py-4'>
                    <p className='font-bold text-slate-500 text-sm uppercase tracking-widest'>
                        Page <span className='text-indigo-600'>{currentPage}</span> of {totalPages}
                    </p>
                    <div className='flex gap-2'>
                        <Button
                            variant='outline'
                            size='icon'
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((p) => p - 1)}
                            className='rounded-xl border-slate-200 shadow-sm hover:bg-white'>
                            <ChevronLeft className='h-4 w-4' />
                        </Button>
                        <Button
                            variant='outline'
                            size='icon'
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage((p) => p + 1)}
                            className='rounded-xl border-slate-200 shadow-sm hover:bg-white'>
                            <ChevronRight className='h-4 w-4' />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
