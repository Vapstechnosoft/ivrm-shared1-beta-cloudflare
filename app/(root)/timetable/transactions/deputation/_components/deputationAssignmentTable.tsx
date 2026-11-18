'use client';

import { Button } from '@/components/ui/button';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useSaveDeputationDetails } from '@/hooks/timetable/useTransactions';
import { getFreeStaffDets } from '@/server/timetable/transactions/deputation';
import type { IPeriodAssignmentRow, ISubstituteStaffOption } from '@/types/timetable/Transaction/deputation';
import { format } from 'date-fns';
import { AlertTriangle, Eye, Loader2, Save, UserCheck, UserMinus, UserPlus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import DeputationHistoryModal from './deputationHistoryModal';
import StaffTimetableModal from './staffTimetableModal';

interface DeputationAssignmentTableProps {
    periodsData: any; // Raw response from get_period_alloted
    selection: {
        date: Date;
        dateStr: string;
        dayId: number;
        dayName: string;
        asmaY_Id: number;
        absentStaffId: number;
        absflag: boolean;
        remarks: string;
        smsflag: boolean;
        mailflag: boolean;
        noT_Flag: boolean;
        masters: any;
    };
    onSaveSuccess?: () => void;
    onCancel?: () => void;
}

export default function DeputationAssignmentTable({ periodsData, selection, onSaveSuccess, onCancel }: DeputationAssignmentTableProps) {
    const [periodRows, setPeriodRows] = useState<IPeriodAssignmentRow[]>([]);
    const [loadingPeriods, setLoadingPeriods] = useState(false);

    // Modals state
    const [timetableModalState, setTimetableModalState] = useState<{
        open: boolean;
        asmaY_Id: number;
        hrmE_Id: number;
        staffName?: string;
    }>({
        open: false,
        asmaY_Id: 0,
        hrmE_Id: 0
    });

    const [historyModalState, setHistoryModalState] = useState<{
        open: boolean;
        mode: 'deputation' | 'absent';
        asmaY_Id: number;
        hrmE_Id: number;
        staffName?: string;
    }>({
        open: false,
        mode: 'deputation',
        asmaY_Id: 0,
        hrmE_Id: 0
    });

    const saveMutation = useSaveDeputationDetails();

    // Extract raw period list from get_period_alloted response
    const periodsPayload = periodsData?.data !== undefined ? periodsData.data : periodsData;
    const rawTimeTableList: any[] =
        Array.isArray(periodsPayload?.time_Table) && periodsPayload.time_Table.length > 0
            ? periodsPayload.time_Table
            : Array.isArray(periodsPayload?.periodslst) && periodsPayload.periodslst.length > 0
            ? periodsPayload.periodslst
            : Array.isArray(periodsPayload?.period_list) && periodsPayload.period_list.length > 0
            ? periodsPayload.period_list
            : Array.isArray(periodsPayload)
            ? periodsPayload
            : [];

    // Load period table and fetch free staff for each period (cell_click logic from legacy AngularJS)
    useEffect(() => {
        let isMounted = true;

        if (!rawTimeTableList || rawTimeTableList.length === 0 || !selection) {
            setPeriodRows([]);
            setLoadingPeriods(false);
            return;
        }

        // 1. Immediately create initial rows from raw period list so table binds instantly
        const initialRows: IPeriodAssignmentRow[] = rawTimeTableList.map((user) => {
            const ttmD_Id = Number(user.ttmD_Id || selection.dayId);
            const ttmP_Id = Number(user.ttmP_Id || 0);
            const asmaY_Id = Number(user.asmaY_Id || selection.asmaY_Id);
            const hrmE_Id = Number(user.hrmE_Id || selection.absentStaffId);

            return {
                ttmD_Id,
                ttmP_Id,
                ttmD_DayName: user.ttmD_DayName || selection.dayName,
                ttmP_PeriodName: user.ttmP_PeriodName || (user.ttmP_Id ? `Period ${user.ttmP_Id}` : `Period`),
                hrmE_Id,
                asmaY_Id,
                asmcL_Id: Number(user.asmcL_Id || 0),
                asmS_Id: Number(user.asmS_Id || 0),
                ttfgD_Id: user.ttfgD_Id,
                asmcL_ClassName: user.asmcL_ClassName || '',
                asmC_SectionName: user.asmC_SectionName || '',
                ismS_SubjectName: user.ismS_SubjectName || '',
                substitutestafflist: [],
                Sub_Id: '',
                HRMEnew_Id: undefined,
                daycnt: 0,
                weekcnt: 0,
                currdaydeputed: 0,
                weekcntdeputed: 0,
                mntcntdeputed: 0,
                totaldeputedcount: 0,
                freeperioddaily: 0,
                freeperiodweekly: 0
            };
        });

        setPeriodRows(initialRows);

        // 2. Fetch free substitute staff concurrently for each period in parallel
        const loadSubstituteStaff = async () => {
            setLoadingPeriods(true);
            try {
                const updatedRows = await Promise.all(
                    initialRows.map(async (row) => {
                        try {
                            const freeStaffRes = await getFreeStaffDets({
                                ASMAY_Id: row.asmaY_Id,
                                TTMD_Id: row.ttmD_Id,
                                TTMP_Id: row.ttmP_Id,
                                HRME_Id: row.hrmE_Id,
                                TTSD_Date: selection.dateStr
                            });

                            const resPayload = freeStaffRes?.data !== undefined ? freeStaffRes.data : freeStaffRes;
                            const freeList: any[] = resPayload?.time_Table_substitute || resPayload?.stafflist || [];
                            const dpcount: any[] = resPayload?.dpcount || [];
                            const absentstfcnt: any[] = resPayload?.absentstfcnt || [];
                            const weeklycntlist: any[] = resPayload?.weeklycntlist || [];
                            const freeWeeklyCount = Array.isArray(resPayload?.freeperiodweekly) ? resPayload.freeperiodweekly.length : 0;
                            const freeDailyCount = Array.isArray(resPayload?.freeperioddaily) ? resPayload.freeperioddaily.length : 0;
                            const periodslst: any[] =
                                Array.isArray(resPayload?.periodslst) && resPayload.periodslst.length > 0
                                    ? resPayload.periodslst
                                    : Array.isArray(periodsPayload?.periodslst)
                                    ? periodsPayload.periodslst
                                    : [];

                            // Build unique mainstafflist
                            const staffMap = new Map<number, ISubstituteStaffOption>();

                            for (const eps of freeList) {
                                const staffId = Number(eps.hrmE_Id);
                                if (!staffMap.has(staffId)) {
                                    staffMap.set(staffId, {
                                        HRME_Id: staffId,
                                        STAFF: eps.staffName || `Staff #${staffId}`,
                                        EMPCODE: eps.hrmE_EmployeeCode || '',
                                        DCNT: eps.DCNT,
                                        WCNT: eps.WCNT,
                                        MCNT: eps.MCNT,
                                        YCNT: eps.YCNT,
                                        asmaY_Id: eps.asmaY_Id,
                                        deviceid: eps.deviceid,
                                        freeperioddaily: freeDailyCount,
                                        freeperiodweekly: freeWeeklyCount,
                                        daycnt: 0,
                                        weekcnt: 0,
                                        mntcnt: 0,
                                        totalcnt: 0,
                                        daycnt1: 0,
                                        weekcnt1: 0,
                                        mntcnt1: 0,
                                        totalcnt1: 0,
                                        WWCNT: 0,
                                        DAYTL: 0,
                                        list: []
                                    });
                                }
                            }

                            // Attach counts from dpcount, absentstfcnt, weeklycntlist
                            staffMap.forEach((staffObj) => {
                                const dp = dpcount.find((xx) => Number(xx.HRME_Id) === staffObj.HRME_Id);
                                if (dp) {
                                    staffObj.weekcnt = Number(dp.WeekStaffcount || 0);
                                    staffObj.mntcnt = Number(dp.MonthStaffcount || 0);
                                    staffObj.totalcnt = Number(dp.YearStaffcount || 0);
                                    staffObj.daycnt = Number(dp.TodayStaffcount || 0);
                                }

                                const absCount = absentstfcnt.find((xx) => Number(xx.HRME_Id) === staffObj.HRME_Id);
                                if (absCount) {
                                    staffObj.weekcnt1 = Number(absCount.WeekStaffcount || 0);
                                    staffObj.mntcnt1 = Number(absCount.MonthStaffcount || 0);
                                    staffObj.totalcnt1 = Number(absCount.YearStaffcount || 0);
                                    staffObj.daycnt1 = Number(absCount.TodayStaffcount || 0);
                                }

                                const weeklyItem = weeklycntlist.find((xx) => Number(xx.HRME_Id) === staffObj.HRME_Id);
                                if (weeklyItem) {
                                    staffObj.WWCNT = Number(weeklyItem.TPCOUNT || 0);
                                }

                                // Calculate list of classes/periods taught on this day
                                const templist: any[] = [];
                                for (const pp of periodslst) {
                                    let clsdetails = '';
                                    let subdetails = '';
                                    for (const tt of freeList) {
                                        if (Number(tt.hrmE_Id) === staffObj.HRME_Id && Number(tt.ttmP_Id) === Number(pp.ttmP_Id)) {
                                            if (!clsdetails) {
                                                clsdetails = `${tt.asmcL_ClassName || ''}&${tt.asmC_SectionName || ''}`;
                                            } else {
                                                clsdetails += ` AND ${tt.asmcL_ClassName || ''}&${tt.asmC_SectionName || ''}`;
                                            }

                                            if (!subdetails) {
                                                subdetails = tt.ismS_SubjectName || '';
                                            } else if (subdetails !== tt.ismS_SubjectName) {
                                                subdetails += ` AND ${tt.ismS_SubjectName || ''}`;
                                            }
                                        }
                                    }
                                    if (clsdetails && subdetails) {
                                        templist.push({
                                            TTMP_Id: pp.ttmP_Id,
                                            PR: `P--${pp.ttmP_PeriodName}`,
                                            CLS: clsdetails,
                                            SUB: subdetails
                                        });
                                    }
                                }
                                staffObj.list = templist;
                                staffObj.DAYTL = templist.length;
                            });

                            return {
                                ...row,
                                substitutestafflist: Array.from(staffMap.values())
                            };
                        } catch (err) {
                            console.error(`Error loading free staff for period ${row.ttmP_Id}:`, err);
                            return row;
                        }
                    })
                );

                if (isMounted) {
                    setPeriodRows(updatedRows);
                }
            } finally {
                if (isMounted) {
                    setLoadingPeriods(false);
                }
            }
        };

        loadSubstituteStaff();

        return () => {
            isMounted = false;
        };
    }, [periodsData, selection]);

    // Handle substitute staff change for a specific period row (onsubstaffchange in AngularJS)
    const handleSubStaffChange = (periodId: number, staffIdStr: string) => {
        const staffId = Number(staffIdStr);
        setPeriodRows((prevRows) =>
            prevRows.map((row) => {
                if (row.ttmP_Id !== periodId) return row;

                if (!staffId) {
                    return {
                        ...row,
                        Sub_Id: '',
                        HRMEnew_Id: undefined,
                        daycnt: 0,
                        weekcnt: 0,
                        currdaydeputed: 0,
                        weekcntdeputed: 0,
                        mntcntdeputed: 0,
                        totaldeputedcount: 0,
                        freeperioddaily: 0,
                        freeperiodweekly: 0
                    };
                }

                const selectedStaff = row.substitutestafflist.find((s) => s.HRME_Id === staffId);
                if (!selectedStaff) {
                    return {
                        ...row,
                        Sub_Id: staffId,
                        HRMEnew_Id: staffId
                    };
                }

                return {
                    ...row,
                    Sub_Id: staffId,
                    HRMEnew_Id: staffId,
                    daycnt: selectedStaff.DAYTL || 0,
                    weekcnt: selectedStaff.WWCNT || 0,
                    mntcnt: selectedStaff.mntcnt || 0,
                    currdaydeputed: selectedStaff.daycnt || 0,
                    weekcntdeputed: selectedStaff.weekcnt || 0,
                    mntcntdeputed: selectedStaff.mntcnt || 0,
                    totaldeputedcount: selectedStaff.totalcnt || 0,
                    weekcnt1: selectedStaff.weekcnt1 || 0,
                    mntcnt1: selectedStaff.mntcnt1 || 0,
                    totalcnt1: selectedStaff.totalcnt1 || 0,
                    freeperioddaily: selectedStaff.freeperioddaily || 0,
                    freeperiodweekly: selectedStaff.freeperiodweekly || 0
                };
            })
        );
    };

    // Save All Period Deputations (saveddata in AngularJS)
    const handleSaveAll = async () => {
        // Find which periods have a substitute assigned
        const assignedPeriods = periodRows.filter((row) => Number(row.Sub_Id) > 0);

        if (assignedPeriods.length === 0) {
            toast.error('Please Select Substitute Staff List for at least one period !');
            return;
        }

        const subarray = assignedPeriods.map((user) => ({
            ttmD_Id: user.ttmD_Id,
            ttmP_Id: user.ttmP_Id,
            asmaY_Id: user.asmaY_Id,
            asmcL_Id: user.asmcL_Id,
            asmS_Id: user.asmS_Id,
            TTSD_DeputedStaff: Number(user.Sub_Id)
        }));

        const payload = {
            TTSD_Id: 0,
            ASMAY_Id: selection.asmaY_Id,
            TTSD_Date: selection.dateStr,
            TTSD_AbsentStaff: selection.absentStaffId,
            TTSD_Remarks: selection.remarks || '',
            smsflag: selection.smsflag,
            mailflag: selection.mailflag,
            NOT_Flag: selection.noT_Flag,
            subarray: subarray
        };

        try {
            const res = await saveMutation.mutateAsync(payload);
            const resData = res?.data !== undefined ? res.data : res;

            if (resData?.returnval === true || resData === true || resData?.success === true) {
                toast.success('Data successfully Saved');
                if (onSaveSuccess) onSaveSuccess();
            } else {
                toast.error(resData?.message || 'Data Not Saved !');
            }
        } catch (error: any) {
            console.error('Error saving deputation:', error);
            toast.error(error?.message || 'Failed to save deputation');
        }
    };

    if (loadingPeriods && periodRows.length === 0) {
        return (
            <CollapsibleSection title='Absent Staff Time Table' defaultOpen>
                <div className='flex h-48 flex-col items-center justify-center gap-3 rounded-2xl border border-purple-100 bg-white p-8 text-center shadow-lg shadow-purple-500/5'>
                    <Loader2 className='h-8 w-8 animate-spin text-purple-600' />
                    <p className='font-bold text-base text-purple-900'>Loading Period Allocations & Available Staff...</p>
                    <p className='text-muted-foreground text-xs'>Please wait while substitute staff statistics are calculated.</p>
                </div>
            </CollapsibleSection>
        );
    }

    if (!periodRows || periodRows.length === 0) {
        return (
            <CollapsibleSection title='Absent Staff Time Table' defaultOpen>
                <div className='flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-6 text-amber-900 shadow-sm'>
                    <AlertTriangle className='h-6 w-6 flex-shrink-0 text-amber-600' />
                    <div>
                        <h4 className='font-bold text-sm'>No periods Allocated</h4>
                        <p className='text-amber-800 text-xs'>No periods are allocated to the selected staff for this day.</p>
                    </div>
                </div>
            </CollapsibleSection>
        );
    }

    return (
        <CollapsibleSection title='Absent Staff Time Table' defaultOpen>
            <div className='space-y-6 rounded-2xl border border-purple-100 bg-white p-6 shadow-lg shadow-purple-500/5'>
                {/* Header Stats Bar */}
                <div className='flex flex-wrap items-center justify-between gap-4 border-purple-100 border-b pb-4'>
                    <div className='flex items-center gap-3'>
                        <UserCheck className='h-5 w-5 text-purple-700' />
                        <h3 className='font-bold text-base text-purple-900'>
                            Allocated Periods for Deputation ({periodRows.length} Period{periodRows.length > 1 ? 's' : ''})
                        </h3>
                        {loadingPeriods && (
                            <span className='flex items-center gap-1.5 rounded-full bg-purple-100 px-2.5 py-0.5 font-semibold text-[11px] text-purple-700'>
                                <Loader2 className='h-3.5 w-3.5 animate-spin text-purple-600' />
                                Fetching Substitute Staff...
                            </span>
                        )}
                    </div>

                    <div className='flex items-center gap-2'>
                        <Button
                            type='button'
                            size='sm'
                            variant='outline'
                            onClick={() =>
                                setHistoryModalState({
                                    open: true,
                                    mode: 'deputation',
                                    asmaY_Id: selection.asmaY_Id,
                                    hrmE_Id: selection.absentStaffId,
                                    staffName: 'Selected Staff'
                                })
                            }
                            className='h-8 border-indigo-200 font-semibold text-indigo-700 text-xs hover:bg-indigo-50'>
                            <UserPlus className='mr-1.5 h-3.5 w-3.5 text-indigo-600' /> View Deputation History
                        </Button>
                        <Button
                            type='button'
                            size='sm'
                            variant='outline'
                            onClick={() =>
                                setHistoryModalState({
                                    open: true,
                                    mode: 'absent',
                                    asmaY_Id: selection.asmaY_Id,
                                    hrmE_Id: selection.absentStaffId,
                                    staffName: 'Selected Staff'
                                })
                            }
                            className='h-8 border-amber-200 font-semibold text-amber-700 text-xs hover:bg-amber-50'>
                            <UserMinus className='mr-1.5 h-3.5 w-3.5 text-amber-600' /> View Absent History
                        </Button>
                    </div>
                </div>

                {/* 13-Column Table */}
                <div className='overflow-x-auto rounded-xl border border-purple-100 shadow-sm'>
                    <Table className='border-collapse text-center text-xs'>
                        <TableHeader className='bg-gradient-to-r from-purple-800 via-indigo-800 to-purple-900 text-white'>
                            <TableRow className='hover:bg-transparent'>
                                <TableHead className='w-[45px] text-center font-bold text-white uppercase tracking-wider'>SL No</TableHead>
                                <TableHead className='w-[80px] text-center font-bold text-white uppercase tracking-wider'>
                                    Periods
                                </TableHead>
                                <TableHead className='w-[190px] text-center font-bold text-white uppercase tracking-wider'>
                                    Class-Section / Subject
                                </TableHead>
                                <TableHead className='w-[240px] text-center font-bold text-white uppercase tracking-wider'>
                                    Substitution *
                                </TableHead>
                                <TableHead className='text-center font-bold text-white uppercase tracking-wider'>Day Wise Count</TableHead>
                                <TableHead className='text-center font-bold text-white uppercase tracking-wider'>Weekly Count</TableHead>
                                <TableHead className='text-center font-bold text-white uppercase tracking-wider'>
                                    Deputed on {selection.date ? format(selection.date, 'dd/MM/yyyy') : 'Date'}
                                </TableHead>
                                <TableHead className='text-center font-bold text-white uppercase tracking-wider'>Weekly Deputed</TableHead>
                                <TableHead className='text-center font-bold text-white uppercase tracking-wider'>Monthly Deputed</TableHead>
                                <TableHead className='text-center font-bold text-white uppercase tracking-wider'>Total Deputed</TableHead>
                                <TableHead className='text-center font-bold text-white uppercase tracking-wider'>
                                    Daily Free Hours
                                </TableHead>
                                <TableHead className='text-center font-bold text-white uppercase tracking-wider'>
                                    Weekly Free Hours
                                </TableHead>
                                <TableHead className='w-[50px] text-center font-bold text-white uppercase tracking-wider'>View</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {periodRows.map((period, idx) => {
                                const selectedStaffObj = period.substitutestafflist.find((s) => s.HRME_Id === Number(period.Sub_Id));

                                return (
                                    <TableRow
                                        key={`${period.ttmP_Id}-${idx}`}
                                        className={
                                            idx % 2 === 0 ? 'bg-white hover:bg-purple-50/30' : 'bg-purple-50/15 hover:bg-purple-50/40'
                                        }>
                                        <TableCell className='font-semibold'>{idx + 1}</TableCell>
                                        <TableCell className='font-bold text-purple-800'>
                                            <span className='inline-block rounded-md bg-purple-100 px-2 py-0.5 font-bold text-purple-900 text-xs'>
                                                {period.ttmP_PeriodName}
                                            </span>
                                        </TableCell>
                                        <TableCell className='text-left font-semibold text-slate-800'>
                                            {period.asmcL_ClassName && period.asmcL_ClassName !== '--' ? (
                                                <>
                                                    <span className='font-bold text-purple-950'>
                                                        {period.asmcL_ClassName}
                                                        {period.asmC_SectionName && period.asmC_SectionName !== '--'
                                                            ? ` - ${period.asmC_SectionName}`
                                                            : ''}
                                                    </span>
                                                    {period.ismS_SubjectName && period.ismS_SubjectName !== '--' && (
                                                        <span className='block font-normal text-[11px] text-muted-foreground'>
                                                            {period.ismS_SubjectName}
                                                        </span>
                                                    )}
                                                </>
                                            ) : (
                                                <span className='text-muted-foreground text-xs font-normal italic'>--</span>
                                            )}
                                        </TableCell>
                                        <TableCell className='p-2 text-left'>
                                            <Select
                                                key={period.Sub_Id || `empty-sub-${period.ttmP_Id}`}
                                                value={period.Sub_Id ? period.Sub_Id.toString() : ''}
                                                onValueChange={(val) => handleSubStaffChange(period.ttmP_Id, val)}>
                                                <SelectTrigger className='h-9 w-full border-purple-200 bg-white font-medium text-xs focus:border-purple-600'>
                                                    <SelectValue
                                                        placeholder={
                                                            loadingPeriods && period.substitutestafflist.length === 0
                                                                ? 'Fetching Substitutes...'
                                                                : period.substitutestafflist.length === 0
                                                                ? 'No Substitute Staff Available'
                                                                : '-- Select Substitute --'
                                                        }
                                                    />
                                                </SelectTrigger>
                                                <SelectContent className='max-h-60'>
                                                    {period.substitutestafflist.map((sub) => (
                                                        <SelectItem key={sub.HRME_Id} value={sub.HRME_Id.toString()}>
                                                            <span>{sub.STAFF}</span>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell className='font-bold text-slate-700'>{period.daycnt ?? 0}</TableCell>
                                        <TableCell className='font-bold text-slate-700'>{period.weekcnt ?? 0}</TableCell>
                                        <TableCell className='font-bold text-indigo-700'>{period.currdaydeputed ?? 0}</TableCell>
                                        <TableCell className='font-bold text-indigo-700'>{period.weekcntdeputed ?? 0}</TableCell>
                                        <TableCell className='font-bold text-indigo-700'>{period.mntcntdeputed ?? 0}</TableCell>
                                        <TableCell className='font-bold text-indigo-700'>{period.totaldeputedcount ?? 0}</TableCell>
                                        <TableCell className='font-bold text-emerald-700'>{period.freeperioddaily ?? 0}</TableCell>
                                        <TableCell className='font-bold text-emerald-700'>{period.freeperiodweekly ?? 0}</TableCell>
                                        <TableCell className='text-center'>
                                            {period.HRMEnew_Id ? (
                                                <Button
                                                    type='button'
                                                    variant='ghost'
                                                    size='icon'
                                                    title='View Substitute Staff Timetable'
                                                    onClick={() =>
                                                        setTimetableModalState({
                                                            open: true,
                                                            asmaY_Id: selection.asmaY_Id,
                                                            hrmE_Id: period.HRMEnew_Id!,
                                                            staffName: selectedStaffObj?.STAFF
                                                        })
                                                    }
                                                    className='h-8 w-8 text-purple-700 hover:bg-purple-100 hover:text-purple-900'>
                                                    <Eye className='h-4 w-4' />
                                                </Button>
                                            ) : (
                                                <span className='text-gray-300'>-</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>

                {/* Bottom Actions: Save & Cancel */}
                <div className='flex items-center justify-center gap-4 border-purple-100 border-t pt-4'>
                    <Button
                        type='button'
                        onClick={handleSaveAll}
                        disabled={saveMutation.isPending}
                        className='h-10 bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 px-10 font-bold text-white text-xs uppercase tracking-wider shadow-md hover:from-purple-800 hover:to-indigo-900'>
                        {saveMutation.isPending ? (
                            <>
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Saving Allotments...
                            </>
                        ) : (
                            <>
                                <Save className='mr-2 h-4 w-4' /> Save Deputation
                            </>
                        )}
                    </Button>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={onCancel}
                        className='h-10 border-orange-500 px-8 font-bold text-orange-600 text-xs uppercase tracking-wider shadow-xs hover:bg-orange-50'>
                        <X className='mr-2 h-4 w-4' /> Cancel
                    </Button>
                </div>
            </div>

            {/* Modals */}
            {timetableModalState.open && (
                <StaffTimetableModal
                    open={timetableModalState.open}
                    onClose={() => setTimetableModalState({ open: false, asmaY_Id: 0, hrmE_Id: 0 })}
                    asmaY_Id={timetableModalState.asmaY_Id}
                    hrmE_Id={timetableModalState.hrmE_Id}
                    staffName={timetableModalState.staffName}
                />
            )}

            {historyModalState.open && (
                <DeputationHistoryModal
                    open={historyModalState.open}
                    onClose={() =>
                        setHistoryModalState({
                            open: false,
                            mode: 'deputation',
                            asmaY_Id: 0,
                            hrmE_Id: 0
                        })
                    }
                    mode={historyModalState.mode}
                    asmaY_Id={historyModalState.asmaY_Id}
                    hrmE_Id={historyModalState.hrmE_Id}
                    staffName={historyModalState.staffName}
                    dateStr={selection.dateStr}
                />
            )}
        </CollapsibleSection>
    );
}
