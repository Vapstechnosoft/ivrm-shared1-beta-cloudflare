'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { CalendarIcon, Save, Search } from 'lucide-react';

import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { CalendarYear } from '@/components/ui/calendar_year';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAcademicYearDropdown } from '@/hooks/admission/preadmission/useMasters';
import { useAttendanceReport } from '@/hooks/admission/preadmission/useReports';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Controller, useForm } from 'react-hook-form';
import * as XLSX from 'xlsx';
import { z } from 'zod';

// allow dates up to today (today or any previous day)
const isBeforeOrEqualLocalDate = (a: Date, b: Date) =>
    a.getFullYear() < b.getFullYear() ||
    (a.getFullYear() === b.getFullYear() && a.getMonth() < b.getMonth()) ||
    (a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() <= b.getDate());

// helper to safely parse local date string without UTC timezone shift
const parseLocalDate = (val?: string): Date | undefined => {
    if (!val) return undefined;
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
        const [y, m, d] = val.split('-').map(Number);
        return new Date(y, m - 1, d);
    }
    const d = new Date(val);
    return Number.isNaN(d.getTime()) ? undefined : d;
};

// Local schema for this form (allow today and previous dates)
const attendanceAbsentSmsSchema = z.object({
    frequency: z.enum(['once', 'twice']).default('once'),
    asmaY_Id: z.number().min(1, 'Academic Year is required'),
    from_date: z
        .string()
        .nonempty('Date is required')
        .refine((val) => {
            const d = parseLocalDate(val);
            return d ? isBeforeOrEqualLocalDate(d, new Date()) : false;
        }, 'Only today or previous dates are allowed')
});
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

type FormFields = z.infer<typeof attendanceAbsentSmsSchema>;

export interface OverallAttendanceRow {
    RowNo?: number;
    ASMCL_ClassName?: string;
    ASMC_SectionName?: string;
    TOTAL?: number;
    PRESENT?: number;
    ABSENT?: number;
    HALFDAY?: number;
    ASMCL_Order?: number;
    ASMCL_Id?: number;
    ASMS_ID?: number;
    [key: string]: any;
}

