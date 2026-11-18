'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CheckSquare, FileText, Printer, RotateCcw, Search, Square, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';
import type { z } from 'zod';

/* ---------------- UI Components ---------------- */
import { Button } from '@/components/ui/button';
import type { DataTableRef } from '@/components/ui/data-table/data-table';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { FormError } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

/* ---------------- Hooks ---------------- */
import {
    useAcademicYearDropdown,
    useConcessionDropdown,
    useMasterClassDropdown,
    useMasterSectionDropdown
} from '@/hooks/admission/preadmission/useMasters';
import { ClasswiseStudentDetails } from '@/hooks/admission/preadmission/useReports';

/* ---------------- Schema ---------------- */
import { classwiseStudentDetailsSchema } from '@/schemas/admission/preadmission/reports';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { exportToPdf } from '@/lib/export-to-file';
import { cn } from '@/lib/utils';
import { getclasswiseStudentDetails } from '@/server/admission/preadmission/reports/report';
import * as XLSX from 'xlsx';
import { ClasswisePrint } from './_components/classwise-print';
/* ---------------- Columns ---------------- */
import { getMasterAdmissionReportColumns } from './_components/columns';
import { ColumnValue } from './_components/columnvalue';
import { KendoFormat } from './_components/kendo-format';

/* -------------------------------------------------------------------------- */
/* Types */
/* -------------------------------------------------------------------------- */

type FormFields = z.infer<typeof classwiseStudentDetailsSchema>;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/* -------------------------------------------------------------------------- */
/* Component */
/* -------------------------------------------------------------------------- */

