'use client';

import { Button } from '@/components/ui/button';
import { useMonthEndReport } from '@/hooks/sports/useMonthEndReport';
import type { IMonthEndReportData, MonthEndReportFormSchema } from '@/types/sports/reports/month-end-report';
import { FileSpreadsheet, Printer } from 'lucide-react';
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import * as XLSX from 'xlsx';

interface ReportGridProps {
    data: IMonthEndReportData;
    formData: MonthEndReportFormSchema | null;
}

export default function ReportGrid({ data, formData }: ReportGridProps) {
    const { loadData } = useMonthEndReport();
    const componentRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Sports_Month_End_Report_${formData?.month || ''}`,
        pageStyle: `
          @page {
            size: A4;
            margin: 20mm;
          }
          @media print {
            body {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            * {
              visibility: visible !important;
            }
            .rounded-md {
              border: none !important;
              box-shadow: none !important;
            }
          }
        `
    });

    const getMonthName = (monthId: number) => {
        return loadData.data?.monthList.find((m) => m.month === monthId)?.monthname || '';
    };

    const getYearName = (yearId: number) => {
        return loadData.data?.academicYear.find((y) => y.asmaY_Id === yearId)?.asmaY_Year || '';
    };

    const today = new Date().toLocaleDateString();

    const exportToExcel = () => {
        const excelData = [
            {
                'SL.NO': 1,
                Strength: 'Student Strength',
                Total: data.total_count_student,
                'Non Position Holders': data.not_patr_std,
                'Position Holders': data.total_partic_student,
                Winners: data.total_winner_student
            }
        ];

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Month End Report');
        XLSX.writeFile(workbook, `SportsMonthEndReport_${today.replace(/\//g, '-')}.xlsx`);
    };

    return (
        <div className='rounded-md border bg-white p-6 shadow-sm'>
            <div className='mb-6 flex items-center justify-between border-b pb-4'>
                <h3 className='font-bold text-primary text-xl uppercase'>
                    Sports {formData?.month ? getMonthName(formData.month) : ''} Month Report
                </h3>
                <div className='flex gap-2'>
                    <Button variant='outline' size='sm' onClick={() => handlePrint()} className='border-2 hover:bg-primary/5'>
                        <Printer className='mr-2 h-4 w-4 text-primary' />
                        Print
                    </Button>
                    <Button variant='outline' size='sm' onClick={exportToExcel} className='border-2 hover:bg-primary/5'>
                        <FileSpreadsheet className='mr-2 h-4 w-4 text-green-600' />
                        Excel
                    </Button>
                </div>
            </div>

            <div ref={componentRef} className='bg-white p-4 text-black print:p-0'>
                <div className='mb-6 grid grid-cols-1 gap-4 rounded border bg-slate-50 p-4 md:grid-cols-2'>
                    <div className='grid grid-cols-2 gap-2'>
                        <span className='font-semibold'>Name:</span>
                        <span>{formData?.iename || 'N/A'}</span>
                    </div>
                    <div className='grid grid-cols-2 gap-2'>
                        <span className='font-semibold'>Date:</span>
                        <span>{today}</span>
                    </div>
                    <div className='grid grid-cols-2 gap-2'>
                        <span className='font-semibold'>Designation:</span>
                        <span>Implementation Engineer</span>
                    </div>
                    <div className='grid grid-cols-2 gap-2'>
                        <span className='font-semibold'>Academic Year:</span>
                        <span>{formData?.ASMAY_Id ? getYearName(formData.ASMAY_Id) : ''}</span>
                    </div>
                    <div className='grid grid-cols-2 gap-2'>
                        <span className='font-semibold'>Module:</span>
                        <span>Sports</span>
                    </div>
                </div>

                <div className='overflow-x-auto'>
                    <table className='w-full border-collapse border border-gray-300 text-center'>
                        <thead className='bg-gray-100'>
                            <tr>
                                <th className='border border-gray-300 p-2'>SL.NO</th>
                                <th className='border border-gray-300 p-2'>Strength</th>
                                <th className='border border-gray-300 p-2'>Total</th>
                                <th className='border border-gray-300 p-2'>Non Position Holders</th>
                                <th className='border border-gray-300 p-2'>Position Holders</th>
                                <th className='border border-gray-300 p-2'>Winners</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className='border border-gray-300 p-2'>1</td>
                                <td className='border border-gray-300 p-2'>Student Strength</td>
                                <td className='border border-gray-300 p-2'>{data.total_count_student}</td>
                                <td className='border border-gray-300 p-2'>{data.not_patr_std}</td>
                                <td className='border border-gray-300 p-2'>{data.total_partic_student}</td>
                                <td className='border border-gray-300 p-2'>{data.total_winner_student}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className='mt-8 grid grid-cols-2 gap-8 pt-8 text-sm'>
                    <div>Implementation Engineer: _____________________</div>
                    <div>End User Signature: _______________________</div>
                    <div className='mt-4'>Nodal Officer: ______________________</div>
                    <div className='mt-4'>With Seal: ______________________</div>
                </div>
            </div>
        </div>
    );
}
