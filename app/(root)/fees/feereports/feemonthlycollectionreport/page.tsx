'use client';

import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import { useFeeCustomGroupDefaulterreport, useFeeGroupDefaulterreport, useFeeTermDefaulterreport } from '@/hooks/fees/useReports';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox as BaseCheckbox } from '@/components/ui/checkbox';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { FormError } from '@/components/ui/extension/field';
import { feeMonthlyCollectionReportSchema } from '@/schemas/fees/reports';
import { getMonthlyFeeCollectionReport } from '@/server/fees/reports/fee_DefaulterReport';
import { getStudentdetails } from '@/server/fees/trasactions/waived_off';
import type { IFeeCustomGroupDropdownList, IFeeGroupDropdownList, IFeeTermDropdownList } from '@/types/fees/reports/reports';
import type { feeTransactionWaivedOffStudentDetails } from '@/types/fees/transactions/transactions';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import { exportToExcelforFeeGroupWise, printTable } from './_components/columns';

type FormFields = z.infer<typeof feeMonthlyCollectionReportSchema>;

const Checkbox = ({ checked, indeterminate, onCheckedChange, ...props }: any) => {
    const ref = useRef<HTMLButtonElement>(null);

    return <BaseCheckbox ref={ref} checked={checked} onCheckedChange={onCheckedChange} {...props} />;
};

interface IAcademicYear {
    asmaY_Id: string | number;
    asmaY_Year: string;
    asmaY_Order?: number;
}

