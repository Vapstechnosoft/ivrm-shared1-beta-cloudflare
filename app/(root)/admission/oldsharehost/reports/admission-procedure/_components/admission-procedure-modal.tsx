'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Printer, X } from 'lucide-react';
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';

interface AdmissionProcedureModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: any;
    logo: string;
}

export default function AdmissionProcedureModal({ isOpen, onClose, data, logo }: AdmissionProcedureModalProps) {
    const componentRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: componentRef
    });

    if (!data) return null;

    const student = data?.viewadmission?.[0] || (Array.isArray(data) ? data[0] : data) || {};
    const feestructure = data?.feestructure || [];

    const getTotalFee = () => {
        return (
            feestructure?.reduce((acc: number, fee: any) => {
                if (fee.FMH_FeeName !== 'TOTAL') {
                    return acc + (Number(fee.amount) || 0);
                }
                return acc;
            }, 0) || 0
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className='max-h-[90vh] max-w-4xl overflow-y-auto'>
                <DialogHeader className='flex flex-row items-center justify-between border-b pb-2'>
                    <DialogTitle>Admission Procedure Report</DialogTitle>
                    <div className='flex gap-2'>
                        <Button variant='outline' size='sm' onClick={handlePrint}>
                            <Printer className='mr-2 h-4 w-4' />
                            Print
                        </Button>
                        <Button variant='ghost' size='sm' onClick={onClose}>
                            <X className='h-4 w-4' />
                        </Button>
                    </div>
                </DialogHeader>

                <div ref={componentRef} className='admission-modal-print p-8 font-serif text-sm print:p-0 print:text-[12px]'>
                    <style
                        type='text/css'
                        dangerouslySetInnerHTML={{
                            __html: `
                        @media print {
                            @page { size: A4; margin: 8mm 12mm; }
                            body {
                                visibility: hidden !important;
                            }
                            .admission-modal-print,
                            .admission-modal-print * {
                                visibility: visible !important;
                            }
                            .admission-modal-print {
                                position: absolute !important;
                                left: 0 !important;
                                top: 0 !important;
                                width: 100% !important;
                                height: auto !important;
                                z-index: 99999 !important;
                                background: white !important;
                                color: black !important;
                                font-size: 10px !important;
                                line-height: 1.15 !important;
                            }
                            .admission-modal-print img {
                                height: 46px !important;
                                margin-bottom: 2px !important;
                            }
                            .admission-modal-print .student-header-row {
                                font-size: 11px !important;
                                margin-bottom: 4px !important;
                            }
                            .admission-modal-print .procedure-title {
                                font-size: 13px !important;
                                margin-top: 2px !important;
                                margin-bottom: 4px !important;
                            }
                            .admission-modal-print .main-container {
                                gap: 6px !important;
                            }
                            .admission-modal-print .fee-section {
                                gap: 2px !important;
                            }
                            .admission-modal-print .fee-section h4 {
                                font-size: 10.5px !important;
                            }
                            .admission-modal-print .fee-section p {
                                font-size: 9.5px !important;
                            }
                            .admission-modal-print table {
                                font-size: 9.5px !important;
                            }
                            .admission-modal-print th, 
                            .admission-modal-print td {
                                padding: 2px 4px !important;
                            }
                            .admission-modal-print .terms-section {
                                padding-top: 2px !important;
                                gap: 2px !important;
                            }
                            .admission-modal-print .terms-section h4 {
                                font-size: 10.5px !important;
                                margin-bottom: 1px !important;
                            }
                            .admission-modal-print .terms-section p,
                            .admission-modal-print .terms-section li {
                                font-size: 9.5px !important;
                                line-height: 1.2 !important;
                            }
                            .admission-modal-print .terms-section ul {
                                padding-left: 1.25rem !important;
                                gap: 2px !important;
                            }
                            .admission-modal-print .declaration-section {
                                padding-top: 2px !important;
                                gap: 4px !important;
                            }
                            .admission-modal-print .declaration-section h4 {
                                font-size: 10.5px !important;
                                margin-bottom: 1px !important;
                            }
                            .admission-modal-print .declaration-section p {
                                font-size: 9.5px !important;
                                margin-bottom: 2px !important;
                            }
                            .admission-modal-print .signature-fields {
                                padding-top: 2px !important;
                                gap: 4px !important;
                            }
                            .admission-modal-print .signature-fields div {
                                font-size: 9.5px !important;
                            }
                            .admission-modal-print .office-use-box {
                                padding: 6px !important;
                                gap: 4px !important;
                                margin-top: 6px !important;
                            }
                            .admission-modal-print .office-use-box p {
                                font-size: 9.5px !important;
                                margin-bottom: 2px !important;
                            }
                            .admission-modal-print .office-use-box div {
                                font-size: 9px !important;
                            }
                            .admission-modal-print .office-use-box .grid {
                                gap: 4px !important;
                            }
                        }
                    `
                        }}
                    />

                    <div className='main-container space-y-6'>
                        {/* Header */}
                        <div className='text-center'>
                            {logo && <img src={logo} alt='Logo' className='mx-auto mb-4 h-24 object-contain' />}
                        </div>

                        <div className='student-header-row flex justify-between font-bold text-base'>
                            <div>FULL NAME OF PUPIL: {student.StudentName}</div>
                            <div>{student.ASMCL_ClassName}</div>
                        </div>

                        <h3 className='procedure-title text-center font-bold text-xl uppercase tracking-wider underline'>
                            ADMISSION PROCEDURE
                        </h3>

                        {/* Fee Structure */}
                        <div className='fee-section space-y-2'>
                            <h4 className='font-bold'>FEE STRUCTURE (for new admission)</h4>
                            <p>The following is the fee structure for the academic year 2026-2027.</p>

                            <Table className='border border-black'>
                                <TableHeader>
                                    <TableRow className='border-black border-b bg-gray-50'>
                                        <TableHead className='w-16 border-black border-r font-bold text-black'>Sl No.</TableHead>
                                        <TableHead className='border-black border-r font-bold text-black'>Particulars</TableHead>
                                        <TableHead className='pr-8 text-right font-bold text-black'>Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {feestructure
                                        ?.filter((f: any) => f.FMH_FeeName !== 'TOTAL')
                                        .map((fee: any, idx: number) => (
                                            <TableRow key={idx} className='border-black border-b'>
                                                <TableCell className='border-black border-r text-center'>{idx + 1}</TableCell>
                                                <TableCell className='border-black border-r'>{fee.FMH_FeeName}</TableCell>
                                                <TableCell className='pr-8 text-right'>
                                                    Rs. {Number(fee.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}/-
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    <TableRow className='font-bold'>
                                        <TableCell colSpan={2} className='border-black border-r px-4 text-right'>
                                            Total Fee
                                        </TableCell>
                                        <TableCell className='pr-8 text-right'>
                                            Rs. {getTotalFee().toLocaleString('en-IN', { minimumFractionDigits: 2 })}/-
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>

                        {/* Terms */}
                        <div className='terms-section space-y-4 pt-4'>
                            <h4 className='text-center font-bold underline'>TERMS AND CONDITIONS</h4>
                            {student.ASMCL_Id !== 443 ? (
                                <>
                                    <p>Fees once paid will not be returned unless there is a valid reason for not admitting the child.</p>
                                    <ul className='list-disc space-y-2 pl-8'>
                                        <li>
                                            A processing fee of ₹2,000/- will be deducted from the fees and the balance will be returned, if
                                            the candidate is withdrawn within one week of procuring the admission. This should be done with
                                            a formal letter of request addressed to the Vice Principal’s office stating the reason.
                                        </li>
                                        <li>
                                            In case the child is withdrawn after one week and within one month of granting admission, the
                                            admission fee and the I term tuition fee will be deducted from the total fee amount and the
                                            balance amount will be refunded.
                                        </li>
                                        <li>
                                            In case the request for withdrawal of the child is after one month and within 45 days of
                                            granting admission, the candidate will forfeit 60% of the total fees paid.
                                        </li>
                                        <li>For all matters, the final decision rests with the school management.</li>
                                    </ul>
                                </>
                            ) : (
                                <ul className='list-disc pl-8'>
                                    <li>
                                        If under any circumstances the child has to be withdrawn a formal letter of request addressed to the
                                        Vice Principal stating the reason. <strong>There will be no refund</strong>
                                    </li>
                                </ul>
                            )}
                        </div>

                        {/* Declaration */}
                        <div className='declaration-section space-y-8 pt-4'>
                            <h4 className='text-center font-bold uppercase underline'>DECLARATION</h4>
                            <p className='font-bold'>
                                I have read the above contents and agree to abide by the conditions stipulated by the management.
                            </p>

                            <div className='signature-fields space-y-6 pt-4'>
                                <div className='flex items-center justify-between'>
                                    <div className='w-1/2'>
                                        Name of Father: <strong>{student.FatherName}</strong>
                                    </div>
                                    <div className='flex w-1/2 items-center'>
                                        Signature: <span className='ml-2 h-4 flex-1 border-black border-b'></span>
                                    </div>
                                </div>
                                <div className='flex items-center justify-between'>
                                    <div className='w-1/2'>
                                        Name of Mother: <strong>{student.MotherName}</strong>
                                    </div>
                                    <div className='flex w-1/2 items-center'>
                                        Signature: <span className='ml-2 h-4 flex-1 border-black border-b'></span>
                                    </div>
                                </div>
                            </div>

                            <p className='pt-4'>Date: ____________</p>

                            {/* Office Use Section */}
                            <div className='office-use-box space-y-8 border border-black p-4'>
                                <p className='font-bold underline'>For office use:</p>

                                <div className='grid grid-cols-3 gap-4'>
                                    <div>
                                        Admission No: <strong>{student.AMST_AdmNo}</strong>
                                    </div>
                                    <div>Application No: ____________</div>
                                    <div className='text-center'>
                                        Vice Principal
                                        <div className='mx-4 mt-4 border-black border-b'></div>
                                    </div>
                                </div>

                                <div className='grid grid-cols-2 gap-8'>
                                    <div>
                                        Finance Dept: <span className='ml-2 inline-block w-48 border-black border-b'></span>
                                    </div>
                                    <div className='pr-8 text-right'>
                                        Principal: <span className='ml-2 inline-block w-48 border-black border-b'></span>
                                    </div>
                                </div>

                                <div className='flex items-end justify-between pb-4'>
                                    <div>
                                        Date: <span className='ml-2 inline-block w-48 border-black border-b'></span>
                                    </div>
                                    <div className='pr-8'>School Seal:</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className='print:hidden'>
                    <Button variant='destructive' onClick={onClose}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
