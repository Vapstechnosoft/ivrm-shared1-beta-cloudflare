'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { Calendar, FileSpreadsheet, Filter, Printer, RotateCcw, Search, UserCheck } from 'lucide-react';
import type { MonthItem } from '../types';

interface VisitorReportFilterProps {
    monthList: MonthItem[];
    searchBy: string;
    setSearchBy: (val: string) => void;
    searchValue: string;
    setSearchValue: (val: string) => void;
    meetingDate: string;
    setMeetingDate: (val: string) => void;
    filterMode: '1' | '0';
    setFilterMode: (val: '1' | '0') => void;
    selectedMonth: string;
    setSelectedMonth: (val: string) => void;
    fromDate: string;
    setFromDate: (val: string) => void;
    toDate: string;
    setToDate: (val: string) => void;
    onGenerateReport: () => void;
    onCancel: () => void;
    onPrint: () => void;
    onExportExcel: () => void;
    isLoading: boolean;
    hasData: boolean;
}

export default function VisitorReportFilter({
    monthList,
    searchBy,
    setSearchBy,
    searchValue,
    setSearchValue,
    meetingDate,
    setMeetingDate,
    filterMode,
    setFilterMode,
    selectedMonth,
    setSelectedMonth,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    onGenerateReport,
    onCancel,
    onPrint,
    onExportExcel,
    isLoading,
    hasData
}: VisitorReportFilterProps) {
    const getSearchLabel = () => {
        switch (searchBy) {
            case 'VMMV_VisitorName':
                return 'Visitor Name';
            case 'VMMV_VisitorContactNo':
                return 'Contact No';
            case 'VMMV_VisitorEmailid':
                return 'Email Id';
            case 'AMVM_To_Meet':
                return 'Meet Person';
            default:
                return 'Search Value';
        }
    };

    const isSearchValueValid =
        !searchBy || searchBy === 'all' || (searchBy === 'VMMV_MeetingDateTime' ? !!meetingDate : !!searchValue.trim());

    const isDateRangeValid = filterMode === '0' ? !!selectedMonth : !!(fromDate && toDate && new Date(fromDate) <= new Date(toDate));

    const isFormValid = !!searchBy && isSearchValueValid && isDateRangeValid;

    return (
        <Card className='shadow-sm'>
            <CardHeader className='border-b bg-muted/30 pb-4'>
                <div className='flex items-center space-x-2'>
                    <Filter className='h-5 w-5 text-primary' />
                    <div>
                        <CardTitle className='font-semibold text-base'>Report Selection Criteria</CardTitle>
                        <CardDescription className='text-xs'>
                            Filter visitors by name, contact, meeting date, or date range and generate detailed reports
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className='space-y-6 pt-6'>
                {/* 1. Search Criteria & Parameter */}
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                    {/* Search By */}
                    <div className='space-y-1.5'>
                        <Label htmlFor='search-by-select' className='font-semibold text-xs'>
                            Search By <span className='text-destructive'>*</span>
                        </Label>
                        <Select
                            value={searchBy}
                            onValueChange={(val) => {
                                setSearchBy(val);
                                setSearchValue('');
                                setMeetingDate('');
                            }}>
                            <SelectTrigger id='search-by-select' className='h-9 text-xs'>
                                <SelectValue placeholder='-- Select Search Field --' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='all' className='text-xs'>
                                    All Visitors
                                </SelectItem>
                                <SelectItem value='VMMV_VisitorName' className='text-xs'>
                                    Visitor Name
                                </SelectItem>
                                <SelectItem value='VMMV_VisitorContactNo' className='text-xs'>
                                    Contact No
                                </SelectItem>
                                <SelectItem value='VMMV_VisitorEmailid' className='text-xs'>
                                    Email Id
                                </SelectItem>
                                <SelectItem value='VMMV_MeetingDateTime' className='text-xs'>
                                    Meeting Date
                                </SelectItem>
                                <SelectItem value='AMVM_To_Meet' className='text-xs'>
                                    Meet Person
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Value Input depending on searchby */}
                    {searchBy === 'VMMV_MeetingDateTime' ? (
                        <div className='space-y-1.5'>
                            <Label className='font-semibold text-xs'>
                                Enter Meeting Date <span className='text-destructive'>*</span>
                            </Label>
                            <DatePicker
                                date={meetingDate ? new Date(meetingDate) : undefined}
                                setDate={(d) => setMeetingDate(d ? format(d, 'yyyy-MM-dd') : '')}
                                placeholder='Select meeting date'
                                className='h-9 text-xs'
                            />
                        </div>
                    ) : searchBy && searchBy !== 'all' ? (
                        <div className='space-y-1.5'>
                            <Label htmlFor='txt-search-val' className='font-semibold text-xs'>
                                Enter {getSearchLabel()} <span className='text-destructive'>*</span>
                            </Label>
                            <Input
                                id='txt-search-val'
                                placeholder={`Enter ${getSearchLabel().toLowerCase()}...`}
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                className='h-9 text-xs'
                            />
                        </div>
                    ) : (
                        <div className='flex items-end pb-1'>
                            <div className='flex items-center gap-1.5 rounded-md border border-dashed bg-muted/40 px-3 py-2 text-muted-foreground text-xs'>
                                <UserCheck className='h-4 w-4 text-primary' />
                                <span>All visitors will be included</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* 2. Filter Mode Selection (Between Days vs Month Wise) */}
                <div className='space-y-4 border-t pt-4'>
                    <div className='flex flex-col gap-4 sm:flex-row sm:items-center'>
                        <Label className='font-semibold text-muted-foreground text-xs uppercase tracking-wider'>
                            Date Criteria <span className='text-destructive'>*</span>
                        </Label>
                        <RadioGroup
                            value={filterMode}
                            onValueChange={(val) => setFilterMode(val as '1' | '0')}
                            className='flex items-center gap-6'>
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='1' id='rf-visitor-days' />
                                <Label htmlFor='rf-visitor-days' className='flex cursor-pointer items-center gap-1.5 font-medium text-xs'>
                                    <Calendar className='h-3.5 w-3.5 text-primary' />
                                    Between Days
                                </Label>
                            </div>
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='0' id='rf-visitor-month' />
                                <Label htmlFor='rf-visitor-month' className='cursor-pointer font-medium text-xs'>
                                    Month Wise
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Date Inputs */}
                    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                        {filterMode === '0' ? (
                            <div className='space-y-1.5 sm:col-span-2'>
                                <Label htmlFor='visitor-month-select' className='font-semibold text-xs'>
                                    Month <span className='text-destructive'>*</span>
                                </Label>
                                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                    <SelectTrigger id='visitor-month-select' className='h-9 text-xs'>
                                        <SelectValue placeholder='-- Select Month --' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {monthList.map((m) => (
                                            <SelectItem key={m.monthid} value={m.monthid.toString()} className='text-xs'>
                                                {m.monthname}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        ) : (
                            <>
                                <div className='space-y-1.5 sm:col-span-1'>
                                    <Label className='font-semibold text-xs'>
                                        From Date <span className='text-destructive'>*</span>
                                    </Label>
                                    <DatePicker
                                        date={fromDate ? new Date(fromDate) : undefined}
                                        setDate={(d) => setFromDate(d ? format(d, 'yyyy-MM-dd') : '')}
                                        placeholder='Enter From date'
                                        className='h-9 text-xs'
                                    />
                                </div>
                                <div className='space-y-1.5 sm:col-span-1'>
                                    <Label className='font-semibold text-xs'>
                                        To Date <span className='text-destructive'>*</span>
                                    </Label>
                                    <DatePicker
                                        date={toDate ? new Date(toDate) : undefined}
                                        setDate={(d) => setToDate(d ? format(d, 'yyyy-MM-dd') : '')}
                                        placeholder='Enter To date'
                                        className='h-9 text-xs'
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* 3. Action Buttons */}
                <div className='flex flex-wrap items-center gap-3 border-t pt-4 sm:justify-start'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={onCancel}
                        disabled={isLoading}
                        className='h-9 rounded-2xl border-gray-300 px-5 text-xs transition-all duration-200 hover:scale-105'>
                        <RotateCcw className='mr-1.5 h-3.5 w-3.5' />
                        Reset
                    </Button>

                    <Button
                        type='button'
                        onClick={onGenerateReport}
                        disabled={isLoading || !isFormValid}
                        className='h-9 rounded-2xl bg-[#EE7854] px-5 text-white text-xs shadow-sm transition-all duration-200 hover:scale-105 hover:bg-[#d96643]'>
                        <Search className='mr-1.5 h-3.5 w-3.5' />
                        {isLoading ? 'Generating...' : 'Report'}
                    </Button>

                    <Button
                        type='button'
                        variant='outline'
                        onClick={onPrint}
                        disabled={!hasData || isLoading}
                        className='h-9 rounded-2xl px-5 text-xs transition-all duration-200 hover:scale-105'>
                        <Printer className='mr-1.5 h-3.5 w-3.5' />
                        Print
                    </Button>

                    <Button
                        type='button'
                        variant='outline'
                        onClick={onExportExcel}
                        disabled={!hasData || isLoading}
                        className='h-9 rounded-2xl border-emerald-500/30 px-5 text-emerald-600 text-xs transition-all duration-200 hover:scale-105 hover:bg-emerald-50'>
                        <FileSpreadsheet className='mr-1.5 h-3.5 w-3.5 text-emerald-600' />
                        Excel
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
