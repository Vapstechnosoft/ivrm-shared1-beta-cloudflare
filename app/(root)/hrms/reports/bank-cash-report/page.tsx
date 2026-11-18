'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { FormError, Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { MultiSelect } from '@/components/ui/multi-select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLeaveYearDropdown } from '@/hooks/hrms/useMasters';
import { useBankCashReport, useReportDepartments, useReportDesignations, useReportGroupTypes } from '@/hooks/hrms/useReports';
import { exportToExcel } from '@/lib/export-to-file';
import { getMasterInstitution } from '@/server/hrms/master-dropdown';
import { zodResolver } from '@hookform/resolvers/zod';
import { Download, Loader2, Printer, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { printBankCashReport } from './_components/print-bank-cash-report';

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

const BankCashReportSchema = z.object({
    groupType: z.array(z.string()).min(1, 'Group type is required'),
    department: z.array(z.string()).min(1, 'Department is required'),
    designation: z.array(z.string()).min(1, 'Designation is required'),
    month: z.string().min(1, 'Month is required'),
    year: z.string().min(1, 'Year is required'),
    bankCash: z.enum(['Bank', 'Cash'])
});

type FormFields = z.infer<typeof BankCashReportSchema>;

export default function BankCashReportPage() {
    const [reportData, setReportData] = useState<any[]>([]);
    const [institution, setInstitution] = useState<any>(null);
    const [selectedPaymentType, setSelectedPaymentType] = useState<string>('Bank');
    const [resetKey, setResetKey] = useState(0);
    const {
        control,
        handleSubmit,
        watch,
        reset,
        formState: { errors }
    } = useForm<FormFields>({
        resolver: zodResolver(BankCashReportSchema),
        defaultValues: {
            groupType: [],
            department: [],
            designation: [],
            month: '',
            year: '',
            bankCash: 'Bank'
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

    const { mutate: generateReport, isPending: isSearching } = useBankCashReport();

    const onSearch = (data: FormFields) => {
        const selectedYearObj = (yearsData?.data || []).find((y: any) => y && String(y.hrmlY_Id ?? '') === String(data.year ?? ''));
        const yearInt = Number.parseInt(selectedYearObj?.hrmlY_LeaveYear?.split('-')[0] || String(data.year ?? '0'));
        const monthName = MONTH_LIST.find((m) => m && String(m.id ?? '') === String(data.month ?? ''))?.name || '';

        setSelectedPaymentType(data.bankCash);

        generateReport(
            {
                hreS_Year: yearInt,
                hreS_Month: monthName,
                bankCash: data.bankCash,
                hrmd_ids: (data.department || []).map(Number),
                hrmgt_ids: (data.groupType || []).map(Number),
                hrmdes_ids: (data.designation || []).map(Number)
            },
            {
                onSuccess: (res) => {
                    if (res.success && res.data) {
                        setReportData((res.data || []).filter(Boolean));
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

        printBankCashReport(reportData, institution, monthName, yearStr, selectedPaymentType);
    };

    const handleExport = () => {
        if (reportData.length === 0) {
            toast.error('No data to export');
            return;
        }

        const exportColumns = [
            { label: 'Sl.No', value: 'slNo' },
            { label: 'Employee Name', value: 'employeeName' },
            ...(selectedPaymentType === 'Bank'
                ? [
                      { label: 'Bank A/C Number', value: 'bankAcNumber' },
                      { label: 'IFSC Code', value: 'hrmbD_IFSCCode' },
                      { label: 'Bank Name', value: 'hrmbD_BankName' },
                      { label: 'Branch Name', value: 'hrmbD_BranchName' }
                  ]
                : []),
            { label: 'Net Salary', value: 'netSalary' }
        ];

        const exportData = reportData.map((item, index) => ({
            slNo: index + 1,
            employeeName: item?.employeeName || '',
            bankAcNumber: item?.bankAcNumber || '',
            hrmbD_IFSCCode: item?.hrmbD_IFSCCode || '',
            hrmbD_BankName: item?.hrmbD_BankName || '',
            hrmbD_BranchName: item?.hrmbD_BranchName || '',
            netSalary: item?.netSalary || 0
        }));

        exportToExcel('BankCashReport', JSON.stringify(exportColumns), JSON.stringify(exportData));
    };

    const columns = [
        {
            id: 'slNo',
            header: 'Sl.No',
            cell: ({ row }: any) => row.index + 1
        },
        {
            accessorKey: 'employeeName',
            header: 'Employee Name'
        },
        ...(selectedPaymentType === 'Bank'
            ? [
                  {
                      accessorKey: 'bankAcNumber',
                      header: 'Bank A/C Number'
                  },
                  {
                      accessorKey: 'hrmbD_IFSCCode',
                      header: 'IFSC Code'
                  },
                  {
                      accessorKey: 'hrmbD_BankName',
                      header: 'Bank Name'
                  },
                  {
                      accessorKey: 'hrmbD_BranchName',
                      header: 'Branch Name'
                  }
              ]
            : []),
        {
            accessorKey: 'netSalary',
            header: 'Net Salary',
            cell: ({ row }: any) =>
                `₹${(row.original.netSalary || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        }
    ];

 const totalNetSalary = reportData.reduce((sum, item) => sum + (item?.netSalary || 0), 0);
    return (
        <div className='container min-h-screen space-y-4 p-2'>
            {/* <div className='flex items-center justify-between'>
                <h2 className='font-bold text-2xl tracking-tight'>Bank / Cash Report</h2>
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

                        <div className='space-y-2'>
                            <Label>
                                Bank / Cash <span className='text-destructive'>*</span>
                            </Label>
                            <Controller
                                name='bankCash'
                                control={control}
                                render={({ field }) => (
                                    <RadioGroup onValueChange={field.onChange} value={field.value} className='flex gap-4 pt-2'>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='Bank' id='bank' />
                                            <Label htmlFor='bank' className='cursor-pointer'>
                                                Bank
                                            </Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='Cash' id='cash' />
                                            <Label htmlFor='cash' className='cursor-pointer'>
                                                Cash
                                            </Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='Check' id='check' />
                                            <Label htmlFor='check' className='cursor-pointer'>
                                                Check
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                )}
                            />
                            {errors.bankCash && <FormError>{errors.bankCash.message}</FormError>}
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
                            <p className='font-semibold'>
                                BANK / CASH REPORT FOR{' '}
                                {(MONTH_LIST.find((m) => String(m.id ?? '') === watch('month'))?.name || '').toUpperCase()}{' '}
                                {yearsData?.data?.find((y: any) => String(y.hrmlY_Id ?? '') === watch('year'))?.hrmlY_LeaveYear}
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

                        <div className='flex justify-end pr-8'>
                            <div className='font-bold text-lg'>
                                Total Net Salary: ₹
                                {totalNetSalary.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                        </div>
                    </div>
                </CollapsibleSection>
            )}
        </div>
    );
}
