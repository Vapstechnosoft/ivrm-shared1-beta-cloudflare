import type { IStudentYearlyAttendenceReportList } from '@/types/admission/preadmission/reports';
import { format } from 'date-fns';
import React from 'react';

interface StudentYearlyReportPrintProps {
    data: IStudentYearlyAttendenceReportList[];
    absentData?: IStudentYearlyAttendenceReportList[];
    monthList: any[];
}

export const StudentYearlyReportPrint = React.forwardRef<HTMLDivElement, StudentYearlyReportPrintProps>(
    ({ data, absentData, monthList }, ref) => {
        const currentDate = format(new Date(), 'dd/MM/yyyy');

        if (!data || data.length === 0) {
            return (
                <div ref={ref} className='bg-white p-5 text-center text-black'>
                    No data selected for printing.
                </div>
            );
        }

        return (
            <div ref={ref} className='print-preview-container min-h-full w-full bg-white text-black'>
                <style>
                    {`
                        @media print {
                            @page {
                                margin: 10mm;
                                size: A4 landscape;
                            }
                            body {
                                visibility: hidden;
                                background: white;
                                margin: 0;
                                padding: 0;
                            }
                            .print-preview-container {
                                visibility: visible !important;
                                position: absolute;
                                left: 0;
                                top: 0;
                                width: 100%;
                                background: white;
                                z-index: 9999;
                                color: black;
                            }
                            .print-preview-container * {
                                visibility: visible !important;
                            }
                            .main-table {
                                width: 100%;
                                border-collapse: collapse;
                                border: none !important;
                            }
                            .data-table {
                                width: 100%;
                                border-collapse: collapse;
                                border: 1px solid #000;
                            }
                            .data-table th, .data-table td {
                                border: 1px solid #000;
                                padding: 4px;
                                text-align: center;
                                font-size: 10px;
                            }
                            .data-table th {
                                background-color: #f3f4f6;
                                font-weight: bold;
                                -webkit-print-color-adjust: exact;
                            }
                            .text-left {
                                text-align: left !important;
                            }
                            .header-section {
                                text-align: center;
                                padding-bottom: 20px;
                            }
                            .footer-section {
                                padding-top: 20px;
                                display: flex;
                                justify-content: space-between;
                                font-size: 10px;
                            }
                            .no-border {
                                border: none !important;
                            }
                        }
                    `}
                </style>

                <table className='main-table no-border'>
                    <thead>
                        <tr>
                            <td className='no-border'>
                                {/* Header */}
                                <div className='header-section text-center'>
                                    <h2 className='font-bold text-lg uppercase'>Student Yearly Attendance Report</h2>
                                    <p className='text-gray-600 text-sm'>Date: {currentDate}</p>
                                </div>
                            </td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className='no-border'>
                                {/* Table */}
                                <table className='data-table w-full'>
                                    <thead>
                                        <tr className='bg-gray-100'>
                                            <th className='w-12'>Sl. No.</th>
                                            <th>Reg No.</th>
                                            <th>Adm No.</th>
                                            <th className='text-left'>Student Name</th>
                                            <th>Roll No.</th>
                                            {monthList.map((month: any, index: number) => (
                                                <th key={index}>
                                                    {month.monthnamee.trim()} {month.yearidname}({month.total})
                                                </th>
                                            ))}
                                            <th>Total ({monthList.reduce((sum: any, month: any) => sum + month.total, 0)})</th>
                                            <th>Percentage</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.map((student, index) => {
                                            return (
                                                <tr key={index}>
                                                    <td>{index + 1}</td>
                                                    <td>{student.AMST_RegistrationNo ?? 'N.A'}</td>
                                                    <td>{student.AMST_AdmNo ?? 'N.A'}</td>
                                                    <td className='text-left'>{student.name}</td>
                                                    <td>{student.AMAY_RollNo ?? 'N.A'}</td>
                                                    {monthList.map((month: any, idx: number) => {
                                                        const monthKey = `${month.yearidname}-${month.monthidname}`;
                                                        const attendance = student.monthlyAttendance[monthKey];
                                                        return <td key={idx}>{attendance ?? 0}</td>;
                                                    })}
                                                    <td className='font-semibold'>{Number(student.totalPresent).toFixed(2)}</td>
                                                    <td className='font-semibold'>{student.percentage}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>

                                {absentData && absentData.length > 0 && (
                                    <>
                                        <div className='header-section mt-8 mb-4 text-center'>
                                            <h3 className='font-bold text-md uppercase'>Shortage of Attendance List ({'<'} 75%)</h3>
                                        </div>
                                        <table className='data-table w-full'>
                                            <thead>
                                                <tr className='bg-gray-100'>
                                                    <th className='w-12'>Sl.No</th>
                                                    <th className='text-left'>Student Name</th>
                                                    <th>Adm. No</th>
                                                    <th>Roll No</th>
                                                    <th>Class Held</th>
                                                    <th>Present</th>
                                                    <th>Absent</th>
                                                    <th>Percentage</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {absentData.map((student, index) => (
                                                    <tr key={index}>
                                                        <td>{index + 1}</td>
                                                        <td className='text-left'>{student.name}</td>
                                                        <td>{student.AMST_AdmNo}</td>
                                                        <td>{student.AMAY_RollNo}</td>
                                                        <td>{student.totalWorkingDays}</td>
                                                        <td>{student.totalPresent}</td>
                                                        <td>{student.totalAbsent}</td>
                                                        <td className='font-bold text-red-600'>{student.percentage}%</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </>
                                )}
                            </td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr>
                            <td className='no-border'>
                                {/* Footer */}
                                <div className='footer-section'>
                                    <div>Printed Date: {currentDate}</div>
                                    <div>Signature</div>
                                </div>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        );
    }
);

StudentYearlyReportPrint.displayName = 'StudentYearlyReportPrint';
