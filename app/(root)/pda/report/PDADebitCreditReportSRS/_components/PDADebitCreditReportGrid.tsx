'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { IPDAReportItem, IPDAStudent } from '@/types/pda/report/debit-credit-report';
import { format } from 'date-fns';
import type React from 'react';

interface PDADebitCreditReportGridProps {
    reportType: 'All' | 'CR' | 'DR';
    rows: IPDAReportItem[];
    student: IPDAStudent;
    fromDate: Date;
    toDate: Date;
    printRef: React.RefObject<HTMLDivElement>;
}

export default function PDADebitCreditReportGrid({ reportType, rows, student, fromDate, toDate, printRef }: PDADebitCreditReportGridProps) {
    const totalDebit = rows.reduce((sum, row) => sum + (row.DEBIT || 0), 0);
    const totalCredit = rows.reduce((sum, row) => sum + (row.CREDIT || 0), 0);
    const lastRow = rows[rows.length - 1];
    const closingBalance = lastRow?.BALANCE || 0;
    const balanceType = lastRow?.TYPEORG1 || '';

    return (
        <div className='space-y-6'>
            {/* Display View */}
            <div className='rounded-xl border border-purple-50 bg-white p-8 shadow-lg'>
                <ReportHeader student={student} fromDate={fromDate} toDate={toDate} />

                <div className='mt-8 overflow-x-auto'>
                    <ReportTable reportType={reportType} rows={rows} totalDebit={totalDebit} totalCredit={totalCredit} />
                </div>

                <ReportFooter closingBalance={closingBalance} balanceType={balanceType} />
            </div>

            {/* Hidden Print View */}
            <div className='hidden'>
                <div ref={printRef} className='space-y-6 p-8 print:block'>
                    <div className='mb-8 text-center'>
                        {/* Assuming a standard header for print */}
                        <h1 className='font-bold text-2xl uppercase'>Statement of Personal Expense Account</h1>
                    </div>
                    <ReportHeader student={student} fromDate={fromDate} toDate={toDate} />
                    <ReportTable reportType={reportType} rows={rows} totalDebit={totalDebit} totalCredit={totalCredit} />
                    <ReportFooter closingBalance={closingBalance} balanceType={balanceType} />
                </div>
            </div>
        </div>
    );
}

function ReportHeader({ student, fromDate, toDate }: { student: IPDAStudent; fromDate: Date; toDate: Date }) {
    return (
        <div className='space-y-4'>
            <div className='border-b pb-4 text-center'>
                <h3 className='font-semibold text-lg text-purple-900'>
                    STATEMENT of Personal Expense Account from: {format(fromDate, 'dd-MMM-yyyy')} to: {format(toDate, 'dd-MMM-yyyy')}
                </h3>
            </div>
            <div className='grid grid-cols-1 gap-4 text-sm md:grid-cols-3'>
                <div>
                    <span className='mr-2 font-bold text-muted-foreground uppercase'>Name:</span>
                    <span className='font-semibold'>{student.amsT_FirstName}</span>
                </div>
                <div>
                    <span className='mr-2 font-bold text-muted-foreground uppercase'>Adm No:</span>
                    <span className='font-semibold'>{student.amsT_AdmNo}</span>
                </div>
                <div>
                    <span className='mr-2 font-bold text-muted-foreground uppercase'>Class & Section:</span>
                    <span className='font-semibold'>
                        {student.asmcL_ClassName} - {student.asmC_SectionName}
                    </span>
                </div>
            </div>
        </div>
    );
}

function ReportTable({
    reportType,
    rows,
    totalDebit,
    totalCredit
}: {
    reportType: string;
    rows: IPDAReportItem[];
    totalDebit: number;
    totalCredit: number;
}) {
    return (
        <Table className='border'>
            <TableHeader className='bg-muted/50'>
                <TableRow>
                    <TableHead className='w-12 text-center'>SL.NO</TableHead>
                    <TableHead>DATE</TableHead>
                    <TableHead>CODE</TableHead>
                    <TableHead className='w-1/4'>PARTICULARS</TableHead>
                    <TableHead>VOUCHER NO</TableHead>
                    {(reportType === 'All' || reportType === 'DR') && <TableHead className='text-right'>DEBIT</TableHead>}
                    {(reportType === 'All' || reportType === 'CR') && <TableHead className='text-right'>CREDIT</TableHead>}
                    <TableHead>TYPES</TableHead>
                    <TableHead className='text-right'>BALANCE</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {rows.map((row, index) => (
                    <TableRow key={index}>
                        <TableCell className='text-center'>{index + 1}</TableCell>
                        <TableCell>{format(new Date(row.PAYMENT_DATE), 'dd/MM/yyyy')}</TableCell>
                        <TableCell>{row.CODE}</TableCell>
                        <TableCell className='break-words'>{row.PARTICULARS}</TableCell>
                        <TableCell>{row.PDAE_VoucherNo}</TableCell>
                        {(reportType === 'All' || reportType === 'DR') && (
                            <TableCell className='text-right'>{row.DEBIT?.toFixed(2)}</TableCell>
                        )}
                        {(reportType === 'All' || reportType === 'CR') && (
                            <TableCell className='text-right'>{row.CREDIT?.toFixed(2)}</TableCell>
                        )}
                        <TableCell>{row.TYPEORG}</TableCell>
                        <TableCell className='text-right font-medium'>{row.BALANCE?.toFixed(2)}</TableCell>
                    </TableRow>
                ))}
                <TableRow className='bg-muted/30 font-bold'>
                    <TableCell colSpan={5} className='text-center uppercase'>
                        Total
                    </TableCell>
                    {(reportType === 'All' || reportType === 'DR') && <TableCell className='text-right'>{totalDebit.toFixed(2)}</TableCell>}
                    {(reportType === 'All' || reportType === 'CR') && (
                        <TableCell className='text-right'>{totalCredit.toFixed(2)}</TableCell>
                    )}
                    <TableCell colSpan={2}></TableCell>
                </TableRow>
            </TableBody>
        </Table>
    );
}

function ReportFooter({ closingBalance, balanceType }: { closingBalance: number; balanceType: string }) {
    return (
        <div className='mt-8 space-y-6'>
            <div className='rounded-lg border border-primary/10 bg-primary/5 p-4 text-center'>
                <span className='font-bold text-lg'>
                    Closing balance: <span className='text-primary'>{closingBalance.toFixed(2)}</span> {balanceType}
                </span>
            </div>
            <div className='text-muted-foreground text-sm italic'>
                You are advised to maintain a minimum credit balance of Rs:10,000/- in personal account.
            </div>
            <div className='space-y-1 pt-8 font-semibold'>
                <p>Thank You</p>
                <p>Yours Sincerely</p>
                <p className='pt-8'>Director</p>
            </div>
        </div>
    );
}
