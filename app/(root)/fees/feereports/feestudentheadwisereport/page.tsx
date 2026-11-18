// app/(root)/fees/feereports/feedefaulterreport/page.tsx
'use client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FormError } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    useFeeStudentTermWisePaidReportAcademic,
    useFeeStudentTermWisePaidReportClassdrop,
    useFeeStudentTermWisePaidReportSectionDrop
} from '@/hooks/fees/useReports';
import { getFeeStudentheadWiseReportforCBCS } from '@/server/fees/reports/headwiseReport';
import type { IFeeStudentHeadWiseReport } from '@/types/fees/reports/reports';
import { zodResolver } from '@hookform/resolvers/zod';
import type React from 'react';
import { useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { z } from 'zod';
import { printTable } from './_components/export_and_excel';

const feeStudentHeadReportSchema = z.object({
    academicYearId: z.number().min(1, 'Academic Year is required'),
    classId: z.number().min(1, 'Class is required'),
    sectionId: z.number().min(1, 'Section is required')
});

type FormFields = z.infer<typeof feeStudentHeadReportSchema>;

export default function FeeStudentHeadWiseReport() {
    const {
        handleSubmit,
        control,
        watch,
        formState: { errors }
    } = useForm<FormFields>({
        resolver: zodResolver(feeStudentHeadReportSchema),
        defaultValues: {
            academicYearId: undefined,
            classId: undefined,
            sectionId: undefined
        }
    });
    const { data: academicYearData, isLoading: loadingYears } = useFeeStudentTermWisePaidReportAcademic();
    const { data: classListResponse, isLoading: loadingClasses } = useFeeStudentTermWisePaidReportClassdrop();
    const { data: sectionListResponse, isLoading: loadingSections } = useFeeStudentTermWisePaidReportSectionDrop();
    const [reportData, setReportData] = useState<IFeeStudentHeadWiseReport[]>([]);
    const [reportLoading, setReportLoading] = useState(false);

    const academicYearId = watch('academicYearId');
    const classId = watch('classId');
    const sectionId = watch('sectionId');

    const handleExportExcel = () => {
        if (!reportData || reportData.length === 0) {
            toast.error('No data to export!');
            return;
        }

        const groups: { [key: string]: any[] } = {};

        reportData.forEach((row) => {
            const groupKey = row.amsT_Id || `${row.studentName}_${row.amsT_AdmNo}`;
            if (!groups[groupKey]) {
                groups[groupKey] = [];
            }
            groups[groupKey].push(row);
        });

        const excelData: any[] = [];
        let slNo = 1;

        Object.values(groups).forEach((groupRows) => {
            const totalCharges = groupRows.reduce((sum, row) => sum + (row.totalCharges || 0), 0);
            const totalPaid = groupRows.reduce((sum, row) => sum + (row.paid || 0), 0);
            const totalBalance = groupRows.reduce((sum, row) => sum + (row.totalTobePaid || 0), 0);

            groupRows.forEach((row, idx) => {
                const isFirstRow = idx === 0;

                excelData.push({
                    'Sl No': isFirstRow ? slNo : '',
                    'Student Name': isFirstRow ? row.studentName : '',
                    'Adm No': isFirstRow ? row.amsT_AdmNo : '',
                    Class: isFirstRow ? row.asmcL_ClassName : '',
                    Section: isFirstRow ? row.asmC_SectionName : '',
                    'Head Name': row.fmH_FeeName,
                    Charges: row.totalCharges,
                    Paid: row.paid,
                    Balance: row.totalTobePaid,
                    'Total Charges': isFirstRow ? totalCharges : '',
                    'Total Paid': isFirstRow ? totalPaid : '',
                    'Total Balance': isFirstRow ? totalBalance : ''
                });
            });

            slNo++;
        });

        // Add Total row at the end
        const grandTotalCharges = reportData.reduce((sum, row) => sum + (row.totalCharges || 0), 0);
        const grandTotalPaid = reportData.reduce((sum, row) => sum + (row.paid || 0), 0);
        const grandTotalBalance = reportData.reduce((sum, row) => sum + (row.totalTobePaid || 0), 0);

        excelData.push({
            'Sl No': '',
            'Student Name': '',
            'Adm No': '',
            Class: '',
            Section: '',
            'Head Name': 'TOTAL',
            Charges: grandTotalCharges,
            Paid: grandTotalPaid,
            Balance: grandTotalBalance,
            'Total Charges': '',
            'Total Paid': '',
            'Total Balance': ''
        });

        try {
            // Create worksheet
            const worksheet = XLSX.utils.json_to_sheet(excelData);

            // Auto-size columns (optional)
            const maxWidth = 20;
            worksheet['!cols'] = Object.keys(excelData[0] || {}).map(() => ({
                wch: maxWidth
            }));

            // Create workbook
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Fee Student Headwise Report');

            // Export file
            // biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
            XLSX.writeFile(workbook, `Fee_Student_Headwise_Report.xlsx`);

            toast.success('Excel file downloaded successfully!');
        } catch (error) {
            console.error('Error generating Excel:', error);
            toast.error('Failed to generate Excel file');
        }
    };

    const handlePrint = () => {
        // Group data by student
        const groups: { [key: string]: any[] } = {};

        reportData.forEach((row) => {
            const groupKey = row.amsT_Id || `${row.studentName}_${row.amsT_AdmNo}`;
            if (!groups[groupKey]) {
                groups[groupKey] = [];
            }
            groups[groupKey].push(row);
        });

        const printableRows: any[] = [];
        let slNo = 1;

        Object.values(groups).forEach((groupRows) => {
            const totalCharges = groupRows.reduce((sum, row) => sum + (row.totalCharges || 0), 0);
            const totalPaid = groupRows.reduce((sum, row) => sum + (row.paid || 0), 0);
            const totalBalance = groupRows.reduce((sum, row) => sum + (row.totalTobePaid || 0), 0);

            groupRows.forEach((row, idx) => {
                const isFirstRow = idx === 0;

                printableRows.push({
                    'Sl No': isFirstRow ? slNo : '',
                    'Student Name': isFirstRow ? row.studentName : '',
                    'Adm No': isFirstRow ? row.amsT_AdmNo : '',
                    Class: isFirstRow ? row.asmcL_ClassName : '',
                    Section: isFirstRow ? row.asmC_SectionName : '',
                    'Head Name': row.fmH_FeeName,
                    Charges: row.totalCharges,
                    Paid: row.paid,
                    Balance: row.totalTobePaid,
                    'Total Charges': isFirstRow ? totalCharges : '',
                    'Total Paid': isFirstRow ? totalPaid : '',
                    'Total Balance': isFirstRow ? totalBalance : ''
                });
            });

            slNo++;
        });

        // Add Total row
        const grandTotalCharges = reportData.reduce((sum, row) => sum + (row.totalCharges || 0), 0);
        const grandTotalPaid = reportData.reduce((sum, row) => sum + (row.paid || 0), 0);
        const grandTotalBalance = reportData.reduce((sum, row) => sum + (row.totalTobePaid || 0), 0);

        printableRows.push({
            'Sl No': '',
            'Student Name': '',
            'Adm No': '',
            Class: '',
            Section: '',
            'Head Name': 'TOTAL',
            Charges: grandTotalCharges,
            Paid: grandTotalPaid,
            Balance: grandTotalBalance,
            'Total Charges': '',
            'Total Paid': '',
            'Total Balance': ''
        });

        const columns = [
            'Sl No',
            'Student Name',
            'Adm No',
            'Class',
            'Section',
            'Head Name',
            'Charges',
            'Paid',
            'Balance',
            'Total Charges',
            'Total Paid',
            'Total Balance'
        ];

        printTable(columns, printableRows);
    };

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        setReportData([]);
        if (!data.academicYearId) return toast.error('Please select an Academic Year');
        if (!data.classId) return toast.error('Please select class');
        if (!data.sectionId) return toast.error('Please select section');

        setReportLoading(true);
        try {
            const payload = {
                fillclasflg: classId,
                fillseccls: sectionId,
                asmaY_Id: academicYearId
            };
            console.log('payload', payload);
            const response = await getFeeStudentheadWiseReportforCBCS(payload);
            const apiList = response?.data ?? [];
            console.log('apiList', apiList);
            const mapApiToReportRows = (apiData: any[]): IFeeStudentHeadWiseReport[] => {
                return apiData.map((item, index) => ({
                    id: index + 1,
                    fmH_Id: item.fmH_Id,
                    asmcL_Id: item.asmcL_Id,
                    asmcL_ClassName: item.asmcL_ClassName,
                    asmcL_Order: item.asmcL_Order,
                    asmC_Order: item.asmC_Order,
                    asmS_Id: item.asmS_Id,
                    asmC_SectionName: item.asmC_SectionName,
                    amsT_Id: item.amsT_Id,
                    studentName: item.studentName,
                    amsT_AdmNo: item.amsT_AdmNo,
                    fmH_FeeName: item.fmH_FeeName,
                    totalCharges: item.totalCharges,
                    concession: item.concession,
                    totalTobePaid: item.totalTobePaid,
                    paid: item.paid
                }));
            };
            const data = mapApiToReportRows(apiList);
            setReportData(data);

            if (apiList.length === 0) {
                toast.info('No records found for selected criteria');
                return;
            }

            toast.success('Report generated successfully');
        } catch (error: any) {
            console.error(error);
            toast.error('Failed to generate report');
        } finally {
            setReportLoading(false);
        }
    };

    return (
        <div className='min-h-screen bg-gray-50 py-8'>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
                <div className='mx-auto max-w-7xl'>
                    <Card className='border-0 shadow-xl'>
                        <div className='p-8'>
                            <div className='space-y-8'>
                                <div className='grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3'>
                                    {/* Academic Year */}
                                    <div className='space-y-3'>
                                        <Label className='font-semibold text-lg'>
                                            Academic Year <span className='text-red-500'>*</span>
                                        </Label>
                                        <Controller
                                            name='academicYearId'
                                            control={control}
                                            render={({ field }) => (
                                                <Select
                                                    value={field.value?.toString()}
                                                    onValueChange={(v) => {
                                                        const num = Number(v);
                                                        field.onChange(num);
                                                    }}>
                                                    <SelectTrigger className='w-full text-center'>
                                                        <SelectValue placeholder='--Select Academic Year--' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {loadingYears ? (
                                                            <SelectItem value='loading' disabled>
                                                                Loading...
                                                            </SelectItem>
                                                        ) : (
                                                            academicYearData?.data?.map((item: any) => (
                                                                <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                                    {item.asmaY_Year}
                                                                </SelectItem>
                                                            ))
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.academicYearId && <FormError className='mt-1'>{errors.academicYearId.message}</FormError>}
                                    </div>

                                    {/* Class */}
                                    <div className='space-y-3'>
                                        <Label className='font-semibold text-lg'>
                                            Class <span className='text-red-500'>*</span>
                                        </Label>
                                        <Controller
                                            name='classId'
                                            control={control}
                                            render={({ field }) => (
                                                <Select
                                                    value={field.value?.toString()}
                                                    onValueChange={(v) => {
                                                        const num = Number(v);
                                                        field.onChange(num);
                                                    }}>
                                                    <SelectTrigger className='w-full text-center'>
                                                        <SelectValue placeholder='--Select Class--' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {loadingClasses ? (
                                                            <SelectItem value='loading' disabled>
                                                                Loading...
                                                            </SelectItem>
                                                        ) : (
                                                            classListResponse?.data?.map((item) => (
                                                                <SelectItem key={item.asmcL_Id} value={String(item.asmcL_Id)}>
                                                                    {item.asmcL_ClassName}
                                                                </SelectItem>
                                                            ))
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.classId && <FormError className='mt-1'>{errors.classId.message}</FormError>}
                                    </div>

                                    {/* Section */}
                                    <div className='space-y-3'>
                                        <Label className='font-semibold text-lg'>
                                            Section <span className='text-red-500'>*</span>
                                        </Label>
                                        <Controller
                                            name='sectionId'
                                            control={control}
                                            render={({ field }) => (
                                                <Select
                                                    value={field.value?.toString()}
                                                    onValueChange={(v) => {
                                                        const num = Number(v);
                                                        field.onChange(num);
                                                    }}>
                                                    <SelectTrigger className='w-full text-center'>
                                                        <SelectValue placeholder='--Select Section--' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {loadingSections ? (
                                                            <SelectItem value='loading' disabled>
                                                                Loading...
                                                            </SelectItem>
                                                        ) : (
                                                            sectionListResponse?.data?.map((item) => (
                                                                <SelectItem key={item.asmS_Id} value={String(item.asmS_Id)}>
                                                                    {item.asmC_SectionName}
                                                                </SelectItem>
                                                            ))
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.sectionId && <FormError className='mt-1'>{errors.sectionId.message}</FormError>}
                                    </div>
                                </div>

                                <div>
                                    <div className='flex justify-end gap-4 border-t pt-8'>
                                        <Button size='lg' variant='outline' className='px-8' onClick={() => window.location.reload()}>
                                            Cancel
                                        </Button>
                                        <Button type='submit' disabled={reportLoading} className='min-w-32'>
                                            {reportLoading ? 'Generating...' : 'Report'}
                                        </Button>
                                    </div>

                                    {reportData.length > 0 && (
                                        <div className='-mx-8 mt-12 overflow-hidden rounded-lg bg-white shadow-xl'>
                                            {reportLoading ? (
                                                <div className='p-24 text-center'>
                                                    <div className='inline-block h-14 w-14 animate-spin rounded-full border-4 border-primary border-t-transparent' />
                                                    <p className='mt-6 text-lg text-muted-foreground'>Generating report, please wait...</p>
                                                </div>
                                            ) : (
                                                <CollapsibleSection
                                                    defaultOpen={true}
                                                    variant='default'
                                                    size='lg'
                                                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                                                    <div className='flex items-center justify-between border-b bg-primary/5 px-8 py-6'>
                                                        <div>
                                                            <h2 className='font-bold text-2xl text-primary'>FEE STUDENT HEADWISE REPORT</h2>
                                                        </div>
                                                        <div className='flex gap-3'>
                                                            <Button
                                                                size='sm'
                                                                className='h-8 w-auto px-3 text-xs'
                                                                onClick={handleExportExcel}>
                                                                Export Excel
                                                            </Button>
                                                            <Button
                                                                size='sm'
                                                                variant='outline'
                                                                className='h-8 w-auto px-3 text-xs'
                                                                onClick={handlePrint}>
                                                                Print
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    <div className='overflow-x-auto'>
                                                        <table className='w-full border-collapse'>
                                                            <thead className='bg-primary text-white'>
                                                                <tr>
                                                                    <th className='w-20 border px-4 py-2 text-center'>Sl No</th>
                                                                    <th className='border px-4 py-2 text-center'>Student Name</th>
                                                                    <th className='border px-4 py-2 text-center'>Adm No</th>
                                                                    <th className='border px-4 py-2 text-center'>Class</th>
                                                                    <th className='border px-4 py-2 text-center'>Section</th>
                                                                    <th className='border px-4 py-2 text-center'>Head Name</th>
                                                                    <th className='border px-4 py-2 text-center'>Charges</th>
                                                                    <th className='border px-4 py-2 text-center'>Paid</th>
                                                                    <th className='border px-4 py-2 text-center'>Balance</th>
                                                                    <th className='border px-4 py-2 text-center'>Total Charges</th>
                                                                    <th className='border px-4 py-2 text-center'>Total Paid</th>
                                                                    <th className='border px-4 py-2 text-center'>Total Balance</th>
                                                                </tr>
                                                            </thead>

                                                            <tbody>
                                                                {(() => {
                                                                    const groups: { [key: number]: any[] } = {};

                                                                    reportData.forEach((row) => {
                                                                        const groupKey = row.amsT_Id;
                                                                        if (!groups[groupKey]) {
                                                                            groups[groupKey] = [];
                                                                        }
                                                                        groups[groupKey].push(row);
                                                                    });

                                                                    const rows: React.ReactNode[] = [];
                                                                    let groupCounter = 1;

                                                                    Object.entries(groups).forEach(([groupId, groupRows]) => {
                                                                        groupRows.forEach((row, index) => {
                                                                            const isFirstRow = index === 0;
                                                                            const totalCharges = groupRows.reduce(
                                                                                (sum, row) => sum + (row.totalCharges || 0),
                                                                                0
                                                                            );
                                                                            const totalpaid = groupRows.reduce(
                                                                                (sum, row) => sum + (row.paid || 0),
                                                                                0
                                                                            );
                                                                            const totalBalance = groupRows.reduce(
                                                                                (sum, row) => sum + (row.totalTobePaid || 0),
                                                                                0
                                                                            );
                                                                            rows.push(
                                                                                <tr
                                                                                    key={`${groupId}_${index}`}
                                                                                    className='odd:bg-gray-50 hover:bg-gray-100'>
                                                                                    {isFirstRow && (
                                                                                        <td
                                                                                            rowSpan={groupRows.length}
                                                                                            className='border px-4 py-2 text-center align-middle'>
                                                                                            {groupCounter}
                                                                                        </td>
                                                                                    )}
                                                                                    {isFirstRow && (
                                                                                        <td
                                                                                            rowSpan={groupRows.length}
                                                                                            className='border px-4 py-2 text-center align-middle font-medium'>
                                                                                            {row.studentName}
                                                                                        </td>
                                                                                    )}
                                                                                    {isFirstRow && (
                                                                                        <td
                                                                                            rowSpan={groupRows.length}
                                                                                            className='border px-4 py-2 text-center align-middle font-medium'>
                                                                                            {row.amsT_AdmNo}
                                                                                        </td>
                                                                                    )}
                                                                                    {isFirstRow && (
                                                                                        <td
                                                                                            rowSpan={groupRows.length}
                                                                                            className='border px-4 py-2 text-center align-middle font-medium'>
                                                                                            {row.asmcL_ClassName}
                                                                                        </td>
                                                                                    )}
                                                                                    {isFirstRow && (
                                                                                        <td
                                                                                            rowSpan={groupRows.length}
                                                                                            className='border px-4 py-2 text-center align-middle font-medium'>
                                                                                            {row.asmC_SectionName}
                                                                                        </td>
                                                                                    )}
                                                                                    <td className='border px-4 py-2 text-center align-middle'>
                                                                                        {row.fmH_FeeName}
                                                                                    </td>
                                                                                    <td className='border px-4 py-2 text-center align-middle'>
                                                                                        {row.totalCharges.toLocaleString()}
                                                                                    </td>
                                                                                    <td className='border px-4 py-2 text-center'>
                                                                                        {row.paid.toLocaleString()}
                                                                                    </td>
                                                                                    <td className='border px-4 py-2 text-center'>
                                                                                        {row.totalTobePaid.toLocaleString()}
                                                                                    </td>
                                                                                    {isFirstRow && (
                                                                                        <td
                                                                                            rowSpan={groupRows.length}
                                                                                            className='border px-4 py-2 text-center align-middle font-medium'>
                                                                                            {totalCharges.toLocaleString()}
                                                                                        </td>
                                                                                    )}
                                                                                    {isFirstRow && (
                                                                                        <td
                                                                                            rowSpan={groupRows.length}
                                                                                            className='border px-4 py-2 text-center align-middle font-medium'>
                                                                                            {totalpaid.toLocaleString()}
                                                                                        </td>
                                                                                    )}
                                                                                    {isFirstRow && (
                                                                                        <td
                                                                                            rowSpan={groupRows.length}
                                                                                            className='border px-4 py-2 text-center align-middle font-medium'>
                                                                                            {totalBalance.toLocaleString()}
                                                                                        </td>
                                                                                    )}
                                                                                </tr>
                                                                            );
                                                                        });

                                                                        groupCounter++;
                                                                    });

                                                                    return rows;
                                                                })()}
                                                                <tr className='bg-gray-100 font-bold'>
                                                                    <td colSpan={6} className='p-2 text-right'>
                                                                        Total
                                                                    </td>
                                                                    <td className='p-2 text-center font-bold text-blue-700'>
                                                                        ₹
                                                                        {reportData
                                                                            .reduce((sum, row) => sum + (row.totalCharges || 0), 0)
                                                                            .toLocaleString('en-IN')}
                                                                    </td>
                                                                    <td className='p-2 text-center font-bold text-blue-700'>
                                                                        ₹
                                                                        {reportData
                                                                            .reduce((sum, row) => sum + (row.paid || 0), 0)
                                                                            .toLocaleString('en-IN')}
                                                                    </td>
                                                                    <td className='p-2 text-center font-bold text-blue-700'>
                                                                        ₹
                                                                        {reportData
                                                                            .reduce((sum, row) => sum + (row.totalTobePaid || 0), 0)
                                                                            .toLocaleString('en-IN')}
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </CollapsibleSection>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </form>
        </div>
    );
}
