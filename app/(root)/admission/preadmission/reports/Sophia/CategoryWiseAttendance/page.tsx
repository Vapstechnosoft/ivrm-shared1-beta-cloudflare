'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { FileSpreadsheet, FileText, Printer, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import {
    useCategoryWiseAttendanceInitialDetails,
    useCategoryWiseAttendanceReport
} from '@/hooks/admission/preadmission/useCategoryWiseAttendance';
import { CategoryWiseAttendanceSchema } from '@/schemas/admission/preadmission/reports';
import { CategoryWiseAttendancePrint } from './_components/category-wise-attendance-print';

export default function CategoryWiseAttendancePage() {
    /* ---------------- Hooks & State ---------------- */

    const { data: initialData, isLoading: isInitialLoading } = useCategoryWiseAttendanceInitialDetails();
    const [reportPayload, setReportPayload] = useState<{ asmaY_Id: number; fromdate: Date; categoryIds: number[] } | null>(null);
    const [showReport, setShowReport] = useState(false);
    const [categorySearch, setCategorySearch] = useState('');
    const [selectedRows, setSelectedRows] = useState<any[]>([]);
    const printRef = useRef<HTMLDivElement>(null);

    const { data: reportResponse, isFetching: isReportLoading } = useCategoryWiseAttendanceReport(
        reportPayload?.asmaY_Id ?? 0,
        reportPayload?.fromdate,
        reportPayload?.categoryIds ?? [],
        {},
        showReport
    );

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(CategoryWiseAttendanceSchema),
        defaultValues: {
            asmaY_Id: 0,
            categoryList: [] as number[],
            date: new Date()
        }
    });

    const watchedYear = watch('asmaY_Id');
    const selectedCategories = watch('categoryList');

    /* ---------------- Memoized Data ---------------- */
    const innerData = initialData?.data?.data || initialData?.data || initialData;

    const years = useMemo(() => {
        return innerData?.academicList || innerData?.yearList || innerData?.academicYearList || innerData?.yearlist || [];
    }, [innerData]);

    const categories = useMemo(() => {
        return innerData?.category_list || innerData?.categoryList || innerData?.categories || [];
    }, [innerData]);

    const categoryFlag = !!innerData?.categoryflag;

    const logoUrl =
        (reportResponse?.data as any)?.logo?.[0]?.logo ||
        (reportResponse?.data as any)?.AMC_logo?.[0]?.amC_FilePath ||
        (initialData?.data as any)?.imgname;

    const selectedYearData = useMemo(() => {
        return years.find((y: any) => y.asmaY_Id === watchedYear);
    }, [years, watchedYear]);

    const dateRestrictions = useMemo(() => {
        if (!selectedYearData) return { min: undefined, max: undefined };

        // Use direct dates from API if available
        if (selectedYearData.asmaY_From_Date && selectedYearData.asmaY_To_Date) {
            return {
                min: new Date(selectedYearData.asmaY_From_Date),
                max: new Date(selectedYearData.asmaY_To_Date)
            };
        }

        // Fallback to year string parsing
        const yearStr = selectedYearData.asmaY_Year;
        if (yearStr) {
            const parts = yearStr.split('-');
            if (parts.length === 2) {
                const startYear = Number.parseInt(parts[0]);
                const endYear = Number.parseInt(parts[1]);
                return {
                    min: new Date(startYear, 0, 1),
                    max: new Date(endYear, 11, 31)
                };
            }
        }
        return { min: undefined, max: undefined };
    }, [selectedYearData]);

    const filteredCategories = useMemo(() => {
        return categories.filter((cat: any) => (cat.amC_Name || cat.amc_name || '').toLowerCase().includes(categorySearch.toLowerCase()));
    }, [categories, categorySearch]);

    const reportData = useMemo(() => {
        const rawReport = reportResponse?.data?.data || reportResponse?.data || reportResponse;
        if (Array.isArray(rawReport)) return rawReport;
        return rawReport?.studentAttendanceList || rawReport?.attendanceList || [];
    }, [reportResponse]);

    /* ---------------- Effects ---------------- */

    // Set default year if available
    useEffect(() => {
        if (innerData?.defalutYearList && innerData.defalutYearList.length > 0) {
            const defaultYearId = innerData.defalutYearList[0].asmaY_Id;
            setValue('asmaY_Id', defaultYearId);
        }
    }, [innerData, setValue]);

    /* ---------------- Handlers ---------------- */

    const handleSelectAllCategories = (checked: boolean) => {
        if (checked) {
            setValue(
                'categoryList',
                filteredCategories.map((c: any) => c.amC_Id)
            );
        } else {
            setValue('categoryList', []);
        }
    };

    const onSubmit = (data: any) => {
        let finalCategoryIds = data.categoryList;

        if (categoryFlag && (!finalCategoryIds || finalCategoryIds.length === 0)) {
            // Legacy logic: if none selected, send all
            finalCategoryIds = categories.map((c: any) => c.amC_Id);
        }

        setReportPayload({
            asmaY_Id: data.asmaY_Id,
            fromdate: data.date,
            categoryIds: finalCategoryIds
        });
        setSelectedRows([]);
        setShowReport(true);
        toast.info('Generating report...');
    };

    const handleReset = () => {
        window.location.reload();
    };

    const exportToExcel = () => {
        const dataToExport = selectedRows.length > 0 ? selectedRows : reportData;
        if (!dataToExport.length) {
            toast.error('Please Select Records to be Exported');
            return;
        }

        const yearLabel = years.find((y: any) => y.asmaY_Id === reportPayload?.asmaY_Id)?.asmaY_Year || '';
        const reportDate = reportPayload?.fromdate ? format(reportPayload.fromdate, 'dd-MM-yyyy') : '';

        const worksheetData = dataToExport.map((row: any, idx: number) => ({
            'SL. No.': idx + 1,
            'Category Name': row.amc_name || row.AMC_Name,
            'Total Boys': row.total_male ?? row.Total_Male,
            'Total Girls': row.total_female ?? row.Total_Female,
            'Total Students': (Number(row.total_male || row.Total_Male) || 0) + (Number(row.total_female || row.Total_Female) || 0),
            'Present Boys': row.premale ?? row.Premale,
            'Present Girls': row.prefemale ?? row.PreFemale,
            'Total Present': (Number(row.premale || row.Premale) || 0) + (Number(row.prefemale || row.PreFemale) || 0),
            'Absent Boys': row.absmale,
            'Absent Girls': row.absfemale || row.absFemale,
            'Total Absent': (Number(row.absmale) || 0) + (Number(row.absfemale || row.absFemale) || 0)
        }));

        const ws = XLSX.utils.json_to_sheet(worksheetData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Attendance Report');
        XLSX.writeFile(wb, `CategoryWiseAttendance_${yearLabel}_${reportDate}.xlsx`);
    };

    const triggerPrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: 'CategoryWiseAttendanceReport'
    });

    const handlePrint = () => {
        if (selectedRows.length === 0 && reportData.length > 0) {
            toast.error('Please Select Records to be Printed');
            return;
        }
        if (reportData.length === 0) return;

        setTimeout(() => triggerPrint(), 300);
    };

    /* ---------------- Table Config ---------------- */

    const columns: any[] = [
        {
            id: 'select',
            header: ({ table }: any) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected()}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label='Select all'
                />
            ),
            cell: ({ row }: any) => (
                <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label='Select row' />
            ),
            enableSorting: false,
            enableHiding: false,
            size: 40
        },
        {
            header: 'SL. No.',
            cell: (info: any) => info.row.index + 1,
            size: 70
        },
        {
            header: 'Category Name',
            accessorKey: 'amc_name',
            cell: (info: any) => info.row.original.amc_name || info.row.original.AMC_Name,
            size: 200
        },
        {
            header: 'Total No. of Students on Roll',
            columns: [
                {
                    header: 'Total Boys',
                    accessorKey: 'total_male',
                    cell: (info: any) => info.row.original.total_male ?? info.row.original.Total_Male,
                    size: 110
                },
                {
                    header: 'Total Girls',
                    accessorKey: 'total_female',
                    cell: (info: any) => info.row.original.total_female ?? info.row.original.Total_Female,
                    size: 110
                },
                {
                    header: 'Total Students',
                    cell: (info: any) => {
                        const row = info.row.original;
                        return (Number(row.total_male || row.Total_Male) || 0) + (Number(row.total_female || row.Total_Female) || 0);
                    },
                    size: 130
                }
            ]
        },
        {
            header: 'No. of Students Attended',
            columns: [
                {
                    header: 'Boys',
                    accessorKey: 'premale',
                    cell: (info: any) => info.row.original.premale ?? info.row.original.Premale,
                    size: 100
                },
                {
                    header: 'Girls',
                    accessorKey: 'prefemale',
                    cell: (info: any) => info.row.original.prefemale ?? info.row.original.PreFemale,
                    size: 100
                },
                {
                    header: 'Total Present',
                    cell: (info: any) => {
                        const row = info.row.original;
                        return (Number(row.premale || row.Premale) || 0) + (Number(row.prefemale || row.PreFemale) || 0);
                    },
                    size: 140
                }
            ]
        },
        {
            header: 'No. of Students Absentees',
            columns: [
                {
                    header: 'Boys',
                    accessorKey: 'absmale',
                    size: 100
                },
                {
                    header: 'Girls',
                    accessorKey: 'absfemale',
                    cell: (info: any) => info.row.original.absfemale ?? info.row.original.absFemale,
                    size: 100
                },
                {
                    header: 'Total Absent',
                    cell: (info: any) => {
                        const row = info.row.original;
                        return (Number(row.absmale) || 0) + (Number(row.absfemale || row.absFemale) || 0);
                    },
                    size: 140
                }
            ]
        }
    ];

    /* ---------------- Render ---------------- */

    return (
        <div className='container min-h-screen space-y-4 p-2'>
            <style
                dangerouslySetInnerHTML={{
                    __html: `
                .vaps-table thead th {
                    background-color: #337ab7 !important;
                    color: white !important;
                    border: 1px solid #ddd !important;
                    text-align: center !important;
                    vertical-align: middle !important;
                    font-weight: 600 !important;
                    text-transform: capitalize !important;
                }
                .vaps-table tbody td {
                    border: 1px solid #ddd !important;
                }
                .vaps-box-header {
                    background-color: #3c8dbc;
                    color: white;
                    padding: 10px;
                    font-weight: bold;
                    text-transform: uppercase;
                }
                `
                }}
            />

            <div className='rounded-sm border border-t-4 border-t-[#3c8dbc] bg-white shadow'>
                <div className='flex items-center justify-between border-b p-3'>
                    <h3 className='font-bold text-sm uppercase'>Categorywise Attendance Report</h3>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-6 p-4'>
                    {/* ... (existing form content) ... */}
                    <div className='mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2'>
                        <div className='space-y-4'>
                            {/* Academic Year */}
                            <div className='space-y-2'>
                                <Label className='flex items-center gap-1 font-bold text-[13px]'>
                                    Academic Year <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    name='asmaY_Id'
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            onValueChange={(val) => field.onChange(Number(val))}
                                            value={field.value ? field.value.toString() : ''}>
                                            <SelectTrigger className='h-9 w-full rounded-none border-gray-300'>
                                                <SelectValue placeholder='--Select--' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {years.map((y: any) => (
                                                    <SelectItem key={y.asmaY_Id} value={y.asmaY_Id.toString()}>
                                                        {y.asmaY_Year}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.asmaY_Id && <p className='font-medium text-red-500 text-xs'>{errors.asmaY_Id.message}</p>}
                            </div>

                            {/* Select Date */}
                            <div className='space-y-2'>
                                <Label className='flex items-center gap-1 font-bold text-[13px]'>
                                    Select Date <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    name='date'
                                    control={control}
                                    render={({ field }) => (
                                        <DatePicker
                                            date={field.value}
                                            setDate={field.onChange}
                                            className='h-9 w-full rounded-none border-gray-300'
                                            fromDate={dateRestrictions.min}
                                            toDate={dateRestrictions.max}
                                        />
                                    )}
                                />
                                {errors.date && <p className='font-medium text-red-500 text-xs'>{errors.date.message}</p>}
                            </div>
                        </div>

                        {/* Category Multiselect */}
                        {/* <div className={`space-y-2 ${!categoryFlag && categories.length === 0 ? 'opacity-50 pointer-events-none' : ''}`}>
                            <Label className='flex items-center gap-1 text-[13px] font-bold'>
                                Category {categoryFlag && <span className='text-red-500'>*</span>}
                            </Label>
                            <div className='border border-gray-300 rounded-none p-2 space-y-2 bg-white'>
                                <div className='relative'>
                                    <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                                    <Input
                                        placeholder='Search category...'
                                        value={categorySearch}
                                        onChange={(e) => setCategorySearch(e.target.value)}
                                        className='pl-8 mb-2 h-9 border-gray-200 rounded-none'
                                        disabled={!categoryFlag && categories.length === 0}
                                    />
                                </div>
                                <div className='flex items-center space-x-2 pb-2 border-b'>
                                    <Checkbox
                                        id='select-all'
                                        checked={selectedCategories.length === filteredCategories.length && filteredCategories.length > 0}
                                        onCheckedChange={(checked) => handleSelectAllCategories(!!checked)}
                                        disabled={!categoryFlag && categories.length === 0}
                                        className='rounded-none'
                                    />
                                    <label htmlFor='select-all' className='text-sm font-medium leading-none cursor-pointer'>
                                        Select All
                                    </label>
                                </div>
                                <div className='h-40 overflow-y-auto space-y-1.5 mt-2 pr-1 custom-scrollbar'>
                                    {categories.length === 0 && (
                                        <p className='text-xs text-muted-foreground p-2'>No categories available</p>
                                    )}
                                    {filteredCategories.map((cat: any) => (
                                        <div key={cat.amC_Id || cat.amc_id} className='flex items-center space-x-2 p-1 hover:bg-slate-50 transition-colors'>
                                            <Checkbox
                                                id={`cat-${cat.amC_Id || cat.amc_id}`}
                                                checked={selectedCategories.includes(cat.amC_Id || cat.amc_id)}
                                                onCheckedChange={(checked) => {
                                                    const updated = !!checked
                                                        ? [...selectedCategories, cat.amC_Id || cat.amc_id]
                                                        : selectedCategories.filter((id) => id !== (cat.amC_Id || cat.amc_id));
                                                    setValue('categoryList', updated);
                                                }}
                                                className='rounded-none'
                                            />
                                            <label htmlFor={`cat-${cat.amC_Id || cat.amc_id}`} className='text-sm leading-none cursor-pointer flex-1 py-1'>
                                                {cat.amC_Name || cat.amc_name}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {errors.categoryList && <p className='text-xs text-red-500 font-medium'>{errors.categoryList.message}</p>}
                        </div> */}
                    </div>

                    <div className='flex justify-center gap-3 border-t pt-6'>
                        <Button
                            type='submit'
                            isLoading={isReportLoading}
                            className='min-w-[120px] rounded-sm bg-[#3c8dbc] font-bold text-white uppercase hover:bg-[#367fa9]'>
                            <FileText className='mr-2 h-4 w-4' />
                            Report
                        </Button>
                        <Button
                            variant='destructive'
                            type='button'
                            onClick={handleReset}
                            className='min-w-[120px] rounded-sm bg-[#f39c12] font-bold text-white uppercase hover:bg-[#e08e0b]'>
                            <X className='mr-2 h-4 w-4' />
                            Cancel
                        </Button>
                        <Button
                            variant='outline'
                            type='button'
                            disabled={!showReport || !reportData.length}
                            onClick={exportToExcel}
                            className='min-w-[120px] rounded-sm border-0 bg-[#3c8dbc] font-bold text-white uppercase hover:bg-[#367fa9] disabled:opacity-50'>
                            <FileSpreadsheet className='mr-2 h-4 w-4' />
                            Export
                        </Button>
                        <Button
                            variant='outline'
                            type='button'
                            disabled={!showReport || !reportData.length}
                            onClick={handlePrint}
                            className='min-w-[120px] rounded-sm border-0 bg-[#dd4b39] font-bold text-white uppercase hover:bg-[#d73925] disabled:opacity-50'>
                            <Printer className='mr-2 h-4 w-4' />
                            Print
                        </Button>
                    </div>
                </form>
            </div>

            {showReport && (
                <div className='mt-4 rounded-sm border border-t-4 border-t-[#3c8dbc] bg-white shadow'>
                    <div className='flex items-center justify-between border-b p-3'>
                        <h3 className='font-bold text-sm uppercase'>Categorywise Attendance Report</h3>
                    </div>
                    <div className='p-4'>
                        <div className='mb-4 flex items-center justify-between rounded-sm border bg-gray-50 px-2 py-2'>
                            <div className='flex gap-4'>
                                <div className='flex items-center gap-2 font-bold text-sm'>
                                    Total Grid Records :{' '}
                                    <span className='rounded-full bg-[#337ab7] px-2 py-0.5 text-white text-xs'>{reportData.length}</span>
                                </div>
                                {selectedRows.length > 0 && (
                                    <div className='flex items-center gap-2 font-bold text-sm'>
                                        Selected :{' '}
                                        <span className='rounded-full bg-green-600 px-2 py-0.5 text-white text-xs'>
                                            {selectedRows.length}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className='vaps-table'>
                            <GenericDataTable
                                data={reportData}
                                columns={columns}
                                isLoading={isReportLoading}
                                noDataTitle='No records found for the selected criteria'
                                isPaginationRequired={reportData.length > 10}
                                onRowSelectionChange={(rows) => setSelectedRows(rows)}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Hidden Print Content */}
            <div style={{ display: 'none' }}>
                <CategoryWiseAttendancePrint
                    ref={printRef}
                    data={selectedRows.length > 0 ? selectedRows : reportData}
                    academicYear={years.find((y: any) => y.asmaY_Id === reportPayload?.asmaY_Id)?.asmaY_Year}
                    date={reportPayload?.fromdate}
                    logoUrl={logoUrl}
                    userName={typeof window !== 'undefined' ? localStorage.getItem('username') || undefined : undefined}
                />
            </div>
        </div>
    );
}
