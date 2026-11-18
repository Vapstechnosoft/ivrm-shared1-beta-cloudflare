'use client';

import { format } from 'date-fns';
import { forwardRef } from 'react';

interface CategoryWiseAttendancePrintProps {
    data: any[];
    academicYear?: string;
    date?: Date;
    logoUrl?: string;
    userName?: string;
}

export const CategoryWiseAttendancePrint = forwardRef<HTMLDivElement, CategoryWiseAttendancePrintProps>(
    ({ data, academicYear, date, logoUrl, userName }, ref) => {
        const currentDate = format(new Date(), 'dd/MM/yyyy');
        const reportDate = date ? format(date, 'dd/MM/yyyy') : '';

        return (
            <div ref={ref} className='print-container bg-white text-black'>
                <style
                    dangerouslySetInnerHTML={{
                        __html: `
                    @media print {
                        @page {
                            size: A4 landscape;
                            margin: 10mm;
                        }
                        body {
                            visibility: hidden;
                            background: white !important;
                            margin: 0 !important;
                            padding: 0 !important;
                        }
                        .print-container {
                            visibility: visible !important;
                            position: absolute;
                            left: 10mm;
                            top: 10mm;
                            width: calc(100% - 20mm);
                            padding: 0;
                            margin: 0;
                        }
                        .print-container * {
                            visibility: visible !important;
                        }
                        table {
                            border-collapse: collapse;
                            width: 100%;
                            margin-top: 10px;
                        }
                        th, td {
                            border: 0.5pt solid black;
                            padding: 4px;
                            text-align: center;
                            font-size: 10px;
                        }
                        th {
                            background-color: #f1f1f1 !important;
                            -webkit-print-color-adjust: exact;
                        }
                    }
                    `
                    }}
                />

                <div className='p-4'>
                    {/* Header */}
                    {logoUrl && (
                        <div className='mb-2 flex justify-center'>
                            <img src={logoUrl} alt='Logo' className='h-20 object-contain' />
                        </div>
                    )}
                    <div className='mb-4 text-center font-bold text-lg uppercase underline'>CategoryWise Attendance Report</div>

                    <div className='mb-2 flex justify-between font-semibold text-xs'>
                        {academicYear && <div>Academic Year: {academicYear}</div>}
                        {reportDate && <div>Report Date: {reportDate}</div>}
                    </div>

                    {/* Table */}
                    <table>
                        <thead>
                            <tr>
                                <th rowSpan={2}>SL. No.</th>
                                <th rowSpan={2}>Category Name</th>
                                <th colSpan={3}>Total No. of Students on Roll</th>
                                <th colSpan={3}>No. of Students Attended</th>
                                <th colSpan={3}>No. of Students Absentees</th>
                            </tr>
                            <tr>
                                <th>Total Boys</th>
                                <th>Total Girls</th>
                                <th>Total Students</th>
                                <th>Boys</th>
                                <th>Girls</th>
                                <th>Total Present Students</th>
                                <th>Boys</th>
                                <th>Girls</th>
                                <th>Total Absent Students</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td className='text-left'>{row.amc_name || row.AMC_Name}</td>
                                    <td>{row.total_male ?? row.Total_Male}</td>
                                    <td>{row.total_female ?? row.Total_Female}</td>
                                    <td>
                                        {(Number(row.total_male || row.Total_Male) || 0) +
                                            (Number(row.total_female || row.Total_Female) || 0)}
                                    </td>
                                    <td>{row.premale ?? row.Premale}</td>
                                    <td>{row.prefemale ?? row.PreFemale}</td>
                                    <td>{(Number(row.premale || row.Premale) || 0) + (Number(row.prefemale || row.PreFemale) || 0)}</td>
                                    <td>{row.absmale}</td>
                                    <td>{row.absfemale ?? row.absFemale}</td>
                                    <td>{(Number(row.absmale) || 0) + (Number(row.absfemale || row.absFemale) || 0)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan={11} className='pt-4 text-center text-[10px] italic'>
                                    Date: {currentDate} {userName ? `| User: ${userName}` : ''} | Generated by Vaps Technosoft Pvt. Ltd.
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        );
    }
);

CategoryWiseAttendancePrint.displayName = 'CategoryWiseAttendancePrint';
