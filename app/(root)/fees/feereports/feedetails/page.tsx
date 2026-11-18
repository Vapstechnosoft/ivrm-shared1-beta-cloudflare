'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FormError } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFeeStudentAcademicYearDropdown } from '@/hooks/fees/useMasters';
import { feeReceiptDeleteReportSophiaSchema } from '@/schemas/fees/reports';
import { feeClassWiseDueListreportSophia } from '@/server/fees/reports/sophia_reports';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof feeReceiptDeleteReportSophiaSchema>;

interface IAcademicYear {
    asmaY_Id: number;
    asmaY_Year: string;
    asmcL_ClassName: string;
    asmC_SectionName: string;
}

export interface IFeeClassWiseDueListReportofSophia {
    id: number;
    studentName: string;
    amsT_AdmNo: string;
    asmcL_ClassName: string;
    asmcL_Id: number;
    asmS_SectionName?: string;
    fmT_Name: string;
    balance: number;
    fine: number;
    fine_calc: number;
    totalDue: number;
}

// Interface for overall fee analysis
interface IOverallFeeAnalysis {
    receivable: number;
    concession: number;
    collection: number;
    adjusted: number;
    balance: number;
}

export default function FeeReceiptDeleteReportNagarjuna() {
    const {
        handleSubmit,
        control,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(feeReceiptDeleteReportSophiaSchema),
        defaultValues: {
            academicYearId: undefined,
            fromDate: format(new Date(), 'yyyy-MM-dd'),
            toDate: format(new Date(), 'yyyy-MM-dd')
        }
    });
    const selctedAcademicYearId = watch('academicYearId');

    const [academicYears, setAcademicYears] = useState<IAcademicYear[]>([]);
    const [reportData, setReportData] = useState<IFeeClassWiseDueListReportofSophia[]>([]);
    const [overallAnalysis, setOverallAnalysis] = useState<IOverallFeeAnalysis>({
        receivable: 0,
        concession: 0,
        collection: 0,
        adjusted: 0,
        balance: 0
    });

    const { data: academicData, isLoading: loadingAcademic, error: academicError } = useFeeStudentAcademicYearDropdown();

    // Calculate overall fee analysis from report data
    const calculateOverallAnalysis = (data: IFeeClassWiseDueListReportofSophia[]) => {
        const totalDue = data.reduce((sum, item) => sum + (item.totalDue || 0), 0);
        const totalCollection = data.reduce((sum, item) => sum + (item.balance || 0), 0);

        // Assuming receivable is total fee expected, collection is amount collected
        // Adjusted might be some other metric (like waivers/discounts)
        // Balance is remaining due
        const receivable = totalDue + totalCollection;
        const concession = data.reduce((sum, item) => sum + (item.fine_calc || 0), 0);
        const collection = totalCollection;
        const adjusted = data.reduce((sum, item) => sum + (item.fine || 0), 0);
        const balance = totalDue;

        return {
            receivable,
            concession,
            collection,
            adjusted,
            balance
        };
    };

    // Group report data by Class Name and Section Name
    const groupedReportData = useMemo(() => {
        const grouped: Record<
            string,
            {
                className: string;
                sectionName: string;
                students: IFeeClassWiseDueListReportofSophia[];
            }
        > = {};

        reportData.forEach((item) => {
            const className = item.asmcL_ClassName || 'Unknown Class';
            const sectionName = item.asmS_SectionName || 'No Section';
            const groupKey = `${className}-${sectionName}`;

            if (!grouped[groupKey]) {
                grouped[groupKey] = {
                    className: className,
                    sectionName: sectionName,
                    students: []
                };
            }
            grouped[groupKey].students.push(item);
        });

        return Object.values(grouped).sort((a, b) => a.className.localeCompare(b.className));
    }, [reportData]);

    // Calculate summary totals for a group
    const calculateGroupTotals = (students: IFeeClassWiseDueListReportofSophia[]) => {
        return students.reduce(
            (acc, student) => ({
                totalDue: acc.totalDue + (student.totalDue || 0),
                totalFine: acc.totalFine + (student.fine || 0),
                totalBalance: acc.totalBalance + (student.balance || 0)
            }),
            { totalDue: 0, totalFine: 0, totalBalance: 0 }
        );
    };

    // Prepare data for bar chart
    const barChartData = useMemo(() => {
        return [
            { name: 'RECEIVABLE', amount: overallAnalysis.receivable, color: '#3b82f6' },
            { name: 'CONCESSION', amount: overallAnalysis.concession, color: '#10b981' },
            { name: 'COLLECTION', amount: overallAnalysis.collection, color: '#f59e0b' },
            { name: 'ADJUSTED', amount: overallAnalysis.adjusted, color: '#ef4444' },
            { name: 'BALANCE', amount: overallAnalysis.balance, color: '#8b5cf6' }
        ];
    }, [overallAnalysis]);

    // Prepare data for pie chart
    const pieChartData = useMemo(() => {
        return [
            { name: 'COLLECTION', value: overallAnalysis.collection, color: '#3b82f6' },
            { name: 'ADJUSTED', value: overallAnalysis.adjusted, color: '#9ca3af' },
            { name: 'BALANCE', value: overallAnalysis.balance, color: '#10b981' }
        ].filter((item) => item.value > 0);
    }, [overallAnalysis]);

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
                asmaY_Order: item.asmaY_Order ?? 0,
                asmC_SectionName: item.asmC_SectionName ?? '',
                asmcL_ClassName: item.asmcL_ClassName ?? ''
            }));
            setAcademicYears(formatted);
        }
    }, [academicData, academicError]);

    useEffect(() => {
        setReportData([]);
        setOverallAnalysis({
            receivable: 0,
            concession: 0,
            collection: 0,
            adjusted: 0,
            balance: 0
        });
    }, [selctedAcademicYearId]);

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        setReportData([]);
        setOverallAnalysis({
            receivable: 0,
            concession: 0,
            collection: 0,
            adjusted: 0,
            balance: 0
        });

        try {
            const payload = {
                customflag: 'DUELIST',
                asmaY_Id: data.academicYearId,
                radioval: ''
            };

            const apiData = await feeClassWiseDueListreportSophia(payload);
            const responseJson = typeof apiData === 'string' ? JSON.parse(apiData) : apiData;
            if (responseJson?.data) {
                setReportData(responseJson.data);
                const analysis = calculateOverallAnalysis(responseJson.data);
                setOverallAnalysis(analysis);
                toast.success('Report Generated Successfully');
            }
        } catch (error: any) {
            console.error('Error generating report:', error);
            toast.error(error.message || 'Failed to generate report');
        }
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const handleExport = () => {
        // exportToExcel(groupedReportData, 'Fee Class Wise Due List Report');
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Please allow pop-ups to print the report');
            return;
        }

        const currentDate = new Date().toLocaleDateString();

        let printContent = `
          <!DOCTYPE html>
          <html>
          <head>
              <title>Fee Class Wise Due List Report</title>
              <style>
                  body {
                      font-family: Arial, sans-serif;
                      margin: 20px;
                      padding: 0;
                  }
                  .header {
                      text-align: center;
                      margin-bottom: 30px;
                  }
                  .header h1 {
                      margin: 0;
                      color: #1e40af;
                  }
                  .header p {
                      margin: 5px 0;
                      color: #666;
                  }
                  .date {
                      text-align: right;
                      margin-bottom: 20px;
                      font-size: 12px;
                  }
                  .group-section {
                      margin-bottom: 40px;
                      page-break-after: avoid;
                  }
                  .group-header {
                      background-color: #f3f4f6;
                      padding: 10px;
                      border: 1px solid #d1d5db;
                      border-bottom: 2px solid #1e40af;
                      margin-top: 20px;
                  }
                  .group-title {
                      font-size: 18px;
                      font-weight: bold;
                      color: #1e40af;
                      margin: 0;
                  }
                  .group-info {
                      font-size: 14px;
                      color: #6b7280;
                      margin: 5px 0 0 0;
                  }
                  .group-totals {
                      text-align: right;
                      font-size: 14px;
                  }
                  table {
                      width: 100%;
                      border-collapse: collapse;
                      margin-top: 10px;
                  }
                  th {
                      background-color: #374151;
                      color: white;
                      padding: 8px;
                      border: 1px solid #d1d5db;
                      text-align: center;
                      font-size: 12px;
                  }
                  td {
                      padding: 6px;
                      border: 1px solid #d1d5db;
                      font-size: 12px;
                  }
                  .text-left {
                      text-align: left;
                  }
                  .text-center {
                      text-align: center;
                  }
                  .text-right {
                      text-align: right;
                  }
                  .font-bold {
                      font-weight: bold;
                  }
                  .bg-gray-100 {
                      background-color: #f3f4f6;
                  }
                  .tfoot-row {
                      background-color: #f3f4f6;
                      font-weight: bold;
                  }
                  .page-break {
                      page-break-before: always;
                  }
                  @media print {
                      body {
                          margin: 0;
                          padding: 10px;
                      }
                      .group-section {
                          page-break-inside: avoid;
                      }
                      th {
                          background-color: #374151 !important;
                          color: white !important;
                          -webkit-print-color-adjust: exact;
                          print-color-adjust: exact;
                      }
                      .group-header {
                          -webkit-print-color-adjust: exact;
                          print-color-adjust: exact;
                      }
                      .tfoot-row {
                          -webkit-print-color-adjust: exact;
                          print-color-adjust: exact;
                      }
                  }
              </style>
          </head>
          <body>
              <div class="header">
                  <h1>Fee Class Wise Due List Report</h1>
                  <p>Generated on: ${currentDate}</p>
              </div>
      `;

        groupedReportData.forEach((group, groupIndex) => {
            const groupTotals = calculateGroupTotals(group.students);

            printContent += `
              <div class="group-section">
                  <div class="group-header">
                      <div style="display: flex; justify-content: space-between; align-items: center;">
                          <div>
                              <div class="group-title">
                                  Class: ${group.className}
                                  ${group.sectionName !== 'No Section' ? ` - Division ${group.sectionName}` : ''}
                              </div>
                              <div class="group-info">
                                  Total Students: ${group.students.length}
                              </div>
                          </div>
                          <div class="group-totals">
                              <div><strong>Group Total Due:</strong> ₹${groupTotals.totalDue.toLocaleString()}</div>
                              <div><strong>Fine:</strong> ₹${groupTotals.totalFine.toLocaleString()}</div>
                          </div>
                      </div>
                  </div>
                  
                  <table>
                      <thead>
                          <tr>
                              <th class="text-center" width="50">Sl No</th>
                              <th class="text-left" width="100">Admission No</th>
                              <th class="text-left" width="150">Student Name</th>
                              <th class="text-left" width="120">Term</th>
                              <th class="text-right" width="130">Due amount till ${currentDate}</th>
                              <th class="text-right" width="130">Fine amount till ${currentDate}</th>
                              <th class="text-right" width="130">Total due amount</th>
                          </tr>
                      </thead>
                      <tbody>
          `;

            group.students.forEach((row, idx) => {
                printContent += `
                          <tr class="${idx % 2 === 0 ? '' : 'bg-gray-100'}">
                              <td class="text-center">${idx + 1}</td>
                              <td class="text-left">${row.amsT_AdmNo || '-'}</td>
                              <td class="text-left font-bold">${row.studentName || '-'}</td>
                              <td class="text-left">${row.fmT_Name || '-'}</td>
                              <td class="text-right">₹${(row.balance || 0).toLocaleString()}</td>
                              <td class="text-right">₹${(row.fine || 0).toLocaleString()}</td>
                              <td class="text-right font-bold">₹${(row.totalDue || 0).toLocaleString()}</td>
                          </tr>
              `;
            });

            printContent += `
                      </tbody>
                      <tfoot>
                          <tr class="tfoot-row">
                              <td colspan="4" class="text-right font-bold">Group Total:</td>
                              <td class="text-right font-bold">₹${groupTotals.totalBalance.toLocaleString()}</td>
                              <td class="text-right font-bold">₹${groupTotals.totalFine.toLocaleString()}</td>
                              <td class="text-right font-bold">₹${groupTotals.totalDue.toLocaleString()}</td>
                          </tr>
                      </tfoot>
                  </table>
              </div>
          `;

            if (groupIndex < groupedReportData.length - 1) {
                printContent += `<div class="page-break"></div>`;
            }
        });

        printContent += `
          </body>
          </html>
      `;

        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className='rounded-lg border bg-white p-3 shadow-lg'>
                    <p className='font-semibold'>{label}</p>
                    <p className='text-blue-600'>Amount: ₹{payload[0].value.toLocaleString()}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className='min-h-screen bg-gray-50 py-8'>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
                <div className='mx-auto max-w-7xl'>
                    <Card className='border-0 shadow-xl'>
                        <div className='place-items-center p-8'>
                            <div className='space-y-8'>
                                <div className='flex items-center gap-12'>
                                    {/* Academic Year */}
                                    <div className='flex w-[420px] items-center gap-4'>
                                        <Label className='w-36 text-right'>
                                            Academic Year <span className='text-red-500'>*</span>
                                        </Label>

                                        <div className='flex-1'>
                                            <Controller
                                                name='academicYearId'
                                                control={control}
                                                render={({ field }) => (
                                                    <Select
                                                        value={field.value?.toString()}
                                                        onValueChange={(v) => field.onChange(Number(v))}>
                                                        <SelectTrigger className='w-full'>
                                                            <SelectValue placeholder='--Select Academic Year--' />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {loadingAcademic ? (
                                                                <SelectItem value='loading' disabled>
                                                                    Loading...
                                                                </SelectItem>
                                                            ) : (
                                                                academicYears?.map((item: any) => (
                                                                    <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                                        {item.asmaY_Year} {item.asmcL_ClassName}:{item.asmC_SectionName}
                                                                    </SelectItem>
                                                                ))
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                            {errors.academicYearId && <FormError>{errors.academicYearId.message}</FormError>}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    {/* Overall Fee Analysis Section */}
                                    <div className='mb-10'>
                                        <CollapsibleSection
                                            defaultOpen={true}
                                            variant='default'
                                            size='lg'
                                            className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                                            <div className='border-b bg-primary/5 px-8 py-6'>
                                                <h2 className='text-center font-bold text-2xl text-primary'>OVERALL FEES ANALYSIS</h2>
                                            </div>

                                            <div className='p-8'>
                                                {/* Bar Chart */}
                                                <div className='mb-12'>
                                                    <h3 className='mb-4 text-center font-semibold text-lg'>Fee Distribution Overview</h3>
                                                    <ResponsiveContainer width='100%' height={400}>
                                                        <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                                            <CartesianGrid strokeDasharray='3 3' />
                                                            <XAxis dataKey='name' angle={-45} textAnchor='end' height={80} />
                                                            <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
                                                            <Tooltip content={<CustomTooltip />} />
                                                            <Legend />
                                                            <Bar dataKey='amount' fill='#3b82f6' name='Amount (₹)'>
                                                                {barChartData.map((entry, index) => (
                                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                                ))}
                                                            </Bar>
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>

                                                {/* Pie Chart */}
                                                {pieChartData.length > 0 && (
                                                    <div>
                                                        <h3 className='mb-4 text-center font-semibold text-lg'>Collection Distribution</h3>
                                                        <ResponsiveContainer width='100%' height={400}>
                                                            <PieChart>
                                                                <Pie
                                                                    data={pieChartData}
                                                                    cx='50%'
                                                                    cy='50%'
                                                                    labelLine={true}
                                                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                                                                    outerRadius={150}
                                                                    fill='#8884d8'
                                                                    dataKey='value'>
                                                                    {pieChartData.map((entry, index) => (
                                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                                    ))}
                                                                </Pie>
                                                                <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                                                                <Legend />
                                                            </PieChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                )}

                                                {/* Summary Stats */}
                                                <div className='mt-8 grid grid-cols-5 gap-4'>
                                                    <div className='rounded-lg bg-blue-50 p-4 text-center'>
                                                        <p className='text-blue-600 text-sm'>RECEIVABLE</p>
                                                        <p className='font-bold text-blue-700 text-xl'>
                                                            ₹{overallAnalysis.receivable.toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <div className='rounded-lg bg-green-50 p-4 text-center'>
                                                        <p className='text-green-600 text-sm'>CONCESSION</p>
                                                        <p className='font-bold text-green-700 text-xl'>
                                                            ₹{overallAnalysis.concession.toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <div className='rounded-lg bg-orange-50 p-4 text-center'>
                                                        <p className='text-orange-600 text-sm'>COLLECTION</p>
                                                        <p className='font-bold text-orange-700 text-xl'>
                                                            ₹{overallAnalysis.collection.toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <div className='rounded-lg bg-red-50 p-4 text-center'>
                                                        <p className='text-red-600 text-sm'>ADJUSTED</p>
                                                        <p className='font-bold text-red-700 text-xl'>
                                                            ₹{overallAnalysis.adjusted.toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <div className='rounded-lg bg-purple-50 p-4 text-center'>
                                                        <p className='text-purple-600 text-sm'>BALANCE</p>
                                                        <p className='font-bold text-purple-700 text-xl'>
                                                            ₹{overallAnalysis.balance.toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </CollapsibleSection>
                                    </div>

                                    {/* Class Wise Report Section */}
                                    <div className='mt-10'>
                                        <CollapsibleSection
                                            defaultOpen={true}
                                            variant='default'
                                            size='lg'
                                            className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                                            <div className='flex items-center justify-between border-b bg-primary/5 px-8 py-6'>
                                                <div className='text-center'>
                                                    <h2 className='font-bold text-2xl text-primary'>Fee Class Wise Due Report</h2>
                                                </div>
                                                <div className='flex gap-3'>
                                                    <Button size='sm' className='h-8 w-auto px-3 text-xs' onClick={handleExport}>
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

                                            <div className='px-8 pb-8'>
                                                {groupedReportData.map((group) => {
                                                    const groupTotals = calculateGroupTotals(group.students);

                                                    return (
                                                        <div key={`${group.className}-${group.sectionName}`} className='mb-8'>
                                                            <div className='mt-6 rounded-t-lg border-primary border-b-2 bg-gray-100 p-3'>
                                                                <div className='flex items-center justify-between'>
                                                                    <div>
                                                                        <h3 className='font-bold text-lg text-primary'>
                                                                            Class: {group.className}
                                                                            {group.sectionName !== 'No Section' &&
                                                                                ` - Division ${group.sectionName}`}
                                                                        </h3>
                                                                        <p className='text-gray-500 text-sm'>
                                                                            Total Students: {group.students.length}
                                                                        </p>
                                                                    </div>
                                                                    <div className='text-right'>
                                                                        <p className='font-semibold text-sm'>
                                                                            Group Total Due: ₹{groupTotals.totalDue.toLocaleString()}
                                                                        </p>
                                                                        <p className='text-gray-500 text-xs'>
                                                                            Fine: ₹{groupTotals.totalFine.toLocaleString()}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className='overflow-x-auto rounded-b-lg border'>
                                                                <table className='w-full border-collapse text-sm'>
                                                                    <thead className='bg-gray-200'>
                                                                        <tr>
                                                                            <th className='w-16 border px-2 py-2 text-center font-semibold'>
                                                                                Sl No
                                                                            </th>
                                                                            <th className='border px-2 py-2 text-center font-semibold'>
                                                                                Admission No
                                                                            </th>
                                                                            <th className='border px-2 py-2 text-center font-semibold'>
                                                                                Student Name
                                                                            </th>
                                                                            <th className='border px-2 py-2 text-center font-semibold'>
                                                                                Term
                                                                            </th>
                                                                            <th className='border px-2 py-2 text-center font-semibold'>
                                                                                Due amount till {formatDate(new Date())}
                                                                            </th>
                                                                            <th className='border px-2 py-2 text-center font-semibold'>
                                                                                Fine amount till {formatDate(new Date())}
                                                                            </th>
                                                                            <th className='border px-2 py-2 text-center font-semibold'>
                                                                                Total due amount {formatDate(new Date())}
                                                                            </th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {group.students.map((row, idx) => (
                                                                            <tr
                                                                                key={row.id}
                                                                                className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                                                <td className='border px-2 py-2 text-center'>{idx + 1}</td>
                                                                                <td className='border px-2 py-2 text-left'>
                                                                                    {row.amsT_AdmNo}
                                                                                </td>
                                                                                <td className='border px-2 py-2 text-left font-medium'>
                                                                                    {row.studentName || '-'}
                                                                                </td>
                                                                                <td className='border px-2 py-2 text-left'>
                                                                                    {row.fmT_Name || '-'}
                                                                                </td>
                                                                                <td className='border px-2 py-2 text-right'>
                                                                                    ₹{(row.balance || 0).toLocaleString()}
                                                                                </td>
                                                                                <td className='border px-2 py-2 text-right'>
                                                                                    ₹{(row.fine || 0).toLocaleString()}
                                                                                </td>
                                                                                <td className='border px-2 py-2 text-right font-semibold'>
                                                                                    ₹{(row.totalDue || 0).toLocaleString()}
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                    <tfoot className='bg-gray-100'>
                                                                        <tr>
                                                                            <td
                                                                                colSpan={5}
                                                                                className='border px-2 py-2 text-right font-bold'>
                                                                                Group Total:
                                                                            </td>
                                                                            <td className='border px-2 py-2 text-right font-bold'>
                                                                                ₹{groupTotals.totalBalance.toLocaleString()}
                                                                            </td>
                                                                            <td className='border px-2 py-2 text-right font-bold'>
                                                                                ₹{groupTotals.totalFine.toLocaleString()}
                                                                            </td>
                                                                            <td className='border px-2 py-2 text-right font-bold'>
                                                                                ₹{groupTotals.totalDue.toLocaleString()}
                                                                            </td>
                                                                        </tr>
                                                                    </tfoot>
                                                                </table>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </CollapsibleSection>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </form>
        </div>
    );
}
