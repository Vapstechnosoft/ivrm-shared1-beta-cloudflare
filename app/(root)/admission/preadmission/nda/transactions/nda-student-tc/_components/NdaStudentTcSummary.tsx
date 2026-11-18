'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Eye, FileText, Info, Search } from 'lucide-react';
import { useState } from 'react';

interface NdaStudentTcSummaryProps {
    summaryList: any[];
    onViewPdf: (student: any) => void;
    onViewStatus: (student: any) => void;
    itemsPerPage?: number;
}

export function NdaStudentTcSummary({ summaryList, onViewPdf, onViewStatus, itemsPerPage = 10 }: NdaStudentTcSummaryProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const filteredList = summaryList.filter((s) => {
        const name = (s.StudentName ?? s.studentname ?? '').toLowerCase();
        const admNo = (s.AMST_AdmNo ?? s.amst_admno ?? '').toString().toLowerCase();
        const term = searchTerm.toLowerCase();
        return name.includes(term) || admNo.includes(term);
    });

    const totalPages = Math.ceil(filteredList.length / itemsPerPage);
    const startIdx = (currentPage - 1) * itemsPerPage;
    const currentItems = filteredList.slice(startIdx, startIdx + itemsPerPage);

    return (
        <div className='fade-in animate-in space-y-6 duration-700'>
            <div className='flex flex-col items-center justify-between gap-4 md:flex-row'>
                <h3 className='flex items-center gap-3 font-black text-slate-800 text-xl'>
                    <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600'>
                        <FileText className='h-5 w-5' />
                    </div>
                    STUDENT TC APPLY DETAILS
                </h3>
                <div className='relative w-full md:w-80'>
                    <Search className='-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-slate-400' />
                    <Input
                        placeholder='Search details...'
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className='h-11 rounded-2xl border-slate-200 bg-white pl-10 shadow-sm focus:ring-indigo-500'
                    />
                </div>
            </div>

            <div className='overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-slate-200/50 shadow-xl'>
                <div className='overflow-x-auto'>
                    <Table>
                        <TableHeader className='bg-slate-50/50 backdrop-blur-md'>
                            <TableRow className='h-14 border-slate-100 border-b'>
                                <TableHead className='w-20 text-center font-bold text-slate-600 text-xs uppercase tracking-wider'>
                                    SL.NO
                                </TableHead>
                                <TableHead className='font-bold text-slate-600 text-xs uppercase tracking-wider'>Student Name</TableHead>
                                <TableHead className='font-bold text-slate-600 text-xs uppercase tracking-wider'>Adm No.</TableHead>
                                <TableHead className='font-bold text-slate-600 text-xs uppercase tracking-wider'>Class</TableHead>
                                <TableHead className='font-bold text-slate-600 text-xs uppercase tracking-wider'>Section</TableHead>
                                <TableHead className='w-32 text-center font-bold text-slate-600 text-xs uppercase tracking-wider'>
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentItems.length > 0 ? (
                                currentItems.map((student, idx) => (
                                    <TableRow
                                        key={`${student.AMST_Id ?? student.amst_id}-${startIdx + idx}`}
                                        className='h-16 border-slate-50 border-b transition-colors hover:bg-indigo-50/30'>
                                        <TableCell className='text-center font-medium text-slate-400'>{startIdx + idx + 1}</TableCell>
                                        <TableCell className='font-bold text-slate-800'>
                                            {student.StudentName ?? student.studentname}
                                        </TableCell>
                                        <TableCell className='font-black text-indigo-600/80 tracking-wide'>
                                            {student.AMST_AdmNo ?? student.amst_admno}
                                        </TableCell>
                                        <TableCell className='font-medium text-slate-600'>
                                            {student.ASMCL_ClassName ?? student.asmcl_classname}
                                        </TableCell>
                                        <TableCell className='font-medium text-slate-600'>
                                            {student.ASMC_SectionName ?? student.asmc_sectionname}
                                        </TableCell>
                                        <TableCell className='text-center'>
                                            <div className='flex justify-center gap-2'>
                                                <Button
                                                    variant='ghost'
                                                    size='icon'
                                                    onClick={() => onViewStatus(student)}
                                                    title='View Status'
                                                    className='h-9 w-9 rounded-xl text-slate-400 shadow-sm transition-all hover:bg-amber-100 hover:text-amber-700'>
                                                    <Info className='h-4 w-4' />
                                                </Button>
                                                <Button
                                                    variant='ghost'
                                                    size='icon'
                                                    onClick={() => onViewPdf(student)}
                                                    title='View TC PDF'
                                                    className='h-9 w-9 rounded-xl border border-indigo-100 text-indigo-600 shadow-sm transition-all hover:bg-indigo-600 hover:text-white'>
                                                    <Eye className='h-4 w-4' />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className='h-40 text-center font-medium text-slate-400 italic'>
                                        {searchTerm ? 'No matching records found.' : 'No TC applications found.'}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {totalPages > 1 && (
                <div className='flex items-center justify-center gap-4 pt-4'>
                    <Button
                        variant='outline'
                        size='sm'
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className='h-10 rounded-xl border-slate-200 px-4 text-slate-600 hover:bg-white'>
                        <ChevronLeft className='mr-1 h-4 w-4' /> Previous
                    </Button>
                    <div className='flex gap-2'>
                        {Array.from({ length: totalPages }).map((_, i) => (
                            <Button
                                key={i}
                                variant={currentPage === i + 1 ? 'default' : 'ghost'}
                                size='sm'
                                onClick={() => setCurrentPage(i + 1)}
                                className={cn(
                                    'h-10 w-10 rounded-xl font-bold transition-all',
                                    currentPage === i + 1
                                        ? 'scale-110 bg-indigo-600 text-white shadow-indigo-100 shadow-lg'
                                        : 'text-slate-400 hover:bg-indigo-50 hover:text-indigo-600'
                                )}>
                                {i + 1}
                            </Button>
                        ))}
                    </div>
                    <Button
                        variant='outline'
                        size='sm'
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className='h-10 rounded-xl border-slate-200 px-4 text-slate-600 hover:bg-white'>
                        Next <ChevronRight className='ml-1 h-4 w-4' />
                    </Button>
                </div>
            )}
        </div>
    );
}
