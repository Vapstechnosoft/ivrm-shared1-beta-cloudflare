'use client';

import { useAcademicYearDropdown, useMasterTermsDropdowndataOnlinegroupheadmapping } from '@/hooks/fees/useMasters';
import { useFeeClassListDefaulterreport, useFeeSectionListDefaulterreport } from '@/hooks/fees/useReports';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FormError } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { feeClassWiseDueListReportSophia } from '@/schemas/fees/reports';
import { feeClassWiseDueListreportSophia } from '@/server/fees/reports/sophia_reports';
import type { IFeeClassDropdownList, IFeeSectionDropdownList } from '@/types/fees/reports/reports';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import { exportToExcel } from './excelandprint';

type FormFields = z.infer<typeof feeClassWiseDueListReportSophia>;

interface IAcademicYear {
    asmaY_Id: string | number;
    asmaY_Year: string;
    asmaY_Order?: number;
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

// Group key interface

export default function FeeClassWiseDueListReportofSophia() {
    const {
        handleSubmit,
        setValue,
        control,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(feeClassWiseDueListReportSophia),
        defaultValues: {
            academicYearId: undefined,
            classId: undefined,
            sectionId: undefined,
            termId: undefined,
            classwise: false,
            dateWise: false,
            termWise: false,
            active: false,
            deactive: false,
            left: false,
            fromDate: format(new Date(), 'yyyy-MM-dd'),
            toDate: format(new Date(), 'yyyy-MM-dd')
        }
    });
    const classWiseChecked = watch('classwise');
    const dateWiseChecked = watch('dateWise');
    const termWiseChecked = watch('termWise');
    const selectedClassId = watch('classId');
    const selctedAcademicYearId = watch('academicYearId');
    const selectedTermId = watch('termId');
    const selectedSectionId = watch('sectionId');

    const [academicYears, setAcademicYears] = useState<IAcademicYear[]>([]);
    const [classes, setClasses] = useState<IFeeClassDropdownList[]>([]);
    const [sections, setSections] = useState<IFeeSectionDropdownList[]>([]);
    const [reportData, setReportData] = useState<IFeeClassWiseDueListReportofSophia[]>([]);
    // const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const { data: academicData, isLoading: loadingAcademic, error: academicError } = useAcademicYearDropdown();

    const { data: classListResponse, isLoading: loadingClasses, error: classListError } = useFeeClassListDefaulterreport();

    const { data: sectionListResponse, isLoading: loadingSections, error: sectionListError } = useFeeSectionListDefaulterreport();

    const { data: masterTerms, isLoading: masterTermsLoading } = useMasterTermsDropdowndataOnlinegroupheadmapping();

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

        // Sort groups by class name
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

    useEffect(() => {
        if (classListError) {
            toast.error(classListError?.message || 'Failed to load classes');
            setClasses([]);
            return;
        }
        if (classListResponse?.data && Array.isArray(classListResponse.data)) {
            setClasses(classListResponse.data);
        }
    }, [classListResponse, classListError]);

    useEffect(() => {
        if (sectionListError) {
            toast.error(sectionListError?.message || 'Failed to load Sections');
            setSections([]);
            return;
        }
        if (sectionListResponse?.data && Array.isArray(sectionListResponse.data)) {
            setSections(sectionListResponse.data);
        }
    }, [sectionListResponse, sectionListError]);

