'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormError, Label } from '@/components/ui/extension/field';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    BarChart3,
    CheckCircle2,
    FileSpreadsheet,
    FileText,
    GraduationCap,
    Loader2,
    Printer,
    RotateCcw,
    Search,
    TrendingUp,
    XCircle
} from 'lucide-react';
import dynamic from 'next/dynamic';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import * as z from 'zod';

import {
    getClgExamMonthEndReportData,
    getClgExamMonthEndReportInitialDetails
} from './actions';
import type {
    ClgExamMonthEndReportFormValues,
    IClgAcademicYear,
    IClgExam,
    IClgExamMonthEndReportItem,
    IClgMonth
} from './types';

// Dynamic import with SSR disabled to prevent Turbopack compilation errors with Recharts SVG rendering
const ExamReportChart = dynamic(
    () => import('./_components/exam-report-chart'),
    {
        ssr: false,
        loading: () => (
            <div className="flex h-[380px] w-full items-center justify-center text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-6 w-6 animate-spin text-primary" />
                Loading chart visualization...
            </div>
        )
    }
);

// Form Validation Schema
const formSchema = z.object({
    ASMAY_Id: z.string().min(1, 'Please Select Academic Year'),
    IVRM_Month_Id: z.string().min(1, 'Please Select Month'),
    EME_Id: z.string().min(1, 'Please Select Exam')
});

