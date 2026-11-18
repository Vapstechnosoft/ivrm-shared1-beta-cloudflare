'use client';

import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useStudentCountReport } from '@/hooks/admission/preadmission/useReports';
import { tableSearchVariables } from '@/lib/data-table.config';
import { addOrUpdateStudentCountReport } from '@/server/admission/preadmission/reports/student_count_report';
import type { IMasterStudentCountReportList } from '@/types/admission/preadmission/reports';
import { FileDown, Printer } from 'lucide-react';
import { parseAsInteger, parseAsString, parseAsStringLiteral } from 'nuqs';
import { useQueryState } from 'nuqs';
import React, { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import PreadmissionStatusCountReport from '../../transactions/application-form/_components/preadmission-status-count-report';
import AddStudentCountReportForm from './_components/add-from';
import AddressBookPrint from './_components/address-book-print';
import { formatDate, getStudentCountReportColumns, getStudentName } from './_components/columns';
import StudentCountReportPrint from './_components/report-print';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function StudentCountReportPage(props: {
    searchParams: SearchParams;
}) {
    const searchParams = (React as any).use(props.searchParams);
    const [filterPayload, setFilterPayload] = useState<any>({
        report_type: 1,
        type: 'between',
        from_date: format(new Date(), 'yyyy-MM-dd'),
        to_date: format(new Date(), 'yyyy-MM-dd'),
        asmay_id: 0,
        asmcl_id: 0
    });
    const [isSearched, setIsSearched] = useState(false);

    const { data: response, isLoading, error } = useStudentCountReport(filterPayload, searchParams, isSearched);

    return (
        <FormProvider<IMasterStudentCountReportList>>
            <StudentCountReportPageContent
                response={response}
                isLoading={isLoading}
                error={error}
                searchParams={searchParams}
                onFilterChange={(payload, reset) => {
                    if (reset) {
                        setIsSearched(false);
                    } else {
                        setFilterPayload(payload);
                        setIsSearched(true);
                    }
                }}
                isSearched={isSearched}
                filterPayload={filterPayload}
            />
        </FormProvider>
    );
}

function FormSections({ searchParams, onFilterChange }: { searchParams?: any; onFilterChange?: (payload: any, reset?: boolean) => void }) {
    const { closeAddForm, addFormRef } = useFormContext<IMasterStudentCountReportList>();

    return (
        <>
            <div ref={addFormRef}>
                <CollapsibleSection
                    title='Add New Student Count Report'
                    description='Fill in the details below to Student Count Report'
                    defaultOpen={true}
                    variant='outline'
                    size='md'
                    className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                    <div className='relative'>
                        <Button type='button' onClick={closeAddForm} variant='ghost' size='sm'></Button>
                        <AddStudentCountReportForm onSuccess={closeAddForm} searchParams={searchParams} onFilterChange={onFilterChange} />
                    </div>
                </CollapsibleSection>
            </div>
        </>
    );
}

function StudentCountReportPageContent({
    response,
    isLoading,
    error,
    searchParams,
    onFilterChange,
    isSearched,
    filterPayload
}: {
    response: any;
    isLoading: boolean;
    error: any;
    searchParams?: any;
    onFilterChange?: (payload: any, reset?: boolean) => void;
    isSearched: boolean;
    filterPayload: any;
}) {
    const [printMode, setPrintMode] = useState<'report' | 'address'>('report');
    const [allData, setAllData] = useState<IMasterStudentCountReportList[]>([]);
    const [isFetchingAll, setIsFetchingAll] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: printMode === 'report' ? 'Student Count Report' : 'Address Book'
    });

    const handlePrintAll = async (mode: 'report' | 'address') => {
        try {
            setIsFetchingAll(true);
            setPrintMode(mode);
            toast.loading('Preparing all records for print...', { id: 'print-loading' });

            const response = await addOrUpdateStudentCountReport(filterPayload, {
                page: 1,
                page_size: 100000 // Large number to get all records
            });

            if (response.success && response.data) {
                const records = Array.isArray(response.data) ? response.data : [];
                setAllData(records);

                // Increase timeout to ensure render
                setTimeout(() => {
                    handlePrint();
                    toast.dismiss('print-loading');
                    setIsFetchingAll(false);
                }, 1000);
            } else {
                toast.error('Failed to fetch records for print');
                toast.dismiss('print-loading');
                setIsFetchingAll(false);
            }
        } catch (error: any) {
            toast.error(error.message);
            toast.dismiss('print-loading');
            setIsFetchingAll(false);
        }
    };

    const exportToExcel = async () => {
        try {
            toast.loading('Preparing all records for excel export...', { id: 'excel-loading' });

            const response = await addOrUpdateStudentCountReport(filterPayload, {
                page: 1,
                page_size: 100000 // Large number to get all records
            });

            if (response.success && response.data) {
                const records = Array.isArray(response.data) ? response.data : [];
                if (records.length === 0) {
                    toast.error('No records found to export');
                    toast.dismiss('excel-loading');
                    return;
                }

                // Map data for clean excel output
                const excelData = records.map((row: any, index: number) => {
                    return {
                        'SL.NO': index + 1,
                        'STUDENT NAME': getStudentName(row),
                        'EMAIL-ID': row.EmailID || 'N/A',
                        'MOBILE NUMBER': row.Mobileno || 'N/A',
                        'REG DATE': formatDate(row.RegDate)
                    };
                });

                const worksheet = XLSX.utils.json_to_sheet(excelData);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
                XLSX.writeFile(workbook, 'StudentCountReport_All.xlsx');
                toast.success('Excel exported successfully', { id: 'excel-loading' });
            } else {
                toast.error('Failed to fetch records for export');
                toast.dismiss('excel-loading');
            }
        } catch (error: any) {
            toast.error(error.message);
            toast.dismiss('excel-loading');
        }
    };

    // Use nuqs to reactively read URL search params (these update when toolbar changes them)
    const [searchQuery] = useQueryState(tableSearchVariables.search, parseAsString.withOptions({ shallow: false }).withDefault(''));
    const [sortCol] = useQueryState(tableSearchVariables.sort_column, parseAsString.withOptions({ shallow: false }).withDefault(''));
    const [sortDir] = useQueryState(
        tableSearchVariables.sort_direction,
        parseAsStringLiteral(['asc', 'desc'] as const).withOptions({ shallow: false }).withDefault('asc')
    );
    const [currentPage] = useQueryState(tableSearchVariables.page, parseAsInteger.withOptions({ shallow: false }).withDefault(1));
    const [pageSize] = useQueryState(tableSearchVariables.page_size, parseAsInteger.withOptions({ shallow: false }).withDefault(10));

    const tableProps = useDataTableProps(response);

    // The API returns all records at once, so we handle filtering, sorting, and pagination client-side
    if (tableProps.data && Array.isArray(tableProps.data)) {
        let processedData = [...tableProps.data];

        // 1. Search Filter — uses reactive nuqs value so it updates on every keystroke
        const search = searchQuery?.toLowerCase();
        if (search) {
            processedData = processedData.filter((item: any) => {
                const studentName = getStudentName(item);
                const formattedDate = formatDate(item.RegDate);
                const valuesToSearch = [...Object.values(item), studentName, formattedDate];
                return valuesToSearch.some((val) => String(val).toLowerCase().includes(search));
            });
        }
        tableProps.totalItems = processedData.length;

        // 2. Sort
        if (sortCol) {
            processedData.sort((a, b) => {
                const getSortValue = (item: any, col: string) => {
                    if (col === 'FirstName') {
                        return getStudentName(item).toLowerCase();
                    }
                    if (col === 'RegDate') {
                        const d = item.RegDate;
                        if (!d) return 0;
                        if (typeof d === 'string') {
                            const match = d.trim().match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
                            if (match) {
                                return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1])).getTime();
                            }
                        }
                        return new Date(d).getTime() || 0;
                    }
                    return (item[col] ?? '').toString().toLowerCase();
                };
                const aVal = getSortValue(a, sortCol);
                const bVal = getSortValue(b, sortCol);
                if (aVal === bVal) return 0;
                const comparison = aVal > bVal ? 1 : -1;
                return sortDir === 'desc' ? -comparison : comparison;
            });
        }

        // 3. Paginate
        tableProps.data = processedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    }

    const columns = getStudentCountReportColumns();

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Report Cards */}
                <PreadmissionStatusCountReport filterPayload={isSearched ? filterPayload : undefined} />

                {/* Add Form Section (shown first) */}
                <FormSections searchParams={searchParams} onFilterChange={onFilterChange} />

                {/* Data Table Section */}
                {isSearched && (
                    <CollapsibleSection
                        defaultOpen={true}
                        variant='default'
                        size='lg'
                        className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                        <div className='mb-6 flex flex-row items-center justify-center gap-4'>
                            <Button
                                variant='default'
                                size='sm'
                                onClick={() => handlePrintAll('report')}
                                disabled={isFetchingAll}
                                className='flex items-center gap-2 border-none bg-blue-600 text-white shadow-md transition-all hover:scale-105 hover:bg-blue-700'>
                                <Printer className='h-4 w-4' />
                                {isFetchingAll && printMode === 'report' ? 'Preparing...' : 'Print Report (All)'}
                            </Button>
                            <Button
                                variant='default'
                                size='sm'
                                onClick={() => handlePrintAll('address')}
                                disabled={isFetchingAll}
                                className='flex items-center gap-2 border-none bg-emerald-600 text-white shadow-md transition-all hover:scale-105 hover:bg-emerald-700'>
                                <Printer className='h-4 w-4' />
                                {isFetchingAll && printMode === 'address' ? 'Preparing...' : 'Print Address Book (All)'}
                            </Button>
                            <Button
                                variant='default'
                                size='sm'
                                onClick={exportToExcel}
                                className='flex items-center gap-2 border-none bg-orange-600 text-white shadow-md transition-all hover:scale-105 hover:bg-orange-700'>
                                <FileDown className='h-4 w-4' />
                                Export to Excel
                            </Button>
                        </div>
                        <GenericDataTable<IMasterStudentCountReportList>
                            {...tableProps}
                            columns={columns}
                            isLoading={isLoading}
                            error={error}
                            showViewOptions={true}
                            isSearchRequired={true}
                            columnPinning={{ right: ['actions'] }}
                            isPaginationRequired={true}
                            loadingMessage='Loading Student Count Reports...'
                            noDataTitle='No Student Count Reports Found'
                            noDataDescription='Try adjusting your search filters'
                            errorTitle='Error Loading Student Count Reports'
                        />

                        {/* Print Content - Hidden from screen, visible for print */}
                        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: 0, overflow: 'hidden', zIndex: -1000 }}>
                            <div
                                ref={printRef}
                                key={allData.length + printMode}
                                className='printable-content'
                                style={{
                                    background: 'white',
                                    color: 'black',
                                    opacity: 1,
                                    visibility: 'visible',
                                    height: 'auto',
                                    display: 'block'
                                }}>
                                {printMode === 'report' ? (
                                    <StudentCountReportPrint
                                        data={allData}
                                        reportType={filterPayload.report_type?.toString() || '1'}
                                        rangeType={filterPayload.type}
                                        fromDate={filterPayload.from_date}
                                        toDate={filterPayload.to_date}
                                        academicYear={''}
                                    />
                                ) : (
                                    <AddressBookPrint
                                        data={allData}
                                        reportType={filterPayload.report_type?.toString() || '1'}
                                        rangeType={filterPayload.type}
                                        fromDate={filterPayload.from_date}
                                        toDate={filterPayload.to_date}
                                        academicYear={''}
                                    />
                                )}
                            </div>
                        </div>
                    </CollapsibleSection>
                )}
            </div>
        </div>
    );
}
