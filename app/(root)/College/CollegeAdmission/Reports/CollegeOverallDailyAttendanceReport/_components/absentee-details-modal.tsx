'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { exportToExcel } from '@/lib/utils';
import type { AbsenteeTeacherRecord, AttendanceRecord } from '@/schemas/college/college-overall-daily-attendance-report.schema';
import { format } from 'date-fns';
import { ArrowUpDown, Download, GraduationCap, Loader2, Search, UserCheck, X } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';

interface AbsenteeDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedRow: AttendanceRecord | null;
    academicYearName: string;
    selectedDate: Date | undefined;
    absenteeList: AbsenteeTeacherRecord[];
    isLoading: boolean;
}

export function AbsenteeDetailsModal({
    isOpen,
    onClose,
    selectedRow,
    academicYearName,
    selectedDate,
    absenteeList,
    isLoading
}: AbsenteeDetailsModalProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortField, setSortField] = useState<'Name' | 'EmployeeName'>('Name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Reset state when modal opens or selectedRow changes
    React.useEffect(() => {
        if (isOpen) {
            setSearchQuery('');
            setSelectedIds(new Set());
            setCurrentPage(1);
            setSortDirection('asc');
        }
    }, [isOpen, selectedRow]);

    const branchSemTitle = selectedRow ? `${selectedRow.AMB_BranchName} - ${selectedRow.AMSE_SEMName}` : '';

    const hasAbsentees = (absenteeList && absenteeList.length > 0) || (selectedRow ? (selectedRow.ABSENT || 0) > 0 : false);

    // Filter list
    const filteredList = useMemo(() => {
        if (!absenteeList) return [];
        return absenteeList.filter((item) => {
            const query = searchQuery.toLowerCase().trim();
            if (!query) return true;
            const nameMatch = (item.Name || '').toLowerCase().includes(query);
            const teacherMatch =
                (item.EmployeeName || '').toLowerCase().includes(query) ||
                (item.HRME_EmployeeFirstName || '').toLowerCase().includes(query);
            return nameMatch || teacherMatch;
        });
    }, [absenteeList, searchQuery]);

    // Sort list
    const sortedList = useMemo(() => {
        return [...filteredList].sort((a, b) => {
            let valA = '';
            let valB = '';
            if (sortField === 'Name') {
                valA = (a.Name || '').toLowerCase();
                valB = (b.Name || '').toLowerCase();
            } else {
                valA = (a.EmployeeName || a.HRME_EmployeeFirstName || '').toLowerCase();
                valB = (b.EmployeeName || b.HRME_EmployeeFirstName || '').toLowerCase();
            }

            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredList, sortField, sortDirection]);

    // Pagination
    const totalPages = Math.ceil(sortedList.length / itemsPerPage) || 1;
    const paginatedList = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return sortedList.slice(start, start + itemsPerPage);
    }, [sortedList, currentPage, itemsPerPage]);

    // Sorting toggle
    const handleSort = (field: 'Name' | 'EmployeeName') => {
        if (sortField === field) {
            setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // Selection handlers
    const isAllSelected = filteredList.length > 0 && filteredList.every((item, idx) => selectedIds.has(item.Id ?? idx));

    const handleToggleAll = (checked: boolean) => {
        const newSet = new Set<string | number>();
        if (checked) {
            filteredList.forEach((item, idx) => newSet.add(item.Id ?? idx));
        }
        setSelectedIds(newSet);
    };

    const handleToggleRow = (id: string | number) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    // Export to Excel
    const handleExport = () => {
        const recordsToExport = absenteeList.filter((item, idx) => selectedIds.has(item.Id ?? idx));

        if (recordsToExport.length === 0) {
            toast.warning('Please select records to be exported');
            return;
        }

        const exportData = recordsToExport.map((item, index) => ({
            'SL. No.': index + 1,
            'Absentees Names': item.Name || 'N/A',
            "Teacher's Names": item.EmployeeName || item.HRME_EmployeeFirstName || 'N/A'
        }));

        const filename = `Absentees_Teachers_${branchSemTitle.replace(/\s+/g, '_')}_${
            selectedDate ? format(selectedDate, 'dd_MM_yyyy') : 'report'
        }`;
        exportToExcel(exportData, filename);
        toast.success(`Exported ${recordsToExport.length} record(s) to Excel`);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className='flex max-h-[90vh] max-w-4xl flex-col gap-0 overflow-hidden rounded-2xl border border-slate-200 p-0 shadow-2xl'>
                {/* Header */}
                <DialogHeader className='shrink-0 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 text-white'>
                    <div className='flex items-center justify-between'>
                        <div className='space-y-1'>
                            <DialogTitle className='flex items-center gap-2 font-bold text-xl'>
                                <GraduationCap className='h-5 w-5 text-indigo-400' />
                                {hasAbsentees ? "Absentees and Teacher's Names Details" : "Absentees and Teacher's Names Are Not Available"}
                            </DialogTitle>
                            <DialogDescription className='text-slate-300 text-xs'>
                                Detailed absentee breakdown for {branchSemTitle || 'selected branch'}
                            </DialogDescription>
                        </div>
                    </div>

                    {/* Metadata Summary Chips */}
                    <div className='mt-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3 md:grid-cols-6'>
                        <div className='rounded-lg border border-white/10 bg-white/10 p-2 backdrop-blur'>
                            <span className='block font-semibold text-[10px] text-slate-400 uppercase'>Academic Year</span>
                            <span className='block truncate font-bold text-white'>{academicYearName || '-'}</span>
                        </div>
                        <div className='rounded-lg border border-white/10 bg-white/10 p-2 backdrop-blur'>
                            <span className='block font-semibold text-[10px] text-slate-400 uppercase'>Branch - Sem</span>
                            <span className='block truncate font-bold text-white'>{branchSemTitle || '-'}</span>
                        </div>
                        <div className='rounded-lg border border-white/10 bg-white/10 p-2 backdrop-blur'>
                            <span className='block font-semibold text-[10px] text-slate-400 uppercase'>Date</span>
                            <span className='block font-bold text-white'>{selectedDate ? format(selectedDate, 'dd-MM-yyyy') : '-'}</span>
                        </div>
                        <div className='rounded-lg border border-white/10 bg-white/10 p-2 backdrop-blur'>
                            <span className='block font-semibold text-[10px] text-slate-400 uppercase'>Total Strength</span>
                            <span className='block font-bold text-white'>{selectedRow?.TOTAL ?? 0}</span>
                        </div>
                        <div className='rounded-lg border border-emerald-400/30 bg-emerald-500/20 p-2 backdrop-blur'>
                            <span className='block font-semibold text-[10px] text-emerald-300 uppercase'>Present</span>
                            <span className='block font-bold text-emerald-200'>{selectedRow?.PRESENT ?? 0}</span>
                        </div>
                        <div className='rounded-lg border border-rose-400/30 bg-rose-500/20 p-2 backdrop-blur'>
                            <span className='block font-semibold text-[10px] text-rose-300 uppercase'>Absent</span>
                            <span className='block font-bold text-rose-200'>{selectedRow?.ABSENT ?? 0}</span>
                        </div>
                    </div>
                </DialogHeader>

                {/* Body */}
                <div className='flex-1 space-y-4 overflow-y-auto p-6'>
                    {isLoading ? (
                        <div className='flex flex-col items-center justify-center gap-3 py-16 text-slate-500'>
                            <Loader2 className='h-8 w-8 animate-spin text-primary' />
                            <p className='font-medium text-sm'>Loading absentee & teacher details...</p>
                        </div>
                    ) : absenteeList.length === 0 ? (
                        <div className='flex flex-col items-center justify-center space-y-3 py-16 text-center'>
                            <div className='flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600'>
                                <UserCheck className='h-8 w-8' />
                            </div>
                            <h4 className='font-semibold text-base text-slate-800'>100% Attendance / No Absentees Recorded</h4>
                            <p className='max-w-sm text-slate-500 text-xs'>
                                There are no student absentees recorded for this branch and semester on the selected date.
                            </p>
                        </div>
                    ) : (
                        <div className='space-y-3'>
                            {/* Search and Selection Toolbar */}
                            <div className='flex flex-col items-center justify-between gap-3 sm:flex-row'>
                                <div className='relative w-full sm:w-72'>
                                    <Search className='absolute top-2.5 left-2.5 h-4 w-4 text-slate-400' />
                                    <Input
                                        placeholder='Search absentee or teacher...'
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className='h-9 rounded-xl pl-9 text-sm'
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

                                <div className='flex w-full items-center justify-end gap-2 text-slate-600 text-xs sm:w-auto'>
                                    <Badge variant='outline' className='rounded-lg px-2.5 py-1 font-medium'>
                                        Total Absentees: <strong className='ml-1 text-slate-900'>{absenteeList.length}</strong>
                                    </Badge>
                                    <Badge variant='secondary' className='rounded-lg px-2.5 py-1 font-medium'>
                                        Selected: <strong className='ml-1 text-primary'>{selectedIds.size}</strong>
                                    </Badge>
                                </div>
                            </div>

                            {/* Table */}
                            <div className='overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm'>
                                <Table>
                                    <TableHeader className='bg-slate-50/80'>
                                        <TableRow className='hover:bg-transparent'>
                                            <TableHead className='w-12 text-center'>
                                                <Checkbox
                                                    checked={isAllSelected}
                                                    onCheckedChange={(checked) => handleToggleAll(Boolean(checked))}
                                                    aria-label='Select all'
                                                />
                                            </TableHead>
                                            <TableHead className='w-16 text-center font-bold text-slate-700 text-xs'>SL. No.</TableHead>
                                            <TableHead
                                                className='cursor-pointer select-none font-bold text-slate-700 text-xs hover:text-slate-900'
                                                onClick={() => handleSort('Name')}>
                                                <div className='flex items-center gap-1.5'>
                                                    <span>Absentees Names</span>
                                                    <ArrowUpDown className='h-3.5 w-3.5 text-slate-400' />
                                                </div>
                                            </TableHead>
                                            <TableHead
                                                className='cursor-pointer select-none font-bold text-slate-700 text-xs hover:text-slate-900'
                                                onClick={() => handleSort('EmployeeName')}>
                                                <div className='flex items-center gap-1.5'>
                                                    <span>Teacher&apos;s Names</span>
                                                    <ArrowUpDown className='h-3.5 w-3.5 text-slate-400' />
                                                </div>
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedList.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className='h-28 text-center text-slate-500 text-sm'>
                                                    No absentees match your search criteria.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            paginatedList.map((item, index) => {
                                                const globalIdx = (currentPage - 1) * itemsPerPage + index;
                                                const rowId = item.Id ?? globalIdx;
                                                const isChecked = selectedIds.has(rowId);

                                                return (
                                                    <TableRow
                                                        key={rowId}
                                                        className={`text-sm transition-colors hover:bg-slate-50/70 ${
                                                            isChecked ? 'bg-indigo-50/40' : ''
                                                        }`}>
                                                        <TableCell className='text-center'>
                                                            <Checkbox
                                                                checked={isChecked}
                                                                onCheckedChange={() => handleToggleRow(rowId)}
                                                                aria-label={`Select ${item.Name}`}
                                                            />
                                                        </TableCell>
                                                        <TableCell className='text-center font-medium text-slate-600 text-xs'>
                                                            {globalIdx + 1}
                                                        </TableCell>
                                                        <TableCell className='font-semibold text-slate-800'>
                                                            <div className='flex items-center gap-2'>
                                                                <span className='h-2 w-2 shrink-0 rounded-full bg-rose-500' />
                                                                <span>{item.Name || 'N/A'}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className='text-slate-700'>
                                                            {item.EmployeeName || item.HRME_EmployeeFirstName || (
                                                                <span className='text-slate-400 italic'>Not Assigned</span>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className='flex items-center justify-between pt-1 text-slate-500 text-xs'>
                                    <div>
                                        Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                                        {Math.min(currentPage * itemsPerPage, sortedList.length)} of {sortedList.length} entries
                                    </div>
                                    <div className='flex items-center gap-1.5'>
                                        <Button
                                            variant='outline'
                                            size='sm'
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                            className='h-8 rounded-lg px-2.5 text-xs'>
                                            Previous
                                        </Button>
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                            <Button
                                                key={page}
                                                variant={currentPage === page ? 'default' : 'outline'}
                                                size='sm'
                                                onClick={() => setCurrentPage(page)}
                                                className='h-8 w-8 rounded-lg p-0 text-xs'>
                                                {page}
                                            </Button>
                                        ))}
                                        <Button
                                            variant='outline'
                                            size='sm'
                                            disabled={currentPage === totalPages}
                                            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                                            className='h-8 rounded-lg px-2.5 text-xs'>
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <DialogFooter className='flex shrink-0 items-center gap-2 border-slate-200 border-t bg-slate-50 p-4 sm:justify-between'>
                    <div className='text-slate-500 text-xs'>
                        {hasAbsentees && (
                            <span>
                                {selectedIds.size} of {absenteeList.length} absentee(s) selected
                            </span>
                        )}
                    </div>
                    <div className='flex items-center gap-2'>
                        <Button variant='outline' onClick={onClose} className='rounded-xl px-4 font-semibold text-xs'>
                            Close
                        </Button>
                        {hasAbsentees && (
                            <Button
                                onClick={handleExport}
                                disabled={selectedIds.size === 0}
                                className='flex items-center gap-1.5 rounded-xl bg-primary px-4 font-semibold text-white text-xs shadow-sm hover:bg-primary/90'>
                                <Download className='h-3.5 w-3.5' />
                                Export Selected
                            </Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
