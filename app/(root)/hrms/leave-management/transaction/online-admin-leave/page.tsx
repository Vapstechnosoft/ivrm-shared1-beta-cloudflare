'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    useEmployeesDropDown,
    useLeaveBalanceByEmployeeId,
    useLeaveHistoryByEmployeeId
} from '@/hooks/hrms/leave-management/useOnlineAdminLeave';
import { tableSearchVariables } from '@/lib/data-table.config';
import { cn } from '@/lib/utils';
import type { ColumnDef } from '@tanstack/react-table';
import { differenceInDays, format } from 'date-fns';
import { ClipboardList, Info, Layers, Search, UserCheck } from 'lucide-react';
import { CalendarIcon } from 'lucide-react';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { useMemo, useState } from 'react';
import ApplyLeaveForm from './_components/apply-leave-form';
import { getOnlineAdminLeaveColumns } from './_components/columns';

export default function OnlineAdminLeavePage() {
    // Search states for History Grid
    const [searchQuery, setSearchQuery] = useQueryState(tableSearchVariables.search, parseAsString.withDefault(''));

    // Employee Selection State (URL bound)
    const [selectedEmployeeId, setSelectedEmployeeId] = useQueryState('hrmE_Id', parseAsInteger.withDefault(0));
    const [staffSearch, setStaffSearch] = useState('');

    const { data: employeeList, isLoading: isLoadingEmployees } = useEmployeesDropDown();

    // Memoized filtered employee list for the dropdown
    const filteredEmployeeList = useMemo(() => {
        if (!employeeList) return [];
        if (!staffSearch) return employeeList;
        const lowerSearch = staffSearch.toLowerCase();
        return employeeList.filter(
            (emp) =>
                emp.employeeName.toLowerCase().includes(lowerSearch) ||
                (emp.hrmE_EmployeeCode || '').toLowerCase().includes(lowerSearch) ||
                emp.hrmE_Id.toString().includes(lowerSearch)
        );
    }, [employeeList, staffSearch]);

    // Data for Grids
    const { data: leaveBalanceData, isLoading: isLoadingBalance } = useLeaveBalanceByEmployeeId(selectedEmployeeId);

    const {
        data: leaveHistoryBatch,
        isLoading: isLoadingHistory,
        refetch: refetchHistory
    } = useLeaveHistoryByEmployeeId(selectedEmployeeId);

    // Unified History Data (Favor dedicated API, fallback to batch data from balance API)
    const effectiveHistory = useMemo(() => {
        if (Array.isArray(leaveHistoryBatch) && leaveHistoryBatch.length > 0) {
            return leaveHistoryBatch;
        }
        if (
            leaveHistoryBatch &&
            !Array.isArray(leaveHistoryBatch) &&
            Array.isArray((leaveHistoryBatch as any).get_leave_details) &&
            (leaveHistoryBatch as any).get_leave_details.length > 0
        ) {
            return (leaveHistoryBatch as any).get_leave_details;
        }
        if (leaveBalanceData?.get_leave_details && Array.isArray(leaveBalanceData.get_leave_details)) {
            return leaveBalanceData.get_leave_details;
        }
        return [];
    }, [leaveHistoryBatch, leaveBalanceData]);

    const isHistoryLoading = isLoadingHistory;

    // Filtered History Data
    const filteredHistoryData = useMemo(() => {
        if (!effectiveHistory) return [];
        if (!searchQuery) return effectiveHistory;

        const lowerSearch = searchQuery.toLowerCase();

        return effectiveHistory.filter((item: any) => {
            const leaveName = (item.hrmL_LeaveName || '').toLowerCase();
            const reason = (item.hrelaP_LeaveReason || '').toLowerCase();
            const status = (item.hrelaP_ApplicationStatus || '').toLowerCase();

            return leaveName.includes(lowerSearch) || reason.includes(lowerSearch) || status.includes(lowerSearch);
        });
    }, [effectiveHistory, searchQuery]);

    // Combined Data for Grid 1 (Balance + Latest History)
    const combinedBalanceData = useMemo(() => {
        if (!leaveBalanceData?.employeeLeaves) return [];

        return leaveBalanceData.employeeLeaves.map((balance) => {
            // Find the most recent history record for this leave type
            const latestHistory = effectiveHistory
                ?.filter((h: any) => h.hrmL_Id === balance.hrmL_Id)
                .sort((a: any, b: any) => new Date(b.hrelaP_FromDate).getTime() - new Date(a.hrelaP_FromDate).getTime())[0];

            return {
                ...balance,
                latestFromDate: latestHistory?.hrelaP_FromDate || null,
                latestToDate: latestHistory?.hrelaP_ToDate || null,
                latestTotDays: latestHistory?.hreltD_TotDays || null
            };
        });
    }, [leaveBalanceData, effectiveHistory]);

    const [selectedLeave, setSelectedLeave] = useState<any>(null);
    const [selectedFromDate, setSelectedFromDate] = useState<Date | undefined>(undefined);
    const [selectedToDate, setSelectedToDate] = useState<Date | undefined>(undefined);
    const [isHalfDay, setIsHalfDay] = useState<boolean>(false);

    // Grid 1 Columns (Balance with Dates)
    const balanceColumns: ColumnDef<any>[] = [
        {
            id: 'select',
            header: '',
            cell: ({ row }) => (
                <div
                    className='flex cursor-pointer items-center justify-center p-1'
                    onClick={() => {
                        setSelectedLeave(row.original);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        setSelectedFromDate(today);
                        setSelectedToDate(today);
                        setIsHalfDay(false);
                    }}>
                    <div
                        className={cn(
                            'flex h-4 w-4 items-center justify-center rounded-full border-2 transition-all',
                            selectedLeave?.hrmL_Id === row.original.hrmL_Id ? 'border-primary bg-primary' : 'border-slate-300'
                        )}>
                        {selectedLeave?.hrmL_Id === row.original.hrmL_Id && <div className='h-1.5 w-1.5 rounded-full bg-white' />}
                    </div>
                </div>
            )
        },
        {
            header: 'SNO',
            cell: ({ row }) => (
                <div
                    className='cursor-pointer font-mono text-xs'
                    onClick={() => {
                        setSelectedLeave(row.original);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        setSelectedFromDate(today);
                        setSelectedToDate(today);
                        setIsHalfDay(false);
                    }}>
                    {row.index + 1}
                </div>
            )
        },
        {
            accessorKey: 'hrmL_LeaveName',
            header: 'LEAVE TYPE',
            cell: ({ row }) => (
                <span
                    className='cursor-pointer font-bold text-slate-700 transition-colors hover:text-primary'
                    onClick={() => {
                        setSelectedLeave(row.original);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        setSelectedFromDate(today);
                        setSelectedToDate(today);
                        setIsHalfDay(false);
                    }}>
                    {row.getValue('hrmL_LeaveName')}
                </span>
            )
        },
        {
            accessorKey: 'hrelS_TotalLeaves',
            header: 'TOTAL',
            cell: ({ row }) => <span className='font-black text-slate-500'>{row.getValue('hrelS_TotalLeaves')}</span>
        },
        {
            accessorKey: 'hrelS_CBLeaves',
            header: 'BALANCE',
            cell: ({ row }) => <span className='font-black text-green-600'>{row.getValue('hrelS_CBLeaves')}</span>
        },
        {
            accessorKey: 'latestFromDate',
            header: 'FROM DATE',
            cell: ({ row }) => {
                const isSelected = selectedLeave?.hrmL_Id === row.original.hrmL_Id;
                const activeDate = isSelected ? selectedFromDate : undefined;

                return (
                    <div className='flex w-max items-center gap-2'>
                        <span className={cn('font-medium text-[11px]', isSelected ? 'font-black text-primary' : 'text-slate-600')}>
                            {activeDate ? format(activeDate, 'dd-MM-yyyy') : '-- -- ----'}
                        </span>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant='ghost'
                                    size='icon'
                                    className='h-6 w-6 rounded-full p-0 transition-all hover:bg-primary/10 hover:text-primary'>
                                    <CalendarIcon className='h-3 w-3' />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className='w-auto p-0' align='start' side='bottom'>
                                <Calendar
                                    mode='single'
                                    selected={activeDate}
                                    onSelect={(date) => {
                                        setSelectedLeave(row.original);
                                        setSelectedFromDate(date);
                                        // Reset toDate if it's before the new fromDate
                                        if (selectedToDate && date && date > selectedToDate) {
                                            setSelectedToDate(date);
                                        }
                                        setIsHalfDay(false);
                                    }}
                                    disabled={(date) => {
                                        const today = new Date();
                                        today.setHours(0, 0, 0, 0);
                                        const balance = Number(row.original.hrelS_CBLeaves) || 0;
                                        const maxDate = new Date(today);
                                        maxDate.setDate(today.getDate() + Math.max(0, Math.ceil(balance) - 1));

                                        return date < today || date > maxDate;
                                    }}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                );
            }
        },
        {
            accessorKey: 'latestToDate',
            header: 'TO DATE',
            cell: ({ row }) => {
                const isSelected = selectedLeave?.hrmL_Id === row.original.hrmL_Id;
                const activeDate = isSelected ? selectedToDate : undefined;

                return (
                    <div className='flex w-max items-center gap-2'>
                        <span className={cn('font-medium text-[11px]', isSelected ? 'font-black text-primary' : 'text-slate-600')}>
                            {activeDate ? format(activeDate, 'dd-MM-yyyy') : '-- -- ----'}
                        </span>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant='ghost'
                                    size='icon'
                                    className='h-6 w-6 rounded-full p-0 transition-all hover:bg-primary/10 hover:text-primary'>
                                    <CalendarIcon className='h-3 w-3' />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className='w-auto p-0' align='start' side='bottom'>
                                <Calendar
                                    mode='single'
                                    selected={activeDate}
                                    onSelect={(date) => {
                                        setSelectedLeave(row.original);
                                        setSelectedToDate(date);
                                        setIsHalfDay(false);
                                    }}
                                    disabled={(date) => {
                                        const today = new Date();
                                        today.setHours(0, 0, 0, 0);
                                        const balance = Number(row.original.hrelS_CBLeaves) || 0;
                                        const maxDate = new Date(today);
                                        maxDate.setDate(today.getDate() + Math.max(0, Math.ceil(balance) - 1));

                                        // ToDate cannot be before selected FromDate (or Today if not selected)
                                        const minDate = isSelected && selectedFromDate ? new Date(selectedFromDate) : today;
                                        minDate.setHours(0, 0, 0, 0);

                                        return date < minDate || date > maxDate;
                                    }}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                );
            }
        },
        {
            accessorKey: 'latestTotDays',
            header: 'TOTAL DAYS',
            cell: ({ row }) => {
                const isSelected = selectedLeave?.hrmL_Id === row.original.hrmL_Id;

                if (!isSelected) {
                    return <span className='text-slate-300'>---</span>;
                }

                let days = 0;
                if (selectedFromDate && selectedToDate) {
                    days = differenceInDays(selectedToDate, selectedFromDate) + 1;
                }

                const isSingleDay = days === 1;
                const displayDays = isSingleDay && isHalfDay ? 0.5 : days;

                return (
                    <div className='flex w-max items-center gap-3'>
                        <Input readOnly value={displayDays || ''} className='h-8 w-16 bg-white text-center font-bold text-xs' />
                        <div className='flex items-center space-x-1.5'>
                            <Checkbox
                                id={`half-day-${row.original.hrmL_Id}`}
                                disabled={!isSingleDay}
                                checked={isSingleDay && isHalfDay}
                                onCheckedChange={(checked) => setIsHalfDay(checked === true)}
                            />
                            <label
                                htmlFor={`half-day-${row.original.hrmL_Id}`}
                                className={cn(
                                    'cursor-pointer whitespace-nowrap font-medium text-xs',
                                    !isSingleDay ? 'cursor-not-allowed opacity-50' : 'text-slate-700'
                                )}>
                                Half day
                            </label>
                        </div>
                    </div>
                );
            }
        }
    ];

    // Grid 2 Columns (History)
    const historyColumns = useMemo(
        () =>
            getOnlineAdminLeaveColumns({
                onView: (row) => console.log('View', row),
                onDelete: (id) => {
                    if (confirm('Are you sure you want to delete this leave application?')) {
                        console.log('Delete', id);
                    }
                },
                onEdit: () => {} // Edit is disabled in columns.tsx
            }),
        []
    );

    // Calculate current selection total days for form
    const currentTotalDays = useMemo(() => {
        if (selectedFromDate && selectedToDate) {
            const days = differenceInDays(selectedToDate, selectedFromDate) + 1;
            if (days === 1 && isHalfDay) {
                return 0.5;
            }
            return days;
        }
        return undefined;
    }, [selectedFromDate, selectedToDate, isHalfDay]);

    return (
        <div className='min-h-screen bg-slate-50/50 p-4 md:p-6'>
            <div className='mx-auto max-w-[1400px] space-y-6'>
                {/* Master Header with Dropdown */}
                <header className='flex flex-col items-center justify-between gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row'>
                    <div className='flex items-center gap-4'>
                        <div className='rounded-2xl bg-primary/10 p-3'>
                            <Layers className='h-7 w-7 text-primary' />
                        </div>
                        <div>
                            <h1 className='font-black text-2xl text-slate-900 tracking-tight'>Online Leave Application</h1>
                            <p className='font-medium text-slate-500 text-sm'>Manage employee leaves efficiently</p>
                        </div>
                    </div>

                    <div className='w-full space-y-1.5 md:w-[400px]'>
                        <label className='ml-1 font-black text-[12px] uppercase tracking-widest'>Select Employee</label>
                        <Select
                            searchable={false}
                            onValueChange={(value) => {
                                setSelectedEmployeeId(Number(value));
                                setSelectedLeave(null);
                                setSelectedFromDate(undefined);
                                setSelectedToDate(undefined);
                            }}
                            value={selectedEmployeeId && selectedEmployeeId > 0 ? selectedEmployeeId.toString() : ''}>
                            <SelectTrigger className='h-12 rounded-xl border-primary/20 transition-all hover:bg-slate-50 focus:ring-primary/20'>
                                <SelectValue placeholder='Search and Select Staff...' />
                            </SelectTrigger>
                            <SelectContent className='max-h-80'>
                                <div className='sticky top-0 z-10 mb-1 border-b bg-white p-2'>
                                    <div className='relative'>
                                        <Search className='-translate-y-1/2 absolute top-1/2 left-2.5 h-4 w-4 text-muted-foreground' />
                                        <Input
                                            placeholder='Type Name or Code...'
                                            className='h-9 border-primary/10 pl-8 text-xs focus-visible:ring-primary/20'
                                            value={staffSearch}
                                            onChange={(e) => setStaffSearch(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key !== 'Escape') e.stopPropagation();
                                            }}
                                        />
                                    </div>
                                </div>
                                {isLoadingEmployees ? (
                                    <div className='p-4 text-center text-slate-400 text-sm italic'>Loading staff...</div>
                                ) : filteredEmployeeList.length > 0 ? (
                                    filteredEmployeeList.map((emp) => (
                                        <SelectItem key={emp.hrmE_Id} value={emp.hrmE_Id.toString()} className='py-2.5'>
                                            <div className='flex flex-col'>
                                                <span className='font-bold text-sm'>{emp.employeeName}</span>
                                                <span className='text-[10px] text-slate-400'>
                                                    Code: {emp.hrmE_EmployeeCode} | ID: {emp.hrmE_Id}
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))
                                ) : (
                                    <div className='p-4 text-center text-slate-400 text-sm italic'>No matching staff found</div>
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                </header>

                {selectedEmployeeId ? (
                    <div className='fade-in grid grid-cols-1 gap-6'>
                        {/* Selected Employee Info */}
                        {leaveBalanceData?.employeeDetails && (
                            <div className='flex flex-wrap items-center gap-8 rounded-xl border border-primary/10 bg-primary/5 p-4 shadow-inner'>
                                <div className='flex items-center gap-3'>
                                    <div className='rounded-lg bg-white p-2 font-black text-primary text-xs shadow-sm'>NAME</div>
                                    <span className='font-black text-slate-700 text-sm'>
                                        {leaveBalanceData.employeeDetails.hrmE_EmployeeName}
                                    </span>
                                </div>
                                <div className='flex items-center gap-3'>
                                    <div className='rounded-lg bg-white p-2 font-black text-primary text-xs shadow-sm'>CODE</div>
                                    <span className='font-black text-slate-700 text-sm'>
                                        {leaveBalanceData.employeeDetails.hrmE_EmployeeCode}
                                    </span>
                                </div>
                                <div className='flex items-center gap-3'>
                                    <div className='rounded-lg bg-white p-2 font-black text-primary text-xs shadow-sm'>DESIGNATION</div>
                                    <span className='font-black text-slate-700 text-sm'>
                                        {leaveBalanceData.employeeDetails.hrmdeS_DesignationName}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className='grid grid-cols-1 gap-6'>
                            {/* Integrated Leave Balance & Application Card */}
                            <Card className='overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm'>
                                <CardHeader className='border-b bg-slate-50/50 pb-4'>
                                    <div className='flex items-center justify-between'>
                                        <div className='space-y-1'>
                                            <CardTitle className='flex items-center gap-2 font-bold text-base text-slate-800'>
                                                <Info className='h-4 w-4 text-primary' />
                                                Employee Leave Details
                                            </CardTitle>
                                            <CardDescription className='text-xs'>Current leave balance status</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className='p-0'>
                                    {/* Balance Grid */}
                                    <div className='border-slate-100 border-b'>
                                        <GenericDataTable
                                            columns={balanceColumns}
                                            isLoading={isLoadingBalance}
                                            data={combinedBalanceData}
                                            totalItems={combinedBalanceData.length}
                                            success={true}
                                            loadingMessage='Loading balance...'
                                            noDataTitle='No Balance Found'
                                            isPaginationRequired={false}
                                            isSearchRequired={false}
                                        />
                                    </div>

                                    {/* Selection Banner */}
                                    <div className='flex items-center justify-between border-slate-100 border-b bg-slate-50/50 px-6 py-4'>
                                        {selectedLeave ? (
                                            <div className='slide-in-from-top-1 flex animate-in items-center gap-4 duration-200'>
                                                <Badge
                                                    variant='outline'
                                                    className='rounded-full border-none bg-primary px-3 py-1 font-black text-[9px] text-white uppercase'>
                                                    SELECTED
                                                </Badge>
                                                <div className='flex flex-col'>
                                                    <span className='font-black text-slate-800 text-xs uppercase'>
                                                        {selectedLeave.hrmL_LeaveName}
                                                    </span>
                                                    <span className='font-bold text-[10px] text-slate-400'>
                                                        {selectedFromDate && selectedToDate
                                                            ? `${format(selectedFromDate, 'dd MMM')} → ${format(selectedToDate, 'dd MMM')} (${currentTotalDays} Days)`
                                                            : 'Please select dates in the grid above'}
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className='flex items-center gap-2 text-slate-300 italic'>
                                                <Info className='h-4 w-4' />
                                                <span className='font-bold text-[10px] uppercase tracking-widest'>
                                                    Select a leave row and dates in the grid above
                                                </span>
                                            </div>
                                        )}
                                        {selectedLeave && (
                                            <Button
                                                variant='ghost'
                                                className='h-7 rounded-full px-4 font-black text-[10px] text-primary uppercase hover:bg-primary/10'
                                                onClick={() => {
                                                    setSelectedLeave(null);
                                                    setSelectedFromDate(undefined);
                                                    setSelectedToDate(undefined);
                                                }}>
                                                Clear Selection
                                            </Button>
                                        )}
                                    </div>

                                    {/* Application Form Integrated Below Grid */}
                                    <div className='mt-8 pb-4'>
                                        <ApplyLeaveForm
                                            combinedBalanceData={combinedBalanceData}
                                            isLoadingBalance={isLoadingBalance}
                                            selectedEmployeeId={selectedEmployeeId}
                                            selectedLeave={selectedLeave}
                                            selectedFromDate={selectedFromDate}
                                            selectedToDate={selectedToDate}
                                            totalDays={currentTotalDays}
                                            onSuccess={() => {
                                                setSelectedLeave(null);
                                                setSelectedFromDate(undefined);
                                                setSelectedToDate(undefined);
                                                refetchHistory();
                                            }}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Grid 2: Leave History */}
                        <Card className='overflow-hidden rounded-2xl border-slate-200 shadow-sm'>
                            <CardHeader className='flex flex-row items-center justify-between border-b bg-slate-50/50 pb-4'>
                                <div className='space-y-1'>
                                    <CardTitle className='flex items-center gap-2 font-bold text-base'>
                                        <ClipboardList className='h-4 w-4 text-primary' />
                                        Leave History
                                    </CardTitle>
                                    <CardDescription className='text-xs'>Previously applied leaves</CardDescription>
                                </div>
                                <div className='relative w-64'>
                                    <Search className='-translate-y-1/2 absolute top-1/2 left-2.5 h-4 w-4 text-slate-300' />
                                    <Input
                                        placeholder='Search in history...'
                                        className='h-9 border-slate-200 bg-white pl-9 text-xs ring-0'
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </CardHeader>
                            <CardContent className='p-0'>
                                <GenericDataTable
                                    columns={historyColumns}
                                    isLoading={isHistoryLoading}
                                    data={filteredHistoryData}
                                    totalItems={filteredHistoryData.length}
                                    success={true}
                                    loadingMessage='Loading history...'
                                    isSearchRequired={false}
                                />
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <div className='space-y-6 rounded-3xl border-2 border-slate-200 border-dashed bg-white p-20 text-center'>
                        <div className='mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-slate-100 bg-slate-50 shadow-sm'>
                            <UserCheck className='h-10 w-10 text-slate-300' />
                        </div>
                        <div className='mx-auto max-w-md space-y-2'>
                            <h2 className='font-black text-slate-800 text-xl uppercase tracking-tight'>No Staff Selected</h2>
                            <p className='font-medium text-slate-500 leading-relaxed'>
                                Please select an employee from the dropdown at the top to view their leave balance, apply for new leaves,
                                and check history.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
