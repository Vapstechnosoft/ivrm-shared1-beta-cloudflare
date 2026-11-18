'use client';

import React, { useMemo, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { IClgSectionAllotmentStudent } from '@/types/college/transactions';

interface AllottedStudentsTableProps {
    title?: string;
    students: IClgSectionAllotmentStudent[];
    showRollNo?: boolean;
}

export function AllottedStudentsTable({
    title = 'Section Allotted Student List',
    students = [],
    showRollNo = false
}: AllottedStudentsTableProps) {
    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState<string>('studentName');
    const [sortAsc, setSortAsc] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filtered = useMemo(() => {
        let list = students.filter((s) => {
            const name = (s.studentName || `${s.amcsT_FirstName || ''} ${s.amcsT_LastName || ''}`).toLowerCase();
            const course = (s.amcO_CourseName || '').toLowerCase();
            const branch = (s.amB_BranchName || '').toLowerCase();
            const sem = (s.amsE_SEMName || '').toLowerCase();
            const sec = (s.acmS_SectionName || '').toLowerCase();
            const adm = (s.amcsT_AdmNo || '').toLowerCase();
            const roll = (s.acysT_RollNo?.toString() || '').toLowerCase();
            const term = search.toLowerCase();

            return (
                name.includes(term) ||
                course.includes(term) ||
                branch.includes(term) ||
                sem.includes(term) ||
                sec.includes(term) ||
                adm.includes(term) ||
                roll.includes(term)
            );
        });

        list.sort((a: any, b: any) => {
            const valA = (a[sortKey] || '').toString().toLowerCase();
            const valB = (b[sortKey] || '').toString().toLowerCase();
            if (valA < valB) return sortAsc ? -1 : 1;
            if (valA > valB) return sortAsc ? 1 : -1;
            return 0;
        });

        return list;
    }, [students, search, sortKey, sortAsc]);

    const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
    const paginated = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filtered.slice(start, start + itemsPerPage);
    }, [filtered, currentPage]);

    const handleSort = (key: string) => {
        if (sortKey === key) {
            setSortAsc(!sortAsc);
        } else {
            setSortKey(key);
            setSortAsc(true);
        }
    };

    if (students.length === 0) return null;

    return (
        <div className='mt-6 rounded-xl border border-border/80 bg-card p-5 shadow-sm space-y-4'>
            <div className='flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4'>
                <div className='flex items-center gap-3'>
                    <h3 className='font-semibold text-base tracking-tight text-foreground'>{title}</h3>
                    <div className='flex items-center gap-2'>
                        <Badge variant='outline' className='rounded-full px-2.5 py-0.5 text-xs font-semibold'>
                            Total: {students.length}
                        </Badge>
                        {search && (
                            <Badge variant='secondary' className='rounded-full px-2.5 py-0.5 text-xs font-semibold'>
                                Found: {filtered.length}
                            </Badge>
                        )}
                    </div>
                </div>

                <div className='relative w-full max-w-xs'>
                    <Search className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
                    <Input
                        placeholder='Search in table...'
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                        }}
                        className='h-9 pl-9 text-xs'
                    />
                </div>
            </div>

            <div className='overflow-x-auto rounded-lg border border-border/60 bg-background'>
                <Table>
                    <TableHeader className='bg-muted/70'>
                        <TableRow className='hover:bg-transparent'>
                            <TableHead className='w-12 text-center font-bold'>SL.NO</TableHead>
                            <TableHead
                                className='cursor-pointer font-bold'
                                onClick={() => handleSort('studentName')}>
                                <div className='flex items-center gap-1'>
                                    Student Name
                                    <ArrowUpDown className='h-3 w-3 text-muted-foreground' />
                                </div>
                            </TableHead>
                            <TableHead
                                className='cursor-pointer font-bold'
                                onClick={() => handleSort('amcsT_AdmNo')}>
                                <div className='flex items-center gap-1'>
                                    Adm. No.
                                    <ArrowUpDown className='h-3 w-3 text-muted-foreground' />
                                </div>
                            </TableHead>
                            <TableHead
                                className='cursor-pointer font-bold'
                                onClick={() => handleSort('amcO_CourseName')}>
                                <div className='flex items-center gap-1'>
                                    Course
                                    <ArrowUpDown className='h-3 w-3 text-muted-foreground' />
                                </div>
                            </TableHead>
                            <TableHead
                                className='cursor-pointer font-bold'
                                onClick={() => handleSort('amB_BranchName')}>
                                <div className='flex items-center gap-1'>
                                    Branch
                                    <ArrowUpDown className='h-3 w-3 text-muted-foreground' />
                                </div>
                            </TableHead>
                            <TableHead
                                className='cursor-pointer font-bold'
                                onClick={() => handleSort('amsE_SEMName')}>
                                <div className='flex items-center gap-1'>
                                    Semester
                                    <ArrowUpDown className='h-3 w-3 text-muted-foreground' />
                                </div>
                            </TableHead>
                            <TableHead
                                className='cursor-pointer font-bold'
                                onClick={() => handleSort('acmS_SectionName')}>
                                <div className='flex items-center gap-1'>
                                    Section Name
                                    <ArrowUpDown className='h-3 w-3 text-muted-foreground' />
                                </div>
                            </TableHead>
                            {showRollNo && (
                                <TableHead
                                    className='cursor-pointer font-bold'
                                    onClick={() => handleSort('acysT_RollNo')}>
                                    <div className='flex items-center gap-1'>
                                        Roll No
                                        <ArrowUpDown className='h-3 w-3 text-muted-foreground' />
                                    </div>
                                </TableHead>
                            )}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginated.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={showRollNo ? 8 : 7} className='h-24 text-center text-muted-foreground text-xs'>
                                    No records found
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginated.map((student, idx) => (
                                <TableRow key={idx} className='hover:bg-muted/40 transition-colors'>
                                    <TableCell className='text-center text-xs text-muted-foreground'>
                                        {(currentPage - 1) * itemsPerPage + idx + 1}
                                    </TableCell>
                                    <TableCell className='font-medium text-xs text-foreground'>
                                        {student.studentName ||
                                            [student.amcsT_FirstName, student.amcsT_MiddleName, student.amcsT_LastName]
                                                .filter(Boolean)
                                                .join(' ')}
                                    </TableCell>
                                    <TableCell className='font-mono text-xs text-muted-foreground'>
                                        {student.amcsT_AdmNo || '-'}
                                    </TableCell>
                                    <TableCell className='text-xs'>{student.amcO_CourseName || '-'}</TableCell>
                                    <TableCell className='text-xs'>{student.amB_BranchName || '-'}</TableCell>
                                    <TableCell className='text-xs'>{student.amsE_SEMName || '-'}</TableCell>
                                    <TableCell className='text-xs'>
                                        <Badge variant='secondary' className='font-medium'>
                                            {student.acmS_SectionName || '-'}
                                        </Badge>
                                    </TableCell>
                                    {showRollNo && (
                                        <TableCell className='font-semibold text-xs text-foreground'>
                                            {student.acysT_RollNo || '-'}
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className='flex items-center justify-between pt-2'>
                    <span className='text-xs text-muted-foreground'>
                        Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                        {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} entries
                    </span>
                    <div className='flex items-center gap-1'>
                        <Button
                            variant='outline'
                            size='sm'
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                            className='h-8 w-8 p-0'>
                            <ChevronLeft className='h-4 w-4' />
                        </Button>
                        <span className='px-2 text-xs font-medium'>
                            {currentPage} / {totalPages}
                        </span>
                        <Button
                            variant='outline'
                            size='sm'
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                            className='h-8 w-8 p-0'>
                            <ChevronRight className='h-4 w-4' />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
