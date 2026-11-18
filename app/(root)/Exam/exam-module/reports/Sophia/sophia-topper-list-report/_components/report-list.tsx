import { Button } from '@/components/ui/button';
import type { IMasterInstitution, Institution } from '@/types/exam/exam-module/report';
import { FileSpreadsheet, Printer } from 'lucide-react';
import { dummyHeaderInfo, dummyTopperListData } from './mockData';

interface SophiaTopperListReportViewProps {
    data?: any[];
    institution?: IMasterInstitution | Institution | null;
}

const SophiaTopperListReportView = ({ data, institution }: SophiaTopperListReportViewProps) => {
    const handleExport = () => {};
    const handlePrint = () => {
        window.print();
    };

    return (
        <div>
            <style>
                {`
            @media print {
                @page { margin: 10mm; }
                body {
                    visibility: hidden;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                #printable-area, #printable-area * {
                    visibility: visible;
                }
                #printable-area {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                }
                .no-print {
                    display: none !important;
                }
            }
        `}
            </style>
            <div className='no-print mb-6 flex justify-end gap-3 rounded-t-md border-gray-200 border-b bg-gray-50/50 px-6 py-3'>
                <Button
                    onClick={handlePrint}
                    className='flex w-fit items-center gap-2 bg-sky-800 font-medium text-white shadow-sm transition-colors hover:bg-sky-900'>
                    <Printer className='h-4 w-4' /> Print
                </Button>
                <Button
                    onClick={handleExport}
                    className='flex w-fit items-center gap-2 bg-sky-800 font-medium text-white shadow-sm transition-colors hover:bg-sky-900'>
                    <FileSpreadsheet className='h-4 w-4' /> Excel
                </Button>
            </div>

            <div id='printable-area' className='min-w-[1000px] bg-white px-6 py-4 font-sans text-[12px] text-gray-800'>
                <div className='overflow-hidden border border-[#0066cc]'>
                    <table className='w-full border-collapse bg-white text-[13px]'>
                        <thead>
                            <tr className='bg-[#0066cc] font-bold text-white'>
                                <th
                                    colSpan={3}
                                    className='border-white/20 border-r border-b p-2.5 px-4 text-center uppercase tracking-wider'>
                                    ACADEMIC YEAR: {dummyHeaderInfo.academicYear}
                                </th>
                                <th colSpan={4} className='border-white/20 border-b p-2.5 px-4 text-center uppercase tracking-wider'>
                                    EXAM NAME: {dummyHeaderInfo.examName}
                                </th>
                            </tr>
                            <tr className='border-white/20 border-b bg-[#0066cc] font-bold text-white'>
                                <th
                                    colSpan={3}
                                    className='border-white/20 border-r border-b p-2.5 px-4 text-center uppercase tracking-wider'>
                                    CLASS NAME: {dummyHeaderInfo.className}
                                </th>
                                <th colSpan={4} className='border-white/20 border-b p-2.5 px-4 text-center uppercase tracking-wider'>
                                    SECTION NAME: {dummyHeaderInfo.sectionName}
                                </th>
                            </tr>
                            <tr className='bg-[#0066cc] text-center font-bold text-white'>
                                <th className='w-[80px] border-white/20 border-r p-2.5'>SL. NO.</th>
                                <th className='border-white/20 border-r p-2.5'>STUDENT NAME</th>
                                <th className='w-[150px] border-white/20 border-r p-2.5'>ADM. NO</th>
                                <th className='w-[120px] border-white/20 border-r p-2.5'>TOTAL MARKS</th>
                                <th className='w-[120px] border-white/20 border-r p-2.5'>OBT. MARKS</th>
                                <th className='w-[120px] border-white/20 border-r p-2.5'>PERCENTAGE</th>
                                <th className='w-[80px] p-2.5'>RANK</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dummyTopperListData.map((row, idx) => (
                                <tr key={idx} className='bg-white text-center font-bold text-gray-700'>
                                    <td className='border-[#e5e7eb] border-t border-r p-3'>{row.slNo}</td>
                                    <td className='border-[#e5e7eb] border-t border-r p-3 text-center'>{row.studentName}</td>
                                    <td className='border-[#e5e7eb] border-t border-r p-3'>{row.admNo}</td>
                                    <td className='border-[#e5e7eb] border-t border-r p-3'>{row.totalMarks}</td>
                                    <td className='border-[#e5e7eb] border-t border-r p-3'>{row.obtMarks}</td>
                                    <td className='border-[#e5e7eb] border-t border-r p-3'>{row.percentage}</td>
                                    <td className='border-[#e5e7eb] border-t p-3'>{row.rank}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SophiaTopperListReportView;