interface IMonthlyCollectionReport {
    id: number;
    amsT_Id: number;
    admNo: string;
    regno: string;
    studentName: string;
    aaa: number;
    aa: string;
    receiptDetails: string;
    jan: number;
    feb: number;
    mar: number;
    apr: number;
    may: number;
    jun: number;
    jul: number;
    aug: number;
    sep: number;
    oct: number;
    nov: number;
    dec: number;
    total: number;
    [key: string]: any;
}
const today = new Date().toISOString().split('T')[0];
export default function FeeDefaulterReport() {
    const {
        handleSubmit,
        setValue,
        control,
        watch,
        register,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(feeMonthlyCollectionReportSchema),
        defaultValues: {
            fromDate: today,
            toDate: today,
            academicYearId: undefined,
            amstId: undefined,
            customGroupIds: [],
            feeGroupIds: [],
            termIds: []
        }
    });
    const fromDateValue = watch('fromDate');
    const [filters, setFilters] = useState({
        viewMode: 'all' as 'all' | 'individual',
        filter: 'active' as 'active' | 'left',
        filter2: 'admno' as 'admno' | 'name',
        academicYearId: '',
        ischeckdate: false,
        customGroupIds: [] as number[],
        feeGroupIds: [] as number[],
        termIds: [] as number[]
    });

    const [academicYears, setAcademicYears] = useState<IAcademicYear[]>([]);
    const [feeGroups, setFeeGroups] = useState<IFeeGroupDropdownList[]>([]);
    const [feeTerms, setFeeTerms] = useState<IFeeTermDropdownList[]>([]);
    const [customGroups, setCustomGroups] = useState<IFeeCustomGroupDropdownList[]>([]);
    const [_reportData, setReportData] = useState<IMonthlyCollectionReport[]>([]);
    const [studentreportData, setstudentReportData] = useState<IMonthlyCollectionReport[]>([]);
    const [_headersName, setHeadersName] = useState<any[]>([]);
    const [reportLoading, setReportLoading] = useState(false);
    const [showReport, setShowReport] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [studentDetails, setStudentDetails] = useState<feeTransactionWaivedOffStudentDetails[]>([]);
    const [studentDetailsLoading, setStudentDetailsLoading] = useState(false);
    const [studentDetailsError, setStudentDetailsError] = useState<any>(null);
    const { data: academicData, error: academicError } = useAcademicYearDropdown();
    const academicYearId = watch('academicYearId');
    const fromDate = watch('fromDate');
    const toDate = watch('toDate');
    const feeGroupIds = watch('feeGroupIds');
    const termIds = watch('termIds');
    const fetchStudentDetails = async () => {
        if (!academicYearId) return;
        try {
            setStudentDetailsLoading(true);
            setStudentDetailsError(null);

            const res = await getStudentdetails(Number(academicYearId), 0, 0);
            setStudentDetails(res.data ?? []);
            setValue('amstId', 0);
        } catch (error) {
            console.error('Error fetching student class mapping', error);
            setStudentDetailsError(error);
        } finally {
            setStudentDetailsLoading(false);
        }
    };

    useEffect(() => {
        fetchStudentDetails();
    }, [academicYearId]);

    const { data: feegroupData, isLoading: loadingfeegroup, error: feegroupError } = useFeeGroupDefaulterreport();
    const { data: feetermData, isLoading: loadingfeeterm, error: feetermError } = useFeeTermDefaulterreport();

    const { data: customGroupResponse, isLoading: loadingCustomGroup, error: customGroupError } = useFeeCustomGroupDefaulterreport();

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
        if (feegroupError) toast.error(feegroupError?.message || 'Failed to load fee groups');
        else if (feegroupData?.data) setFeeGroups(feegroupData.data);
    }, [feegroupData, feegroupError]);

    useEffect(() => {
        if (feetermError) toast.error(feetermError?.message || 'Failed to load terms');
        else if (feetermData?.data) setFeeTerms(feetermData.data);
    }, [feetermData, feetermError]);

    useEffect(() => {
        if (customGroupError) toast.error(customGroupError?.message || 'Failed to load custom groups');
        else if (customGroupResponse?.data) setCustomGroups(customGroupResponse.data);
    }, [customGroupResponse, customGroupError]);

    const totalBalanceJan = studentreportData.reduce((sum, r) => sum + r.jan, 0);
    const totalBalanceFeb = studentreportData.reduce((sum, r) => sum + r.feb, 0);
    const totalBalanceMarch = studentreportData.reduce((sum, r) => sum + r.mar, 0);
    const totalBalanceApr = studentreportData.reduce((sum, r) => sum + r.apr, 0);
    const totalBalanceMay = studentreportData.reduce((sum, r) => sum + r.may, 0);
    const totalBalanceJun = studentreportData.reduce((sum, r) => sum + r.jun, 0);
    const totalBalanceJuly = studentreportData.reduce((sum, r) => sum + r.jul, 0);
    const totalBalanceAug = studentreportData.reduce((sum, r) => sum + r.aug, 0);
    const totalBalanceSep = studentreportData.reduce((sum, r) => sum + r.sep, 0);
    const totalBalanceOct = studentreportData.reduce((sum, r) => sum + r.oct, 0);
    const totalBalanceNov = studentreportData.reduce((sum, r) => sum + r.nov, 0);
    const totalBalanceDec = studentreportData.reduce((sum, r) => sum + r.dec, 0);
    const totalBalance = studentreportData.reduce((sum, r) => sum + r.total, 0);
    const handleExportExcelforFeeGroupWise = () => {
        exportToExcelforFeeGroupWise(studentreportData, 'Monthly_Collection_Report');
    };

    const handlePrintforFeeGroupWise = () => {
        const months = [
            { key: 'jan', display: 'January 2026' },
            { key: 'feb', display: 'February 2026' },
            { key: 'mar', display: 'March 2026' },
            { key: 'apr', display: 'April 2026' },
            { key: 'may', display: 'May 2026' },
            { key: 'jun', display: 'June 2026' },
            { key: 'jul', display: 'July 2026' },
            { key: 'aug', display: 'August 2026' },
            { key: 'sep', display: 'September 2026' },
            { key: 'oct', display: 'October 2026' },
            { key: 'nov', display: 'November 2026' },
            { key: 'dec', display: 'December 2026' }
        ];

        const columnHeaders = ['Sl.No', 'AdmoNo', 'Student Name', 'Receipt Details', ...months.map((m) => m.display), 'Total'];

        const printableRows = studentreportData.map((row, index) => {
            const rowData: any = {
                'Sl.No': index + 1,
                AdmoNo: row.admNo || '',
                'Student Name': row.studentName || '',
                'Receipt Details': row.receiptDetails || ''
            };

            months.forEach((month) => {
                rowData[month.display] = `₹${(Number.parseFloat(row[month.key]) || 0).toLocaleString('en-IN')}`;
            });

            // biome-ignore lint/complexity/useLiteralKeys: <explanation>
            rowData['Total'] = `₹${(Number.parseFloat(row.total.toString()) || 0).toLocaleString('en-IN')}`;
            return rowData;
        });

        const sumRow: any = {
            'Sl.No': '',
            AdmoNo: '',
            'Student Name': 'Total',
            'Receipt Details': ''
        };

        months.forEach((month) => {
            const total = studentreportData.reduce((sum, r) => sum + (Number.parseFloat(r[month.key]) || 0), 0);
            sumRow[month.display] = `₹${total.toLocaleString('en-IN')}`;
        });

        const grandTotal = studentreportData.reduce((sum, r) => sum + (Number.parseFloat(r.total.toString()) || 0), 0);
        // biome-ignore lint/complexity/useLiteralKeys: <explanation>
        sumRow['Total'] = `₹${grandTotal.toLocaleString('en-IN')}`;

        printTable(columnHeaders, printableRows, sumRow);
    };

    useEffect(() => {
        setReportData([]);
        setSelectedIds([]);
        setShowReport(false);
    }, [filters.academicYearId, filters.customGroupIds, filters.termIds, filters.feeGroupIds]);

    const onSubmit: SubmitHandler<FormFields> = async () => {
        setReportLoading(true);
        setShowReport(false);
        setReportData([]);
        setstudentReportData([]);

        try {
            let payload: any = {};
            payload = {
                asmaY_Id: academicYearId,
                fromdate: fromDate,
                todate: toDate,
                allorindivflag: filters.viewMode,
                idamstid: '',
                fmG_Ids: feeGroupIds || [],
                fmT_Ids: termIds || [],
                term_group: 'T',
                studenttype: filters.filter,
                chequedate: filters.ischeckdate === true ? 1 : 0
            };

            const reportArray = await getMonthlyFeeCollectionReport(payload);
            const allGridHeaders = (reportArray as any)?.data?.alldatagridreportheads;
            const studentGroupDataArray = (reportArray as any)?.data?.alldatagridreport;

            let hasData = false;
            if (studentGroupDataArray != null) {
                if (studentGroupDataArray && Array.isArray(studentGroupDataArray)) {
                    const studentData = JSON.parse(JSON.stringify(studentGroupDataArray));
                    const mapApiToReportRows = (apiData: any[]): IMonthlyCollectionReport[] => {
                        return apiData.map((item, index) => ({
                            id: index + 1,
                            amsT_Id: item.amsT_Id,
                            admNo: item.admNo,
                            regno: item.regno,
                            studentName: item.studentName,
                            aaa: item.aaa,
                            aa: item.aa,
                            receiptDetails: item.receiptDetails,
                            jan: item.jan,
                            feb: item.feb,
                            mar: item.mar,
                            apr: item.apr,
                            may: item.may,
                            jun: item.jun,
                            jul: item.jul,
                            aug: item.aug,
                            sep: item.sep,
                            oct: item.oct,
                            nov: item.nov,
                            dec: item.dec,
                            total: item.total
                        }));
                    };
                    const data = mapApiToReportRows(studentData);
                    setstudentReportData(data);
                    setHeadersName(allGridHeaders);
                    toast.success(reportArray.message);
                    if (studentData.length > 0) {
                        hasData = true;
                    }
                } else {
                    toast.info('No student data found!');
                    setstudentReportData([]);
                }
            }

            if (hasData) {
                const combinedData = [...(studentGroupDataArray || [])];
                setReportData(combinedData);
                setShowReport(true);
            } else {
                setReportData([]);
                setShowReport(false);
                toast.info('No data available for the report!');
            }
        } catch (error: any) {
            console.error('Error generating report:', error);
            toast.error(error.message || 'Failed to generate report');
            setShowReport(false);
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
                            <h1 className='mb-8 font-bold text-3xl text-gray-900'>Fee Monthly Collection Extract Register</h1>

                            <div className='space-y-8'>
                                {/* User Type Card */}

                                {/* View Mode + Academic Year */}
                                <div className='grid grid-cols-1 gap-8 md:grid-cols-4'>
                                    <Card className='border bg-gray-50 p-5 shadow-sm'>
                                        <div className='flex items-center gap-10'>
                                            {(
                                                [
                                                    { label: 'All', value: 'all' },
                                                    { label: 'Individual', value: 'individual' }
                                                ] as const
                                            ).map((mode) => (
                                                <label key={mode.value} className='flex cursor-pointer items-center gap-3'>
                                                    <input
                                                        type='radio'
                                                        name='viewMode'
                                                        checked={filters.viewMode === mode.value}
                                                        onChange={() =>
                                                            setFilters((prev) => ({
                                                                ...prev,
                                                                viewMode: mode.value
                                                            }))
                                                        }
                                                        className='h-5 w-5 text-primary'
                                                    />
                                                    <span className='font-medium text-base'>{mode.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </Card>
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
                                                        {academicYears?.map((item: any) => (
                                                            <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                                {item.asmaY_Year}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.academicYearId && (
                                            <FormError className='mt-1'>{errors.academicYearId.message}</FormError>
                                        )}{' '}
                                    </div>
                                    {filters.viewMode === 'individual' && (
                                        <div className='md:col-span-2'>
                                            <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
                                                <Card className='border bg-gray-50 p-5 shadow-sm'>
                                                    <div className='flex items-center gap-10'>
                                                        {(
                                                            [
                                                                { label: 'Adm No', value: 'admno' },
                                                                { label: 'Name', value: 'name' }
                                                            ] as const
                                                        ).map((mode) => (
                                                            <label key={mode.value} className='flex cursor-pointer items-center gap-3'>
                                                                <input
                                                                    type='radio'
                                                                    name='filter2'
                                                                    checked={filters.filter2 === mode.value}
                                                                    onChange={() =>
                                                                        setFilters((prev) => ({
                                                                            ...prev,
                                                                            filter2: mode.value
                                                                        }))
                                                                    }
                                                                    className='h-5 w-5 text-primary'
                                                                />
                                                                <span className='font-medium text-base'>{mode.label}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </Card>
                                                <div>
                                                    <Label htmlFor='amstId'>
                                                        Student Name:
                                                        <span className='ml-1 text-red-500'>*</span>
                                                    </Label>
                                                    <div className='flex w-full max-w-[400px] flex-col'>
                                                        <Controller
                                                            name='amstId'
                                                            control={control}
                                                            render={({ field }) => (
                                                                <Select
                                                                    key={field.value}
                                                                    value={
                                                                        field.value && field.value !== 0 ? String(field.value) : undefined
                                                                    }
                                                                    onValueChange={(val) => field.onChange(Number(val))}
                                                                    disabled={!academicYearId}>
                                                                    <SelectTrigger className='min-w-[400px] text-center'>
                                                                        <SelectValue placeholder='--Select student --' />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {studentDetailsLoading ? (
                                                                            <SelectItem value='loading' disabled>
                                                                                Loading...
                                                                            </SelectItem>
                                                                        ) : studentDetailsError ? (
                                                                            <SelectItem value='error' disabled>
                                                                                Error loading
                                                                            </SelectItem>
                                                                        ) : studentDetails.length === 0 ? (
                                                                            <SelectItem value='nodata' disabled>
                                                                                No Results
                                                                            </SelectItem>
                                                                        ) : filters.filter2 === 'name' ? (
                                                                            studentDetails?.map((item: any) => (
                                                                                <SelectItem
                                                                                    key={item.amsT_Id}
                                                                                    value={item.amsT_Id.toString()}>
                                                                                    {item.studentName} :{item.amsT_RegistrationNo}
                                                                                </SelectItem>
                                                                            ))
                                                                        ) : (
                                                                            studentDetails?.map((item: any) => (
                                                                                <SelectItem
                                                                                    key={item.amsT_Id}
                                                                                    value={item.amsT_Id.toString()}>
                                                                                    {item.amsT_RegistrationNo} :{item.studentName}
                                                                                </SelectItem>
                                                                            ))
                                                                        )}
                                                                    </SelectContent>
                                                                </Select>
                                                            )}
                                                        />
                                                        {errors.amstId && <FormError>{errors.amstId.message}</FormError>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className='grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4'>
                                    <div className='space-y-3'>
                                        <Label className='font-semibold text-lg'>
                                            Custom Group<span className='text-red-500'>*</span>
                                        </Label>
                                        <Card className='border bg-gray-50 p-4'>
                                            <Controller
                                                name='customGroupIds'
                                                control={control}
                                                render={({ field }) => {
                                                    const selectedIds = field.value ?? [];
                                                    const allIds = customGroups.map((g) => g.fmgG_Id);

                                                    const isAllSelected = allIds.length > 0 && selectedIds.length === allIds.length;

                                                    const isIndeterminate = selectedIds.length > 0 && selectedIds.length < allIds.length;

                                                    return (
                                                        <div className='max-h-64 space-y-3 overflow-y-auto'>
                                                            {/* SELECT ALL */}
                                                            <Label className='flex cursor-pointer items-center gap-3 rounded border-b bg-white px-2 py-2 font-medium hover:bg-gray-200'>
                                                                <Checkbox
                                                                    checked={isAllSelected}
                                                                    indeterminate={isIndeterminate}
                                                                    onCheckedChange={(checked: boolean | 'indeterminate') => {
                                                                        const value = checked === true ? allIds : [];

                                                                        field.onChange(value);
                                                                        setValue('customGroupIds', value, {
                                                                            shouldValidate: true,
                                                                            shouldDirty: true,
                                                                            shouldTouch: true
                                                                        });
                                                                    }}
                                                                />

                                                                <span>Select All</span>
                                                            </Label>

                                                            {/* LOADING */}
                                                            {loadingCustomGroup ? (
                                                                <div className='py-4 text-center text-gray-500'>Loading...</div>
                                                            ) : customGroups.length > 0 ? (
                                                                customGroups.map((group) => {
                                                                    const checked = selectedIds.includes(group.fmgG_Id);

                                                                    return (
                                                                        <Label
                                                                            key={group.fmgG_Id}
                                                                            className='flex cursor-pointer items-center gap-3 rounded px-2 py-1 hover:bg-gray-100'>
                                                                            <Checkbox
                                                                                checked={checked}
                                                                                onCheckedChange={(checked: boolean | 'indeterminate') => {
                                                                                    const value =
                                                                                        checked === true
                                                                                            ? [...selectedIds, group.fmgG_Id]
                                                                                            : selectedIds.filter(
                                                                                                  (id) => id !== group.fmgG_Id
                                                                                              );

                                                                                    field.onChange(value);
                                                                                    setValue('customGroupIds', value, {
                                                                                        shouldValidate: true,
                                                                                        shouldDirty: true,
                                                                                        shouldTouch: true
                                                                                    });
                                                                                }}
                                                                            />

                                                                            <span className='font-medium text-sm'>
                                                                                {group.fmgG_GroupName}
                                                                            </span>
                                                                        </Label>
                                                                    );
                                                                })
                                                            ) : (
                                                                <div className='py-4 text-center text-gray-500'>No custom groups</div>
                                                            )}
                                                        </div>
                                                    );
                                                }}
                                            />
                                        </Card>
                                        {errors.customGroupIds && <FormError>{errors.customGroupIds.message}</FormError>}
                                    </div>

                                    {/* Fee Group */}
                                    <div className='space-y-3'>
                                        <Label className='font-semibold text-lg'>
                                            Fee Group <span className='text-red-500'>*</span>
                                        </Label>
                                        <Card className='border bg-gray-50 p-4'>
                                            <Controller
                                                name='feeGroupIds'
                                                control={control}
                                                render={({ field }) => {
                                                    const selectedIds = field.value ?? [];
                                                    const allIds = feeGroups.map((g) => g.fmG_Id);

                                                    const isAllSelected = allIds.length > 0 && selectedIds.length === allIds.length;

                                                    const isIndeterminate = selectedIds.length > 0 && selectedIds.length < allIds.length;

                                                    return (
                                                        <div className='max-h-64 space-y-3 overflow-y-auto'>
                                                            {/* SELECT ALL */}
                                                            <Label className='flex cursor-pointer items-center gap-3 rounded border-b bg-white px-2 py-2 font-medium hover:bg-gray-200'>
                                                                <Checkbox
                                                                    checked={isAllSelected}
                                                                    indeterminate={isIndeterminate}
                                                                    onCheckedChange={(checked: boolean | 'indeterminate') => {
                                                                        const value = checked === true ? allIds : [];

                                                                        field.onChange(value);
                                                                        setValue('feeGroupIds', value, {
                                                                            shouldValidate: true,
                                                                            shouldDirty: true,
                                                                            shouldTouch: true
                                                                        });
                                                                    }}
                                                                />
                                                                <span>Select All</span>
                                                            </Label>

                                                            {/* LOADING */}
                                                            {loadingfeegroup ? (
                                                                <div className='py-4 text-center text-gray-500'>Loading...</div>
                                                            ) : feeGroups.length > 0 ? (
                                                                feeGroups.map((group) => {
                                                                    const checked = selectedIds.includes(group.fmG_Id);

                                                                    return (
                                                                        <Label
                                                                            key={group.fmG_Id}
                                                                            className='flex cursor-pointer items-center gap-3 rounded px-2 py-1 hover:bg-gray-100'>
                                                                            <Checkbox
                                                                                checked={checked}
                                                                                onCheckedChange={(checked: boolean | 'indeterminate') => {
                                                                                    const value =
                                                                                        checked === true
                                                                                            ? [...selectedIds, group.fmG_Id]
                                                                                            : selectedIds.filter(
                                                                                                  (id) => id !== group.fmG_Id
                                                                                              );

                                                                                    field.onChange(value);
                                                                                    setValue('feeGroupIds', value, {
                                                                                        shouldValidate: true,
                                                                                        shouldDirty: true,
                                                                                        shouldTouch: true
                                                                                    });
                                                                                }}
                                                                            />
                                                                            <span className='text-sm'>{group.fmG_GroupName}</span>
                                                                        </Label>
                                                                    );
                                                                })
                                                            ) : (
                                                                <div className='py-4 text-center text-gray-500'>No fee groups</div>
                                                            )}
                                                        </div>
                                                    );
                                                }}
                                            />
                                        </Card>
                                        {errors.feeGroupIds && <FormError>{errors.feeGroupIds.message}</FormError>}
                                    </div>

                                    {/* Term */}
                                    <div className='space-y-3'>
                                        <Label className='font-semibold text-lg'>
                                            Term Name <span className='text-red-500'>*</span>
                                        </Label>
                                        <Card className='border bg-gray-50 p-4'>
                                            <Controller
                                                name='termIds'
                                                control={control}
                                                render={({ field }) => {
                                                    const selectedIds = field.value ?? [];
                                                    const allIds = feeTerms.map((t) => t.fmT_Id);

                                                    const isAllSelected = allIds.length > 0 && selectedIds.length === allIds.length;

                                                    const isIndeterminate = selectedIds.length > 0 && selectedIds.length < allIds.length;

                                                    return (
                                                        <div className='max-h-64 space-y-3 overflow-y-auto'>
                                                            {/* SELECT ALL */}
                                                            <Label className='flex cursor-pointer items-center gap-3 rounded border-b bg-white px-2 py-2 font-medium hover:bg-gray-200'>
                                                                <Checkbox
                                                                    checked={isAllSelected}
                                                                    indeterminate={isIndeterminate}
                                                                    onCheckedChange={(checked: boolean | 'indeterminate') => {
                                                                        const value = checked === true ? allIds : [];

                                                                        field.onChange(value);
                                                                        setValue('termIds', value, {
                                                                            shouldValidate: true,
                                                                            shouldDirty: true,
                                                                            shouldTouch: true
                                                                        });
                                                                    }}
                                                                />
                                                                <span>Select All</span>
                                                            </Label>

                                                            {/* LOADING */}
                                                            {loadingfeeterm ? (
                                                                <div className='py-4 text-center text-gray-500'>Loading...</div>
                                                            ) : feeTerms.length > 0 ? (
                                                                feeTerms.map((term) => {
                                                                    const checked = selectedIds.includes(term.fmT_Id);

                                                                    return (
                                                                        <Label
                                                                            key={term.fmT_Id}
                                                                            className='flex cursor-pointer items-center gap-3 rounded px-2 py-1 hover:bg-gray-100'>
                                                                            <Checkbox
                                                                                checked={checked}
                                                                                onCheckedChange={(checked: boolean | 'indeterminate') => {
                                                                                    const value =
                                                                                        checked === true
                                                                                            ? [...selectedIds, term.fmT_Id]
                                                                                            : selectedIds.filter(
                                                                                                  (id) => id !== term.fmT_Id
                                                                                              );

                                                                                    field.onChange(value);
                                                                                    setValue('termIds', value, {
                                                                                        shouldValidate: true,
                                                                                        shouldDirty: true,
                                                                                        shouldTouch: true
                                                                                    });
                                                                                }}
                                                                            />
                                                                            <span className='text-sm'>{term.fmT_Name}</span>
                                                                        </Label>
                                                                    );
                                                                })
                                                            ) : (
                                                                <div className='py-4 text-center text-gray-500'>No terms</div>
                                                            )}
                                                        </div>
                                                    );
                                                }}
                                            />
                                        </Card>
                                        {errors.termIds && <FormError>{errors.termIds.message}</FormError>}
                                    </div>
                                </div>

                                {/* Class & Section + Status + Date (Date section is conditional) */}
                                <div className='space-y-6 border-t pt-8'>
                                    <div className='flex flex-wrap items-center gap-6'>
                                        <div className='flex items-center gap-3'>
                                            <Checkbox
                                                id='ischeckdate'
                                                checked={filters.ischeckdate}
                                                onCheckedChange={(checked: any) => {
                                                    const value = !!checked;
                                                    setFilters((prev) => ({
                                                        ...prev,
                                                        ischeckdate: value
                                                    }));
                                                    setValue('ischeckdate', value, {
                                                        shouldValidate: true
                                                    });
                                                }}
                                            />

                                            <Label htmlFor='includeClass' className='cursor-pointer font-medium'>
                                                Cheque Date
                                            </Label>
                                            <Card className='border bg-gray-50 p-5 shadow-sm'>
                                                <div className='flex items-center gap-10'>
                                                    {(
                                                        [
                                                            { label: 'Active', value: 'active' },
                                                            { label: 'Left', value: 'left' }
                                                        ] as const
                                                    ).map((mode) => (
                                                        <label key={mode.value} className='flex cursor-pointer items-center gap-3'>
                                                            <input
                                                                type='radio'
                                                                name='filter'
                                                                checked={filters.filter === mode.value}
                                                                onChange={() =>
                                                                    setFilters((prev) => ({
                                                                        ...prev,
                                                                        filter: mode.value
                                                                    }))
                                                                }
                                                                className='h-5 w-5 text-primary'
                                                            />
                                                            <span className='font-medium text-base'>{mode.label}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </Card>
                                            <div className='flex flex-col gap-1 pr-20'>
                                                <div className='flex items-center gap-2'>
                                                    <Label className='w-32'>
                                                        From Date <span className='text-red-500'>*</span>
                                                    </Label>

                                                    <input
                                                        type='date'
                                                        className='flex-1 rounded-md border px-3 py-2'
                                                        onKeyDown={(e) => e.preventDefault()} // 🔒 blocks typing
                                                        {...register('fromDate', {
                                                            required: 'From Date is required',
                                                            onChange: (e) => {
                                                                const newFromDate = e.target.value;
                                                                const currentToDate = watch('toDate');

                                                                // Clear toDate if it's before new fromDate
                                                                if (currentToDate && newFromDate > currentToDate) {
                                                                    setValue('toDate', '');
                                                                }
                                                            }
                                                        })}
                                                    />
                                                </div>

                                                {errors.fromDate && <FormError className='ml-32'>{errors.fromDate.message}</FormError>}
                                            </div>

                                            {/* TO DATE */}
                                            <div className='flex flex-col gap-1'>
                                                <div className='flex items-center gap-4'>
                                                    <Label className='w-32'>
                                                        To Date <span className='text-red-500'>*</span>
                                                    </Label>
                                                    <input
                                                        type='date'
                                                        className='flex-1 rounded-md border px-3 py-2'
                                                        onKeyDown={(e) => e.preventDefault()} // 🔒 blocks typing
                                                        {...register('toDate', {
                                                            required: 'To Date is required',
                                                            validate: () => {
                                                                if (!fromDateValue) return 'Please select From Date first';
                                                                return true;
                                                            }
                                                        })}
                                                        min={fromDateValue || ''} // 👈 THIS BLOCKS DATES BEFORE FROM DATE
                                                        disabled={!fromDateValue} // 👈 OPTIONAL: Disable until fromDate is selected
                                                    />
                                                </div>

                                                {errors.toDate && <FormError className='ml-32'>{errors.toDate.message}</FormError>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    {/* ==================== ACTION BUTTONS ==================== */}
                                    <div className='flex justify-end gap-4 border-t pt-8'>
                                        <Button size='lg' variant='outline' className='px-8' onClick={() => window.location.reload()}>
                                            Cancel
                                        </Button>
                                        <Button type='submit' disabled={isSubmitting} className='min-w-32'>
                                            {isSubmitting ? 'Generating...' : 'Report'}
                                        </Button>
                                    </div>
                                    {showReport && studentreportData.length > 0 && (
                                        <div className='-mx-8 mt-12 overflow-hidden rounded-lg bg-white shadow-xl'>
                                            {/* Loading State */}
                                            {reportLoading ? (
                                                <div className='p-24 text-center'>
                                                    <div className='inline-block h-14 w-14 animate-spin rounded-full border-4 border-primary border-t-transparent' />
                                                    <p className='mt-6 text-lg text-muted-foreground'>Generating report, please wait...</p>
                                                </div>
                                            ) : (
                                                /* Table Inside CollapsibleSection */
                                                <CollapsibleSection
                                                    defaultOpen={true}
                                                    variant='default'
                                                    size='lg'
                                                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                                                    <div className='flex items-center justify-between border-b bg-primary/5 px-8 py-6'>
                                                        <div className='mb-6 text-center'>
                                                            <h2 className='font-bold text-2xl text-primary'>
                                                                Fee Monthly Collection Extract Register Report
                                                            </h2>
                                                        </div>
                                                        {studentreportData.length > 0 && (
                                                            <div className='flex gap-3'>
                                                                <div className='mb-4 flex justify-end gap-2'>
                                                                    <Button
                                                                        size='sm'
                                                                        className='h-8 w-auto px-3 text-xs'
                                                                        onClick={handleExportExcelforFeeGroupWise}>
                                                                        Export Excel
                                                                    </Button>

                                                                    <Button
                                                                        size='sm'
                                                                        variant='outline'
                                                                        className='h-8 w-auto px-3 text-xs'
                                                                        onClick={handlePrintforFeeGroupWise}>
                                                                        Print
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        {/* Table */}
                                                        {studentreportData.length > 0 && (
                                                            <div className='overflow-x-auto border'>
                                                                <table className='w-full table-auto border-collapse'>
                                                                    <thead className='bg-primary text-white'>
                                                                        <tr>
                                                                            <th className='p-2 text-center'>Sl No</th>
                                                                            <th className='cursor-pointer p-2 text-center'>AdmoNo</th>
                                                                            <th className='cursor-pointer p-2 text-center'>Student Name</th>
                                                                            <th className='cursor-pointer p-2 text-center'>
                                                                                Receipt Details
                                                                            </th>
                                                                            <th className='cursor-pointer p-2 text-center'>January2026</th>
                                                                            <th className='cursor-pointer p-2 text-center'>February2026</th>
                                                                            <th className='cursor-pointer p-2 text-center'>March2026</th>
                                                                            <th className='cursor-pointer p-2 text-center'>April2026</th>
                                                                            <th className='cursor-pointer p-2 text-center'>May2026</th>
                                                                            <th className='cursor-pointer p-2 text-center'>June2026</th>
                                                                            <th className='cursor-pointer p-2 text-center'>July2026</th>
                                                                            <th className='cursor-pointer p-2 text-center'>August2026</th>
                                                                            <th className='cursor-pointer p-2 text-center'>
                                                                                September2026
                                                                            </th>
                                                                            <th className='cursor-pointer p-2 text-center'>October2026</th>
                                                                            <th className='cursor-pointer p-2 text-center'>November2026</th>
                                                                            <th className='cursor-pointer p-2 text-center'>December2026</th>
                                                                            <th className='cursor-pointer p-2 text-center'>Total</th>
                                                                        </tr>
                                                                    </thead>

                                                                    <tbody>
                                                                        {studentreportData.map((row, index) => (
                                                                            <tr key={row.id} className='border-b'>
                                                                                <td className='p-2 text-center font-medium'>{index + 1}</td>
                                                                                <td className='p-2 text-center font-medium'>{row.admNo}</td>
                                                                                <td className='p-2 text-center font-bold'>
                                                                                    {row.studentName}
                                                                                </td>
                                                                                <td className='p-2 text-center font-bold'>
                                                                                    {row.receiptDetails}
                                                                                </td>
                                                                                <td className='p-2 text-center font-bold'>{row.jan}</td>
                                                                                <td className='p-2 text-center font-bold'>{row.feb}</td>
                                                                                <td className='p-2 text-center font-bold'>{row.mar}</td>
                                                                                <td className='p-2 text-center font-bold'>{row.apr}</td>
                                                                                <td className='p-2 text-center font-bold'>{row.may}</td>
                                                                                <td className='p-2 text-center font-bold'>{row.jun}</td>
                                                                                <td className='p-2 text-center font-bold'>{row.jul}</td>
                                                                                <td className='p-2 text-center font-bold'>{row.aug}</td>
                                                                                <td className='p-2 text-center font-bold'>{row.sep}</td>
                                                                                <td className='p-2 text-center font-bold'>{row.oct}</td>
                                                                                <td className='p-2 text-center font-bold'>{row.nov}</td>
                                                                                <td className='p-2 text-center font-bold'>{row.dec}</td>
                                                                                <td className='p-2 text-center font-bold'>{row.total}</td>
                                                                            </tr>
                                                                        ))}

                                                                        {/* Total */}
                                                                        <tr className='bg-gray-100 font-bold'>
                                                                            <td />
                                                                            <td />
                                                                            <td />

                                                                            <td className='p-2 text-center'>Total</td>
                                                                            <td className='p-2 text-center'>
                                                                                ₹{totalBalanceJan.toLocaleString('en-IN') || 0}
                                                                            </td>
                                                                            <td className='p-2 text-center'>
                                                                                ₹{totalBalanceFeb.toLocaleString('en-IN') || 0}
                                                                            </td>
                                                                            <td className='p-2 text-center'>
                                                                                ₹{totalBalanceMarch.toLocaleString('en-IN') || 0}
                                                                            </td>
                                                                            <td className='p-2 text-center'>
                                                                                ₹{totalBalanceApr.toLocaleString('en-IN') || 0}
                                                                            </td>
                                                                            <td className='p-2 text-center'>
                                                                                ₹{totalBalanceMay.toLocaleString('en-IN') || 0}
                                                                            </td>
                                                                            <td className='p-2 text-center'>
                                                                                ₹{totalBalanceJun.toLocaleString('en-IN') || 0}
                                                                            </td>
                                                                            <td className='p-2 text-center'>
                                                                                ₹{totalBalanceJuly.toLocaleString('en-IN') || 0}
                                                                            </td>
                                                                            <td className='p-2 text-center'>
                                                                                ₹{totalBalanceAug.toLocaleString('en-IN') || 0}
                                                                            </td>
                                                                            <td className='p-2 text-center'>
                                                                                ₹{totalBalanceSep.toLocaleString('en-IN') || 0}
                                                                            </td>
                                                                            <td className='p-2 text-center'>
                                                                                ₹{totalBalanceOct.toLocaleString('en-IN') || 0}
                                                                            </td>
                                                                            <td className='p-2 text-center'>
                                                                                ₹{totalBalanceNov.toLocaleString('en-IN') || 0}
                                                                            </td>
                                                                            <td className='p-2 text-center'>
                                                                                ₹{totalBalanceDec.toLocaleString('en-IN') || 0}
                                                                            </td>
                                                                            <td className='p-2 text-center'>
                                                                                ₹{totalBalance.toLocaleString('en-IN') || 0}
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        )}
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
