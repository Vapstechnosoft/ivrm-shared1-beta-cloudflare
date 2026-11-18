'use client';

import { Button } from '@/components/ui/button';
import type { DataTableRef } from '@/components/ui/data-table/data-table';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { FormError, Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown, useMasterCategoryDropdown } from '@/hooks/admission/preadmission/useMasters';
import { usePreadmissionClassDropdown1, useadmissionSectionDropdown } from '@/hooks/admission/preadmission/useTransactions';
import { cn } from '@/lib/utils';

import { useStudentTcReport } from '@/hooks/admission/preadmission/useReports';
import { StudentTcDetailsSchema } from '@/schemas/admission/preadmission/reports';
import { getStudentTcReport } from '@/server/admission/preadmission/reports/report';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { saveAs } from 'file-saver';
import { CheckSquare, FileText, Printer, RotateCcw, Search, Square } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import React, { useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import type { z } from 'zod';
import { FIELD_CONFIG, getMasterAdmissionReportColumns } from './_components/columns';
import { ColumnValue } from './_components/columnvalue';
import { StudentTcReportPrint } from './_components/student-tc-report-print';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;
type FormFields = z.infer<typeof StudentTcDetailsSchema>;

export default function StudentTcReportPage(props: {
    searchParams: SearchParams;
}) {
    const searchParams = (React as any).use(props.searchParams);
    const router = useRouter();
    const pathname = usePathname();

    const tableRef = useRef<DataTableRef>(null);
    const componentRef = useRef<HTMLDivElement>(null);

    const handleResetSelection = () => {
        tableRef.current?.resetSelection();
    };
    const {
        setValue,
        watch,
        formState: { errors }
    } = useForm<FormFields>({
        resolver: zodResolver(StudentTcDetailsSchema),
        defaultValues: {
            ASMAY_Id: 0,
            AllOrInd: 1,
            ASMCL_Id: 0,
            ASMC_Id: 0,
            AMC_Id: 0,
            TempararyArrayheadList: []
        }
    });
    const selectedFields = watch('TempararyArrayheadList') || [];

    const handleFilterChange = (filterType: 'class' | 'section' | 'academic_year' | 'category' | 'student', value: number) => {
        if (filterType === 'class') {
            setClassId(value);
            setSectionId(undefined);
        } else if (filterType === 'section') {
            setSectionId(value);
        } else if (filterType === 'academic_year') {
            setAcademicYearId(value);
        } else if (filterType === 'category') {
            setCategoryId(value);
        }

        // Reset to page 1 when filter changes
        const params = new URLSearchParams(searchParams as any);
        params.set('page', '1');
        router.replace(`${pathname}?${params.toString()}`);
    };

    const { data: academicYearOptions, isLoading: academicYearLoading, isError: academicYearError } = useAcademicYearDropdown();
    const { data: categoryOptions, isLoading: categoryLoading, isError: categoryError } = useMasterCategoryDropdown();

    const {
        data: preadmissionClass,
        isLoading: preadmissionClassLoading,
        isError: preadmissionClassError
    } = usePreadmissionClassDropdown1();

    const [academicYearId, setAcademicYearId] = useState<number>(0);
    const [categoryId, setCategoryId] = useState<number>(0);
    const [classId, setClassId] = useState<number>(0);
    const [sectionId, setSectionId] = useState<number | undefined>(undefined);
    const [showTable, setShowTable] = useState(false);
    const [fieldSearch, setFieldSearch] = useState('');
    const [allReportData, setAllReportData] = useState<any[]>([]);
    const [isPrinting, setIsPrinting] = useState(false);

    const [viewMode, setViewMode] = useState<1 | 2>(1); // 1 = All, 2 = Individual
    const [tcType, setTcType] = useState<1 | 2>(2); // 1 = Temporary TC, 2 = Permanent TC

    const {
        data: preadmissionSection,
        isLoading: preadmissionSectionLoading,
        isError: preadmissionSectionError
    } = useadmissionSectionDropdown(classId);

    const filteredFields = useMemo(() => {
        return ColumnValue.filter((field) => field.columnName.toLowerCase().includes(fieldSearch.toLowerCase()));
    }, [fieldSearch]);

    const handleFieldToggle = (fieldId: string) => {
        const current = selectedFields || [];
        const isSelected = current.some((f: any) => f.columnID === fieldId);

        const updated = isSelected
            ? current.filter((f: any) => f.columnID !== fieldId)
            : [
                  ...current,
                  {
                      columnID: fieldId,
                      columnName: ColumnValue.find((c) => c.columnID === fieldId)?.columnName || ''
                  }
              ];

        setValue('TempararyArrayheadList', updated, { shouldValidate: true });
    };

    // Build API payload based on current state
    const buildApiPayload = () => {
        const payload = {
            ASMAY_Id: academicYearId || 0,
            AllOrInd: viewMode === 1 ? 'all' : 'indi',
            ASMCL_Id: viewMode === 1 ? 0 : classId || 0,
            ASMC_Id: viewMode === 1 ? 0 : sectionId ?? 0,
            TempararyArrayheadList: selectedFields.map((item: any) => ({
                columnID: item.columnID,
                columnName: item.columnName || ''
            })),
            PermOrTemp: tcType === 1 ? 'TTC' : 'PTC',
            AMC_Id: categoryId || 0
        };
        return payload;
    };

    const tablePayload = buildApiPayload();

    const { data: reportData, isLoading, error, refetch } = useStudentTcReport(tablePayload, searchParams, showTable);

    const columns = useMemo(() => {
        const ids = selectedFields.map((f: any) => f.columnID);
        return getMasterAdmissionReportColumns(ids);
    }, [selectedFields]);

    const tableProps = useDataTableProps(reportData);

    const handleSelectAllFields = () => {
        if (selectedFields.length === filteredFields.length) {
            setValue('TempararyArrayheadList', [], { shouldValidate: true });
        } else {
            setValue(
                'TempararyArrayheadList',
                filteredFields.map((f) => ({
                    columnID: f.columnID,
                    columnName: f.columnName
                })),
                { shouldValidate: true }
            );
        }
    };

    const handleReport = async () => {
        try {
            if (!academicYearId || academicYearId === 0) {
                toast.error('Please select an academic year');
                return;
            }

            if (selectedFields.length === 0) {
                toast.error('Please select at least one column');
                return;
            }

            if (viewMode === 2) {
                if (!classId) {
                    toast.error('Please select a class');
                    return;
                }
                if (sectionId === undefined) {
                    toast.error('Please select a section');
                    return;
                }
            }

            toast.loading('Loading report...', { id: 'tc-report' });

            const response = await refetch();

            // Cast response.data to any to access the nested data property
            const responseData = response.data as any;
            if (responseData && responseData.data && responseData.data.length > 0) {
                setShowTable(true);
                toast.success('TC Report fetched successfully', { id: 'tc-report' });
            } else {
                setShowTable(false);
                toast.error('No data found', { id: 'tc-report' });
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load report', { id: 'tc-report' });
        }
    };

    const handleReset = () => {
        window.location.reload();
    };

    const downloadExcel = async () => {
        try {
            if (!showTable || !reportData || reportData.data.length === 0) {
                toast.error('Please generate a report first');
                return;
            }

            toast.loading('Preparing Excel...', { id: 'excel-download' });

            let dataToExport = allReportData;

            if (dataToExport.length === 0) {
                const totalRecords = reportData.total || 131;
                const payload = {
                    ...tablePayload,
                    page: 1,
                    page_size: totalRecords
                };
                const response = await getStudentTcReport(payload, {
                    ...searchParams,
                    page: 1,
                    page_size: totalRecords
                });
                if (response && response.data && response.data.length > 0) {
                    dataToExport = response.data;
                    setAllReportData(response.data);
                }
            }

            if (!dataToExport || dataToExport.length === 0) {
                toast.error('No data found to export', { id: 'excel-download' });
                return;
            }

            const formatDate = (date: unknown): string => {
                if (typeof date !== 'string' || !date) return 'N/A';
                try {
                    return format(new Date(date), 'dd-MM-yyyy');
                } catch {
                    return 'N/A';
                }
            };

            const worksheetData = dataToExport.map((row, index) => {
                const mappedRow: any = { 'Sl.No': index + 1 };
                selectedFields.forEach((item: any) => {
                    const fieldId = item.columnID;
                    const config = FIELD_CONFIG[fieldId];
                    let value = row[fieldId];
                    if (config?.isDate && value) {
                        value = formatDate(value);
                    }
                    mappedRow[config?.label || fieldId] = value ?? 'N/A';
                });
                return mappedRow;
            });

            const worksheet = XLSX.utils.json_to_sheet(worksheetData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Student TC Report');

            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
            saveAs(data, `StudentTcReport_${format(new Date(), 'ddMMyyyy_HHmmss')}.xlsx`);

            toast.success('Excel downloaded successfully', { id: 'excel-download' });
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Failed to download Excel', { id: 'excel-download' });
        }
    };

    const handlePrint = useReactToPrint({
        contentRef: componentRef
    });

    const handlePrintAll = async () => {
        try {
            if (!showTable || !reportData || reportData.data.length === 0) {
                toast.error('Please generate a report first');
                return;
            }

            setIsPrinting(true);
            toast.loading('Preparing all records for print...', { id: 'print-all' });

            const totalRecords = reportData.total || 131;
            const payload = {
                ...tablePayload,
                page: 1,
                page_size: totalRecords
            };
            // Fetch with a large page size to get all records based on reportData.total
            const response = await getStudentTcReport(payload, {
                ...searchParams,
                page: 1,
                page_size: totalRecords
            });

            if (response && response.data && response.data.length > 0) {
                setAllReportData(response.data);
                toast.success('Ready to print', { id: 'print-all' });
                // Short delay to ensure state update and re-render of the hidden print component
                setTimeout(() => {
                    handlePrint();
                    setIsPrinting(false);
                }, 500);
            } else {
                toast.error('No data found to print', { id: 'print-all' });
                setIsPrinting(false);
            }
        } catch (error) {
            console.error('Print Error:', error);
            toast.error('Failed to prepare print view', { id: 'print-all' });
            setIsPrinting(false);
        }
    };

    return (
        <div className='min-h-screen'>
            {/* Header */}
            <div className='mb-3 flex w-full flex-col gap-4 rounded-xl border p-4 shadow-xl'>
                {/* Filter Options */}
                <div className='flex flex-wrap justify-start gap-6'>
                    {/* View Mode Radio Buttons */}
                    <div className='flex w-full flex-col gap-2 sm:w-56'>
                        <Label className='mb-1 font-semibold'>View</Label>
                        <div className='flex items-center gap-4'>
                            <label className='flex items-center gap-2'>
                                <input
                                    type='radio'
                                    name='viewMode'
                                    checked={viewMode === 1}
                                    onChange={() => {
                                        setViewMode(1);
                                        setClassId(0);
                                        setSectionId(undefined);
                                    }}
                                />
                                <span>All</span>
                            </label>
                            <label className='flex items-center gap-2'>
                                <input type='radio' name='viewMode' checked={viewMode === 2} onChange={() => setViewMode(2)} />
                                <span>Individual</span>
                            </label>
                        </div>
                    </div>

                    {/* Academic Year Filter (always shown) */}
                    <div className='flex w-full flex-col gap-2 sm:w-56'>
                        <Label htmlFor='academic-year' className='mb-1 font-semibold'>
                            Academic Year
                        </Label>
                        <Select
                            onValueChange={(value) => handleFilterChange('academic_year', Number(value))}
                            value={academicYearId !== 0 ? academicYearId?.toString() : undefined}>
                            <SelectTrigger id='academic-year'>
                                <SelectValue placeholder='Select Academic Year' />
                            </SelectTrigger>
                            <SelectContent>
                                {academicYearLoading ? (
                                    <SelectItem value='loading' disabled>
                                        Loading...
                                    </SelectItem>
                                ) : academicYearError ? (
                                    <SelectItem value='error' disabled>
                                        Error loading
                                    </SelectItem>
                                ) : (
                                    academicYearOptions?.data?.map((item) => (
                                        <SelectItem key={item.asmaY_Id} value={String(item.asmaY_Id)}>
                                            {item.asmaY_Year}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Category Filter */}
                    {/* <div className='flex w-full flex-col gap-2 sm:w-56'>
                        <Label htmlFor='category' className='mb-1 font-semibold'>
                            Category
                        </Label>
                        <Select
                            onValueChange={(value) => handleFilterChange('category', Number(value))}
                            value={categoryId !== 0 ? categoryId?.toString() : undefined}>
                            <SelectTrigger id='category'>
                                <SelectValue placeholder='Select Category' />
                            </SelectTrigger>
                            <SelectContent>
                                {categoryLoading ? (
                                    <SelectItem value='loading' disabled>
                                        Loading...
                                    </SelectItem>
                                ) : categoryError ? (
                                    <SelectItem value='error' disabled>
                                        Error loading
                                    </SelectItem>
                                ) : (
                                    categoryOptions?.data?.map((item) => (
                                        <SelectItem key={item.amC_Id} value={String(item.amC_Id)}>
                                            {item.amC_Name}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div> */}

                    <div className='flex w-full flex-col gap-2 sm:w-56'>
                        <Label htmlFor='class' className='mb-1 font-semibold'>
                            Class
                        </Label>
                        <Select
                            disabled={viewMode === 1}
                            onValueChange={(value) => handleFilterChange('class', Number(value))}
                            value={classId !== 0 ? classId?.toString() : undefined}>
                            <SelectTrigger id='class'>
                                <SelectValue placeholder='Select Class' />
                            </SelectTrigger>
                            <SelectContent>
                                {preadmissionClassLoading ? (
                                    <SelectItem value='loading' disabled>
                                        Loading...
                                    </SelectItem>
                                ) : preadmissionClassError ? (
                                    <SelectItem value='error' disabled>
                                        Error loading
                                    </SelectItem>
                                ) : (
                                    preadmissionClass?.data?.map((item) => (
                                        <SelectItem key={item.asmcL_Id} value={item.asmcL_Id.toString()}>
                                            {item.asmcL_ClassName}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className='flex w-full flex-col gap-2 sm:w-56'>
                        <Label htmlFor='section' className='mb-1 font-semibold'>
                            Section
                        </Label>
                        <Select
                            key={classId}
                            disabled={viewMode === 1 || !classId}
                            onValueChange={(value) => handleFilterChange('section', Number(value))}
                            value={sectionId !== undefined ? sectionId.toString() : undefined}>
                            <SelectTrigger id='section'>
                                <SelectValue placeholder='Select Section' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem key={0} value={'0'}>
                                    All
                                </SelectItem>
                                {preadmissionSectionLoading ? (
                                    <SelectItem value='loading' disabled>
                                        Loading...
                                    </SelectItem>
                                ) : preadmissionSectionError ? (
                                    <SelectItem value='error' disabled>
                                        Error loading
                                    </SelectItem>
                                ) : (
                                    preadmissionSection?.data?.map((item: any) => (
                                        <SelectItem key={item.asmS_Id} value={item.asmS_Id.toString()}>
                                            {item.asmC_SectionName}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* TC Type Radio Buttons */}
                    <div className='flex w-full flex-col gap-2 sm:w-56'>
                        <Label className='mb-1 font-semibold'>TC Type</Label>
                        <div className='flex items-center gap-4'>
                            <label className='flex items-center gap-2'>
                                <input
                                    type='radio'
                                    name='tcType'
                                    value='1'
                                    checked={tcType === 1}
                                    onChange={() => setTcType(1)}
                                    className='h-4 w-4'
                                />
                                <span>Temporary TC</span>
                            </label>

                            <label className='flex items-center gap-2'>
                                <input
                                    type='radio'
                                    name='tcType'
                                    value='2'
                                    checked={tcType === 2}
                                    onChange={() => setTcType(2)}
                                    className='h-4 w-4'
                                />
                                <span>Permanent TC</span>
                            </label>
                        </div>
                    </div>

                    {/* Columns Checklist using Popover */}
                </div>
                <div className='w-full'>
                    <Label className='mb-2 block font-semibold'>Select Columns to Display</Label>
                    <div className='flex flex-col gap-4 md:flex-row'>
                        <div className='relative w-full md:w-1/3'>
                            <Search className='absolute top-2.5 left-3 h-4 w-4 text-gray-400' />
                            <input
                                type='text'
                                placeholder='Search fields...'
                                value={fieldSearch}
                                onChange={(e) => setFieldSearch(e.target.value)}
                                className='w-full rounded-md border border-gray-300 py-2 pr-3 pl-10 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
                            />
                        </div>
                        <div
                            onClick={handleSelectAllFields}
                            className={cn(
                                'flex w-fit cursor-pointer items-center gap-2 rounded-md border px-3 py-2 font-medium text-sm transition-all',
                                selectedFields.length === filteredFields.length && filteredFields.length > 0
                                    ? 'border-primary bg-primary/5 text-primary'
                                    : 'border-gray-300 hover:border-primary/40'
                            )}>
                            {selectedFields.length === filteredFields.length && filteredFields.length > 0 ? (
                                <CheckSquare className='h-4 w-4 text-primary' />
                            ) : (
                                <Square className='h-4 w-4 text-gray-400' />
                            )}
                            <span>Select All</span>
                        </div>
                    </div>

                    <div className='mt-2 max-h-60 space-y-1 overflow-y-auto rounded-md border border-gray-300 p-2'>
                        <div className='grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
                            {filteredFields.map((field) => {
                                const selected = selectedFields.some((f: any) => f.columnID === field.columnID);
                                return (
                                    <div
                                        key={field.columnID}
                                        onClick={() => handleFieldToggle(field.columnID)}
                                        className={cn(
                                            'flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-all',
                                            selected
                                                ? 'border-primary bg-primary/5 text-primary'
                                                : 'border-gray-200 hover:border-primary/40 hover:bg-gray-50'
                                        )}>
                                        {selected ? (
                                            <CheckSquare className='h-4 w-4 text-primary' />
                                        ) : (
                                            <Square className='h-4 w-4 text-gray-400' />
                                        )}
                                        <span>{field.columnName}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    {errors.TempararyArrayheadList && <FormError>{errors.TempararyArrayheadList.message}</FormError>}
                </div>

                <div className='flex flex-col gap-3 sm:flex-row sm:justify-center'>
                    <Button type='button' onClick={handleReport} className='w-full transition-all duration-200 hover:scale-105 sm:w-fit'>
                        <FileText className='mr-2 h-4 w-4' />
                        Report
                    </Button>

                    <Button variant='outline' className='w-full transition-all duration-200 hover:scale-105 sm:w-fit' onClick={handleReset}>
                        <RotateCcw className='mr-2 h-4 w-4' />
                        Cancel
                    </Button>
                    <Button onClick={downloadExcel} className='w-full sm:w-fit'>
                        Export to Excel
                    </Button>
                    <Button onClick={handlePrintAll} disabled={isPrinting} className='w-full sm:w-fit'>
                        <Printer className='mr-2 h-4 w-4' />
                        {isPrinting ? 'Preparing...' : 'Print'}
                    </Button>
                </div>
            </div>

            <div className='container space-y-4 p-1'>
                {/* Data Table Section */}
                {showTable && (
                    <CollapsibleSection
                        defaultOpen={true}
                        variant='default'
                        size='lg'
                        title='Report Details'
                        className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                        <GenericDataTable
                            {...tableProps}
                            ref={tableRef}
                            columns={columns}
                            isLoading={isLoading}
                            error={error}
                            showViewOptions={false}
                            loadingMessage='Loading TC Report...'
                            noDataTitle='No Data Found'
                            noDataDescription='No records found for the selected criteria.'
                            errorTitle='Error Loading TC Report'
                            manualSorting={false}
                            manualFiltering={false}
                            manualPagination={false}
                        />
                    </CollapsibleSection>
                )}
            </div>

            <div style={{ position: 'absolute', top: '-9999px', left: '-9999px', width: '297mm' }}>
                <StudentTcReportPrint
                    ref={componentRef}
                    data={allReportData.length > 0 ? allReportData : reportData?.data || []}
                    selectedFields={selectedFields.map((f: any) => f.columnID)}
                />
            </div>
        </div>
    );
}
