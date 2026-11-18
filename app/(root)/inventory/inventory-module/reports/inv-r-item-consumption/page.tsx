'use client';

import { Heading } from '@/components/layout/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useInvRItemConsumptionReportQuery } from '@/hooks/inventory/reports/use-inv-r-item-consumption';
import { tableSearchVariables } from '@/lib/data-table.config';
import { getInvRItemConsumptionReport } from '@/server/inventory/reports/inv-r-item-consumption';
import type { IInvRItemConsumptionPayload, IInvRItemConsumptionReportData } from '@/types/inventory/reports/inv-r-item-consumption';
import { format } from 'date-fns';
import { saveAs } from 'file-saver';
import { FileSpreadsheet, Printer } from 'lucide-react';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { use, useEffect, useState } from 'react';
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { getColumns } from './_components/columns';
import { InvRItemConsumptionPrint } from './_components/inv-r-item-consumption-print';
import ReportForm from './_components/report-form';

export default function InvRItemConsumptionPage(props: { searchParams: Promise<any> }) {
    const searchParams = use(props.searchParams);
    const [currentPayload, setCurrentPayload] = useState<IInvRItemConsumptionPayload | null>(null);
    const [printData, setPrintData] = useState<IInvRItemConsumptionReportData[]>([]);
    const componentRef = useRef<HTMLDivElement>(null);

    // Pagination & Search State synced with URL
    const [currentPage, setCurrentPage] = useQueryState(
        tableSearchVariables.page,
        parseAsInteger.withOptions({ shallow: false }).withDefault(1)
    );
    const [pageSize, setPageSize] = useQueryState(
        tableSearchVariables.page_size,
        parseAsInteger.withOptions({ shallow: false }).withDefault(10)
    );
    const [searchQuery, setSearchQuery] = useQueryState(
        tableSearchVariables.search,
        parseAsString.withOptions({ shallow: false }).withDefault('')
    );
    const [searchColumn] = useQueryState(
        tableSearchVariables.search_columns,
        parseAsString.withOptions({ shallow: false }).withDefault('All')
    );

    // Prepare payload for hook (convert Dates to strings to avoid serialization issues/hook unnecessary updates)
    const payloadForHook = currentPayload
        ? {
              ...currentPayload,
              startdate: currentPayload.startdate ? new Date(currentPayload.startdate).toISOString() : undefined,
              enddate: currentPayload.enddate ? new Date(currentPayload.enddate).toISOString() : undefined
          }
        : null;

    const { data: reportResult, isFetching } = useInvRItemConsumptionReportQuery(payloadForHook as any, {
        ...searchParams,
        page: currentPage,
        page_size: pageSize,
        search_query: searchQuery,
        search_column: searchColumn
    });

    const extractReportData = (result: any) => {
        if (!result?.data) return [];

        // 1. data is directly an array
        if (Array.isArray(result.data)) return result.data;

        // 2. data.$values is an array
        if (result.data.$values && Array.isArray(result.data.$values)) return result.data.$values;

        // 3. get_ICReport is an array
        if (Array.isArray(result.data.get_ICReport)) return result.data.get_ICReport;

        // 4. get_ICReport.$values is an array
        if (result.data.get_ICReport?.$values && Array.isArray(result.data.get_ICReport.$values)) {
            return result.data.get_ICReport.$values;
        }

        return [];
    };

    const reportData = extractReportData(reportResult);
    const totalRecords = reportResult?.total || 0;

    const handleReportGenerated = (payload: any) => {
        if (payload) {
            // Show toast for empty initial report (check isFetching and payload updates)
            if (totalRecords === 0 && !isFetching && currentPayload) {
                toast.error('No record found');
            }
            setCurrentPayload(payload);
            setCurrentPage(1);
            setSearchQuery(null);
        } else {
            setCurrentPayload(null);
            setCurrentPage(1);
            setSearchQuery(null);
        }
    };

    // Show toast for empty search results or initial empty report
    useEffect(() => {
        if (!isFetching && currentPayload && totalRecords === 0) {
            toast.error('No record found');
        }
    }, [isFetching, totalRecords, searchQuery, currentPayload]);

    const columns = getColumns(currentPayload?.typeflag || 'All', currentPayload?.optionflag);

    // Manual filtering should be true for server-side search
    const manualFiltering = totalRecords > reportData.length;

    const handlePrintContent = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Item Consumption Report - ${new Date().toISOString().split('T')[0]}`
    });

    const fetchAllData = async (action: 'print' | 'excel') => {
        if (!currentPayload) return [];
        try {
            toast.loading(`Fetching all records for ${action}...`, { id: 'fetch-all' });

            const p: any = {
                ...currentPayload,
                startdate: currentPayload.startdate ? new Date(currentPayload.startdate).toISOString() : undefined,
                enddate: currentPayload.enddate ? new Date(currentPayload.enddate).toISOString() : undefined
            };

            const response = await getInvRItemConsumptionReport(p, {
                ...searchParams,
                page: 1,
                page_size: 100000,
                search_query: searchQuery || ''
            });
            const allData = extractReportData(response);

            if (allData.length === 0) {
                toast.dismiss('fetch-all');
                toast.error(`Failed to fetch ${action} data`);
                return [];
            }
            toast.dismiss('fetch-all');
            return allData;
        } catch (error) {
            console.error(`${action} fetch error:`, error);
            toast.dismiss('fetch-all');
            toast.error(`Error fetching ${action} data`);
            return [];
        }
    };

    const handlePrint = async () => {
        const allData = await fetchAllData('print');
        if (allData.length > 0) {
            setPrintData(allData);
            toast.success(`Ready to print ${allData.length} records`);
            setTimeout(() => {
                handlePrintContent();
            }, 500);
        }
    };

    const handleExportExcel = async () => {
        const allData = await fetchAllData('excel');
        if (allData.length > 0) {
            let dataToExport: any[] = [];
            const typeflag = currentPayload?.typeflag || 'All';
            const optionflag = currentPayload?.optionflag;

            dataToExport = allData.map((row: any, index: number) => {
                const base: any = {
                    'SL.No': index + 1
                };

                const dateVal = row.icDate ? format(new Date(row.icDate), 'dd/MM/yyyy') : '';

                if (typeflag === 'Overall') {
                    if (optionflag === 'Item') {
                        base['Item'] = row.itemName || '';
                        base['UOM'] = row.invmuoM_UOMName || '';
                        base['Quantity'] = Number(row.icQty || 0).toFixed(2);
                    } else if (optionflag === 'Staff') {
                        base['Employee Name'] = row.memberName || '';
                        base['Employee Code'] = row.memberCode || '';
                        base['Quantity'] = Number(row.icQty || 0).toFixed(2);
                    } else if (optionflag === 'Department') {
                        base['Department'] = row.memberName || '';
                        base['Quantity'] = Number(row.icQty || 0).toFixed(2);
                    } else if (optionflag === 'Student') {
                        base['Student Name'] = row.memberName || '';
                        base['Admission No.'] = row.memberCode || '';
                        base['Quantity'] = Number(row.icQty || 0).toFixed(2);
                    }
                } else if (typeflag === 'Detailed' && optionflag === 'Item') {
                    base['Item'] = row.itemName || '';
                    base['UOM'] = row.invmuoM_UOMName || '';
                    base['Date'] = dateVal;
                    base['Quantity'] = Number(row.icQty || 0).toFixed(2);
                } else {
                    base['Item'] = row.itemName || '';
                    base['UOM'] = row.invmuoM_UOMName || '';
                    base['Date'] = dateVal;
                    base['Quantity'] = Number(row.icQty || 0).toFixed(2);
                }

                return base;
            });

            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'IC Report');
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const data = new Blob([excelBuffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
            });
            saveAs(data, 'Item_Consumption_Report.xlsx');
            toast.success('Excel downloaded successfully');
        }
    };

    return (
        <div className='container mx-auto space-y-6 px-4 py-6'>
            <Heading title='Item Consumption Report' description='Generate Item Consumption Reports' />

            <ReportForm onReportGenerated={handleReportGenerated} isLoading={isFetching} />

            {currentPayload && (
                <CollapsibleSection title='Report Result' defaultOpen={true}>
                    <div className='space-y-8 rounded-lg border border-slate-200 bg-white p-6 text-slate-900 shadow-sm'>
                        {/* Header Section */}
                        <div className='mb-8 flex flex-col items-center justify-center space-y-3 border-slate-200 border-b pb-6'>
                            <h3 className='text-center font-bold text-3xl text-slate-800 uppercase tracking-tight'>
                                Item Consumption Report
                            </h3>
                            <div className='h-1 w-24 rounded-full bg-primary'></div>
                            <p className='font-medium text-lg text-slate-600 uppercase tracking-wide'>
                                {currentPayload.startdate ? format(new Date(currentPayload.startdate), 'dd/MM/yyyy') : 'N/A'} -{' '}
                                {currentPayload.enddate ? format(new Date(currentPayload.enddate), 'dd/MM/yyyy') : 'N/A'}
                            </p>
                        </div>

                        <div className='flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm'>
                            <div className='flex items-center gap-4'>
                                <div className='flex items-center gap-2'>
                                    <span className='font-semibold text-slate-500 text-xs uppercase tracking-wider'>Total Records:</span>
                                    <Badge variant='secondary' className='bg-slate-200 text-slate-700 hover:bg-slate-200'>
                                        {totalRecords}
                                    </Badge>
                                </div>
                                <div className='h-4 w-[1px] bg-slate-300'></div>
                                <div className='flex items-center gap-2'>
                                    <span className='font-semibold text-slate-500 text-xs uppercase tracking-wider'>Type:</span>
                                    <Badge variant='outline' className='border-primary/30 text-[10px] text-primary uppercase'>
                                        {currentPayload.typeflag}
                                    </Badge>
                                </div>
                            </div>
                            <div className='flex items-center gap-3'>
                                <Button
                                    variant='outline'
                                    className='w-fit border-green-600 text-green-700 shadow-md transition-all duration-200 hover:scale-105 hover:bg-green-50 hover:shadow-lg'
                                    onClick={handleExportExcel}>
                                    <FileSpreadsheet className='mr-2 h-4 w-4' /> Export Excel
                                </Button>
                                <Button
                                    variant='secondary'
                                    className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'
                                    onClick={handlePrint}>
                                    <Printer className='mr-2 h-4 w-4' /> Print
                                </Button>
                            </div>
                        </div>

                        <GenericDataTable
                            data={reportData}
                            columns={columns}
                            isLoading={isFetching}
                            totalItems={totalRecords}
                            isSearchRequired={true}
                            noDataTitle='No Consumption Found'
                            noDataDescription='No records found matching your selection or search criteria.'
                        />
                    </div>
                </CollapsibleSection>
            )}

            {/* Hidden Print Component */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: 0,
                    height: 0,
                    overflow: 'visible',
                    opacity: 0,
                    pointerEvents: 'none',
                    zIndex: -1
                }}>
                <InvRItemConsumptionPrint ref={componentRef} data={printData} payload={currentPayload} />
            </div>
        </div>
    );
}
