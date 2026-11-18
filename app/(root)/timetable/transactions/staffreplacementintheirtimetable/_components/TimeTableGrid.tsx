'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/extension/field';
import {
    useSaveStaffReplacementInTheirTimetable,
    useStaffReplacementInTheirTimetablePossiblePeriods,
    useStaffReplacementInTheirTimetableReport
} from '@/hooks/timetable/useTransactions';
import { cn } from '@/lib/utils';
import type { Day, Period, TimeTableItem } from '@/types/timetable/Transaction/staffreplacementintheirtimetable';
import { ArrowRightLeft, CheckCircle2, Loader2, RefreshCw, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

interface TimeTableGridProps {
    params: {
        hrmE_Id: string;
    };
}

export default function TimeTableGrid({ params }: TimeTableGridProps) {
    const { hrmE_Id } = params;

    const { data: reportData, isLoading: isReportLoading, refetch } = useStaffReplacementInTheirTimetableReport({ hrmE_Id });
    const { mutate: getPossible, data: possibleData, isPending: isPossibleLoading } = useStaffReplacementInTheirTimetablePossiblePeriods();
    const { mutate: saveReplacement, isPending: isSaving } = useSaveStaffReplacementInTheirTimetable();

    // selection1 is the first box you click (Source), selection2 is the second (Target)
    const [selection1, setSelection1] = useState<any>(null);
    const [selection2, setSelection2] = useState<any>(null);
    const [hoveredRow, setHoveredRow] = useState<number | null>(null);

    // Distribution options (0 / 1 as the API expects)
    const [staffSDK, setStaffSDK] = useState(0);
    const [subSDK, setSubSDK] = useState(0);
    const [conSDK, setConSDK] = useState(0);

    // Reset selections and settings when hrmE_Id changes
    useEffect(() => {
        setSelection1(null);
        setSelection2(null);
        setStaffSDK(0);
        setSubSDK(0);
        setConSDK(0);
    }, [hrmE_Id]);

    /* -------------------- DATA PROCESSING -------------------- */
    const periodList: Period[] = (reportData as any)?.periodslst || [];
    const dayList: Day[] = (reportData as any)?.gridweeks || [];
    const ttList: TimeTableItem[] = (reportData as any)?.time_Table || [];

    // True when the API response is for a UDC period (ttmP_Id / ttmD_Id = 0)
    const isUDCDetected = useMemo(() => {
        const first = possibleData?.data_lst?.[0];
        return !!first && (Number(first.ttmP_Id) === 0 || Number(first.ttmD_Id) === 0);
    }, [possibleData?.data_lst]);

    // Build the grid: one row per day, one cell per period
    const tableGrid = useMemo(() => {
        if (!dayList.length || !periodList.length) return [];

        return dayList.map((day) =>
            periodList.map((period) => {
                const matches = ttList.filter((item) => item.ttmP_Id === period.ttmP_Id && item.ttmD_Id === day.ttmD_Id);

                // Nothing allocated in this slot -> mark as Empty
                if (matches.length === 0) {
                    return {
                        pedid: period.ttmP_Id,
                        dayid: day.ttmD_Id,
                        pedname: period.ttmP_PeriodName,
                        dayname: day.ttmD_DayName,
                        value: 'Empty',
                        value1: '',
                        isEmpty: true
                    };
                }

                return {
                    pedid: period.ttmP_Id,
                    dayid: day.ttmD_Id,
                    pedname: period.ttmP_PeriodName,
                    dayname: day.ttmD_DayName,
                    value: matches.map((m) => `${m.asmcL_ClassName} : ${m.asmC_SectionName} : ${m.ismS_SubjectName}`).join(' && '),
                    value1: matches.map((m) => `${m.staffName} : ${m.ismS_SubjectName}`).join(' && '),
                    isEmpty: false
                };
            })
        );
    }, [dayList, periodList, ttList]);

    // A cell is a valid target when a source is chosen and the cell is Empty
    // or is listed by the API as a possible period
    const isPossibleTarget = (cell: any) => {
        if (!selection1 || isUDCDetected || isPossibleLoading) return false;
        if (selection1.dayid === cell.dayid && selection1.pedid === cell.pedid) return false;

        const inApiList = !!possibleData?.data_lst?.some(
            (p: any) => Number(p.ttmP_Id) === Number(cell.pedid) && Number(p.ttmD_Id) === Number(cell.dayid)
        );
        return inApiList || cell.isEmpty;
    };

    /* -------------------- HANDLERS -------------------- */
    // Re-fetch possible periods when checkboxes change and we have a source
    useEffect(() => {
        if (selection1) {
            setSelection2(null); // old target may no longer be valid under the new settings
            getPossible({
                ttmD_Id: selection1.dayid,
                ttmP_Id: selection1.pedid,
                hrmE_Id: hrmE_Id,
                staffSDK,
                subSDK,
                conSDK
            });
        }
        // Only trigger on settings change, source change is handled in toggleSelection
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [staffSDK, subSDK, conSDK, hrmE_Id]);

    // Fetch possible periods for a newly chosen source cell
    const fetchPossibleForSource = (cell: any) => {
        getPossible(
            {
                ttmD_Id: cell.dayid,
                ttmP_Id: cell.pedid,
                hrmE_Id: hrmE_Id,
                staffSDK,
                subSDK,
                conSDK
            },
            {
                onSuccess: (data) => {
                    const firstItem = data?.data_lst?.[0];
                    if (firstItem && (Number(firstItem.ttmP_Id) === 0 || Number(firstItem.ttmD_Id) === 0)) {
                        toast.error('You selected UDC Period!', {
                            description: 'Please Select Another Period, UDC Periods Cannot Replace !!',
                            duration: 5000
                        });
                        setSelection1(null);
                        setSelection2(null);
                    }
                }
            }
        );
    };

    const selectSource = (cell: any) => {
        if (cell.isEmpty) {
            toast.warning('No period is allocated in this slot!');
            return;
        }
        setSelection1(cell);
        setSelection2(null);
        toast.info(`Source selected: ${cell.dayname} Day, ${cell.pedname} Period`);
        fetchPossibleForSource(cell);
    };

    const toggleSelection = (cell: any) => {
        if (!selection1) {
            // SELECTING SOURCE (FROM)
            selectSource(cell);
        } else if (selection1.dayid === cell.dayid && selection1.pedid === cell.pedid) {
            // TOGGLE OFF
            setSelection1(null);
            setSelection2(null);
        } else if (!selection2) {
            // SELECTING TARGET (TO)
            if (isPossibleLoading) {
                toast.info('Loading possible periods, please wait...');
                return;
            }

            if (isPossibleTarget(cell)) {
                setSelection2(cell);
                toast.info(`Target selected: ${cell.dayname} Day, ${cell.pedname} Period`);
            } else {
                toast.warning('Please Select Replace possibility Period!');
            }
        } else if (selection2.dayid === cell.dayid && selection2.pedid === cell.pedid) {
            // TOGGLE OFF TARGET
            setSelection2(null);
        } else {
            // RESET AND SELECT NEW SOURCE
            selectSource(cell);
        }
    };

    const handleClear = () => {
        setSelection1(null);
        setSelection2(null);
    };

    const handleReplace = () => {
        if (!selection1 || !selection2) return;

        saveReplacement(
            {
                hrmE_Id,
                ttmD_ID_from: selection1.dayid,
                ttmP_ID_from: selection1.pedid,
                ttmD_ID_to: selection2.dayid,
                ttmP_ID_to: selection2.pedid
            },
            {
                onSuccess: (response: any) => {
                    const resData = response?.data;

                    // Only the message sent by the backend is shown
                    const backendMsg =
                        resData?.message ||
                        response?.message ||
                        (typeof resData?.returnval_cls_notfree === 'string' && resData.returnval_cls_notfree !== 'false'
                            ? resData.returnval_cls_notfree
                            : null);

                    const isClassNotFree = resData?.returnval_cls_notfree === true || resData?.returnval_cls_notfree === 'true';

                    // Success can come back in different shapes, so check all of them
                    const isSuccess =
                        resData?.returnval === true ||
                        resData?.returnval === 'true' ||
                        resData?.returnval === 1 ||
                        response?.returnval === true ||
                        response?.returnval === 'true' ||
                        response?.returnval === 1 ||
                        response?.success === true ||
                        resData?.success === true;

                    if (isSuccess && !isClassNotFree) {
                        if (backendMsg) toast.success(backendMsg);
                        handleClear();
                        refetch(); // reload the grid with the new data
                    } else if (backendMsg) {
                        toast.error(backendMsg);
                    }
                },
                onError: (error: any) => {
                    const serverErrorMsg =
                        error?.response?.data?.message ||
                        error?.response?.data?.title ||
                        (typeof error?.response?.data === 'string' ? error.response.data : null);

                    if (serverErrorMsg) toast.error(serverErrorMsg);
                }
            }
        );
    };

    /* -------------------- RENDER -------------------- */
    if (isReportLoading) {
        return (
            <div className='flex items-center justify-center p-20'>
                <Loader2 className='h-8 w-8 animate-spin text-purple-600' />
                <span className='ml-3 font-semibold text-purple-700'>Fetching report data...</span>
            </div>
        );
    }

    if (!reportData || !dayList.length) {
        return (
            <div className='rounded-xl border border-red-100 bg-red-50 p-10 text-center'>
                <p className='font-bold text-red-600'>TimeTable is Not Generated For Selected Details !!!!</p>
            </div>
        );
    }

    return (
        <div className='mx-auto max-w-7xl overflow-hidden rounded-xl border border-purple-100 bg-white shadow-md'>
            {/* HEADER */}
            <div className='bg-gradient-to-r from-purple-700 via-purple-600 to-purple-800 px-6 py-4'>
                <h2 className='flex items-center gap-2 font-extrabold text-sm text-white uppercase tracking-widest'>Report Grid View</h2>
            </div>

            <div className='space-y-6 p-6'>
                {/* Distribution Options */}
                <div className='flex flex-wrap items-center gap-8 rounded-lg border border-purple-100 bg-purple-50/50 p-4'>
                    <div className='flex items-center space-x-2'>
                        <Checkbox id='staffSDK' checked={staffSDK === 1} onCheckedChange={(checked) => setStaffSDK(checked ? 1 : 0)} />
                        <Label
                            htmlFor='staffSDK'
                            className='cursor-pointer font-semibold text-purple-900 text-xs leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                            Staff Wise Uniform Distribution
                        </Label>
                    </div>
                    <div className='flex items-center space-x-2'>
                        <Checkbox id='subSDK' checked={subSDK === 1} onCheckedChange={(checked) => setSubSDK(checked ? 1 : 0)} />
                        <Label
                            htmlFor='subSDK'
                            className='cursor-pointer font-semibold text-purple-900 text-xs leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                            Subject Wise Uniform Distribution
                        </Label>
                    </div>
                    <div className='flex items-center space-x-2'>
                        <Checkbox id='conSDK' checked={conSDK === 1} onCheckedChange={(checked) => setConSDK(checked ? 1 : 0)} />
                        <Label
                            htmlFor='conSDK'
                            className='cursor-pointer font-semibold text-purple-900 text-xs leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                            Staff Wise Rest and Continue
                        </Label>
                    </div>
                </div>

                {/* TABLE */}
                <div className='overflow-x-auto rounded-xl border border-purple-100'>
                    <table className='w-full min-w-[1000px] border-collapse text-[11px]'>
                        <thead>
                            <tr className='bg-purple-50'>
                                <th className='sticky left-0 z-10 min-w-[120px] border-purple-100 border-r border-b bg-purple-50 px-4 py-4 text-left font-black text-purple-800 uppercase'>
                                    Day / Period
                                </th>
                                {periodList.map((p, i) => (
                                    <th
                                        key={i}
                                        className='min-w-[120px] border-purple-100 border-r border-b px-2 py-4 text-center font-bold text-purple-700'>
                                        Period {p.ttmP_PeriodName}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {tableGrid.map((row, rIdx) => (
                                <tr
                                    key={rIdx}
                                    className={cn(
                                        'border-purple-50 border-b transition-colors',
                                        hoveredRow === rIdx ? 'bg-blue-50/50' : 'bg-white'
                                    )}
                                    onMouseEnter={() => setHoveredRow(rIdx)}
                                    onMouseLeave={() => setHoveredRow(null)}>
                                    <td
                                        className={cn(
                                            'sticky left-0 z-10 border-purple-100 border-r px-4 py-4 font-bold transition-colors',
                                            hoveredRow === rIdx ? 'bg-blue-100 text-blue-900' : 'bg-white text-purple-900'
                                        )}>
                                        {row[0]?.dayname}
                                    </td>
                                    {row.map((cell, cIdx) => {
                                        const isSel1 = selection1?.dayid === cell.dayid && selection1?.pedid === cell.pedid;
                                        const isSel2 = selection2?.dayid === cell.dayid && selection2?.pedid === cell.pedid;

                                        // Green = valid target (Empty slot or listed by the API) once a source is selected
                                        const isHighlightGreen = isPossibleTarget(cell) && !isSel1 && !isSel2;

                                        return (
                                            <td
                                                key={cIdx}
                                                onClick={() => toggleSelection(cell)}
                                                className={cn(
                                                    'relative cursor-pointer border-purple-50 border-r px-2 py-4 text-center transition-all duration-300',
                                                    'hover:bg-blue-50',
                                                    isSel1
                                                        ? 'z-10 bg-blue-600 font-bold text-white shadow-lg ring-2 ring-blue-300 ring-inset'
                                                        : '',
                                                    isSel2
                                                        ? 'z-10 bg-orange-500 font-bold text-white shadow-lg ring-2 ring-orange-300 ring-inset'
                                                        : '',
                                                    isHighlightGreen ? 'border-green-200 bg-green-100 text-green-700' : ''
                                                )}>
                                                <div className='flex min-h-[24px] items-center justify-center font-medium'>
                                                    {cell.isEmpty ? (
                                                        <span
                                                            className={cn(
                                                                'transition-opacity duration-200',
                                                                hoveredRow === rIdx || isSel1 || isSel2 ? 'opacity-100' : 'opacity-0'
                                                            )}>
                                                            {cell.value}
                                                        </span>
                                                    ) : (
                                                        cell.value
                                                    )}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* DUAL ACTIONS FOOTER (only visible once something is selected) */}
                {(selection1 || selection2) && (
                    <div className='slide-in-from-bottom-2 flex animate-in flex-col gap-4 border-t pt-4'>
                        <div className='flex items-center justify-between rounded-lg border border-purple-100 bg-purple-50 p-4 shadow-sm'>
                            <div className='flex flex-1 items-center gap-6'>
                                {/* SLOT 1 (Source) */}
                                <div className='flex flex-1 flex-col gap-1'>
                                    <span className='font-bold text-[10px] text-gray-400 uppercase tracking-wider'>Replacement From</span>
                                    <div
                                        className={cn(
                                            'flex h-10 items-center rounded-md border px-4 font-semibold text-xs shadow-sm transition-all',
                                            selection1
                                                ? 'border-blue-400 bg-blue-50 font-bold text-blue-900'
                                                : 'border-gray-300 border-dashed bg-gray-100 text-gray-400'
                                        )}>
                                        {selection1 ? (
                                            <>
                                                <span className='mr-2 text-blue-600'>{selection1.dayname} Day</span>
                                                <span className='mr-2 text-gray-300'>|</span>
                                                <span>{selection1.pedname} Period</span>
                                            </>
                                        ) : (
                                            'Select Source Period...'
                                        )}
                                    </div>
                                </div>

                                <div className='pt-5 text-gray-400'>
                                    <ArrowRightLeft
                                        size={20}
                                        className={cn(selection1 && selection2 ? 'animate-pulse text-blue-500' : '')}
                                    />
                                </div>

                                {/* SLOT 2 (Target) */}
                                <div className='flex flex-1 flex-col gap-1'>
                                    <span className='font-bold text-[10px] text-gray-400 uppercase tracking-wider'>Replacement To</span>
                                    <div
                                        className={cn(
                                            'flex h-10 items-center rounded-md border px-4 font-semibold text-xs shadow-sm transition-all',
                                            selection2
                                                ? 'border-orange-400 bg-orange-50 font-bold text-orange-900'
                                                : 'border-gray-300 border-dashed bg-gray-100 text-gray-400'
                                        )}>
                                        {selection2 ? (
                                            <>
                                                <span className='mr-2 text-orange-600'>{selection2.dayname} Day</span>
                                                <span className='mr-2 text-gray-300'>|</span>
                                                <span>{selection2.pedname} Period</span>
                                            </>
                                        ) : (
                                            'Select Target Period...'
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* BUTTONS */}
                            <div className='ml-4 flex items-center gap-3 pt-5'>
                                <Button variant='ghost' onClick={handleClear} className='h-10 text-purple-600' disabled={isSaving}>
                                    <X className='mr-1 h-4 w-4' /> Clear
                                </Button>
                                <Button
                                    onClick={handleReplace}
                                    disabled={!selection1 || !selection2 || isSaving}
                                    className='h-10 bg-orange-500 px-8 font-bold text-white shadow-md hover:bg-orange-600'>
                                    {isSaving ? (
                                        <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                                    ) : (
                                        <CheckCircle2 className='mr-2 h-4 w-4' />
                                    )}
                                    Replace
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
