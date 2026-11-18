'use client';
import { Button } from '@/components/ui/button';
import { Printer, X } from 'lucide-react';
interface EarningsItem {
    name: string;
    amount: number;
}
interface DeductionsItem {
    name: string;
    amount: number;
}
interface LeaveDetail {
    serialNo: number;
    leaveName: string;
    totalLeaves: number;
    availedLeaves: number;
    balanceLeaves: number;
}
interface SalarySlipData {
    // Employee Information
    employeeName: string;
    employeeCode: string;
    designation: string;
    department?: string;
    dateOfJoining?: string;
    panNo?: string;
    payLevel?: string;
    bankName?: string;
    bankAccountNo?: string;
    pfNo?: string;
    esiNo?: string;
    uanNumber?: string;
    lopDays: number;
    totalDays?: number;
    paySlipSeq?: number;
    // Financial Details
    earnings: EarningsItem[];
    deductions: DeductionsItem[];
    grossPay: number;
    totalDeduction: number;
    netPayable: number;
    amountInWords: string;
    pensionFund?: number;
    // Leave Details
    leaveDetails: LeaveDetail[];
}
interface SalarySlipTemplateProps {
    schoolName?: string;
    schoolAddress?: string;
    schoolLogo?: string;
    month: string;
    year: string;
    salarySlipData: SalarySlipData | null;
    showLopDays: boolean;
    showLeaveDetails: boolean;
    showPanCardNo: boolean;
    showBankDetails?: boolean;
    isLoading?: boolean;
    showActions?: boolean;
    onPrint: () => void;
    onSendMail: () => void;
    onSendSMS: () => void;
    onCancel: () => void;
}

export function numberToWords(num: number) {
    if (num === 0) return 'Zero Rupees Only';

    const isNegative = num < 0;
    const absNum = Math.abs(num);

    const a = [
        '',
        'One',
        'Two',
        'Three',
        'Four',
        'Five',
        'Six',
        'Seven',
        'Eight',
        'Nine',
        'Ten',
        'Eleven',
        'Twelve',
        'Thirteen',
        'Fourteen',
        'Fifteen',
        'Sixteen',
        'Seventeen',
        'Eighteen',
        'Nineteen'
    ];

    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    function inWords(n: number): string {
        if (n < 20) return a[n];
        if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
        if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + inWords(n % 100) : '');
        if (n < 100000) return inWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + inWords(n % 1000) : '');
        if (n < 10000000) return inWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + inWords(n % 100000) : '');
        return inWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + inWords(n % 10000000) : '');
    }

    const [rupees, paise] = absNum.toFixed(2).split('.');
    const rupeesVal = Number.parseInt(rupees);
    const paiseVal = Number.parseInt(paise);

    let words = '';

    if (rupeesVal > 0) {
        words = inWords(rupeesVal) + ' Rupees';
    }

    if (paiseVal > 0) {
        if (words) {
            words += ' and ' + inWords(paiseVal) + ' Paise';
        } else {
            words = inWords(paiseVal) + ' Paise';
        }
    }

    if (!words) {
        words = 'Zero Rupees';
    }

    return (isNegative ? 'Minus ' : '') + words + ' Only';
}

