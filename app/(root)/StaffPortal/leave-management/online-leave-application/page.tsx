'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { useOnlineLeave } from '@/hooks/staff-portal/useOnlineLeave';
import { cn } from '@/lib/utils';
import type { ColumnDef } from '@tanstack/react-table';
import { differenceInDays, format } from 'date-fns';
import { CalendarIcon, ClipboardList, Info } from 'lucide-react';
import ApplyLeaveForm from './_components/leave-application-form';
import LeaveHistoryTable from './_components/leave-history-table';

const InfoField = ({ label, value }: { label: string; value: string | number | undefined }) => (
    <div className='flex flex-col space-y-1'>
        <span className='font-black text-[10px] text-slate-400 uppercase tracking-widest'>{label}</span>
        <span className='font-bold text-slate-700 text-sm'>{value || '---'}</span>
    </div>
);

export default function OnlineLeavePage() {
    const {
        initialData,
        masterLeaveData,
        historyData,
        combinedBalanceData,
        isLoading,
        applyMutation,
        // Card States
        selectedLeave,
        setSelectedLeave,
        selectedFromDate,
        setSelectedFromDate,
        selectedToDate,
        setSelectedToDate,
        isHalfDay,
        setIsHalfDay,
        currentTotalDays
    } = useOnlineLeave();

    const employee = initialData?.employeeDetails?.[0];

    // Grid 1 Columns (Balance with Dates)
    const balanceColumns: ColumnDef<any>[] = [
        {
            id: 'select',
            header: '',
            cell: ({ row }) => {
                const isDisabled = Number(row.original.hrelS_CBLeaves) <= 0;
                return (
                    <div
                        className={cn(
                            'flex items-center justify-center p-1',
                            isDisabled ? 'cursor-not-allowed opacity-30' : 'cursor-pointer'
                        )}
                        onClick={() => {
                            if (isDisabled) return;
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
                );
            }
        },
        {
            header: 'S.NO',
            cell: ({ row }) => {
                const isDisabled = Number(row.original.hrelS_CBLeaves) <= 0;
                return (
                    <div
                        className={cn(
                            'font-mono text-xs',
                            isDisabled ? 'cursor-not-allowed text-slate-400 opacity-30' : 'cursor-pointer text-slate-700'
                        )}
                        onClick={() => {
                            if (isDisabled) return;
                            setSelectedLeave(row.original);
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            setSelectedFromDate(today);
                            setSelectedToDate(today);
                            setIsHalfDay(false);
                        }}>
                        {row.index + 1}
                    </div>
                );
            }
        },
        {
            accessorKey: 'hrmL_LeaveName',
            header: 'LEAVE TYPE',
            cell: ({ row }) => {
                const isDisabled = Number(row.original.hrelS_CBLeaves) <= 0;
                return (
                    <span
                        className={cn(
                            'font-bold transition-colors',
                            isDisabled ? 'cursor-not-allowed text-slate-400 opacity-50' : 'cursor-pointer text-slate-700 hover:text-primary'
                        )}
                        onClick={() => {
                            if (isDisabled) return;
                            setSelectedLeave(row.original);
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            setSelectedFromDate(today);
                            setSelectedToDate(today);
                            setIsHalfDay(false);
                        }}>
                        {row.getValue('hrmL_LeaveName')}
                    </span>
                );
            }
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
                const isDisabled = Number(row.original.hrelS_CBLeaves) <= 0;
                const activeDate = isSelected ? selectedFromDate : undefined;

                return (
                    <div className={cn('flex w-max items-center gap-2', isDisabled && 'cursor-not-allowed opacity-30')}>
                        <span className={cn('font-medium text-[11px]', isSelected ? 'font-black text-primary' : 'text-slate-600')}>
                            {activeDate ? format(activeDate, 'dd-MM-yyyy') : '-- -- ----'}
                        </span>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    disabled={isDisabled}
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

                                        return date < today; // Adjust logic if past dates are allowed
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
                const isDisabled = Number(row.original.hrelS_CBLeaves) <= 0;
                const activeDate = isSelected ? selectedToDate : undefined;

                return (
                    <div className={cn('flex w-max items-center gap-2', isDisabled && 'cursor-not-allowed opacity-30')}>
                        <span className={cn('font-medium text-[11px]', isSelected ? 'font-black text-primary' : 'text-slate-600')}>
                            {activeDate ? format(activeDate, 'dd-MM-yyyy') : '-- -- ----'}
                        </span>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    disabled={isDisabled}
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

                                        return date < minDate;
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

                const isDisabled = Number(row.original.hrelS_CBLeaves) <= 0;
                const displayDays = isHalfDay ? Math.max(0, days - 0.5) : days;

                return (
                    <div className={cn('flex w-max items-center gap-3', isDisabled && 'cursor-not-allowed opacity-30')}>
                        <Input
                            readOnly
                            disabled={isDisabled}
                            value={displayDays || ''}
                            className='h-8 w-16 bg-white text-center font-bold text-xs'
                        />
                        <div className='flex items-center space-x-1.5'>
                            <Checkbox
                                id={`half-day-${row.original.hrmL_Id}`}
                                disabled={isDisabled}
                                checked={isHalfDay && isSelected}
                                onCheckedChange={(checked) => setIsHalfDay(checked === true)}
                            />
                            <label
                                htmlFor={`half-day-${row.original.hrmL_Id}`}
                                className={cn(
                                    'whitespace-nowrap font-medium text-xs',
                                    isDisabled ? 'cursor-not-allowed text-slate-400' : 'cursor-pointer text-slate-700'
                                )}>
                                Half day
                            </label>
                        </div>
                    </div>
                );
            }
        }
    ];

    if (isLoading) {
        return (
            <div className='space-y-6 p-6'>
                <Skeleton className='h-[200px] w-full' />
                <Skeleton className='h-[400px] w-full' />
                <Skeleton className='h-[300px] w-full' />
            </div>
        );
    }

    return (
        <div className='fade-in mx-auto max-w-[1400px] animate-in space-y-8 p-6 duration-500'>
            <div className='flex items-center justify-between'>
                <h1 className='font-bold text-2xl text-primary tracking-tight'>Online Leave Application</h1>
            </div>

            <div className='grid grid-cols-1 gap-6'>
                {/* 1. Employee Info Section */}
                <Card className='overflow-hidden rounded-2xl border-none bg-gradient-to-br from-primary/5 to-primary/10 shadow-md'>
                    <CardHeader className='border-white/20 border-b bg-primary/5'>
                        <CardTitle className='flex items-center gap-2 font-black text-primary text-sm uppercase tracking-wider'>
                            <ClipboardList className='h-4 w-4' />
                            Employee Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className='pt-6 pb-6'>
                        <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5'>
                            <InfoField label='Employee Name' value={employee?.hrmE_EmployeeName} />
                            <InfoField label='Designation' value={employee?.hrmdeS_DesignationName} />
                            <InfoField label='DOJ' value={employee?.hrmE_DOJ ? format(new Date(employee.hrmE_DOJ), 'dd-MM-yyyy') : ''} />
                            <InfoField label='Email' value={employee?.hrmE_EmailId} />
                            <InfoField label='Phone' value={employee?.hrmE_MobileNo} />
                        </div>
                    </CardContent>
                </Card>
                {/* Integrated Leave Balance & Application Card */}
                <Card className='overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm'>
                    <CardHeader className='border-b bg-slate-50/50 pb-4'>
                        <div className='flex items-center justify-between'>
                            <div className='space-y-1'>
                                <CardTitle className='flex items-center gap-2 font-bold text-base text-slate-800'>
                                    <Info className='h-4 w-4 text-primary' />
                                    Leave Details
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
                                isLoading={isLoading}
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
                                        <span className='font-black text-slate-800 text-xs uppercase'>{selectedLeave.hrmL_LeaveName}</span>
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
                                employeeId={employee?.hrmE_Id}
                                selectedLeave={selectedLeave}
                                selectedFromDate={selectedFromDate}
                                selectedToDate={selectedToDate}
                                totalDays={currentTotalDays}
                                isHalfDay={isHalfDay}
                                setIsHalfDay={setIsHalfDay}
                                onSuccess={() => {
                                    setSelectedLeave(null);
                                    setSelectedFromDate(undefined);
                                    setSelectedToDate(undefined);
                                }}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Leave History Table */}
            <div className='space-y-4'>
                <div className='flex items-center gap-2'>
                    <ClipboardList className='h-5 w-5 text-primary' />
                    <h2 className='font-bold text-slate-800 text-xl'>Leave History</h2>
                </div>
                <LeaveHistoryTable historyData={historyData} />
            </div>
        </div>
    );
}
