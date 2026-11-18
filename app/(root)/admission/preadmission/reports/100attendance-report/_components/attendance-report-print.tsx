'use client';

import { format } from 'date-fns';
import { forwardRef } from 'react';

interface ReportData {
    studentAttendanceList: any[];
    AMC_logo: { amC_FilePath: string }[];
}

interface AttendanceReportPrintProps {
    data: ReportData | any;
    yearName?: string;
    userName?: string;
    copyright?: string;
}

export const AttendanceReportPrint = forwardRef<HTMLDivElement, AttendanceReportPrintProps>(
    ({ data, yearName, userName, copyright }, ref) => {
        const studentList = data?.studentAttendanceList || [];
        const logo = data?.AMC_logo?.[0]?.amC_FilePath || '';

        return (
            <div ref={ref} className='p-8 print:p-4'>
                <div className='mb-6 flex flex-col items-center justify-center text-center'>
                    {logo && <img src={logo} alt='School Logo' className='mb-4 max-h-24' />}
                    <h2 className='font-bold text-xl uppercase'>100% Attendance Report For Year {yearName}</h2>
                </div>

                <table className='w-full border-collapse border border-black text-center text-sm'>
                    <thead>
                        <tr className='bg-gray-100'>
                            <th className='border border-black p-2'>SL. No.</th>
                            <th className='border border-black p-2'>Student Name</th>
                            <th className='border border-black p-2'>Admission No.</th>
                            <th className='border border-black p-2'>Registration No.</th>
                            <th className='border border-black p-2'>Class Name</th>
                            <th className='border border-black p-2'>Section Name</th>
                            <th className='border border-black p-2'>No. of Working days</th>
                            <th className='border border-black p-2'>No. of Present days</th>
                            <th className='border border-black p-2'>Present %</th>
                        </tr>
                    </thead>
                    <tbody>
                        {studentList.map((user: any, index: number) => (
                            <tr key={index}>
                                <td className='border border-black p-2'>{index + 1}</td>
                                <td className='border border-black p-2 text-left'>{user.namme}</td>
                                <td className='border border-black p-2'>{user.AMST_AdmNo}</td>
                                <td className='border border-black p-2'>{user.AMST_RegistrationNo}</td>
                                <td className='border border-black p-2'>{user.ASMCL_ClassName}</td>
                                <td className='border border-black p-2'>{user.ASMC_SectionName}</td>
                                <td className='border border-black p-2'>{user.classes}</td>
                                <td className='border border-black p-2'>{user.attendance}</td>
                                <td className='border border-black p-2'>{user.per}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className='mt-8 text-xs'>
                    <div className='flex justify-between'>
                        <span>Date: {format(new Date(), 'dd/MM/yyyy')}</span>
                        <span>UserName: {userName}</span>
                        <span>{copyright}</span>
                    </div>
                </div>
            </div>
        );
    }
);

AttendanceReportPrint.displayName = 'AttendanceReportPrint';