export function SalarySlipTemplate({
    schoolName = '',
    schoolAddress = '',
    schoolLogo,
    month,
    year,
    salarySlipData,
    showLopDays = false,
    showLeaveDetails = false,
    showPanCardNo = false,
    showBankDetails = false,
    isLoading = false,
    showActions = true,
    onPrint,
    onSendMail,
    onSendSMS,
    onCancel
}: SalarySlipTemplateProps) {
    // Format currency
    const formatCurrency = (value: number | null | undefined) => {
        if (value === null || value === undefined) return '0.00';
        return value.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };
    // Get month name
    const MONTHS = [
        { id: 1, name: 'January' },
        { id: 2, name: 'February' },
        { id: 3, name: 'March' },
        { id: 4, name: 'April' },
        { id: 5, name: 'May' },
        { id: 6, name: 'June' },
        { id: 7, name: 'July' },
        { id: 8, name: 'August' },
        { id: 9, name: 'September' },
        { id: 10, name: 'October' },
        { id: 11, name: 'November' },
        { id: 12, name: 'December' }
    ];
    const monthRecord = MONTHS.find((m) => m.id.toString() === month.toString());
    const displayMonthName = monthRecord ? monthRecord.name : month;
    const yearValue = year || '';

    // Prepare table rows for side-by-side display
    const earnings = salarySlipData?.earnings || [];
    const deductions = salarySlipData?.deductions || [];
    const maxRows = Math.max(earnings.length, deductions.length);
    const tableRows = Array.from({ length: maxRows }, (_, i) => ({
        earning: earnings[i] || null,
        deduction: deductions[i] || null
    }));

    console.log('Salary Slip Data:', salarySlipData);
    console.log('earnings:', earnings);
    if (isLoading) {
        return (
            <div className='mx-auto w-full max-w-[900px] bg-white p-6 py-24 text-center text-gray-500 shadow-sm'>
                <div className='flex flex-col items-center gap-4'>
                    <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent'></div>
                    <p>Loading salary slip...</p>
                </div>
            </div>
        );
    }

    if (!salarySlipData) {
        return (
            <div className='mx-auto w-full max-w-[900px] rounded-xl border bg-white p-6 py-12 text-center text-gray-500 shadow-sm'>
                No salary slip data available.
            </div>
        );
    }

    return (
        <div className=' mb-8 w-full bg-white p-8 shadow-md print:p-0 print:shadow-none'>
            <div id='EmpPaySlip' className='w-full'>
                {/* Header Section */}
                <div className='mb-6 flex items-center justify-center border-black border-b-2 pb-4'>
                    {schoolLogo && <img src={schoolLogo} alt='Institution Logo' className='h-[100px] w-auto object-contain' />}
                </div>

                <h3 className='mb-6 text-center font-bold text-xl underline'>
                    Salary Slip: {displayMonthName} {yearValue}
                </h3>

                {/* Employee Details Section */}
                <div className='mb-6 grid grid-cols-2 gap-x-8 text-[13px] leading-relaxed'>
                    <table className='w-full border-collapse'>
                        <tbody>
                            <tr>
                                <td className='w-[140px] py-1 font-semibold'>Month</td>
                                <td className='w-[10px] py-1'>:</td>
                                <td className='py-1'>
                                    {displayMonthName || '-'} {yearValue}{' '}
                                </td>
                            </tr>
                            <tr>
                                <td className='w-[140px] py-1 font-semibold'>Staff Name</td>
                                <td className='w-[10px] py-1'>:</td>
                                <td className='py-1 uppercase'>{salarySlipData.employeeName}</td>
                            </tr>
                            {/* <tr>
                                <td className="font-semibold py-1">Department</td>
                                <td className="py-1">:</td>
                                <td className="py-1">{salarySlipData.department || '-'}</td>
                            </tr> */}
                            <tr>
                                <td className='py-1 font-semibold'>Designation</td>
                                <td className='py-1'>:</td>
                                <td className='py-1'>{salarySlipData.designation}</td>
                            </tr>
                            <tr>
                                <td className='py-1 font-semibold'>Actual Basic</td>
                                <td className='py-1'>:</td>
                                <td className='py-1'>{'-'}</td>
                            </tr>
                            {showPanCardNo && salarySlipData.panNo && (
                                <tr>
                                    <td className='py-1 font-semibold'>PAN No.</td>
                                    <td className='py-1'>:</td>
                                    <td className='py-1'>{salarySlipData.panNo}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    <table className='w-full border-collapse'>
                        <tbody>
                            {showBankDetails && (
                                <>
                                    <tr>
                                        <td className='py-1 font-semibold'>Bank Name</td>
                                        <td className='py-1'>:</td>
                                        <td className='py-1'>{salarySlipData.bankName || '-'}</td>
                                    </tr>
                                    <tr>
                                        <td className='py-1 font-semibold'>Bank Acc No.</td>
                                        <td className='py-1'>:</td>
                                        <td className='py-1'>{salarySlipData.bankAccountNo || '-'}</td>
                                    </tr>
                                </>
                            )}
                            {/* <tr>
                                <td className="w-[140px] font-semibold py-1">Employee Code</td>
                                <td className="w-[10px] py-1">:</td>
                                <td className="py-1">{salarySlipData.employeeCode}</td>
                            </tr> */}
                            <tr>
                                <td className='py-1 font-semibold'>Date Of Joining</td>
                                <td className='py-1'>:</td>
                                <td className='py-1'>
                                    {salarySlipData.dateOfJoining
                                        ? new Date(salarySlipData.dateOfJoining)
                                              .toLocaleDateString('en-GB', {
                                                  day: '2-digit',
                                                  month: '2-digit',
                                                  year: 'numeric'
                                              })
                                              .replace(/\//g, '-')
                                        : '-'}
                                </td>
                            </tr>
                            {salarySlipData.uanNumber && (
                                <tr>
                                    <td className='py-1 font-semibold'>PF UAN Number</td>
                                    <td className='py-1'>:</td>
                                    <td className='py-1'>{salarySlipData.uanNumber}</td>
                                </tr>
                            )}

                            {/* <tr>
                                <td className="font-semibold py-1">Pay Slip Seq</td>
                                <td className="py-1">:</td>
                                <td className="py-1">{salarySlipData.paySlipSeq || 0}</td>
                            </tr> */}
                            <tr>
                                <td className='py-1 font-semibold'>Aadhar No</td>
                                <td className='py-1'>:</td>
                                <td className='py-1'>{'-'}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Combined Earnings & Deductions Table */}
                <div className='mb-6'>
                    <table className='w-full border-collapse border border-black text-[13px]'>
                        <thead>
                            <tr>
                                <th className='w-[35%] border border-black p-2 text-left font-bold'>Earnings</th>
                                <th className='w-[15%] border border-black p-2 text-right font-bold'>Amount</th>
                                <th className='w-[35%] border border-black p-2 text-left font-bold'>Deductions</th>
                                <th className='w-[15%] border border-black p-2 text-right font-bold'>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tableRows.map((row, index) => (
                                <tr key={index}>
                                    <td className='border border-black p-2 text-left'>{row.earning?.name || ''}</td>
                                    <td className='border border-black p-2 text-right'>
                                        {row.earning ? formatCurrency(row.earning.amount) : ''}
                                    </td>
                                    <td className='border border-black p-2 text-left'>{row.deduction?.name || ''}</td>
                                    <td className='border border-black p-2 text-right'>
                                        {row.deduction ? formatCurrency(row.deduction.amount) : ''}
                                    </td>
                                </tr>
                            ))}
                            <tr className='font-bold'>
                                <td className='border border-black p-2 text-left'>CTC:</td>
                                <td className='border border-black p-2 text-right'>{formatCurrency(salarySlipData.grossPay)}</td>
                                <td className='border border-black p-2 text-left'>Total Deductions :</td>
                                <td className='border border-black p-2 text-right'>{formatCurrency(salarySlipData.totalDeduction)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Summary Section */}
                <div className='mb-10 space-y-2 text-[13px]'>
                    <div>
                        <div className='flex gap-2'>
                            <span className='w-[180px] font-bold'>Paid Days :</span>
                            <span className='font-semibold'>: {salarySlipData.totalDays || 0}</span>
                        </div>
                        {showLopDays && (
                            <div className='flex gap-2'>
                                <span className='w-[180px] font-bold'>LOP :</span>
                                <span className='font-semibold'>: {salarySlipData.lopDays || 0}</span>
                            </div>
                        )}
                    </div>
                    <div className='flex gap-2'>
                        <span className='w-[180px] font-bold'>Net Salary</span>
                        <span className='font-semibold'>: {formatCurrency(salarySlipData.netPayable)} / only</span>
                    </div>
                    {/* <div className="flex gap-2">
                        <span className="w-[180px] font-bold">Net Salary in Words</span>
                        <span className="font-semibold">: {numberToWords(salarySlipData.netPayable)}</span>
                    </div>
                    {salarySlipData.pensionFund !== undefined && (
                        <div className="flex gap-2">
                            <span className="w-[180px] font-bold">Pension Fund</span>
                            <span className="font-semibold">: {formatCurrency(salarySlipData.pensionFund)} /-</span>
                        </div>
                    )} */}
                </div>

                {/* Signature Section */}
                <div className='mb-10 flex justify-between px-4 font-bold text-[13px]'>
                    <span>Principal/Accountant</span>
                    <span>Signature</span>
                </div>

                {/* Note */}
                <p className='mb-12 text-center font-bold text-[12px] italic'>
                    NOTE : Signature is not required because it is a computer generated statement.
                </p>

                {/* Leave Details Table */}
                {showLeaveDetails && (
                    <div className='mt-8 border-gray-300 border-t-2 border-dashed pt-8'>
                        <h4 className='mb-4 text-center font-bold text-lg underline'>Leave Details</h4>
                        <table className='mx-auto w-[80%] border-collapse border border-black text-[13px]'>
                            <thead>
                                <tr className='bg-gray-50'>
                                    <th className='border border-black p-2 text-center font-bold'>Serial No.</th>
                                    <th className='border border-black p-2 text-center font-bold'>Leave Name</th>
                                    <th className='border border-black p-2 text-center font-bold'>Total Leaves</th>
                                    <th className='border border-black p-2 text-center font-bold'>Availed Leaves</th>
                                    <th className='border border-black p-2 text-center font-bold'>Balance Leaves</th>
                                </tr>
                            </thead>
                            <tbody>
                                {salarySlipData.leaveDetails && salarySlipData.leaveDetails.length > 0 ? (
                                    salarySlipData.leaveDetails.map((leave, index) => (
                                        <tr key={index}>
                                            <td className='border border-black p-2 text-center'>{leave.serialNo}</td>
                                            <td className='border border-black p-2 pl-4 text-left'>{leave.leaveName || '-'}</td>
                                            <td className='border border-black p-2 text-center'>{leave.totalLeaves || 0}</td>
                                            <td className='border border-black p-2 text-center'>{leave.availedLeaves || 0}</td>
                                            <td className='border border-black p-2 text-center'>{leave.balanceLeaves || 0}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className='border border-black p-4 text-center text-gray-400'>
                                            No leave details available.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            {showActions && (
                <div className='mt-8 flex flex-wrap justify-end gap-3 border-t pt-6 print:hidden'>
                    <Button variant='outline' onClick={onCancel} className='bg-white hover:bg-gray-50'>
                        <X className='mr-2 size-4' />
                        CANCEL
                    </Button>

                    <Button variant='default' onClick={onPrint} className='bg-primary hover:bg-primary/90'>
                        <Printer className='mr-2 size-4' />
                        PRINT
                    </Button>
                </div>
            )}
        </div>
    );
}
