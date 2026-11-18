'use client';

import { format } from 'date-fns';
import React from 'react';

interface StudentData {
    amsT_RegistrationNo: string;
    amsT_Id: number;
    amsT_FirstName: string;
    amsT_Date: string;
    amsT_DOB: string;
    amsT_Sex: string;
    amsT_MotherName: string;
    amsT_FatherName: string;
    amsT_emailId: string;
    amsT_MobileNo: number | string;
    amsT_StuBankAccNo: string | null;
    amsT_AadharNo: string | null;
    amsT_AdmNo: string;
    amsT_BirthCertNO: string | null;
    amsT_BloodGroup: string | null;
    amsT_FatherAadharNo: string | null;
    amsT_FatherBankAccNo: string | null;
    asmcL_ClassName: string;
    asmC_SectionName: string;
    amsT_Photoname: string;
    addressd1: string;
}

interface StudentSearchPrintProps {
    data: StudentData[];
    schoolName?: string;
    schoolAddress?: string;
    schoolPhone?: string;
    logoUrl?: string;
}

export const StudentSearchPrint = React.forwardRef<HTMLDivElement, StudentSearchPrintProps>(
    ({ data, schoolName, schoolAddress, schoolPhone, logoUrl }, ref) => {
        const currentDate = format(new Date(), 'dd/MM/yyyy hh:mm a');

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
                                padding: 6px 4px;
                                text-align: center;
                                font-size: 10px;
                            }
                            .data-table th {
                                background-color: #f3f4f6 !important;
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
                                padding-top: 30px;
                                display: flex;
                                justify-content: space-between;
                                padding: 10px 0;
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
                                <div className='header-section mb-6 border-black border-b pb-4'>
                                    <div className='flex items-center justify-center gap-4'>
                                        {logoUrl && <img src={logoUrl} alt='Logo' className='h-16 w-16 object-contain' />}
                                        <div className='text-center'>
                                            <h1 className='font-bold text-xl uppercase'>{schoolName || 'Institution Name'}</h1>
                                            <p className='text-xs'>{schoolAddress || 'Institution Address'}</p>
                                            <p className='text-xs'>Ph: {schoolPhone || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className='mt-4'>
                                        <h2 className='inline-block border-black border-y px-4 py-1 font-bold text-md uppercase'>
                                            Student Search Report
                                        </h2>
                                    </div>
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
                                            <th className='w-10'>SL. NO</th>
                                            <th className='w-24 text-left'>REG. NO</th>
                                            <th className='text-left'>STUDENT NAME</th>
                                            <th className='w-24 text-left'>CLASS</th>
                                            <th className='w-24 text-left'>SECTION</th>
                                            <th className='w-20'>GENDER</th>
                                            <th className='w-20'>DOB</th>
                                            <th className='text-left'>FATHER NAME</th>
                                            <th className='w-24 text-left'>MOBILE</th>
                                            <th className='w-24 text-left'>ADM NO</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.map((row, index) => (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td className='text-left'>{row.amsT_RegistrationNo}</td>
                                                <td className='text-left font-bold uppercase'>{row.amsT_FirstName}</td>
                                                <td className='text-left'>{row.asmcL_ClassName}</td>
                                                <td className='text-left'>{row.asmC_SectionName}</td>
                                                <td>{row.amsT_Sex}</td>
                                                <td>{row.amsT_DOB}</td>
                                                <td className='text-left'>{row.amsT_FatherName}</td>
                                                <td className='text-left'>{row.amsT_MobileNo}</td>
                                                <td className='text-left'>{row.amsT_AdmNo}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr>
                            <td className='no-border'>
                                {/* Footer */}
                                <div className='footer-section mt-8 items-end text-[10px] italic opacity-60'>
                                    <div>Date: {currentDate}</div>
                                    <div>Generated by Vaps Technosoft Pvt. Ltd.</div>
                                </div>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        );
    }
);

StudentSearchPrint.displayName = 'StudentSearchPrint';
