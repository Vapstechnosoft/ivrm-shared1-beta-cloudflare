'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Input } from '@/components/ui/input';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLeaveYearDropdown } from '@/hooks/hrms/useMasters';
import { useMonthEndReport, useReportDepartments, useReportDesignations, useReportGroupTypes } from '@/hooks/hrms/useReports';
import { getMasterInstitution } from '@/server/hrms/master-dropdown';
import type { Institution } from '@/types/exam/exam-module/report';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Loader2, Printer, Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { toast } from 'sonner';
import * as z from 'zod';

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

const MonthEndReportSchema = z.object({
    groupType: z.array(z.string()).min(1, 'Group type is required'),
    department: z.array(z.string()).min(1, 'Department is required'),
    designation: z.array(z.string()).min(1, 'Designation is required'),
    month: z.string().min(1, 'Month is required'),
    year: z.string().min(1, 'Year is required'),
    ieName: z.string().min(1, 'IE Name is required')
});

type FormFields = z.infer<typeof MonthEndReportSchema>;

export default function HRMSMonthEndReportPage() {
    const [reportData, setReportData] = useState<any>(null);
    const [selectedFilters, setSelectedFilters] = useState<any>({});
    const [institution, setInstitution] = useState<Institution | null>(null);
    const [resetKey, setResetKey] = useState(0);
    const printRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<HTMLDivElement>(null);

    const {
        control,
        handleSubmit,
        watch,
        reset,
        formState: { errors }
    } = useForm<FormFields>({
        resolver: zodResolver(MonthEndReportSchema),
        defaultValues: {
            groupType: [],
            department: [],
            designation: [],
            month: '',
            year: '',
            ieName: ''
        }
    });

    useEffect(() => {
        const fetchInstitution = async () => {
            try {
                const res = await getMasterInstitution();
                if (res.success && res.data) {
                    setInstitution(res.data);
                }
            } catch (error) {
                console.error('Failed to fetch institution details', error);
            }
        };
        fetchInstitution();
    }, []);

    const watchedGroupTypes = watch('groupType');
    const watchedDepartments = watch('department');

    const { data: groupTypesData, isLoading: groupTypesLoading } = useReportGroupTypes();
    const { data: departmentsData, isLoading: departmentsLoading } = useReportDepartments(
        (Array.isArray(watchedGroupTypes) ? watchedGroupTypes : []).join(',')
    );
    const { data: designationsData, isLoading: designationsLoading } = useReportDesignations(
        (Array.isArray(watchedGroupTypes) ? watchedGroupTypes : []).join(','),
        (Array.isArray(watchedDepartments) ? watchedDepartments : []).join(',')
    );
    const { data: yearsData, isLoading: yearsLoading } = useLeaveYearDropdown();

    const { mutate: generateReport, isPending: isSearching } = useMonthEndReport();

    const onSearch = (data: FormFields) => {
        const selectedYearObj = (yearsData?.data || []).find((y: any) => y && String(y.hrmlY_Id ?? '') === String(data.year ?? ''));
        const yearStr = selectedYearObj?.hrmlY_LeaveYear || String(data.year ?? '0');

        setSelectedFilters({
            month: data.month,
            year: yearStr,
            ieName: data.ieName
        });

        generateReport(
            {
                hreS_Year: Number(yearStr),
                hreS_Month: data.month,
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
                        setReportData(null);
                    }
                }
            }
        );
    };

    const handleReset = () => {
        reset();
        setReportData(null);
        setResetKey((prev) => prev + 1);
    };

    const handlePrint = () => {
        if (!reportData) return;

        const popupWin = window.open('', '_blank', 'width=1000,height=1000');
        if (popupWin) {
            popupWin.document.open();
            popupWin.document.write(`
                <html>
                    <head>
                        <title>HRMS Month End Report</title>
                        <style>
                            body { font-family: 'Times New Roman', serif; padding: 20px; color: black; }
                            .header { text-align: center; margin-bottom: 20px; }
                            .institution-name { font-size: 24px; font-weight: bold; text-transform: uppercase; margin: 0; }
                            .report-title { font-size: 18px; font-weight: bold; text-decoration: underline; text-transform: uppercase; margin: 10px 0; }
                            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                            th, td { border: 1px solid #444; padding: 8px; text-align: left; font-size: 14px; }
                            .text-center { text-align: center; }
                            .bg-gray { background-color: #f3f4f6; }
                            .font-bold { font-weight: bold; }
                            .uppercase { text-transform: uppercase; }
                            .footer { margin-top: 50px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
                            .footer-item { border-bottom: 1px solid black; min-height: 20px; flex: 1; }
                            .chart-container { margin-top: 30px; text-align: center; }
                            @page { size: auto; margin: 0; }
                            @media print {
                                body { padding: 40px; }
                                .no-print { display: none; }
                            }
                        </style>
                    </head>
                    <body onload="setTimeout(function(){ window.print(); window.close(); }, 500);">
                        <div class="header">
                            ${institution?.mI_Logo ? `<img src="${institution.mI_Logo}" style="max-height: 80px; margin-bottom: 10px;" />` : ''}
                            <h1 class="institution-name">${institution?.mI_Name || ''}</h1>
                            <div class="report-title">HRMS Month End Report of ${selectedFilters.month} - ${selectedFilters.year}</div>
                        </div>

                        <table>
                            <thead>
                                <tr>
                                    <th class="bg-gray text-center uppercase" colspan="2">${selectedFilters.month} Month Report</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td class="bg-gray font-bold" style="width: 30%;">Name</td>
                                    <td>${selectedFilters.ieName}</td>
                                </tr>
                                <tr>
                                    <td class="bg-gray font-bold">Date</td>
                                    <td>${format(new Date(), 'dd-MM-yyyy')}</td>
                                </tr>
                                <tr>
                                    <td class="bg-gray font-bold">Designation</td>
                                    <td>Implementation Engineer</td>
                                </tr>
                                <tr>
                                    <td class="bg-gray font-bold">Module Name</td>
                                    <td>HRMS</td>
                                </tr>
                            </tbody>
                        </table>

                        <table style="margin-top: 30px;">
                            <thead>
                                <tr class="bg-gray text-center font-bold">
                                    <th rowspan="2">Sno</th>
                                    <th rowspan="2">Description</th>
                                    <th rowspan="2">Count</th>
                                    <th rowspan="2">SMS</th>
                                    <th rowspan="2">Email</th>
                                    <th colspan="3">Missing Details</th>
                                </tr>
                                <tr class="bg-gray text-center font-bold text-xs">
                                    <th>Photo</th>
                                    <th>Email-ID</th>
                                    <th>Contact Number</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr class="text-center">
                                    <td>1</td>
                                    <td style="text-align: left;">Working Employee</td>
                                    <td>${reportData.workingEmployeeCount}</td>
                                    <td></td>
                                    <td></td>
                                    <td>${reportData.missingPhotoWorking}</td>
                                    <td>${reportData.missingEmailWorking}</td>
                                    <td>${reportData.missingMobileWorking}</td>
                                </tr>
                                <tr class="text-center">
                                    <td>2</td>
                                    <td style="text-align: left;">Left Employee</td>
                                    <td>${reportData.leftEmployeeCount}</td>
                                    <td></td>
                                    <td></td>
                                    <td>${reportData.missingPhotoLeft}</td>
                                    <td>${reportData.missingEmailLeft}</td>
                                    <td>${reportData.missingMobileLeft}</td>
                                </tr>
                                <tr class="text-center">
                                    <td>3</td>
                                    <td style="text-align: left;">Salary Generated</td>
                                    <td>${reportData.salaryGenerated}</td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                </tr>
                                <tr class="text-center">
                                    <td>4</td>
                                    <td style="text-align: left;">Salary Slip</td>
                                    <td>${reportData.salarySlipGenerated}</td>
                                    <td>${reportData.smsCount}</td>
                                    <td>${reportData.emailCount}</td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                </tr>
                                <tr class="text-center">
                                    <td>5</td>
                                    <td style="text-align: left;">New Employee</td>
                                    <td>${reportData.newEmployeeCount}</td>
                                    <td></td>
                                    <td></td>
                                    <td>${reportData.missingPhotoNew}</td>
                                    <td>${reportData.missingEmailNew}</td>
                                    <td>${reportData.missingMobileNew}</td>
                                </tr>
                            </tbody>
                        </table>

                        <div class="footer">
                            <div style="display: flex; flex-direction: column; gap: 40px;">
                                <div style="display: flex; gap: 10px; align-items: flex-end;">
                                    <span>Implementation Engineer:</span>
                                    <div class="footer-item"></div>
                                </div>
                                <div style="display: flex; gap: 10px; align-items: flex-end;">
                                    <span>Nodal Officer:</span>
                                    <div class="footer-item"></div>
                                </div>
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 40px;">
                                <div style="display: flex; gap: 10px; align-items: flex-end;">
                                    <span>End User Signature:</span>
                                    <div class="footer-item"></div>
                                </div>
                                <div style="display: flex; gap: 10px; align-items: flex-end;">
                                    <span>With Seal:</span>
                                    <div class="footer-item"></div>
                                </div>
                            </div>
                        </div>

                        <div class="chart-container" style="padding-top: 20px;">
                            <h3 class="uppercase" style="font-size: 16px; margin-bottom: 20px;">HRMS Month End Report Chart</h3>
                            <div style="width: 100%; border: 1px solid #ddd; padding: 20px;">
                                ${chartRef.current ? chartRef.current.innerHTML : ''}
                            </div>
                        </div>
                    </body>
                </html>
            `);
            popupWin.document.close();
        }
    };

    const chartData = reportData
        ? [
              { name: 'workingEmployee', count: reportData.workingEmployeeCount || 0, color: '#36a2b5' },
              { name: 'leftEmployee', count: reportData.leftEmployeeCount || 0, color: '#be4a41' },
              { name: 'newEmployee', count: reportData.newEmployeeCount || 0, color: '#cccccc' },
              { name: 'salaryGenerated', count: reportData.salaryGenerated || 0, color: '#94bc02' },
              { name: 'salaryslipGenerated', count: reportData.salarySlipGenerated || 0, color: '#a8d4d4' }
          ]
        : [];

    return (
        <div className='container mx-auto min-h-screen max-w-7xl space-y-6 p-4'>
            {/* <div className='flex items-center justify-between print:hidden'>
                <h2 className='text-3xl font-bold tracking-tight'>HRMS Month End Report</h2>
            </div> */}

            <CollapsibleSection
                title='Report Criteria'
                defaultOpen={true}
                variant='outline'
                className='border-primary/20 bg-card/50 shadow-md backdrop-blur-sm print:hidden'>
                <form onSubmit={handleSubmit(onSearch)} className='space-y-6'>
                    <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
                        <div className='space-y-2'>
                            <Label>
                                Group Type <span className='text-destructive'>*</span>
                            </Label>
                            <Controller
                                key={resetKey}
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
                                        // disabled={groupTypesLoading}
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
                                key={resetKey}
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
                                key={resetKey}
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
                                    <Select onValueChange={field.onChange} value={field.value} disabled={yearsLoading}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={yearsLoading ? 'Loading...' : 'Select Year'} />
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
                                    <Select onValueChange={field.onChange} value={field.value} disabled={yearsLoading}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={yearsLoading ? 'Loading...' : 'Select Month'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {MONTH_LIST.map((m) => (
                                                <SelectItem key={m.id} value={m.name}>
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
                                IE Name <span className='text-destructive'>*</span>
                            </Label>
                            <Controller
                                key={resetKey}
                                name='ieName'
                                control={control}
                                render={({ field }) => <Input {...field} placeholder='Enter IE Name' maxLength={30} />}
                            />
                            {errors.ieName && <FormError>{errors.ieName.message}</FormError>}
                        </div>
                    </div>

                    <div className='flex justify-center gap-3'>
                        <Button
                            type='submit'
                            disabled={isSearching}
                            className='bg-primary shadow-md transition-all duration-200 hover:bg-primary/90'>
                            {isSearching ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Search className='mr-2 h-4 w-4' />}
                            Search
                        </Button>
                        <Button type='button' variant='outline' onClick={handleReset}>
                            <X className='mr-2 h-4 w-4' />
                            Cancel
                        </Button>
                    </div>
                </form>
            </CollapsibleSection>

            {reportData && (
                <CollapsibleSection title='HRMS MonthEnd Report' defaultOpen={true}>
                    <div className='mb-4 flex justify-end gap-3 print:hidden'>
                        <Button variant='default' onClick={handlePrint} className='w-40 gap-2 transition-transform hover:scale-105'>
                            <Printer className='h-4 w-4' />
                            Print
                        </Button>
                        <Button variant='outline' onClick={() => setReportData(null)} className='w-fit gap-2'>
                            <X className='h-4 w-4' />
                            Close Report
                        </Button>
                    </div>
                    <div className='fade-in animate-in space-y-6 duration-500'>
                        {/* Print Preview Header (Only visible on screen, matching legacy feel) */}

                        {/* Printable Report Content */}
                        <div ref={printRef} className='overflow-x-auto rounded-lg border bg-white p-6 text-black shadow-sm '>
                            <div className='space-y-4'>
                                {/* Institution Logo & Name */}
                                <div className='flex justify-center'>
                                    {institution?.mI_Logo && (
                                        <img
                                            src={institution.mI_Logo}
                                            alt='Institution Logo'
                                            className='mb-2 max-h-[200px] object-contain'
                                        />
                                    )}
                                </div>

                                <h2 className='mb-4 text-center font-bold text-xl uppercase underline'>
                                    HRMS Month End Report of {selectedFilters.month} - {selectedFilters.year}
                                </h2>

                                <table className='mb-6 w-full border-collapse border border-gray-400'>
                                    <thead>
                                        <tr>
                                            <th className='border border-gray-400 bg-gray-50 p-2 text-center uppercase' colSpan={2}>
                                                {selectedFilters.month} Month Report
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className='w-1/3 border border-gray-400 bg-gray-50 p-2 text-left font-bold'>Name</td>
                                            <td className='border border-gray-400 p-2 text-left'>{selectedFilters.ieName}</td>
                                        </tr>
                                        <tr>
                                            <td className='border border-gray-400 bg-gray-50 p-2 text-left font-bold'>Date</td>
                                            <td className='border border-gray-400 p-2 text-left'>{format(new Date(), 'dd-MM-yyyy')}</td>
                                        </tr>
                                        <tr>
                                            <td className='border border-gray-400 bg-gray-50 p-2 text-left font-bold'>Designation</td>
                                            <td className='border border-gray-400 p-2 text-left'>Implementation Engineer</td>
                                        </tr>
                                        <tr>
                                            <td className='border border-gray-400 bg-gray-50 p-2 text-left font-bold'>Module Name</td>
                                            <td className='border border-gray-400 p-2 text-left'>HRMS</td>
                                        </tr>
                                    </tbody>
                                </table>

                                <table className='mt-6 w-full border-collapse border border-gray-400'>
                                    <thead>
                                        <tr className='bg-gray-100'>
                                            <th className='border border-gray-400 p-2' rowSpan={2}>
                                                Sno
                                            </th>
                                            <th className='border border-gray-400 p-2' rowSpan={2}>
                                                Description
                                            </th>
                                            <th className='border border-gray-400 p-2' rowSpan={2}>
                                                Count
                                            </th>
                                            <th className='border border-gray-400 p-2' rowSpan={2}>
                                                SMS
                                            </th>
                                            <th className='border border-gray-400 p-2' rowSpan={2}>
                                                Email
                                            </th>
                                            <th className='border border-gray-400 p-2 text-center font-bold' colSpan={3}>
                                                Missing Details
                                            </th>
                                        </tr>
                                        <tr className='bg-gray-100'>
                                            <th className='border border-gray-400 p-1 text-sm'>Photo</th>
                                            <th className='border border-gray-400 p-1 text-sm'>Email-ID</th>
                                            <th className='border border-gray-400 p-1 text-sm'>Contact Number</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className='text-center'>
                                            <td className='border border-gray-400 p-2'>1</td>
                                            <td className='border border-gray-400 p-2 text-left'>Working Employee</td>
                                            <td className='border border-gray-400 p-2'>{reportData.workingEmployeeCount}</td>
                                            <td className='border border-gray-400 p-2'>&nbsp;</td>
                                            <td className='border border-gray-400 p-2'>&nbsp;</td>
                                            <td className='border border-gray-400 p-2'>{reportData.missingPhotoWorking}</td>
                                            <td className='border border-gray-400 p-2'>{reportData.missingEmailWorking}</td>
                                            <td className='border border-gray-400 p-2'>{reportData.missingMobileWorking}</td>
                                        </tr>
                                        <tr className='text-center'>
                                            <td className='border border-gray-400 p-2'>2</td>
                                            <td className='border border-gray-400 p-2 text-left'>Left Employee</td>
                                            <td className='border border-gray-400 p-2'>{reportData.leftEmployeeCount}</td>
                                            <td className='border border-gray-400 p-2'>&nbsp;</td>
                                            <td className='border border-gray-400 p-2'>&nbsp;</td>
                                            <td className='border border-gray-400 p-2'>{reportData.missingPhotoLeft}</td>
                                            <td className='border border-gray-400 p-2'>{reportData.missingEmailLeft}</td>
                                            <td className='border border-gray-400 p-2'>{reportData.missingMobileLeft}</td>
                                        </tr>
                                        <tr className='text-center'>
                                            <td className='border border-gray-400 p-2'>3</td>
                                            <td className='border border-gray-400 p-2 text-left'>Salary Generated</td>
                                            <td className='border border-gray-400 p-2'>{reportData.salaryGenerated}</td>
                                            <td className='border border-gray-400 p-2'>&nbsp;</td>
                                            <td className='border border-gray-400 p-2'>&nbsp;</td>
                                            <td className='border border-gray-400 p-2'>&nbsp;</td>
                                            <td className='border border-gray-400 p-2'>&nbsp;</td>
                                            <td className='border border-gray-400 p-2'>&nbsp;</td>
                                        </tr>
                                        <tr className='text-center'>
                                            <td className='border border-gray-400 p-2'>4</td>
                                            <td className='border border-gray-400 p-2 text-left'>Salary Slip</td>
                                            <td className='border border-gray-400 p-2'>{reportData.salarySlipGenerated}</td>
                                            <td className='border border-gray-400 p-2'>{reportData.smsCount}</td>
                                            <td className='border border-gray-400 p-2'>{reportData.emailCount}</td>
                                            <td className='border border-gray-400 p-2'>&nbsp;</td>
                                            <td className='border border-gray-400 p-2'>&nbsp;</td>
                                            <td className='border border-gray-400 p-2'>&nbsp;</td>
                                        </tr>
                                        <tr className='text-center'>
                                            <td className='border border-gray-400 p-2'>5</td>
                                            <td className='border border-gray-400 p-2 text-left'>New Employee</td>
                                            <td className='border border-gray-400 p-2'>{reportData.newEmployeeCount}</td>
                                            <td className='border border-gray-400 p-2'>&nbsp;</td>
                                            <td className='border border-gray-400 p-2'>&nbsp;</td>
                                            <td className='border border-gray-400 p-2'>{reportData.missingPhotoNew}</td>
                                            <td className='border border-gray-400 p-2'>{reportData.missingEmailNew}</td>
                                            <td className='border border-gray-400 p-2'>{reportData.missingMobileNew}</td>
                                        </tr>
                                    </tbody>
                                </table>

                                <div className='flex justify-between pt-20'>
                                    <div className='space-y-8'>
                                        <div className='flex items-end gap-2'>
                                            <span className='whitespace-nowrap'>Implementation Engineer:</span>
                                            <div className=' min-h-[20px]'>________________________</div>
                                        </div>
                                        <div className='flex items-end gap-2'>
                                            <span className='whitespace-nowrap'>Nodal Officer:</span>
                                            <div className=' min-h-[20px]'>________________________</div>
                                        </div>
                                    </div>
                                    <div className='space-y-8'>
                                        <div className='flex items-end gap-2'>
                                            <span className='whitespace-nowrap'>End User Signature:</span>
                                            <div className=' min-h-[20px]'>________________________</div>
                                        </div>
                                        <div className='flex items-end gap-2'>
                                            <span className='whitespace-nowrap'>With Seal:</span>
                                            <div className=' min-h-[20px]'>________________________</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Bar Chart Section */}
                                <div className='mt-12 border-t pt-8'>
                                    <h3 className='mb-6 text-center font-bold text-sm uppercase tracking-widest'>
                                        HRMS Month End Report Chart
                                    </h3>
                                    <div ref={chartRef} className='h-[400px] w-full rounded-sm border border-gray-200 bg-white p-6'>
                                        <ResponsiveContainer width='100%' height='100%'>
                                            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                                <CartesianGrid strokeDasharray='3 3' vertical={false} stroke='#e5e7eb' />
                                                <XAxis
                                                    dataKey='name'
                                                    axisLine={{ stroke: '#9ca3af' }}
                                                    tickLine={false}
                                                    tick={{ fontSize: 11, fill: '#4b5563' }}
                                                />
                                                <YAxis
                                                    domain={[0, 80]}
                                                    axisLine={{ stroke: '#9ca3af' }}
                                                    tickLine={false}
                                                    tick={{ fontSize: 11, fill: '#4b5563' }}
                                                />
                                                <Tooltip cursor={{ fill: '#f3f4f6', opacity: 0.4 }} />
                                                <Legend
                                                    verticalAlign='bottom'
                                                    align='center'
                                                    iconType='square'
                                                    iconSize={14}
                                                    formatter={(value) => (
                                                        <span className='ml-1 font-semibold text-gray-700 text-xs'>{value}</span>
                                                    )}
                                                />
                                                <Bar name='Count' dataKey='count' barSize={45}>
                                                    {chartData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CollapsibleSection>
            )}
        </div>
    );
}
