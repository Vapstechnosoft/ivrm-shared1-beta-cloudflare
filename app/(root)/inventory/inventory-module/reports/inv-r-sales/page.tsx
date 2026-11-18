'use client';

import { Heading } from '@/components/layout/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useInvRSalesReportQuery } from '@/hooks/inventory/reports/use-inv-r-sales';
import { tableSearchVariables } from '@/lib/data-table.config';
import type { InvRSalesSchema } from '@/schemas/inventory/reports/inv-r-sales';
import { getInvRSalesReport } from '@/server/inventory/reports/inv-r-sales';
import { format } from 'date-fns';
import { saveAs } from 'file-saver';
import { FileSpreadsheet, Printer } from 'lucide-react';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { use, useEffect, useMemo, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { getColumns } from './_components/columns';
import { InvRSalesPrint } from './_components/inv-r-sales-print';
import ReportForm from './_components/report-form';

interface ReportTotals {
    amount: number;
    tax: number;
    discount: number;
}

const calculateReportTotals = (data: any[]): ReportTotals => {
    return data.reduce(
        (acc: ReportTotals, curr: any) => {
            const amount = curr.total_Amount ?? curr.invtsL_Amount ?? curr.saleAmount ?? curr.invtsl_Amount ?? curr.invtsl_amount ?? 0;
            const tax = curr.tax_Amt ?? curr.invtsL_TaxAmt ?? curr.saleTax ?? curr.invtsl_TaxAmt ?? curr.invtsl_taxamt ?? 0;
            const discount =
                curr.discount_Amt ??
                curr.invtsL_DiscountAmt ??
                curr.saleDiscount ??
                curr.invtsl_DiscountAmt ??
                curr.invtsl_discountamt ??
                0;

            return {
                amount: acc.amount + Number(amount),
                tax: acc.tax + Number(tax),
                discount: acc.discount + Number(discount)
            };
        },
        { amount: 0, tax: 0, discount: 0 } as ReportTotals
    );
};

export default function InvRSalesPage(props: { searchParams: Promise<any> }) {
    const searchParams = use(props.searchParams);
    const [currentPage, setPage] = useQueryState(tableSearchVariables.page, parseAsInteger.withOptions({ shallow: false }).withDefault(1));
    const [pageSize, setPageSize] = useQueryState(
        tableSearchVariables.page_size,
        parseAsInteger.withOptions({ shallow: false }).withDefault(10)
    );
    const [searchQuery, setSearchQuery] = useQueryState(
        tableSearchVariables.search,
        parseAsString.withOptions({ shallow: false }).withDefault('')
    );

    const [currentPayload, setCurrentPayload] = useState<InvRSalesSchema | null>(null);
    const [printData, setPrintData] = useState<any[]>([]);

    const mapReportPayload = (payload: InvRSalesSchema | null) => {
        if (!payload) return null;

        const p: any = {
            ...payload,
            startdate: payload.startdate ? format(payload.startdate, 'dd/MM/yyyy') : '',
            enddate: payload.enddate ? format(payload.enddate, 'dd/MM/yyyy') : '',
            selectionflag: payload.individualflag
        };

        // Date logic
        if (!payload.bw_dates) {
            p.startdate = '';
            p.enddate = '';
        }

        // Mapping for Backend
        if (payload.optionflag === 'Student') {
            if (payload.individualflag === 'C') {
                p.clsarray = payload.studentArray;
            } else if (payload.individualflag === 'CS') {
                p.secarray = payload.studentArray;
            }
        } else if (payload.optionflag === 'Item') {
            p.itemarray = payload.itemArray;
        } else if (payload.optionflag === 'Saleno') {
            p.salenoarray = payload.salesArray;
        } else if (payload.optionflag === 'Staff') {
            p.hrme_id = payload.singleStaffId;
        } else if (payload.optionflag === 'Customer') {
            p.invmc_id = payload.singleCustomerId;
        }

        return p;
    };

    const payloadForHook = useMemo(() => mapReportPayload(currentPayload), [currentPayload]);

    const { data: reportResult, isFetching } = useInvRSalesReportQuery(payloadForHook, {
        ...searchParams,
        page: currentPage,
        page_size: pageSize,
        search_query: searchQuery,
        search_columns: 'invmsl_SalesNo,invmi_ItemName,membername'
    });

    const reportData = Array.isArray(reportResult?.data) ? reportResult.data : reportResult?.data?.get_SalesReport || [];
    const totalRecords = reportResult?.total || (Array.isArray(reportResult?.data) ? reportResult.data.length : 0);

    const handleReportSubmit = (payload: InvRSalesSchema | null) => {
        // Handle reset or empty
        if (!payload || Object.keys(payload).length === 0) {
            setCurrentPayload(null);
            setPage(1);
            setSearchQuery(null);
            return;
        }

        // Show toast for empty initial report
        if (totalRecords === 0 && !isFetching && currentPayload) {
            toast.error('No record found');
        }

        setCurrentPayload(payload);
        setPage(1);
        setSearchQuery(null);
    };

    // Show toast for empty search results or initial empty report
    useEffect(() => {
        if (!isFetching && currentPayload && totalRecords === 0) {
            toast.error('No record found');
        }
    }, [isFetching, totalRecords, searchQuery, currentPayload]);

    const columns = getColumns(
        currentPayload?.typeflag || 'All',
        currentPayload?.optionflag,
        currentPayload?.showTax || false,
        currentPayload?.showDiscount || false,
        currentPage,
        pageSize
    );

    const totals = calculateReportTotals(reportData);

    const componentRef = useRef<HTMLDivElement>(null);
    const handlePrintContent = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Sales Report - ${new Date().toISOString().split('T')[0]}`
    });

    const fetchAllData = async (action: 'print' | 'excel') => {
        if (!currentPayload) return [];
        try {
            toast.loading(`Fetching all records for ${action}...`, { id: 'fetch-all' });

            const p = mapReportPayload(currentPayload);

            const response = await getInvRSalesReport(p, {
                ...searchParams,
                page: 1,
                page_size: 100000,
                search_query: searchQuery || '',
                search_columns: 'invmsl_SalesNo,invmi_ItemName,membername'
            });
            console.log('fetchAllData Response:', response?.data);

            const allData = Array.isArray(response?.data) ? response.data : response?.data?.get_SalesReport || [];

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
            const showTax = currentPayload?.showTax || false;
            const showDiscount = currentPayload?.showDiscount || false;

            dataToExport = allData.map((row: any, index: number) => {
                const base: any = {
                    'SL.No': index + 1
                };

                const saleDate = row.sales_Date || row.invmsL_SalesDate || row.invmsl_SalesDate || row.invmsl_salesdate;

                if (typeflag === 'All') {
                    base['Item'] = row.item_Name || row.invmI_ItemName || row.invmi_ItemName || row.invmi_itemname || '';
                    base['Sale No'] = row.invmsL_SalesNo || row.invmsl_SalesNo || row.Invmsl_SalesNo || row.invmsl_salesno || '';
                    base['Sale Date'] = saleDate ? saleDate.split('T')[0] : '';
                } else if (typeflag === 'Detailed') {
                    base['Sale No'] = row.invmsL_SalesNo || row.invmsl_SalesNo || row.Invmsl_SalesNo || row.invmsl_salesno || '';
                    base['Sale Date'] = saleDate ? saleDate.split('T')[0] : '';
                    base['Item'] = row.item_Name || row.invmI_ItemName || row.invmi_ItemName || row.invmi_itemname || '';

                    if (['Student', 'Staff', 'Customer', 'Saleno'].includes(optionflag || '')) {
                        base['Name'] = row.membername || row.memberName || '';
                    }
                } else if (typeflag === 'Overall') {
                    if (optionflag === 'Item') {
                        base['Item'] = row.item_Name || row.invmI_ItemName || row.invmi_ItemName || row.invmi_itemname || '';
                    } else if (['Student', 'Staff', 'Customer'].includes(optionflag || '')) {
                        base['Name'] = row.membername || row.memberName || '';
                    }
                }

                base['Quantity'] = Number(
                    row.sales_Qty ?? row.invtsL_SalesQty ?? row.saleQty ?? row.invtsl_SalesQty ?? row.invtsl_salesqty ?? 0
                ).toFixed(2);
                base['Price'] = Number(
                    row.sales_Price ?? row.invtsL_SalesPrice ?? row.salePrice ?? row.invtsl_SalesPrice ?? row.invtsl_salesprice ?? 0
                ).toFixed(2);
                base['Amount'] = Number(
                    row.total_Amount ?? row.invtsL_Amount ?? row.saleAmount ?? row.invtsl_Amount ?? row.invtsl_amount ?? 0
                ).toFixed(2);

                if (showTax) {
                    base['Tax'] = Number(
                        row.tax_Amt ?? row.invtsL_TaxAmt ?? row.saleTax ?? row.invtsl_TaxAmt ?? row.invtsl_taxamt ?? 0
                    ).toFixed(2);
                }
                if (showDiscount) {
                    base['Discount'] = Number(
                        row.discount_Amt ??
                            row.invtsL_DiscountAmt ??
                            row.saleDiscount ??
                            row.invtsl_DiscountAmt ??
                            row.invtsl_discountamt ??
                            0
                    ).toFixed(2);
                }

                return base;
            });

            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales Report');
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const data = new Blob([excelBuffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
            });
            saveAs(data, 'Sales_Report.xlsx');
            toast.success('Excel downloaded successfully');
        }
    };

    const tableProps = useDataTableProps({
        enablePagination: true,
        enableSorting: false,
        enableSearching: true, // Grid Search enabled
        isSearchRequired: true
    });

    return (
        <div className='container mx-auto space-y-6 px-4 py-6'>
            <Heading title='Sales Report' description='Generate Sales Reports' />

            <ReportForm onSubmit={handleReportSubmit} isLoading={isFetching} />

            {currentPayload && (
                <CollapsibleSection title='Report Result' defaultOpen={true}>
                    <div className='space-y-8 rounded-lg border border-slate-200 bg-white p-6 text-slate-900 shadow-sm'>
                        {/* Header Section */}
                        <div className='mb-8 flex flex-col items-center justify-center space-y-3 border-slate-200 border-b pb-6'>
                            <h3 className='text-center font-bold text-3xl text-slate-800 uppercase tracking-tight'>Sales Report</h3>
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

                        <div>
                            <GenericDataTable
                                {...tableProps}
                                data={reportData}
                                columns={columns}
                                totalItems={totalRecords}
                                isLoading={isFetching}
                                isSearchRequired={true}
                                noDataTitle='No Sales Found'
                                noDataDescription='No records found matching your search criteria.'
                            />

                            {reportData.length > 0 && (
                                <div className='mt-4 flex justify-end'>
                                    <Card className='w-full bg-muted/10 md:w-[400px] print:border-none print:bg-transparent print:shadow-none'>
                                        <CardHeader className='py-3'>
                                            <CardTitle className='font-semibold text-muted-foreground text-sm uppercase print:text-black'>
                                                Summary
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className='space-y-2 pt-0 text-sm'>
                                            {currentPayload?.showDiscount && (
                                                <div className='flex justify-between text-destructive print:text-black'>
                                                    <span>Total Discount (-):</span>
                                                    <span className='font-mono'>{totals.discount.toFixed(2)}</span>
                                                </div>
                                            )}
                                            {currentPayload?.showTax && (
                                                <div className='flex justify-between text-green-600 print:text-black'>
                                                    <span>Total Tax (+):</span>
                                                    <span className='font-mono'>{totals.tax.toFixed(2)}</span>
                                                </div>
                                            )}
                                            <div className='mt-2 flex justify-between border-t pt-2 font-bold text-lg'>
                                                <span>Total Amount:</span>
                                                <span className='font-mono'>{totals.amount.toFixed(2)}</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}
                        </div>
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
                <InvRSalesPrint ref={componentRef} data={printData} payload={currentPayload} />
            </div>
        </div>
    );
}
