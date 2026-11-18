'use client';

import { Heading } from '@/components/layout/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useInvRGRNReportQuery } from '@/hooks/inventory/reports/use-inv-r-grn';
import { tableSearchVariables } from '@/lib/data-table.config';
import { getInvRGRNReport } from '@/server/inventory/reports/inv-r-grn';
import type { IInvRGRNPayload, IInvRGRNReportData } from '@/types/inventory/reports/inv-r-grn';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { saveAs } from 'file-saver';
import { FileSpreadsheet, Printer } from 'lucide-react';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { use, useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { getColumns } from './_components/columns';
import { InvRGRNPrint } from './_components/inv-r-grn-print';
import ReportForm from './_components/report-form';

interface ReportTotals {
    basic: number;
    tax: number;
    discount: number;
    final: number;
}

const calculateReportTotals = (data: any[]): ReportTotals => {
    return data.reduce(
        (acc: ReportTotals, curr: any) => {
            // Handle casing and report type variations
            const qty = curr.invtgrn_qty ?? curr.invtgrN_Qty ?? curr.grnQuantity ?? curr.grnquantity ?? 0;
            const rate = curr.invtgrn_purchaserate ?? curr.invtgrN_PurchaseRate ?? curr.grnRate ?? curr.grnrate ?? 0;
            const tax = curr.invtgrn_taxamt ?? curr.invtgrN_TaxAmt ?? curr.grnTax ?? curr.grntax ?? 0;
            const discount = curr.invtgrn_discountamt ?? curr.invtgrN_DiscountAmt ?? curr.grnDiscount ?? curr.grndiscount ?? 0;
            const amount = curr.invtgrn_amount ?? curr.invtgrN_Amount ?? curr.grnAmount ?? curr.grnamount ?? 0;

            const basic = Number(qty) * Number(rate);

            return {
                basic: acc.basic + basic,
                tax: acc.tax + Number(tax),
                discount: acc.discount + Number(discount),
                final: acc.final + Number(amount)
            };
        },
        { basic: 0, tax: 0, discount: 0, final: 0 } as ReportTotals
    );
};

export default function InvRGRNPage(props: { searchParams: Promise<any> }) {
    const searchParams = use(props.searchParams);
    const [currentPayload, setCurrentPayload] = useState<IInvRGRNPayload | null>(null);
    const queryClient = useQueryClient();

    // Pagination State synced with URL (same as DataTable)
    const [currentPage, setCurrentPage] = useQueryState(
        tableSearchVariables.page,
        parseAsInteger.withOptions({ shallow: false }).withDefault(1)
    );
    const [pageSize] = useQueryState(tableSearchVariables.page_size, parseAsInteger.withOptions({ shallow: false }).withDefault(10));
    const [searchQuery, setSearchQuery] = useQueryState(
        tableSearchVariables.search,
        parseAsString.withOptions({ shallow: false }).withDefault('')
    );
    const [searchColumn] = useQueryState(
        tableSearchVariables.search_columns,
        parseAsString.withOptions({ shallow: false }).withDefault('All')
    );

    const [printData, setPrintData] = useState<IInvRGRNReportData[]>([]);
    const componentRef = useRef<HTMLDivElement>(null);

    const { data: reportResult, isFetching } = useInvRGRNReportQuery(currentPayload, {
        ...searchParams,
        page: currentPage,
        page_size: pageSize,
        search_query: searchQuery,
        search_column: searchColumn
    });

    const extractReportData = (result: any) => {
        let rawData: any[] = [];
        if (!result?.data) return [];

        // 1. data is directly an array
        if (Array.isArray(result.data)) rawData = result.data;
        // 2. data.$values is an array
        else if (result.data.$values && Array.isArray(result.data.$values)) rawData = result.data.$values;
        // 3. get_grnreport is an array
        else if (Array.isArray(result.data.get_grnreport)) rawData = result.data.get_grnreport;
        // 4. get_grnreport.$values is an array
        else if (result.data.get_grnreport?.$values && Array.isArray(result.data.get_grnreport.$values)) {
            rawData = result.data.get_grnreport.$values;
        }

        if (rawData.length > 0) {
            const itemMap: Record<string, number> = {};
            rawData.forEach((row: any) => {
                const itemId = row.invmi_id || row.invmI_Id || row.invmi_itemname || row.invmI_ItemName || 'unknown';
                const qty = Number.parseFloat(row.invtgrn_qty ?? row.invtgrN_Qty ?? row.grnQuantity ?? row.grnquantity ?? 0);
                if (!itemMap[itemId]) itemMap[itemId] = 0;
                itemMap[itemId] += qty;
            });
            rawData = rawData.map((row: any) => {
                const itemId = row.invmi_id || row.invmI_Id || row.invmi_itemname || row.invmI_ItemName || 'unknown';
                return {
                    ...row,
                    OverallQty: itemMap[itemId]
                };
            });
        }
        return rawData;
    };

    const reportData = extractReportData(reportResult);

    const totalRecords = reportResult?.total || 0;

    // Handle initial report generation (Page 1)
    const handleReportGenerated = (data: IInvRGRNReportData[], payload: IInvRGRNPayload | null, total: number) => {
        if (payload === null) {
            setCurrentPayload(null);
            setCurrentPage(1);
            setSearchQuery(null);
            return;
        }

        if (total === 0) {
            toast.error('No record found');
        }

        // Seed the query cache with the data we just got from the form submit
        queryClient.setQueryData(['invRGRNReport', payload, { ...searchParams, page: 1, page_size: pageSize, search_query: '' }], {
            success: true,
            data: data, // data is now the normalized array from report-form.tsx
            total: total,
            page: 1,
            page_size: pageSize
        });

        setCurrentPayload(payload);

        // Reset to page 1
        setCurrentPage(1);
        setSearchQuery(null);
    };

    // Show toast for empty search results
    useEffect(() => {
        if (!isFetching && searchQuery && reportData.length === 0) {
            toast.error('No record found');
        }
    }, [isFetching, reportData.length, searchQuery]);

    const columns = getColumns(currentPayload?.typeflag || 'All', (currentPayload as any)?.optionflag, currentPage, pageSize);

    // Calculate Totals (Client side sum of CURRENT PAGE)
    const totals = calculateReportTotals(reportData);

    // Validate if Final approx Basic + Tax - Discount. Use API 'amount' as truth, or calculated if 0.
    const displayFinal = totals.final > 0 ? totals.final : totals.basic + totals.tax - totals.discount;

    const handlePrintContent = useReactToPrint({
        contentRef: componentRef,
        documentTitle: 'GRN_Report'
    });

    const fetchAllData = async (action: 'print' | 'excel') => {
        if (!currentPayload) return [];
        try {
            toast.loading(`Fetching all records for ${action}...`, { id: 'fetch-all' });

            const response = await getInvRGRNReport(
                { ...currentPayload, search_query: searchQuery || '' },
                { ...searchParams, page: 1, page_size: 100000, search_query: searchQuery || '' }
            );

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

            if (typeflag === 'All' || typeflag === 'Detailed') {
                dataToExport = allData.map((row: any, index: number) => ({
                    'SL.No': index + 1,
                    'GRN No': row.invmgrn_grnno || '',
                    'Purchase Date': row.invmgrn_purchasedate ? row.invmgrn_purchasedate.split('T')[0] : '',
                    Supplier: row.invms_suppliername || '',
                    Item: row.invmi_itemname || '',
                    'Kit No': row.invtgrn_naration || row.invtgrN_Naration || '',
                    UOM: row.invmuom_uomname || '',
                    Quantity: Number(row.invtgrn_qty || 0).toFixed(2),
                    'Overall Qty': Number(row.OverallQty || 0).toFixed(2),
                    Rate: Number(row.invtgrn_purchaserate || 0).toFixed(2),
                    MRP: Number(row.invtgrn_mrp || 0).toFixed(2),
                    'Sale Price': Number(row.invtgrn_salesprice || 0).toFixed(2),
                    Discount: Number(row.invtgrn_discountamt || 0).toFixed(2),
                    Tax: Number(row.invtgrn_taxamt || 0).toFixed(2),
                    'Total Amount': Number(row.invtgrn_amount || 0).toFixed(2)
                }));
            } else if (typeflag === 'Overall') {
                if (optionflag === 'Item_1' || optionflag === 'Item') {
                    dataToExport = allData.map((row: any, index: number) => ({
                        'SL.No': index + 1,
                        Item: row.invmi_itemname || row.invmI_ItemName || '',
                        'Item Code': row.invmi_itemcode || row.invmI_ItemCode || '',
                        Quantity: Number((row.grnQuantity ?? row.grnquantity) || 0).toFixed(2),
                        'Overall Qty': Number(row.OverallQty || 0).toFixed(2),
                        Rate: Number((row.grnRate ?? row.grnrate) || 0).toFixed(2),
                        MRP: Number((row.grnMRP ?? row.grnmrp) || 0).toFixed(2),
                        'Sale Price': Number((row.grnSalePrice ?? row.grnsaleprice) || 0).toFixed(2),
                        Discount: Number((row.grnDiscount ?? row.grndiscount) || 0).toFixed(2),
                        Tax: Number((row.grnTax ?? row.grntax) || 0).toFixed(2),
                        Amount: Number((row.grnAmount ?? row.grnamount) || 0).toFixed(2)
                    }));
                } else if (optionflag === 'Supplier') {
                    dataToExport = allData.map((row: any, index: number) => ({
                        'SL.No': index + 1,
                        'Supplier Name': row.invms_suppliername || row.invmS_SupplierName || '',
                        Code: row.invmS_SupplierCode || '',
                        'Contact No.': row.invms_supplierconatctno || row.invmS_SupplierConatctNo || '',
                        'Email ID': row.invms_emailid || row.invmS_EmailId || '',
                        Quantity: Number((row.grnQuantity ?? row.grnquantity) || 0).toFixed(2),
                        'Overall Qty': Number(row.OverallQty || 0).toFixed(2),
                        Rate: Number((row.grnRate ?? row.grnrate) || 0).toFixed(2),
                        MRP: Number((row.grnMRP ?? row.grnmrp) || 0).toFixed(2),
                        'Sale Price': Number((row.grnSalePrice ?? row.grnsaleprice) || 0).toFixed(2),
                        Discount: Number((row.grnDiscount ?? row.grndiscount) || 0).toFixed(2),
                        Tax: Number((row.grnTax ?? row.grntax) || 0).toFixed(2),
                        Amount: Number((row.grnAmount ?? row.grnamount) || 0).toFixed(2)
                    }));
                }
            }

            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'GRN Report');
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const data = new Blob([excelBuffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
            });
            saveAs(data, 'GRN_Report.xlsx');
            toast.success('Excel downloaded successfully');
        }
    };

    return (
        <div className='container mx-auto space-y-6 px-4 py-6'>
            <Heading title='GRN Report' description='Generate Goods Receipt Note Reports' />

            <ReportForm onReportGenerated={handleReportGenerated} />

            {currentPayload && (
                <CollapsibleSection title='Report Result' defaultOpen={true}>
                    <div className='space-y-8 rounded-lg border border-slate-200 bg-white p-6 text-slate-900 shadow-sm'>
                        {/* Header Section */}
                        <div className='mb-8 flex flex-col items-center justify-center space-y-3 border-slate-200 border-b pb-6'>
                            <h3 className='text-center font-bold text-3xl text-slate-800 uppercase tracking-tight'>GRN Report</h3>
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

                        <div className='space-y-4'>
                            <GenericDataTable
                                data={reportData}
                                columns={columns}
                                isLoading={isFetching}
                                totalItems={totalRecords}
                                isSearchRequired={true}
                                noDataTitle='No GRN Found'
                                noDataDescription='No records found matching your search criteria.'
                            />

                            {reportData.length > 0 && (
                                <div className='mt-4 flex justify-end'>
                                    <Card className='w-full bg-muted/10 md:w-[400px] print:border-none print:bg-transparent print:shadow-none'>
                                        <CardHeader className='py-3'>
                                            <CardTitle className='font-semibold text-muted-foreground text-sm uppercase print:text-black'>
                                                Summary (Current Page)
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className='space-y-2 pt-0 text-sm'>
                                            <div className='flex justify-between'>
                                                <span>Total Amount (Basic):</span>
                                                <span className='font-mono'>{totals.basic.toFixed(2)}</span>
                                            </div>
                                            <div className='flex justify-between text-green-600 print:text-black'>
                                                <span>Total Tax (+):</span>
                                                <span className='font-mono'>{totals.tax.toFixed(2)}</span>
                                            </div>
                                            <div className='flex justify-between text-destructive print:text-black'>
                                                <span>Total Discount (-):</span>
                                                <span className='font-mono'>{totals.discount.toFixed(2)}</span>
                                            </div>
                                            <div className='mt-2 flex justify-between border-t pt-2 font-bold text-lg'>
                                                <span>Final Amount:</span>
                                                <span className='font-mono'>{displayFinal.toFixed(2)}</span>
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
                <InvRGRNPrint ref={componentRef} data={printData} payload={currentPayload} />
            </div>
        </div>
    );
}
