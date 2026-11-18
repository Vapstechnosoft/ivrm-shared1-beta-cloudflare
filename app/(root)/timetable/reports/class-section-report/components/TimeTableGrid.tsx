'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { getStaffReplacementClassSectionReport } from '@/server/timetable/reports/staff-replacement-class-section';
import { useMutation } from '@tanstack/react-query';
import { Loader2, Printer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface TimeTableGridProps {
    params: any;
    onPrint?: () => void;
}

export default function TimeTableGrid({ params, onPrint }: TimeTableGridProps) {
    const [reportData, setReportData] = useState<any>(null);
    const reportMutation = useMutation({
        mutationFn: (data: any) => getStaffReplacementClassSectionReport(data)
    });

    useEffect(() => {
        if (params) {
            reportMutation.mutate(params, {
                onSuccess: (response: any) => {
                    const data = response.data || response;
                    if (
                        data &&
                        ((data.tt && data.tt.length > 0) ||
                            (data.TT && data.TT.length > 0) ||
                            (data.Table4 && data.Table4.length > 0) ||
                            (data.periodslst && data.periodslst.length > 0) ||
                            (data.gridweeks && data.gridweeks.length > 0))
                    ) {
                        processReportData(data);
                    } else {
                        toast.error(response.message || 'No data available for selected details');
                        setReportData(null);
                    }
                },
                onError: (error: any) => {
                    console.error('Error fetching report:', error);
                    toast.error('Failed to fetch report data');
                }
            });
        }
    }, [params]);

    const processReportData = (root: any) => {
        // Helper for case-insensitive and alternative key access
        const getList = (obj: any, ...keys: string[]): any[] => {
            if (!obj) return [];
            for (const k of keys) {
                if (obj[k] && Array.isArray(obj[k])) return obj[k];
                const lowerK = k.toLowerCase();
                const foundKey = Object.keys(obj).find((key) => key.toLowerCase() === lowerK);
                if (foundKey && Array.isArray(obj[foundKey])) return obj[foundKey];
            }
            return [];
        };

        const timetable = getList(root, 'tt', 'TT', 'timetable', 'Table4', 'Table');
        const periodList = getList(root, 'periodslst', 'periodList', 'allperiods', 'periodsLst', 'periodsList', 'Table1');
        const gridWeeks = getList(root, 'gridweeks', 'gridWeeks', 'day_list', 'day_List', 'Table', 'grid_Weeks');
        const breakList = getList(root, 'tT_Break_list', 'breakList', 'Table2', 'tt_break_list', 'tt_Break_list');
        const allBreakList = getList(root, 'tT_Break_list_all', 'allBreakList', 'Table3', 'tt_break_list_all', 'tt_Break_list_all');

        const classPeriodSequence: any[] = [];
        periodList.forEach((period: any) => {
            const pedId = period.ttmP_Id || period.TTMP_Id || period.ped_id || period.ttmp_id;
            const pedName = period.ttmP_PeriodName || period.periodName || period.ped_name;

            classPeriodSequence.push({
                ped_id: pedId,
                ped_name: String(pedName),
                is_break: false
            });

            // Check for breaks
            const breakItem = breakList.find((b: any) => {
                const bAfter = b.ttmB_AfterPeriod || b.afterPeriod || b.ttmb_afterperiod;
                return Number.parseFloat(String(pedName)) === Number.parseFloat(String(bAfter));
            });

            if (breakItem) {
                classPeriodSequence.push({
                    ped_id: 0,
                    ped_name: 'Break',
                    brk_name: breakItem.ttmB_BreakName || breakItem.breakName || 'Break',
                    is_break: true,
                    after_ped_name: String(pedName)
                });
            }
        });

        const tableRows: any[] = [];
        gridWeeks.forEach((day: any) => {
            const rowCells: any[] = [];
            const dayId = day.ttmD_Id || day.TTMD_Id || day.day_id || day.ttmd_id;
            const dayName = day.ttmD_DayName || day.dayName || day.day_name || '';

            classPeriodSequence.forEach((periodCol: any) => {
                let cellContent = '';
                let cellColor = 'black';

                if (!periodCol.is_break) {
                    const entries = timetable.filter((t: any) => {
                        const tPedId = t.ttmP_Id || t.TTMP_Id || t.ped_id || t.ttmp_id;
                        const tDayId = t.ttmD_Id || t.TTMD_Id || t.day_id || t.ttmd_id;
                        return Number(tPedId) === Number(periodCol.ped_id) && Number(tDayId) === Number(dayId);
                    });

                    if (entries.length > 0) {
                        cellContent = entries
                            .map((t: any) => {
                                const sub = t.ismS_SubjectName || t.subjectName || t.subject || t.isms_subjectname || '';
                                const stf = t.staffName || t.empName || t.staff || t.hrmE_EmployeeName || t.hrme_employeename || '';
                                return `${sub} : ${stf}`;
                            })
                            .join(' && ');
                    }
                } else {
                    const daySpecificBreak = allBreakList.find((b: any) => {
                        const bDayId = b.ttmD_Id || b.TTMD_Id || b.day_id || b.ttmd_id;
                        const bAfter = b.ttmB_AfterPeriod || b.afterPeriod || b.ttmb_afterperiod;
                        return (
                            Number(bDayId) === Number(dayId) &&
                            Number.parseFloat(String(periodCol.after_ped_name)) === Number.parseFloat(String(bAfter))
                        );
                    });

                    if (daySpecificBreak) {
                        cellContent = daySpecificBreak.ttmB_BreakName || daySpecificBreak.breakName || 'Break';
                        cellColor = 'red';
                    } else {
                        cellContent = periodCol.brk_name || 'Break';
                        cellColor = 'red';
                    }
                }

                rowCells.push({
                    ...periodCol,
                    content: cellContent,
                    color: cellColor
                });
            });

            tableRows.push({ dayName: String(dayName), cells: rowCells });
        });

        setReportData({
            periods: classPeriodSequence,
            rows: tableRows
        });
    };

    if (reportMutation.isPending) {
        return (
            <div className='flex h-64 items-center justify-center rounded-xl border border-purple-100 bg-white shadow-md'>
                <div className='flex flex-col items-center gap-3'>
                    <Loader2 className='h-8 w-8 animate-spin text-purple-600' />
                    <p className='font-medium text-purple-900 text-sm'>Generating Report...</p>
                </div>
            </div>
        );
    }

    if (!reportData) return null;

    return (
        <div className='fade-in slide-in-from-top-4 mx-auto max-w-7xl overflow-hidden rounded-xl border border-purple-100 bg-white shadow-md duration-500'>
            {/* HEADER */}
            <div className='flex items-center justify-between bg-gradient-to-r from-purple-700 via-purple-600 to-purple-800 px-6 py-4 print:hidden'>
                <h2 className='flex items-center gap-2 font-extrabold text-sm text-white uppercase tracking-widest'>
                    <span className='h-2 w-2 animate-pulse rounded-full bg-orange-400' />
                    Time Table View
                </h2>
                <Button
                    variant='outline'
                    size='sm'
                    onClick={onPrint}
                    className='h-8 w-24 border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white'>
                    <Printer className='mr-2 h-4 w-4' />
                    Print
                </Button>
            </div>

            <div className='space-y-6 p-6'>
                {/* CHECKBOX GROUP */}
                <div className='flex flex-wrap items-center gap-8 rounded-lg border-orange-500 border-l-4 bg-white p-5 shadow-sm ring-1 ring-purple-50'>
                    <div className='group flex items-center space-x-3'>
                        <Checkbox
                            id='staff-uniform'
                            className='border-purple-300 data-[state=checked]:bg-orange-50 data-[state=checked]:text-orange-600'
                        />
                        <Label
                            htmlFor='staff-uniform'
                            className='cursor-pointer font-bold text-purple-900 text-xs transition-colors group-hover:text-orange-600'>
                            Staff Wise Uniform Distribution
                        </Label>
                    </div>
                    <div className='group flex items-center space-x-3'>
                        <Checkbox
                            id='subject-uniform'
                            className='border-purple-300 data-[state=checked]:bg-orange-50 data-[state=checked]:text-orange-600'
                        />
                        <Label
                            htmlFor='subject-uniform'
                            className='cursor-pointer font-bold text-purple-900 text-xs transition-colors group-hover:text-orange-600'>
                            Subject Wise Uniform Distribution
                        </Label>
                    </div>
                    <div className='group flex items-center space-x-3'>
                        <Checkbox
                            id='staff-rest'
                            className='border-purple-300 data-[state=checked]:bg-orange-50 data-[state=checked]:text-orange-600'
                        />
                        <Label
                            htmlFor='staff-rest'
                            className='cursor-pointer font-bold text-purple-900 text-xs transition-colors group-hover:text-orange-600'>
                            Staff Wise Rest and Continue
                        </Label>
                    </div>
                </div>

                {/* TABLE GRID CONTAINER */}
                <div className='overflow-x-auto rounded-xl border border-purple-100 bg-slate-50/30 print:overflow-visible'>
                    <style type='text/css' media='print'>
                        {`
                        @page { size: landscape; margin: 10mm; }
                        `}
                    </style>
                    <table className='w-full min-w-[1200px] border-collapse text-[11px] print:min-w-0'>
                        <thead>
                            <tr className='bg-purple-50'>
                                <th className='sticky left-0 z-10 min-w-[120px] border-purple-100 border-r border-b bg-purple-50 px-4 py-4 text-left font-black text-purple-800 uppercase tracking-tighter'>
                                    Day / Period
                                </th>
                                {reportData.periods.map((period: any, index: number) => (
                                    <th
                                        key={index}
                                        className={`border-purple-100 border-r border-b px-2 py-4 text-center font-bold text-purple-700 ${period.is_break ? 'w-12 bg-orange-50/50 text-[10px] text-orange-700' : 'min-w-[100px]'}`}>
                                        {period.ped_name}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.rows.map((row: any, rIdx: number) => (
                                <tr key={rIdx} className='group border-purple-50 border-b bg-white transition-colors last:border-0'>
                                    <td className='sticky left-0 z-10 border-purple-100 border-r bg-white px-4 py-4 font-bold text-purple-900 transition-all group-hover:bg-purple-50 group-hover:text-orange-600'>
                                        {row.dayName}
                                    </td>
                                    {row.cells.map((cell: any, cIdx: number) => {
                                        return (
                                            <td
                                                key={cIdx}
                                                className={`border-purple-50 border-r px-2 py-4 text-center transition-all ${
                                                    cell.is_break
                                                        ? 'bg-orange-50/20 font-black text-orange-400/60 italic'
                                                        : 'font-semibold text-purple-900 group-hover:bg-orange-50/10'
                                                }`}
                                                style={{ color: cell.color }}>
                                                {cell.is_break ? (
                                                    <span className='text-[9px] uppercase tracking-tighter'>{cell.content || 'BRK'}</span>
                                                ) : (
                                                    <span>{cell.content || ''}</span>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* FOOTER ACCENT */}
            <div className='h-1.5 w-full bg-gradient-to-r from-orange-400 via-purple-600 to-orange-400' />
        </div>
    );
}
