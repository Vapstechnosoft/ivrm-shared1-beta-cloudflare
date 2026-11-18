'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { numberToWords } from '@/lib/utils';
import type { IFeeIncomeTaxReportResult } from '@/types/fees/reports/FeeIncomeTax_Report';
import React from 'react';

interface FeeIncomeTaxPrintProps {
    data: IFeeIncomeTaxReportResult[];
    logoUrl?: string;
}

export const FeeIncomeTaxPrint = React.forwardRef<HTMLDivElement, FeeIncomeTaxPrintProps>(({ data, logoUrl }, ref) => {
    if (!data || data.length === 0) return null;

    const firstItem = data[0];
    const totalAmount = data.reduce((sum, item) => sum + (item.totalPaidAmount || 0), 0);
    const currentDate = new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    return (
        <div ref={ref} className='printable-content bg-white p-8 text-black'>
            <div className='space-y-8'>
                {/* Header Section with Logo */}
                <div className='space-y-4 border-gray-100 border-b-2 pb-6 text-center'>
                    {logoUrl && <img src={logoUrl} alt='Institution Logo' className='mx-auto mb-4 max-h-24 object-contain' />}
                    <h1 className='font-black text-3xl text-gray-900 uppercase tracking-wider'>FEE RECEIPT</h1>
                    <div className='mx-auto h-1 w-24 rounded-full bg-blue-600'></div>
                </div>

                {/* Top Info Bar */}
                <div className='flex items-end justify-between border-gray-200 border-b pb-4'>
                    <div className='space-y-1'>
                        <p className='font-medium text-gray-600 text-sm uppercase tracking-tight'>Admission Number</p>
                        <p className='inline-block border-blue-100 border-b-2 px-1 font-bold text-lg'>{firstItem.amsT_AdmNo}</p>
                    </div>
                    <div className='space-y-1 text-right'>
                        <p className='font-medium text-gray-600 text-sm uppercase tracking-tight'>Date</p>
                        <p className='inline-block border-blue-100 border-b-2 px-1 font-bold text-lg'>{currentDate}</p>
                    </div>
                </div>

                {/* Purpose Notice */}
                <div className='rounded-lg border border-blue-100 bg-blue-50/50 py-2 text-center'>
                    <p className='font-semibold text-blue-800 text-sm italic'>
                        "This Certificate is issued for Income Tax Purpose / Educational Concession only"
                    </p>
                </div>

                {/* Student Details Grid */}
                <div className='grid grid-cols-2 gap-x-12 gap-y-6 pt-4'>
                    <PrintDetailRow label='Name of Student' value={firstItem.studentName} />
                    <PrintDetailRow label='Father / Mother Name' value={firstItem.amsT_FatherName || firstItem.amsT_MotherName} />
                    <PrintDetailRow label='Class & Section' value={`${firstItem.className} - ${firstItem.sectionName}`} />
                    <PrintDetailRow label='Academic Year' value={firstItem.academicYear} />
                </div>

                {/* Fee Breakdown Table */}
                <div className='pt-6'>
                    <Table className='border-2 border-gray-900'>
                        <TableHeader>
                            <TableRow className='bg-gray-900 hover:bg-gray-900'>
                                <TableHead className='h-12 border-gray-700 border-r px-6 font-bold text-white'>Sl No.</TableHead>
                                <TableHead className='h-12 border-gray-700 border-r px-6 font-bold text-white'>
                                    Description of Fee
                                </TableHead>
                                <TableHead className='h-12 px-6 text-right font-bold text-white'>Amount (₹)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((item, index) => (
                                <TableRow key={index} className='border-gray-900 border-b hover:bg-transparent'>
                                    <TableCell className='border-gray-900 border-r py-4 text-center font-medium'>{index + 1}</TableCell>
                                    <TableCell className='border-gray-900 border-r px-6 py-4 font-bold uppercase tracking-tight'>
                                        {item.fmH_HeadName || `Fee Paid for ${item.academicYear}`}
                                    </TableCell>
                                    <TableCell className='px-6 py-4 text-right font-black text-lg'>
                                        {item.totalPaidAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        <p className='mt-1 font-normal text-[10px] text-gray-500 lowercase tracking-wider'>
                                            ({numberToWords(item.totalPaidAmount)} RUPEES ONLY)
                                        </p>
                                    </TableCell>
                                </TableRow>
                            ))}
                            <TableRow className='border-gray-900 border-t-2 bg-gray-50 font-black hover:bg-gray-50'>
                                <TableCell colSpan={2} className='px-6 py-6 text-right text-xl uppercase tracking-widest'>
                                    Total Amount Paid
                                </TableCell>
                                <TableCell className='border-gray-900 border-l px-6 py-6 text-right text-2xl text-blue-700'>
                                    {totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>

                {/* Total Words Section */}
                <div className='relative overflow-hidden rounded-md border-2 border-gray-900 bg-gray-50 p-6'>
                    <div className='absolute top-0 left-0 h-full w-2 bg-gray-900'></div>
                    <div className='space-y-1'>
                        <p className='font-bold text-gray-500 text-xs uppercase tracking-widest'>Amount in Words</p>
                        <p className='font-black text-gray-900 text-lg uppercase tracking-tight'>
                            {numberToWords(totalAmount)} RUPEES ONLY
                        </p>
                    </div>
                </div>

                {/* Signature Block */}
                <div className='flex justify-between pt-24 pb-8'>
                    <div className='min-w-[220px] text-center'>
                        <div className='mb-2 w-full border-gray-900 border-t-2'></div>
                        <p className='font-black text-gray-700 text-xs uppercase tracking-widest'>Accountant Signature</p>
                    </div>
                    <div className='min-w-[220px] text-center'>
                        <div className='mb-2 w-full border-gray-900 border-t-2'></div>
                        <p className='font-black text-gray-700 text-xs uppercase tracking-widest'>Principal / Headmaster Signature</p>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @media print {
                    @page {
                        margin: 15mm;
                        size: A4;
                    }
                    .printable-content {
                        padding: 0 !important;
                    }
                }
            `}</style>
        </div>
    );
});

FeeIncomeTaxPrint.displayName = 'FeeIncomeTaxPrint';

function PrintDetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div className='flex flex-col space-y-1'>
            <p className='font-black text-[10px] text-gray-500 uppercase tracking-widest'>{label}</p>
            <p className='border-gray-200 border-b-2 pb-1 font-bold text-base text-gray-900'>{value || '---'}</p>
        </div>
    );
}
