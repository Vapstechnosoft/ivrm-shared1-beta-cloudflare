'use client';

import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import { useFeeClassListDefaulterreport, useFeeSectionListDefaulterreport } from '@/hooks/fees/useReports';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Checkbox } from '@/components/ui/checkbox';
import { FormError } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Input } from '@/components/ui/input';
import { feeStudentandAccountWiseReportSophia } from '@/schemas/fees/reports';
import { feeClassWiseDueListreportSophia } from '@/server/fees/reports/sophia_reports';
import type { IFeeClassDropdownList, IFeeSectionDropdownList } from '@/types/fees/reports/reports';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import { exportToExcel, printTable } from './excelandprint';

type FormFields = z.infer<typeof feeStudentandAccountWiseReportSophia>;

interface IAcademicYear {
    asmaY_Id: string | number;
    asmaY_Year: string;
    asmaY_Order?: number;
}
export interface ReportData {
    id: number;
    amsT_AdmNo: string;
    studentname: string;
    asmcL_ClassName: string;
    paymentDate: string;
    accountWiseAmounts: AccountWiseAmounts;
    totalPaidAmount: number;
}

export interface AccountWiseAmounts {
    accountName: '2207020304';
}

export default function FeeStudentandAccountwiseReportofSophia() {
    const {
        handleSubmit,
        setValue,
        control,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(feeStudentandAccountWiseReportSophia),
        defaultValues: {
            academicYearId: undefined,
            classId: undefined,
            sectionId: undefined,
            classwise: false,
            dateWise: false,
            fromDate: format(new Date(), 'yyyy-MM-dd'),
            toDate: format(new Date(), 'yyyy-MM-dd')
        }
    });

    const classWiseChecked = watch('classwise');
    const dateWiseChecked = watch('dateWise');
    // const selectedClassId = watch("classId");

    const [academicYears, setAcademicYears] = useState<IAcademicYear[]>([]);
    const [classes, setClasses] = useState<IFeeClassDropdownList[]>([]);
    const [sections, setSections] = useState<IFeeSectionDropdownList[]>([]);
    const [reportData, setReportData] = useState<ReportData[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    // biome-ignore lint/correctness/noUnusedVariables: <explanation>
    const [showReport, setShowReport] = useState(false);

    const { data: academicData, isLoading: loadingAcademic, error: academicError } = useAcademicYearDropdown();

    const { data: classListResponse, isLoading: loadingClasses, error: classListError } = useFeeClassListDefaulterreport();

    const { data: sectionListResponse, isLoading: loadingSections, error: sectionListError } = useFeeSectionListDefaulterreport();

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
            setClasses([]);
            return;
        }
        if (sectionListResponse?.data && Array.isArray(sectionListResponse.data)) {
            setSections(sectionListResponse.data);
        }
    }, [classListResponse, sectionListError]);
    const toggleAllstudents = () => {
        if (selectedIds.length === reportData.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(reportData.map((r) => r.id));
        }
    };
    const toggleRow = (id: number) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };
    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        setShowReport(false);
        try {
            const payload = {
                classlist: data.classwise === true ? [data.classId] : [],
                sectionlist: data.classwise === true ? [data.sectionId] : [],
                fromdate: data.dateWise === true ? data.fromDate : '',
                todate: data.dateWise === true ? data.toDate : '',
                fmT_Ids: [],
                customflag: 'ACCOUNTWISE',
                asmaY_Id: data.academicYearId,
                radioval: '',
                active: 0,
                deactive: 0,
                left: 0
            };

            const apiData = await feeClassWiseDueListreportSophia(payload);
            // biome-ignore lint/suspicious/noConsoleLog: <explanation>
            console.log('apiData', apiData);
            const responseJson = typeof apiData === 'string' ? JSON.parse(apiData) : apiData;
            if (responseJson?.data) {
                const report = responseJson.data ?? [];
                const mapApiToReportRows = (apiData: any[]): ReportData[] => {
                    return apiData.map((item, index) => ({
                        id: index + 1,
                        amsT_AdmNo: item.amsT_AdmNo,
                        studentname: item.studentname,
                        asmcL_ClassName: item.asmcL_ClassName,
                        paymentDate: item.paymentDate,
                        accountWiseAmounts: item.accountWiseAmounts,
                        totalPaidAmount: item.totalPaidAmount
                    }));
                };
                const list = mapApiToReportRows(report);

                setReportData(list || []);
                // setReportData(responseJson.data);
                setShowReport(true);
                if (list.length > 0) {
                    toast.success('Report Generated Successfully');
                } else {
                    toast.error('No Data Found');
                }
            } else {
                toast.error(responseJson.message || 'No Data Found');
            }
        } catch (error: any) {
            console.error('Error generating report:', error);
            toast.error(error.message || 'Failed to generate report');
            setShowReport(false);
        }
    };
    const selectedRows = reportData.filter((r) => selectedIds.includes(r.id));
    const handleExport = () => {
        if (!selectedRows.length) {
            toast.error('Please select at least one record');
            return;
        }
        exportToExcel(selectedRows, 'Fee Student and Account Wise Report');
    };

    const handlePrint = () => {
        const selected = reportData.filter((row) => selectedIds.includes(row.id));

        if (!selected || selected.length === 0) {
            toast.error('No data selected to print');
            return;
        }
        const columnHeaders = ['Sl No', 'Admission No', 'StudentName', 'Class & Division', 'PaymentDate', 'TotalPaidAmount'];

        const printableRows = selected.map((row, index) => {
            const baseRow = {
                'Sl No': index + 1,
                'Admission No': row.amsT_AdmNo || '',
                StudentName: row.studentname || '',
                'Class & Division': row.asmcL_ClassName || '',
                PaymentDate: row.paymentDate ? new Date(row.paymentDate).toLocaleDateString() : '',
                // "ACNO:2207020304": row.discount || "",
                TotalPaidAmount: row.totalPaidAmount || ''
            };
            return baseRow;
        });
        printTable(columnHeaders, printableRows, 'Fee Student and Account Wise Report');
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
                                                    checked={field.value ?? false} // ✅ Fixed: handle undefined
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
                                                    checked={field.value ?? false} // ✅ Fixed: handle undefined
                                                    onChange={(e) => field.onChange(e.target.checked)}
                                                    className='h-4 w-4'
                                                />
                                            )}
                                        />
                                        <Label className='font-medium'>Date Wise</Label>
                                    </div>
                                </div>

                                {/* Dates - Now controlled by react-hook-form */}
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
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </form>

            {reportData.length > 0 && (
                <div className='mx-10 mt-10'>
                    {/* Loading State */}
                    <CollapsibleSection
                        defaultOpen={true}
                        variant='default'
                        size='lg'
                        className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                        <div className='flex items-center justify-between border-b bg-primary/5 px-8 py-6'>
                            <div className='mb-6 text-center'>
                                <h2 className='font-bold text-2xl text-primary'>Fee Student and Account Wise Report</h2>
                            </div>
                            <div className='flex gap-3'>
                                <div className='mb-4 flex justify-end gap-2'>
                                    <Button size='sm' className='h-8 w-auto px-3 text-xs' onClick={handleExport}>
                                        Export Excel
                                    </Button>

                                    <Button size='sm' variant='outline' className='h-8 w-auto px-3 text-xs' onClick={handlePrint}>
                                        Print
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div>
                            {/* Table */}
                            <div className='overflow-x-auto px-8 pb-8'>
                                <table className='w-full border-collapse border border-gray-300 text-sm'>
                                    <thead className='bg-primary text-white'>
                                        <tr>
                                            <th className='p-2 text-center'>
                                                <Checkbox
                                                    checked={selectedIds.length === reportData.length && reportData.length > 0}
                                                    onCheckedChange={toggleAllstudents}
                                                />
                                            </th>
                                            <th className='border px-2 py-2 text-center font-semibold'>Sl No</th>
                                            <th className='border px-2 py-2 text-center font-semibold'>Admission No</th>
                                            <th className='border px-2 py-2 text-center font-semibold'>StudentName</th>
                                            <th className='border px-2 py-2 text-center font-semibold'>Class & Division</th>
                                            <th className='border px-2 py-2 text-center font-semibold'>PaymentDate</th>
                                            {/* <th className='border px-2 py-2 text-center font-semibold'>ACNO:2207020304</th> */}
                                            <th className='border px-2 py-2 text-center font-semibold'>TotalPaidAmount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportData.map((row, index) => (
                                            <tr key={row.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                <td className='p-2 text-center'>
                                                    <Checkbox
                                                        checked={selectedIds.includes(row.id)}
                                                        onCheckedChange={() => toggleRow(row.id)}
                                                    />
                                                </td>
                                                <td className='border px-2 py-2 text-center'>{index + 1}</td>
                                                <td className='border px-2 py-2 text-left'>{row.amsT_AdmNo}</td>
                                                <td className='border px-2 py-2 text-right'>{row.studentname || '-'}</td>
                                                <td className='border px-2 py-2 text-right'>
                                                    {row.asmcL_ClassName?.toLocaleString() || '-'}
                                                </td>
                                                <td className='border px-2 py-2 text-right'>
                                                    {row.paymentDate ? new Date(row.paymentDate).toLocaleDateString() : '-'}
                                                </td>
                                                {/* <td className='border px-2 py-2 text-right'>{row.amaY_RollNo?.toLocaleString() || '-'}</td> */}
                                                <td className='border px-2 py-2 text-right'>
                                                    {row.totalPaidAmount?.toLocaleString() || '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </CollapsibleSection>
                </div>
            )}
        </div>
    );
}
