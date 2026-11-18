'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, Download, X, Building2, User, CreditCard, Calendar, FileText } from 'lucide-react';
import type { IHutchingsBankChallanItem } from '@/types/fees/reports/hutchings_bank_challan';

interface ChallanViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    challan: IHutchingsBankChallanItem | null;
}

export function ChallanViewModal({ isOpen, onClose, challan }: ChallanViewModalProps) {
    if (!challan) return null;

    const handlePrintChallan = () => {
        const printContent = document.getElementById('printable-challan-slip');
        if (!printContent) return;

        const printWindow = window.open('', '', 'width=900,height=700');
        if (!printWindow) return;

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Bank Challan - ${challan.challanNo}</title>
                <style>
                    body { font-family: 'Arial', sans-serif; padding: 25px; color: #111; }
                    .challan-box { border: 2px solid #000; padding: 20px; border-radius: 8px; }
                    .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 16px; }
                    .header h2 { margin: 0; font-size: 20px; text-transform: uppercase; color: #0f172a; }
                    .header p { margin: 4px 0 0 0; font-size: 12px; color: #475569; }
                    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px; margin-bottom: 20px; }
                    .info-item { display: flex; }
                    .label { font-weight: bold; width: 130px; }
                    .val { flex: 1; }
                    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                    th, td { border: 1px solid #000; padding: 8px; font-size: 13px; text-align: left; }
                    th { background-color: #f1f5f9; text-transform: uppercase; }
                    .footer-notes { margin-top: 25px; font-size: 11px; color: #64748b; border-top: 1px dashed #94a3b8; padding-top: 10px; }
                    .signatures { display: flex; justify-content: space-between; margin-top: 40px; font-weight: bold; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="challan-box">
                    <div class="header">
                        <h2>HUTCHINGS HIGH SCHOOL & JUNIOR COLLEGE</h2>
                        <p>7, Phayre Road, Pune - 411040 | Tel: 020-26352764</p>
                        <p style="font-weight: bold; margin-top: 8px; text-decoration: underline;">STUDENT BANK CHALLAN</p>
                    </div>
                    <div class="info-grid">
                        <div class="info-item"><span class="label">Challan No:</span><span class="val">${challan.challanNo}</span></div>
                        <div class="info-item"><span class="label">Date:</span><span class="val">${challan.downloadDate}</span></div>
                        <div class="info-item"><span class="label">Student Name:</span><span class="val">${challan.studentName}</span></div>
                        <div class="info-item"><span class="label">Adm No:</span><span class="val">${challan.admNo}</span></div>
                        <div class="info-item"><span class="label">Class / Section:</span><span class="val">${challan.className} - ${challan.sectionName}</span></div>
                        <div class="info-item"><span class="label">Academic Year:</span><span class="val">2025-2026</span></div>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Sl No.</th>
                                <th>Description / Fee Head</th>
                                <th style="text-align: right;">Amount (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>1</td>
                                <td>Tuition & Term Fees (${challan.className})</td>
                                <td style="text-align: right;">${(challan.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            </tr>
                            <tr style="font-weight: bold; background-color: #f8fafc;">
                                <td colspan="2" style="text-align: right;">TOTAL PAYABLE:</td>
                                <td style="text-align: right;">₹ ${(challan.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div class="signatures">
                        <div>Depositor Signature</div>
                        <div>Bank Cashier Stamp & Sign</div>
                        <div>Authorised Signatory</div>
                    </div>
                    <div class="footer-notes">
                        * Note: Please retain this bank copy receipt for future reference. Fees once paid are non-refundable.
                    </div>
                </div>
            </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
        }, 250);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl bg-white p-6 shadow-2xl rounded-2xl border border-gray-200">
                <DialogHeader className="border-b pb-4 flex flex-row items-center justify-between">
                    <div>
                        <DialogTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <FileText className="h-5 w-5 text-sky-600" /> Bank Challan Details
                        </DialogTitle>
                        <p className="text-xs text-slate-500 mt-1">Hutchings High School & Junior College Fee Challan</p>
                    </div>
                </DialogHeader>

                <div id="printable-challan-slip" className="space-y-6 py-4">
                    {/* Bank & School Banner */}
                    <div className="bg-slate-900 text-white p-4 rounded-xl shadow-inner flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-base tracking-wide text-sky-400">HUTCHINGS HIGH SCHOOL & JUNIOR COLLEGE</h3>
                            <p className="text-xs text-slate-300">Bank Copy Challan Slip</p>
                        </div>
                        <div className="text-right">
                            <span className="bg-sky-500/20 text-sky-300 border border-sky-400/30 px-3 py-1 rounded-full text-xs font-mono font-bold">
                                {challan.challanNo}
                            </span>
                        </div>
                    </div>

                    {/* Student Info Grid */}
                    <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm">
                        <div className="space-y-2">
                            <div className="flex items-center text-slate-600 gap-2">
                                <User className="h-4 w-4 text-sky-600" />
                                <span className="font-medium text-slate-500">Student Name:</span>
                                <span className="font-semibold text-slate-900">{challan.studentName}</span>
                            </div>
                            <div className="flex items-center text-slate-600 gap-2">
                                <CreditCard className="h-4 w-4 text-sky-600" />
                                <span className="font-medium text-slate-500">Adm No:</span>
                                <span className="font-semibold text-slate-900">{challan.admNo}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center text-slate-600 gap-2">
                                <Building2 className="h-4 w-4 text-sky-600" />
                                <span className="font-medium text-slate-500">Class / Section:</span>
                                <span className="font-semibold text-slate-900">{challan.className} - {challan.sectionName}</span>
                            </div>
                            <div className="flex items-center text-slate-600 gap-2">
                                <Calendar className="h-4 w-4 text-sky-600" />
                                <span className="font-medium text-slate-500">Download Date:</span>
                                <span className="font-semibold text-slate-900">{challan.downloadDate}</span>
                            </div>
                        </div>
                    </div>

                    {/* Amount Table */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead className="bg-slate-100 text-slate-700 font-semibold border-b">
                                <tr>
                                    <th className="p-3">Particulars</th>
                                    <th className="p-3 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                <tr>
                                    <td className="p-3 text-slate-700">Fee Challan Amount Payable</td>
                                    <td className="p-3 text-right font-semibold text-slate-900">
                                        ₹ {(challan.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </td>
                                </tr>
                                <tr className="bg-sky-50 font-bold text-sky-950">
                                    <td className="p-3 text-right">Total Net Payable:</td>
                                    <td className="p-3 text-right text-lg text-sky-700">
                                        ₹ {(challan.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <DialogFooter className="border-t pt-4 flex gap-3 justify-end">
                    <Button variant="outline" onClick={onClose} className="rounded-lg">
                        <X className="h-4 w-4 mr-2" /> Close
                    </Button>
                    <Button onClick={handlePrintChallan} className="bg-sky-600 hover:bg-sky-700 text-white rounded-lg shadow-md">
                        <Printer className="h-4 w-4 mr-2" /> Print Challan
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
