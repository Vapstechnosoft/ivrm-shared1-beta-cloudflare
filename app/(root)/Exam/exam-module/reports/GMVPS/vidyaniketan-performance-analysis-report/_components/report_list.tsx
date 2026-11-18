'use client';

import { Button } from '@/components/ui/button';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FileSpreadsheet, Printer } from 'lucide-react';
import { useRef } from 'react';
// import page from "../../../masters/page";

interface ReportListProps {
    mockdata: any;
}

export const ReportList = ({ mockdata }: ReportListProps) => {
    const tableRef = useRef<HTMLTableElement>(null);
    const data = mockdata?.data;

    // Check if data exists
    if (!data || (Array.isArray(data) && data.length === 0) || (data.sectionlist && data.sectionlist.length === 0)) {
        return null;
    }

    const summaryRows = [
        ['Total Number of students in the class', data.TotalStudent],
        ['Number of students passed in all subjects', data.PassedAllSubjects],
        ['Number of students failed in all subjects', data.FailedAllSubjects],
        ['Highest Percentage in the class', data.HighestPercentage],
        ['Lowest Percentage in the class', data.LowestPercentage],
        ['Class Average Percentage', data.ClassAverage],
        ['Number of failures in 1 subject', data.Fail1Subject],
        ['Number of failures in 2 subjects', data.Fail2Subject],
        ['Number of failures in 3 subjects', data.Fail3Subject],
        ['Number of failures in 4 subjects', data.Fail4Subject]
    ];

    const failureRows = [
        ['Number of failures in English', data.CountEngFailure],
        ['Number of failures in Hindi', data.CountHindiFailure],
        ['Number of failures in Kannada', data.CountkndFailure],
        ['Number of failures in Mathematics', data.CountMathsFailure],
        ['Number of failure in Environmental Studies', data.CountEvsFailure]
    ];

    const percentageRows = [
        ['No.of students between 90% & 100%', data.Above90to100],
        ['No.of students between 80% & 89%', data.Above80to89],
        ['No.of students between 70% & 79%', data.Above70to79],
        ['No.of students between 60% & 69%', data.Above60to69],
        ['No.of students between 50% & 59%', data.Above50to59],
        ['No.of students between 40% & 49%', data.Above40to49],
        ['No.of students between 33% & 39%', data.Above33to39],
        ['No.of students between 0% & 32%', data.Below33]
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
            @page {
                margin: 10;
            }
            body {
                    visibility: hidden;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
            .printable-area, .printable-area * {
                visibility: visible;
            }
            .printable-area {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
            }
          }
        `}
            </style>
            <CollapsibleSection
                title='Performance Analysis Report'
                defaultOpen={true}
                variant='outline'
                size='md'
                className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                <div ref={tableRef} className='space-y-4 rounded-xl border bg-white'>
                    <div className='flex justify-end gap-2 p-2'>
                        <Button onClick={handlePrint} className=' flex w-fit text-white hover:bg-orange-800'>
                            <Printer className='h-4 w-4' />
                            <span>PRINT</span>
                        </Button>

                        <Button onClick={handleExport} className='w-fit text-white hover:bg-orange-800'>
                            <FileSpreadsheet className='h-4 w-4' />
                            Export to Excel
                        </Button>
                    </div>

                    <div className=' printable-area rounded-md'>
                        <p className='my-4 text-center font-bold text-2xl'>Performance Ananlysis Report</p>
                        <table className='w-full border border-black text-sm'>
                            <tbody>
                                {/* HEADER */}
                                <tr>
                                    <td colSpan={2} className='border border-black text-center font-bold text-lg '>
                                        G M VIDYANIKETAN PUBLIC SCHOOL, BRAHMAVAR
                                    </td>
                                </tr>

                                <tr>
                                    <td colSpan={2} className='border border-black p-2 text-center font-bold text-base'>
                                        {data.ExamName}
                                    </td>
                                </tr>

                                <tr>
                                    <td colSpan={2} className='border border-black p-2 text-center font-bold text-base'>
                                        CLASS : {data.ClassName} - PERFORMANCE ANALYSIS
                                    </td>
                                </tr>

                                {/* SUMMARY */}
                                {summaryRows.map(([label, value]) => (
                                    <tr key={label}>
                                        <td className='w-1/2 border border-black p-2 text-center font-medium'>{label}</td>
                                        <td className='w-1/2 border border-black p-2 text-center font-medium'>{value}</td>
                                    </tr>
                                ))}

                                {/* FAILURES */}
                                {failureRows.map(([label, value]) => (
                                    <tr key={label}>
                                        <td className='border border-black p-2 text-center font-medium'>{label}</td>
                                        <td className='border border-black p-2 text-center font-medium'>{value}</td>
                                    </tr>
                                ))}

                                {/* SUBJECTS */}
                                {data.subjects.map((sub: any) => (
                                    <tr key={sub.ISMS_Id}>
                                        <td className='border border-black p-2 text-center font-medium'>{sub.ISMS_SubjectName}</td>
                                        <td className='border border-black p-2 text-center font-medium'>
                                            Highest: {sub.HighestMarks} <br />
                                            Lowest: {sub.LowestMarks} <br />
                                            Average: {sub.AverageMarks}
                                        </td>
                                    </tr>
                                ))}

                                {/* PERCENTAGE RANGE */}
                                {percentageRows.map(([label, value]) => (
                                    <tr key={label}>
                                        <td className='border border-black p-2 text-center font-medium'>{label}</td>
                                        <td className='border border-black p-2 text-center font-medium'>{value}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className='my-6 flex justify-around'>
                            <p>Principal :</p>
                            <p>Head Teacher :</p>
                            <p>Date :</p>
                        </div>
                    </div>
                </div>
            </CollapsibleSection>
        </div>
    );
};
