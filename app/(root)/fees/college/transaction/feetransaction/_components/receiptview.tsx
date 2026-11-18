'use client';

import { Button } from '@/components/ui/button';
import { getCollegeStudentPrintDetails } from '@/server/fees/college/transaction/college_fee_transaction';
import type { ICollegeFeeTransaction } from '@/types/fees/college/transaction/transaction';
import { Printer, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Portal from './portal';

interface ReceiptViewProps {
    rowData: ICollegeFeeTransaction;
    onClose: () => void;
    asmayId: number;
    asmayYear?: string;
}

export default function CollegeReceiptView({ rowData, onClose, asmayId, asmayYear = '' }: ReceiptViewProps) {
    const receiptRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(true);
    const [printData, setPrintData] = useState<any>(null);

    useEffect(() => {
        const fetchReceipt = async () => {
            try {
                const res = await getCollegeStudentPrintDetails({
                    amcst_Id: rowData.amcst_Id,
                    fyp_Id: rowData.fyp_Id,
                    asmaY_Id: asmayId
                });
                setPrintData(res);
            } catch (err) {
                console.error('Failed to load receipt details:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchReceipt();
    }, [rowData, asmayId]);

    const studentName =
        `${rowData.amcst_FirstName || ''} ${rowData.amcst_MiddleName || ''} ${rowData.amcst_LastName || ''}`.trim() ||
        rowData.studentName ||
        'N/A';

    const handlePrint = () => {
        if (!receiptRef.current) return;
        const printWindow = window.open('', '_blank', 'width=900,height=700');
        if (printWindow) {
            const content = receiptRef.current.outerHTML;
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>College Fee Receipt - ${rowData.fyp_Receipt_No || ''}</title>
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 20px; color: #111; }
                        .receipt-box { max-width: 800px; margin: 0 auto; border: 2px solid #333; padding: 24px; border-radius: 8px; }
                        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 12px; margin-bottom: 16px; }
                        .header h1 { margin: 0; font-size: 22px; text-transform: uppercase; color: #1e3a8a; }
                        .header p { margin: 3px 0; font-size: 13px; color: #555; }
                        .receipt-title { font-weight: bold; font-size: 15px; margin-top: 8px; display: inline-block; padding: 4px 14px; background: #e0e7ff; border-radius: 4px; }
                        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 13px; margin-bottom: 16px; }
                        .grid-2 div span { font-weight: bold; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 13px; }
                        th, td { border: 1px solid #666; padding: 6px 10px; }
                        th { background: #f1f5f9; text-align: left; }
                        .text-right { text-align: right; }
                        .total-row { font-weight: bold; background: #f8fafc; }
                        .footer { margin-top: 36px; display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; }
                    </style>
                </head>
                <body>
                    ${content}
                    <script>
                        window.onload = function() {
                            window.print();
                            window.onafterprint = function() { window.close(); };
                        };
                    </script>
                </body>
                </html>
            `);
            printWindow.document.close();
        }
    };

    const feeItems = printData?.printtermDTOs?.fee_termwise_fee_receipt_details || [
        { fmH_FeeName: 'College Tuition Fee', paidAmount: rowData.fyp_Tot_Amount }
    ];

    const totalPaid = feeItems.reduce((acc: number, item: any) => acc + (Number(item.paidAmount) || 0), 0);

    return (
        <Portal>
            <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4'>
                <div className='relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200'>
                    {/* Top Action Bar */}
                    <div className='flex items-center justify-between border-b bg-gray-50 px-6 py-3'>
                        <span className='font-semibold text-gray-700 text-sm'>Fee Receipt Preview</span>
                        <div className='flex items-center gap-2'>
                            <Button
                                size='sm'
                                variant='outline'
                                onClick={handlePrint}
                                className='flex items-center gap-1.5 bg-white shadow-xs hover:bg-primary hover:text-white'>
                                <Printer className='h-4 w-4' /> Print Receipt
                            </Button>
                            <Button
                                size='sm'
                                variant='ghost'
                                onClick={onClose}
                                className='h-8 w-8 p-0 rounded-full hover:bg-gray-200'>
                                <X className='h-4 w-4' />
                            </Button>
                        </div>
                    </div>

                    {/* Receipt Printable Container */}
                    <div className='max-h-[75vh] overflow-y-auto p-6'>
                        <div ref={receiptRef} className='receipt-box border-2 border-gray-800 rounded-lg p-6 bg-white text-gray-900'>
                            {/* Institution Header */}
                            <div className='header text-center border-b-2 border-gray-800 pb-3 mb-4'>
                                <h1 className='text-xl font-bold uppercase text-blue-900'>Nagarjuna Degree College</h1>
                                <p className='text-xs text-gray-600'>Affiliated to Bengaluru City University | Recognized by Govt. of Karnataka</p>
                                <p className='text-xs text-gray-600'>Yelahanka, Bengaluru - 560064</p>
                                <div className='mt-2'>
                                    <span className='inline-block bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold px-3 py-1 rounded'>
                                        COLLEGE FEE RECEIPT
                                    </span>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className='grid grid-cols-2 gap-y-1.5 gap-x-4 text-xs mb-4'>
                                <div>
                                    <span className='font-semibold text-gray-700'>Receipt No:</span>{' '}
                                    <span className='font-mono font-bold'>{rowData.fyp_Receipt_No}</span>
                                </div>
                                <div className='text-right'>
                                    <span className='font-semibold text-gray-700'>Receipt Date:</span>{' '}
                                    <span>
                                        {new Date(rowData.fyp_Date).toLocaleDateString('en-GB', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric'
                                        })}
                                    </span>
                                </div>
                                <div>
                                    <span className='font-semibold text-gray-700'>Student Name:</span>{' '}
                                    <span className='font-bold uppercase'>{studentName}</span>
                                </div>
                                <div className='text-right'>
                                    <span className='font-semibold text-gray-700'>Academic Year:</span>{' '}
                                    <span>{asmayYear || '2025-2026'}</span>
                                </div>
                                <div>
                                    <span className='font-semibold text-gray-700'>Adm No / Reg No:</span>{' '}
                                    <span className='font-mono'>{rowData.amcst_AdmNo}</span>
                                </div>
                                <div className='text-right'>
                                    <span className='font-semibold text-gray-700'>Course & Branch:</span>{' '}
                                    <span className='font-medium'>{rowData.amco_CourseName} - {rowData.amB_BranchName}</span>
                                </div>
                                <div>
                                    <span className='font-semibold text-gray-700'>Semester:</span>{' '}
                                    <span>{rowData.amsE_SEMName || '1st Semester'}</span>
                                </div>
                                <div className='text-right'>
                                    <span className='font-semibold text-gray-700'>Mode of Payment:</span>{' '}
                                    <span className='font-bold'>{rowData.fyp_Bank_Or_Cash}</span>
                                </div>
                            </div>

                            {/* Fee Heads Table */}
                            <table className='w-full border-collapse border border-gray-400 text-xs mb-4'>
                                <thead>
                                    <tr className='bg-gray-100 font-semibold'>
                                        <th className='border border-gray-400 p-2 text-center w-12'>Sl.No</th>
                                        <th className='border border-gray-400 p-2 text-left'>Fee Particulars</th>
                                        <th className='border border-gray-400 p-2 text-right w-32'>Paid Amount (₹)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {feeItems.map((item: any, idx: number) => (
                                        <tr key={idx} className='border-b border-gray-300'>
                                            <td className='border border-gray-400 p-2 text-center'>{idx + 1}</td>
                                            <td className='border border-gray-400 p-2 font-medium'>{item.fmH_FeeName}</td>
                                            <td className='border border-gray-400 p-2 text-right'>
                                                ₹{Number(item.paidAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    ))}
                                    <tr className='bg-gray-50 font-bold'>
                                        <td colSpan={2} className='border border-gray-400 p-2 text-right'>Total Amount Paid:</td>
                                        <td className='border border-gray-400 p-2 text-right text-emerald-800 font-bold'>
                                            ₹{Number(totalPaid || rowData.fyp_Tot_Amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* Signatures */}
                            <div className='flex justify-between items-end mt-12 pt-4 border-t border-dashed border-gray-400 text-xs font-semibold'>
                                <div className='text-center'>
                                    <div className='h-8'></div>
                                    <p>Student / Parent Signature</p>
                                </div>
                                <div className='text-center'>
                                    <div className='h-8'></div>
                                    <p>Cashier / Clerk</p>
                                </div>
                                <div className='text-center'>
                                    <div className='h-8'></div>
                                    <p>Authorised Signatory / Principal</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Portal>
    );
}