export default function StudyCertificateReportPage(props: {
    searchParams: SearchParams;
}) {
    const searchParams = (React as any).use(props.searchParams);
    const [openPopover, setOpenPopover] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [reportData, setReportData] = useState<OverallAttendanceRow[]>([]);
    const [showReport, setShowReport] = useState(false);
    const [tableSearch, setTableSearch] = useState('');

    const querySearchParams = useMemo(() => {
        return {
            ...(searchParams || {}),
            page_size: 200
        };
    }, [searchParams]);

    const {
        control,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(attendanceAbsentSmsSchema),
        defaultValues: {
            frequency: 'once',
            from_date: format(new Date(), 'yyyy-MM-dd')
        }
    });

    // Dropdown data
    const { data: academicYears, isLoading: ayLoading } = useAcademicYearDropdown();
    const asmaY_Id = watch('asmaY_Id');
    const from_date = watch('from_date');
    const frequency = watch('frequency');
    const { data: response, refetch } = useAttendanceReport(asmaY_Id, from_date, frequency, querySearchParams);

    const onSubmit = async () => {
        if (!asmaY_Id || asmaY_Id === 0) {
            toast.error('Please select Academic Year');
            return;
        }
        setIsLoading(true);
        try {
            const { data } = await refetch();
            const records: OverallAttendanceRow[] = Array.isArray(data?.data)
                ? (data.data as OverallAttendanceRow[])
                : Array.isArray((data as any)?.studentAttendanceList)
                  ? ((data as any).studentAttendanceList as OverallAttendanceRow[])
                  : [];

            setReportData(records);
            setShowReport(true);
            if (records.length > 0) {
                toast.success(data?.message || 'Attendance fetched successfully');
            } else {
                toast.error('No data found for the selected criteria');
            }
        } catch {
            if (!response?.data) toast.error('Failed to generate report');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        reset({
            frequency: 'once',
            from_date: format(new Date(), 'yyyy-MM-dd'),
            asmaY_Id: undefined
        });
        setReportData([]);
        setShowReport(false);
        setTableSearch('');
    };

    const downloadExcel = async () => {
        if (!asmaY_Id || !from_date || !frequency) {
            toast.error('Please fill all required fields!');
            return;
        }

        setIsExporting(true);
        try {
            const { data } = await refetch();
            const records: OverallAttendanceRow[] = Array.isArray(data?.data)
                ? (data.data as OverallAttendanceRow[])
                : Array.isArray((data as any)?.studentAttendanceList)
                  ? ((data as any).studentAttendanceList as OverallAttendanceRow[])
                  : [];

            if (records.length === 0) {
                toast.error('No data found for the selected criteria');
                return;
            }

            const worksheet = XLSX.utils.aoa_to_sheet([
                ['Sl. No.', 'Class', 'Section', 'Strength', 'Present', 'Absent', 'Half Day'],
                ...records.map((item, index) => [
                    item.RowNo ?? index + 1,
                    item.ASMCL_ClassName || '-',
                    item.ASMC_SectionName || '-',
                    item.TOTAL ?? 0,
                    item.PRESENT ?? 0,
                    item.ABSENT ?? 0,
                    item.HALFDAY ?? 0
                ])
            ]);
            worksheet['!cols'] = [{ wch: 10 }, { wch: 18 }, { wch: 18 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }];

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Daily Attendance');
            XLSX.writeFile(workbook, `OverallDailyAttendance_${from_date}.xlsx`);
            toast.success('Excel downloaded successfully');
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Failed to download Excel');
        } finally {
            setIsExporting(false);
        }
    };

    const totals = useMemo(() => {
        if (!reportData.length) return { strength: 0, present: 0, absent: 0, halfday: 0 };
        return reportData.reduce(
            (acc, curr) => ({
                strength: acc.strength + (Number(curr.TOTAL) || 0),
                present: acc.present + (Number(curr.PRESENT) || 0),
                absent: acc.absent + (Number(curr.ABSENT) || 0),
                halfday: acc.halfday + (Number(curr.HALFDAY) || 0)
            }),
            { strength: 0, present: 0, absent: 0, halfday: 0 }
        );
    }, [reportData]);

    const filteredRows = useMemo(() => {
        if (!tableSearch.trim()) return reportData;
        const q = tableSearch.toLowerCase().trim();
        return reportData.filter(
            (item) => (item.ASMCL_ClassName || '').toLowerCase().includes(q) || (item.ASMC_SectionName || '').toLowerCase().includes(q)
        );
    }, [reportData, tableSearch]);

    return (
        <div className='min-h-screen'>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className='mb-4 rounded-xl border bg-card p-6 shadow-xl'>
                    {/* ──────────────── RADIO BUTTONS (ADDED ON TOP) ──────────────── */}
                    <div className='mb-6 text-center'>
                        <div className='mt-3 mb-6 flex justify-center'>
                            <Controller
                                name='frequency'
                                control={control}
                                render={({ field }) => (
                                    <RadioGroup value={field.value} onValueChange={field.onChange} className='flex gap-6'>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='once' id='once' />
                                            <Label htmlFor='once'>
                                                Daily Once<span className='text-red-500'>*</span>
                                            </Label>
                                        </div>

                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='twice' id='twice' />
                                            <Label htmlFor='twice'>
                                                Daily Twice<span className='text-red-500'>*</span>
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                )}
                            />

                            {errors.frequency && <FormError>{errors.frequency.message}</FormError>}
                        </div>
                    </div>

                    {/* ──────────────── Filters Grid ──────────────── */}
                    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2'>
                        {/* Academic Year */}
                        <div className='flex flex-col gap-1.5'>
                            <Label>
                                Academic Year <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                name='asmaY_Id'
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Academic Year' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ayLoading ? (
                                                <SelectItem value='loading' disabled>
                                                    Loading...
                                                </SelectItem>
                                            ) : (
                                                academicYears?.data?.map((y) => (
                                                    <SelectItem key={y.asmaY_Id} value={y.asmaY_Id.toString()}>
                                                        {y.asmaY_Year}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.asmaY_Id && <FormError>{errors.asmaY_Id.message}</FormError>}
                        </div>

                        {/* Date Picker */}
                        <Controller
                            name='from_date'
                            control={control}
                            render={({ field }) => {
                                const parsedDate = parseLocalDate(field.value);
                                return (
                                    <div className='flex flex-col gap-1.5'>
                                        <Label>
                                            Date <span className='text-red-500'>*</span>
                                        </Label>
                                        <Popover
                                            open={openPopover === 'From_Date'}
                                            onOpenChange={(open) => setOpenPopover(open ? 'From_Date' : null)}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    type='button'
                                                    variant='outline'
                                                    className={cn(
                                                        'justify-start text-left font-normal',
                                                        !field.value && 'text-muted-foreground',
                                                        errors.from_date && 'border-red-500'
                                                    )}>
                                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                                    {parsedDate ? format(parsedDate, 'dd/MM/yyyy') : 'Pick a date'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className='w-auto p-0' align='start'>
                                                <CalendarYear
                                                    mode='single'
                                                    selected={parsedDate}
                                                    onSelect={(date) => {
                                                        if (!date) return;
                                                        if (!isBeforeOrEqualLocalDate(date, new Date())) {
                                                            toast.error('Please select today or a previous date');
                                                            return;
                                                        }
                                                        field.onChange(format(date, 'yyyy-MM-dd'));
                                                        setOpenPopover(null);
                                                    }}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        {errors.from_date && <FormError>{errors.from_date.message}</FormError>}
                                    </div>
                                );
                            }}
                        />
                    </div>

                    {/* ─────────────── Action Buttons ─────────────── */}
                    <div className='mt-6 flex justify-start gap-3 border-t pt-4'>
                        <Button
                            type='button'
                            variant='outline'
                            onClick={handleReset}
                            disabled={isSubmitting || isLoading}
                            className='w-fit'>
                            Reset
                        </Button>

                        <Button type='submit' disabled={isSubmitting || isLoading} isLoading={isLoading} className='w-fit'>
                            <Save className='mr-2 h-4 w-4' />
                            Report
                        </Button>
                        <Button
                            type='button'
                            onClick={downloadExcel}
                            disabled={isLoading || isExporting}
                            isLoading={isExporting}
                            className='w-fit'>
                            Export to Excel
                        </Button>
                    </div>
                </div>
            </form>

            {/* ─────────────── Attendance Results Table ─────────────── */}
            {showReport && (
                <div className='mt-6 space-y-4'>
                    {reportData.length === 0 ? (
                        <div className='rounded-xl border bg-card p-8 text-center shadow-md'>
                            <p className='text-muted-foreground'>No data found for the selected criteria</p>
                        </div>
                    ) : (
                        <div className='space-y-4 rounded-xl border bg-card p-6 shadow-xl'>
                            <div className='flex flex-wrap items-center justify-between gap-4'>
                                <div className='flex items-center space-x-4'>
                                    <div className='flex items-center space-x-2'>
                                        <span className='font-bold text-muted-foreground text-sm uppercase'>Total Records:</span>
                                        <Badge variant='secondary' className='px-3 font-bold'>
                                            {reportData.length}
                                        </Badge>
                                    </div>
                                    {tableSearch.trim() && (
                                        <div className='flex items-center space-x-2'>
                                            <span className='font-bold text-muted-foreground text-sm uppercase'>Filtered:</span>
                                            <Badge variant='secondary' className='bg-green-100 px-3 font-bold text-green-700'>
                                                {filteredRows.length}
                                            </Badge>
                                        </div>
                                    )}
                                </div>
                                <div className='relative w-full max-w-xs'>
                                    <Search className='absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground' />
                                    <Input
                                        placeholder='Search Class or Section...'
                                        value={tableSearch}
                                        onChange={(e) => setTableSearch(e.target.value)}
                                        className='h-9 pl-9 text-sm'
                                    />
                                </div>
                            </div>

                            <div className='overflow-x-auto rounded-lg border'>
                                <Table>
                                    <TableHeader className='bg-muted/50'>
                                        <TableRow>
                                            <TableHead className='w-20 text-center font-bold'>Sl. No.</TableHead>
                                            <TableHead className='font-bold'>Class</TableHead>
                                            <TableHead className='font-bold'>Section</TableHead>
                                            <TableHead className='text-center font-bold'>Strength</TableHead>
                                            <TableHead className='text-center font-bold'>Present</TableHead>
                                            <TableHead className='text-center font-bold'>Absent</TableHead>
                                            <TableHead className='text-center font-bold'>Half Day</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredRows.map((item, idx) => (
                                            <TableRow
                                                key={`${item.ASMCL_Id || item.ASMCL_ClassName}-${item.ASMS_ID || item.ASMC_SectionName}-${idx}`}>
                                                <TableCell className='text-center font-medium'>{item.RowNo ?? idx + 1}</TableCell>
                                                <TableCell>{item.ASMCL_ClassName || '-'}</TableCell>
                                                <TableCell>{item.ASMC_SectionName || '-'}</TableCell>
                                                <TableCell className='text-center font-semibold'>{item.TOTAL ?? 0}</TableCell>
                                                <TableCell className='text-center font-semibold text-green-600'>
                                                    {item.PRESENT ?? 0}
                                                </TableCell>
                                                <TableCell className='text-center font-semibold text-red-600'>{item.ABSENT ?? 0}</TableCell>
                                                <TableCell className='text-center font-semibold text-orange-600'>
                                                    {item.HALFDAY ?? 0}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        <TableRow className='bg-muted/70 font-bold'>
                                            <TableCell colSpan={3} className='text-right font-bold uppercase tracking-wider'>
                                                Grand Total
                                            </TableCell>
                                            <TableCell className='text-center font-bold'>{totals.strength}</TableCell>
                                            <TableCell className='text-center font-bold text-green-600'>{totals.present}</TableCell>
                                            <TableCell className='text-center font-bold text-red-600'>{totals.absent}</TableCell>
                                            <TableCell className='text-center font-bold text-orange-600'>{totals.halfday}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
