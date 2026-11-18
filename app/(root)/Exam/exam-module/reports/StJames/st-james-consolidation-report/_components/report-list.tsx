'use client';
import { Button } from '@/components/ui/button';
import type { IMasterInstitution, Institution } from '@/types/exam/exam-module/report';
import { FileSpreadsheet, Printer } from 'lucide-react';
import { mockData } from './mock-data';

interface StJamesConsolidateReportProps {
    data: any[];
    institution: IMasterInstitution | Institution | null;
}
export default function StJamesConsolidationReportList({ data, institution }: StJamesConsolidateReportProps) {
    const subjects = [
        { key: 'englishLanguage', title: 'English Language' },
        { key: 'englishLiterature', title: 'English Literature' },
        { key: 'english', title: 'English' },
        { key: 'secondLanguage', title: 'Second Language' },
        { key: 'mathematics', title: 'Mathematics' },
        { key: 'generalScience', title: 'General Science' },
        { key: 'history', title: 'History' },
        { key: 'geography', title: 'Geography' },
        { key: 'computer', title: 'Computer' },
        { key: 'thirdLanguage', title: 'Third Language' },
        { key: 'art', title: 'Art' },
        { key: 'valueEducation', title: 'Value Education/ Scripture' },
        { key: 'discipline', title: 'Discipline' },
        { key: 'coCurricular', title: 'Co-Curricular Activities' }
    ];

    const columns = [
        { key: 'total', title: 'Total' },
        { key: 'grandTotal', title: 'Grand Total' },
        { key: 'percentage', title: 'Percentage' },
        { key: 'rank', title: 'Rank' },
        { key: 'attendance', title: 'Attendance' },
        { key: 'remarks', title: 'Remarks' }
    ];

    const handlePrint = () => {
        window.print();
    };

    const handleExport = () => {};

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
                            display: none;
                        }
                }`}
            </style>
            <div className='no-print mb-6 flex justify-end gap-3 rounded-t-md border-gray-200 border-b bg-gray-50/50 px-4 py-3'>
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
            <div className='w-full overflow-x-auto bg-white p-4' id='printable-area'>
                <p className='py-10 text-center font-bold text-blue-500'>CONSOLIDATED FINAL REPORT</p>
                <table className='w-full border-collapse border border-gray-400 text-center text-sm'>
                    <thead>
                        <tr className='bg-white'>
                            <th className='h-48 w-12 border border-gray-400 p-2 align-bottom font-bold'>
                                <div className='m-auto mb-2 rotate-180 text-center [writing-mode:vertical-lr]'>Roll Number</div>
                            </th>
                            <th className='min-w-[150px] border border-gray-400 p-2 align-middle font-bold'>NAME</th>
                            <th className='h-48 w-12 border border-gray-400 p-2 align-bottom font-bold'>
                                <div className='m-auto mb-2 rotate-180 whitespace-nowrap text-center [writing-mode:vertical-lr]'>
                                    Reg.No.
                                </div>
                            </th>
                            <th className='h-48 w-12 border border-gray-400 p-2 align-bottom font-bold'>
                                <div className='m-auto mb-2 rotate-180 text-center [writing-mode:vertical-lr]'>House</div>
                            </th>
                            <th className='h-48 w-20 border border-gray-400 p-2 align-bottom font-bold'>
                                <div className='m-auto mb-2 rotate-180 text-center [writing-mode:vertical-lr]'>Term</div>
                            </th>
                            {subjects.map((sub, index) => (
                                <th key={index} className='h-48 w-12 border border-gray-400 p-2 align-bottom font-bold'>
                                    <div className='m-auto mb-2 rotate-180 whitespace-nowrap text-center [writing-mode:vertical-lr]'>
                                        {sub.title}
                                    </div>
                                </th>
                            ))}
                            {columns.map((col, index) => (
                                <th key={index} className='h-48 w-12 border border-gray-400 p-2 align-bottom font-bold'>
                                    <div className='m-auto mb-2 rotate-180 text-center [writing-mode:vertical-lr]'>{col.title}</div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {mockData.map((student, studentIndex) => {
                            return student.terms.map((term, termIndex) => (
                                <tr key={`${studentIndex}-${termIndex}`} className='bg-white hover:bg-gray-50'>
                                    {termIndex === 0 && (
                                        <>
                                            <td
                                                rowSpan={student.terms.length}
                                                className='border border-gray-400 p-2 align-middle font-medium'>
                                                {student.rollNumber}
                                            </td>
                                            <td
                                                rowSpan={student.terms.length}
                                                className='max-w-[150px] whitespace-normal border border-gray-400 p-2 text-left align-middle font-medium'>
                                                {student.name}
                                            </td>
                                            <td
                                                rowSpan={student.terms.length}
                                                className='border border-gray-400 p-2 align-middle font-medium'>
                                                <div className='m-auto flex h-full rotate-180 items-center justify-center py-4 [writing-mode:vertical-lr]'>
                                                    {student.regNo}
                                                </div>
                                            </td>
                                            <td
                                                rowSpan={student.terms.length}
                                                className='border border-gray-400 p-2 align-middle font-medium'>
                                                {student.house}
                                            </td>
                                        </>
                                    )}
                                    <td className='w-24 whitespace-normal break-words border border-gray-400 p-2 text-center font-medium text-gray-700'>
                                        {term.termName}
                                    </td>
                                    {subjects.map((sub, idx) => (
                                        <td
                                            key={`sub-${idx}`}
                                            className='w-12 max-w-[60px] whitespace-pre-line border border-gray-400 p-1 text-center'>
                                            {term[sub.key as keyof typeof term] !== null ? term[sub.key as keyof typeof term] : ''}
                                        </td>
                                    ))}
                                    {columns.map((col, idx) => (
                                        <td key={`col-${idx}`} className='w-14 border border-gray-400 p-2 text-center'>
                                            {term[col.key as keyof typeof term] !== null ? term[col.key as keyof typeof term] : ''}
                                        </td>
                                    ))}
                                </tr>
                            ));
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
