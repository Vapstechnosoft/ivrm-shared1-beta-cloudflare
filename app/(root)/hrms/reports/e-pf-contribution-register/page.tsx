'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider } from '@/components/ui/form/form-provider';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLeaveYearDropdown } from '@/hooks/hrms/useMasters';
import { useReportDepartments, useReportDesignations, useReportGroupTypes, useSearchEmployeeContribution } from '@/hooks/hrms/useReports';
import { exportToExcel } from '@/lib/export-to-file';
import { format } from 'date-fns';
import { Loader2, Printer, Search, X } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

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

interface FilterFormValues {
    year: string;
    month: string;
    groupType: string[];
    department: string[];
    designation: string[];
    formatType: string;
}

export default function EmployeeContributionReportPage() {
    return (
        <FormProvider>
            <EmployeeContributionContent />
        </FormProvider>
    );
}

function EmployeeContributionContent() {
    const [reportData, setReportData] = useState<any>(null);
    const [selectedYearStr, setSelectedYearStr] = useState('');
    const [selectedMonthStr, setSelectedMonthStr] = useState('');
    const [resetKey, setResetKey] = useState(0);

    const { control, handleSubmit, watch, setValue, reset } = useForm<FilterFormValues>({
        defaultValues: {
            year: '',
            month: '',
            groupType: [],
            department: [],
            designation: [],
            formatType: 'Overall'
        }
    });

    const handleCancel = () => {
        reset();
        setReportData(null);
        setSelectedYearStr('');
        setSelectedMonthStr('');
        setResetKey((prev) => prev + 1);
    };

    const watchedGroupType = watch('groupType');
    const watchedDepartment = watch('department');

    // Queries - Using global and cascading hooks for reliability
    const { data: yearsData, isLoading: isYearsLoading } = useLeaveYearDropdown();
    const { data: groupTypesData, isLoading: isGroupTypesLoading } = useReportGroupTypes();

    const groupTypeIds = watchedGroupType?.join(',') || '';
    const { data: departmentsData, isLoading: isDepartmentsLoading } = useReportDepartments(groupTypeIds);

    const deptIds = watchedDepartment?.join(',') || '';
    const { data: designationsData, isLoading: isDesignationsLoading } = useReportDesignations(groupTypeIds, deptIds);

    const { mutate: generateReport, isPending } = useSearchEmployeeContribution();

    const onSubmit = (data: FilterFormValues) => {
        if (!data.year || !data.month) {
            toast.error('Please select Year and Month');
            return;
        }

        const selectedYear = yearsData?.data?.find((y: any) => y.hrmlY_Id.toString() === data.year)?.hrmlY_LeaveYear || '';
        setSelectedYearStr(selectedYear);
        setSelectedMonthStr(data.month);

        const payload = {
            hreS_Year: selectedYear,
            hreS_Month: data.month,
            groupTypeselected: data.groupType.map(Number),
            departmentselected: data.department.map(Number),
            designationselected: data.designation.map(Number)
        };

        generateReport(payload, {
            onSuccess: (res) => {
                if (res.success && res.data) {
                    console.log('Report Data', res);
                    setReportData(res.data);
                    toast.success(res.message || 'Report generated successfully');
                } else {
                    toast.error(res.message || 'No data found');
                }
            }
        });
    };

    const handleExport = () => {
        const dataForExport = reportData?.alldata || reportData?.pfreport || (Array.isArray(reportData) ? reportData : []);
        if (!dataForExport || dataForExport.length === 0) {
            toast.error('No data to export');
            return;
        }

        const exportColumns = [
            { label: 'Code', value: 'hrmE_EmployeeCode' },
            { label: 'Employee Name', value: 'empName' },
            { label: 'Father/Husband Name', value: 'fatherHusbandName' },
            { label: 'DOB', value: 'dob' },
            { label: 'Gender', value: 'ivrmmG_GenderName' },
            { label: 'PF Date', value: 'pfDate' },
            { label: 'PF No', value: 'hrmE_PFAccNo' },
            { label: 'ESI No', value: 'hrmE_ESIAccNo' },
            { label: 'Days', value: 'hreS_WorkingDays' },
            { label: 'Basic', value: 'basicvalue' },
            { label: 'DA', value: 'davalue' },
            { label: 'Wages', value: 'amountofWages' },
            { label: 'PF Amount', value: 'pfAmount' },
            { label: 'EPF', value: 'hreS_EPF' },
            { label: 'FPF', value: 'hreS_FPF' },
            { label: 'Ac 21', value: 'hreS_Ac21' },
            { label: 'Ac 22', value: 'hreS_Ac22' },
            { label: 'Ac 5', value: 'hreS_Ac5' }
        ];

        const processedContent = dataForExport.map((row: any) => ({
            ...row,
            empName: `${row.hrmE_EmployeeFirstName || ''} ${row.hrmE_EmployeeMiddleName || ''} ${row.hrmE_EmployeeLastName || ''}`.trim(),
            dob: row.hrmE_DOB ? format(new Date(row.hrmE_DOB), 'dd-MM-yyyy') : '',
            pfDate: row.hrmE_PFDate ? format(new Date(row.hrmE_PFDate), 'dd-MM-yyyy') : '',
            hreS_WorkingDays: row.hreS_WorkingDays || row.hre_WorkingDays || row.HRE_WorkingDays || 0,
            basicvalue: row.basicvalue || 0,
            davalue: row.davalue || 0,
            amountofWages: row.amountofWages || 0,
            pfAmount: row.pfAmount || 0,
            hreS_EPF: row.hreS_EPF || row.hre_EPF || row.HRE_EPF || 0,
            hreS_FPF: row.hreS_FPF || row.hre_FPF || row.HRE_FPF || 0,
            hreS_Ac21: row.hreS_Ac21 || 0,
            hreS_Ac22: row.hreS_Ac22 || 0,
            hreS_Ac5: row.hreS_Ac5 || 0
        }));

        exportToExcel('E_PF_Contribution_Register', JSON.stringify(exportColumns), JSON.stringify(processedContent));
    };

    const records = reportData?.alldata || reportData?.pfreport || [];
    const totalWages = records.reduce((sum: number, r: any) => sum + Number(r.amountofWages || 0), 0);
    const totalEPF = records.reduce((sum: number, r: any) => sum + Number(r.hreS_EPF || 0), 0);
    const totalDiff = records.reduce((sum: number, r: any) => sum + Number(r.hreS_Ac21 || 0), 0);
    const totalPension = records.reduce((sum: number, r: any) => sum + Number(r.hreS_FPF || 0), 0);

    const institution = reportData?.institutionDetails?.[0];
    const estName = institution?.mI_Name || '';
    const estAddress = institution
        ? [
              institution.mI_Address1,
              institution.mI_Address2,
              institution.mI_Address3,
              institution.ivrmmcT_Name ? `${institution.ivrmmcT_Name}` : '',
              institution.mI_Pincode ? `${institution.mI_Pincode}` : ''
          ]
              .filter((val) => val && val.trim() !== '')
              .join(', ')
        : '';

    const handlePrint = () => {
        if (!reportData) {
            toast.error('No data to print');
            return;
        }

        const printWindow = window.open('', '', 'width=1200,height=800');
        if (!printWindow) {
            toast.error('Please allow popups to print the report');
            return;
        }

        const tableRows = records
            .map((record: any, index: number) => {
                const name =
                    `${record.hrmE_EmployeeFirstName || ''} ${record.hrmE_EmployeeMiddleName || ''} ${record.hrmE_EmployeeLastName || ''}`.trim();
                return `
                <tr>
                    <td class="text-center">${index + 1}</td>
                    <td class="text-center font-mono">${record.hrmE_PFAccNo || '-'}</td>
                    <td class="text-center font-mono">${record.hrmE_PFuAN || '-'}</td>
                    <td class="text-left uppercase">${name || '-'}</td>
                    <td class="text-right font-mono">${Number(record.amountofWages || 0).toFixed(2)}</td>
                    <td class="text-right font-mono">${Number(record.pfAmount || 0).toFixed(2)}</td>
                    <td class="text-right font-mono">${Number(record.hreS_EPF || 0).toFixed(2)}</td>
                    <td class="text-right font-mono">${Number(record.hreS_FPF || 0).toFixed(2)}</td>
                    <td class="text-center font-mono">${0}</td>
                    <td class="text-center font-mono">${record.hreS_WorkingDays || 0}</td>
                </tr>
            `;
            })
            .join('');

        printWindow.document.write(`
            <html>
            <head>
                <title>EPF Contribution Register</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        padding: 20px; 
                        font-size: 12px;
                        color: #000;
                    }
                    .text-center { text-align: center; }
                    .text-right { text-align: right; }
                    .text-left { text-align: left; }
                    .font-bold { font-weight: bold; }
                    .uppercase { text-transform: uppercase; }
                    .font-mono { font-family: monospace; }
                    
                    .header-details {
                        font-size: 13px;
                        font-weight: bold;
                        color: #1e3a8a;
                        margin-bottom: 20px;
                        line-height: 1.6;
                    }
                    
                    .report-title {
                        text-align: center;
                        font-size: 15px;
                        font-weight: bold;
                        color: #1e3a8a;
                        margin-bottom: 20px;
                        letter-spacing: 0.5px;
                    }
                    
                    table.data-table { 
                        width: 100%; 
                        border-collapse: collapse; 
                        margin-top: 10px;
                        margin-bottom: 20px;
                        font-size: 11px;
                    }
                    table.data-table th, table.data-table td { 
                        border: 1px solid #000; 
                        padding: 6px 8px; 
                    }
                    table.data-table th { 
                        background-color: #f9fafb; 
                        font-weight: bold;
                    }
                    
                    @media print {
                        body { margin: 0; padding: 10px; }
                    }
                </style>
            </head>
            <body>
                <div class="header-details">
                    <div>NAME OF ESTABLISHMENT: ${estName || ''}</div>
                    <div>ADDRESS OF ESTABLISHMENT: ${estAddress || ''}</div>
                    <div>FOR THE MONTH OF ${(selectedMonthStr || '').toUpperCase()} - ${selectedYearStr}</div>
                </div>

                

                <table class="data-table">
                    <thead>
                        <tr>
                            <th class="text-center">Sl.No</th>
                            <th class="text-center">A/c No.</th>
                            <th class="text-center">UAN No.</th>
                            <th class="text-left">Name</th>
                            <th class="text-right">Amount of Wages</th>
                            <th class="text-right">E.P.F</th>
                            <th class="text-right">Diff Bet.10/12 %</th>
                            <th class="text-right">Pension Fund 8.33%</th>
                            <th class="text-center">NCP Days</th>
                            <th class="text-center">Total Working Days</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                        <tr class="font-bold" style="background-color: #f9fafb;">
                            <td colspan="4" class="text-center">Total</td>
                            <td class="text-right font-mono">${totalWages.toFixed(2)}</td>
                            <td class="text-right font-mono">${totalEPF.toFixed(2)}</td>
                            <td class="text-right font-mono">${totalDiff.toFixed(2)}</td>
                            <td class="text-right font-mono">${totalPension.toFixed(2)}</td>
                            <td></td>
                            <td></td>
                        </tr>
                    </tbody>
                </table>
            </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
        }, 250);
    };

    return (
        <div className='container min-h-screen space-y-4 p-2'>
            <CollapsibleSection defaultOpen={true} title='Report Criteria' variant='outline' className='shadow-sm'>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                    <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
                        <div className='space-y-2'>
                            <Label>
                                Year <span className='text-destructive'>*</span>
                            </Label>
                            <Controller
                                name='year'
                                control={control}
                                key={resetKey}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value} disabled={isYearsLoading}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={isYearsLoading ? 'Loading...' : 'Select Year'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {yearsData?.data?.map((y: any) => (
                                                <SelectItem key={y.hrmlY_Id} value={y.hrmlY_Id.toString()}>
                                                    {y.hrmlY_LeaveYear}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

                        <div className='space-y-2'>
                            <Label>
                                Month <span className='text-destructive'>*</span>
                            </Label>
                            <Controller
                                name='month'
                                control={control}
                                key={resetKey}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value} disabled={isYearsLoading}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={isYearsLoading ? 'Loading...' : 'Select Month'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {MONTH_LIST.map((m: any) => (
                                                <SelectItem key={m.id} value={m.name}>
                                                    {m.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

                        <div className='space-y-2'>
                            <Label>Group Type</Label>
                            <Controller
                                name='groupType'
                                control={control}
                                render={({ field }) => (
                                    <MultiSelect
                                        options={
                                            groupTypesData?.data?.map((gt: any) => ({
                                                label: gt.value,
                                                value: gt.key.toString()
                                            })) || []
                                        }
                                        defaultValue={field.value}
                                        onValueChange={(vals) => {
                                            field.onChange(vals);
                                            setValue('department', []);
                                            setValue('designation', []);
                                        }}
                                        placeholder={isGroupTypesLoading ? 'Loading...' : 'Select Group Types'}
                                        disabled={isGroupTypesLoading}
                                    />
                                )}
                            />
                        </div>

                        <div className='space-y-2'>
                            <Label>Department</Label>
                            <Controller
                                name='department'
                                control={control}
                                render={({ field }) => (
                                    <MultiSelect
                                        options={
                                            departmentsData?.data?.map((d: any) => ({
                                                label: d.hrmD_DepartmentName,
                                                value: d.hrmD_Id.toString()
                                            })) || []
                                        }
                                        defaultValue={field.value}
                                        onValueChange={(vals) => {
                                            field.onChange(vals);
                                            setValue('designation', []);
                                        }}
                                        placeholder={isDepartmentsLoading ? 'Loading...' : 'Select Departments'}
                                        disabled={!watchedGroupType.length || isDepartmentsLoading}
                                    />
                                )}
                            />
                        </div>

                        <div className='space-y-2'>
                            <Label>Designation</Label>
                            <Controller
                                name='designation'
                                control={control}
                                render={({ field }) => (
                                    <MultiSelect
                                        options={
                                            designationsData?.data?.map((d: any) => ({
                                                label: d.hrmdeS_DesignationName,
                                                value: d.hrmdeS_Id.toString()
                                            })) || []
                                        }
                                        defaultValue={field.value}
                                        onValueChange={field.onChange}
                                        placeholder={isDesignationsLoading ? 'Loading...' : 'Select Designations'}
                                        disabled={!watchedDepartment.length || isDesignationsLoading}
                                    />
                                )}
                            />
                        </div>
                    </div>

                    <div className='flex justify-end gap-2'>
                        <Button
                            type='button'
                            variant='outline'
                            onClick={handleCancel}
                            className='w-32 rounded-xl border-orange-500 text-orange-600 transition-all hover:bg-orange-50'>
                            <X className='mr-2 h-4 w-4' />
                            CANCEL
                        </Button>
                        <Button type='submit' disabled={isPending} className='w-32 rounded-xl transition-all'>
                            {isPending ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Search className='mr-2 h-4 w-4' />}
                            Generate
                        </Button>
                    </div>
                </form>
            </CollapsibleSection>

            {reportData && (
                <CollapsibleSection
                    title='EPF CONTRIBUTION REGISTER'
                    defaultOpen={true}
                    className='border shadow-md'
                    // rightElement={
                    //     <div className='flex gap-2'>
                    //         <Button variant='outline' size='sm' onClick={handleExport} className='gap-2'>
                    //             <Download className='h-4 w-4' />
                    //             Export
                    //         </Button>
                    //     </div>
                    // }
                >
                    <div className='space-y-4 rounded-md border border-gray-300 bg-white p-6 font-sans text-black shadow-sm'>
                        <div className='space-y-1 font-bold text-blue-900 text-sm uppercase'>
                            <div>NAME OF ESTABLISHMENT: {estName || '-'}</div>
                            <div>ADDRESS OF ESTABLISHMENT: {estAddress || '-'}</div>
                            <div>
                                FOR THE MONTH OF {(selectedMonthStr || '').toUpperCase()} - {selectedYearStr}
                            </div>
                        </div>

                        <div className='py-2 text-center font-bold text-blue-900 text-lg uppercase tracking-wide'>
                            EPF CONTRIBUTION REPORT
                        </div>

                        <div className='overflow-x-auto'>
                            <table className='w-full border-collapse border border-gray-400 font-semibold text-xs'>
                                <thead>
                                    <tr className='bg-gray-100 text-blue-900'>
                                        <th className='border border-gray-400 p-2 text-center'>Sl.No</th>
                                        <th className='border border-gray-400 p-2 text-center'>A/c No.</th>
                                        <th className='border border-gray-400 p-2 text-center'>UAN No.</th>
                                        <th className='border border-gray-400 p-2 text-left'>Name</th>
                                        <th className='border border-gray-400 p-2 text-right'>Amount of Wages</th>
                                        <th className='border border-gray-400 p-2 text-right'>E.P.F</th>
                                        <th className='border border-gray-400 p-2 text-right'>Diff Bet.10/12 %</th>
                                        <th className='border border-gray-400 p-2 text-right'>Pension Fund 8.33%</th>
                                        <th className='border border-gray-400 p-2 text-center'>NCP Days</th>
                                        <th className='border border-gray-400 p-2 text-center'>Total Working Days</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {records.length === 0 ? (
                                        <tr>
                                            <td colSpan={10} className='border border-gray-400 p-8 text-center font-medium text-gray-500'>
                                                No records found
                                            </td>
                                        </tr>
                                    ) : (
                                        <>
                                            {records.map((record: any, index: number) => {
                                                const name =
                                                    `${record.hrmE_EmployeeFirstName || ''} ${record.hrmE_EmployeeMiddleName || ''} ${record.hrmE_EmployeeLastName || ''}`.trim();
                                                return (
                                                    <tr key={index} className='text-gray-800 hover:bg-gray-50'>
                                                        <td className='border border-gray-400 p-2 text-center'>{index + 1}</td>
                                                        <td className='border border-gray-400 p-2 text-center font-mono'>
                                                            {record.hrmE_PFAccNo || '-'}
                                                        </td>
                                                        <td className='border border-gray-400 p-2 text-center font-mono'>
                                                            {record.hrmE_PFuAN || '-'}
                                                        </td>
                                                        <td className='border border-gray-400 p-2 text-left uppercase'>{name || '-'}</td>
                                                        <td className='border border-gray-400 p-2 text-right font-mono'>
                                                            {Number(record.amountofWages || 0).toFixed(2)}
                                                        </td>
                                                        <td className='border border-gray-400 p-2 text-right font-mono'>
                                                            {Number(record.pfAmount || 0).toFixed(2)}
                                                        </td>
                                                        <td className='border border-gray-400 p-2 text-right font-mono'>
                                                            {Number(record.hreS_EPF || 0).toFixed(2)}
                                                        </td>
                                                        <td className='border border-gray-400 p-2 text-right font-mono'>
                                                            {Number(record.hreS_FPF || 0).toFixed(2)}
                                                        </td>
                                                        <td className='border border-gray-400 p-2 text-center font-mono'>{0}</td>
                                                        <td className='border border-gray-400 p-2 text-center font-mono'>
                                                            {record.hreS_WorkingDays || 0}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            <tr className='bg-gray-50 font-bold text-gray-900'>
                                                <td colSpan={4} className='border border-gray-400 p-2 text-center'>
                                                    Total
                                                </td>
                                                <td className='border border-gray-400 p-2 text-right font-mono'>{totalWages.toFixed(2)}</td>
                                                <td className='border border-gray-400 p-2 text-right font-mono'>{totalEPF.toFixed(2)}</td>
                                                <td className='border border-gray-400 p-2 text-right font-mono'>{totalDiff.toFixed(2)}</td>
                                                <td className='border border-gray-400 p-2 text-right font-mono'>
                                                    {totalPension.toFixed(2)}
                                                </td>
                                                <td className='border border-gray-400 p-2 text-center'></td>
                                                <td className='border border-gray-400 p-2 text-center'></td>
                                            </tr>
                                        </>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className='mt-6 flex justify-center gap-4 print:hidden'>
                        <Button
                            type='button'
                            onClick={handlePrint}
                            className='flex w-32 items-center justify-center gap-2 rounded-md text-white transition-colors'>
                            <Printer className='h-4 w-4' />
                            PRINT
                        </Button>
                        <Button
                            type='button'
                            variant='outline'
                            onClick={handleCancel}
                            className='w-32 rounded-xl border-orange-500 text-orange-600 transition-all hover:bg-orange-50'>
                            <X className='mr-2 h-4 w-4' />
                            CANCEL
                        </Button>
                    </div>
                </CollapsibleSection>
            )}
        </div>
    );
}
