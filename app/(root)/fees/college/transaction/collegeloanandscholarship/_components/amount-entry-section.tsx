'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { InputText } from '@/components/ui/extension/input-text';
import { useCollegeLoanSavedRecords } from '@/hooks/fees/college/useCollegeLoanAndScholarship';
import { saveCollegeLoanAndScholarship } from '@/server/fees/college/transaction/collegeloanandscholarship';
import type { IClgStudentItem } from '@/types/fees/college/transaction/collegeloanandscholarship';
import { RotateCcw, Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface AmountEntrySectionProps {
    students: IClgStudentItem[];
    batchId: number;
    batchName: string;
    onClose: () => void;
    onSaved: () => void;
}

interface StudentRowState {
    amcsT_Id: number;
    studentName: string;
    amcsT_AdmNo: string;
    courseBranchSem: string;
    applicableFee: number;
    loanAmount: number;
    scholarshipAmount: number;
    remarks: string;
}

export default function CollegeLoanAmountEntrySection({
    students,
    batchId,
    batchName,
    onClose,
    onSaved
}: AmountEntrySectionProps) {
    const { refetchAll } = useCollegeLoanSavedRecords(batchId);
    const [rows, setRows] = useState<StudentRowState[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const initialRows: StudentRowState[] = students.map((st) => ({
            amcsT_Id: st.amcsT_Id,
            studentName: st.studentName,
            amcsT_AdmNo: st.amcsT_AdmNo,
            courseBranchSem: `${st.amcO_CourseName} - ${st.amB_BranchName} (${st.amsE_SEMName})`,
            applicableFee: st.applicableFee || 85000,
            loanAmount: st.existingLoanAmount ?? 0,
            scholarshipAmount: st.existingScholarshipAmount ?? 0,
            remarks: ''
        }));
        setRows(initialRows);
    }, [students]);

    const handleAmountChange = (
        amcsT_Id: number,
        field: 'loanAmount' | 'scholarshipAmount' | 'remarks',
        val: any
    ) => {
        setRows((prev) =>
            prev.map((r) => {
                if (r.amcsT_Id === amcsT_Id) {
                    if (field === 'remarks') {
                        return { ...r, remarks: val };
                    }
                    const numVal = Math.max(0, Number(val) || 0);
                    return { ...r, [field]: numVal };
                }
                return r;
            })
        );
    };

    const handleSave = async () => {
        // Validation requirements from BRD Section 16 & Business Rules
        for (const row of rows) {
            if (row.loanAmount < 0 || row.scholarshipAmount < 0) {
                toast.error(`Negative amount is not permitted for ${row.studentName}.`);
                return;
            }
            const totalDeduction = row.loanAmount + row.scholarshipAmount;
            if (totalDeduction > row.applicableFee) {
                toast.error(
                    `Loan & Scholarship total (₹${totalDeduction.toLocaleString('en-IN')}) for ${row.studentName} exceeds applicable fee limit (₹${row.applicableFee.toLocaleString('en-IN')}).`
                );
                return;
            }
        }

        const activeRows = rows.filter((r) => r.loanAmount > 0 || r.scholarshipAmount > 0);
        if (activeRows.length === 0) {
            toast.error('Please enter at least one Loan or Scholarship amount before saving.');
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                acmB_Id: batchId,
                studentEntries: rows.map((r) => ({
                    amcsT_Id: r.amcsT_Id,
                    loanAmount: r.loanAmount,
                    scholarshipAmount: r.scholarshipAmount,
                    remarks: r.remarks
                }))
            };

            const res = await saveCollegeLoanAndScholarship(payload);
            if (res?.success) {
                toast.success(res.message || 'Loan and Scholarship amounts saved successfully.');
                await refetchAll();
                onSaved();
            } else {
                toast.error(res?.message || 'Failed to save amounts.');
            }
        } catch (err: any) {
            console.error('Error saving loan/scholarship amounts:', err);
            toast.error(err.message || 'Error occurred while saving amounts.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Totals calculation across all rows
    const totalApplicable = rows.reduce((s, r) => s + r.applicableFee, 0);
    const totalLoan = rows.reduce((s, r) => s + r.loanAmount, 0);
    const totalScholarship = rows.reduce((s, r) => s + r.scholarshipAmount, 0);
    const totalDeductions = totalLoan + totalScholarship;
    const totalNetPayable = totalApplicable - totalDeductions;

    return (
        <Card className='p-5 shadow-lg border-2 border-primary/20 bg-white space-y-4 rounded-2xl animate-in slide-in-from-top-4 duration-300'>
            {/* Header */}
            <div className='flex items-center justify-between border-b pb-3'>
                <div>
                    <h3 className='font-bold text-base text-gray-900 uppercase tracking-wide flex items-center gap-2'>
                        <span>Loan From Institution & Scholarship Amount Entry</span>
                        <span className='text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 normal-case'>
                            Batch: {batchName} ({rows.length} {rows.length === 1 ? 'Student' : 'Students'} Selected)
                        </span>
                    </h3>
                    <p className='text-xs text-muted-foreground mt-0.5'>
                        Enter approved institutional loan and scholarship amounts against eligible student fee accounts.
                    </p>
                </div>
                <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={onClose}
                    className='h-8 w-8 p-0 rounded-full hover:bg-gray-100'>
                    <X className='h-4 w-4 text-gray-500' />
                </Button>
            </div>

            {/* Entry Table */}
            <div className='overflow-x-auto rounded-xl border border-gray-200'>
                <table className='w-full border-collapse text-xs text-left'>
                    <thead>
                        <tr className='bg-gray-100 font-semibold text-gray-700 border-b'>
                            <th className='p-2.5 text-center w-12'>Sl.No</th>
                            <th className='p-2.5'>Student Name</th>
                            <th className='p-2.5'>Adm No.</th>
                            <th className='p-2.5'>Course / Branch / Sem</th>
                            <th className='p-2.5 text-right'>Applicable Fee (₹)</th>
                            <th className='p-2.5 text-right w-44'>Loan From Institution (₹)</th>
                            <th className='p-2.5 text-right w-44'>Scholarship Amount (₹)</th>
                            <th className='p-2.5 text-right'>Total Deduction (₹)</th>
                            <th className='p-2.5 text-right'>Net Balance (₹)</th>
                            <th className='p-2.5 w-48'>Remarks</th>
                        </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-200'>
                        {rows.map((row, idx) => {
                            const deduction = row.loanAmount + row.scholarshipAmount;
                            const net = row.applicableFee - deduction;
                            const isExceeded = deduction > row.applicableFee;

                            return (
                                <tr key={row.amcsT_Id} className='hover:bg-blue-50/30 transition-colors'>
                                    <td className='p-2.5 text-center font-medium text-gray-500'>{idx + 1}</td>
                                    <td className='p-2.5 font-bold uppercase text-gray-900'>{row.studentName}</td>
                                    <td className='p-2.5 font-mono text-xs text-gray-600'>{row.amcsT_AdmNo}</td>
                                    <td className='p-2.5 text-gray-700'>{row.courseBranchSem}</td>
                                    <td className='p-2.5 text-right font-medium text-gray-700'>
                                        ₹{row.applicableFee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className='p-2.5 text-right'>
                                        <InputText
                                            type='number'
                                            min={0}
                                            value={row.loanAmount}
                                            onChange={(e) =>
                                                handleAmountChange(row.amcsT_Id, 'loanAmount', e.target.value)
                                            }
                                            className='text-right h-8 text-xs font-semibold text-indigo-800'
                                        />
                                    </td>
                                    <td className='p-2.5 text-right'>
                                        <InputText
                                            type='number'
                                            min={0}
                                            value={row.scholarshipAmount}
                                            onChange={(e) =>
                                                handleAmountChange(row.amcsT_Id, 'scholarshipAmount', e.target.value)
                                            }
                                            className='text-right h-8 text-xs font-semibold text-amber-800'
                                        />
                                    </td>
                                    <td
                                        className={`p-2.5 text-right font-bold ${
                                            isExceeded ? 'text-rose-600' : 'text-emerald-700'
                                        }`}>
                                        ₹{deduction.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className='p-2.5 text-right font-medium text-gray-800'>
                                        ₹{net.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className='p-2.5'>
                                        <InputText
                                            type='text'
                                            placeholder='Add remarks...'
                                            value={row.remarks}
                                            onChange={(e) =>
                                                handleAmountChange(row.amcsT_Id, 'remarks', e.target.value)
                                            }
                                            className='h-8 text-xs'
                                        />
                                    </td>
                                </tr>
                            );
                        })}

                        {/* Grand Totals Summary Row */}
                        <tr className='bg-slate-50 font-bold border-t-2 border-slate-300'>
                            <td colSpan={4} className='p-2.5 text-right uppercase text-gray-700'>
                                Grand Total:
                            </td>
                            <td className='p-2.5 text-right text-gray-800'>
                                ₹{totalApplicable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                            <td className='p-2.5 text-right text-indigo-900 font-bold'>
                                ₹{totalLoan.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                            <td className='p-2.5 text-right text-amber-900 font-bold'>
                                ₹{totalScholarship.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                            <td className='p-2.5 text-right text-emerald-900 font-bold text-sm'>
                                ₹{totalDeductions.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                            <td className='p-2.5 text-right text-gray-900 font-bold'>
                                ₹{totalNetPayable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                            <td className='p-2.5'></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Action Buttons: SAVE & CLOSE */}
            <div className='flex items-center justify-end gap-3 pt-2 border-t'>
                <Button
                    type='button'
                    variant='outline'
                    onClick={onClose}
                    disabled={isSubmitting}
                    className='px-6 flex items-center gap-1.5'>
                    <RotateCcw className='h-4 w-4' /> Cancel
                </Button>
                <Button
                    type='button'
                    onClick={handleSave}
                    disabled={isSubmitting}
                    className='px-8 bg-primary text-white hover:bg-primary/90 flex items-center gap-1.5 shadow-sm'>
                    <Save className='h-4 w-4' /> {isSubmitting ? 'Saving Amounts...' : 'Save Amount Entries'}
                </Button>
            </div>
        </Card>
    );
}