export default function AdmissionReportPage(props: {
    searchParams: SearchParams;
}) {
    const router = useRouter();
    const currentSearchParams = useSearchParams();
    const tableRef = useRef<DataTableRef>(null);
    const printRef = useRef<HTMLDivElement>(null);

    /* ---------------- Form ---------------- */

    const {
        control,
        watch,
        reset,
        setValue,
        formState: { errors }
    } = useForm<FormFields>({
        resolver: zodResolver(classwiseStudentDetailsSchema),
        defaultValues: {
            asmaY_Id: 0,
            fmcC_Id: 0,
            classes: [],
            class_section: [],
            selectedFields: []
        }
    });
    const handleFieldToggle = (fieldId: string) => {
        const current = selectedFields || [];
        const updated = current.includes(fieldId) ? current.filter((f) => f !== fieldId) : [...current, fieldId];
        setValue('selectedFields', updated, { shouldValidate: true });
    };
    const watchedAsmaY_Id = watch('asmaY_Id');
    const [selectedClassItems, setSelectedClassItems] = useState<{ asmcL_Id: string; asmcL_ClassName: string }[]>([]);
    const [selectedSectionItems, setSelectedSectionItems] = useState<{ asmS_Id: string; asmcL_SectionName: string }[]>([]);
    const scopeMap: Record<'newad' | 'totstd' | 'prom' | 'yrloss' | 'deact', number> = {
        newad: 1,
        totstd: 2,
        prom: 3,
        yrloss: 4,
        deact: 5
    };

    const [studentScope, setStudentScope] = useState<'newad' | 'totstd' | 'prom' | 'yrloss' | 'deact'>('newad');

    const [studentStatus, setStudentStatus] = useState<'Tformate' | 'Kformate'>('Tformate');

    const watchedYear = watch('asmaY_Id');
    const watchedStudentCategory = watch('fmcC_Id');
    const selectedFields = watch('selectedFields');

    /* ---------------- Local State ---------------- */

    const [showReport, setShowReport] = useState(false);
    const [requestPayload, setRequestPayload] = useState<any>(null);
    const [resolvedSearchParams, setResolvedSearchParams] = useState<Record<string, string | string[] | undefined>>({});
    const [fieldSearch, setFieldSearch] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [printTimestamp, setPrintTimestamp] = useState('');
    const [printData, setPrintData] = useState<any[]>([]);

    /* ---------------- Masters ---------------- */

    const { data: academicYear } = useAcademicYearDropdown();
    const { data: masterSection, isLoading: masterSectionLoading } = useMasterSectionDropdown();
    const { data: masterClass, isLoading: masterClassLoading } = useMasterClassDropdown();
    const { data: concession } = useConcessionDropdown();
    const filteredFields = useMemo(() => {
        return ColumnValue.filter((field) => field.columnName.toLowerCase().includes(fieldSearch.toLowerCase()));
    }, [fieldSearch]);

    /* ---------------- Build Payload ---------------- */
    const handleClassSelection = (selectedValues: string[]) => {
        const selectedClasses = selectedValues.map((value) => {
            const cls = (masterClass?.data as any)?.find((c: any) => String(c.asmcL_Id) === String(value));
            return {
                asmcL_Id: value.toString(),
                asmcL_ClassName: cls?.asmcL_ClassName ?? ''
            };
        });

        setSelectedClassItems(selectedClasses);
    };
    const handleSectionSelection = (selectedValues: string[]) => {
        const selectedSections = selectedValues.map((value) => {
            const section = (masterSection?.data as any)?.find((s: any) => String(s.asmS_Id) === String(value));
            return {
                asmS_Id: value.toString(),
                asmcL_SectionName: section?.asmC_SectionName ?? ''
            };
        });

        setSelectedSectionItems(selectedSections);
    };

    /* ---------------- Resolve Search Params ---------------- */

    useEffect(() => {
        const resolveParams = async () => {
            const resolved = await props.searchParams;
            setResolvedSearchParams(resolved);
        };
        resolveParams();
    }, [props.searchParams]);

    /* ---------------- API ---------------- */

    const {
        data: response,
        isFetching,
        error,
        refetch
    } = ClasswiseStudentDetails(watchedYear, scopeMap[studentScope], watchedStudentCategory ?? 0, requestPayload, resolvedSearchParams);

    /* ---------------- Table ---------------- */

    const columns = useMemo(() => getMasterAdmissionReportColumns(selectedFields), [selectedFields]);

    const transformedResponse = useMemo(() => {
        if (!response) return response;
        return {
            ...response,
            data: (response.data as any)?.printdatatable ?? []
        };
    }, [response]);

    const tableProps = useDataTableProps(transformedResponse);
    const handleSelectAllFields = () => {
        if (selectedFields.length === filteredFields.length) {
            setValue('selectedFields', [], { shouldValidate: true });
        } else {
            setValue(
                'selectedFields',
                filteredFields.map((f) => f.columnID),
                { shouldValidate: true }
            );
        }
    };

    /* ---------------- Handlers ---------------- */

    const getValidatedPayload = () => {
        const fromData = watch();

        if (!fromData.asmaY_Id) {
            toast.error('Please Select Academic Year');
            return null;
        }

        if (!fromData.classes || fromData.classes.length === 0) {
            toast.error('Please Select Class');
            return null;
        }

        if (!fromData.class_section || fromData.class_section.length === 0) {
            toast.error('Please Select Section');
            return null;
        }

        if (!fromData.selectedFields || fromData.selectedFields.length === 0) {
            toast.error('Please Select Search Fields');
            return null;
        }

        return {
            classdetailsdata: fromData.classes.map((id: any) => {
                const cls = (masterClass?.data as any)?.find((c: any) => String(c.asmcL_Id) === String(id));
                return {
                    asmcL_Id: id.toString(),
                    asmcL_ClassName: cls?.asmcL_ClassName ?? ''
                };
            }),
            sectionsdetailsdata: fromData.class_section.map((id: any) => {
                const section = (masterSection?.data as any)?.find((s: any) => String(s.asmS_Id) === String(id));
                return {
                    asmS_Id: id.toString(),
                    asmcL_SectionName: section?.asmC_SectionName ?? ''
                };
            }),
            tempararyArrayheadList: fromData.selectedFields.map((id: string) => {
                const field = ColumnValue.find((f) => f.columnID === id);
                return {
                    columnID: id,
                    columnName: field?.columnName || ''
                };
            })
        };
    };

    const handleReport = async () => {
        setIsLoading(true);
        try {
            const payload = getValidatedPayload();
            if (!payload) {
                setIsLoading(false);
                return;
            }

            console.log(' Report Button Parameters Debug:', {
                watchedYear,
                studentScope,
                scopeMapValue: scopeMap[studentScope],
                watchedStudentCategory,
                'Concession_Id should be': scopeMap[studentScope],
                'flag should be': watchedStudentCategory
            });

            setRequestPayload(payload);
            setShowReport(true);

            const params = new URLSearchParams(currentSearchParams.toString());
            params.set('page', '1');
            router.push(`?${params.toString()}`, { scroll: false });

            toast.success('Generating report...');
        } catch (err) {
            console.error(err);
            toast.error('Failed to generate report');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        window.location.reload();
    };

    const handleCancel = () => {
        window.location.reload();
    };

    const downloadExcel = async () => {
        try {
            const payload = getValidatedPayload();
            if (!payload) return;

            toast.loading('Preparing Excel export...', { id: 'excel-download' });

            // Fetch all data for export
            const allDataResponse: any = await getclasswiseStudentDetails(
                watchedYear,
                watchedStudentCategory ?? 0,
                scopeMap[studentScope],
                payload,
                { page_size: 100000, page: 1 }
            );

            const allData = allDataResponse?.data?.printdatatable || [];

            if (!allData || allData.length === 0) {
                toast.dismiss('excel-download');
                toast.error('No data available to export');
                return;
            }

            const activeFields = ColumnValue.filter((f) => selectedFields.includes(f.columnID));
            const yearObj = academicYear?.data?.find((y) => y.asmaY_Id === watchedYear);

            // Prepare report headers
            const reportHeaders = [
                ['CLASS WISE STUDENT DETAILS'],
                [`Academic Year: ${yearObj?.asmaY_Year || 'N/A'}`],
                [`Classes: ${selectedClassItems.map((c) => c.asmcL_ClassName).join(', ')}`],
                [`Sections: ${selectedSectionItems.map((s) => s.asmcL_SectionName).join(', ')}`],
                [] // Empty row
            ];

            // Prepare table data
            const tableHeaders = ['Sl.No', ...activeFields.map((f) => f.columnName)];
            const tableData = allData.map((row: any, index: number) => {
                const rowData = [index + 1];
                activeFields.forEach((field) => {
                    rowData.push(row[field.columnID] || '-');
                });
                return rowData;
            });

            // Create worksheet
            const ws = XLSX.utils.aoa_to_sheet([...reportHeaders, tableHeaders, ...tableData]);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'ClassWiseStudentReport');

            // Download file
            XLSX.writeFile(wb, `ClassWiseStudentReport_${yearObj?.asmaY_Year || 'Report'}.xlsx`);

            toast.dismiss('excel-download');
            toast.success('Excel downloaded successfully');
        } catch (error) {
            console.error('Download error:', error);
            toast.dismiss('excel-download');
            toast.error('Failed to prepare Excel export');
        }
    };

    const downloadPdf = async () => {
        try {
            const payload = getValidatedPayload();
            if (!payload || !transformedResponse?.data) {
                toast.error('No data available to export');
                return;
            }

            toast.loading('Preparing PDF...', { id: 'pdf-download' });

            const activeFields = ColumnValue.filter((f) => selectedFields.includes(f.columnID));
            const pdfColumns = activeFields.map((f) => f.columnName);
            const pdfData = (transformedResponse.data as any[]).map((row) => activeFields.map((f) => String(row[f.columnID] || '')));

            exportToPdf('Class Wise Student Report', pdfColumns, pdfData);

            toast.dismiss('pdf-download');
            toast.success('PDF downloaded successfully');
        } catch (error) {
            console.error('PDF error:', error);
            toast.dismiss('pdf-download');
            toast.error('Failed to download PDF');
        }
    };

    /* ---------------- Print ---------------- */

    const triggerPrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: 'ClassWiseStudentReport'
    });

    const handlePrint = async () => {
        if (!showReport) {
            toast.error('No report data to print');
            return;
        }
        const payload = getValidatedPayload();
        if (!payload) return;

        try {
            toast.loading('Preparing print...', { id: 'print-load' });
            const allDataResponse: any = await getclasswiseStudentDetails(
                watchedYear,
                watchedStudentCategory ?? 0,
                scopeMap[studentScope],
                payload,
                { page_size: 100000, page: 1 }
            );
            const allData = allDataResponse?.data?.printdatatable || [];
            if (!allData.length) {
                toast.dismiss('print-load');
                toast.error('No data available to print');
                return;
            }
            setPrintData(allData);
            setPrintTimestamp(new Date().toLocaleString());
            toast.dismiss('print-load');
            // Small delay to let React re-render printData into the hidden component
            setTimeout(() => triggerPrint(), 300);
        } catch (err) {
            toast.dismiss('print-load');
            toast.error('Failed to prepare print');
        }
    };

    /* -------------------------------------------------------------------------- */
    /* Render */
    /* -------------------------------------------------------------------------- */

    return (
        <div className='container min-h-screen space-y-4 p-2'>
            <CollapsibleSection title='Class Wise Student Details' defaultOpen>
                <div className='grid grid-cols-1 gap-4 p-4 md:grid-cols-2'>
                    {/* Academic Year */}
                    <div>
                        <Label>
                            Academic Year <span className='text-red-600'>*</span>
                        </Label>
                        <Controller
                            name='asmaY_Id'
                            control={control}
                            render={({ field }) => (
                                <Select value={field.value ? String(field.value) : ''} onValueChange={(v) => field.onChange(Number(v))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select Academic Year' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {academicYear?.data?.map((yr) => (
                                            <SelectItem key={yr.asmaY_Id} value={String(yr.asmaY_Id)}>
                                                {yr.asmaY_Year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.asmaY_Id && <FormError>{errors.asmaY_Id.message}</FormError>}
                    </div>

                    {/* Class */}
                    <div>
                        <Label>
                            Trade Name <span className='text-red-600'>*</span>
                        </Label>
                        <Controller
                            name='classes'
                            control={control}
                            render={({ field }) => (
                                <MultiSelect
                                    options={
                                        masterClass?.data?.map((c) => ({
                                            label: c.asmcL_ClassName,
                                            value: String(c.asmcL_Id)
                                        })) ?? []
                                    }
                                    onValueChange={(selectedValues) => {
                                        field.onChange(selectedValues);
                                        handleClassSelection(selectedValues);
                                    }}
                                    defaultValue={selectedClassItems.map((data) => data.asmcL_Id)}
                                    value={selectedClassItems.map((data) => data.asmcL_Id)}
                                    placeholder='Trade Name'
                                    variant='inverted'
                                    disabled={!watchedAsmaY_Id || masterClassLoading}
                                />
                            )}
                        />
                        {errors.classes && <FormError>{errors.classes.message}</FormError>}
                    </div>

                    {/* Section */}
                    <div>
                        <Label>
                            Unit <span className='text-red-600'>*</span>
                        </Label>
                        <Controller
                            name='class_section'
                            control={control}
                            render={({ field }) => (
                                <MultiSelect
                                    options={
                                        masterSection?.data?.map((s) => ({
                                            label: s.asmC_SectionName,
                                            value: String(s.asmS_Id)
                                        })) ?? []
                                    }
                                    onValueChange={(selectedValues) => {
                                        field.onChange(selectedValues);
                                        handleSectionSelection(selectedValues);
                                    }}
                                    defaultValue={selectedSectionItems.map((data) => data.asmS_Id)}
                                    value={selectedSectionItems.map((data) => data.asmS_Id)}
                                    placeholder='Select Unit'
                                    variant='inverted'
                                    disabled={masterSectionLoading}
                                />
                            )}
                        />
                        {errors.class_section && <FormError>{errors.class_section.message}</FormError>}
                    </div>

                    {/* Fields */}
                    <div className='space-y-3'>
                        <div className='relative'>
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
                                'flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 font-medium text-sm transition-all',
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

                        <div className='max-h-60 space-y-1 overflow-y-auto rounded-md border border-gray-300 p-2'>
                            {filteredFields.map((field) => {
                                const selected = selectedFields.includes(field.columnID);
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
                        {errors.selectedFields && <FormError>{errors.selectedFields.message}</FormError>}
                    </div>
                    <div>
                        <Label>Shift</Label>
                        <Controller
                            name='fmcC_Id'
                            control={control}
                            render={({ field }) => (
                                <Select value={field.value ? String(field.value) : ''} onValueChange={(v) => field.onChange(Number(v))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select Shift' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {concession?.data?.map((yr: any) => (
                                            <SelectItem key={yr.fmcC_Id} value={String(yr.fmcC_Id)}>
                                                {yr.fmcC_ConcessionName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.fmcC_Id && <FormError>{errors.fmcC_Id.message}</FormError>}
                    </div>
                </div>
                {/* Radios */}
                <div className='space-y-4 border-t pt-6'>
                    <RadioGroup
                        value={studentScope}
                        onValueChange={(v) => setStudentScope(v as 'newad' | 'totstd' | 'prom' | 'yrloss' | 'deact')}
                        className='flex flex-wrap justify-center gap-6'>
                        <RadioGroupItem value='newad' /> <Label>New Admission</Label>
                        <RadioGroupItem value='totstd' /> <Label>Total Students</Label>
                        <RadioGroupItem value='prom' /> <Label>Promoted</Label>
                        <RadioGroupItem value='yrloss' /> <Label>Year Loss</Label>
                        <RadioGroupItem value='deact' /> <Label>Deactivated</Label>
                    </RadioGroup>

                    <RadioGroup
                        value={studentStatus}
                        onValueChange={(v) => setStudentStatus(v as any)}
                        className='flex justify-center gap-6'>
                        <RadioGroupItem value='Tformate' /> <Label>Table Format</Label>
                        <RadioGroupItem value='Kformate' /> <Label>Kendo Format</Label>
                    </RadioGroup>
                </div>

                {/* Buttons */}
                <div className='flex gap-3 p-4'>
                    <Button onClick={handleReport} isLoading={isLoading} loadingText='Generating...'>
                        <FileText className='mr-2 h-4 w-4' />
                        Report
                    </Button>
                    <Button variant='outline' onClick={handleReset}>
                        <RotateCcw className='mr-2 h-4 w-4' />
                        Reset
                    </Button>
                    <Button onClick={downloadExcel} className='w-fit'>
                        Export to Excel
                    </Button>
                    <Button variant='outline' onClick={handlePrint} disabled={!showReport}>
                        <Printer className='mr-2 h-4 w-4' />
                        Print
                    </Button>
                    <Button variant='outline' onClick={handleCancel}>
                        <X className='mr-2 h-4 w-4' />
                        Cancel
                    </Button>
                </div>
            </CollapsibleSection>

            {/* Report */}
            {showReport && (
                <CollapsibleSection title='Class Wise Student Report' defaultOpen>
                    {studentStatus === 'Kformate' ? (
                        <KendoFormat
                            data={transformedResponse?.data || []}
                            selectedFields={selectedFields}
                            onExportExcel={downloadExcel}
                            onExportPdf={downloadPdf}
                            isLoading={isFetching}
                        />
                    ) : (
                        <GenericDataTable
                            {...tableProps}
                            ref={tableRef}
                            columns={columns}
                            isLoading={isFetching}
                            error={error}
                            showViewOptions={false}
                            isPaginationRequired
                            loadingMessage='Loading Admission Report...'
                            noDataTitle='No Records Found'
                        />
                    )}
                </CollapsibleSection>
            )}

            {/* Hidden Print Layout */}
            <div style={{ display: 'none' }}>
                <ClasswisePrint
                    ref={printRef}
                    data={printData}
                    selectedFields={selectedFields}
                    academicYear={academicYear?.data?.find((y) => y.asmaY_Id === watchedYear)?.asmaY_Year || ''}
                    classes={selectedClassItems.map((c) => c.asmcL_ClassName).join(', ')}
                    sections={selectedSectionItems.map((s) => s.asmcL_SectionName).join(', ')}
                    printTimestamp={printTimestamp}
                />
            </div>
        </div>
    );
}
