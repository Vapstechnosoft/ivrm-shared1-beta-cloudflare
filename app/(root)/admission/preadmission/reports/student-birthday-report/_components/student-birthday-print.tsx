'use client';

import { format } from 'date-fns';
import { forwardRef } from 'react';

interface StudentBirthdayPrintProps {
    data: any;
    academicYear?: string;
    monthName?: string;
    fromDate?: Date | null;
    toDate?: Date | null;
}

export const StudentBirthdayPrint = forwardRef<HTMLDivElement, StudentBirthdayPrintProps>(
    ({ data, academicYear, monthName, fromDate, toDate }, ref) => {
        const students = data?.data || [];
        const institution = data?.institutionDetails?.[0] || data?.institution?.[0] || {};
        const currentDate = format(new Date(), 'dd/MM/yyyy');
        const userName = typeof window !== 'undefined' ? localStorage.getItem('username') : '';

        const chunkArray = (arr: any[], size: number) => {
            const chunks = [];
            for (let i = 0; i < arr.length; i += size) {
                chunks.push(arr.slice(i, i + size));
            }
            return chunks;
        };

        const studentChunks = chunkArray(students, 10); // 10 students per page for best layout

        return (
            <div ref={ref} className='print-preview-container min-h-full w-full bg-white text-black'>
                <style>
                    {`
                        @media print {
                            @page {
                                margin: 0;
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
                            .report-page {
                                page-break-after: avoid;
                                break-after: page;
                                padding: 10mm;
                                width: 100%;
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
                            .header-section {
                                text-align: center;
                                padding-bottom: 20px;
                            }
                            .no-border {
                                border: none !important;
                            }
                            .text-left {
                                text-align: left !important;
                            }
                        }
                    `}
                </style>

                {studentChunks.map((chunk, chunkIndex) => (
                    <div key={chunkIndex} className='report-page'>
                        {/* Header */}
                        {(institution.mI_Logo || institution.mI_Name) && (
                            <div className='header-section pt-8'>
                                {institution.mI_Logo && <img src={institution.mI_Logo} alt='Logo' className='mx-auto mb-4 h-16 w-auto' />}
                                <h1 className='font-bold text-lg uppercase'>{institution.mI_Name}</h1>
                                <p className='mb-4 text-gray-600 text-xs'>
                                    {institution.mI_Address1}
                                    {institution.mI_Address2 && `, ${institution.mI_Address2}`}
                                    {institution.mI_Address3 && `, ${institution.mI_Address3}`}
                                </p>
                            </div>
                        )}

                        <div className='mb-6 text-center'>
                            <h2 className='font-bold text-md uppercase underline'>Student Birthday Report</h2>
                            <div className='mt-2 flex justify-center gap-4 pb-4 font-semibold text-[10px]'>
                                {academicYear && <span>Academic Year: {academicYear}</span>}
                                {monthName && <span>Month: {monthName}</span>}
                                {fromDate && toDate && (
                                    <span>
                                        Period: {format(new Date(fromDate), 'dd/MM/yyyy')} to {format(new Date(toDate), 'dd/MM/yyyy')}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Data Table */}
                        <table className='data-table mt-4 w-full'>
                            <thead>
                                <tr className='bg-gray-100'>
                                    <th className='w-12'>SL.No</th>
                                    <th>Student Name</th>
                                    <th>Adm. No.</th>
                                    <th>Class</th>
                                    <th>Section</th>
                                    <th>Date of Birth</th>
                                    <th>Photo</th>
                                    <th>Address</th>
                                </tr>
                            </thead>
                            <tbody>
                                {chunk.map((row: any, index: number) => (
                                    <tr key={index}>
                                        <td>{chunkIndex * 10 + index + 1}</td>
                                        <td className='text-left'>{row.studentname}</td>
                                        <td>{row.admno}</td>
                                        <td>{row.classname}</td>
                                        <td>{row.sectionname}</td>
                                        <td>{row.amst_dob ? format(new Date(row.amst_dob), 'dd-MM-yyyy') : ''}</td>
                                        <td>
                                            {row.amst_photo && (
                                                <img
                                                    src={row.amst_photo}
                                                    alt='Photo'
                                                    className='mx-auto h-12 w-12 border border-gray-300 object-cover'
                                                />
                                            )}
                                        </td>
                                        <td className='text-left'>{row.stdaddress}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Footer (Simplified for each page) */}
                        {/* <div className='mt-4 flex justify-between text-[10px] italic text-gray-400'>
                            <div>Date: {currentDate}</div>
                            <div>UserName: {userName}</div>
                            <div>Page {chunkIndex + 1} of {studentChunks.length}</div>
                        </div> */}
                    </div>
                ))}
            </div>
        );
    }
);

StudentBirthdayPrint.displayName = 'StudentBirthdayPrint';
