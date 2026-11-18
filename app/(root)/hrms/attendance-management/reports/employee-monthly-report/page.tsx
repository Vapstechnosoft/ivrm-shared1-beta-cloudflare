'use client';

import { Button } from '@/components/ui/button';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { Input } from '@/components/ui/input';
import { useEmployeeMonthlyReport } from '@/hooks/hrms/attendance-management/useReports';
import { cn, exportToExcel } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { FileSpreadsheet, Loader2, Printer, Search, X } from 'lucide-react';
import { use, useEffect, useMemo, useRef, useState } from 'react';
import AddEmployeeMonthlyReportForm from './_components/add-from';
import type { MonthlyRow } from './_components/columns';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function EmployeeMonthlyReportPage(props: {
    searchParams: SearchParams;
}) {
    const searchParams = use(props.searchParams);
    const [currentSearchParams, setCurrentSearchParams] = useState<Record<string, string | string[] | undefined>>(searchParams);
    const { data: response, isLoading, error } = useEmployeeMonthlyReport(currentSearchParams);

    return (
        <FormProvider<MonthlyRow>>
            <EmployeeMonthlyReportPageContent
                response={response}
                isLoading={isLoading}
                error={error}
                searchParams={currentSearchParams}
                onSearchParamsChange={setCurrentSearchParams}
            />
        </FormProvider>
    );
}

function FormSections({
    searchParams,
    onSearchParamsChange
}: { searchParams?: any; onSearchParamsChange?: (params: Record<string, string | string[] | undefined>) => void }) {
    const { closeAddForm, addFormRef } = useFormContext<MonthlyRow>();

    return (
        <div ref={addFormRef}>
            <CollapsibleSection
                title='Generate Employee Monthly Report'
                description='Fill in the details below to generate the report'
                defaultOpen={true}
                variant='outline'
                size='md'
                className='slide-in-from-top-4 mt-6 animate-in shadow-lg duration-300'>
                <AddEmployeeMonthlyReportForm
                    onSuccess={closeAddForm}
                    searchParams={searchParams}
                    onSearchParamsChange={onSearchParamsChange}
                />
            </CollapsibleSection>
        </div>
    );
}

