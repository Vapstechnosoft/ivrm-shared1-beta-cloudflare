'use client';

import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';

import { numberToWords } from '@/app/(root)/hrms/reports/CBSSalarySlip/_components/salary-slip-template';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FormError } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { feeReceiptLogo } from '@/hooks/fees/useReports';
import { feePortalReceiptSchema } from '@/schemas/fees/reports';
import { getStudentFeeReceiptDropDown, getStudentPortalPrintDetails } from '@/server/fees/reports/studentfee_pages';
import type { CurrentPaymentDetails, StudentPortalPrintDetails } from '@/types/fees/transactions/transactions';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof feePortalReceiptSchema>;

interface IAcademicYear {
    asmaY_Id: string | number;
    asmaY_Year: string;
    asmaY_Order?: number;
}

export interface IFeeClassWiseDueListReportofSophia {
    id: number;
    studentName: string;
    amsT_AdmNo: string;
    asmcL_ClassName: string;
    asmcL_Id: number;
    asmS_SectionName?: string;
    fmT_Name: string;
    balance: number;
    fine: number;
    fine_calc: number;
    totalDue: number;
}

// Group key interface

export default function FeeReceiptDeleteReportNagarjuna() {
    const {
        handleSubmit,
        control,
        watch,
        formState: { errors }
    } = useForm<FormFields>({
        resolver: zodResolver(feePortalReceiptSchema),
        defaultValues: {
            academicYearId: undefined,
            receiptId: undefined
        }
    });
    const selctedAcademicYearId = watch('academicYearId');
    const selectedReceiptId = watch('receiptId');
    const printRef = useRef<HTMLDivElement>(null);
    const [academicYears, setAcademicYears] = useState<IAcademicYear[]>([]);
    const [feeReceiptData, setFeeReceiptData] = useState<any[]>([]);
    const [isFeeReceiptLoading, setisFeeReceiptLoading] = useState(false);
    const [studentDetails, setStudentDetails] = useState<StudentPortalPrintDetails[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPaymentDetails, setCurrentPaymentDetails] = useState<CurrentPaymentDetails[]>([]);

    const { data: academicData, isLoading: loadingAcademic, error: academicError } = useAcademicYearDropdown();

    useEffect(() => {
        if (academicError) {
            toast.error(academicError?.message || 'Failed to load academic years');
            setAcademicYears([]);
            return;
        }
        if (academicData?.data && Array.isArray(academicData.data)) {
            const formatted: IAcademicYear[] = academicData.data.map((item: any) => ({
                asmaY_Id: item.asmaY_Id ?? '',
                asmaY_Year: item.asmaY_Year ?? 'Unknown Year',
                asmaY_Order: item.asmaY_Order ?? 0
            }));
            setAcademicYears(formatted);
        }
    }, [academicData, academicError]);

    const fetchFeeReceiptDetails = async () => {
        if (!selctedAcademicYearId) return;
        try {
            setisFeeReceiptLoading(true);
            const res = await getStudentFeeReceiptDropDown(Number(selctedAcademicYearId));
            const receiptData = JSON.parse(JSON.stringify(res.data || []));
            const receiptData2 = JSON.parse(JSON.stringify(receiptData.recnolist || []));
            setFeeReceiptData(receiptData2 ?? []);
        } catch (error) {
            console.error('Error fetching student class mapping', error);
        } finally {
            setisFeeReceiptLoading(false);
        }
    };

    useEffect(() => {
        fetchFeeReceiptDetails();
    }, [selctedAcademicYearId]);

    const [logodata, setlogodata] = useState('');

    const { data: logoResponse, error: logoerror } = feeReceiptLogo();

    useEffect(() => {
        if (logoerror) {
            toast.error(logoerror.message || 'Failed to load logo');
            return;
        }

        if (logoResponse) {
            try {
                // Convert to JSON in case it's a string
                const parsed = typeof logoResponse === 'string' ? JSON.parse(logoResponse) : logoResponse;

                if (parsed?.data) {
                    setlogodata(parsed.data);
                }
            } catch (err) {
                console.error('Failed to parse logo response', err);
            }
        }
    }, [logoResponse, logoerror]);

    useEffect(() => {
        if (!selctedAcademicYearId) return;
        if (!selectedReceiptId) return;
        setLoading(true);
        const fetchStudentPrintDetails = async () => {
            try {
                const response = await getStudentPortalPrintDetails({
                    amst_Id: 0,
                    fyP_Id: Number(selectedReceiptId),
                    asmaY_Id: Number(selctedAcademicYearId),
                    minstall: 'string'
                });
                const studentDetails = JSON.parse(
                    JSON.stringify((response as any)?.printinstallmentDTOs?.installment_transaction_details || [])
                );
                const currentPaymentDetails = JSON.parse(
                    JSON.stringify((response as any)?.printinstallmentDTOs?.paymentTransactions || [])
                );
                // console.log("currentPaymentDetails",currentPaymentDetails)
                setStudentDetails(studentDetails);
                // console.log("studentDetails",studentDetails)
                setCurrentPaymentDetails(currentPaymentDetails);
            } catch (err) {
                console.error('Failed to load institute logo', err);
            } finally {
                setLoading(false);
            }
        };

        fetchStudentPrintDetails();
    }, [selctedAcademicYearId, selectedReceiptId]);

    const onSubmit: SubmitHandler<FormFields> = async () => {
        // setSelectedIds([]);
    };

    // Update your printTable function to handle grouped data
    // const handlePrint = () => {
    //     // Create a print window with the grouped report structure
    //     const printWindow = window.open('', '_blank');
    //     if (!printWindow) {
    //         alert('Please allow pop-ups to print the report');
    //         return;
    //     }

    //     const currentDate = new Date().toLocaleDateString();

    //     // Build HTML content for printing
    //     let printContent = `
    //      <!DOCTYPE html>
    //      <html>
    //      <head>
    //          <title>Fee Class Wise Due List Report</title>
    //          <style>
    //              body {
    //                  font-family: Arial, sans-serif;
    //                  margin: 20px;
    //                  padding: 0;
    //              }
    //              .header {
    //                  text-align: center;
    //                  margin-bottom: 30px;
    //              }
    //              .header h1 {
    //                  margin: 0;
    //                  color: #1e40af;
    //              }
    //              .header p {
    //                  margin: 5px 0;
    //                  color: #666;
    //              }
    //              .date {
    //                  text-align: right;
    //                  margin-bottom: 20px;
    //                  font-size: 12px;
    //              }
    //              .group-section {
    //                  margin-bottom: 40px;
    //                  page-break-after: avoid;
    //              }
    //              .group-header {
    //                  background-color: #f3f4f6;
    //                  padding: 10px;
    //                  border: 1px solid #d1d5db;
    //                  border-bottom: 2px solid #1e40af;
    //                  margin-top: 20px;
    //              }
    //              .group-title {
    //                  font-size: 18px;
    //                  font-weight: bold;
    //                  color: #1e40af;
    //                  margin: 0;
    //              }
    //              .group-info {
    //                  font-size: 14px;
    //                  color: #6b7280;
    //                  margin: 5px 0 0 0;
    //              }
    //              .group-totals {
    //                  text-align: right;
    //                  font-size: 14px;
    //              }
    //              table {
    //                  width: 100%;
    //                  border-collapse: collapse;
    //                  margin-top: 10px;
    //              }
    //              th {
    //                  background-color: #374151;
    //                  color: white;
    //                  padding: 8px;
    //                  border: 1px solid #d1d5db;
    //                  text-align: center;
    //                  font-size: 12px;
    //              }
    //              td {
    //                  padding: 6px;
    //                  border: 1px solid #d1d5db;
    //                  font-size: 12px;
    //              }
    //              .text-left {
    //                  text-align: left;
    //              }
    //              .text-center {
    //                  text-align: center;
    //              }
    //              .text-right {
    //                  text-align: right;
    //              }
    //              .font-bold {
    //                  font-weight: bold;
    //              }
    //              .bg-gray-100 {
    //                  background-color: #f3f4f6;
    //              }
    //              .tfoot-row {
    //                  background-color: #f3f4f6;
    //                  font-weight: bold;
    //              }
    //              .page-break {
    //                  page-break-before: always;
    //              }
    //              @media print {
    //                  body {
    //                      margin: 0;
    //                      padding: 10px;
    //                  }
    //                  .group-section {
    //                      page-break-inside: avoid;
    //                  }
    //                  th {
    //                      background-color: #374151 !important;
    //                      color: white !important;
    //                      -webkit-print-color-adjust: exact;
    //                      print-color-adjust: exact;
    //                  }
    //                  .group-header {
    //                      -webkit-print-color-adjust: exact;
    //                      print-color-adjust: exact;
    //                  }
    //                  .tfoot-row {
    //                      -webkit-print-color-adjust: exact;
    //                      print-color-adjust: exact;
    //                  }
    //              }
    //          </style>
    //      </head>
    //      <body>
    //          <div class="header">
    //              <h1>Fee Class Wise Due List Report</h1>
    //              <p>Generated on: ${currentDate}</p>
    //          </div>
    //  `;

    //     // Loop through each group
    //     groupedReportData.forEach((group, groupIndex) => {
    //         const groupTotals = calculateGroupTotals(group.students);

    //         printContent += `
    //          <div class="group-section">
    //              <div class="group-header">
    //                  <div style="display: flex; justify-content: space-between; align-items: center;">
    //                      <div>
    //                          <div class="group-title">
    //                              Class: ${group.className}
    //                              ${group.sectionName !== 'No Section' ? ` - Division ${group.sectionName}` : ''}
    //                          </div>
    //                          <div class="group-info">
    //                              Total Students: ${group.students.length}
    //                          </div>
    //                      </div>
    //                      <div class="group-totals">
    //                          <div><strong>Group Total Due:</strong> ₹${groupTotals.totalDue.toLocaleString()}</div>
    //                          <div><strong>Fine:</strong> ₹${groupTotals.totalFine.toLocaleString()}</div>
    //                      </div>
    //                  </div>
    //              </div>

    //              <table>
    //                  <thead>
    //                      <tr>
    //                          <th class="text-center" width="50">Sl No</th>
    //                          <th class="text-left" width="100">Admission No</th>
    //                          <th class="text-left" width="150">Student Name</th>
    //                          <th class="text-left" width="120">Term</th>
    //                          <th class="text-right" width="130">Due amount till ${currentDate}</th>
    //                          <th class="text-right" width="130">Fine amount till ${currentDate}</th>
    //                          <th class="text-right" width="130">Total due amount</th>
    //                      </tr>
    //                  </thead>
    //                  <tbody>
    //      `;

    //         // Add student rows
    //         group.students.forEach((row, idx) => {
    //             printContent += `
    //                      <tr class="${idx % 2 === 0 ? '' : 'bg-gray-100'}">
    //                          <td class="text-center">${idx + 1}</td>
    //                          <td class="text-left">${row.amsT_AdmNo || '-'}</td>
    //                          <td class="text-left font-bold">${row.studentName || '-'}</td>
    //                          <td class="text-left">${row.fmT_Name || '-'}</td>
    //                          <td class="text-right">₹${(row.balance || 0).toLocaleString()}</td>
    //                          <td class="text-right">₹${(row.fine || 0).toLocaleString()}</td>
    //                          <td class="text-right font-bold">₹${(row.totalDue || 0).toLocaleString()}</td>
    //                      </tr>
    //          `;
    //         });

    //         // Add group totals row
    //         printContent += `
    //                  </tbody>
    //                  <tfoot>
    //                      <tr class="tfoot-row">
    //                          <td colspan="4" class="text-right font-bold">Group Total:</td>
    //                          <td class="text-right font-bold">₹${groupTotals.totalBalance.toLocaleString()}</td>
    //                          <td class="text-right font-bold">₹${groupTotals.totalFine.toLocaleString()}</td>
    //                          <td class="text-right font-bold">₹${groupTotals.totalDue.toLocaleString()}</td>
    //                      </tr>
    //                  </tfoot>
    //              </table>
    //          </div>
    //      `;

    //         // Add page break between groups (except after the last group)
    //         if (groupIndex < groupedReportData.length - 1) {
    //             printContent += `<div class="page-break"></div>`;
    //         }
    //     });

    //     printContent += `
    //      </body>
    //      </html>
    //  `;

    //     // Write to print window and print
    //     printWindow.document.write(printContent);
    //     printWindow.document.close();
    //     printWindow.focus();
    //     printWindow.print();
    // };
    return (
        <div className='min-h-screen bg-gray-50 py-8'>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
                <div className='mx-auto max-w-7xl'>
                    <Card className='border-0 shadow-xl'>
                        <div className='place-items-center p-8'>
                            <div className='space-y-8'>
                                <div className='flex items-center gap-12'>
                                    {/* Academic Year */}
                                    <div className='flex w-[420px] items-center gap-4'>
                                        <Label className='w-36 text-right'>
                                            Academic Year <span className='text-red-500'>*</span>
                                        </Label>

                                        <div className='flex-1'>
                                            <Controller
                                                name='academicYearId'
                                                control={control}
                                                render={({ field }) => (
                                                    <Select
                                                        value={field.value?.toString()}
                                                        onValueChange={(v) => field.onChange(Number(v))}>
                                                        <SelectTrigger className='w-full'>
                                                            <SelectValue placeholder='--Select Academic Year--' />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {loadingAcademic ? (
                                                                <SelectItem value='loading' disabled>
                                                                    Loading...
                                                                </SelectItem>
                                                            ) : (
                                                                academicYears?.map((item: any) => (
                                                                    <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                                        {item.asmaY_Year}
                                                                    </SelectItem>
                                                                ))
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                            {errors.academicYearId && <FormError>{errors.academicYearId.message}</FormError>}
                                        </div>
                                    </div>
                                </div>

                                <div className='flex w-[420px] items-center gap-4'>
                                    <Label className='w-36 text-right'>
                                        Receipt No <span className='text-red-500'>*</span>
                                    </Label>

                                    <div className='flex-1'>
                                        <Controller
                                            name='receiptId'
                                            control={control}
                                            render={({ field }) => (
                                                <Select value={field.value?.toString()} onValueChange={(v) => field.onChange(Number(v))}>
                                                    <SelectTrigger className='w-full'>
                                                        <SelectValue placeholder='--Select Receipt--' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {isFeeReceiptLoading ? (
                                                            <SelectItem value='loading' disabled>
                                                                Loading...
                                                            </SelectItem>
                                                        ) : (
                                                            feeReceiptData?.map((item: any) => (
                                                                <SelectItem key={item.fyP_Id} value={item.fyP_Id.toString()}>
                                                                    {item.fyP_Receipt_No}
                                                                </SelectItem>
                                                            ))
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.receiptId && <FormError>{errors.receiptId.message}</FormError>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                    <div className='mt-10'>
                        {loading ? (
                            <div className='flex min-h-[400px] items-center justify-center rounded-lg border bg-white shadow-xl'>
                                <div className='text-center'>
                                    <div className='mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent'></div>
                                    <p className='text-gray-500'>Loading receipt data...</p>
                                </div>
                            </div>
                        ) : (
                            studentDetails.length > 0 && (
                                <div ref={printRef}>
                                    <CollapsibleSection defaultOpen={true}>
                                        <div className='mt-10 rounded-lg border bg-white shadow-xl'>
                                            <div className='flex items-center justify-between border-b bg-primary/5 px-8 py-6'>
                                                <div className='mb-6 text-center'>
                                                    <h2 className='font-bold text-2xl text-primary'> Portal Fee Receipt</h2>
                                                </div>

                                                <div className='flex gap-2'>
                                                    <Button
                                                        size='sm'
                                                        //  onClick={handlePrint}
                                                        className='h-8 px-3 text-xs'
                                                    >
                                                        Print
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className='flex items-center gap-4 border-b pb-4'>
                                                <div className='text-center'>
                                                    {logodata && <img src={logodata} alt='Institute Logo' className='mx-auto' />}
                                                </div>
                                            </div>
                                            <h5 className='my-4 text-center font-bold'>FEE RECEIPT</h5>

                                            {/* Student Details Section */}
                                            <div className='mt-4 ml-10 text-sm'>
                                                <table className='w-full border-collapse'>
                                                    <tbody>
                                                        <tr>
                                                            <td className='w-1/5 py-1 align-top font-semibold'>Receipt No</td>
                                                            <td className='w-2/5 py-1 align-top'>
                                                                : {studentDetails[0]?.fyp_receipt_no || ''}
                                                            </td>
                                                            <td className='w-1/5 py-1 pl-8 align-top font-semibold'>Date</td>
                                                            <td className='w-2/5 py-1 align-top'>
                                                                :{' '}
                                                                {studentDetails[0]?.fyp_date
                                                                    ? new Date(studentDetails[0].fyp_date).toLocaleDateString()
                                                                    : ''}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className='py-1 align-top font-semibold'>Adm No</td>
                                                            <td className='py-1 align-top'>: {studentDetails[0]?.admno || ''}</td>
                                                            <td className='py-1 pl-8 align-top font-semibold'>Academic Year</td>
                                                            <td className='py-1 align-top'>: {''}</td>
                                                        </tr>
                                                        <tr>
                                                            <td className='py-1 align-top font-semibold'>Name</td>
                                                            <td className='py-1 align-top'>
                                                                : {studentDetails[0]?.amst_firstname || ''}{' '}
                                                                {studentDetails[0]?.amst_middlename || ''}
                                                                {studentDetails[0]?.amst_lastname || ''}
                                                            </td>
                                                            <td className='py-1 pl-8 align-top font-semibold'>Class/Sec</td>
                                                            <td className='py-1 align-top'>
                                                                : {studentDetails[0]?.classname || ''}/{' '}
                                                                {studentDetails[0]?.sectionname || ''}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className='py-1 align-top font-semibold'>Father</td>
                                                            <td className='py-1 align-top'>: {studentDetails[0]?.fathername || ''}</td>
                                                            <td className='py-1 pl-8 align-top font-semibold'>Type</td>
                                                            <td className='py-1 align-top'>: {''}</td>
                                                        </tr>
                                                        <tr>
                                                            <td className='py-1 align-top font-semibold'>Mother</td>
                                                            <td className='py-1 align-top'>: {studentDetails[0]?.mothername || ''}</td>
                                                            <td className='py-1 pl-8 align-top font-semibold'>Period</td>
                                                            <td className='py-1 align-top'>: {''}</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                            {/* Render all receipts */}
                                            <div className='border-b pb-8 last:border-b-0'>
                                                <div className='mx-auto max-w-6xl bg-white p-6 text-black '>
                                                    {/* Fee Rows Table */}
                                                    <table className='w-full border-collapse border text-xs'>
                                                        <thead className='bg-gray-100'>
                                                            <tr>
                                                                <th className='border p-1'>SL.NO</th>
                                                                <th className='border p-1'>Head Name</th>
                                                                <th className='border p-1'>Fee Name</th>
                                                                <th className='border p-1'>Paid Amount</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {studentDetails.map((row: any, index) => (
                                                                <tr key={index + 1}>
                                                                    <td className='border p-1 text-center'>{index + 1}</td>
                                                                    <td className='border p-1'>{row.fmh_feename}</td>

                                                                    <td className='border p-1 text-right'>
                                                                        ₹{row.fma_amount?.toLocaleString('en-IN') ?? '0'}
                                                                    </td>
                                                                    <td className='border p-1 text-right'>
                                                                        ₹{row.ftp_paid_amt?.toLocaleString('en-IN') ?? '0'}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                            {/* Total Row */}
                                                            <tr className='bg-gray-50 font-bold'>
                                                                <td className='border p-1 text-right' colSpan={2}>
                                                                    NET AMOUNT
                                                                </td>
                                                                <td className='border p-1 text-right'>
                                                                    ₹
                                                                    {studentDetails
                                                                        .reduce((sum: any, row: any) => sum + (row.fma_amount || 0), 0)
                                                                        .toLocaleString('en-IN')}
                                                                </td>
                                                                <td className='border p-1 text-right'>
                                                                    ₹
                                                                    {studentDetails
                                                                        .reduce((sum: any, row: any) => sum + (row.ftp_paid_amt || 0), 0)
                                                                        .toLocaleString('en-IN')}
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>

                                                    {/* Payment Rows Table */}
                                                    <h3 className='mt-6 font-bold text-sm'>CURRENT PAYMENT DETAIL</h3>
                                                    <table className='mt-2 w-full border-collapse border text-xs'>
                                                        <thead className='bg-gray-100'>
                                                            <tr>
                                                                <th className='border p-1'>SL.NO</th>
                                                                <th className='border p-1'>AMOUNT</th>
                                                                <th className='border p-1'>BANK</th>
                                                                <th className='border p-1'>DD.NO</th>
                                                                <th className='border p-1'>DATE</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {currentPaymentDetails.map((p: any, index) => (
                                                                <tr key={index + 1}>
                                                                    <td className='border p-1 text-center'>{index + 1}</td>
                                                                    <td className='border p-1 text-right'>
                                                                        ₹{p.ftP_Paid_Amt?.toLocaleString('en-IN') || '0'}
                                                                    </td>
                                                                    <td className='border p-1 text-center'>{p.fyP_Bank_Or_Cash ?? '-'}</td>
                                                                    <td className='border p-1 text-center'>{p.fyP_DD_Cheque_No ?? '-'}</td>
                                                                    <td className='border p-1 text-center'>
                                                                        {p.fyP_DD_Cheque_Date
                                                                            ? new Date(p.fyP_DD_Cheque_Date).toLocaleDateString()
                                                                            : ''}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                            {/* Payment Total */}
                                                            {/* <tr className='bg-gray-50 font-bold'>
                                                                            <td className='border p-1 text-center'>TOTAL</td>
                                                                            <td className='border p-1 text-right'>
                                                                                ₹{report.paymentRows.reduce((sum, p) => sum + (p.amount || 0), 0).toLocaleString('en-IN')}
                                                                            </td>
                                                                            <td className='border p-1 text-center' colSpan={3}>-</td>
                                                                        </tr> */}
                                                        </tbody>
                                                    </table>

                                                    {/* Footer Section */}
                                                    <div className='mt-4 text-sm'>
                                                        <p>
                                                            <b>Amount Received:</b> {numberToWords(currentPaymentDetails[0]?.ftP_Paid_Amt)}
                                                        </p>
                                                        <p>
                                                            <b>Note:</b> This receipt is valid subject to realisation of Cheque
                                                        </p>
                                                    </div>

                                                    <div className='mt-10 flex justify-end'>
                                                        <p className='border-t pt-2 text-sm'>AUTHORIZED SIGNATORY</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CollapsibleSection>
                                </div>
                            )
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}
