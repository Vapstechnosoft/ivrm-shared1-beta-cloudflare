'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FormError } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import { feeCollectionReportVVVS } from '@/schemas/fees/reports';
import { getFeeCollectionReportVVVS } from '@/server/fees/reports/fee_refund_report_gmvps';
import { zodResolver } from '@hookform/resolvers/zod/dist/zod.js';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { Input } from 'react-aria-components';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import { exportToExcel, printTable } from './excelandprint';

type FormFields = z.infer<typeof feeCollectionReportVVVS>;

interface IAcademicYear {
    asmaY_Id: string | number;
    asmaY_Year: string;
    asmaY_Order?: number;
}
export interface IFeeCollectionReportVVVS {
    id: number;
    amsT_Id: number;
    mI_Id: number;
    asmaY_Id: number;
    studentName: string;
    asmcL_Id: number;
    asmcL_ClassName: string;
    amsT_MobileNo: string;
    asmS_Id: number;
    asmC_SectionName: string;
    fyP_Receipt_No: string;
    receiptDate: string;
    totalAmount: number;
    totalToBePaid: number;
    totalPaidAmount: number;
    payment_Mode: string;
    fyppM_DDChequeNo: string;
}
export default function FeeCollectionReportVVVS() {
    const [filters, setFilters] = useState({
        reportType: 'All',
        academicYearId: '',
        classId: '',
        sectionId: '',
        feeHead: ''
    });

    const {
        control,
        setValue,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(feeCollectionReportVVVS),
        defaultValues: {
            academicYearId: '',
            reportType: 'All',
            fromDate: format(new Date(), 'yyyy-MM-dd'),
            toDate: format(new Date(), 'yyyy-MM-dd')
        }
    });

    const [academicYears, setAcademicYears] = useState<IAcademicYear[]>([]);
    const [showReport, setShowReport] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [reportData, setReportData] = useState<IFeeCollectionReportVVVS[]>([]);

    const { data: academicData, isLoading: loadingAcademic, error: academicError } = useAcademicYearDropdown();

    useEffect(() => {
        if (academicError) {
            toast.error(academicError?.message || 'Failed to load academic years');
            setAcademicYears([]);
            return;
        }
        if (academicData?.data && Array.isArray(academicData.data)) {
            const formatted: IAcademicYear[] = academicData.data.map((item: any) => ({
                asmaY_Id: item.asmaY_Id ?? '',
                asmaY_Year: item.asmaY_Year ?? 'Unknown Year',
                asmaY_Order: item.asmaY_Order ?? 0
            }));
            setAcademicYears(formatted);
        }
    }, [academicData, academicError]);

    const toggleRow = (id: any) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
    };

    const toggleAll = () => {
        if (selectedIds.length === reportData.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(reportData.map((row) => row.id));
        }
    };

    const selectedRows = reportData.filter((r) => selectedIds.includes(r.id));

    const handleExport = () => {
        if (!selectedRows.length) {
            toast.error('Please select at least one record');
            return;
        }
        exportToExcel(selectedRows, 'Fee-Collection-Report');
    };

    const handlePrint = () => {
        const selected = reportData.filter((row) => selectedIds.includes(row.id));

        if (!selected || selected.length === 0) {
            toast.error('No data selected to print');
            return;
        }
        const columnHeaders = [
            'Sl No',
            'Student Name',
            'Mobile No',
            'Class/Section Name',
            'Receipt Date',
            'Receipt No',
            'Payment Mode',
            'DD/Cheque No',
            'Paid Amount',
            'Balance'
        ];

        const printableRows = selected.map((row, index) => {
            const baseRow = {
                'Sl No': index + 1,
                'Student Name': row.studentName || '',
                'Mobile No': row.amsT_MobileNo || '',
                'Class/Section Name': row.asmC_SectionName || '',
                'Receipt Date': row.receiptDate || '',
                'Receipt No': row.fyP_Receipt_No || '',
                'Payment Mode': row.payment_Mode || '',
                'DD/Cheque No': row.fyppM_DDChequeNo || '',
                'Paid Amount': row.totalPaidAmount || '',
                Balance: row.totalToBePaid || ''
            };
            return baseRow;
        });
        printTable(columnHeaders, printableRows, 'Fee-Collection-Report');
    };

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        setShowReport(false);
        try {
            const payload = {
                amaY_Id: Number(data.academicYearId),
                fromdate: data.fromDate,
                todate: data.toDate,
                allorcorchoronlineflag:
                    filters.reportType === 'All'
                        ? 'All'
                        : filters.reportType === 'Cash'
                          ? 'C'
                          : filters.reportType === 'Cheque/DD'
                            ? 'B'
                            : filters.reportType === 'Online Paid'
                              ? 'O'
                              : filters.reportType === 'ECS'
                                ? 'E'
                                : filters.reportType === 'Card'
                                  ? 'S'
                                  : filters.reportType === 'RTGS'
                                    ? 'R'
                                    : filters.reportType === 'Trans&Bank'
                                      ? 'BT'
                                      : ' '
            };
            const apiData = await getFeeCollectionReportVVVS(payload);
            // biome-ignore lint/suspicious/noConsoleLog: <explanation>
            console.log('apiData', apiData);
            const responseJson = typeof apiData === 'string' ? JSON.parse(apiData) : apiData;
            if (responseJson?.data) {
                const report = responseJson.data ?? [];
                const mapApiToReportRows = (apiData: any[]): IFeeCollectionReportVVVS[] => {
                    return apiData.map((item, index) => ({
                        id: index + 1,
                        amsT_Id: item.amsT_Id,
                        mI_Id: item.mI_Id,
                        asmaY_Id: item.asmaY_Id,
                        studentName: item.studentName,
                        asmcL_Id: item.asmcL_Id,
                        asmcL_ClassName: item.asmcL_ClassName,
                        amsT_MobileNo: item.amsT_MobileNo,
                        asmS_Id: item.asmS_Id,
                        asmC_SectionName: item.asmC_SectionName,
                        fyP_Receipt_No: item.fyP_Receipt_No,
                        receiptDate: item.receiptDate,
                        totalAmount: item.totalAmount,
                        totalToBePaid: item.totalToBePaid,
                        totalPaidAmount: item.totalPaidAmount,
                        payment_Mode: item.payment_Mode,
                        fyppM_DDChequeNo: item.fyppM_DDChequeNo
                    }));
                };
                const list = mapApiToReportRows(report);

                setReportData(list || []);
                // setReportData(responseJson.data);
                setShowReport(true);
                toast.success('Report Generated Successfully');
            }
        } catch (error: any) {
            console.error('Error generating report:', error);
            toast.error(error.message || 'Failed to generate report');
            setShowReport(false);
        }
    };

    return (
        <div className='min-h-screen bg-gray-50 py-8'>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='mx-auto max-w-7xl'>
                    <Card className='border-0 shadow-xl'>
                        <div className='p-8'>
                            <div className='mb-8'>
                                <div className='flex items-center justify-center'>
                                    <Card className='min-w-[400px] border bg-gray-50 p-5 shadow-sm'>
                                        <div className='flex justify-center gap-6'>
                                            {['All', 'Cash', 'Cheque/DD', 'Online Paid', 'ECS', 'Card', 'RTGS', 'Trans&Bank'].map(
                                                (option) => (
                                                    <Label key={option} className='flex cursor-pointer items-center gap-3'>
                                                        <Input
                                                            type='radio'
                                                            name='reportType'
                                                            checked={filters.reportType === option}
                                                            onChange={() => {
                                                                setFilters((prev) => ({
                                                                    ...prev,
                                                                    reportType: option
                                                                }));
                                                                setValue(
                                                                    'reportType',
                                                                    option as
                                                                        | 'All'
                                                                        | 'Cash'
                                                                        | 'Cheque/DD'
                                                                        | 'Online Paid'
                                                                        | 'ECS'
                                                                        | 'Card'
                                                                        | 'RTGS'
                                                                        | 'Trans&Bank'
                                                                );
                                                                setShowReport(false);
                                                                setReportData([]);
                                                                setSelectedIds([]);
                                                            }}
                                                            className='h-5 w-5 text-primary'
                                                        />
                                                        <span className='font-medium'>{option}</span>
                                                    </Label>
                                                )
                                            )}
                                        </div>
                                    </Card>
                                </div>
                            </div>

                            <div className='space-y-8'>
                                <div className='grid grid-cols-2 gap-8'>
                                    <div className='space-y-8'>
                                        <div className='flex items-center gap-4'>
                                            <Label className='w-48 text-right font-medium'>
                                                Academic Year: <span className='text-red-500'>*</span>
                                            </Label>
                                            <div className='flex-1'>
                                                <Controller
                                                    name='academicYearId'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select
                                                            onValueChange={(value) => {
                                                                field.onChange(value);
                                                                setFilters((prev) => ({
                                                                    ...prev,
                                                                    academicYearId: value
                                                                }));
                                                            }}
                                                            value={field.value?.toString() || ''}>
                                                            <SelectTrigger className='w-full'>
                                                                <SelectValue
                                                                    placeholder={loadingAcademic ? 'Loading...' : 'Select Academic Year'}
                                                                />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {academicYears.map((item) => (
                                                                    <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                                        {item.asmaY_Year}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                                {errors.academicYearId && <FormError>{errors.academicYearId.message}</FormError>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className='space-y-8'>
                                        <div className='flex items-center gap-4'>
                                            <Label htmlFor='fromDate' className='w-48 text-right font-medium'>
                                                From Date: <span className='text-red-500'>*</span>
                                            </Label>
                                            <Controller
                                                name='fromDate'
                                                control={control}
                                                render={({ field }) => (
                                                    <div className='flex-1'>
                                                        <Input
                                                            id='fromDate'
                                                            type='date'
                                                            {...field}
                                                            className='w-full rounded border px-3 py-1'
                                                        />
                                                        {errors.fromDate && <FormError>{errors.fromDate.message}</FormError>}
                                                    </div>
                                                )}
                                            />
                                        </div>
                                        <div className='flex items-center gap-4'>
                                            <Label htmlFor='toDate' className='w-48 text-right font-medium'>
                                                To Date: <span className='text-red-500'>*</span>
                                            </Label>
                                            <Controller
                                                name='toDate'
                                                control={control}
                                                render={({ field }) => (
                                                    <div className='flex-1'>
                                                        <Input
                                                            id='toDate'
                                                            type='date'
                                                            {...field}
                                                            className='w-full rounded border px-3 py-1'
                                                        />
                                                        {errors.toDate && <FormError>{errors.toDate.message}</FormError>}
                                                    </div>
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className='flex justify-end gap-4 border-t pt-8'>
                                    <Button
                                        size='lg'
                                        variant='outline'
                                        className='px-8'
                                        onClick={() => window.location.reload()}
                                        type='button'>
                                        Cancel
                                    </Button>
                                    <Button type='submit' disabled={isSubmitting} className='px-12'>
                                        {isSubmitting ? 'Generating...' : 'Generate Report'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Report Section */}
                    {showReport && (
                        <CollapsibleSection defaultOpen={true}>
                            <div className='mt-8 rounded-lg border bg-white shadow-xl'>
                                {/* Header */}
                                <div className='flex items-center justify-between border-b bg-primary/5 px-8 py-6'>
                                    <div className='text-center'>
                                        <h2 className='font-bold text-2xl text-primary'>Fee Defaulter Report</h2>
                                    </div>
                                    <div className='flex gap-3'>
                                        <Button
                                            size='sm'
                                            className='h-8 w-auto px-3 text-xs'
                                            onClick={handleExport}
                                            disabled={!selectedRows.length}>
                                            Export Excel
                                        </Button>
                                        <Button
                                            size='sm'
                                            variant='outline'
                                            className='h-8 w-auto px-3 text-xs'
                                            onClick={handlePrint}
                                            disabled={!selectedRows.length}>
                                            Print
                                        </Button>
                                    </div>
                                </div>

                                {/* TABLE */}
                                <div className='overflow-x-auto'>
                                    <table className='w-full border-collapse text-sm'>
                                        <thead className='bg-primary text-white'>
                                            <tr>
                                                <th className='border px-4 py-3 text-center'>
                                                    <input
                                                        type='checkbox'
                                                        checked={selectedIds.length === reportData.length && reportData.length > 0}
                                                        onChange={(e) => {
                                                            e.stopPropagation();
                                                            toggleAll();
                                                        }}
                                                    />
                                                </th>
                                                <th className='border px-4 py-3'>Sl No</th>
                                                <th className='border px-4 py-3'>Student Name</th>
                                                <th className='border px-4 py-3'>Mobile No</th>
                                                <th className='border px-4 py-3'>Class/Section Name</th>
                                                <th className='border px-4 py-3'>Receipt Date</th>
                                                <th className='border px-4 py-3'>Receipt No</th>
                                                <th className='border px-4 py-3'>Payment Mode</th>
                                                <th className='border px-4 py-3'>DD/Cheque No</th>
                                                <th className='border px-4 py-3'>Paid Amount</th>
                                                <th className='border px-4 py-3'>Balance</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {reportData.map((row, index) => (
                                                <tr
                                                    key={row.id}
                                                    className={
                                                        selectedIds.includes(row.id)
                                                            ? 'bg-blue-100'
                                                            : index % 2 === 0
                                                              ? 'bg-white'
                                                              : 'bg-gray-50'
                                                    }>
                                                    <td className='border px-4 py-2 text-center'>
                                                        <input
                                                            type='checkbox'
                                                            checked={selectedIds.includes(row.id)}
                                                            onChange={(e) => {
                                                                e.stopPropagation();
                                                                toggleRow(row.id);
                                                            }}
                                                        />
                                                    </td>
                                                    <td className='border px-4 py-2 text-center'>{index + 1}</td>
                                                    <td className='border px-4 py-2 font-semibold'>{row.studentName}</td>
                                                    <td className='border px-4 py-2 text-center'>{row.amsT_MobileNo}</td>
                                                    <td className='border px-4 py-2 text-center'>{row.asmC_SectionName}</td>
                                                    <td className='border px-4 py-2 text-center'>{row.receiptDate}</td>
                                                    <td className='border px-4 py-2 text-center'>{row.fyP_Receipt_No}</td>
                                                    <td className='border px-4 py-2 text-center'>{row.payment_Mode}</td>
                                                    <td className='border px-4 py-2 text-center'>{row.fyppM_DDChequeNo}</td>
                                                    <td className='border px-4 py-2 text-center'>{row.totalPaidAmount}</td>
                                                    <td className='border px-4 py-2 text-center'>{row.totalToBePaid}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </CollapsibleSection>
                    )}
                </div>
            </form>
        </div>
    );
}
