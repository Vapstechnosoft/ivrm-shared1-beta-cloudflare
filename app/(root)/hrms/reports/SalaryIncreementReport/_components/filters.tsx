'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Loader2, RotateCcw } from 'lucide-react';

export interface SalaryIncrementFilters {
    type: 'Individual' | 'All';
    option: 'MONTHWISE' | 'DATEWISE';
    hrmE_Id: string;
    monthid: string;
    yearid: string;
    fromdate: Date | undefined;
    todate: Date | undefined;
}

export interface SalaryIncrementErrors {
    hrmE_Id?: string;
    monthid?: string;
    yearid?: string;
    fromdate?: string;
    todate?: string;
}

interface SalaryIncrementFiltersProps {
    filters: SalaryIncrementFilters;
    errors?: SalaryIncrementErrors;
    employees: any[];
    months: any[];
    years: any[];
    isLoadingEmployees: boolean;
    isLoadingYears: boolean;
    isGenerating: boolean;
    hasResults: boolean;
    onFilterChange: (filters: SalaryIncrementFilters) => void;
    onReport: () => void;
    onCancel: () => void;
    onPrint: () => void;
    onExport: () => void;
}

export function SalaryIncrementFilters({
    filters,
    errors,
    employees,
    months,
    years,
    isLoadingEmployees,
    isLoadingYears,
    isGenerating,
    hasResults,
    onFilterChange,
    onReport,
    onCancel,
    onPrint,
    onExport
}: SalaryIncrementFiltersProps) {
    return (
        <CollapsibleSection
            title='Salary Increment Report'
            description='Detailed report of employee salary increments and head-wise changes.'
            defaultOpen={true}>
            <Card className='shadow-md'>
                <CardContent className='space-y-6 p-6'>
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                        {/* Employee Type Selection */}
                        <div className='space-y-4 rounded-xl border bg-muted/20 p-4'>
                            <Label className='font-bold text-muted-foreground text-sm uppercase tracking-wider'>Selection Type</Label>
                            <RadioGroup
                                value={filters.type}
                                onValueChange={(value: 'Individual' | 'All') => onFilterChange({ ...filters, type: value })}
                                className='flex gap-8'>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='All' id='type-all' />
                                    <Label htmlFor='type-all' className='cursor-pointer font-medium'>
                                        All Employees
                                    </Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='Individual' id='type-individual' />
                                    <Label htmlFor='type-individual' className='cursor-pointer font-medium'>
                                        Individual
                                    </Label>
                                </div>
                            </RadioGroup>

                            {filters.type === 'Individual' && (
                                <div className='fade-in slide-in-from-bottom-2 animate-in space-y-2 pt-2 duration-300'>
                                    <Label className='font-semibold text-xs'>
                                        Select Employee <span className='text-destructive'>*</span>
                                    </Label>
                                    <Select
                                        value={filters.hrmE_Id}
                                        onValueChange={(value) => onFilterChange({ ...filters, hrmE_Id: value })}
                                        disabled={isLoadingEmployees}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={isLoadingEmployees ? 'Loading employees...' : 'Choose an employee'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {employees.map((emp) => (
                                                <SelectItem key={emp.key} value={emp.key.toString()}>
                                                    {emp.value}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors?.hrmE_Id && (
                                        <p className='fade-in slide-in-from-top-1 animate-in font-medium text-[11px] text-destructive'>
                                            {errors.hrmE_Id}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Report Option Selection */}
                        <div className='space-y-4 rounded-xl border bg-muted/20 p-4'>
                            <Label className='font-bold text-muted-foreground text-sm uppercase tracking-wider'>Report Range</Label>
                            <RadioGroup
                                value={filters.option}
                                onValueChange={(value: 'MONTHWISE' | 'DATEWISE') => onFilterChange({ ...filters, option: value })}
                                className='flex gap-8'>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='MONTHWISE' id='opt-month' />
                                    <Label htmlFor='opt-month' className='cursor-pointer font-medium'>
                                        Month-Wise
                                    </Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='DATEWISE' id='opt-date' />
                                    <Label htmlFor='opt-date' className='cursor-pointer font-medium'>
                                        Date-Wise
                                    </Label>
                                </div>
                            </RadioGroup>

                            <div className='pt-2'>
                                {filters.option === 'MONTHWISE' ? (
                                    <div className='fade-in slide-in-from-bottom-2 grid animate-in grid-cols-2 gap-4 duration-300'>
                                        <div className='space-y-2'>
                                            <Label className='font-semibold text-xs'>
                                                Month <span className='text-destructive'>*</span>
                                            </Label>
                                            <Select
                                                value={filters.monthid}
                                                onValueChange={(value) => onFilterChange({ ...filters, monthid: value })}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Select Month' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {months.map((m) => (
                                                        <SelectItem key={m.ivrM_Month_Id} value={m.ivrM_Month_Id.toString()}>
                                                            {m.ivrM_Month_Name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors?.monthid && (
                                                <p className='fade-in slide-in-from-top-1 animate-in font-medium text-[11px] text-destructive'>
                                                    {errors.monthid}
                                                </p>
                                            )}
                                        </div>
                                        <div className='space-y-2'>
                                            <Label className='font-semibold text-xs'>
                                                Year <span className='text-destructive'>*</span>
                                            </Label>
                                            <Select
                                                value={filters.yearid}
                                                onValueChange={(value) => onFilterChange({ ...filters, yearid: value })}
                                                disabled={isLoadingYears || years.length === 0}>
                                                <SelectTrigger>
                                                    {isLoadingYears ? (
                                                        <SelectValue placeholder='Loading years...' />
                                                    ) : (
                                                        <SelectValue placeholder='Select Year' />
                                                    )}
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {years?.map((y) => (
                                                        <SelectItem key={y.hrmlY_Id} value={y.hrmlY_LeaveYear}>
                                                            {y.hrmlY_LeaveYear}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors?.yearid && (
                                                <p className='fade-in slide-in-from-top-1 animate-in font-medium text-[11px] text-destructive'>
                                                    {errors.yearid}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className='fade-in slide-in-from-bottom-2 grid animate-in grid-cols-2 gap-4 duration-300'>
                                        <div className='space-y-2'>
                                            <Label className='font-semibold text-xs'>
                                                From Date <span className='text-destructive'>*</span>
                                            </Label>
                                            <DatePicker
                                                date={filters.fromdate}
                                                setDate={(date) => onFilterChange({ ...filters, fromdate: date })}
                                            />
                                            {errors?.fromdate && (
                                                <p className='fade-in slide-in-from-top-1 animate-in font-medium text-[11px] text-destructive'>
                                                    {errors.fromdate}
                                                </p>
                                            )}
                                        </div>
                                        <div className='space-y-2'>
                                            <Label className='font-semibold text-xs'>
                                                To Date <span className='text-destructive'>*</span>
                                            </Label>
                                            <DatePicker
                                                date={filters.todate}
                                                setDate={(date) => onFilterChange({ ...filters, todate: date })}
                                            />
                                            {errors?.todate && (
                                                <p className='fade-in slide-in-from-top-1 animate-in font-medium text-[11px] text-destructive'>
                                                    {errors.todate}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className='flex justify-center gap-4 border-t pt-6'>
                        <Button
                            onClick={onReport}
                            disabled={isGenerating || (filters.type === 'Individual' && !filters.hrmE_Id)}
                            variant='default'
                            className='min-w-[140px] shadow-lg transition-all hover:scale-105'>
                            {isGenerating ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <FileText className='mr-2 h-4 w-4' />}
                            {isGenerating ? 'Processing...' : 'View Report'}
                        </Button>
                        <Button
                            variant='outline'
                            onClick={onCancel}
                            className='min-w-[140px] hover:bg-destructive/10 hover:text-destructive'>
                            <RotateCcw className='mr-2 h-4 w-4' />
                            Reset Filters
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </CollapsibleSection>
    );
}
