'use client';

import { format } from 'date-fns';
import { forwardRef } from 'react';

interface CertificatePrintProps {
    student: any;
    studentStatus: 'S' | 'D' | 'L';
    logo?: string;
    date: Date;
    hallTicketNo?: string;
    purpose?: string;
}

export const CertificatePrint = forwardRef<HTMLDivElement, CertificatePrintProps>(
    ({ student, studentStatus, logo, date, hallTicketNo, purpose }, ref) => {
        if (!student) return null;

        const admNo = student.admno || student.amsT_AdmNo || '';
        const regNo = hallTicketNo || student.registrationno || student.regno || '';
        const studentName = student.studentname || student.studentName || '';
        const fatherName = student.fathername || student.fatherName || '';
        const courseName = student.coursename || student.courseName || '';
        const semesterName = student.semestername || student.semesterName || student.semester || '';
        const academicYear = student.acadamicyear || student.yearname || student.academicYear || '';
        const formattedDob = student.dob ? format(new Date(student.dob), 'dd/MM/yyyy') : student.lbldob || '';
        const formattedCertDate = date ? format(new Date(date), 'dd/MM/yyyy') : format(new Date(), 'dd/MM/yyyy');

        const isLeft = studentStatus === 'L';

        return (
            <div
                ref={ref}
                className='printable-content print-container dcps-certificate-wrapper flex w-full justify-center bg-white p-4 text-black sm:p-8'>
                {/* Embedded Print CSS for exact formatting on paper/PDF */}
                <style>{`
                    @media print {
                        @page {
                            size: A4 portrait;
                            margin: 10mm;
                        }
                        html, body {
                            visibility: visible !important;
                            background: #fff !important;
                            color: #000 !important;
                            margin: 0 !important;
                            padding: 0 !important;
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                        .printable-content,
                        .printable-content *,
                        .print-container,
                        .print-container *,
                        .dcps-certificate-wrapper,
                        .dcps-certificate-wrapper * {
                            visibility: visible !important;
                        }
                        .dcps-certificate-wrapper {
                            padding: 10px 0 !important;
                            margin: 0 auto !important;
                            background: transparent !important;
                            width: 100% !important;
                            display: flex !important;
                            justify-content: center !important;
                        }
                        .dcps-certificate-box {
                            margin: 0 auto !important;
                            border: 2px solid #000 !important;
                            box-shadow: none !important;
                            width: 100% !important;
                            max-width: 820px !important;
                            min-height: 940px !important;
                            position: relative !important;
                            page-break-inside: avoid !important;
                            background: #fff !important;
                        }
                        .dcps-certificate-logo {
                            width: 100% !important;
                            height: auto !important;
                            max-height: none !important;
                            object-fit: contain !important;
                            display: block !important;
                        }
                    }
                    .dcps-border-bottom {
                        border-bottom: 1.5px solid #000;
                        display: inline-block;
                        padding: 0 6px;
                        font-weight: bold;
                        min-width: 60px;
                        text-align: center;
                    }
                `}</style>

                {/* Certificate Container Box */}
                <div
                    className='dcps-certificate-box relative min-h-[820px] w-full max-w-[850px] border-2 border-black bg-white px-10 py-10 shadow-xl sm:px-14 sm:py-12'
                    style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                    {/* Logo Section */}
                    {logo && (
                        <div className='mb-6 w-full text-center'>
                            <img
                                src={logo}
                                alt='Institution Logo'
                                className='dcps-certificate-logo mx-auto block h-auto w-full object-contain'
                            />
                        </div>
                    )}

                    {/* Title */}
                    <div className='mb-6 text-center'>
                        <h2 className='font-black text-2xl text-black uppercase tracking-wider sm:text-3xl'>BONAFIDE CERTIFICATE</h2>
                    </div>

                    {/* Meta Info Row */}
                    <div className='mb-6 flex items-center justify-between font-bold text-base sm:text-lg'>
                        <div className='text-left'>
                            <span>Admission NO.: {admNo}</span>
                        </div>
                        <div className='text-right'>
                            <span>Date: {formattedCertDate}</span>
                        </div>
                    </div>

                    {/* Main Certificate Content */}
                    <div className='my-6 text-justify text-black text-lg leading-[2.1] sm:text-[19px]'>
                        <div
                            contentEditable={true}
                            suppressContentEditableWarning={true}
                            className='rounded p-2 transition-colors hover:bg-amber-50/40 focus:outline-none focus:ring-1 focus:ring-primary/40'>
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; This is to certify that Master/Kumari{' '}
                            <span className='dcps-border-bottom'>
                                {studentName || <span className='opacity-0'>Placeholder Student Name</span>}
                            </span>{' '}
                            S/o.D/o.{' '}
                            <span className='dcps-border-bottom'>
                                {fatherName || <span className='opacity-0'>Placeholder Father Name</span>}
                            </span>{' '}
                            bearing H.T. No.{' '}
                            <span className='dcps-border-bottom' contentEditable={true} suppressContentEditableWarning={true}>
                                {regNo || <span className='opacity-0'>HT123456</span>}
                            </span>{' '}
                            is a bonafide student of this institution, is {isLeft ? 'studied' : 'studying'} in{' '}
                            <span className='dcps-border-bottom' contentEditable={true} suppressContentEditableWarning={true}>
                                {courseName || <span className='opacity-0'>Degree Course</span>}
                            </span>{' '}
                            year{' '}
                            <span className='dcps-border-bottom' contentEditable={true} suppressContentEditableWarning={true}>
                                {semesterName || <span className='opacity-0'>Semester</span>}
                            </span>{' '}
                            semester of {semesterName || '___'} year of {courseName || '___'} degree course for the Academic Year{' '}
                            <span className='dcps-border-bottom' contentEditable={true} suppressContentEditableWarning={true}>
                                {academicYear || <span className='opacity-0'>2024-2025</span>}
                            </span>
                            . During the study period his/her character was found good. His/Her date of birth as per our record is{' '}
                            <span className='dcps-border-bottom' contentEditable={true} suppressContentEditableWarning={true}>
                                {formattedDob || <span className='opacity-0'>DD/MM/YYYY</span>}
                            </span>
                            .{' '}
                            {isLeft ? (
                                <>This certificate is issued on the request of the candidate to obtain Course Completion.</>
                            ) : (
                                <>
                                    This certificate is issued on the request of the candidate to obtain the{' '}
                                    <span
                                        className='dcps-border-bottom min-w-[200px]'
                                        contentEditable={true}
                                        suppressContentEditableWarning={true}>
                                        {purpose || <span className='opacity-0'>Purpose of Certificate</span>}
                                    </span>
                                    .
                                </>
                            )}
                        </div>
                    </div>

                    {/* Footer / Signature Box */}
                    <div className='absolute right-10 bottom-12 left-10 sm:right-14 sm:left-14'>
                        <div className='flex items-end justify-between font-bold text-lg'>
                            <div>
                                <p className='m-0 text-left font-normal text-lg'>Clerk</p>
                            </div>
                            <div className='text-right'>
                                <p className='m-0 font-bold text-lg uppercase tracking-wider'>PRINCIPAL</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
);

CertificatePrint.displayName = 'CertificatePrint';
