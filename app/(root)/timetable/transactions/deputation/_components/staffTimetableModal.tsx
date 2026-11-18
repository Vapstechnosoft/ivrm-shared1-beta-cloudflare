'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAllDetailsViewRecords2 } from '@/hooks/timetable/useTransactions';
import { Calendar, Clock, Loader2, UserCheck } from 'lucide-react';
import { useMemo } from 'react';

interface StaffTimetableModalProps {
    open: boolean;
    onClose: () => void;
    asmaY_Id: number;
    hrmE_Id: number;
    staffName?: string;
}

export default function StaffTimetableModal({ open, onClose, asmaY_Id, hrmE_Id, staffName }: StaffTimetableModalProps) {
    const { data: rawData, isLoading } = useAllDetailsViewRecords2(
        {
            ASMAY_Id: asmaY_Id,
            HRME_Id: hrmE_Id
        },
        open && !!asmaY_Id && !!hrmE_Id
    );

    const payload = rawData?.data !== undefined ? rawData.data : rawData;

    const periodList: any[] = useMemo(() => {
        return payload?.periodslst || payload?.period_list || payload?.periodList || [];
    }, [payload]);

    const dayList: any[] = useMemo(() => {
        return payload?.gridweeks || payload?.day_list1 || payload?.dayList || [];
    }, [payload]);

    const ttList: any[] = useMemo(() => {
        return payload?.time_Table || payload?.tt_list || payload?.timeTable || [];
    }, [payload]);

    // Build 2D matrix matching AngularJS logic
    const gridMatrix = useMemo(() => {
        if (!dayList || !periodList || dayList.length === 0 || periodList.length === 0) {
            return [];
        }

        return dayList.map((day) => {
            const dayId = Number(day.ttmD_Id);
            const dayName = day.ttmD_DayName || '';

            const rowCells = periodList.map((period) => {
                const periodId = Number(period.ttmP_Id);
                const periodName = period.ttmP_PeriodName || '';

                // Find matching entries for this day and period
                const matchingEntries = ttList.filter((entry) => Number(entry.ttmD_Id) === dayId && Number(entry.ttmP_Id) === periodId);

                if (matchingEntries.length === 0) {
                    return {
                        pedid: periodId,
                        dayid: dayId,
                        pedname: periodName,
                        dayname: dayName,
                        value: '',
                        color: 'black'
                    };
                }

                const valueText = matchingEntries
                    .map((item) => {
                        const parts = [
                            item.asmcL_ClassName,
                            item.asmC_SectionName ? `:${item.asmC_SectionName}` : '',
                            item.ismS_SubjectName ? `:${item.ismS_SubjectName}` : ''
                        ].filter(Boolean);
                        return parts.join(' ');
                    })
                    .join(' && ');

                return {
                    pedid: periodId,
                    dayid: dayId,
                    pedname: periodName,
                    dayname: dayName,
                    value: valueText,
                    color: 'black'
                };
            });

            return {
                dayId,
                dayName,
                cells: rowCells
            };
        });
    }, [dayList, periodList, ttList]);

    const displayName = staffName || payload?.staff_Name || (ttList.length > 0 ? ttList[0].staffName : `Staff #${hrmE_Id}`);

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className='max-h-[85vh] max-w-6xl overflow-y-auto'>
                <DialogHeader>
                    <DialogTitle className='flex items-center gap-2 font-bold text-purple-800 text-xl'>
                        <UserCheck className='h-5 w-5 text-purple-600' />
                        <span>{displayName} - Periods Details</span>
                    </DialogTitle>
                    <DialogDescription className='text-muted-foreground text-xs'>
                        Weekly schedule and timetable allocation matrix
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className='flex h-64 items-center justify-center gap-3 text-purple-600'>
                        <Loader2 className='h-7 w-7 animate-spin' />
                        <span className='font-semibold text-sm'>Loading timetable schedule...</span>
                    </div>
                ) : gridMatrix.length === 0 ? (
                    <div className='flex h-40 flex-col items-center justify-center rounded-xl border border-purple-200 border-dashed bg-purple-50/50 p-6 text-center text-purple-700'>
                        <Clock className='mb-2 h-8 w-8 text-purple-400' />
                        <p className='font-semibold text-base'>TimeTable is Not Generated For Selected Details</p>
                        <p className='text-purple-500 text-xs'>No timetable periods found for this staff.</p>
                    </div>
                ) : (
                    <div className='overflow-x-auto rounded-xl border border-purple-100 shadow-sm'>
                        <Table className='border-collapse text-center text-xs'>
                            <TableHeader className='bg-gradient-to-r from-purple-800 via-indigo-800 to-purple-900 text-white'>
                                <TableRow className='border-purple-700 hover:bg-transparent'>
                                    <TableHead className='w-[130px] border-purple-700 border-r text-center font-bold text-white uppercase tracking-wider'>
                                        <div className='flex items-center justify-center gap-1'>
                                            <Calendar className='h-3.5 w-3.5' /> Day / Period
                                        </div>
                                    </TableHead>
                                    {periodList.map((period, idx) => (
                                        <TableHead
                                            key={period.ttmP_Id || idx}
                                            className='border-purple-700 border-r text-center font-bold text-white uppercase tracking-wider'>
                                            Period {period.ttmP_PeriodName || idx + 1}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {gridMatrix.map((row, rowIdx) => (
                                    <TableRow
                                        key={row.dayId || rowIdx}
                                        className={
                                            rowIdx % 2 === 0 ? 'bg-white hover:bg-purple-50/40' : 'bg-purple-50/20 hover:bg-purple-50/50'
                                        }>
                                        <TableCell className='border-purple-100 border-r bg-blue-50/30 text-center font-bold text-blue-700 uppercase'>
                                            {row.dayName}
                                        </TableCell>
                                        {row.cells.map((cell, colIdx) => (
                                            <TableCell
                                                key={`${row.dayId}-${cell.pedid || colIdx}`}
                                                className='min-w-[120px] max-w-[180px] border-purple-100 border-r p-2 text-center font-medium'>
                                                {cell.value ? (
                                                    <span className='inline-block rounded-md bg-purple-100/70 px-2 py-1 font-semibold text-[11px] text-purple-900 shadow-xs'>
                                                        {cell.value}
                                                    </span>
                                                ) : (
                                                    <span className='text-gray-300'>-</span>
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
