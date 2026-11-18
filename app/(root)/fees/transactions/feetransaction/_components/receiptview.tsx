'use client';

import { Button } from '@/components/ui/button';
import { getStudentPrintDetails } from '@/server/fees/trasactions/fee_student_transaction';
import { getPrintdetails } from '@/server/fees/trasactions/feepreadmissiontrasaction';
import type { CurrentPaymentDetails, Ifeetransaction, StudentPrintDetails } from '@/types/fees/transactions/transactions';
import { useEffect, useRef, useState } from 'react';
import Portal from './portal';

interface IInstituteDetails {
    institute_logo?: string;
}

interface ReceiptViewPageProps {
    rowData: Ifeetransaction;
    onClose: () => void;
    asmayId: number;
    asmayYear: string;
}

export default function ReceiptViewPage({ rowData, onClose, asmayId, asmayYear }: ReceiptViewPageProps) {
    const receiptRef = useRef<HTMLDivElement>(null);
    const [institute, setInstitute] = useState<IInstituteDetails>({});
    const [loading, setLoading] = useState(true);
    const [dueAmount, setDueAmount] = useState(0);
    const [studentDetails, setStudentDetails] = useState<StudentPrintDetails[]>([]);
    const [currentPaymentDetails, setCurrentPaymentDetails] = useState<CurrentPaymentDetails[]>([]);
    const [copyTitles, setCopyTitles] = useState<string[]>(['INSTITUTION COPY', 'STUDENT COPY']);
    const [studentMeta, setStudentMeta] = useState<any>({});

    useEffect(() => {
        const targetFypId = Number(rowData.fyP_Id || (rowData as any).fP_Id || 0);

        const fetchStudentPrintDetails = async () => {
            if (!targetFypId) {
                console.warn('ReceiptViewPage: fyP_Id is 0 or missing, cannot fetch print details');
                setLoading(false);
                return;
            }
            try {
                const response = await getStudentPrintDetails({
                    amst_Id: rowData.amst_Id,
                    fyP_Id: targetFypId,
                    asmaY_Id: asmayId,
                    minstall: '0'
                });

                const res: any = response;
                const printtermDTOs = res?.printtermDTOs || res?.data?.printtermDTOs || {};
                const sDetails = JSON.parse(
                    JSON.stringify(
                        res?.showdetailsreceipt ||
                        res?.data?.showdetailsreceipt ||
                        printtermDTOs?.fee_termwise_fee_receipt_details ||
                        []
                    )
                );
                const pDetails = JSON.parse(
                    JSON.stringify(
                        res?.paymenrgrid ||
                        res?.data?.paymenrgrid ||
                        printtermDTOs?.currpaymentdetails ||
                        []
                    )
                );
                const dAmount = JSON.parse(
                    JSON.stringify(res?.dueamount ?? res?.pendingamount ?? res?.data?.dueamount ?? res?.data?.pendingamount ?? 0)
                );

                const sInfo = res?.fillstudentviewdetails?.[0] || res?.data?.fillstudentviewdetails?.[0] || {};
                setStudentMeta(sInfo);
                setDueAmount(dAmount);
                setStudentDetails(sDetails);
                setCurrentPaymentDetails(pDetails);

                // Extract copy titles dynamically from backend HTML template (e.g. INSTITUTION COPY, STUDENT COPY, STUDENT COPY)
                const rawTemplate =
                    (typeof res === 'string' && res.trim().startsWith('<') ? res : null) ||
                    res?.htmldata ||
                    res?.htmlData ||
                    res?.data?.htmldata ||
                    res?.data?.htmlData ||
                    res?.template;

                if (rawTemplate && typeof rawTemplate === 'string') {
                    const matches = [...rawTemplate.matchAll(/<(?:h[456]|span|b|strong|div)[^>]*>\s*([^<]*?COPY)\s*<\/(?:h[456]|span|b|strong|div)>/gi)]
                        .map((m) => m[1].trim())
                        .filter((t) => t.length > 0);

                    if (matches.length > 0) {
                        setCopyTitles(matches);
                    }
                }
            } catch (err) {
                console.error('Failed to load student print details', err);
            } finally {
                setLoading(false);
            }
        };

        const fetchInstituteDetails = async () => {
            if (!targetFypId) return;
            try {
                const preadmissionorprospectus = 'Preadmission';
                const res = await getPrintdetails(targetFypId, asmayId, preadmissionorprospectus, 0);
                const response = typeof res === 'string' ? JSON.parse(res) : res;
                const logoUrl = response?.data?.institute_logo || response?.institute_logo || '';
                if (logoUrl) {
                    setInstitute({
                        institute_logo: `${logoUrl}?t=${Date.now()}`
                    });
                }
            } catch (err) {
                console.error('Failed to load institute logo', err);
                setInstitute({ institute_logo: '' });
            }
        };

        fetchInstituteDetails();
        fetchStudentPrintDetails();
    }, [rowData, asmayId]);

    const receipt_no = studentMeta?.fyP_Receipt_No || rowData.fyP_Receipt_No || 'N/A';
    const transaction_date = studentMeta?.fyP_Date || rowData.fyP_Date || '';
    const student_name =
        studentMeta?.amsT_FirstName
            ? `${studentMeta.amsT_FirstName || ''} ${studentMeta.amsT_MiddleName || ''} ${studentMeta.amsT_LastName || ''}`.trim()
            : `${rowData?.amsT_FirstName || ''} ${rowData?.amsT_MiddleName || ''} ${rowData?.amsT_LastName || ''}`.trim() || 'N/A';
    const reg_no = studentMeta?.admno || studentMeta?.amsT_AdmNo || rowData.amsT_AdmNo || 'N/A';
    const class_name = studentMeta?.classname || rowData.classname || '';
    const section_name = studentMeta?.sectionname || (rowData as any).sectionname || (rowData as any).asmC_SectionName || '';
    const full_class = section_name ? `${class_name} - ${section_name}` : class_name;
    const academic_year = studentMeta?.asmaY_Year || asmayYear || '';
    const father_name = studentMeta?.fathername || (rowData as any).amsT_FatherName || '';
    const mother_name = studentMeta?.mothername || (rowData as any).amsT_MotherName || '';
    const concession_name = studentMeta?.fmcC_ConcessionName || (rowData as any).fmcC_ConcessionName || '';

    const currentPaidAmount =
        currentPaymentDetails.reduce((sum, p) => {
            return sum + (p.fyppM_TotalPaidAmount ?? (p as any).ftP_Paid_Amt ?? 0);
        }, 0) || Number(rowData.fyP_Tot_Amount || 0);

    const paymentMode =
        studentMeta?.fyP_Bank_Or_Cash === 'B'
            ? 'Bank'
            : studentMeta?.fyP_Bank_Or_Cash === 'C'
                ? 'Cash'
                : currentPaymentDetails[0]?.ivrmmoD_ModeOfPayment ||
                currentPaymentDetails[0]?.ivrmmoD_Flag ||
                (rowData as any).modeOfPayment ||
                'Cash';

    const noteText =
        rowData.mI_Id === 78
            ? 'Fees Once Paid will not be Refunded.'
            : 'This receipt is valid subject to realisation of Cheque.';

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return dateString;
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const convertNumberToWords = (num: number | undefined | null): string => {
        if (num === undefined || num === null || Number.isNaN(num)) return 'Zero';
        const numberValue = typeof num === 'string' ? Number.parseFloat(num) : num;
        if (Number.isNaN(numberValue) || numberValue === 0) return 'Zero';
        if (numberValue < 0) return `Negative ${convertNumberToWords(Math.abs(numberValue))}`;

        const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
        const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

        const convertLessThanThousand = (n: number): string => {
            if (n === 0) return '';
            let result = '';
            let temp = n;
            if (temp >= 100) {
                result += `${ones[Math.floor(temp / 100)]} Hundred`;
                temp %= 100;
                if (temp > 0) result += ' ';
            }
            if (temp >= 20) {
                result += tens[Math.floor(temp / 10)];
                if (temp % 10 > 0) result += ` ${ones[temp % 10]}`;
            } else if (temp >= 10) {
                result += teens[temp - 10];
            } else if (temp > 0) {
                result += ones[temp];
            }
            return result;
        };

        const convertLessThanLakh = (n: number): string => {
            if (n < 1000) return convertLessThanThousand(n);
            const thousands = Math.floor(n / 1000);
            const remainder = n % 1000;
            const thousandPart = `${convertLessThanThousand(thousands)} Thousand`;
            return remainder === 0 ? thousandPart : `${thousandPart} ${convertLessThanThousand(remainder)}`;
        };

        if (numberValue < 100000) return convertLessThanLakh(numberValue);
        const lakhs = Math.floor(numberValue / 100000);
        const remainder = numberValue % 100000;
        const lakhPart = `${convertLessThanThousand(lakhs)} Lakh`;
        return remainder === 0 ? lakhPart : `${lakhPart} ${convertLessThanLakh(remainder)}`;
    };

    const handlePrint = () => {
        if (!receiptRef.current) return;
        const printWindow = window.open('', '_blank', 'width=1300,height=900');
        if (printWindow) {
            const content = receiptRef.current.innerHTML;
            printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <title>Receipt - ${receipt_no}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @page {
              size: A4 landscape;
              margin: 6mm;
            }
            body {
              font-family: system-ui, -apple-system, sans-serif;
              padding: 0;
              margin: 0;
              background: #fff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .receipt-grid {
              display: grid !important;
              grid-template-columns: repeat(${copyTitles.length}, minmax(0, 1fr)) !important;
              gap: 12px !important;
              width: 100% !important;
            }
            .receipt-card {
              border: 1px solid #000 !important;
              padding: 8px !important;
              font-size: 10px !important;
              box-shadow: none !important;
            }
            table th, table td {
              border: 1px solid #000 !important;
              padding: 2px 4px !important;
              font-size: 9.5px !important;
            }
            @media print {
              .print\\:hidden { display: none !important; }
            }
          </style>
        </head>
        <body>
          <div class="receipt-grid">
            ${content}
          </div>
        </body>
        </html>
      `);
            printWindow.document.close();
            printWindow.focus();
            printWindow.onload = () => {
                setTimeout(() => {
                    printWindow.print();
                    printWindow.close();
                }, 600);
            };
        }
    };

    if (loading) {
        return (
            <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
                <div className='rounded-lg bg-white p-8 font-medium shadow-xl'>Loading receipt details...</div>
            </div>
        );
    }

    const gridColsClass =
        copyTitles.length >= 3
            ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
            : copyTitles.length === 2
                ? 'grid-cols-1 lg:grid-cols-2'
                : 'grid-cols-1';

    return (
        <Portal>
            <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-3 sm:p-5'>
                <div className='relative flex max-h-[95vh] w-full max-w-7xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl'>
                    {/* Header bar */}
                    <div className='flex items-center justify-between border-b bg-gray-50 px-6 py-3 print:hidden'>
                        <h3 className='font-bold text-gray-800 text-sm tracking-wide uppercase'>
                            Fee Receipt Preview ({copyTitles.length} Copies)
                        </h3>
                        <Button onClick={onClose} variant='ghost' size='sm' className='h-8 w-8 p-0 text-gray-500 hover:text-black'>
                            ✕
                        </Button>
                    </div>

                    {/* Scrollable Receipt Area */}
                    <div className='flex-1 overflow-auto p-4 sm:p-6'>
                        <div
                            ref={receiptRef}
                            className={`receipt-grid grid gap-6 ${gridColsClass}`}>
                            {copyTitles.map((title, copyIndex) => (
                                <div
                                    key={copyIndex}
                                    className='receipt-card flex flex-col rounded-lg border-2 border-gray-300 bg-white p-5 shadow-sm transition-all hover:shadow-md'>
                                    {/* Logo Header */}
                                    <div className='mb-3 text-center'>
                                        {institute.institute_logo ? (
                                            <div className='flex justify-center'>
                                                <img
                                                    src={institute.institute_logo}
                                                    alt='Institute Logo'
                                                    className='max-h-16 w-auto object-contain'
                                                />
                                            </div>
                                        ) : (
                                            <div className='py-2 text-center font-bold text-gray-800 text-base tracking-wider uppercase'>
                                                Payment Receipt
                                            </div>
                                        )}
                                    </div>

                                    {/* Copy Title from Backend */}
                                    <div className='mb-3 border-b-2 border-violet-100 pb-2 text-center'>
                                        <h4 className='font-extrabold text-sm text-violet-700 tracking-wider uppercase'>
                                            {title}
                                        </h4>
                                    </div>

                                    {/* Student & Receipt Meta Grid */}
                                    <div className='mb-4 grid grid-cols-12 gap-x-2 gap-y-1.5 text-xs'>
                                        <div className='col-span-7 flex justify-between'>
                                            <span className='font-bold text-gray-600'>Receipt No</span>
                                            <span className='font-semibold text-gray-900'>: {receipt_no}</span>
                                        </div>
                                        <div className='col-span-5 flex justify-between'>
                                            <span className='font-bold text-gray-600'>Date</span>
                                            <span className='font-semibold text-gray-900'>: {formatDate(transaction_date)}</span>
                                        </div>

                                        <div className='col-span-7 flex justify-between'>
                                            <span className='font-bold text-gray-600'>Adm No</span>
                                            <span className='font-semibold text-gray-900'>: {reg_no}</span>
                                        </div>
                                        <div className='col-span-5 flex justify-between'>
                                            <span className='font-bold text-gray-600'>Aca Year</span>
                                            <span className='font-semibold text-gray-900'>: {academic_year}</span>
                                        </div>

                                        <div className='col-span-7 flex justify-between'>
                                            <span className='font-bold text-gray-600'>Name</span>
                                            <span className='font-semibold text-gray-900 truncate' title={student_name}>
                                                : {student_name}
                                            </span>
                                        </div>
                                        <div className='col-span-5 flex justify-between'>
                                            <span className='font-bold text-gray-600'>Class</span>
                                            <span className='font-semibold text-gray-900 truncate' title={full_class}>
                                                : {full_class}
                                            </span>
                                        </div>

                                        {father_name && (
                                            <div className='col-span-7 flex justify-between'>
                                                <span className='font-bold text-gray-600'>Father</span>
                                                <span className='font-semibold text-gray-900'>: {father_name}</span>
                                            </div>
                                        )}
                                        {concession_name && (
                                            <div className='col-span-5 flex justify-between'>
                                                <span className='font-bold text-gray-600'>Type</span>
                                                <span className='font-semibold text-gray-900'>: {concession_name}</span>
                                            </div>
                                        )}

                                        {mother_name && (
                                            <div className='col-span-7 flex justify-between'>
                                                <span className='font-bold text-gray-600'>Mother</span>
                                                <span className='font-semibold text-gray-900'>: {mother_name}</span>
                                            </div>
                                        )}
                                        <div className='col-span-5 flex justify-between'>
                                            <span className='font-bold text-gray-600'>Reg No.</span>
                                            <span className='font-semibold text-gray-900'>: {reg_no}</span>
                                        </div>
                                    </div>

                                    {/* Fee Breakdown Table */}
                                    <div className='mb-3'>
                                        <table className='w-full border-collapse border border-gray-300 text-xs'>
                                            <thead>
                                                <tr className='bg-violet-700 text-white'>
                                                    <th className='border border-gray-300 px-2 py-1 text-center font-bold'>SLNO</th>
                                                    <th className='border border-gray-300 px-2 py-1 text-left font-bold'>Head Name</th>
                                                    <th className='border border-gray-300 px-2 py-1 text-right font-bold'>Fee Amount</th>
                                                    <th className='border border-gray-300 px-2 py-1 text-center font-bold'>Installment</th>
                                                    <th className='border border-gray-300 px-2 py-1 text-right font-bold'>Paid Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {studentDetails.length > 0 ? (
                                                    studentDetails.map((detail: any, idx: number) => (
                                                        <tr key={idx} className='odd:bg-white even:bg-gray-50'>
                                                            <td className='border border-gray-300 px-2 py-1 text-center'>{idx + 1}</td>
                                                            <td className='border border-gray-300 px-2 py-1'>
                                                                {detail.fmH_FeeName || detail.fmh_feename || 'Fee Amount'}
                                                            </td>
                                                            <td className='border border-gray-300 px-2 py-1 text-right'>
                                                                {detail.feeAmount ?? detail.totalcharges ?? detail.paid_amount ?? 0}
                                                            </td>
                                                            <td className='border border-gray-300 px-2 py-1 text-center'>
                                                                {detail.ftI_Name || detail.fti_name || detail.fmt_name || '--'}
                                                            </td>
                                                            <td className='border border-gray-300 px-2 py-1 text-right font-semibold'>
                                                                {detail.paid_amount ?? detail.ftP_Paid_Amt ?? 0}
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td className='border border-gray-300 px-2 py-1 text-center'>1</td>
                                                        <td className='border border-gray-300 px-2 py-1'>Fee Amount</td>
                                                        <td className='border border-gray-300 px-2 py-1 text-right'>{currentPaidAmount}</td>
                                                        <td className='border border-gray-300 px-2 py-1 text-center'>--</td>
                                                        <td className='border border-gray-300 px-2 py-1 text-right font-semibold'>{currentPaidAmount}</td>
                                                    </tr>
                                                )}
                                                {/* Totals Row */}
                                                <tr className='bg-gray-100 font-bold'>
                                                    <td className='border border-gray-300 px-2 py-1 text-center' />
                                                    <td className='border border-gray-300 px-2 py-1'>Total</td>
                                                    <td className='border border-gray-300 px-2 py-1 text-right'>
                                                        {studentDetails.length > 0
                                                            ? studentDetails.reduce(
                                                                (sum: number, d: any) =>
                                                                    sum + (d.feeAmount ?? d.totalcharges ?? d.paid_amount ?? 0),
                                                                0
                                                            )
                                                            : currentPaidAmount}
                                                    </td>
                                                    <td className='border border-gray-300 px-2 py-1 text-center' />
                                                    <td className='border border-gray-300 px-2 py-1 text-right text-violet-900'>
                                                        {currentPaidAmount}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Current Payment Detail Table */}
                                    <div className='mb-3'>
                                        <div className='mb-1 font-bold text-gray-800 text-xs'>Current Payment Detail</div>
                                        <table className='w-full border-collapse border border-gray-300 text-xs'>
                                            <thead>
                                                <tr className='bg-violet-700 text-white'>
                                                    <th className='border border-gray-300 px-2 py-1 text-center font-bold'>SLNO</th>
                                                    <th className='border border-gray-300 px-2 py-1 text-right font-bold'>Amount</th>
                                                    <th className='border border-gray-300 px-2 py-1 text-center font-bold'>Bank / Mode</th>
                                                    <th className='border border-gray-300 px-2 py-1 text-center font-bold'>Ref No</th>
                                                    <th className='border border-gray-300 px-2 py-1 text-center font-bold'>Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentPaymentDetails.length > 0 ? (
                                                    currentPaymentDetails.map((p: any, idx: number) => {
                                                        const isBank =
                                                            p.fyP_Bank_Or_Cash === 'B' || p.ivrmmoD_Flag === 'B' || !!p.fyppM_BankName;
                                                        const bankOrMode = isBank
                                                            ? p.fyppM_BankName || p.fyP_Bank_Name || 'Bank'
                                                            : p.ivrmmoD_ModeOfPayment || p.fyP_Bank_Or_Cash || paymentMode || 'Cash';
                                                        const refNo = isBank
                                                            ? p.fyppM_DDChequeNo || p.fyP_DD_Cheque_No || '--'
                                                            : '--';
                                                        const dateVal = isBank
                                                            ? formatDate(p.fyppM_DDChequeDate || p.fyP_DD_Cheque_Date)
                                                            : formatDate(p.fyP_Date || transaction_date);
                                                        return (
                                                            <tr key={idx} className='odd:bg-white even:bg-gray-50'>
                                                                <td className='border border-gray-300 px-2 py-1 text-center'>{idx + 1}</td>
                                                                <td className='border border-gray-300 px-2 py-1 text-right font-semibold'>
                                                                    {p.fyppM_TotalPaidAmount ?? p.ftP_Paid_Amt ?? currentPaidAmount}
                                                                </td>
                                                                <td className='border border-gray-300 px-2 py-1 text-center'>{bankOrMode}</td>
                                                                <td className='border border-gray-300 px-2 py-1 text-center'>{refNo}</td>
                                                                <td className='border border-gray-300 px-2 py-1 text-center'>{dateVal}</td>
                                                            </tr>
                                                        );
                                                    })
                                                ) : (
                                                    <tr>
                                                        <td className='border border-gray-300 px-2 py-1 text-center'>1</td>
                                                        <td className='border border-gray-300 px-2 py-1 text-right font-semibold'>
                                                            {currentPaidAmount}
                                                        </td>
                                                        <td className='border border-gray-300 px-2 py-1 text-center'>{paymentMode}</td>
                                                        <td className='border border-gray-300 px-2 py-1 text-center'>--</td>
                                                        <td className='border border-gray-300 px-2 py-1 text-center'>
                                                            {formatDate(transaction_date)}
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Bottom Info Section */}
                                    <div className='mt-auto space-y-1 text-xs'>
                                        <div>
                                            <span className='font-bold text-gray-700'>Payment Mode:</span>{' '}
                                            <span className='font-medium text-gray-900'>{paymentMode}</span>
                                        </div>
                                        <div>
                                            <span className='font-bold text-gray-700'>Amount Received (in Words):</span>{' '}
                                            <span className='font-medium text-gray-900 italic'>
                                                {convertNumberToWords(currentPaidAmount)} Rupees Only/-
                                            </span>
                                        </div>
                                        {dueAmount > 0 && (
                                            <div>
                                                <span className='font-bold text-gray-700'>Next Due Amount:</span>{' '}
                                                <span className='font-bold text-red-600'>{dueAmount}/-</span>
                                            </div>
                                        )}
                                        <div className='pt-1 text-[11px] text-gray-500'>
                                            <strong>Note:</strong> {noteText}
                                        </div>
                                        <div className='pt-6 text-right'>
                                            <p className='font-bold text-gray-800 text-xs tracking-wider'>
                                                AUTHORISED SIGNATORY
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className='sticky bottom-0 z-10 flex justify-end gap-3 border-t bg-gray-50 px-6 py-4 print:hidden'>
                        <Button onClick={handlePrint} variant='default' className='min-w-[100px] shadow-sm'>
                            Print
                        </Button>
                        <Button onClick={onClose} variant='outline' className='min-w-[100px]'>
                            Close
                        </Button>
                    </div>
                </div>
            </div>
        </Portal>
    );
}
