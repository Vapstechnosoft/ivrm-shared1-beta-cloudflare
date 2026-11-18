'use client';

import type { IPDAReportItem, IPDAReportResponse, IPDAStudent } from '@/types/pda/report/debit-credit-report';
import { format } from 'date-fns';
import { XCircle } from 'lucide-react';
import { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import * as XLSX from 'xlsx';
import PDADebitCreditReportForm from './_components/PDADebitCreditReportForm';
import PDADebitCreditReportGrid from './_components/PDADebitCreditReportGrid';

export default function PDADebitCreditReportSRSPage() {
    const [reportData, setReportData] = useState<IPDAReportResponse | null>(null);
    const [fromDate, setFromDate] = useState<Date | null>(null);
    const [toDate, setToDate] = useState<Date | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `PDA_Report_${format(new Date(), 'ddMMyyyy')}`
    });

    const handleReportGenerated = (data: IPDAReportResponse, from: Date, to: Date) => {
        setReportData(data);
        setFromDate(from);
        setToDate(to);
        setHasSearched(true);
    };

    const handleCancel = () => {
        setReportData(null);
        setFromDate(null);
        setToDate(null);
        setHasSearched(false);
    };

    const getArray = <T,>(data: any): T[] => {
        if (!data) return [];
        if (Array.isArray(data)) return data;
        if (data.$values && Array.isArray(data.$values)) return data.$values;
        return [];
    };

    const handleExport = () => {
        if (!reportData) return;

        const rows = getArray<IPDAReportItem>(
            reportData.type === 'All'
                ? reportData.get_allreport
                : reportData.type === 'CR'
                  ? reportData.get_creditreport
                  : reportData.get_debitreport
        );

        if (!rows || rows.length === 0) return;

        const data = rows.map((r: IPDAReportItem, idx: number) => ({
            'SL.NO': idx + 1,
            DATE: format(new Date(r.PAYMENT_DATE), 'dd/MM/yyyy'),
            CODE: r.CODE,
            PARTICULARS: r.PARTICULARS,
            'VOUCHER NUMBER': r.PDAE_VoucherNo,
            DEBIT: r.DEBIT,
            CREDIT: r.CREDIT,
            TYPES: r.TYPEORG,
            BALANCE: r.BALANCE
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'PDA Report');
        XLSX.writeFile(wb, `PDA_Report_${format(new Date(), 'yyyyMMdd')}.xlsx`);
    };

    const getRows = () => {
        if (!reportData) return [];
        if (reportData.type === 'All') return getArray<IPDAReportItem>(reportData.get_allreport);
        if (reportData.type === 'CR') return getArray<IPDAReportItem>(reportData.get_creditreport);
        return getArray<IPDAReportItem>(reportData.get_debitreport);
    };

    const rows = getRows();
    const student = getArray<IPDAStudent>(reportData?.fillstudent)?.[0];

    return (
        <div className='min-h-screen'>
            <div className='container space-y-6 p-4'>
                <div className='space-y-1'></div>

                <PDADebitCreditReportForm
                    onReportGenerated={handleReportGenerated}
                    onCancel={handleCancel}
                    onPrint={() => handlePrint()}
                    onExport={handleExport}
                    showReportButtons={rows.length > 0}
                />

                {rows.length > 0 && student && fromDate && toDate && (
                    <div className='fade-in slide-in-from-bottom-4 animate-in duration-500'>
                        <PDADebitCreditReportGrid
                            reportType={reportData!.type}
                            rows={rows}
                            student={student}
                            fromDate={fromDate}
                            toDate={toDate}
                            printRef={printRef}
                        />
                    </div>
                )}

                {rows.length === 0 && hasSearched && (
                    <div className='flex flex-col items-center justify-center rounded-xl border border-gray-300 border-dashed bg-white p-20 shadow-sm'>
                        <XCircle className='mb-4 h-12 w-12 text-muted-foreground/30' />
                        <p className='font-medium text-muted-foreground'>No records found for the selected criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
