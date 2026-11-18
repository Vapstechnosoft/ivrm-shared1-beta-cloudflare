'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { AttendanceRecord } from '@/schemas/college/college-overall-daily-attendance-report.schema';
import { ArrowUpDown, CheckCircle2, Eye, GraduationCap, Search, TrendingUp, UserX, Users, X } from 'lucide-react';
import { useMemo, useState } from 'react';

interface ReportGridProps {
    records: AttendanceRecord[];
    selectedRowIds: Set<string | number>;
    onToggleSelectRow: (record: AttendanceRecord, rowId: string | number) => void;
    onToggleSelectAll: (checked: boolean, filteredRecords: AttendanceRecord[]) => void;
    onViewDetails: (record: AttendanceRecord) => void;
    onExport?: () => void;
}

type SortField = 'sno' | 'AMB_BranchName' | 'AMSE_SEMName' | 'TOTAL' | 'PRESENT' | 'ABSENT';

export function ReportGrid({ records, selectedRowIds, onToggleSelectRow, onToggleSelectAll, onViewDetails, onExport }: ReportGridProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortField, setSortField] = useState<SortField>('AMB_BranchName');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Calculate overall stats
    const stats = useMemo(() => {
        let totalStrength = 0;
        let totalPresent = 0;
        let totalAbsent = 0;

        records.forEach((r) => {
            totalStrength += Number(r.TOTAL) || 0;
            totalPresent += Number(r.PRESENT) || 0;
            totalAbsent += Number(r.ABSENT) || 0;
        });

        const attendanceRate = totalStrength > 0 ? ((totalPresent / totalStrength) * 100).toFixed(1) : '0';

        return { totalStrength, totalPresent, totalAbsent, attendanceRate };
    }, [records]);

    // Filtering
    const filteredRecords = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return records;

        return records.filter((r) => {
            const branch = (r.AMB_BranchName || '').toLowerCase();
            const sem = (r.AMSE_SEMName || '').toLowerCase();
            const total = String(r.TOTAL || '');
            const present = String(r.PRESENT || '');
            const absent = String(r.ABSENT || '');

            return (
                branch.includes(query) || sem.includes(query) || total.includes(query) || present.includes(query) || absent.includes(query)
            );
        });
    }, [records, searchQuery]);

    // Sorting
    const sortedRecords = useMemo(() => {
        return [...filteredRecords].sort((a, b) => {
            let valA: any = a[sortField as keyof AttendanceRecord] ?? '';
            let valB: any = b[sortField as keyof AttendanceRecord] ?? '';

            if (sortField === 'TOTAL' || sortField === 'PRESENT' || sortField === 'ABSENT') {
                valA = Number(valA) || 0;
                valB = Number(valB) || 0;
                return sortDirection === 'asc' ? valA - valB : valB - valA;
            }

            valA = String(valA).toLowerCase();
            valB = String(valB).toLowerCase();

            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredRecords, sortField, sortDirection]);

    // Pagination
    const totalPages = Math.ceil(sortedRecords.length / itemsPerPage) || 1;
    const paginatedRecords = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return sortedRecords.slice(start, start + itemsPerPage);
    }, [sortedRecords, currentPage, itemsPerPage]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const isAllSelected = filteredRecords.length > 0 && filteredRecords.every((r, idx) => selectedRowIds.has(r.Id ?? idx));

    return (
        <div className='space-y-6'>
            {/* High-level Metric Cards */}
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                <Card className='rounded-2xl border-slate-200/90 bg-gradient-to-br from-blue-50/70 via-white to-blue-50/30 shadow-sm'>
                    <CardHeader className='flex flex-row items-center justify-between pb-2'>
                        <CardTitle className='font-semibold text-blue-900 text-xs uppercase tracking-wider'>Total Strength</CardTitle>
                        <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600'>
                            <Users className='h-5 w-5' />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className='font-extrabold text-2xl text-blue-950 sm:text-3xl'>{stats.totalStrength.toLocaleString()}</div>
                        <p className='mt-1 font-medium text-blue-600/80 text-xs'>Across all branches & semesters</p>
                    </CardContent>
                </Card>

                <Card className='rounded-2xl border-slate-200/90 bg-gradient-to-br from-emerald-50/70 via-white to-emerald-50/30 shadow-sm'>
                    <CardHeader className='flex flex-row items-center justify-between pb-2'>
                        <CardTitle className='font-semibold text-emerald-900 text-xs uppercase tracking-wider'>Total Present</CardTitle>
                        <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600'>
                            <CheckCircle2 className='h-5 w-5' />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className='font-extrabold text-2xl text-emerald-950 sm:text-3xl'>{stats.totalPresent.toLocaleString()}</div>
                        <p className='mt-1 font-medium text-emerald-600/80 text-xs'>Students present today</p>
                    </CardContent>
                </Card>

                <Card className='rounded-2xl border-slate-200/90 bg-gradient-to-br from-rose-50/70 via-white to-rose-50/30 shadow-sm'>
                    <CardHeader className='flex flex-row items-center justify-between pb-2'>
                        <CardTitle className='font-semibold text-rose-900 text-xs uppercase tracking-wider'>Total Absent</CardTitle>
                        <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-600'>
                            <UserX className='h-5 w-5' />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className='font-extrabold text-2xl text-rose-950 sm:text-3xl'>{stats.totalAbsent.toLocaleString()}</div>
                        <p className='mt-1 font-medium text-rose-600/80 text-xs'>Students absent today</p>
                    </CardContent>
                </Card>

                <Card className='rounded-2xl border-slate-200/90 bg-gradient-to-br from-indigo-50/70 via-white to-indigo-50/30 shadow-sm'>
                    <CardHeader className='flex flex-row items-center justify-between pb-2'>
                        <CardTitle className='font-semibold text-indigo-900 text-xs uppercase tracking-wider'>Attendance Rate</CardTitle>
                        <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600'>
                            <TrendingUp className='h-5 w-5' />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className='font-extrabold text-2xl text-indigo-950 sm:text-3xl'>{stats.attendanceRate}%</div>
                        <p className='mt-1 font-medium text-indigo-600/80 text-xs'>Overall daily presence</p>
                    </CardContent>
                </Card>
            </div>

            {/* Table Card */}
            <Card className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md'>
                <CardHeader className='border-slate-100 border-b bg-slate-50/50 p-5 sm:p-6'>
                    <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
                        <div className='space-y-1'>
                            <CardTitle className='flex items-center gap-2 font-bold text-lg text-slate-800'>
                                <GraduationCap className='h-5 w-5 text-primary' />
                                College Overall Daily Attendance Report
                            </CardTitle>
                            <div className='flex flex-wrap items-center gap-2 text-slate-500 text-xs'>
                                <Badge variant='outline' className='rounded-md'>
                                    Total Grid Records: <strong className='ml-1 text-slate-900'>{records.length}</strong>
                                </Badge>
                                {searchQuery && (
                                    <Badge variant='secondary' className='rounded-md'>
                                        Total Records Searched: <strong className='ml-1 text-primary'>{filteredRecords.length}</strong>
                                    </Badge>
                                )}
                                <Badge variant='default' className='rounded-md bg-indigo-600'>
                                    Selected for Export: <strong className='ml-1 text-white'>{selectedRowIds.size}</strong>
                                </Badge>
                            </div>
                        </div>

                        {/* Search and Action Bar */}
                        <div className='flex flex-wrap items-center gap-2'>
                            <div className='relative w-full sm:w-64'>
                                <Search className='absolute top-2.5 left-2.5 h-4 w-4 text-slate-400' />
                                <Input
                                    placeholder='Search here...'
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className='h-9 rounded-xl border-slate-200 pl-9 text-sm'
                                />
                                {searchQuery && (
                                    <button
                                        type='button'
                                        onClick={() => setSearchQuery('')}
                                        className='absolute top-2.5 right-2.5 text-slate-400 hover:text-slate-600'>
                                        <X className='h-4 w-4' />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className='p-0'>
                    <div className='overflow-x-auto'>
                        <Table id='table1'>
                            <TableHeader className='bg-slate-50'>
                                <TableRow className='hover:bg-transparent'>
                                    <TableHead className='w-12 text-center'>
                                        <Checkbox
                                            checked={isAllSelected}
                                            onCheckedChange={(checked) => onToggleSelectAll(Boolean(checked), filteredRecords)}
                                            aria-label='Select all rows'
                                        />
                                    </TableHead>
                                    <TableHead className='w-16 text-center font-bold text-slate-700 text-xs'>SL. No.</TableHead>
                                    <TableHead
                                        className='cursor-pointer select-none font-bold text-slate-700 text-xs hover:text-slate-900'
                                        onClick={() => handleSort('AMB_BranchName')}>
                                        <div className='flex items-center gap-1'>
                                            <span>Branch</span>
                                            <ArrowUpDown className='h-3.5 w-3.5 text-slate-400' />
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className='cursor-pointer select-none font-bold text-slate-700 text-xs hover:text-slate-900'
                                        onClick={() => handleSort('AMSE_SEMName')}>
                                        <div className='flex items-center gap-1'>
                                            <span>Sem</span>
                                            <ArrowUpDown className='h-3.5 w-3.5 text-slate-400' />
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className='cursor-pointer select-none text-center font-bold text-slate-700 text-xs hover:text-slate-900'
                                        onClick={() => handleSort('TOTAL')}>
                                        <div className='flex items-center justify-center gap-1'>
                                            <span>Total</span>
                                            <ArrowUpDown className='h-3.5 w-3.5 text-slate-400' />
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className='cursor-pointer select-none text-center font-bold text-slate-700 text-xs hover:text-slate-900'
                                        onClick={() => handleSort('PRESENT')}>
                                        <div className='flex items-center justify-center gap-1'>
                                            <span>Present</span>
                                            <ArrowUpDown className='h-3.5 w-3.5 text-slate-400' />
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className='cursor-pointer select-none text-center font-bold text-slate-700 text-xs hover:text-slate-900'
                                        onClick={() => handleSort('ABSENT')}>
                                        <div className='flex items-center justify-center gap-1'>
                                            <span>Absent</span>
                                            <ArrowUpDown className='h-3.5 w-3.5 text-slate-400' />
                                        </div>
                                    </TableHead>
                                    <TableHead className='text-center font-bold text-slate-700 text-xs'>
                                        Name of Absentees and Teachers
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedRecords.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className='h-32 text-center text-slate-500 text-sm'>
                                            No records match your search query.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedRecords.map((user, index) => {
                                        const globalIdx = (currentPage - 1) * itemsPerPage + index;
                                        const rowId = user.Id ?? globalIdx;
                                        const isChecked = selectedRowIds.has(rowId);

                                        return (
                                            <TableRow
                                                key={rowId}
                                                className={`text-sm transition-colors hover:bg-slate-50/80 ${
                                                    isChecked ? 'bg-indigo-50/40' : ''
                                                }`}>
                                                <TableCell className='text-center'>
                                                    <Checkbox
                                                        checked={isChecked}
                                                        onCheckedChange={() => onToggleSelectRow(user, rowId)}
                                                        aria-label={`Select row ${globalIdx + 1}`}
                                                    />
                                                </TableCell>
                                                <TableCell className='text-center font-medium text-slate-600 text-xs'>
                                                    {globalIdx + 1}
                                                </TableCell>
                                                <TableCell className='font-semibold text-slate-900'>{user.AMB_BranchName}</TableCell>
                                                <TableCell className='text-slate-700'>{user.AMSE_SEMName}</TableCell>
                                                <TableCell className='text-center font-semibold text-slate-900'>{user.TOTAL}</TableCell>
                                                <TableCell className='text-center font-semibold text-emerald-600'>{user.PRESENT}</TableCell>
                                                <TableCell className='text-center font-semibold text-rose-600'>{user.ABSENT}</TableCell>
                                                <TableCell className='text-center'>
                                                    <Button
                                                        variant='ghost'
                                                        size='sm'
                                                        onClick={() => onViewDetails(user)}
                                                        className='h-8 gap-1.5 rounded-lg font-semibold text-primary text-xs hover:bg-primary/10 hover:text-primary/80'>
                                                        <span>Click to View Details</span>
                                                        <Eye className='h-3.5 w-3.5' />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                            <TableFooter className='bg-slate-100 font-bold text-slate-900'>
                                <TableRow>
                                    <TableCell colSpan={4} className='text-center font-extrabold text-sm uppercase'>
                                        Total
                                    </TableCell>
                                    <TableCell className='text-center font-extrabold text-sm'>{stats.totalStrength}</TableCell>
                                    <TableCell className='text-center font-extrabold text-emerald-600 text-sm'>
                                        {stats.totalPresent}
                                    </TableCell>
                                    <TableCell className='text-center font-extrabold text-rose-600 text-sm'>{stats.totalAbsent}</TableCell>
                                    <TableCell className='text-center font-medium text-slate-500 text-xs'>
                                        Overall Rate: {stats.attendanceRate}%
                                    </TableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </div>

                    {/* Pagination Bar */}
                    <div className='flex flex-col items-center justify-between gap-4 border-slate-100 border-t p-4 text-slate-500 text-xs sm:flex-row'>
                        <div className='flex items-center gap-2'>
                            <span>Rows per page:</span>
                            <Select
                                value={String(itemsPerPage)}
                                onValueChange={(val) => {
                                    setItemsPerPage(Number(val));
                                    setCurrentPage(1);
                                }}>
                                <SelectTrigger className='h-8 w-16 rounded-lg border-slate-200 text-xs'>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className='rounded-lg'>
                                    <SelectItem value='10'>10</SelectItem>
                                    <SelectItem value='20'>20</SelectItem>
                                    <SelectItem value='50'>50</SelectItem>
                                    <SelectItem value='100'>100</SelectItem>
                                </SelectContent>
                            </Select>
                            <span className='ml-2'>
                                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                                {Math.min(currentPage * itemsPerPage, sortedRecords.length)} of {sortedRecords.length} entries
                            </span>
                        </div>

                        {totalPages > 1 && (
                            <div className='flex items-center gap-1.5'>
                                <Button
                                    variant='outline'
                                    size='sm'
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                    className='h-8 rounded-lg px-2.5 text-xs'>
                                    Previous
                                </Button>
                                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                    let pageNum = i + 1;
                                    if (totalPages > 5 && currentPage > 3) {
                                        pageNum = currentPage - 2 + i;
                                        if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                                    }
                                    return (
                                        <Button
                                            key={pageNum}
                                            variant={currentPage === pageNum ? 'default' : 'outline'}
                                            size='sm'
                                            onClick={() => setCurrentPage(pageNum)}
                                            className='h-8 w-8 rounded-lg p-0 text-xs'>
                                            {pageNum}
                                        </Button>
                                    );
                                })}
                                <Button
                                    variant='outline'
                                    size='sm'
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                                    className='h-8 rounded-lg px-2.5 text-xs'>
                                    Next
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
