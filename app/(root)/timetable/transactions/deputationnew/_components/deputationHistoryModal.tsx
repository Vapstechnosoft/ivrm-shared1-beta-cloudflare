'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useDeputationNewViewAbsent, useDeputationNewViewDeputation } from '@/hooks/timetable/useDeputationNew';
import type { IDeputationHistoryRecord } from '@/types/timetable/Transaction/deputationnew';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, FileText, Loader2, Search, UserCheck, UserMinus } from 'lucide-react';
import { useMemo, useState } from 'react';

interface DeputationHistoryModalProps {
    open: boolean;
    onClose: () => void;
    mode: 'deputation' | 'absent';
    asmaY_Id: number;
    hrmE_Id: number;
    staffName?: string;
    dateStr?: string;
}

export default function DeputationHistoryModal({
    open,
    onClose,
    mode,
    asmaY_Id,
    hrmE_Id,
    staffName,
    dateStr = ''
}: DeputationHistoryModalProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const isDeputation = mode === 'deputation';

    // Query 1: View Deputation Records
    const { data: deputationData, isLoading: depLoading } = useDeputationNewViewDeputation(
        {
            ASMAY_Id: asmaY_Id,
            HRME_Id: hrmE_Id,
            FLAG: '1',
            TTSD_Date: dateStr
        },
        open && isDeputation && !!asmaY_Id && !!hrmE_Id
    );

    // Query 2: View Absent Records
    const { data: absentData, isLoading: absLoading } = useDeputationNewViewAbsent(
        {
            ASMAY_Id: asmaY_Id,
            HRME_Id: hrmE_Id,
            FLAG: '1',
            TTSD_Date: dateStr
        },
        open && !isDeputation && !!asmaY_Id && !!hrmE_Id
    );

    const isLoading = isDeputation ? depLoading : absLoading;
    const rawData = isDeputation ? deputationData : absentData;
    const payload = rawData?.data !== undefined ? rawData.data : rawData;

    const records: IDeputationHistoryRecord[] = useMemo(() => {
        return payload?.dptdetails || payload?.dptdetails1 || [];
    }, [payload]);

    const filteredRecords = useMemo(() => {
        if (!searchQuery) return records;
        const q = searchQuery.toLowerCase();
        return records.filter((r) => {
            const dateStrFormatted = r.TTSD_Date ? format(new Date(r.TTSD_Date), 'dd/MM/yyyy') : '';
            return (
                dateStrFormatted.includes(q) ||
                (r.ASMCL_ClassName || '').toLowerCase().includes(q) ||
                (r.ASMC_SectionName || '').toLowerCase().includes(q) ||
                (r.TTMD_DayName || '').toLowerCase().includes(q) ||
                (r.TTMP_PeriodName || '').toLowerCase().includes(q) ||
                (r.EMPNAME || '').toLowerCase().includes(q) ||
                (r.TTSD_Remarks || '').toLowerCase().includes(q)
            );
        });
    }, [records, searchQuery]);

    const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
    const paginatedRecords = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filteredRecords.slice(start, start + pageSize);
    }, [filteredRecords, page, pageSize]);

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className='max-w-4xl rounded-2xl p-6'>
                <DialogHeader>
                    <div className='flex items-center gap-3'>
                        <div
                            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                                isDeputation ? 'bg-purple-50 text-purple-600' : 'bg-amber-50 text-amber-600'
                            }`}>
                            {isDeputation ? <UserCheck className='h-5 w-5' /> : <UserMinus className='h-5 w-5' />}
                        </div>
                        <div>
                            <DialogTitle className='font-bold text-base text-slate-900'>
                                {staffName} - {isDeputation ? 'Deputation Details' : 'Absent Details'}
                            </DialogTitle>
                            <DialogDescription className='text-slate-500 text-xs'>
                                {isDeputation
                                    ? 'History of periods deputed to this staff member'
                                    : 'Historical absence records for this staff member'}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {/* Filter and Search Bar */}
                <div className='flex items-center justify-between gap-4 py-2'>
                    <div className='relative w-72'>
                        <Search className='absolute top-2.5 left-3 h-4 w-4 text-slate-400' />
                        <Input
                            placeholder='Search records...'
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setPage(1);
                            }}
                            className='h-9 rounded-xl pl-9 text-xs'
                        />
                    </div>
                    <div className='font-semibold text-slate-500 text-xs'>Total: {filteredRecords.length} records</div>
                </div>

                {/* Table Container */}
                <div className='max-h-[50vh] overflow-auto rounded-xl border border-slate-200'>
                    {isLoading ? (
                        <div className='flex h-48 flex-col items-center justify-center gap-2 text-slate-500'>
                            <Loader2 className='h-6 w-6 animate-spin text-purple-600' />
                            <span className='font-medium text-xs'>Loading records...</span>
                        </div>
                    ) : filteredRecords.length === 0 ? (
                        <div className='flex h-48 flex-col items-center justify-center gap-2 text-slate-400'>
                            <FileText className='h-8 w-8 stroke-1 text-slate-300' />
                            <span className='font-medium text-xs'>No history records found.</span>
                        </div>
                    ) : (
                        <Table className='border-collapse text-xs'>
                            <TableHeader className='bg-slate-50'>
                                <TableRow>
                                    <TableHead className='w-12 text-center font-bold text-slate-700'>SL</TableHead>
                                    <TableHead className='font-bold text-slate-700'>DATE</TableHead>
                                    <TableHead className='font-bold text-slate-700'>CLASS</TableHead>
                                    <TableHead className='font-bold text-slate-700'>SEC</TableHead>
                                    <TableHead className='font-bold text-slate-700'>DAY</TableHead>
                                    <TableHead className='font-bold text-slate-700'>PERIOD</TableHead>
                                    <TableHead className='font-bold text-slate-700'>
                                        {isDeputation ? 'ABSENT STAFF' : 'SUBSTITUTE STAFF'}
                                    </TableHead>
                                    <TableHead className='font-bold text-slate-700'>REMARKS</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedRecords.map((r, idx) => (
                                    <TableRow key={idx} className='hover:bg-slate-50/80'>
                                        <TableCell className='text-center font-medium text-slate-500'>
                                            {(page - 1) * pageSize + idx + 1}
                                        </TableCell>
                                        <TableCell className='font-semibold text-slate-800'>
                                            {r.TTSD_Date ? format(new Date(r.TTSD_Date), 'dd/MM/yyyy') : '-'}
                                        </TableCell>
                                        <TableCell>{r.ASMCL_ClassName || '-'}</TableCell>
                                        <TableCell>{r.ASMC_SectionName || '-'}</TableCell>
                                        <TableCell>{r.TTMD_DayName || '-'}</TableCell>
                                        <TableCell className='font-semibold text-purple-700'>{r.TTMP_PeriodName || '-'}</TableCell>
                                        <TableCell className='font-medium text-slate-700'>{r.EMPNAME || '-'}</TableCell>
                                        <TableCell className='max-w-[160px] truncate text-slate-500'>{r.TTSD_Remarks || '-'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>

                {/* Pagination Controls */}
                <div className='flex items-center justify-between pt-2'>
                    <div className='text-slate-500 text-xs'>
                        Page {page} of {totalPages}
                    </div>
                    <div className='flex gap-1.5'>
                        <Button
                            variant='outline'
                            size='sm'
                            disabled={page <= 1}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            className='h-8 rounded-lg px-2 text-xs'>
                            <ChevronLeft className='h-3.5 w-3.5' />
                        </Button>
                        <Button
                            variant='outline'
                            size='sm'
                            disabled={page >= totalPages}
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            className='h-8 rounded-lg px-2 text-xs'>
                            <ChevronRight className='h-3.5 w-3.5' />
                        </Button>
                    </div>
                </div>

                <DialogFooter className='pt-2'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={onClose}
                        className='h-9 rounded-xl border-slate-200 font-semibold text-xs'>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