function EmployeeMonthlyReportPageContent({
    response,
    isLoading,
    error,
    searchParams,
    onSearchParamsChange
}: {
    response: any;
    isLoading: boolean;
    error: any;
    searchParams?: any;
    onSearchParamsChange?: (params: Record<string, string | string[] | undefined>) => void;
}) {
    const tableRef = useRef<HTMLDivElement>(null);
    const [filterText, setFilterText] = useState('');

    const fromDateStr = searchParams?.fromDate ? String(searchParams.fromDate).split('T')[0] : '';
    const toDateStr = searchParams?.toDate ? String(searchParams.toDate).split('T')[0] : '';

    const reportOptions = useMemo(() => {
        const opt = searchParams?.reportOptions ?? response?.reportOptions;
        return Array.isArray(opt) ? opt : opt ? [opt] : [];
    }, [searchParams?.reportOptions, response?.reportOptions]);

    const showTotalWorkingDays = reportOptions.includes('Total Working Days');
    const showHolidayPunch = reportOptions.includes('Show Holiday Punch');
    const isFormatOne = reportOptions.includes('Format One');
    const showDateOfJoining = reportOptions.includes('Date Of Joining');
    const showTotalAbsentDays = reportOptions.includes('Total Absent Days');

    const toggleReportOption = (optionName: string) => {
        const current = [...reportOptions];
        const index = current.indexOf(optionName);
        if (index > -1) {
            current.splice(index, 1);
        } else {
            current.push(optionName);
        }
        onSearchParamsChange?.({
            ...searchParams,
            reportOptions: current
        });
    };

    // Extract column dates and employee list from response
    const { columnDates, parsedEmployees } = useMemo(() => {
        if (!response) return { columnDates: [], parsedEmployees: [] };

        let colsString = '';
        let employees: any[] = [];

        // Support array, response.data array, or object
        const container = Array.isArray(response)
            ? response
            : Array.isArray(response?.data)
              ? response.data
              : response?.data?.$values
                ? response.data.$values
                : response?.data && typeof response.data === 'object'
                  ? [response.data]
                  : [];

        if (container.length > 0 && ('cols' in container[0] || 'report_data' in container[0])) {
            for (const item of container) {
                if (item.cols && typeof item.cols === 'string' && !colsString) {
                    colsString = item.cols;
                }
                const rData = item.report_data;
                if (typeof rData === 'string') {
                    try {
                        const parsed = JSON.parse(rData);
                        if (Array.isArray(parsed)) employees.push(...parsed);
                        else if (parsed) employees.push(parsed);
                    } catch (e) {
                        console.error('Failed to parse report_data', e);
                    }
                } else if (Array.isArray(rData)) {
                    employees.push(...rData);
                }
            }
        } else {
            employees = container;
        }

        let extractedCols: string[] = [];
        if (colsString) {
            // Strip brackets, escaped quotes, and extra whitespace from cols string
            extractedCols = colsString
                .replace(/[\[\]"'\\]/g, '')
                .split(',')
                .map((c: string) => c.trim())
                .filter(Boolean);
        } else {
            const datesSet = new Set<string>();
            employees.forEach((emp) => {
                // If keys on employee object are dates (YYYY-MM-DD format)
                Object.keys(emp).forEach((k) => {
                    if (/^\d{4}-\d{2}-\d{2}$/.test(k)) {
                        datesSet.add(k);
                    }
                });
                if (emp.attendance && typeof emp.attendance === 'object') {
                    Object.keys(emp.attendance).forEach((d) => datesSet.add(d.replace(/[\[\]"'\\]/g, '').trim()));
                }
                if (emp.attendance_data) {
                    try {
                        const p = typeof emp.attendance_data === 'string' ? JSON.parse(emp.attendance_data) : emp.attendance_data;
                        if (p?.daily_attendance) Object.keys(p.daily_attendance).forEach((d) => datesSet.add(d));
                    } catch {
                        /* noop */
                    }
                }
            });
            extractedCols = Array.from(datesSet).sort();
        }

        return {
            columnDates: extractedCols,
            parsedEmployees: employees
        };
    }, [response]);

    // Calculate status for an employee on a specific date
    const getEmployeeDateStatus = (emp: any, dateStr: string) => {
        if (!emp || !dateStr) return 0;
        const cleanDate = dateStr.replace(/[\[\]"'\\]/g, '').trim();

        // 1. Direct date property on employee (e.g. user["2024-10-01"] from backend)
        if (emp[cleanDate] !== undefined && emp[cleanDate] !== null) {
            return emp[cleanDate];
        }
        // 2. Raw dateStr in case key in object matches exact string
        if (emp[dateStr] !== undefined && emp[dateStr] !== null) {
            return emp[dateStr];
        }
        // 3. attendance object (e.g. emp.attendance["2024-10-01"])
        if (emp.attendance && typeof emp.attendance === 'object') {
            if (emp.attendance[cleanDate] !== undefined && emp.attendance[cleanDate] !== null) {
                return emp.attendance[cleanDate];
            }
            if (emp.attendance[dateStr] !== undefined && emp.attendance[dateStr] !== null) {
                return emp.attendance[dateStr];
            }
        }
        // 4. attendance_data JSON fallback
        if (emp.attendance_data) {
            try {
                const attObj = typeof emp.attendance_data === 'string' ? JSON.parse(emp.attendance_data) : emp.attendance_data;
                if (attObj?.daily_attendance?.[cleanDate] !== undefined) {
                    return attObj.daily_attendance[cleanDate];
                }
                if (attObj?.[cleanDate] !== undefined) {
                    return attObj[cleanDate];
                }
            } catch {
                /* noop */
            }
        }
        return 0; // Default: absent (0)
    };

    // Calculate absent days & normalized properties for each employee (matching old IVRM logic)
    const employeesWithCalculations = useMemo(() => {
        return parsedEmployees.map((emp: any) => {
            let absentCount = 0;
            columnDates.forEach((dateStr) => {
                const status = getEmployeeDateStatus(emp, dateStr);
                const s = status != null ? String(status).trim() : '';
                if (s === '0' || s === '' || status == null) {
                    absentCount += 1;
                }
            });

            return {
                ...emp,
                calculatedAbsentDays: absentCount
            };
        });
    }, [parsedEmployees, columnDates]);

    // Filter employees by search text
    const filteredEmployees = useMemo(() => {
        if (!filterText.trim()) return employeesWithCalculations;
        const lower = filterText.toLowerCase();
        return employeesWithCalculations.filter((emp: any) => {
            const name = (emp.ename || '').toLowerCase();
            const code = (emp.ecode || '').toLowerCase();
            const desig = (emp.HRMDES_DesignationName || emp.designation || '').toLowerCase();
            return name.includes(lower) || code.includes(lower) || desig.includes(lower);
        });
    }, [employeesWithCalculations, filterText]);

    // Effective date range (from searchParams or infer from columnDates)
    const effectiveFromDate = fromDateStr || (columnDates.length > 0 ? columnDates[0] : '');
    const effectiveToDate = toDateStr || (columnDates.length > 0 ? columnDates[columnDates.length - 1] : '');

    // Calculate total working days (matching diffDays + 1 from IVRM)
    const totalWorkingDays = useMemo(() => {
        if (effectiveFromDate && effectiveToDate) {
            const d1 = new Date(effectiveFromDate);
            const d2 = new Date(effectiveToDate);
            const diff = Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
            if (!isNaN(diff) && diff >= 0) return diff + 1;
        }
        return columnDates.length;
    }, [effectiveFromDate, effectiveToDate, columnDates.length]);

    // Format banner dates (matching old IVRM)
    const bannerDateRange = useMemo(() => {
        if (!effectiveFromDate && !effectiveToDate) return 'Monthly Report';
        try {
            const f = effectiveFromDate ? format(parseISO(effectiveFromDate), 'dd-MM-yyyy') : '';
            const t = effectiveToDate ? format(parseISO(effectiveToDate), 'dd-MM-yyyy') : '';
            return `Monthly Report from ${f} to ${t}`;
        } catch {
            return `Monthly Report from ${effectiveFromDate} to ${effectiveToDate}`;
        }
    }, [effectiveFromDate, effectiveToDate]);

    const formatDateHeader = (dateStr: string) => {
        const cleanDate = dateStr.replace(/[\[\]"'\\]/g, '').trim();
        try {
            const d = parseISO(cleanDate);
            if (isNaN(d.getTime())) {
                return { dateMonth: cleanDate, dayOfWeek: '' };
            }
            return {
                dateMonth: format(d, 'dd-MMM'),
                dayOfWeek: format(d, 'EEE')
            };
        } catch {
            return { dateMonth: cleanDate, dayOfWeek: '' };
        }
    };

    const renderAttendanceStatus = (status: any) => {
        const s = status != null ? String(status).trim() : '';
        if (s === '1') {
            return <span className='font-bold text-emerald-600'>P</span>;
        }
        if (s === '0' || s === '' || status == null) {
            return <span className='font-bold text-rose-600'>A</span>;
        }
        if (s === '2') {
            return <span className='font-bold text-red-500'>H</span>;
        }
        if (s === '3') {
            return <span className='font-bold text-amber-600'>AL</span>;
        }
        if (s === '4') {
            return <span className='font-bold text-purple-600'>OD</span>;
        }
        if (s === '5') {
            return <span className='font-bold text-orange-600'>HD</span>;
        }
        return <span className='font-semibold'>{s}</span>;
    };

    const formatStatusText = (status: any): string => {
        const s = status != null ? String(status).trim() : '';
        if (s === '1') return 'P';
        if (s === '0' || s === '' || status == null) return 'A';
        if (s === '2') return 'H';
        if (s === '3') return 'AL';
        if (s === '4') return 'OD';
        if (s === '5') return 'HD';
        return s || 'A';
    };

    // Calculate colspans
    const normalColSpan = 4 + columnDates.length + (showTotalWorkingDays ? 1 : 0) + (showHolidayPunch ? 1 : 0) + (showDateOfJoining ? 1 : 0) + (showTotalAbsentDays ? 1 : 0);
    const formatOneColSpan = 2 + filteredEmployees.length;

    // Excel Export
    const handleExportToExcel = () => {
        if (filteredEmployees.length === 0) return;

        if (!isFormatOne) {
            const exportData = filteredEmployees.map((emp, index) => {
                const row: Record<string, any> = {
                    SLNO: index + 1,
                    'Employee Code': emp.ecode || '',
                    'Employee Name': emp.ename || '',
                    'Employee Designation': emp.HRMDES_DesignationName || emp.designation || ''
                };

                columnDates.forEach((dateStr) => {
                    const { dateMonth, dayOfWeek } = formatDateHeader(dateStr);
                    const colHeader = `${dateMonth} (${dayOfWeek})`;
                    const status = getEmployeeDateStatus(emp, dateStr);
                    row[colHeader] = formatStatusText(status);
                });

                if (showTotalWorkingDays) row['Total Present Days'] = emp.tpdays ?? 0;
                if (showHolidayPunch) row['Total Worked on Holidays'] = emp.hwkdays ?? 0;
                if (showDateOfJoining) row['Date Of Joining'] = emp.HRME_DOJ ? format(parseISO(emp.HRME_DOJ), 'dd-MM-yyyy') : '';
                if (showTotalAbsentDays) row['Total Absent Days'] = emp.calculatedAbsentDays ?? 0;

                return row;
            });
            exportToExcel(exportData, `Employee_Monthly_Report_${effectiveFromDate}_to_${effectiveToDate}`);
        } else {
            const exportData = columnDates.map((dateStr, index) => {
                const { dateMonth, dayOfWeek } = formatDateHeader(dateStr);
                const row: Record<string, any> = {
                    SLNO: index + 1,
                    DATE: `${dateMonth} (${dayOfWeek})`
                };

                filteredEmployees.forEach((emp) => {
                    const status = getEmployeeDateStatus(emp, dateStr);
                    const header = `${emp.ename || emp.ecode || emp.HRME_Id}`;
                    row[header] = formatStatusText(status);
                });

                return row;
            });

            if (showTotalWorkingDays) {
                const summaryRow: Record<string, any> = { SLNO: '', DATE: 'Total Present Days' };
                filteredEmployees.forEach((emp) => {
                    summaryRow[`${emp.ename || emp.ecode || emp.HRME_Id}`] = emp.tpdays ?? 0;
                });
                exportData.push(summaryRow);
            }
            if (showHolidayPunch) {
                const summaryRow: Record<string, any> = { SLNO: '', DATE: 'Total Worked on Holidays' };
                filteredEmployees.forEach((emp) => {
                    summaryRow[`${emp.ename || emp.ecode || emp.HRME_Id}`] = emp.hwkdays ?? 0;
                });
                exportData.push(summaryRow);
            }
            if (showDateOfJoining) {
                const summaryRow: Record<string, any> = { SLNO: '', DATE: 'Date Of Joining' };
                filteredEmployees.forEach((emp) => {
                    summaryRow[`${emp.ename || emp.ecode || emp.HRME_Id}`] = emp.HRME_DOJ ? format(parseISO(emp.HRME_DOJ), 'dd-MM-yyyy') : '';
                });
                exportData.push(summaryRow);
            }
            if (showTotalAbsentDays) {
                const summaryRow: Record<string, any> = { SLNO: '', DATE: 'Total Absent Days' };
                filteredEmployees.forEach((emp) => {
                    summaryRow[`${emp.ename || emp.ecode || emp.HRME_Id}`] = emp.calculatedAbsentDays ?? 0;
                });
                exportData.push(summaryRow);
            }

            exportToExcel(exportData, `Employee_Monthly_Report_FormatOne_${effectiveFromDate}_to_${effectiveToDate}`);
        }
    };

    // Print
    const handlePrint = () => {
        const tableElement = document.getElementById('table1');
        if (!tableElement) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Employee Monthly Report</title>
                <style>
                    @page { size: landscape; margin: 8mm; }
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 10px; color: #333; font-size: 11px; }
                    table { width: 100%; border-collapse: collapse; text-align: center; }
                    th, td { border: 1px solid #ccc; padding: 5px 3px; font-size: 10px; white-space: nowrap; }
                    th { background-color: #f4f6f9; font-weight: bold; }
                    .report-title-header { background-color: #1e60ad !important; color: white !important; font-weight: bold; font-size: 13px; padding: 8px; text-align: center; }
                    .sub-title-header { background-color: #f8f9fa !important; color: #212529 !important; font-weight: bold; font-size: 11px; padding: 6px; text-align: center; }
                    .footer-summary-header { background-color: #5c8ae6 !important; color: white !important; font-weight: bold; }
                    .text-left { text-align: left; }
                    .status-p { color: #16a34a; font-weight: bold; }
                    .status-a { color: #dc2626; font-weight: bold; }
                    .status-h { color: #dc2626; font-weight: bold; }
                    .status-al { color: #d97706; font-weight: bold; }
                    .status-od { color: #9333ea; font-weight: bold; }
                    .footer { margin-top: 15px; text-align: right; font-size: 9px; color: #666; }
                </style>
            </head>
            <body>
                ${tableElement.outerHTML}
                <div class="footer">Generated on ${new Date().toLocaleString()}</div>
            </body>
            </html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    };

    useEffect(() => {
        if (parsedEmployees.length > 0 && tableRef.current) {
            setTimeout(() => {
                tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 300);
        }
    }, [parsedEmployees.length]);

    const hasData = parsedEmployees.length > 0;

    return (
        <div className='min-h-screen bg-background/50'>
            <div className='container max-w-7xl space-y-4 py-2'>
                <FormSections searchParams={searchParams} onSearchParamsChange={onSearchParamsChange} />

                {isLoading && (
                    <div className='flex items-center justify-center p-12'>
                        <Loader2 className='mr-2 h-6 w-6 animate-spin text-primary' />
                        <span className='font-medium text-muted-foreground text-sm'>Loading Employee Monthly Report...</span>
                    </div>
                )}

                {error && (
                    <div className='rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-center text-destructive text-sm'>
                        {error instanceof Error ? error.message : 'Failed to load report data.'}
                    </div>
                )}

                {hasData && (
                    <div ref={tableRef} className='space-y-4'>
                        <CollapsibleSection title='Grid View' description='Employee Monthly Attendance Report' defaultOpen={true} variant='default' size='lg'>
                            {/* Actions Header */}
                            <div className='flex flex-col gap-3 rounded-t-lg bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between border-b'>
                                {/* <div className='relative max-w-xs flex-1'>
                                    <Search className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
                                    <Input
                                        placeholder='Search employee name or code...'
                                        value={filterText}
                                        onChange={(e) => setFilterText(e.target.value)}
                                        className='h-9 pl-9 pr-8 text-xs'
                                    />
                                    {filterText && (
                                        <button
                                            type='button'
                                            onClick={() => setFilterText('')}
                                            className='absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground'>
                                            <X className='h-4 w-4' />
                                        </button>
                                    )}
                                </div> */}
                                <div className='flex justify-end w-full gap-2 sm:self-auto'>
                                    <Button
                                        variant='outline'
                                        size='sm'
                                        onClick={handleExportToExcel}
                                        className='h-9 border-green-600 text-green-700 hover:bg-green-50 dark:text-green-400 w-fit'>
                                        <FileSpreadsheet className='mr-2 h-4 w-4' /> Export to Excel
                                    </Button>
                                    <Button
                                        variant='outline'
                                        size='sm'
                                        onClick={handlePrint}
                                        className='h-9 border-blue-600 text-blue-700 hover:bg-blue-50 dark:text-blue-400 w-fit'>
                                        <Printer className='mr-2 h-4 w-4' /> Print
                                    </Button>
                                </div>
                            </div>

                            {/* Quick Report Options Toggles */}
                            {/* <div className='flex flex-wrap items-center gap-2 bg-muted/20 px-4 py-2 border-b text-xs'>
                                <span className='font-semibold text-muted-foreground mr-1'>Report Options:</span>
                                {[
                                    { id: 'Total Working Days', label: 'Total Working Days' },
                                    { id: 'Show Holiday Punch', label: 'Show Holiday Punch' },
                                    { id: 'Format One', label: 'Format One' },
                                    { id: 'Date Of Joining', label: 'Date Of Joining' },
                                    { id: 'Total Absent Days', label: 'Total Absent Days' }
                                ].map((opt) => {
                                    const isChecked = reportOptions.includes(opt.id);
                                    return (
                                        <label
                                            key={opt.id}
                                            className={cn(
                                                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium cursor-pointer transition-all select-none',
                                                isChecked
                                                    ? 'bg-primary/10 border-primary text-primary font-semibold shadow-sm'
                                                    : 'bg-background hover:bg-muted text-muted-foreground border-border'
                                            )}>
                                            <input
                                                type='checkbox'
                                                checked={isChecked}
                                                onChange={() => toggleReportOption(opt.id)}
                                                className='rounded border-gray-300 text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer'
                                            />
                                            <span>{opt.label}</span>
                                        </label>
                                    );
                                })}
                            </div> */}

                            {/* Table Container */}
                            <div className='overflow-x-auto max-h-[600px] border'>
                                <div id='table'>
                                    <table
                                        id='table1'
                                        className='w-full border-collapse text-center text-xs'
                                        border={1}
                                        style={{ borderCollapse: 'collapse', textAlign: 'center', width: '100%' }}>
                                        <thead>
                                            {/* Report Title Row */}
                                            <tr>
                                                <th
                                                    colSpan={isFormatOne ? formatOneColSpan : normalColSpan}
                                                    className='report-title-header bg-primary py-2.5 px-4 text-center font-bold text-white text-sm'>
                                                    {bannerDateRange}
                                                </th>
                                            </tr>

                                            {/* Total Number of Working Days Row (when enabled) */}
                                            {showTotalWorkingDays && (
                                                <tr>
                                                    <th
                                                        colSpan={isFormatOne ? formatOneColSpan : normalColSpan}
                                                        className='sub-title-header bg-muted/60 py-2 px-4 text-center font-semibold text-foreground text-xs'>
                                                        Total Number of Working days : <b>{totalWorkingDays}</b> days
                                                    </th>
                                                </tr>
                                            )}

                                            {/* Standard Column Headers */}
                                            {!isFormatOne ? (
                                                <tr className='bg-muted/40 font-bold'>
                                                    <th className='border border-border p-2 whitespace-nowrap min-w-[50px]'>SLNO</th>
                                                    <th className='border border-border p-2 whitespace-nowrap min-w-[100px]'>Employee Code</th>
                                                    <th className='border border-border p-2 text-left whitespace-nowrap min-w-[180px]'>Employee Name</th>
                                                    <th className='border border-border p-2 text-left whitespace-nowrap min-w-[150px]'>Employee Designation</th>
                                                    {columnDates.map((dateStr) => {
                                                        const { dateMonth, dayOfWeek } = formatDateHeader(dateStr);
                                                        return (
                                                            <th key={dateStr} className='border border-border p-1.5 whitespace-nowrap min-w-[55px] font-medium'>
                                                                <div className='font-bold text-foreground'>{dateMonth}</div>
                                                                <div className='text-[10px] text-muted-foreground'>{dayOfWeek}</div>
                                                            </th>
                                                        );
                                                    })}
                                                    {showTotalWorkingDays && (
                                                        <th className='border border-border p-2 whitespace-nowrap min-w-[90px]'>Total Present Days</th>
                                                    )}
                                                    {showHolidayPunch && (
                                                        <th className='border border-border p-2 whitespace-nowrap min-w-[110px]'>Total Worked on Holidays</th>
                                                    )}
                                                    {showDateOfJoining && (
                                                        <th className='border border-border p-2 whitespace-nowrap min-w-[100px]'>Date Of Joining</th>
                                                    )}
                                                    {showTotalAbsentDays && (
                                                        <th className='border border-border p-2 whitespace-nowrap min-w-[90px]'>Total Absent Days</th>
                                                    )}
                                                </tr>
                                            ) : (
                                                /* Format One Column Headers */
                                                <tr className='bg-muted/40 font-bold'>
                                                    <th className='border border-border p-2 whitespace-nowrap min-w-[50px]'>SLNO</th>
                                                    <th className='border border-border p-2 whitespace-nowrap min-w-[100px]'>DATE</th>
                                                    {filteredEmployees.map((emp: any) => (
                                                        <th
                                                            key={emp.HRME_Id || emp.ecode}
                                                            className='border border-border p-2 whitespace-nowrap min-w-[120px] text-center'
                                                            style={{ wordWrap: 'break-word' }}>
                                                            {emp.ename || emp.ecode}
                                                        </th>
                                                    ))}
                                                </tr>
                                            )}
                                        </thead>

                                        <tbody>
                                            {/* Standard View Rows */}
                                            {!isFormatOne ? (
                                                filteredEmployees.map((user: any, index: number) => (
                                                    <tr key={user.HRME_Id || user.ecode || index} className='hover:bg-muted/30 transition-colors'>
                                                        <td className='border border-border p-1.5'>{index + 1}</td>
                                                        <td className='border border-border p-1.5 font-medium'>{user.ecode || '-'}</td>
                                                        <td className='border border-border p-1.5 text-left whitespace-nowrap font-medium'>{user.ename || '-'}</td>
                                                        <td className='border border-border p-1.5 text-left whitespace-nowrap text-muted-foreground'>
                                                            {user.HRMDES_DesignationName || user.designation || '-'}
                                                        </td>
                                                        {columnDates.map((colDate) => {
                                                            const status = getEmployeeDateStatus(user, colDate);
                                                            return (
                                                                <td key={colDate} className='border border-border p-1 text-center'>
                                                                    {renderAttendanceStatus(status)}
                                                                </td>
                                                            );
                                                        })}
                                                        {showTotalWorkingDays && (
                                                            <td className='border border-border p-1.5 font-semibold text-center'>{user.tpdays ?? 0}</td>
                                                        )}
                                                        {showHolidayPunch && (
                                                            <td className='border border-border p-1.5 text-center'>{user.hwkdays ?? 0}</td>
                                                        )}
                                                        {showDateOfJoining && (
                                                            <td className='border border-border p-1.5 whitespace-nowrap text-center text-muted-foreground'>
                                                                {user.HRME_DOJ ? format(parseISO(user.HRME_DOJ), 'dd-MM-yyyy') : '-'}
                                                            </td>
                                                        )}
                                                        {showTotalAbsentDays && (
                                                            <td className='border border-border p-1.5 font-bold text-destructive text-center'>
                                                                {user.calculatedAbsentDays ?? 0}
                                                            </td>
                                                        )}
                                                    </tr>
                                                ))
                                            ) : (
                                                /* Format One (Transposed Date Rows) */
                                                <>
                                                    {columnDates.map((columnname, index) => {
                                                        const { dateMonth, dayOfWeek } = formatDateHeader(columnname);
                                                        return (
                                                            <tr key={columnname} className='hover:bg-muted/30 transition-colors'>
                                                                <td className='border border-border p-1.5'>{index + 1}</td>
                                                                <td className='border border-border p-1.5 whitespace-nowrap font-medium'>
                                                                    <div>{dateMonth}</div>
                                                                    <div className='text-[10px] text-muted-foreground'>{dayOfWeek}</div>
                                                                </td>
                                                                {filteredEmployees.map((emp: any) => {
                                                                    const status = getEmployeeDateStatus(emp, columnname);
                                                                    return (
                                                                        <td key={emp.HRME_Id || emp.ecode} className='border border-border p-1 text-center'>
                                                                            {renderAttendanceStatus(status)}
                                                                        </td>
                                                                    );
                                                                })}
                                                            </tr>
                                                        );
                                                    })}

                                                    {/* Format One Summary Rows */}
                                                    {showTotalWorkingDays && (
                                                        <tr className='bg-[#5c8ae6]/10 font-bold'>
                                                            <th
                                                                colSpan={2}
                                                                className='footer-summary-header border border-border bg-[#5c8ae6] p-2 text-center text-white text-xs'>
                                                                Total Present Days
                                                            </th>
                                                            {filteredEmployees.map((emp: any) => (
                                                                <td key={emp.HRME_Id || emp.ecode} className='border border-border p-2 text-center font-bold'>
                                                                    {emp.tpdays ?? 0}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    )}
                                                    {showHolidayPunch && (
                                                        <tr className='bg-[#5c8ae6]/10 font-bold'>
                                                            <th
                                                                colSpan={2}
                                                                className='footer-summary-header border border-border bg-[#5c8ae6] p-2 text-center text-white text-xs'>
                                                                Total Worked on Holidays
                                                            </th>
                                                            {filteredEmployees.map((emp: any) => (
                                                                <td key={emp.HRME_Id || emp.ecode} className='border border-border p-2 text-center font-bold'>
                                                                    {emp.hwkdays ?? 0}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    )}
                                                    {showDateOfJoining && (
                                                        <tr className='bg-[#5c8ae6]/10 font-bold'>
                                                            <th
                                                                colSpan={2}
                                                                className='footer-summary-header border border-border bg-[#5c8ae6] p-2 text-center text-white text-xs'>
                                                                Date Of Joining
                                                            </th>
                                                            {filteredEmployees.map((emp: any) => (
                                                                <td key={emp.HRME_Id || emp.ecode} className='border border-border p-2 text-center whitespace-nowrap text-xs'>
                                                                    {emp.HRME_DOJ ? format(parseISO(emp.HRME_DOJ), 'dd-MM-yyyy') : '-'}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    )}
                                                    {showTotalAbsentDays && (
                                                        <tr className='bg-[#5c8ae6]/10 font-bold'>
                                                            <th
                                                                colSpan={2}
                                                                className='footer-summary-header border border-border bg-[#5c8ae6] p-2 text-center text-white text-xs'>
                                                                Total Absent Days
                                                            </th>
                                                            {filteredEmployees.map((emp: any) => (
                                                                <td key={emp.HRME_Id || emp.ecode} className='border border-border p-2 text-center font-bold text-destructive'>
                                                                    {emp.calculatedAbsentDays ?? 0}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    )}
                                                </>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </CollapsibleSection>
                    </div>
                )}
            </div>
        </div>
    );
}