export default function ClgExamMonthEndReportPage() {
    const [academicYears, setAcademicYears] = useState<IClgAcademicYear[]>([]);
    const [months, setMonths] = useState<IClgMonth[]>([]);
    const [exams, setExams] = useState<IClgExam[]>([]);
    const [reportData, setReportData] = useState<IClgExamMonthEndReportItem[]>([]);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [searchFilter, setSearchFilter] = useState('');

    // Active Selection Labels for display/print
    const [selectedYearName, setSelectedYearName] = useState('');
    const [selectedMonthName, setSelectedMonthName] = useState('');
    const [selectedExamName, setSelectedExamName] = useState('');

    const reportContainerRef = useRef<HTMLDivElement>(null);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<ClgExamMonthEndReportFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            ASMAY_Id: '',
            IVRM_Month_Id: '',
            EME_Id: ''
        }
    });

    // Load initial dropdowns on component mount
    const loadInitialData = useCallback(async () => {
        try {
            setIsInitialLoading(true);
            const response = await getClgExamMonthEndReportInitialDetails();

            if (response.success && response.data) {
                const rawData = (response.data as any)?.data || response.data || response;
                
                const getArrayData = (obj: any, keys: string[]) => {
                    if (!obj || typeof obj !== 'object') return [];
                    for (const key of keys) {
                        if (Array.isArray(obj[key])) return obj[key];
                        if (obj[key] && Array.isArray(obj[key].$values)) return obj[key].$values;
                    }
                    return [];
                };

                const acdList = getArrayData(rawData, [
                    'acdlist', 'yearlist', 'yearList', 'academicYearList', 'getyear', 'getYear', 'year_list', 'academicYear', 'allAcademicYear'
                ]);
                const monthList = getArrayData(rawData, [
                    'monthlist', 'monthList', 'getmonth', 'getMonth', 'month_list', 'months', 'allMonths'
                ]);
                const examList = getArrayData(rawData, [
                    'exammastername', 'examlist', 'examList', 'getexam', 'getExam', 'masterExamList', 'masterexamlist',
                    'clgexamlist', 'clg_exam_list', 'exam_list', 'exams', 'allExams', 'allexam', 'allexamlist', 'getexammaster', 'griddata'
                ]);

                const defaultMonths = [
                    { ivrM_Month_Id: 1, ivrM_Month_Name: 'January' },
                    { ivrM_Month_Id: 2, ivrM_Month_Name: 'February' },
                    { ivrM_Month_Id: 3, ivrM_Month_Name: 'March' },
                    { ivrM_Month_Id: 4, ivrM_Month_Name: 'April' },
                    { ivrM_Month_Id: 5, ivrM_Month_Name: 'May' },
                    { ivrM_Month_Id: 6, ivrM_Month_Name: 'June' },
                    { ivrM_Month_Id: 7, ivrM_Month_Name: 'July' },
                    { ivrM_Month_Id: 8, ivrM_Month_Name: 'August' },
                    { ivrM_Month_Id: 9, ivrM_Month_Name: 'September' },
                    { ivrM_Month_Id: 10, ivrM_Month_Name: 'October' },
                    { ivrM_Month_Id: 11, ivrM_Month_Name: 'November' },
                    { ivrM_Month_Id: 12, ivrM_Month_Name: 'December' }
                ];

                setAcademicYears(acdList);
                setMonths(monthList.length > 0 ? monthList : defaultMonths);
                setExams(examList);
            } else {
                toast.error(response.message || 'Failed to load initial dropdown details');
            }
        } catch (error) {
            console.error('Error fetching initial details:', error);
            toast.error('An error occurred while loading dropdown options');
        } finally {
            setIsInitialLoading(false);
        }
    }, []);

    useEffect(() => {
        loadInitialData();
    }, [loadInitialData]);

    // Handle Report Generation
    const onSubmit = async (formData: ClgExamMonthEndReportFormValues) => {
        try {
            setIsGenerating(true);
            const payload = {
                ASMAY_Id: Number(formData.ASMAY_Id),
                EME_Id: Number(formData.EME_Id),
                IVRM_Month_Id: Number(formData.IVRM_Month_Id)
            };

            const response = await getClgExamMonthEndReportData(payload);

            // Resolve Label Names
            const matchedYear = academicYears.find(
                (y: any) => String(y.asmaY_Id ?? y.ASMAY_Id ?? y.id) === String(formData.ASMAY_Id)
            );
            const matchedMonth = months.find(
                (m: any) => String(m.ivrM_Month_Id ?? m.IVRM_Month_Id ?? m.id) === String(formData.IVRM_Month_Id)
            );
            const matchedExam = exams.find(
                (e: any) => String(e.emE_Id ?? e.EME_Id ?? e.id ?? e.eme_id ?? e.examId ?? e.exam_id) === String(formData.EME_Id)
            );

            setSelectedYearName(matchedYear ? (matchedYear.asmaY_Year ?? (matchedYear as any).ASMAY_Year ?? '') : '');
            setSelectedMonthName(matchedMonth ? (matchedMonth.ivrM_Month_Name ?? (matchedMonth as any).IVRM_Month_Name ?? '') : '');
            setSelectedExamName(matchedExam ? (matchedExam.emE_ExamName ?? (matchedExam as any).EME_ExamName ?? (matchedExam as any).examName ?? (matchedExam as any).name ?? '') : '');

            if (response.success && response.data) {
                const rawList: any =
                    response.data.datareport ||
                    response.data.dataReport ||
                    response.data.griddata ||
                    (Array.isArray(response.data) ? response.data : []);

                if (Array.isArray(rawList) && rawList.length > 0) {
                    const normalizedList: IClgExamMonthEndReportItem[] = rawList.map((item: any) => {
                        const pass = Number(item.pass || 0);
                        const fail = Number(item.fail || 0);
                        const total = pass + fail;
                        const passPercentage = total > 0 ? Math.round((pass / total) * 100) : 0;

                        return {
                            asmcL_ClassName:
                                item.asmcL_ClassName ||
                                item.courseName ||
                                item.className ||
                                item.course_name ||
                                'N/A',
                            pass,
                            fail,
                            total,
                            passPercentage
                        };
                    });

                    setReportData(normalizedList);
                    toast.success(`Generated report with ${normalizedList.length} course records`);

                    // Scroll to report results
                    setTimeout(() => {
                        reportContainerRef.current?.scrollIntoView({ behavior: 'smooth' });
                    }, 150);
                } else {
                    setReportData([]);
                    Swal.fire({
                        icon: 'info',
                        title: 'No Record Found',
                        text: 'No exam month end records found for the selected criteria.',
                        confirmButtonColor: '#3085d6'
                    });
                }
            } else {
                setReportData([]);
                Swal.fire({
                    icon: 'info',
                    title: 'No Record Found',
                    text: response.message || 'No records found for the selected parameters.',
                    confirmButtonColor: '#3085d6'
                });
            }
        } catch (error) {
            console.error('Error generating report:', error);
            toast.error('An error occurred while generating the report');
        } finally {
            setIsGenerating(false);
        }
    };

    // Reset / Cancel
    const handleCancel = () => {
        reset({
            ASMAY_Id: '',
            IVRM_Month_Id: '',
            EME_Id: ''
        });
        setReportData([]);
        setSearchFilter('');
        setSelectedYearName('');
        setSelectedMonthName('');
        setSelectedExamName('');
    };

    // Filtered Report Data
    const filteredReportData = useMemo(() => {
        if (!searchFilter.trim()) return reportData;
        const q = searchFilter.toLowerCase();
        return reportData.filter((item) =>
            (item.asmcL_ClassName || '').toLowerCase().includes(q)
        );
    }, [reportData, searchFilter]);

    // Aggregate Totals
    const totals = useMemo(() => {
        let totalPass = 0;
        let totalFail = 0;
        filteredReportData.forEach((item) => {
            totalPass += Number(item.pass || 0);
            totalFail += Number(item.fail || 0);
        });
        const grandTotal = totalPass + totalFail;
        const overallPassRate =
            grandTotal > 0 ? ((totalPass / grandTotal) * 100).toFixed(1) : '0.0';

        return {
            totalPass,
            totalFail,
            grandTotal,
            overallPassRate
        };
    }, [filteredReportData]);

    // Chart Data
    const chartData = useMemo(() => {
        return filteredReportData.map((item) => ({
            name: item.asmcL_ClassName || 'Course',
            PASS: Number(item.pass || 0),
            FAIL: Number(item.fail || 0)
        }));
    }, [filteredReportData]);

    // Print Handler
    const handlePrint = () => {
        if (reportData.length === 0) {
            toast.error('Please generate report data before printing');
            return;
        }

        const printWindow = window.open('', '_blank', 'width=1100,height=900');
        if (!printWindow) {
            toast.error('Pop-up blocked. Please allow pop-ups for this site to print.');
            return;
        }

        const currentDateStr = new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });

        const tableRowsHtml = reportData
            .map(
                (item, index) => `
                <tr>
                    <td style="text-align: center;">${index + 1}</td>
                    <td style="text-align: left; font-weight: 500;">${item.asmcL_ClassName}</td>
                    <td style="text-align: center; color: #16a34a; font-weight: 600;">${item.pass}</td>
                    <td style="text-align: center; color: #dc2626; font-weight: 600;">${item.fail}</td>
                </tr>
            `
            )
            .join('');

        const printHtml = `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Exam Month End Report</title>
                    <style>
                        @page { size: A4 portrait; margin: 12mm; }
                        * { box-sizing: border-box; }
                        body {
                            font-family: Arial, Helvetica, sans-serif;
                            color: #1f2937;
                            margin: 0;
                            padding: 0;
                            font-size: 12px;
                        }
                        .header-container {
                            text-align: center;
                            border-bottom: 2px solid #e5e7eb;
                            padding-bottom: 12px;
                            margin-bottom: 16px;
                        }
                        .institution-title {
                            font-size: 20px;
                            font-weight: bold;
                            color: #1e3a8a;
                            margin: 0 0 4px 0;
                            text-transform: uppercase;
                        }
                        .report-title {
                            font-size: 15px;
                            font-weight: bold;
                            color: #111827;
                            margin: 6px 0 2px 0;
                        }
                        .sub-title {
                            font-size: 13px;
                            font-weight: 600;
                            color: #2563eb;
                            margin: 0;
                        }
                        .meta-box {
                            width: 100%;
                            border: 1px solid #e5e7eb;
                            background-color: #f9fafb;
                            border-radius: 6px;
                            padding: 10px 14px;
                            margin-bottom: 16px;
                        }
                        .meta-row {
                            display: flex;
                            justify-content: space-between;
                            margin-bottom: 6px;
                        }
                        .meta-row:last-child {
                            margin-bottom: 0;
                        }
                        .meta-item {
                            width: 48%;
                            display: flex;
                        }
                        .meta-label {
                            font-weight: bold;
                            width: 140px;
                            color: #4b5563;
                        }
                        .meta-value {
                            font-weight: 600;
                            color: #111827;
                        }
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-bottom: 20px;
                        }
                        th, td {
                            border: 1px solid #d1d5db;
                            padding: 7px 10px;
                            font-size: 12px;
                        }
                        th {
                            background-color: #f3f4f6;
                            font-weight: bold;
                            text-align: center;
                            color: #374151;
                        }
                        .total-row td {
                            font-weight: bold;
                            background-color: #f9fafb;
                        }
                        .footer-section {
                            margin-top: 40px;
                            page-break-inside: avoid;
                        }
                        .sig-row {
                            display: flex;
                            justify-content: space-between;
                            margin-bottom: 35px;
                        }
                        .sig-item {
                            width: 45%;
                            font-weight: 600;
                            color: #374151;
                        }
                    </style>
                </head>
                <body>
                    <div class="header-container">
                        <h1 class="institution-title">Exam Month End Report</h1>
                        <div class="report-title">EXAM MODULE</div>
                        <div class="sub-title">${selectedExamName ? `${selectedExamName} - ` : ''}Exam ${selectedMonthName || ''} Month End Report</div>
                    </div>

                    <div class="meta-box">
                        <div class="meta-row">
                            <div class="meta-item">
                                <span class="meta-label">Designation:</span>
                                <span class="meta-value">Implementation Engineer</span>
                            </div>
                            <div class="meta-item">
                                <span class="meta-label">Date:</span>
                                <span class="meta-value">${currentDateStr}</span>
                            </div>
                        </div>
                        <div class="meta-row">
                            <div class="meta-item">
                                <span class="meta-label">Academic Year:</span>
                                <span class="meta-value">${selectedYearName || 'N/A'}</span>
                            </div>
                            <div class="meta-item">
                                <span class="meta-label">Month:</span>
                                <span class="meta-value">${selectedMonthName || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th style="width: 10%;">Sl No.</th>
                                <th style="text-align: left;">Course</th>
                                <th style="width: 20%;">Pass</th>
                                <th style="width: 20%;">Fail</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRowsHtml}
                            <tr class="total-row">
                                <td colspan="2" style="text-align: right; padding-right: 15px;">Grand Total:</td>
                                <td style="text-align: center; color: #16a34a;">${totals.totalPass}</td>
                                <td style="text-align: center; color: #dc2626;">${totals.totalFail}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div class="footer-section">
                        <div class="sig-row">
                            <div class="sig-item">
                                Implementation Engineer: ___________________
                            </div>
                            <div class="sig-item" style="text-align: right;">
                                Nodal Officer: ___________________
                            </div>
                        </div>
                        <div class="sig-row" style="margin-bottom: 0;">
                            <div class="sig-item">
                                End User: ___________________
                            </div>
                            <div class="sig-item" style="text-align: right;">
                                Seal & Signature
                            </div>
                        </div>
                    </div>

                    <script>
                        window.onload = function() {
                            window.print();
                            window.onafterprint = function() { window.close(); };
                        };
                    </script>
                </body>
            </html>
        `;

        printWindow.document.open();
        printWindow.document.write(printHtml);
        printWindow.document.close();
    };

    const currentDateDisplay = useMemo(() => {
        return new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    }, []);

    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8 space-y-6">
            {/* Header Title Card */}
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        College Exam Month End Report
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Generate and review month-end exam performance analytics and course-wise pass/fail metrics.
                    </p>
                </div>
            </div>

            {/* Filter Selection Form Card */}
            <Card className="border shadow-sm">
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                        <FileSpreadsheet className="h-5 w-5 text-primary" />
                        Report Criteria Selection
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            {/* Academic Year */}
                            <div className="space-y-2">
                                <Label htmlFor="ASMAY_Id" className="text-sm font-medium">
                                    Academic Year <span className="text-destructive">*</span>
                                </Label>
                                <Controller
                                    name="ASMAY_Id"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            disabled={isInitialLoading}
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger id="ASMAY_Id" className="w-full">
                                                <SelectValue placeholder={isInitialLoading ? 'Loading years...' : 'Select Academic Year'} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {academicYears.length === 0 ? (
                                                    <SelectItem value="0" disabled>
                                                        No Academic Years found
                                                    </SelectItem>
                                                ) : (
                                                    academicYears.map((year: any, idx: number) => {
                                                        const id = typeof year === 'object' ? (year.asmaY_Id ?? year.ASMAY_Id ?? year.id ?? (idx + 1)) : (idx + 1);
                                                        const name = typeof year === 'object' ? (year.asmaY_Year ?? year.ASMAY_Year ?? year.asmaY_YearName ?? year.year ?? `Year ${id}`) : String(year);
                                                        return (
                                                            <SelectItem
                                                                key={String(id)}
                                                                value={String(id)}
                                                            >
                                                                {name}
                                                            </SelectItem>
                                                        );
                                                    })
                                                )}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.ASMAY_Id && (
                                    <FormError>{errors.ASMAY_Id.message}</FormError>
                                )}
                            </div>

                            {/* Month */}
                            <div className="space-y-2">
                                <Label htmlFor="IVRM_Month_Id" className="text-sm font-medium">
                                    Month <span className="text-destructive">*</span>
                                </Label>
                                <Controller
                                    name="IVRM_Month_Id"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            disabled={isInitialLoading}
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger id="IVRM_Month_Id" className="w-full">
                                                <SelectValue placeholder={isInitialLoading ? 'Loading months...' : 'Select Month'} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {months.length === 0 ? (
                                                    <SelectItem value="0" disabled>
                                                        No Months found
                                                    </SelectItem>
                                                ) : (
                                                    months.map((m: any, idx: number) => {
                                                        const id = typeof m === 'object' ? (m.ivrM_Month_Id ?? m.IVRM_Month_Id ?? m.id ?? (idx + 1)) : (idx + 1);
                                                        const name = typeof m === 'object' ? (m.ivrM_Month_Name ?? m.IVRM_Month_Name ?? m.monthname ?? m.monthName ?? `Month ${id}`) : String(m);
                                                        return (
                                                            <SelectItem
                                                                key={String(id)}
                                                                value={String(id)}
                                                            >
                                                                {name}
                                                            </SelectItem>
                                                        );
                                                    })
                                                )}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.IVRM_Month_Id && (
                                    <FormError>{errors.IVRM_Month_Id.message}</FormError>
                                )}
                            </div>

                            {/* Exam */}
                            <div className="space-y-2">
                                <Label htmlFor="EME_Id" className="text-sm font-medium">
                                    Exam <span className="text-destructive">*</span>
                                </Label>
                                <Controller
                                    name="EME_Id"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            disabled={isInitialLoading}
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger id="EME_Id" className="w-full">
                                                <SelectValue placeholder={isInitialLoading ? 'Loading exams...' : 'Select Exam'} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {exams.length === 0 ? (
                                                    <SelectItem value="0" disabled>
                                                        No Exams found
                                                    </SelectItem>
                                                ) : (
                                                    exams.map((exm: any, idx: number) => {
                                                        const id = typeof exm === 'object'
                                                            ? (exm.emE_Id ?? exm.EME_Id ?? exm.id ?? exm.eme_id ?? exm.examId ?? exm.exam_id ?? (idx + 1))
                                                            : (idx + 1);
                                                        const name = typeof exm === 'object'
                                                            ? (exm.emE_ExamName ?? exm.EME_ExamName ?? exm.examName ?? exm.examname ?? exm.exam_name ?? exm.emE_ExamCode ?? exm.EME_ExamCode ?? exm.name ?? `Exam ${id}`)
                                                            : String(exm);
                                                        return (
                                                            <SelectItem
                                                                key={String(id)}
                                                                value={String(id)}
                                                            >
                                                                {name}
                                                            </SelectItem>
                                                        );
                                                    })
                                                )}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.EME_Id && (
                                    <FormError>{errors.EME_Id.message}</FormError>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-row flex-wrap items-center justify-center gap-4 border-t pt-4 w-full">
                            <Button
                                type="submit"
                                disabled={isGenerating || isInitialLoading}
                                className="w-auto min-w-[120px]"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <FileText className="mr-2 h-4 w-4" />
                                        Report
                                    </>
                                )}
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancel}
                                disabled={isGenerating}
                                className="w-auto min-w-[100px]"
                            >
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Cancel
                            </Button>

                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handlePrint}
                                disabled={isGenerating || reportData.length === 0}
                                className="w-auto min-w-[100px]"
                            >
                                <Printer className="mr-2 h-4 w-4" />
                                Print
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Generated Report View Section */}
            {reportData.length > 0 && (
                <div ref={reportContainerRef} className="space-y-6">
                    {/* Summary Metadata Banner */}
                    <Card className="border-l-4 border-l-primary shadow-sm">
                        <CardHeader className="pb-3">
                            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                <CardTitle className="text-xl font-bold text-primary">
                                    Exam {selectedMonthName} Month End Report
                                </CardTitle>
                                <Badge variant="secondary" className="w-fit text-sm">
                                    {selectedExamName || 'Exam Report'}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 md:grid-cols-4">
                                <div className="rounded-lg bg-muted/50 p-3">
                                    <p className="text-xs text-muted-foreground">Designation</p>
                                    <p className="font-semibold text-foreground">Implementation Engineer</p>
                                </div>
                                <div className="rounded-lg bg-muted/50 p-3">
                                    <p className="text-xs text-muted-foreground">Report Date</p>
                                    <p className="font-semibold text-foreground">{currentDateDisplay}</p>
                                </div>
                                <div className="rounded-lg bg-muted/50 p-3">
                                    <p className="text-xs text-muted-foreground">Academic Year</p>
                                    <p className="font-semibold text-foreground">{selectedYearName || 'N/A'}</p>
                                </div>
                                <div className="rounded-lg bg-muted/50 p-3">
                                    <p className="text-xs text-muted-foreground">Month</p>
                                    <p className="font-semibold text-foreground">{selectedMonthName || 'N/A'}</p>
                                </div>
                            </div>

                            {/* Stat Counters */}
                            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                                <div className="flex items-center gap-3 rounded-lg border bg-card p-3 shadow-sm">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <GraduationCap className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Total Courses</p>
                                        <p className="text-lg font-bold">{filteredReportData.length}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 rounded-lg border bg-card p-3 shadow-sm">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 text-green-600 dark:text-green-400">
                                        <CheckCircle2 className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Total Passed</p>
                                        <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                            {totals.totalPass}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 rounded-lg border bg-card p-3 shadow-sm">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                                        <XCircle className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Total Failed</p>
                                        <p className="text-lg font-bold text-destructive">
                                            {totals.totalFail}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 rounded-lg border bg-card p-3 shadow-sm">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                        <TrendingUp className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Overall Pass Rate</p>
                                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                            {totals.overallPassRate}%
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Report Table Card */}
                    <Card className="border shadow-sm">
                        <CardHeader className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-center sm:justify-between">
                            <CardTitle className="text-lg font-semibold">Course Performance Details</CardTitle>
                            <div className="relative w-full max-w-xs">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Filter courses..."
                                    value={searchFilter}
                                    onChange={(e) => setSearchFilter(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
                                            <TableHead className="w-[80px] text-center font-bold">
                                                Sl No.
                                            </TableHead>
                                            <TableHead className="font-bold">Course / Class</TableHead>
                                            <TableHead className="w-[140px] text-center font-bold text-green-600 dark:text-green-400">
                                                Pass
                                            </TableHead>
                                            <TableHead className="w-[140px] text-center font-bold text-destructive">
                                                Fail
                                            </TableHead>
                                            <TableHead className="w-[140px] text-center font-bold">
                                                Total
                                            </TableHead>
                                            <TableHead className="w-[140px] text-center font-bold">
                                                Pass Rate
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredReportData.map((row, index) => {
                                            const passCount = Number(row.pass || 0);
                                            const failCount = Number(row.fail || 0);
                                            const totalCount = passCount + failCount;
                                            const passPct =
                                                totalCount > 0
                                                    ? Math.round((passCount / totalCount) * 100)
                                                    : 0;

                                            return (
                                                <TableRow key={index} className="hover:bg-muted/30">
                                                    <TableCell className="text-center font-medium text-muted-foreground">
                                                        {index + 1}
                                                    </TableCell>
                                                    <TableCell className="font-semibold text-foreground">
                                                        {row.asmcL_ClassName}
                                                    </TableCell>
                                                    <TableCell className="text-center font-semibold text-green-600 dark:text-green-400">
                                                        {passCount}
                                                    </TableCell>
                                                    <TableCell className="text-center font-semibold text-destructive">
                                                        {failCount}
                                                    </TableCell>
                                                    <TableCell className="text-center font-medium">
                                                        {totalCount}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge
                                                            variant={passPct >= 50 ? 'default' : 'destructive'}
                                                            className="font-medium"
                                                        >
                                                            {passPct}%
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                    <TableFooter>
                                        <TableRow className="bg-muted/70 font-bold">
                                            <TableCell colSpan={2} className="text-right">
                                                Grand Total:
                                            </TableCell>
                                            <TableCell className="text-center text-green-600 dark:text-green-400">
                                                {totals.totalPass}
                                            </TableCell>
                                            <TableCell className="text-center text-destructive">
                                                {totals.totalFail}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {totals.grandTotal}
                                            </TableCell>
                                            <TableCell className="text-center text-primary">
                                                {totals.overallPassRate}%
                                            </TableCell>
                                        </TableRow>
                                    </TableFooter>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Graphical Analysis Section */}
                    <Card className="border shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                                <BarChart3 className="h-5 w-5 text-primary" />
                                Graphical Analysis of Exam Month End Report
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ExamReportChart data={chartData} />
                        </CardContent>
                    </Card>

                    {/* Signatures and Footer Display */}
                    <Card className="border border-dashed shadow-sm">
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                <div className="space-y-4">
                                    <p className="text-sm font-semibold text-foreground">Implementation Engineer</p>
                                    <div className="border-b border-muted-foreground/40 pt-4" />
                                </div>
                                <div className="space-y-4">
                                    <p className="text-sm font-semibold text-foreground">Nodal Officer</p>
                                    <div className="border-b border-muted-foreground/40 pt-4" />
                                </div>
                                <div className="space-y-4">
                                    <p className="text-sm font-semibold text-foreground">End User</p>
                                    <div className="border-b border-muted-foreground/40 pt-4" />
                                </div>
                                <div className="space-y-4">
                                    <p className="text-sm font-semibold text-foreground">Official Seal</p>
                                    <div className="border-b border-muted-foreground/40 pt-4" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
