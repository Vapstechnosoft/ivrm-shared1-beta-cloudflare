'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSaveStaffPeriodTransfer, useStaffPeriodTransferReport } from '@/hooks/timetable/useTransactions';
import { cn } from '@/lib/utils';
import type {
    GridWeekItem,
    PeriodItem,
    SaveStaffPeriodTransferPayload,
    TimeTableItem
} from '@/types/timetable/Transaction/staffperiodtransfer';
import { AlertCircle, Calendar, Check, CheckSquare, List, Loader2, Send, Trash2, UserCheck } from 'lucide-react';
import { toast } from 'sonner';

interface StaffPeriodTransferReportProps {
    data: {
        asmaY_Id: string;
        hrmE_Id: string;
    };
}

export default function StaffPeriodTransferReport({ data }: StaffPeriodTransferReportProps) {
    const [selectedTtfgdIds, setSelectedTtfgdIds] = useState<number[]>([]);
    const [targetStaffId, setTargetStaffId] = useState<string>('');
    const [selectedClass, setSelectedClass] = useState<string>('0');
    const [selectedSection, setSelectedSection] = useState<string>('0');
    const [selectedSubject, setSelectedSubject] = useState<string>('0');

    // Fetch report data using StaffPeriodTransformFacade/getrpt
    const { data: reportData, isLoading, isError } = useStaffPeriodTransferReport({
        asmaY_Id: data.asmaY_Id,
        hrmE_Id: data.hrmE_Id
    });

    const { mutateAsync: saveTransfer, isPending: isSaving } = useSaveStaffPeriodTransfer();

    // Extract report datasets
    const gridweeks: GridWeekItem[] = useMemo(() => {
        if (!reportData?.gridweeks) return [];
        return [...reportData.gridweeks].sort((a, b) => (a.order_Id || 0) - (b.order_Id || 0));
    }, [reportData?.gridweeks]);

    const periodslst: PeriodItem[] = useMemo(() => {
        if (!reportData?.periodslst) return [];
        return reportData.periodslst;
    }, [reportData?.periodslst]);

    const timeTable: TimeTableItem[] = useMemo(() => {
        if (!reportData?.time_Table) return [];
        return reportData.time_Table;
    }, [reportData?.time_Table]);

    const classDetails = useMemo(() => reportData?.classdetails || [], [reportData?.classdetails]);
    const secDetails = useMemo(() => reportData?.secdetails || [], [reportData?.secdetails]);
    const subjectDet = useMemo(() => reportData?.subjectdet || [], [reportData?.subjectdet]);
    const staffDropdown = useMemo(() => {
        const staff = reportData?.staffDrpDwnto || [];
        return staff.filter((s) => String(s.hrmE_Id) !== String(data.hrmE_Id));
    }, [reportData?.staffDrpDwnto, data.hrmE_Id]);

    // Filter time table by active Class, Section, and Subject dropdowns
    const filteredTimeTable = useMemo(() => {
        if (!timeTable.length) return [];
        return timeTable.filter((item) => {
            if (selectedClass !== '0' && String(item.asmcL_Id) !== selectedClass) return false;
            if (selectedSection !== '0' && String(item.asmS_Id) !== selectedSection) return false;
            if (selectedSubject !== '0' && String(item.ismS_Id) !== selectedSubject) return false;
            return true;
        });
    }, [timeTable, selectedClass, selectedSection, selectedSubject]);

    // Helper to find allocated periods for each cell
    const getMatchingPeriods = (day: GridWeekItem, period: PeriodItem): TimeTableItem[] => {
        return filteredTimeTable.filter((item) => {
            const dayMatch =
                (item.ttmD_Id && item.ttmD_Id === day.ttmD_Id) ||
                (item.ttmD_DayName && day.ttmD_DayName && item.ttmD_DayName.trim().toUpperCase() === day.ttmD_DayName.trim().toUpperCase());
            const periodMatch =
                (item.ttmP_Id && item.ttmP_Id === period.ttmP_Id) ||
                (item.ttmP_PeriodName &&
                    period.ttmP_PeriodName &&
                    String(item.ttmP_PeriodName).trim() === String(period.ttmP_PeriodName).trim());
            return dayMatch && periodMatch;
        });
    };

    // Toggle cell selection
    const toggleCell = (items: TimeTableItem[]) => {
        if (!items.length) return;
        const itemIds = items.map((i) => i.ttfgD_Id);
        const allSelected = itemIds.every((id) => selectedTtfgdIds.includes(id));

        if (allSelected) {
            setSelectedTtfgdIds((prev) => prev.filter((id) => !itemIds.includes(id)));
        } else {
            setSelectedTtfgdIds((prev) => Array.from(new Set([...prev, ...itemIds])));
        }
    };

    // Select all / Deselect all
    const handleSelectAll = () => {
        const allIds = filteredTimeTable.map((i) => i.ttfgD_Id);
        if (allIds.length === 0) return;

        const allSelected = allIds.every((id) => selectedTtfgdIds.includes(id));
        if (allSelected) {
            setSelectedTtfgdIds((prev) => prev.filter((id) => !allIds.includes(id)));
        } else {
            setSelectedTtfgdIds((prev) => Array.from(new Set([...prev, ...allIds])));
        }
    };

    // Save & Transfer
    const handleTransfer = async () => {
        if (!targetStaffId) {
            toast.error('Please select a target staff member');
            return;
        }

        if (selectedTtfgdIds.length === 0) {
            toast.error('Please select at least one period to transfer');
            return;
        }

        const payload: SaveStaffPeriodTransferPayload = {
            ASMAY_Id: Number(data.asmaY_Id),
            HRME_IdTO: Number(targetStaffId),
            Time_Table: selectedTtfgdIds.map((id) => ({
                TTFGD_Id: id
            }))
        };

        try {
            const res = await saveTransfer(payload);
            const isSuccess =
                res?.returnval === true ||
                res?.returnval === 'true' ||
                res?.success === true ||
                res?.data === true ||
                (typeof res?.data === 'object' && (res?.data?.returnval === true || res?.data?.returnval === 'true'));

            if (isSuccess) {
                toast.success(res?.message || 'Staff period transferred successfully');
                setSelectedTtfgdIds([]);
                setTargetStaffId('');
            } else if (res?.returnval === false || res?.success === false) {
                toast.error(res?.message || 'Transfer failed');
            } else {
                toast.success(res?.message || 'Staff period transferred successfully');
                setSelectedTtfgdIds([]);
                setTargetStaffId('');
            }
        } catch (error: any) {
            toast.error(error?.message || 'Failed to transfer period');
        }
    };

    const handleClearSelection = () => {
        setSelectedTtfgdIds([]);
        setTargetStaffId('');
        toast.info('Selection cleared');
    };

    if (isLoading) {
        return (
            <div className='flex flex-col items-center justify-center space-y-4 rounded-2xl border border-purple-100 bg-white p-16 shadow-lg'>
                <div className='flex h-16 w-16 items-center justify-center rounded-full bg-purple-50 text-purple-600'>
                    <Loader2 className='h-8 w-8 animate-spin' />
                </div>
                <div className='text-center'>
                    <p className='font-bold text-lg text-slate-800'>Loading Staff Timetable Schedule...</p>
                    <p className='text-slate-500 text-sm'>Fetching timetable allocation details from the server</p>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className='flex flex-col items-center justify-center space-y-4 rounded-2xl border border-red-100 bg-white p-12 text-center shadow-lg'>
                <div className='flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500'>
                    <AlertCircle className='h-8 w-8' />
                </div>
                <div>
                    <h3 className='font-bold text-lg text-red-900'>Failed to load timetable details</h3>
                    <p className='mt-1 text-slate-600 text-sm'>
                        Could not connect to the backend service. Please check your connection and try again.
                    </p>
                </div>
            </div>
        );
    }

    if (!gridweeks.length && !periodslst.length && !timeTable.length) {
        return (
            <div className='flex flex-col items-center justify-center space-y-4 rounded-2xl border border-purple-100 bg-white p-12 text-center shadow-lg'>
                <div className='flex h-16 w-16 items-center justify-center rounded-full bg-purple-50 text-purple-600'>
                    <Calendar className='h-8 w-8' />
                </div>
                <div>
                    <h3 className='font-bold text-lg text-slate-800'>No Timetable Records Found</h3>
                    <p className='mt-1 text-slate-500 text-sm'>
                        No period allocations were found for the selected academic year and staff member.
                    </p>
                </div>
            </div>
        );
    }

    const allCurrentFilteredSelected =
        filteredTimeTable.length > 0 && filteredTimeTable.every((item) => selectedTtfgdIds.includes(item.ttfgD_Id));

    return (
        <div className='space-y-6'>
            {/* Filter Section */}
            <div className='rounded-2xl border border-purple-100 bg-white p-6 shadow-md'>
                <div className='flex flex-wrap items-center justify-between gap-4'>
                    <div className='grid flex-1 grid-cols-1 gap-4 sm:grid-cols-3'>
                        {/* Class Filter */}
                        <div className='space-y-1.5'>
                            <Label className='font-semibold text-purple-950 text-xs uppercase tracking-wider'>Class Filter</Label>
                            <Select value={selectedClass} onValueChange={setSelectedClass}>
                                <SelectTrigger className='h-10 border-purple-100 bg-purple-50/20'>
                                    <SelectValue placeholder='All Classes' />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='0'>All Classes</SelectItem>
                                    {classDetails.map((c) => (
                                        <SelectItem key={`class-${c.asmcL_Id}`} value={String(c.asmcL_Id)}>
                                            {c.asmcL_ClassName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Section Filter */}
                        <div className='space-y-1.5'>
                            <Label className='font-semibold text-purple-950 text-xs uppercase tracking-wider'>Section Filter</Label>
                            <Select value={selectedSection} onValueChange={setSelectedSection}>
                                <SelectTrigger className='h-10 border-purple-100 bg-purple-50/20'>
                                    <SelectValue placeholder='All Sections' />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='0'>All Sections</SelectItem>
                                    {secDetails.map((s) => (
                                        <SelectItem key={`section-${s.asmS_Id}`} value={String(s.asmS_Id)}>
                                            {s.asmC_SectionName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Subject Filter */}
                        <div className='space-y-1.5'>
                            <Label className='font-semibold text-purple-950 text-xs uppercase tracking-wider'>Subject Filter</Label>
                            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                                <SelectTrigger className='h-10 border-purple-100 bg-purple-50/20'>
                                    <SelectValue placeholder='All Subjects' />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='0'>All Subjects</SelectItem>
                                    {subjectDet.map((s) => (
                                        <SelectItem key={`subject-${s.ismS_Id}`} value={String(s.ismS_Id)}>
                                            {s.ismS_SubjectName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Select All Button */}
                    <div className='flex items-end'>
                        <Button
                            type='button'
                            variant={allCurrentFilteredSelected ? 'default' : 'outline'}
                            onClick={handleSelectAll}
                            disabled={filteredTimeTable.length === 0}
                            className={cn(
                                'h-10 font-semibold text-xs transition-all duration-200',
                                allCurrentFilteredSelected
                                    ? 'bg-purple-700 text-white hover:bg-purple-800'
                                    : 'border-purple-200 text-purple-700 hover:bg-purple-50'
                            )}>
                            <CheckSquare className='mr-2 h-4 w-4' />
                            {allCurrentFilteredSelected ? 'Deselect All' : 'Select All'}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Timetable Grid */}
            <div className='overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-xl'>
                <div className='overflow-x-auto'>
                    <table className='w-full border-collapse text-left'>
                        <thead>
                            <tr className='bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-700 text-white'>
                                <th className='sticky left-0 z-20 border-r border-purple-500/40 bg-purple-700 px-4 py-3.5 font-bold text-xs uppercase tracking-wider'>
                                    Day / Period
                                </th>
                                {periodslst.map((period) => (
                                    <th
                                        key={`header-period-${period.ttmP_Id}`}
                                        className='min-w-[120px] border-r border-purple-500/30 px-3 py-3.5 text-center font-bold text-xs uppercase tracking-wider last:border-r-0'>
                                        Period {period.ttmP_PeriodName}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className='divide-y divide-slate-100'>
                            {gridweeks.map((day) => (
                                <tr key={`row-day-${day.ttmD_Id}`} className='transition-colors hover:bg-purple-50/20'>
                                    <td className='sticky left-0 z-10 border-r border-slate-200 bg-slate-50 px-4 py-3 font-bold text-purple-950 text-xs uppercase tracking-wider'>
                                        {day.ttmD_DayName}
                                    </td>
                                    {periodslst.map((period) => {
                                        const matchingItems = getMatchingPeriods(day, period);
                                        const hasAllocations = matchingItems.length > 0;
                                        const isCellSelected =
                                            hasAllocations && matchingItems.every((item) => selectedTtfgdIds.includes(item.ttfgD_Id));
                                        const isPartiallySelected =
                                            hasAllocations &&
                                            !isCellSelected &&
                                            matchingItems.some((item) => selectedTtfgdIds.includes(item.ttfgD_Id));

                                        return (
                                            <td
                                                key={`cell-${day.ttmD_Id}-${period.ttmP_Id}`}
                                                onClick={() => hasAllocations && toggleCell(matchingItems)}
                                                className={cn(
                                                    'relative min-h-[85px] border-r border-slate-100 p-2.5 text-center align-middle transition-all last:border-r-0',
                                                    hasAllocations ? 'cursor-pointer' : 'bg-slate-50/40',
                                                    isCellSelected &&
                                                        'bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-md',
                                                    isPartiallySelected && 'bg-purple-100 text-purple-950',
                                                    hasAllocations && !isCellSelected && !isPartiallySelected && 'hover:bg-purple-50/80'
                                                )}>
                                                {hasAllocations ? (
                                                    <div className='flex flex-col items-center justify-center space-y-1'>
                                                        {matchingItems.map((item) => {
                                                            const itemSelected = selectedTtfgdIds.includes(item.ttfgD_Id);
                                                            return (
                                                                <div
                                                                    key={`item-${item.ttfgD_Id}`}
                                                                    className={cn(
                                                                        'w-full rounded-lg p-1.5 text-center transition-all',
                                                                        isCellSelected ? 'text-white' : 'text-slate-800'
                                                                    )}>
                                                                    <div className='flex items-center justify-center gap-1'>
                                                                        {itemSelected && <Check className='h-3 w-3 shrink-0' />}
                                                                        <p className='truncate font-bold text-[11px] leading-tight uppercase'>
                                                                            {item.ismS_SubjectName || 'Subject'}
                                                                        </p>
                                                                    </div>
                                                                    <p
                                                                        className={cn(
                                                                            'mt-0.5 text-[10px] font-medium leading-tight',
                                                                            isCellSelected ? 'text-purple-100' : 'text-slate-500'
                                                                        )}>
                                                                        {item.asmcL_ClassName} - {item.asmC_SectionName}
                                                                    </p>
                                                                    {item.ttmC_CategoryName && (
                                                                        <span
                                                                            className={cn(
                                                                                'mt-0.5 inline-block rounded-full px-1.5 py-0.2 text-[8px] font-semibold uppercase',
                                                                                isCellSelected
                                                                                    ? 'bg-purple-500/50 text-purple-100'
                                                                                    : 'bg-purple-100 text-purple-800'
                                                                            )}>
                                                                            {item.ttmC_CategoryName}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <span className='font-medium text-[11px] text-slate-300'>—</span>
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

            {/* Floating / Sticky Bottom Action Bar */}
            {selectedTtfgdIds.length > 0 && (
                <div className='fade-in slide-in-from-bottom-3 animate-in sticky bottom-4 z-30 rounded-2xl border-2 border-purple-200 bg-white/95 p-5 shadow-2xl backdrop-blur-md'>
                    <div className='flex flex-col items-center justify-between gap-4 md:flex-row'>
                        {/* Status Count */}
                        <div className='flex items-center gap-3.5'>
                            <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 font-extrabold text-lg text-white shadow-md'>
                                {selectedTtfgdIds.length}
                            </div>
                            <div>
                                <p className='font-bold text-slate-900 text-sm'>
                                    {selectedTtfgdIds.length} {selectedTtfgdIds.length === 1 ? 'Period' : 'Periods'} Selected
                                </p>
                                <p className='text-slate-500 text-xs'>Ready to be transferred to the target staff</p>
                            </div>
                        </div>

                        {/* Reset Selection Button */}
                        <div className='flex items-center gap-2'>
                            <Button
                                onClick={handleClearSelection}
                                variant='outline'
                                className='h-10 border-red-200 font-semibold text-red-600 text-xs hover:bg-red-50'>
                                <Trash2 className='mr-1.5 h-3.5 w-3.5' />
                                Clear Selection
                            </Button>
                        </div>

                        {/* Target Staff Selection & Save Action */}
                        <div className='flex w-full flex-1 items-center justify-end gap-3 md:max-w-md'>
                            <div className='flex-1'>
                                <Select value={targetStaffId} onValueChange={setTargetStaffId}>
                                    <SelectTrigger className='h-10 border-purple-200 bg-purple-50/20 font-medium text-xs'>
                                        <div className='flex items-center gap-2 truncate'>
                                            <UserCheck className='h-3.5 w-3.5 text-purple-600' />
                                            <SelectValue placeholder='-- Select Target Staff --' />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {staffDropdown.map((s) => (
                                            <SelectItem key={`staff-to-${s.hrmE_Id}`} value={String(s.hrmE_Id)}>
                                                {s.staffNamelst}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button
                                onClick={handleTransfer}
                                disabled={isSaving || !targetStaffId}
                                className='h-10 bg-gradient-to-r from-orange-500 to-amber-500 px-6 font-bold text-white text-xs shadow-md transition-all hover:from-orange-600 hover:to-amber-600'>
                                {isSaving ? (
                                    <>
                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                        Transferring...
                                    </>
                                ) : (
                                    <>
                                        <Send className='mr-2 h-4 w-4' />
                                        Save & Transfer
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
