'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { Briefcase, FileSpreadsheet, Filter, GraduationCap, Printer, Search } from 'lucide-react';
import type { MonthItem } from '../types';

interface GatePassReportFilterProps {
    monthList: MonthItem[];
    radioType: 'std' | 'emp';
    setRadioType: (val: 'std' | 'emp') => void;
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

export default function GatePassReportFilter({
    monthList,
    radioType,
    setRadioType,
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
}: GatePassReportFilterProps) {
    const isFormValid = filterMode === '0' ? !!selectedMonth : !!(fromDate && toDate && new Date(fromDate) <= new Date(toDate));

    return (
        <Card className='shadow-sm'>
            <CardHeader className='border-b bg-muted/30 pb-4'>
                <div className='flex items-center space-x-2'>
                    <Filter className='h-5 w-5 text-primary' />
                    <div>
                        <CardTitle className='font-semibold text-base'>Report Selection Criteria</CardTitle>
                        <CardDescription className='text-xs'>
                            Select report category, filter mode and date range to generate the gate pass report
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className='space-y-6 pt-6'>
                {/* 1. Category & Filter Mode Selection */}
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                    {/* Report Category */}
                    <div className='space-y-2 rounded-lg border bg-muted/10 p-3'>
                        <Label className='font-semibold text-muted-foreground text-xs uppercase tracking-wider'>
                            Report Category <span className='text-destructive'>*</span>
                        </Label>
                        <RadioGroup
                            value={radioType}
                            onValueChange={(val) => setRadioType(val as 'std' | 'emp')}
                            className='flex items-center gap-6 pt-1'>
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='std' id='rg-std' />
                                <Label htmlFor='rg-std' className='flex cursor-pointer items-center gap-1.5 font-medium text-xs'>
                                    <GraduationCap className='h-4 w-4 text-primary' />
                                    Student Report
                                </Label>
                            </div>
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='emp' id='rg-emp' />
                                <Label htmlFor='rg-emp' className='flex cursor-pointer items-center gap-1.5 font-medium text-xs'>
                                    <Briefcase className='h-4 w-4 text-primary' />
                                    Employee Report
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Filter Mode */}
                    <div className='space-y-2 rounded-lg border bg-muted/10 p-3'>
                        <Label className='font-semibold text-muted-foreground text-xs uppercase tracking-wider'>
                            Filter Option <span className='text-destructive'>*</span>
                        </Label>
                        <RadioGroup
                            value={filterMode}
                            onValueChange={(val) => setFilterMode(val as '1' | '0')}
                            className='flex items-center gap-6 pt-1'>
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='1' id='rf-days' />
                                <Label htmlFor='rf-days' className='cursor-pointer font-medium text-xs'>
                                    Between Days
                                </Label>
                            </div>
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='0' id='rf-month' />
                                <Label htmlFor='rf-month' className='cursor-pointer font-medium text-xs'>
                                    Month Wise
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>
                </div>

                {/* 2. Dynamic Input Fields Grid */}
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                    {filterMode === '0' ? (
                        <div className='space-y-1.5 sm:col-span-2'>
                            <Label htmlFor='month-select' className='font-semibold text-xs'>
                                Month <span className='text-destructive'>*</span>
                            </Label>
                            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                <SelectTrigger id='month-select' className='h-9 text-xs'>
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

                {/* 3. Action Buttons matching Screenshot 1 */}
                <div className='flex flex-wrap items-center gap-3 border-t pt-4 sm:justify-start'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={onCancel}
                        disabled={isLoading}
                        className='h-9 rounded-2xl border-gray-300 px-5 text-xs transition-all duration-200 hover:scale-105'>
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
