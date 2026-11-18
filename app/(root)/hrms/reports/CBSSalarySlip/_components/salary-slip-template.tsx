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

    const netSalary = formatCurrency(salarySlipData?.netPayable) || 0.0;

    console.log('Net Salary:', netSalary);

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
        <div className='mx-auto mb-8 w-full bg-white px-8 shadow-md print:p-0 print:shadow-none'>
            <div id='EmpPaySlip' className='w-full'>
                {/* Header Section */}
                <div className='mb-2 flex items-center justify-center border-black border-b-2 pb-4 '>
                    {schoolLogo && <img src={schoolLogo} alt='Institution Logo' className='h-[140px] w-auto object-contain' />}
                </div>

                <h3 className='mb-6 text-center font-bold text-xl'>
                    PAY SLIP <br /> FOR {displayMonthName.toUpperCase()} {yearValue}
                </h3>

                {/* Employee Details Section */}
                <div className='flex justify-between border-b-2 border-b-black pb-2'>
                    <h6>Name : {salarySlipData.employeeName}</h6>
                    <h6>No. of Pay Days : {salarySlipData.totalDays}</h6>
                </div>
                <div className='my-6 grid grid-cols-2 gap-x-8 text-[13px] leading-relaxed'>
                    <table className='w-full border-collapse '>
                        <tbody>
                            {/* <tr>
                                <td className="w-[140px] font-semibold py-1">Name</td>
                                <td className="w-[10px] py-1">:</td>
                                <td className="py-1 uppercase">{salarySlipData.employeeName}</td>
                            </tr> */}
                            <tr>
                                <td className='w-[140px] py-1 font-semibold'>Employee Code</td>
                                <td className='w-[10px] py-1'>:</td>
                                <td className='py-1'>{salarySlipData.employeeCode}</td>
                            </tr>
                            <tr>
                                <td className='py-1 font-semibold'>Bank Details</td>
                                <td className='py-1'>:</td>
                                <td className='py-1'>{salarySlipData.bankName || '-'}</td>
                            </tr>
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

                            {/* {showBankDetails && (
                <>
                  <tr>
                    <td className="font-semibold py-1">Bank Name</td>
                    <td className="py-1">:</td>
                    <td className="py-1">{salarySlipData.bankName || "-"}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold py-1">Bank Acc No.</td>
                    <td className="py-1">:</td>
                    <td className="py-1">
                      {salarySlipData.bankAccountNo || "-"}
                    </td>
                  </tr>
                </>
              )} */}
                        </tbody>
                    </table>
                    <table className='w-full border-collapse'>
                        <tbody>
                            <tr>
                                <td className='py-1 font-semibold'>Income Tax Number(PAN)</td>
                                <td className='py-1'>:</td>
                                <td className='py-1'>{salarySlipData.panNo}</td>
                            </tr>
                            {/* {salarySlipData.uanNumber && (
                <tr>
                  <td className="font-semibold py-1">PF UAN Number</td>
                  <td className="py-1">:</td>
                  <td className="py-1">{salarySlipData.uanNumber}</td>
                </tr>
              )}
              {showLopDays && (
                <tr>
                  <td className="font-semibold py-1">L.W.O.P Days</td>
                  <td className="py-1">:</td>
                  <td className="py-1">{salarySlipData.lopDays || 0}</td>
                </tr>
              )} */}
                            <tr>
                                <td className='py-1 font-semibold'>PF UAN Number</td>
                                <td className='py-1'>:</td>
                                <td className='py-1'>{salarySlipData.uanNumber}</td>
                            </tr>
                            <tr>
                                <td className='py-1 font-semibold'>UAN No</td>
                                <td className='py-1'>:</td>
                                <td className='py-1'>{salarySlipData.uanNumber || 0}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Combined Earnings & Deductions Table */}
                <div className='mb-6'>
                    <table className='w-full border-collapse border border-black text-[13px]'>
                        <thead>
                            <tr>
                                <th className=' w-[35%] border-black border-b-2 p-2 text-left font-bold text-lg'>Earnings</th>
                                <th className=' w-[15%] border-black border-b-2 p-2 text-right font-bold text-lg'>Amount</th>
                                <th className='w-[35%] border-black border-b-2 border-l-2 p-2 text-left font-bold text-lg'>Deductions</th>
                                <th className='w-[15%] border-black border-b-2 p-2 text-right font-bold text-lg'>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tableRows.map((row, index) => (
                                <tr key={index}>
                                    <td className=' p-2 text-left'>{row.earning?.name || ''}</td>
                                    <td className=' p-2 text-right'>{row.earning ? formatCurrency(row.earning.amount) : ''}</td>
                                    <td className='border-black border-l-2 p-2 text-left'>{row.deduction?.name || ''}</td>
                                    <td className=' p-2 text-right'>{row.deduction ? formatCurrency(row.deduction.amount) : ''}</td>
                                </tr>
                            ))}
                            <tr className='font-bold'>
                                <td className='border-black border-t-2 p-2 text-left'>Total Earnings :</td>
                                <td className='border-black border-t-2 p-2 text-right'>{formatCurrency(salarySlipData.grossPay)}</td>
                                <td className='border-black border-t-2 border-l-2 p-2 text-left'>Total Deductions :</td>
                                <td className='border-black border-t-2 p-2 text-right'>{formatCurrency(salarySlipData.totalDeduction)}</td>
                            </tr>
                            <tr className='font-bold'>
                                <td className='border-black border-t-2 p-2 text-left'></td>
                                <td className='border-black border-t-2 p-2 text-right'></td>
                                <td className='border-black border-t-2 border-l-2 p-2 text-left'>Net Salary :</td>
                                <td className='border-black border-t-2 p-2 text-right'>{netSalary.toString()}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Summary Section */}
                <div className='mb-10 space-y-2 pb-4 text-[16px]'>
                    <div className='flex gap-2'>
                        <span className='font-bold'>Amount (in Words)</span>
                        <span className='font-medium'>: {numberToWords(salarySlipData.netPayable)}</span>
                    </div>

                    <p className='font-medium '>
                        {'NOTE : Signature is not required because it is a computer generated statement.'.toUpperCase()}
                    </p>
                </div>

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