    useEffect(() => {
        setReportData([]);
        // setSelectedIds([]);
    }, [selctedAcademicYearId, selectedClassId, selectedSectionId, selectedTermId, classWiseChecked, dateWiseChecked, termWiseChecked]);

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        setReportData([]);
        // setSelectedIds([]);
        if (data.active === false && data.deactive === false && data.left === false) {
            toast.error('Please Select Any One CheckBox Active or Deactive or Left ..');
            return;
        }
        try {
            const payload = {
                classlist: data.classwise === true ? [data.classId] : [],
                sectionlist: data.classwise === true ? [data.sectionId] : [],
                fromdate: data.dateWise === true ? data.fromDate : '',
                todate: data.dateWise === true ? data.toDate : '',
                fmT_Ids: data.termWise === true ? [data.termId] : [],
                customflag: 'DUELIST',
                asmaY_Id: data.academicYearId,
                radioval: '',
                active: data.active === true ? 1 : 0,
                deactive: data.deactive === true ? 1 : 0,
                left: data.left === true ? 1 : 0
            };

            const apiData = await feeClassWiseDueListreportSophia(payload);
            const responseJson = typeof apiData === 'string' ? JSON.parse(apiData) : apiData;
            if (responseJson?.data) {
                setReportData(responseJson.data);
                toast.success('Report Generated Successfully');
            }
        } catch (error: any) {
            console.error('Error generating report:', error);
            toast.error(error.message || 'Failed to generate report');
        }
    };

    // const toggleAllstudents = () => {
    //     if (selectedIds.length === reportData.length) {
    //         setSelectedIds([]);
    //     } else {
    //         setSelectedIds(reportData.map((r) => r.id));
    //     }
    // };

    // const toggleRow = (id: number) => {
    //     setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    // };

    // const toggleAllInGroup = (studentIds: number[]) => {
    //     const allSelected = studentIds.every((id) => selectedIds.includes(id));
    //     if (allSelected) {
    //         setSelectedIds((prev) => prev.filter((id) => !studentIds.includes(id)));
    //     } else {
    //         setSelectedIds((prev) => [...prev, ...studentIds.filter((id) => !prev.includes(id))]);
    //     }
    // };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };
    const handleExport = () => {
        exportToExcel(groupedReportData, 'Fee Class Wise Due List Report');
    };

    // Update your printTable function to handle grouped data
    const handlePrint = () => {
        // Create a print window with the grouped report structure
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Please allow pop-ups to print the report');
            return;
        }

        const currentDate = new Date().toLocaleDateString();

        // Build HTML content for printing
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

        // Loop through each group
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

            // Add student rows
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

            // Add group totals row
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

            // Add page break between groups (except after the last group)
            if (groupIndex < groupedReportData.length - 1) {
                printContent += `<div class="page-break"></div>`;
            }
        });

        printContent += `
        </body>
        </html>
    `;

        // Write to print window and print
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
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
                                                                        {item.asmaY_Year}
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

                                    <div className='flex items-center gap-3'>
                                        <Controller
                                            name='classwise'
                                            control={control}
                                            render={({ field }) => (
                                                <input
                                                    type='checkbox'
                                                    checked={field.value ?? false}
                                                    onChange={(e) => field.onChange(e.target.checked)}
                                                    className='h-4 w-4'
                                                />
                                            )}
                                        />
                                        <Label className='font-medium'>Class Wise</Label>
                                    </div>
                                    <div className='flex items-center gap-3'>
                                        <Controller
                                            name='dateWise'
                                            control={control}
                                            render={({ field }) => (
                                                <input
                                                    type='checkbox'
                                                    checked={field.value ?? false}
                                                    onChange={(e) => field.onChange(e.target.checked)}
                                                    className='h-4 w-4'
                                                />
                                            )}
                                        />
                                        <Label className='font-medium'>Date Wise</Label>
                                    </div>
                                    <div className='flex items-center gap-3'>
                                        <Controller
                                            name='termWise'
                                            control={control}
                                            render={({ field }) => (
                                                <input
                                                    type='checkbox'
                                                    checked={field.value ?? false}
                                                    onChange={(e) => field.onChange(e.target.checked)}
                                                    className='h-4 w-4'
                                                />
                                            )}
                                        />
                                        <Label className='font-medium'>Term Wise</Label>
                                    </div>
                                </div>

                                {/* Dates */}
                                {dateWiseChecked && (
                                    <div className='flex items-center gap-12'>
                                        <div className='flex w-[420px] items-center gap-4'>
                                            <Label htmlFor='fromDate'>
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

                                        <div className='flex w-[420px] items-center gap-4'>
                                            <Label htmlFor='toDate'>
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
                                )}

                                {classWiseChecked && (
                                    <div className='mt-4 flex items-center gap-12'>
                                        {/* Class */}
                                        <div className='flex w-[420px] items-center gap-4'>
                                            <Label className='w-36 text-right'>
                                                Class <span className='text-red-500'>*</span>
                                            </Label>

                                            <div className='flex-1'>
                                                <Controller
                                                    name='classId'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select
                                                            value={field.value && field.value !== 0 ? field.value.toString() : ''}
                                                            onValueChange={(v) => {
                                                                field.onChange(Number(v));
                                                                setValue('sectionId', 0);
                                                            }}>
                                                            <SelectTrigger className='w-full'>
                                                                <SelectValue placeholder='--Select Class--' />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {loadingClasses ? (
                                                                    <SelectItem value='loading' disabled>
                                                                        Loading...
                                                                    </SelectItem>
                                                                ) : (
                                                                    classes.map((cls) => (
                                                                        <SelectItem key={cls.asmcL_Id} value={cls.asmcL_Id.toString()}>
                                                                            {cls.asmcL_ClassName}
                                                                        </SelectItem>
                                                                    ))
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                                {errors.classId && <FormError>{errors.classId.message}</FormError>}
                                            </div>
                                        </div>

                                        {/* Section */}
                                        <div className='flex w-[420px] items-center gap-4'>
                                            <Label className='w-36 text-right'>
                                                Section <span className='text-red-500'>*</span>
                                            </Label>

                                            <div className='flex-1'>
                                                <Controller
                                                    name='sectionId'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select
                                                            value={field.value && field.value !== 0 ? field.value.toString() : ''}
                                                            onValueChange={(v) => field.onChange(Number(v))}>
                                                            <SelectTrigger className='w-full'>
                                                                <SelectValue placeholder='--All--' />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {loadingSections ? (
                                                                    <SelectItem value='loading' disabled>
                                                                        Loading...
                                                                    </SelectItem>
                                                                ) : (
                                                                    sections.map((sec) => (
                                                                        <SelectItem key={sec.asmS_Id} value={sec.asmS_Id.toString()}>
                                                                            {sec.asmC_SectionName}
                                                                        </SelectItem>
                                                                    ))
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                                {errors.sectionId && <FormError>{errors.sectionId.message}</FormError>}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {termWiseChecked && (
                                    <div className='mt-4 flex items-center gap-12'>
                                        <div className='flex w-[420px] items-center gap-4'>
                                            <Label className='w-36 text-right'>
                                                Term <span className='text-red-500'>*</span>
                                            </Label>

                                            <div className='flex-1'>
                                                <Controller
                                                    name='termId'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select
                                                            value={field.value && field.value !== 0 ? field.value.toString() : ''}
                                                            onValueChange={(v) => {
                                                                field.onChange(Number(v));
                                                            }}>
                                                            <SelectTrigger className='w-full'>
                                                                <SelectValue placeholder='--Select term--' />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {masterTermsLoading ? (
                                                                    <SelectItem value='loading' disabled>
                                                                        Loading...
                                                                    </SelectItem>
                                                                ) : (
                                                                    masterTerms?.data?.map((cls) => (
                                                                        <SelectItem key={cls.fmT_Id} value={cls.fmT_Id.toString()}>
                                                                            {cls.fmT_Name}
                                                                        </SelectItem>
                                                                    ))
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                                {errors.termId && <FormError>{errors.termId.message}</FormError>}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <Card>
                                    <div className='flex items-center justify-center gap-12 p-5'>
                                        <div className='flex items-center gap-12'>
                                            <div className='flex items-center gap-3'>
                                                <Controller
                                                    name='active'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <input
                                                            type='checkbox'
                                                            checked={field.value ?? false}
                                                            onChange={(e) => field.onChange(e.target.checked)}
                                                            className='h-4 w-4'
                                                        />
                                                    )}
                                                />
                                                <Label className='font-medium'>Active</Label>
                                            </div>
                                            <div className='flex items-center gap-3'>
                                                <Controller
                                                    name='deactive'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <input
                                                            type='checkbox'
                                                            checked={field.value ?? false}
                                                            onChange={(e) => field.onChange(e.target.checked)}
                                                            className='h-4 w-4'
                                                        />
                                                    )}
                                                />
                                                <Label className='font-medium'>Deactive</Label>
                                            </div>
                                            <div className='flex items-center gap-3'>
                                                <Controller
                                                    name='left'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <input
                                                            type='checkbox'
                                                            checked={field.value ?? false}
                                                            onChange={(e) => field.onChange(e.target.checked)}
                                                            className='h-4 w-4'
                                                        />
                                                    )}
                                                />
                                                <Label className='font-medium'>Left</Label>
                                            </div>
                                        </div>
                                    </div>
                                </Card>

                                <div>
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
                                            {isSubmitting ? 'Generating...' : 'Report'}
                                        </Button>
                                    </div>

                                    {reportData.length > 0 && (
                                        <div className='mt-10'>
                                            <CollapsibleSection
                                                defaultOpen={true}
                                                variant='default'
                                                size='lg'
                                                className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                                                <div className='flex items-center justify-between border-b bg-primary/5 px-8 py-6'>
                                                    <div className='text-center'>
                                                        <h2 className='font-bold text-2xl text-primary'>Fee Class Wise Due Report</h2>
                                                        <p className='mt-1 text-gray-500 text-sm'>
                                                            {dateWiseChecked && `From: ${watch('fromDate')} To: ${watch('toDate')}`}
                                                        </p>
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
                                                    {/* Render each group */}
                                                    {groupedReportData.map((group) => {
                                                        const groupTotals = calculateGroupTotals(group.students);
                                                        // const studentIds = group.students.map((s) => s.id);
                                                        // const allSelectedInGroup = studentIds.every((id) => selectedIds.includes(id));

                                                        return (
                                                            <div key={`${group.className}-${group.sectionName}`} className='mb-8'>
                                                                {/* Group Header */}
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

                                                                {/* Group Table */}
                                                                <div className='overflow-x-auto rounded-b-lg border'>
                                                                    <table className='w-full border-collapse text-sm'>
                                                                        <thead className='bg-gray-200'>
                                                                            <tr>
                                                                                {/* <th className='w-10 p-2 text-center'>
                                                                                    <Checkbox
                                                                                        checked={
                                                                                            allSelectedInGroup && group.students.length > 0
                                                                                        }
                                                                                        onCheckedChange={() => toggleAllInGroup(studentIds)}
                                                                                    />
                                                                                </th> */}
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
                                                                                    {/* <td className='p-2 text-center'>
                                                                                        <Checkbox
                                                                                            checked={selectedIds.includes(row.id)}
                                                                                            onCheckedChange={() => toggleRow(row.id)}
                                                                                        />
                                                                                    </td> */}
                                                                                    <td className='border px-2 py-2 text-center'>
                                                                                        {idx + 1}
                                                                                    </td>
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
                                                                        {/* Group Footer with Totals */}
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
