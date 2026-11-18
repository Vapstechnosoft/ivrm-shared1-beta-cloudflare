'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AdvancePaymentDetailsProps {
    isOpen: boolean;
    onClose: () => void;
    studentName?: string;
    admissionNo?: string;
}

interface AdvanceFeeRecord {
    slNo: number;
    feeHead: string;
    advanceAmount: number;
}

interface AdvancePaymentHistory {
    slNo: number;
    studentName: string;
    admissionNo: string;
    receiptNo: string;
    paidDate: string;
    advanceAmount: number;
}

export default function AdvancePaymentDetails({ isOpen, onClose, studentName = '', admissionNo = '' }: AdvancePaymentDetailsProps) {
    const [bankName, setBankName] = useState('');
    const [chequeDate, setChequeDate] = useState('');
    const [chequeNo, setChequeNo] = useState('');
    const [selectAll, setSelectAll] = useState(false);
    const [selectedHeads, setSelectedHeads] = useState<Record<number, boolean>>({});
    const [currentCharges, setCurrentCharges] = useState<{
        [key: number]: string;
    }>({});
    const [advanceFeeRecords, setAdvanceFeeRecords] = useState<AdvanceFeeRecord[]>([
        { slNo: 1, feeHead: 'CBSE TUITION FEES', advanceAmount: 0 }
    ]);
    const [paymentHistory, setPaymentHistory] = useState<AdvancePaymentHistory[]>([
        {
            slNo: 1,
            studentName: 'ASBAH KUNJI',
            admissionNo: '257/2019-20',
            receiptNo: 'ADV/16/2025-2026',
            paidDate: '05/04/2026',
            advanceAmount: 5000
        }
    ]);
    const handleSelectAll = (checked: boolean) => {
        setSelectAll(checked);
        const newState: Record<number, boolean> = {};
        advanceFeeRecords.forEach((f) => {
            newState[f.slNo] = checked;
        });

        setSelectedHeads(newState);
    };
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    useEffect(() => {
        if (!isOpen) {
            setBankName('');
            setChequeDate('');
            setChequeNo('');
        }
    }, [isOpen]);

    const handleSave = () => {
        console.log('Saving advance payment:', {
            bankName,
            chequeDate,
            chequeNo,
            advanceFeeRecords
        });
        // Add your save logic here
        onClose();
    };

    const handleCancel = () => {
        setBankName('');
        setChequeDate('');
        setChequeNo('');
        onClose();
    };

    const handleEdit = (record: AdvancePaymentHistory) => {
        console.log('Editing record:', record);
        // Add edit logic here
    };

    const handleAdvanceAmountChange = (index: number, value: string) => {
        const updatedRecords = [...advanceFeeRecords];
        updatedRecords[index].advanceAmount = Number.parseFloat(value) || 0;
        setAdvanceFeeRecords(updatedRecords);
    };

    const formatDate = (dateString: string) => {
        return dateString;
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };
    const toggleRow = (id: number, checked: boolean) => {
        setSelectedHeads((prev) => {
            const updated = { ...prev, [id]: checked };
            if (!checked) {
                setSelectAll(false);
            } else {
                const allChecked = advanceFeeRecords.every((item) => updated[item.slNo]);
                setSelectAll(allChecked);
            }

            return updated;
        });
    };

    if (!isOpen) return null;

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
            <div className='relative flex h-auto max-h-[90vh] w-full max-w-4xl flex-col rounded-lg bg-white shadow-xl'>
                <div className='flex items-center justify-between rounded-t-lg bg-primary px-4 py-3 text-white'>
                    <h2 className='font-semibold text-lg'>ADVANCE FEE DETAILS</h2>
                    <button
                        type='button'
                        onClick={onClose}
                        className='rounded-full p-1 transition-colors hover:bg-white/20'
                        aria-label='Close modal'>
                        <X size={24} />
                    </button>
                </div>

                <div className='flex-1 space-y-6 overflow-auto p-6'>
                    <div>
                        <h3 className='mb-3 font-semibold text-gray-800 text-md'>ADVANCE FEE DETAILS</h3>
                        <div className='overflow-x-auto rounded-lg border border-gray-200'>
                            <table className='w-full'>
                                <thead className='bg-gray-50'>
                                    <tr>
                                        <th className='w-16 px-4 py-2 text-left font-medium text-gray-500 text-xs uppercase'>SL.No</th>
                                        <th className='w-12 px-4 py-2 text-left font-medium text-gray-500 text-xs uppercase'>
                                            <Checkbox checked={selectAll} onCheckedChange={(val) => handleSelectAll(val === true)} />
                                        </th>
                                        <th className='px-4 py-2 text-left font-medium text-gray-500 text-xs uppercase'>Fee Head</th>
                                        <th className='w-40 px-4 py-2 text-left font-medium text-gray-500 text-xs uppercase'>
                                            Advance Amount
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-gray-200'>
                                    {advanceFeeRecords.map((record) => (
                                        <tr key={record.slNo}>
                                            <td className='px-4 py-2 text-gray-900 text-sm'>{record.slNo}</td>
                                            <td className='px-4 py-2 text-gray-900 text-sm'>
                                                <Checkbox
                                                    checked={selectedHeads[record.slNo] || false}
                                                    onCheckedChange={(val) => toggleRow(record.slNo, val === true)}
                                                />
                                            </td>
                                            <td className='px-4 py-2 text-gray-900 text-sm'>{record.feeHead}</td>
                                            <td className='px-4 py-2'>
                                                <input
                                                    type='number'
                                                    value={currentCharges[record.slNo] ?? record.advanceAmount ?? ''}
                                                    disabled
                                                    onChange={(e) => {
                                                        const v = e.target.value;
                                                        if (v === '') {
                                                            setCurrentCharges((prev) => ({
                                                                ...prev,
                                                                [record.slNo]: ''
                                                            }));
                                                            return;
                                                        }
                                                        if (/^\d*\.?\d*$/.test(v)) {
                                                            setCurrentCharges((prev) => ({
                                                                ...prev,
                                                                [record.slNo]: v
                                                            }));
                                                        }
                                                    }}
                                                    className='w-full rounded border px-2 py-1 font-semibold text-sm disabled:cursor-not-allowed disabled:bg-gray-20'
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Bank Details Section */}
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                        <div>
                            {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
                            <label className='mb-1 block font-medium text-gray-700 text-sm'>Bank Name:</label>
                            <select
                                value={bankName}
                                onChange={(e) => setBankName(e.target.value)}
                                className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'>
                                <option value=''>- Select -</option>
                                <option value='SBI'>State Bank of India</option>
                                <option value='HDFC'>HDFC Bank</option>
                                <option value='ICICI'>ICICI Bank</option>
                                <option value='AXIS'>AXIS Bank</option>
                            </select>
                        </div>
                        <div>
                            {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
                            <label className='mb-1 block font-medium text-gray-700 text-sm'>Cheque Date:</label>
                            <input
                                type='date'
                                value={chequeDate}
                                onChange={(e) => setChequeDate(e.target.value)}
                                className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
                            />
                        </div>
                        <div>
                            {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
                            <label className='mb-1 block font-medium text-gray-700 text-sm'>Cheque No.:</label>
                            <input
                                type='text'
                                value={chequeNo}
                                onChange={(e) => setChequeNo(e.target.value)}
                                className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
                                placeholder='Enter cheque number'
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className='flex justify-end gap-3'>
                        <Button onClick={handleSave} className='bg-primary hover:bg-primary/90'>
                            SAVE
                        </Button>
                        <Button variant='outline' onClick={handleCancel}>
                            CANCEL
                        </Button>
                    </div>

                    {/* Payment History Section */}
                    <div>
                        <h3 className='mb-3 font-semibold text-gray-800 text-md'>ADVANCE FEE DETAILS</h3>
                        <div className='overflow-x-auto rounded-lg border border-gray-200'>
                            <table className='w-full'>
                                <thead className='bg-gray-50'>
                                    <tr>
                                        <th className='px-4 py-2 text-left font-medium text-gray-500 text-xs uppercase'>SL.No</th>
                                        <th className='px-4 py-2 text-left font-medium text-gray-500 text-xs uppercase'>Student Name</th>
                                        <th className='px-4 py-2 text-left font-medium text-gray-500 text-xs uppercase'>Admission No</th>
                                        <th className='px-4 py-2 text-left font-medium text-gray-500 text-xs uppercase'>Receipt No</th>
                                        <th className='px-4 py-2 text-left font-medium text-gray-500 text-xs uppercase'>Paid Date</th>
                                        <th className='px-4 py-2 text-left font-medium text-gray-500 text-xs uppercase'>Advance Amount</th>
                                        <th className='px-4 py-2 text-left font-medium text-gray-500 text-xs uppercase'>Action</th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-gray-200'>
                                    {paymentHistory.map((record) => (
                                        <tr key={record.slNo}>
                                            <td className='px-4 py-2 text-gray-900 text-sm'>{record.slNo}</td>
                                            <td className='px-4 py-2 text-gray-900 text-sm'>{record.studentName}</td>
                                            <td className='px-4 py-2 text-gray-900 text-sm'>{record.admissionNo}</td>
                                            <td className='px-4 py-2 text-gray-900 text-sm'>{record.receiptNo}</td>
                                            <td className='px-4 py-2 text-gray-900 text-sm'>{formatDate(record.paidDate)}</td>
                                            <td className='px-4 py-2 font-medium text-gray-900 text-sm'>
                                                {formatCurrency(record.advanceAmount)}
                                            </td>
                                            <td className='px-4 py-2'>
                                                <Button
                                                    variant='ghost'
                                                    size='sm'
                                                    onClick={() => handleEdit(record)}
                                                    className='text-primary hover:text-primary/80'>
                                                    Edit
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {paymentHistory.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className='px-4 py-8 text-center text-gray-500'>
                                                No advance payment records found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className='rounded-b-lg border-gray-200 border-t bg-gray-50 p-3'>
                    <div className='flex items-center justify-between text-gray-500 text-xs'>
                        <span>Search</span>
                        <div className='flex gap-2'>
                            <span>ENG</span>
                            <span>IN</span>
                            <span>17:31</span>
                            <span>27-04-2026</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
