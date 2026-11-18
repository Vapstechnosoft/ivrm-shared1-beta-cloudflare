'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useDeputationNewViewRecords2 } from '@/hooks/timetable/useDeputationNew';
import { Calendar, Loader2 } from 'lucide-react';
import { useMemo } from 'react';

interface PeriodsDetailsModalProps {
    open: boolean;
    onClose: () => void;
    asmaY_Id: number;
    hrmE_Id: number;
    staffName?: string;
}

export default function PeriodsDetailsModal({ open, onClose, asmaY_Id, hrmE_Id, staffName }: PeriodsDetailsModalProps) {
    const { data: recordsData, isLoading } = useDeputationNewViewRecords2(
        {
            ASMAY_Id: asmaY_Id,
            HRME_Id: hrmE_Id
        },
        open && !!asmaY_Id && !!hrmE_Id
    );

    const payload = recordsData?.data !== undefined ? recordsData.data : recordsData;

    const periodList: any[] = useMemo(() => {
        return payload?.periodslst || [];
    }, [payload]);

    const dayList: any[] = useMemo(() => {
        return payload?.gridweeks || [];
    }, [payload]);

    const ttList: any[] = useMemo(() => {
        return payload?.time_Table || [];
    }, [payload]);

    // Build 2D Day x Period matrix matching legacy viewrecordspopup2
    const matrix = useMemo(() => {
        if (!dayList.length || !periodList.length) return [];

        return dayList.map((day) => {
            const periodsForRow = periodList.map((period) => {
                const matches = ttList.filter(
                    (tt) => Number(tt.ttmP_Id) === Number(period.ttmP_Id) && Number(tt.ttmD_Id) === Number(day.ttmD_Id)
                );

                if (matches.length > 0) {
                    const text = matches
                        .map((m) => `${m.asmcL_ClassName || ''}:${m.asmC_SectionName || ''}:${m.ismS_SubjectName || ''}`)
                        .join(' & ');
                    return {
                        pedid: period.ttmP_Id,
                        dayid: day.ttmD_Id,
                        value: text,
                        hasData: true
                    };
                }

                return {
                    pedid: period.ttmP_Id,
                    dayid: day.ttmD_Id,
                    value: '-',
                    hasData: false
                };
            });

            return {
                dayName: day.ttmD_DayName,
                dayId: day.ttmD_Id,
                periods: periodsForRow
            };
        });
    }, [dayList, periodList, ttList]);

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className='max-w-5xl rounded-2xl p-6'>
                <DialogHeader>
                    <div className='flex items-center gap-3'>
                        <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600'>
                            <Calendar className='h-5 w-5' />
                        </div>
                        <div>
                            <DialogTitle className='font-bold text-base text-slate-900'>
                                {staffName ? `${staffName} - Periods Schedule` : 'Periods Schedule'}
                            </DialogTitle>
                            <DialogDescription className='text-slate-500 text-xs'>
                                Weekly timetable allocation overview for the selected staff member
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className='max-h-[60vh] overflow-auto rounded-xl border border-slate-200'>
                    {isLoading ? (
                        <div className='flex h-48 flex-col items-center justify-center gap-2 text-slate-500'>
                            <Loader2 className='h-6 w-6 animate-spin text-purple-600' />
                            <span className='font-medium text-xs'>Loading weekly schedule...</span>
                        </div>
                    ) : matrix.length === 0 ? (
                        <div className='flex h-48 items-center justify-center font-semibold text-slate-400 text-xs'>
                            No timetable data found for this staff member.
                        </div>
                    ) : (
                        <Table className='border-collapse text-xs'>
                            <TableHeader className='bg-slate-50'>
                                <TableRow>
                                    <TableHead className='min-w-[120px] font-bold text-purple-700'>Day / Period</TableHead>
                                    {periodList.map((p) => (
                                        <TableHead key={p.ttmP_Id} className='min-w-[140px] text-center font-bold text-slate-700'>
                                            Period {p.ttmP_PeriodName}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {matrix.map((row) => (
                                    <TableRow key={row.dayId} className='hover:bg-purple-50/20'>
                                        <TableCell className='font-bold text-purple-700'>{row.dayName}</TableCell>
                                        {row.periods.map((cell, idx) => (
                                            <TableCell
                                                key={`${row.dayId}-${cell.pedid || idx}`}
                                                className={`text-center transition-colors ${
                                                    cell.hasData ? 'bg-purple-50/60 font-semibold text-purple-900' : 'text-slate-400'
                                                }`}>
                                                {cell.value}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
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
