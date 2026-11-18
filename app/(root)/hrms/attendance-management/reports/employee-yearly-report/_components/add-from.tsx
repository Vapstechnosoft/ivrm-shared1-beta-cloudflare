'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { DatePicker } from '@/components/ui/date-picker';
import { FormError } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    useReportDepartments,
    useReportDesignations,
    useReportEmployeesByGroupTypeDeptAndDesignation,
    useReportGroupTypes
} from '@/hooks/hrms/useReports';
import { exportToExcel } from '@/lib/utils';
import { employeeYearlyReportFilterSchema } from '@/schemas/hrms/attendance-management-schemas';
import { getEmployeeYearlyReport } from '@/server/hrms/hrmsConfig/reports/employee-yearly-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { FileSpreadsheet, Printer, Save } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { Label } from 'react-aria-components';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import { type YearRow, getEmployeeYearlyReportColumns } from './columns';

type FormFields = z.infer<typeof employeeYearlyReportFilterSchema>;

interface AddEmployeeYearlyReportFormProps {
    onSuccess?: () => void;
    className?: string;
    searchParams?: any;
}

export default function AddEmployeeYearlyReportForm({ onSuccess, className = '', searchParams }: AddEmployeeYearlyReportFormProps) {
    const [selectedRows, setSelectedRows] = useState<YearRow[]>([]);
    const [reportData, setReportData] = useState<any[]>([]);
    const [dynamicMonths, setDynamicMonths] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [response, setResponse] = useState<any>(null);

    // Initialize form with searchParams if available
    const urlModes = useMemo(() => {
        const m = searchParams?.mode;
        return Array.isArray(m) ? m : m ? [m] : [];
    }, [searchParams?.mode]);

    const urlTypes = useMemo(() => {
        const t = searchParams?.type;
        return Array.isArray(t) ? t : t ? [t] : [];
    }, [searchParams?.type]);

    const urlDepartments = useMemo(() => {
        const d = searchParams?.department;
        return Array.isArray(d) ? d : d ? [d] : [];
    }, [searchParams?.department]);

    const urlDesignations = useMemo(() => {
        const d = searchParams?.designation;
        return Array.isArray(d) ? d : d ? [d] : [];
    }, [searchParams?.designation]);

    const {
        handleSubmit,
        control,
        reset,
        watch,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(employeeYearlyReportFilterSchema),
        mode: 'onChange',
        defaultValues: {
            type: urlTypes,
            department: urlDepartments,
            designation: urlDesignations,
            allOrIndividual: (searchParams?.allOrIndividual as any) || 'All',
            employee: (searchParams?.employee as string) || '',
            fromDate: (searchParams?.fromDate as string) || '',
            toDate: (searchParams?.toDate as string) || '',
            mode: urlModes
        }
    });

    const allOrIndividualValue = watch('allOrIndividual');
    const fromDateValue = watch('fromDate');

    const watchedType = watch('type') || [];
    const watchedDepartment = watch('department') || [];
    const watchedDesignation = watch('designation') || [];

    const fromDateObject = fromDateValue ? new Date(fromDateValue) : undefined;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const groupTypeIds = useMemo(() => watchedType.map(Number).filter(Boolean), [watchedType]);
    const deptIds = useMemo(() => watchedDepartment.map(Number).filter(Boolean), [watchedDepartment]);
    const desigIds = useMemo(() => watchedDesignation.map(Number).filter(Boolean), [watchedDesignation]);

    const { data: groupTypesData, isLoading: isGroupTypesLoading } = useReportGroupTypes();
    const { data: departmentsData, isLoading: isDepartmentsLoading } = useReportDepartments(groupTypeIds.join(','));
    const { data: designationsData, isLoading: isDesignationsLoading } = useReportDesignations(groupTypeIds.join(','), deptIds.join(','));
    const { data: employeesData, isLoading: isEmployeesLoading } = useReportEmployeesByGroupTypeDeptAndDesignation(
        groupTypeIds,
        deptIds,
        desigIds
    );

    const groupTypesDataTransformed = useMemo(() => {
        return (
            groupTypesData?.data?.map((gt: any) => ({
                id: gt.key || gt.hrmgT_Id,
                name: gt.value || gt.hrmgT_EmployeeGroupType
            })) || []
        ).filter((d: any) => d.id != null);
    }, [groupTypesData]);

    const departmentsDataTransformed = useMemo(() => {
        return (
            departmentsData?.data?.map((d: any) => ({
                id: d.hrmD_Id || d.hrmd_id || d.key || d.id,
                name: d.hrmD_DepartmentName || d.hrmd_departmentName || d.value || d.name
            })) || []
        ).filter((d: any) => d.id != null);
    }, [departmentsData]);

    const designationsDataTransformed = useMemo(() => {
        return (
            designationsData?.data?.map((d: any) => ({
                id: d.hrmdeS_Id || d.hrmdes_id || d.key || d.id,
                name: d.hrmdeS_DesignationName || d.hrmdes_designationName || d.value || d.name
            })) || []
        ).filter((d: any) => d.id != null);
    }, [designationsData]);

    const employeesDataTransformed = useMemo(() => {
        const list = employeesData?.data?.employeeNames || employeesData;
        if (!list || !Array.isArray(list)) return [];

        return list
            .map((emp: any) => {
                const id = emp.HRME_Id || emp.hrmE_Id || emp.id || emp.key;
                if (id == null) return null;

                const employeeName = emp.employeeFullName || emp.ename || `Employee ${id}`;
                const employeeCode = emp.ecode || emp.employeeCode || id;

                return {
                    id: Number(id),
                    employeeCode,
                    employeeName
                };
            })
            .filter(Boolean);
    }, [employeesData]);

    const watchedMode = watch('mode');
    const modes = useMemo(() => {
        if (Array.isArray(watchedMode) && watchedMode.length > 0) return watchedMode;
        if (typeof watchedMode === 'string' && watchedMode) return [watchedMode];
        const m = searchParams?.mode;
        return Array.isArray(m) ? m : m ? [m] : [];
    }, [watchedMode, searchParams?.mode]);

    const handleToggleMode = (modeName: any) => {
        const currentModes = Array.isArray(watchedMode) ? [...watchedMode] : [];
        const newModes = currentModes.includes(modeName)
            ? currentModes.filter((m) => m !== modeName)
            : [...currentModes, modeName];
        setValue('mode', newModes);
    };

    // Transform report data for table
    const tableData: YearRow[] = useMemo(() => {
        return reportData.map((item: any, index: number) => {
            const row: YearRow = {
                id: index + 1,
                ecode: item.ecode || item.HRME_EmployeeCode || '',
                ename: item.ename || item.HRME_EmployeeFirstName || '',
                designation: item.designation || item.HRMDES_DesignationName || '',
                doj: item.doj || item.HRME_DOJ || '',
                tpdays: item.tpdays ?? item.totalpresent ?? 0,
                hwkdays: item.hwkdays ?? item.totalholidayworked ?? 0
            };

            // Add dynamic month columns
            dynamicMonths.forEach((month: string) => {
                (row as any)[month] = item[month] ?? '';
            });

            return row;
        });
    }, [reportData, dynamicMonths]);

    const tableProps = useMemo(() => {
        return {
            data: tableData,
            total: tableData.length,
            totalItems: tableData.length,
            errorMessage: response?.message || null,
            success: response?.success !== false
        };
    }, [tableData, response]);

    const columns = useMemo(() => {
        return getEmployeeYearlyReportColumns(dynamicMonths, modes);
    }, [dynamicMonths, modes]);

    const handleRowSelectionChange = useCallback(
        (rows: YearRow[]) => {
            if (
                rows.length !== selectedRows.length ||
                JSON.stringify(rows.map((r) => r.ecode)) !== JSON.stringify(selectedRows.map((r) => r.ecode))
            ) {
                setSelectedRows(rows);
            }
        },
        [selectedRows]
    );

    const handleExportToExcel = () => {
        const dataToExport = selectedRows.length > 0 ? selectedRows : tableData;
        if (dataToExport.length === 0) return;

        const exportData = dataToExport.map((row: YearRow, index: number) => {
            const exportRow: Record<string, any> = {
                'Sl.No': index + 1,
                'Employee Code': row.ecode || '',
                'Employee Name': row.ename || '',
                Designation: row.designation || ''
            };

            dynamicMonths.forEach((month: string) => {
                exportRow[month.replace('_', ' ')] = (row as any)[month] ?? '';
            });

            if (modes.includes('Total working Day')) {
                exportRow['Total Present'] = row.tpdays ?? '';
            }

            if (modes.includes('Show Holiday Punch')) {
                exportRow['Total Worked on Holidays'] = row.hwkdays ?? '';
            }

            if (modes.includes('Date Of Joining')) {
                exportRow['Date of Joining'] = row.doj ? format(new Date(row.doj), 'dd-MM-yyyy') : '';
            }

            return exportRow;
        });

        exportToExcel(
            exportData,
            `Employee_Yearly_Report_${
            // biome-ignore lint/complexity/useDateNow: <explanation>
            new Date().getTime()
            }`
        );
    };

    const handlePrint = () => {
        const dataToPrint = selectedRows.length > 0 ? selectedRows : tableData;
        if (dataToPrint.length === 0) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const columnHeaders = [
            'Sl.No',
            'Employee Code',
            'Employee Name',
            'Designation',
            ...dynamicMonths.map((m: string) => m.replace('_', ' '))
        ];

        if (modes.includes('Total working Day')) columnHeaders.push('Total Present');
        if (modes.includes('Show Holiday Punch')) columnHeaders.push('Total Worked on Holidays');
        if (modes.includes('Date Of Joining')) columnHeaders.push('Date of Joining');

        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Employee Yearly Report</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
                    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #4f46e5; padding-bottom: 10px; }
                    h1 { color: #4f46e5; margin: 0; font-size: 24px; }
                    p { margin: 5px 0; color: #666; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 10px; }
                    th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
                    th { background-color: #f8fafc; color: #1e293b; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; }
                    tr:nth-child(even) { background-color: #f1f5f9; }
                    .footer { margin-top: 30px; text-align: right; font-size: 10px; color: #94a3b8; }
                    @media print {
                        body { margin: 0; }
                        @page { margin: 1.5cm; landscape: true; }
                        table { font-size: 9px; }
                        .header { border-bottom-color: #000; }
                        th { background-color: #eee !important; color: #000 !important; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Employee Yearly Report</h1>
                    <p>Generated on ${format(new Date(), 'dd MMMM yyyy, hh:mm a')}</p>
                    <p>Period: ${fromDateValue ? format(new Date(fromDateValue), 'dd MMM yyyy') : ''} - ${watch('toDate') ? format(new Date(watch('toDate')), 'dd MMM yyyy') : ''}</p>
                </div>
                <table>
                    <thead>
                        <tr>
                            ${columnHeaders.map((header) => `<th>${header}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${dataToPrint
                .map(
                    (row: YearRow, index: number) => `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${row.ecode || ''}</td>
                                <td>${row.ename || ''}</td>
                                <td>${row.designation || ''}</td>
                                ${dynamicMonths.map((m: string) => `<td>${(row as any)[m] ?? ''}</td>`).join('')}
                                ${modes.includes('Total working Day') ? `<td>${row.tpdays ?? ''}</td>` : ''}
                                ${modes.includes('Show Holiday Punch') ? `<td>${row.hwkdays ?? ''}</td>` : ''}
                                ${modes.includes('Date Of Joining') ? `<td>${row.doj ? format(new Date(row.doj), 'dd-MM-yyyy') : ''}</td>` : ''}
                            </tr>
                        `
                )
                .join('')}
                    </tbody>
                </table>
                <div class="footer">
                    Printed via IVRM Management System
                </div>
            </body>
            </html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 300);
    };

    const onSubmit: SubmitHandler<FormFields> = async (data: FormFields) => {
        try {
            setIsLoading(true);
            // biome-ignore lint/suspicious/noConsoleLog: <explanation>
            console.log('form data', data);

            // Determine employee IDs
            let hrmeIds = '0';
            if (data.allOrIndividual === 'Individual') {
                hrmeIds = data.employee || '0';
            } else if (data.allOrIndividual === 'All') {
                const allIds = employeesDataTransformed.map((emp: any) => emp.id).join(',');
                hrmeIds = allIds || '0';
            }

            const payload = {
                fromdate: data.fromDate || '',
                todate: data.toDate || '',
                multiplehrmeid: hrmeIds,
                type: 'yearly'
            };

            const responseData = await getEmployeeYearlyReport(payload);
            console.log('yearly report response', responseData)
            setResponse(responseData);

            if (responseData.success) {
                // Extract report data and columns
                const report = responseData.data?.report || responseData.data || [];
                const columns = responseData.data?.columns || [];

                setReportData(report);
                setDynamicMonths(columns);

                // Update URL with search params
                const params = new URLSearchParams();

                if (data.fromDate) params.set('fromDate', data.fromDate);
                if (data.toDate) params.set('toDate', data.toDate);
                if (hrmeIds) params.set('employee', hrmeIds);
                if (data.allOrIndividual) params.set('allOrIndividual', data.allOrIndividual);

                // Clear and add multi-select params
                params.delete('type');
                params.delete('department');
                params.delete('designation');
                params.delete('mode');

                data.type.forEach((t) => params.append('type', t));
                data.department.forEach((d) => params.append('department', d));
                data.designation.forEach((d) => params.append('designation', d));
                if (data.mode) {
                    data.mode.forEach((m) => params.append('mode', m));
                }

                toast.success(responseData.message || 'Report generated successfully');
                onSuccess?.();
            } else {
                toast.error(responseData.message || 'Failed to generate report');
                setReportData([]);
                setDynamicMonths([]);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to generate report');
            setReportData([]);
            setDynamicMonths([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        reset({
            type: [],
            department: [],
            designation: [],
            allOrIndividual: 'All',
            employee: '',
            fromDate: '',
            toDate: '',
            mode: []
        });
        setReportData([]);
        setDynamicMonths([]);
        setSelectedRows([]);
        setResponse(null);
    };

    const shouldShowReport = reportData.length > 0;

    return (
        <div className={`${className}`}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='space-y-4'>
                    <div className='rounded-lg bg-white p-6 shadow'>
                        <div className='grid grid-cols-1 items-center gap-10 lg:grid-cols-3'>
                            {/* Type */}
                            <div className='col-span-1'>
                                <Label className='mb-2 block font-medium text-gray-700 text-sm'>
                                    Type <span className='ml-1 text-red-500'>*</span>
                                </Label>
                                <Controller
                                    name='type'
                                    control={control}
                                    render={({ field }) => (
                                        <MultiSelect
                                            options={groupTypesDataTransformed.map((gt: any) => ({
                                                label: gt.name,
                                                value: String(gt.id)
                                            }))}
                                            onValueChange={(values) => field.onChange(values)}
                                            defaultValue={field.value || []}
                                            placeholder={isGroupTypesLoading ? 'Loading...' : 'Select Group Types'}
                                            className={`w-full ${errors.type ? 'border-red-500' : ''}`}
                                            maxHeight={240}
                                            disabled={isGroupTypesLoading || groupTypesDataTransformed.length === 0}
                                        />
                                    )}
                                />
                                {errors.type && <FormError>{errors.type.message}</FormError>}
                            </div>

                            {/* Department */}
                            <div className='col-span-1'>
                                <Label className='mb-2 block font-medium text-gray-700 text-sm'>
                                    Department <span className='ml-1 text-red-500'>*</span>
                                </Label>
                                <Controller
                                    name='department'
                                    control={control}
                                    render={({ field }) => (
                                        <MultiSelect
                                            options={departmentsDataTransformed.map((dept: any) => ({
                                                label: dept.name,
                                                value: String(dept.id)
                                            }))}
                                            onValueChange={(values) => field.onChange(values)}
                                            defaultValue={field.value || []}
                                            placeholder={isDepartmentsLoading ? 'Loading...' : 'Select Departments'}
                                            className={`w-full ${errors.department ? 'border-red-500' : ''}`}
                                            maxHeight={240}
                                            disabled={isDepartmentsLoading || departmentsDataTransformed.length === 0}
                                        />
                                    )}
                                />
                                {errors.department && <FormError>{errors.department.message}</FormError>}
                            </div>

                            {/* Designation */}
                            <div className='col-span-1'>
                                <Label className='mb-2 block font-medium text-gray-700 text-sm'>
                                    Designation <span className='ml-1 text-red-500'>*</span>
                                </Label>
                                <Controller
                                    name='designation'
                                    control={control}
                                    render={({ field }) => (
                                        <MultiSelect
                                            options={designationsDataTransformed.map((desg: any) => ({
                                                label: desg.name,
                                                value: String(desg.id)
                                            }))}
                                            onValueChange={(values) => field.onChange(values)}
                                            defaultValue={field.value || []}
                                            placeholder={isDesignationsLoading ? 'Loading...' : 'Select Designations'}
                                            className={`w-full ${errors.designation ? 'border-red-500' : ''}`}
                                            maxHeight={240}
                                            disabled={isDesignationsLoading || designationsDataTransformed.length === 0}
                                        />
                                    )}
                                />
                                {errors.designation && <FormError>{errors.designation.message}</FormError>}
                            </div>

                            {/* All/Individual */}
                            <div className='col-span-1'>
                                <Label className='mb-2 block font-medium text-gray-700 text-sm'>
                                    All / Individual <span className='ml-1 text-red-500'>*</span>
                                </Label>
                                <Controller
                                    name='allOrIndividual'
                                    control={control}
                                    render={({ field }) => (
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger className={errors.allOrIndividual ? 'border-red-500' : ''}>
                                                <SelectValue placeholder='Select' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value='All'>All</SelectItem>
                                                <SelectItem value='Individual'>Individual</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.allOrIndividual && <FormError>{errors.allOrIndividual.message}</FormError>}
                            </div>

                            {/* Employee - Only show when Individual is selected */}
                            {allOrIndividualValue === 'Individual' && (
                                <div className='col-span-1'>
                                    <Label className='mb-2 block font-medium text-gray-700 text-sm'>
                                        Employee <span className='ml-1 text-red-500'>*</span>
                                    </Label>
                                    <Controller
                                        name='employee'
                                        control={control}
                                        render={({ field }) => (
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger className={errors.employee ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder='Select Employee' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {employeesDataTransformed.length === 0 ? (
                                                        <div className='p-4 text-center text-muted-foreground text-sm'>
                                                            No employees found for the selected criteria.
                                                        </div>
                                                    ) : (
                                                        employeesDataTransformed.map((emp: any) => (
                                                            <SelectItem key={emp.id} value={String(emp.id)}>
                                                                {emp.employeeName} - [{emp.employeeCode}]
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.employee && <FormError>{errors.employee.message}</FormError>}
                                </div>
                            )}

                            {/* From Date */}
                            <div className='col-span-1'>
                                <Label className='mb-2 block font-medium text-gray-700 text-sm'>
                                    From Date <span className='ml-1 text-red-500'>*</span>
                                </Label>
                                <Controller
                                    name='fromDate'
                                    control={control}
                                    render={({ field }) => (
                                        <DatePicker
                                            date={field.value ? new Date(field.value) : undefined}
                                            setDate={(date) => {
                                                if (date) {
                                                    const year = date.getFullYear();
                                                    const month = String(date.getMonth() + 1).padStart(2, '0');
                                                    const day = String(date.getDate()).padStart(2, '0');
                                                    field.onChange(`${year}-${month}-${day}`);
                                                } else {
                                                    field.onChange('');
                                                    setValue('toDate', '');
                                                }
                                            }}
                                            placeholder='From date'
                                            className={errors.fromDate ? 'border-red-500' : ''}
                                            disabled={[{ after: today }]}
                                        />
                                    )}
                                />
                                {errors.fromDate && <FormError>{errors.fromDate.message}</FormError>}
                            </div>

                            {/* To Date */}
                            <div className='col-span-1'>
                                <Label className='mb-2 block font-medium text-gray-700 text-sm'>
                                    To Date <span className='ml-1 text-red-500'>*</span>
                                </Label>
                                <Controller
                                    name='toDate'
                                    control={control}
                                    render={({ field }) => (
                                        <DatePicker
                                            date={field.value ? new Date(field.value) : undefined}
                                            setDate={(date) => {
                                                if (date) {
                                                    const year = date.getFullYear();
                                                    const month = String(date.getMonth() + 1).padStart(2, '0');
                                                    const day = String(date.getDate()).padStart(2, '0');
                                                    field.onChange(`${year}-${month}-${day}`);
                                                } else {
                                                    field.onChange('');
                                                }
                                            }}
                                            placeholder='To date'
                                            className={errors.toDate ? 'border-red-500' : ''}
                                            disabled={fromDateObject ? [{ before: fromDateObject }, { after: today }] : [{ after: today }]}
                                        />
                                    )}
                                />
                                {errors.toDate && <FormError>{errors.toDate.message}</FormError>}
                            </div>

                            {/* Mode */}
                            <div className='col-span-1'>
                                <Label className='mb-2 block font-medium text-gray-700 text-sm'>Mode</Label>
                                <Controller
                                    name='mode'
                                    control={control}
                                    render={({ field }) => (
                                        <MultiSelect
                                            options={[
                                                { label: 'Date Of Joining', value: 'Date Of Joining' },
                                                { label: 'Show Holiday Punch', value: 'Show Holiday Punch' },
                                                { label: 'Total working Day', value: 'Total working Day' }
                                            ]}
                                            onValueChange={(values) => field.onChange(values)}
                                            defaultValue={field.value || []}
                                            placeholder='Select Mode'
                                            className='w-full'
                                            maxHeight={240}
                                        />
                                    )}
                                />
                            </div>
                        </div>
                    </div>

                    {errors.root && <FormError>{errors.root.message}</FormError>}
                </div>

                {/* Action Buttons */}
                <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={handleReset}
                        disabled={isSubmitting || isLoading}
                        className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'>
                        Reset
                    </Button>
                    <Button
                        type='submit'
                        disabled={isSubmitting || isLoading}
                        className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'
                        isLoading={isSubmitting || isLoading}
                        loadingText='Searching...'>
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' />
                            Search
                        </div>
                    </Button>
                </div>
            </form>

            {/* Report Section - Shows below the form when data exists */}
            {shouldShowReport && (
                <div className='mt-8'>
                    <CollapsibleSection
                        title='Employee Yearly Report'
                        description={`Showing ${reportData.length} employee records`}
                        defaultOpen={true}
                        variant='default'
                        size='lg'
                        className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                        {/* Action Buttons & Quick Mode Toggles */}
                        <div className='mb-4 flex flex-wrap items-center justify-between gap-3 border-blue-100 bg-blue-50/40 p-3 shadow-sm'>
                            {/* <div className='flex flex-wrap items-center gap-4'>
                                <span className='font-semibold text-blue-900 text-xs uppercase tracking-wider'>Mode Options:</span>
                                {[
                                    { id: 'Total working Day', label: 'Total Working Day' },
                                    { id: 'Show Holiday Punch', label: 'Holiday Punch' },
                                    { id: 'Date Of Joining', label: 'Date of Joining' }
                                ].map((item) => {
                                    const isChecked = modes.includes(item.id);
                                    return (
                                        <label
                                            key={item.id}
                                            className='flex cursor-pointer items-center gap-1.5 text-xs text-slate-700 transition-colors hover:text-blue-600'>
                                            <Checkbox
                                                checked={isChecked}
                                                onCheckedChange={() => handleToggleMode(item.id)}
                                            />
                                            <span className={isChecked ? 'font-medium text-blue-700' : ''}>{item.label}</span>
                                        </label>
                                    );
                                })}
                            </div> */}

                            <div className='ml-auto flex items-center gap-2'>
                                <Button
                                    type='button'
                                    variant='outline'
                                    size='sm'
                                    onClick={handleExportToExcel}
                                    className='h-8 border-emerald-200 bg-white text-emerald-700 shadow-sm hover:bg-emerald-50'>
                                    <FileSpreadsheet className='mr-2 h-3.5 w-3.5' />
                                    Excel
                                </Button>
                                <Button
                                    type='button'
                                    variant='outline'
                                    size='sm'
                                    onClick={handlePrint}
                                    className='h-8 border-blue-200 bg-white text-blue-700 shadow-sm hover:bg-blue-50'>
                                    <Printer className='mr-2 h-3.5 w-3.5' />
                                    Print
                                </Button>
                            </div>
                        </div>

                        <GenericDataTable<YearRow>
                            {...tableProps}
                            columns={columns}
                            isLoading={isLoading}
                            success={response?.success}
                            error={null}
                            isPaginationRequired={false}
                            manualPagination={true}
                            scrollable={true}
                            maxHeight='600px'
                            isSearchRequired={false}
                            onRowSelectionChange={handleRowSelectionChange}
                            errorMessage={response?.message || null}
                        />
                    </CollapsibleSection>
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className='flex items-center justify-center py-12'>
                    <div className='text-center'>
                        <p className='mt-4 text-muted-foreground'>Loading report data...</p>
                    </div>
                </div>
            )}
        </div>
    );
}
