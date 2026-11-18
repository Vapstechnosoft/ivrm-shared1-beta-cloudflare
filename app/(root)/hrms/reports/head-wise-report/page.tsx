'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { FormError, Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLeaveYearDropdown } from '@/hooks/hrms/useMasters';
import { useHeadWiseReport, useReportDepartments, useReportDesignations, useReportGroupTypes } from '@/hooks/hrms/useReports';
import { exportToExcel } from '@/lib/export-to-file';
import { getMasterInstitution } from '@/server/hrms/master-dropdown';
import { zodResolver } from '@hookform/resolvers/zod';
import { Download, Loader2, Printer, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { printHeadWiseReport } from './_components/print-head-wise-report';

const MONTH_LIST = [
    { id: 1, name: 'January' },
    { id: 2, name: 'February' },
    { id: 3, name: 'March' },
    { id: 4, name: 'April' },
    { id: 5, name: 'May' },
    { id: 6, name: 'June' },
    { id: 7, name: 'July' },
    { id: 8, name: 'August' },
    { id: 9, name: 'September' },
    { id: 10, name: 'October' },
    { id: 11, name: 'November' },
    { id: 12, name: 'December' }
];

const HeadWiseReportSchema = z.object({
    groupType: z.array(z.string()).min(1, 'Group type is required'),
    department: z.array(z.string()).min(1, 'Department is required'),
    designation: z.array(z.string()).min(1, 'Designation is required'),
    month: z.string().min(1, 'Month is required'),
    year: z.string().min(1, 'Year is required')
});

type FormFields = z.infer<typeof HeadWiseReportSchema>;

export default function HeadWiseReportPage() {
    const [reportData, setReportData] = useState<any[]>([]);
    const [institution, setInstitution] = useState<any>(null);
    const [resetKey, setResetKey] = useState<number>(0);

    const {
        control,
        handleSubmit,
        watch,
        reset,
        formState: { errors }
    } = useForm<FormFields>({
        resolver: zodResolver(HeadWiseReportSchema),
        defaultValues: {
            groupType: [],
            department: [],
            designation: [],
            month: '',
            year: ''
        }
    });

    const watchedGroupTypes = watch('groupType');
    const watchedDepartments = watch('department');

    useEffect(() => {
        const fetchInstitution = async () => {
            try {
                const res = await getMasterInstitution();
                if (res?.data) {
                    setInstitution(Array.isArray(res.data) ? res.data[0] : res.data);
                }
            } catch (error) {
                console.error('Error fetching institution:', error);
            }
        };
        fetchInstitution();
    }, []);

    const { data: groupTypesData, isLoading: groupTypesLoading } = useReportGroupTypes();
    const { data: departmentsData, isLoading: departmentsLoading } = useReportDepartments(
        (Array.isArray(watchedGroupTypes) ? watchedGroupTypes : []).join(',')
    );
    const { data: designationsData, isLoading: designationsLoading } = useReportDesignations(
        (Array.isArray(watchedGroupTypes) ? watchedGroupTypes : []).join(','),
        (Array.isArray(watchedDepartments) ? watchedDepartments : []).join(',')
    );
    const { data: yearsData, isLoading: yearsLoading } = useLeaveYearDropdown();

    const { mutate: generateReport, isPending: isSearching } = useHeadWiseReport();

    const onSearch = (data: FormFields) => {
        const selectedYearObj = (yearsData?.data || []).find((y: any) => y && String(y.hrmlY_Id ?? '') === String(data.year ?? ''));
        const yearStr = selectedYearObj?.hrmlY_LeaveYear || String(data.year ?? '0');
        const monthName = MONTH_LIST.find((m) => m && String(m.id ?? '') === String(data.month ?? ''))?.name || '';

        generateReport(
            {
                hreS_Year: yearStr,
                hreS_Month: monthName,
                hrmd_ids: (data.department || []).map(Number),
                hrmgt_ids: (data.groupType || []).map(Number),
                hrmdes_ids: (data.designation || []).map(Number)
            },
            {
                onSuccess: (res) => {
                    if (res.success && res.data) {
                        setReportData(res.data);
                        toast.success('Report generated successfully');
                    } else {
                        toast.error(res.message || 'No data found');
                        setReportData([]);
                    }
                }
            }
        );
    };

    const handleReset = () => {
        reset();
        setReportData([]);
        setResetKey((prev) => prev + 1);
    };

    const handlePrint = () => {
        if (reportData.length === 0) {
            toast.error('No data to print');
            return;
        }
        const monthName = MONTH_LIST.find((m) => m && String(m.id ?? '') === String(watch('month') ?? ''))?.name || '';
        const selectedYearObj = (yearsData?.data || []).find((y: any) => y && String(y.hrmlY_Id ?? '') === String(watch('year') ?? ''));
        const yearStr = selectedYearObj?.hrmlY_LeaveYear || '';

        printHeadWiseReport(reportData, institution, monthName, yearStr);
    };

    const handleExport = () => {
        if (reportData.length === 0) {
            toast.error('No data to export');
            return;
        }

        const exportColumns = [
            { label: 'Sl.No', value: 'slNo' },
            { label: 'Employee Code', value: 'employeeCode' },
            { label: 'Employee Name', value: 'employeeName' },
            { label: 'Designation', value: 'designationName' },
            { label: 'Total Earning', value: 'totalEarning' },
            { label: 'Total Deduction', value: 'totalDeduction' },
            { label: 'Net Salary', value: 'netSalary' }
        ];

        const exportData = reportData.map((item, index) => ({
            slNo: index + 1,
            employeeCode: item.employeeCode,
            employeeName: item.employeeName,
            designationName: item.designationName,
            totalEarning: item.totalEarning,
            totalDeduction: item.totalDeduction,
            netSalary: item.netSalary
        }));

        exportToExcel('HeadWiseReport', JSON.stringify(exportColumns), JSON.stringify(exportData));
    };

    const columns = [
        {
            id: 'slNo',
            header: 'Sl.No',
            cell: ({ row }: any) => row.index + 1
        },
        {
            accessorKey: 'employeeCode',
            header: 'Employee Code'
        },
        {
            accessorKey: 'employeeName',
            header: 'Employee Name'
        },
        {
            accessorKey: 'designationName',
            header: 'Designation'
        },
        {
            accessorKey: 'totalEarning',
            header: 'Total Earning',
            cell: ({ row }: any) =>
                `₹${(row.original.totalEarning || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        },
        {
            accessorKey: 'totalDeduction',
            header: 'Total Deduction',
            cell: ({ row }: any) =>
                `₹${(row.original.totalDeduction || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        },
        {
            accessorKey: 'netSalary',
            header: 'Net Salary',
            cell: ({ row }: any) =>
                `₹${(row.original.netSalary || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        }
    ];

    return (
        <div className='container min-h-screen space-y-4 p-2'>
            {/* <div className='flex items-center justify-between'>
                <h2 className='font-bold text-2xl tracking-tight'>Head wise Report</h2>
            </div> */}

            <CollapsibleSection title='Report Criteria' defaultOpen={true} variant='outline' className='shadow-sm'>
                <form onSubmit={handleSubmit(onSearch)} className='space-y-6'>
                    <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
                        <div className='space-y-2'>
                            <Label>
                                Group Type <span className='text-destructive'>*</span>
                            </Label>
                            <Controller
                                name='groupType'
                                control={control}
                                render={({ field }) => (
                                    <MultiSelect
                                        options={(groupTypesData?.data || []).filter(Boolean).map((gt: any) => ({
                                            label: String(gt.value || ''),
                                            value: String(gt.key ?? '')
                                        }))}
                                        defaultValue={field.value}
                                        onValueChange={field.onChange}
                                        placeholder='Select Group Types'
                                        disabled={groupTypesLoading}
                                    />
                                )}
                            />
                            {errors.groupType && <FormError>{errors.groupType.message}</FormError>}
                        </div>

                        <div className='space-y-2'>
                            <Label>
                                Department <span className='text-destructive'>*</span>
                            </Label>
                            <Controller
                                name='department'
                                control={control}
                                render={({ field }) => (
                                    <MultiSelect
                                        options={(departmentsData?.data || []).filter(Boolean).map((d: any) => ({
                                            label: String(d.hrmD_DepartmentName || d.value || ''),
                                            value: String(d.hrmD_Id ?? d.key ?? '')
                                        }))}
                                        defaultValue={field.value}
                                        onValueChange={field.onChange}
                                        placeholder='Select Departments'
                                        disabled={departmentsLoading}
                                    />
                                )}
                            />
                            {errors.department && <FormError>{errors.department.message}</FormError>}
                        </div>

                        <div className='space-y-2'>
                            <Label>
                                Designation <span className='text-destructive'>*</span>
                            </Label>
                            <Controller
                                name='designation'
                                control={control}
                                render={({ field }) => (
                                    <MultiSelect
                                        options={(designationsData?.data || []).filter(Boolean).map((d: any) => ({
                                            label: String(d.hrmdeS_DesignationName || d.value || ''),
                                            value: String(d.hrmdeS_Id ?? d.key ?? '')
                                        }))}
                                        defaultValue={field.value}
                                        onValueChange={field.onChange}
                                        placeholder='Select Designations'
                                        disabled={designationsLoading}
                                    />
                                )}
                            />
                            {errors.designation && <FormError>{errors.designation.message}</FormError>}
                        </div>

                        <div className='space-y-2'>
                            <Label>
                                Year <span className='text-destructive'>*</span>
                            </Label>
                            <Controller
                                key={resetKey}
                                name='year'
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Year' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {(yearsData?.data || []).filter(Boolean).map((y: any) => (
                                                <SelectItem key={y.hrmlY_Id} value={String(y.hrmlY_Id ?? '')}>
                                                    {y.hrmlY_LeaveYear}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.year && <FormError>{errors.year.message}</FormError>}
                        </div>

                        <div className='space-y-2'>
                            <Label>
                                Month <span className='text-destructive'>*</span>
                            </Label>
                            <Controller
                                key={resetKey}
                                name='month'
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Month' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {MONTH_LIST.map((m) => (
                                                <SelectItem key={m.id} value={String(m.id ?? '')}>
                                                    {m.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.month && <FormError>{errors.month.message}</FormError>}
                        </div>
                    </div>

                    <div className='flex justify-end gap-2'>
                        <Button type='button' variant='outline' onClick={handleReset}>
                            Reset
                        </Button>
                        <Button type='submit' disabled={isSearching}>
                            {isSearching ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Search className='mr-2 h-4 w-4' />}
                            Generate
                        </Button>
                    </div>
                </form>
            </CollapsibleSection>

            {reportData.length > 0 && (
                <CollapsibleSection
                    title='Report Details'
                    defaultOpen={true}
                    rightElement={
                        <div className='flex gap-2'>
                            <Button variant='outline' size='sm' onClick={handleExport}>
                                <Download className='mr-2 h-4 w-4' />
                                Export
                            </Button>
                            <Button variant='outline' size='sm' onClick={handlePrint}>
                                <Printer className='mr-2 h-4 w-4' />
                                Print
                            </Button>
                        </div>
                    }>
                    <div className='space-y-4'>
                        {/* Institution Details Section */}
                        <div className='mb-6 space-y-1 text-center'>
                            <h3 className='font-bold text-xl uppercase'>{institution?.mI_Name}</h3>
                            <p className='text-muted-foreground'>
                                {institution?.mI_Address1}, {institution?.ivrmmcT_Name} - {institution?.mI_Pincode}
                            </p>
                            <p className='font-semibold decoration-1 decoration-primary/30 underline-offset-4'>
                                HEAD WISE REPORT FOR{' '}
                                {(MONTH_LIST.find((m) => String(m.id ?? '') === String(watch('month') ?? ''))?.name || '').toUpperCase()}{' '}
                                {
                                    (yearsData?.data || []).find((y: any) => y && String(y.hrmlY_Id ?? '') === String(watch('year') ?? ''))
                                        ?.hrmlY_LeaveYear
                                }
                            </p>
                        </div>

                        <GenericDataTable
                            data={reportData}
                            columns={columns}
                            totalItems={reportData.length}
                            isPaginationRequired={false}
                            isSearchRequired={false}
                            isLoading={isSearching}
                        />
                    </div>
                </CollapsibleSection>
            )}
        </div>
    );
}
