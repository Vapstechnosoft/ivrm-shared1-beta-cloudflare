'use client';

import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useLibraryMonthEndReportSearch } from '@/hooks/library/reports/useLibraryMonthEndReport';
import type { ILibraryMonthEndReportGridData, ILibraryMonthEndReportRequest } from '@/types/library/reports/library-month-end-report';
import { useState } from 'react';
import { toast } from 'sonner';
import { LibraryMonthEndReportColumns, type MonthEndReportDisplayData } from './_components/columns';
import { ReportForm } from './_components/report-form';

export default function LibraryMonthEndReportPage() {
    const [reportDisplayData, setReportDisplayData] = useState<MonthEndReportDisplayData[]>([]);

    const handlePrint = () => {
        window.print();
    };

    const searchMutation = useLibraryMonthEndReportSearch();

    const processData = (data: any[]) => {
        const processed: MonthEndReportDisplayData[] = [];
        if (!Array.isArray(data)) return processed;

        data.forEach((ff) => {
            const totalBook = ff.TOTALBOOK ?? ff.totalbook ?? ff.totalBook ?? ff.TotalBook;
            const availBook = ff.AVAILBOOK ?? ff.availbook ?? ff.availBook ?? ff.AvailBook;
            const purchaseCnt = ff.PURCHASECNT ?? ff.purchasecnt ?? ff.purchaseCnt ?? ff.PurchaseCnt;
            const donateCnt = ff.DONATECNT ?? ff.donatecnt ?? ff.donateCnt ?? ff.DonateCnt;

            const stdIssueCnt = ff.STDISSUECNT ?? ff.stdissuecnt ?? ff.stdIssueCnt ?? ff.StdIssueCnt;
            const stdReturnCnt = ff.STDRETURNCNT ?? ff.stdreturncnt ?? ff.stdReturnCnt ?? ff.StdReturnCnt;

            const stfIssueCnt = ff.STFISSUECNT ?? ff.stfissuecnt ?? ff.stfIssueCnt ?? ff.StfIssueCnt;
            const stfReturnCnt = ff.STFRETURNCNT ?? ff.stfreturncnt ?? ff.stfReturnCnt ?? ff.StfReturnCnt;

            const depIssueCnt = ff.DEPISSUECNT ?? ff.depissuecnt ?? ff.depIssueCnt ?? ff.DepIssueCnt;
            const depReturnCnt = ff.DEPRETURNCNT ?? ff.depreturncnt ?? ff.depReturnCnt ?? ff.DepReturnCnt;

            const gstIssueCnt = ff.GSTISSUECNT ?? ff.gstissuecnt ?? ff.gstIssueCnt ?? ff.GstIssueCnt;
            const gstReturnCnt = ff.GSTRETURNCNT ?? ff.gstreturncnt ?? ff.gstReturnCnt ?? ff.GstReturnCnt;

            const fineAmount = ff.FINEAMOUNT ?? ff.fineamount ?? ff.fineAmount ?? ff.FineAmount;
            const smsCount = ff.SMSCOUNT ?? ff.smscount ?? ff.smsCount ?? ff.SmsCount;
            const emailCount = ff.EMAILCOUNT ?? ff.emailcount ?? ff.emailCount ?? ff.EmailCount;

            if (totalBook !== undefined && totalBook !== null) processed.push({ TNAME: 'TOTAL BOOKS', COUNT: Number(totalBook) });
            if (availBook !== undefined && availBook !== null) processed.push({ TNAME: 'AVAILABLE BOOKS', COUNT: Number(availBook) });
            if (purchaseCnt !== undefined && purchaseCnt !== null) processed.push({ TNAME: 'PURCHASED BOOKS', COUNT: Number(purchaseCnt) });
            if (donateCnt !== undefined && donateCnt !== null) processed.push({ TNAME: 'DONATED BOOKS', COUNT: Number(donateCnt) });

            if (stdIssueCnt !== undefined && stdIssueCnt !== null) processed.push({ TNAME: 'STUDENT BOOK ISSUE', COUNT: Number(stdIssueCnt) });
            if (stdReturnCnt !== undefined && stdReturnCnt !== null) processed.push({ TNAME: 'STUDENT BOOK RETURN', COUNT: Number(stdReturnCnt) });

            if (stfIssueCnt !== undefined && stfIssueCnt !== null) processed.push({ TNAME: 'STAFF BOOK ISSUE', COUNT: Number(stfIssueCnt) });
            if (stfReturnCnt !== undefined && stfReturnCnt !== null) processed.push({ TNAME: 'STAFF BOOK RETURN', COUNT: Number(stfReturnCnt) });

            if (depIssueCnt !== undefined && depIssueCnt !== null) processed.push({ TNAME: 'DEPARTMENT BOOK ISSUE', COUNT: Number(depIssueCnt) });
            if (depReturnCnt !== undefined && depReturnCnt !== null) processed.push({ TNAME: 'DEPARTMENT BOOK RETURN', COUNT: Number(depReturnCnt) });

            if (gstIssueCnt !== undefined && gstIssueCnt !== null) processed.push({ TNAME: 'GUEST BOOK ISSUE', COUNT: Number(gstIssueCnt) });
            if (gstReturnCnt !== undefined && gstReturnCnt !== null) processed.push({ TNAME: 'GUEST BOOK RETURN', COUNT: Number(gstReturnCnt) });

            if (fineAmount !== undefined && fineAmount !== null) processed.push({ TNAME: 'TOTAL FINE', COUNT: Number(fineAmount) });
            if (smsCount !== undefined && smsCount !== null) processed.push({ TNAME: 'SMS', COUNT: Number(smsCount) });
            if (emailCount !== undefined && emailCount !== null) processed.push({ TNAME: 'EMAIL', COUNT: Number(emailCount) });
        });
        return processed;
    };

    const handleSearch = (data: ILibraryMonthEndReportRequest) => {
        searchMutation.mutate(data, {
            onSuccess: (response: any) => {
                if (response && response.success === false) {
                    toast.error(response.message || 'Failed to fetch report data');
                    return;
                }
                const rawGridData = Array.isArray(response) ? response : response?.data || [];
                const displayData = processData(rawGridData);
                setReportDisplayData(displayData);
                if (displayData.length > 0) {
                    toast.success(`Found ${displayData.length} records`);
                } else {
                    toast.info('No records found for the selected criteria');
                }
            },
            onError: (error) => {
                toast.error('Failed to fetch report data');
                console.error(error);
            }
        });
    };

    return (
        <div className='space-y-4'>
            <CollapsibleSection title='Month End Report' defaultOpen={true}>
                <ReportForm
                    onSearch={handleSearch}
                    onPrint={reportDisplayData.length > 0 ? handlePrint : undefined}
                    isLoading={searchMutation.isPending}
                />
            </CollapsibleSection>

            {reportDisplayData.length > 0 && (
                <div className='print-container'>
                    <style type='text/css' media='print'>
                        {`
                            @page { size: portrait; margin: 10mm; }
                            body * { visibility: hidden; }
                            .print-container, .print-container * { visibility: visible; }
                            .print-container {
                                position: absolute;
                                left: 0;
                                top: 0;
                                width: 100%;
                            }
                            /* Hide interactive elements and scrolling areas */
                            .print-container button { display: none !important; }
                            .print-container .overflow-auto, .print-container .overflow-x-auto, .print-container .max-h-[500px] { 
                                overflow: visible !important; 
                                max-height: none !important;
                            }
                            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                            th, td { border: 1px solid #000 !important; padding: 6px; text-align: left; font-size: 12px; color: #000; }
                            th { background-color: #e5e7eb !important; font-weight: bold; -webkit-print-color-adjust: exact; }
                            tr { page-break-inside: avoid; }
                        `}
                    </style>
                    <CollapsibleSection title='Library Month End Report List' defaultOpen={true}>
                        <div className='print-title mb-4 hidden text-center font-bold text-xl uppercase print:block'>
                            Library Month End Report
                        </div>
                        <GenericDataTable columns={LibraryMonthEndReportColumns} data={reportDisplayData} isLoading={false} />
                    </CollapsibleSection>
                </div>
            )}
        </div>
    );
}
