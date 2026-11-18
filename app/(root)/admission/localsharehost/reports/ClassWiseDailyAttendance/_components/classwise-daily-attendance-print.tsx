'use client';

import { format } from 'date-fns';
import { forwardRef } from 'react';

interface ClassWiseDailyAttendancePrintProps {
    data: any[];
    academicYear?: string;
    className?: string;
    sectionName?: string;
    date?: Date;
    logoUrl?: string;
    username?: string;
    disclaimer?: string;
}

export const ClassWiseDailyAttendancePrint = forwardRef<HTMLDivElement, ClassWiseDailyAttendancePrintProps>(
    ({ data, academicYear, className, sectionName, date, logoUrl, username, disclaimer }, ref) => {
        const currentDate = format(new Date(), 'dd/MM/yyyy');
        const reportDate = date ? format(date, 'dd/MM/yyyy') : '';

        const presentCount = data.filter((r) => r.asa_class_attended === 1 || r.ASA_Class_Attended === 1).length;
        const absentCount = data.filter((r) => r.asa_class_attended === 0 || r.ASA_Class_Attended === 0).length;
        const halfDayCount = data.filter((r) => r.asa_class_attended === 0.5 || r.ASA_Class_Attended === 0.5).length;

        return (
            <div ref={ref} className='print-only w-full bg-white text-black'>
                <style
                    dangerouslySetInnerHTML={{
                        __html: `
                    @media screen {
                        .print-only {
                            display: none !important;
                        }
                    }
                    @media print {
                        @page {
                            size: A4 portrait;
                            margin: 5mm;
                        }
                        body * {
                            visibility: hidden !important;
                        }
                        .print-only, .print-only * {
                            visibility: visible !important;
                        }
                        .print-only {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                            display: block !important;
                        }
                        table {
                            border-collapse: collapse;
                            width: 100%;
                            border: 1px solid black;
                        }
                        th, td {
                            border: 0.5pt solid black;
                            padding: 4px 6px;
                            text-align: center;
                            font-size: 10px;
                            color: black !important;
                        }
                        th {
                            background-color: transparent !important;
                            font-weight: bold;
                            text-transform: uppercase;
                        }
                    }
                    `
                    }}
                />

                <div className='flex w-full flex-col items-center p-4'>
                    {/* Header Section */}
                    <div className='mb-2 flex w-full items-center justify-between border-black border-b pb-2'>
                        <div className='flex-shrink-0'>
                            {logoUrl ? (
                                <img src={logoUrl} alt='Logo' className='h-20 w-100 object-contain' text-align='center' />
                            ) : (
                                <div className='flex h-20 w-20 items-center justify-center border border-dashed text-[20px]'>Logo</div>
                            )}
                        </div>
                    </div>

                    {/* Metadata Bars */}
                    <div className='mb-1 w-full border border-black'>
                        <div className='border-black border-b bg-white py-1 text-center font-bold text-[11px] uppercase'>
                            ClassWise Daily Attendance Report For Academic Year: {academicYear}
                        </div>
                        <div className='bg-white py-1 text-center font-bold text-[11px] uppercase'>
                            Attendance Details For Class: {className} Section : {sectionName} Date : {reportDate}
                        </div>
                    </div>

                    {/* Table */}
                    <table className='w-full border-black'>
                        <thead>
                            <tr>
                                <th style={{ width: '40px' }}>SL.No.</th>
                                <th className='border-black text-left font-bold'>Student Name</th>
                                <th style={{ width: '80px' }}>Roll No.</th>
                                <th style={{ width: '120px' }}>Admission No.</th>
                                <th style={{ width: '80px' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((user, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td className='text-left font-medium uppercase'>{user.studentname || user.AMST_FirstName}</td>
                                    <td>{user.amay_rollno || user.AMAY_RollNo}</td>
                                    <td>{user.amst_admno || user.AMST_AdmNo}</td>
                                    <td>
                                        {user.asa_class_attended === 1 || user.ASA_Class_Attended === 1
                                            ? 'Present'
                                            : user.asa_class_attended === 0.5 || user.ASA_Class_Attended === 0.5
                                              ? 'Half Day'
                                              : 'Absent'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Footer Counts Box */}
                    <div className='mt-0 w-full border-black border-x border-b'>
                        <div className='grid grid-cols-1 border-black border-t text-center font-bold text-[10px] uppercase'>
                            <div className='border-black border-b py-0.5'>Number of Present Students: {presentCount}</div>
                            <div className='border-black border-b py-0.5'>Number of Absent Students: {absentCount}</div>
                            <div className='py-0.5'>Number of Half Day Present Students(Half Day): {halfDayCount}</div>
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className='mt-4 w-full text-center text-[9px] italic opacity-60'>
                        Date: {currentDate} | Generated by: {username || 'System Administrator'} | {disclaimer}
                    </div>
                </div>
            </div>
        );
    }
);

ClassWiseDailyAttendancePrint.displayName = 'ClassWiseDailyAttendancePrint';
