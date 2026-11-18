import type { IClassTeacherReportList } from '@/types/admission/preadmission/reports';
import { format } from 'date-fns';
import React from 'react';

interface ClassTeacherReportPrintProps {
    data: IClassTeacherReportList[];
    reportType: string;
    academicYearName?: string;
    schoolName?: string;
    logoUrl?: string;
}

export const ClassTeacherReportPrint = React.forwardRef<HTMLDivElement, ClassTeacherReportPrintProps>(({ data, reportType, academicYearName, schoolName, logoUrl }, ref) => {
    const currentDate = format(new Date(), 'dd/MM/yyyy');

    if (!data || data.length === 0) {
        debugger;
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
                                margin: 0;
                                size: A4 portrait;
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
                                padding: 10mm;
                                box-sizing: border-box;
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
                                padding: 8px;
                                text-align: left;
                                font-size: 12px;
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
                            .footer-section {
                                padding-top: 20px;
                                display: flex;
                                justify-content: space-between;
                                font-size: 12px;
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
                            <div className='header-section'>
                                <div className='mb-4 flex items-center justify-center gap-4'>
                                    {logoUrl && (
                                        <img
                                            src={logoUrl}
                                            alt={schoolName || 'Institution Logo'}
                                            style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                                            className='w-full max-h-32 object-contain'
                                        />
                                    )}
                                </div>
                                {schoolName && !logoUrl && (
                                    <h2 className='font-bold text-lg uppercase mb-2'>{schoolName}</h2>
                                )}
                                <h3 className='font-bold text-sm uppercase'>
                                    Class Teacher List For Year - {academicYearName || ''}
                                </h3>
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
                                        <th className='w-16 text-center'>Sl.No</th>
                                        <th>Staff Name</th>
                                        <th>Class Name</th>
                                        <th>Section</th>
                                        {(reportType === 'subject_teacher_attendance' || reportType === 'subject_teacher') && (
                                            <th>Subject</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((item, index) => (
                                        <tr key={index}>
                                            <td className='text-center'>{index + 1}</td>
                                            <td>{item.IVRMSTAUL_UserName || '-'}</td>
                                            <td>{item.ASMCL_ClassName || '-'}</td>
                                            <td>{item.ASMC_SectionName || '-'}</td>
                                            {(reportType === 'subject_teacher_attendance' || reportType === 'subject_teacher') && (
                                                <td>{item.PAMS_SubjectName || '-'}</td>
                                            )}
                                        </tr>
                                    ))}
                                    <tr className='bg-gray-100 font-bold'>
                                        <td
                                            colSpan={
                                                reportType === 'subject_teacher_attendance' || reportType === 'subject_teacher' ? 4 : 3
                                            }
                                            className='px-4 text-right'>
                                            Total
                                        </td>
                                        <td colSpan={1} className='px-4 text-left'>
                                            {data.length}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
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
});

ClassTeacherReportPrint.displayName = 'ClassTeacherReportPrint';
