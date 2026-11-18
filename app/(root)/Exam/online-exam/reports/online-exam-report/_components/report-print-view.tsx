'use client';

import type { IOnlineExamReportRow } from '@/types/exam/online-exam/reports';

interface ReportPrintViewProps {
    reportData: IOnlineExamReportRow[];
    examTitle?: string;
}

export default function ReportPrintView({ reportData = [], examTitle = 'Online Examination Performance Report' }: ReportPrintViewProps) {
    if (reportData.length === 0) return null;

    return (
        <div id='printable-online-exam-report' className='hidden bg-white p-6 text-black print:block'>
            <div className='mb-4 border-b pb-4 text-center'>
                <h1 className='font-bold text-xl uppercase tracking-wider'>Integrated Virtual Resource Management (IVRM)</h1>
                <h2 className='mt-1 font-semibold text-base'>{examTitle}</h2>
                <p className='mt-0.5 text-gray-500 text-xs'>
                    Generated on: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
                </p>
            </div>

            <table className='w-full border-collapse border border-gray-400 text-xs'>
                <thead>
                    <tr className='bg-gray-100 font-bold'>
                        <th className='border border-gray-400 p-2 text-center'>Sl.No</th>
                        <th className='border border-gray-400 p-2 text-left'>Student Name</th>
                        <th className='border border-gray-400 p-2 text-left'>Adm No</th>
                        <th className='border border-gray-400 p-2 text-center'>Roll No</th>
                        <th className='border border-gray-400 p-2 text-left'>Class</th>
                        <th className='border border-gray-400 p-2 text-center'>Total Qs</th>
                        <th className='border border-gray-400 p-2 text-center'>Attempted</th>
                        <th className='border border-gray-400 p-2 text-center'>Correct</th>
                        <th className='border border-gray-400 p-2 text-center'>Wrong</th>
                        <th className='border border-gray-400 p-2 text-center'>Marks</th>
                        <th className='border border-gray-400 p-2 text-center'>%</th>
                        <th className='border border-gray-400 p-2 text-center'>Result</th>
                        <th className='border border-gray-400 p-2 text-center'>Rank</th>
                    </tr>
                </thead>
                <tbody>
                    {reportData.map((row, idx) => (
                        <tr key={idx} className='even:bg-gray-50'>
                            <td className='border border-gray-400 p-2 text-center'>{idx + 1}</td>
                            <td className='border border-gray-400 p-2 font-medium'>{row.studentName}</td>
                            <td className='border border-gray-400 p-2'>{row.admNo}</td>
                            <td className='border border-gray-400 p-2 text-center'>{row.rollNo}</td>
                            <td className='border border-gray-400 p-2'>{row.className}</td>
                            <td className='border border-gray-400 p-2 text-center'>{row.totalQuestions}</td>
                            <td className='border border-gray-400 p-2 text-center'>{row.attemptedQuestions}</td>
                            <td className='border border-gray-400 p-2 text-center font-semibold text-green-700'>{row.correctAnswers}</td>
                            <td className='border border-gray-400 p-2 text-center font-semibold text-red-700'>{row.wrongAnswers}</td>
                            <td className='border border-gray-400 p-2 text-center font-bold'>
                                {row.marksObtained} / {row.maxMarks}
                            </td>
                            <td className='border border-gray-400 p-2 text-center font-bold'>{row.percentage}%</td>
                            <td className='border border-gray-400 p-2 text-center font-semibold'>{row.resultStatus}</td>
                            <td className='border border-gray-400 p-2 text-center'>{row.rank ? `#${row.rank}` : '-'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
