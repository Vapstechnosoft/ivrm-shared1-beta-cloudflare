import { format } from 'date-fns';
import React from 'react';

interface StudentAttendancePrintProps {
    data: any;
    academicYear: string;
    className: string;
    sectionName: string;
    monthName?: string;
    monthDateWise?: boolean;
}

export const StudentAttendancePrint = React.forwardRef<HTMLDivElement, StudentAttendancePrintProps>(
    ({ data, academicYear, className, sectionName, monthName, monthDateWise }, ref) => {
        const currentDate = format(new Date(), 'dd/MM/yyyy');
        const institution = data?.data?.institutionDetails?.[0];
        const studentList = data?.data?.studentAttendanceList ?? [];
        const totalRecords = data?.total ?? studentList.length;

        if (!studentList || studentList.length === 0) {
            return (
                <div ref={ref} className='bg-white p-5 text-center text-black'>
                    No data available for printing.
                </div>
            );
        }

        const monthList = data?.data?.monthList ?? [];
        const days = monthList.length > 0 ? monthList.map((m: any) => m.day) : Array.from({ length: 31 }, (_, i) => i + 1);

        return (
            <div ref={ref} className='print-preview-container min-h-full w-full bg-white text-black'>
                <style>
                    {`
                        @media print {
                            @page {
                                margin: 5mm;
                                size: ${monthDateWise ? 'A4 landscape' : 'A4 portrait'};
                            }
                            body {
                                visibility: hidden;
                                background: white !important;
                                margin: 0;
                                padding: 0;
                            }
                            .print-preview-container {
                                visibility: visible !important;
                                position: absolute;
                                left: 0;
                                top: 0;
                                width: 100%;
                                background: white !important;
                                z-index: 9999;
                                color: black !important;
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
                                padding: 4px 2px;
                                text-align: center;
                                font-size: ${monthDateWise ? '8px' : '10px'};
                            }
                            .data-table th {
                                background-color: #f3f4f6 !important;
                                font-weight: bold;
                                -webkit-print-color-adjust: exact;
                            }
                            .header-section {
                                text-align: center;
                                padding-bottom: 15px;
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
                                <div className='header-section'>
                                    {institution && (
                                        <>
                                            <div className='mb-2 flex flex-col items-center'>
                                                {institution.mI_Logo && (
                                                    <img src={institution.mI_Logo} alt='Logo' style={{ height: '60px' }} />
                                                )}
                                                <h1 className='font-bold text-xl uppercase'>{institution.mI_Name}</h1>
                                                <p className='text-xs'>
                                                    {institution.mI_Address1}
                                                    {institution.mI_Address2 && `, ${institution.mI_Address2}`}
                                                    {institution.mI_Address3 && `, ${institution.mI_Address3}`}
                                                </p>
                                            </div>
                                        </>
                                    )}
                                    <h2 className='font-bold text-lg uppercase underline'>Student Attendance Report</h2>
                                    <div className='mt-2 flex justify-center gap-4 font-semibold text-xs'>
                                        <span>Academic Year: {academicYear}</span>
                                        <span>Class: {className}</span>
                                        <span>Section: {sectionName}</span>
                                        {monthName && <span>Month: {monthName}</span>}
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className='no-border'>
                                <table className='data-table'>
                                    <thead>
                                        <tr>
                                            <th>Sl.No</th>
                                            <th>Student Name</th>
                                            <th>Admission No</th>
                                            <th>Roll No</th>
                                            {monthDateWise && days.map((d: any) => <th key={d}>{d}</th>)}
                                            <th>Class Held</th>
                                            <th>Class Attended</th>
                                            <th>Percentage(%)</th>
                                            <th>Remarks</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {studentList.map((student: any, index: number) => (
                                            <tr key={index}>
                                                <td>{student.RowNo || index + 1}</td>
                                                <td style={{ textAlign: 'left', minWidth: monthDateWise ? '100px' : 'auto' }}>
                                                    {student.name}
                                                </td>
                                                <td>{student.AMST_AdmNo}</td>
                                                <td>{student.AMAY_RollNo}</td>
                                                {monthDateWise && days.map((d: any) => {
                                                    const val = student[`_${d}`] || student[d] || 'NE';
                                                    let color = '#6b7280';
                                                    let fontWeight = '500';
                                                    if (val === 'P') { color = '#16a34a'; fontWeight = 'bold'; }
                                                    else if (val === 'A') { color = '#dc2626'; fontWeight = 'bold'; }
                                                    else if (val === 'L') { color = '#2563eb'; fontWeight = 'bold'; }
                                                    else if (val === 'HO') { color = '#d97706'; fontWeight = 'bold'; }
                                                    return (
                                                        <td key={d} style={{ color, fontWeight }}>
                                                            {val}
                                                        </td>
                                                    );
                                                })}
                                                <td>{student.ASA_ClassHeld}</td>
                                                <td>{student.ASA_Class_Attended}</td>
                                                <td>{Number(student.Percentage).toFixed(2)}</td>
                                                <td>
                                                    {student.Remarks ||
                                                        student.remarks ||
                                                        (Number(student.Percentage) >= 75
                                                            ? 'Very Good Attendance'
                                                            : Number(student.Percentage) >= 50
                                                              ? 'Good Attendance'
                                                              : Number(student.Percentage) >= 35
                                                                ? 'Average Attendance'
                                                                : 'Poor Attendance')}
                                                </td>
                                            </tr>
                                        ))}
                                        <tr className='bg-gray-100 font-bold'>
                                            <td colSpan={monthDateWise ? days.length + 4 : 6} className='px-4 text-right uppercase'>
                                                Total Records
                                            </td>
                                            <td className='px-4'>{totalRecords}</td>
                                            <td colSpan={2}></td>
                                        </tr>
                                        {monthDateWise && (
                                            <tr>
                                                <td colSpan={days.length + 7} className='p-2 text-left'>
                                                    <div className='flex gap-4 font-bold text-[10px]'>
                                                        <span>Legend:</span>
                                                        <span style={{ color: '#16a34a' }}>P: Present</span>
                                                        <span style={{ color: '#dc2626' }}>A: Absent</span>
                                                        <span style={{ color: '#2563eb' }}>L: Leave</span>
                                                        <span style={{ color: '#d97706' }}>HO: Holiday</span>
                                                        <span style={{ color: '#6b7280' }}>NE: Not Entered</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr>
                            <td className='no-border'>
                                <div className='footer-section'>
                                    <div>Printed Date: {currentDate}</div>
                                    <div style={{ marginRight: '50px' }}>Signature</div>
                                </div>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        );
    }
);

StudentAttendancePrint.displayName = 'StudentAttendancePrint';
