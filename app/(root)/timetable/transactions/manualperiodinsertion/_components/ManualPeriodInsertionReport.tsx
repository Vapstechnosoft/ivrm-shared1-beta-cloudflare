'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useManualPeriodInsertionReport, useManualPeriodMasters, useSaveManualPeriodInsertion } from '@/hooks/timetable/useTransactions';
import { cn } from '@/lib/utils';
import { Book, Save, User, X } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect, useMemo, useState } from 'react';

interface ManualPeriodInsertionReportProps {
    data: any; // This matches the filter values from the form
}



interface CellData {
    hrmE_Id: string;
    ismS_Id: string;
    staffName?: string;
    subjectName?: string;
}

interface ColumnItem {
    type: 'period' | 'break';
    id?: number;
    name: string;
    isBreak: boolean;
    afterPeriod?: string;
    raw?: any;
}

const EMPTY_OBJ = {};

export default function ManualPeriodInsertionReport({ data }: ManualPeriodInsertionReportProps) {
    const { data: masters } = useManualPeriodMasters();
    const { data: reportData, isLoading } = useManualPeriodInsertionReport(data);
    const { mutate: saveTimetable, isPending: isSaving } = useSaveManualPeriodInsertion();

    // State to track data for each cell: { "monday-1": { hrmE_Id: "...", ismS_Id: "..." } }
    const [cellData, setCellData] = useState<Record<string, CellData>>({});

    // State for cells currently highlighted for assignment
    const [selectedForAssignment, setSelectedForAssignment] = useState<Record<string, boolean>>({});
    const [tempSelection, setTempSelection] = useState<CellData>({ hrmE_Id: '', ismS_Id: '' });

    // Extract the nested data object if the API wraps it in { success: true, data: { ... } }
    const actualReportData = useMemo(() => {
        const raw = reportData?.data || reportData || EMPTY_OBJ;
        console.log('MANUAL PERIOD REPORT DATA EXTRACTED:', raw);
        console.log('MANUAL PERIOD REPORT DATA ALL KEYS:', Object.keys(raw || {}));
        return raw;
    }, [reportData]);

    // Available subjects from report response (subjectlist) with fallback to masters
    const availableSubjects = useMemo(() => {
        const list = actualReportData?.subjectlist || actualReportData?.subjectList || actualReportData?.subjects || [];
        if (Array.isArray(list) && list.length > 0) return list;
        return masters?.subjects || [];
    }, [actualReportData, masters]);

    // Construct columns (periods & breaks) from periodslst + break_list
    const columns = useMemo<ColumnItem[]>(() => {
        const periodList =
            actualReportData?.periodslst ||
            actualReportData?.periodList ||
            actualReportData?.allperiods ||
            actualReportData?.period_list ||
            actualReportData?.period_List ||
            [];
        const parseNum = (v: any): number => {
            if (v === null || v === undefined) return 0;
            const m = String(v).match(/\d+/);
            return m ? Number(m[0]) : 0;
        };

        const breakList =
            actualReportData?.break_list ||
            actualReportData?.breakList ||
            actualReportData?.tT_Break_list ||
            actualReportData?.break_list_all ||
            actualReportData?.allBreakList ||
            actualReportData?.tT_Break_list_all ||
            [];
        const timeTableList =
            actualReportData?.time_Table ||
            actualReportData?.timeTable ||
            actualReportData?.tt ||
            [];

        const getVal = (obj: any, keys: string[]) => {
            if (!obj) return null;
            const objKeys = Object.keys(obj).map(k => k.toLowerCase());
            for (const key of keys) {
                const idx = objKeys.indexOf(key.toLowerCase());
                if (idx !== -1) return obj[Object.keys(obj)[idx]];
            }
            return null;
        };

        if (Array.isArray(periodList) && periodList.length > 0) {
            const result: ColumnItem[] = [];

            // Collect unique breaks from breakList and break_list_all
            const uniqueBreaks: any[] = [];
            const seenKeys = new Set<string>();
            const rawBreaks = [
                ...(Array.isArray(breakList) ? breakList : []),
                ...(Array.isArray(actualReportData?.break_list_all) ? actualReportData.break_list_all : [])
            ];
            rawBreaks.forEach((b: any) => {
                const bAfter = b.ttmB_AfterPeriod ?? b.afterPeriod ?? b.ttmb_afterperiod;
                const bName = b.ttmB_BreakName || b.breakName || 'SHORT BREAK';
                const key = `${bAfter}_${bName}`;
                if (!seenKeys.has(key)) {
                    seenKeys.add(key);
                    uniqueBreaks.push(b);
                }
            });

            const addedBreaks = new Set<any>();

            const firstPedNum = parseNum(
                getVal(periodList[0], ['ttmp_periodname', 'periodname', 'ped_name', 'ttcp_periodname']) || 1
            );

            // 1. Insert breaks that occur before or at the first period in the grid (e.g. after period 1 when grid starts at 2)
            uniqueBreaks.forEach((b: any) => {
                const bAfter = parseNum(b.ttmB_AfterPeriod ?? b.afterPeriod ?? b.ttmb_afterperiod);
                if (bAfter < firstPedNum && !addedBreaks.has(b)) {
                    addedBreaks.add(b);
                    result.push({
                        type: 'break',
                        afterPeriod: String(bAfter),
                        name: b.ttmB_BreakName || b.breakName || 'SHORT BREAK',
                        isBreak: true,
                        raw: b
                    });
                }
            });

            // 2. Loop through each period and insert matching breaks
            periodList.forEach((period: any, idx: number) => {
                const pedId = getVal(period, ['ttmp_id', 'ped_id']) || (idx + 1);
                const rawPedName = getVal(period, ['ttmp_periodname', 'periodname', 'ped_name', 'ttcp_periodname']);
                const pedName = String(rawPedName || `Period ${idx + 1}`);
                const currentPedNum = parseNum(rawPedName || pedName || idx + 1);

                const nextPeriod = periodList[idx + 1];
                const nextRawPedName = nextPeriod
                    ? getVal(nextPeriod, ['ttmp_periodname', 'periodname', 'ped_name', 'ttcp_periodname'])
                    : null;
                const nextPedNum = nextPeriod ? parseNum(nextRawPedName || idx + 2) : Number.POSITIVE_INFINITY;

                result.push({
                    type: 'period',
                    id: Number(pedId),
                    name: pedName,
                    isBreak: false,
                    raw: period
                });

                // Check for breaks mapped directly after this period, or between this period and the next period
                uniqueBreaks.forEach((b: any) => {
                    if (addedBreaks.has(b)) return;
                    const bAfter = parseNum(b.ttmB_AfterPeriod ?? b.afterPeriod ?? b.ttmb_afterperiod);

                    const isExactMatch =
                        String(bAfter) === String(pedName) ||
                        String(b.ttmB_AfterPeriod) === String(pedName) ||
                        bAfter === currentPedNum;
                    const isBetween = bAfter > currentPedNum && bAfter < nextPedNum;

                    if (isExactMatch || isBetween) {
                        addedBreaks.add(b);
                        result.push({
                            type: 'break',
                            afterPeriod: String(bAfter),
                            name: b.ttmB_BreakName || b.breakName || 'SHORT BREAK',
                            isBreak: true,
                            raw: b
                        });
                    }
                });
            });

            // 3. Insert any remaining breaks (e.g. after the last period)
            uniqueBreaks.forEach((b: any) => {
                if (!addedBreaks.has(b)) {
                    addedBreaks.add(b);
                    const bAfter = b.ttmB_AfterPeriod ?? b.afterPeriod ?? b.ttmb_afterperiod;
                    result.push({
                        type: 'break',
                        afterPeriod: String(bAfter),
                        name: b.ttmB_BreakName || b.breakName || 'SHORT BREAK',
                        isBreak: true,
                        raw: b
                    });
                }
            });

            return result;
        }

        return [];
    }, [actualReportData]);

    // Construct day rows from gridweeks with fallback
    const days = useMemo(() => {
        const gridWeeks =
            actualReportData?.gridweeks ||
            actualReportData?.gridWeeks ||
            actualReportData?.day_list ||
            actualReportData?.allday ||
            actualReportData?.day_List ||
            [];
        const allBreakList =
            actualReportData?.break_list_all ||
            actualReportData?.allBreakList ||
            actualReportData?.tT_Break_list_all ||
            actualReportData?.break_list ||
            [];
        const timeTableList =
            actualReportData?.time_Table ||
            actualReportData?.timeTable ||
            actualReportData?.tt ||
            [];

        const getVal = (obj: any, keys: string[]) => {
            if (!obj) return null;
            const objKeys = Object.keys(obj).map(k => k.toLowerCase());
            for (const key of keys) {
                const idx = objKeys.indexOf(key.toLowerCase());
                if (idx !== -1) return obj[Object.keys(obj)[idx]];
            }
            return null;
        };

        const uniqueDayIdsFromBreaks = Array.from(
            new Set(
                Array.isArray(allBreakList)
                    ? allBreakList.map((b: any) => getVal(b, ['ttmd_id'])).filter(Boolean)
                    : []
            )
        );

        if (Array.isArray(gridWeeks) && gridWeeks.length > 0) {
            return gridWeeks.map((d: any, idx: number) => {
                const ttId = getVal(d, ['ttmd_id', 'day_id']);
                const ttmDId = ttId || uniqueDayIdsFromBreaks[idx];
                const ttmDName = getVal(d, ['ttmd_dayname', 'dayname', 'day_name']) || d.name || `Day ${idx + 1}`;
                return {
                    dayId: Number(ttmDId),
                    dayName: String(ttmDName)
                };
            });
        }

        return [];
    }, [actualReportData]);

    // Get break name and timing for a specific day and break column
    const getBreakInfo = (day: { dayId: number | null; dayName: string }, col: any) => {
        const allBreakList =
            actualReportData?.break_list_all ||
            actualReportData?.allBreakList ||
            actualReportData?.tT_Break_list_all ||
            actualReportData?.break_list ||
            [];

        if (Array.isArray(allBreakList) && allBreakList.length > 0) {
            // 1. Match by day and period
            let matchedBreak = allBreakList.find((b: any) => {
                const bDayId = b.ttmD_Id || b.TTMD_Id || b.day_id;
                const bAfter = b.ttmB_AfterPeriod ?? b.afterPeriod;

                const isDayMatch =
                    (day.dayId && Number(bDayId) === Number(day.dayId)) ||
                    (b.ttmd_DayName && String(b.ttmd_DayName).toLowerCase() === day.dayName.toLowerCase()) ||
                    (b.ttmD_DayName && String(b.ttmD_DayName).toLowerCase() === day.dayName.toLowerCase());
                const isPeriodMatch =
                    String(bAfter) === String(col.afterPeriod) || Number(bAfter) === Number(col.afterPeriod);

                return isDayMatch && isPeriodMatch;
            });

            // 2. Fallback: match by break name or period if day-specific row was not mapped
            if (!matchedBreak) {
                matchedBreak = allBreakList.find((b: any) => {
                    const bAfter = b.ttmB_AfterPeriod ?? b.afterPeriod;
                    const isPeriodMatch =
                        String(bAfter) === String(col.afterPeriod) || Number(bAfter) === Number(col.afterPeriod);
                    const isNameMatch =
                        b.ttmB_BreakName &&
                        col.name &&
                        String(b.ttmB_BreakName).trim().toLowerCase() === String(col.name).trim().toLowerCase();
                    return isPeriodMatch || isNameMatch;
                });
            }

            if (matchedBreak) {
                const startTime = matchedBreak.ttmB_BreakStartTime;
                const endTime = matchedBreak.ttmB_BreakEndTime;
                const timeStr = startTime && endTime ? `${startTime} - ${endTime}` : '';
                return {
                    breakName: matchedBreak.ttmB_BreakName || col.name || 'SHORT BREAK',
                    breakTime: timeStr
                };
            }
        }

        return {
            breakName: col.name || 'SHORT BREAK',
            breakTime: ''
        };
    };

    // Helper to find subject name by ID from availableSubjects or masters
    const getSubjectName = (ismsId: any) => {
        if (!ismsId) return '';
        const numId = Number(ismsId);
        const foundInReport = availableSubjects.find((s: any) => Number(s.ismS_Id) === numId);
        if (foundInReport) return foundInReport.ismS_SubjectName || foundInReport.subjectName || '';
        const foundInMasters = masters?.subjects?.find((s: any) => Number(s.ismS_Id) === numId);
        return foundInMasters?.ismS_SubjectName || '';
    };

    useEffect(() => {
        const timeTableList = actualReportData?.time_Table || actualReportData?.timeTable || actualReportData?.tt;
        if (Array.isArray(timeTableList) && timeTableList.length > 0) {
            const newCellData: Record<string, CellData> = {};
            timeTableList.forEach((item: any) => {
                const day = item.ttmd_DayName || item.ttmD_DayName || item.dayName || item.day_name;
                const period = item.ttcP_PeriodName || item.ttmP_PeriodName || item.periodName || item.ped_name;
                const ismsIdVal = item.ismS_Id || item.isms_Id || item.isms_id || item.ISMS_Id;
                const hrmeIdVal = item.hrmE_Id || item.hrme_Id || item.hrme_id || item.HRME_Id;

                const staffObj = masters?.staff?.find((s: any) => Number(s.hrmE_Id) === Number(hrmeIdVal));
                const subjName = item.ismS_SubjectName || item.subjectName || getSubjectName(ismsIdVal);

                const cellObj: CellData = {
                    hrmE_Id: hrmeIdVal?.toString() || '',
                    ismS_Id: ismsIdVal?.toString() || '',
                    staffName: item.staffName || item.hrmE_EmployeeFirstName || staffObj?.staffName || '',
                    subjectName: subjName || ''
                };

                const dId = item.ttmD_Id || item.TTMD_Id || item.day_id || item.ttmd_id;
                const pId = item.ttmP_Id || item.TTMP_Id || item.ped_id || item.ttmp_id;

                if (dId && pId) {
                    newCellData[`${dId}-${pId}`] = cellObj;
                }

                if (day && period) {
                    const dayStr = String(day).toLowerCase().trim();
                    const periodStr = String(period).toLowerCase().trim();
                    newCellData[`${dayStr}-${periodStr}`] = cellObj;

                    const cleanPeriod = periodStr.replace(/^period\s*/, '').trim();
                    newCellData[`${dayStr}-${cleanPeriod}`] = cellObj;
                    newCellData[`${dayStr}-period ${cleanPeriod}`] = cellObj;
                }
            });
            setCellData(newCellData);
        } else {
            setCellData((prev) => (Object.keys(prev).length === 0 ? prev : {}));
        }
    }, [actualReportData, masters, availableSubjects]);

    const getCellKey = (dayObj: any, col: any) => {
        return dayObj?.dayId && col?.id
            ? `${dayObj.dayId}-${col.id}`
            : `${String(dayObj.dayName).toLowerCase().trim()}-${String(col.name).toLowerCase().trim()}`;
    };

    const getCellDataForCell = (dayObj: any, col: any) => {
        const idKey = dayObj?.dayId && col?.id ? `${dayObj.dayId}-${col.id}` : null;
        const nameKey = `${String(dayObj.dayName).toLowerCase().trim()}-${String(col.name).toLowerCase().trim()}`;
        const cleanPeriod = String(col.name).toLowerCase().replace(/^period\s*/, '').trim();
        const cleanKey = `${String(dayObj.dayName).toLowerCase().trim()}-${cleanPeriod}`;

        return (idKey && cellData[idKey]) || cellData[nameKey] || cellData[cleanKey];
    };

    const toggleSelection = (dayObj: any, col: any) => {
        if (col.isBreak) return;

        const key = getCellKey(dayObj, col);
        setSelectedForAssignment((prev) => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const colIdFromKey = (periodNameStr: string) => {
        const cleanStr = periodNameStr.toLowerCase().replace(/^period\s*/, '').trim();
        const matchedCol = columns.find(
            (c) =>
                !c.isBreak &&
                (c.name.toLowerCase().trim() === periodNameStr.toLowerCase() ||
                    c.name.toLowerCase().replace(/^period\s*/, '').trim() === cleanStr ||
                    String(c.id) === cleanStr)
        );
        return matchedCol?.id || null;
    };

    const handleSave = () => {
        const selectedKeys = Object.keys(selectedForAssignment).filter((k) => selectedForAssignment[k]);
        if (selectedKeys.length === 0) return;

        const payloadTimeTable: any[] = [];
        const periodList =
            actualReportData?.periodslst ||
            actualReportData?.periodList ||
            actualReportData?.allperiods ||
            actualReportData?.period_list ||
            actualReportData?.period_List ||
            [];

        const getVal = (obj: any, keys: string[]) => {
            if (!obj) return null;
            const objKeys = Object.keys(obj).map(k => k.toLowerCase());
            for (const key of keys) {
                const idx = objKeys.indexOf(key.toLowerCase());
                if (idx !== -1) return obj[Object.keys(obj)[idx]];
            }
            return null;
        };

        // Recreate the dayperiodlist to generate the exact same "ID" property as Angular
        let idd = 0;
        const dayperiodlist: any[] = [];

        days.forEach((mm) => {
            periodList.forEach((nn: any) => {
                idd++;
                dayperiodlist.push({
                    id: idd,
                    TTMD_Id: Number(mm.dayId),
                    TTMP_Id: Number(getVal(nn, ['ttmp_id', 'ped_id']))
                });
            });
        });

        selectedKeys.forEach((key) => {
            const separatorIndex = key.indexOf('-');
            const part1 = key.substring(0, separatorIndex).trim();
            const part2 = key.substring(separatorIndex + 1).trim();

            let ttmD_Id: number | null = null;
            let ttmP_Id: number | null = null;

            if (!Number.isNaN(Number(part1)) && !Number.isNaN(Number(part2)) && Number(part1) > 0 && Number(part2) > 0) {
                ttmD_Id = Number(part1);
                ttmP_Id = Number(part2);
            } else {
                const dayObj = days.find(
                    (d) =>
                        d.dayName.toLowerCase().trim() === part1.toLowerCase() ||
                        String(d.dayId) === part1
                );
                const cleanPart2 = part2.toLowerCase().replace(/^period\s*/, '').trim();
                const periodObj = Array.isArray(periodList)
                    ? periodList.find((p: any) => {
                        const pName = String(
                            getVal(p, ['ttmp_periodname', 'periodname', 'ttcp_periodname', 'ped_name']) || ''
                        )
                            .toLowerCase()
                            .trim();
                        const pClean = pName.replace(/^period\s*/, '').trim();
                        return (
                            pName === part2.toLowerCase() ||
                            pClean === cleanPart2 ||
                            String(getVal(p, ['ttmp_id', 'ped_id'])) === part2
                        );
                    })
                    : null;

                const colMatch = columns.find(
                    (c) =>
                        !c.isBreak &&
                        (c.name.toLowerCase().trim() === part2.toLowerCase() ||
                            c.name.toLowerCase().replace(/^period\s*/, '').trim() === cleanPart2 ||
                            String(c.id) === part2 ||
                            String(c.id) === cleanPart2)
                );

                ttmD_Id = dayObj?.dayId ? Number(dayObj.dayId) : null;
                ttmP_Id = periodObj ? Number(getVal(periodObj, ['ttmp_id', 'ped_id']))
                    : (colMatch?.id ? Number(colMatch.id) : (colIdFromKey(part2) || (Number(cleanPart2) ? Number(cleanPart2) : null)));
            }

            // Fallback for period if still null
            if (!ttmP_Id) {
                const num = part2.replace(/\D/g, '');
                if (num) {
                    ttmP_Id = Number(num);
                }
            }
            console.log('Resolved IDs for key:', key, '=> ttmD_Id:', ttmD_Id, ', ttmP_Id:', ttmP_Id);

            if (ttmD_Id && ttmP_Id) {
                // Find matching generated ID
                const matchedItem = dayperiodlist.find(
                    (dp) => Number(dp.TTMD_Id) === Number(ttmD_Id) && Number(dp.TTMP_Id) === Number(ttmP_Id)
                );

                payloadTimeTable.push({
                    ID: matchedItem ? matchedItem.id : 0,
                    TTMD_Id: Number(ttmD_Id),
                    TTMP_Id: Number(ttmP_Id)
                });
            }
        });

        if (payloadTimeTable.length === 0) {
            toast.error('Invalid selection', { description: 'Could not map selected periods to their IDs.' });
            return;
        }

        const finalPayload = {
            ASMAY_Id: Number(data.asmaY_Id),
            TTMC_Id: Number(data.ttmC_Id),
            ASMCL_Id: Number(data.asmcL_Id),
            ASMS_Id: Number(data.asms_Id),
            HRME_Id: Number(tempSelection.hrmE_Id),
            ISMS_Id: Number(tempSelection.ismS_Id),
            Time_Table: payloadTimeTable
        };

        saveTimetable(finalPayload, {
            onSuccess: (res: any) => {
                const isSuccess =
                    res?.success === true ||
                    res?.returnval === true ||
                    res?.returnval === 'true' ||
                    res?.returnVal === true ||
                    res?.returnVal === 'true' ||
                    res?.returnval === 'saved' ||
                    (res && typeof res === 'object' && res?.success !== false && res?.returnval !== false && res?.returnVal !== false && !res?.error);

                if (isSuccess) {
                    toast.success('Saved Successfully', { description: res.message || 'Periods mapped to staff/subject.' });

                    const selectedStaff = masters?.staff?.find((s) => s.hrmE_Id.toString() === tempSelection.hrmE_Id);
                    const selectedSubject = availableSubjects.find((s: any) => s.ismS_Id.toString() === tempSelection.ismS_Id);

                    const newData = { ...cellData };
                    selectedKeys.forEach((key) => {
                        newData[key] = {
                            ...tempSelection,
                            staffName: selectedStaff?.staffName || '',
                            subjectName: selectedSubject?.ismS_SubjectName || selectedSubject?.subjectName || ''
                        };
                    });

                    setCellData(newData);
                    setSelectedForAssignment({});
                } else {
                    toast.error('Save failed', { description: res?.message || 'Failed to save configuration.' });
                }
            },
            onError: (err: any) => {
                toast.error('Error occurred while saving', { description: err.message || 'Please try again later.' });
            }
        });
    };

    const hasSelection = Object.values(selectedForAssignment).some((v) => v);

    const isConfigured = (actualReportData?.gridweeks?.length > 0 || actualReportData?.gridWeeks?.length > 0) &&
        (actualReportData?.periodslst?.length > 0 || actualReportData?.periodList?.length > 0);

    if (isLoading) {
        return (
            <div className='flex h-64 items-center justify-center bg-white'>
                <div className='flex flex-col items-center gap-2'>
                    <div className='h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent' />
                    <p className='text-purple-600'>Loading timetable grid...</p>
                </div>
            </div>
        );
    }

    return (
        <div className='overflow-x-auto bg-white p-6'>
            <div className='mb-6 flex items-center justify-between border-slate-100 border-b pb-4'>
                <div>
                    <h3 className='font-bold text-lg text-purple-900'>Time Table Grid View</h3>
                    <p className='text-slate-500 text-sm'>Select one or more period cells, then assign Staff/Subject.</p>
                </div>
            </div>

            {!isConfigured && actualReportData && Object.keys(actualReportData).length > 0 && (
                <div className='mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800 shadow-sm'>
                    <p className='font-semibold text-sm'>⚠️ Master Days or Periods are not configured for this Class / Category.</p>
                    <p className='text-xs mt-1 text-amber-700'>
                        Please configure <strong>Master Day Classwise</strong> and <strong>Master Period Classwise</strong> in Timetable Masters before inserting periods.
                    </p>
                </div>
            )}

            <div className='overflow-hidden rounded-xl border border-purple-100 shadow-sm'>
                <Table>
                    <TableHeader className='bg-purple-50'>
                        <TableRow>
                            <TableHead className='min-w-[120px] border-purple-100 border-r font-bold text-purple-900'>
                                Day / Period
                            </TableHead>
                            {columns.map((col: any, index: number) => (
                                <TableHead
                                    key={index}
                                    className={cn(
                                        'min-w-[130px] text-center font-bold text-purple-900',
                                        col.isBreak ? 'bg-amber-50/80 text-amber-800 border-amber-100' : ''
                                    )}>
                                    {col.isBreak ? (
                                        <span className='font-extrabold text-amber-800 text-xs uppercase tracking-wider'>
                                            {col.name}
                                        </span>
                                    ) : (
                                        <span>
                                            {col.name.toLowerCase().startsWith('period') ? col.name : `Period ${col.name}`}
                                        </span>
                                    )}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {days.map((dayObj: any) => (
                            <TableRow key={dayObj.dayName} className='transition-colors hover:bg-slate-50'>
                                <TableCell className='border-purple-100 border-r bg-slate-50/50 font-bold text-slate-700 italic'>
                                    {dayObj.dayName}
                                </TableCell>
                                {columns.map((col: any, index: number) => {
                                    if (col.isBreak) {
                                        const breakInfo = getBreakInfo(dayObj, col);
                                        return (
                                            <TableCell
                                                key={index}
                                                className='h-24 cursor-not-allowed border-amber-100 border-r bg-amber-50/40 p-2 text-center select-none'>
                                                <div className='flex flex-col items-center justify-center gap-1 text-center'>
                                                    <span className='font-bold text-amber-800 text-xs uppercase tracking-wide'>
                                                        {breakInfo.breakName}
                                                    </span>
                                                    {breakInfo.breakTime && (
                                                        <span className='rounded bg-amber-100/80 px-1.5 py-0.5 font-medium text-[10px] text-amber-900/80'>
                                                            {breakInfo.breakTime}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                        );
                                    }

                                    const cellKey = getCellKey(dayObj, col);
                                    const cellDataVal = getCellDataForCell(dayObj, col);
                                    const isAssigned = !!cellDataVal && (cellDataVal.hrmE_Id || cellDataVal.ismS_Id);
                                    const isSelected = !!selectedForAssignment[cellKey];

                                    return (
                                        <TableCell
                                            key={index}
                                            onClick={() => toggleSelection(dayObj, col)}
                                            className={cn(
                                                'relative h-24 cursor-pointer select-none border-slate-100 border-r p-2 text-center transition-all duration-200',
                                                'hover:bg-purple-50',
                                                isSelected
                                                    ? 'z-10 bg-purple-600 ring-2 ring-purple-400 ring-inset'
                                                    : isAssigned
                                                        ? 'bg-purple-100 text-purple-900'
                                                        : 'bg-white'
                                            )}>
                                            {isAssigned ? (
                                                <div
                                                    className={cn(
                                                        'zoom-in-95 flex animate-in flex-col items-center gap-1',
                                                        isSelected ? 'text-white' : 'text-purple-900'
                                                    )}>
                                                    <div className='line-clamp-1 font-bold text-xs leading-tight'>
                                                        {cellDataVal.staffName}
                                                    </div>
                                                    <div className='line-clamp-1 text-[11px] opacity-90'>{cellDataVal.subjectName}</div>
                                                </div>
                                            ) : null}
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Assignment Controls Below Timetable */}
            <div
                className={cn(
                    'mt-8 rounded-2xl border border-purple-100 bg-purple-50 p-6 transition-all duration-300',
                    !hasSelection ? 'pointer-events-none opacity-50 grayscale-[0.5]' : 'opacity-100'
                )}>
                <div className='flex flex-col items-end gap-6 md:flex-row'>
                    <div className='flex-1 space-y-2'>
                        <Label className='flex items-center gap-2 font-bold text-purple-900'>
                            <User className='h-4 w-4 text-purple-500' /> Staff Name
                            {hasSelection && (
                                <span className='font-normal text-purple-600 text-xs'>
                                    ({Object.values(selectedForAssignment).filter((v) => v).length} periods selected)
                                </span>
                            )}
                        </Label>
                        <Select
                            value={tempSelection.hrmE_Id}
                            onValueChange={(val) => setTempSelection((prev) => ({ ...prev, hrmE_Id: val }))}>
                            <SelectTrigger className='h-10 rounded-lg border-purple-200 bg-white focus:ring-purple-500'>
                                <SelectValue placeholder='-- Select Staff --' />
                            </SelectTrigger>
                            <SelectContent>
                                {masters?.staff?.map((s) => (
                                    <SelectItem key={s.hrmE_Id} value={s.hrmE_Id.toString()}>
                                        {s.staffName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className='flex-1 space-y-2'>
                        <Label className='flex items-center gap-2 font-bold text-purple-900'>
                            <Book className='h-4 w-4 text-purple-500' /> Subject
                        </Label>
                        <Select
                            value={tempSelection.ismS_Id}
                            onValueChange={(val) => setTempSelection((prev) => ({ ...prev, ismS_Id: val }))}>
                            <SelectTrigger className='h-10 rounded-lg border-purple-200 bg-white focus:ring-purple-500'>
                                <SelectValue placeholder='-- Select Subject --' />
                            </SelectTrigger>
                            <SelectContent className='max-h-60 overflow-y-auto'>
                                {availableSubjects?.map((subj: any) => (
                                    <SelectItem key={subj.ismS_Id} value={subj.ismS_Id.toString()}>
                                        {subj.ismS_SubjectName || subj.subjectName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className='flex gap-2'>
                        <Button
                            type='button'
                            onClick={handleSave}
                            disabled={!hasSelection || !tempSelection.hrmE_Id || !tempSelection.ismS_Id}
                            className='h-10 rounded-lg bg-orange-500 px-8 font-bold text-white shadow-lg shadow-orange-100 hover:bg-orange-600'>
                            <Save className='mr-2 h-4 w-4' />
                            {isSaving ? 'Saving...' : 'Save'}
                        </Button>
                        {hasSelection && (
                            <Button
                                type='button'
                                variant='ghost'
                                onClick={() => setSelectedForAssignment({})}
                                className='h-10 rounded-lg text-purple-600 hover:bg-purple-100'>
                                <X className='h-5 w-5' />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
