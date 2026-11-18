'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
    useSaveStaffReplacementInUnallocatedPeriod,
    useTTStaffReplacementInUnallocatedPeriodReport
} from '@/hooks/timetable/useTransactions';
import { cn } from '@/lib/utils';
import { ArrowRightLeft, CheckCircle2, Loader2, RefreshCw, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

interface TimeTableGridProps {
    params: {
        hrmE_Id: string;
    } | null;
}

export default function TimeTableGrid({ params }: TimeTableGridProps) {
    // selection1 is the first box you click (Source), selection2 is the second (Target)
    const [selection1, setSelection1] = useState<any>(null);
    const [selection2, setSelection2] = useState<any>(null);
    const [hoveredRow, setHoveredRow] = useState<number | null>(null);

    // Checkbox states
    const [staffSDK, setStaffSDK] = useState<boolean>(false);
    const [subSDK, setSubSDK] = useState<boolean>(false);
    const [conSDK, setConSDK] = useState<boolean>(false);

    const hrmE_Id = params?.hrmE_Id ? Number(params.hrmE_Id) : 0;

    const {
        data: reportData,
        isLoading: isReportLoading,
        isError: isReportError,
        refetch
    } = useTTStaffReplacementInUnallocatedPeriodReport(hrmE_Id);

    const { mutate: doReplace, isPending: isReplacing } = useSaveStaffReplacementInUnallocatedPeriod();

    // Reset selections when hrmE_Id changes
    useEffect(() => {
        handleClear();
    }, [hrmE_Id]);

    /* -------------------- DATA PROCESSING -------------------- */
    const { table_list, period_list, day_list } = useMemo(() => {
        if (!reportData?.data || !reportData.data.periodslst || !reportData.data.gridweeks || !reportData.data.time_Table) {
            return { table_list: [], period_list: [], day_list: [] };
        }

        const periodslst = reportData.data.periodslst;
        const gridweeks = reportData.data.gridweeks;
        const tt_list = reportData.data.time_Table;

        const processed_table: any[][] = [];

        for (let j = 0; j < gridweeks.length; j++) {
            const dayRow: any[] = [];
            for (let i = 0; i < periodslst.length; i++) {
                let cellData: any = null;
                let count = 0;

                for (let k = 0; k < tt_list.length; k++) {
                    if (tt_list[k].ttmP_Id === periodslst[i].ttmP_Id && tt_list[k].ttmD_Id === gridweeks[j].ttmD_Id) {
                        if (count === 0) {
                            cellData = {
                                pedid: periodslst[i].ttmP_Id,
                                dayid: gridweeks[j].ttmD_Id,
                                value: `${tt_list[k].asmcL_ClassName} : ${tt_list[k].asmC_SectionName} : ${tt_list[k].ismS_SubjectName}`,
                                pedname: periodslst[i].ttmP_PeriodName,
                                dayname: gridweeks[j].ttmD_DayName,
                                color: 'black',
                                value1: `${tt_list[k].staffName} : ${tt_list[k].ismS_SubjectName}`
                            };
                            count++;
                        } else {
                            cellData.value += ` && ${tt_list[k].asmcL_ClassName} : ${tt_list[k].asmC_SectionName} : ${tt_list[k].ismS_SubjectName}`;
                            cellData.value1 += ` && ${tt_list[k].staffName} : ${tt_list[k].ismS_SubjectName}`;
                            count++;
                        }
                    }
                }

                if (!cellData) {
                    cellData = {
                        pedid: periodslst[i].ttmP_Id,
                        dayid: gridweeks[j].ttmD_Id,
                        pedname: periodslst[i].ttmP_PeriodName,
                        dayname: gridweeks[j].ttmD_DayName,
                        color: 'green',
                        isEmpty: true,
                        value: 'Empty'
                    };
                }
                dayRow.push(cellData);
            }
            processed_table.push(dayRow);
        }

        return { table_list: processed_table, period_list: periodslst, day_list: gridweeks };
    }, [reportData]);

    /* -------------------- HANDLERS -------------------- */
    const toggleSelection = (cell: any) => {
        // Logic: Fill selection1 first, then selection2
        if (!selection1) {
            setSelection1(cell);
            toast.info(`Source selected: ${cell.dayname} Day, ${cell.pedname} Period`);
        } else if (selection1.dayid === cell.dayid && selection1.pedid === cell.pedid) {
            setSelection1(null);
            setSelection2(null);
        } else if (!selection2) {
            // Target must be "Empty" to be green
            if (cell.value === 'Empty') {
                setSelection2(cell);
                toast.info(`Target selected: ${cell.dayname} Day, ${cell.pedname} Period`);
            } else {
                toast.warning("Target period must be 'Empty'");
            }
        } else if (selection2.dayid === cell.dayid && selection2.pedid === cell.pedid) {
            setSelection2(null);
        } else {
            // Reset selection to first cell
            setSelection1(cell);
            setSelection2(null);
        }
    };

    const handleClear = () => {
        setSelection1(null);
        setSelection2(null);
    };

  const handleReplace = () => {
        if (!selection1 || !selection2) return;

        const payload = {
            hrmE_Id: Number(hrmE_Id),
            ttmD_ID_from: selection1.dayid,
            ttmP_ID_from: selection1.pedid,
            ttmD_ID_to: selection2.dayid,
            ttmP_ID_to: selection2.pedid,
            staffSDK: staffSDK ? '1' : '0',
            subSDK: subSDK ? '1' : '0',
            conSDK: conSDK ? '1' : '0'
        };

        console.log('Replacement Payload:', payload);

        doReplace(payload, {
            onSuccess: (response: any) => {
                const resData = response?.data;

                // Extract backend message
                const backendMsg =
                    resData?.message ||
                    response?.message ||
                    (typeof resData?.returnval_cls_notfree === 'string' && resData.returnval_cls_notfree !== 'false'
                        ? resData.returnval_cls_notfree
                        : null);

                // Check boolean or string "true" for class conflict
                const isClassNotFree =
                    resData?.returnval_cls_notfree === true ||
                    resData?.returnval_cls_notfree === 'true';

                // Check boolean, string "true", 1, or message containing 'success'
                const isSuccess =
                    resData?.returnval === true ||
                    resData?.returnval === 'true' ||
                    resData?.returnval === 1 ||
                    response?.success === true ||
                    (backendMsg && backendMsg.toLowerCase().includes('success'));

                if (isClassNotFree) {
                    toast.error(backendMsg || 'Replacement Failed: Class is not free.');
                    console.log('Class not free response', resData);
                } else if (isSuccess) {
                    toast.success(backendMsg || 'Staff replacement saved successfully!');
                    handleClear();
                    refetch();
                } else {
                    toast.error(backendMsg || 'Failed to save staff replacement.');
                    console.log('Replacement error response', resData);
                }
            },
            onError: (error: any) => {
                const serverErrorMsg =
                    error?.response?.data?.message ||
                    error?.response?.data?.title ||
                    (typeof error?.response?.data === 'string' ? error.response.data : null) ||
                    error?.message ||
                    'An error occurred while saving the replacement.';

                toast.error(serverErrorMsg);
                console.error('Replacement error', error);
            }
        });
    };
    if (isReportLoading) {
        return (
            <div className='flex items-center justify-center p-20'>
                <Loader2 className='h-8 w-8 animate-spin text-purple-600' />
                <span className='ml-3 font-semibold text-purple-700'>Fetching report data...</span>
            </div>
        );
    }

    if (isReportError || (hrmE_Id && !table_list.length)) {
        return (
            <div className='rounded-xl border border-red-100 bg-red-50 p-10 text-center'>
                <p className='font-bold text-red-600'>No timetable found for the selected staff or an error occurred.</p>
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
                        <Checkbox id='staffSDK' checked={staffSDK} onCheckedChange={(val) => setStaffSDK(!!val)} />
                        <Label
                            htmlFor='staffSDK'
                            className='font-semibold text-purple-900 text-xs leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                            Staff Wise Uniform Distribution
                        </Label>
                    </div>
                    <div className='flex items-center space-x-2'>
                        <Checkbox id='subSDK' checked={subSDK} onCheckedChange={(val) => setSubSDK(!!val)} />
                        <Label
                            htmlFor='subSDK'
                            className='font-semibold text-purple-900 text-xs leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                            Subject Wise Uniform Distribution
                        </Label>
                    </div>
                    <div className='flex items-center space-x-2'>
                        <Checkbox id='conSDK' checked={conSDK} onCheckedChange={(val) => setConSDK(!!val)} />
                        <Label
                            htmlFor='conSDK'
                            className='font-semibold text-purple-900 text-xs leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
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
                                {period_list.map((p: any, i: number) => (
                                    <th
                                        key={i}
                                        className='min-w-[120px] border-purple-100 border-r border-b px-2 py-4 text-center font-bold text-purple-700'>
                                        Period {p.ttmP_PeriodName}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {table_list.map((row: any[], rIdx: number) => (
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
                                    {row.map((cell: any, cIdx: number) => {
                                        const isSel1 = selection1?.dayid === cell.dayid && selection1?.pedid === cell.pedid;
                                        const isSel2 = selection2?.dayid === cell.dayid && selection2?.pedid === cell.pedid;

                                        // Business logic for highlighting:
                                        // Legacy code shows green for Empty if a source is selected.
                                        const isHighlightGreen = selection1 && cell.value === 'Empty' && !isSel2;

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
                                                    isHighlightGreen && !isSel1 && !isSel2
                                                        ? 'border-green-200 bg-green-100 text-green-700'
                                                        : ''
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

                {/* DUAL ACTIONS FOOTER */}
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
                                <Button variant='ghost' onClick={handleClear} className='h-10 text-purple-600'>
                                    <X className='mr-1 h-4 w-4' /> Clear
                                </Button>
                                <Button
                                    onClick={handleReplace}
                                    disabled={!selection1 || !selection2 || isReplacing}
                                    className='h-10 bg-orange-500 px-8 font-bold text-white shadow-md hover:bg-orange-600'>
                                    {isReplacing ? (
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
