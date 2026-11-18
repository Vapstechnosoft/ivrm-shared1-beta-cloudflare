'use client';

import { FileSpreadsheet, Printer } from 'lucide-react';
import { useRef } from 'react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ReportTableProps {
    reportData: any[];
    enteredName: string;
    formattedDate: string;
    academicYearLabel: string;
    monthLabel: string;
    logoPath: string;
}

export default function ReportTable({ reportData, enteredName, formattedDate, academicYearLabel, monthLabel, logoPath }: ReportTableProps) {
    const printRef = useRef<HTMLDivElement>(null);

    const handleExport = () => {
        if (reportData.length === 0) {
            toast.error('No data to export');
            return;
        }

        const header = [
            [`TIME TABLE ${monthLabel.toUpperCase()} MONTH REPORT`],
            [],
            ['Name :', enteredName || '—', 'Date :', formattedDate],
            ['Designation :', 'Implementation Engineer', 'Academic Year :', academicYearLabel],
            []
        ];

        const tableHeader = ['SL.NO', 'Class', 'WorkLoad', 'SMS', 'Email'];
        const tableRows = reportData.map((item: any, idx: number) => [
            idx + 1,
            item.ClassName || '',
            item.Total_Workload || 0,
            item.count || 0,
            item.count || 0
        ]);

        const footer = [
            [],
            ['Implementation Engineer: _______________', 'Nodal Officer: _______________'],
            ['End User: _______________', 'Seal']
        ];

        const ws = XLSX.utils.aoa_to_sheet([...header, tableHeader, ...tableRows, ...footer]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'TT Month End Report');
        XLSX.writeFile(wb, `TT_Month_End_Report_${formattedDate.replace(/ /g, '_')}.xlsx`);
    };

    const handlePrint = () => {
        if (!printRef.current) return;
        const htmlContent = printRef.current.innerHTML;

        const printWindow = window.open('', '_blank', 'width=1200,height=800');
        if (!printWindow) {
            toast.error('Popups are blocked. Please enable popups to print.');
            return;
        }

        printWindow.document.open();
        printWindow.document.write(`
            <html>
                <head>
                    <title>Time Table Month End Report</title>
                    <style>
                        @page {
                            size: A4 portrait;
                            margin: 15mm;
                        }
                        body {
                            margin: 0;
                            padding: 0;
                            background: white;
                            font-family: 'Helvetica Neue', Arial, sans-serif;
                            color: #333;
                            font-size: 13px;
                        }
                        .print-container {
                            width: 100%;
                            box-sizing: border-box;
                        }
                        h2, h3 {
                            text-align: center;
                            margin: 5px 0;
                        }
                        .text-center {
                            text-align: center;
                        }
                        .logo-container {
                            text-align: center;
                            margin-bottom: 15px;
                        }
                        .logo-container img {
                            max-height: 80px;
                            display: inline-block;
                        }
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-top: 15px;
                            margin-bottom: 20px;
                        }
                        th, td {
                            border: 1px solid #ccc;
                            padding: 8px;
                            text-align: center;
                        }
                        th {
                            background-color: #f5f5f5;
                            font-weight: bold;
                        }
                        .info-table td {
                            text-align: left;
                            border: none;
                            padding: 6px;
                        }
                        .info-table {
                            border: none;
                            width: 100%;
                            margin-top: 10px;
                            margin-bottom: 20px;
                        }
                        .signature-table {
                            width: 100%;
                            border: none;
                            margin-top: 50px;
                        }
                        .signature-table td {
                            border: none;
                            width: 50%;
                            padding: 15px 0;
                            text-align: left;
                        }
                        .no-print {
                            display: none !important;
                        }
                    </style>
                </head>
                <body>
                    <div class="print-container">
                        ${htmlContent}
                    </div>
                    <script>
                        window.onload = function() {
                            window.focus();
                            window.print();
                            window.close();
                        };
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <div className='fade-in slide-in-from-top-4 animate-in space-y-4 duration-500'>
            <div className='flex justify-end gap-2 px-2'>
                <Button size='sm' onClick={handleExport} className='flex items-center gap-1.5'>
                    <FileSpreadsheet className='h-4 w-4' />
                    Export to Excel
                </Button>
                <Button size='sm' variant='outline' onClick={handlePrint} className='flex items-center gap-1.5'>
                    <Printer className='h-4 w-4' />
                    Print
                </Button>
            </div>

            <Card className='border border-gray-100 bg-white p-6 shadow-xl'>
                {/* Printable Area Wrapper */}
                <div ref={printRef} className='p-4 text-sm'>
                    {/* Logo */}
                    {logoPath && (
                        <div className='logo-container mb-4 flex justify-center'>
                            <img src={logoPath} alt='Institute Logo' className='max-h-20 object-contain' />
                        </div>
                    )}

                    <h3 className='text-center font-bold text-gray-800 text-xl uppercase tracking-wider'>Time Table Month End Report</h3>
                    <h4 className='mt-1 mb-4 text-center font-semibold text-md text-muted-foreground uppercase'>
                        Time Table {monthLabel} Month Report
                    </h4>

                    {/* Details Metadata */}
                    <table className='info-table mb-6 w-full border-none'>
                        <tbody>
                            <tr className='border-none'>
                                <td className='w-1/4 py-1 font-semibold text-gray-600' style={{ border: 'none' }}>
                                    Name:
                                </td>
                                <td className='w-1/4 py-1 text-gray-800' style={{ border: 'none' }}>
                                    {enteredName || '—'}
                                </td>
                                <td className='w-1/4 py-1 font-semibold text-gray-600' style={{ border: 'none' }}>
                                    Date:
                                </td>
                                <td className='w-1/4 py-1 text-gray-800' style={{ border: 'none' }}>
                                    {formattedDate}
                                </td>
                            </tr>
                            <tr className='border-none'>
                                <td className='w-1/4 py-1 font-semibold text-gray-600' style={{ border: 'none' }}>
                                    Designation:
                                </td>
                                <td className='w-1/4 py-1 text-gray-800' style={{ border: 'none' }}>
                                    Implementation Engineer
                                </td>
                                <td className='w-1/4 py-1 font-semibold text-gray-600' style={{ border: 'none' }}>
                                    Academic Year:
                                </td>
                                <td className='w-1/4 py-1 text-gray-800' style={{ border: 'none' }}>
                                    {academicYearLabel}
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Data Table */}
                    <div className='overflow-x-auto rounded-lg border border-gray-200'>
                        <table className='my-0 w-full border-collapse text-center'>
                            <thead>
                                <tr className='border-gray-200 border-b bg-primary/5 font-semibold text-gray-800'>
                                    <th className='border-gray-200 border-r p-3'>SL.NO</th>
                                    <th className='border-gray-200 border-r p-3 text-left'>Class</th>
                                    <th className='border-gray-200 border-r p-3'>WorkLoad</th>
                                    <th className='border-gray-200 border-r p-3'>SMS</th>
                                    <th className='p-3'>Email</th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-gray-150'>
                                {reportData.map((row, idx) => (
                                    <tr key={idx} className='transition-colors hover:bg-gray-50'>
                                        <td className='border-gray-150 border-r p-3'>{idx + 1}</td>
                                        <td className='border-gray-155 border-r p-3 text-left font-medium'>{row.ClassName}</td>
                                        <td className='border-gray-150 border-r p-3'>{row.Total_Workload ?? 0}</td>
                                        <td className='border-gray-150 border-r p-3'>{row.count ?? 0}</td>
                                        <td className='p-3'>{row.count ?? 0}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Signatures */}
                    <table className='signature-table mt-12 w-full border-none'>
                        <tbody>
                            <tr className='border-none'>
                                <td className='py-4' style={{ border: 'none' }}>
                                    <span className='font-semibold'>Implementation Engineer:</span> ___________________
                                </td>
                                <td className='py-4' style={{ border: 'none' }}>
                                    <span className='font-semibold'>Nodal Officer:</span> ___________________
                                </td>
                            </tr>
                            <tr className='border-none'>
                                <td className='py-4' style={{ border: 'none' }}>
                                    <span className='font-semibold'>End User:</span> ___________________
                                </td>
                                <td className='py-4' style={{ border: 'none' }}>
                                    <span className='font-semibold'>Seal</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
