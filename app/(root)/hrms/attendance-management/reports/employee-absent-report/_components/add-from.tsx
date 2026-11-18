'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import type * as z from 'zod';

import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { FormError } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GenericDataTable } from '@/components/ui/view-data-table/view-generic-data-table';
import {
    useReportDepartments,
    useReportDesignations,
    useReportEmployeesByGroupTypeDeptAndDesignation,
    useReportGroupTypes
} from '@/hooks/hrms/useReports';
import { exportToExcel } from '@/lib/utils';
import { employeeAbsentReportFilterSchema } from '@/schemas/hrms/attendance-management-schemas';
import { getEmployeeMonthlyReport } from '@/server/hrms/hrmsConfig/reports/employee-monthly-report';
import { FileSpreadsheet, Loader2, Printer, RotateCcw, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { type EmployeeAbsentReportRow, employeeAbsentReportColumns } from './columns';

interface AddEmployeeAbsentReportFormProps {
    onSuccess?: () => void;
    resolvedSearchParams?: any;
    isPageLoading?: boolean;
}

export default function AddEmployeeAbsentReportForm({ onSuccess, isPageLoading }: AddEmployeeAbsentReportFormProps) {
    const [isSubmittingManual, setIsSubmittingManual] = useState(false);
    const [resetkey, setResetKey] = useState(0);
    const [reportData, setReportData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    // biome-ignore lint/correctness/noUnusedVariables: <explanation>
    const [error, setError] = useState<string>();

    const {
        handleSubmit,
        control,
        reset,
        watch,
        setValue,
        clearErrors,
        formState: { errors, isSubmitting: isSubmittingForm }
    } = useForm<z.infer<typeof employeeAbsentReportFilterSchema>>({
        resolver: zodResolver(employeeAbsentReportFilterSchema),
        defaultValues: {
            type: [],
            department: [],
            designation: [],
            allOrIndividual: 'All',
            employeeIds: '',
            fromDate: '',
            toDate: ''
        }
    });

    const isSubmitting = isSubmittingManual || isSubmittingForm || isPageLoading;
    const selectedTypes = watch('type');
    const selectedDepts = watch('department');
    const selectedDesigs = watch('designation');
    const allOrIndividual = watch('allOrIndividual');

    // Cascading data fetching using report-specific hooks
    const { data: groupTypesData, isLoading: isTypesLoading } = useReportGroupTypes();
    const { data: departmentsData, isLoading: isDeptLoading } = useReportDepartments(selectedTypes.join(','));
    const { data: designationsData, isLoading: isDesigLoading } = useReportDesignations(selectedTypes.join(','), selectedDepts.join(','));
    const { data: employeesData, isLoading: isEmpLoading } = useReportEmployeesByGroupTypeDeptAndDesignation(
        selectedTypes.map(Number),
        selectedDepts.map(Number),
        selectedDesigs.map(Number)
    );

    // Derived options
    const typeOptions = useMemo(
        () =>
            groupTypesData?.data?.map((t: any) => ({
                label: t.value || t.hrmgT_EmployeeGroupType || 'Unknown Type',
                value: String(t.key || t.hrmgT_Id)
            })) || [],
        [groupTypesData]
    );

    const deptOptions = useMemo(
        () =>
            departmentsData?.data?.map((d: any) => ({
                label: d.value || d.hrmD_DepartmentName || d.hrmd_departmentName || 'Unknown Dept',
                value: String(d.key || d.hrmD_Id || d.hrmd_id)
            })) || [],
        [departmentsData]
    );

    const desigOptions = useMemo(
        () =>
            designationsData?.data?.map((d: any) => ({
                label: d.value || d.hrmdeS_DesignationName || d.hrmdes_designationName || 'Unknown Desig',
                value: String(d.key || d.hrmdeS_Id || d.hrmdes_id)
            })) || [],
        [designationsData]
    );

    const employeesDataTransformed = useMemo(() => {
        const list = employeesData?.data?.employeeNames || employeesData;
        if (!list || !Array.isArray(list)) return [];

        return list
            .map((emp: any) => {
                const id = emp.HRME_Id || emp.hrmE_Id || emp.id || emp.key;
                if (id == null) return null;

                const employeeName =
                    emp.employeeFullName || emp.ename || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || `Employee ${id}`;
                const employeeCode = emp.ecode || emp.employeeCode || id;

                return {
                    id: Number(id),
                    employeeCode,
                    employeeName
                };
            })
            .filter(Boolean);
    }, [employeesData]);

    // Handle cascading resets
    useEffect(() => {
        if (selectedTypes.length === 0) setValue('department', []);
    }, [selectedTypes, setValue]);
    useEffect(() => {
        if (selectedDepts.length === 0) setValue('designation', []);
    }, [selectedDepts, setValue]);
    useEffect(() => {
        if (selectedDesigs.length === 0) setValue('employeeIds', '');
    }, [selectedDesigs, setValue]);

    // const fromDateObject = fromDateValue ? new Date(fromDateValue) : undefined;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    async function onSubmit(values: z.infer<typeof employeeAbsentReportFilterSchema>) {
        try {
            setIsSubmittingManual(true);
            setIsLoading(true);
            setError('');

            // Map employee IDs based on selection
            let hrme_ids = '0';
            if (values.allOrIndividual === 'Individual' && values.employeeIds) {
                hrme_ids = values.employeeIds.toString();
            } else if (values.allOrIndividual === 'All' && employeesDataTransformed.length > 0) {
                hrme_ids = employeesDataTransformed.map((emp: any) => emp.id).join(',');
            }

            const payload = {
                from_date: values.fromDate,
                to_date: values.toDate,
                hrme_ids: hrme_ids,
                type: 'absent'
            };

            const response = await getEmployeeMonthlyReport(payload);
            console.log("Absent report", response);
            if (response.success) {
                let parsedRows: any[] = [];
                const rawData = response.data;

                if (Array.isArray(rawData)) {
                    for (const item of rawData) {
                        if (item && item.report_data) {
                            try {
                                const parsed = typeof item.report_data === 'string' ? JSON.parse(item.report_data) : item.report_data;
                                if (Array.isArray(parsed)) {
                                    parsedRows.push(...parsed);
                                } else if (parsed) {
                                    parsedRows.push(parsed);
                                }
                            } catch (e) {
                                console.error('Error parsing report_data:', e);
                            }
                        } else if (item) {
                            parsedRows.push(item);
                        }
                    }
                } else if (rawData && typeof rawData === 'object') {
                    const rData = (rawData as any).report_data;
                    if (rData) {
                        try {
                            const parsed = typeof rData === 'string' ? JSON.parse(rData) : rData;
                            if (Array.isArray(parsed)) {
                                parsedRows.push(...parsed);
                            } else if (parsed) {
                                parsedRows.push(parsed);
                            }
                        } catch (e) {
                            console.error('Error parsing report_data:', e);
                        }
                    } else {
                        parsedRows = [rawData];
                    }
                }

                setReportData(parsedRows);
                if (parsedRows.length === 0) {
                    toast.info('No absent records found for the selected criteria');
                } else {
                    toast.success(response.message || 'Report generated successfully');
                }
                onSuccess?.();
            } else {
                setError(response.message || 'Failed to generate report');
                toast.error(response.message || 'Failed to generate report');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to generate report';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setTimeout(() => {
                setIsSubmittingManual(false);
                setIsLoading(false);
            }, 500);
        }
    }

    const handleReset = () => {
        reset({
            type: [],
            department: [],
            designation: [],
            allOrIndividual: 'All',
            employeeIds: '',
            fromDate: '',
            toDate: ''
        });
        setReportData([]);
        setError('');
        setResetKey((prev) => prev + 1);
    };
    const handleExportToExcel = () => {
        const dataToExport = tableData || [];
        if (dataToExport.length === 0) return;

        const exportData = dataToExport.map((row: any, index: number) => ({
            SLNO: index + 1,
            'Employee Code': row.ecode !== '-' ? row.ecode : '',
            'Employee Name': row.ename !== '-' ? row.ename : '',
            Designation: row.designation !== '-' ? row.designation : '',
            'Total Absent': row.absentdays ?? 0
        }));

        exportToExcel(exportData, `Employee_Absent_Report_${new Date().toLocaleDateString()}`);
    };

    const handlePrint = () => {
        const dataToPrint = tableData || [];
        if (dataToPrint.length === 0) return;

        const fromDateFormatted = watch('fromDate') ? new Date(watch('fromDate')).toLocaleDateString() : '';
        const toDateFormatted = watch('toDate') ? new Date(watch('toDate')).toLocaleDateString() : '';

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Employee Absent Report</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 40px; color: #333; }
                    .report-header { 
                        background-color: #1e60ad; 
                        color: white; 
                        text-align: center; 
                        padding: 10px; 
                        font-weight: bold;
                        border: 1px solid #1e60ad;
                    }
                    table { width: 100%; border-collapse: collapse; font-size: 12px; }
                    th, td { border: 1px solid #ccc; padding: 10px 8px; text-align: center; }
                    th { background-color: #f0f0f0; color: #333; font-weight: bold; }
                    .ename-cell { text-align: left; }
                    .absent-cell { font-weight: bold; }
                    .footer { margin-top: 20px; text-align: right; font-size: 10px; color: #666; }
                </style>
            </head>
            <body>
                <div class="report-header">
                    Monthly Report ${fromDateFormatted && toDateFormatted ? `from ${fromDateFormatted} to ${toDateFormatted}` : ''}
                </div>
                <table>
                    <thead>
                        <tr>
                            <th style="width: 60px">SLNO</th>
                            <th style="width: 120px">Employee Code</th>
                            <th>Employee Name</th>
                            <th>Designation</th>
                            <th style="width: 100px">Total Absent</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${dataToPrint
                .map(
                    (row: any, index: number) => `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${row.ecode !== '-' ? row.ecode : ''}</td>
                                <td class="ename-cell">${row.ename !== '-' ? row.ename : ''}</td>
                                <td>${row.designation !== '-' ? row.designation : ''}</td>
                                <td class="absent-cell">${row.absentdays ?? 0}</td>
                            </tr>
                        `
                )
                .join('')}
                    </tbody>
                </table>
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

    // Transform report data for table
    const tableData: EmployeeAbsentReportRow[] = useMemo(() => {
        return reportData.map((item: any) => {
            let attendanceData: any = {};
            if (item.attendance_data) {
                try {
                    attendanceData = typeof item.attendance_data === 'string' ? JSON.parse(item.attendance_data) : item.attendance_data || {};
                } catch {
                    attendanceData = {};
                }
            }

            return {
                hrme_id: item.HRME_Id ?? item.hrmE_Id ?? item.hrme_id ?? item.id,
                ecode: item.ecode || '-',
                ename: item.ename || '-',
                hrme_doj: item.HRME_DOJ || item.hrmE_DOJ || item.hrme_doj || '-',
                designation: item.HRMDES_DesignationName || item.hrmdeS_DesignationName || item.designation || '-',
                tpdays: item.tpdays ?? attendanceData?.tpdays ?? 0,
                hwkdays: item.hwkdays || 0,
                workday: item.workday ?? attendanceData?.workday ?? 0,
                absentdays: item.absentdays ?? attendanceData?.absentdays ?? 0,
                presence_breakdown: attendanceData?.presence_breakdown || '-'
            };
        });
    }, [reportData]);

    const hasData = reportData.length > 0;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                {/* Group Type */}
                <div className='col-span-1'>
                    <Label className='mb-2 block font-medium text-sm'>
                        Group Type <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        key={resetkey}
                        name='type'
                        control={control}
                        render={({ field }) => (
                            <MultiSelect
                                options={typeOptions}
                                onValueChange={(values) => field.onChange(values)}
                                defaultValue={field.value || []}
                                placeholder={isTypesLoading ? 'Loading...' : 'Select Group Types'}
                                className={`w-full ${errors.type ? 'border-red-500' : ''} ${isTypesLoading || typeOptions.length === 0 ? 'cursor-not-allowed' : ''}`}
                                maxHeight={240}
                                disabled={isTypesLoading || typeOptions.length === 0}
                            />
                        )}
                    />
                    {errors.type && <FormError>{errors.type.message}</FormError>}
                </div>

                {/* Department */}
                <div className='col-span-1'>
                    <Label className='mb-2 block font-medium text-sm'>
                        Department <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        key={resetkey}
                        name='department'
                        control={control}
                        render={({ field }) => (
                            <MultiSelect
                                options={deptOptions}
                                onValueChange={(values) => field.onChange(values)}
                                defaultValue={field.value || []}
                                placeholder={isDeptLoading ? 'Loading...' : 'Select Departments'}
                                className={`w-full ${errors.department ? 'border-red-500' : ''} ${isDeptLoading || deptOptions.length === 0 ? 'cursor-not-allowed' : ''}`}
                                maxHeight={240}
                                disabled={isDeptLoading || deptOptions.length === 0}
                            />
                        )}
                    />
                    {errors.department && <FormError>{errors.department.message}</FormError>}
                </div>

                {/* Designation */}
                <div className='col-span-1'>
                    <Label className='mb-2 block font-medium text-sm'>
                        Designation <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        key={resetkey}
                        name='designation'
                        control={control}
                        render={({ field }) => (
                            <MultiSelect
                                options={desigOptions}
                                onValueChange={(values) => field.onChange(values)}
                                defaultValue={field.value || []}
                                placeholder={isDesigLoading ? 'Loading...' : 'Select Designations'}
                                className={`w-full ${errors.designation ? 'border-red-500' : ''} ${isDesigLoading || desigOptions.length === 0 ? 'cursor-not-allowed' : ''}`}
                                maxHeight={240}
                                disabled={isDesigLoading || desigOptions.length === 0}
                            />
                        )}
                    />
                    {errors.designation && <FormError>{errors.designation.message}</FormError>}
                </div>
            </div>

            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                {/* Employee Selection */}
                <div className='col-span-1 space-y-4 rounded-lg border bg-muted/30 p-4'>
                    <div className='space-y-3'>
                        <Label className='block font-medium text-sm'>Employee Filter</Label>
                        <Controller
                            key={resetkey}
                            name='allOrIndividual'
                            control={control}
                            render={({ field }) => (
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className='flex gap-4'>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='All' id='all' />
                                        <Label htmlFor='all' className='font-normal'>
                                            All Employees
                                        </Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='Individual' id='individual' />
                                        <Label htmlFor='individual' className='font-normal'>
                                            Individual
                                        </Label>
                                    </div>
                                </RadioGroup>
                            )}
                        />
                        {errors.allOrIndividual && <FormError>{errors.allOrIndividual.message}</FormError>}
                    </div>

                    {allOrIndividual === 'Individual' && (
                        <div className='space-y-2'>
                            <Label className='block font-medium text-sm'>
                                Select Employees <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                name='employeeIds'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        value={field.value || ''}
                                        onValueChange={(value) => {
                                            field.onChange(value);
                                            clearErrors('employeeIds');
                                        }}>
                                        <SelectTrigger className={errors.employeeIds ? 'border-red-500' : ''}>
                                            <SelectValue placeholder={isEmpLoading ? 'Loading...' : 'Select Employee'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {employeesDataTransformed.length === 0 ? (
                                                <div className='p-4 text-center text-muted-foreground text-sm'>
                                                    No employees found for the selected criteria.
                                                </div>
                                            ) : (
                                                employeesDataTransformed.map((emp: any) => (
                                                    <SelectItem key={emp.id} value={emp.id?.toString() || ''}>
                                                        {emp.employeeName} - [{emp.employeeCode}]
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.employeeIds && <FormError>{errors.employeeIds.message}</FormError>}
                        </div>
                    )}
                </div>

                {/* Date Range */}
                <div className='col-span-1 grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                        <Label className='block font-medium text-sm'>
                            From Date <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            key={resetkey}
                            name='fromDate'
                            control={control}
                            render={({ field }) => (
                                <DatePicker
                                    date={field.value ? new Date(field.value) : undefined}
                                    setDate={(date: Date | undefined) => {
                                        field.onChange(date?.toISOString());
                                        if (date) {
                                            // const nextMonthDate = addMonths(date, 1);
                                            const today = new Date();
                                            today.setHours(0, 0, 0, 0);
                                            // const effectiveToDate = nextMonthDate < today ? nextMonthDate : today;
                                            // const nextYear = effectiveToDate.getFullYear();
                                            // const nextMonth = String(effectiveToDate.getMonth() + 1).padStart(2, '0');
                                            // const nextDay = String(effectiveToDate.getDate()).padStart(2, '0');
                                            // setValue('toDate', `${nextYear}-${nextMonth}-${nextDay}`);
                                        } else {
                                            setValue('toDate', '');
                                        }
                                    }}
                                    placeholder='Select From Date'
                                    className={errors.fromDate ? 'border-red-500' : ''}
                                    disabled={[{ after: today }]}
                                />
                            )}
                        />
                        {errors.fromDate && <FormError>{errors.fromDate.message}</FormError>}
                    </div>

                    <div className='space-y-2'>
                        <Label className='block font-medium text-sm'>
                            To Date <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            key={resetkey}
                            name='toDate'
                            control={control}
                            render={({ field }) => (
                                <DatePicker
                                    date={field.value ? new Date(field.value) : undefined}
                                    setDate={(date: Date | undefined) => field.onChange(date?.toISOString())}
                                    placeholder='Select To Date'
                                    className={errors.toDate ? 'border-red-500' : ''}
                                // disabled={
                                //     fromDateObject
                                //         ? [
                                //             { before: fromDateObject },
                                //             { after: today }
                                //         ]
                                //         : [{ after: today }]
                                // }
                                />
                            )}
                        />
                        {errors.toDate && <FormError>{errors.toDate.message}</FormError>}
                    </div>
                </div>
            </div>

            <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start md:justify-end'>
                <Button
                    type='button'
                    variant='outline'
                    onClick={handleReset}
                    className='px-8 shadow-sm hover:bg-muted'
                    disabled={isSubmitting}>
                    <RotateCcw className='mr-2 h-4 w-4' /> Reset
                </Button>
                <Button
                    type='submit'
                    className='bg-primary px-8 text-primary-foreground shadow-md transition-all hover:translate-y-[-1px] hover:shadow-lg'
                    disabled={isSubmitting || isTypesLoading}>
                    {isSubmitting ? (
                        <>
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Generating...
                        </>
                    ) : (
                        <>
                            <Search className='mr-2 h-4 w-4' /> Get Report
                        </>
                    )}
                </Button>
            </div>

            {/* Report Results */}
            {hasData && (
                <CollapsibleSection title='Employee Absent Report' description='Managing the Employee Absent Report' defaultOpen={true}>
                    <div className='flex items-center justify-end px-4 py-2'>
                        <div className='flex items-center gap-2'>
                            <Button
                                variant='outline'
                                size='sm'
                                onClick={handleExportToExcel}
                                className='border-green-500 text-green-700 hover:bg-green-50'>
                                <FileSpreadsheet className='h-4 w-4' /> Excel
                            </Button>
                            <Button
                                variant='outline'
                                size='sm'
                                onClick={handlePrint}
                                className='border-blue-500 text-blue-700 hover:bg-blue-50'>
                                <Printer className='h-4 w-4' /> Print
                            </Button>
                        </div>
                    </div>

                    <div className='rounded-xl border'>
                        <div className='flex items-center justify-center bg-muted/30 py-2.5 text-center font-bold shadow-sm'>
                            Monthly Report from {new Date(watch('fromDate')).toLocaleDateString()} to{' '}
                            {new Date(watch('toDate')).toLocaleDateString()}
                        </div>
                        <div className='px-2'>
                            <GenericDataTable<EmployeeAbsentReportRow>
                                data={tableData}
                                columns={employeeAbsentReportColumns}
                                isLoading={isLoading}
                                showViewOptions={false}
                                columnPinning={{ left: ['hrme_id'], right: ['actions'] }}
                                // isPaginationRequired={true}
                                // isSearchRequired={true}
                                loadingMessage='Analyzing attendance records...'
                                noDataTitle='No records matches your criteria'
                                noDataDescription='Try adjusting your category, department or date range filters.'
                                errorTitle='Unable to load report'
                            // scrollable={true}
                            />
                        </div>
                    </div>
                </CollapsibleSection>
            )}
        </form>
    );
}
