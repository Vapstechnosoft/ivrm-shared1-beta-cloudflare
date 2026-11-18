'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useViewAbsent, useViewDeputation } from '@/hooks/timetable/useTransactions';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, History, Loader2, Search, UserMinus, UserPlus } from 'lucide-react';
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
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // View Deputation Query
    const { data: rawDeputationData, isLoading: deputationLoading } = useViewDeputation(
        {
            ASMAY_Id: asmaY_Id,
            HRME_Id: hrmE_Id,
            FLAG: '1',
            TTSD_Date: dateStr
        },
        open && mode === 'deputation' && !!asmaY_Id && !!hrmE_Id
    );

    // View Absent Query
    const { data: rawAbsentData, isLoading: absentLoading } = useViewAbsent(
        {
            ASMAY_Id: asmaY_Id,
            HRME_Id: hrmE_Id,
            FLAG: '1',
            TTSD_Date: dateStr
        },
        open && mode === 'absent' && !!asmaY_Id && !!hrmE_Id
    );

    const isLoading = mode === 'deputation' ? deputationLoading : absentLoading;
    const rawData = mode === 'deputation' ? rawDeputationData : rawAbsentData;
    const payload = rawData?.data !== undefined ? rawData.data : rawData;

    const list: any[] = useMemo(() => {
        return payload?.dptdetails || payload?.dptdetails1 || payload?.dptlist || (Array.isArray(payload) ? payload : []);
    }, [payload]);

    const filteredList = useMemo(() => {
        if (!searchTerm.trim()) return list;
        const q = searchTerm.toLowerCase();
        return list.filter((item) => {
            const dateVal = item.TTSD_Date ? format(new Date(item.TTSD_Date), 'dd/MM/yyyy') : '';
            const className = (item.ASMCL_ClassName || '').toLowerCase();
            const secName = (item.ASMC_SectionName || '').toLowerCase();
            const dayName = (item.TTMD_DayName || '').toLowerCase();
            const periodName = (item.TTMP_PeriodName || '').toLowerCase();
            const empName = (item.EMPNAME || item.staffName || '').toLowerCase();
            const remarks = (item.TTSD_Remarks || '').toLowerCase();

            return (
                dateVal.includes(q) ||
                className.includes(q) ||
                secName.includes(q) ||
                dayName.includes(q) ||
                periodName.includes(q) ||
                empName.includes(q) ||
                remarks.includes(q)
            );
        });
    }, [list, searchTerm]);

    const totalPages = Math.ceil(filteredList.length / itemsPerPage) || 1;
    const paginatedList = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredList.slice(start, start + itemsPerPage);
    }, [filteredList, currentPage, itemsPerPage]);

    const isDeputation = mode === 'deputation';
    const title = isDeputation ? `${staffName || 'Staff'} - Deputation Details` : `${staffName || 'Staff'} - Absent Details`;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className='max-h-[85vh] max-w-5xl overflow-y-auto'>
                <DialogHeader>
                    <DialogTitle
                        className={`flex items-center gap-2 font-bold text-xl ${isDeputation ? 'text-indigo-800' : 'text-amber-800'}`}>
                        {isDeputation ? <UserPlus className='h-5 w-5 text-indigo-600' /> : <UserMinus className='h-5 w-5 text-amber-600' />}
                        <span>{title}</span>
                    </DialogTitle>
                    <DialogDescription className='text-muted-foreground text-xs'>
                        {isDeputation ? 'Historical deputation substitution records' : 'Historical staff absence records'}
                    </DialogDescription>
                </DialogHeader>

                {/* Search Bar */}
                <div className='flex items-center justify-between gap-4 py-2'>
                    <div className='relative max-w-xs flex-1'>
                        <Search className='absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground' />
                        <Input
                            placeholder='Search records...'
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className='h-9 pl-9 text-xs'
                        />
                    </div>
                    <span className='font-semibold text-muted-foreground text-xs'>Total Records: {filteredList.length}</span>
                </div>

                {isLoading ? (
                    <div className='flex h-56 items-center justify-center gap-3 text-purple-600'>
                        <Loader2 className='h-7 w-7 animate-spin' />
                        <span className='font-semibold text-sm'>Loading records...</span>
                    </div>
                ) : filteredList.length === 0 ? (
                    <div className='flex h-40 flex-col items-center justify-center rounded-xl border border-gray-200 border-dashed bg-gray-50 p-6 text-center text-gray-600'>
                        <History className='mb-2 h-8 w-8 text-gray-400' />
                        <p className='font-semibold text-base'>No records found</p>
                        <p className='text-gray-500 text-xs'>There are no historical records matching the criteria.</p>
                    </div>
                ) : (
                    <>
                        <div className='overflow-x-auto rounded-xl border border-gray-200 shadow-sm'>
                            <Table className='text-center text-xs'>
                                <TableHeader className={isDeputation ? 'bg-indigo-700 text-white' : 'bg-amber-700 text-white'}>
                                    <TableRow className='hover:bg-transparent'>
                                        <TableHead className='w-[60px] text-center font-bold text-white uppercase'>SL.No.</TableHead>
                                        <TableHead className='text-center font-bold text-white uppercase'>Date</TableHead>
                                        <TableHead className='text-center font-bold text-white uppercase'>Class</TableHead>
                                        <TableHead className='text-center font-bold text-white uppercase'>Section</TableHead>
                                        <TableHead className='text-center font-bold text-white uppercase'>Day</TableHead>
                                        <TableHead className='text-center font-bold text-white uppercase'>Period</TableHead>
                                        <TableHead className='text-center font-bold text-white uppercase'>
                                            {isDeputation ? 'Absent Staff' : 'Deputed Staff'}
                                        </TableHead>
                                        <TableHead className='text-center font-bold text-white uppercase'>Remarks</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedList.map((user, idx) => {
                                        const globalIndex = (currentPage - 1) * itemsPerPage + idx + 1;
                                        const formattedDate = user.TTSD_Date ? format(new Date(user.TTSD_Date), 'dd/MM/yyyy') : '--';

                                        return (
                                            <TableRow
                                                key={idx}
                                                className={
                                                    idx % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50/50 hover:bg-gray-100/50'
                                                }>
                                                <TableCell className='font-semibold'>{globalIndex}</TableCell>
                                                <TableCell className='font-medium text-slate-700'>{formattedDate}</TableCell>
                                                <TableCell className='font-semibold text-slate-800'>
                                                    {user.ASMCL_ClassName || '--'}
                                                </TableCell>
                                                <TableCell className='font-semibold text-slate-800'>
                                                    {user.ASMC_SectionName || '--'}
                                                </TableCell>
                                                <TableCell className='font-medium text-slate-700'>{user.TTMD_DayName || '--'}</TableCell>
                                                <TableCell className='font-semibold text-purple-700'>
                                                    <span className='inline-block rounded bg-purple-100 px-2 py-0.5 font-bold text-purple-800 text-xs'>
                                                        {user.TTMP_PeriodName || '--'}
                                                    </span>
                                                </TableCell>
                                                <TableCell className='font-bold text-slate-800'>
                                                    {user.EMPNAME || user.staffName || '--'}
                                                </TableCell>
                                                <TableCell
                                                    className='max-w-[200px] truncate text-slate-600 text-xs'
                                                    title={user.TTSD_Remarks || ''}>
                                                    {user.TTSD_Remarks || '--'}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className='flex items-center justify-between pt-2'>
                                <span className='text-muted-foreground text-xs'>
                                    Page {currentPage} of {totalPages}
                                </span>
                                <div className='flex gap-1'>
                                    <Button
                                        variant='outline'
                                        size='sm'
                                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className='h-8 px-2'>
                                        <ChevronLeft className='h-4 w-4' /> Prev
                                    </Button>
                                    <Button
                                        variant='outline'
                                        size='sm'
                                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className='h-8 px-2'>
                                        Next <ChevronRight className='h-4 w-4' />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
