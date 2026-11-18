'use client';

import type { INotSubmittedReportRow, IStaffWiseReportRow } from '@/types/exam/online-exam/reports';

interface StaffWiseReportPrintViewProps {
    reportType: 'not_submitted' | 'staff_wise';
    notSubmittedData?: INotSubmittedReportRow[];
    staffWiseData?: IStaffWiseReportRow[];
}

export default function StaffWiseReportPrintView({ reportType, notSubmittedData = [], staffWiseData = [] }: StaffWiseReportPrintViewProps) {
    const isNotSubmitted = reportType === 'not_submitted';
    const hasData = isNotSubmitted ? notSubmittedData.length > 0 : staffWiseData.length > 0;

    if (!hasData) return null;

    return (
        <div id='printable-staff-wise-report' className='hidden bg-white p-6 text-black print:block'>
            <div className='mb-4 border-b pb-4 text-center'>
                <h1 className='font-bold text-xl uppercase tracking-wider'>Integrated Virtual Resource Management (IVRM)</h1>
                <h2 className='mt-1 font-semibold text-base'>
                    {isNotSubmitted ? 'Online Exam Student Not Submitted Report' : 'Staff-Wise Online Exam Performance Report'}
                </h2>
                <p className='mt-0.5 text-gray-500 text-xs'>
                    Generated on: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
                </p>
            </div>

            {isNotSubmitted ? (
                <table className='w-full border-collapse border border-gray-400 text-xs'>
                    <thead>
                        <tr className='bg-gray-100 font-bold'>
                            <th className='border border-gray-400 p-2 text-center'>Sl.No</th>
                            <th className='border border-gray-400 p-2 text-left'>Student Name</th>
                            <th className='border border-gray-400 p-2 text-left'>Adm No</th>
                            <th className='border border-gray-400 p-2 text-center'>Roll No</th>
                            <th className='border border-gray-400 p-2 text-left'>Class</th>
                            <th className='border border-gray-400 p-2 text-left'>Section</th>
                            <th className='border border-gray-400 p-2 text-center'>Attempt Status</th>
                            <th className='border border-gray-400 p-2 text-left'>Contact No</th>
                        </tr>
                    </thead>
                    <tbody>
                        {notSubmittedData.map((row, idx) => (
                            <tr key={idx} className='even:bg-gray-50'>
                                <td className='border border-gray-400 p-2 text-center'>{idx + 1}</td>
                                <td className='border border-gray-400 p-2 font-medium'>{row.studentName}</td>
                                <td className='border border-gray-400 p-2'>{row.admNo}</td>
                                <td className='border border-gray-400 p-2 text-center'>{row.rollNo}</td>
                                <td className='border border-gray-400 p-2'>{row.className}</td>
                                <td className='border border-gray-400 p-2'>{row.sectionName}</td>
                                <td className='border border-gray-400 p-2 text-center font-semibold text-red-600'>{row.attemptStatus}</td>
                                <td className='border border-gray-400 p-2'>{row.mobileNo || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <table className='w-full border-collapse border border-gray-400 text-xs'>
                    <thead>
                        <tr className='bg-gray-100 font-bold'>
                            <th className='border border-gray-400 p-2 text-center'>Sl.No</th>
                            <th className='border border-gray-400 p-2 text-left'>Staff Name</th>
                            <th className='border border-gray-400 p-2 text-left'>Emp Code</th>
                            <th className='border border-gray-400 p-2 text-left'>Subject</th>
                            <th className='border border-gray-400 p-2 text-left'>Class</th>
                            <th className='border border-gray-400 p-2 text-center'>Total Students</th>
                            <th className='border border-gray-400 p-2 text-center'>Appeared</th>
                            <th className='border border-gray-400 p-2 text-center'>Absent</th>
                            <th className='border border-gray-400 p-2 text-center'>Passed</th>
                            <th className='border border-gray-400 p-2 text-center'>Pass %</th>
                        </tr>
                    </thead>
                    <tbody>
                        {staffWiseData.map((row, idx) => (
                            <tr key={idx} className='even:bg-gray-50'>
                                <td className='border border-gray-400 p-2 text-center'>{idx + 1}</td>
                                <td className='border border-gray-400 p-2 font-medium'>{row.staffName}</td>
                                <td className='border border-gray-400 p-2'>{row.employeeCode}</td>
                                <td className='border border-gray-400 p-2'>{row.subjectName}</td>
                                <td className='border border-gray-400 p-2'>{row.className}</td>
                                <td className='border border-gray-400 p-2 text-center font-semibold'>{row.totalStudents}</td>
                                <td className='border border-gray-400 p-2 text-center font-semibold text-blue-700'>{row.totalAppeared}</td>
                                <td className='border border-gray-400 p-2 text-center font-semibold text-red-700'>
                                    {row.totalNotAppeared}
                                </td>
                                <td className='border border-gray-400 p-2 text-center font-semibold text-green-700'>{row.totalPassed}</td>
                                <td className='border border-gray-400 p-2 text-center font-bold'>{row.passPercentage}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
