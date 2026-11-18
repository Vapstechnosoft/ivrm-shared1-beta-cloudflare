'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { IPDADebitCreditReportRow, IPDADebitCreditStudentDetail } from '@/types/pettycash/report/PDADebitCreditReport';
import { format } from 'date-fns';
import { BookOpen } from 'lucide-react';
import type React from 'react';

interface PDADebitCreditReportGridProps {
    rows: IPDADebitCreditReportRow[];
    student: IPDADebitCreditStudentDetail[];
    fromDate: Date | null;
    toDate: Date | null;
    printRef: React.RefObject<HTMLDivElement | null>;
}

export default function PDADebitCreditReportGrid({ rows, student, fromDate, toDate, printRef }: PDADebitCreditReportGridProps) {
    if (!rows || rows.length === 0) return null;

    const totalDebit = rows.reduce((acc, r) => acc + (Number(r.DEBIT) || 0), 0);
    const totalCredit = rows.reduce((acc, r) => acc + (Number(r.CREDIT) || 0), 0);
    const lastRecord = rows[rows.length - 1];
    const closingBalance = lastRecord?.BALANCE ?? 0;
    const balType = lastRecord?.TYPEORG1 ?? '';

    const studentInfo = student?.[0];

    return (
        <Card className='fade-in animate-in overflow-hidden border-purple-50 bg-white shadow-md duration-500'>
            <CardHeader className='border-b bg-slate-50/50 px-4 py-3'>
                <CardTitle className='flex items-center gap-2 font-bold text-slate-700 text-sm'>
                    <BookOpen className='h-4 w-4 text-orange-600' />
                    PDA Debit Credit Report — Statement of Personal Expense Account
                </CardTitle>
            </CardHeader>

            <CardContent className='p-4'>
                {/* Printable section */}
                <div id='pdaDebitCreditPrintSection'>
                    {/* Header info */}
                    <div className='mb-4 space-y-1 text-center'>
                        <p className='font-semibold text-slate-700 text-sm'>STATEMENT of Personal Expense Account</p>
                        {fromDate && toDate && (
                            <p className='text-slate-500 text-xs'>
                                From:&nbsp;
                                <span className='font-semibold'>{format(fromDate, 'dd-MMM-yyyy')}</span>
                                &nbsp;&nbsp;To:&nbsp;
                                <span className='font-semibold'>{format(toDate, 'dd-MMM-yyyy')}</span>
                            </p>
                        )}
                    </div>

                    {/* Student Info */}
                    {studentInfo && (
                        <div className='mb-4 grid grid-cols-1 gap-2 rounded-lg border border-orange-100 bg-orange-50 px-4 py-3 text-slate-700 text-xs md:grid-cols-3'>
                            <div>
                                <span className='font-bold text-slate-500 uppercase tracking-wide'>Name</span>
                                <p className='mt-0.5 font-semibold'>{studentInfo.amsT_FirstName}</p>
                            </div>
                            <div>
                                <span className='font-bold text-slate-500 uppercase tracking-wide'>Adm No</span>
                                <p className='mt-0.5 font-semibold'>{studentInfo.amsT_AdmNo}</p>
                            </div>
                            <div>
                                <span className='font-bold text-slate-500 uppercase tracking-wide'>Class &amp; Section</span>
                                <p className='mt-0.5 font-semibold'>
                                    {studentInfo.asmcL_ClassName} – {studentInfo.asmC_SectionName}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Data Table */}
                    <div className='overflow-x-auto rounded-lg border border-slate-200'>
                        <table className='w-full border-collapse text-xs'>
                            <thead>
                                <tr className='bg-slate-100 text-slate-700'>
                                    <th className='whitespace-nowrap border border-slate-300 px-3 py-2 text-center font-bold'>SL.NO</th>
                                    <th className='whitespace-nowrap border border-slate-300 px-3 py-2 text-left font-bold'>DATE</th>
                                    <th className='whitespace-nowrap border border-slate-300 px-3 py-2 text-left font-bold'>CODE</th>
                                    <th className='whitespace-nowrap border border-slate-300 px-3 py-2 text-left font-bold'>PARTICULARS</th>
                                    <th className='whitespace-nowrap border border-slate-300 px-3 py-2 text-right font-bold'>DEBIT</th>
                                    <th className='whitespace-nowrap border border-slate-300 px-3 py-2 text-right font-bold'>CREDIT</th>
                                    <th className='whitespace-nowrap border border-slate-300 px-3 py-2 text-center font-bold'>TYPES</th>
                                    <th className='whitespace-nowrap border border-slate-300 px-3 py-2 text-right font-bold'>BALANCE</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row, idx) => (
                                    <tr
                                        key={idx}
                                        className={
                                            idx % 2 === 0
                                                ? 'bg-white transition-colors hover:bg-orange-50/40'
                                                : 'bg-slate-50/60 transition-colors hover:bg-orange-50/40'
                                        }>
                                        <td className='border border-slate-200 px-3 py-1.5 text-center'>{idx + 1}</td>
                                        <td className='whitespace-nowrap border border-slate-200 px-3 py-1.5'>
                                            {row.PAYMENT_DATE ? format(new Date(row.PAYMENT_DATE), 'dd/MM/yyyy') : '—'}
                                        </td>
                                        <td className='border border-slate-200 px-3 py-1.5'>{row.CODE}</td>
                                        <td className='border border-slate-200 px-3 py-1.5'>{row.PARTICULARS}</td>
                                        <td className='border border-slate-200 px-3 py-1.5 text-right font-medium text-red-600'>
                                            {row.DEBIT > 0 ? Number(row.DEBIT).toFixed(2) : '—'}
                                        </td>
                                        <td className='border border-slate-200 px-3 py-1.5 text-right font-medium text-green-700'>
                                            {row.CREDIT > 0 ? Number(row.CREDIT).toFixed(2) : '—'}
                                        </td>
                                        <td className='border border-slate-200 px-3 py-1.5 text-center'>{row.TYPEORG}</td>
                                        <td className='border border-slate-200 px-3 py-1.5 text-right font-semibold'>
                                            {Number(row.BALANCE).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className='bg-slate-100 font-bold'>
                                    <td colSpan={4} className='border border-slate-300 px-3 py-2 text-center'>
                                        Total
                                    </td>
                                    <td className='border border-slate-300 px-3 py-2 text-right text-red-600'>{totalDebit.toFixed(2)}</td>
                                    <td className='border border-slate-300 px-3 py-2 text-right text-green-700'>
                                        {totalCredit.toFixed(2)}
                                    </td>
                                    <td colSpan={2} className='border border-slate-300 px-3 py-2' />
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Closing Balance */}
                    <div className='mt-4 text-center'>
                        <span className='inline-block rounded-lg border border-orange-200 bg-orange-50 px-6 py-2 font-bold text-slate-800 text-sm'>
                            Closing Balance:&nbsp;
                            <span className={closingBalance >= 0 ? 'text-green-700' : 'text-red-600'}>
                                {Number(closingBalance).toFixed(2)}
                            </span>
                            {balType && <span className='ml-2 font-medium text-slate-500 text-xs'>{balType}</span>}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
