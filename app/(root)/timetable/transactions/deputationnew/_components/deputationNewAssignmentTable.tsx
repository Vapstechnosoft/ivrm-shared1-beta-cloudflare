'use client';

import { Button } from '@/components/ui/button';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useSaveDeputationNew } from '@/hooks/timetable/useDeputationNew';
import { getFreeStaffDets } from '@/server/timetable/transactions/deputationnew';
import type { IPeriodAssignmentRow, ISubstituteStaffOption } from '@/types/timetable/Transaction/deputationnew';
import { format } from 'date-fns';
import { Eye, Loader2, Save, UserCheck, UserMinus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import DeputationHistoryModal from './deputationHistoryModal';
import PeriodsDetailsModal from './periodsDetailsModal';

interface DeputationNewAssignmentTableProps {
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

export default function DeputationNewAssignmentTable({
    periodsData,
    selection,
    onSaveSuccess,
    onCancel
}: DeputationNewAssignmentTableProps) {
    const [periodRows, setPeriodRows] = useState<IPeriodAssignmentRow[]>([]);
    const [loadingPeriods, setLoadingPeriods] = useState(false);

    // Modals state
    const [periodsModalState, setPeriodsModalState] = useState<{
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

    const saveMutation = useSaveDeputationNew();

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

    // Load period table and fetch free staff for each period concurrently
    useEffect(() => {
        let isMounted = true;

        if (!rawTimeTableList || rawTimeTableList.length === 0 || !selection) {
            setPeriodRows([]);
            setLoadingPeriods(false);
            return;
        }

        // 1. Immediately create initial rows from raw period list
        const initialRows: IPeriodAssignmentRow[] = rawTimeTableList.map((user) => {
            const ttmD_Id = Number(user.ttmD_Id || selection.dayId);
            const ttmP_Id = Number(user.ttmP_Id || 0);
            const asmaY_Id = Number(user.asmaY_Id || selection.asmaY_Id);
            const hrmE_Id = Number(user.hrmE_Id || selection.absentStaffId);

            return {
                ttmD_Id,
                ttmP_Id,
                ttmD_DayName: user.ttmD_DayName || selection.dayName,
                ttmP_PeriodName: user.ttmP_PeriodName || (user.ttmP_Id ? `Period ${user.ttmP_Id}` : 'Period'),
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

        // 2. Fetch free substitute staff concurrently for each period
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
    }, [rawTimeTableList, selection, periodsPayload]);

    // Handle substitute staff selection and limits check
    const handleSubstituteChange = (ttmP_Id: number, staffIdStr: string) => {
        const staffId = Number(staffIdStr);

        setPeriodRows((prevRows) => {
            return prevRows.map((row) => {
                if (row.ttmP_Id !== ttmP_Id) return row;

                if (!staffIdStr) {
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
                        freeperiodweekly: 0,
                        weekcnt1: 0,
                        mntcnt1: 0,
                        totalcnt1: 0
                    };
                }

                const selectedStaff = row.substitutestafflist.find((s) => s.HRME_Id === staffId);
                if (!selectedStaff) return row;

                // Limit validation matching optionToggled in legacy AngularJS
                if (selectedStaff.DCNT && Number(selectedStaff.daycnt || 0) >= Number(selectedStaff.DCNT)) {
                    toast.warning(`Daily Deputation limit exceeded for ${selectedStaff.STAFF}! (Max: ${selectedStaff.DCNT})`);
                }
                if (selectedStaff.WCNT && Number(selectedStaff.weekcnt || 0) >= Number(selectedStaff.WCNT)) {
                    toast.warning(`Weekly Deputation limit exceeded for ${selectedStaff.STAFF}! (Max: ${selectedStaff.WCNT})`);
                }
                if (selectedStaff.MCNT && Number(selectedStaff.mntcnt || 0) >= Number(selectedStaff.MCNT)) {
                    toast.warning(`Monthly Deputation limit exceeded for ${selectedStaff.STAFF}! (Max: ${selectedStaff.MCNT})`);
                }
                if (selectedStaff.YCNT && Number(selectedStaff.totalcnt || 0) >= Number(selectedStaff.YCNT)) {
                    toast.warning(`Yearly Deputation limit exceeded for ${selectedStaff.STAFF}! (Max: ${selectedStaff.YCNT})`);
                }

                return {
                    ...row,
                    Sub_Id: staffIdStr,
                    HRMEnew_Id: staffId,
                    daycnt: selectedStaff.DAYTL || 0,
                    weekcnt: selectedStaff.WWCNT || 0,
                    currdaydeputed: selectedStaff.daycnt || 0,
                    weekcntdeputed: selectedStaff.weekcnt || 0,
                    mntcntdeputed: selectedStaff.mntcnt || 0,
                    totaldeputedcount: selectedStaff.totalcnt || 0,
                    freeperioddaily: selectedStaff.freeperioddaily || 0,
                    freeperiodweekly: selectedStaff.freeperiodweekly || 0,
                    weekcnt1: selectedStaff.weekcnt1 || 0,
                    mntcnt1: selectedStaff.mntcnt1 || 0,
                    totalcnt1: selectedStaff.totalcnt1 || 0
                };
            });
        });
    };

    // Save Handlers
    const handleSave = async () => {
        const assignedRows = periodRows.filter((r) => !!r.Sub_Id && Number(r.Sub_Id) > 0);

        if (assignedRows.length === 0) {
            toast.error('Please select at least one substitute staff before saving!');
            return;
        }

        const subarray = assignedRows.map((user) => ({
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
            subarray
        };

        try {
            const res = await saveMutation.mutateAsync(payload);
            const resData = res?.data !== undefined ? res.data : res;

            if (resData?.returnval === true || resData?.message === 'success' || !resData?.returnval_error) {
                toast.success('Deputation allotment successfully saved!');
                if (onSaveSuccess) onSaveSuccess();
            } else {
                toast.error(resData?.message || 'Failed to save deputation details');
            }
        } catch (error: any) {
            toast.error(error?.message || 'Server error occurred while saving deputation allotment');
        }
    };

    const absentStaffName =
        selection.masters?.stafflist?.find((s: any) => Number(s.hrmE_Id) === selection.absentStaffId)?.staffName ||
        `Staff #${selection.absentStaffId}`;

    return (
        <CollapsibleSection
            title='Absent Staff Time Table'
            description={`Period assignments and substitute staff allocation for ${absentStaffName} (${selection.dayName})`}
            defaultOpen={true}
            rightElement={
                <div className='flex items-center gap-2'>
                    {/* View Deputation Details */}
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
                                staffName: absentStaffName
                            })
                        }
                        className='h-8 rounded-xl border-purple-200 bg-purple-50 font-semibold text-purple-700 text-xs hover:bg-purple-100'>
                        <UserCheck className='mr-1.5 h-3.5 w-3.5' /> View Deputations
                    </Button>

                    {/* View Absent Details */}
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
                                staffName: absentStaffName
                            })
                        }
                        className='h-8 rounded-xl border-amber-200 bg-amber-50 font-semibold text-amber-700 text-xs hover:bg-amber-100'>
                        <UserMinus className='mr-1.5 h-3.5 w-3.5' /> View Absences
                    </Button>
                </div>
            }>
            <div className='space-y-6 pt-2'>
                {/* 13-Column Responsive Table */}
                <div className='relative overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs'>
                    {loadingPeriods && (
                        <div className='absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-2xs'>
                            <div className='flex items-center gap-2 rounded-xl border border-purple-200 bg-white px-4 py-2 font-medium text-purple-700 text-xs shadow-md'>
                                <Loader2 className='h-4 w-4 animate-spin text-purple-600' />
                                <span>Loading substitute staff availability for all periods...</span>
                            </div>
                        </div>
                    )}

                    <Table className='min-w-[1280px] border-collapse text-xs'>
                        <TableHeader className='bg-slate-50'>
                            <TableRow className='hover:bg-transparent'>
                                <TableHead className='w-12 text-center font-bold text-slate-700'>SL No</TableHead>
                                <TableHead className='font-bold text-slate-700'>Periods</TableHead>
                                <TableHead className='font-bold text-slate-700'>Class-Section/Subject</TableHead>
                                <TableHead className='w-56 font-bold text-purple-700'>Substitution</TableHead>
                                <TableHead className='text-center font-bold text-slate-700'>Day Wise Count</TableHead>
                                <TableHead className='text-center font-bold text-slate-700'>Weekly Count</TableHead>
                                <TableHead className='text-center font-bold text-slate-700'>
                                    Deputed on {selection.date ? format(new Date(selection.date), 'dd/MM/yyyy') : ''}
                                </TableHead>
                                <TableHead className='text-center font-bold text-slate-700'>Weekly Deputed</TableHead>
                                <TableHead className='text-center font-bold text-slate-700'>Monthly Deputed</TableHead>
                                <TableHead className='text-center font-bold text-slate-700'>Total Deputed</TableHead>
                                <TableHead className='text-center font-bold text-slate-700'>Daily Free Hours</TableHead>
                                <TableHead className='text-center font-bold text-slate-700'>Weekly Free Hours</TableHead>
                                <TableHead className='w-12 text-center font-bold text-slate-700'>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {periodRows.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={13} className='h-32 text-center font-semibold text-slate-400 text-xs'>
                                        No allocated periods found for the selected staff member.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                periodRows.map((row, index) => {
                                    const selectedSubStaff = row.substitutestafflist.find((s) => s.HRME_Id === row.HRMEnew_Id);

                                    return (
                                        <TableRow key={`${row.ttmP_Id}-${index}`} className='hover:bg-slate-50/80'>
                                            {/* 1. SL No */}
                                            <TableCell className='text-center font-medium text-slate-500'>{index + 1}</TableCell>

                                            {/* 2. Periods */}
                                            <TableCell className='font-bold text-purple-900'>{row.ttmP_PeriodName}</TableCell>

                                            {/* 3. Class-Section/Subject */}
                                            <TableCell>
                                                <div className='font-medium text-slate-800'>
                                                    {row.asmcL_ClassName}
                                                    {row.asmC_SectionName ? `-${row.asmC_SectionName}` : ''}
                                                </div>
                                                <div className='text-[11px] text-slate-500'>{row.ismS_SubjectName}</div>
                                            </TableCell>

                                            {/* 4. Substitution Dropdown */}
                                            <TableCell>
                                                <Select
                                                    value={row.Sub_Id || undefined}
                                                    onValueChange={(val) => handleSubstituteChange(row.ttmP_Id, val)}>
                                                    <SelectTrigger className='h-8 w-full rounded-lg border-purple-200 bg-white text-xs shadow-2xs focus:ring-1 focus:ring-purple-400'>
                                                        <SelectValue placeholder='-- Select Substitute --' />
                                                    </SelectTrigger>
                                                    <SelectContent className='max-h-56'>
                                                        {row.substitutestafflist.length === 0 ? (
                                                            <div className='p-2 text-center text-[11px] text-slate-400'>
                                                                No substitute staff free
                                                            </div>
                                                        ) : (
                                                            row.substitutestafflist.map((sub) => (
                                                                <SelectItem key={sub.HRME_Id} value={sub.HRME_Id.toString()}>
                                                                    {sub.STAFF} {sub.EMPCODE ? `[${sub.EMPCODE}]` : ''}
                                                                </SelectItem>
                                                            ))
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>

                                            {/* 5. Day Wise Count */}
                                            <TableCell className='text-center font-semibold text-slate-700'>{row.daycnt || 0}</TableCell>

                                            {/* 6. Weekly Count */}
                                            <TableCell className='text-center font-semibold text-slate-700'>{row.weekcnt || 0}</TableCell>

                                            {/* 7. Deputed on Selected Date */}
                                            <TableCell className='text-center font-semibold text-purple-700'>
                                                {row.currdaydeputed || 0}
                                            </TableCell>

                                            {/* 8. Weekly Deputed */}
                                            <TableCell className='text-center font-semibold text-slate-700'>
                                                {row.weekcntdeputed || 0}
                                            </TableCell>

                                            {/* 9. Monthly Deputed */}
                                            <TableCell className='text-center font-semibold text-slate-700'>
                                                {row.mntcntdeputed || 0}
                                            </TableCell>

                                            {/* 10. Total Deputed */}
                                            <TableCell className='text-center font-semibold text-slate-700'>
                                                {row.totaldeputedcount || 0}
                                            </TableCell>

                                            {/* 11. Daily Free Hours */}
                                            <TableCell className='text-center font-semibold text-emerald-700'>
                                                {row.freeperioddaily || 0}
                                            </TableCell>

                                            {/* 12. Weekly Free Hours */}
                                            <TableCell className='text-center font-semibold text-emerald-700'>
                                                {row.freeperiodweekly || 0}
                                            </TableCell>

                                            {/* 13. Actions: View Timetable */}
                                            <TableCell className='text-center'>
                                                {row.HRMEnew_Id ? (
                                                    <Button
                                                        type='button'
                                                        variant='ghost'
                                                        size='sm'
                                                        onClick={() =>
                                                            setPeriodsModalState({
                                                                open: true,
                                                                asmaY_Id: row.asmaY_Id,
                                                                hrmE_Id: Number(row.HRMEnew_Id),
                                                                staffName: selectedSubStaff?.STAFF
                                                            })
                                                        }
                                                        className='h-7 w-7 p-0 text-purple-600 hover:bg-purple-50'
                                                        title="View Substitute Staff's Schedule">
                                                        <Eye className='h-4 w-4' />
                                                    </Button>
                                                ) : (
                                                    <span className='text-slate-300'>-</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Form Action Buttons */}
                <div className='flex items-center justify-center gap-3 border-slate-100 border-t pt-4'>
                    <Button
                        type='button'
                        disabled={saveMutation.isPending || periodRows.length === 0}
                        onClick={handleSave}
                        className='h-10 rounded-xl bg-purple-600 px-6 font-semibold text-white shadow-xs hover:bg-purple-700'>
                        {saveMutation.isPending ? (
                            <>
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Saving Allotment...
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
                        disabled={saveMutation.isPending}
                        className='h-10 rounded-xl border-slate-200 px-6 font-semibold text-slate-700 shadow-xs hover:bg-slate-100'>
                        <X className='mr-2 h-4 w-4' /> Cancel
                    </Button>
                </div>
            </div>

            {/* Modals */}
            <PeriodsDetailsModal
                open={periodsModalState.open}
                onClose={() => setPeriodsModalState((prev) => ({ ...prev, open: false }))}
                asmaY_Id={periodsModalState.asmaY_Id}
                hrmE_Id={periodsModalState.hrmE_Id}
                staffName={periodsModalState.staffName}
            />

            <DeputationHistoryModal
                open={historyModalState.open}
                onClose={() => setHistoryModalState((prev) => ({ ...prev, open: false }))}
                mode={historyModalState.mode}
                asmaY_Id={historyModalState.asmaY_Id}
                hrmE_Id={historyModalState.hrmE_Id}
                staffName={historyModalState.staffName}
                dateStr={selection.dateStr}
            />
        </CollapsibleSection>
    );
}
